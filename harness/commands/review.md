Review den aktuellen Diff (oder "$ARGUMENTS", falls Branch/PR/Datei genannt) über
das Multi-Agent-Review-Panel.

0. **Schwelle prüfen.** Panel läuft bei Auth/Krypto/Migrationen/Secrets/Harness im
   Diff, bei großen unabhängigen Änderungen oder auf ausdrücklichen Wunsch. Sonst
   Single-Pass-Review ohne Subagents und das sagen — kein Panel „zur Sicherheit"
   (REVIEW_PANEL.md → „Wann").
1. Diff bestimmen (uncommitted, sonst gegen den Default-Branch).
2. Pro Lens **einen Subagent** parallel starten (isolierter Context):
   - **Korrektheit** — Bugs, Edge-Cases, falsche Annahmen.
   - **Security** — Injection, Secrets im Code, Auth/Autorisierung, unsichere
     Defaults (siehe GUARDRAILS Security-Pass).
   - **Performance** — N+1, unnötige IO, offensichtliche Hotspots.
3. **Belegen, nicht vorab wegwerfen**: jeder Fund wird am Code belegt
   (Datei:Zeile, Repro). Hält der Beleg nicht, fällt er raus; bei Unsicherheit
   wird er gemeldet **und als unsicher markiert** — nicht unterdrückt.
4. Alle Funde melden — `Datei:Zeile · Lens · Problem · Fix`, nach Schweregrad,
   unsichere getrennt darunter. Keine Stil-Nits ohne Bedeutungsänderung.

Harness-Referenz: `~/.claude/harness/REVIEW_PANEL.md`.
