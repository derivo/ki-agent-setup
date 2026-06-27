# Selbst-Optimierung — die prüfende Schleife & ihr Lerneffekt

Das Herz des Harness sind zwei ineinandergreifende Schleifen. Die erste prüft und
wiederholt, bis die Arbeit verifiziert ist. Die zweite macht das Harness mit jedem
gefangenen Fehler schärfer. Ohne beide ist der Rest nur eine Sammlung von Regeln.

---

## Schleife 1 — Wiederholen & Prüfen (Loop-until-verified)

Eine Aufgabe ist nicht nach dem ersten Durchlauf fertig, sondern wenn das Gate
grün ist. Mehrere Runden sind der Normalfall, kein Versagen.

```
Änderung schreiben
      │
      ▼
[Selbst-Critic]  ── vor dem Write gegen GUARDRAILS.md
      │
      ▼
Gate-Kommando      ── das Gate (stack-spezifisch, siehe stacks/)
      │
   rot │ grün
      │     └────────► nächster Schritt / fertig
      ▼
Ursache analysieren ──► Fix ──┐
      │                       │
      └───────────◄───────────┘   (zurück ins Gate)
```

Regeln für die Schleife:
- **Nicht beim ersten grünen Teilergebnis aufhören**, wenn das Gate als Ganzes
  noch rot ist. Vollständig durchlaufen lassen.
- **Ursache fixen, nicht Symptom.** Keine Suppressions, kein Test-/Check-
  Aufweichen, damit es grün aussieht.
- **Jede Runde mit einer Hypothese starten** ("Fehler X kommt von Y"), nicht
  blind variieren. Bestätigt die Runde die Hypothese nicht → neue Hypothese,
  nicht dieselbe Änderung nochmal.

## Schleife 2 — Harness Correction (Selbst-Optimierung)

Wenn das Gate einen Fehler fängt, den eine Regel hätte verhindern können, ist der
Fix nur die halbe Arbeit. Die andere Hälfte: die fehlende Regel ergänzen, damit
derselbe Fehler nie wieder entsteht.

```
Gate fängt Fehler
      │
      ▼
Hätte eine Regel das verhindert?
   │ nein → nur Code fixen
   │ ja
   ▼
Regel ergänzen (GUARDRAILS.md generell, Stack-Adapter stack-spezifisch)
      │
      ▼
Gate erneut → grün → Harness ist jetzt schärfer als vorher
```

So wächst das Harness aus echten Fehlern statt aus Vermutungen. Über die Zeit
fängt der Selbst-Critic (Schleife 1) immer mehr ab, bevor das teurere Gate
anspringt.

### Wann eine Regel ergänzen — und wann nicht
Nicht jeder Einzelfall wird zur Regel (sonst Regel-Wildwuchs, gegen Simplicity
First):
- **Regel ergänzen** bei wiederkehrenden oder strukturellen Fehlern — etwas, das
  eine ganze Klasse von Fehlern abdeckt (z. B. "Domain importiert Framework").
- **Keine Regel** für einen einmaligen Flüchtigkeitsfehler ohne Muster. Nur fixen.
- Eine neue Regel ist **konkret und prüfbar** formuliert, nicht "sei sorgfältig".

## Selbst-Review vor "fertig"

Bevor du eine Aufgabe als fertig meldest — besonders bei Edits am Harness selbst
(GUARDRAILS, Templates, Loop): **adversariale Selbst-Review des eigenen Diffs.**
Lies den Diff, als wolltest du ihn ablehnen: Was ist nicht belegt? Welche
Behauptung ist ungeprüft? Welche Änderung war nicht angefordert? Erst dann melden.

Das Gate (mechanisch) und die Selbst-Review (Urteil) ergänzen sich — keins ersetzt
das andere.

## Wann stoppen und fragen (statt endlos loopen)

Die Schleife ist kein Freibrief für blindes Weiterprobieren. Stoppen und den
Menschen einbeziehen, wenn:
- Das Gate nach mehreren ehrlichen Runden rot bleibt und die Ursache unklar ist.
- Spec und Gate sich widersprechen (das Gate verlangt etwas, das die Spec
  verbietet, oder umgekehrt).
- Ein Fix nur möglich wäre, indem man eine Guardrail bricht.
- Der Verdacht besteht, dass das Gate selbst kaputt/falsch ist — dann nicht den
  Code an ein falsches Gate anpassen, sondern das Gate prüfen.

Benennen, was klemmt, statt es zu überspielen (siehe Ehrlichkeit in
`../instructions/AGENTS.md`).
