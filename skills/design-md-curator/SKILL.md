---
name: design-md-curator
description: Erstellt oder aktualisiert eine `DESIGN.md` (google-labs-Format) aus belegter Evidenz — nach erteilter Freigabe. Use when the user has approved creating a design source, or wants an existing DESIGN.md updated/reconstructed — e.g. "leg die DESIGN.md an", "erstell eine DESIGN.md für X", "aktualisiere die DESIGN.md", "rekonstruiere das Design-System dieser Seite", "dokumentier unsere Design-Sprache". Erklärt Evidenz-Gate, Schema-Härten und die Validierungs-Sequenz lint → export → diff.
---

# design-md-curator

Eine `DESIGN.md` ist nach `harness/GUARDRAILS.md` Abschnitt G/Regel 7 die **normative
Quelle** für Farben, Typo, Abstände und Radien. Dieser Skill baut sie — aus Evidenz,
nicht aus Geschmack.

## Voraussetzung: die Freigabe liegt vor

**Dieser Skill legt keine `DESIGN.md` von sich aus an.** GUARDRAILS G/Regel 7 sagt:
hat ein Projekt Design-Anforderungen aber keine Quelle, wird die Lücke *benannt* und
das Erstellen *vorgeschlagen* — angelegt wird sie erst mit Freigabe des Nutzers. Dieser
Skill ist der Schritt **danach**. Ohne Freigabe ist der richtige Zug die Meldung, nicht
dieser Skill.

Betroffen wird nur `DESIGN.md`. Produktquellen, Konfiguration, Dependencies und
generierte Dateien bleiben unangetastet (Surgical Changes).

## 1. Modus wählen

**Repo-Modus** — lokale Quellen vorhanden. Er darf normative Werte, Token-*Namen*,
Komponenten-Eigentümerschaft und dokumentierte Begründung belegen.

**URL-Modus** — nur eine öffentliche Adresse. Braucht gerenderten Zugriff (DOM,
Computed Styles, geladene Stylesheets, Desktop **und** Mobile). Er belegt ausschließlich
*beobachtbare* Werte — **nicht** interne Token-Namen, nicht Eigentümerschaft, nicht
Intention, nicht ob ein Muster kanonisch gemeint ist. Ergebnis wird als
**Rekonstruktion** gekennzeichnet.

Sind Quellen verfügbar, gewinnt Repo-Modus. Eine URL kann die Darstellung bestätigen,
ersetzt aber keine Quelle. Ohne gerenderten Zugriff: Screenshots/Quellen anfordern —
keine `DESIGN.md` aus Copy, Metadaten oder HTML-Struktur.

## 2. Evidenz sammeln

Repo-Modus, in dieser Reihenfolge: vorhandene `DESIGN.md`/explizite Guidance → Tokens,
Themes, globale Styles → geteilte Primitive und ihre Varianten → repräsentative Routen →
flächenlokale Umsetzungen.

Eine Quelle zählt nur, wenn das gewählte Produkt sie importiert, referenziert, erbt oder
rendert. Vorschläge, Migrationen, Beispiele, generierte Ausgaben und Altlasten fallen
raus.

## 3. Das Drei-Beweis-Gate

Jeder Kandidat braucht **alle drei**, sonst wird er weggelassen:

1. **Beobachtung** — Wert ist sichtbar bzw. berechnet, nicht geschätzt.
2. **Basis** — gemessen, oder er wiederholt sich über die geforderten Stichproben
   (im URL-Modus: dieselbe Rolle auf ≥ 2 Templates für eine seitenweite Regel).
3. **Konsequenz** — er ändert eine konkrete Implementierungsentscheidung.

Fehlt einer, wird nichts geschrieben. Eine einzelne Fundstelle ist keine seitenweite
Regel; ein optischer Eindruck ist kein Token; Wiederholung ist keine Absicht.

## 4. Schema-Härten (harte Gates, keine Stilfrage)

Das Format ist `version: alpha` — **vor** unbekannter Sektion, unbekanntem Sub-Token
oder Theme-Syntax die Wahrheit holen statt sie anzunehmen:

```bash
npx @google/design.md spec
```

- Token-Gruppen sind **Mappings**, keine Sequenzen und keine Skalare.
  `typography.mono.fontFamily: Geist Mono` — **nie** `typography.mono: Geist Mono`.
- Typo-Felder nur kanonisch: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`,
  `letterSpacing`, `fontFeature`, `fontVariation`.
- Definiert die Quelle nur ein `--radius`, wird das zu `rounded.base` normalisiert —
  keine erfundenen `sm`/`md`/`lg`-Stufen, keine aus CSS-Variablennamen kopierten Keys
  wie `rounded.radius`.
- `components`-Sub-Tokens nur: `backgroundColor`, `textColor`, `typography`, `rounded`,
  `padding`, `size`, `height`, `width`. Erfundene Namen liefern `warning` bei **Exit 0**
  — und weil `components` von keinem Export-Target emittiert wird, ist der Lint die
  einzige Prüfung dafür.
- Jeder Token-Name matcht `^[a-zA-Z0-9][a-zA-Z0-9-]*$`. Flach halten:
  `background-primary`, nicht `background.primary` oder `Background_Primary`.
  **Verifiziert an v0.3.0:** das erzwingt der **`export`** (`INVALID_TOKEN_NAME`,
  Exit **1**) — der `lint` derselben Datei läuft mit Exit **0** durch. Der Lint allein
  belegt also keine exportierbare Datei.
- Sektion nur anlegen, wenn eine belegende Quelle das System auch benennt. Keine
  Token-Namen, um Implementierungswerte zu sortieren.
- Absichtlich fehlende Sektion → `omitted:` mit Grund, statt stillschweigend weglassen.

## 5. Schreiben

Kleinste sinnvolle Front-Matter zuerst — `name` und `description`, dann nur belegte
Gruppen. (Der Linter erzwingt kein Feld als `error`: eine Datei ohne `name` gibt Exit 0.
Fehlende Sektionen kommen als `warning`/`info`. Vollständigkeit ist hier eine
Autorenpflicht, kein Gate.) Danach die Prosa, Sektionsreihenfolge aus der Spec: Overview → Colors →
Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts. Keine
Sektion, nur weil das Format sie kennt; nicht umsortieren, nicht doppeln (doppelte
Überschrift ist laut Spec ein **Error**).

Exakte Werte gehören in die Front-Matter, Begründung und Anwendung in die Prosa. Jeder
Prosa-Satz außerhalb des Overview muss eine Implementierungsentscheidung ändern —
Komponenten-Inventare, allgemeine Designratschläge und Wiederholungen des YAML raus.
Ein „Don't" nur bei ausdrücklichem Verbot in der Quelle.

Nicht in die `DESIGN.md`: Zitate, Audit-Notizen, verworfene Kandidaten, Konflikte,
offene Fragen. Konflikte zwischen Umsetzung und Guidance werden **außerhalb** gemeldet
(Ehrlichkeit, `instructions/AGENTS.md`).

## 6. Validieren — vor dem Zurückmelden, nicht danach

```bash
npx @google/design.md lint DESIGN.md
npx @google/design.md export --format <css-tailwind|json-tailwind|dtcg> DESIGN.md
```

Target vorher festlegen: `css-tailwind` (Tailwind v4), `json-tailwind` (v3), sonst `dtcg`.

**Exit 0 ist kein Beleg** (siehe Stack-Adapter): Kontrast-Verstöße und ungültige
Sub-Tokens kommen als `warning` bei Exit 0. Und jede populierte Token-Sektion muss ihre
Familie im Export emittieren (`colors` → `--color-*`, `typography` → `--font-*`/
`--text-*`, `rounded` → `--radius-*`, `spacing` → `--spacing-*`); fehlt eine, ist die
Front-Matter falsch geformt. **Verifizierte Ausnahme:** `components` emittiert unter
keinem Target — Token-Ebenen können es nicht darstellen. Das ist eine Limitation, die
gemeldet wird; die Sektion wird nicht gelöscht, um den Export glatt zu bekommen.

Beim **Update** einer bestehenden Datei zusätzlich:

```bash
npx @google/design.md diff <vorherige-fassung> DESIGN.md
```

Verschwindet eine akzeptierte Entscheidung, wird sie wiederhergestellt — es sei denn,
aktuelle Evidenz oder der Nutzer ersetzt sie ausdrücklich.

Exportierte Dateien werden nicht angelegt oder behalten; der Export ist hier Prüfung,
nicht Artefakt.

## 7. Berichten

Modus und geprüftes Produkt/URL · erstellt oder aktualisiert · verwendete belegende
Quellen · weggelassene Kandidaten und Konflikte · Lint- und Export-Ergebnis. Im
URL-Modus als Rekonstruktion kennzeichnen.

## Nicht Aufgabe dieses Skills

- **Entscheiden, ob es eine `DESIGN.md` geben soll** — das ist die Freigabe davor.
- **Konformität prüfen.** Ob bestehender UI-Code die Regeln noch hält, ist der
  Selbstcheck in GUARDRAILS G und die Konsistenz-Dimension in `harness/REVIEW_PANEL.md`.
- **Runtime-Tokens erzeugen.** Der Generator/Adapter, der `theme.css` & Co. aus dieser
  Datei baut, gehört ins Projekt (Kommando: Stack-Adapter).
