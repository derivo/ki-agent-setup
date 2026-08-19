Prüfe den **Bestand** von "$ARGUMENTS" (oder des Projekts) auf Drift gegen
Architektur und Design-System — nicht den Diff. Das ist ein seltener, explizit
aufgerufener Lauf, kein Schritt vor der Fertig-Meldung.

0. **Scope festlegen.** `$ARGUMENTS` nennt Modul/Verzeichnis; ohne Argument das
   Projekt. Ist es zu groß für einen Lauf, den Zuschnitt vorlegen statt alles
   oberflächlich zu streifen — ein belegter Ausschnitt schlägt einen vollständigen
   Überflug.
1. **Quellen benennen, gegen die geprüft wird** — Stack-Adapter (Schichtnamen,
   verbotene Kanten), `DESIGN.md`/Token-Quelle, `STYLEGUIDE.md`/`docs/design-*`,
   Component-Verzeichnis, Projekt-`AGENTS.md`. Jede mit Pfad. Fehlt eine, ist das
   der erste Befund. Gibt es **keine**, bricht der Audit ab: ohne Quelle entstünde
   Meinung statt Fund (GUARDRAILS_UI.md → „Bestand zuerst").
2. **Mechanisch zuerst.** Das Gate des Adapters laufen lassen
   (`deptrac`/`depcruise`/`lint-imports`, `design.md lint` **und** `export`).
   Was dort rot wird, ist Befund mit Beleg — nicht per Modell nachbauen. Läuft das
   Gate grün, im Bericht sagen, was es abdeckt und was nicht.
3. **Dann die Lenses, die kein Linter sieht:**
   - **Doppelte Bausteine** (Regel 6) — zwei Komponenten für denselben Zweck, zwei
     Fehler-Shapes, zwei Namenskonventionen für dasselbe.
   - **Ad-hoc-Werte** (Regel 7) — Inline-Hex, Magic-Number-Spacing, Einzelfall-`px`,
     wo eine Skala existiert.
   - **Modulgrenzen** (GUARDRAILS A) — Zugriffe, die die erlaubte Richtung
     umgehen, aber vom Linter nicht erfasst sind (Reflection, Service-Locator,
     String-basierte Auflösung, Config-Wiring).
4. **Bestehende Entscheidungen respektieren.** Eine Abweichung mit ADR unter
   `decisions/` ist **kein** Befund — sie wird als bekannte Ausnahme gelistet.
   Fehlt das ADR, ist genau das der Befund (GUARDRAILS A / GUARDRAILS_UI.md →
   „Nachweis statt Zusicherung").
5. **Mehrere Implementierungen desselben Zwecks nicht eigenmächtig vereinheitlichen.**
   Die kanonische Variante *vorschlagen*, die anderen mit Migrationsaufwand
   ausweisen — welche gilt, entscheidet der Nutzer.
6. **Bericht**: je Befund `Datei:Zeile · Regel · Problem · Vorschlag`, nach
   Schweregrad, unsichere getrennt darunter und als unsicher markiert. Keine
   Gesamtnote und kein „Top 10" — eine Note beruhigt, ein reproduzierbarer Fund
   wirkt. Jeder Fund ist am Code belegt; hält der Beleg nicht, fällt er raus.
7. **Kein Auto-Fix.** Der Audit meldet. Fixes laufen danach als eigener Auftrag,
   pro Befund atomar, mit grünem Gate (GUARDRAILS C und D).

Harness-Referenz: `~/.claude/harness/GUARDRAILS.md` (A, C),
`GUARDRAILS_UI.md` (G), `ADR_TEMPLATE.md`, Stack-Adapter unter `stacks/`.
