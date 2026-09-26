---
name: webapp-blueprint
description: 'Blueprint einer State-of-the-Art-Web-App als Prüfkatalog und Bauplan: Anforderungen, Architektur & Doku (arc42/ADR), API-Design & -Versionierung, Daten, Sicherheit (ASVS 5.0), Datenschutz & Recht (Pflichtthemen je Rechtsraum, ausgearbeitet für DE/EU), Observability (Metriken, Logs, Traces, Health-Endpunkte, SLOs), Betrieb & Resilienz, Delivery, Tests, UX & Barrierefreiheit, i18n, SEO & Marketing. Use when the user wants an existing web app checked for gaps against current best practice, or wants a new web app planned from scratch — e.g. "prüf unsere App gegen den Blueprint", "was fehlt uns zum State of the Art", "sind wir production-ready", "plan eine neue Web-App", "welche Endpunkte/Metriken/Monitoring brauchen wir", "wie versionieren wir die API", "welche Pflichten haben wir rechtlich". Beschreibt Vorgehen, nicht Tools; stack-neutral mit PHP als Beispiel. Default ist ein Read-only-Audit mit belegter Lückenliste; im Neubau-Modus entsteht ein Plan, Artefakte erst nach Freigabe.'
---

# webapp-blueprint

Ein Katalog dessen, was eine solide Web-App heute ausmacht — formuliert als
**Vorgehensregeln mit Prüffrage und Beleg**, nicht als Werkzeugliste. Derselbe Katalog
dient in zwei Richtungen:

- **Audit:** eine bestehende App Punkt für Punkt prüfen und die Lücken belegt,
  nach Risiko sortiert ausgeben.
- **Neubau:** aus denselben Punkten einen Bauplan in sinnvoller Reihenfolge ableiten
  (erst Fundament, dann Features, dann Go-live-Prüfung).

Jede Regel verweist auf ihre Grundlage (Norm, Standard, Gesetz, Studie) im
[Quellenverzeichnis](references/QUELLEN.md). Wo die Evidenz dünn ist, steht das dort —
der Katalog behauptet keine Wirkung, die niemand gemessen hat.

## Grundregeln

- **Audit zuerst, read-only.** Ohne ausdrückliche Freigabe entsteht keine Datei, kein
  Issue, keine CI- oder Server-Änderung. Entscheidungen des Nutzers einzeln erfragen,
  Empfehlung zuerst.
- **Passiv prüfen, aktiv nur mit Freigabe.** Passiv heißt: Code, Konfiguration, Doku,
  Logs lesen und lesende Requests (`GET`, Header, Health-Endpunkte). Aktiv ist alles, was
  Zustand ändert oder Last erzeugt — schreibende Requests, Konten sperren, Uploads,
  Löschungen, Lasttests, provozierte Fehler. Viele „Prüfen“-Zeilen beschreiben aktive
  Proben; sie laufen nur in einer vom Nutzer freigegebenen Testumgebung, mit
  synthetischen Testdaten und vorab festgelegten Grenzen. Fehlt das, werden vorhandene
  Nachweise (Tests, Protokolle, Berichte) bewertet oder der Punkt bleibt `UNBEKANNT`.
  Nie aktiv gegen Produktion.
- **Vorgehen, nicht Werkzeug.** Ein Punkt ist erfüllt, wenn das Verhalten nachweisbar
  ist — egal mit welchem Tool. Werkzeugnamen im Katalog sind Beispiele.
- **Jede Aussage belegt** — Datei:Zeile, Befehl + Ausgabe, HTTP-Antwort, Konfigwert.
  Was nur ein Lauf in der echten Umgebung belegen kann und nicht gelaufen ist, heißt
  `UNBEKANNT`, nicht „erfüllt“. „Nicht gefunden“ braucht dieselbe Beleghärte wie
  „vorhanden“: am tatsächlichen Ort gesucht, nicht nur ein grep.
- **Passiver Beleg für aktive Prüfungen.** Nennt ein `Prüfen:` eine aktive Probe, zählt
  auch ein passiver Beleg — aber nur, wenn alle betroffenen Stellen enumeriert sind und
  der Code das Verhalten eindeutig festlegt. Sonst `UNBEKANNT` mit dem Vermerk, dass
  eine aktive Probe nötig ist. `nicht geprüft` heißt nur: außerhalb des Umfangs.
- **Grundgesamtheit zuerst.** Aussagen wie „alle Endpunkte paginiert“ setzen eine aus
  dem Code enumerierte Liste voraus (Routen, Controller, Jobs), keine Stichprobe.
  Zähleinheit „Endpunkt“ ist Methode + Pfad-Template. Nennt ein Punkt eine
  Stichprobengröße und gibt es weniger Elemente, werden alle genommen.
- **Fehlender Gegenstand ist `n. a.`** — gibt es das Geprüfte gar nicht (keine
  Retries, keine Uploads), lautet der Status `n. a.` mit Grund „nicht vorhanden“, nicht
  „erfüllt“.
- **Stufe bestimmt Pflicht, nicht Umfang des Berichts.** Punkte über der gewählten
  Stufe bekommen ihren sachlichen Status, werden aber als Empfehlung geführt und nicht
  als Lücke gezählt (Pflicht-Zählung und Gesamt-Zählung getrennt, → AUSGABE.md).
- **Projektregeln gehen vor.** Legt das Projekt (bzw. seine `AGENTS.md`/`CLAUDE.md`)
  eine Variante fest, die der Katalog als eine von mehreren zulässt, gilt die
  Projektvariante; der Audit prüft dann deren konsequente Umsetzung. Ein echter
  Widerspruch zu einem MUST wird benannt, nicht still aufgelöst.
- **Recht ist Prüfpunkt, keine Beratung.** Rechtliche Punkte nennen Norm und
  Anwendungsbedingung; ob sie greifen, entscheidet im Zweifel eine fachkundige Person.
  Stand der Rechtslage: siehe Datum im Quellenverzeichnis.
- **Recht hängt am Rechtsraum.** Welche Normen gelten, bestimmen die Rechtsräume im
  Profil (Abschnitt 1). Bereich 06 gliedert das Recht in **Pflichtthemen**, die in
  vielen Rechtsordnungen wiederkehren, und setzt sie für Deutschland/EU konkret um.
  Für jeden anderen Rechtsraum bleibt das Pflichtthema die Prüffrage; die dort
  geltende Norm wird mit abgerufener Quelle ermittelt. Ist sie nicht belegbar, lautet
  der Status `UNBEKANNT` („Rechtslage <Land> zu <Thema>“) — deutsche oder EU-Normen
  werden nie stellvertretend angewendet, Normen werden nie aus dem Gedächtnis ergänzt.
- **Recht hängt nicht an der Stufe.** Ob ein gesetzlicher Punkt gilt, entscheidet allein
  seine Anwendungsbedingung. Deshalb tragen alle Punkte in Bereich 06 und die
  gesetzlich begründeten Barrierefreiheitspunkte Stufe `B`. Eine gesetzliche Pflicht kann
  nicht als Risiko akzeptiert oder aufgeschoben werden.
- **Pflicht-Herkunft ist erkennbar.** Die Stufe eines Punkts ist eine Einstufung dieses
  Katalogs. Wo sie strenger ist als das Level der zitierten Quelle, steht das am Punkt
  („strenger als ASVS L2“). Hausstandards des ki-agent-setup sind als solche markiert;
  sie gelten als Pflicht in Projekten, die unter den Arbeitsregeln dieses Setups
  entwickelt werden (dessen `AGENTS.md` ist geladen), anderswo als Empfehlung.
- **Hersteller oder Betreiber.** Bei `selbst-gehostet` treffen Betreiberpflichten
  (Impressum, Datenschutzinformation, TLS, Mail-DNS, Meldewege) den Kunden. Geprüft wird
  dann, ob die Software sie ermöglicht und dokumentiert (LAW-22) — Default-Konfiguration
  und Betriebsdoku sind der Beleg; eine konkrete Instanz nur, wenn der Auftrag sie
  nennt.

## 1. Profil festlegen (vor jedem Audit und jedem Plan)

Erst das Profil, dann der Katalog — sonst wird ein internes Tool gegen Bank-Maßstäbe
geprüft oder ein Shop gegen Prototyp-Maßstäbe.

**Stufe** (bestimmt, was Pflicht ist):

| Stufe | Wann | Security-Zielniveau |
|---|---|---|
| **B — Basis** | intern, wenige bekannte Nutzer, keine sensiblen Daten, Ausfall ärgerlich statt teuer | ASVS 5.0 L1 |
| **Ö — Öffentlich** (Default) | aus dem Internet erreichbar, Registrierung oder personenbezogene Daten, Verbraucher als Nutzer | ASVS 5.0 L2 |
| **K — Kritisch** | Zahlungen, besondere Datenkategorien (etwa Gesundheit; EU: Art. 9 DSGVO), vertragliche Verfügbarkeitszusagen, hoher Schaden bei Ausfall/Leck | ASVS 5.0 L3 in den betroffenen Kapiteln |

Die Stufen sind kumulativ: Ö enthält alles aus B, K alles aus Ö. Die Einstufung wird
mit Begründung notiert (arc42 Kap. 1/10 oder ADR). Eingestuft wird das Produkt im
anspruchsvollsten dokumentierten oder beabsichtigten Einsatz, sofern der Auftrag keine
bestimmte Instanz nennt.

**Ohne Rückfrage** (Subagent, CI, anderer Client): Profil aus Repo und Doku ableiten,
als Annahme mit Begründung je Festlegung in den Kopf schreiben (`bestaetigt: false`)
und fortfahren. Der Bericht nennt, welche Punkte sich bei anderem Profil ändern.

**Rechtsräume** (bestimmen, welche Normen gelten): Sitz des Anbieters und jedes Land
oder jeder Wirtschaftsraum, dessen Nutzer die App gezielt anspricht — etwa über
Sprache, Währung, Lieferland oder Werbung. Mehrere Rechtsräume gelten nebeneinander;
wer in die EU verkauft, unterliegt EU-Recht auch mit Sitz außerhalb. Ohne Angabe ist
der Rechtsraum `UNBEKANNT`, und die rechtlichen Punkte werden nicht bewertet.

**Bedingungen** (schalten Punkte zu, unabhängig von der Stufe) — jede mit ja/nein
beantworten; sie beschreiben Sachverhalte, nicht Normen:

| Kürzel | Bedingung |
|---|---|
| `api-extern` | Die API hat Konsumenten außerhalb des eigenen Deploy-Zyklus (Kunden, Partner, mobile Apps) |
| `verbraucher` | Privatpersonen schließen über die App entgeltliche Verträge (Fernabsatz) |
| `abo` | Entgeltliche Verträge mit Laufzeit (Abos) sind über die App abschließbar |
| `zahlungen` | Die App wickelt Zahlungen ab oder bindet einen Zahlungsdienst ein |
| `uploads` | Nutzer laden Dateien hoch — auch nur für sich selbst |
| `nutzerinhalte` | Die App speichert Inhalte im Auftrag von Nutzern (in der EU: Hosting im Sinne des DSA) |
| `plattform` | … und macht sie auf Wunsch der Nutzer öffentlich zugänglich (in der EU: Online-Plattform im Sinne des DSA) |
| `saas` | Kunden nutzen die App als gehosteten Dienst mit eigenem Datenbestand |
| `ki` | KI-System interagiert mit Nutzern oder erzeugt Inhalte |
| `ki-werkzeug` | Die App liefert Kontext oder Werkzeuge an KI-Agenten (etwa als MCP-Server), auch ohne eigenes Modell |
| `clients` | Die App liefert Software aus, die auf Rechnern der Nutzer läuft (Plugins, Hooks, Skripte, Apps) |
| `websocket` | Die App nutzt WebSocket-Verbindungen |
| `graphql` | Die App bietet eine GraphQL-Schnittstelle an |
| `mehrsprachig` | mehr als eine Sprache oder Region |
| `öffentliche-inhalte` | Inhalte sollen über Suchmaschinen gefunden werden |
| `newsletter` | Werbe-E-Mails |
| `mandanten` | mehrere Kunden/Organisationen teilen eine Instanz |
| `selbst-gehostet` | Kunden betreiben die App selbst (Installer, Updates beim Kunden) |

## 2. Der Katalog

Dreizehn Bereiche, je eine Datei. **Nur die Dateien laden, die der Auftrag braucht** —
ein API-Review braucht nicht das SEO-Kapitel.

| Nr | Bereich | Datei |
|---|---|---|
| 01 | Produkt & Anforderungen | [01-anforderungen.md](references/01-anforderungen.md) |
| 02 | Architektur & Dokumentation | [02-architektur-doku.md](references/02-architektur-doku.md) |
| 03 | HTTP-API | [03-api.md](references/03-api.md) |
| 04 | Daten & Persistenz | [04-daten.md](references/04-daten.md) |
| 05 | Sicherheit | [05-sicherheit.md](references/05-sicherheit.md) |
| 06 | Datenschutz & Recht | [06-recht.md](references/06-recht.md) |
| 07 | Observability | [07-observability.md](references/07-observability.md) |
| 08 | Betrieb & Resilienz | [08-betrieb.md](references/08-betrieb.md) |
| 09 | Delivery & Releases | [09-delivery.md](references/09-delivery.md) |
| 10 | Qualität & Tests | [10-tests.md](references/10-tests.md) |
| 11 | Frontend, UX & Barrierefreiheit | [11-ux.md](references/11-ux.md) |
| 12 | Internationalisierung | [12-i18n.md](references/12-i18n.md) |
| 13 | SEO & Marketing | [13-seo-marketing.md](references/13-seo-marketing.md) |
| — | Quellen & Evidenzlage | [QUELLEN.md](references/QUELLEN.md) |
| — | Ausgabeformat (immer beim Berichten) | [AUSGABE.md](references/AUSGABE.md) |

**Form jedes Punkts:**

```
### API-12 · B · F — Jede Collection ist von Anfang an paginiert
Warum …  (1–3 Sätze, mit Quellenkürzel [AIP-158])
Prüfen: … (wo und wie der Beleg gefunden wird)
```

- **ID** — Bereichskürzel + Nummer, stabil; Berichte und Issues verweisen darauf.
- **Stufe** — ab welcher Stufe der Punkt Pflicht ist (`B`, `Ö`, `K`). Ein
  Bedingungskürzel in Klammern (`Ö (verbraucher)`) heißt: Pflicht ab dieser Stufe,
  aber nur, wenn die Bedingung zutrifft; mehrere Kürzel (`Ö (mehrsprachig,
  öffentliche-inhalte)`) müssen alle zutreffen.
- **Phase** — wann der Punkt im Lebenszyklus fällig ist:
  `E` Entwurf (vor der ersten Zeile Code) · `F` Fundament (im ersten lauffähigen
  Durchstich) · `G` Go-live (vor dem ersten echten Nutzer) · `L` Laufend (Betrieb,
  wiederkehrend) · `G/L` erstmals vor Go-live, danach wiederkehrend.
- **Zusammengesetzte Punkte** — nennt ein Titel mehrere Dinge („Rate, Fehlerquote und
  Latenz“), ist er nur `erfüllt`, wenn jedes Teil belegt ist; sonst `teilweise` mit
  Angabe, was fehlt. Eine Stichprobe bleibt im Ergebnis als Stichprobe erkennbar.

## 3. Modus Audit

1. **Profil** nach Abschnitt 1 bestimmen — aus Bestand ableiten (Datenarten, Nutzer,
   Zahlungswege, Verträge), dem Nutzer als Vorschlag vorlegen, bestätigen lassen.
2. **Umfang festlegen**: welche Bereiche geprüft werden, und ob eine freigegebene
   Testumgebung für aktive Proben existiert (Grundregeln). Ein Teil-Audit ist zulässig,
   muss aber im Ergebnis als solcher erkennbar sein.
3. **Grundgesamtheit erheben** (passiv): Routen/Endpunkte, Controller, Jobs/Cronjobs,
   Migrationen, Konfiguration und Umgebungsvariablen, CI-Workflows, Deploy-Strecke,
   Datenspeicher (Datenbank, Objektspeicher, Suchindex, Caches), Fremddienste, vorhandene
   Doku (README, ADRs, arc42, Runbooks), rechtliche Seiten. Zählen und notieren.
4. **Prüfregister führen** — Bereich für Bereich, je Punkt eine Zeile:
   ID · Anwendbarkeit (Stufe/Bedingung zutreffend?) · Prüfart (passiv/aktiv) · Beleg ·
   Status. Status ist einer von:
   `erfüllt` · `teilweise` · `fehlt` · `n. a.` (mit Grund) · `UNBEKANNT` (was es klären
   würde) · `nicht geprüft` (außerhalb des Umfangs). So bleibt für einen späteren Reviewer
   unterscheidbar, was nicht zutrifft und was nicht angeschaut wurde.
5. **Lücken nach Risiko sortieren**: zuerst gesetzliche Pflichten und Sicherheit mit
   akutem Schaden (Datenleck, Abmahnfähiges, Datenverlust), dann Betriebsfähigkeit (kein
   Restore, kein Alarm), dann Nachvollziehbarkeit und Qualität. Mehrere IDs mit
   derselben Ursache sind ein Befund, nicht mehrere (→ AUSGABE.md, Feld `siehe`).
6. **Vorschlag je Lücke**: Maßnahme als Vorgehen, Aufwand grob (S/M/L), Ablageort
   (Issue, Phase, arc42-Kapitel, ADR). Keine Umsetzung ohne Freigabe; Serien über
   drei PRs brauchen Zwischenfreigabe.

## 4. Modus Neubau

Der Neubau-Modus **plant**; gebaut wird in einem eigenen, späteren Auftrag.

1. **Profil** festlegen (Abschnitt 1) und **Anforderungen** nach Bereich 01 erheben —
   Ziele, Stakeholder, Qualitätsszenarien mit Zielwert, Randbedingungen inkl. Recht.
2. **Entscheidungen der Phase `E`** vorbereiten, je Entscheidung ein ADR-Entwurf mit
   Optionen und Empfehlung: Architekturstil, Mandantenmodell, API-Versionierungsschema,
   Auth-Verfahren, Datenhaltung, Zeit/Geld-Repräsentation, Sprachen, Hosting/Deploy-Ziel,
   Verarbeitungen mit Rechtsgrundlage (LAW-21). Der Nutzer entscheidet.
3. **Fundament (`F`) als erstes Arbeitspaket planen**, vor allen Fachfeatures: ein
   Endpunkt durch alle Schichten mit CI-Gate, Konfiguration aus der Umgebung,
   Migrationen, strukturiertem Log mit Korrelations-ID, Health-Endpunkten, Fehlerformat,
   Sicherheits-Headern, Deploy und Rollback in eine echte Umgebung. Je Paket: Ziel,
   Abhängigkeiten, Abnahmekriterium, vorgesehener Nachweis. Diese Punkte später
   nachzurüsten kostet ein Vielfaches, weil danach jede Stelle betroffen ist.
4. **Feature-Pakete** nach der Methode des Projekts (Spec → Test → Code → Gate).
5. **Go-live-Prüfung (`G`) einplanen** — der Audit-Modus auf den Stand vor dem ersten
   echten Nutzer. Offene Pflichtpunkte der Stufe blockieren den Go-live oder werden als
   bewusstes, befristetes Risiko mit Eigentümer festgehalten — **außer gesetzliche
   Pflichten**: die blockieren immer.
6. **Laufende Punkte (`L`, `G/L`)** als wiederkehrende Termine oder Jobs planen
   (Restore-Test, Update-Fristen, Zertifikate, `security.txt`-Ablauf, Rechtstexte).

Ergebnis ist ein **Plan**: Profil, ADR-Entwürfe, arc42-Gerüst mit befüllten Kapiteln
1–4, Arbeitspakete nach Phase mit Abnahmekriterien. Dateien erst nach Freigabe.

## Ausgabe

Format ist verbindlich und steht in [AUSGABE.md](references/AUSGABE.md) — **vor dem
Schreiben des Ergebnisses immer laden**, in beiden Modi. Kurz:

- YAML-Kopf mit Profil, Umfang und Zählung; feste Überschriften in fester Reihenfolge.
- Prüfregister als JSON Lines, ein Objekt je Punkt, mit festen Werten für Status,
  Stufe, Phase und Prüfart; es ist die maßgebliche Quelle, der Text verweist per ID.
- Lücken nach Risiko, Offen/UNBEKANNT, Empfehlungen oberhalb der Stufe (nicht als
  Lücke gezählt), Befunde außerhalb des Katalogs.
- Keine Methoden-Erklärung, außer der Nutzer fragt danach.

## Abgrenzung und Vertiefung

Der Blueprint ist eigenständig nutzbar — auch in anderen Clients ohne die folgenden
Skills. Wo sie verfügbar sind, übernehmen sie die Tiefe:

- Anforderungs-Erhebung, arc42-Umbau, DDD, QS-Gate-Katalog der CI → Skill `analyse-qs`
- UI-Testlücken je Rolle/Seite/Formular → Skill `ui-test-gap-audit`
- Design-Quelle (`DESIGN.md`) → Skill `design-md-curator`
- Barrierefreiheits-, Performance- und SEO-Einzelaudits → Skills `accessibility`,
  `performance`, `web-quality-audit`, `seo-audit`
- PHP-spezifische Sicherheitsmuster → Skill `php-security-patterns`
- Umgebungs-Vertrag vor einem Deploy → Command `/hx:env` (ki-agent-setup-Harness)

Was dieser Skill **nicht** tut: Tests oder Features schreiben, Server konfigurieren,
Rechtstexte verfassen, Penetrationstests fahren, Werkzeuge auswählen, ohne dass der
Nutzer danach fragt.
