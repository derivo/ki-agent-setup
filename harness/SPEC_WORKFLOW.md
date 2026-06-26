# Spec-Workflow — von der Idee zur zerlegten Aufgabe

Diese Datei bringt dem Agenten bei, WIE aus einer groben Idee testbare
Entwicklungsaufgaben werden. Sie ist die Brücke zwischen
[FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) (die Form einer fertigen Spec) und dem
eigentlichen Coden.

Der Kerngedanke: Eine Anforderung wird nicht in einem Rutsch implementiert,
sondern zuerst ZERLEGT. Das LLM bekommt nicht "bau das Punktesystem", sondern
eine in klare Einzelaufgaben zerschnittene Spec, und arbeitet die ab.

## Die vier Stufen

### Stufe 1 — Idee schärfen (kritisches Sparring)
Wenn der Mensch eine grobe Idee gibt ("Jugendliche sollen Punkte einlösen
können"), wird NICHT sofort gecodet. Erst hinterfragen — als kritischer
Sparringspartner, nicht als Ja-Sager:
- Was passiert in den Randfällen? (Nicht genug Punkte? Belohnung vergriffen?
  Zwei Betreuer gleichzeitig?)
- Wer darf das? (Berechtigung)
- Was ist bewusst NICHT Teil davon? (Scope-Grenze)
- Gibt es rechtliche/datenschutzrelevante Aspekte? (Daten Minderjähriger!)

Ziel der Stufe: aus einer vagen Idee eine vollständige, widerspruchsfreie
Beschreibung auf fachlicher Ebene machen.

### Stufe 2 — In Anforderungen gießen
Die geschärfte Idee wird zu einer Feature-Spec nach FEATURE_TEMPLATE.md:
Ziel, Akzeptanzkriterien (konkret und prüfbar), Out-of-Scope, betroffene
Schichten, Datenschutz-Check. Diese Spec geht ins Review beim Menschen, BEVOR
Code entsteht. Erst wenn die Akzeptanzkriterien sitzen, geht es weiter.

### Stufe 3 — Anforderung in Aufgaben zerlegen
Die fertige Spec wird in einzelne Entwicklungsaufgaben zerschnitten. Eine gute
Zerlegung folgt den Schichten und ist in sinnvoller Reihenfolge:
1. Domain zuerst (Entities, Value Objects, Regel als Code) + zugehörige Unit-Tests
2. Service (Use Case) + Test
3. Infrastructure (Repository-Implementierung) + Integrationstest
4. Action (HTTP-Endpunkt) + API-Test (Response + DB-State)

Jede Teilaufgabe ist klein genug, um in einem Durchlauf durch das Quality Gate
zu passen. Eine Teilaufgabe, die mehr als ~3 Dateien gleichzeitig anfasst, ist
meist zu groß — weiter zerlegen.

### Stufe 4 — Abarbeiten mit Gate pro Aufgabe
Jede Teilaufgabe durchläuft den vollen Loop (siehe [AGENT_LOOP.md](AGENT_LOOP.md)):
Test schreiben → Code → `composer quality` → bei Rot korrigieren. Erst wenn eine
Teilaufgabe grün ist, beginnt die nächste. Nicht alle parallel anfangen.

## Wichtig
- Die Reihenfolge Domain → Service → Infrastructure → Action ist kein Dogma, aber
  die Default-Zerlegung. Sie sorgt dafür, dass jede Schicht gegen eine fertige,
  getestete innere Schicht baut.
- Tests entstehen pro Teilaufgabe aus den Akzeptanzkriterien, NICHT am Ende.
- Wenn beim Zerlegen auffällt, dass die Spec lückenhaft ist: zurück zu Stufe 1,
  nicht raten.

## Beispiel: "Belohnung einlösen" zerlegt

Spec-Akzeptanzkriterien:
- AC1: Ein Jugendlicher mit genug Punkten kann eine verfügbare Belohnung einlösen;
  sein Punktestand sinkt um den Belohnungswert.
- AC2: Reichen die Punkte nicht, schlägt das Einlösen fehl; Punktestand bleibt.
- AC3: Nur ein Betreuer kann das Einlösen im Namen des Jugendlichen bestätigen.

Zerlegung:
1. Domain: `Reward`, `RewardCost` (VO), Regel "Saldo darf nicht negativ werden"
   in `PointAccount.redeem()` + Unit-Tests für AC1/AC2.
2. Service: `RedeemReward` Use Case + Test (Berechtigung AC3 hier prüfen).
3. Infrastructure: `PdoRewardRepository` + Integrationstest.
4. Action: `POST /rewards/{id}/redeem` + API-Test (Response + DB-Saldo prüfen).
