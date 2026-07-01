Rückblick auf diese Session — sichere, was dauerhaft wert ist, und route es ans
richtige Ziel. Kein neues Silo: pro Erkenntnis genau **ein** Ziel.

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

5. **Kurzbericht**: was gesichert wurde + wohin, und was bewusst verworfen wurde.

Verwandt: `/hx:hot-reload` (Memory sichern vor `/clear`) — `/hx:retro` ist die
reflektierte, routende Variante.
