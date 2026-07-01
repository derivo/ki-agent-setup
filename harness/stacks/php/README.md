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

Gibt es eine UI mit eigener Logik, kommt der **E2E-Lauf als zweites, eigenes Gate**
dazu (langsamer, daher getrennt vom schnellen `quality`): ein Befehl wie
`npm run e2e` / `make test-e2e`, der **in allen konfigurierten Engines (Chromium
UND Firefox) grün** sein muss. "Fertig" heißt: beide Gates grün.

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

Minimum: Unit (Domain) + Durchstich (mit DB-Assertion). Browser-/E2E-Tests nur bei
UI mit eigener Logik; Mocking nur für echte externe Service-Aufrufe.

### E2E / Browser (konkretisiert TESTS.md → "E2E / Browser")

- **Runner:** Playwright, ein Projekt je Engine — Tests grün in **Chromium UND
  Firefox**, nicht nur einer.
- **Selektoren:** über `data-testid`/Rollen, nie über CSS-Position oder
  Textfragmente. Deterministisch warten (`expect(locator).toBeVisible()`,
  `waitForURL`), **nie** feste `waitForTimeout`-Sleeps.
- **Daten:** pro Spec/Namespace seeden und in **FK-sicherer Reihenfolge** wieder
  abräumen (Kinder vor Eltern: erst Bewegungsdaten, dann Stammdaten). **Keine
  parallelen Specs gegen dieselbe Test-DB** — mit **`workers: 1`** sequenziell
  konfigurieren. Nur das garantiert volle Sequenzialität; `fullyParallel: false`
  allein reicht nicht (lässt Dateien weiter parallel über mehrere Worker laufen).
- **Diagnose:** `trace: 'retain-on-failure'` + `screenshot: 'only-on-failure'` in
  `playwright.config.ts` — sonst ist ein CI-Failure remote nicht reproduzierbar.
  (`on-first-retry` zeichnet nichts auf, solange `retries: 0` bleibt.)
- **Readiness:** `webServer`-Block (`command` + `url` +
  `reuseExistingServer: !process.env.CI`) — der Lauf wartet auf den App-Start,
  statt gegen einen noch toten Server zu rennen.
- **Login-State:** einmalig per `globalSetup` + `storageState` erzeugen und je Test
  via `use: { storageState }` wiederverwenden — kein wiederholter Login-Flow als
  Flaky-Quelle.
- **Assertion auf den EXAKTEN deutschen Fehlertext**, nicht nur auf "Fehler
  vorhanden":

```ts
import { test, expect } from '@playwright/test';

test('E-Mail-Feld leer → exakte Fehlermeldung', async ({ page }) => {
  await page.goto('/register');
  // alle Pflichtfelder korrekt AUSSER E-Mail (genau EIN Feld falsch)
  await page.getByTestId('name').fill('Test Nutzer');
  await page.getByTestId('passwort').fill('korrektesPasswort1');
  await page.getByTestId('passwort-bestaetigung').fill('korrektesPasswort1');
  await page.getByTestId('agb').check();
  // E-Mail bewusst leer
  await page.getByTestId('submit').click();

  await expect(page.getByTestId('email-error'))
    .toHaveText('E-Mail-Adresse ist erforderlich');   // exakter Text, nicht /Fehler/
});
```

Pro Formular die volle Ein-Feld-falsch-Matrix rotieren, Keyboard-/Enter-Submit als
eigenen Test, Happy Path zuletzt. Querschnitt (Authz, CSRF, Session, Upload/IDOR,
XSS, Grenzwerte, State/Race, Pagination/Empty, A11y): Checkliste in TESTS.md.

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

## Deploy-Strecke (konkretisiert GUARDRAILS.md D)

Das Gate beendet den Agent-Loop — die Strecke dahinter muss trotzdem definiert
sein, sonst endet „fertig" beim grünen Gate statt beim laufenden System. Pro
Projekt festlegen (Platzhalter füllen):

| Baustein | Vorgabe |
|---|---|
| **Ziele** | eine Testumgebung + eine Produktionsumgebung (`<test-url/host>`, `<prod-url/host>`) |
| **Artefakt** | versioniertes Build-Artefakt, empfohlen: Container-Image, Tag = Commit/Release, in eigener Registry |
| **Weg** | **Pull durch die Zielmaschine** (z. B. Cron/Watchtower/`compose pull`) statt SSH-Push aus der CI — kein Runner-Key, der auf die Produktionsmaschine zeigt |
| **Stufen** | Test: automatisch nach grünem Gate. Prod: manuell ausgelöst — der Mensch gibt frei (GUARDRAILS D) |
| **Rollback** | vorheriges Image-Tag bleibt verfügbar, Rollback-Kommando dokumentiert und einmal geprobt; Migrations reversibel (siehe oben) |

Solange die Tabelle im Projekt nicht gefüllt ist, gilt die Deploy-Strecke als
**offen** und wird bei der Fertig-Meldung als Lücke benannt.

## Grenze zum Menschen (konkretisiert GUARDRAILS.md D)
Merge und Deploy bleiben beim Menschen. Bei sensibler Domäne den Punkt, ab dem
ohne Mitlesen freigegeben wird, deutlich später ansetzen.

## Specs-Ablage
Fertige Specs unter `specs/<feature-slug>.md`.
