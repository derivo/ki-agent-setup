# Review-Panel — Multi-Agent-Validierung für risikoreiche Diffs

Bei **risikoreichen oder sehr breiten** Änderungen reicht der eigene Blick nicht:
wer schreibt, übersieht dort systematisch, was er beim Schreiben übersehen hat.
Dagegen hilft **mehrere Reviewer mit getrennten Lenses, parallel, jeder Fund am
Code belegt** — eine Urteilsebene, die das mechanische Gate nicht liefert.

Das ist ein Werkzeug für den Ausnahmefall, kein Standardschritt: bei normalen
Änderungen prüft das Modell seine Arbeit selbst, und ein Panel darüber bringt
nichts (siehe „Wann" gleich darunter).

Wann: **immer** bei Diffs, die Auth, Krypto, Migrationen, Secrets oder das Harness
berühren — dazu bei großen, wirklich unabhängigen Änderungen (breite
Multi-File-Arbeit, Massen-Rollout) und bei PR-Vorbereitung.

**Nicht** pauschal bei jeder nicht-trivialen Änderung. Der Default ist Single-Pass
und spec-gegründet; eine zweite Runde braucht ein **strukturelles Signal**, nicht
gefühlte Wichtigkeit (`instructions/AGENTS.md` → Review-Default). Aktuelle Modelle
prüfen und korrigieren ihre Arbeit selbst — ein zusätzlicher Verifikations-Subagent
auf die eigene Arbeit kostet Tokens ohne Qualitätsgewinn. Ein Panel „zur Sicherheit"
ist Over-Verification, kein Schutz (Simplicity First).

Das Panel ersetzt nichts, was **außerhalb** des Modells beobachtet wird: das
mechanische Gate (GUARDRAILS C), der Evidence-Beleg je Akzeptanzkriterium und das
echte Ausführen (`/hx:verify`) bleiben unabhängig von dieser Schwelle Pflicht.

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
      Fund am Code belegen (Datei:Zeile)   ◄─ Beleg entscheidet, nicht Abstimmung
      (Unsicherheit → melden UND als unsicher markieren)
                       │
                       ▼
      Bericht: belegte Funde zuerst, unsichere getrennt darunter
      (Datei:Zeile · Lens · Schwere · Fix)
```

## Regeln

- **Alles melden, in einem getrennten Pass filtern.** Ein Fund wird am Code belegt
  (Datei:Zeile, Repro-Schritt); hält der Beleg nicht, fällt er raus. Bei
  Unsicherheit wird der Fund **gemeldet und als unsicher markiert**, nicht
  unterdrückt. Ein „im Zweifel widerlegt"-Default bringt aktuelle Modelle dazu,
  Anweisungen zur Zurückhaltung wörtlich zu nehmen und insgesamt *weniger* zu
  melden — echte Bugs verschwinden dann mit den falschen. Filtern ist ein eigener
  Schritt, keine Voreinstellung im Finden.
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
  (GUARDRAILS Abschnitt G) und fällt nicht aus dem Rest der App heraus. Gibt es
  eine `DESIGN.md`/Token-Quelle, wird der gerenderte Zustand gegen deren Tokens
  geprüft (Farben/Typo/Abstände/Radien aufgelöst, Kontrast ≥ WCAG AA), nicht nur
  gegen den Gesamteindruck.
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
das Gate zufällig getroffen hat. Läuft ein Panel, prüft mindestens eine Lens die
**Trajektorie**: Folgt die Umsetzung Spec und Plan? Sind
die Zwischenentscheidungen belegt? Wurde ein Akzeptanzkriterium still umgangen?
Reine Outcome-Review übersieht das.

Mehr Reviewer sind nicht automatisch besser: Lässt man identische Judges nur
abstimmen oder "debattieren", verstärkt sich gemeinsamer Bias, statt korrigiert zu
werden. Der Schutz liegt in **getrennten, unabhängigen Lenses** und im **Beleg am
Code** — nicht in Wiederholung derselben Perspektive und nicht in einer weiteren
Abstimmungsrunde.

## Aufruf
Per [`commands/review.md`](commands/README.md) (`/hx:review`) oder direkt im Loop,
wenn ein Diff die Schwelle oben erreicht. Bei großen Batch-Änderungen können die Lens-Agents in
isolierten Worktrees laufen, jeder testet E2E vor dem Zusammenführen.
