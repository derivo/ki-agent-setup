---
name: trend-scout
description: 'Sucht periodisch nach neuen Erkenntnissen, Standards, Best Practices und Werkzeugen und prüft belegt, ob sie für dieses Setup etwas tragen. Use when the user wants to know what is new and whether it matters here — e.g. "gibt es neue Best Practices", "such nach Updates für das Harness", "was hat sich geändert", "prüf die Trends", "lohnt sich das neue Tool", "gibt es was Besseres als X", oder wenn ein Scheduled Task eine Update-Recherche anstößt. Erklärt den Ablauf: billige Ausschlüsse zuerst, Bestand vor Literatur, Qualitäts-Gate je Fund, Quellen-Roster pflegen.'
---

# trend-scout

Eine Recherche nach „was ist neu" ist billig zu starten und teuer falsch zu machen: sie
liefert zuverlässig *irgendetwas*, und die Versuchung ist, das Gefundene vorzulegen, weil
es gefunden wurde. Dieser Skill dreht die Reihenfolge: **zuerst der Bestand, dann die
Quelle, dann die Frage, ob der Fund hier überhaupt eine Lücke trifft.**

Quellen-Roster: [`harness/RESEARCH_SOURCES.md`](../../harness/RESEARCH_SOURCES.md) —
Kadenz, verifizierte Abrufmechanik und Qualitätsurteil je Quelle.

## Wann anwenden
- Periodische Update-Recherche (Scheduled Task oder auf Zuruf).
- Ein Werkzeug, ein Standard oder eine Methode steht zur Debatte: „gibt es was Besseres".
- Eine neue Quelle ist aufgetaucht und soll in den Roster — oder eben nicht.

## Ablauf

### 1. Billige Ausschlüsse zuerst
Die als „billig" markierten Quellen prüfen: unverändertes Datum → kein Fund, ohne weitere
Abrufe. Das beendet die Mehrzahl der Läufe in zwei Befehlen. **Erst danach** die teuren
Quellen (Preprint-Listen, Trending-Seiten).

### 2. Bestand feststellen, bevor irgendetwas vorgelegt wird
- **Repo zuerst `git fetch`**, dann `git log --oneline HEAD..origin/main` und
  `git status --porcelain`. Ein lokaler Stand ist kein Beleg für den Repo-Stand.
- Ist der Tree dirty: **prüfen, ob dirty ⊂ upstream, bevor etwas verworfen wird.** Fremde
  unfertige Branch-Arbeit wird nicht aufgeräumt.
- Greps **gegen `origin/main`** fahren (`git grep … origin/main`), nicht gegen den lokalen
  Tree — sonst misst man den eigenen Rückstand als Lücke.
- **Zeilennummern nie aus Notizen übernehmen**, immer per `grep -n` auflösen. Sie driften.

### 3. Je Fund das Qualitäts-Gate (§4 des Rosters)
Venue-Annahme bzw. Kontrollarm + Fallzahl; Ebenen-Filter; Praktikerbericht ohne Erhebung
ist kein Methodenfund. Was durchfällt, wird als geprüft notiert — **nicht als Fund.**

### 4. Trifft der Fund hier eine Lücke?
Drei Fragen, in dieser Reihenfolge:
1. **Deckt der Bestand das schon?** Per grep belegen, nicht aus dem Gedächtnis. Gedeckt →
   fertig, nichts vorlegen.
2. **Ist es eine Fehlerklasse, die hier real auftritt?** Eine Regel gegen ein Problem, das
   dieses Setup nicht hat, kostet Kontext und bringt nichts.
3. **Schärfen oder anfügen?** Ist der Fund eine Randbedingung auf einen vorhandenen Hebel,
   wird die **bestehende Zeile geschärft**. Anfügen ist die Ausnahme, nicht der Default —
   eine Liste, die nur wächst, verliert ihre Wirkung.

### 5. Deckel auf die Vorschläge
Liegt bereits ein unentschiedener Vorschlag offen, wird **nichts Neues nachgelegt**. Dann
ist die Ausgabe eine **Entscheidungsfrage** zum Offenen (annehmen, priorisieren, verwerfen)
— nicht ein weiterer Fund. Ein Stapel offener Vorschläge ist dasselbe Anti-Pattern wie eine
Regelliste, die nur wächst.

### 6. Quellen-Roster pflegen
- **Neue Quelle:** gegen das Fünf-Punkte-Gate in §4 des Rosters prüfen (aufgelöst, datiert,
  Mechanik geprüft, trägt etwas Neues, Urteil benannt). Bestanden → in die passende Tabelle
  mit Kadenz + Mechanik + Urteil. Durchgefallen → **nach §5 „nicht aufgenommen"**, mit
  Grund, damit kein Folgelauf sie erneut prüft.
- **Gescheiterte Abrufmechanik ist ein Ergebnis**, kein Fehlschlag: notieren, welcher Weg
  nicht trägt (JS-Rendering, Consent-Wall, 403, Timeout) und welcher trägt. Sonst kostet
  dieselbe Quelle jeden Lauf erneut Zeit.
- **Streichen** gehört dazu: drei Läufe ohne Ertrag und ohne Ausschluss-Wirkung → raus.

### 7. Ausgabe
Das **Delta seit dem letzten Lauf**, nicht der Gesamtstand neu erzählt:
- geprüfte Quellen mit Ergebnis (auch die leeren — ein belegtes „nichts Neues" ist ein
  Ergebnis),
- je Fund: Beleg (Zahlen, Fallzahl, Venue) **und** die Lücke im Bestand per `Datei:Zeile`,
- was offen bleibt, mit Entscheidungsfrage,
- `UNBEKANNT: <was fehlt>` wo nicht belegt ist — nicht plausibel auffüllen.

Ein Lauf ohne Fund ist ein erfolgreicher Lauf. „Nichts Neues, hier ist was geprüft wurde"
ist die häufigste richtige Antwort.

## Harte Grenzen
- **Nichts aus Erinnerung.** Jede Zahl, jedes Datum, jede URL in dieser Session aufgelöst.
  Nicht auflösbar → raus und benannt.
- **Kein stilles Schreiben am Bestand.** Dieser Skill **recherchiert und legt vor**; Regeln
  ändern braucht Freigabe. Ausnahme ist allein der Quellen-Roster (Schritt 6) — das ist das
  Arbeitsmittel dieser Routine, nicht die Methode selbst.
- **Keine Commits ohne Freigabe.**
- **Fund ≠ Regel.** Ein belegter Fund ist ein Vorschlag mit Begründung. Ob er ins Harness
  kommt, entscheidet der Nutzer.

## Nicht Aufgabe dieses Skills
| Abgrenzung | Dorthin |
|---|---|
| Wochen-Briefing „was ist in der KI-Welt passiert" | Scheduled Task `ki-news` — berichtet breit; dieser Skill urteilt schmal. |
| Einen gefundenen Link ablegen | `linklist-curator` (`harness/linklist.md`) |
| Ein komplettes fremdes Regelwerk bewerten | `rule-intake-curator` |
| Installierbare Skills suchen | `find-skills` |
| Eine Regel nach Entscheidung einarbeiten | `harness/SELF_OPTIMIZATION.md` (Schärfen/Pruning), Freigabe vorausgesetzt |
| Prüfen, ob eine Web-App dem Stand der Technik entspricht | `webapp-blueprint` — fester Katalog gegen bekannte Standards |
