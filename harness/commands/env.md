Kläre den Umgebungs-Vertrag für "$ARGUMENTS" (oder die anstehende Deploy-/Infra-Arbeit),
**bevor** die Arbeit beginnt. Ziel: kein Stillstand mitten im Lauf, weil ein Zugang fehlt.

1. **Auflisten, was der Lauf braucht** — je Punkt eine Zeile, nichts auf Verdacht:
   Credentials/Tokens, SSH-Zugänge, `sudo`-Aktionen, erreichbare Hosts/Ports,
   Container-/VM-Baseline (läuft, genug RAM/Platz), benötigte CLIs samt Version.

2. **Jeden Punkt jetzt mit genau einem Befehl prüfen** — und die **Beobachtung**
   notieren, nicht die Erwartung. Der Punkt ist grün, wenn der Befehl es zeigt:
   Erreichbarkeit am Zielhost, nicht am Gateway; die CLI mit `--version`, nicht
   über die Existenz ihres Config-Verzeichnisses (`GUARDRAILS.md` C,
   „Vorhandensein ≠ Verhalten"). Fehlt ein Zugang, ist das ein **Befund**, keine
   Aufforderung, einen Umweg zu suchen.

3. **Konsolidiert melden, einmal** — was grün ist, was fehlt, und was du dafür vom
   Menschen brauchst. Eine Liste am Stück statt fünf Rückfragen über die Session
   verteilt; jede einzelne kostet einen Kontextwechsel.

4. **Nicht starten, solange ein Punkt rot ist.** Teil-Start „und den Rest klären
   wir unterwegs" ist genau das Muster, das die Session später stalled — dann mit
   halb angelegtem Zustand, der zurückgebaut werden muss.

5. **Grenze benennen, bevor sie erreicht wird.** Was diesem Lauf verwehrt bleibt,
   steht vorab in der Meldung: Merge und Deploy bleiben beim Menschen
   (`GUARDRAILS.md` D), ebenso alles, was ein Permission-Guard blockt. Nicht
   ausprobieren, ob es diesmal durchgeht.

Arbeitet eine zweite Session auf demselben Host/Working-Tree, gilt zusätzlich
`GUARDRAILS.md` Regel 10 — eigener Worktree, sonst teilen sich beide Läufe
Dateizustand, DB und Cache.

Passend danach: `/hx:verify` beobachtet das Ergebnis, `/hx:pr` bereitet die Übergabe vor.
