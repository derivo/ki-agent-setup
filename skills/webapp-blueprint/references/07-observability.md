# 07 — Observability

Ziel: Man erfährt vom Problem vor den Nutzern und findet die Ursache, ohne neu zu
deployen. Drei Signale — Metriken, Logs, Traces — plus Health-Endpunkte und SLOs.
Quellenkürzel → [QUELLEN.md](QUELLEN.md).

## Metriken

### OBS-01 · B · F — Jede Route hat Rate, Fehlerquote und Latenzverteilung
Nach RED (Rate, Errors, Duration) [RED] bzw. den vier Golden Signals (Latency,
Traffic, Errors, Saturation) [SRE-MON]. Latenz als Verteilung (Histogramm,
Perzentile), nicht als Mittelwert; Latenz erfolgreicher und fehlgeschlagener Requests
getrennt [SRE-MON].
Prüfen: Routenliste gegen die Label-Werte der Request-Metrik — fehlt eine Route?
Dann eine Route stichprobenartig auswählen und alle drei Werte finden.

### OBS-02 · Ö · F — Sättigung der Ressourcen wird gemessen
Nach USE (Utilization, Saturation, Errors) je Ressource: Worker-/Prozess-Pool,
DB-Verbindungen, Queue-Länge, Speicher, Platte [USE].
Prüfen: Metriken für Pool-Auslastung und Queue-Länge vorhanden?

### OBS-03 · B · F — Metrik-Labels haben begrenzte Kardinalität
Routen-Template statt Roh-URL; keine Nutzer-IDs, E-Mails, Session-IDs als Label
[PROM-NAMING].
Prüfen: Label-Werte der Request-Metrik stichprobenartig; Zahl der Zeitreihen.

### OBS-04 · Ö · F — Mindestens eine Fachmetrik je Kern-Use-Case
Registrierungen, Bestellungen, Zahlungen o. Ä. als eigene Signale — technische
Metriken sind grün, während das Geschäft steht.
Prüfen: Liste der Kern-Use-Cases (aus 01) gegen die Metrikliste.

### OBS-05 · B · F — Metrik- und Diagnose-Endpunkte sind nicht öffentlich
`/metrics`, Profiler, Debug- und Statusdetails nur aus dem internen Netz, per
Allowlist oder mit Authentifizierung [PROM-SEC].
Prüfen: Aufruf von außen.

## Logs

### OBS-06 · B · F — Logs sind strukturiert und korreliert
Feste Feldnamen (z. B. JSON), jede Zeile mit Request-/Trace-ID; ein Request ist über
alle Komponenten verfolgbar [OWASP-LOG]. Logs gehen als Ereignisstrom nach außen, die
App verwaltet keine Logdateien [12F XI].
Request-übergreifende Kennungen von Anfang an sind die Grundlage jedes späteren Tracings
[DAPPER].
Prüfen: Eine Request-ID aus einer Antwort nehmen und alle zugehörigen Zeilen finden.

### OBS-07 · B · F — Keine Geheimnisse und keine unnötigen Personendaten im Log
Keine Passwörter, Tokens, Cookies, `Authorization`-Header, Zahlungsdaten; Personendaten
nur mit Zweck und Frist; Eingaben gegen Log-Injection bereinigt [OWASP-LOG].
Prüfen: Suche in Produktionslogs nach `password`, `token`, `Authorization`, `Cookie`,
IBAN- und E-Mail-Mustern.

### OBS-08 · B · F — Log-Level sind definiert und in Produktion diszipliniert
Einheitliche Bedeutung je Level; kein `DEBUG` in Produktion ohne Befristung.
Prüfen: Level-Konfiguration je Umgebung.

### OBS-09 · Ö · F — Audit-Log getrennt vom Diagnose-Log
Sicherheits- und Nachweisereignisse (Anmeldung, Rechteänderung, Admin-Aktionen,
Datenexport, Löschung) in einem eigenen, zugriffsbeschränkten, manipulationsgeschützten
Protokoll mit eigener Aufbewahrungsfrist [OWASP-LOG] → SEC-27.
Prüfen: Admin-Aktion ausführen; wo landet sie, und wer kann den Eintrag ändern?

## Traces

### OBS-10 · Ö · F — Trace-Kontext wird durchgereicht
Eingehend übernommen, ausgehend weitergegeben — an HTTP-Aufrufe, Queue-Nachrichten und
Hintergrundjobs — nach W3C Trace Context [W3C-TC] (Standard-Propagator in
OpenTelemetry [OTEL-PROP]). Trace- und Span-ID stehen auch im Log. Bei Nachrichten und
Jobs ist der Verarbeitungs-Span per Span Link mit dem Erzeugungskontext verbunden
(Standardweg, auch bei Stapeln) oder — nur bei Einzelnachrichten — dessen Kind
[OTEL-MSG].
Prüfen: Ein Request, der einen Job auslöst — ist der Job über Parent-Beziehung oder
Link vom auslösenden Trace aus erreichbar?

### OBS-11 · Ö · F — Attribute folgen den semantischen Konventionen
Stabile HTTP-Attribute (`http.request.method`, `http.response.status_code`,
`http.route`, `url.path` …) statt eigener Namen; die verwendete Konventionsversion ist
bekannt [OTEL-SEMCONV]. Keine sensiblen Daten in weitergereichtem Kontext (Baggage).
Prüfen: Attribute eines Server-Spans; Version der Instrumentierung.

## Gesundheit

### OBS-12 · B · F — Liveness und Readiness sind getrennt
**Liveness** prüft nur den eigenen Prozess und hängt nie an Datenbank oder Fremddiensten
— sonst startet ein DB-Ausfall die ganze Flotte in Schleife neu. **Readiness** darf
Abhängigkeiten prüfen und nimmt die Instanz nur aus dem Verkehr [K8S-PROBES]
[SRE-CASCADE]. Bei langsamem Start zusätzlich ein Startup-Check.
Prüfen: Welche Prüfungen hängen an welchem Endpunkt, und wofür nutzt die Plattform ihn?

### OBS-13 · B · F — Health-Endpunkte sind billig und schweigsam
Keine teuren Abfragen, keine Aktionen, öffentlich keine Versions- oder Konfigurationsdetails;
Detail je Abhängigkeit nur intern. Reale Projekte zeigen die Spanne von „lebt“ bis
„DB, Cache, Session einzeln mit Statuscode“; ein standardisiertes Antwortformat gibt es
nicht (der IETF-Entwurf ist abgelaufen) [HEALTH-D].
Prüfen: Antwortzeit und Inhalt des öffentlichen Health-Endpunkts.

### OBS-14 · Ö (selbst-gehostet) · F — Wartungs- und Upgrade-Zustand ist abfragbar
Wartungsmodus, ausstehende Migration und laufende Version sind maschinenlesbar
erkennbar, damit Automatisierung und Betreiber nicht raten.
Prüfen: Status-Endpunkt während eines Updates.

## Ziele und Alarme

### OBS-15 · Ö · G — SLOs je nutzerrelevantem Ablauf, mit Error-Budget-Regel
SLI als Verhältnis guter zu allen Ereignissen; Zielwert aus der Ist-Leistung abgeleitet
und abgestimmt; schriftlich, was bei aufgebrauchtem Budget passiert (z. B.
Feature-Stopp zugunsten Stabilität) [SRE-SLO].
Prüfen: SLO-Dokument; Budget-Stand der letzten Periode.

### OBS-16 · Ö · G — Alarme auf Symptome, nicht auf Ursachen
Pagen nur bei nutzersichtbaren, handlungsrelevanten Symptomen (Fehlerquote,
Latenz-SLO) — empfohlen über mehrere Burn-Rate-Fenster; Ursachen wie „CPU > 80 %“ sind
Dashboard, nicht Alarm [SRE-ALERT]. Die Zustellung richtet sich nach Dringlichkeit:
sofort (Page) nur, wenn jetzt gehandelt werden muss, sonst Ticket. Vorausschauende
Alarme sind eine eigene Klasse mit Vorlauf: Kapazität läuft voll, Zertifikat läuft ab,
Backup fehlt oder ist veraltet.
Prüfen: Alarmregeln mit Dringlichkeit; vorausschauende Alarme für Kapazität,
Zertifikat und Backup vorhanden; Anteil der Pages der letzten Periode, auf die eine
Handlung folgte.

### OBS-17 · Ö · G — Jeder Alarm hat ein Runbook und einen Eigentümer
Runbook verlinkt im Alarm; Eigentümer und Eskalation benannt; Last pro Bereitschaft im
Blick (Referenz: höchstens zwei Vorfälle pro 12-Stunden-Schicht) [SRE-ONCALL]. Unklare
Zuständigkeit ist messbar teuer: Neuzuweisungen verlängerten die Triage in einer
Studie über 20 Online-Dienste bis auf das Zehnfache [CHEN19].
Prüfen: drei Alarme stichprobenartig — Runbook vorhanden und aktuell?

### OBS-18 · B · G — Fehler aus dem Frontend kommen an
Unbehandelte Browser-Fehler und fehlgeschlagene API-Aufrufe werden erfasst, datensparsam
und mit Einwilligung, wo sie nötig ist (→ LAW-05).
Prüfen: absichtlich einen JS-Fehler auslösen; wird er erfasst?

### OBS-19 · Ö · L — Die Telemetrie selbst wird geprüft
Ein Alarm, der nie ausgelöst wurde, ist unbelegt: Alarmwege testen, fehlende Daten
(„kein Signal“) selbst alarmieren.
Prüfen: letzter Testalarm; Verhalten, wenn der Metrikfluss abreißt.
