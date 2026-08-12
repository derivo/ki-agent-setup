> **Tier 1 — immer.** Vor jedem Write/Edit an Code und vor jeder Fertig-Meldung.
> Nur Abschnitt G (UI) ist ausgelagert nach [GUARDRAILS_UI.md](GUARDRAILS_UI.md).

# Guardrails — die harten Regeln

Diese Regeln gelten **immer**, in jeder Phase, bei jedem Schreibvorgang. Der Agent
wendet sie selbst an: vor jedem Schreiben (Selbst-Critic) und vor jeder
Fertig-Meldung (Fertig-Kriterium).

Wenn du als Agent gegen eine dieser Regeln verstoßen würdest: nicht schreiben,
sondern korrigieren. Wenn eine Regel fehlt, die einen Fehler verhindert hätte:
ergänze sie (Harness Correction Development) — generelle Regeln hier, stack-
spezifische im Stack-Adapter.

Die konkreten Schicht-/Ordnernamen und Verbots-Muster (Imports, Zugriffe) stehen
im **Stack-Adapter** ([`stacks/`](stacks/)). Hier steht das Prinzip.

---

## 0. Scope-Minimum (vor jedem Write prüfen)

### Regel — Eigene Specs und Tests erweitern den Auftrag nicht
Bei einer klar umrissenen Einzel-Funktion ist der Aufgabenwortlaut die
Scope-Grenze. Eine selbst erzeugte Spec oder Testsuite darf nicht nachträglich
ungefragte Validierung, Typprüfungen, Fehlerpfade oder Konfigurierbarkeit
„erfordern". Gültige Eingaben werden als gültig behandelt; Annahmen stehen in der
Abschlussmeldung, nicht als zusätzlicher Guard oder zusätzliches
Akzeptanzkriterium im Code.

### Regel — Skills liefern Technik, nicht Scope
Ein Skill, Subagent-Prompt oder Plugin darf sagen *wie* etwas gemacht wird
(Werkzeug, Syntax, Muster, Reihenfolge) — nie *wie viel* gemacht wird. Verlangt ein
Skill mehr als der Auftrag hergibt ("comprehensive coverage", "alle Edge Cases",
"production-ready", ungefragtes Hardening), gilt der Auftrag und diese Regel; der
Skill-Teil, der Scope hinzufügt, wird ignoriert und die Abweichung in der
Abschlussmeldung genannt.

**Rangfolge bei Widerspruch** (oben gewinnt):

1. **Auftragswortlaut** des Nutzers — setzt den Scope.
2. **Diese Guardrails** — begrenzen das *Wie*, nie zugunsten von mehr Scope.
3. **Projekt-`AGENTS.md`/`CLAUDE.md`** — Hauskonventionen des Repos.
4. **Harness-Prinzipien** (`ENGINEERING.md`, Stack-Adapter) — Prinzip, nicht Gate.
5. **Skills / Subagent-Prompts / Plugin-Anweisungen** — Technik-Zulieferer.

Ein Widerspruch wird **benannt**, nicht stillschweigend nach Rangfolge aufgelöst:
eine Zeile in der Abschlussmeldung, welche Quelle verworfen wurde und warum. Ist
die tieferstehende Quelle inhaltlich im Recht, ist das ein Fall für Harness
Correction (oben) — Regel hier schärfen, nicht die Rangfolge umdrehen.

**Eine `DESIGN.md` hat in dieser Rangfolge keinen eigenen Rang.** Abschnitt G
([GUARDRAILS_UI.md](GUARDRAILS_UI.md), Regel 7) setzt nur die *Form* — `DESIGN.md` ist das gesetzte Format, und Tokens
sind normativ *innerhalb* dieser Datei. Als Guardrail begrenzt das das *Wie*
(Rang 2) und macht die Datei nicht zur höherrangigen **Inhalts**quelle gegenüber
anderen Design-Vorgaben des Projekts. Ein inhaltlicher Widerspruch zwischen
`DESIGN.md` und einem `STYLEGUIDE.md`, `docs/design-*` oder einem Design-Kapitel
wird von dieser Rangfolge deshalb **nicht** entschieden — sie ordnet Scope- und
Wie-Quellen, nicht die Frage, welcher Design-*Inhalt* richtig ist. Das gilt auch
dort, wo die konkurrierende Quelle selbst einen Rang hat (Projekt-`CLAUDE.md`/
`AGENTS.md`, Rang 3): ein höherer Rang setzt sie nicht automatisch durch, weil der
Rang über Scope und Vorgehen entscheidet, nicht über den Farbwert. Der Fall geht an
„Bestand zuerst — nichts vorschlagen in einen besetzten Platz"
([GUARDRAILS_UI.md](GUARDRAILS_UI.md), Abschnitt G) —
beide Fundstellen mit Datei und Zeile benennen, der Nutzer entscheidet, bis dahin
wird nichts überschrieben.

---

## A. Architektur-Reinheit (vor jedem Write/Edit prüfen)

Abhängigkeiten zeigen nur **nach innen**: Kern/Domäne ← Use Case (Service) ←
Integration/IO ← Einstiegspunkt (Controller/Handler/Endpoint/CLI).

### Regel 1 — Der Kern bleibt rein
Die Domänen-/Kernschicht enthält **keine** Framework-, Transport- oder
IO-Abhängigkeiten und **keinen** direkten Zugriff auf Persistenz/Netzwerk/Dateien.
Der Kern arbeitet nur gegen **Interfaces/Ports**; technische Details liegen in der
Integrations-/IO-Schicht.

### Regel 2 — Einstiegspunkte greifen nicht direkt auf IO/Persistenz zu
Controller/Handler/Endpoints rufen einen Use Case (Service) auf; Persistenz und
externe IO laufen über die Integrationsschicht / Dependency Injection — nicht
direkt aus dem Einstiegspunkt.

Musst du beim Schreiben eine dieser Regeln brechen, ist das ein Design-Signal: die
Verantwortung liegt in der falschen Schicht. (Konkrete verbotene Importe/Aufrufe
je Stack: Adapter.)

---

## B. Sensible Daten & Secrets (hart)

### Regel 3 — Keine Secrets, keine echten personenbezogenen Daten
- Keine Credentials/API-Keys/Tokens/internen Hostnamen im Code oder in Beispielen
  — solche Werte gehören in `.env`/Secret-Stores.
- Test-/Fixture-/Seed-Daten sind **ausschließlich synthetisch**: niemals echte
  oder realistische Klarnamen, Geburtsdaten, Adressen tatsächlicher Personen.
  Faker o. Ä. oder offensichtliche Platzhalter nutzen.
- Keine echten Produktions-Datenexporte als Testbasis.

Verarbeitet die Domäne besonders sensible Daten (Minderjährige, Gesundheit,
Finanzen), verschärft der Stack-Adapter diese Regel projektspezifisch. Im Zweifel:
strenger behandeln, nicht laxer.

---

## C. Das Fertig-Kriterium (vor jeder Fertig-Meldung)

> Du bewertest deine Arbeit nicht selbst.

Eine Aufgabe gilt **nicht** als fertig, weil du sie für gut hältst, sondern erst,
wenn das **Gate** grün ist — das eine Kommando des Stacks, das statische Analyse,
Typprüfung, Formatter und Tests bündelt (welches genau: Stack-Adapter).

Solange das Gate rot ist:
- Beheben statt beenden. **Die Ursache** fixen, nicht das Symptom.
- Keine Suppressions, keine Test-Manipulation, damit es grün aussieht.
- Zeigt der Fehler, dass eine Harness-Regel fehlte: passende Regel ergänzen
  (hier oder im Adapter), dann erneut laufen lassen.

Erst wenn das Gate sauber durchläuft, darfst du "fertig" melden — mit der
Beobachtung (Befehl + Ergebnis).

Bei größeren Features ist das Fertig-Kriterium nicht ein einzelner Lauf, sondern
eine enumerierte, prüfbare AC-Liste (je AC ein Test, alle anfangs rot). Tests sind
dabei unantastbar — grün entsteht nur durch korrekten Code, nie durch Aufweichen
eines Tests (siehe [TESTS.md](TESTS.md)).

### Regel — Laufende Verifikation nicht unterminieren
- Während ein Test-/Verify-Lauf gegen einen live nachladenden Server läuft
  (Vite/HMR, watch-Modus, Hot-Reload), sind Quellcode-Mutationen tabu:
  kein Edit, kein `git stash/checkout/switch`, kein Branch-Wechsel.
  Erst Lauf beenden oder abbrechen, dann mutieren — sonst testet der Lauf
  einen Zustand, den es nie gab (Flakes, wertlose Ergebnisse).

### Regel — Vollständigkeits-Aussagen erden
Bevor du „alle / vollständig / jedes X" meldest: die tatsächliche Grundgesamtheit
von X aus der **Ground Truth** enumerieren (Controller, Routen, Dateien, DB), nie
aus einem Proxy (Feature-Flag-Liste, Doku-Kapitel, Erinnerung). Die Zählung selbst
ist Teil des Fertig-Kriteriums — nicht nur „ist jedes bekannte Element geprüft".

### Regel — Abwesenheit so streng belegen wie Anwesenheit
Eine „X fehlt / nicht vorhanden / nicht verdrahtet"-Aussage braucht dieselbe
Beleg-Härte wie eine Existenz-Aussage: am tatsächlichen Ort prüfen (z. B. Paket-Dir
+ Binary + Config, nicht ein einziger Manifest-grep), bevor du Abwesenheit
behauptest. Ein Ein-Quellen-Schluss ist kein Beleg.

### Regel — Reference-first bei Mass-Rollout / Fan-out
Bevor ein struktureller/Layout-Pattern über viele Dateien ausgerollt wird (besonders
via Subagent-Fan-out): existiert ein kanonisches Vorbild, zuerst **eine** Datei exakt
gegen dessen Struktur bauen und verifizieren — dann erst fan-out. Eine erfundene
Variante multipliziert sich über alle N (Rework-Kosten = N), auch wenn sie lokal
plausibel aussieht. Ergänzt „Style des Bestands matchen": nicht nur der lokale Stil,
sondern die Struktur des Referenz-Exemplars.

### Regel — Fan-out-Ergebnis zentral verifizieren
Ergebnisse paralleler Subagents werden zentral geprüft (Gate/Compile **und**
Runtime-/Render-Check), nicht aus ihren Selbstmeldungen geschlossen. Agents kürzen
Scope still — entfernen „leere" Wrapper, lassen Teile aus, melden trotzdem Erfolg.
Ein grüner Compile-Check ist kein Runtime-Beleg, wenn die Änderung Verhalten
(Interaktion, dynamische UI) berührt: dann zusätzlich am gerenderten Zustand prüfen.

### Regel — „Immer noch kaputt" heißt reproduzieren, nicht raten
Meldet der Nutzer nach einem Fix, dass ein Verhalten/visueller Bug weiter besteht,
wird VOR dem nächsten Fix eine deterministische Reproduktion des exakten Symptoms
gebaut (Skript, DOM-/State-Sample, Video, Log) und die Ursache daran belegt. Kein
zweiter spekulativer Fix ohne Reproduktion — gestapelte Vermutungs-Fixes kaschieren
die wahre Ursache und kosten Runden. Kennt das Beobachtungs-Tool eine Grenze (z. B.
Playwright-Page-Video erfasst keinen Inter-Dokument-Paint), wird das benannt statt
als „gefixt / nicht reproduzierbar" gewertet.

Ist der Defekt an eine Umgebung gebunden, die der Agent nicht selbst fahren kann
(fremder Browser, fremdes OS, Gerät des Nutzers), ersetzt eine andere Umgebung die
Reproduktion NICHT. Dann werden Messwerte aus der betroffenen Umgebung angefordert
(Konsolen-Snippet, Log, Ausschnitt) und die Beobachtung zuerst in Klassen zerlegt —
bei Rendering-Befunden Geometrie gegen Paint gegen Umgebungs-Chrome. Ein Mechanismus
wird erst benannt, wenn die Messung die anderen Klassen ausschließt; bis dahin gilt
der Befund als offen, auch wenn ein Fix plausibel wirkt. Ein vermuteter Mechanismus
gehört nicht in ein dauerhaftes Artefakt (PR-Body, Commit, Doku).

### Regel — Stochastische Defekte: Rate samt Unsicherheit messen
Tritt ein Defekt **nicht bei jedem Lauf** auf, ist ein grüner Lauf **kein**
Fertig-Beleg — ein ungefixter Stand liefert bei kleiner Stichprobe genauso grün.
Wenn sicher und praktikabel, vor dem Fix eine **Baseline** als
`Fehlschläge/Läufe` mit benanntem `n` und Bedingungen messen; nach dem Fix unter
vergleichbarer Exposition wiederholen und **beide Zahlen** melden. `0/n` ist keine
bewiesene Nullrate, sondern eine endliche Stichprobe.

Ist eine Baseline unsicher, unverhältnismäßig oder nicht mehr reproduzierbar, wird
der Defekt nicht eigens dafür erneut ausgelöst. Dann vorhandene Evidenz, eine
sichere deterministische Fixture oder den belegten Ursachenpfad verwenden und die
fehlende Vorher-/Nachher-Rate benennen. „Gefixt" setzt zusätzlich voraus, dass der
Fix den belegten Fehlerpfad schließt; nur bessere Sichtbarkeit oder eine nicht
messbar gesenkte Rate wird als Mitigation ausgewiesen.

### Regel — Messinstrument vor dem Ergebnis prüfen
Ein neu gebauter Detektor, Test oder Probe wird zuerst gegen **bekannte** Fälle
geprüft: Positivkontrolle muss anschlagen, Negativkontrolle schweigen. Bei
stochastischen Instrumenten werden Kontrollen wiederholt und beobachtete
Fehlalarme/Auslassungen benannt, statt perfekte Erkennung zu behaupten.

Die **behauptete Variable** wird möglichst direkt an ihrer Autorität gemessen.
Ist nur ein Proxy oder Spiegel verfügbar, müssen Herkunft, Aktualität und Bezug
zur Zielvariable belegt sein; die Aussage wird auf genau diese Evidenz begrenzt.
Ein Client-Cache belegt zum Beispiel den Zustand seiner Version oder seines
Zeitpunkts, nicht ohne erneute Bestätigung den aktuellen Server-/DB-Zustand. Ist
die Autorität nicht prüfbar, wird das Ergebnis als begründete Inferenz markiert.
Ein Befund aus einem ungeprüften Instrument ist keine Erkenntnis, sondern eine
zweite Fehlerquelle.

### Regel — Messlauf-Umfang vor der Zahl prüfen
Bevor eine Lauf-Zahl (Tests grün/rot, Treffer, Fundstellen) als Baseline oder
Beleg dient: prüfen, ob der Lauf die Grundgesamtheit **überhaupt erfasst hat**.
Fail-fast (`maxFailures`, `-x`), Marker-/Pfad-Filter und abweichende Aufrufformen
kürzen den Umfang still — die Zahl sieht dann aus wie ein Ergebnis, ist aber eine
Teilmenge. Ein „did not run" in der Zusammenfassung ist kein Nebensatz, sondern
sagt, dass die Messung nicht stattgefunden hat.

Ebenso ordnet ein **geteiltes Log** bei parallelen Läufen keine Zeile einem
einzelnen Fall zu. Wer aus fremdem Output auf den eigenen Fall schließt, misst
das falsche Instrument — die Zuordnung braucht eine fallgebundene Quelle
(eigener Mitschnitt, isolierter Lauf, korrelierende Id).

### Regel — Verifikation belegen: Evidence, nicht Behauptung
Die Fertig-Meldung führt je Akzeptanzkriterium einen **prüfbaren Beleg** — Datei:Zeile,
grep-Zähler, Test-Name + Ergebnis, beobachtete Ausgabe — nicht die Zusage „erledigt".
Ein Kriterium ohne Beleg gilt als **nicht** verifiziert. Was **nur** zur Laufzeit
prüfbar ist (Sandbox-Verhalten, echtes Rendering, Keychain/OS-Integration, Deploy-
Pfad), wird nicht als maschinell verifiziert ausgegeben, sondern als **eigener
Human-Verify-Checkpoint** ausgewiesen. Code-Gate (maschinell) und Runtime-Gate
(Mensch/echte Umgebung) sind getrennte Ebenen — die eine überdeckt nie die andere.

---

## D. Grenze zum Menschen

Der Loop automatisiert Bauen und Prüfen. **Merge und Deploy bleiben beim
Menschen.** Der Agent bereitet vor, der Mensch gibt frei. Wie weit Autonomie
reicht, ist risikoabhängig: je sensibler Daten/Domäne, desto später der Punkt, an
dem ohne Mitlesen freigegeben wird (siehe [ROADMAP.md](ROADMAP.md), Phase 5).

Die Grenze entbindet nicht von der Definition: Die **Deploy-Strecke** (Ziele
Test/Prod, Artefakt-Weg, Rollback) definiert der Stack-Adapter, gefüllt pro
Projekt. Ist sie nicht definiert, wird das bei der Fertig-Meldung als offene
Lücke benannt — nicht stillschweigend übersprungen.

---

## E. Security-Pass (vor jeder Fertig-Meldung)

LLM-generierter Code ist überdurchschnittlich oft verwundbar. Das mechanische Gate
(Abschnitt C) fängt das **nicht** zuverlässig — deshalb ist ein bewusster
Security-Pass Pflicht, bevor "fertig" gilt: **immer** mindestens als Selbstcheck
gegen die Checkliste unten. Erreicht der Diff die Schwelle des
[Review-Panels](REVIEW_PANEL.md), zusätzlich als eigene Lens darin. Der Selbstcheck
ist nie optional — die Panel-Schwelle senkt nur die Zahl der Reviewer, nicht die
Prüftiefe.

### Regel 4 — Geprüfte Mindest-Checkliste
- **Injection:** Jede Nutzereingabe, die in SQL/Shell/Pfad/HTML/Template fließt,
  ist parametrisiert/escaped — nie per String-Konkatenation.
- **Secrets:** Keine Credentials/Keys/Tokens im Code, in Logs oder im Diff —
  nur aus `.env`/Secret-Store (deckt sich mit Regel 3).
- **Authz/Authn:** Jeder Einstiegspunkt, der geschützte Daten/Aktionen berührt,
  prüft Berechtigung explizit — keine impliziten "ist eh eingeloggt".
  - **Ownership-Transfer:** Eine Operation, die Besitzer/Tenant eines Datensatzes
    ändert (`user_id`/`project_id`/`owner`), autorisiert gegen den **beanspruchten**
    Zielzustand, nicht nur gegen Zugriff auf den Ist-Zustand. Falle: Schreibrecht am
    geteilten Objekt erlaubt noch nicht die Überführung in privaten Besitz — die
    "nach privat"-Richtung braucht eine eigene Owner-Prüfung.
- **Unsichere Defaults:** Keine deaktivierte Zertifikatsprüfung, kein `eval`/
  dynamische Deserialisierung auf Nutzerdaten, keine offenen CORS-/Debug-Flags in
  Produktionspfaden.
- **Abhängigkeiten:** Neue Dependency bewusst gewählt (Zweck, Pflege, Herkunft) —
  nicht blind hinzugefügt.

Findet der Pass etwas, gilt dieselbe Regel wie beim Gate: Ursache fixen, nicht
verstecken. Stack-spezifische Tools (SAST, Secret-Scanner) nennt der Adapter.

---

## F. Text-Treue (Encoding in Payloads)

### Regel 5 — Keine vorauseilende ASCII-Transliteration
Umlaute/Akzente bleiben erhalten — auch außerhalb von Fließtext: in Dateinamen,
Konfig-Werten, String-Literalen und eingebettetem Diagramm-Code (Mermaid,
draw.io, PlantUML). Kein `ue`/`ae`/`oe`-Ersatz "zur Sicherheit"; moderne Tools
sind UTF-8. Ausnahme nur bei nachgewiesenem (getestetem) Tool-Fail — dann Grund
benennen.

---

## G. UI-Konsistenz → [GUARDRAILS_UI.md](GUARDRAILS_UI.md)

Abschnitt G (Regel 6 und 7: Komponenten-Wiederverwendung, Token-Quelle,
`DESIGN.md`) steht in einer **eigenen Datei**, weil er nur bei Frontend-Arbeit
gilt und sonst rund ein Drittel dieser immer-geltenden Datei ausmachen würde.
Rang und Regelnummern sind unverändert.

**Lade [GUARDRAILS_UI.md](GUARDRAILS_UI.md), sobald ein UI-Write ansteht** —
Komponente, Stylesheet, Token, `DESIGN.md`. Reine API-/CLI-Projekte überspringen
Abschnitt G vollständig; dann ist die Datei nicht nötig.

---

## H. Shell/Tooling-Hygiene (Bash-Tool)

### Regel 8 — Shell ist nicht per Default bash
Das Bash-Tool läuft je Maschine ggf. unter zsh (macOS-Default). Unquoted `$var`
wird in zsh **nicht** auf Whitespace/Newlines gesplittet — `for f in $files`
iteriert einmal über den ganzen Blob statt pro Datei. Für Multi-File-Loops
`… | while read -r f` oder `${(f)files}` nutzen. `sed -i` braucht auf macOS das
leere Backup-Arg (`sed -i '' …`); GNU-only-Flags (`grep -P`, `sed -r`) nicht
annehmen.

### Regel 9 — Sweep-Ergebnis mechanisch verifizieren
Nach jedem Datei-Sweep (sed/perl/Massen-Edit) das Ergebnis prüfen statt
anzunehmen: `grep -c <muster>` auf 0 bzw. die erwartete Zahl. „Befehl lief durch"
ist nicht „Befehl hat gewirkt" — ein stummer Fehlschlag (falsches Regex, kein
Word-Split, falsche sed-Syntax) sieht sonst aus wie Erfolg.

### Regel 10 — Kein zweiter Agent auf demselben Working Tree; vor Commit Zustand prüfen
Zwei Agenten-Sessions im selben Git-Working-Tree/Branch teilen Dateizustand,
Commit-Stream und (bei Container-Stacks) DB/Cache — keine Isolation. Beobachtet:
fremde Sessions setzen laufende Edits zurück, saugen uncommittete Änderungen in
ihre eigenen Commits, und Test-Runner wechseln `.env`/DB unter dir. Parallel
arbeiten → jede Session in einen eigenen `git worktree` (eigener Branch). Vor
jedem Commit `git status` lesen und mit expliziten Pfaden stagen statt `git add .`
— nie blind committen, was gerade im Tree liegt.
