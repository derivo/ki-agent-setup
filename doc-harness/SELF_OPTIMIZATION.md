# Selbst-Optimierung — die prüfende Schleife & ihr Lerneffekt

Auch das Doc-Harness lebt von zwei Schleifen: einer, die prüft und wiederholt, bis
die Doku verifiziert ist, und einer, die das Harness aus jedem gefangenen Fehler
schärfer macht. Für Doku ist das doppelt wichtig, weil der gefährlichste Fehler —
Doku ≠ Realität — leise ist und nur durch wiederholtes Prüfen gegen die Quelle
auffällt.

---

## Schleife 1 — Wiederholen & Prüfen (Loop-until-verified)

Ein Dokument ist nicht nach dem ersten Schreiben fertig, sondern wenn das Gate aus
[VERIFY.md](VERIFY.md) grün ist — beide Ebenen, mechanisch **und**
Claims-gegen-Quelle.

```
Abschnitt schreiben / ändern
      │
      ▼
[Selbst-Critic]  ── vor dem Write gegen DOC_GUARDRAILS.md
      │
      ▼
Gate: Lint + Links + Render  UND  Claims-gegen-Quelle
      │
   rot │ grün
      │     └────────► nächster Abschnitt / fertig
      ▼
Ursache beheben ──► erneut prüfen ──┐
      │                             │
      └─────────────◄───────────────┘
```

Regeln für die Schleife:
- **Beide Ebenen müssen grün sein.** Grüner Lint bei ungeprüften Claims ist nicht
  fertig.
- **Behauptung korrigieren, nicht Quelle umdeuten.** Stimmt der Text nicht mit der
  Quelle überein, ist der Text falsch — nicht die Realität.
- **Nicht belegbar → entfernen oder als unverifiziert markieren** und benennen,
  nicht kosmetisch grünfärben.

## Schleife 2 — Harness Correction (Selbst-Optimierung)

Fängt das Gate einen Fehler, den eine Regel hätte verhindern können, wird die
Regel ergänzt — nicht nur die Stelle gefixt.

```
Gate fängt Fehler (toter Link, ungeprüfter Claim, Duplikat …)
      │
      ▼
Hätte eine Regel das verhindert?
   │ nein → nur die Stelle fixen
   │ ja
   ▼
Regel in DOC_GUARDRAILS.md ergänzen
      │
      ▼
Gate erneut → grün → Harness ist schärfer
```

Beispiele für Correction aus echten Doku-Fehlern:
- Wiederholt veraltete Versionsnummern → Regel "Versionsangaben immer gegen die
  Quelle ziehen, nie abtippen".
- Wiederholt dieselbe Info in zwei Dateien → Single-Source-Regel verschärfen +
  Verweis-Konvention festhalten.

### Wann eine Regel ergänzen — und wann nicht
- **Ja** bei wiederkehrenden/strukturellen Fehlern (eine ganze Fehlerklasse).
- **Nein** für einen einmaligen Tippfehler ohne Muster — nur fixen.
- Neue Regel konkret und prüfbar, nicht "sorgfältiger schreiben". Sonst
  Regel-Wildwuchs (gegen Simplicity First).

## Der Update-Reflex (wichtigste Wiederholung)

Doku altert, auch ohne dass jemand sie anfasst — weil die Quelle sich ändert.
Deshalb ist die prüfende Schleife nicht nur beim Schreiben, sondern **bei jedem
Wiederbesuch** Pflicht:
1. Was hat sich an der Quelle geändert (Diff/Changelog)?
2. Welche Behauptungen im Dokument betrifft das?
3. Diese gegen die aktuelle Quelle prüfen — auch die, die niemand "angefasst" hat.

## Selbst-Review vor "fertig"

Vor der Fertig-Meldung den eigenen Diff adversarial lesen: Welche Behauptung ist
ungeprüft? Welcher Link wurde nicht getestet? Welche Änderung war nicht
angefordert? Erst dann melden — mit Beobachtung, welche Checks liefen und welche
Claims gegen welche Quelle geprüft wurden.

## Wann stoppen und fragen
- Eine Behauptung lässt sich nicht gegen eine Quelle auflösen und die Quelle ist
  unklar → fragen, statt zu raten.
- Quelle widerspricht der bestehenden Doku grundlegend → benennen, nicht still
  eine Seite wählen.
- Das Gate verlangt etwas, das die Doc-Spec ausschließt → klären.

Siehe auch Ehrlichkeit/Disziplin in `../instructions/AGENTS.md`.
