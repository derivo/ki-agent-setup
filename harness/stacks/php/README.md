# Stack-Adapter: PHP (Web + relationale DB)

Füllt die generelle Harness-Methode (`../../`) mit den konkreten Werten für
PHP-Webanwendungen mit relationaler Datenbank. **Framework-neutral**: gilt für
Slim, Laravel, Symfony oder pures PHP — das Framework prägt nur den Einstiegspunkt
(Routing/Controller) und das Wiring, nicht die Methode. Wo es relevant wird, ist
es unten benannt.

Lies erst die generellen Dateien, dann diesen Adapter.

---

## Schichten (konkretisiert GUARDRAILS.md A)

```
src/Domain/  →  src/Service/ (Use Case)  →  src/Infrastructure/  →  Einstiegspunkt
```
Einstiegspunkt je Framework: Slim `Action`, Laravel/Symfony `Controller`, CLI
`Command`. Abhängigkeiten zeigen nur nach innen.

### Regel 1 — Die Domain bleibt rein
`src/Domain/` enthält **keine** Framework-/PSR-Importe, keine Importe aus
`Infrastructure`, keinen direkten DB-Zugriff (`new PDO`, `$pdo`, `->query(`,
Eloquent-/Doctrine-Modelle). Sie arbeitet nur gegen Repository-**Interfaces**;
technische Details liegen in `src/Infrastructure/`.
Framework-Namespaces, die hier nichts verloren haben: `Slim\…`, `Psr\…`,
`Illuminate\…`, `Symfony\…`, `Doctrine\…`.

### Regel 2 — Einstiegspunkte greifen nicht direkt auf Persistenz zu
Controller/Action dürfen nicht direkt `Infrastructure`, PDO oder ORM nutzen. Sie
rufen einen Service/Use Case auf; Persistenz läuft über den DI-Container.
Laravel-Hinweis: schlanke Controller, keine Query-Logik im Controller.

---

## Datenbank-Layout & Migrations

- Schema **ausschließlich** über versionierte Migrations (kein manuelles Ändern
  der DB).
- Jede Migration ist reversibel (`down()` / Doctrine `down`). Keine destruktive
  Migration ohne Backup-Hinweis im Review.
- API-Routen versioniert (`/api/v1/…`).
- Laravel: `$fillable`/`$guarded` bewusst setzen; Autorisierung über Policies/Gates.
- Secrets/Zugangsdaten nur aus `.env` — nie im Code oder in Migrations.

---

## Sensible Daten — projektspezifisches Beispiel (verschärft GUARDRAILS.md B)

Wenn die Domäne besonders schützenswerte Daten enthält (Beispiel: Daten
Minderjähriger in einer Wohngruppen-App), zusätzlich zur generellen Regel 3:
- Kein echtes Geburtsdatum-Muster (`TT.MM.JJJJ`) neben Namens-/Geburtsfeldern.
- Warnsignal `geburtsdatum` / `geboren am` + realistisches Datum → stoppen,
  durch synthetische Werte ersetzen ("Jugendlicher A", "Betreuer 1").

Diesen Abschnitt pro Projekt an die tatsächliche Datensensibilität anpassen.

---

## Das Gate-Kommando (konkretisiert GUARDRAILS.md C)

```
composer quality
```
bündelt:
- `deptrac` — Schicht-/Abhängigkeitsstruktur (`--fail-on-uncovered`),
- `phpstan` (Laravel: `larastan`) — statische Typanalyse,
- `php-cs-fixer` — Formatierung (`--dry-run --diff` im Gate),
- `pest`/`phpunit` — die Tests.

In `composer.json` als `quality`-Script definieren. Erst wenn es sauber
durchläuft, gilt "fertig".

---

## Tests (konkretisiert TESTS.md)

- **Framework:** Pest (oder PHPUnit), Arrange–Act–Assert.
- **Unit-Tests** für die Domain — schnell, ohne DB.
- **Integrations-/Durchstich-Tests** gegen eine echte relationale Test-DB
  (MariaDB/MySQL/Postgres, lokal via Docker). Keine parallelen Suites gegen
  dieselbe DB.

Der **HTTP-Durchstich** ist der wichtigste Test: echter Request durch die App
gegen die Test-DB, prüft beide Ebenen (Response UND DB-Zustand):

```php
it('schreibt den Punktestand korrekt in die Datenbank', function () {
    // Arrange: Datensatz in der Test-DB anlegen
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

Minimum: Unit (Domain) + Durchstich (mit DB-Assertion). Browser-/UI-Tests nur bei
UI mit eigener Logik; Mocking nur für echte externe Service-Aufrufe.

---

## Beispiel-Zerlegung (konkretisiert SPEC_WORKFLOW.md Stufe 3)

Feature "Belohnung einlösen", Akzeptanzkriterien:
- AC1: genug Punkte → Belohnung einlösbar, Saldo sinkt um den Wert.
- AC2: zu wenig Punkte → Einlösen schlägt fehl, Saldo bleibt.
- AC3: nur eine berechtigte Rolle bestätigt das Einlösen.

Zerlegung (innen → außen):
1. **Domain:** `Reward`, `RewardCost` (VO), Regel "Saldo nicht negativ" in
   `PointAccount.redeem()` + Unit-Tests für AC1/AC2.
2. **Service:** `RedeemReward` Use Case + Test (Berechtigung AC3).
3. **Infrastructure:** `PdoRewardRepository` (oder Eloquent/Doctrine) +
   Integrationstest.
4. **Einstiegspunkt:** `POST /rewards/{id}/redeem` + Durchstich-Test
   (Response + DB-Saldo).

---

## Grenze zum Menschen (konkretisiert GUARDRAILS.md D)
Merge und Deploy bleiben beim Menschen. Bei sensibler Domäne den Punkt, ab dem
ohne Mitlesen freigegeben wird, deutlich später ansetzen.

## Specs-Ablage
Fertige Specs unter `specs/<feature-slug>.md`.
