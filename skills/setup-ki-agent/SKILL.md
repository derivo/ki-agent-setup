---
name: setup-ki-agent
description: Bootet das lokale KI-Agent-Setup aus diesem Repo autonom zusammen. Use when the user checks out the ki-agents repo on a (new) machine and wants the Claude Code setup assembled, synced, or updated — e.g. "bau mein KI-Agent-Setup auf", "wende ki-agents an", "richte den Agenten ein", "sync mein Setup". Reads APPLY.md, installs plugins, configures ~/.claude, verifies, and can drop the harness docs into a dev project.
---

# setup-ki-agent

Dieser Skill macht das ki-agents-Repo selbst-anwendend: Ein Agent liest ihn nach
dem Checkout und baut das lokale Claude-Code-Setup autonom zusammen — Plugins,
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
- `APPLY.md` lesen → die 8 verbindlichen Setup-Schritte.
- Bestehenden Stand erfassen: `~/.claude/settings.json`, `claude plugin list`,
  vorhandene `~/.claude/CLAUDE.md`. **Nicht** blind überschreiben — mergen.

### 2. Setup anwenden (APPLY.md, Schritt 1–8)
Arbeite APPLY.md Schritt für Schritt ab und prüfe je Schritt das dort genannte
Verify-Kriterium, bevor du weitergehst:
1. Marketplaces registrieren.
2. Plugins installieren (frontend-design, codex, caveman).
3. GSD installieren (eigener Installer, kein Marketplace-Plugin).
4. Statusline aktivieren (`gsd-statusline.js`, Pfad auf reales `$HOME`).
5. Hooks eintragen (GSD-Guards, caveman-Aktivierung).
6. Globale Settings setzen (Deutsch, Thinking, effort high, Theme …).
7. Globale `CLAUDE.md` sicherstellen.
8. Abschluss-Verifikation.

`permissions.allow` **nicht** aus dem Repo übernehmen — maschinenspezifisch, wächst
organisch (steht so in APPLY.md).

### 3. Sicherheits- und Konfliktregeln
- Pfade mit `<USER>` / absolute Pfade auf das reale `$HOME` der Maschine setzen.
- Quelle/Marketplace fehlt auf der Zielmaschine → diesen Teil überspringen und
  **melden**, nicht raten.
- Bestehende User-Werte abweichend vom Repo → Abweichung melden, nicht still
  überschreiben.
- Schritte, die etwas installieren oder `~/.claude` ändern, vor Ausführung kurz
  ankündigen.

### 4. Harness optional einsetzen
Soll ein PHP/Slim-Projekt nach dem Harness entwickelt werden:
- `harness/README.md` lesen → Einstiegspunkt + Lesereihenfolge.
- Die Doku-Dateien (`ROADMAP`, `GUARDRAILS`, `SPEC_WORKFLOW`, `FEATURE_TEMPLATE`,
  `TESTS`, `AGENT_LOOP`, `feature`) ins Zielprojekt übernehmen oder dort
  referenzieren.
- Ab da gilt der Loop aus `harness/AGENT_LOOP.md` und die Regeln aus
  `harness/GUARDRAILS.md`.

### 5. Abschluss melden
Kurzer Report: Was installiert/konfiguriert wurde, welche Verify-Checks grün sind,
was übersprungen/abweichend war. Bei rotem Verify: Ursache nennen, nicht
"fertig" melden.

## Installation des Skills selbst
Damit der Skill per Name aufrufbar ist, muss er in einem von Claude Code
gescannten Skill-Verzeichnis liegen:

```bash
ln -s "$(pwd)/skills/setup-ki-agent" ~/.claude/skills/setup-ki-agent
```

Alternativ ohne Installation: dem Client sagen
*"lies `skills/setup-ki-agent/SKILL.md` und führ es aus"*.
