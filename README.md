# ki-agents

🇩🇪 Deutsch | [🇬🇧 English](README.en.md)

Portable Beschreibung meines lokalen KI-Agent-Setups — client-übergreifend
(Claude Code, Codex, Cursor, Gemini …), mit Claude Code als primärem Client.

Ziel: Auf einer neuen Maschine dieses Repo auschecken, dem KI-Client sagen
*"lies `APPLY.md` und wende es an"* — und das Setup wird reproduziert.
Einmal definiert, überall synkbar, update- und anpassbar.

Dieses Repo enthält **keine** Config-Dateien, nur Doku. Der KI-Client baut
die Konfiguration anhand von [`APPLY.md`](APPLY.md) selbst auf.

---

## Nutzung

```bash
git clone git@github.com:derivo/ki-agent-setup.git
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

## Was das Setup macht

Das Setup macht aus einem KI-Coding-Client einen strukturierten
Entwicklungs-Agenten. Es hat zwei Ebenen:

**Client-neutral** — gilt für jeden Agenten (Claude Code, Codex, Cursor, Gemini …):
- Geschichtete Arbeitsregeln nach dem [AGENTS.md](https://agents.md)-Standard
  ([`instructions/`](instructions/)): neutrale Basis (`AGENTS.md`) + Client-Deltas
  — Deutsch, Think-before-Coding, Simplicity-First, Surgical-Changes,
  Ehrlichkeits-/Verifikations-Disziplin, Edge-Case-Testpflicht.
- [`harness/`](harness/README.md) — genereller, stack-agnostischer
  Software-Entwicklungs-Workflow (Spec → Test → Code → Gate, Self-Optimization).
- [`doc-harness/`](doc-harness/README.md) — Workflow für Doku-Projekte.
- **GSD (get-shit-done)** — Phasen-/Roadmap-Workflow, Single-Source-of-Truth;
  der Installer unterstützt mehrere Runtimes.
- **Skills** — via `skills`-CLI client-übergreifend installierbar
  ([`SKILLS.md`](SKILLS.md)).

**Claude-Code-spezifisch** — die Mechanik, die das in Claude Code einklinkt:
- **caveman** — Token-komprimierte Kommunikation (~75 % weniger Tokens).
- **Statusline** (`gsd-statusline.js`), **Hooks** und `settings.json` — eigene
  Claude-Code-Mechanismen.

Entsprechend ist [`APPLY.md`](APPLY.md) primär auf Claude Code zugeschnitten
(`claude plugin …`, `~/.claude/`); die client-neutrale Ebene wird zusätzlich auf
andere Clients ausgerollt (Schritt 7 → `~/.codex/`, `~/.gemini/` …).

---

## Installierte Erweiterungen

| Tool | Quelle | Typ | Zweck |
|---|---|---|---|
| **GSD (get-shit-done)** | eigener Installer → `~/.claude/get-shit-done` | Hooks + Skills + Commands + Statusline | Phasen-/Roadmap-Workflow, State-Tracking, Commit-Guards |
| **caveman** | `JuliusBrussee/caveman` | Plugin (Marketplace) | Token-komprimierte Kommunikation, Level lite/full/ultra |

Details zu Versionen, Hooks und Settings: siehe [`APPLY.md`](APPLY.md).

### Zusätzliche Skills (nicht aus GSD/caveman)

Separat installierte Skills (Web, Testing, PHP, Security …), verwaltet über einen
Skill-Manager mit Lockfile `~/.agents/.skill-lock.json`. Vollständiges Inventar
mit GitHub-Quelle pro Skill: [`SKILLS.md`](SKILLS.md).

### MCP-Server & Sicherheit

- **MCP-Server** — kuratierte, sicherheitsbewusste Empfehlungen (context7, GitHub,
  Playwright …): [`MCP_SERVERS.md`](MCP_SERVERS.md).
- **Sicherheit** — Hardening-Layer um den Agenten (Secret-Scan, Tool-Block-Hook,
  Logging-Proxy, Egress, Supply-Chain, Sandbox, Prompt-Injection):
  [`security/`](security/README.md).

---

## Statusline-Aufbau

Eigene Statusline via `~/.claude/hooks/gsd-statusline.js` (GSD Edition).
Layout, von oben nach unten (Soll-Struktur, an der realen Ausgabe ausgerichtet):

```
[GSD-Update-Warnung]                                       (optional, nur bei Update/stale Hooks)
Model (Context-Fenster) │ [Context-Meter] <used>%  │  <N> cached
[5h-Limit] <used>% - HH:MM  │  [Wochen-Limit] <used>% - Tag HH:MM  │  $<Session-Kosten>
voller Pfad │ git-branch                                   (dim)
<GSD-Version> [Milestone-Bar] <used>% · <GSD-State/Phase> │ dirname  [│ last: /command]
```

Beispiel:
```
Opus 4.8 (1M context)  [▰▰▰▰▰▰░░░░] 62%   520.0k cached
[▰▰▰▰▰▰▰▰░░] 80% - 23:50  │  [▰▰▰▰░░░░░░] 42% - Di 21:00  │  $225
/Users/you/code/myproject │ main
v0.1.0 [▰▰▰▰▰▰▰░░░] 71% · executing │ myproject
```

Eigenschaften:
- Zeile 1: Model + Context-Meter (genutzter Anteil, farbkodiert) + gecachte Tokens.
- Zeile 2: 5h-Rate-Limit und Wochen-Limit (je `used% - Reset`) + Session-Kosten in `$`.
- Zeile 3: voller Pfad + git-Branch (direkt aus `.git/HEAD`, kein Subprozess, Worktree-fähig).
- Zeile 4: GSD-Milestone-Version + Fortschrittsbalken + GSD-State/Phase + dirname;
  liest `.planning/STATE.md` + `.planning/config.json` hoch durch die Hierarchie.
  Optionaler `last: /command`-Suffix, wenn in der config aktiviert.
- Fällt bei jedem Fehler still zurück — bricht die Statusline nie.
- Die unterste Terminalzeile (`bypass permissions on …`) ist **Claude-Code-nativ**,
  nicht Teil dieses Scripts.

---

## Wie die Dateien zusammenarbeiten

```mermaid
flowchart TD
    README["README.md<br/>Überblick + Quellen"]:::doc

    subgraph SETUP[" Setup-Reproduktion "]
        SKILL["skills/setup-ki-agent<br/>autonomer Bootstrap"]:::skill
        APPLY["APPLY.md<br/>8 Setup-Schritte + Verify"]:::core
        SKILL -->|liest und führt aus| APPLY
    end

    subgraph INSTR[" instructions/ — Cross-Client-Regeln "]
        AGENTS["AGENTS.md<br/>neutrale Basis"]:::doc
        CLAUDE["CLAUDE.md<br/>Claude-Delta"]:::doc
        CLAUDE -->|importiert| AGENTS
    end

    SKILLS["SKILLS.md<br/>Skill-Inventar + Quellen"]:::doc
    TOOLS(["~/.claude<br/>Plugins · GSD · caveman · Hooks · Statusline"]):::target

    subgraph HARN[" harness/ — Dev-Workflow (generell, global) "]
        HREADME["README.md"]:::doc
        ROADMAP["ROADMAP.md<br/>5 Phasen"]:::doc
        GUARD["GUARDRAILS.md<br/>harte Regeln"]:::doc
        SPECW["SPEC_WORKFLOW.md"]:::doc
        FEATT["FEATURE_TEMPLATE.md"]:::doc
        TESTS["TESTS.md"]:::doc
        LOOP["AGENT_LOOP.md"]:::doc
        SELF["SELF_OPTIMIZATION.md"]:::doc
        FEAT["feature.md<br/>Runbook"]:::doc
        PHPAD["stacks/php<br/>PHP Web+DB Adapter"]:::skill
        HREADME --> ROADMAP & GUARD & SPECW & PHPAD
        SPECW --> FEATT
        LOOP --> GUARD & TESTS & SPECW & SELF
        FEAT --> LOOP & FEATT & TESTS
    end

    README -. Einstieg .-> SKILL
    APPLY -->|deployt| INSTR
    APPLY -->|installiert| TOOLS
    APPLY -->|stellt wieder her| SKILLS
    APPLY -->|deployt global| HARN

    classDef core fill:#1f6feb,stroke:#0d419d,color:#fff;
    classDef skill fill:#8957e5,stroke:#6e40c9,color:#fff;
    classDef doc fill:#21262d,stroke:#8b949e,color:#e6edf3;
    classDef target fill:#238636,stroke:#196c2e,color:#fff;
```

`APPLY.md` ist die Drehscheibe: Der Bootstrap-Skill liest sie, sie deployt die
`instructions/` **und** das [`harness/`](harness/README.md) global in die
Client-Config-Verzeichnisse (`~/.claude/`, `~/.codex/`, `~/.gemini/`), installiert
die Tools und stellt die Skills wieder her. Das
`harness/` ist der **generelle** Software-Entwicklungs-Workflow (stack-agnostisch);
konkrete Stack-Details liegen als Adapter unter `harness/stacks/` (z. B.
[`stacks/php`](harness/stacks/php/README.md) für PHP-Web + DB). Daneben gibt es
das [`doc-harness/`](doc-harness/README.md) als Workflow für **Doku**-Projekte.

---

## Quellen

### Tools & Plugins
- GSD (get-shit-done): https://github.com/open-gsd/gsd-core — npm `@opengsd/gsd-core`, Install-Pin siehe `APPLY.md` (Vorgänger `gsd-build/get-shit-done` archiviert)
- caveman: https://github.com/JuliusBrussee/caveman
- Anthropic Skills (webapp-testing): https://github.com/anthropics/skills

### Skill-Quellen (siehe `SKILLS.md`)
- **skills.sh** — Skill-Registry & CLI (`npx skills add <owner/repo>`): https://skills.sh
- Skill-Manager / `find-skills`-Skill: https://github.com/vercel-labs/skills
- Web Quality (web-quality-audit, accessibility, performance): https://github.com/addyosmani/web-quality-skills
- Web Design Guidelines: https://github.com/vercel-labs/agent-skills
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Dev Essentials (e2e-testing, code-review): https://github.com/wshobson/agents
- Agentic QE (compatibility-, chaos-testing): https://github.com/proffesor-for-testing/agentic-qe
- browser-use: https://github.com/browser-use/browser-use
- Remotion: https://github.com/remotion-dev/skills
- Ecommerce SEO: https://github.com/affilino/ecommerce-seo-audit-skill

### Standards / Referenz
- **AGENTS.md** — Cross-Client-Instruction-Standard (Linux Foundation / Agentic AI Foundation): https://agents.md
- Claude Code Docs: https://docs.claude.com/en/docs/claude-code
- Claude Code Memory (CLAUDE.md, Imports): https://docs.claude.com/en/docs/claude-code/memory
- Agent Skills (Anthropic): https://docs.claude.com/en/docs/claude-code/skills
- Andrej Karpathy — Guidelines (LLM-Coding-Pitfalls): https://github.com/multica-ai/andrej-karpathy-skills
  · Original-Tweet: https://x.com/karpathy/status/2015883857489522876
