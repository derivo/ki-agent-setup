#!/usr/bin/env python3
"""Integrity check for tasks.json. Runs in `make verify`.

It does not judge whether a task is good — it keeps the file well-formed, keeps
every `governing` path pointing at a real harness file, and keeps every task
carrying an honest `discrimination` value. A task whose governing file was
renamed away is a task that silently stopped measuring anything.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REQUIRED = ("id", "title", "governing", "prompt", "pass", "discrimination")
STATUSES = ("verified", "unverified", "no-discriminator")


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

    print("evals: ok")
    print(f"- tasks: {len(tasks)}, all governing paths resolve")
    print("- discrimination: " + ", ".join(f"{k} {v}" for k, v in counts.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
