# Harness — dokumentarisches Entwicklungs-Set

Dieses Verzeichnis ist ein **Anleitungs-Set**, kein Werkzeug. Es enthält keine
Skripte und keine CI-Pipeline — nur Dokumentation, aus der ein KI-Agent
ableiten kann, *wie* in diesem Projekt entwickelt wird: von der Idee über die
Spec und die Tests zum Code, abgesichert durch selbst-erzwungene Gates.

Der Gedanke: Das Harness sind die Leitplanken (was gilt), der Agent ist der
Fahrer (was passiert). Wenn der Agent diese Dateien liest, weiß er, wie er eine
Anforderung zerlegt, in welcher Reihenfolge er baut, was er nie tun darf und
wann seine Arbeit als fertig gilt — ohne dass ein Mensch jeden Schritt anstößt.

Projektkontext: PHP 8.2 / Slim 4 / MariaDB, Deployment auf Raspberry Pi.
Domäne: Gamification für eine Jugend-Wohngruppe (Daten Minderjähriger → harter
Datenschutz).

---

## Dateien & Lesereihenfolge

Ein Agent, der hier startet, liest in dieser Reihenfolge:

1. **[ROADMAP.md](ROADMAP.md)** — die fünf Reifephasen. Klärt, auf welcher
   Sprosse das Projekt steht und wie autonom du arbeiten darfst.
2. **[GUARDRAILS.md](GUARDRAILS.md)** — die harten Regeln (Architektur-Reinheit,
   Datenschutz, das Fertig-Kriterium). Gelten immer, in jeder Phase.
3. **[SPEC_WORKFLOW.md](SPEC_WORKFLOW.md)** — wie aus einer groben Idee eine
   zerlegte, testbare Spec wird.
4. **[FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md)** — die Form einer fertigen Spec.
5. **[TESTS.md](TESTS.md)** — die Teststrategie (Unit für die Domain, API-Test
   mit Response- UND DB-Assertion).
6. **[AGENT_LOOP.md](AGENT_LOOP.md)** — der Ablauf, der alles verbindet:
   Spec → Test → Code → Gate → Korrektur.
7. **[feature.md](feature.md)** — das Runbook für einen einzelnen Feature-Lauf.

---

## Selbst-erzwungene Gates statt Hooks

Frühere Versionen dieses Harness erzwangen die Regeln über Hook-Skripte und eine
GitLab-Pipeline. Diese Ebene fehlt hier bewusst. Stattdessen **erzwingt der Agent
die Gates selbst**, indem er GUARDRAILS.md vor jedem Schreibvorgang und vor jeder
Fertig-Meldung anwendet. Das Fertig-Kriterium bleibt mechanisch: nicht die
Selbsteinschätzung des Agenten entscheidet, sondern ein grüner `composer quality`-
Lauf (siehe GUARDRAILS.md → "Das Fertig-Kriterium").

Wer das Harness später wieder härten will (Hooks, CI), baut auf dieser
dokumentarischen Basis auf — die Regeln stehen schon, sie müssen nur in Skripte
übersetzt werden.
