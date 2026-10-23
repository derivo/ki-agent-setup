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
- `make design-check` — Ad-hoc-Werte im UI (siehe UI-Konsistenz unten),
- `pytest` — die Tests.

Als `quality`-Target im `Makefile` (bzw. `[tool.hatch.envs]`-Script) definieren.
Erst wenn es sauber durchläuft, gilt "fertig".

**Security-Pass-Werkzeuge (konkretisiert GUARDRAILS.md E):** `pip-audit` prüft die
Abhängigkeiten auf bekannte Schwachstellen (Exit ≠ 0 bei Fund), ein Secret-Scan
(z. B. `gitleaks`) den eigenen Diff. Führt das Projekt beides, gehört es ins Gate;
fehlt es, wird der Security-Pass als Selbstcheck gemeldet, nicht als geprüft.

**A11y-Nachweis** (globale AGENTS.md → Barrierefreiheit): gegen die laufende App
je berührter Seite, z. B. `npx pa11y <url>` oder `npx @axe-core/cli <url>`.

**Formatter auf Bestandsprojekten.** Ein Repo, das nie durch `ruff format` lief,
meldet beim ersten `--check .` hunderte Verstöße in fremden Dateien. Das setzt die
Regel aus AGENTS.md → "Surgical Changes" nicht außer Kraft, es verschiebt nur den
Umfang: den eigenen Diff prüfen und sauber halten, das Repo nicht.

Anders als Laravels `pint` hat `ruff` **keinen eingebauten** "nur geänderte
Dateien"-Modus — der Dateisatz kommt aus git:

```bash
set -eu
base=$(git merge-base HEAD origin/main)    # Abzweig; fehlt die Ref → Exit ≠ 0
list=$(mktemp); trap 'rm -f "$list"' EXIT
git diff -z --name-only --diff-filter=ACMR "$base" -- '*.py' >"$list"
git ls-files -z -o --exclude-standard -- '*.py' >>"$list"
[ -s "$list" ] || exit 0                    # nichts geändert: geprüft und leer
xargs -0 ruff format --check <"$list"
xargs -0 ruff check <"$list"
```

Der Dateisatz ist der eigene Diff: alles seit dem Abzweig (auch schon committete
Branch-Arbeit, die die CI sonst nicht sähe), Ungestagtes und **Untracktes** (eine
neue Datei steht in keinem `git diff HEAD`). Diese Form gehört ins Gate, solange
das Repo nicht konform ist; erst nach einem freigegebenen Sweep ist `--check .`
sinnvoll. Drei Fallen:

**Falle 1 — eine leere Dateiliste darf nicht stumm grün sein.** Erreicht `git` kein
Repository (Formatter im Container, der `.git` nicht sieht) oder fehlt die
Vergleichs-Ref (Shallow-Clone in CI), bricht `merge-base` unter `set -eu` mit
Exit ≠ 0 ab, statt eine leere Liste zu liefern. Die frühere Form
(`files=$(git diff …)`, dann `[ -n "$files" ] && …`) war in genau diesen Fällen
**grün ohne eine einzige geprüfte Datei**. Trotzdem vor dem ersten Verlassen
einmal beweisen, dass das Gate rot werden kann: Formatverstoß in eine berührte
Datei einbauen, Prüfmodus laufen lassen, Exit ≠ 0 sehen, zurückbauen (Prinzip
der Negativkontrolle, TESTS.md → „Grün ist nicht gleich gültig").

**Falle 2 — Shell-Fallstricke** (GUARDRAILS Regel 8): die Dateiliste NUL-getrennt
übergeben (`-z`/`xargs -0`), nie als unquotete Variable — zsh splittet nicht auf
Newlines, und Dateinamen mit Leerzeichen zerfallen sonst in zwei Argumente.

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
i=0   # Abbruch statt Endlosschleife: 60 Versuche, je Request max. 2 s
until curl -fsS --max-time 2 http://localhost:8000/health >/dev/null; do
  i=$((i+1)); [ "$i" -lt 60 ] || { echo "health: kein 200 nach 60 Versuchen" >&2; exit 1; }
  sleep 0.5
done
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
- **`DESIGN.md` als Token-Quelle:** liegt eine `DESIGN.md` im Repo-Root, ist sie die
  normative Quelle; `tailwind.config` wird daraus exportiert, nicht von Hand gepflegt.
  Validator-Kommandos und ihre Exit-Code-Fallen: `GUARDRAILS_UI.md` → Regel 7.
  Der Validator braucht Node/`npx` — nur relevant, wenn das Frontend Tailwind/JS nutzt.
- **Regel 7 gehört ins Gate:** `scripts/design-check.sh` aus `GUARDRAILS_UI.md`
  (Regel 7), als `design-check`-Target im `Makefile` im `quality`-Bündel.
  Dateitypen: `set -- '*.html' '*.jinja' '*.css' ':(exclude)<Token-Datei>'`.
- **Selbstcheck bleibt für Regel 6:** rohe `<button`/`<table`-Blöcke, die ein
  vorhandenes Macro/Partial nachbauen. Ob zwei Bausteine denselben Zweck haben,
  entscheidet kein `grep` — das prüft `/hx:audit` über den Bestand.

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
