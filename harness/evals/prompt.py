#!/usr/bin/env python3
"""Print a task's prompt — and nothing else.

This is the whole point of tasks.json being data. The 2026-07-25 run recorded an
executor that found its own pass criterion by grepping the harness, and the fix
at the time was to exclude a file from its context. Here the criterion is never
in the output at all: the orchestrator pipes this into the executor session and
has nothing to redact.

    python3 harness/evals/prompt.py E7        # one prompt, verbatim
    python3 harness/evals/prompt.py --list    # ids and titles
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

TASKS = json.loads((Path(__file__).resolve().parent / "tasks.json").read_text(encoding="utf-8"))["tasks"]


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print(__doc__.strip().splitlines()[-3].strip(), file=sys.stderr)
        return 2

    if argv[0] == "--list":
        for task in TASKS:
            print(f"{task['id']:4} {task['title']}")
        return 0

    for task in TASKS:
        if task["id"].lower() == argv[0].lower():
            print(task["prompt"])
            return 0

    print(f"no task '{argv[0]}' — try --list", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
