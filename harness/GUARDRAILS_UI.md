> **Lade wenn:** das Projekt eine UI mit eigenen Komponenten hat und ein UI-Write
> ansteht (Komponente, Stylesheet, Token, `DESIGN.md`). Reine API-/CLI-Projekte
> überspringen diese Datei vollständig.

# Guardrails — UI-Konsistenz (Abschnitt G)

Ausgelagerter **Abschnitt G** der [GUARDRAILS.md](GUARDRAILS.md). Buchstabe und
Regelnummern (6, 7) bleiben unverändert, damit ältere Verweise auf „GUARDRAILS
Abschnitt G / Regel 6/7" weiter zutreffen — nur die Datei ist eine eigene, weil
diese Regeln nur bei Frontend-Arbeit gelten und den immer-geltenden Kern sonst um
rund ein Drittel aufblähen.

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
