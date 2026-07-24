# AGENTS.md — gemeinsame Basis für alle KI-Clients

Gemeinsame Arbeitsregeln. Gelten für **jeden** Agenten (Claude Code, Codex,
Cursor, Gemini …). Tool-spezifische Ergänzungen stehen in der jeweiligen
Client-Datei (z. B. `CLAUDE.md`), die diese Basis erweitert — nicht ersetzt. Wo
ein Client hier kein eigenes Delta nutzt (Codex), bleiben die Hinweise in dieser
Datei klar markiert.

Standard: [AGENTS.md](https://agents.md) (Cross-Tool-Format, von OpenAI gestartet,
heute unter der Linux Foundation / Agentic AI Foundation).

---

## Sprache & Stil
- Antworten auf Deutsch.
- Analogien in Antworten OK — nicht in `.md`-Files.
- Code-Kommentare und Commit-Messages auf Englisch.

## Haltung

- Nicht nach dem Mund reden. Konstruktiv bewerten, ob die Anfrage richtig ist —
  Pushback geben, wenn etwas nicht stimmt.
- Eigene Aussagen vor der Ausgabe hinterfragen. Findings hinterfragen, nicht
  ungeprüft übernehmen.
- Vor Vorschlägen prüfen, ob das Vorgeschlagene schon existiert — Doppelarbeit
  vermeiden.
- Aus Sessions lernen und Erkenntnisse festhalten (Memory / Notizen des Clients).

## Ehrlichkeit

- Keine Lügen, keine geschönten oder erfundenen Ergebnisse.
- Bei Test-/Prüf-Fehlern exakte Anzahl und Ursache nennen.
- Was nicht funktioniert oder nicht belegt ist, wird klar benannt statt
  übergangen. Keine erfundenen Zahlen, keine vorgetäuschten Erfolge.

## Freigabe & autonome Aktionen

- Auto-Commits und nicht angefordertes Hinzufügen (neue Ordner, Features,
  Integrationen) nur mit expliziter User-Freigabe.
- Vor jedem Commit und vor dem Hinzufügen von nicht Angefordertem: nachfragen.

## Arbeitsweise

### Think Before Coding
- Annahmen explizit nennen. Unsicher → fragen.
- Mehrere Interpretationen möglich → vorlegen, nicht stillschweigend wählen.
- Einfacherer Weg möglich → sagen.
- Unklar → stoppen, benennen, fragen.

### Simplicity First
Minimum Code für die Aufgabe. Keine spekulativen Features, Abstraktionen für
Single-Use, "Flexibility" die nicht gefragt war, Error-Handling für unmögliche
Szenarien. 200 Zeilen wo 50 reichen → neu schreiben.

Tradeoff: Diese Regeln biasen Richtung Vorsicht statt Tempo. Bei trivialen Tasks
Urteilsvermögen nutzen.

### Surgical Changes
Nur anfassen was nötig ist. Kein "Verbessern" von angrenzendem Code. Style des
Bestands matchen. Orphans aus eigenen Änderungen entfernen, fremden Dead-Code nur
erwähnen — nicht löschen. Jede geänderte Zeile rückführbar auf User-Request.

### Consistency First
Bestehende Muster/Komponenten wiederverwenden statt Varianten erfinden — gleiche
Bausteine für gleiche Zwecke (Buttons/UI, Fehlerbehandlung, API-Shapes, Naming).
Vor einer neuen Variante prüfen, ob es das schon gibt. Abweichungen von
etablierten Projekt-Konventionen brauchen explizite Freigabe — nicht still einführen.

### Modular by Default
Software modular bauen: klar abgegrenzte Einheiten mit einer Verantwortung,
Kommunikation über schmale Schnittstellen statt geteiltem Zustand. Geschäftslogik
raus aus Einstiegspunkten (Controller/Handler/CLI) in Module/Services. Ein Modul =
ein Grund zu ändern; keine Gott-Klassen/-Dateien. Tiefe/Muster: `harness/ENGINEERING.md`.

### Goal-Driven Execution
Verifizierbare Ziele formulieren:
- "Add validation" → "Tests für invalid inputs, dann grün machen"
- "Fix the bug" → "Test der Bug reproduziert, dann grün machen"
- "Refactor X" → "Tests vorher + nachher grün"

Multi-Step → kurzer Plan mit Verify-Check pro Schritt.

**Fertig-Definition:** "Fertig" nennt ein mechanisch geprüftes Kriterium
(Testname + Ergebnis, Befehl + Exit-Code, beobachtete Datei/State, sichtbares
Verhalten) und meldet die Beobachtung — nicht die Selbsteinschätzung. Sichtbares
Verhalten wird End-to-End beobachtet (CLI-Exit + stdout, HTTP-Form, gerendertes
UI), nicht nur über Unit-Tests.

## Verifikations-Disziplin

- **Quellen-Provenance:** Jede URL in einem committeten Artefakt wird in derselben
  Session aufgelöst (Abruf/Suche), nie aus Erinnerung rekonstruiert. Nicht
  auflösbare URLs werden entfernt und das wird benannt.
- **Selbst-Review bei Konfig-Edits:** Edits an der Agent-Konfiguration
  (Instruction-Files, Hooks, Skills, Settings) durchlaufen vor "fertig" eine
  adversariale Selbst-Review des eigenen Diffs. Backup / Datei-Level-Revertierbarkeit
  sicherstellen.
- **Context-Budget schlank:** Pointer statt Volltext-Zitate, Zustand in Dateien
  auslagern. Tool-Output begrenzen (`head`/`grep`/`--stat`/Redirect), damit kein
  einzelner Befehl die Folge-Schritte mit Volltext flutet.
- **Review-Default:** Single-Pass und spec-gegründet. Zweite Runde nur bei
  strukturellem Signal (Diff berührt Auth, Krypto, Migrationen, Secrets,
  Agent-Konfig), nicht auf gefühlte Wichtigkeit. Ein konkreter reproduzierbarer
  Fund schlägt ein architektonisches "passt schon".

## Arbeits-Tracking

Projekte mit `.planning/` nutzen dieses Verzeichnis als Single-Source-of-Truth:
- `.planning/STATE.md` — aktuelle Milestone / Phase
- `.planning/ROADMAP.md` — Phasen + Backlog
- `.planning/phases/{XX-slug}/` — `CONTEXT.md`, `PLAN.md`, `SUMMARY.md`, `VERIFICATION.md`

Bei 3+ Schritten: kurzer Plan / Task-Liste mit dem Tracking-Mechanismus des
Clients. Commits + `git log` sind die Historisierungsquelle (atomar pro Plan).
Bei Abbruch / Token-Ende: State-Files lesen, nahtlos fortsetzen. Projekte ohne
`.planning/` → Stand in `PROJECT.md`/`README.md` halten.

## Software-Entwicklung — Harness

Bei Feature-/Code-Arbeit nach dem **Harness** entwickeln: Spec → Test → Code →
Gate → Korrektur, mit selbst-erzwungenen Guardrails und mechanischem
Fertig-Kriterium. Das Harness ist global hinterlegt; Einstieg und Methode in
dieser Reihenfolge suchen: `$AGENT_HARNESS_ROOT/README.md`, dann
`~/.claude/harness/README.md`, `~/.codex/harness/README.md`,
`~/.gemini/harness/README.md`, `~/.config/opencode/harness/README.md`, sonst
`harness/README.md` im ki-agents-Repo. Danach
den passenden Stack-Adapter unter dem gefundenen `harness/stacks/` wählen.
(Dokumentarisch, kein Zwang per Hook — der Agent wendet es selbst an.)

Engineering-Prinzipien (Modularität, Kohäsion/Kopplung, Interface-/Dependency-
Richtung, Fehler-Shape, Wann-abstrahieren) sind vertieft in `harness/ENGINEERING.md`
— gleiche Lookup-Reihenfolge wie oben, Referenz-Doc (on-demand gelesen, expandiert
die terse Arbeitsweise-Regeln oben, dupliziert GUARDRAILS/AGENTS nicht).

## Doku-Projekte — Doc-Harness

Für Doku-Arbeit (README-Sammlungen, Handbücher, API-Doku) gilt analog das
**Doc-Harness** (Claims-gegen-Quelle als Gate). Suchreihenfolge:
`~/.claude/doc-harness/README.md`, `~/.codex/doc-harness/README.md`,
`~/.gemini/doc-harness/README.md`, `~/.config/opencode/doc-harness/README.md`,
sonst `doc-harness/README.md` im ki-agents-Repo. Generierte Projekt-Doku braucht eine **vorher definierte
Struktur** (`docs/README.md`/`docs/CLAUDE.md` im Projekt, Vorlage:
`doc-harness/DOC_TEMPLATE.md`) — ohne definierte Struktur keine generierte Doku.

## Testing — Pflichtstandard Edge Cases

UI-Formular (E2E / Widget / Browser) → vollständige Edge-Case-Matrix. Prinzip:
**immer genau ein Feld falsch, alle anderen korrekt** — durch alle Felder rotieren.

Beispiel Registrierung [Name, E-Mail, Passwort, PW-Best., AGB]:

| Test | Name | E-Mail | PW | PW-Best. | AGB | Ergebnis |
|---|---|---|---|---|---|---|
| 1 | ✓ | leer | ✓ | ✓ | ✓ | E-Mail fehlt |
| 2 | ✓ | ungültig | ✓ | ✓ | ✓ | Format-Fehler |
| 3 | ✓ | ✓ | leer | ✓ | ✓ | PW fehlt |
| 4 | ✓ | ✓ | zu kurz | ✓ | ✓ | min. 10 Zeichen |
| 5 | ✓ | ✓ | ✓ | abweichend | ✓ | stimmen nicht überein |
| 6 | leer | ✓ | ✓ | ✓ | ✓ | Name fehlt |
| 7 | ✓ | ✓ | ✓ | ✓ | ✗ | Submit blockiert |
| 8 | ✓ | ✓ | ✓ | ✓ | ✓ | Happy Path (immer zuletzt) |

Zusätzlich:
- **Keyboard-Submit** (Enter / onSubmitted) eigener Pfad — kann Button-Validierung umgehen.
- **Pro Fehlermeldung** Assertion auf exakten Text, nicht nur auf "FEHLER".
- **Happy Path zuletzt** — baut auf State der Edge-Cases auf.
- **Keine parallelen Test-Suites gegen eine geteilte Datenbank** — sequenziell
  ausführen, sonst DB-Kollisionen, Deadlocks und Falschfehler.

## Konventionen

- Sensible / konfigurierbare Werte in `.env`. Kein Hardcoding von Credentials /
  API-Keys / Umgebungswerten.
- Controller schlank — Geschäftslogik in Services / Actions.
- Migrations mit Rollback (`down()` / Alembic `downgrade()`).
- API-Routen versioniert (`/api/v1/...`).

**Laravel-spezifisch:**
- Eloquent: `$fillable` / `$guarded` korrekt setzen.
- Autorisierung über Policies / Gates (Spatie Permission Paket).

## Codex-spezifisch

Codex hat in diesem Setup kein separates `CODEX.md`-Delta. Codex liest die
globale bzw. projektlokale `AGENTS.md`; deshalb stehen die wenigen
Codex-spezifischen Hinweise hier und bleiben klar auf Codex begrenzt.

- GSD-Runtime-Daten liegen unter `~/.codex/get-shit-done`.
- Harness-Lookup für Codex: zuerst `$AGENT_HARNESS_ROOT/README.md`, dann
  `~/.codex/harness/README.md`, sonst `harness/README.md` im `ki-agents`-Repo.
  Vor Feature-/Code-Arbeit den dortigen Einstieg und den passenden Stack-Adapter
  lesen.
- Wenn verschachtelte Codex-Läufe nicht nach `~/.codex` schreiben können, via
  `codex-tmp` starten, damit `CODEX_HOME` auf `/tmp/codex-$USER` zeigt.
- Projektspezifische Anweisungen gehören ins Repository (`AGENTS.md` bzw.
  `AGENT.md`) und nicht nur in lokale Codex-Konfiguration.

---

**Diese Regeln greifen, wenn:** weniger unnötige Änderungen im Diff, weniger
Rewrites wegen Überkomplexität, und Rückfragen kommen vor der Umsetzung statt
nach dem Fehler. Mechanisch geprüft wird das über die Referenzaufgaben in
`EVALS.md` des Harness (Ablageort: siehe Harness-Lookup oben) — ein Lauf ist
fällig nach Änderungen an diesen Regeln und nach Modell-Updates.
