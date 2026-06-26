# CLAUDE.md — Claude-Code-spezifische Ergänzungen

Diese Datei **erweitert** die gemeinsame Basis. Lies zuerst `AGENTS.md` (gleiches
Verzeichnis) — dort stehen alle client-neutralen Regeln (Arbeitsweise,
Simplicity, Surgical Changes, Testing, Konventionen). Hier nur, was Claude Code
zusätzlich kann/braucht.

@AGENTS.md

---

## TheBrain MCP

Wenn `thebrain` MCP-Server verbunden ist:

**Session-Start:**
1. `get_context(query="session start")` aufrufen.
2. Antwort enthält "⚠️ TheBrain ist leer" → User darauf hinweisen und vorschlagen:
   1. `./scripts/import.sh scripts/seed_data.json` (im TheBrain-Repo)
   2. `/bootstrap` für aktuelles Projekt
   Auf Bestätigung warten.
3. Sonst: zurückgegebenen Kontext für Session nutzen.

**Während der Arbeit:**
- Bugs / Entscheidungen / unerwartete Erkenntnisse → `save_memory()`.
- Skill / Agent / Command genutzt → `use_item(item_id)`.

**Session-Ende:**
- `save_summary(text, session_id)` mit Zusammenfassung, offenen Punkten,
  nächsten Schritten.

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

Nicht-GSD/caveman-Skills (Web, Testing, PHP, Security …) sind installiert; siehe
`../SKILLS.md`. Bei passender Aufgabe den jeweiligen Skill nutzen.
