> **Tier 1 — immer.** Vor jedem Write/Edit an einem Auftrags-Artefakt (Code, Spec,
> Test, Plan) und vor jeder Fertig-Meldung.
> Nur Abschnitt G (UI) ist ausgelagert nach [GUARDRAILS_UI.md](GUARDRAILS_UI.md).

# Guardrails — die harten Regeln

Diese Regeln gelten **immer**, in jeder Phase, bei jedem Schreibvorgang. Der Agent
wendet sie selbst an: vor jedem Schreiben (Selbst-Critic) und vor jeder
Fertig-Meldung (Fertig-Kriterium).

Wenn du als Agent gegen eine dieser Regeln verstoßen würdest: nicht schreiben,
sondern korrigieren. Wenn eine Regel fehlt, die einen Fehler verhindert hätte:
ergänze sie (Harness Correction Development) — generelle Regeln hier, stack-
spezifische im Stack-Adapter. Ergänzt wird im Setup-Checkout (`ki-agent-setup`)
mit Freigabe; in jedem anderen Projekt ist das geladene Harness ein Deploy-Spiegel —
dort die Regel nur als belegten Kandidaten festhalten (`/hx:park`) und per
`/hx:retro` ins Setup-Repo bringen, nicht in den Spiegel und nicht in den
Feature-Diff schreiben.

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

**Eine `DESIGN.md` hat in dieser Rangfolge keinen eigenen Rang.** Die Rangfolge
ordnet Scope- und Wie-Quellen, nicht Design-*Inhalt*. Widerspricht eine `DESIGN.md`
einer anderen Design-Vorgabe des Projekts, entscheidet der Nutzer
([GUARDRAILS_UI.md](GUARDRAILS_UI.md) → „Bestand zuerst").

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

Wird eine Grenze **bewusst** verlassen (Zwang eines Fremdsystems, Migrationsphase),
ist das eine festgehaltene Entscheidung, keine stille Ausnahme: ADR nach
[ADR_TEMPLATE.md](ADR_TEMPLATE.md), das die betroffene Grenze benennt. Ohne ADR gilt
die Regel — eine Ausnahme, die nur in der Abschlussmeldung steht, ist keine.

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
- Zeigt der Fehler, dass eine Harness-Regel fehlte: Regel-Kandidat festhalten
  (wo und wie: Kopf dieser Datei), den Code-Fix trotzdem zu Ende bringen, dann
  erneut laufen lassen.

Erst wenn das Gate sauber durchläuft, darfst du "fertig" melden — mit der
Beobachtung (Befehl + Ergebnis).

Bei größeren Features ist das Fertig-Kriterium nicht ein einzelner Lauf, sondern
eine enumerierte, prüfbare AC-Liste (je AC ein Test, alle anfangs rot). Tests sind
dabei unantastbar — grün entsteht nur durch korrekten Code, nie durch Aufweichen
eines Tests (siehe [TESTS.md](TESTS.md)).

### Regel — Einen Guard löst man aus, man weicht ihn nicht auf
Schlägt ein Schwellen-Check an (Dateigröße, Komplexität, Bundle-Budget, Lint-Limit),
ist sein Befund die Arbeit: Datei teilen, Logik herausziehen, Abhängigkeit entfernen.
**Nicht** die Schwelle anheben, keine Allowlist-/Ignore-Zeile eintragen, kein Override
setzen, damit der Lauf durchgeht. Die Schwelle selbst zu ändern ist eine eigene
Entscheidung mit eigener Begründung und eigener Freigabe — nie Nebenwirkung eines
Feature-Diffs. Ergänzt „keine Suppressions" oben um den Fall, in dem der Check formal
weiterläuft und nur seine Grenze verschoben wurde.

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
Ein Bericht über eine verlangte Menge (Dateien, Seiten, Einträge) weist **gelesen /
gesamt** aus („12/15 gelesen") und benennt das Ungelesene — sonst klingt Teilabdeckung
wie Vollständigkeit.

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

### Regel — Ein Fix, der nicht hält, ist kein Fertig-Beleg
Meldet der Nutzer nach einem Fix, dass das Verhalten weiter besteht, oder tritt der
Defekt nicht bei jedem Lauf auf: **vor** dem nächsten Fix eine deterministische
Reproduktion bauen bzw. die Rate `Fehlschläge/Läufe` messen — ein einzelner grüner
Lauf belegt hier nichts. Vorgehen und Grenzen: [DEBUG.md](DEBUG.md) → „Immer noch
kaputt" und „Stochastische Defekte".

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

**Artefakte des Instruments sind kein Befund.** Werkzeuge verändern das
beobachtete System: ein Browser-Automat injiziert eigene Stylesheets und
CSP-Meldungen, ein Test-Runner setzt Umgebungsvariablen, ein Profiler verlangsamt
den Pfad, den er misst. Solche Spuren stammen vom Messaufbau und werden **vor**
der Bewertung abgezogen — sonst wird das Werkzeug als Fehler des Systems
gemeldet. Erkennungsregel: verschwindet die Meldung, wenn derselbe Pfad ohne das
Werkzeug läuft, ist das ein starker Hinweis auf das Werkzeug — kein Beweis, denn
das Werkzeug kann auch einen echten Fehler erst auslösen (Timing, Last). Bevor
eine Meldung als Artefakt verworfen wird, deren Herkunft im Werkzeug benennen
(Quelle, Injektionsstelle). Umgekehrt gilt die Vorsicht genauso: „ist bestimmt nur das
Tooling" ohne diese Probe ist ebenfalls unbelegt.

### Regel — Prüfmittel nicht aus derselben Quelle wie das Prüfobjekt
Eine Prüfung, deren Erwartung aus derselben Quelle stammt wie das Prüfobjekt, ist
tautologisch und bleibt grün, wenn die Quelle verschwindet; ein Test, der die
Schicht überspringt, die eine Grenze durchsetzt, belegt die Grenze nicht. Beispiele
und Gegenprobe: [TESTS.md](TESTS.md) → „Grün ist nicht gleich gültig".

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

### Regel — Lauf-Konfiguration gehört an den Lauf
Konfiguration, die ein einzelner Verifikationslauf braucht (erhöhte Limits,
abgeschaltete Guards, Test-Feature-Flags), wird **am Lauf** gesetzt — nicht in
eine geteilte Umgebungsdatei (`.env`, Shell-Profil, committete Defaults)
geschrieben. Sonst verändert sie stillschweigend jeden anderen Lauf, der dieselbe
Umgebung liest, und die Regression taucht dort auf, wo niemand sie sucht. Braucht
eine Suite die Abweichung dauerhaft, gehört sie in deren dokumentierte
Vorbedingung, nicht in die gemeinsame Umgebung.

### Regel — Vorhandensein ≠ Verhalten: keine Aussage ohne Verifizierung
Dass ein Symbol im Quelltext oder Bundle **existiert** — eine registrierte Direktive,
ein exportierter Name, eine Route, ein Feature-Flag —, belegt sein **Verhalten**
nicht. Wrapper, Overrides und Guards kehren die Bedeutung um: eine registrierte
Direktive kann unbedingt werfen, eine vorhandene Route 403 liefern, ein gesetztes
Flag von einer späteren Zuweisung überschrieben werden. Statisches Lesen ist keine
Verifikation, sondern der Grund für den nächsten Messschritt.

Deshalb: Aussagen über **Ursache oder Verhalten** brauchen einen Laufzeit- oder
Log-Beweis — beobachtete Ausgabe, Konsolenmeldung, Server-Log, Exit-Code, Testname
plus Ergebnis. Solange der fehlt, wird die Aussage als Annahme gekennzeichnet
(„Vermutung, nicht belegt: …"), im Chat wie im dauerhaften Artefakt, und nicht im
selben Ton wie ein gegateter Messwert geschrieben. Wer zwischen belegter Zahl und
plausibler Erklärung nicht unterscheidbar formuliert, liefert die Erklärung als
Ergebnis aus.

Gilt in beide Richtungen: „vorhanden, also erlaubt" ist so unbelegt wie „nicht
gefunden, also nicht vorhanden" (dazu Regel — Abwesenheit so streng belegen wie
Anwesenheit). Schlägt eine spätere Messung die Ableitung, wird die Korrektur dort
nachgezogen, wo die Aussage steht — auch in Plan- und Register-Dateien, sonst erbt
die nächste Session die falsche Ursache.

### Regel — Verifikation belegen: Evidence, nicht Behauptung
Die Fertig-Meldung führt je Akzeptanzkriterium einen **prüfbaren Beleg** — Datei:Zeile,
grep-Zähler, Test-Name + Ergebnis, beobachtete Ausgabe — nicht die Zusage „erledigt".
Ein Kriterium ohne Beleg gilt als **nicht** verifiziert. Was **nur** zur Laufzeit
prüfbar ist (Sandbox-Verhalten, echtes Rendering, Keychain/OS-Integration, Deploy-
Pfad), wird nicht als maschinell verifiziert ausgegeben, solange es nicht in der
echten Umgebung automatisiert beobachtet wurde (Browser-Lauf, `/hx:verify`,
Deploy-Smoke). Kann der Agent diese Umgebung nicht selbst fahren, wird es als
**eigener Human-Verify-Checkpoint** ausgewiesen. Code-Gate (maschinell) und Runtime-Gate
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
- **Domänen-Fallen:** Geld als Decimal/Cent, gerundet erst am Ende, kein
  Float-Vergleich; wiederholbare Handler idempotent (Idempotency-Key); Passwörter nur
  gesalzen und langsam gehasht (bcrypt/argon2); Redirect- und Pfad-Ziele gegen eine
  Allowlist validiert.
- **Abhängigkeiten:** Neue Dependency bewusst gewählt (Zweck, Pflege, Herkunft) —
  nicht blind hinzugefügt.

Findet der Pass etwas, gilt dieselbe Regel wie beim Gate: Ursache fixen, nicht
verstecken. Stack-spezifische Tools (Dependency-Audit, Secret-Scanner) nennt der Adapter.

---

## F. Text-Treue (Encoding in Payloads)

### Regel 5 — Keine vorauseilende ASCII-Transliteration
Umlaute/Akzente bleiben erhalten — auch außerhalb von Fließtext: in Dateinamen,
Konfig-Werten, String-Literalen und eingebettetem Diagramm-Code (Mermaid,
draw.io, PlantUML). Kein `ue`/`ae`/`oe`-Ersatz "zur Sicherheit"; moderne Tools
sind UTF-8. Ausnahme nur bei nachgewiesenem (getestetem) Tool-Fail — dann Grund
benennen.

---

## G. UI-Konsistenz und I. UI-Nutzbarkeit → [GUARDRAILS_UI.md](GUARDRAILS_UI.md)

Abschnitt G (Regel 6 und 7: Komponenten-Wiederverwendung, Token-Quelle,
`DESIGN.md`) und Abschnitt I (Regel 13–18: Zielgröße, Antwortzeit-Feedback,
Entscheidungslast, Gruppierung, Eingabe-Toleranz, Chunking) stehen in einer
**eigenen Datei**, weil sie nur bei Frontend-Arbeit gelten und sonst einen großen
Teil dieser immer-geltenden Datei ausmachen würden. Der Rang ist unverändert; die
Regeln von Abschnitt I hießen bis 2026-10-23 12–17 (Kollision mit Regel 12 in H).

**Lade [GUARDRAILS_UI.md](GUARDRAILS_UI.md), sobald ein UI-Write ansteht** —
Komponente, Stylesheet, Token, `DESIGN.md`. Reine API-/CLI-Projekte überspringen
beide Abschnitte vollständig; dann ist die Datei nicht nötig.

---

## H. Shell/Tooling-Hygiene (Bash-Tool)

### Regel 8 — Shell ist nicht per Default bash
Das Bash-Tool läuft je Maschine ggf. unter zsh (macOS-Default). Unquoted `$var`
wird in zsh **nicht** auf Whitespace/Newlines gesplittet — `for f in $files`
iteriert einmal über den ganzen Blob statt pro Datei. Für Multi-File-Loops
`… | while read -r f` oder `${(f)files}` nutzen. `sed -i` braucht auf macOS das
leere Backup-Arg (`sed -i '' …`); GNU-only-Flags (`grep -P`, `sed -r`) nicht
annehmen.

Aliase greifen ebenfalls — die Shell startet aus dem **Nutzer-Profil**. Ein
interaktiver Alias (`cp -i`, `mv -i`, `rm -i`) wartet auf eine Bestätigung, die
im Agent-Lauf nie kommt: der Befehl tut nichts, scheitert aber auch nicht,
sondern hängt bis zum Timeout. In Sweeps und Skripten den Alias umgehen —
`command cp`, `\cp` oder absoluter Pfad. Beobachtet: fünfmal unabhängig in der
Eval-Serie bis 2026-07-27, zuletzt traf der `cp`-Alias den Orchestrator selbst
und lief in einen 2-Minuten-Timeout.

### Regel 9 — Sweep-Ergebnis mechanisch verifizieren
Nach jedem Datei-Sweep (sed/perl/Massen-Edit) das Ergebnis prüfen statt
anzunehmen: `grep -c <muster>` auf 0 bzw. die erwartete Zahl. „Befehl lief durch"
ist nicht „Befehl hat gewirkt" — ein stummer Fehlschlag (falsches Regex, kein
Word-Split, falsche sed-Syntax) sieht sonst aus wie Erfolg.

**Strukturierte Formate prüft ihr Parser, nicht `grep`.** Wird YAML-Frontmatter,
JSON, TOML oder eine Config bearbeitet, ist die Verifikation ein **Parse-Lauf des
Zielformats**. `grep`/`wc` zählen Zeichen und sehen deshalb keinen Syntaxbruch.
Ist kein Parser der Umgebung verfügbar, wird mindestens die verletzte
Format-Invariante geprüft (öffnendes Quote braucht ein schließendes, Klammern
balancieren) — nicht ersatzweise etwas Zählbares.

Struktur-Proxys belegen **Wohlgeformtheit nicht**: Marker-Anzahl, Feldanzahl,
Zeilenzahl des Rumpfs, Mindestlänge eines Werts. Wohlgeformtheit belegt nur der
Parser, der die Datei tatsächlich lädt (2026-08-18: vier Proxys grün, ein
fehlendes `"` machte die Datei für den Loader ungültig).

### Regel 10 — Kein zweiter Agent auf demselben Working Tree; vor Commit Zustand prüfen
Zwei Agenten-Sessions im selben Git-Working-Tree/Branch teilen Dateizustand,
Commit-Stream und (bei Container-Stacks) DB/Cache — keine Isolation. Beobachtet:
fremde Sessions setzen laufende Edits zurück, saugen uncommittete Änderungen in
ihre eigenen Commits, und Test-Runner wechseln `.env`/DB unter dir. Parallel
arbeiten → jede Session in einen eigenen `git worktree` (eigener Branch). Vor
jedem Commit `git status` lesen und mit expliziten Pfaden stagen statt `git add .`
— nie blind committen, was gerade im Tree liegt.

### Regel 11 — Remote-Zustand nur nach `fetch`; lokales `main` ist ein Cache
Aussagen über „gemergt", „gestrandet", „ohne PR", „verloren" brauchen ein
`git fetch` unmittelbar davor und den Vergleich gegen `origin/<default>` — nie
gegen lokales `main`, das beliebig alt sein darf. Ohne fetch lautet die Antwort
„unbekannt", nicht „nicht gemergt" (zweimal beobachtet: gemergte Arbeit als
„ohne PR" bzw. „gestrandet" gemeldet, weil lokales `main` weit zurücklag).

`git branch --contains` und `--no-merged` sind ebenfalls erst nach fetch
aussagekräftig. PR-/Issue-Nummern kommen aus `gh`-Output, nicht aus dem
Gedächtnis. Und wer fremde Arbeit „retten" will, prüft zuerst, ob sie inhaltlich
schon auf dem Remote liegt: ein Sammel-Branch, dessen `git status` leer bleibt,
ist der Beleg, dass es nichts zu retten gab.

### Regel 12 — Sauberer Merge ist kein Inhalts-Check; Reihenfolge-Risiko entscheidet die Ancestry
Git merged nach Ancestry und Hunk-Position, nicht nach Bedeutung. Zwei Folgen,
beide beobachtet:

**Konfliktfrei heißt nicht korrekt.** Fügen beide Seiten denselben Schlüssel an
verschiedenen Stellen einer additiven Liste ein, sind das für git zwei
unabhängige Hunks — kein Konflikt, aber ein Duplikat (beobachtet an einer
Kubernetes-`env:`-Liste). Gilt genauso für `volumeMounts`, Dependency-Listen,
`.gitignore`, Import-Blöcke. Nach jedem Merge auf Duplikate prüfen, nicht nur auf `<<<<<<<`.

**„Nimmt ein späterer Merge X wieder zurück?" beantwortet `git merge-base
--is-ancestor`, nicht der Vergleich der Dateiinhalte beider Branches.** Ist der
Quell-Branch bereits Ancestor des Ziels, ist sein Merge ein No-op — unabhängig
davon, was seine Dateien enthalten.
