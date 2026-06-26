# Tests — Akzeptanzkriterien in ausführbarer Form

Tests sind die ausführbare Form der Akzeptanzkriterien. Sie sind das Gate, das
entscheidet, ob ein Feature fertig ist — nicht deine Selbsteinschätzung (siehe
[GUARDRAILS.md](GUARDRAILS.md), Abschnitt C).

## Framework & Struktur
- Pest (oder PHPUnit). Struktur: Arrange – Act – Assert.
- EIN Akzeptanzkriterium = mindestens EIN Test mit sprechendem Namen.
- Unit-Tests für die Domain (schnell, ohne DB).
- Integrationstests für Repositories/Use Cases gegen eine echte MariaDB
  (lokal via Docker).

## Datenschutz in Testdaten — hart
- Fixtures und Seeds enthalten AUSSCHLIESSLICH synthetische, generierte Daten.
- NIEMALS echte oder realistische Klarnamen, Geburtsdaten, Adressen von
  tatsächlichen Personen. Nutze Faker o. Ä. oder offensichtliche Platzhalter
  ("Jugendlicher A", "Betreuer 1").
- Keine echten Datenexporte aus der Produktion als Testbasis.

(Vollständige Datenschutz-Regel: GUARDRAILS.md, Regel 3.)

## Spec-Driven: so wird aus einem Akzeptanzkriterium ein Test
Akzeptanzkriterium aus der Feature-Spec:
> AC2: Eine bereits abgeschlossene Aufgabe kann nicht erneut Punkte geben.

wird zu:
```php
it('vergibt keine Punkte fuer eine bereits abgeschlossene Aufgabe', function () {
    // Arrange: Aufgabe als abgeschlossen vorbereiten
    // Act: AwardPointsForTask erneut ausfuehren
    // Assert: erwartet TaskAlreadyCompletedException, Punktestand unveraendert
});
```

## API-Tests — der wichtigste Testtyp für diese App

Neben Unit-Tests (Domain) gibt es API-Tests: der HTTP-Durchstich durch die ganze
Slim-App. Ein echter Request geht rein, eine echte Response kommt raus, gegen
eine echte Test-MariaDB. Das ist der Test, der prüft, was ein Nutzer (oder ein
späterer KI-Agent über die API) tatsächlich erlebt — nicht nur eine isolierte
Klasse.

Jeder API-Test prüft ZWEI Ebenen, nicht nur eine:

1. **Die Response.** Status-Code und Body korrekt? (z. B. `POST /tasks/{id}/complete`
   liefert 200 und den neuen Punktestand.)
2. **Den Datenbank-Zustand.** Hat die Operation die Daten wirklich richtig
   persistiert? Nach dem Request direkt in der Test-DB nachsehen: Ist der
   Punktestand in der Tabelle tatsächlich erhöht? Ein grüner Response-Check allein
   reicht NICHT — der häufigste versteckte Bug ist eine korrekte Antwort bei
   falschem DB-Zustand.

Warum diese Schärfe: Ein Test, der nur die Response prüft, übersieht, ob im
Hintergrund Müll geschrieben wurde. Erst die Kombination aus Response-Assertion
UND DB-Assertion gibt echte Sicherheit.

Beispiel-Form (Pest, gegen die laufende App):
```php
it('schreibt den Punktestand korrekt in die Datenbank', function () {
    // Arrange: Aufgabe + Jugendlichen mit 0 Punkten in der Test-DB anlegen
    // Act: echten HTTP-Request absetzen
    $response = $this->post("/tasks/{$taskId}/complete");

    // Assert 1 — Response
    expect($response->getStatusCode())->toBe(200);

    // Assert 2 — DB-Zustand (NICHT vergessen!)
    $points = $this->db->query(
        "SELECT points FROM point_accounts WHERE youth_id = ?", [$youthId]
    );
    expect($points)->toBe(10);
});
```

Bewusst NICHT in diesem Projekt: UI-/Browser-Tests und das Mocken externer
Dienste (WireMock o. Ä.) — deine App hat keine externen Service-Aufrufe. Halte
die Teststrategie auf das reduziert, was hier echten Schutz bringt: Unit (Domain)
+ API (Durchstich mit DB-Assertion).

## Wichtig
- Schreibe die Tests aus den Akzeptanzkriterien ZUERST, dann den Code.
- Manipuliere niemals Tests, damit sie grün werden, ohne dass der Code stimmt.
  Wenn ein Test schwer zu schreiben ist, ist meist das Design das Problem.
