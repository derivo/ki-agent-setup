# Ausgabeformat

Das Ergebnis wird von Menschen **und** von anderen Agenten gelesen: ein Folge-Agent
setzt Lücken um, ein Review-Agent prüft den Bericht nach, ein späterer Lauf vergleicht
mit dem vorigen. Deshalb gilt ein festes Format. Abweichungen machen den Bericht für
Maschinen unlesbar, auch wenn er für Menschen gut aussieht.

## Regeln

1. **Feste Reihenfolge und feste Überschriften**, wie unten; nichts umbenennen,
   nichts einfügen. Leere Abschnitte bleiben stehen und enthalten `keine`.
2. **Ein Kopfblock in YAML** am Anfang, damit ein Agent Profil und Zählung ohne
   Textverständnis lesen kann.
3. **Das Prüfregister steht als JSON Lines** in einem Codeblock mit Sprache `jsonl`,
   ein Objekt je Katalogpunkt. Es ist die maßgebliche Quelle; die Tabellen und Texte
   darunter verweisen per ID darauf und wiederholen keine Befunde.
4. **Feste Werte** für Status, Stufe, Phase und Prüfart (Tabelle unten), in genau
   dieser Schreibweise. Kein Freitext in diesen Feldern.
5. **Jeder Beleg ist nachprüfbar**: `datei:zeile`, Befehl mit Ergebnis, URL mit
   Abrufdatum oder beobachtetes Verhalten. „Sieht gut aus“ ist kein Beleg.
6. **Nichts auffüllen**: Was nicht festgestellt wurde, ist `unbekannt` mit Angabe,
   was es klären würde.
7. **IDs sind die Verbindung**: Lücken, Empfehlungen und offene Fragen nennen die
   Katalog-ID. Eine Lücke ohne ID gehört unter „Außerhalb des Katalogs“.
8. Sprache: Deutsch; Schlüssel und feste Werte wie unten (ASCII).

## Feste Werte

| Feld | Werte | Bedeutung |
|---|---|---|
| `status` | `erfuellt` · `teilweise` · `fehlt` · `na` · `unbekannt` · `nicht_geprueft` | wie SKILL.md Abschnitt 3; `na` braucht `grund`, `unbekannt` braucht `klaert` |
| `stufe` | `B` · `Oe` · `K` | Stufe, ab der der Punkt Pflicht ist (`Oe` = Ö) |
| `phase` | `E` · `F` · `G` · `L` · `G/L` | wie im Katalog |
| `bedingung` | Liste der Bedingungskürzel aus SKILL.md Abschnitt 1, ASCII (`oeffentliche-inhalte`) | aus dem Titel des Punkts; `[]`, wenn keine |
| `pflicht` | `true` · `false` | Stufe erreicht **und** alle Bedingungen treffen zu; bei `na` immer `false` |
| `pruefart` | `passiv` · `aktiv` · `befragung` | wie tatsächlich geprüft |
| `pruefart_noetig` | `aktiv` | nur wenn der Punkt ohne aktive Probe nicht entscheidbar war (dann meist `unbekannt`) |
| `erhebung` | `{"art":"vollstaendig"}` · `{"art":"stichprobe","n":10,"N":113}` | Pflicht bei Aussagen über Mengen |
| `herkunft` | `gesetz` · `sicherheit` · `betrieb` · `qualitaet` | nur bei `teilweise`/`fehlt`; bestimmt die Sortierung bei gleichem Risiko |
| `risiko` | `hoch` · `mittel` · `niedrig` | nur bei `teilweise`/`fehlt` |
| `aufwand` | `S` · `M` · `L` | nur bei `teilweise`/`fehlt` |
| `massnahme`, `ablage` | Freitext (Vorgehen, kein Werkzeug) · `issue` · `adr` · `arc42` · `phase` | nur bei `teilweise`/`fehlt` |
| `siehe` | Liste von IDs | Befund mit derselben Ursache; Maßnahme steht nur bei der ersten ID |
| `konflikt` | `datei:zeile` der Projektregel | Projektregel widerspricht einem Pflichtpunkt |
| `rechtsraum`, `norm` | Code aus `profil.rechtsraeume` · Normzitat mit Quelle | nur bei Bereich 06: je Rechtsraum eine Registerzeile mit der dort geltenden Norm; ohne belegte Norm `status: unbekannt` |

## Vorlage Audit

````markdown
---
skill: webapp-blueprint
modus: audit
datum: 2026-09-25
gegenstand: <Repo oder App, Pfad/URL>
stand: <Commit-Hash oder Version>
umgebung: <keine | Testumgebung-Name>   # aktive Proben nur hier
profil:
  stufe: Oe
  rechtsraeume: [DE, EU]                   # ISO-3166-Codes bzw. EU; [] = unbekannt
  bedingungen: [api-extern, verbraucher]   # nur die zutreffenden
  bestaetigt: false                        # true nur nach Bestätigung durch den Nutzer
  begruendung:                             # ein Satz je Festlegung
    stufe: <…>
    api-extern: <…>
  empfindlich: [<Punkte, deren Status sich bei anderem Profil ändert>]
umfang:
  bereiche: ["01", "03", "05", "10"]       # geprüfte Bereiche
  nicht_geprueft: {"13": "keine öffentliche Website"}
grundgesamtheit: {routen: 0, migrationen: 0, jobs: 0, tests: 0, fremddienste: 0}
zaehlung: {erfuellt: 0, teilweise: 0, fehlt: 0, na: 0, unbekannt: 0, nicht_geprueft: 0}
zaehlung_pflicht: {erfuellt: 0, teilweise: 0, fehlt: 0, unbekannt: 0}   # nur pflicht: true
---

# Audit <Gegenstand>

## Zusammenfassung
<höchstens fünf Sätze: Gesamtlage, die drei wichtigsten Lücken per ID>

## Prüfregister
```jsonl
{"id":"SEC-10","titel":"Standardmäßig verboten, geprüft je Funktion, Objekt und Feld","stufe":"B","bedingung":[],"phase":"F","pflicht":true,"pruefart":"passiv","erhebung":{"art":"vollstaendig"},"status":"teilweise","beleg":["app/Policies/OrderPolicy.php:12","tests/Feature/OrderAuthTest.php:30"],"fehlt":"keine Feldebene; 7 von 23 Endpunkten ohne Fremdkonto-Test","herkunft":"sicherheit","risiko":"hoch","aufwand":"M","massnahme":"Rollen-Aktion-Feld-Matrix schreiben, fehlende Fremdkonto-Tests ergänzen","ablage":"issue"}
{"id":"TST-03","titel":"Autorisierung ist je Endpunkt gegen ein fremdes Konto getestet","stufe":"B","bedingung":[],"phase":"F","pflicht":true,"pruefart":"passiv","erhebung":{"art":"vollstaendig"},"status":"teilweise","beleg":["tests/Feature/OrderAuthTest.php:30"],"fehlt":"7 von 23 Endpunkten","herkunft":"sicherheit","risiko":"hoch","aufwand":"M","siehe":["SEC-10"]}
{"id":"LAW-01","titel":"Anbieterkennzeichnung (Impressum)","stufe":"B","bedingung":[],"phase":"G","pflicht":true,"pruefart":"passiv","status":"erfuellt","beleg":["resources/views/layout.blade.php:88"]}
{"id":"API-06","titel":"Abschalten ist ein Prozess mit Frist","stufe":"Oe","bedingung":["api-extern"],"phase":"L","pflicht":false,"pruefart":"passiv","status":"na","grund":"Bedingung api-extern trifft nicht zu"}
{"id":"API-21","titel":"Content-Type wird geprüft, nicht geraten","stufe":"B","bedingung":[],"phase":"F","pflicht":true,"pruefart":"passiv","pruefart_noetig":"aktiv","status":"unbekannt","klaert":"Request mit falschem Content-Type in freigegebener Testumgebung"}
{"id":"OPS-14","titel":"Wiederherstellung wird regelmäßig geübt und gemessen","stufe":"B","bedingung":[],"phase":"G/L","pflicht":true,"pruefart":"befragung","status":"unbekannt","klaert":"Datum und Dauer des letzten Restore-Tests"}
```

## Lücken nach Risiko
| Rang | ID | siehe | Herkunft | Risiko | Aufwand | Maßnahme (Vorgehen) |
|---|---|---|---|---|---|---|
| 1 | SEC-10 | TST-03 | sicherheit | hoch | M | Rollen-Aktion-Feld-Matrix schreiben, fehlende Fremdkonto-Tests ergänzen |

Nur Pflicht-Lücken, eine Zeile je Ursache, höchstens 20 Zeilen; der Rest steht im
Register. Sortierung: Risiko, dann Herkunft (`gesetz` vor `sicherheit` vor `betrieb`
vor `qualitaet`).

## Offen / UNBEKANNT
- OPS-14 — <was es klärt, wer es klären kann>

## Empfehlungen oberhalb der Stufe
- <ID> — <Satz>   (nicht als Lücke gezählt)

## Außerhalb des Katalogs
- <Befund ohne passende ID; Vorschlag, ob der Katalog einen Punkt braucht>
````

**Registerregeln:** Jeder Punkt der geprüften Bereiche erscheint genau einmal —
auch `na` und `nicht_geprueft` —, damit ein Folgelauf vollständig vergleichen kann;
Punkte aus Bereich 06 einmal je Rechtsraum.
Punkte nicht geprüfter Bereiche dürfen fehlen, stehen dann aber in
`umfang.nicht_geprueft`. `zaehlung` und `zaehlung_pflicht` stimmen mit dem Register
überein; Punkte oberhalb der Stufe zählen nur in `zaehlung`. Ein Folgeagent muss aus
dem Register allein — ohne die Tabellen — jede Lücke finden und umsetzen können.

## Vorlage Neubau

Gleicher Kopfblock mit `modus: neubau`, ohne `stand`, `umgebung` und `zaehlung`.
Danach:

````markdown
## Entscheidungen (ADR-Entwürfe)
| ADR | Frage | Optionen | Empfehlung | Katalog-IDs |
|---|---|---|---|---|

## Arbeitspakete
```jsonl
{"paket":"WP-01","titel":"Fundament-Durchstich","phase":"F","ids":["DEL-01","OBS-06","OBS-12","SEC-18"],"ziel":"…","abhaengig":[],"abnahme":"…","nachweis":"…"}
```

## Offen / UNBEKANNT
````

Ein Arbeitspaket nennt die Katalog-IDs, die es erfüllt; jede Pflicht-ID der Phasen
`E`, `F` und `G` kommt in mindestens einem Paket vor, sonst steht sie unter „Offen“.
