Session-Start — Harness laden, Projektstand erfassen, einsatzbereit melden.
Read-only: dieser Command ändert nichts, er lädt und berichtet.

1. **Harness finden** — Lookup-Reihenfolge aus den globalen Instructions:
   `$AGENT_HARNESS_ROOT/README.md`, dann `~/.claude/harness/README.md`,
   `~/.codex/harness/README.md`, `~/.gemini/harness/README.md`, sonst
   `harness/README.md` im ki-agents-Repo. Nichts gefunden → melden, nicht raten.
2. **Kern laden** — `README.md` (Lesereihenfolge) und `GUARDRAILS.md` lesen.
   Passenden **Stack-Adapter** unter `stacks/` für das aktuelle Projekt wählen;
   passt keiner, das benennen (generelle Methode gilt, Adapter ggf. anlegen).
   Doku-Projekt → stattdessen `doc-harness/README.md`.
3. **Projektstand erfassen** —
   - GSD-Projekt: `.planning/STATE.md` + `.planning/ROADMAP.md` (Milestone,
     Phase, nächster Schritt). Sonst: `PROJECT.md`/`README.md`.
   - Offene Specs unter `specs/` (unerledigte Akzeptanzkriterien).
   - `git status` + Branch: uncommittete Arbeit, ungepushte Commits.
4. **Bereit melden** — kurzer Report statt Volltext-Wiedergabe:
   ROADMAP-Phase, gewählter Adapter, Gate-Kommando, offene Arbeit aus Schritt 3,
   Vorschlag, womit es weitergeht. Was nicht geprüft wurde (z. B. ob das Gate
   aktuell grün ist), nicht behaupten — als ungeprüft kennzeichnen.

Gegenstück am Tagesende: `/hx:eod`.
