# AGENTS.md — gemeinsame Basis für alle KI-Clients

Client-neutrale Arbeitsregeln. Gelten für **jeden** Agenten (Claude Code, Codex,
Cursor, Gemini …). Tool-spezifische Ergänzungen stehen in der jeweiligen
Client-Datei (z. B. `CLAUDE.md`), die diese Basis erweitert — nicht ersetzt.

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
`~/.gemini/harness/README.md`, sonst `harness/README.md` im ki-agents-Repo. Danach
den passenden Stack-Adapter unter dem gefundenen `harness/stacks/` wählen.
(Dokumentarisch, kein Zwang per Hook — der Agent wendet es selbst an.)

## Doku-Projekte — Doc-Harness

Für Doku-Arbeit (README-Sammlungen, Handbücher, API-Doku) gilt analog das
**Doc-Harness** (Claims-gegen-Quelle als Gate). Suchreihenfolge:
`~/.claude/doc-harness/README.md`, `~/.codex/doc-harness/README.md`,
`~/.gemini/doc-harness/README.md`, sonst `doc-harness/README.md` im
ki-agents-Repo. Generierte Projekt-Doku braucht eine **vorher definierte
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

---

**Diese Regeln greifen, wenn:** weniger unnötige Änderungen im Diff, weniger
Rewrites wegen Überkomplexität, und Rückfragen kommen vor der Umsetzung statt
nach dem Fehler.
