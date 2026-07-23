# Review-Panel — Multi-Agent-Validierung statt Single-Pass

Ein einzelner Agent, der seinen eigenen Code reviewt, übersieht systematisch das,
was er beim Schreiben übersehen hat. Stärker: **mehrere Reviewer mit getrennten
Lenses, parallel, mit adversarialer Gegenprüfung** — eine Validierungskette, bevor
"fertig" gilt. Das ergänzt das Fertig-Gate (GUARDRAILS C) um eine Urteilsebene,
die das mechanische Gate nicht liefert.

Wann: bei nicht-trivialen Änderungen vor der Fertig-Meldung, bei PR-Vorbereitung,
und immer bei Diffs, die Auth, Krypto, Migrationen, Secrets oder das Harness
berühren. Triviale Änderungen brauchen kein Panel (Simplicity First).

## Die Lenses

Jede Lens ist ein **eigener Subagent mit isoliertem Context** — so verschmutzt die
Review nicht den Hauptthread und jeder Reviewer ist blind für die Annahmen der
anderen. Jede Lens gibt eine **kondensierte Fund-Liste** zurück (je Fund eine Zeile:
Datei:Zeile · Lens · Schwere · Fix), keinen Volltext-Dump von Code oder Gedankengang
— der Hauptthread sammelt Funde, nicht Rohkontext.

- **Korrektheit** — Bugs, Edge-Cases, falsche Annahmen, nicht abgedeckte ACs.
- **Security** — Injection (SQL/Command/Path), Secrets im Code, fehlende
  Authz/Authn, unsichere Defaults, gefährliche Deserialisierung. (Details:
  GUARDRAILS Abschnitt E — Security-Pass.)
- **Performance** — N+1-Queries, unnötige IO/Allokationen, offensichtliche
  Hotspots. Nur wo es real zählt, keine Mikro-Optimierung.
- **Sichtbare Qualität** — nur bei UI-Diffs, urteilt am gerenderten Zustand statt
  am Code (eigener Abschnitt unten).

Weitere Lens je nach Diff ergänzen (z. B. **Daten/Migrations** bei Schema-Änderung,
**API-Kompatibilität** bei Schnittstellen).

## Der Ablauf

```
Diff bestimmen
      │
      ▼
parallel:  [Korrektheit]  [Security]  [Performance]   ◄─ je 1 Subagent, isoliert
           (+ [Sichtbare Qualität] bei UI-Diffs)
      │          │            │            │
      └──────────┴─────┬──────┴────────────┘
                       ▼
            Funde einsammeln (dedupliziert)
                       │
                       ▼
      adversariale Gegenprüfung pro Fund   ◄─ zweiter Agent versucht zu WIDERLEGEN
      (Default: refuted=true bei Unsicherheit)
                       │
                       ▼
      nur bestätigte Funde → Bericht (Datei:Zeile · Lens · Schwere · Fix)
```

## Regeln

- **Adversarial verifizieren, nicht bestätigen.** Der Gegenprüf-Schritt ist
  angewiesen, den Fund zu *widerlegen*. Übersteht er das nicht, fällt er raus.
  Das killt plausible-aber-falsche Funde.
- **Keine Scope-Creep, kein Lob.** Eine Zeile pro echtem Fund, nach Schwere. Stil-
  Nits nur, wenn sie die Bedeutung ändern.
- **Ein reproduzierbarer Fund schlägt ein architektonisches Bauchgefühl.**
- **Konsens-Schwelle bei Unsicherheit:** Wird ein Fund von mehreren Lenses
  unterschiedlich bewertet, gewinnt der konkretere, belegte.
- Bestätigte Funde fließen zurück in die prüfende Schleife
  ([SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md)) — und wenn ein Fund eine fehlende
  Regel offenlegt, wird sie ergänzt (Harness Correction).

## Subjektive Ergebnisse: Evaluator statt Selbstbenotung

Wo ein mechanisches Kriterium existiert, entscheidet das Gate. Wo keins existiert
— Oberfläche, Layout, Wortlaut — greift der Selbstcheck systematisch daneben:
Wer die Arbeit produziert hat, bewertet sie zuverlässig positiv, auch wenn sie für
einen Betrachter offensichtlich mittelmäßig ist. Deshalb urteilt hier ein
**getrennter Agent, der den Code nicht geschrieben hat**.

Und zwar **am gerenderten Zustand, nicht am Diff**: App per Bring-up-Kommando
hochfahren (siehe „Voraussetzungen" in [AGENT_LOOP.md](AGENT_LOOP.md)), die
betroffene Seite ansteuern, mit der Oberfläche interagieren — klicken, tippen,
Leer-/Fehler-/Lang-Zustände auslösen, Viewport wechseln. Ein Screenshot der
Startseite ist keine Prüfung.

Vier feste Dimensionen, je bestanden/gefallen mit einem Satz Begründung:

- **Handwerk** — Ausrichtung, Abstände, Zustände (hover/focus/disabled/leer/lang);
  nichts überlappt, nichts ist abgeschnitten.
- **Konsistenz** — nutzt die kanonischen Komponenten und die Token-Skala
  (GUARDRAILS Abschnitt G) und fällt nicht aus dem Rest der App heraus.
- **Funktion** — der Weg durch das Feature ist bedienbar: Fehlerfälle sichtbar,
  Ladezustände vorhanden, Tastaturbedienung möglich.
- **Zweckmäßigkeit** — löst, was die Spec versprochen hat, ohne zusätzliche
  Erfindung.

Eine freie Skala ("wirkt gut") ist keine Bewertung. Der Maßstab ist **kalibriert**:
eine bestehende, akzeptierte Seite des Projekts ist die Referenz, gegen die
verglichen wird — gibt es die noch nicht, benennt der Evaluator das und urteilt nur
über die vier Dimensionen, nicht über "Schönheit".

Das ersetzt den Selbstcheck aus GUARDRAILS G nicht, es ergänzt ihn: dort prüft der
Produzent regelbasiert seinen eigenen Code (Duplikat? Inline-Hex?) — hier urteilt
ein Unbeteiligter über das, was am Bildschirm herauskommt. Bei API-/CLI-Projekten
und reinen Logik-Diffs entfällt die Lens.

## Prozess prüfen, nicht nur das Ergebnis

Ein sauberer End-Diff und ein grünes Gate sagen nicht, ob der *Weg* dorthin korrekt
war — ob die Spec wirklich umgesetzt wurde oder ob der Agent das Ziel verfehlt und
das Gate zufällig getroffen hat. Bei nicht-trivialer agentischer Arbeit prüft
mindestens eine Lens die **Trajektorie**: Folgt die Umsetzung Spec und Plan? Sind
die Zwischenentscheidungen belegt? Wurde ein Akzeptanzkriterium still umgangen?
Reine Outcome-Review übersieht das.

Mehr Reviewer sind nicht automatisch besser: Lässt man identische Judges nur
abstimmen oder "debattieren", verstärkt sich gemeinsamer Bias, statt korrigiert zu
werden. Der Schutz liegt in **getrennten, unabhängigen Lenses** und im adversarialen
Widerlegen — nicht in Wiederholung derselben Perspektive.

## Aufruf
Per [`commands/review.md`](commands/README.md) (`/hx:review`) oder direkt im Loop vor
der Fertig-Meldung. Bei großen Batch-Änderungen können die Lens-Agents in
isolierten Worktrees laufen, jeder testet E2E vor dem Zusammenführen.
