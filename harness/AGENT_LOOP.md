# Agent-Loop — der orchestrierte Ablauf

Die Leitplanken ([GUARDRAILS.md](GUARDRAILS.md), die `CLAUDE.md`-Hierarchie, die
statischen Tools hinter `composer quality`) sagen, *was gilt*. Der Agent-Loop ist
der Fahrer: der Ablauf, der den Agenten durch Spec → Test → Code → Gate →
Korrektur führt. Diese Datei beschreibt, wie beides zusammenspielt.

In diesem dokumentarischen Harness gibt es keine Hook-Skripte, die den Loop von
außen erzwingen. Stattdessen **erzwingt der Agent die drei Bausteine selbst**,
indem er die Regeln an den richtigen Stellen anwendet.

## Die drei Bausteine

### 1. Der Feature-Einstieg ([feature.md](feature.md))
Startet den Loop für ein Feature und schreibt den Ablauf vor: Spec
prüfen/erstellen, zerlegen, pro Teilaufgabe Test-zuerst, Gate, korrigieren.
Ein Lauf bearbeitet genau ein Feature.

### 2. Der Selbst-Critic (vor jedem Schreiben)
VOR jedem Write/Edit prüft der Agent den zu schreibenden Inhalt gegen die harten
Regeln aus GUARDRAILS.md — vor allem:
- Framework-/DB-Importe in der Domain → nicht schreiben.
- Direkter Infrastructure-/PDO-Zugriff in der Action → nicht schreiben.
- Echt wirkende personenbezogene Testdaten → nicht schreiben.
Würde ein Verstoß entstehen, korrigiert der Agent sich selbst, bevor die Datei
geschrieben wird. Das ist billiger, als den Fehler erst im Quality Gate zu fangen,
weil gar kein falscher Code entsteht.

### 3. Das Fertig-Gate (bevor der Agent beenden will)
Wenn der Agent fertig sein WILL, läuft `composer quality`. Ist das Gate rot, ist
die Aufgabe nicht erledigt — der Agent arbeitet weiter, bis es grün ist. Das macht
die Regel "du bewertest deine Arbeit nicht selbst" mechanisch: nicht die Meinung
des Agenten entscheidet über fertig, sondern der grüne Gate-Lauf (Details:
GUARDRAILS.md, Abschnitt C).

## Der Ablauf als Bild

```
/feature  ──>  Spec prüfen/zerlegen
                      │
                      ▼
            ┌── Teilaufgabe ────────────────────┐
            │  Test schreiben                    │
            │  Code schreiben ──► [Selbst-Critic]│ ◄─ vor dem Write gegen GUARDRAILS
            │  composer quality                  │
            │      │                             │
            │   rot├─► Ursache fixen ──┐         │
            │      │   (ggf. Harness   │         │
            │      │    korrigieren)   │         │
            │      └──────────────◄────┘         │
            │   gruen ──► naechste Aufgabe       │
            └────────────────────────────────────┘
                      │
                      ▼
            Agent will beenden ──► [Fertig-Gate]  ◄─ composer quality muss gruen sein
                      │
                      ▼
            Mensch reviewt + merged/deployt
```

## Wo die Grenze bleibt
Der Loop automatisiert das Bauen und Prüfen. Der letzte Schritt — Merge und
Deploy auf den Pi — bleibt beim Menschen. Bei einer App mit Daten von
Minderjährigen ist das nicht verhandelbar (siehe [ROADMAP.md](ROADMAP.md),
Phase 5, und GUARDRAILS.md, Abschnitt D).

## Voraussetzungen
- `composer quality` ist in der `composer.json` definiert und bündelt die
  statischen Tools (`deptrac`, `phpstan`, `php-cs-fixer`) plus die Tests.
- Die Test-MariaDB ist lokal erreichbar (via Docker), damit Integrations- und
  API-Tests gegen eine echte DB laufen.

## Selbst-Optimierung & die prüfende Schleife
Der Loop oben ist nur die Mechanik. Wie er sich wiederholt, bis verifiziert ist,
und wie das Harness aus jedem gefangenen Fehler schärfer wird (Harness
Correction), steht ausführlich in [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md) —
der wichtigste Teil, wenn der Agent autonom laufen soll.

Kurzform: Gate fängt einen Fehler, den eine Regel hätte verhindern können → nicht
nur den Code fixen, sondern die fehlende Regel in GUARDRAILS.md (oder der
projektnächsten `CLAUDE.md`) ergänzen. So wird das Harness mit jedem Lauf schärfer.
