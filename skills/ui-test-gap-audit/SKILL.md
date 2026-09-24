---
name: ui-test-gap-audit
description: 'Misst, welche UI-Tests fehlen — je Rolle, je Seite, je Formular, je Datenvariante — und liefert eine belegte Lückenliste nach Risiko. Use when the user asks whether the UI is tested enough or wants missing UI tests found — e.g. "haben wir genug UI-Tests", "welche Seiten sind nicht getestet", "wird jede Rolle wirklich eingeloggt getestet", "fehlen Formular-Tests", "UI-Testabdeckung prüfen". Read-only: erst messen, dann vorschlagen; baut keine Tests, solange der Nutzer das nicht freigibt.'
---

# ui-test-gap-audit

Eine hohe Testzahl sagt nichts darüber, **was** getestet ist. Tausende Komponententests
mit gemockter API können neben null echten Anmeldungen stehen. Dieser Skill beantwortet
die Frage „fehlen UI-Tests?" mit einer **Matrix aus Belegen**, nicht mit einer Zahl.

Der Leitgedanke: Jeder Test wird nach seiner **Echtheitsstufe** eingeordnet, und jede
Zelle der Matrix (Rolle × Seite × Formular × Variante) bekommt die höchste Stufe, die ein
Test tatsächlich erreicht.

| Stufe | Bedeutung |
|---|---|
| **E2E echt** | Browser, echter Identity-Provider-Login, echtes Backend, echte Datenbank |
| **E2E Attrappe** | Browser, aber Login oder API simuliert (Mock-Flag, `page.route`, Stub-Server) |
| **Komponente** | jsdom/Unit-Render mit gemockter API |
| **keine** | kein Test berührt die Stelle |

Nur **E2E echt** belegt, dass ein Nutzer die Seite wirklich bedienen kann. Die anderen
Stufen sind nützlich, beweisen das aber nicht — und genau diese Verwechslung ist die
Fehlerklasse, gegen die der Skill arbeitet.

## Wann anwenden
- „Haben wir genug UI-Tests / E2E-Tests?", „ist jede Seite getestet?"
- Vor einem Go-Live oder nach einem großen UI-Umbau.
- Wenn Rollen/Rechte neu geschnitten wurden und unklar ist, ob Grenzen im UI geprüft sind.

## Grundregeln
- **Messen, nicht schätzen.** Zahlen kommen aus Test-Runnern (`--list`), aus `grep` über
  die Specs und aus den Logs des letzten CI-Laufs. Jede Aussage trägt Datei:Zeile oder
  Befehl + Ergebnis. Nicht Bestimmbares steht als `UNBEKANNT: …` da.
- **Gelistet ≠ gelaufen.** Ein Test zählt nur, wenn er in einem CI-Workflow läuft. Tests,
  die nur lokal oder nur in einem nie gestarteten Browser-Projekt existieren, werden
  getrennt ausgewiesen.
- **Übersprungen ist nicht grün.** `skip`/`fixme` und datenabhängige Selbst-Übersprünge
  (`test.skip(!row, …)`) aus dem letzten Lauflog heraussuchen und benennen.
- **Read-only.** Der Skill schreibt nur seinen Bericht (Scratchpad oder vom Nutzer
  genannter Ort). Tests baut er erst nach Freigabe — dann gilt der Plan-first-Ablauf
  des Harness.

## Ablauf

### 1. Testebenen inventarisieren
Für jede Ebene: Anzahl Dateien/Tests, **wie angemeldet wird**, **wo sie läuft**.
- Browser-E2E (Playwright/Cypress/Selenium): Projekte aus der Runner-Config;
  `npx playwright test --list` je Projekt. Login-Helfer lesen — echter IdP-Formular-Login
  oder Mock-Parameter/Token-Injektion? Gibt es eine Trennung „mit Backend" vs. „ohne"?
- Komponententests (Vitest/Jest): `npx vitest list --json` bzw. Äquivalent.
- Server-seitige Browser-Tests (z. B. Laravel Dusk/Selenium unter `tests/Browser/`) —
  auch hier den Login-Weg prüfen.
- CI-Workflows lesen: welcher Job startet welche Ebene, welches Browser-Projekt, bei
  welchem Ereignis (Push, PR, nightly). Letzten Lauf je Workflow öffnen
  (`gh run list` / `gh run view <id> --log`) und bestanden/übersprungen/rot zählen.

### 2. Rollen gegen echte Anmeldung stellen
- Rollen und Testkonten aus der IdP-Konfiguration bzw. den Seedern auflisten
  (Realm-Export, Setup-Skript, Fixture-Seeder).
- **Konten, die mehrere Rollen vereinen, machen Grenzen untestbar.** Ein Admin-Konto,
  das zugleich Händler und Prüfer ist, kann weder „Händler ohne Tower" noch „Prüfer ohne
  Senior-Stufe" belegen. Fehlende Einzelrollen-Konten und ein **zweites Konto derselben
  Rolle** (für Fremdzugriff) als Lücke melden.
- Je Rolle: gibt es einen **E2E-echt**-Test, der sich anmeldet und danach eine Aktion
  gegen das Backend ausführt (nicht nur rendert)?
- **Rollengrenzen:** Matrix Rolle × fremder Bereich (Kunde → Händler-UI, Händler → Admin-UI,
  Händler A → Objekt von Händler B). Je Zelle: welcher Test, welche Stufe. Ist das
  erwartete Verhalten (Sperre vs. Weiterleitung/Onboarding) nicht festgelegt, ist das eine
  **Frage an den Nutzer**, keine Annahme.

### 3. Seitenmatrix
- Alle Routen je App/Bereich aus den Router-Dateien extrahieren (nicht aus der Navigation —
  die lässt Detail- und Unterseiten aus).
- Je Route die höchste erreichte Stufe; dazu vermerken, ob der echte Test nur **rendert**
  oder **handelt** (Klick, Absenden, Statuswechsel).
- Ausgabe: Tabelle je Bereich mit Zählern und die Liste der Routen ohne E2E-Test.

### 4. Formulare
- Formulare finden (`<form`, `onSubmit`, `handleSubmit`, Form-Libraries).
- Je Formular gegen die **Fehlerfall-Matrix** des Hauses prüfen (`AGENTS.md` → Testing):
  genau ein Feld falsch je Test, reihum durch alle Felder; Assertion auf den exakten
  Fehlertext; Tastatur-Submit (Enter) als eigener Pfad; Happy Path zuletzt.
  Einordnen: **voll / teilweise / nur Happy Path / keine** — getrennt nach Stufe
  (eine volle Matrix nur in der Komponentenebene ist kein Beleg gegen das echte Backend).
- Stichprobe, ob eine „volle" Matrix wirklich **alle** Felder rotiert, sonst
  `UNBEKANNT` ausweisen.

### 5. Datenvarianten
Je Variante: gibt es einen Test, auf welcher Stufe?
- leere Zustände, lange Listen/Paginierung, Sonderzeichen und lange Werte (durch das echte
  Backend und die DB, nicht nur im Render), Fehlerantworten (4xx/5xx), Ladezustände
- Farbmodi (hell/dunkel) samt Barrierefreiheits-Prüfung, Mobil-Viewport, weitere Browser
- Sprachen, falls die Oberfläche mehrsprachig ist

### 6. Urteil und Vorschlag
- **Lücken nach Risiko** ordnen: Geld- und Rechtspfade, Anmeldung und Rollengrenzen zuerst;
  dann stille Grün-Meldungen (Übersprünge); dann Breite (Seiten, Formulare, Browser).
- Je Lücke ein **konkreter Schließvorschlag** mit grober Größe (Personentage), z. B.:
  Einzelrollen-Testkonten + Seed-Daten; ein echter Login-Durchgang je Rolle, der alle
  Routen des Bereichs abgeht (mit a11y hell/dunkel); eine Grenz-Matrix mit fremdem Konto;
  datenabhängige Übersprünge in harte Vorbedingungen umwandeln; ein gemeinsamer
  Formular-Matrix-Helfer.
- Offene Entscheidungen, ohne die ein Test nicht schreibbar ist, als Fragen an den Nutzer.

## Ausgabe
- **Kurzantwort zuerst** (ja/nein + ein Satz, warum), dann die Tabellen aus 1–5, dann die
  Risikoliste mit Vorschlag.
- Bericht als Markdown-Datei; im Chat höchstens eine Zusammenfassung mit dem Pfad.
- Jede Zahl mit Quelle (Befehl, Lauf-ID oder Datei:Zeile).

## Fallstricke
- **Attrappe mit echtem Namen:** Specs im „Stack"-Projekt können trotzdem gemockte Fälle
  enthalten — pro Test, nicht pro Datei einordnen.
- **Nur gerendert:** ein Test, der eine Seite lädt und „keine Konsolenfehler" prüft, belegt
  das Rendern, nicht die Bedienbarkeit.
- **Browser-Projekt ohne Workflow:** in der Config definiert heißt nicht in der CI gelaufen.
- **Konfigurierte Rollen ≠ gespiegelte Rollen:** eine IdP-Rolle, die das Backend nicht
  auswertet, ist für die UI wirkungslos — gegen den Guard/Mapper im Backend abgleichen.
