Verifiziere, dass "$ARGUMENTS" (oder die letzte Änderung) wirklich funktioniert —
durch echtes Ausführen, nicht nur Unit-Tests.

1. **App/Feature starten** — Server hochfahren, CLI ausführen, oder den Endpoint
   ansprechen. Wenn UI: im Browser öffnen.
2. **Wie ein Nutzer beobachten** — den realen Pfad durchgehen, der das
   Akzeptanzkriterium abdeckt. Antwort UND Zustand prüfen (HTTP-Status + Body,
   Exit-Code + stdout, DB-/Datei-Zustand) — nicht nur „grün im Unit-Test".
3. **Beobachtung melden** — was ausgeführt wurde (Befehl/URL), was beobachtet
   wurde (konkret), ob es das erwartete Verhalten zeigt.
4. Weicht das reale Verhalten ab → als nicht fertig behandeln, Ursache fixen.

Fertig zählt nur mit beobachtetem End-to-End-Verhalten (GUARDRAILS C, TESTS.md).
