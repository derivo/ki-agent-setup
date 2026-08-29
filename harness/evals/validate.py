#!/usr/bin/env python3
"""Integrity check for tasks.json. Runs in `make verify`.

It does not judge whether a task is good — it keeps the file well-formed, keeps
every `governing` path pointing at a real harness file, and keeps every task
carrying an honest `discrimination` value. A task whose governing file was
renamed away is a task that silently stopped measuring anything.

It also holds the `setup` / `prompt` split: `setup` is stage direction for the
orchestrator (fixture, construction, why the task is built this way), `prompt`
is the wording that goes verbatim into the executor session. Before the split
the two lived in one field, and E5 shipped "Nach Abschluss: Fertig-Meldung
prüfen" straight to the executor it was meant to catch. STAGE_MARKERS keeps
that from creeping back: a real user asking for a feature does not say
"Scratch-Projekt".
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REQUIRED = ("id", "title", "governing", "setup", "prompt", "pass", "discrimination")
STATUSES = ("verified", "unverified", "no-discriminator")
# Words that belong to the orchestrator's view of the task, never to the wording
# the executor receives. Their presence in `prompt` means stage direction leaked
# back into the executor-facing field.
STAGE_MARKERS = (
    "Scratch-Projekt",
    "Scratch-Frontend",
    "Executor",
    "Orchestrator",
    "Fixture",
    "Pass-Kriterium",
    "Protokoll",
)


def main() -> int:
    errors: list[str] = []
    data = json.loads((HERE / "tasks.json").read_text(encoding="utf-8"))
    tasks = data.get("tasks", [])

    if not tasks:
        print("evals: tasks.json holds no tasks", file=sys.stderr)
        return 1

    seen: set[str] = set()
    for index, task in enumerate(tasks):
        label = task.get("id") or f"#{index}"

        for field in REQUIRED:
            if not task.get(field):
                errors.append(f"{label}: missing or empty field '{field}'")

        if task.get("id") in seen:
            errors.append(f"{label}: duplicate id")
        seen.add(task.get("id"))

        for path in task.get("governing", []):
            if not (ROOT / path).exists():
                errors.append(f"{label}: governing path does not exist: {path}")

        prompt = str(task.get("prompt", ""))
        for marker in STAGE_MARKERS:
            if marker in prompt:
                errors.append(f"{label}: stage direction '{marker}' leaked into 'prompt'")

        status = str(task.get("discrimination", ""))
        if not status.startswith(STATUSES):
            errors.append(
                f"{label}: discrimination must start with one of {STATUSES}, got '{status[:40]}'"
            )

    if errors:
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        print(f"evals: {len(errors)} problem(s) in tasks.json", file=sys.stderr)
        return 1

    counts = {status: 0 for status in STATUSES}
    for task in tasks:
        for status in STATUSES:
            if str(task["discrimination"]).startswith(status):
                counts[status] += 1
                break

    # EVALS.md states the same tally in prose. Two places, one truth — check it
    # here, the way scripts/verify-docs.py checks the command counts.
    claimed = re.search(
        r"\*\*(\d+) verified\*\*.*?\*\*(\d+) unverified\*\*.*?\*\*(\d+) no-discriminator\*\*",
        (ROOT / "harness/EVALS.md").read_text(encoding="utf-8"),
        re.S,
    )
    if not claimed:
        print("evals: EVALS.md no longer states the discrimination tally", file=sys.stderr)
        return 1
    stated = tuple(int(g) for g in claimed.groups())
    actual = (counts["verified"], counts["unverified"], counts["no-discriminator"])
    if stated != actual:
        print(f"evals: EVALS.md claims {stated}, tasks.json holds {actual}", file=sys.stderr)
        return 1

    print("evals: ok")
    print(f"- tasks: {len(tasks)}, all governing paths resolve")
    print("- discrimination: " + ", ".join(f"{k} {v}" for k, v in counts.items()))
    print("- tally in EVALS.md matches")
    return 0


if __name__ == "__main__":
    sys.exit(main())
