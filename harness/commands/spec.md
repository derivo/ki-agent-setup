Schärfe das Feature "$ARGUMENTS" zu einer testbaren Spec — nach dem Harness, nicht
sofort coden.

1. **Kritisches Sparring** (SPEC_WORKFLOW Stufe 1): Randfälle, Berechtigung,
   Scope-Grenze, rechtliche/sensible Aspekte hinterfragen. Bei Unklarheit FRAGEN,
   nicht raten.
2. **Spec schreiben** nach FEATURE_TEMPLATE: Ziel, Zielgruppe, Akzeptanzkriterien
   (konkret + prüfbar), Out-of-Scope, betroffene Schichten, Sensible-Daten-Check.
3. Ablegen unter `specs/<feature-slug>.md`.
4. Spec dem Menschen zum Review vorlegen — **bevor** Code entsteht.

Harness-Referenz: `~/.claude/harness/SPEC_WORKFLOW.md`, `FEATURE_TEMPLATE.md`.
