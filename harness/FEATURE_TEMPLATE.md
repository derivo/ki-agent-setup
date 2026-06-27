# Feature-Template — die Form einer fertigen Spec

Jede Feature-Spec folgt dieser Struktur. Sie ist das Ergebnis von Stufe 2 des
[SPEC_WORKFLOW.md](SPEC_WORKFLOW.md) und die Grundlage, aus der Tests abgeleitet
werden ([TESTS.md](TESTS.md)). Eine Spec gilt erst als fertig, wenn jeder
Abschnitt ausgefüllt und beim Menschen reviewt ist — bevor Code entsteht.

Lege fertige Specs unter `specs/<feature-slug>.md` ab.

---

```markdown
# Feature: <Titel>

## Ziel
<Ein bis zwei Sätze: Welches fachliche Problem löst dieses Feature? Für wen?>

## User Story
Als <Rolle> möchte ich <Aktion>, um <Nutzen>.

## Akzeptanzkriterien
Konkret und prüfbar. Jedes AC wird später zu mindestens einem Test.
- AC1: <beobachtbares Verhalten, inkl. erwartetem Ergebnis>
- AC2: <Randfall: was passiert, wenn die Vorbedingung fehlt?>
- AC3: <Berechtigung: wer darf das, wer nicht?>

## Out-of-Scope
Was dieses Feature bewusst NICHT tut. Schützt vor Scope-Creep.
- <…>

## Betroffene Schichten
Welche Schichten werden angefasst (Default-Reihenfolge der Zerlegung von innen
nach außen; konkrete Namen je Stack siehe Adapter):
- [ ] Kern/Domäne: <Entities / Value Objects / Regeln>
- [ ] Use Case (Service): <…>
- [ ] Integration/IO (Persistenz/Adapter): <…>
- [ ] Einstiegspunkt (Endpoint/Handler/CLI): <z. B. Methode + Pfad>

## Sensible-Daten-Check
Pflichtfeld (siehe GUARDRAILS.md, Abschnitt B).
- Werden personenbezogene/sensible Daten verarbeitet? <ja/nein, welche>
- Sind alle Test-/Fixture-Daten synthetisch? <ja>
- Secrets/Zugangsdaten nur aus `.env`/Secret-Store? <ja>
- Besondere Aufbewahrungs-/Löschregeln? <…>

## Offene Fragen
Punkte, die vor der Umsetzung mit dem Menschen geklärt werden müssen. Solange hier
etwas offen ist, wird nicht gecodet.
- <…>
```

---

## Hinweise zum Ausfüllen
- **Akzeptanzkriterien sind der Kern.** Sind sie unklar oder lückenhaft, zurück zu
  Stufe 1 (kritisches Sparring), nicht raten.
- Schreibe ACs so, dass ein Test sie eins zu eins prüfen kann (beobachtbares
  Ergebnis, nicht "funktioniert").
- Der Sensible-Daten-Check ist kein Formfeld zum Abhaken — bei sensibler Domäne
  ist eine bewusste Antwort Pflicht.
