# CLAUDE.md — Claude-Code-spezifische Ergänzungen

Diese Datei **erweitert** die gemeinsame Basis. Lies zuerst `AGENTS.md` (gleiches
Verzeichnis) — dort stehen alle client-neutralen Regeln (Arbeitsweise,
Simplicity, Surgical Changes, Testing, Konventionen). Hier nur, was Claude Code
zusätzlich kann/braucht.

@AGENTS.md

---

## GSD (get-shit-done)

Projekte mit `.planning/` nutzen GSD als Single-Source-of-Truth (Struktur siehe
`AGENTS.md` → Arbeits-Tracking). Zusätzlich in Claude Code:
- In-Session bei 3+ Schritten: `TaskCreate`-Tool nutzen.
- GSD-Skills/Commands (`gsd-*`, `gsd:*`) für Phasen-Workflow.

## caveman

Token-komprimierte Kommunikation aktiv (Level via `/caveman lite|full|ultra`).
Code, Commits, PRs und Security-Warnungen immer normal schreiben — nur Fließtext
komprimieren.

## Skills

Nicht-GSD/caveman-Skills (Web, Testing, PHP, Security …) sind installiert.
Quelle der Wahrheit ist `~/.agents/.skill-lock.json`; das Repo-Inventar heißt
`SKILLS.md`. Bei passender Aufgabe den jeweiligen Skill nutzen.
