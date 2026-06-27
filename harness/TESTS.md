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
(Kern) + Durchstich (mit Zustands-Assertion). Browser-/UI-Tests nur, wenn es eine
UI mit eigener Logik gibt.

## Wichtig
- Tests aus den Akzeptanzkriterien ZUERST schreiben, dann Code.
- Tests niemals manipulieren, damit sie grün werden, ohne dass der Code stimmt.
  Ist ein Test schwer zu schreiben, ist meist das Design das Problem.
- Keine parallelen Test-Suites gegen einen geteilten Datastore — sequenziell,
  sonst Kollisionen/Deadlocks/Falschfehler.
