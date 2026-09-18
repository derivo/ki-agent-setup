---
name: rule-intake-curator
description: 'Prüft ein fremdes Regelwerk (AGENTS.md, CLAUDE.md, Style-Guide, Review-Checkliste) gegen den eigenen Bestand und übernimmt nur das, was hier trägt. Use when the user shows an external rule set and asks what to adopt — e.g. "können wir da was mitnehmen", "was übernehmen wir aus dieser AGENTS.md", "prüf mal dieses Regelwerk", "lohnt sich das für unser Harness". Erklärt den Ablauf: Herkunft klären, Kandidaten mit Fehlerklasse extrahieren, Bestand belegt abgleichen, Zielort nach Kontext-Kosten wählen, als importierte Hypothese markieren.'
---

# rule-intake-curator

Ein fremdes Regelwerk ist eine **Fundgrube, kein Katalog**. Es ist für ein anderes
Produkt, einen anderen Stack und andere Fehler geschrieben; seine Belege gelten
dort, nicht hier. Dieser Skill beschreibt, wie eine solche Vorlage abgearbeitet
wird, damit das Ergebnis nicht „viel übernommen", sondern „begründet wenig"
heißt.

## Wann anwenden
- Der Nutzer legt eine fremde `AGENTS.md`/`CLAUDE.md`, einen Style-Guide, eine
  Review-Checkliste oder einen Regel-Abschnitt vor und fragt, was davon hier taugt.
- Eine Quelle (Blogpost, Repo, Vortrag) soll in Harness oder Instructions einfließen.

## Ablauf

### 1. Herkunft klären
Woher stammt der Text und was ist er? URL → **in dieser Session** auflösen
(`AGENTS.md` → Quellen-Provenance); eingefügter Text → als solcher benennen, keine
Quelle erfinden. Danach den projektgebundenen Teil sofort abtrennen: Repo-Struktur,
Framework-Regeln, Tooling-Kommandos, Release-Prozesse. Was nur mit deren Stack
funktioniert, ist kein Kandidat.

### 2. Kandidaten extrahieren — je Regel eine Fehlerklasse
Jeder Kandidat wird auf einen Satz gebracht **plus** die Fehlerklasse, die er
abdeckt („stiller Fehlschlag wird als Erfolg gemeldet"). Lässt sich keine Klasse
benennen, sondern nur ein Einzelfall, ist es keine Regel — Kriterien in
`harness/SELF_OPTIMIZATION.md` → „Wann eine Regel ergänzen und wann nicht".

### 3. Bestand abgleichen — grep filtert, Lesen entscheidet
Zweistufig, nie nur Stufe 1:
1. Suchen mit den Begriffen der Fehlerklasse **und** ihren Synonymen:
   `grep -rniE "<a|b|c>" --include='*.md' --exclude=EVALS.md instructions/ harness/ doc-harness/ | cut -c1-120`
   (`EVALS.md` ist Protokoll mit sehr langen Zeilen und flutet sonst den Kontext),
   dazu `grep -nE "^#{1,3} " <zieldatei>` für die Gliederung.
2. Den in Frage kommenden **Abschnitt ganz lesen**, bevor „haben wir nicht"
   behauptet wird. grep ist wortbasiert; dieselbe Regel steht oft unter anderer
   Wortwahl da. `GUARDRAILS.md` → „Abwesenheit so streng belegen wie Anwesenheit"
   gilt hier wörtlich.

Typischer Fall: „Guard nicht aufweichen" schien neu, stand aber als „keine
Suppressions" bereits in `GUARDRAILS.md` C — übernommen wurde am Ende nur der nicht
abgedeckte Teil (Schwelle anheben statt unterdrücken), mit Abgrenzungssatz zur
Nachbarregel.

### 4. Urteil je Kandidat
Fünf Ausgänge, jeder mit Beleg: **vorhanden** (`Datei:Zeile`) — **Delta**
(übernehmen) — **projektgebunden** — **Geschmack** (keine Fehlerklasse, keine
Regel) — **Konflikt**: der Kandidat steht einer bestehenden Regel entgegen
(fremdes „Prüftiefe nach Risiko skalieren" gegen unsere gesetzten Pflichtnachweise).
Ein Konflikt wird **nie** stillschweigend zugunsten der fremden Quelle aufgelöst:
beide Sätze zitieren, vorlegen, entscheiden lassen.

Bei Delta den Zielort nach Kontext-Kosten wählen, absteigend teuer:

| Ort | Wer zahlt | Schwelle |
|---|---|---|
| `instructions/AGENTS.md` | jede Session, jeder Client | sehr hoch |
| `harness/GUARDRAILS.md` | jede Harness-Arbeit (Tier 1) | hoch |
| Tier-2-Datei (`TESTS.md`, `ENGINEERING.md` …) | nur gegen Trigger | normal |
| `harness/stacks/<stack>` | nur dieser Stack | normal |

Single-Source (`doc-harness/DOC_GUARDRAILS.md` Regel 4): keine Zweitfassung einer
vorhandenen Regel, sondern Pointer — und im Text ein Satz, der die neue Regel gegen
die benachbarte abgrenzt.

Import ist ein Nullsummenspiel: jede Zeile kostet in **jeder** Session. Deshalb zu
jeder Übernahme die Gegenfrage beantworten — wird eine bestehende Regel dadurch
redundant oder enger (`SELF_OPTIMIZATION.md` → „Wann eine Regel wieder
verschwindet")? Und ein Deckel: **mehr als drei Übernahmen aus einer Quelle** sind
kein Fund, sondern ein Signal, dass Schritt 2 zu großzügig war — Zwischenstand
vorlegen statt weiter einzubauen.

### 5. Als importierte Hypothese markieren
Eine übernommene Regel hat hier **keinen** Beleg: sie stammt aus keinem eigenen
Fehler und aus keiner Referenzaufgabe — nach `SELF_OPTIMIZATION.md` ist das der
Status „Vermutung". Fremde PR-Nummern und Fix-Raten sind Herkunft, nicht Evidenz.
Deshalb trägt der Commit jeder Übernahme einen Trailer — Form wie `A11y-Check:` in
`instructions/AGENTS.md`:

```
Rule-Import: <Quelle> | <Datum> | eval: <E-ID | vorgeschlagen | offen>
```

`eval:` nennt die Referenzaufgabe in `harness/EVALS.md`, die die Regel prüfen würde.
Gibt es keine, steht dort `offen` — dann ist die Regel eine datierte Hypothese, die
der nächste A/B-Lauf findet, statt eines stillen Dauergastes.

### 6. Einbau, Gate, Übergabe
Kleinster Diff im Stil der Zieldatei; danach `make verify`. Mirror-Sync über den
bestehenden Weg (`/harness-sync`, Symlink-/rsync-Schritte in `APPLY.md`), **Commit
erst nach Freigabe**, und den nach Regeländerungen fälligen Eval-Lauf benennen statt
ihn ungefragt zu starten.

Gemeldet wird eine Tabelle mit festen Spalten — **Kandidat | Urteil | Beleg |
Zielort** —, die *alle* Kandidaten führt, auch die abgelehnten. Welche Regel nicht
übernommen wurde und warum, ist das eigentliche Ergebnis einer solchen Prüfung; eine
Meldung, die nur die Treffer zeigt, verbirgt die Arbeit.

## Abbrechen statt durchziehen
- Die Quelle löst nicht auf und der Nutzer kann sie nicht belegen → nichts übernehmen.
- Das Regelwerk nennt nur Ergebnisse („sauberer Code"), keine Fehlerklassen → melden,
  dass es keine übernehmbaren Kandidaten enthält, statt Sätze umzuformulieren.
- Der Bestandsabgleich braucht mehr Kontext, als die Sitzung hat → die Kandidatenliste
  mit Zielabschnitten übergeben, statt „nicht vorhanden" auf einem halben grep zu
  behaupten.

## Was dieser Skill nicht tut
- Keine eigene Ledger-/Statusdatei anlegen — Begründung steht im Commit, der Status
  in der Regel selbst.
- Die Kriterien nicht duplizieren: Regel-Reife (`SELF_OPTIMIZATION.md`), Beleg-Härte
  (`GUARDRAILS.md`) und Doku-Single-Source (`DOC_GUARDRAILS.md`) bleiben dort.
