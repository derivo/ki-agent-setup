# CLAUDE.md — Claude-Code-spezifische Ergänzungen

Diese Datei **erweitert** die gemeinsame Basis. Lies zuerst `AGENTS.md` (gleiches
Verzeichnis) — dort stehen alle client-neutralen Regeln (Arbeitsweise,
Simplicity, Surgical Changes, Testing, Konventionen). Hier nur, was Claude Code
zusätzlich kann/braucht.

@AGENTS.md

---

## GSD (get-shit-done)

Projekte mit `.planning/` nutzen GSD als Single-Source-of-Truth (Struktur siehe
`AGENTS.md` → Arbeits-Tracking). Zusätzlich in Claude Code:
- In-Session bei 3+ Schritten: `TaskCreate`-Tool nutzen.
- GSD-Skills/Commands (`gsd-*`, `gsd:*`) für Phasen-Workflow.

## ponytail

Lösungs-Minimalismus aktiv (Level via `/ponytail lite|full|ultra`, Default
`full`). Vor jedem Code die Leiter, erste haltende Sprosse gewinnt: nötig? → im
Bestand vorhanden? → stdlib? → native Plattform? → bereits installierte
Dependency? → eine Zeile? → erst dann das Minimum, das funktioniert. Das ergänzt
*Simplicity First* aus `AGENTS.md` um die Sprossen stdlib/native/Bestands-
Dependency; die Leiter verkürzt die Lösung, nie das Lesen.

Zwei Stellen, an denen die Hausregeln vorgehen — Rangfolge wie in
`harness/GUARDRAILS.md` §0:
- Die knappe Ausgabe („höchstens drei Zeilen") ersetzt **keinen** Evidence-Beleg
  je Akzeptanzkriterium (`GUARDRAILS.md` C).
- „Ein Check reicht" ersetzt **nicht** die Edge-Case-Matrix für UI-Formulare
  (`AGENTS.md` → Testing).

caveman ist installiert, aber per `~/.config/caveman/config.json` auf
`defaultMode: off`. Prosa-Kompression läuft nicht mehr per Default; `/caveman
lite|full|ultra` holt sie bei Bedarf für die Session zurück. Nicht beide
gleichzeitig aktiv fahren.

## Skills

Skills außerhalb von GSD und den Plugins (Web, Testing, PHP, Security …) sind
installiert.
Quelle der Wahrheit ist `~/.agents/.skill-lock.json`; das Repo-Inventar heißt
`SKILLS.md`. Bei passender Aufgabe den jeweiligen Skill nutzen.

Ein Skill liefert **Technik, nicht Scope**: verlangt er mehr als der Auftrag
hergibt, gilt der Auftrag. Rangfolge und Meldepflicht bei Widerspruch:
`harness/GUARDRAILS.md` §0.

## Verifikation — kein Doppel-Check auf eigene Arbeit

Aktuelle Claude-Modelle prüfen und korrigieren ihre Arbeit selbst. Deshalb **kein
zusätzlicher Verifikations-Subagent** auf die eigene Arbeit und kein separater
Nachprüf-Schritt „zur Sicherheit". Subagents sind für echte Parallelarbeit
(breite Recherche, unabhängige Tracks) — nicht zum Nachrechnen dessen, was du
gerade selbst geschrieben hast.

**Unberührt — das sind externe Beobachtungen, keine Selbstprüfung:**
- das mechanische **Gate** (`GUARDRAILS.md` C) — ein Tool-Lauf, kein Urteil,
- der **Evidence-Beleg** je Akzeptanzkriterium (Befehl + Ergebnis, Datei:Zeile),
- **`/hx:verify`** — App wirklich starten und das Verhalten beobachten,
- der **Security-Pass** (`GUARDRAILS.md` E) als Selbstcheck,
- das **Review-Panel**, wenn der Diff dessen Schwelle erreicht
  (`harness/REVIEW_PANEL.md` → „Wann").

Kurz: Selbstprüfung nicht doppeln, Beobachtung nie weglassen.
