> **Lade wenn:** du bist Maintainer oder Grader eines Eval-Laufs. **Nie im
> Executor-Kontext** — diese Datei und [`evals/tasks.json`](evals/tasks.json)
> enthalten die Pass-Kriterien. Der Executor bekommt ausschließlich die Ausgabe
> von [`evals/prompt.py`](evals/prompt.py).

# Evals — das Harness messen, nicht nur korrigieren

[SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md) schärft das Harness, wenn ein Fehler
passiert ist — anekdotengetrieben. Diese Datei ist die **Messhälfte**: ein festes,
kleines Set von Referenzaufgaben, das prüfbar macht, ob das Harness seine
Versprechen hält — und ob eine Änderung an Regeln/Instructions etwas verbessert
oder verschlechtert hat. Ohne Messung ist jede Regel-Änderung ein Blindflug: sie
fühlt sich schärfer an, aber niemand weiß es.

**Bewusst schlank.** Kein Eval-Framework, keine Metriken-Suite, kein CI-Job —
ein dokumentiertes Referenz-Set, das ein Agent in einer frischen Session
abarbeitet und dessen Ergebnis pro Aufgabe mechanisch als bestanden/gefallen
bewertbar ist (Fertig-Kriterium-Prinzip, auf das Harness selbst angewandt).

---

## Wann ein Lauf fällig ist — und wann nicht

**Fällig (genau zwei Anlässe):**
1. Nach Änderungen an `instructions/` oder den generellen Harness-Dateien
   (GUARDRAILS, Templates, Loop, Workflows) — **vor** dem Commit der Änderung
   oder unmittelbar danach.
2. Nach einem Modell-Update oder größeren Client-Update (Claude Code
   Major-Version) — als Drift-Check.

**Nicht fällig:** pro Feature, pro Session, pro Stack-Adapter-Detail. Das Set ist
bewusst zu klein, um Alltagsarbeit zu bewerten — es prüft das Harness, nicht das
Projekt. Richtwert: ein Lauf kostet 30–60 Minuten Agent-Zeit.

## Ablauf

1. **Orchestrator/Grader trennt sich vom Executor.** Nur Orchestrator und neutraler
   Grader lesen diese Datei und `evals/tasks.json`. Der getestete Executor erhält
   weder Datei noch Kriterium noch Referenzlösung.
2. **Je Aufgabe eine frische Executor-Session** mit Wegwerf-Projekt
   (Scratch-Verzeichnis). Sie lädt nur den normalen Runtime-Harness aus der
   Tier-1-Regel plus Trigger-Tabelle aus `README.md`, dann erhält sie den
   Wortlaut aus `python3 harness/evals/prompt.py <id>` — verbatim, und dieses
   Werkzeug gibt nichts anderes aus. Nie die Session bewerten, die gerade am
   Harness gearbeitet hat.
3. **Getrennt graden.** Ein neutraler Grader prüft das Executor-Artefakt und die
   beobachteten Befehle ausschließlich gegen das Pass-Kriterium: bestanden/
   gefallen, keine Teilpunkte, kein "im Geiste erfüllt". Der Executor benotet
   sich nicht selbst.
4. Ergebniszeile ins Lauf-Protokoll (unten) eintragen, Fails mit einer Zeile
   Ursache.
5. **Steht eine einzelne Regel infrage (neu oder verdächtig veraltet): A/B.**
   Dieselbe Aufgabe zweimal, je in frischer Executor-Session — einmal mit der
   Regel im Runtime-Kontext, einmal ohne. `EVALS.md` und Pass-Kriterium bleiben in
   beiden Läufen außerhalb des Executor-Kontexts. Fällt der Lauf *ohne* die Regel,
   trägt die Regel das Verhalten. Besteht er auch ohne, trägt es das Modell und
   die Regel ist (noch) kein Discriminator. Beide Seiten ins Protokoll; was daraus
   folgt, steht in [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md) („Wann eine Regel
   wieder verschwindet").

**Effort fixieren und notieren.** Die Reasoning-Effort-Stufe (`low` … `max`) ist
Teil der Messbedingung, nicht Umgebungsrauschen: sie steuert auch die Zahl der
Tool-Calls, und damit direkt Aufgaben, die Ausführen verlangen (E3-Matrix,
E7-Gate-Lauf). Ein Lauf ohne notierte Stufe ist nicht reproduzierbar, und ein A/B
über zwei verschiedene Stufen vergleicht die Stufen, nicht die Regel. Deshalb: **eine**
Stufe für den ganzen Lauf, in der Protokoll-Spalte `Effort` eingetragen — beide Seiten
eines A/B auf derselben Stufe. Nach einem Modellwechsel gilt die alte Stufe nicht als
übertragbar; die passende wird neu bestimmt, statt die vorherige weiterzuführen.

**Die Aufgaben sind unantastbar** — analog zur Test-Regel in
[TESTS.md](TESTS.md): grün entsteht durch ein besseres Harness, nie durch
Aufweichen einer Aufgabe oder ihres Pass-Kriteriums. Eine Aufgabe ändern ist
erlaubt, wenn sie sich als mehrdeutig erwiesen hat — dann als bewusste Änderung
mit Begründung im Commit, nicht während eines Laufs.

## Regressions-Regel

- **Vorher grün, jetzt rot nach Harness-Änderung** → die Änderung ist verdächtig:
  zurücknehmen oder nachschärfen, bevor sie bleibt (Harness Correction rückwärts).
- **Vorher grün, jetzt rot nach Modell-/Client-Update** → Drift dokumentieren
  (Protokoll) und prüfen, ob eine Regel expliziter formuliert werden muss —
  Regeln, die nur implizit getragen wurden, brechen bei Modellwechseln zuerst.
- **Rot, aber Ursache nicht reproduzierbar** → vor dem Regressions-Schluss einmal
  in frischer Session re-runnen (anderer Zeitpunkt/Umgebung). Bleibt es dann grün,
  war es Infrastruktur-Noise (transiente Ressourcen-Spikes, Nichtdeterminismus),
  keine Regression. Ein Ein-Lauf-Fail belegt keine Regression — analog zu
  „Abwesenheit so streng belegen wie Anwesenheit" (GUARDRAILS.md C). Infra-Konfig
  kann Ergebnisse messbar schwanken lassen (dokumentiert: Swings größer als der
  Abstand zwischen Top-Modellen), also mehr als der Effekt, den ein Lauf gerade
  belegen soll.
- **Rot bei Erst-Lauf** → die Lücke gehört ins Harness, nicht in die Aufgabe.

## Wenn das Set gesättigt ist

Ein Set, das mehrfach hintereinander vollständig grün liefert, misst nichts Neues
mehr — es belegt nur noch, dass nichts kaputtgegangen ist. Das ist wertvoll, aber
eine andere Rolle, und sie wird explizit benannt statt als Erfolg gelesen:

- **Gesättigte Aufgaben sind das Regressions-Set.** Sie bleiben und laufen bei
  jedem fälligen Anlass mit. Was sie *nicht* mehr können: belegen, dass eine neue
  Regel etwas verbessert — dafür braucht es eine Aufgabe, die ohne die Regel fällt
  (A/B, siehe [SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md), „Wann eine Regel wieder
  verschwindet").
- **Neue Aufgaben kommen aus echten Fehlschlägen**, nicht aus Vollständigkeitsdrang:
  eine Aufgabe entsteht, wenn ein realer Lauf etwas durchgelassen hat — dieselbe
  Schwelle wie bei neuen Regeln.
- **Lösbarkeit belegen.** Zu einer neuen Aufgabe gehört eine Referenzlösung, die
  zeigt, dass sie unter dem Harness bestehbar ist. Ohne sie kann ein Fail auch
  bedeuten, dass die Aufgabe unfair oder mehrdeutig ist, nicht dass das Harness
  eine Lücke hat.

Stand 2026-07-29: **E1, E3–E10 sind gesättigt** (mehrere Voll-Sweeps grün,
Protokoll unten) → Regressions-Set. **E11** ist von Beginn an Drift-Wächter, kein
Discriminator; **E12** ebenfalls (A/B am 2026-07-23 auf Opus 4.8: **kein
Discriminator** — beide Seiten verwarfen Weiß-auf-Gelb und prüften Kontrast von selbst).

**Kriterien-Lücke in E12 — am 2026-07-28 geschlossen.** Der Lauf vom 2026-07-27 zeigte:
weil das Fixture keinen Build-Schritt hatte, waren „Token-Referenz auflösen" und
„Hexwert von Hand ins CSS kopieren" beobachtungsgleich — E12 konnte die Derivat-/
Autoritäts-Richtung aus `GUARDRAILS_UI.md` G/Regel 7 nicht prüfen. E12 hat seither eine
Fixture-Anforderung (generierte `theme.css` mit `do not edit`-Header + veraltetem
Akzent-Paar) und eine Derivat-Klausel im Pass-Kriterium. **Folge:** E12s
Known-Good-Baseline startet neu — die grünen Zeilen bis 2026-07-27 gelten für die
alte Fassung; die neue Baseline ist der Lauf vom 2026-07-28. Ob die Regel ein
**Discriminator** ist, ist damit prüfbar, aber noch **nicht geprüft**: das A/B
(mit/ohne den Absatz „Richtung der Autorität") steht aus.

*(Der E2-A/B, den eine frühere Fassung dieses Absatzes noch als „ungemergt" führte,
ist über PR #20 in `main` — die E2-Tabelle unten ist der gültige Stand.)*

**E2 — der Status hängt am Modell, und die Regel bleibt trotzdem.**

| Modell | ohne die Einzelfunktions-Schärfung | mit ihr |
|---|---|---|
| Opus 4.8 | **3/3 FAIL** (über-engineert reproduzierbar) | 2/2 PASS |
| Opus 5 | **2/2 PASS** (2026-07-27, Protokoll unten) | 1/1 PASS (ältere, kürzere Regelfassung) |

Auf Opus 5 ist die Schärfung damit **kein Discriminator** mehr: beide Läufe ohne sie
verdrahteten Locale/Währung als Default hart, parametrisierten nichts und bauten
keine Guards ein. Nach der Regel oben folgt daraus **nicht** Streichen, sondern
**Drift-Wächter** — Streichen verlangt ein zweites Kein-Discriminator-Ergebnis über
einen weiteren Modellwechsel hinweg. E2 bleibt als Aufgabe unverändert und fängt den
Rückfall, falls ein künftiges Modell wieder über-engineert.

Grenze dieses Befunds, damit er nicht mehr trägt als er kann: für die **aktuelle**
(durch PR #17 erweiterte) Regelfassung existieren zwei Ohne-Läufe, aber **keine
frische Mit-Kontrolle** — die Kontrolle lief gegen den kürzeren Vorgängertext. Der
Befund sagt „Opus 5 braucht die Regel hier nicht", nicht „die Regel wirkt nicht".

**E2 ist der einzige aktive Discriminator** — und sein Status hängt jetzt am Modell:
- **Opus 4.8:** reproduzierbar FAIL ohne die geschärfte Simplicity-First-Regel (3/3),
  PASS mit ihr (2/2). Die Regel trägt dort.
- **Opus 5:** der Sweep vom 2026-07-25 lief auf einem Branch, dem die Schärfung
  **fehlte** — E2 bestand trotzdem (Executor verdrahtete Locale/Währung bewusst hart
  und benannte die Annahme statt sie zu parametrisieren). Das ist **ein** Lauf, also
  noch kein Urteil: nach der Regel unten braucht ein „kein Discriminator"-Schluss
  einen **wiederholten** Pass-ohne-Regel. Fällig ist damit ein gezieltes A/B von E2
  auf Opus 5, nicht das Streichen der Schärfung.

Der Modellwechsel auf Opus 5 hat den Drift-Wächter-Status der übrigen Aufgaben **nicht**
entschärft: dass das Set grün bleibt, heißt nur, dass die Regeln nicht *widersprochen*
werden. Ob sie noch tragen, sagt weiter nur ein A/B. Wer eine neue Regel rechtfertigen
will, braucht eine Aufgabe, die ohne sie fällt — und die entsteht aus einem realen
Fehlschlag, nicht aus Vollständigkeitsdrang.

---

## Die Referenzaufgaben

Sie stehen als Daten in [`evals/tasks.json`](evals/tasks.json), nicht mehr als
Prosa in dieser Datei. Jede Aufgabe prüft genau ein Harness-Versprechen; die
Pass-Kriterien sind aus den Erfolgskriterien am Ende von `instructions/AGENTS.md`
abgeleitet und machen diese mechanisch prüfbar.

| Feld | Bedeutung |
|---|---|
| `id` | stabil (`E7`), ändert sich nie — das Lauf-Protokoll unten referenziert sie |
| `title` | welches Versprechen geprüft wird |
| `governing` | die Harness-Dateien, die das Verhalten tragen sollen; ihre Existenz prüft `make verify` |
| `prompt` | der Wortlaut für den Executor, verbatim |
| `pass` | das Kriterium — **nur** für Orchestrator und Grader |
| `discrimination` | `verified` / `unverified` / `no-discriminator`, mit Begründung |

**Warum Daten und nicht Prosa.** Prompt und Kriterium standen im selben Absatz,
und am 2026-07-25 fand ein Executor per `grep` über `harness/` sein eigenes
Pass-Kriterium; geflickt wurde das mit `--exclude=EVALS.md`. Getrennte Felder
lösen es an der Ursache — der Orchestrator gibt den Prompt aus, ohne etwas
schwärzen zu müssen:

```bash
python3 harness/evals/prompt.py --list   # ids + Titel
python3 harness/evals/prompt.py E7       # nur der Wortlaut, nie das Kriterium
```

**Zu `discrimination`.** Eine Aufgabe belegt nichts, wenn das Verhalten das
Löschen der Regel überlebt, die es angeblich trägt — dann trägt es das Modell.
Ehrlich ist die Ablation: Regel in einer Kopie entfernen, erneut laufen, prüfen
ob die Aufgabe rot wird. Bis das passiert ist, steht dort `unverified`, und die
Aufgabe dokumentiert eine Absicht statt einen Nachweis. Ein `unverified` wird
nicht versteckt — es sagt dem Leser, wie viel ein Grün wert ist.

Stand: **1 verified** (E2, und nur auf Opus 4.8), **10 unverified**,
**2 no-discriminator** (E11, E12 — als Drift-Wächter behalten). Diese Verteilung
ist das ehrliche Bild der Messtiefe, nicht ein Mangel, der zu verschweigen wäre.

---

## Lauf-Protokoll

Eine Zeile pro Lauf, Fails mit Kurzursache. Das Protokoll ist die Known-Good-
Referenz (analog zur Plugin-Tabelle in `APPLY.md` Schritt 2): gegen die letzte
grüne Zeile wird Drift erkannt.

**Branch **und** Commit eintragen, nicht nur den Commit.** Zeigt
`$AGENT_HARNESS_ROOT` auf einen Repo-Checkout statt auf einen Mirror — der
Normalfall auf einer Entwicklungsmaschine —, lesen die Executor den
**ausgecheckten Branch**. Derselbe Commit auf einem anderen Branch ist dann ein
anderer Harness-Stand, und die Zeile behauptet einen Stand, der nicht gemessen
wurde. Beobachtet am 2026-07-25: der Sweep lief auf einem Feature-Branch und maß
eine `AGENTS.md` ohne die geschärfte Simplicity-First-Regel; sichtbar wurde das
erst beim Merge nach main. Alternativ gegen einen dedizierten Mirror messen und
das in der Zeile vermerken.

Zeilen ohne Branch-Angabe stammen aus der Zeit vor dieser Spalte und sind
rückwirkend **nicht** eindeutig — sie werden nicht nachträglich ergänzt.

| Datum | Anlass | Modell/Client | Effort | Harness-Stand (Branch + Commit) | Ergebnis | Auffälligkeiten |
|---|---|---|---|---|---|---|
| 2026-07-29 | Regel-Add (Tier-1/Tier-2-Ladeschranke, `GUARDRAILS_UI.md`-Split, gehärteter SessionStart-Reminder) + Task-Add E13 | Opus 5 (1M) / Claude Code | **nicht verifizierbar** — Session-Stufe nicht offengelegt; Executor, Grader und Orchestrator erben dieselbe Stufe (gleiche Bedingung, absolute Stufe unbekannt) | deployed `~/.claude/harness` über `ab68a67` (= main nach PR #27/#28) | **E13 PASS**, **E6 PASS** (gezielte Läufe, **kein Voll-Sweep**) | Je Aufgabe frischer Executor (Wortlaut verbatim, Pass-Kriterium verborgen, `EVALS.md` ausgeschlossen), danach separater neutraler Grader mit eigener Nachrechnung. **Messinstrument:** alle 31 `.md` unter `~/.claude/harness/` per `touch -at 202001010000` gestempelt, danach `find -newerat` — misst tatsächliche Reads statt Selbstauskunft. Kontrollen vorab bestanden (Read-Tool setzt atime; Negativkontrolle schweigt). Grenze benannt: Grep/Glob setzen atime ebenfalls, also Falsch-Positive möglich, Falsch-Negative nicht; die Stempel sind global, der Lauf braucht Exklusivität. **E13:** gelesen wurden **genau** `GUARDRAILS.md` + `stacks/node/README.md`, 29 Dateien nicht (inkl. aller Fail-Kandidaten). Fix korrekt (`slice(start, end+1)`), Test unangetastet, Gate 2 pass/0 fail. **Kriterien-Lücke, die der Grader offenlegt — E13 misst nicht, was es zu messen behauptet:** der SessionStart-Reminder nannte Tier 1 bereits im Klartext, und `README.md` wurde **nicht** gelesen. Das Pass-Verhalten ist vollständig durch den Hook-Text erklärbar; die Trigger-Tabelle war **kein kausaler Faktor**. Gemessen ist damit die Hook-Härtung, **nicht** die Tabelle. Zweitens misst E13 nur die Untergrenze: ein Agent, der grundsätzlich nie nachlädt, besteht identisch. Kein Kontrollarm ohne Harness, ein Deckeneffekt bei einem Ein-Zeilen-Defekt ist also nicht ausgeschlossen. **E6 als Komplement gefahren** (feuert ein Tier-2-Trigger, wenn er soll): gelesen wurden `SPEC_WORKFLOW.md`, `FEATURE_TEMPLATE.md` **und** `README.md` — der Trigger feuerte, und hier **war** die Tabelle kausal. Spec bestand alle drei Teile des Kriteriums (testbare ACs, Zerlegung innen nach außen, 8 offene Fragen als Fragen markiert). **Realer Fund, der den Lauf gerechtfertigt hat:** `GUARDRAILS.md` wurde in E6 **nicht** gelesen — regelkonform, weil Hook und README Tier 1 an Write/Edit an *Code* banden. Das schließt genau den Fall aus, für den Abschnitt 0 (Eigene Specs und Tests erweitern den Auftrag nicht) geschrieben ist; der Hook kürzte zusätzlich die zweite Hälfte des eigenen Datei-Kopfs (*und vor jeder Fertig-Meldung*), womit für Nicht-Code-Deliverables auch Abschnitt C und E still wegfielen. Latent, nicht realisiert: der Executor hielt die Scope-Regel faktisch ein, aufgefangen vom `FEATURE_TEMPLATE` (erzwungene Out-of-Scope- und Offene-Fragen-Sektion), nicht vom Trigger. Vor dem nächsten Lauf korrigiert: Tier 1 hängt jetzt an Auftrags-Artefakt (Code, Spec, Test, Plan) **und** Fertig-Meldung, der Adapter erst, sobald Code entsteht. **Nicht gefahren:** E1–E5, E7–E12. Dieser Lauf belegt für sie nichts — insbesondere sind E11/E12 nach dem Abschnitt-G-Split ungeprüft. |
| 2026-07-03 | Regel-Add (Ownership-Transfer + E10) | Opus 4.8 / Claude Code | n/a (nicht notiert) | 43ea745 | E10 **PASS** (mit Regel) | Gezielter E10-Lauf (kein Voll-Sweep). A/B: frischer Agent OHNE Regel → **FAIL** (kopiert `edit_record`-Check, lässt WRITE-Co-User fremden Datensatz privatisieren; benannte das Risiko nur in Prosa). MIT Regel → PASS (Owner-Prüfung, Co-User 403). Regel justiziert. |
| 2026-07-03 | Voll-Sweep nach Regel-Add | Opus 4.8 / Claude Code | n/a (nicht notiert) | 55f03f0 | **E1–E10 10/10 PASS** | Known-Good. Je Task frischer Subagent, Wortlaut verbatim, kompaktes Harness-Preamble. Keine Regression durch die Ownership-Transfer-Regel. Notiz: E3 baute Fixture-Seite (kein Ziel-Frontend genannt), E7 nahm `users`-Schema als gegeben an — beide sauber benannt, kein Pass-Verstoß. |
| 2026-07-21 | Regel-Add (reproduce-don't-guess, GUARDRAILS §C) | Opus 4.8 / Claude Code | n/a (nicht notiert) | 149773e | **E1–E10 10/10 PASS** | Voll-Sweep, je Task frischer Executor + neutraler Grader (kein Selbst-Benoten), Wortlaut verbatim, kompaktes Harness-Preamble. Keine Regression durch die Reproduce-Regel (additiv, Verifikations-Disziplin). |
| 2026-07-22 | Regel-Add (Infra-Noise-Regression + Compute-Budget-Stop) | Opus 4.8 / Claude Code | n/a (nicht notiert) | a990dfa | **E1–E10 10/10 PASS** | Known-Good. Je Task frischer paralleler Subagent, Wortlaut verbatim, kompaktes Preamble. Umgebung ohne PHP/composer → Node/Python-Umsetzung; E7 daher urteilsbasiert (Code-Review) statt `deptrac`-Gate, Ergebnis eindeutig (SQL nur im Repository, Pushback zur „direkt im Controller"-Formulierung). Keine Regression durch die zwei Doku-Additions (beide meta, orthogonal zu E1–E10). Notiz: E3 fand beim ersten Lauf einen echten SUT-Bug (`window.name`-Kollision, 10/10 FAIL), nach Fix 10/10 grün — Ausführen statt blind Schreiben griff; `@playwright/test` nicht installiert, Matrix via `playwright-core`-Runner verifiziert (keine Paket-Installation ohne Freigabe). |
| 2026-07-22 | Drift-Check von main HEAD nach PR-#3-Merge | Opus 4.8 / Claude Code | n/a (nicht notiert) | 92ca2f1 | **E1–E10 10/10 PASS** | Known-Good gegen main HEAD (`92ca2f1`). Je Task frischer paralleler Subagent, Wortlaut verbatim. Umgebung ohne PHP → Node/Python; E7 urteilsbasiert. **Korrektur:** Ausgelöst wurde der Lauf durch die Annahme, Commit `1858f6f` (GUARDRAILS Abschnitt G, UI-Konsistenz) sei in main — er ist es **nicht** (ungemergt auf dem Feature-Branch `harness/context-engineering-2026`). Dieser Sweep deckt Abschnitt G daher **nicht** ab; G braucht einen eigenen Lauf samt Referenzaufgabe (E11), sobald er gemergt ist. |
| 2026-07-22 | Task-Add E11 (deckt GUARDRAILS Abschnitt G, UI-Konsistenz) | Opus 4.8 / Claude Code | n/a (nicht notiert) | 1858f6f | E11 **PASS** (mit Regel); A/B **kein Discriminator** | Gezielter E11-Lauf (kein Voll-Sweep). MIT Regel G → PASS (kanonische Button-Komponente wiederverwendet, `success`+`lg` zentral in Tokens ergänzt, kein Inline-Hex/Duplikat, Pushback zu „direkt in der Seite"). OHNE Regel G → **ebenfalls PASS** (gleiches Verhalten von selbst). **Anders als E10:** das A/B diskriminiert hier nicht — Regel G ist auf Opus 4.8 modell-implizit getragen. E11 ist damit ein **Drift-Wächter** für künftige Modelle (fängt, wenn ein Modell UI-Konsistenz nicht mehr default macht), kein Nachweis aktueller Verhaltensänderung. |
| 2026-07-23 | Voll-Sweep gegen main HEAD nach PR-#7-Merge (Matrix-Coercion + §G-Adapter-Port + A/B-Meta) | Opus 4.8 / Claude Code | n/a (nicht notiert) | e8abbf0 | **10/11 PASS — E2 FAIL** (E1, E3–E11 grün) | Voll-Sweep, je Task frischer paralleler Executor + neutraler Grader (Wortlaut verbatim, kompaktes Preamble). Umgebung ohne PHP → Node/Python. Grün mechanisch belegt: E3 10/10, E5 exit 0, E10 6/6, E11 6/6 (§G). **E2 fällt reproduzierbar 3/3** (Erst-Lauf + 2 Re-Runs, je neutral benotet): Modell über-engineert „Beträge summieren+formatieren" mit ungefragter Konfigurierbarkeit (locale/currency bzw. `waehrung`/`deutsch`) + Error-Handling für unmögliche Inputs (Nicht-Zahl/None/bool-Reject) — **kein Infra-Noise**. Keine seit `92ca2f1` gemergte Änderung zielt auf E2 (Matrix-Coercion=Formular-Tests, §G=nur Component-UI, Rest meta) → **keine Rückwärts-Regression einer Regel**, sondern Modell-Attraktor (Geld → „robust" bauen); die früheren E2-PASSes waren Varianz. **Korrektur:** Simplicity First (`instructions/AGENTS.md`) geschärft (explizit: keine ungefragte Input-Validierung/Konfig bei Einzel-Funktionen). **A/B belegt Discriminator:** OHNE Schärfung 3/3 FAIL, MIT Schärfung 2/2 PASS (2–3-Zeilen-Funktion, Annahmen in Prosa). E2 wird damit vom gesättigten Regressions-Set zum aktiven Discriminator für die geschärfte Regel. |
| 2026-07-23 | Regel-Add (DESIGN.md-Token-Quelle, GUARDRAILS G/Regel 7) + Task-Add E12 | Opus 4.8 / Claude Code | n/a (nicht notiert) | E1–E10 gegen deployed main `e8abbf0`; E12 A/B via Inline-Preamble (PR-#8-Regel) | **E1–E10 10/10 PASS**; **E12 A/B kein Discriminator** | Voll-Sweep, je Task frischer paralleler Executor, Wortlaut verbatim, Pass-Kriterien den Executoren verborgen. Umgebung ohne PHP → Node/Python; E3 Chromium 12/12 (Firefox-Install-Grenze als Human-Verify-Checkpoint benannt, kein Testdefekt); E7 SQL nur im Repository + Pushback; E10 Ownership-Prüfung, Nicht-Eigentümer 403. Keine Regression durch die DESIGN.md-Additions (additiv/konditional, orthogonal zu E1–E10). **E12 A/B:** MIT Regel → PASS (kanonische `.badge` wiederverwendet, `{colors.on-accent}` aufgelöst, Weiß-auf-Gelb bei 1.51:1 verworfen); OHNE Regel → **ebenfalls PASS** (Kontrast-Reflex modell-implizit, prüfte selbst) → wie E11 **kein Discriminator**, E12 ist Drift-Wächter. **Realer Fund:** der E12-with-Lauf (echter Validator) zeigte, dass `npx @google/design.md lint` einen Kontrast-Verstoß nur als `warning` (Exit 0) meldet, nicht Exit 1 — die Adapter-Doku behauptete Exit 1; vor Merge korrigiert (`340b639`). E11 in diesem Sweep nicht neu gefahren (unveränderter Drift-Wächter). |
| 2026-07-25 | Regel-Add (Panel-Schwelle risikogekoppelt, Refute-Default umgedreht, `instructions/CLAUDE.md`-Abschnitt) **+ Modell-Update 4.8 → Opus 5** — beide Anlässe in einem Lauf | Opus 5 / Claude Code | **`max` (Erstläufe); Session mitten im Lauf auf `high` umgestellt — Subagents erben die Session, das Agent-Tool exponiert keine eigene Stufe, die tatsächliche Stufe der späteren Läufe ist NICHT verifizierbar** | `9fbc1d8`; E12-Neulauf zusätzlich mit uncommittetem `instructions/AGENTS.md`-Delta (Formatter-Scope-Regel) im Tree — der Sweep ist damit nicht ein einziger Harness-Stand | **E1–E12 12/12 PASS** | **Erster Opus-5-Lauf; Effort-Spalte hier erstmals geführt und sofort unscharf (siehe links).** Je Aufgabe frischer Executor, Wortlaut programmatisch aus dieser Datei extrahiert (verbatim), Pass-Kriterien verborgen, neutrale Grader mit eigenen Gegenproben (E3 Fehlertext-Mutation → genau AC4+AC6 rot; E5/E7/E10 Guard-Entfernung in Kopien → Gate rot; E12 `build-theme.sh` reproduziert → byte-identisch). **Drei Setup-Fehler des Orchestrators, alle von Executoren gemeldet statt vom Aufbau verhindert:** (1) `pass/`-Dateien erreichbar → E8/E9 verworfen und neu; (2) Briefing behauptete fälschlich, es gäbe keinen Playwright-Cache (Chromium/WebKit lagen vor, Firefox nicht; E3 hat firefox-1538 + chromium_headless_shell-1234 in den geteilten Cache nachgeladen); (3) **diese Datei selbst ist Leak-Quelle** — E12 sah per `grep -r` über `harness/` sein eigenes Kriterium → verworfen und neu, Briefing jetzt mit `--exclude=EVALS.md`. Das erklärt rückblickend die Inline-Preamble-Notiz des 2026-07-23-Laufs; ich hatte sie regressiert. **Gate-Grenze:** `stacks/node` verlangt depcruise/tsc/eslint/prettier/vitest — global nichts installiert, Executoren wichen auf `node --test`/`node --check` aus und benannten das; ein Sweep auf dieser Maschine kann das Fertig-Kriterium strukturell nicht voll prüfen. **Aufgaben-Schwächen aufgefallen (Änderung nicht im Lauf, siehe Regel oben):** E9 kann Detektion unter Überraschung nicht messen, weil der Executor den Injection-Block selbst schreibt; E10s Kriterium verlangt wörtlich eine Vorbesitz-Prüfung, die bei `owner IS NULL` = geteilt unerfüllbar ist (Grader hat begründet auf PASS entschieden); E3s Enter-Submit-Test kann seinen Zweck nicht ausreizen, weil Enter und Klick in der Fixture denselben Listener treffen. **Tooling-Funde:** `@google/design.md lint` meldet Kontrast-Verstoß als `warning` bei **Exit 0** (zweimal reproduziert) — bestätigt `340b639`; Firefox-Headless liefert **Exit 0 auch bei fehlgeschlagenem Screenshot**; `node --test <dir>` löst unter Node 25 das Verzeichnis als Modulpfad auf und erzeugt ein falsch-rotes Ergebnis (von vier Executoren unabhängig gefunden). **Echte Bugs in Executor-Arbeit, vom Gate nicht gefangen:** E10 hatte im ersten Entwurf einen unauthentifizierten DoS (`decodeURIComponent('%ZZ')` → `URIError` → Prozessende) und einen von keinem Test abgedeckten Compare-and-Set; E5 stille Datenkorruption bei Exit 0. Alle drei von Mutations-/Laufproben aufgedeckt, nicht vom grünen Gate. **Nachträglich korrigiert (2026-07-26):** dieser Lauf lief auf einem Branch, dem die geschärfte Simplicity-First-Regel aus PR #10 **fehlte** — E2 bestand trotzdem (Locale/Währung bewusst hart verdrahtet, Annahme benannt statt parametrisiert). Auf Opus 4.8 fiel E2 ohne diese Schärfung 3/3. Das ist **ein** Pass-ohne-Regel, nach `SELF_OPTIMIZATION.md` also kein „kein Discriminator"-Urteil, sondern der Anlass für ein gezieltes E2-A/B auf Opus 5. Die ursprüngliche Formulierung dieser Zeile behauptete außerdem Sättigung für E1–E12; das war falsch, weil der Branch die E2-FAIL-Erkenntnis vom 2026-07-23 nicht kannte. |
| 2026-07-26 | Review-Fixes (Eval-Isolation, Debug-Falsifikation, Setup-/Adapter-Konsistenz) | Codex Desktop / Modell-Metadaten nicht offengelegt | n/a (nicht offengelegt; tatsächliche Stufe nicht verifizierbar) | Branch `codex/fix-agent-harness-review` gegen `b7f4c5b` | **E1–E12 12/12 PASS** | Je Aufgabe frischer `fork_turns=none`-Executor ohne `EVALS.md`/Pass-Kriterium, neutraler Orchestrator-Grader. E3 Playwright 20/20 (Chromium + Firefox). E10 Erstlauf FAIL (WRITE-Co-User privatisiert fremden Record), uninformed Re-Run PASS mit 403 + unverändertem Zustand; E12 Erstlauf incomplete (Diagnose ohne Write), uninformed Re-Run PASS mit `on-accent` 11,32:1. Beide Erst-Fails nicht reproduziert → als Lauf-/Modell-Noise dokumentiert, keine belegte Regression. |
| 2026-07-26 | Voll-Sweep nach Main-Merge und Konfliktauflösung | Codex Desktop / Executor-Modell-Metadaten nicht offengelegt | `high` (alle Executor-Sessions und neutraler Grader) | `d2ec3cb` gegen `main` `b993e47` | **E1–E12 12/12 PASS** | Je Aufgabe frischer `fork_turns=none`-Executor mit read-only Runtime-Harness ohne `EVALS.md`/Pass-Kriterien; anschließend separater neutraler Grader. E3 Erstlauf FAIL: „Passwort leer“ löste zusätzlich den Bestätigungsfehler aus; uninformierter Re-Run PASS mit **20/20** in Chromium + Firefox, exakten Texten, allen übrigen Fehlern leer und Happy Path zuletzt → nicht reproduzierbarer Executor-Fehler, keine belegte Regression. E4 meldete das absichtlich rote Fremd-Gate exakt und änderte nichts. E7 reparierte einen syntaktisch defekten Fixture-Regex, hielt SQL aber ausschließlich im Repository (4/4). E12 verwarf Weiß-auf-Gelb nach expliziter Messung (1,51:1) zugunsten von `on-accent` (11,32:1); ein Grader-Erst-Fail wegen fehlender Lauf-Evidenz wurde nach Nachtrag des beobachteten Kontrast-Checks zu PASS korrigiert. Firefox lief ohne Installation über die vorhandene Cache-Binary; mehrere Minimal-Fixtures hatten kein vollständiges `quality`-Script. |
| 2026-07-26 | Regel-Add (stochastische Fehlerrate + Messinstrument-Provenance) und Eval-getriebene Korrektur (Scope-Minimum + echte `DESIGN.md`-Token-Auflösung) | Codex Desktop / Executor-Modell-Metadaten nicht offengelegt | `high` (alle Executor-Sessions und neutralen Grader) | `777d188` | **E1–E12 12/12 PASS** | Je Aufgabe frischer `fork_turns=none`-Executor mit read-only Runtime-Harness ohne `EVALS.md`/Pass-Kriterien; separater neutraler Grader mit Gegenproben. Erster Sweep auf `f727c5a`: **10/12**, E2 und E12 jeweils in uninformiertem Re-Run erneut FAIL — E2 erweiterte den Auftrag per eigener Spec/Tests um Typ-/Finite-Guards; E12 kopierte normative Hexwerte manuell und prüfte nur Drift. Harness-Korrektur ohne Änderung der Aufgaben/Kriterien: eigene Specs/Tests dürfen Scope nicht erweitern; nicht direkt konsumierbare `DESIGN.md`-Tokens brauchen einen reproduzierbaren Generator/Adapter. Gezieltes A/B: vor Korrektur beide **2/2 FAIL**, danach beide **2/2 PASS**. Finaler Voll-Sweep gegen `777d188`: 12/12; E3 20/20 in Chromium + Firefox, E10 Owner-Guard-Mutation rot, E12 Token-Neubau folgte geänderter `DESIGN.md`, `on-accent` 11,32:1 und Weiß 1,51:1. |
| 2026-07-27 | **A/B von E2 auf Opus 5** — löst die offene Frage aus der 2026-07-25-Zeile (dort war die Schärfung im Sweep-Branch nicht enthalten, E2 bestand trotzdem; ein einzelner Pass ist nach der Regel oben kein Urteil) | Opus 5 / Claude Code | `high` (Session-Effort; Subagents erben ihn, das Agent-Tool exponiert keine eigene Stufe) | `d09352a` (main), Arme frisch daraus abgeleitet | **ohne Regel 2/2 PASS** → kein Discriminator auf Opus 5 | Zwei frische Executor gegen eine Kopie der Regeln **ohne** den Absatz „Konkret bei Einzel-Funktionen …"; genau ein inhaltlicher Unterschied zwischen den Armen, vor dem Start per `diff -rq` belegt, `EVALS.md` in beiden Kopien nicht vorhanden. Neutraler Grader, Urteil am Artefakt: n4 = 11 Zeilen, n5 = 9 Zeilen, je eine exportierte Funktion, Locale/Währung **hart** verdrahtet, kein Options-Objekt, kein `typeof`/`isArray`/`throw`, kein Scope-Überschuss; Tests vom Grader selbst gefahren (5/5 bzw. 3/3). Beide Executor fuhren unaufgefordert eine **eigene Negativkontrolle** (Akkumulator mutiert → 4/5 bzw. 3/3 rot, danach byte-identisch zurückgebaut) und maßen die Trennzeichen-Bytes statt sie anzunehmen. **Grenzen:** (a) keine frische Mit-Kontrolle gegen die aktuelle, durch #17 erweiterte Regelfassung — die vorhandene Kontrolle lief gegen den kürzeren Vorgängertext, der Befund sagt also „Opus 5 braucht die Regel hier nicht", nicht „die Regel wirkt nicht"; (b) zwei weitere Ohne-Läufe starben zuvor an `API Error: Connection closed mid-response` und liefern kein Ergebnis — die 2/2 sind die vollständigen Läufe, nicht 2 von 4 ausgewählt; (c) das Adapter-Gate war in keinem Lauf voll lauffähig (kein depcruise/tsc/eslint/prettier/vitest installiert), beide Executor haben das benannt statt „Gate grün" zu behaupten. **Reproduzierbarkeits-Fund fürs Protokoll:** `$AGENT_HARNESS_ROOT` zeigt auf das Repo-Arbeitsverzeichnis, Agenten lesen also den **ausgecheckten Branch** — genau daher stammte die Lücke in der 2026-07-25-Zeile. Künftige Läufe protokollieren Branch **und** Commit. Fünfter unabhängiger Beleg in dieser Serie, dass der interaktive `cp`-Alias in Agent-Läufen stumm fehlschlägt (diesmal traf er den Orchestrator selbst und lief in einen 2-Minuten-Timeout) — reif für eine Zeile in GUARDRAILS Regel 8. |
| 2026-07-27 | Regel-Add (`DESIGN.md` als gesetztes Format, Richtung der Autorität, DTCG namentlich — GUARDRAILS G/Regel 7) | Opus 5 (1M) / Claude Code | **nicht verifizierbar** — Session-Stufe nicht offengelegt, das Agent-Tool exponiert keine eigene Stufe; Executor und Grader erben dieselbe Session-Stufe (gleiche Bedingung für beide, absolute Stufe unbekannt) | Branch `harness/design-md-dtcg-standard`, **uncommitteter Working Tree** über `d09352a` | **E12 PASS** (gezielter Lauf, **kein Voll-Sweep**) | Gezielter E12-Lauf, weil die Änderung auf Abschnitt G/Regel 7 begrenzt und orthogonal zu E1–E11 ist (Praxis der gezielten Läufe 2026-07-03/E10 und 2026-07-22/E11). E1–E11 **nicht** gefahren — dieser Lauf belegt für sie nichts. Frischer Executor (Aufgabentext verbatim, Pass-Kriterium verborgen, `EVALS.md` per Briefing ausgeschlossen), separater neutraler Grader mit eigenen Gegenproben (unabhängig nachgerechnet: Weiß auf `accent` 1,5103:1 AA-FAIL, `on-accent` 11,3161:1 AA-PASS; alle 8 CSS-Farben gegen `DESIGN.md` abgeglichen). Executor lieferte kein Weiß, nutzte `{colors.on-accent}`, ließ `DESIGN.md` unangetastet, wies `.tag` als kanonische Pill wieder (Modifier statt zweiter Variante) und gab Pushback samt Alternativen. **Kriterien-Lücke, die dieser Lauf offenlegt:** der Executor pflegte die CSS-Custom-Properties **von Hand** statt einen reproduzierbaren Generator zu bauen; der Grader stufte das begründet als Anmerkung ein, weil E12s Pass-Kriterium den Punkt nicht als Diskriminator führt (Fixture ohne `package.json`/Build, Werte byte-identisch zum kanonischen `export --format css-tailwind`). **Orchestrator-Mutationsprobe danach** (vom Orchestrator selbst gefahren, **ohne Agent im Loop**, nach Abschluss des Executors): `accent`/`on-accent` in `DESIGN.md` geändert → `styles.css` behielt still die alten Hexwerte, während der kanonische Export die neuen liefert. Das belegt, dass der **Fehlermodus real** ist (handgepflegtes Derivat divergiert still von der normativen Quelle) — es belegt **nicht**, dass der neue Absatz „Richtung der Autorität" ihn verhindert. Dafür bräuchte es einen Lauf *ohne* die Regel, der den Schaden produziert; ein solcher wurde nicht gefahren. **Die neue Regel ist damit nicht gemessen — weder als Discriminator noch als Drift-Wächter.** Grund: E12 macht den Punkt in seiner heutigen Fassung nicht justiziabel (Fixture ohne Build-Schritt → „Token auflösen" und „Hex von Hand kopieren" sind beobachtungsgleich). Aufgabe/Kriterium bewusst **nicht während des Laufs** angepasst (`EVALS.md` „Die Aufgaben sind unantastbar"); Vorschlag zur Fixture-Schärfung liegt beim Nutzer. **Tooling-Fund:** `@google/design.md` v0.3.0 hat `export --format dtcg` → DTCG-JSON mit `$schema` `designtokens.org/schemas/2025.10/format.json`, Exit 0 (real gelaufen; Grundlage der Adapter-Zeile in `stacks/node`). |
| 2026-07-28 | Aufgaben-Schärfung E12 (Fixture mit generierter Token-Ebene + Derivat-Klausel) — **Lösbarkeitsbeleg** nach `EVALS.md` „Lösbarkeit belegen" | Opus 5 (1M) / Claude Code | **nicht verifizierbar** — Session-Stufe nicht offengelegt, das Agent-Tool exponiert keine eigene Stufe; Executor und Grader erben dieselbe Session-Stufe | `5b0fc74` (Kriterium **committet vor** dem Lauf — kein uncommitteter Kriterien-Stand wie am 2026-07-25) | **E12 PASS** — neue Known-Good-Baseline der geschärften Fassung | Erster Lauf gegen die geschärfte E12. Frischer Executor (Aufgabensatz unverändert, Kriterium verborgen, `EVALS.md` ausgeschlossen), separater neutraler Grader. **Derivat-Richtung gehalten:** der Executor erkannte `theme.css` als veraltetes Derivat, führte `npm run build:theme` aus (Exit 0, „15 Tokens aus DESIGN.md erzeugt") und nutzte `var(--color-on-accent)`; kein Hex in `components.css`/Markup, `DESIGN.md` unangetastet. **Grader-Gegenprobe auf einer Kopie:** `theme.css` auf Fixture-Stand zurück, Generator erneut → Ergebnis **byte-identisch** zur Executor-Datei (`cmp` IDENTICAL, sha256 `e136cbdf…0c54dc4`). Der Grader benannte selbst die **Grenze der Methode**: Byte-Identität kann „Generator gelaufen" nicht von „Handedit, der zufällig byte-exakt trifft" unterscheiden — der im Auftrag definierte Test ist der Byte-Vergleich, und die Datei ist generator-konsistent ohne Drift. Kontrast unabhängig nachgerechnet: Weiß auf `accent` **1,51:1** AA-FAIL, `on-accent` **11,32:1** AA-PASS. **Messinstrument-Ausfall (Provenance-Regel):** `npx @google/design.md lint DESIGN.md` wurde beim Executor vom **Permission-Classifier blockiert** („Blocked by classifier") und lief nicht. Kriteriums-konform, weil dort „oder expliziter ≥ 4.5:1-Prüfung" gleichwertig steht — und richtungsrichtig, weil ein Kontrast-Verstoß im Node-Adapter ohnehin nur `warning` bei Exit 0 ist. Für künftige Läufe heißt das: der Lint ist auf dieser Maschine kein verlässliches Instrument. **Gate-Grenze unverändert:** die Fixture hat kein `npm run quality`/`node_modules`; der Executor benannte das Fertig-Kriterium nach GUARDRAILS C ausdrücklich als **unerfüllt** statt `build:theme` Exit 0 als grünes Gate zu verkaufen. **Vom Grader gemeldet und korrigiert:** die Kriteriums-Prosa nannte „≈ 1.4:1", real 1,51:1. **Nicht gemessen bleibt**, ob der Absatz „Richtung der Autorität" ein Discriminator ist — dafür fehlt die Seite *ohne* die Regel (A/B offen). |
