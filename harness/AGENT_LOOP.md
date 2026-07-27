# Agent-Loop — der orchestrierte Ablauf

Die Leitplanken ([GUARDRAILS.md](GUARDRAILS.md), die globalen Instructions, die
statischen Tools hinter dem Gate-Kommando) sagen, *was gilt*. Der Agent-Loop ist
der Fahrer: der Ablauf, der den Agenten durch Spec → Test → Code → Gate →
Korrektur führt.

In diesem dokumentarischen Harness gibt es keine Hook-Skripte, die den Loop von
außen erzwingen. Stattdessen **erzwingt der Agent die drei Bausteine selbst**,
indem er die Regeln an den richtigen Stellen anwendet.

## Die drei Bausteine

### 1. Der Feature-Einstieg ([feature.md](feature.md))
Startet den Loop für ein Feature und schreibt den Ablauf vor: Spec
prüfen/erstellen, zerlegen, pro Teilaufgabe Test-zuerst, Gate, korrigieren. Ein
Lauf bearbeitet genau ein Feature.

### 2. Der Selbst-Critic (vor jedem Schreiben)
VOR jedem Write/Edit prüft der Agent den zu schreibenden Inhalt gegen die harten
Regeln aus GUARDRAILS.md — vor allem:
- Framework-/IO-Abhängigkeit im Kern/in der Domäne → nicht schreiben.
- Direkter Persistenz-/IO-Zugriff im Einstiegspunkt → nicht schreiben.
- Secrets im Code, echt wirkende personenbezogene Testdaten → nicht schreiben.
(Konkrete verbotene Muster je Stack: Adapter.) Würde ein Verstoß entstehen,
korrigiert der Agent sich selbst, bevor die Datei geschrieben wird — billiger, als
den Fehler erst im Gate zu fangen.

### 3. Das Fertig-Gate (bevor der Agent beenden will)
Wenn der Agent fertig sein WILL, läuft das Gate-Kommando des Stacks. Ist es rot,
ist die Aufgabe nicht erledigt — der Agent arbeitet weiter, bis es grün ist. Das
macht "du bewertest deine Arbeit nicht selbst" mechanisch (Details: GUARDRAILS.md,
Abschnitt C). Dazu kommt vor jeder Fertig-Meldung der Security-Pass (GUARDRAILS.md,
Abschnitt E) — mindestens als Selbstcheck, denn das mechanische Gate allein fängt
Logik- und Sicherheitslücken nicht zuverlässig. Erreicht der Diff die Schwelle des
[Review-Panels](REVIEW_PANEL.md) (Auth/Krypto/Migrationen/Secrets/Harness oder große
unabhängige Änderung), läuft es zusätzlich; bei kleineren Änderungen **nicht** — der
Default ist Single-Pass, und ein Verifikations-Subagent auf die eigene Arbeit bringt
bei aktuellen Modellen keinen Qualitätsgewinn.

## Der Ablauf als Bild

```
/feature  ──>  Spec prüfen/zerlegen
                      │
                      ▼
            ┌── Teilaufgabe ────────────────────┐
            │  Test schreiben                    │
            │  Code schreiben ──► [Selbst-Critic]│ ◄─ vor dem Write gegen GUARDRAILS
            │  Gate-Kommando                     │
            │      │                             │
            │   rot├─► Ursache fixen ──┐         │
            │      │   (ggf. Harness   │         │
            │      │    korrigieren)   │         │
            │      └──────────────◄────┘         │
            │   gruen ──► naechste Aufgabe       │
            └────────────────────────────────────┘
                      │
                      ▼
            Agent will beenden ──► [Fertig-Gate]  ◄─ Gate muss gruen sein
                      │
                      ▼
            Mensch reviewt + merged/deployt
```

## Wo die Grenze bleibt
Der Loop automatisiert Bauen und Prüfen. Der letzte Schritt — Merge und Deploy —
bleibt beim Menschen (siehe [ROADMAP.md](ROADMAP.md), Phase 5, und GUARDRAILS.md,
Abschnitt D). Je sensibler die Domäne, desto länger liest der Mensch mit.

## Voraussetzungen
- Ein **Gate-Kommando** ist definiert, das statische Analyse, Typprüfung,
  Formatter und Tests bündelt (welches genau: Stack-Adapter).
- Ein **Bring-up-/Run-Kommando** ist definiert, das die App lokal in einen
  prüfbaren Zustand hochfährt (ein Befehl, idempotent) — damit sichtbares
  Verhalten End-to-End beobachtbar ist, nicht nur über Unit-Tests (Stack-Adapter).
- Der Test-Datastore ist lokal erreichbar, damit Integrations-/Durchstich-Tests
  gegen echte Daten laufen.

## Langlauf über mehrere Context-Fenster

Ein Feature-Lauf passt nicht immer in ein Context-Fenster. Verlässt sich der Agent
dann allein auf Context-Compaction, geht Stand verloren — Compaction komprimiert,
sie persistiert nicht. Für Aufgaben, die über ein Fenster hinausreichen, braucht es
**durablen externen State**, aus dem ein frischer Context den Stand rekonstruiert:

- **Git-Historie** — atomare Commits pro abgeschlossenem Schritt sind das primäre,
  prüfbare Gedächtnis. Was committet ist, ist sicher; der Rest ist Arbeitsstand.
- **Progress-Log** — eine schlanke Datei (erledigt / als Nächstes / offene Punkte),
  an jeder Schritt-Grenze aktualisiert. In `.planning/`-Projekten ist das `STATE.md`
  (siehe `../instructions/AGENTS.md`); sonst eine `PROGRESS.md`.

Beim Wiederaufsetzen liest der Agent git-Log + Progress-Log, nicht den
(komprimierten) Gesprächsverlauf. Optional bei großen Vorhaben: der erste Lauf
richtet nur die Umgebung ein (Setup, Skeleton, initialer Commit), die Folge-Läufe
machen je einen Schritt — so liegt die Context-Grenze immer an einer sauberen Naht.

### Session-Start-Health-Check (vor der ersten neuen Änderung)
Zustand lesen genügt nicht. Bevor ein Folge-Lauf neue Arbeit draufsattelt, fährt
er die App per **Bring-up-Kommando** hoch und lässt einen **schnellen Smoke-/
Durchstich-Lauf** laufen. Bricht der, wird zuerst die (oft undokumentierte) Drift
der Vor-Session gefixt oder im Progress-Log benannt — **erst dann** das nächste
Feature. Sonst baut Lauf N auf dem kaputten Stand von Lauf N-1, und der Bug
versteckt sich hinter scheinbar frischer Arbeit. (Anthropic-Harness: "Initial
Health Checks".)

Wie der Smoke die Bereitschaft feststellt, hängt am **beobachtbaren Kanal**, nie
an einem festen Sleep: ein HTTP-Health-Endpoint (Poll bis 200) oder — bei
CLI-/Langläufer-Apps ohne HTTP — ein definierter **Ready-Marker auf stdout**, auf
den der Smoke mit Timeout wartet (`waitForLog(…"ready")`), statt gegen einen noch
toten Prozess zu rennen. Ein fester `sleep(2s)` ist die häufigste Flake-Quelle und
belegt Bereitschaft nicht. (Konkreter Kanal + Marker: Stack-Adapter.)

### Context als endliche Ressource

Der Context ist knapp, nicht gratis: mit steigender Token-Zahl steigt die Konfusion
(Context-Rot), nicht linear die Qualität. Ziel ist die kleinste Menge
hoch-signalhafter Tokens, nicht das größtmögliche Fenster. Fünf Hebel, um das über
lange Läufe zu halten (der durable State oben ist der erste davon):

- **Note-Taking als externes Gedächtnis.** Fortschritt/offene Punkte/Kern-
  Entscheidungen in eine Datei außerhalb des Fensters schreiben (`PROGRESS.md`
  bzw. `.planning/STATE.md`, siehe oben), nicht im Verlauf halten. Das ist der
  Progress-Log von oben — hier als bewusster Kontext-Hebel benannt.
- **Just-in-time-Retrieval statt Vorab-Dump.** Leichte Identifier halten (Dateipfade,
  Queries, Ticket-IDs) und erst bei Bedarf nachladen — nicht ganze Dateien/Ergebnisse
  auf Vorrat in den Context ziehen. Ordnerstruktur/Namen leiten den Agenten zum
  richtigen Ort (deckt sich mit "Context-Budget schlank" in `../instructions/AGENTS.md`).
- **Tool-Ausgabe an der Quelle kürzen.** Ein Gate/Befehl, der Roh-Output in Massen
  erzeugt, wird **produzentenseitig** reduziert, *bevor* er ins Fenster landet — nicht
  voll aufnehmen und danach aufräumen (das ist der Reset-Hebel unten, reaktiv und
  teurer). Konkret: grep-verankern (`grep -c`, `| grep -E 'FAIL|error'`), mit
  `tail`/`head` begrenzen, knappen Reporter wählen (Dot-/Summary- statt Voll-Log),
  aggregieren/subsamplen. So landet nur das hoch-signalhafte Ergebnis statt tausend
  Zeilen Log — dieselbe Disziplin wie die grep-Zähler als Evidenz (`GUARDRAILS.md`
  Abschnitt C). Konkrete Flags je Werkzeug: Stack-Adapter.
- **Reset vor Compaction am Fenster-Limit.** Naht das Limit, ist der sauberere Weg ein
  **frischer Context**, der sich aus dem durablen State (Git-Log + Progress-Log) neu
  aufbaut — nicht ein weiterverdichteter Verlauf. Compaction erhält zwar Kontinuität,
  lässt den Lauf aber dauerhaft nah am Limit arbeiten; Modelle wickeln dann vorzeitig
  ab, statt die Aufgabe zu Ende zu bringen. Voraussetzung ist, dass der Stand
  wirklich außerhalb des Fensters liegt (Commit + aktualisierter Progress-Log) —
  sonst ist der Reset ein Datenverlust. Ist er zu teuer (kurze Restarbeit, viel
  unkommittierter Stand), dann komprimieren: bewahren Architektur-Entscheidungen,
  offene Bugs, Impl-Details; verwerfen redundante Tool-Ausgaben. Leichtester Hebel
  zuerst — alte Tool-Call-Ergebnisse leeren, bevor der Gesprächsverlauf angetastet wird.
- **Subagents für tiefe Teilaufgaben.** Fokus-Arbeit an einen Subagenten mit eigenem,
  sauberem Context delegieren, der eine kondensierte Summary zurückgibt statt Rohdaten
  (siehe [REVIEW_PANEL.md](REVIEW_PANEL.md)) — so bleibt der Hauptthread schlank.

## Selbst-Optimierung & die prüfende Schleife
Der Loop oben ist nur die Mechanik. Wie er sich wiederholt, bis verifiziert ist,
und wie das Harness aus jedem gefangenen Fehler schärfer wird (Harness
Correction), steht ausführlich in [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md) —
der wichtigste Teil, wenn der Agent autonom laufen soll.

Kurzform: Gate fängt einen Fehler, den eine Regel hätte verhindern können → nicht
nur den Code fixen, sondern die fehlende Regel ergänzen (GUARDRAILS.md generell,
Stack-Adapter stack-spezifisch). So wird das Harness mit jedem Lauf schärfer.
