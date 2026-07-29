> **Lade wenn:** ein kompletter Feature-Lauf wird abgearbeitet.

# Feature-Loop — das Runbook

Diese Datei ist das Runbook für einen einzelnen Feature-Lauf. Sie kann direkt als
Auftrag an den Agenten gegeben werden (z. B. als Slash-Command `/feature <Name>`,
falls das Projekt einen anlegt). Der Agent arbeitet das Feature vollständig nach
dem Harness ab und hält sich strikt an die Reihenfolge — kein Schritt wird
übersprungen.

Zuerst den passenden Stack-Adapter ([`stacks/`](stacks/)) lesen — er liefert die
konkreten Schichtnamen und das Gate-Kommando.

---

Du arbeitest das Feature **"$ARGUMENTS"** vollständig nach dem Harness ab.

0. **Baseline-Check.** Bevor du am Feature arbeitest, den Ist-Stand verifizieren:
   das Gate-Kommando des Stacks einmal laufen lassen. Ist es schon rot, ist das
   **vorbestehende** Breakage — melden und klären, bevor du Neues baust. Sonst
   vermischt sich dein Ergebnis mit fremdem Rot und eine spätere Grün-Meldung wäre
   nicht deinem Code zuzuschreiben. Grün auf dem Ist-Stand ist die Startlinie.

1. **Spec prüfen.** Suche die Spec zu diesem Feature unter `specs/`. Existiert
   keine, erstelle sie nach [FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) und arbeite
   die Stufen aus [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md) ab — inklusive der
   kritischen Rückfragen. Sind die Akzeptanzkriterien unklar oder lückenhaft,
   FRAGE nach, statt zu raten.

2. **Zerlegen.** Zerlege die Spec nach SPEC_WORKFLOW.md in Teilaufgaben von innen
   nach außen: Kern/Domäne → Use Case → Integration/IO → Einstiegspunkt. Liste die
   Teilaufgaben kurz auf, bevor du beginnst.

3. **Pro Teilaufgabe — der innere Loop:**
   a. Schreibe ZUERST den/die Test(s) aus den Akzeptanzkriterien (siehe
      [TESTS.md](TESTS.md); bei Einstiegspunkt-Aufgaben Durchstich-Test: Antwort
      UND Zustand).
   b. Implementiere den Code in der richtigen Schicht. Prüfe vor jedem Schreiben
      gegen [GUARDRAILS.md](GUARDRAILS.md) (Selbst-Critic).
   c. Lass das Gate-Kommando des Stacks laufen.
   d. Bei Rot: Behebe die Ursache. Zeigt der Fehler eine fehlende Harness-Regel,
      ergänze sie (Harness Correction, siehe AGENT_LOOP.md). Wiederhole ab c.
   e. Erst wenn grün: nächste Teilaufgabe.

4. **Abschluss.** Wenn alle Teilaufgaben grün sind, fasse zusammen, welche
   Akzeptanzkriterien durch welche Tests abgedeckt sind. Den Merge/Deploy macht
   der Mensch — du bereitest nur vor.

## Leitplanken während des gesamten Loops
- Ein Feature pro Lauf. Nicht vorgreifen, nichts bauen, was die Spec nicht
  verlangt.
- Testdaten immer synthetisch; keine Secrets im Code (GUARDRAILS.md, Regel 3).
- Du giltst als fertig, wenn das Gate grün ist — nicht, wenn du es für gut hältst.
