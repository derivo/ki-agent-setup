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

## Dateien & Lade-Trigger

**Es gibt keine Lesereihenfolge, die man immer durchläuft.** Das ganze Set sind
rund 60 KB Methode plus ein Stack-Adapter — als Pflichtlektüre vor jedem Write
wären das ~25k Token, auch für einen Ein-Zeilen-Fix. Kontext, der für die
Aufgabe nichts entscheidet, verdrängt Kontext, der etwas entscheidet.

Deshalb gilt: **Tier 1 immer, alles andere gegen seinen Trigger.** Jede Datei
trägt oben eine `Lade wenn:`-Zeile — die reicht, um zu entscheiden, ohne die
Datei zu lesen.

### Tier 1 — vor dem ersten Write an einem Auftrags-Artefakt und vor jeder Fertig-Meldung

| Datei | Größe | Wann |
|---|---|---|
| **[GUARDRAILS.md](GUARDRAILS.md)** | ~4,0k Token | **Immer.** Vor dem ersten Write/Edit an einem Auftrags-Artefakt — Code, **Spec, Test, Plan** — und vor jeder Fertig-Meldung. Die harten Regeln: Scope-Minimum, Architektur-Reinheit, Secrets, das Fertig-Kriterium, Security-Pass. |
| **passender [Stack-Adapter](stacks/)** | ~4,5k Token | **Sobald Code entsteht.** Das konkrete Gate-Kommando, die Schichtnamen, das Test-Framework. Ohne ihn ist das Fertig-Kriterium nicht ausführbar. Reine Spec-/Planungsarbeit ohne Zielstack: entfällt. |

Das Minimum ist damit ~4,0k Token für reine Spec-Arbeit, ~8,5k sobald Code
entsteht. Wer mehr lädt, braucht dafür einen Trigger aus der nächsten Tabelle.

**„Code" wäre hier die falsche Grenze**, und zwar aus einem konkreten Grund:
`GUARDRAILS.md` Abschnitt 0 heißt „Eigene Specs und Tests erweitern den Auftrag
nicht" — eine Regel über Spec-Artefakte. Hinge Tier 1 an Code, schlösse der
Trigger genau den Fall aus, für den die Regel geschrieben wurde. Dasselbe gilt für
Abschnitt C (Evidence je Akzeptanzkriterium) und E (Security-Pass): beide hängen
an der **Fertig-Meldung**, nicht am Schreiben von Code.

### Tier 2 — gegen Trigger nachladen

| Datei | Größe | Lade wenn |
|---|---|---|
| [AGENT_LOOP.md](AGENT_LOOP.md) | ~2,4k | Die Arbeit ist mehrschrittig (Spec → Test → Code → Gate → Korrektur), nicht ein einzelner Edit. |
| [TESTS.md](TESTS.md) | ~4,0k | Tests werden geschrieben oder umgebaut — Teststrategie, Durchstich, Zustands-Assertion. |
| [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md) | ~0,8k | Aus einer groben Idee soll eine zerlegte, testbare Spec werden. |
| [FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) | ~0,5k | Eine Spec wird tatsächlich geschrieben (Form des Ergebnisses). |
| [ADR_TEMPLATE.md](ADR_TEMPLATE.md) | ~0,7k | Eine architektonisch signifikante Entscheidung fällt an und wird festgehalten. |
| [GUARDRAILS_UI.md](GUARDRAILS_UI.md) | ~2,1k | Ein UI-Write steht an (Komponente, Stylesheet, Token, `DESIGN.md`). API-/CLI-Projekte nie. |
| [ENGINEERING.md](ENGINEERING.md) | ~2,0k | Eine Design-Entscheidung steht an (Modularität, Kohäsion, Interface-Richtung, Wann-abstrahieren). |
| [DEBUG.md](DEBUG.md) | ~1,2k | Ein Bug hat eine normale Runde überlebt — hypothesengetriebener Loop mit persistentem Debug-State. |
| [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md) | ~1,7k | Eine Regel soll geschärft werden (Harness Correction) oder die prüfende Schleife greift nicht. |
| [REVIEW_PANEL.md](REVIEW_PANEL.md) | ~1,9k | Der Diff erreicht die Panel-Schwelle (dort definiert) — nicht als Standardschritt. |
| [ROADMAP.md](ROADMAP.md) | ~1,0k | Der Autonomiegrad ist unklar: wie weit darf ohne Rückfrage gearbeitet werden. |
| [feature.md](feature.md) | ~0,7k | Ein kompletter Feature-Lauf wird abgearbeitet (Runbook). |
| [linklist.md](linklist.md) | ~0,8k | `/hx:linklist` wurde aufgerufen oder eine Quelle wird gesucht. |

### Nie im Executor-Kontext

[EVALS.md](EVALS.md) (~9,7k Token) ist die Maintainer-/Grader-Anleitung für
Harness- und Modell-Drift-Checks. Ein getesteter Executor liest diese Datei
nicht, weil sie Referenzaufgaben und Pass-Kriterien enthält; die Trennung ist
Teil des Eval-Protokolls. Ebenso: die **nicht** zum Projekt passenden
Stack-Adapter.

### Was die Tabelle nicht erlaubt

Ein Trigger ist eine Eigenschaft der Aufgabe, keine Geschmacksfrage. „Sicherheitshalber
alles laden" ist genauso ein Verstoß wie das Gate zu überspringen — beides tauscht
eine prüfbare Entscheidung gegen ein Gefühl. Umgekehrt gilt: trifft ein Trigger zu,
wird die Datei **ganz** gelesen, nicht überflogen. Unsicher, ob ein Trigger greift →
die `Lade wenn:`-Kopfzeile der Datei lesen (eine Zeile), dann entscheiden.

Dazu die **[Command-Library](commands/README.md)** (`commands/`) — wiederverwendbare
Slash-Commands. Im empfohlenen globalen Claude-Code-Deploy liegen sie namespaced
unter `/hx:start`, `/hx:spec`, `/hx:review`, `/hx:verify`, `/hx:commit`,
`/hx:pr`, `/hx:retro`, `/hx:sync`, `/hx:park`, `/hx:hot-reload`, `/hx:eod`,
`/hx:linklist`, damit sie nicht mit Built-ins kollidieren.

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
| [`stacks/node/`](stacks/node/README.md) | Node/TypeScript-Web + relationale DB (framework-neutral: Express, Fastify, NestJS, pures Node) |
| [`stacks/python/`](stacks/python/README.md) | Python-Web + relationale DB (framework-neutral: FastAPI, Django, Flask, pures Python) |

Neuer Stack → neuen Adapter nach dem Muster von `php` anlegen: konkrete Schichten
+ Verbots-Muster, das Gate-Kommando, das Bring-up-/Run-Kommando (App lokal
prüfbar hochfahren), das Test-Framework, DB-/Layout-Konventionen, die
Deploy-Strecke (Ziele, Artefakt-Weg, Rollback), eine Beispiel-Zerlegung. Die
generellen Dateien bleiben unverändert.

---

## Projekt-Doku

Erzeugt oder pflegt der Agent Entwickler-Doku eines Code-Projekts (Handbuch,
API-Doku, Architektur-Überblick — manuell oder als wiederkehrender Job), gilt:
**erst Struktur, dann Inhalt.** Die Zielstruktur (Gliederung, Zielgruppe,
Fertig-Kriterien) steht in einer `docs/README.md` bzw. `docs/CLAUDE.md` des
Projekts, **bevor** generiert wird — sonst produziert jeder Lauf eine andere
Doku. Als Ausgangspunkt dient
[`../doc-harness/DOC_TEMPLATE.md`](../doc-harness/DOC_TEMPLATE.md); für große,
langlebige oder korrektheitskritische Doku-Basen gilt das ganze
[`doc-harness/`](../doc-harness/README.md) (Claims-gegen-Quelle als Gate).

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

Ein erster, **nicht-erzwingender** Baustein liegt bereits bei:
[`hooks/harness-activate.sh`](hooks/harness-activate.sh) — ein Claude-Code-
SessionStart-Hook, der beim Session-Start einen kurzen Reminder (Lookup +
Ablauf + Fertig-Kriterium) in den Kontext injiziert. Er blockiert nichts und
gatet nichts; er macht nur den ohnehin in `instructions/AGENTS.md` stehenden
Pointer salient, damit der Agent das Harness nicht überliest. Deploy +
Registrierung: [`APPLY.md`](../APPLY.md) → Abschnitt B1.6.
