# Command-Library — wiederverwendbare Slash-Commands

Dünne, stack-neutrale Slash-Commands, die den Harness-Workflow als ein Wort
abrufbar machen. Jeder Command ist eine Markdown-Datei mit der Anweisung, die der
Agent ausführt — einmal geschrieben, spart über die Projektlaufzeit hunderte
wiederholter Prompts und erzwingt konsistente Abläufe (Commit-Format,
Review-Tiefe, Verify-Schritte).

## Deployment

Commands müssen in einem von Claude Code gescannten Verzeichnis liegen:
- **Global:** `~/.claude/commands/` → überall aufrufbar.
- **Projekt:** `<repo>/.claude/commands/` → nur im Projekt.

Aufruf als `/<name>`. Empfohlen ist ein Namespace, weil `review`/`verify` mit
Built-ins kollidieren können: `commands/hx/commit.md` → `/hx:commit`.

```bash
# global deployen (empfohlen)
mkdir -p ~/.claude/commands/hx
rsync -a --delete --exclude README.md harness/commands/ ~/.claude/commands/hx/
```

> `--delete` ist destruktiv: `~/.claude/commands/hx/` ist ein repo-owned Mirror,
> alles dort Fremde wird gelöscht. Vor erstem Sync auf vorhandene Daten prüfen —
> siehe Guardrail in [`APPLY.md`](../../APPLY.md) Schritt 7c.

## Commands

| Command | Zweck | Bindet an |
|---|---|---|
| [`/hx:spec`](spec.md) | Idee → geschärfte, testbare Feature-Spec | SPEC_WORKFLOW, FEATURE_TEMPLATE |
| [`/hx:review`](review.md) | Multi-Agent-Review-Panel über den Diff | REVIEW_PANEL |
| [`/hx:verify`](verify.md) | App wirklich starten, Verhalten end-to-end beobachten | TESTS, GUARDRAILS C |
| [`/hx:commit`](commit.md) | Pre-Commit-Check + atomarer, konventioneller Commit | GUARDRAILS, Pre-Commit-Check |
| [`/hx:pr`](pr.md) | PR vorbereiten: Gate grün, AC-Abdeckung, Branch/PR | AGENT_LOOP, feature.md |
| [`/hx:retro`](retro.md) | Session-Rückblick: Gelerntes klassifizieren + ans richtige Ziel routen | SELF_OPTIMIZATION, Memory/GSD/TheBrain |
| [`/hx:hot-reload`](hot-reload.md) | `/hx:retro` + Zustand sichern + `/clear`-Reset vorbereiten | retro.md |

> `README.md` (diese Datei) ist Doku, **kein** Command — beim Deployen nach
> `~/.claude/commands/` ausschließen.

Diese Commands referenzieren die Harness-Dateien (global unter
`~/.claude/harness/`). Neue Commands nach demselben Muster ergänzen: kurz,
ein Zweck, an eine Harness-Regel gebunden.
