> **Lade wenn:** eine architektonisch signifikante Entscheidung fällt an und wird
> festgehalten.

# ADR-Template — die Form eines Architecture Decision Record

Ein ADR (Architecture Decision Record) hält **eine** architektonisch
signifikante Entscheidung fest: was entschieden wurde, warum, und welche Folgen
das hat. Es ist kein How-to und keine Spec, sondern ein Beleg — damit später
nachvollziehbar bleibt, *warum* etwas so gebaut ist, ohne die Köpfe der
Beteiligten zu befragen.

Lege ADRs unter `decisions/NNNN-<slug>.md` ab (vierstellig, fortlaufend:
`0001-…`, `0002-…`). Parallel zu `specs/`.

## Wann ein ADR

Nicht für jede Kleinentscheidung. Ein ADR entsteht, wenn eine Entscheidung
mindestens eins davon erfüllt:
- **schwer rückgängig** zu machen (Datenmodell, Persistenz-Wahl, externe API,
  Sprach-/Runtime-Wechsel),
- **bewusste Abweichung** von einer GUARDRAILS-Regel oder der Default-Methode
  (siehe [GUARDRAILS.md](GUARDRAILS.md)),
- **schichtenübergreifend** oder prägt das Projekt über das einzelne Feature
  hinaus.

Eine reine Feature-Umsetzung innerhalb der Default-Methode braucht kein ADR — sie
steht in der Spec ([FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md)).

## Status-Lifecycle

ADRs werden **nicht gelöscht und nicht umgeschrieben**, sobald akzeptiert. Eine
geänderte Entscheidung bekommt ein neues ADR, das das alte ablöst.

- `Vorgeschlagen` — zur Diskussion, noch nicht gültig.
- `Akzeptiert` — gültig, ab Datum X.
- `Abgelöst durch ADR-NNNN` — durch ein neueres ersetzt; bleibt als Historie
  stehen.

---

```markdown
# ADR-NNNN: <Titel der Entscheidung>

- **Status:** Vorgeschlagen | Akzeptiert | Abgelöst durch ADR-NNNN
- **Datum:** YYYY-MM-DD
- **Betrifft:** <Schicht/Modul/Feature, optional Spec-Slug>

## Kontext
<Welches Problem oder welche Kraft erzwingt eine Entscheidung? Fakten, Zwänge,
Anforderungen — keine Lösung. Genug, dass jemand ohne Vorwissen versteht, warum
hier überhaupt entschieden werden muss.>

## Entscheidung
<Was wurde entschieden, aktiv formuliert: "Wir nutzen X." Eine Entscheidung pro
ADR.>

## Konsequenzen
<Was folgt daraus — positiv UND negativ. Was wird einfacher, was teurer, welche
neue Verpflichtung entsteht? Hier steht der Preis ehrlich, nicht nur der Nutzen.>

## Alternativen
<Welche Optionen standen zur Wahl und warum wurden sie verworfen? Eine je Zeile
reicht. Schützt davor, dieselbe Debatte später erneut zu führen.>
```

---

## Hinweise zum Ausfüllen
- **Eine Entscheidung pro ADR.** Mehrere Entscheidungen → mehrere ADRs.
- **Kontext vor Entscheidung.** Wer den Kontext überspringt, schreibt ein
  Merkblatt, kein Record — der Wert steckt im *Warum*.
- **Konsequenzen ehrlich.** Auch die negativen. Ein ADR ohne Kosten ist
  geschönt.
- Querverweise auf verdrängte/verwandte ADRs immer mit Nummer (`ADR-0003`), nicht
  mit Titel — Titel ändern sich, Nummern nicht.
