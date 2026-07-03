# Command-Library — wiederverwendbare Slash-Commands

Dünne, stack-neutrale Slash-Commands, die den Harness-Workflow als ein Wort
abrufbar machen. Jeder Command ist eine Markdown-Datei mit der Anweisung, die der
Agent ausführt — einmal geschrieben, spart über die Projektlaufzeit hunderte
wiederholter Prompts und erzwingt konsistente Abläufe (Commit-Format,
Review-Tiefe, Verify-Schritte).

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

**Codex CLI** scannt `~/.codex/prompts/*.md` flach und kennt **kein**
`:`-Namespace-Schema. Der Claude-Namespace `/hx:<name>` wird bei Codex deshalb zum
Datei-Präfix `hx-<name>` → `/hx-commit`, `/hx-start` usw. Die internen Cross-Refs
(`/hx:retro` in `eod.md` etc.) werden beim Deploy per `sed` auf `/hx-` mitgezogen.
`~/.codex/prompts/` ist flach und geteilt (kein dedizierter Namespace-Ordner wie
Claudes `hx/`), darum kein `rsync --delete` — stattdessen Delete-by-Präfix: nur
`hx-*.md` vorab wegräumen, damit entfernte Commands keine Leichen hinterlassen,
fremde Prompts aber bleiben.

```bash
mkdir -p ~/.codex/prompts
rm -f ~/.codex/prompts/hx-*.md
for f in harness/commands/*.md; do
  base=$(basename "$f"); [ "$base" = "README.md" ] && continue
  sed 's#/hx:#/hx-#g' "$f" > ~/.codex/prompts/hx-"$base"
done
```

> `--delete` ist destruktiv: `~/.claude/commands/hx/` ist ein repo-owned Mirror,
> alles dort Fremde wird gelöscht. Vor erstem Sync auf vorhandene Daten prüfen —
> siehe Guardrail in [`APPLY.md`](../../APPLY.md) Schritt 7c.

## Commands

| Command | Zweck | Bindet an |
|---|---|---|
| [`/hx:start`](start.md) | Session-Start: Harness laden, Projektstand erfassen, bereit melden | README-Lesereihenfolge, GUARDRAILS, Stack-Adapter |
| [`/hx:spec`](spec.md) | Idee → geschärfte, testbare Feature-Spec | SPEC_WORKFLOW, FEATURE_TEMPLATE |
| [`/hx:review`](review.md) | Multi-Agent-Review-Panel über den Diff | REVIEW_PANEL |
| [`/hx:verify`](verify.md) | App wirklich starten, Verhalten end-to-end beobachten | TESTS, GUARDRAILS C |
| [`/hx:commit`](commit.md) | Pre-Commit-Check + atomarer, konventioneller Commit | GUARDRAILS, Pre-Commit-Check |
| [`/hx:pr`](pr.md) | PR vorbereiten: Gate grün, AC-Abdeckung, Branch/PR | AGENT_LOOP, feature.md |
| [`/hx:retro`](retro.md) | Session-Rückblick: Gelerntes klassifizieren + ans richtige Ziel routen | SELF_OPTIMIZATION, Memory/GSD/TheBrain |
| [`/hx:hot-reload`](hot-reload.md) | `/hx:retro` + Zustand sichern + `/clear`-Reset vorbereiten | retro.md |
| [`/hx:eod`](eod.md) | Tagesabschluss: retro + Arbeitsstand/Commit-Check + State + Übergabe an morgen | retro.md, commit.md, Arbeits-Tracking |

> `README.md` (diese Datei) ist Doku, **kein** Command — beim Deployen nach
> `~/.claude/commands/` ausschließen.

Diese Commands referenzieren die Harness-Dateien (global unter
`~/.claude/harness/`). Neue Commands nach demselben Muster ergänzen: kurz,
ein Zweck, an eine Harness-Regel gebunden.
