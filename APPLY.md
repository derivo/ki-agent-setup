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

## 1. Plugin-Marketplaces registrieren

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin marketplace add openai/codex-plugin-cc
claude plugin marketplace add JuliusBrussee/caveman
# thebrain ist ein lokales Verzeichnis — nur wenn ~/code/thebrain existiert:
claude plugin marketplace add ~/code/thebrain
```

**Verify:** `claude plugin marketplace list` zeigt alle vier.

---

## 2. Plugins installieren

```bash
claude plugin install frontend-design@claude-plugins-official
claude plugin install codex@openai-codex
claude plugin install caveman@caveman
claude plugin install thebrain@thebrain        # nur wenn Marketplace vorhanden
```

**Verify:** `claude plugin list` zeigt die Plugins als enabled.

---

## 3. GSD (get-shit-done) installieren

GSD ist **kein** Marketplace-Plugin, sondern ein eigener Installer.
Liegt unter `~/.claude/get-shit-done/` und liefert Hooks (`gsd-*`),
Skills/Commands (`gsd-*`, `gsd:*`) und die Statusline.

- Wenn `~/.claude/get-shit-done/` schon existiert: `gsd-update`-Skill bzw.
  den Repo-Installer laufen lassen.
- Sonst: GSD-Installer von dessen offizieller Quelle ausführen
  (siehe `~/.claude/gsd-install-state.json` für die verwendete Version/Quelle).

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
  "enabledMcpjsonServers": ["thebrain"],
  "skipDangerousModePermissionPrompt": true,
  "skipAutoPermissionPrompt": true
}
```

`permissions.allow` ist maschinen-/projektspezifisch (Tool-Allowlist) — **nicht**
aus diesem Repo übernehmen, sondern auf der Zielmaschine organisch wachsen lassen.

**Verify:** `claude` startet auf Deutsch, Thinking aktiv, dark-ansi-Theme.

---

## 7. Globale Arbeitsregeln (`~/.claude/CLAUDE.md`)

Globale CLAUDE.md sicherstellen mit diesen Prinzipien (Volltext siehe bestehende
`~/.claude/CLAUDE.md`, falls vorhanden — sonst neu anlegen):

- **Sprache:** Antworten auf Deutsch. Analogien nur in Chat, nicht in `.md`.
- **Think before Coding:** Annahmen nennen, bei Unsicherheit fragen, einfachere
  Wege vorschlagen.
- **Simplicity First:** Minimum-Code, keine spekulativen Features/Abstraktionen.
- **Surgical Changes:** nur Nötiges anfassen, Bestands-Style matchen, fremden
  Dead-Code nur erwähnen.
- **Goal-Driven Execution:** verifizierbare Ziele, Multi-Step → kurzer Plan.
- **Testing:** UI-Formulare → vollständige Edge-Case-Matrix (genau ein Feld falsch,
  Happy Path zuletzt, Keyboard-Submit eigener Pfad).
- **Konventionen:** Secrets in `.env`, schlanke Controller, Migrations mit Rollback,
  versionierte API-Routen, Commits/Kommentare auf Englisch.
- **TheBrain:** bei verbundenem MCP — Session-Start `get_context`, während der
  Arbeit `save_memory`/`use_item`, Session-Ende `save_summary`.
- **GSD:** Projekte mit `.planning/` nutzen GSD als Single-Source-of-Truth.

**Verify:** `~/.claude/CLAUDE.md` existiert und enthält die Abschnitte oben.

---

## 7b. Zusätzliche Skills (nicht aus GSD/caveman)

Vollständiges Inventar mit GitHub-Quelle pro Skill: [`SKILLS.md`](SKILLS.md).
Diese Skills werden über einen Skill-Manager verwaltet (Lockfile
`~/.agents/.skill-lock.json`, Version 3) und nach `~/.claude/skills/` verlinkt.

Reihenfolge:
1. Skill-Manager bereitstellen (siehe `vercel-labs/skills` / `find-skills`).
2. Skills aus dem Lockfile wiederherstellen, **oder** die in `SKILLS.md` als
   "Kern" markierten einzeln aus ihren Repos installieren.
3. Situative/überlappende Skills bewusst weglassen (siehe Priorisierung in
   `SKILLS.md` → "Bewertung").

`~/.agents/.skill-lock.json` ist die Sync-Quelle der Wahrheit — fehlt sie auf der
Zielmaschine, aus `SKILLS.md` rekonstruieren.

**Verify:** `ls ~/.claude/skills/` zeigt die gewünschten Nicht-GSD-Skills;
`/find-skills` o. ä. ist aufrufbar.

---

## 8. Abschluss-Verifikation

- `claude plugin list` → caveman, codex, frontend-design, (thebrain) enabled.
- Neue Session: caveman-Mode aktiv, GSD-Statusline sichtbar.
- In einem `.planning/`-Projekt: Statusline zeigt GSD-State.
- TheBrain-MCP (falls genutzt): `get_context` liefert Kontext, nicht "leer".

Bei Abweichungen oder fehlenden Quellen (z. B. `~/code/thebrain` nicht vorhanden):
melden statt raten.
