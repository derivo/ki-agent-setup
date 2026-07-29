> **Tier 1 — immer, wenn das Projekt dieser Stack ist.** Zusammen mit
> [`../../GUARDRAILS.md`](../../GUARDRAILS.md). Die anderen Adapter werden **nicht**
> gelesen.

# Stack-Adapter: Python (Web + relationale DB)

Füllt die generelle Harness-Methode (`../../`) mit den konkreten Werten für
Python-Webanwendungen mit relationaler Datenbank. **Framework-neutral**: gilt für
FastAPI, Django, Flask oder pures Python — das Framework prägt nur den
Einstiegspunkt (Routing/View) und das Wiring, nicht die Methode. Wo es relevant
wird, ist es unten benannt.

Lies erst die generellen Dateien, dann diesen Adapter.

---

## Schichten (konkretisiert GUARDRAILS.md A)

```
src/domain/  →  src/service/ (Use Case)  →  src/infrastructure/  →  Einstiegspunkt
```
Einstiegspunkt je Framework: FastAPI `router`, Django `view`, Flask `route`, CLI
`command` (Typer/Click). Abhängigkeiten zeigen nur nach innen.

### Regel 1 — Die Domain bleibt rein
`src/domain/` enthält **keine** Framework-Importe, keine Importe aus
`infrastructure`, keinen direkten DB-/Netzwerk-Zugriff. Sie arbeitet nur gegen
Repository-**Protokolle** (`typing.Protocol`/ABC); technische Details liegen in
`src/infrastructure/`.
Importe, die hier nichts verloren haben: `fastapi`, `django`, `flask`,
`sqlalchemy`, `psycopg`, `psycopg2`, `asyncpg`, `pymysql`, `django.db`, `requests`,
`httpx`, `open(`. Faustregel: nichts, was I/O, Transport oder ein Framework
mitbringt.

### Regel 2 — Einstiegspunkte greifen nicht direkt auf Persistenz zu
Router/View dürfen nicht direkt `infrastructure`, eine DB-Session oder ein ORM
nutzen. Sie rufen einen Service/Use Case auf; Persistenz läuft über Dependency
Injection (FastAPI `Depends`, sonst Konstruktor-Injektion). Keine Query-Logik im
View. Django-Hinweis: keine `Model.objects`-Aufrufe direkt im View — hinter ein
Repository kapseln.

---

## Datenbank-Layout & Migrations

- Schema **ausschließlich** über versionierte Migrations (Alembic, Django
  Migrations) — kein manuelles Ändern der DB.
- Jede Migration ist reversibel (`downgrade()` / Django `Migration` rückwärts).
  Keine destruktive Migration ohne Backup-Hinweis im Review.
- API-Routen versioniert (`/api/v1/…`).
- Django: Modell-Feld-Constraints und Permissions bewusst setzen; Autorisierung
  nicht implizit lassen.
- Secrets/Zugangsdaten nur aus `.env`/Environment (z. B. `pydantic-settings`,
  `os.environ`) — nie im Code oder in Migrations.

---

## Sensible Daten — projektspezifisches Beispiel (verschärft GUARDRAILS.md B)

Wenn die Domäne besonders schützenswerte Daten enthält (Beispiel: Daten
Minderjähriger), zusätzlich zur generellen Regel 3:
- Kein echtes Geburtsdatum-Muster neben Namens-/Geburtsfeldern.
- Warnsignal `geburtsdatum` / `date_of_birth` + realistisches Datum → stoppen,
  durch synthetische Werte ersetzen (Faker mit festem Seed oder klare Platzhalter
  wie "Jugendlicher A").

Diesen Abschnitt pro Projekt an die tatsächliche Datensensibilität anpassen.

---

## Das Gate-Kommando (konkretisiert GUARDRAILS.md C)

```
make quality      # oder: hatch run quality / nox -s quality
```
bündelt:
- `lint-imports` (import-linter) — Schicht-/Abhängigkeitsstruktur (das
  `deptrac`-Äquivalent; verbotene Kanten als `forbidden`-Contracts in
  `.importlinter`, Lauf schlägt bei Verstoß fehl),
- `mypy src` — statische Typanalyse (`--strict`, wo tragbar),
- `ruff check .` — Lint,
- `ruff format --check .` — Formatierung,
- `pytest` — die Tests.

Als `quality`-Target im `Makefile` (bzw. `[tool.hatch.envs]`-Script) definieren.
Erst wenn es sauber durchläuft, gilt "fertig".

**Formatter auf Bestandsprojekten.** Ein Repo, das nie durch `ruff format` lief,
meldet beim ersten `--check .` hunderte Verstöße in fremden Dateien. Das setzt die
Regel aus AGENTS.md → "Surgical Changes" nicht außer Kraft, es verschiebt nur den
Umfang: den eigenen Diff prüfen und sauber halten, das Repo nicht.

Anders als Laravels `pint` hat `ruff` **keinen eingebauten** "nur geänderte
Dateien"-Modus — der Dateisatz kommt aus git:

```bash
# nur was seit HEAD geändert ist (inkl. staged), prüft nur
files=$(git diff --name-only --diff-filter=ACMR HEAD -- '*.py')
[ -n "$files" ] && printf '%s\n' "$files" | xargs ruff format --check
[ -n "$files" ] && printf '%s\n' "$files" | xargs ruff check

# alles seit Abzweig von main
files=$(git diff --name-only --diff-filter=ACMR main -- '*.py')
```

Diese Form gehört ins Gate, solange das Repo nicht konform ist; erst nach einem
freigegebenen Sweep ist `--check .` sinnvoll. Drei Fallen:

**Falle 1 — die leere Dateiliste meldet stillschweigend Erfolg.** Der Dateisatz
kommt aus Git. Erreicht `git` kein Repository — Formatter im Container gemountet,
der nur das Anwendungsverzeichnis sieht und `.git` draußen lässt; oder `main`
fehlt lokal (Shallow-Clone in CI) — dann ist `$files` leer, die `[ -n … ]`-Abfrage
überspringt, und das Gate ist **grün ohne eine einzige geprüfte Datei**. Der
Guard, der das Leer-Aufrufen verhindert, macht den Fehlschlag also *stumm*.
Deshalb: **vor dem ersten Verlassen auf diese Form einmal beweisen, dass das Gate
rot werden kann** — Formatverstoß in eine berührte Datei einbauen, Prüfmodus
laufen lassen, Exit ≠ 0 sehen, zurückbauen (dasselbe Prinzip wie die
Negativkontrolle in TESTS.md → „Grün ist nicht gleich gültig"). Wer es härter
will, lässt das Gate scheitern statt überspringen, wenn `git` kein Repo findet:

```bash
git rev-parse --git-dir >/dev/null 2>&1 || { echo "kein git-Repo"; exit 1; }
```

**Falle 2 — Shell-Fallstricke** (GUARDRAILS Regel 8): `$files` **nicht** unquoted
an `xargs` weiterreichen (zsh splittet nicht auf Newlines, der ganze Blob wird ein
Argument), und die `[ -n … ]`-Abfrage nicht durch `xargs -r` ersetzen — das ist
GNU-only und fehlt auf macOS.

**Falle 3 — der Formatter formatiert ganze Dateien**, nicht nur geänderte Zeilen.
Eine kleine Änderung in einer stark abweichenden Bestandsdatei bläht den Diff
trotzdem auf. Dann die Format-Änderung dieser Datei als eigenen Commit vor die
inhaltliche setzen.

Gibt es eine UI mit eigener Logik, kommt der **E2E-Lauf als zweites, eigenes Gate**
dazu (langsamer, daher getrennt vom schnellen `quality`): `make e2e`, der **in
allen konfigurierten Engines (Chromium UND Firefox) grün** sein muss. "Fertig"
heißt: beide Gates grün.

---

## Das Bring-up-/Run-Kommando (konkretisiert AGENT_LOOP.md → Voraussetzungen)

Ein **einzelnes reproduzierbares Kommando**, das die App lokal in einen prüfbaren
Zustand bringt (Dev-Server + Test-DB), damit eine frische Session sichtbares
Verhalten End-to-End beobachten kann — nicht nur Unit-Tests:

```
make up      # oder: docker compose up -d && uvicorn src.main:app --reload
```

Zweck (nach Anthropics Long-Running-Harness, `init.sh`-Pattern): Jeder Folge-Lauf
fährt damit in Sekunden hoch und kann einen **Smoke-Durchstich** absetzen, bevor
er neue Arbeit beginnt (siehe AGENT_LOOP.md → Session-Start-Health-Check). Das
Kommando ist idempotent (mehrfach aufrufbar) und räumt bei Bedarf sauber ab.

**Readiness konkret (Web/Python):** ein `/health`-Endpoint, den der Smoke pollt,
bis er 200 liefert — kein fester Sleep:

```
until curl -fsS http://localhost:8000/health >/dev/null; do sleep 0.5; done
curl -fsS http://localhost:8000/api/v1/tasks/1 | grep -q '"status"'   # ein Durchstich
```

Der `/health`-Handler prüft DB-Verbindung und Migrations-Stand. Erst wenn der Poll
grün ist, beginnt neue Arbeit.

---

## UI-Konsistenz (konkretisiert GUARDRAILS.md G)

Gilt, sobald das Projekt eine UI mit eigenen Komponenten hat (Jinja2-Macros/
Partials, Django-Templates + `{% include %}`/Component-Lib, ggf. + Tailwind; oder
ein separates JS-Frontend).

- **Kanonische Komponenten:** wiederverwendbare Jinja-Macros/Template-Partials
  (`{% macro button() %}`, `components/table.html`) — bzw. das UI-Kit des Projekts.
  Vor neuem Markup dort nachsehen; kein zweiter Button aus rohem `<button class="…">`,
  wenn ein `button`-Macro existiert.
- **Tokens/Skala:** die eine Quelle ist die `theme`-Sektion in `tailwind.config.js`
  (Farben, Spacing, Radien, Schrift) — bzw. zentrale CSS-Custom-Properties. Keine
  Inline-`style="…"`, kein Hex direkt im Template; Abstände/Höhen über die
  Utility-/Token-Skala, nicht Einzelfall-`px`.
- **`DESIGN.md` als Token-Quelle (`GUARDRAILS_UI.md` G/Regel 7):** liegt eine `DESIGN.md`
  im Repo-Root, ist sie die normative Quelle. Der Validator ist node-basiert (setzt
  ein vorhandenes Node/`npx` voraus — nur relevant, wenn das Frontend Tailwind/JS
  nutzt): `npx @google/design.md lint DESIGN.md` vor UI-Write.
  **Achtung Exit-Code:** strukturelle Fehler → Exit 1, aber
  ein **Kontrast-Verstoß kommt nur als `warning` (Exit bleibt 0)** — verifiziert.
  Exit 0 heißt *nicht* „Kontrast ok"; `findings` lesen und Kontrast-Warnungen als
  blockierend behandeln. Tailwind aus ihr generieren statt Werte doppeln:
  `npx @google/design.md export --format css-tailwind DESIGN.md` (v4) bzw.
  `--format json-tailwind` (v3) — so bleibt `tailwind.config` deriviert.
- **Export-Ausgabe prüfen, nicht den Exit-Code** (dieselbe Falle wie beim Lint): jede
  populierte Token-Sektion muss ihre Familie emittieren (`colors` → `--color-*`,
  `typography` → `--font-*`/`--text-*`, `rounded` → `--radius-*`, `spacing` →
  `--spacing-*`). Fehlt eine, ist die Front-Matter falsch geformt, obwohl der Export
  mit **Exit 0** durchläuft. Verifizierte Ausnahme: `components` emittiert **kein**
  Target — Token-Ebenen können es nicht darstellen, das ist Limitation, kein Fehler.
- **`components`-Sub-Tokens nur aus dem Schema** (`backgroundColor`, `textColor`,
  `typography`, `rounded`, `padding`, `size`, `height`, `width`). Erfundene Namen geben
  `warning` bei **Exit 0**, und weil `components` nirgends exportiert wird, ist der Lint
  die einzige Prüfung dafür.
- **Der `lint` belegt keine exportierbare Datei:** ein Token-Name, der
  `^[a-zA-Z0-9][a-zA-Z0-9-]*$` verletzt, passiert `lint` mit **Exit 0**, bricht aber
  `export` mit `INVALID_TOKEN_NAME` und **Exit 1** (an 0.3.0 und 0.4.0 verifiziert). Beide
  Kommandos ins Gate, nicht nur den Lint.
- **`diff` bei Änderungen an `DESIGN.md`:** `npx @google/design.md diff <alt> DESIGN.md`
  zeigt `added`/`removed`/`modified` je Token-Gruppe — verhindert, dass eine akzeptierte
  Entscheidung still verschwindet.
- **Check (Selbstcheck vor "fertig"):** in geänderten Templates grep auf `style="`,
  Inline-Hex (`#[0-9a-fA-F]{3,6}`) und rohe `<button`/`<table`-Blöcke, die ein
  vorhandenes Macro/Partial nachbauen — jeder Treffer ist ein Finding (Regel 6/7).

Neuer geteilter Baustein nötig → **ein** neues Macro/Partial bzw. eine neue
Token-Stufe als Quelle; nicht pro Seite kopieren.

---

## Tests (konkretisiert TESTS.md)

- **Framework:** pytest, Arrange–Act–Assert.
- **Unit-Tests** für die Domain — schnell, ohne DB.
- **Integrations-/Durchstich-Tests** gegen eine echte relationale Test-DB
  (Postgres/MySQL, lokal via Docker). Keine parallelen Suites gegen dieselbe DB
  (sequenziell laufen lassen; `pytest-xdist` nur mit DB-Isolation je Worker, sonst
  ohne `-n`).

Der **HTTP-Durchstich** ist der wichtigste Test: echter Request durch die App
(FastAPI `TestClient`/`httpx.AsyncClient`, Django `Client`, Flask `test_client`)
gegen die Test-DB, prüft beide Ebenen (Response UND DB-Zustand):

```python
def test_schreibt_den_punktestand_korrekt_in_die_datenbank(client, db):
    # Arrange: Datensatz in der Test-DB anlegen
    # Act: echten HTTP-Request absetzen
    response = client.post(f"/api/v1/tasks/{task_id}/complete")

    # Assert 1 — Response
    assert response.status_code == 200

    # Assert 2 — DB-Zustand (NICHT vergessen!)
    row = db.execute(
        "SELECT points FROM point_accounts WHERE youth_id = %s", (youth_id,)
    ).fetchone()
    assert row.points == 10
```

Minimum: Unit (Domain) + Durchstich (mit DB-Assertion). Browser-/E2E-Tests nur bei
UI mit eigener Logik; Mocking nur für echte externe Service-Aufrufe.

### E2E / Browser (konkretisiert TESTS.md → "E2E / Browser")

- **Runner:** Playwright for Python (`pytest-playwright`), ein Projekt je Engine —
  Tests grün in **Chromium UND Firefox**, nicht nur einer.
- **Selektoren:** über `get_by_test_id`/Rollen, nie über CSS-Position oder
  Textfragmente. Deterministisch warten (`expect(locator).to_be_visible()`,
  `wait_for_url`), **nie** feste `wait_for_timeout`-Sleeps.
- **Daten:** pro Test/Namespace seeden (Fixtures) und in **FK-sicherer Reihenfolge**
  wieder abräumen (Kinder vor Eltern). **Keine parallelen Specs gegen dieselbe
  Test-DB** — ohne `pytest-xdist -n` sequenziell laufen (oder DB je Worker
  isolieren).
- **Diagnose:** `--tracing=retain-on-failure --screenshot=only-on-failure` —
  sonst ist ein CI-Failure remote nicht reproduzierbar.
- **Readiness:** den App-Server vor der Suite hochfahren und auf `/health` pollen
  (Fixture mit `scope="session"`), statt gegen einen noch toten Server zu rennen.
- **Login-State:** einmalig `storage_state` erzeugen und je Test via
  `browser.new_context(storage_state=...)` wiederverwenden.
- **Assertion auf den EXAKTEN deutschen Fehlertext**, nicht nur auf "Fehler
  vorhanden":

```python
from playwright.sync_api import expect

def test_email_feld_leer_exakte_fehlermeldung(page):
    page.goto("/register")
    # alle Pflichtfelder korrekt AUSSER E-Mail (genau EIN Feld falsch)
    page.get_by_test_id("name").fill("Test Nutzer")
    page.get_by_test_id("passwort").fill("korrektesPasswort1")
    page.get_by_test_id("passwort-bestaetigung").fill("korrektesPasswort1")
    page.get_by_test_id("agb").check()
    # E-Mail bewusst leer
    page.get_by_test_id("submit").click()

    expect(page.get_by_test_id("email-error")).to_have_text(
        "E-Mail-Adresse ist erforderlich"  # exakter Text, nicht /Fehler/
    )
```

Pro Formular die volle Ein-Feld-falsch-Matrix rotieren, Keyboard-/Enter-Submit als
eigenen Test, Happy Path zuletzt. Querschnitt (Authz, CSRF, Session, Upload/IDOR,
XSS, Grenzwerte, State/Race, Pagination/Empty, A11y): Checkliste in TESTS.md.

### Matrizen datengetrieben (konkretisiert TESTS.md → "Matrix über das Formular hinaus")

Die API-Payload-, Authz- (Rolle × Route) und Zustandsübergangs-Matrix werden als
**`@pytest.mark.parametrize`** geschrieben — eine Zeile je Zelle, nicht N kopierte
Testmethoden. Der Testrumpf setzt den Durchstich ab, das Dataset liefert die Zeilen
samt erwartetem Ergebnis:

```python
# API-Payload: genau ein Feld falsch, Rest gültig
@pytest.mark.parametrize("override, status, feld, fehler", [
    pytest.param(
        {"title": None}, 422, "title", "Titel ist erforderlich", id="title fehlt"
    ),
    pytest.param(
        {"title": "x" * 300},
        422,
        "title",
        "Titel darf höchstens 255 Zeichen lang sein",
        id="title zu lang",
    ),
    pytest.param(
        {"status": "bogus"}, 422, "status", "Status ist ungültig", id="status Enum"
    ),
])
def test_lehnt_ungueltige_anlage_ab(client, db, override, status, feld, fehler):
    payload = {**valid_payload(), **override}          # ein Feld überschrieben
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == status              # exakter Status
    assert response.json()["errors"][feld] == fehler    # exakter Fehlertext
    assert db.execute("SELECT count(*) AS n FROM tasks").fetchone().n == 0  # KEIN Zustand

# Authz Rolle × Route: eine Zeile je Zelle → erwarteter HTTP-Status
@pytest.mark.parametrize("rolle, method, uri, status", [
    ("anonym", "GET",    "/api/v1/tasks",    401),
    ("user",   "POST",   "/api/v1/tasks",    403),
    ("user",   "DELETE", "/api/v1/tasks/99", 403),   # fremdes Objekt (IDOR)
    ("admin",  "POST",   "/api/v1/tasks",    201),
])
def test_erzwingt_berechtigung(client, rolle, method, uri, status):
    response = client.request(method, uri, headers=auth_header_for(rolle))
    assert response.status_code == status
```

Der Zustandsübergang analog: Parametrize `(start_zustand, event, ziel_oder_none)`,
im Rumpf Startzustand seeden, Event absetzen, dann End-Zustand in der DB prüfen —
bei `reject` explizit, dass der Zustand **unverändert** ist. Jede Matrix-Zeile ist
so einzeln benannt und einzeln rot/grün.

---

## Beispiel-Zerlegung (konkretisiert SPEC_WORKFLOW.md Stufe 3)

Feature "Belohnung einlösen", Akzeptanzkriterien:
- AC1: genug Punkte → Belohnung einlösbar, Saldo sinkt um den Wert.
- AC2: zu wenig Punkte → Einlösen schlägt fehl, Saldo bleibt.
- AC3: nur eine berechtigte Rolle bestätigt das Einlösen.

Zerlegung (innen → außen):
1. **Domain:** `Reward`, `RewardCost` (Value Object, `@dataclass(frozen=True)`),
   Regel "Saldo nicht negativ" in `PointAccount.redeem()` + Unit-Tests für AC1/AC2.
2. **Service:** `RedeemReward` Use Case + Test (Berechtigung AC3).
3. **Infrastructure:** `PgRewardRepository` (implementiert das Domain-Protokoll) +
   Integrationstest.
4. **Einstiegspunkt:** `POST /api/v1/rewards/{id}/redeem` + Durchstich-Test
   (Response + DB-Saldo).

---

## Deploy-Strecke (konkretisiert GUARDRAILS.md D)

Das Gate beendet den Agent-Loop — die Strecke dahinter muss trotzdem definiert
sein, sonst endet „fertig" beim grünen Gate statt beim laufenden System. Pro
Projekt festlegen (Platzhalter füllen):

| Baustein | Vorgabe |
|---|---|
| **Ziele** | eine Testumgebung + eine Produktionsumgebung (`<test-url/host>`, `<prod-url/host>`) |
| **Artefakt** | versioniertes Build-Artefakt, empfohlen: Container-Image (`python:slim`-basiert, gepinnte `requirements.txt`/`uv.lock`), Tag = Commit/Release, in eigener Registry |
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
