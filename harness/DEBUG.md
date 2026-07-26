# Debuggen — der hypothesengetriebene Investigations-Loop

Der normale Loop ([SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md), Schleife 1) fixt
den Regelfall: Gate rot → Ursache → Fix → grün. Manche Bugs fallen da durch —
sie überleben eine Runde, treten **intermittierend** auf (Timing, Nebenläufigkeit,
nicht-deterministische Modelle) oder ihre Untersuchung reicht über ein
Context-Fenster hinaus. Für die gilt dieser eigene, strengere Ablauf.

Er erweitert die bestehende Regel „jede Runde mit einer Hypothese starten"
(SELF_OPTIMIZATION.md, Schleife 1) — hier zum vollständigen, **persistenten**
Verfahren ausgebaut. Konkretes Werkzeug (Debugger, Logging-Framework, Tracer):
Stack-Adapter.

---

## Wann dieser Loop greift

- Ein Bug übersteht eine ehrliche Loop-Runde, Ursache weiter unklar.
- Das Symptom ist **nicht deterministisch reproduzierbar** (mal grün, mal rot).
- Die Untersuchung ist länger als ein Context-Fenster — der Stand muss einen
  Reset überleben.

Trivialer, sofort sichtbarer Fehler → kein eigener Loop, direkt fixen.

---

## Persistenter Debug-State (überlebt Context-Resets)

Wie beim Langlauf (AGENT_LOOP.md → durabler State) ist der Investigations-Stand
**extern**, nicht im Gesprächsverlauf: eine Datei je Bug
(`.planning/debug/<slug>.md`, sonst `DEBUG-<slug>.md`). Ein frischer Context liest
sie und setzt fort, statt bei null anzufangen. Sie hält:

- **Symptom** — exakt beobachtet (Fehlertext/Exit-Code/Log wörtlich), nicht paraphrasiert.
- **Evidence** — rohe Belege (Log-Ausschnitte, Repro-Schritte, Zähler).
- **Eliminated** — widerlegte Hypothesen. Wächst **monoton**: eine getötete
  Hypothese wird nie erneut durchgespielt.
- **Reasoning-Checkpoints** — je Runde ein Block (unten).
- **Resolution** — Ursache + Fix + Regressionstest, sobald gefunden.

---

## Der Reasoning-Checkpoint pro Runde

Jede Runde ist ein Block, kein freies Herumprobieren:

```
Runde N
  hypothesis:            Fehler X kommt von Y, weil …
  falsification_test:    Test/Messung, die Y WIDERLEGEN würde (nicht bloß bestätigen)
  confirming_evidence:   was der Lauf tatsächlich zeigte (roh)
  verdict:               bestätigt | widerlegt → Eliminated | unklar → Messung schärfen
  blind_spots:           was diese Runde NICHT geprüft hat
```

Zwei Regeln machen den Unterschied zum blinden Variieren:

- **Falsifikation zuerst.** Entwirf die Beobachtung, die die Hypothese
  *widerlegen* würde — nicht die, die sie bequem bestätigt. Eine Hypothese, die
  nichts ausschließt, bringt die Untersuchung nicht voran.
- **Nur Widerlegtes bleibt tot.** Eine Hypothese kommt ausschließlich dann nach
  `Eliminated`, wenn die vorab definierte Falsifikationsbedingung tatsächlich
  beobachtet wurde. Fehlende Bestätigung ist kein Gegenbeleg: ein inkonklusiver
  Lauf erhält `unklar`; zuerst Messung/Blind Spots schärfen, dann erneut prüfen.
  Eine widerlegte Hypothese wird nicht noch einmal durchgespielt (deckt sich mit
  SELF_OPTIMIZATION.md, Schleife 1).

---

## Erst messbar machen, dann raten

Bei Performance-/Latenz-/Timing-Bugs steht am Anfang **Instrumentierung**, nicht
eine Vermutung: definierte Messpunkte (z. B. `[TIMING]`-Marker je Stufe) einziehen,
damit die nächste Beschwerde **gemessen** statt geschätzt wird. Ein Bug, der sich
nicht messen lässt, lässt sich nicht sauber falsifizieren.

---

## Ausgang

- **Gelöst** heißt: Ursache belegt, Fix an der Ursache (nicht am Symptom —
  GUARDRAILS.md, Abschnitt C), **plus ein Regressionstest**, der den Bug vorher rot
  zeigt und nach dem Fix grün. Frisch gefundene Bugs haben oft null Coverage und
  stehen bei den Tests an erster Stelle (TESTS.md → Priorisierung).
- **Stoppen und fragen** nach denselben Kriterien wie die Schleife
  (SELF_OPTIMIZATION.md → „Wann stoppen und fragen"): Ursache nach mehreren
  ehrlichen Runden unklar, Verdacht auf ein kaputtes Gate, oder ein Fix ginge nur
  durch Bruch einer Guardrail. Den Stand im Debug-State hinterlassen, nicht
  überspielen.
