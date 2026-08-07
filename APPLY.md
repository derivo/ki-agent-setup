# APPLY — Setup auf dieser Maschine anwenden

Anleitung für den KI-Client. **Zweiteilig:** Teil A ist der große gemeinsame
Kern — die geteilte Substanz (Regeln, Harness, GSD, MCP, Skills, Security), die
für *jeden* Client gilt. Teil B sagt pro Client, *wohin* er diese Substanz legt
und welche client-eigene Mechanik dazukommt.

Reihenfolge: erst Teil A einmal verstehen, dann in Teil B **nur den Block des
Clients** abarbeiten, der eingerichtet wird (mehrere Clients → mehrere Blöcke).
Jeder Schritt hat ein Verify-Kriterium; bei Konflikten nachfragen.

Bestehende Werte des Users **nicht** blind überschreiben — mergen, Abweichungen
melden. Vor jeder Änderung an einer bestehenden Datei unter globalen
Client-Verzeichnissen (`~/.claude/`, `~/.codex/`, `~/.gemini/`,
`~/.config/opencode/`, optional `~/.harness/{harness,doc-harness}/`) ein
Datei-Backup anlegen (z. B. `cp settings.json settings.json.bak-$(date +%F)`) —
jede Änderung bleibt datei-weise revertierbar.

## Zielorte pro Client

| Client | Globales Config-Verzeichnis | Liest Regeln aus |
|---|---|---|
| Claude Code (Primär) | `~/.claude/` | `CLAUDE.md` (+ `AGENTS.md` via `@`-Import) |
| Codex CLI | `~/.codex/` | `AGENTS.md` |
| Gemini CLI | `~/.gemini/` | `GEMINI.md` |
| opencode | `~/.config/opencode/` | `AGENTS.md` (+ `~/.claude/CLAUDE.md` als Compat) |

Primärer Zielort ist `~/.claude/`; die übrigen sind Cross-Client-Spiegel
derselben Substanz. Ein zentrales Harness-Root (`~/.harness/harness/`, via
`$AGENT_HARNESS_ROOT`) kann die Harness-Kopien pro Client ersetzen — siehe A2.

---

## 0. Voraussetzungen

- `node`, `git`, SSH-Zugang zu GitHub (für Marketplace-/Git-Installationen).
- Die CLI des Clients, der eingerichtet wird (`claude`, `codex`, `gemini`,
  `opencode`).
- **Verify:** `node --version`, `git --version` und `<client> --version` liefern
  Werte.

---

# TEIL A — Gemeinsamer Kern (client-übergreifend)

Die geteilte Substanz. Inhaltlich für alle Clients identisch; der client-eigene
Ablageort und Install-Mechanismus steht in Teil B.

## A1. Globale Arbeitsregeln (`instructions/`)

Die portablen Anweisungen liegen geschichtet in [`instructions/`](instructions/):
- `instructions/AGENTS.md` — client-übergreifende Basis (Arbeitsweise, Testing,
  Konventionen, Harness-Pointer) plus klar markierte Codex-Hinweise. **Quelle der
  Wahrheit** für alle Clients.
- `instructions/CLAUDE.md` — Claude-Delta (GSD, ponytail, Skills), importiert die
  Basis via `@AGENTS.md`.

Der `@AGENTS.md`-Import ist **Claude-spezifisch** — nur Claude Code expandiert ihn
(beide Dateien müssen im selben Verzeichnis liegen). Codex, Gemini und opencode
lesen `AGENTS.md` bzw. `GEMINI.md` direkt; für sie ist die Basis die einzige
regeltragende Datei. Wohin welcher Client welche Datei kopiert: Teil B.

## A2. Harness + Doc-Harness

Das Harness (genereller Softwareentwicklungs-Workflow) und das Doc-Harness gelten
für jedes Projekt und werden global hinterlegt. `instructions/AGENTS.md` verweist
bereits darauf (Abschnitt „Software-Entwicklung — Harness"), damit jeder Agent es
ohne Projekt-Setup findet. Pro Projekt wählt der Agent den passenden Stack-Adapter
unter `harness/stacks/` (oder legt einen neuen an).

**Zwei Ablage-Strategien** (eine wählen):

1. **Zentrales Root (empfohlen bei mehreren Clients):** Harness einmal ablegen,
   `$AGENT_HARNESS_ROOT` darauf zeigen lassen. Der Lookup in
   `instructions/AGENTS.md` prüft diese Variable zuerst — dann brauchen die
   Clients **keine** eigene Harness-Kopie.
   Entwicklungs- und Doc-Harness liegen als Geschwister, damit ihre relativen
   Links und der SessionStart-Reminder in Quell- und Deploy-Layout identisch
   funktionieren.
   ```bash
   mkdir -p ~/.harness
   export AGENT_HARNESS_ROOT="$HOME/.harness/harness"
   echo 'export AGENT_HARNESS_ROOT="$HOME/.harness/harness"' >> ~/.zshrc
   rsync -a --delete harness/ ~/.harness/harness/
   rsync -a --delete doc-harness/ ~/.harness/doc-harness/
   ```
2. **Kopie pro Client:** Harness in das Config-Verzeichnis jedes Clients spiegeln
   (Befehl im jeweiligen Teil-B-Block).

> **Achtung — `--delete` ist destruktiv.** Alle `rsync`-Ziele für das Harness
> (`~/.harness/{harness,doc-harness}/`, `~/.{claude,codex,gemini}/harness/`,
> `~/.config/opencode/harness/`, die `doc-harness/`-Pendants,
> `~/.claude/commands/hx/`) sind **repo-owned Mirror**: `--delete` löscht im Ziel
> alles, was nicht aus der Quelle stammt. Das ist Absicht (sauberer Mirror),
> widerspricht aber der Merge-Regel im Kopf. Daher auf Systemen mit vorhandenen
> Daten **vor dem ersten Sync**: prüfen, dass das Ziel leer oder ein früherer
> Mirror ist (`ls`), sonst sichern/umlenken. Eigene Stack-Adapter gehören ins Repo
> (`harness/stacks/`), **nicht** ins Deploy-Ziel — sonst killt der nächste Sync
> sie. `$AGENT_HARNESS_ROOT` nie auf einen Pfad mit fremdem Inhalt zeigen.

Die Command-Library (`harness/commands/`) wird pro Client unterschiedlich
deployt und aufgerufen (Namespace-Konventionen weichen ab) — siehe Teil B.
`harness/commands/README.md` ist Doku, **kein** Command — beim Command-Deploy
ausschließen.

**Verify:** Beim zentralen Root existieren
`"$AGENT_HARNESS_ROOT/README.md"` **und**
`"$AGENT_HARNESS_ROOT/../doc-harness/README.md"`; bei einer Client-Kopie
existiert die jeweilige `harness/README.md`. `harness/stacks/` zeigt die Adapter.

## A3. GSD (get-shit-done)

GSD ist **kein** Marketplace-Plugin, sondern ein eigener Installer. Er liefert
Hooks (`gsd-*`), Skills/Commands (`gsd-*`, `gsd:*`) und die Statusline und legt
seine Runtime-Daten im Config-Verzeichnis des gewählten Clients ab
(`~/.claude/get-shit-done/`, `~/.codex/get-shit-done/`,
`~/.config/opencode/get-shit-done/`, …).

Installer ausführen (Version bewusst pinnen; npm-`latest` Stand 2026-06-27: `1.6.0`):
```bash
npx @opengsd/gsd-core@1.6.0
```
Der Installer fragt Runtime (Claude Code, Codex, Gemini, opencode …) und global
vs. lokal ab — pro einzurichtendem Client einmal laufen lassen. Dateien **nicht**
von Hand aus `agents/`/`commands/` kopieren; der Installer ist für die
Cross-Runtime-Kompatibilität nötig.

Hinweis: Das frühere Upstream-Repo `gsd-build/get-shit-done` ist archiviert;
Nachfolger ist `open-gsd/gsd-core` (npm `@opengsd/gsd-core`). Updates über den
`gsd-update`-Skill bzw. durch bewusstes Aktualisieren dieses Pins nach Prüfung.

**Verify:** Im Config-Verzeichnis des Clients existiert `get-shit-done/`; der
`gsd-help`-Skill ist verfügbar.

## A4. MCP-Server (Kern-Set)

Die MCP-Empfehlungen stehen in [`MCP_SERVERS.md`](MCP_SERVERS.md); das dort als
**Kern-Set** geführte Trio (context7, GitHub MCP, Playwright MCP) gehört zum
reproduzierten Setup. Pro Server:

- Install-Kommando aus der **offiziellen Doku** des Servers (Quelle steht in der
  Tabelle), Version **pinnen** — nicht `latest`.
- Tokens/Keys aus `.env`/Secret-Store, nie im Klartext in der MCP-Config;
  MCP-Config nicht versionieren.
- Entwicklungs-Server (dbhub, Docker) nur auf Maschinen mit lokalem Dev-Stack,
  nach den Sicherheitsregeln in `MCP_SERVERS.md` (read-only, keine
  Produktions-Credentials).

Der **Registrierungs-Mechanismus unterscheidet sich pro Client** (Claude:
`claude mcp add`; Codex/Gemini/opencode: jeweilige Config-Datei) — Details in der
Client-Doku, Server-Inventar in `MCP_SERVERS.md`. Wird ein Server dauerhaft
ergänzt/entfernt, die secret-freie Tabelle dort nachziehen.

**Verify:** Die MCP-Liste des Clients zeigt die Kern-Set-Server als verbunden.

## A5. Zusätzliche Skills (nicht aus GSD oder den Plugins)

Vollständiges Inventar mit GitHub-Quelle pro Skill: [`SKILLS.md`](SKILLS.md).
Verwaltung über die `skills`-CLI (`vercel-labs/skills`, Registry
[skills.sh](https://skills.sh), läuft via `npx` — kein Setup nötig); Lockfile
`~/.agents/.skill-lock.json` ist die Referenz, welcher Skill aus welcher Quelle
stammt (fehlt sie, aus `SKILLS.md` rekonstruieren).

```bash
npx skills add <owner/repo> -g            # ganzes Repo
npx skills add <owner/repo> -g -s <name>  # nur einen bestimmten Skill
```

Reihenfolge: erst die in `SKILLS.md` als **„Kern"** markierten Skills, dann
situative bei Bedarf; überlappende/seltene bewusst weglassen. Das Ziel-Verzeichnis
ist client-spezifisch (Teil B).

**Verify:** Das Skills-Verzeichnis des Clients zeigt die gewünschten
Nicht-GSD-Skills; `/find-skills` o. ä. ist aufrufbar.

### A5.1 Repo-eigene Skills (`skills/`)

Diese Skills gehören **diesem Repo** und stehen deshalb nicht im Lockfile aus A5 —
ihre Quelle ist das Verzeichnis `skills/`, kein fremdes GitHub-Repo. Ohne den
Kopier-Schritt in Teil B liegen sie nur im Checkout und sind für den Agenten **nicht
ladbar**:

| Skill | Zweck |
|---|---|
| [`ki-agent-setup`](skills/ki-agent-setup/SKILL.md) | dieses `APPLY.md` autonom anwenden — Setup bootstrappen bzw. syncen |
| [`design-md-curator`](skills/design-md-curator/SKILL.md) | eine `DESIGN.md` aus Repo-/URL-Evidenz erstellen und gegen `GUARDRAILS_UI.md` G validieren |
| [`linklist-curator`](skills/linklist-curator/SKILL.md) | Links in `harness/linklist.md` aufnehmen, inkl. Provenance-Auflösung |

Sie werden **verlinkt**, nicht über die `skills`-CLI installiert. Ziel-Verzeichnis ist
client-spezifisch (Teil B). Namenskollision vermeiden: ein repo-eigener Skill darf
nicht so heißen wie einer aus dem Lockfile (`SKILLS.md`) — der Link würde dessen
Eintrag stumm ersetzen.

## A6. Security-Basis (Kontrollen 1–2)

Der Hardening-Layer steht in [`security/`](security/README.md). Die als
Priorität 1 eingestuften, billigen mechanischen Kontrollen werden **immer**
eingerichtet — nicht erst bei autonomen Läufen:

1. **Secret-Scanning** nach [`security/01`](security/01-secret-scanning.md):
   `gitleaks` installieren und als Pre-Commit-Schritt einklinken
   (`gitleaks protect --staged --redact`).
2. **Tool-Guard** nach [`security/02`](security/02-tool-guard.md): einen
   PreToolUse-Block-Hook (matcher `Bash|Write|Edit`) nach dem Muster der
   `gsd-*`-Guards anlegen und in der Client-Hook-Config registrieren
   (fail-closed, exit 2 bei Treffer).

Kontrollen 03–07 (Proxy, Egress, Supply-Chain, Sandbox, Injection) je nach
Autonomiegrad ergänzen — Priorisierung siehe `security/README.md`.

**Verify:** `gitleaks version` liefert eine Version; die Hook-Config enthält den
PreToolUse-Guard; ein Test-Commit mit Dummy-Secret wird geblockt.

---

## A7. Externe Tool-Stände, gegen die das Harness verifiziert hat

Manche Harness-Regeln behaupten **beobachtetes Werkzeug-Verhalten** — Exit-Codes,
Severity-Stufen, Export-Familien. Solche Aussagen haben ein Verfallsdatum: das Tool
kann sich ändern, die committete Behauptung bleibt stehen. Deshalb hier dieselbe
Known-Good-Mechanik wie bei den Plugins (B1.2): geprüfter Stand + Datum, ein Kommando
zum Erkennen von Drift, bewusste Aktualisierung nach erneuter Prüfung.

| Tool | Known-Good (Stand 2026-07-28) | Drift erkennen |
|---|---|---|
| `@google/design.md` (npm) | `0.4.0` | `npx --yes @google/design.md --version` |

**Was daran hängt:** `harness/GUARDRAILS_UI.md` (Abschnitt G/Regel 7) und der
`DESIGN.md`-Block der drei Stack-Adapter. Verifiziert und unter `0.4.0` reproduziert:
Kontrast-Verstoß und ungültiges `components`-Sub-Token als `warning` bei **Exit 0**;
ungültiger Token-Name lässt `lint` mit Exit 0 passieren, bricht `export` mit
`INVALID_TOKEN_NAME` und **Exit 1**; `components` emittiert unter keinem Export-Target;
`omitted:` wechselt die Lint-Meldung, beide Zustände bleiben `info`.

**Warum das nötig ist — der Anlass, aus dem dieser Abschnitt entstand:** Die
Adapter-Kommandos rufen `npx --yes @google/design.md` **ungepinnt** auf, ziehen also
`latest`. Am 2026-07-28 fiel auf, dass `0.4.0` (Release 2026-07-27) bereits latest war,
während dieselben Proben zuvor `v0.3.0` gemeldet hatten — die Provenance-Angaben im
Harness waren dadurch kurzzeitig unsicher. Alle Befunde wurden gegen `@0.4.0` gepinnt
reproduziert und halten.

**Prüf-Anlass (kein Cron, bewusst):** Die npm-Release-Kadenz ist grob monatlich (0.1.0
2026-04-21 → 0.4.0 2026-07-27) und der Trigger ist die **Version**, nicht ein neuer
Upstream-Commit — Commits sind Rauschen, Releases sind das, was Verhalten ändert. Beim
`/hx:sync` (Schritt 3) und bei Arbeit an Abschnitt G die Version gegen die Tabelle prüfen;
weicht sie ab, die vier obigen Proben wiederholen, bevor die Tabelle neu gesetzt wird.

**Offene Alternative:** Statt Known-Good könnte man die Kommandos in den Adaptern hart
pinnen (`@google/design.md@0.4.0`). Das friert das Verhalten ein, verlangt aber, dass
jemand das Pin pflegt. Known-Good folgt dem Muster, das dieses Setup schon nutzt.

---

# TEIL B — Pro Client

Jeder Block sagt, was **dieser** Client zu tun hat: wohin er die Substanz aus
Teil A legt und welche client-eigene Mechanik dazukommt.

## B1. Claude Code (Primärziel)

Ziel-Verzeichnis: `~/.claude/`. Reichster Client — Plugins, Hooks, Statusline,
`@`-Import.

### B1.1 Instructions
Beide Dateien nach `~/.claude/` kopieren:
- `instructions/AGENTS.md` → `~/.claude/AGENTS.md`
- `instructions/CLAUDE.md` → `~/.claude/CLAUDE.md`

`CLAUDE.md` importiert die Basis via `@AGENTS.md` — beide müssen nebeneinander
liegen. Liegt dort schon eine `CLAUDE.md`, mergen statt überschreiben.

### B1.2 Plugin-Marketplaces + Plugins
```bash
claude plugin marketplace add DietrichGebert/ponytail
claude plugin marketplace add JuliusBrussee/caveman
claude plugin marketplace add openai/codex-plugin-cc
claude plugin marketplace add anthropics/claude-plugins-official

claude plugin install ponytail@ponytail
claude plugin install caveman@caveman
claude plugin install codex@openai-codex
claude plugin install claude-md-management@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install playwright@claude-plugins-official
```
`ponytail` liefert den Lösungs-Minimalismus (YAGNI-Leiter, stdlib/native vor
neuer Dependency) + Hooks (B1.5) und ist der **aktive** Modus. `caveman` liefert
Prosa-Kompression, bleibt aber **inaktiv** — die beiden greifen auf
unterschiedliche Achsen (was gebaut wird vs. wie geredet wird), sollten aber
nicht gleichzeitig laufen, weil beide jeden Turn in den Kontext injizieren. Die
drei `@claude-plugins-official`-Plugins ergänzen CLAUDE.md-Pflege,
Frontend-Design und Playwright-Browser-Automatisierung. `codex` bindet die
Codex-CLI in Claude Code ein (Review, adversariales Review, Delegation über
`/codex:*`) — es setzt eine installierte `codex`-CLI voraus (Teil B2).

caveman auf „installiert, aber aus" setzen:
```bash
mkdir -p ~/.config/caveman
printf '{\n  "defaultMode": "off"\n}\n' > ~/.config/caveman/config.json
rm -f ~/.claude/.caveman-active
```
`caveman-activate.js` liest diesen `defaultMode` und überspringt bei `off` die
Aktivierung vollständig; der Per-Turn-Reminder in `caveman-mode-tracker.js` hängt
am Flag `~/.claude/.caveman-active` und schweigt ohne es. `/caveman lite|full|ultra`
holt caveman jederzeit für die laufende Session zurück, ohne die Config zu ändern.

**Version-Pinning:** `claude plugin install`/`marketplace add` haben **kein**
Version-/Ref-Flag — die installierte Version ist der git-HEAD zum
Install-Zeitpunkt. Hartes Pinning wie bei GSD ist per CLI nicht möglich.
Stattdessen Known-Good dokumentieren; Drift über `claude plugin list` erkennen:

| Plugin | Known-Good | geprüft |
|---|---|---|
| `ponytail@ponytail` | `4.8.4` (Marketplace-HEAD `16f29800fd26`) | 2026-08-07 |
| `caveman@caveman` | `25d22f864ad6` | 2026-08-07 |
| `codex@openai-codex` | `1.0.3` | 2026-08-07 |
| `claude-md-management@claude-plugins-official` | `1.0.0` | 2026-06-30 |
| `frontend-design@claude-plugins-official` | `61c0597779bd` | 2026-06-30 |
| `playwright@claude-plugins-official` | `d53f6ca4cdb0` | 2026-06-30 |

Bewusste Aktualisierung: nach Prüfung diese Tabelle neu setzen. Reine git-Hashes
sind keine Semver-Tags — der Upstream-Marketplace vergibt keine stabilen Versionen.
`ponytail` ist das einzige Plugin hier mit eigener Semver-Angabe in seiner
`plugin.json`; der Hash daneben ist der Marketplace-Stand, gegen den geprüft wurde.

**Verify:** `claude plugin marketplace list` zeigt `ponytail`, `caveman`,
`openai-codex` **und** `claude-plugins-official` (der Marketplace registriert
sich als `openai-codex`, nicht unter dem Repo-Namen); `claude plugin list` zeigt
alle sechs als enabled, Versionen gemäß Tabelle (oder Abweichung bewusst
dokumentiert).

**Nicht Teil dieses Setups:** Plugins aus einem lokalen Verzeichnis-Marketplace
statt aus GitHub (auf der Ursprungsmaschine `thebrain`). Sie hängen an
maschinenlokalen Pfaden und sind aus diesem Repo nicht reproduzierbar —
`claude plugin list` kann deshalb mehr zeigen als die Tabelle oben. Kein Fehler,
solange die Tabellen-Einträge vollständig sind.

### B1.3 GSD-Runtime
Installer (A3) für Runtime „Claude Code" laufen lassen.
**Verify:** `~/.claude/hooks/gsd-statusline.js` existiert.

### B1.4 Globale Einstellungen (`~/.claude/settings.json`)
Top-Level-Keys setzen (mit Bestehenden mergen):
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
`permissions.allow` ist maschinen-/projektspezifisch — **nicht** aus diesem Repo
übernehmen, organisch wachsen lassen. Permission-Skip-Flags
(`skipDangerousModePermissionPrompt`, `skipAutoPermissionPrompt`) sind **kein
Default**; nur bewusst, temporär und mit Sandbox/VM setzen.

Statusline aktivieren:
```json
"statusLine": {
  "type": "command",
  "command": "node \"/Users/<USER>/.claude/hooks/gsd-statusline.js\""
}
```
`<USER>` auf den realen Home-Pfad setzen.

**Verify:** `claude` startet auf Deutsch, Thinking aktiv, dark-ansi; Statusline
zeigt Model-/Context-Zeile + Pfad + git-branch.

### B1.5 Hooks (`~/.claude/settings.json`)
Alle Hook-Skripte liegen in `~/.claude/hooks/`. Registrieren (Pfade auf reales
`$HOME` anpassen):
- **SessionStart:** `gsd-check-update.js`, `gsd-session-state.sh`,
  `harness-activate.sh` (siehe B1.6)
- **PreToolUse** (`Write|Edit`): `gsd-prompt-guard.js`, `gsd-read-guard.js`,
  `gsd-workflow-guard.js` — (`Bash`): `gsd-validate-commit.sh`
- **PostToolUse:** (`Bash|Edit|Write|MultiEdit|Agent|Task`) `gsd-context-monitor.js`;
  (`Read`) `gsd-read-injection-scanner.js`; (`Write|Edit`) `gsd-phase-boundary.sh`

`gsd-*`-Hooks kommen aus dem GSD-Installer (A3/B1.3). Laufen Hooks ohne PATH, den
absoluten Node-Pfad eintragen (`command -v node`) statt bloßes `node`.
Tool-Guard-Hook aus A6 hier ergänzen.

**Plugin-eigene Hooks nicht zusätzlich in `settings.json` eintragen.** Ein Plugin
registriert seine Hooks selbst über den `hooks`-Key seiner `.claude-plugin/plugin.json`;
Claude Code führt Plugin-Hooks **und** `settings.json`-Hooks aus. Steht dasselbe
Skript an beiden Stellen, läuft es **zweimal pro Auslöser** und injiziert seine
Ausgabe doppelt in den Kontext. Betrifft hier beide Modus-Plugins aus B1.2:
`ponytail` bringt `ponytail-activate.js` (SessionStart), `ponytail-mode-tracker.js`
(UserPromptSubmit) und `ponytail-subagent.js` (SubagentStart) mit, `caveman`
`caveman-activate.js` (SessionStart) und `caveman-mode-tracker.js`
(UserPromptSubmit) — keines davon gehört in `settings.json`. Frühere Fassungen
dieses Abschnitts schrieben genau das vor; wer danach eingerichtet hat, entfernt
die Einträge (Backup vorher).

**Verify:** keines der fünf Skripte ist in `settings.json` registriert; eine neue
Session zeigt den ponytail-Aktivierungsblock **genau einmal** und den
GSD-Update-Check. Doppelte Blöcke = Doppel-Registrierung.

```bash
# Doppel-Registrierung erkennen: liefert Treffer -> Eintrag aus settings.json entfernen
grep -c 'ponytail-activate\|ponytail-mode-tracker\|ponytail-subagent\|caveman-activate\|caveman-mode-tracker' ~/.claude/settings.json
```

Die Modus-Plugins schreiben ihren Zustand in Flag-Dateien unter `~/.claude/`
(`.ponytail-active`, `.caveman-active`) — die sind Laufzeit-Zustand, nicht Teil
dieses Repos und werden nicht mitgespiegelt.

### B1.6 Harness + Commands + Reminder
Harness-Kopie (falls kein zentrales Root aus A2):
```bash
rsync -a --delete harness/ ~/.claude/harness/
rsync -a --delete doc-harness/ ~/.claude/doc-harness/   # optional
```
Command-Library mit Namespace-Unterordner `hx/` (→ `/hx:start`, `/hx:spec`,
`/hx:review`, `/hx:verify`, `/hx:commit`, `/hx:pr`, `/hx:retro`, `/hx:sync`,
`/hx:park`, `/hx:hot-reload`, `/hx:eod`, `/hx:linklist`; `review`/`verify`
kollidieren sonst mit Built-in-Skills):
```bash
mkdir -p ~/.claude/commands/hx
rsync -a --delete --exclude README.md harness/commands/ ~/.claude/commands/hx/
```
**SessionStart-Reminder (nur Claude Code, optionale Härtung):** Der Harness-Pointer
steht in `instructions/AGENTS.md`, wird aber in einer langen Datei leicht
überlesen. `harness/hooks/harness-activate.sh` injiziert beim Session-Start einen
kurzen, unübersehbaren Reminder. Reine Kontext-Injektion, **kein Gate**.
```bash
cp harness/hooks/harness-activate.sh ~/.claude/hooks/harness-activate.sh
chmod +x ~/.claude/hooks/harness-activate.sh
# In settings.json unter hooks.SessionStart einen Eintrag ergänzen (mergen):
#   { "hooks": [ { "type": "command",
#                  "command": "bash \"$HOME/.claude/hooks/harness-activate.sh\"",
#                  "timeout": 5 } ] }
# Vorher Backup: cp ~/.claude/settings.json ~/.claude/settings.json.bak-$(date +%F)
```
Der Hook resolved den Root wie `instructions/AGENTS.md` (zuerst
`$AGENT_HARNESS_ROOT`, sonst `~/.claude/harness`); fehlt der Root, bleibt er still.

**Verify:** `~/.claude/harness/README.md` (oder `$AGENT_HARNESS_ROOT/README.md`)
existiert; `ls ~/.claude/commands/hx/` enthält die Harness-Commands; neue Session
zeigt eine `HARNESS AKTIV …`-Zeile.

### B1.7 MCP + Skills
MCP-Kern-Set (A4) via `claude mcp add …` registrieren. Skills (A5) landen in
`~/.claude/skills/`.

Repo-eigene Skills (A5.1) kommen in dasselbe Verzeichnis — **pro Skill ein Symlink
in den Checkout**, aus dem Repo-Root heraus:
```bash
for skill_dir in "$PWD"/skills/*/; do
  ln -sfn "${skill_dir%/}" "$HOME/.claude/skills/$(basename "$skill_dir")"
done
```
Symlink statt Kopie aus zwei Gründen: `~/.claude/skills/` besteht auf dieser
Maschine ohnehin aus Symlinks pro Skill (die Lockfile-Skills zeigen von dort nach
`~/.agents/skills/`), und ein Link in den Checkout kann nicht veralten — was im Repo
geändert wird, ist sofort scharf. Denselben Weg geht B2.1 für `AGENTS.md`. `-n`
verhindert, dass der Link bei erneutem Lauf *in* das bestehende Ziel gelegt wird;
die Schleife ist damit idempotent.

**Nie `rsync -a --delete` auf `~/.claude/skills/` selbst.** Dort liegen die
Symlinks auf alle Lockfile-Skills aus A5 — ein Sync mit Löschen entfernt sie
sämtlich. Wiederherstellbar ist das (die Skills selbst liegen in
`~/.agents/skills/`), aber bis zum Neu-Verlinken sieht Claude keinen davon.

Tradeoff, benennen statt verschweigen: die Schleife liest die Liste beim Deploy aus
dem Repo, kann also nur anlegen und aktualisieren — **nie aufräumen**. Wird ein
repo-eigener Skill umbenannt oder gelöscht (passiert: `af9a506` hat
`skills/setup-ki-agent` → `skills/ki-agent-setup` umbenannt), bleibt der alte Link
liegen und zeigt ins Leere; er muss von Hand gelöscht werden. Ein Präfix-Namespace,
den der Deploy löschen dürfte (wie `hx-` bei Codex, B2.3), ginge nicht ohne die
`name:`-Frontmatter umzuschreiben — dafür ist der Fall zu klein. Zweiter Preis des
Links: der Checkout muss an seinem Pfad bleiben (`~/code/ki-agent-setup`).

Die anderen Clients werden hier **bewusst nicht** verdrahtet: die Links liegen unter
`~/.claude/skills/`, nicht im geteilten `~/.agents/skills/`, das mit dem
Codex-Helper (B2.3) schon einen Besitzer hat — Codex sieht sie also nicht. Die
`SKILL.md`-Dateien sind außerdem Claude-Prosa ohne die Codex-Metadaten. Repo-eigene
Skills dort auszurollen ist eine eigene Entscheidung.

**Verify:** `claude mcp list` zeigt das Kern-Set verbunden; `ls -l ~/.claude/skills/`
zeigt die Nicht-GSD-Skills und die drei Links aus A5.1 (`ki-agent-setup`,
`design-md-curator`, `linklist-curator`) auf den Checkout;
`head -2 ~/.claude/skills/design-md-curator/SKILL.md` ist über den Link lesbar.

## B2. Codex CLI

Ziel-Verzeichnis: `~/.codex/`. Kein separates Delta — Codex liest `AGENTS.md`
direkt; die Codex-Hinweise stehen im markierten Abschnitt darin.

### B2.1 Instructions
```bash
ln -sf "$(pwd)/instructions/AGENTS.md" ~/.codex/AGENTS.md   # oder kopieren
```
Kein `CODEX.md` anlegen.
**Verify:** `cmp -s instructions/AGENTS.md ~/.codex/AGENTS.md` ist grün. Damit
werden auch veraltete Kopien erkannt; ein reiner Existenz- oder Heading-Check
reicht nicht.

### B2.2 GSD-Runtime
Installer (A3) für Runtime „Codex" laufen lassen (Runtime-Daten unter
`~/.codex/get-shit-done`).

### B2.3 Harness + Commands
Harness-Kopie (falls kein zentrales Root aus A2):
```bash
rsync -a --delete harness/ ~/.codex/harness/
rsync -a --delete doc-harness/ ~/.codex/doc-harness/   # optional
```

Codex nutzt für wiederverwendbare Workflows
[Agent Skills](https://developers.openai.com/codex/skills); Custom Prompts unter
`~/.codex/prompts/` wurden
[ab Codex CLI `0.117.0` entfernt](https://github.com/openai/codex/issues/15941).
Der Deploy-Helper rendert deshalb jede Command-Quelle als explizit aufzurufenden
Skill unter
`~/.agents/skills/hx-<name>/SKILL.md`. Aufruf: `$hx-start`, `$hx-spec` usw.
Interne Claude-Referenzen wie `/hx:retro` werden im generierten Skill zu
`$hx-retro`; `$ARGUMENTS` bezeichnet dort den Text hinter dem Skill-Namen.

`~/.agents/skills/` ist geteilt. Der Helper besitzt und ersetzt deshalb nur
Unterordner mit Präfix `hx-`; fremde Skills bleiben unangetastet:

```bash
# Einmalige Migration vom früheren Prompt-Deploy (nur repo-eigenes Präfix):
rm -f "${CODEX_HOME:-$HOME/.codex}"/prompts/hx-*.md
scripts/deploy-codex-harness-skills.sh
```

Harness-Lookup für Codex: zuerst `$AGENT_HARNESS_ROOT/README.md`, dann
`~/.codex/harness/README.md`.

**Verify:** Bei der Client-Kopie ist `diff -qr harness/ ~/.codex/harness/` grün
(beim zentralen Root entsprechend gegen `$AGENT_HARNESS_ROOT` vergleichen).
`scripts/deploy-codex-harness-skills.sh --check` bestätigt, dass alle
`hx-*`-Skills exakt aus den Command-Quellen gerendert wurden und keine veralteten
Harness-Skills übrig sind. In einer neuen Codex-Session listet `/skills` die
Skills und `$hx-start` lädt Harness plus Projektstand.

### B2.4 MCP + Skills
MCP-Kern-Set (A4) in der Codex-MCP-Config registrieren (Mechanismus: Codex-Doku;
Inventar: `MCP_SERVERS.md`). Für reproduzierbare Checks die kanonischen Namen
`context7`, `github` und `playwright` verwenden. Skills (A5) nach
Codex-Konvention verlinken.

**Verify:** Alle drei Server sind registriert und aktiviert:

```bash
for codex_mcp_name in context7 github playwright; do
  codex mcp get "$codex_mcp_name" --json | grep -q '"enabled": true'
done
```

## B3. Gemini CLI

Ziel-Verzeichnis: `~/.gemini/`. Gemini nutzt `GEMINI.md`.

### B3.1 Instructions
`~/.gemini/GEMINI.md` aus der Basis `instructions/AGENTS.md` ableiten
(kopieren/symlinken).
**Verify:** `~/.gemini/GEMINI.md` existiert und deckt die Arbeitsweise ab.

### B3.2 GSD-Runtime
Installer (A3) für Runtime „Gemini" laufen lassen.

### B3.3 Harness
Harness-Kopie (falls kein zentrales Root aus A2):
```bash
rsync -a --delete harness/ ~/.gemini/harness/
rsync -a --delete doc-harness/ ~/.gemini/doc-harness/   # optional
```
Der Harness-Pointer steht bereits in der abgeleiteten `GEMINI.md`.
**Verify:** `~/.gemini/harness/README.md` (oder `$AGENT_HARNESS_ROOT/README.md`)
existiert.

> **Offen:** Deploy der `/hx:…`-Command-Library für Gemini ist noch nicht
> festgelegt (Geminis Custom-Command-Mechanismus weicht ab). Bei Bedarf ergänzen
> und hier dokumentieren, statt ungeprüft ein Schema anzunehmen.

### B3.4 MCP + Skills
MCP-Kern-Set (A4) in der Gemini-MCP-Config registrieren (Mechanismus: Gemini-Doku;
Inventar: `MCP_SERVERS.md`). Skills (A5) nach Gemini-Konvention verlinken.

## B4. opencode

Ziel-Verzeichnis: `~/.config/opencode/`. opencode liest globale Regeln aus
`~/.config/opencode/AGENTS.md` und zusätzlich `~/.claude/CLAUDE.md` als
Claude-Kompatibilität — expandiert dabei aber **keine** `@AGENTS.md`-Imports.
Deshalb reicht die Compat-`CLAUDE.md` nicht: ohne eigenständige `AGENTS.md`
bekäme opencode nur das Claude-Delta ohne die Basis-Regeln. Die Basis muss also
direkt als `AGENTS.md` vorliegen.

### B4.1 Instructions
```bash
cp instructions/AGENTS.md ~/.config/opencode/AGENTS.md   # oder symlinken
```
**Verify:** `~/.config/opencode/AGENTS.md` existiert und enthält Arbeitsweise +
Harness-Pointer.

### B4.2 GSD-Runtime
Installer (A3) für Runtime „opencode" laufen lassen (Runtime-Daten unter
`~/.config/opencode/get-shit-done`).
**Verify:** `~/.config/opencode/get-shit-done/` existiert.

### B4.3 Harness + Commands
Harness ist über `$AGENT_HARNESS_ROOT` (A2) bereits erreichbar — opencode erbt die
Shell-Env, ein eigener Mirror ist **nicht** nötig. Nur ohne zentrales Root eine
Kopie anlegen:
```bash
rsync -a --delete harness/ ~/.config/opencode/harness/   # nur ohne AGENT_HARNESS_ROOT
rsync -a --delete doc-harness/ ~/.config/opencode/doc-harness/   # optional
```
Command-Library: opencode liest Custom-Commands **flach** aus
`~/.config/opencode/command/*.md` (Filename = Command-Name, **kein**
`:`-Namespace; Verzeichnis ist der vom GSD-Installer für opencode bespielte Ort —
die opencode-Doc nennt teils `commands/`, maßgeblich ist der installierte Pfad).
Wie bei Codex → `hx-<name>` mit `sed`-Rewrite der Cross-Refs.
Das Verzeichnis ist **geteilt** (enthält GSD-Commands) — kein `rsync --delete`;
Delete-by-Präfix:
```bash
mkdir -p ~/.config/opencode/command
rm -f ~/.config/opencode/command/hx-*.md
for f in harness/commands/*.md; do
  base=$(basename "$f"); [ "$base" = "README.md" ] && continue
  sed 's#/hx:#/hx-#g' "$f" > ~/.config/opencode/command/hx-"$base"
done
```
**Verify:** Harness via `$AGENT_HARNESS_ROOT/README.md` erreichbar (oder Kopie
unter `~/.config/opencode/harness/`); `ls ~/.config/opencode/command/` enthält die
Commands als `hx-*.md`; `grep -rl '/hx:' ~/.config/opencode/command/hx-*.md`
liefert **nichts**.

### B4.4 MCP + Skills
MCP-Kern-Set (A4) in `~/.config/opencode/opencode.json` unter dem `mcp`-Key
registrieren (Schema: opencode-Doku; Inventar: `MCP_SERVERS.md`). Skills (A5) nach
opencode-Konvention.

---

## Abschluss-Verifikation

Kern (Teil A), unabhängig vom Client:
- `"$AGENT_HARNESS_ROOT/README.md"` **oder** die client-lokale Harness-Kopie
  vorhanden; `harness/stacks/` zeigt die Adapter.
- GSD-Runtime im Config-Verzeichnis des Clients (`get-shit-done/`); `gsd-help`
  verfügbar.
- MCP-Kern-Set aus `MCP_SERVERS.md` verbunden.
- Security-Basis aktiv: gitleaks im Pre-Commit, Tool-Guard-Hook registriert.

Pro eingerichtetem Client zusätzlich der Verify-Block seines Abschnitts in Teil B.
Für Claude Code speziell:
- `claude plugin list` → ponytail, caveman, codex + die drei
  `claude-plugins-official`-Plugins enabled.
- Neue Session: ponytail-Mode aktiv, caveman still (kein Aktivierungsblock),
  GSD-Statusline sichtbar; in einem `.planning/`-Projekt zeigt die Statusline den
  GSD-State.

Bei Abweichungen oder fehlenden Quellen melden statt raten.

Für Änderungen an diesem Repo vor dem Commit zusätzlich:
```bash
make verify-docs
```
