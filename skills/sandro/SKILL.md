---
name: sandro
description: 'Sandro-Modus: prüft Formulare und Schreib-Endpunkte gegen den dümmsten anzunehmenden Nutzer und gegen Missbrauch — Übergröße, Müll, falsche Typen, Steuerzeichen, Unicode-Tricks, Injection, Upload-Schrott, Doppel-Submit, Flut, fremde IDs — und schließt die Löcher (500er, ungebremste Speicherung, Injection, Ressourcen-Erschöpfung, kaputtes UI). Use when the user wants input abuse tested or prevented — e.g. "Sandro-Test", "sandroisieren", "ist das Formular sandro-fest", "DAU-Test", "was passiert bei Müll-Eingaben", "Formular kaputt machen", "Abuse-Test", "was passiert, wenn jemand 5 Zeilen in die PLZ schreibt". Stack-neutral, Beispiele Laravel/PHP und React/TypeScript. Default ist ein Read-only-Audit mit belegter Lückenliste; Tests, Fixes und Gates entstehen erst nach Freigabe.'
---

# sandro

Sandro ist der Nutzer, der fünf Zeilen in die Postleitzahl schreibt, 70 000 Zeichen in den
Namen kopiert, ein Array schickt, wo ein String erwartet wird, und `'; DROP TABLE` ausprobiert,
um zu sehen, was passiert. Mal aus Versehen, mal mit Absicht. Dieser Skill fragt je Formular
und je Schreib-Endpunkt: **Was macht das System mit Sandro?** Die richtige Antwort ist immer
eine saubere Ablehnung, nie ein Absturz, nie eine stille Speicherung.

Die Fehlerklassen, gegen die er arbeitet:

| Klasse | Typisches Symptom |
|---|---|
| **Absturz** | 500 statt 422 — Typfehler, DB-Fehler (Spalte zu kurz, NUL-Byte), Überlauf |
| **Ungebremste Speicherung** | Feld ohne Obergrenze, Text landet ungeprüft in DB, Log, Mail, Export |
| **Injection** | SQL, XSS, Template, CSV-Formel, Pfad, Header — Eingabe wird Code |
| **Ressourcen-Erschöpfung** | riesiger Body, tiefes JSON, Upload ohne Limit, Flut ohne Rate-Limit |
| **Kaputtes UI** | Layout sprengt, RTL-Override dreht Text, keine verständliche Fehlermeldung |
| **Fremdzugriff** | fremde UUID liefert 200 statt 403 |

## Grundregeln

- **Audit zuerst, read-only.** Ohne ausdrückliche Freigabe entsteht kein Test, kein Fix,
  keine CI-Änderung. Der Skill schreibt nur seinen Bericht (Scratchpad oder vom Nutzer
  genannter Ort). Nach Freigabe gilt der Plan-first-Ablauf des Harness
  ([`harness/SPEC_WORKFLOW.md`](../../harness/SPEC_WORKFLOW.md)).
- **Messen, nicht schätzen.** Jede Aussage trägt Datei:Zeile oder Befehl + beobachteten
  Status. Nicht Gelaufenes steht als `UNBEKANNT: …` da.
- **Nur eigene Systeme, nur lokal oder Staging.** Siehe *Grenzen* unten.
- **Ein Feld falsch, alle anderen gültig** — sonst weiß niemand, welches Feld die Ablehnung
  ausgelöst hat. Das ist die Edge-Case-Matrix des Hauses
  ([`harness/TESTS.md`](../../harness/TESTS.md) → Edge-Case-Matrix), hier um den
  Sandro-Korpus erweitert.
- **Die Grenze ist das Backend.** Frontend-Limits sind Komfort; Sandro schickt den Request
  direkt. Ein Feld gilt erst als dicht, wenn das Backend es ablehnt.
- **Nicht doppeln, verweisen:** Formular-Testlücken je Rolle/Seite → Skill
  `ui-test-gap-audit`; Sicherheitsniveau (ASVS) → Skill `webapp-blueprint`,
  [`references/05-sicherheit.md`](../webapp-blueprint/references/05-sicherheit.md);
  Security-Pass → [`harness/GUARDRAILS.md`](../../harness/GUARDRAILS.md) E.

## Ablauf

### 1. Inventar
- Alle **Schreib-Eingänge** auflisten: Formulare (`<form`, `onSubmit`, `handleSubmit`,
  Form-Libraries) und Routen mit POST/PUT/PATCH/DELETE (Laravel: `php artisan route:list
  --json`), dazu Uploads, Webhooks, Importe, Suchfelder mit Query-Parametern.
- Je Eingang die Felder: Name, erwarteter Typ, fachliche Grenze (PLZ = 5 Ziffern, Name ≤ 100).

### 2. Je Feld drei Grenzen gegeneinanderstellen
| Ebene | Wo nachsehen | Lücke, wenn … |
|---|---|---|
| **Backend-Regel** | FormRequest/`validate()`, DTO, Schema | kein `max`, kein Typ (`string`/`integer`/`array`), Regex ohne `\z` bzw. `D`-Modifier, `array` ohne `max` und ohne Regeln für die Elemente |
| **Frontend** | `maxLength`, `pattern`, `inputMode`, zod `.max()`/`.regex()` | fehlt oder weicht vom Backend ab (dann widersprechen sich Meldungen) |
| **Datenbank** | Migration / Schema | Spalte kürzer als Backend-`max` → DB-Fehler = 500; MySQL ohne Strict Mode schneidet still ab |

Häufigste Einzelfehler: `string` ohne `max`; `max:255` ohne `string` (bei einem Array zählt
Laravel dann Elemente); Regex `/^\d{5}$/` — PCRE-`$` passt auch vor einem abschließenden
`\n`, also geht `"12345\n"` durch (Laravels `TrimStrings` fängt das nur, wo es greift);
JSON-Spalten ohne Größen- oder Tiefengrenze.

### 3. Korpus fahren
- Den [Sandro-Korpus](references/korpus.md) je Feld anwenden, **ein Feld falsch, Rest gültig**,
  deterministisch (fester Seed, keine Zufallsdaten ohne Seed).
- Am Backend direkt (HTTP-Client, Feature-Test) **und** einmal durchs UI: Button **und**
  Enter-Taste — der Tastatur-Submit kann die Button-Validierung umgehen.
- Je Fall festhalten: Befehl/Test, Status, Antwort-Auszug, ob etwas gespeichert wurde.

### 4. Gegen das Soll prüfen
| Kategorie | Soll |
|---|---|
| Übergröße, Typ, Format, Steuerzeichen, Zahl | **422** mit Meldung am betroffenen Feld — **nie 500** |
| alles Abgelehnte | **nichts gespeichert** (DB-Zeile, Datei, Queue-Job, Mail) |
| Injection-Marker, die fachlich erlaubt sind (Freitext) | gespeichert als **Text**, bei Ausgabe **escaped** (HTML, CSV, Mail, PDF, Log) |
| Body/JSON zu groß oder zu tief | **413** bzw. 422, vor dem Parsen in die Anwendung |
| Doppel-Submit / Replay | genau **ein** Effekt (Idempotenz-Schlüssel, Unique-Constraint, Button sperrt) |
| Flut | **429** ab dem konfigurierten Limit |
| fremde UUID | **403** (bzw. 404 nach Projektkonvention) — nie 200 |
| UI | klare Meldung am Feld, Layout hält, kein unescaped HTML, Enter-Pfad = Button-Pfad |

### 5. Urteil und Vorschlag
- **Lücken nach Risiko:** Injection und Fremdzugriff zuerst, dann 500er und ungebremste
  Speicherung, dann Ressourcen, dann UI.
- Je Lücke ein konkreter Fix an der **gemeinsamen** Stelle (Basis-Request, Middleware,
  Schema-Helfer), nicht je Feld — sonst kommt das Loch mit dem nächsten Feld wieder.
- Dazu die passenden Gates (nächster Abschnitt) als Vorschlag.

## Mechanische Gates — empfehlen, nach Freigabe bauen

Ein einzelner Fix hält bis zum nächsten Feld. Dauerhaft halten nur Prüfungen, die jeden
neuen Eingang automatisch mitnehmen:

1. **Architektur-Test „jede String-Regel hat ein `max`"** — liest alle FormRequests/Schemata
   und schlägt an bei `string` ohne `max`/`size`, `array` ohne `max`, Regex ohne `\z`.
   Ausnahmeliste leer starten; ein Eintrag braucht Begründung.
2. **Fuzz-Test über alle Schreib-Routen** — iteriert die Routenliste, schickt je Feld den
   Korpus (deterministisch) und erwartet **nie 500**. Neue Routen sind automatisch drin.
3. **Frontend-Lint** — zod `z.string()` ohne `.max()`, `<input>`/`<textarea>` ohne
   `maxLength` an einem Feld mit Backend-Grenze.
4. **E2E-Matrix je Formular** — Ein-Feld-falsch mit den schärfsten Korpus-Fällen, exakter
   Fehlertext, Enter-Pfad, Happy Path zuletzt.
5. **Rate-Limits als Konfiguration mit Test** — Limit je schreibender Route, ein Test
   erwartet 429.

## Optional: sichtbarer Sandro-Modus (nur außerhalb Produktion)

Für Test- und Staging-Umgebungen kann das System Sandro **erkennbar** abweisen — als
Anreiz beim Testen, nicht als Verteidigung:

- **Backend klassifiziert** nur eindeutigen Missbrauch, keine normalen Tippfehler:
  z. B. Länge > 10 × `max`, Steuerzeichen/NUL, mehrzeilig in einem einzeiligen Feld,
  Injection-Marker in einem Formatfeld (PLZ, Datum, Betrag), falscher Typ (Array statt
  String). Eine zu kurze PLZ ist ein Tippfehler, kein Sandro.
- **422 bleibt 422.** Nur wenn die Umgebung **nicht** Produktion ist, kommt ein Merker
  dazu, z. B. `"sandro": true` (Laravel: `! app()->isProduction()`). Kein Hinweis, welches
  Muster erkannt wurde.
- **Frontend** zeigt dann über i18n (Schlüssel z. B. `errors.sandro`, in **allen**
  Sprachdateien) „Nein, nein, nein, Sandro, so nicht." zusätzlich zur Feldmeldung.
- **Logging in jeder Umgebung**, auch Produktion: eigener Kanal (z. B.
  `Log::channel('security')`), mit Route, Feld, Klasse, Konto/IP-Hash — die Eingabe selbst
  nur gekürzt und escaped (sonst wird das Log zum nächsten Injection- oder Speicherloch).
- **In Produktion verrät die Antwort nichts:** normale 422-Meldung, kein Merker, kein
  abweichender Text, keine abweichende Antwortzeit.

## Grenzen

- **Nur autorisiert, nur eigene Systeme.** Keine Tests gegen Drittsysteme, Zahlungsanbieter,
  Identity-Provider oder fremde APIs — deren Sandbox nur im Rahmen ihrer Nutzungsbedingungen.
- **Kein DoS gegen geteilte oder produktive Infrastruktur.** Flut-, Größen- und
  Upload-Tests nur lokal oder auf Staging, mit Absprache, wenn andere die Umgebung nutzen.
- **Keine echten personenbezogenen Daten** im Korpus oder in Fixtures
  ([`harness/GUARDRAILS.md`](../../harness/GUARDRAILS.md) B).
- **Aufräumen:** was ein Lauf anlegt (Zeilen, Uploads, Logs), wird danach entfernt.

## Ausgabe

- **Kurzantwort zuerst** („sandro-fest: nein — 3 Felder ohne Backend-Grenze, 1 Route mit
  500"), dann je Eingang die Feldtabelle (Backend / Frontend / DB / Korpus-Ergebnis), dann
  die Risikoliste mit Fix- und Gate-Vorschlag.
- Jede Zahl mit Quelle (Befehl + Status oder Datei:Zeile).
