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

## Arbeits-Tracking

Projekte mit `.planning/` nutzen dieses Verzeichnis als Single-Source-of-Truth:
- `.planning/STATE.md` — aktuelle Milestone / Phase
- `.planning/ROADMAP.md` — Phasen + Backlog
- `.planning/phases/{XX-slug}/` — `CONTEXT.md`, `PLAN.md`, `SUMMARY.md`, `VERIFICATION.md`

Bei 3+ Schritten: kurzer Plan / Task-Liste mit dem Tracking-Mechanismus des
Clients. Commits + `git log` sind die Historisierungsquelle (atomar pro Plan).
Bei Abbruch / Token-Ende: State-Files lesen, nahtlos fortsetzen. Projekte ohne
`.planning/` → Stand in `PROJECT.md`/`README.md` halten.

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
