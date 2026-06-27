# APPLY — Setup auf dieser Maschine anwenden

Anleitung für den KI-Client. Arbeite die Schritte der Reihe nach ab,
prüfe je Schritt das Verify-Kriterium, frage bei Konflikten nach.
Bestehende Werte des Users **nicht** blind überschreiben — mergen, Abweichungen melden.

Zielort der globalen Config: `~/.claude/`.

---

## 0. Voraussetzungen

- `claude` (Claude Code CLI), `node`, `git` vorhanden.
- SSH-Zugang zu GitHub (für Marketplace-Plugins per Git).
- **Verify:** `claude --version`, `node --version`, `git --version` liefern Werte.

---

## 1. Plugin-Marketplace registrieren

```bash
claude plugin marketplace add JuliusBrussee/caveman
```

**Verify:** `claude plugin marketplace list` zeigt `caveman`.

---

## 2. Plugins installieren

```bash
claude plugin install caveman@caveman
```

**Verify:** `claude plugin list` zeigt `caveman` als enabled.

---

## 3. GSD (get-shit-done) installieren

GSD ist **kein** Marketplace-Plugin, sondern ein eigener Installer.
Liegt unter `~/.claude/get-shit-done/` und liefert Hooks (`gsd-*`),
Skills/Commands (`gsd-*`, `gsd:*`) und die Statusline.

Installer ausführen:
```bash
npx @opengsd/gsd-core@latest
```
Der Installer fragt Runtime (Claude Code, Codex, Gemini, Cursor …) und global vs.
lokal ab. Dateien **nicht** von Hand aus `agents/`/`commands/` kopieren — der
Installer ist für Cross-Runtime-Kompatibilität nötig.

Hinweis: Das frühere Upstream-Repo `gsd-build/get-shit-done` ist archiviert;
Nachfolger ist `open-gsd/gsd-core` (npm `@opengsd/gsd-core`). Eine bestehende
Installation aktualisiert der `gsd-update`-Skill. Versions-Lineage: ältere
Installationen tragen `1.42.x` (altes `get-shit-done`), aktueller Upstream nutzt
ein eigenes Schema — funktional gleichwertig, nicht byte-identisch.

**Verify:**
- `~/.claude/hooks/gsd-statusline.js` existiert.
- `gsd-help`-Skill ist verfügbar.

---

## 4. Statusline aktivieren

In `~/.claude/settings.json`:

```json
"statusLine": {
  "type": "command",
  "command": "node \"/Users/<USER>/.claude/hooks/gsd-statusline.js\""
}
```

`<USER>` auf den realen Home-Pfad der Maschine setzen.
**Verify:** Statusline zeigt Model-/Context-Zeile + Pfad + git-branch (siehe README).

---

## 5. Hooks eintragen

Alle Hook-Skripte liegen in `~/.claude/hooks/`. In `settings.json` registrieren
(Pfade auf reales `$HOME` anpassen):

- **SessionStart:** `gsd-check-update.js`, `gsd-session-state.sh`, `caveman-activate.js`
- **UserPromptSubmit:** `caveman-mode-tracker.js`
- **PreToolUse** (`Write|Edit`): `gsd-prompt-guard.js`, `gsd-read-guard.js`, `gsd-workflow-guard.js`
  — (`Bash`): `gsd-validate-commit.sh`
- **PostToolUse:** `audit-log.js`; (`Bash|Edit|Write|MultiEdit|Agent|Task`) `gsd-context-monitor.js`;
  (`Read`) `gsd-read-injection-scanner.js`; (`Write|Edit`) `gsd-phase-boundary.sh`

Die `gsd-*`-Hooks kommen aus dem GSD-Installer (Schritt 3), die `caveman-*`-Hooks
aus dem caveman-Plugin (Schritt 2) bzw. werden vom Plugin selbst registriert.
`audit-log.js` ist ein lokaler Eigenbau-Hook (PostToolUse-Audit-Trail nach
`~/.claude/audit.log.jsonl`) — auf einer frischen Maschine entweder mitbringen
oder den Eintrag weglassen, kein GSD/caveman-Bestandteil.

Node-Pfad: Die GSD-Hooks tragen real den absoluten Pfad `/opt/homebrew/bin/node`
(vom Installer gesetzt), die caveman-/Statusline-Hooks bloßes `node`. Auf der
Zielmaschine den absoluten Node-Pfad einsetzen, wenn Hooks ohne PATH laufen.

**Verify:** Neue Session zeigt caveman-Aktivierung und GSD-Update-Check.

---

## 6. Globale Einstellungen (`settings.json`)

Folgende Top-Level-Keys setzen (mit bestehenden mergen):

```json
{
  "language": "deutsch",
  "alwaysThinkingEnabled": true,
  "effortLevel": "high",
  "tui": "fullscreen",
  "theme": "dark-ansi",
  "voice": { "enabled": true, "mode": "hold" },
  "skipDangerousModePermissionPrompt": true,
  "skipAutoPermissionPrompt": true
}
```

`permissions.allow` ist maschinen-/projektspezifisch (Tool-Allowlist) — **nicht**
aus diesem Repo übernehmen, sondern auf der Zielmaschine organisch wachsen lassen.

Hinweis: Ein real evtl. zusätzlich vorhandenes `voiceEnabled: true` ist
Legacy/redundant zu `voice` — nicht doppelt pflegen.

**Verify:** `claude` startet auf Deutsch, Thinking aktiv, dark-ansi-Theme.

---

## 7. Globale Arbeitsregeln (Cross-Client)

Die portablen Anweisungen liegen geschichtet in [`instructions/`](instructions/):
- `instructions/AGENTS.md` — client-neutrale Basis (Arbeitsweise, Testing,
  Konventionen).
- `instructions/CLAUDE.md` — Claude-Delta (GSD, caveman, Skills),
  importiert die Basis via `@AGENTS.md`.

Deployment (Details + andere Clients: `instructions/README.md`):
- **Claude Code:** beide Dateien nach `~/.claude/` kopieren (`AGENTS.md` +
  `CLAUDE.md`). Bestehende `~/.claude/CLAUDE.md` mergen, nicht blind
  überschreiben.
- **Codex CLI:** `instructions/AGENTS.md` nach `~/.codex/AGENTS.md` kopieren/symlinken.
- **Gemini CLI:** bei Bedarf `~/.gemini/GEMINI.md` aus der Basis ableiten.

Der `@AGENTS.md`-Import funktioniert nur, wenn **beide** Dateien im selben
Verzeichnis liegen (`~/.claude/AGENTS.md` + `~/.claude/CLAUDE.md`). Dies ist der
Soll-Zustand — eine bestehende Maschine kann eine ältere, nicht-geschichtete
`CLAUDE.md` ohne `AGENTS.md` haben; beim Anwenden mergen statt überschreiben.

**Verify:** `~/.claude/AGENTS.md` **und** `~/.claude/CLAUDE.md` existieren,
`CLAUDE.md` importiert `AGENTS.md`, Inhalt deckt Arbeitsweise + Claude-Spezifika ab.

---

## 7b. Zusätzliche Skills (nicht aus GSD/caveman)

Vollständiges Inventar mit GitHub-Quelle pro Skill: [`SKILLS.md`](SKILLS.md).
Diese Skills werden über einen Skill-Manager verwaltet (Lockfile
`~/.agents/.skill-lock.json`, Version 3) und nach `~/.claude/skills/` verlinkt.

Skill-Manager ist die `skills`-CLI (`vercel-labs/skills`, Registry
[skills.sh](https://skills.sh)) — kein Setup nötig, läuft via `npx`.

Skills einzeln aus ihrer Quelle installieren (global), Quell-Repo je Skill aus
`SKILLS.md`:
```bash
npx skills add <owner/repo> -g            # ganzes Repo
npx skills add <owner/repo> -g -s <name>  # nur einen bestimmten Skill
```

Reihenfolge:
1. Die in `SKILLS.md` als **"Kern"** markierten Skills aus ihren Repos installieren.
2. Situative bei Bedarf nachziehen; überlappende/seltene bewusst weglassen (siehe
   `SKILLS.md` → "Bewertung").
3. `~/.agents/.skill-lock.json` ist die Referenz, welche Skills aus welcher Quelle
   stammen — fehlt sie, aus `SKILLS.md` rekonstruieren.

**Verify:** `ls ~/.claude/skills/` zeigt die gewünschten Nicht-GSD-Skills;
`/find-skills` o. ä. ist aufrufbar.

---

## 7c. Harness global hinterlegen

Das Harness (genereller Softwareentwicklungs-Workflow) gilt für jedes Projekt und
wird global hinterlegt:

```bash
cp -R harness ~/.claude/harness
# optional, für Doku-Projekte:
cp -R doc-harness ~/.claude/doc-harness
```

`instructions/AGENTS.md` verweist bereits darauf (Abschnitt "Software-Entwicklung
— Harness"); damit findet jeder Agent es ohne Projekt-Setup. Pro Projekt wählt der
Agent den passenden Stack-Adapter unter `~/.claude/harness/stacks/` (oder legt
einen neuen an).

Die Command-Library aufrufbar machen (damit `/spec`, `/review`, `/verify`,
`/commit`, `/pr` greifen) — in `~/.claude/commands/` legen, bei Namenskollision
umbenennen/in Unterordner:
```bash
cp harness/commands/*.md ~/.claude/commands/   # oder symlinken
```

**Verify:** `~/.claude/harness/README.md` existiert; `ls ~/.claude/harness/stacks/`
zeigt die Adapter; `ls ~/.claude/commands/` enthält die Harness-Commands.

---

## 8. Abschluss-Verifikation

- `claude plugin list` → caveman enabled.
- Neue Session: caveman-Mode aktiv, GSD-Statusline sichtbar.
- In einem `.planning/`-Projekt: Statusline zeigt GSD-State.
- `~/.claude/harness/` vorhanden; Instructions verweisen darauf.

Bei Abweichungen oder fehlenden Quellen melden statt raten.
