# Harness — dokumentarisches Entwicklungs-Set

Dieses Verzeichnis ist ein **Anleitungs-Set** für Softwareentwicklung, kein
Werkzeug. Es enthält keine Skripte und keine CI-Pipeline — nur Dokumentation, aus
der ein KI-Agent ableiten kann, *wie* entwickelt wird: von der Idee über die Spec
und die Tests zum Code, abgesichert durch selbst-erzwungene Gates.

Der Gedanke: Das Harness sind die Leitplanken (was gilt), der Agent ist der
Fahrer (was passiert). Liest der Agent diese Dateien, weiß er, wie er eine
Anforderung zerlegt, in welcher Reihenfolge er baut, was er nie tun darf und wann
seine Arbeit als fertig gilt — ohne dass ein Mensch jeden Schritt anstößt.

**Stack-agnostisch.** Die Dateien hier beschreiben die *Methode* — sprach- und
framework-unabhängig. Konkrete Stack-Details (Ordner-/Schicht-Namen, das echte
Gate-Kommando, Test-Framework, verbotene Import-Muster) liegen als **Adapter**
unter [`stacks/`](stacks/) und werden auf die generelle Methode aufgesetzt.

**Global verfügbar.** Das Harness gilt für *jedes* Softwareprojekt, nicht optional
pro Projekt. Es wird global hinterlegt (`~/.claude/harness/`) und von den globalen
Instructions referenziert (siehe `../instructions/`). Bei einem konkreten Projekt
wählt der Agent den passenden Stack-Adapter; gibt es keinen, arbeitet er nach der
generellen Methode und legt bei Bedarf einen neuen Adapter an.

---

## Dateien & Lesereihenfolge

Ein Agent, der hier startet, liest in dieser Reihenfolge:

1. **[ROADMAP.md](ROADMAP.md)** — die fünf Reifephasen. Klärt, auf welcher
   Sprosse das Projekt steht und wie autonom du arbeiten darfst.
2. **[GUARDRAILS.md](GUARDRAILS.md)** — die harten Regeln (Architektur-Reinheit,
   sensible Daten/Secrets, das Fertig-Kriterium). Gelten immer, in jeder Phase.
3. **[SPEC_WORKFLOW.md](SPEC_WORKFLOW.md)** — wie aus einer groben Idee eine
   zerlegte, testbare Spec wird.
4. **[FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md)** — die Form einer fertigen Spec.
5. **[TESTS.md](TESTS.md)** — die Teststrategie (Unit für den Kern, Durchstich-
   Test mit Zustands-Assertion).
6. **[AGENT_LOOP.md](AGENT_LOOP.md)** — der Ablauf, der alles verbindet:
   Spec → Test → Code → Gate → Korrektur.
7. **[SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md)** — das Herz: die prüfende
   Schleife (wiederholen bis verifiziert) und wie das Harness aus jedem Fehler
   schärfer wird (Harness Correction).
8. **[REVIEW_PANEL.md](REVIEW_PANEL.md)** — Multi-Agent-Review (Korrektheit /
   Security / Performance, parallel + adversarial) vor der Fertig-Meldung.
9. **[feature.md](feature.md)** — das Runbook für einen einzelnen Feature-Lauf.

Dazu die **[Command-Library](commands/README.md)** (`commands/`) — wiederverwendbare
Slash-Commands (`/spec`, `/review`, `/verify`, `/commit`, `/pr`), die den Workflow
als ein Wort abrufbar machen.

Dann den passenden **Stack-Adapter** unter [`stacks/`](stacks/) lesen — er füllt
die generellen Platzhalter (Schichten, Gate-Befehl, Test-Framework) mit den
konkreten Werten des Projekts.

## Stack-Adapter

Ein Adapter ist nach **Sprache/Runtime + Storage** geschnitten, **nicht** nach
einem einzelnen Framework. Der Framework-Aspekt (z. B. Slim vs. Laravel vs.
Symfony) ist innerhalb eines Adapters nur eine Variante des Einstiegspunkts.

| Adapter | Geltungsbereich |
|---|---|
| [`stacks/php/`](stacks/php/README.md) | PHP-Web + relationale DB (framework-neutral: Slim, Laravel, Symfony, pures PHP) |

Neuer Stack → neuen Adapter nach dem Muster von `php` anlegen: konkrete Schichten
+ Verbots-Muster, das Gate-Kommando, das Test-Framework, DB-/Layout-Konventionen,
eine Beispiel-Zerlegung. Die generellen Dateien bleiben unverändert.

---

## Selbst-erzwungene Gates statt Hooks

Frühere Versionen dieses Harness erzwangen die Regeln über Hook-Skripte und eine
CI-Pipeline. Diese Ebene fehlt hier bewusst. Stattdessen **erzwingt der Agent die
Gates selbst**, indem er GUARDRAILS.md vor jedem Schreibvorgang und vor jeder
Fertig-Meldung anwendet. Das Fertig-Kriterium bleibt mechanisch: nicht die
Selbsteinschätzung des Agenten entscheidet, sondern ein grüner Lauf des
Gate-Kommandos (welches genau — siehe Stack-Adapter; das Konzept — siehe
GUARDRAILS.md → "Das Fertig-Kriterium").

Wer das Harness später wieder härten will (Hooks, CI), baut auf dieser
dokumentarischen Basis auf — die Regeln stehen schon, sie müssen nur in Skripte
übersetzt werden.
