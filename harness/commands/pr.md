Bereite einen Pull Request für "$ARGUMENTS" (oder den aktuellen Branch) vor.

1. **Gate grün?** Das Gate-Kommando des Stacks läuft sauber durch — sonst erst
   fixen, kein PR auf rotem Gate.
2. **Branch** — falls auf dem Default-Branch: vorher einen Feature-Branch anlegen.
3. **AC-Abdeckung** — kurz zusammenfassen, welche Akzeptanzkriterien durch welche
   Tests abgedeckt sind (aus der Spec, falls vorhanden).
4. **PR-Body** — Was + Warum, Test-/Verify-Nachweis, offene Punkte. Knapp.
5. PR erstellen (`gh pr create`). **Merge/Deploy bleibt beim Menschen** —
   nur vorbereiten, nicht mergen.
6. **Nach einem Merge aufräumen** (eigener Zug, nicht Teil des PR): gemergte
   Branches lokal und auf dem Remote löschen, `git worktree prune`. Nur was
   nachweislich in den Default-Branch gemergt ist (`git branch --merged`), und
   mit `git branch -d` statt `-D` — ein Branch mit ungemergten Commits soll
   stehenbleiben. Fremde Branches bleiben unangetastet: ein gemergter Branch kann
   in einer anderen Session oder auf einer anderen Maschine ausgecheckt sein.

Harness-Referenz: `~/.claude/harness/AGENT_LOOP.md`, `feature.md`.
