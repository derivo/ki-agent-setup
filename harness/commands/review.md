Review den aktuellen Diff (oder "$ARGUMENTS", falls Branch/PR/Datei genannt) über
das Multi-Agent-Review-Panel.

1. Diff bestimmen (uncommitted, sonst gegen den Default-Branch).
2. Pro Lens **einen Subagent** parallel starten (isolierter Context):
   - **Korrektheit** — Bugs, Edge-Cases, falsche Annahmen.
   - **Security** — Injection, Secrets im Code, Auth/Autorisierung, unsichere
     Defaults (siehe GUARDRAILS Security-Pass).
   - **Performance** — N+1, unnötige IO, offensichtliche Hotspots.
3. **Adversariale Gegenprüfung**: jeder Fund wird von einem zweiten Schritt
   widerlegt, bevor er gemeldet wird (Default: refuted=true bei Unsicherheit).
4. Nur bestätigte Funde melden — `Datei:Zeile · Lens · Problem · Fix`, nach
   Schweregrad. Keine Stil-Nits ohne Bedeutungsänderung.

Harness-Referenz: `~/.claude/harness/REVIEW_PANEL.md`.
