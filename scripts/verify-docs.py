#!/usr/bin/env python3
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote


LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)\n]+)\)")
URL_RE = re.compile(r"https?://[^\s)>]+")
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


def check_links(root: Path, files: list[Path]) -> tuple[list[str], int, int]:
    errors: list[str] = []
    internal_count = 0
    external_link_count = 0
    anchor_cache: dict[Path, set[str]] = {}

    for file in files:
        text = file.read_text(encoding="utf-8")
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
    return 0


if __name__ == "__main__":
    sys.exit(main())
