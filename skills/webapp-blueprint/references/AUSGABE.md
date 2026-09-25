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
| `pruefart` | `passiv` · `aktiv` · `befragung` | Code/Doku lesen · freigegebene Probe · Auskunft des Nutzers |
| `pflicht` | `true` · `false` | trifft der Punkt bei gewählter Stufe und Bedingungen zu? |
| `risiko` | `hoch` · `mittel` · `niedrig` | nur bei `teilweise`/`fehlt` |
| `aufwand` | `S` · `M` · `L` | nur bei `teilweise`/`fehlt` |

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
  bedingungen: [api-extern, verbraucher]   # nur die zutreffenden
  begruendung: <ein Satz je Festlegung>
umfang:
  bereiche: ["01", "03", "05", "10"]       # geprüfte Bereiche
  nicht_geprueft: {"13": "keine öffentliche Website"}
zaehlung: {erfuellt: 0, teilweise: 0, fehlt: 0, na: 0, unbekannt: 0, nicht_geprueft: 0}
---

# Audit <Gegenstand>

## Zusammenfassung
<höchstens fünf Sätze: Gesamtlage, die drei wichtigsten Lücken per ID>

## Prüfregister
```jsonl
{"id":"SEC-10","titel":"Standardmäßig verboten, geprüft je Funktion, Objekt und Feld","stufe":"B","phase":"F","pflicht":true,"pruefart":"passiv","status":"teilweise","beleg":["app/Policies/OrderPolicy.php:12","tests/Feature/OrderAuthTest.php:30"],"fehlt":"keine Feldebene; 7 von 23 Endpunkten ohne Fremdkonto-Test","risiko":"hoch","aufwand":"M"}
{"id":"LAW-01","titel":"Anbieterkennzeichnung (Impressum)","stufe":"B","phase":"G","pflicht":true,"pruefart":"passiv","status":"erfuellt","beleg":["resources/views/layout.blade.php:88"]}
{"id":"API-06","titel":"Abschalten ist ein Prozess mit Frist","stufe":"Oe","phase":"L","pflicht":false,"pruefart":"passiv","status":"na","grund":"Bedingung api-extern trifft nicht zu"}
{"id":"OPS-14","titel":"Wiederherstellung wird regelmäßig geübt und gemessen","stufe":"B","phase":"G/L","pflicht":true,"pruefart":"befragung","status":"unbekannt","klaert":"Datum und Dauer des letzten Restore-Tests"}
```

## Lücken nach Risiko
| Rang | ID | Risiko | Aufwand | Maßnahme (Vorgehen) | Ablage |
|---|---|---|---|---|---|
| 1 | SEC-10 | hoch | M | Rollen-Aktion-Feld-Matrix schreiben, fehlende Fremdkonto-Tests ergänzen | Issue |

## Offen / UNBEKANNT
- OPS-14 — <was es klärt, wer es klären kann>

## Empfehlungen oberhalb der Stufe
- <ID> — <Satz>   (nicht als Lücke gezählt)

## Außerhalb des Katalogs
- <Befund ohne passende ID; Vorschlag, ob der Katalog einen Punkt braucht>
````

**Registerregeln:** Jeder Punkt der geprüften Bereiche erscheint genau einmal —
auch `na` und `nicht_geprueft` —, damit ein Folgelauf vollständig vergleichen kann.
Punkte nicht geprüfter Bereiche dürfen fehlen, stehen dann aber in
`umfang.nicht_geprueft`. Die `zaehlung` im Kopf stimmt mit dem Register überein.

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
