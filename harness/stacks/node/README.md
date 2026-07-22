# Stack-Adapter: Node/TypeScript (Web + relationale DB)

Füllt die generelle Harness-Methode (`../../`) mit den konkreten Werten für
Node-Webanwendungen mit relationaler Datenbank. **Framework-neutral**: gilt für
Express, Fastify, NestJS oder pures Node — das Framework prägt nur den
Einstiegspunkt (Routing/Handler) und das Wiring, nicht die Methode. Wo es relevant
wird, ist es unten benannt. TypeScript ist der Default; für pures JS entfallen nur
die Typprüfungs-Schritte.

Lies erst die generellen Dateien, dann diesen Adapter.

---

## Schichten (konkretisiert GUARDRAILS.md A)

```
src/domain/  →  src/service/ (Use Case)  →  src/infrastructure/  →  Einstiegspunkt
```
Einstiegspunkt je Framework: Express/Fastify `route handler`, NestJS `Controller`,
CLI `command`. Abhängigkeiten zeigen nur nach innen.

### Regel 1 — Die Domain bleibt rein
`src/domain/` enthält **keine** Framework-Importe, keine Importe aus
`infrastructure`, keinen direkten DB-/Netzwerk-Zugriff. Sie arbeitet nur gegen
Repository-**Interfaces** (TS `interface`/`type`); technische Details liegen in
`src/infrastructure/`.
Importe, die hier nichts verloren haben: `express`, `fastify`, `@nestjs/*`,
`typeorm`, `@prisma/client`, `knex`, `pg`, `mysql2`, `mongoose`, `node:fs`,
`node:http`. Faustregel: nichts, was I/O, Transport oder ein Framework mitbringt.

### Regel 2 — Einstiegspunkte greifen nicht direkt auf Persistenz zu
Route-Handler/Controller dürfen nicht direkt `infrastructure`, einen DB-Client
oder ORM nutzen. Sie rufen einen Service/Use Case auf; Persistenz läuft über
Dependency Injection (Konstruktor-Injektion / DI-Container, NestJS `providers`).
Keine Query-Logik im Handler.

---

## Datenbank-Layout & Migrations

- Schema **ausschließlich** über versionierte Migrations (Knex, Drizzle, Prisma
  Migrate, TypeORM Migrations) — kein manuelles Ändern der DB.
- Jede Migration ist reversibel (`down()` bzw. eine dokumentierte Gegen-Migration).
  Keine destruktive Migration ohne Backup-Hinweis im Review.
- API-Routen versioniert (`/api/v1/…`).
- Secrets/Zugangsdaten nur aus `.env` (via `process.env`, z. B. `dotenv`/`env`-
  Schema-Validierung) — nie im Code oder in Migrations.

---

## Sensible Daten — projektspezifisches Beispiel (verschärft GUARDRAILS.md B)

Wenn die Domäne besonders schützenswerte Daten enthält (Beispiel: Daten
Minderjähriger), zusätzlich zur generellen Regel 3:
- Kein echtes Geburtsdatum-Muster neben Namens-/Geburtsfeldern.
- Warnsignal `geburtsdatum` / `dateOfBirth` + realistisches Datum → stoppen,
  durch synthetische Werte ersetzen (Faker mit festem Seed oder klare Platzhalter
  wie "Jugendlicher A").

Diesen Abschnitt pro Projekt an die tatsächliche Datensensibilität anpassen.

---

## Das Gate-Kommando (konkretisiert GUARDRAILS.md C)

```
npm run quality
```
bündelt (als `quality`-Script in `package.json`):
- `depcruise --config .dependency-cruiser.js src` — Schicht-/Abhängigkeitsstruktur
  (das `deptrac`-Äquivalent; verbotene Kanten domain→infrastructure etc. als
  `forbidden`-Regeln, Lauf schlägt bei Verstoß fehl),
- `tsc --noEmit` — statische Typanalyse,
- `eslint .` — Lint (inkl. `import/no-restricted-paths` als zweite Schicht-Grenze),
- `prettier --check .` — Formatierung,
- `vitest run` (oder `jest`) — die Tests.

Erst wenn es sauber durchläuft, gilt "fertig".

Gibt es eine UI mit eigener Logik, kommt der **E2E-Lauf als zweites, eigenes Gate**
dazu (langsamer, daher getrennt vom schnellen `quality`): `npm run e2e`, der **in
allen konfigurierten Engines (Chromium UND Firefox) grün** sein muss. "Fertig"
heißt: beide Gates grün.

---

## Das Bring-up-/Run-Kommando (konkretisiert AGENT_LOOP.md → Voraussetzungen)

Ein **einzelnes reproduzierbares Kommando**, das die App lokal in einen prüfbaren
Zustand bringt (Dev-Server + Test-DB), damit eine frische Session sichtbares
Verhalten End-to-End beobachten kann — nicht nur Unit-Tests:

```
npm run dev      # oder: docker compose up -d && npm run start:dev
```

Zweck (nach Anthropics Long-Running-Harness, `init.sh`-Pattern): Jeder Folge-Lauf
fährt damit in Sekunden hoch und kann einen **Smoke-Durchstich** absetzen, bevor
er neue Arbeit beginnt (siehe AGENT_LOOP.md → Session-Start-Health-Check). Das
Kommando ist idempotent (mehrfach aufrufbar) und räumt bei Bedarf sauber ab.

**Readiness konkret (Web/Node):** ein `/health`-Endpoint, den der Smoke pollt, bis
er 200 liefert — kein fester Sleep:

```
until curl -fsS http://localhost:3000/health >/dev/null; do sleep 0.5; done
curl -fsS http://localhost:3000/api/v1/tasks/1 | grep -q '"status"'   # ein Durchstich
```

Der `/health`-Handler prüft DB-Verbindung und Migrations-Stand. Erst wenn der Poll
grün ist, beginnt neue Arbeit.

---

## Tests (konkretisiert TESTS.md)

- **Framework:** Vitest (oder Jest), Arrange–Act–Assert.
- **Unit-Tests** für die Domain — schnell, ohne DB.
- **Integrations-/Durchstich-Tests** gegen eine echte relationale Test-DB
  (Postgres/MySQL, lokal via Docker). Keine parallelen Suites gegen dieselbe DB
  (`vitest --no-file-parallelism` bzw. `--pool=forks --poolOptions.forks.singleFork`).

Der **HTTP-Durchstich** ist der wichtigste Test: echter Request durch die App
(via `supertest`/`fetch` gegen die laufende App) gegen die Test-DB, prüft beide
Ebenen (Response UND DB-Zustand):

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/infrastructure/db';

it('schreibt den Punktestand korrekt in die Datenbank', async () => {
  // Arrange: Datensatz in der Test-DB anlegen
  // Act: echten HTTP-Request absetzen
  const res = await request(app).post(`/api/v1/tasks/${taskId}/complete`);

  // Assert 1 — Response
  expect(res.status).toBe(200);

  // Assert 2 — DB-Zustand (NICHT vergessen!)
  const { rows } = await db.query(
    'SELECT points FROM point_accounts WHERE youth_id = $1', [youthId],
  );
  expect(rows[0].points).toBe(10);
});
```

Minimum: Unit (Domain) + Durchstich (mit DB-Assertion). Browser-/E2E-Tests nur bei
UI mit eigener Logik; Mocking nur für echte externe Service-Aufrufe.

### E2E / Browser (konkretisiert TESTS.md → "E2E / Browser")

- **Runner:** Playwright, ein Projekt je Engine — Tests grün in **Chromium UND
  Firefox**, nicht nur einer.
- **Selektoren:** über `getByTestId`/Rollen, nie über CSS-Position oder
  Textfragmente. Deterministisch warten (`expect(locator).toBeVisible()`,
  `waitForURL`), **nie** feste `waitForTimeout`-Sleeps.
- **Daten:** pro Spec/Namespace seeden und in **FK-sicherer Reihenfolge** wieder
  abräumen (Kinder vor Eltern). **Keine parallelen Specs gegen dieselbe Test-DB**
  — mit **`workers: 1`** sequenziell konfigurieren. Nur das garantiert volle
  Sequenzialität; `fullyParallel: false` allein reicht nicht.
- **Diagnose:** `trace: 'retain-on-failure'` + `screenshot: 'only-on-failure'` in
  `playwright.config.ts` — sonst ist ein CI-Failure remote nicht reproduzierbar.
- **Readiness:** `webServer`-Block (`command` + `url` +
  `reuseExistingServer: !process.env.CI`) — der Lauf wartet auf den App-Start,
  statt gegen einen noch toten Server zu rennen.
- **Login-State:** einmalig per `globalSetup` + `storageState` erzeugen und je Test
  via `use: { storageState }` wiederverwenden.
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
**`it.each`/`test.each`-Dataset** geschrieben — eine Zeile je Zelle, nicht N
kopierte Testmethoden. Der Testrumpf setzt den Durchstich ab, das Dataset liefert
die Zeilen samt erwartetem Ergebnis:

```ts
// API-Payload: genau ein Feld falsch, Rest gültig
it.each([
  { name: 'title fehlt',   override: { title: null },                 status: 422, feld: 'title'  },
  { name: 'title zu lang', override: { title: 'x'.repeat(300) },      status: 422, feld: 'title'  },
  { name: 'status Enum',   override: { status: 'bogus' },             status: 422, feld: 'status' },
])('lehnt ungültige Anlage ab: $name', async ({ override, status, feld }) => {
  const payload = { ...validPayload(), ...override };        // ein Feld überschrieben
  const res = await request(app).post('/api/v1/tasks').send(payload);
  expect(res.status).toBe(status);                          // exakter Status
  expect(res.body.errors?.[feld]).toBeTruthy();
  const { rows } = await db.query('SELECT count(*)::int AS n FROM tasks');
  expect(rows[0].n).toBe(0);                                // KEIN Zustand geschrieben
});

// Authz Rolle × Route: eine Zeile je Zelle → erwarteter HTTP-Status
it.each([
  ['anonym', 'get',    '/api/v1/tasks',    401],
  ['user',   'post',   '/api/v1/tasks',    403],
  ['user',   'delete', '/api/v1/tasks/99', 403],   // fremdes Objekt (IDOR)
  ['admin',  'post',   '/api/v1/tasks',    201],
] as const)('erzwingt Berechtigung: %s %s %s', async (rolle, method, uri, status) => {
  const res = await request(app)[method](uri).set(authHeaderFor(rolle));
  expect(res.status).toBe(status);
});
```

Der Zustandsübergang analog: Dataset `[startZustand, event, zielOderNull]`, im
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
1. **Domain:** `Reward`, `RewardCost` (Value Object), Regel "Saldo nicht negativ"
   in `PointAccount.redeem()` + Unit-Tests für AC1/AC2.
2. **Service:** `RedeemReward` Use Case + Test (Berechtigung AC3).
3. **Infrastructure:** `PgRewardRepository` (implementiert das Domain-Interface) +
   Integrationstest.
4. **Einstiegspunkt:** `POST /api/v1/rewards/:id/redeem` + Durchstich-Test
   (Response + DB-Saldo).

---

## Deploy-Strecke (konkretisiert GUARDRAILS.md D)

Das Gate beendet den Agent-Loop — die Strecke dahinter muss trotzdem definiert
sein, sonst endet „fertig" beim grünen Gate statt beim laufenden System. Pro
Projekt festlegen (Platzhalter füllen):

| Baustein | Vorgabe |
|---|---|
| **Ziele** | eine Testumgebung + eine Produktionsumgebung (`<test-url/host>`, `<prod-url/host>`) |
| **Artefakt** | versioniertes Build-Artefakt, empfohlen: Container-Image (`node:lts`-basiert, `npm ci --omit=dev`), Tag = Commit/Release, in eigener Registry |
| **Weg** | **Pull durch die Zielmaschine** (z. B. Watchtower/`compose pull`) statt SSH-Push aus der CI — kein Runner-Key, der auf die Produktionsmaschine zeigt |
| **Stufen** | Test: automatisch nach grünem Gate. Prod: manuell ausgelöst — der Mensch gibt frei (GUARDRAILS D) |
| **Rollback** | vorheriges Image-Tag bleibt verfügbar, Rollback-Kommando dokumentiert und einmal geprobt; Migrations reversibel (siehe oben) |

Solange die Tabelle im Projekt nicht gefüllt ist, gilt die Deploy-Strecke als
**offen** und wird bei der Fertig-Meldung als Lücke benannt.

## Grenze zum Menschen (konkretisiert GUARDRAILS.md D)
Merge und Deploy bleiben beim Menschen. Bei sensibler Domäne den Punkt, ab dem
ohne Mitlesen freigegeben wird, deutlich später ansetzen.

## Specs-Ablage
Fertige Specs unter `specs/<feature-slug>.md`.
