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
- `php-cs-fixer` bzw. `pint` (Laravel) — Formatierung (Prüfmodus im Gate),
- `pest`/`phpunit` — die Tests.

In `composer.json` als `quality`-Script definieren. Erst wenn es sauber
durchläuft, gilt "fertig".

**Formatter auf Bestandsprojekten.** Ein Repo, das nie durch den Formatter lief,
meldet beim ersten `--dry-run`/`--test` hunderte Verstöße in fremden Dateien.
Das setzt die Regel aus AGENTS.md → "Surgical Changes" nicht außer Kraft, es
verschiebt nur den Umfang: den eigenen Diff prüfen und sauber halten, das Repo
nicht. Konkret:

```
vendor/bin/pint --dirty --test          # nur uncommittete Dateien, prüft nur
vendor/bin/pint --dirty                 # dieselben Dateien, schreibt
vendor/bin/pint --diff=main --test      # alles seit Abzweig von main
```

`--dirty`/`--diff` gehören ins Gate solange das Repo nicht konform ist; erst
nach einem freigegebenen Sweep ist der repo-weite Lauf sinnvoll. Achtung: der
Formatter formatiert immer **ganze Dateien**, nicht nur geänderte Zeilen — bei
einer kleinen Änderung in einer stark abweichenden Bestandsdatei bläht `--dirty`
den Diff also trotzdem auf. Dann die Format-Änderung dieser Datei als eigenen
Commit vor die inhaltliche Änderung setzen.

Gibt es eine UI mit eigener Logik, kommt der **E2E-Lauf als zweites, eigenes Gate**
dazu (langsamer, daher getrennt vom schnellen `quality`): ein Befehl wie
`npm run e2e` / `make test-e2e`, der **in allen konfigurierten Engines (Chromium
UND Firefox) grün** sein muss. "Fertig" heißt: beide Gates grün.

---

## Das Bring-up-/Run-Kommando (konkretisiert AGENT_LOOP.md → Voraussetzungen)

Ein **einzelnes reproduzierbares Kommando**, das die App lokal in einen prüfbaren
Zustand bringt (Dev-Server + Test-DB), damit eine frische Session sichtbares
Verhalten End-to-End beobachten kann — nicht nur Unit-Tests:

```
make up      # oder: docker compose up -d && php artisan serve
```

Zweck (nach Anthropics Long-Running-Harness, `init.sh`-Pattern): Jeder Folge-Lauf
fährt damit in Sekunden hoch und kann einen **Smoke-Durchstich** absetzen, bevor
er neue Arbeit beginnt (siehe AGENT_LOOP.md → Session-Start-Health-Check). Das
Kommando ist idempotent (mehrfach aufrufbar) und räumt bei Bedarf sauber ab.

**Readiness konkret (Web/PHP):** ein `/health`- (oder `/up`-)Endpoint, den der
Smoke pollt, bis er 200 liefert — kein fester Sleep:

```
until curl -fsS http://localhost:8000/health >/dev/null; do sleep 0.5; done
curl -fsS http://localhost:8000/tasks/1 | grep -q '"status"'   # ein Durchstich
```

Laravel bringt `/up` bereits mit; sonst eine schlanke Route, die DB-Verbindung
und Migrations-Stand prüft. Erst wenn der Poll grün ist, beginnt neue Arbeit.

---

## UI-Konsistenz (konkretisiert GUARDRAILS.md G)

Gilt, sobald das Projekt eine UI mit eigenen Komponenten hat (Blade/Livewire/
Filament, ggf. + Tailwind).

- **Kanonische Komponenten:** wiederverwendbare Blade-Components (`<x-button>`,
  `<x-table>`, `<x-modal>`, `<x-field>`) in `resources/views/components/` — bzw. das
  UI-Kit des Projekts. Vor neuem Markup dort nachsehen; kein zweiter Button aus
  rohem `<button class="…">`, wenn `<x-button>` existiert.
- **Tokens/Skala:** die eine Quelle ist die `theme`-Sektion in `tailwind.config.js`
  (Farben, Spacing, Radien, Schrift) — bzw. zentrale CSS-Custom-Properties. Keine
  Inline-`style="…"`, kein Hex direkt im Markup; Abstände/Höhen über die
  Utility-/Token-Skala, nicht als Einzelfall-`px`.
- **`DESIGN.md` als Token-Quelle (GUARDRAILS G/Regel 7):** liegt eine `DESIGN.md`
  im Repo-Root, ist sie die normative Quelle. Der Validator ist node-basiert (setzt
  ein vorhandenes Node/`npx` voraus — bei Laravel für den Asset-Build ohnehin da):
  `npx @google/design.md lint DESIGN.md` vor UI-Write bzw. in den Asset-Build hängen.
  **Achtung Exit-Code:** strukturelle Fehler → Exit 1, aber ein **Kontrast-Verstoß
  kommt nur als `warning` (Exit bleibt 0)** — verifiziert. Exit 0 heißt also *nicht*
  „Kontrast ok"; die `findings` lesen und Kontrast-Warnungen als blockierend
  behandeln. Tailwind aus ihr generieren statt Werte doppeln:
  `npx @google/design.md export --format css-tailwind DESIGN.md`
  (v4) bzw. `--format json-tailwind` (v3) — so bleibt `tailwind.config` deriviert.
- **Check (Selbstcheck vor "fertig"):** in geänderten Views grep auf `style="`,
  Inline-Hex (`#[0-9a-fA-F]{3,6}`) und rohe `<button`/`<table`-Blöcke, die eine
  vorhandene `<x-…>`-Komponente nachbauen — jeder Treffer ist ein Finding (Regel 6/7).

Neuer geteilter Baustein nötig → **eine** neue Component/Token-Stufe anlegen, die
zur Quelle wird; nicht pro Seite kopieren.

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

### Matrizen datengetrieben (konkretisiert TESTS.md → "Matrix über das Formular hinaus")

Die API-Payload-, Authz- (Rolle × Route) und Zustandsübergangs-Matrix werden als
**Pest-Dataset** (bzw. PHPUnit `@dataProvider`) geschrieben — eine Zeile je Zelle,
nicht N kopierte Testmethoden. Der Testrumpf setzt den Durchstich ab, das Dataset
liefert die Zeilen samt erwartetem Ergebnis:

```php
// API-Payload: genau ein Feld falsch, Rest gültig
it('lehnt ungültige Anlage ab', function (array $override, int $status, string $feld) {
    $payload = [...validPayload(), ...$override];         // ein Feld überschrieben
    $response = $this->postJson('/api/v1/tasks', $payload);
    expect($response->getStatusCode())->toBe($status);    // exakter Status
    expect($response->json("errors.$feld"))->not->toBeEmpty();
    expect($this->db->count('tasks'))->toBe(0);           // KEIN Zustand geschrieben
})->with([
    'title fehlt'   => [['title' => null], 422, 'title'],
    'title zu lang' => [['title' => str_repeat('x', 300)], 422, 'title'],
    'status Enum'   => [['status' => 'bogus'], 422, 'status'],
]);

// Authz Rolle × Route: eine Zeile je Zelle → erwarteter HTTP-Status
it('erzwingt Berechtigung', function (string $rolle, string $method, string $uri, int $status) {
    actingAsRole($rolle);
    expect($this->call($method, $uri)->getStatusCode())->toBe($status);
})->with([
    ['anonym', 'GET',    '/api/v1/tasks',   401],
    ['user',   'POST',   '/api/v1/tasks',   403],
    ['user',   'DELETE', '/api/v1/tasks/99', 403],   // fremdes Objekt (IDOR)
    ['admin',  'POST',   '/api/v1/tasks',   201],
]);
```

Der Zustandsübergang analog: Dataset `[$startZustand, $event, $zielOderNull]`, im
Rumpf Startzustand seeden, Event absetzen, dann End-Zustand in der DB prüfen — bei
`reject` explizit, dass der Zustand **unverändert** ist. Jede Matrix-Zeile ist so
einzeln benannt und einzeln rot/grün.

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
