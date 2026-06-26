# Doc-Template — die Form einer Doc-Spec

Ergebnis von Stufe 2 des [DOC_WORKFLOW.md](DOC_WORKFLOW.md). Klärt vor dem
Schreiben, *was* das Dokument leisten muss und woran "fertig" gemessen wird.
Bei kleinen Aufgaben reicht es, diese Punkte kurz im Kopf/Chat zu beantworten;
bei größeren Doku-Projekten als Datei ablegen.

---

```markdown
# Doc-Spec: <Dokument-Titel>

## Zweck
<Ein bis zwei Sätze: Welche Frage beantwortet dieses Dokument? Was soll der
Leser danach können oder wissen?>

## Zielgruppe
<Wer liest das? Endnutzer / Entwickler / künftiger KI-Agent / Auditor.
Bestimmt Tiefe, Vorwissen, Tonfall.>

## Scope
Was das Dokument abdeckt:
- <…>

## Out-of-Scope
Was es bewusst NICHT abdeckt (verhindert Wildwuchs, verweist ggf. auf andere Docs):
- <…>

## Quellen der Wahrheit
Woraus die Fakten stammen und wogegen verifiziert wird:
- <Code-Pfad / Config / API / URL / bestehendes Dokument>

## Fertig-Kriterien
Konkret und prüfbar. Jedes Kriterium wird im Verify-Gate kontrolliert.
- [ ] <Abschnitt X beantwortet Frage Y>
- [ ] Alle Faktenbehauptungen gegen Quelle geprüft
- [ ] Lint + Link-Check + Render grün
- [ ] Keine Duplikate zu <bestehendem Dokument> (stattdessen verlinkt)

## Offene Fragen
Vor dem Schreiben zu klären — solange offen, wird nicht geschrieben:
- <…>
```

---

## Hinweise
- **Fertig-Kriterien sind der Kern.** Schwammig ("soll verständlich sein") →
  unprüfbar. Konkret ("erklärt die 8 Setup-Schritte mit je einem Verify") →
  prüfbar.
- **Zielgruppe ehrlich bestimmen.** Doku für Entwickler darf Vorwissen
  voraussetzen; Doku für Endnutzer nicht.
- **Quellen früh festnageln.** Ohne benannte Quelle lässt sich kein Claim
  verifizieren — und unverifizierbare Doku ist der Default-Weg in "Doku ≠
  Realität".
