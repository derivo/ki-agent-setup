Bereite einen Pull Request für "$ARGUMENTS" (oder den aktuellen Branch) vor.

1. **Gate grün?** Das Gate-Kommando des Stacks läuft sauber durch — sonst erst
   fixen, kein PR auf rotem Gate.
2. **Branch** — falls auf dem Default-Branch: vorher einen Feature-Branch anlegen.
3. **AC-Abdeckung** — kurz zusammenfassen, welche Akzeptanzkriterien durch welche
   Tests abgedeckt sind (aus der Spec, falls vorhanden).
4. **PR-Body** — Was + Warum, Test-/Verify-Nachweis, offene Punkte. Knapp.
5. PR erstellen (`gh pr create`). **Merge/Deploy bleibt beim Menschen** —
   nur vorbereiten, nicht mergen.

Harness-Referenz: `~/.claude/harness/AGENT_LOOP.md`, `feature.md`.
