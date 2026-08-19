#!/usr/bin/env python3
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote


LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)\n]+)\)")
URL_RE = re.compile(r"https?://[^\s)>]+")
CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE_RE = re.compile(r"`[^`\n]*`")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$")
SECRET_PATTERNS = [
    ("private key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("aws access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("github token", re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{30,}\b")),
    ("openai-style key", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b")),
    ("slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b")),
]


def run_git(root: Path, args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=root,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def markdown_files(root: Path) -> list[Path]:
    files: set[Path] = set()
    for args in (["ls-files", "--", "*.md"], ["ls-files", "--others", "--exclude-standard", "--", "*.md"]):
        result = run_git(root, args)
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
        files.update(root / line for line in result.stdout.splitlines() if line)
    return sorted(files)


def github_slug(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.strip().lower()
    chars = [ch for ch in text if ch.isalnum() or ch in " -_"]
    slug = re.sub(r"\s+", "-", "".join(chars).strip())
    return re.sub(r"-+", "-", slug)


def anchors_for(path: Path) -> set[str]:
    anchors: set[str] = set()
    counts: dict[str, int] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        match = HEADING_RE.match(line)
        if not match:
            continue
        base = github_slug(match.group(2))
        count = counts.get(base, 0)
        counts[base] = count + 1
        anchors.add(base if count == 0 else f"{base}-{count}")
    return anchors


def split_target(raw: str) -> tuple[str, str]:
    target = raw.strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1]
    target = target.split()[0]
    if "#" in target:
        path_part, anchor = target.split("#", 1)
        return unquote(path_part), unquote(anchor)
    return unquote(target), ""


def is_external(target: str) -> bool:
    return bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target))


def strip_code(text: str) -> str:
    """Remove fenced and inline code so their contents are not scanned as
    markdown links (e.g. `[method](uri)` in a code example is not a link)."""
    text = CODE_FENCE_RE.sub("", text)
    return INLINE_CODE_RE.sub("", text)


def check_links(root: Path, files: list[Path]) -> tuple[list[str], int, int]:
    errors: list[str] = []
    internal_count = 0
    external_link_count = 0
    anchor_cache: dict[Path, set[str]] = {}

    for file in files:
        text = strip_code(file.read_text(encoding="utf-8"))
        for match in LINK_RE.finditer(text):
            raw_target = match.group(1)
            path_part, anchor = split_target(raw_target)

            if is_external(path_part):
                external_link_count += 1
                continue

            if path_part.startswith("~") or path_part.startswith("$"):
                continue

            target_path = file if not path_part else (file.parent / path_part)
            target_path = target_path.resolve()

            try:
                target_path.relative_to(root)
            except ValueError:
                errors.append(f"{file.relative_to(root)}: link escapes repo: {raw_target}")
                continue

            internal_count += 1
            if not target_path.exists():
                errors.append(f"{file.relative_to(root)}: missing link target: {raw_target}")
                continue

            if anchor and target_path.suffix == ".md":
                anchor_cache.setdefault(target_path, anchors_for(target_path))
                normalized = github_slug(anchor)
                if normalized not in anchor_cache[target_path]:
                    errors.append(
                        f"{file.relative_to(root)}: missing anchor #{anchor} in "
                        f"{target_path.relative_to(root)}"
                    )

    return errors, internal_count, external_link_count


def count_external_urls(files: list[Path]) -> int:
    count = 0
    for file in files:
        text = file.read_text(encoding="utf-8")
        count += len(URL_RE.findall(text))
    return count


def check_secrets(root: Path, files: list[Path]) -> list[str]:
    errors: list[str] = []
    for file in files:
        text = file.read_text(encoding="utf-8", errors="replace")
        for line_no, line in enumerate(text.splitlines(), start=1):
            for name, pattern in SECRET_PATTERNS:
                if pattern.search(line):
                    errors.append(f"{file.relative_to(root)}:{line_no}: possible {name}")
    return errors


def check_codex_skill_deploy(root: Path) -> list[str]:
    errors: list[str] = []
    deploy_script = root / "scripts/deploy-codex-harness-skills.sh"
    command_root = root / "harness/commands"

    with tempfile.TemporaryDirectory(prefix="hx-codex-skills-") as temp_dir:
        target_root = Path(temp_dir) / "skills"
        foreign_skill = target_root / "foreign-skill"
        stale_skill = target_root / "hx-stale"
        foreign_skill.mkdir(parents=True)
        stale_skill.mkdir()
        (foreign_skill / "SKILL.md").write_text("foreign\n", encoding="utf-8")
        (stale_skill / "SKILL.md").write_text("stale\n", encoding="utf-8")

        deploy = subprocess.run(
            [str(deploy_script), str(target_root)],
            cwd=root,
            check=False,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if deploy.returncode != 0:
            return [
                "Codex skill deploy smoke test failed: "
                + (deploy.stderr.strip() or deploy.stdout.strip())
            ]

        if not (foreign_skill / "SKILL.md").exists():
            errors.append("Codex skill deploy removed a foreign skill")
        if stale_skill.exists():
            errors.append("Codex skill deploy left a stale hx-* skill")

        expected_names = {
            f"hx-{source.stem}"
            for source in command_root.glob("*.md")
            if source.name != "README.md"
        }
        actual_names = {
            path.name
            for path in target_root.glob("hx-*")
            if path.is_dir()
        }
        if actual_names != expected_names:
            errors.append(
                "Codex skill deploy produced the wrong skill set: "
                f"expected {sorted(expected_names)}, got {sorted(actual_names)}"
            )

        for skill_name in sorted(expected_names):
            skill_file = target_root / skill_name / "SKILL.md"
            metadata_file = target_root / skill_name / "agents/openai.yaml"
            if not skill_file.is_file() or not metadata_file.is_file():
                errors.append(f"Codex skill deploy is incomplete for {skill_name}")
                continue

            skill_text = skill_file.read_text(encoding="utf-8")
            metadata_text = metadata_file.read_text(encoding="utf-8")
            if f"name: {skill_name}" not in skill_text:
                errors.append(f"Codex skill has wrong frontmatter name: {skill_name}")
            if "/hx:" in skill_text:
                errors.append(f"Codex skill contains a Claude-only command: {skill_name}")
            if "allow_implicit_invocation: false" not in metadata_text:
                errors.append(f"Codex skill permits implicit invocation: {skill_name}")
            short_description = re.search(
                r'^  short_description: "([^"]+)"$', metadata_text, re.MULTILINE
            )
            if not short_description or not 25 <= len(short_description.group(1)) <= 64:
                errors.append(f"Codex skill has invalid UI description: {skill_name}")
            if f"Use ${skill_name} " not in metadata_text:
                errors.append(f"Codex skill default prompt omits its invocation: {skill_name}")

            if "~/.claude/harness/" in skill_text:
                errors.append(f"Codex skill contains a Claude-only harness path: {skill_name}")
            if skill_name in {"hx-pr", "hx-review", "hx-spec"} and "~/.codex/harness/" not in skill_text:
                errors.append(f"Codex skill is missing its Codex harness path: {skill_name}")
            if skill_name in {"hx-eod", "hx-hot-reload"} and "`/clear`" in skill_text:
                errors.append(f"Codex skill contains Claude's /clear command: {skill_name}")

        check = subprocess.run(
            [str(deploy_script), "--check", str(target_root)],
            cwd=root,
            check=False,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if check.returncode != 0:
            errors.append(
                "Codex skill sync check failed after deploy: "
                + (check.stderr.strip() or check.stdout.strip())
            )

    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    files = markdown_files(root)
    errors: list[str] = []

    diff_check = run_git(root, ["diff", "--check"])
    if diff_check.returncode != 0:
        errors.append("git diff --check failed:")
        errors.extend(diff_check.stdout.splitlines() or diff_check.stderr.splitlines())

    link_errors, internal_count, external_link_count = check_links(root, files)
    external_url_count = count_external_urls(files)
    errors.extend(link_errors)
    errors.extend(check_secrets(root, files))
    errors.extend(check_codex_skill_deploy(root))

    if errors:
        print("verify-docs: FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("verify-docs: ok")
    print(f"- markdown files: {len(files)}")
    print(f"- internal links checked: {internal_count}")
    print(f"- external markdown links counted, not fetched: {external_link_count}")
    print(f"- external URL occurrences counted, not fetched: {external_url_count}")
    print("- secret patterns checked: basic built-in patterns")
    print("- Codex harness skills: deploy and sync smoke-tested")
    return 0


if __name__ == "__main__":
    sys.exit(main())
