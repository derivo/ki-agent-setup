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
Abschnitt C). Bei nicht-trivialen Änderungen kommt vor der Fertig-Meldung das
[Review-Panel](REVIEW_PANEL.md) dazu (Korrektheit/Security/Performance, parallel +
adversarial) plus der Security-Pass (GUARDRAILS.md, Abschnitt E) — das mechanische
Gate allein fängt Logik- und Sicherheitslücken nicht zuverlässig.

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

## Selbst-Optimierung & die prüfende Schleife
Der Loop oben ist nur die Mechanik. Wie er sich wiederholt, bis verifiziert ist,
und wie das Harness aus jedem gefangenen Fehler schärfer wird (Harness
Correction), steht ausführlich in [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md) —
der wichtigste Teil, wenn der Agent autonom laufen soll.

Kurzform: Gate fängt einen Fehler, den eine Regel hätte verhindern können → nicht
nur den Code fixen, sondern die fehlende Regel ergänzen (GUARDRAILS.md generell,
Stack-Adapter stack-spezifisch). So wird das Harness mit jedem Lauf schärfer.
