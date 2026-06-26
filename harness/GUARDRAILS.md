# Guardrails — die harten Regeln

Diese Regeln gelten **immer**, in jeder Phase, bei jedem Schreibvorgang. Sie sind
die Substanz, die früher in Hook-Skripten (`critic.sh`, `quality-gate.sh`)
steckte — hier als Anleitung, die der Agent selbst anwendet: vor jedem Schreiben
(Selbst-Critic) und vor jeder Fertig-Meldung (Fertig-Kriterium).

Wenn du als Agent gegen eine dieser Regeln verstoßen würdest: nicht schreiben,
sondern korrigieren. Wenn eine Regel fehlt, die einen Fehler verhindert hätte:
ergänze sie hier vor (Harness Correction Development).

---

## A. Architektur-Reinheit (vor jedem Write/Edit prüfen)

Die Schichten sind: `Domain → Service (Use Case) → Infrastructure / Action`.
Abhängigkeiten zeigen nur nach innen.

### Regel 1 — Die Domain bleibt rein
Dateien unter `src/Domain/` dürfen **nicht** enthalten:
- Framework- oder PSR-Importe (`use Slim\…`, `use Psr\…`),
- Importe aus `App\Infrastructure\…`,
- direkten DB-Zugriff (`new PDO`, `$pdo`, `->query(`).

Technische Details gehören nach `src/Infrastructure/`. Die Domain arbeitet nur
gegen Repository-**Interfaces**.

### Regel 2 — Actions greifen nicht direkt auf Persistenz zu
Dateien unter `src/Action/` dürfen **nicht** direkt `App\Infrastructure\…` oder
PDO (`new PDO`, `$pdo`, `->query(`) nutzen. Eine Action ruft einen Service / Use
Case auf; die Persistenz läuft über den DI-Container.

Wenn du beim Schreiben merkst, dass du eine dieser Regeln brechen müsstest, ist
das ein Design-Signal: die Verantwortung liegt in der falschen Schicht.

---

## B. Datenschutz — Daten Minderjähriger (hart)

Diese App verarbeitet Daten von Jugendlichen. Datenschutz ist nicht verhandelbar.

### Regel 3 — Keine echt wirkenden personenbezogenen Daten in Tests/Fixtures/Seeds
Dateien unter `tests/`, `fixtures/` oder mit `seed` im Namen enthalten
**ausschließlich synthetische** Daten:
- Niemals echte oder realistische Klarnamen, Geburtsdaten, Adressen
  tatsächlicher Personen.
- Nutze Faker o. Ä. oder offensichtliche Platzhalter ("Jugendlicher A",
  "Betreuer 1").
- Kein echtes Geburtsdatum-Muster (`TT.MM.JJJJ`) neben Namens-/Geburtsfeldern.
- Keine echten Produktions-Datenexporte als Testbasis.

Warnsignal: Felder wie `geburtsdatum` / `geboren am` zusammen mit einem
realistischen Datum → stoppen, durch synthetische Werte ersetzen.

---

## C. Das Fertig-Kriterium (vor jeder Fertig-Meldung)

> Du bewertest deine Arbeit nicht selbst.

Eine Aufgabe gilt **nicht** als fertig, weil du sie für gut hältst, sondern erst,
wenn das Quality Gate grün ist:

```
composer quality
```

(bündelt `deptrac` + `phpstan` + `php-cs-fixer` + die Tests).

Solange das Gate rot ist:
- Beheben statt beenden. **Die Ursache** fixen, nicht das Symptom.
- Keine Suppressions, keine Test-Manipulation, damit es grün aussieht.
- Wenn der Fehler zeigt, dass eine Harness-Regel fehlte: passende Regel hier oder
  in der projektnächsten `CLAUDE.md` ergänzen, dann erneut laufen lassen.

Erst wenn `composer quality` sauber durchläuft, darfst du "fertig" melden.

---

## D. Grenze zum Menschen

Der Loop automatisiert Bauen und Prüfen. **Merge und Deploy auf den Pi bleiben
beim Menschen.** Bei einer App mit Daten von Minderjährigen ist das nicht
verhandelbar (siehe [ROADMAP.md](ROADMAP.md), Phase 5). Der Agent bereitet vor,
der Mensch gibt frei.
