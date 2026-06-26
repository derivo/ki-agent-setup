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

### Zusätzliche Skills (nicht aus GSD/caveman)

Separat installierte Skills (Web, Testing, PHP, Security …), verwaltet über einen
Skill-Manager mit Lockfile `~/.agents/.skill-lock.json`. Vollständiges Inventar
mit GitHub-Quelle pro Skill: [`SKILLS.md`](SKILLS.md).

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

---

## Quellen

### Tools & Plugins
- GSD (get-shit-done): https://github.com/gsd-build/get-shit-done
- caveman: https://github.com/JuliusBrussee/caveman
- codex (Plugin): https://github.com/openai/codex-plugin-cc
- Claude Plugins (offiziell, u. a. frontend-design): https://github.com/anthropics/claude-plugins-official
- Anthropic Skills (frontend-design, webapp-testing): https://github.com/anthropics/skills

### Skill-Quellen (siehe `SKILLS.md`)
- Skill-Manager / find-skills: https://github.com/vercel-labs/skills
- Web Quality (web-quality-audit, accessibility, performance): https://github.com/addyosmani/web-quality-skills
- Web Design Guidelines: https://github.com/vercel-labs/agent-skills
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Dev Essentials (e2e-testing, code-review): https://github.com/wshobson/agents
- Agentic QE (compatibility-, chaos-testing): https://github.com/proffesor-for-testing/agentic-qe
- browser-use: https://github.com/browser-use/browser-use
- Remotion: https://github.com/remotion-dev/skills
- Ecommerce SEO: https://github.com/affilino/ecommerce-seo-audit-skill

### Referenz / Inspiration
- Claude Code Docs: https://docs.claude.com/en/docs/claude-code
- Agent Skills (Anthropic): https://docs.claude.com/en/docs/claude-code/skills
- Andrej Karpathy — Guidelines (LLM-Coding-Pitfalls): https://github.com/multica-ai/andrej-karpathy-skills
  · Original-Tweet: https://x.com/karpathy/status/2015883857489522876
