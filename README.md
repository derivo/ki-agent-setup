# ki-agents

Portable Beschreibung meines lokalen KI-Agent-Setups (Claude Code).

Ziel: Auf einer neuen Maschine dieses Repo auschecken, dem KI-Client sagen
*"lies `APPLY.md` und wende es an"* — und das Setup wird reproduziert.
Einmal definiert, überall synkbar, update- und anpassbar.

Dieses Repo enthält **keine** Config-Dateien, nur Doku. Der KI-Client baut
die Konfiguration anhand von [`APPLY.md`](APPLY.md) selbst auf.

---

## Was das Setup macht

Claude Code wird zu einem strukturierten Entwicklungs-Agenten erweitert:

- **GSD (get-shit-done)** als Single-Source-of-Truth für Projektarbeit
  (Phasen, Roadmap, State-Tracking, atomare Commits).
- **caveman** komprimiert die Kommunikation (~75 % weniger Tokens).
- **TheBrain** als persistentes Gedächtnis über Sessions hinweg.
- **codex** als zweite Implementierungs-/Diagnose-Instanz.
- **frontend-design** für UI-Arbeit.
- Globale Arbeitsregeln (`CLAUDE.md`): Deutsch, Think-before-Coding,
  Simplicity-First, Surgical-Changes, Edge-Case-Testpflicht.

---

## Statusline-Aufbau

Eigene Statusline via `~/.claude/hooks/gsd-statusline.js` (GSD Edition).
Layout, von oben nach unten:

```
[GSD-Update-Warnung]                                  (optional, nur wenn Update/stale Hooks)
[Context-Meter-Grid mit eingebettetem Model-Namen]    (Fallback: Model-Name dim, wenn keine Context-Daten)
[voller Pfad │ git-branch]                            (dim)
[Task / GSD-State] │ [dirname]  [│ last: /command]    (last-command nur wenn in config aktiviert)
```

Eigenschaften:
- Liest `.planning/STATE.md` (GSD-Phase) und `.planning/config.json` hoch durch
  die Verzeichnis-Hierarchie.
- Git-Branch direkt aus `.git/HEAD` (kein Subprozess), Worktree-fähig.
- Context-Usage aus `cache_read_input_tokens` der Transcript-Tail (256 KiB).
- Fällt bei jedem Fehler still zurück — bricht die Statusline nie.

---

## Installierte Tools

| Tool | Quelle | Typ | Zweck |
|---|---|---|---|
| **GSD (get-shit-done)** | eigener Installer → `~/.claude/get-shit-done` | Hooks + Skills + Commands + Statusline | Phasen-/Roadmap-Workflow, State-Tracking, Commit-Guards |
| **caveman** | `JuliusBrussee/caveman` | Plugin (Marketplace) | Token-komprimierte Kommunikation, Level lite/full/ultra |
| **codex** | `openai/codex-plugin-cc` | Plugin (Marketplace) | Zweite Implementierungs-/Diagnose-Instanz (Codex CLI) |
| **frontend-design** | `anthropics/claude-plugins-official` | Plugin (Marketplace) | UI-/Frontend-Design |
| **thebrain** | lokales Verzeichnis `~/code/thebrain` | Plugin + MCP-Server | Persistentes Session-Gedächtnis |

Details zu Versionen, Hooks und Settings: siehe [`APPLY.md`](APPLY.md).

---

## Nutzung

```bash
git clone git@github.com:derivo/ki-agents-parts.git
```

Dann im KI-Client:

> Lies `APPLY.md` und wende das Setup auf diese Maschine an.

Oder den autonomen Bootstrap-Skill nutzen
([`skills/setup-ki-agent/SKILL.md`](skills/setup-ki-agent/SKILL.md)) — er
orchestriert das ganze Setup aus `APPLY.md` selbstständig. Einmalig verfügbar
machen:

```bash
ln -s "$(pwd)/skills/setup-ki-agent" ~/.claude/skills/setup-ki-agent
```

Setup ändern → `APPLY.md` anpassen, committen, auf anderen Maschinen pullen.
