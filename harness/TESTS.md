# Tests — Akzeptanzkriterien in ausführbarer Form

Tests sind die ausführbare Form der Akzeptanzkriterien. Sie sind das Gate, das
entscheidet, ob ein Feature fertig ist — nicht deine Selbsteinschätzung (siehe
[GUARDRAILS.md](GUARDRAILS.md), Abschnitt C).

Das konkrete Test-Framework, Runner und Datastore stehen im Stack-Adapter
([`stacks/`](stacks/)). Hier steht die generelle Strategie.

## Struktur
- Struktur: Arrange – Act – Assert.
- EIN Akzeptanzkriterium = mindestens EIN Test mit sprechendem Namen.
- **Unit-Tests für den Kern/die Domäne** — schnell, ohne IO/DB.
- **Integrationstests** für Adapter/Use Cases gegen einen echten Datastore (kein
  Mock der eigenen Persistenz).

## Sensible Daten in Testdaten — hart
- Fixtures/Seeds enthalten AUSSCHLIESSLICH synthetische Daten.
- Niemals echte/realistische Klarnamen, Geburtsdaten, Adressen tatsächlicher
  Personen. Faker o. Ä. oder klare Platzhalter.
- Keine echten Produktions-Datenexporte als Testbasis.

(Vollständige Regel: GUARDRAILS.md, Regel 3.)

## Spec-Driven: aus einem Akzeptanzkriterium wird ein Test
Akzeptanzkriterium aus der Feature-Spec:
> AC2: Eine bereits abgeschlossene Aufgabe kann nicht erneut Punkte geben.

wird zu einem Test mit sprechendem Namen, der genau dieses Verhalten prüft
(Arrange: abgeschlossene Aufgabe; Act: Operation erneut ausführen; Assert:
erwarteter Fehler, Zustand unverändert). Test ZUERST, dann Code.

## Fertig ist eine enumerierte AC-Liste, kein einzelner grüner Lauf

Bei größeren Features ist "fertig" nicht ein einzelnes grünes Gate, sondern eine
**aufgezählte, maschinell prüfbare Liste von Akzeptanzkriterien** — je AC ein Test,
alle anfangs rot. Fortschritt = wie viele davon grün sind. Die Regel dabei ist
hart: **ein Test wird nie entfernt oder aufgeweicht, um grün zu werden** — grün
entsteht nur, indem der Code stimmt. Wer den Test ändert, um zu bestehen, hat das
Akzeptanzkriterium verschoben, nicht erfüllt (siehe GUARDRAILS.md, Abschnitt C).

## Grün ist nicht gleich gültig — Test-Adäquanz

Ein grünes Gate heißt nur: *die vorhandenen* Tests bestehen. Es heißt nicht, dass
die Tests das Verhalten wirklich prüfen. Bevor du dich auf "grün" verlässt, prüfe
die Tests selbst auf Adäquanz:
- Prüft der Test den **Negativ-/Grenzfall**, nicht nur den Happy Path?
- Ist die Assertion **spezifisch** — exakter Wert/Text/Zustand — oder so schwach,
  dass auch eine leere/triviale Ausgabe sie erfüllt?
- Kann der Test überhaupt **rot werden**? Ein Test, der nie fehlschlägt, prüft nichts.

Ein grünes, aber inadäquates Gate ist gefährlicher als ein rotes — es meldet
Sicherheit, die nicht da ist.

## Durchstich-Test — der wichtigste Testtyp

Neben Unit-Tests (Kern) gibt es den **Durchstich**: ein echter Aufruf durch die
ganze Anwendung (HTTP-Request, CLI-Aufruf, Message) gegen einen echten
Test-Datastore. Das prüft, was ein Nutzer (oder ein späterer KI-Agent über die
Schnittstelle) tatsächlich erlebt — nicht nur eine isolierte Klasse.

Jeder Durchstich-Test prüft ZWEI Ebenen, nicht nur eine:

1. **Die Antwort.** Status/Body/Exit-Code/Ausgabe korrekt?
2. **Den Zustand.** Hat die Operation die Daten wirklich richtig persistiert?
   Nach dem Aufruf direkt im Test-Datastore nachsehen. Ein grüner Antwort-Check
   allein reicht NICHT — der häufigste versteckte Bug ist eine korrekte Antwort
   bei falschem Zustand.

Warum diese Schärfe: Ein Test, der nur die Antwort prüft, übersieht, ob im
Hintergrund Müll geschrieben wurde. Erst Antwort-Assertion UND Zustands-Assertion
geben echte Sicherheit.

(Konkretes Code-Beispiel im Test-Framework des Stacks: Adapter.)

## Teststrategie bewusst zuschneiden
Nimm nur die Testtypen, die echten Schutz bringen. Hat die App keine externen
Service-Aufrufe, brauchst du kein Mocking-Framework dafür. Default-Minimum: Unit
(Kern) + Durchstich (mit Zustands-Assertion). Browser-/E2E-Tests nur, wenn es eine
UI mit eigener Logik gibt — dann aber nach den Regeln unten, damit sie von Anfang
an stabil und aussagekräftig sind.

## E2E / Browser — stabil von Anfang an

Ein E2E-Test fährt die echte UI im Browser (Klick, Tippen, Submit) gegen eine
echte Test-DB. Er ist teuer und neigt zu Flakiness — deshalb wird er bewusst
aufgebaut, nicht nachträglich geflickt. Die folgenden Regeln gelten ab dem ersten
E2E-Test, nicht erst wenn er rot blinkt.

### Edge-Case-Matrix — der Pflichtkern
Ein Happy-Path-Test allein ist kein Schutz. Jedes Eingabe-Formular wird über die
volle Matrix geprüft: **immer genau EIN Feld falsch, alle anderen korrekt — durch
alle Felder rotieren**, dazu Grenzwerte (leer, zu kurz/zu lang, min/min−1,
max/max+1, falsches Format, ungültige Auswahl, abweichendes Bestätigungsfeld).
Die vollständige Matrix-Regel mit Beispiel-Tabelle steht im Instruktions-Standard
(AGENTS.md → »Testing — Pflichtstandard Edge Cases«); hier zählt:
ohne rotierende Ein-Feld-falsch-Matrix ist ein Formular nicht abgedeckt.

Dazu pro Formular:
- **Keyboard-/Enter-Submit als eigener Pfad** — kann die Button-Validierung
  umgehen und ist ein eigener Bug-Vektor.
- **Assertion auf den EXAKTEN Fehlertext**, nicht nur "ein Fehler erscheint". Ein
  falscher, aber vorhandener Text muss rot werden.
- **Happy Path als LETZTER Test der Gruppe** — er baut auf dem Zustand der
  Edge-Cases auf.

### Stabilität — keine Flakiness einbauen
- **Stabile Selektoren.** Über `data-testid`/Rollen ansprechen, nicht über
  CSS-Position, Textfragmente oder DOM-Reihenfolge — die brechen bei jedem
  Layout-Change.
- **Deterministisch warten, nie feste Sleeps.** Auf eine Bedingung warten
  (Element sichtbar, URL gewechselt), nicht auf `sleep(2s)`. Feste
  Wartezeiten sind die häufigste Flaky-Quelle. Bei asynchronem Backend nach dem
  Submit auf die Response/Netzwerk-Ruhe warten, nicht nur auf Element-Sichtbarkeit
  — sonst Race zwischen DOM-Update und API-Antwort.
- **Isolierte, FK-sichere Daten pro Test/Namespace.** Jeder Lauf seedet seine
  eigenen Daten und räumt sie in FK-sicherer Reihenfolge wieder ab. Kein Test
  hängt vom Restzustand eines anderen ab.
- **Sequenziell gegen geteilte DB.** Keine parallelen E2E-Suites gegen denselben
  Datastore — sonst Kollisionen, Deadlocks, Falschfehler (siehe "Wichtig" unten).
- **Cross-Browser.** In allen konfigurierten Engines grün, nicht nur in einer.
  (Welche Engines konkret: Stack-Adapter.)
- **Doppel-Submit/Race.** Doppelklick auf Submit und langsames Netz dürfen keine
  doppelte Wirkung erzeugen — als eigenen Test absichern.

### Querschnitt-Checkliste — über die Formular-Matrix hinaus
Soweit auf das Projekt zutreffend, je ein E2E-/Durchstich-Test:
- **Autorisierung:** jede Rolle gegen jede fremde/geschützte Route → blockiert/
  Redirect; nicht eingeloggt → Login.
- **CSRF — nur HTTP-Durchstich, nicht Browser-E2E** (der Browser sendet automatisch
  ein gültiges Token; absichtlich fehlende/fremde Token sind nur auf HTTP-Ebene
  injizierbar): POST ohne / mit fremdem / abgelaufenem Token → abgelehnt.
- **Session/TTL:** abgelaufene Session → Login; unterschiedliche TTLs;
  deaktivierter User mit noch offener Session.
- **Erzwungene Folgeaktion** (z. B. Passwortwechsel-Gate) blockiert andere Routen,
  bis erledigt.
- **Datei-Upload:** Inhalts-MIME vs. Endung, Übergröße, 0-Byte,
  Pfad-Traversal-Name, Besitz-/IDOR-Zugriff, Direktzugriff auf Storage-Pfad → 404,
  randomisierter Dateiname.
- **Objekt-Zugriff/IDOR:** Nutzer A sieht keine Daten von Nutzer B; nur opake/
  numerische IDs in URLs.
- **Stored-/Reflected-XSS:** Script/HTML in Freitextfeldern → escaped gerendert.
- **Domänen-Grenzwerte:** Schwellen exakt getroffen vs. knapp darunter, idempotente
  Wiederholung, numerische Overflows (Spalten-Limits), Maximalzustände ohne
  Division/Null-Fehler, Datum-/Zeitzonen-Tagesgrenze.
- **Zustandsübergänge:** Wiedereinreichen/Re-Try, Re-Check bei Freigabe wenn sich
  die Vorbedingung änderte, gleichzeitige Doppel-Aktion → nur einmal wirksam,
  Aktion auf zwischenzeitlich deaktiviertes Objekt.
- **Listen/Pagination:** Seite über Ende / negativ → geklemmt; Filter ohne Treffer
  → Empty-State; frischer Account → sauberer Empty-State.
- **A11y/Interaktion:** Modal-Focus-Trap + ESC + Fokus-Rückkehr.

### Priorisierung, wenn die Lücke groß ist
1. Regression für gerade gefundene/gebaute Bugs (frisch, oft 0 Coverage).
2. Sicherheitskritische Null-Coverage-Zonen (Autorisierung, CSRF, Session,
   Upload, IDOR).
3. Domänen-Kernlogik mit Grenzwerten.
4. Restliche Form-Matrix, Pagination, Empty-States, A11y.

(Konkretes Test-Framework, Browser-Runner und Seed/Cleanup-Werkzeug: Stack-Adapter.)

## Wichtig
- Tests aus den Akzeptanzkriterien ZUERST schreiben, dann Code.
- Tests niemals manipulieren, damit sie grün werden, ohne dass der Code stimmt.
  Ist ein Test schwer zu schreiben, ist meist das Design das Problem.
- Keine parallelen Test-Suites gegen einen geteilten Datastore — sequenziell,
  sonst Kollisionen/Deadlocks/Falschfehler.
