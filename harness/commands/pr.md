Bereite einen Pull Request für "$ARGUMENTS" (oder den aktuellen Branch) vor.

1. **Gate grün?** Das Gate-Kommando des Stacks läuft sauber durch — sonst erst
   fixen, kein PR auf rotem Gate.
2. **Branch** — falls auf dem Default-Branch: vorher einen Feature-Branch anlegen.
3. **AC-Abdeckung** — kurz zusammenfassen, welche Akzeptanzkriterien durch welche
   Tests abgedeckt sind (aus der Spec, falls vorhanden).
4. **PR-Body** — Was + Warum, Test-/Verify-Nachweis, offene Punkte. Knapp.
   `Closes #N` nur, wenn der PR **jedes** Akzeptanzkriterium des Issues erfüllt;
   bleibt eines offen (Folge-PR, Post-Deploy-Prüfung, Text in einem anderen
   Issue), steht `Refs #N` und das offene Kriterium im Body — sonst schließt der
   Merge in den Default-Branch das Issue, und das Kriterium verschwindet aus dem
   Tracking.
5. PR erstellen (`gh pr create`). **Merge/Deploy bleibt beim Menschen** —
   nur vorbereiten, nicht mergen. Nennt der Body einen Reviewer, wird das Review
   auch angefragt: `gh pr edit <n> --add-reviewer <login>`, mehrere als `a,b`
   ohne Leerzeichen (`"a, b"` liefert den ungültigen Login `" b"`). Nennung im
   Body oder als Assignee benachrichtigt zwar, erzeugt aber keine
   Review-Anfrage — das Review bleibt liegen. Danach prüfen, dass genau diese
   Logins in `gh pr view <n> --json reviewRequests` stehen.
6. **Nach einem Merge aufräumen** (eigener Zug, nicht Teil des PR): gemergte
   Branches lokal und auf dem Remote löschen, `git worktree prune`. Erst
   `git fetch --prune` (GUARDRAILS Regel 11: lokales `main` ist ein Cache), dann
   nur, was nachweislich im **Remote**-Default-Branch steckt
   (`git branch --merged origin/<default>`), und mit `git branch -d` statt `-D` —
   ein Branch mit ungemergten Commits soll stehenbleiben. Squash- oder
   Rebase-Merges erkennt `--merged` nicht; dort entscheidet der PR-Status
   (`gh pr view <branch> --json state`), nicht die Ancestry. Remote-Branches erst
   nach Rückfrage löschen. Fremde Branches bleiben unangetastet: ein gemergter
   Branch kann in einer anderen Session oder auf einer anderen Maschine
   ausgecheckt sein.

Harness-Referenz (Root per Lookup wie in `/hx:start`): `AGENT_LOOP.md`, `feature.md`.
