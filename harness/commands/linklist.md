Gib die kuratierte Linklist aus — read-only, dieser Command trägt nichts ein.

1. **Linklist finden** (Lookup analog Harness): `$AGENT_HARNESS_ROOT/linklist.md`,
   dann `~/.claude/harness/linklist.md`, sonst `harness/linklist.md` im
   ki-agent-setup-Repo. Nichts gefunden → melden, nicht raten.
2. **Ausgeben** — nach Blöcken gegliedert, unverändert (Block-Titel + Links je mit
   Ein-Zeilen-Beschreibung). Kein Zusatz-Kommentar, keine Bewertung. Hat der Nutzer
   ein Thema genannt (z. B. „Animation"), nur den passenden Block zeigen.
3. **Neuen Link aufnehmen** ist nicht Aufgabe dieses Commands → Skill
   [`linklist-curator`](../../skills/linklist-curator/SKILL.md) bzw. direkt
   `harness/linklist.md` bearbeiten.

Gegenstück zum Eintragen: Skill `linklist-curator`.
