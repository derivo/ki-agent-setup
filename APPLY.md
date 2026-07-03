# APPLY — Setup auf dieser Maschine anwenden

Anleitung für den KI-Client. Arbeite die Schritte der Reihe nach ab,
prüfe je Schritt das Verify-Kriterium, frage bei Konflikten nach.
Bestehende Werte des Users **nicht** blind überschreiben — mergen, Abweichungen melden.
Vor jeder Änderung an einer bestehenden Datei unter globalen Client-Verzeichnissen
(`~/.claude/`, `~/.codex/`, `~/.gemini/`, optional `~/.harness/`) ein Datei-Backup
anlegen (z. B. `cp settings.json settings.json.bak-$(date +%F)`) — jede Änderung
bleibt datei-weise revertierbar.

Primärer Zielort der globalen Config: `~/.claude/`. Cross-Client-Mirrors liegen
zusätzlich unter `~/.codex/`, `~/.gemini/` und optional `~/.harness/`.

---

## 0. Voraussetzungen

- `claude` (Claude Code CLI), `node`, `git` vorhanden.
- SSH-Zugang zu GitHub (für Marketplace-Plugins per Git).
- **Verify:** `claude --version`, `node --version`, `git --version` liefern Werte.

---

## 1. Plugin-Marketplaces registrieren

```bash
claude plugin marketplace add JuliusBrussee/caveman
claude plugin marketplace add anthropics/claude-plugins-official
```

**Verify:** `claude plugin marketplace list` zeigt `caveman` **und**
`claude-plugins-official`.

---

## 2. Plugins installieren

```bash
claude plugin install caveman@caveman
claude plugin install claude-md-management@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install playwright@claude-plugins-official
```

`caveman` liefert die Kompressions-Modi + Hooks (Schritt 5). Die drei
`@claude-plugins-official`-Plugins ergänzen CLAUDE.md-Pflege, Frontend-Design und
Playwright-Browser-Automatisierung.

**Version-Pinning:** `claude plugin install` hat **kein** Version-/Ref-Flag, ebenso
`marketplace add` — die installierte Version ist der git-HEAD des Marketplace zum
Install-Zeitpunkt. Hartes Pinning wie bei GSD (Schritt 3, `@1.6.0`) ist hier per
CLI **nicht** möglich. Stattdessen werden die geprüften Known-Good-Versionen
dokumentiert; Drift wird über `claude plugin list` gegen diese Tabelle erkannt:

| Plugin | Known-Good (Stand 2026-06-30) |
|---|---|
| `caveman@caveman` | `25d22f864ad6` |
| `claude-md-management@claude-plugins-official` | `1.0.0` |
| `frontend-design@claude-plugins-official` | `61c0597779bd` |
| `playwright@claude-plugins-official` | `d53f6ca4cdb0` |

Bewusste Aktualisierung: nach Prüfung diese Tabelle neu setzen (analog zum
GSD-Pin). Reine git-Hashes sind keine Semver-Tags — der Upstream-Marketplace
vergibt keine stabilen Versionen für diese Plugins.

**Verify:** `claude plugin list` zeigt alle vier als enabled; Versionen stimmen mit
der Tabelle überein (oder Abweichung ist bewusst dokumentiert).

---

## 3. GSD (get-shit-done) installieren

GSD ist **kein** Marketplace-Plugin, sondern ein eigener Installer.
Liegt im Runtime-Config-Verzeichnis (z. B. `~/.claude/get-shit-done/` oder
`~/.codex/get-shit-done/`) und liefert Hooks (`gsd-*`), Skills/Commands
(`gsd-*`, `gsd:*`) und die Statusline.

Installer ausführen (Version bewusst pinnen; npm-`latest` Stand 2026-06-27: `1.6.0`):
```bash
npx @opengsd/gsd-core@1.6.0
```
Der Installer fragt Runtime (Claude Code, Codex, Gemini, Cursor …) und global vs.
lokal ab. Dateien **nicht** von Hand aus `agents/`/`commands/` kopieren — der
Installer ist für Cross-Runtime-Kompatibilität nötig.

Hinweis: Das frühere Upstream-Repo `gsd-build/get-shit-done` ist archiviert;
Nachfolger ist `open-gsd/gsd-core` (npm `@opengsd/gsd-core`). Updates über den
`gsd-update`-Skill bzw. durch bewusstes Aktualisieren dieses Pins nach Prüfung.

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
- **PostToolUse:** (`Bash|Edit|Write|MultiEdit|Agent|Task`) `gsd-context-monitor.js`;
  (`Read`) `gsd-read-injection-scanner.js`; (`Write|Edit`) `gsd-phase-boundary.sh`

Die `gsd-*`-Hooks kommen aus dem GSD-Installer (Schritt 3), die `caveman-*`-Hooks
aus dem caveman-Plugin (Schritt 2) bzw. werden vom Plugin selbst registriert.
Einen optionalen Audit-Trail-Hook (PostToolUse) kann man ergänzen — siehe
[`security/`](security/README.md).

Node-Pfad: Laufen Hooks ohne PATH, den absoluten Node-Pfad eintragen
(`command -v node` liefert ihn) statt bloßes `node`.

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
  "voice": { "enabled": true, "mode": "hold" }
}
```

`permissions.allow` ist maschinen-/projektspezifisch (Tool-Allowlist) — **nicht**
aus diesem Repo übernehmen, sondern auf der Zielmaschine organisch wachsen lassen.
Permission-Skip-Flags (`skipDangerousModePermissionPrompt`,
`skipAutoPermissionPrompt`) sind **kein Default**. Nur bewusst, temporär und mit
Sandbox/VM setzen, wenn der User genau dieses Risiko freigibt.

**Verify:** `claude` startet auf Deutsch, Thinking aktiv, dark-ansi-Theme.

---

## 7. Globale Arbeitsregeln (Cross-Client)

Die portablen Anweisungen liegen geschichtet in [`instructions/`](instructions/):
- `instructions/AGENTS.md` — client-übergreifende Basis (Arbeitsweise, Testing,
  Konventionen) plus klar markierte Codex-Hinweise, weil Codex hier `AGENTS.md`
  direkt liest.
- `instructions/CLAUDE.md` — Claude-Delta (GSD, caveman, Skills),
  importiert die Basis via `@AGENTS.md`.

Deployment (Details + andere Clients: `instructions/README.md`):
- **Claude Code:** beide Dateien nach `~/.claude/` kopieren (`AGENTS.md` +
  `CLAUDE.md`). Falls dort schon eine `CLAUDE.md` liegt, mergen statt blind
  überschreiben.
- **Codex CLI:** `instructions/AGENTS.md` nach `~/.codex/AGENTS.md` kopieren/symlinken.
  Kein separates `CODEX.md` anlegen; Codex-spezifische Hinweise bleiben im
  markierten Abschnitt der `AGENTS.md`.
- **Gemini CLI:** bei Bedarf `~/.gemini/GEMINI.md` aus der Basis ableiten.

Der `@AGENTS.md`-Import funktioniert nur, wenn **beide** Dateien im selben
Verzeichnis liegen (`~/.claude/AGENTS.md` + `~/.claude/CLAUDE.md`).

**Verify:** `~/.claude/AGENTS.md` **und** `~/.claude/CLAUDE.md` existieren,
`CLAUDE.md` importiert `AGENTS.md`, Inhalt deckt Arbeitsweise + Claude-Spezifika ab.
Für Codex existiert `~/.codex/AGENTS.md` und enthält den Abschnitt
`Codex-spezifisch`.

---

## 7b. Zusätzliche Skills (nicht aus GSD/caveman)

Vollständiges Inventar mit GitHub-Quelle pro Skill: [`SKILLS.md`](SKILLS.md).
Diese Skills werden über einen Skill-Manager verwaltet (Lockfile
`~/.agents/.skill-lock.json`) und nach `~/.claude/skills/` verlinkt.

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
wird global hinterlegt. Für Cross-Client-Nutzung liegen Kopien in den globalen
Config-Verzeichnissen der jeweiligen Clients:

> **Achtung — `--delete` ist destruktiv.** Die `rsync`-Ziele unten
> (`~/.{claude,codex,gemini}/harness/`, `…/doc-harness/`, `~/.harness/`,
> `~/.claude/commands/hx/`) sind **repo-owned Mirror**: `--delete` löscht im Ziel
> alles, was nicht aus der Quelle stammt. Das ist Absicht (sauberer Mirror),
> widerspricht aber der Merge-Regel aus dem Kopf dieser Datei. Daher auf Systemen
> mit vorhandenen Daten **vor dem ersten Sync**: prüfen, dass das Ziel leer oder
> ein früherer Mirror ist (`ls`), sonst sichern/umlenken. Eigene Stack-Adapter
> gehören ins Repo (`harness/stacks/`), **nicht** ins Deploy-Ziel — sonst killt
> der nächste Sync sie. `$AGENT_HARNESS_ROOT` nie auf einen Pfad mit fremdem
> Inhalt zeigen.

```bash
mkdir -p ~/.claude ~/.codex ~/.gemini
rsync -a --delete harness/ ~/.claude/harness/
rsync -a --delete harness/ ~/.codex/harness/
rsync -a --delete harness/ ~/.gemini/harness/

# optional, für Doku-Projekte:
rsync -a --delete doc-harness/ ~/.claude/doc-harness/
rsync -a --delete doc-harness/ ~/.codex/doc-harness/
rsync -a --delete doc-harness/ ~/.gemini/doc-harness/
```

`instructions/AGENTS.md` verweist bereits darauf (Abschnitt "Software-Entwicklung
— Harness"); damit findet jeder Agent es ohne Projekt-Setup. Pro Projekt wählt der
Agent den passenden Stack-Adapter unter dem jeweiligen `harness/stacks/` (oder legt
einen neuen an).

Optional: Ein zentrales Harness-Root statt der Client-Kopien nutzen. Dann nur
einmal hinterlegen und `$AGENT_HARNESS_ROOT` darauf zeigen lassen (in der
Shell-Rc exportieren); der Lookup in `instructions/AGENTS.md` prüft diese Variable
zuerst:
```bash
echo 'export AGENT_HARNESS_ROOT="$HOME/.harness"' >> ~/.zshrc
rsync -a --delete harness/ ~/.harness/
```

Die Command-Library aufrufbar machen. `README.md` ist Doku, **nicht** deployen.

**Claude Code** (Namespace über Unterordner `hx/` → `/hx:start`, `/hx:spec`,
`/hx:review`, `/hx:verify`, `/hx:commit`, `/hx:pr`, `/hx:retro`,
`/hx:hot-reload`, `/hx:eod`; `review`/`verify` kollidieren sonst mit
Built-in-Skills):
```bash
mkdir -p ~/.claude/commands/hx
rsync -a --delete --exclude README.md harness/commands/ ~/.claude/commands/hx/
```

**Codex CLI** liest Custom-Prompts flach aus `~/.codex/prompts/*.md` und kennt
**kein** `:`-Namespace-Schema. Deshalb wird der Claude-Namespace `/hx:<name>` bei
Codex zum Datei-Präfix `hx-<name>` → aufrufbar als `/hx-start`, `/hx-spec` usw.
Die Dateien referenzieren sich intern gegenseitig (`/hx:retro` in `eod.md` etc.);
diese Cross-Refs werden beim Deploy per `sed` auf `/hx-` mitgezogen, sonst zeigen
sie bei Codex ins Leere. `~/.codex/prompts/` ist flach und **geteilt** (kann
fremde Codex-Prompts enthalten) — kein `rsync --delete` aufs ganze Verzeichnis.
Stattdessen Delete-by-Präfix: nur `hx-*.md` vorab wegräumen (der `hx-`-Präfix ist
die Namespace-Grenze), damit entfernte Commands nicht als Leichen liegen bleiben,
Fremdes aber unangetastet:
```bash
mkdir -p ~/.codex/prompts
rm -f ~/.codex/prompts/hx-*.md
for f in harness/commands/*.md; do
  base=$(basename "$f"); [ "$base" = "README.md" ] && continue
  sed 's#/hx:#/hx-#g' "$f" > ~/.codex/prompts/hx-"$base"
done
```

**Verify:** Bei Client-Kopien existieren `~/.claude/harness/README.md`,
`~/.codex/harness/README.md` und `~/.gemini/harness/README.md`, die drei
`harness/stacks/` Verzeichnisse zeigen die Adapter. Beim zentralen Root stattdessen:
`"$AGENT_HARNESS_ROOT/README.md"` existiert und `"$AGENT_HARNESS_ROOT/stacks/"`
zeigt die Adapter. In beiden Fällen enthält `ls ~/.claude/commands/hx/` die
Harness-Commands; für Codex enthält `ls ~/.codex/prompts/` dieselben Commands als
`hx-*.md`, und `grep -rl '/hx:' ~/.codex/prompts/` liefert **nichts** (alle
internen Cross-Refs sind auf `/hx-` umgeschrieben).

---

## 7d. MCP-Server (Kern-Set)

Die MCP-Empfehlungen stehen in [`MCP_SERVERS.md`](MCP_SERVERS.md); das dort als
**Kern-Set** geführte Trio (context7, GitHub MCP, Playwright MCP) gehört zum
reproduzierten Setup. Pro Server (Details + Sicherheit: `MCP_SERVERS.md`):

- Install-Kommando aus der **offiziellen Doku** des Servers (Quelle steht in der
  Tabelle), Version **pinnen** — nicht `latest`.
- Tokens/Keys aus `.env`/Secret-Store, nie im Klartext in `mcp.json`;
  `mcp.json` nicht versionieren.
- Die Entwicklungs-Server (dbhub, Docker) nur auf Maschinen mit lokalem
  Dev-Stack, nach den Sicherheitsregeln in `MCP_SERVERS.md` (read-only, keine
  Produktions-Credentials).

`MCP_SERVERS.md` ist das **secret-freie Inventar**: Wird ein Server dauerhaft
ergänzt oder entfernt, die Tabelle dort nachziehen (analog `SKILLS.md` für
Skills).

**Verify:** `claude mcp list` zeigt die Kern-Set-Server als verbunden.

---

## 7e. Security-Basis (Kontrollen 1–2)

Der Hardening-Layer steht in [`security/`](security/README.md). Die dort als
Priorität 1 eingestuften, billigen mechanischen Kontrollen werden **immer**
eingerichtet — nicht erst bei autonomen Läufen:

1. **Secret-Scanning** nach [`security/01`](security/01-secret-scanning.md):
   `gitleaks` installieren und als Pre-Commit-Schritt einklinken
   (`gitleaks protect --staged --redact`).
2. **Tool-Guard** nach [`security/02`](security/02-tool-guard.md): eigenen
   PreToolUse-Block-Hook (matcher `Bash|Write|Edit`) nach dem Muster der
   `gsd-*`-Guards anlegen und in `settings.json` registrieren (fail-closed,
   exit 2 bei Treffer).

Die Kontrollen 03–07 (Proxy, Egress, Supply-Chain, Sandbox, Injection) je nach
Autonomiegrad ergänzen — Priorisierung siehe `security/README.md`.

**Verify:** `gitleaks version` liefert eine Version; `settings.json` enthält den
PreToolUse-Guard; ein Test-Commit mit Dummy-Secret wird geblockt.

---

## 8. Abschluss-Verifikation

- `claude plugin list` → caveman + die drei `claude-plugins-official`-Plugins enabled.
- Neue Session: caveman-Mode aktiv, GSD-Statusline sichtbar.
- In einem `.planning/`-Projekt: Statusline zeigt GSD-State.
- `~/.claude/harness/`, `~/.codex/harness/` und `~/.gemini/harness/` vorhanden;
  Instructions verweisen darauf.
- `claude mcp list` → Kern-Set aus `MCP_SERVERS.md` verbunden (7d).
- Security-Basis aktiv: gitleaks im Pre-Commit, Tool-Guard-Hook registriert (7e).

Bei Abweichungen oder fehlenden Quellen melden statt raten.

Für Änderungen an diesem Repo vor dem Commit zusätzlich:
```bash
make verify-docs
```
