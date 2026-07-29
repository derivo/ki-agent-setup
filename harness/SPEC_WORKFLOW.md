> **Lade wenn:** aus einer groben Idee soll eine zerlegte, testbare Spec werden.

# Spec-Workflow — von der Idee zur zerlegten Aufgabe

Diese Datei bringt dem Agenten bei, WIE aus einer groben Idee testbare
Entwicklungsaufgaben werden. Sie ist die Brücke zwischen
[FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) (die Form einer fertigen Spec) und dem
eigentlichen Coden.

Der Kerngedanke: Eine Anforderung wird nicht in einem Rutsch implementiert,
sondern zuerst ZERLEGT. Das LLM bekommt nicht "bau das Feature", sondern eine in
klare Einzelaufgaben zerschnittene Spec, und arbeitet die ab.

## Die vier Stufen

### Stufe 1 — Idee schärfen (kritisches Sparring)
Gibt der Mensch eine grobe Idee, wird NICHT sofort gecodet. Erst hinterfragen —
als kritischer Sparringspartner, nicht als Ja-Sager:
- Was passiert in den Randfällen? (Fehlende Vorbedingung, Ressource erschöpft,
  konkurrierende Zugriffe?)
- Wer darf das? (Berechtigung)
- Was ist bewusst NICHT Teil davon? (Scope-Grenze)
- Gibt es rechtliche/datenschutzrelevante/sicherheitskritische Aspekte?

Ziel: aus einer vagen Idee eine vollständige, widerspruchsfreie Beschreibung auf
fachlicher Ebene machen.

Fällt dabei eine **architektonisch signifikante Entscheidung** (schwer rückgängig,
bewusste Abweichung von der Default-Methode, schichtenübergreifend), wird sie als
ADR festgehalten — siehe [ADR_TEMPLATE.md](ADR_TEMPLATE.md). Die Spec verweist
dann auf das ADR statt die Begründung zu duplizieren.

### Stufe 2 — In Anforderungen gießen
Die geschärfte Idee wird zu einer Feature-Spec nach FEATURE_TEMPLATE.md: Ziel,
Akzeptanzkriterien (konkret und prüfbar), Out-of-Scope, betroffene Schichten,
Sensible-Daten-Check. Diese Spec geht ins Review beim Menschen, BEVOR Code
entsteht. Erst wenn die Akzeptanzkriterien sitzen, geht es weiter.

### Stufe 3 — Anforderung in Aufgaben zerlegen
Die fertige Spec wird in einzelne Entwicklungsaufgaben zerschnitten. Eine gute
Zerlegung folgt den Schichten von **innen nach außen**:
1. Kern/Domäne zuerst (Entities, Value Objects, Regel als Code) + Unit-Tests
2. Use Case (Service) + Test
3. Integration/IO (Persistenz-/Adapter-Implementierung) + Integrationstest
4. Einstiegspunkt (Endpoint/Handler/CLI) + Durchstich-Test (Antwort + Zustand)

Jede Teilaufgabe ist klein genug, um in einem Durchlauf durch das Gate zu passen.
Eine Teilaufgabe, die mehr als ~3 Dateien gleichzeitig anfasst, ist meist zu
groß — weiter zerlegen.

(Konkrete Schicht-/Klassennamen und ein durchgerechnetes Beispiel: Stack-Adapter,
[`stacks/`](stacks/).)

### Stufe 4 — Abarbeiten mit Gate pro Aufgabe
Jede Teilaufgabe durchläuft den vollen Loop (siehe [AGENT_LOOP.md](AGENT_LOOP.md)):
Test schreiben → Code → Gate → bei Rot korrigieren. Erst wenn eine Teilaufgabe
grün ist, beginnt die nächste. Nicht alle parallel anfangen.

## Wichtig
- Die Reihenfolge Kern → Use Case → Integration → Einstiegspunkt ist kein Dogma,
  aber die Default-Zerlegung. Sie sorgt dafür, dass jede Schicht gegen eine
  fertige, getestete innere Schicht baut.
- Tests entstehen pro Teilaufgabe aus den Akzeptanzkriterien, NICHT am Ende.
- Fällt beim Zerlegen auf, dass die Spec lückenhaft ist: zurück zu Stufe 1, nicht
  raten.
