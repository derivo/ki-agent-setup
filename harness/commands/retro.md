Rückblick auf diese Session — sichere, was dauerhaft wert ist, und route es ans
richtige Ziel. Kein neues Silo: pro Erkenntnis genau **ein** Ziel.

0. **Geparkte Einträge mitnehmen:** `cat ~/.agents/harness-inbox.md` (falls vorhanden) —
   alles mit `Status: geparkt` wird hier neben den Session-Erkenntnissen bewertet, sonst
   wird die Inbox eine Halde. Übernommene/verworfene Einträge im Status nachziehen
   (siehe `/hx:park`).

1. **Session durchgehen** und Erkenntnisse sammeln:
   - Getroffene Entscheidungen (+ Begründung).
   - Überraschungen / Gotchas / falsche Annahmen.
   - Bugs + ihre **Ursache** (nicht nur das Symptom).
   - Was Zeit gekostet hat / was gut lief.
   - Fehlende Regel, die einen Fehler verhindert hätte.

2. **Klassifizieren** — durable vs. ephemeral. Session-Rauschen (einmalige
   Tippfehler, Triviales) **verwerfen**, nicht speichern.

3. **Routen** je Typ an genau ein bestehendes Ziel:
   - **Arbeitsweise / fehlende Regel** → Harness Correction: konkrete Regel für
     `GUARDRAILS.md` (oder Stack-Adapter) vorschlagen (siehe SELF_OPTIMIZATION.md).
     Wird eine Regel übernommen: Eval-Lauf nach `EVALS.md` fällig.
   - **Command / Skill hat geklemmt** (missverständlich, Schritt fehlte, falsche
     Reihenfolge) → konkreten Edit am betroffenen Command (`harness/commands/*`)
     bzw. Skill vorschlagen — als Diff zeigen, Freigabe einholen.
   - **Projekt-Wissen** (Entscheidung, Domänenfakt, Gotcha) → Projekt-Memory bzw.
     GSD `SUMMARY.md` / `extract-learnings`.
   - **Referenz** (URL, Ticket, Doku) → Memory-Eintrag Typ reference.
   - TheBrain verbunden → `save_memory()` / am Ende `save_summary()`.

4. **Vor dem Schreiben** in geteilte/externe oder committete Ziele (TheBrain,
   Harness-Regeln, versionierte Docs) **Freigabe einholen** und den Vorschlag
   zeigen — nicht still ablegen (AGENTS.md Freigabe-Regel).

5. **Freigegebene Harness-Änderungen gebündelt als Branch + PR.** Erst hier, nicht
   beim Parken: `/hx:park` hält nur fest, damit die laufende Arbeit weiterläuft.
   Hier ist der Schnitt, an dem mehrere Einträge zu **einer** kohärenten Änderung
   werden — ein PR pro Bündel, nicht pro Idee.

   - **Ziel-Repo finden.** Die Harness-Quelle ist der `ki-agent-setup`-Checkout —
     **nicht** `$AGENT_HARNESS_ROOT` und nicht `~/.claude/harness/`: das sind
     Deploy-Spiegel, ein Commit dort ist verloren. Ist der Checkout nicht bekannt,
     **einmal** danach fragen. Nicht raten, nicht suchen bis irgendwas passt.
   - **Nie im Working Tree des aktuellen Projekts.** `/hx:retro` läuft in dem
     Projekt, an dem gerade gearbeitet wurde — dessen Tree wird nicht angefasst,
     kein Branch-Wechsel, kein Stash (GUARDRAILS Regel 10). Gearbeitet wird im
     Setup-Checkout, und dort nur, wenn `git status` ihn sauber zeigt. Ist er
     dirty, wird das gemeldet und die Einträge bleiben `geparkt`.
   - **Ein Branch, sprechend benannt**, vom aktuellen `main` des Setup-Repos.
     Commits atomar pro Anliegen, nicht ein Sammel-Commit über alle Einträge.
   - **Gate vor dem PR:** `make verify-docs` im Setup-Repo. Rot → kein PR, Ursache
     melden.
   - **Wird eine Regel übernommen, ist ein Eval-Lauf fällig** (Schritt 3,
     `EVALS.md`). Der PR nennt, ob er lief und mit welchem Ergebnis — „steht aus"
     ist eine zulässige Antwort, „nicht erwähnt" nicht.
   - **Push und PR brauchen eigene Freigabe.** Die Freigabe aus Schritt 4 gilt dem
     Inhalt, nicht der Veröffentlichung.
   - **Danach Status nachziehen:** übernommene Einträge in der Inbox auf
     `**Status:** übernommen (<commit>)`, mit PR-Link.

   **Kein Zugriff, kein sauberer Tree, keine Freigabe → nichts davon.** Dann
   bleiben die Einträge mit `**Status:** geparkt` in `~/.agents/harness-inbox.md`
   liegen; das ist der Normalfall, kein Fehler. Die Datei ist die Warteschlange,
   der PR nur der Weg heraus.

6. **Kurzbericht**: was gesichert wurde + wohin, und was bewusst verworfen wurde.
   Wurde ein PR aufgemacht: Link und Zahl der darin gebündelten Einträge.

Verwandt: `/hx:hot-reload` (Memory sichern vor `/clear`) — `/hx:retro` ist die
reflektierte, routende Variante.
