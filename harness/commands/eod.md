Feierabend — letzter Command des Tages. Ziel: nichts Wichtiges geht über Nacht
verloren, und morgen früh reicht `/hx:start`, um nahtlos weiterzumachen.

Strikt in dieser Reihenfolge:

1. **Lehren routen** — `/hx:retro` ausführen (Erkenntnisse klassifizieren,
   Harness-/Skill-/Command-Verbesserungen vorschlagen, Memory routen).
2. **Arbeitsstand sichern** —
   - Uncommittete Änderungen? Diff kurz zeigen und Commit **vorschlagen**
     (`/hx:commit`) — nie automatisch committen (Freigabe-Regel, AGENTS.md).
   - Ungepushte Commits benennen; Push nur auf ausdrückliches OK.
   - Halbfertige Arbeit, die nicht committet werden soll: als Stand notieren
     (nächster Punkt), nicht stillschweigend liegen lassen.
3. **Projekt-State aktualisieren** — wo steht die Arbeit, was ist morgen der
   erste Schritt: GSD-Projekt → `.planning/STATE.md` (+ `SUMMARY.md` der Phase);
   sonst `PROJECT.md`/`README.md`-Standabschnitt.
4. **Restliches Memory sichern** — Entscheidungen, Feedback, Projektinfos aus der
   Session, die noch nicht im Memory stehen, jetzt speichern.
5. **Abschlussreport** — kompakte Liste: gesichert (was, wohin), committet/
   gepusht (oder bewusst offen), morgen zuerst (konkreter erster Schritt).
   Offenes ehrlich als offen benennen, nicht als erledigt.

Unterschied zu `/hx:hot-reload`: hot-reload sichert für den **Neustart in
derselben Arbeit** (`/clear` + weitermachen). `/hx:eod` schließt den **Tag** ab —
inklusive Arbeitsstand-/Commit-Check und Übergabe an morgen.
