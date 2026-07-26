# Command-/Skill-Library — wiederverwendbare Harness-Workflows

Dünne, stack-neutrale Workflow-Quellen, die den Harness als kurzen Command oder
Skill abrufbar machen. Jede Quelle ist eine Markdown-Datei mit der Anweisung, die
der Agent ausführt. Claude Code lädt sie direkt als Slash-Commands; Codex
bekommt daraus generierte Agent Skills.

## Deployment

**Claude Code** scannt `~/.claude/commands/` (global) bzw. `<repo>/.claude/commands/`
(projekt). Aufruf als `/<name>`; empfohlen ist ein Namespace über den Unterordner
`hx/`, weil `review`/`verify` mit Built-ins kollidieren: `commands/hx/commit.md`
→ `/hx:commit`.

```bash
# global deployen (empfohlen)
mkdir -p ~/.claude/commands/hx
rsync -a --delete --exclude README.md harness/commands/ ~/.claude/commands/hx/
```

**Codex CLI** nutzt
[Agent Skills](https://developers.openai.com/codex/skills). Custom Prompts unter
`~/.codex/prompts/` wurden
[ab Codex CLI `0.117.0` entfernt](https://github.com/openai/codex/issues/15941).
Der Deploy-Helper rendert deshalb jede Quelle als Skill unter
`~/.agents/skills/hx-<name>/SKILL.md`; Aufruf ist `$hx-commit`, `$hx-start` usw.
Er übersetzt interne `/hx:<name>`-Referenzen zu `$hx-<name>` und erklärt dem
Skill die Bedeutung des Command-Platzhalters `$ARGUMENTS`.

`~/.agents/skills/` ist geteilt. Der Helper ersetzt nur die von dieser Library
besessenen `hx-*`-Unterordner; andere Skills bleiben erhalten.

```bash
# Einmalige Migration vom früheren Prompt-Deploy (nur repo-eigenes Präfix):
rm -f "${CODEX_HOME:-$HOME/.codex}"/prompts/hx-*.md
scripts/deploy-codex-harness-skills.sh
scripts/deploy-codex-harness-skills.sh --check
```

> `--delete` ist destruktiv: `~/.claude/commands/hx/` ist ein repo-owned Mirror.
> Der Codex-Helper löscht entsprechend vorhandene `~/.agents/skills/hx-*`; der
> Migrationsbefehl entfernt alte `prompts/hx-*.md`. Vor erstem Sync auf vorhandene
> Daten prüfen — siehe Guardrail in [`APPLY.md`](../../APPLY.md) Schritt 7c.

## Commands

| Quelle / Claude | Codex | Zweck | Bindet an |
|---|---|---|---|
| [`/hx:start`](start.md) | `$hx-start` | Session-Start: Harness laden, Projektstand erfassen, bereit melden | README-Lesereihenfolge, GUARDRAILS, Stack-Adapter |
| [`/hx:spec`](spec.md) | `$hx-spec` | Idee → geschärfte, testbare Feature-Spec | SPEC_WORKFLOW, FEATURE_TEMPLATE |
| [`/hx:review`](review.md) | `$hx-review` | Multi-Agent-Review-Panel über den Diff | REVIEW_PANEL |
| [`/hx:verify`](verify.md) | `$hx-verify` | App wirklich starten, Verhalten end-to-end beobachten | TESTS, GUARDRAILS C |
| [`/hx:commit`](commit.md) | `$hx-commit` | Pre-Commit-Check + atomarer, konventioneller Commit | GUARDRAILS, Pre-Commit-Check |
| [`/hx:pr`](pr.md) | `$hx-pr` | PR vorbereiten: Gate grün, AC-Abdeckung, Branch/PR | AGENT_LOOP, feature.md |
| [`/hx:retro`](retro.md) | `$hx-retro` | Session-Rückblick: Gelerntes klassifizieren + ans richtige Ziel routen | SELF_OPTIMIZATION, Memory/GSD/TheBrain |
| [`/hx:hot-reload`](hot-reload.md) | `$hx-hot-reload` | Retro + Zustand sichern + Session-Neustart vorbereiten | retro.md |
| [`/hx:eod`](eod.md) | `$hx-eod` | Tagesabschluss: retro + Arbeitsstand/Commit-Check + State + Übergabe an morgen | retro.md, commit.md, Arbeits-Tracking |
| [`/hx:linklist`](linklist.md) | `$hx-linklist` | Kuratierte Linkliste ausgeben | linklist.md |

> `README.md` (diese Datei) ist Doku, **kein** Command — beim Deployen nach
> `~/.claude/commands/` ausschließen.

Die Quellen referenzieren die Harness-Dateien über deren dokumentierte
Lookup-Reihenfolge. Neue Workflows nach demselben Muster ergänzen: kurz, ein
Zweck, an eine Harness-Regel gebunden.
