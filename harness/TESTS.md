> **Lade wenn:** Tests werden geschrieben oder umgebaut.

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

**Die Default-Suite bleibt schnell und hermetisch.** Teure oder umgebungs-/
plattformabhängige Tests (echte Audio-Ein-/Ausgabe, GPU, externe Kosten-APIs,
Läufe von Minuten) laufen **nicht** im Standardlauf mit, sondern hinter einem
**Env-Flag + Plattform-Guard** (`RUN_AUDIO_E2E=1`, sonst übersprungen). So bleibt
das schnelle Gate hermetisch und lokal jederzeit grün-prüfbar; der teure Lauf wird
bewusst angestoßen (vor Release, in dedizierter CI-Stufe). Übersprungene Tests
werden als übersprungen gemeldet, nicht als bestanden.

## Nicht-deterministische Ausgaben (LLM/AI) testen

Ruft die App ein Sprachmodell (oder eine andere nicht-deterministische Quelle),
lässt sich die **Modell-Antwort** nicht per exaktem Vergleich prüfen — derselbe
Input liefert nicht denselben Output. Nicht die Antwort testen, sondern das
**Deterministische darum herum**:

- **Golden-Prompt-Test.** Prüfe den *zusammengebauten* Prompt-String (System +
  Kontext + Tool-Beschreibungen + User-Eingabe), der ans Modell geht — exakter
  Vergleich gegen ein Golden-Literal. Der Prompt-Bau ist deine Logik und
  deterministisch; hier verstecken sich die echten Regressions (falscher Kontext,
  fehlende Escapes, vertauschte Reihenfolge), nicht in der Modell-Kreativität.
- **Provider per Dependency Injection, Test gegen einen Stub.** Das Modell ist ein
  Interface (Port), kein direkter Aufruf. Tests laufen gegen einen **deterministischen
  Stub-Provider** mit fest hinterlegter Antwort; das echte Modell wird nur im
  Bring-up/manuellen Check verdrahtet. So bleibt die Suite schnell und hermetisch.
- **Determinismus-Quellen fixieren.** Keine `now()`/Zufallswerte direkt im Code —
  Clock und Seed injizieren, in Tests auf feste Werte setzen (z. B. fixe UTC-ISO-
  Zeit). Sonst flakt der Test aus Gründen, die nichts mit dem Modell zu tun haben.
- **Guardrail-Primitive separat unit-testen.** Absicherungen gegen Modell-Fehlgriffe
  — Iterations-Cap gegen Endlos-Tool-Loops, Erkennung byte-identischer
  Wiederholung, Umhüllen unvertrauten Texts gegen Prompt-Injection — sind kleine
  reine Funktionen mit eigenen Unit-Tests, getrennt vom Consumer.

**Grenze — ehrlich benannt:** Das prüft Verdrahtung und Determinismus, **nicht die
Qualität der Modell-Ausgabe**. Ob eine Antwort *gut* ist (Eval-Sets,
LLM-as-judge, Golden-Transcript-Vergleiche, toleranzbasierte Assertions), ist eine
eigene Disziplin — hier bewusst nicht abgedeckt. Wo Ausgabe-Qualität selbst
zusagepflichtig wird, gehört ein Eval-Harness dazu; bis dahin gilt: Determinismus
umgehen, nicht Qualität vortäuschen.

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
- **Ungültige Werte müssen den Server wirklich erreichen.** Native Controls
  verwerfen sie sonst still und der Test wird grün-falsch: `<input type=date>`
  coerct einen Nicht-Datum-String zu leer (→ `nullable` greift, kein
  Format-Fehler), `<select>` ignoriert einen Wert ohne passende `<option>`
  (→ leer statt ungültig). Beim Setzen per Skript den date-Input auf `text`
  kippen bzw. die fehlende Option injizieren — sonst prüfst du den Required-
  statt den Format-/Auswahl-Pfad.
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

### Verhaltens-Tests — Journey, Misbehavior, Monkey
Die Formular-Matrix prüft Eingaben isoliert; Verhaltens-Tests prüfen, wie die
App sich über mehrere Schritte gegenüber echtem Nutzerverhalten hält. Drei
Stufen, aufsteigend nach Chaos — sie ERGÄNZEN die Matrix, ersetzen sie nicht:

- **User-Journey-Tests.** Ein realistischer Mehrschritt-Ablauf pro Kern-Rolle
  (anlegen → bearbeiten → freigeben → abschließen), inklusive Abbruch mitten im
  Ablauf und Wiederaufnahme. Prüft das Zusammenspiel der Module und die
  Zustands-Konsistenz zwischen den Schritten — nicht einzelne Formulare.
  Minimum: eine Journey je Kern-Rolle.
- **Misbehavior-Simulation.** Systematisch pro Modul absichtliches Fehlverhalten
  durchspielen: leere Submits, überlange Eingaben, XSS-/Injection-Payloads,
  Doppel-Submit, unautorisierte Zugriffe. Bündelt die Querschnitts-Checks als
  wiederholbaren Sweep über alle Module statt als Einzelfälle.
- **Monkey-/Chaos-Testing.** Zufällige Interaktionen (Klicks, Eingaben,
  Navigation), gern unter Last, ohne definierte Erwartung pro Schritt. Einzige
  Assertions: kein 5xx, keine unbehandelten JS-Fehler, App bleibt bedienbar.
  Destruktiv — läuft als letzter Test der Suite und nie gegen geteilte Daten,
  auf die andere Tests noch bauen.

Reihenfolge nach Schutzwirkung: Journeys zuerst, dann Misbehavior je Modul,
Monkey erst wenn die Suite stabil läuft (ein flakiger Monkey-Test erzeugt nur
Rauschen).

### Priorisierung, wenn die Lücke groß ist
1. Regression für gerade gefundene/gebaute Bugs (frisch, oft 0 Coverage).
2. Sicherheitskritische Null-Coverage-Zonen (Autorisierung, CSRF, Session,
   Upload, IDOR).
3. Domänen-Kernlogik mit Grenzwerten.
4. Restliche Form-Matrix, Pagination, Empty-States, A11y.
5. Verhaltens-Tests: Journeys je Rolle, dann Misbehavior-Sweep, Monkey zuletzt.

(Konkretes Test-Framework, Browser-Runner und Seed/Cleanup-Werkzeug: Stack-Adapter.)

## Matrix über das Formular hinaus

Das **Ein-Feld-falsch-Prinzip** der Formular-Matrix (oben; volle Regel im
Instruktions-Standard AGENTS.md → „Testing — Pflichtstandard Edge Cases") gilt für
**jede aufzählbare Eingabe-/Zustandsmenge**, nicht nur für UI-Formulare. Drei
hochwirksame Anwendungen — je auf der richtigen Schicht, exakte Erwartung je Zelle,
Happy Path zuletzt:

### 1. API-/HTTP-Payload-Matrix (Durchstich, nicht Browser)
Eine Schicht unter dem Formular und das **echte** Gate: Client-Validierung ist
umgehbar, der HTTP-Endpoint nicht. Über Body-Felder + Query + relevante Header
rotieren — genau eins falsch (fehlend, falscher Typ, Grenzwert, ungültiges Enum),
Rest gültig. Assert: exakter Status (400/422) UND exakter Fehler-Body/Feldpfad,
plus **kein** geschriebener Zustand (Zustands-Assertion wie beim Durchstich). Dazu
die Payload-eigenen Grenzfälle: unbekanntes Feld (ignoriert/abgelehnt je Contract),
falscher `Content-Type`, leerer Body, überzählige/verschachtelte Struktur.

### 2. Autorisierungs-Matrix (Rolle × Route/Aktion)
Echte 2D-Matrix: jede Rolle (inkl. anonym) gegen jede geschützte Route/Aktion. Je
Zelle erlaubt (2xx) / verboten (403) / nicht eingeloggt → Login (401). Fremd-Objekt
(IDOR) als eigene Achse: A greift auf Ressource von B → 403/404, nie 200.

| Rolle ↓ / Route → | GET /x | POST /x | DELETE /x/{fremd} |
|---|---|---|---|
| anonym | 401 | 401 | 401 |
| user  | 200 | 403 | 403 |
| admin | 200 | 200 | 404 (fremd) / 200 (eigen) |

Keine Zelle „ist eh eingeloggt" annehmen — jede explizit geprüft. Macht GUARDRAILS.md
Regel 4 (Authz) mechanisch.

### 3. Zustandsübergangs-Matrix (Zustand × Event)
Je erlaubtem Zustand jedes mögliche Event: legaler Zielzustand ODER Ablehnung +
**Zustand unverändert**. Illegale Übergänge sind ein häufiger versteckter Bug
(doppelte Freigabe, Aktion auf abgeschlossenem/storniertem Objekt). Idempotente
Wiederholung und gleichzeitige Doppel-Aktion (nur einmal wirksam) sind eigene Zellen.

| Zustand ↓ / Event → | submit | approve | cancel |
|---|---|---|---|
| draft    | → pending | reject | → cancelled |
| pending  | reject | → approved | → cancelled |
| approved | reject | reject (idempotent) | reject |

„reject" heißt: Fehler + Zustand bleibt — **kein stiller No-Op, der wie Erfolg
aussieht**.

(Konkrete Syntax für datengetriebene Matrizen — z. B. Dataset/DataProvider:
Stack-Adapter.)

## Wichtig
- Tests aus den Akzeptanzkriterien ZUERST schreiben, dann Code.
- Tests niemals manipulieren, damit sie grün werden, ohne dass der Code stimmt.
  Ist ein Test schwer zu schreiben, ist meist das Design das Problem.
- Keine parallelen Test-Suites gegen einen geteilten Datastore — sequenziell,
  sonst Kollisionen/Deadlocks/Falschfehler.
