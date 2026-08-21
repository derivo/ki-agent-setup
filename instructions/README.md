# instructions/ — Cross-Client-Anweisungen

Die portablen Agent-Anweisungen, geschichtet: **eine gemeinsame Basis, dünne
Client-Ergänzungen.** So gibt es eine Quelle der Wahrheit statt N kopierter
Regelsätze.

```
AGENTS.md   ← gemeinsame Basis. Standard; Codex-Hinweise sind klar markiert.
CLAUDE.md   ← Claude-only-Delta (GSD, ponytail, Skills) + importiert AGENTS.md
```

`CLAUDE.md` bindet die Basis über die Claude-Code-Import-Syntax `@AGENTS.md` ein —
beim Deployen müssen beide Dateien im selben Verzeichnis liegen.
Codex bekommt kein separates Delta: Codex liest `AGENTS.md`, deshalb stehen die
wenigen Codex-spezifischen Hinweise dort in einem eigenen Abschnitt.

## Hintergrund: der Standard

- **`AGENTS.md`** ist das client-übergreifende Format ([agents.md](https://agents.md),
  Linux Foundation / Agentic AI Foundation). Nativ gelesen von Codex CLI, Cursor,
  Copilot, Windsurf, Aider, Zed u. a.
- **Claude Code** liest `AGENTS.md` ebenfalls, bevorzugt aber `CLAUDE.md` (reichere
  Memory-Hierarchie, `@`-Imports).
- **opencode** liest `~/.config/opencode/AGENTS.md` (global) und zusätzlich
  `~/.claude/CLAUDE.md` als Compat — expandiert dabei aber **keine**
  `@AGENTS.md`-Imports. Deshalb braucht opencode die Basis direkt als eigene
  `AGENTS.md`; die Compat-`CLAUDE.md` allein liefert nur das Claude-Delta.
- **Global/maschinenweit** gibt es *keinen* einheitlichen Standard — jeder Client
  hat seinen eigenen Ort. Cross-Client global geht nur per Symlink/Konvention.

## Deployment pro Client

| Client | Ziel (global) | Vorgehen |
|---|---|---|
| Claude Code | `~/.claude/CLAUDE.md` (+ `~/.claude/AGENTS.md`) | beide Dateien kopieren; `CLAUDE.md` importiert `AGENTS.md` |
| Codex CLI | `~/.codex/AGENTS.md` | `AGENTS.md` kopieren oder symlinken; der Codex-Abschnitt bleibt darin |
| opencode | `~/.config/opencode/AGENTS.md` | `AGENTS.md` kopieren/symlinken (kein `@`-Import) |
| Cursor u. a. | projektweit `AGENTS.md` | im Projekt ablegen |

Symlink-Beispiel (eine Quelle, mehrere Clients):
```bash
ln -sf "$(pwd)/instructions/AGENTS.md" ~/.codex/AGENTS.md
```

**Projekt-Ebene:** Ein `AGENTS.md` in der Projektwurzel wird von allen genannten
Tools gelesen — die zuverlässigste gemeinsame Ablage. Claude ergänzt es per
projekt-lokaler `CLAUDE.md`, falls Claude-Spezifika nötig sind.

## Pflege
Regel ändern → entscheiden: client-übergreifend → `AGENTS.md`; nur Claude →
`CLAUDE.md`; nur Codex → klar markierter Abschnitt in `AGENTS.md`. Im Zweifel in
die Basis, Ergänzung klein halten.
