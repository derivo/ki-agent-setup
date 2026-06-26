# Doc-Workflow — von der Anfrage zum verifizierten Dokument

Wie aus "schreib/aktualisiere Doku zu X" ein fertiges, geprüftes Dokument wird.
Nicht in einem Rutsch schreiben — erst Zweck klären, dann gliedern, dann
schreiben, dann gegen die Quelle verifizieren.

## Die vier Stufen

### Stufe 1 — Zweck schärfen (kritisches Sparring)
Vor dem Schreiben klären, nicht raten:
- **Wer liest das?** (Endnutzer, Entwickler, künftiger Agent, Auditor)
- **Welche Frage muss das Dokument beantworten?** Was soll der Leser danach
  können/wissen?
- **Was ist bewusst NICHT drin?** (Scope-Grenze)
- **Was ist die Quelle der Wahrheit?** Woher kommen die Fakten (Code, Config,
  API, bestehende Doku)?

Ziel: eine klare, widerspruchsfreie Vorstellung, *bevor* eine Zeile entsteht.
Unklar → fragen, nicht annehmen.

### Stufe 2 — In eine Doc-Spec gießen
Die geschärfte Idee wird zur Doc-Spec nach [DOC_TEMPLATE.md](DOC_TEMPLATE.md):
Zweck, Zielgruppe, Scope/Out-of-Scope, Fertig-Kriterien, Quellen. Bei größeren
Doku-Projekten geht die Spec ins Review, bevor geschrieben wird.

### Stufe 3 — Gliedern
Struktur festlegen, bevor Prosa entsteht: Überschriften-Gerüst, ein Abschnitt pro
abzudeckendem Punkt aus den Fertig-Kriterien. Prüfen: Deckt die Gliederung alle
Kriterien ab? Gibt es Duplikate zu bestehender Doku (dann verlinken statt neu
schreiben, Regel 4)?

### Stufe 4 — Schreiben mit Gate
Pro Abschnitt (nicht alles auf einmal):
1. Abschnitt schreiben. Vor jedem Schreiben gegen
   [DOC_GUARDRAILS.md](DOC_GUARDRAILS.md) prüfen (Selbst-Critic).
2. Faktenbehauptungen sofort gegen die Quelle belegen, nicht aus Erinnerung
   (Regel 1/2).
3. Gate laufen lassen ([VERIFY.md](VERIFY.md)).
4. Bei Rot: Ursache beheben. Wenn ein wiederkehrender Fehler zeigt, dass eine
   Regel fehlt → DOC_GUARDRAILS.md ergänzen (Harness Correction, Details in
   [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md)).
5. Erst wenn grün: nächster Abschnitt. Wiederholen bis das Gate vollständig grün
   ist — mehrere Runden sind normal.

## Sonderfall: Doku aktualisieren (nicht neu schreiben)
Der häufigere Fall. Zusätzlich:
- Zuerst prüfen, **was sich an der Quelle geändert hat** (Diff/Changelog), dann
  die betroffenen Stellen in der Doku finden.
- Nur diese anfassen (Regel 8). Nicht das ganze Dokument umschreiben.
- Jede stehengelassene Behauptung trotzdem gegen die aktuelle Quelle prüfen —
  veraltete Claims sind das Kernrisiko (Doku ≠ Realität).

## Wichtig
- Reihenfolge Zweck → Gliederung → Schreiben → Verify ist kein Dogma, aber der
  Default. Sie verhindert, dass man flüssig formulierten, aber falschen oder
  überflüssigen Text produziert.
- Fällt beim Schreiben auf, dass die Spec lückenhaft ist: zurück zu Stufe 1,
  nicht raten.
