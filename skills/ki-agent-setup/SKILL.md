---
name: ki-agent-setup
description: Bootet das lokale KI-Agent-Setup aus diesem Repo autonom zusammen. Use when the user checks out the ki-agent-setup repo on a (new) machine and wants the Claude Code setup plus cross-client instructions/harness mirrors assembled, synced, or updated — e.g. "bau mein KI-Agent-Setup auf", "wende ki-agent-setup an", "richte den Agenten ein", "sync mein Setup". Reads APPLY.md, installs plugins, configures ~/.claude and ~/.codex/AGENTS.md, verifies, and can drop the harness docs into a dev project.
---

# ki-agent-setup

Dieser Skill macht das ki-agent-setup-Repo selbst-anwendend: Ein Agent liest ihn nach
dem Checkout und baut das lokale Claude-Code-Setup plus die
client-übergreifenden Arbeitsregeln/Harness-Mirrors autonom zusammen — Plugins,
globale Config, GSD, caveman, Statusline, Arbeitsregeln. Optional verdrahtet er
das Entwicklungs-Harness in ein Zielprojekt.

Der Skill **dupliziert keine Details**. Er ist der Orchestrator; die
Einzelschritte stehen in [`APPLY.md`](../../APPLY.md) (Setup) und
[`harness/README.md`](../../harness/README.md) (Dev-Workflow). Diese Dateien sind
die Single-Source-of-Truth — bei Widerspruch gewinnen sie, nicht dieser Skill.

## Wann anwenden
- Repo frisch ausgecheckt, Setup soll auf der Maschine entstehen.
- Bestehendes Setup soll auf den Repo-Stand gesynct/geupdatet werden.
- Harness-Doku soll in ein neues PHP/Slim-Projekt übernommen werden.

## Ablauf

### 1. Orientieren
- Repo-Wurzel finden (dort liegen `README.md`, `APPLY.md`, `harness/`).
- `README.md` lesen → Überblick, Statusline-Aufbau, Tool-Liste.
- `APPLY.md` lesen → die verbindlichen Setup-Schritte (Teil A = gemeinsamer Kern
  A1–A6, Teil B = Block des einzurichtenden Clients B1–B4).
- Bestehenden Stand erfassen: `~/.claude/settings.json`, `claude plugin list`,
  vorhandene `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`,
  `~/.codex/harness/`, `~/.agents/skills/hx-*` und `codex mcp list`. **Nicht**
  blind überschreiben — mergen.

### 2. Setup anwenden (APPLY.md vollständig: Teil A + der passende Teil-B-Block)
Arbeite APPLY.md Schritt für Schritt ab und prüfe je Schritt das dort genannte
Verify-Kriterium, bevor du weitergehst:
1. Marketplaces registrieren.
2. Plugins installieren (caveman + die drei `claude-plugins-official`-Plugins).
3. GSD installieren (eigener Installer, kein Marketplace-Plugin).
4. Statusline aktivieren (`gsd-statusline.js`, Pfad auf reales `$HOME`).
5. Hooks eintragen (GSD-Guards, Tool-Guard). **Plugin-eigene Hooks nicht** —
   `caveman-activate`/`caveman-mode-tracker` bringt das Plugin selbst mit, ein
   zweiter Eintrag in `settings.json` lässt sie doppelt feuern (`APPLY.md` B1.5).
6. Globale Settings setzen (Deutsch, Thinking, effort high, Theme …).
7. Globale Arbeitsregeln (`AGENTS.md`/`CLAUDE.md`, inkl. Codex-Abschnitt in
   `AGENTS.md`) sicherstellen.
8. Zusätzliche Nicht-GSD/caveman-Skills nach `SKILLS.md`/Lockfile herstellen.
9. Harness und optional doc-harness client-übergreifend hinterlegen; Claude-
   Commands unter `/hx:*` und Codex-Skills unter `$hx-*` deployen.
10. MCP-Kern-Set installieren (Versionen pinnen; Inventar = `MCP_SERVERS.md`).
11. Security-Basis einrichten (Secret-Scan + Tool-Guard, `security/01`–`02`).
12. Abschluss-Verifikation.

`permissions.allow` **nicht** aus dem Repo übernehmen — maschinenspezifisch, wächst
organisch (steht so in APPLY.md).

### 3. Sicherheits- und Konfliktregeln
- Pfade mit `<USER>` / absolute Pfade auf das reale `$HOME` der Maschine setzen.
- Quelle/Marketplace fehlt auf der Zielmaschine → diesen Teil überspringen und
  **melden**, nicht raten.
- Bestehende User-Werte abweichend vom Repo → Abweichung melden, nicht still
  überschreiben.
- Schritte, die etwas installieren oder globale Client-Verzeichnisse ändern, vor
  Ausführung kurz ankündigen.

### 4. Harness optional einsetzen
Soll ein PHP/Slim-Projekt nach dem Harness entwickelt werden:
- `harness/README.md` lesen → Einstiegspunkt + Trigger-Tabelle (Tier 1 immer,
  Rest gegen Trigger).
- Die Doku-Dateien (`ROADMAP`, `GUARDRAILS`, `SPEC_WORKFLOW`, `FEATURE_TEMPLATE`,
  `TESTS`, `AGENT_LOOP`, `feature`) ins Zielprojekt übernehmen oder dort
  referenzieren.
- Ab da gilt der Loop aus `harness/AGENT_LOOP.md` und die Regeln aus
  `harness/GUARDRAILS.md`.

### 5. Abschluss melden
Kurzer Report: Was installiert/konfiguriert wurde, welche Verify-Checks grün sind,
was übersprungen/abweichend war. Bei rotem Verify: Ursache nennen, nicht
"fertig" melden.

## Repo-Pflege: Pre-Commit-Konsistenzcheck (Pflicht)

Vor **jedem** Commit in diesem Repo läuft ein Dry-Run-Konsistenzcheck — nichts
installieren/ändern, nur prüfen. Ziel: das Repo beschreibt weiterhin ein
reproduzierbares, stimmiges Setup, bevor etwas eingecheckt wird.

Prüfpunkte:
1. **APPLY.md noch gültig** — Befehle syntaktisch ok; Marketplace-/Quell-Repos
   erreichbar (z. B. `gh api repos/<owner>/<repo>`); keine toten Links; GSD- und
   Skill-Install-Quellen existieren noch (nicht archiviert/umgezogen).
2. **instructions/ und Codex-Deploy kohärent** — `CLAUDE.md` importiert
   `@AGENTS.md`; der Codex-Abschnitt bleibt in `AGENTS.md` klar markiert; kein
   Widerspruch/Duplikat zwischen Basis und Delta. Codex-Workflows werden als
   `$hx-*`-Skills ausgerollt; `deploy-codex-harness-skills.sh --check` erkennt
   veraltete Kopien.
3. **SKILLS.md** — Inventar vs. `~/.agents/.skill-lock.json`; genannte Quell-Repos
   existieren.
4. **Statusline-Doku vs. reales Script** — die in README beschriebene Struktur
   deckt sich mit `~/.claude/hooks/gsd-statusline.js`.
5. **Diagramme rendern** — Mermaid-Blöcke parsen (z. B. `mermaid-cli` lokal).
6. **Querverweise** — interne Markdown-Links zeigen auf existierende Dateien.
7. **Repo-Basischeck** — `make verify-docs` läuft grün.

Ablauf:
- Check ausführen, **Abweichungen/Findings dem User anzeigen** (priorisiert:
  Blocker / Lücke / Abweichung), bevor committet wird.
- **Freigabe einholen.** Erst nach explizitem OK committen — nie automatisch
  (siehe Freigabe-Regel in `../../instructions/AGENTS.md`).
- Provenance-Pflicht: jede im Commit enthaltene URL in derselben Session auflösen,
  nicht aus Erinnerung. Findings vor Übernahme gegenprüfen (kein blindes Vertrauen
  in einen Audit-Report).

## Installation des Skills selbst
Damit der Skill per Name aufrufbar ist, muss er in einem von Claude Code
gescannten Skill-Verzeichnis liegen:

```bash
ln -s "$(pwd)/skills/ki-agent-setup" ~/.claude/skills/ki-agent-setup
```

Alternativ ohne Installation: dem Client sagen
*"lies `skills/ki-agent-setup/SKILL.md` und führ es aus"*.
