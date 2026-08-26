> **Lade wenn:** das Projekt eine UI mit eigenen Komponenten hat und ein UI-Write
> ansteht (Komponente, Stylesheet, Token, `DESIGN.md`). Reine API-/CLI-Projekte
> überspringen diese Datei vollständig.

# Guardrails — UI (Abschnitte G und I)

Ausgelagerter **Abschnitt G** der [GUARDRAILS.md](GUARDRAILS.md). Buchstabe und
Regelnummern (6, 7) bleiben unverändert, damit ältere Verweise auf „GUARDRAILS
Abschnitt G / Regel 6/7" weiter zutreffen — nur die Datei ist eine eigene, weil
diese Regeln nur bei Frontend-Arbeit gelten und den immer-geltenden Kern sonst um
rund ein Drittel aufblähen.

Dazu **Abschnitt I** (Regeln 12–16): Nutzbarkeit. G sorgt dafür, dass die
Oberfläche *einheitlich* ist — das sagt nichts darüber, ob man sie *bedienen*
kann. Beide Achsen gelten bei UI-Arbeit, deshalb stehen sie in derselben Datei
und laden mit demselben Trigger.

Die Regeln haben denselben Rang wie der Rest der Guardrails (Rang 2 der Rangfolge
in `GUARDRAILS.md` Abschnitt 0) — die Auslagerung ist eine Kontext-Maßnahme, keine
Herabstufung.

---

## G. UI-Konsistenz (bei Frontend-Arbeit, vor jedem UI-Write)

Dieselbe DRY-/Reference-first-Härte wie im Code gilt für die Oberfläche: **ein**
Button, **eine** Tabelle, **eine** Abstands-Skala — nicht pro Seite eine leicht
andere Variante. Wo die Komponenten-Bibliothek und die Token-/Skala-Quelle konkret
liegen (Component-Verzeichnis, Theme-/Tailwind-Config, Design-Tokens): Stack-Adapter.

### Regel 6 — Komponente wiederverwenden statt neu bauen
Bevor ein UI-Element entsteht (Button, Tabelle, Modal, Formularfeld, Card, Badge),
prüfen ob eine kanonische Komponente dafür schon existiert. Existiert sie →
wiederverwenden, nicht eine zweite, leicht abweichende Variante daneben bauen. Ein
zweiter Button, der einen bestehenden nachbaut, ist kein Feature, sondern Drift.
(Das ist Reference-first aus [GUARDRAILS.md](GUARDRAILS.md) Abschnitt C, auf UI
angewandt: **ein** Vorbild, dann reuse — nicht N Varianten.) Echt neues Muster →
**eine** geteilte Komponente anlegen, die zur einzigen Quelle wird; andere nutzen
sie, kopieren sie nicht.

### Regel 7 — Maße/Abstände/Farben/Typo aus dem System, nie ad hoc
Höhen, Breiten, Abstände (Padding/Margin/Gap), Farben, Schriftgrößen und Radien
kommen aus der **einen** Quelle des Design-Systems (Token/Skala/Theme-Utilities),
nicht als Magic-Number/Inline-Hex/Einzelfall-`px` pro Seite. Ein `color:#3b7` oder
`margin:13px` direkt im Markup ist ein Signal: der Wert gehört in die Skala — oder
es fehlt dort eine Stufe, die zentral ergänzt wird (nicht lokal umgangen).

Deklariert das Projekt sein Design-System **maschinenlesbar**, ist das gesetzte
Format eine `DESIGN.md` im
[google-labs-code-Format](https://github.com/google-labs-code/design.md) (YAML-
Front-Matter: `colors`/`typography`/`spacing`/`rounded`/`components`, Token-Refs wie
`{colors.primary}`) — dann ist **diese Datei** die „eine Quelle" oben: Tokens sind
**normativ**, die Prosa gibt nur den Kontext. Vor jedem UI-Write gelesen, Token-Refs
aufgelöst statt Werte dupliziert, Kontrast gegen **WCAG AA** (≥ 4.5:1 Text) geprüft.
Wo die Datei liegt und mit welchem Kommando sie validiert wird: Stack-Adapter.

Das Format ist **`version: alpha`** — die Spec kann sich ändern. Deshalb wird nicht
aus dem Gedächtnis geschrieben: die Schema-Wahrheit kommt per `npx @google/design.md spec`
(≈ 15 KB, on-demand, nicht im Harness dupliziert), bevor eine unbekannte Sektion,
ein Sub-Token oder ein Theme-Modus entsteht. Angenommene Syntax ist genauso eine
Erfindung wie ein angenommener Farbwert.

Fehlt eine Sektion in einer **vorhandenen** `DESIGN.md` mit Absicht, wird das dort
deklariert statt offen zu bleiben — `omitted:` nimmt Sektionsnamen und optional einen
Grund:
```yaml
omitted:
  - spacing
  - section: rounded
    reason: "No rounded corners defined in brand book"
```
Das ist die maschinenlesbare Form von „Lücke benannt statt erfunden". (Beobachtet an
0.3.0 und 0.4.0: die Lint-Meldung wechselt von „will fall back to agent defaults" zu
„intentionally omitted" — beide bleiben `info`, es unterdrückt also keine Severity,
sondern dokumentiert die Absicht. Nicht zu verwechseln mit dem Fall weiter unten, dass
das Projekt **gar keine** `DESIGN.md` hat.)

**Richtung der Autorität — gilt nur gegenüber den eigenen Derivaten:** `DESIGN.md`
ist die *geschriebene* Quelle; die Runtime-Artefakte (`tokens.json`, `theme.css`,
`tailwind.config`) sind daraus *deriviert*. Bei Widerspruch gewinnt `DESIGN.md`, und
das Derivat wird neu erzeugt statt von Hand angeglichen.

**Diese Rangfolge sagt nichts über bestehende Design-Vorgaben des Projekts.** Ein
`STYLEGUIDE.md`, `docs/design-*`, die Projekt-`CLAUDE.md`/`AGENTS.md` oder die Doku
der Komponenten-Bibliothek werden von einer `DESIGN.md` **nicht** überstimmt und nicht
verdrängt — auch nicht mit dem Argument, Tokens seien normativ. Das oben („Tokens sind
normativ, die Prosa gibt nur den Kontext") ordnet ausschließlich das Verhältnis
*innerhalb* der `DESIGN.md`, nicht `DESIGN.md` gegen fremde Dokumente. Wie ein
Widerspruch zwischen beiden behandelt wird, steht unten.

Austauschformat nach außen ist das
**[W3C-DTCG-Format](https://www.designtokens.org/tr/2025.10/format/)**
(`$value`/`$type`-JSON) — kein selbst erfundenes Schema; das Token-Modell der
`DESIGN.md` stammt davon ab (typisierte Gruppen, `{path.to.token}`-Refs). Kann das
Zielsystem `DESIGN.md` nicht direkt konsumieren, erzeugt ein minimales
reproduzierbares Build-/Adapter-Kommando die Runtime-Tokens aus dieser Quelle
(Kommando: Stack-Adapter). Hex-/Skalenwerte von Hand in CSS/JS zu kopieren und nur
per Drift-Test zu vergleichen ist keine Token-Auflösung.

### Bestand zuerst — nichts vorschlagen in einen besetzten Platz

**Vor** dem Vorschlag einer `DESIGN.md` und vor dem ersten UI-Write wird nachgesehen,
ob das Projekt seine Design-Vorgaben **schon irgendwo** hat. Nicht nur in
maschinenlesbarer Form: `STYLEGUIDE.md`, `docs/design-*`, `CONTRIBUTING.md`, die
Projekt-`CLAUDE.md`/`AGENTS.md`, ein Design-Kapitel im README, die Doku der
Komponenten-Bibliothek, Theme-/Token-Configs, Figma-/Brand-Exporte. Prosa-Vorgaben
zählen **genauso** als bestehende Vorgabe wie eine Token-Datei — sie sind nur schlechter
prüfbar, nicht weniger gültig.

Was dort steht, gilt weiter. Es wird nicht ignoriert, weil es „nicht das Format" ist,
und nicht ersetzt, weil eine `DESIGN.md` es maschinenlesbar wiederholen könnte.

**Widerspruch wird vorgelegt, nicht aufgelöst.** Sagt eine bestehende Vorgabe etwas
anderes als die `DESIGN.md` (oder als der Vorschlag für eine), entscheidet **keine der
beiden Seiten automatisch**: beide Fundstellen werden mit Datei und Zeile benannt, der
Konflikt beschrieben, und der Nutzer entscheidet, was gilt und ob die Vorgabe migriert,
bleibt oder fällt. Bis zur Entscheidung wird nichts überschrieben — weder die alte
Vorgabe noch die `DESIGN.md`. (Das ist „Mehrere Interpretationen möglich → vorlegen,
nicht stillschweigend wählen", `instructions/AGENTS.md`.)

Hat das Projekt **Design-Anforderungen, aber (noch) keine** solche Quelle, wird eine
`DESIGN.md` **nicht eigenmächtig** angelegt. Stattdessen wird die Lücke benannt und
das Erstellen **vorgeschlagen** — mit Freigabe des Nutzers (deckt sich mit „nicht
Angefordertes nur mit expliziter Freigabe", `instructions/AGENTS.md`). Bis dahin gilt
die vorhandene Quelle des Projekts — Token-/Theme-Config **oder** Prosa-Vorgabe — als
„eine Quelle"; fehlt auch die, wird das als offene Lücke gemeldet, nicht durch eine
erfundene ersetzt.

### Nachweis statt Zusicherung

Regel 6 und 7 werden vor der Fertig-Meldung **belegt**, nicht zugesichert
([GUARDRAILS.md](GUARDRAILS.md) C → „Verifikation belegen"). Je berührter
UI-Einheit eine Zeile:

- **wiederverwendet** → welche Komponente/Token-Stufe, mit `Datei:Zeile` der
  Verwendung. „Bestehende Patterns genutzt" ohne Fundstelle zählt nicht.
- **neu angelegt** → warum keine bestehende passte und wo die neue Einheit als
  Quelle liegt. Sie ist ab dann die kanonische, nicht eine zweite Variante.

Eine **bewusste** Abweichung von Regel 6 oder 7 ist kein Nebensatz in der
Abschlussmeldung, sondern eine festgehaltene Entscheidung: ADR nach
[ADR_TEMPLATE.md](ADR_TEMPLATE.md) — „bewusste Abweichung von einer
GUARDRAILS-Regel" steht dort bereits als Anlass. Ohne ADR gibt es keine
Abweichung, dann gilt die Regel.

Das ersetzt den mechanischen Check des Stack-Adapters nicht: der fängt Inline-Hex
und Magic-Number, nicht die zweite Komponente, die eine bestehende nachbaut.

### Selbstcheck vor "fertig" (UI)
- Kein dupliziertes Element, das ein bestehendes nachbaut (Regel 6).
- Keine Inline-Farbe/Magic-Number, wo eine Token-/Skala-Stufe existiert (Regel 7).
- Neuer Wert nötig → als neue zentrale Stufe, nicht als lokaler Sonderfall.
- Gibt es eine `DESIGN.md`/Token-Quelle: Werte lösen deren Tokens auf, Kontrast ≥ WCAG AA.
- Derivate (`tokens.json`/`theme.css`/`tailwind.config`) sind aus `DESIGN.md` erzeugt, nicht von Hand angeglichen.
- Jede populierte Token-Sektion erscheint im Export — außer `components`, das kein Target darstellen kann; `lint` **und** `export` gelaufen, nicht nur einer.
- Unbekannte Sektion/Sub-Token/Theme-Syntax gegen `spec` geprüft, nicht angenommen.
- Absichtlich fehlende Sektion steht als `omitted:` in der `DESIGN.md`, nicht nur im Kopf des Autors.
- Design-Anforderung, aber keine `DESIGN.md`/Token-Quelle → Erstellen vorgeschlagen und gefragt, nicht eigenmächtig angelegt.
- Bestehende Vorgaben gesucht **und benannt** (auch Prosa: `STYLEGUIDE.md`, `docs/design-*`, Projekt-`CLAUDE.md`, Component-Doku) — vor Vorschlag und vor UI-Write.
- Widerspruch zwischen Bestand und `DESIGN.md` → beide Fundstellen vorgelegt, Entscheidung beim Nutzer; nichts überschrieben.
- Wiederverwendung je berührter UI-Einheit mit `Datei:Zeile` belegt — nicht zugesichert.
- Bewusste Abweichung von Regel 6/7 → ADR angelegt, nicht nur in der Meldung erwähnt.

---

## I. UI-Nutzbarkeit (bei Frontend-Arbeit, vor jedem UI-Write)

Abschnitt G hält die Oberfläche **einheitlich**. Ob sie **bedienbar** ist, sagt
er nicht: eine konsistent aus Tokens gebaute Schaltfläche kann zu klein zum
Treffen sein, ein konsistenter Ladezustand kann unsichtbar bleiben. Die Regeln
hier schließen diese Lücke.

Aufgenommen ist nur, was sich am gerenderten Ergebnis **messen oder beobachten**
lässt — das ist derselbe Filter wie in [GUARDRAILS.md](GUARDRAILS.md) Abschnitt C
(„Fertig" ist eine Beobachtung, keine Selbsteinschätzung). Herkunft der Prinzipien:
[Laws of UX](https://lawsofux.com/); die verbindlichen Zahlen kommen aus WCAG, nicht
von dort. Nicht aufgenommen wurden die Gedächtnis- und Aufmerksamkeits-Effekte
(Peak-End, Zeigarnik, Von Restorff, Serial Position): richtig, aber ohne
Abnahme-Kriterium — sie gehören in ein Design-Review, nicht in ein Gate.
**Jakob's Law** (Nutzer erwarten, dass sich diese Seite verhält wie die anderen,
die sie kennen) ist nicht als eigene Regel geführt, weil *Consistency First* in
`instructions/AGENTS.md` dieselbe Forderung bereits stellt.

### Regel 12 — Interaktive Ziele sind groß genug und stoßen nicht aneinander
Jedes Ziel für Zeigereingaben ist mindestens **24 × 24 CSS-Pixel**
([WCAG 2.2, SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
Level AA) — das ist die Untergrenze, nicht das Ziel. Für primäre, häufige oder
touch-first bediente Controls verlangt dieses Harness **44 × 44 CSS-Pixel**; das
ist der Wert aus
[SC 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
(Level AAA), das ihn für *alle* Ziele fordert — die Einschränkung auf primäre
Controls ist unsere, nicht die von WCAG. Kleiner nur über eine der in 2.5.8
benannten Ausnahmen (Abstand,
äquivalentes Ziel, Inline-Text, User-Agent-Control, essenziell) — die Ausnahme
wird benannt, nicht angenommen.

Dazu der Abstand: benachbarte Ziele stehen so weit auseinander, dass ein
Fehlgriff die Nachbaraktion **nicht** auslöst. Grund ist
[Fitts's Law](https://lawsofux.com/fittss-law/) — die Zeit zum Treffen wächst mit
der Distanz und fällt mit der Größe; ein winziges Ziel wird nicht nur langsam
getroffen, sondern verfehlt. Steht eine **zerstörende** Aktion (Löschen, Abbrechen
mit Datenverlust) neben einer harmlosen, ist der Abstand kein Feinschliff, sondern
der Schutz vor dem Fehlgriff.

### Regel 13 — Was länger als 400 ms dauert, zeigt das
Wird das Ergebnis einer Nutzeraktion nicht innerhalb von **400 ms** sichtbar,
bekommt die Aktion sichtbares Feedback: Zustandswechsel am auslösenden Element,
Skeleton, Fortschritt. Kein stiller Zustand, in dem die Oberfläche unverändert
aussieht, während im Hintergrund etwas läuft — der Nutzer klickt sonst erneut.
Die Schwelle stammt aus dem
[Doherty Threshold](https://lawsofux.com/doherty-threshold/) (Doherty/Thadani,
IBM Systems Journal 1982).

Ein Element, das eine laufende Aktion ausgelöst hat, nimmt bis zu deren Ende
**keine zweite** entgegen. Das ist kein Komfort-Detail: doppelt abgeschickte
Formulare sind doppelte Datensätze.

### Regel 14 — Die Komplexität trägt das System, nicht der Nutzer
[Tesler's Law](https://lawsofux.com/teslers-law/): jeder Vorgang hat einen Kern an
Komplexität, der sich nicht wegdesignen lässt — er landet entweder im System oder
beim Nutzer. Voreinstellung ist: im System. Konkret heißt das, dass eine Auswahl
nicht als Liste gleichrangiger Optionen ausgeliefert wird, die man erst vollständig
lesen muss ([Hick's Law](https://lawsofux.com/hicks-law/): die Entscheidungszeit
wächst mit der Zahl der Alternativen) — sondern mit einem gesetzten Default, einer
hervorgehobenen Empfehlung oder in gestaffelten Schritten.

Eine Zahl steht hier bewusst nicht: die Quelle nennt keine, und eine erfundene
Obergrenze („höchstens sieben") wäre eine Behauptung im Gewand einer Regel. Das
Kriterium ist die **Struktur** — gibt es einen Default, und muss man alles lesen,
um zu wählen?

Die Gegenrichtung gilt genauso: Komplexität, die dem Nutzer gehört, wird ihm nicht
genommen. Ein Feld, dessen Wert nur er kennt, wird nicht mit einem geratenen Default
vorbelegt.

### Regel 15 — Zusammengehöriges steht enger als Getrenntes
Der Abstand **innerhalb** einer Gruppe ist kleiner als der Abstand **zwischen**
Gruppen ([Law of Proximity](https://lawsofux.com/law-of-proximity/): was nah
beieinander steht, wird als zusammengehörig gelesen). Ein Label gehört sichtbar zu
seinem Feld, eine Aktionsgruppe sichtbar zusammen — sonst liest die Gruppierung
sich gegen die tatsächliche Struktur.

Beide Abstände kommen aus der Skala (Regel 7); die Regel verlangt zwei
**verschiedene Stufen**, keinen ad-hoc-Wert. Das macht sie prüfbar: welche Stufe
innen, welche außen.

### Regel 16 — Eingaben werden angenommen, wie Menschen sie tippen
An der Formular-Grenze wird tolerant gelesen und streng gespeichert
([Postel's Law](https://lawsofux.com/postels-law/)): führende und folgende
Leerzeichen, Gruppierungs-Zeichen in IBAN/Telefon/Kartennummer, Groß-/Kleinschreibung
in E-Mail-Domains, verschiedene Datums-Schreibweisen — soweit die Absicht eindeutig
ist, wird die Eingabe normalisiert statt abgelehnt. Was mehrdeutig bleibt, wird
abgelehnt, und zwar mit der konkreten Bedingung, nicht mit „ungültige Eingabe".

**Abgrenzung, damit hier kein Widerspruch entsteht:** *Simplicity First*
(`instructions/AGENTS.md`) verbietet ungefragte Eingabe-Validierung. Diese Regel gilt
**nur** an der Formular-Trust-Boundary — also genau dort, wo dieselbe Datei mit der
Edge-Case-Matrix (→ Testing) bereits eine benannte Ausnahme führt. Sie ist kein
Freibrief, in gewöhnlicher Funktionslogik Eingaben zu normalisieren.

### Nachweis statt Zusicherung (Abschnitt I)

Wie bei Regel 6/7 wird belegt, nicht zugesichert. Je berührter UI-Einheit, soweit
die Regel greift:

- **Regel 12** → gemessene Box des Ziels (Zahl × Zahl) oder die benannte
  WCAG-Ausnahme, mit `Datei:Zeile` der Größenquelle.
- **Regel 13** → das beobachtete Feedback-Element und die Aktion, an der es hängt.
  Bei nachweislich synchronen Aktionen (kein IO) entfällt die Regel — das wird
  gesagt, nicht stillschweigend angenommen.
- **Regel 14** → welcher Default gesetzt ist bzw. wie gestaffelt wurde.
- **Regel 15** → die beiden Token-Stufen (innen/außen) mit `Datei:Zeile`.
- **Regel 16** → welche Eingabe-Varianten normalisiert werden, mit dem Test, der
  sie abdeckt.

Bewusste Abweichung → ADR nach [ADR_TEMPLATE.md](ADR_TEMPLATE.md), wie in
Abschnitt G. Ohne ADR gilt die Regel.

### Selbstcheck vor "fertig" (Nutzbarkeit)
- Jedes neue/geänderte interaktive Ziel ≥ 24 × 24 px, primäre Controls ≥ 44 × 44 px — gemessen, nicht geschätzt.
- Zerstörende Aktion neben harmloser → Abstand geprüft.
- Jede Aktion mit IO hat sichtbares Feedback; kein doppeltes Absenden möglich.
- Auswahl hat einen Default oder eine Staffelung — oder es ist begründet, warum nicht.
- Abstand innerhalb einer Gruppe < Abstand zwischen Gruppen, beide aus der Skala.
- Formular normalisiert offensichtliche Eingabe-Varianten; Ablehnung nennt die Bedingung.
