# 03 — HTTP-API

Die HTTP-Grundregeln (Fehlerformat, Statuscodes, Content-Type, Zugriff, Limits) gelten
für **jeden** Endpunkt, auch für den, den nur das eigene Frontend nutzt. Die Punkte zur
Vertragsevolution mit Bedingung `api-extern` greifen erst, wenn Clients außerhalb des
eigenen Deploys die Schnittstelle nutzen. Quellenkürzel → [QUELLEN.md](QUELLEN.md).

## Vertrag und Evolution

### API-01 · B · E — Die API ist ein Vertrag mit einer Quelle der Wahrheit
Ein versioniertes Vertragsdokument (Endpunkte, Felder, Statuscodes, Fehlercodes,
Header, Limits) wird vor der Implementierung festgelegt und reviewt; der Code wird
dagegen geprüft, nicht umgekehrt [ZALANDO #100]. Das Format ist zweitrangig — ein
maschinenlesbares Schema (z. B. OpenAPI) ist bequem, aber nur Träger.
Prüfen: Gibt es das Dokument im Repo? Bricht die Pipeline, wenn Implementierung und
Vertrag auseinanderlaufen? Oder wird Doku aus dem Code erzeugt und nie gegengeprüft?

### API-02 · B · E — Was „breaking“ ist, steht schriftlich fest
Breaking sind mindestens: Feld/Operation entfernen oder umbenennen, Pflichtfeld oder
-parameter hinzufügen, Typ, Format oder Default ändern, Auth-Anforderung verschärfen,
Pagination nachträglich einführen, stabilen Fehlercode ändern [AIP-180] [ZALANDO
#106]. Additiv und damit erlaubt: neue Endpunkte, optionale Parameter, neue
Antwortfelder. Neue Enum-Werte in Antworten nur, wenn Clients unbekannte Werte
tolerieren.
Prüfen: Liste im Repo oder in der Doku; ein Beispiel aus der Historie, bei dem sie
angewendet wurde.

### API-03 · B · E — Evolution ist additiv, Clients lesen tolerant
Die Regel lautet „nicht brechen“, nicht „oft versionieren“ [ZALANDO #106, #113].
Eigene Clients ignorieren unbekannte Felder, Enum-Werte und Header. Eine neue
Vertragsversion gemäß dem gewählten Versionsschema (→ API-04) entsteht nur, wenn ein
Breaking Change unvermeidbar ist. Breaking ist auch, was die Form nicht ändert:
geänderte Defaults, Validierung, Sortierung oder Autorisierung.
Prüfen: Deserialisierung der eigenen Clients (strict vs. tolerant); Zahl der
Major-Versionen im Verhältnis zur Zahl der Breaking Changes in der Historie.

### API-04 · Ö (api-extern) · E — Ein Versionierungsschema ist gewählt und begründet
In der Praxis existieren über 50 Formate für Versionskennungen; semantische
Versionsnummern dominieren [SERBOUT24]. Verbreitete Varianten, alle mit Primärquelle: Major-Version im Pfad (`/v1`) [AIP-185],
Media-Type-Versionierung [ZALANDO #114, #115 — Zalando lehnt Pfadversionen ab],
Datums-Version per Query-Parameter [MS-API] oder Header [GH-V], datierte Versionen mit
Pinning pro Konto [STRIPE-V]. Welche gilt, ist eine Projektentscheidung (ADR). Gibt
das Projekt eine Hausregel vor (etwa „`/api/v1/...`“), gilt sie, und der Audit prüft
ihre konsequente Anwendung.
Prüfen: ADR vorhanden? Alle Routen folgen demselben Schema? Default-Verhalten ohne
Versionsangabe definiert?

### API-05 · Ö (api-extern) · F — Breaking Changes werden automatisch erkannt
Jede Vertragsänderung wird in der CI gegen die veröffentlichte Version verglichen;
ein Breaking Change ohne neue Vertragsversion gemäß gewähltem Schema bricht den Build.
Semantische Änderungen (Defaults, Autorisierung), die kein Diff-Werkzeug sieht, gehören
in die Review-Checkliste.
Breaking Changes entstehen empirisch vor allem beim Hinzufügen von Funktionen und beim
Vereinfachen, selten absichtlich [BRITO18].
Prüfen: CI-Schritt, der alte und neue Vertragsfassung diffed; ein roter Lauf aus der
Historie als Beleg, dass er greift.

### API-06 · Ö (api-extern) · L — Abschalten ist ein Prozess mit Frist
Ankündigen (Changelog + maschinenlesbar per `Deprecation`-Header [RFC9745] und
`Sunset`-Header [RFC8594], Sunset nicht vor Deprecation), Nutzung pro Client messen,
Frist einhalten, erst dann abschalten und danach einen definierten Status liefern
(z. B. `410 Gone`) [ZALANDO #185–#189]. Vergleichswerte: GitHub unterstützt eine
Vorversion mindestens 24 Monate [GH-V]. Anders als bei Bibliotheken können Clients einer
Web-API die alte Version nicht einfach weiter benutzen [LI13]; Clients brechen vor allem
an abgeschalteten Altversionen und fehlender Kommunikation [SOHAN15].
Prüfen: Header auf deprecated Endpunkten; Nutzungsmetrik je Client; dokumentierte
Mindestfrist.

### API-07 · Ö (api-extern) · L — Changelog pro Version mit Kennzeichnung „breaking“
Der Changelog gehört zum Vertrag: jede Änderung als additiv, deprecated oder breaking
markiert, mit Datum und Migrationshinweis.
Prüfen: Changelog-Datei oder -Seite; letzter Eintrag passt zum letzten Release.

### API-08 · Ö (api-extern) · G — Konsumenten-Erwartungen sind beim Provider getestet
Bei mehreren bekannten Konsumenten halten diese fest, welche Teile sie nutzen; der
Provider testet dagegen und sieht vor dem Release, wen eine Änderung bricht
(Consumer-Driven Contracts [CDC]).
Prüfen: Contract-Tests im Provider-Build, oder begründet `n. a.` bei nur einem
Konsumenten.

## Form der Antworten

### API-09 · B · F — Ein Fehlerformat für die ganze API
Alle Fehler — auch 404, 405, 415, 5xx und Fehler aus Middleware/Framework — kommen im
selben maschinenlesbaren Format, empfohlen Problem Details [RFC9457]
(`application/problem+json`). Jeder Fehlerfall hat einen **stabilen, dokumentierten
Code**; der Meldungstext ist kein Vertrag [AIP-193] [MS-API]. Validierungsfehler
nennen das betroffene Feld.
Prüfen: je einen Request provozieren für 400, 401, 403, 404, 405, 415, 422, 429, 500
und die Antworten vergleichen.

### API-10 · B · F — Fehlerantworten verraten keine Interna
Keine Stacktraces, SQL-Fragmente, Klassennamen, Pfade oder Versionsnummern in
Produktionsantworten [RFC9457 §5] [OWASP-REST].
Prüfen: provozierter 500er in einer produktionsnahen Umgebung; Debug-Flag der
Produktionskonfiguration.

### API-11 · B · E — Einheitliche Benennung und Ressourcenschnitt
Ein Naming-Schema für Pfade, Felder und Query-Parameter, durchgehend angewendet
[ZALANDO #118, #129, #130]. Ressourcen sind fachliche Substantive, keine
Verben-Endpunkte für CRUD.
Prüfen: Routenliste gegen das Schema; Ausreißer zählen.

### API-12 · B · F — Jede Collection ist von Anfang an paginiert
Nachträgliche Pagination ist ein Breaking Change [AIP-158]. Cursor/opaker Token statt
Offset bei großen oder sich ändernden Mengen [ZALANDO #160]; der Token gilt nur mit
denselben Filtern und ist keine Autorisierung; zu große Seitengrößen werden auf das
Maximum gekappt.
Prüfen: alle Listen-Endpunkte aus der Routenliste; je Endpunkt Limit und
Default-Seitengröße.

### API-13 · Ö · F — Filter und Sortierung sind definiert
Unbekannte Filter- oder Sortierfelder führen zu einem Fehler statt stillschweigend zu
nichts [MS-API].
Prüfen: Request mit unbekanntem Filterfeld; Antwort beobachten.

### API-26 · Ö · F — Teilantworten haben einen dokumentierten Default
Wo Clients Felder auswählen können (Feldmaske oder Views), ist dokumentiert, was ohne
Auswahl zurückkommt [AIP-157].
Prüfen: Request ohne Feldauswahl gegen die Dokumentation.

### API-14 · Ö · E — Bulk-Operationen haben definierte Semantik
Synchron: atomar. Teilerfolge nur asynchron mit Ergebnis je Element und
dokumentierter Maximalgröße [AIP-233].
Prüfen: Doku und Implementierung der Bulk-Endpunkte; Verhalten bei einem fehlerhaften
Element.

## Verlässlichkeit

### API-15 · Ö · F — Wiederholte Requests erzeugen keine Duplikate
`PUT`/`DELETE` sind idempotent [RFC9110 §9.2.2]. Erzeugende `POST`-Operationen mit
Außenwirkung (Bestellung, Zahlung, Versand) akzeptieren einen Idempotenz-Schlüssel:
Duplikat → gespeicherte Erstantwort; gleicher Schlüssel mit anderem Inhalt → Fehler;
Aufbewahrungsdauer dokumentiert [AIP-155] [IDEM-D — Entwurf, kein Standard].
Prüfen: Create-Request zweimal mit demselben Schlüssel senden; Datenbank zählen.

### API-16 · Ö · F — Parallele Änderungen gehen nicht verloren
Optimistisches Locking über `ETag` + `If-Match`; Abweichung → `412`; wer `If-Match`
verlangt und es fehlt → `428` [RFC9110] [RFC6585].
Prüfen: zwei Updates mit demselben Ausgangs-ETag; der zweite muss scheitern.

### API-17 · Ö · F — Rate-Limits pro Client, mit `429` und `Retry-After`
Limits je Client/Token, enger auf missbrauchsanfälligen Abläufen — Anmeldung,
Registrierung, Passwort-Reset, Suche, Versand von E-Mails/SMS und teure Aktionen; Überschreitung
→ `429` mit `Retry-After` und Fehlerkörper [RFC6585] [ZALANDO #153]. Quoten sind
dokumentiert; Header zur Vorab-Information sind möglich, aber noch Entwurf
[RATELIMIT-D].
Prüfen: Liste der missbrauchsanfälligen Abläufe mit ihrem Limit; in freigegebener
Testumgebung einen davon bis zum Limit belasten; Antwort und Header prüfen.

### API-18 · Ö · F — Lange Operationen blockieren den Request nicht
`202 Accepted` + Status-Ressource mit definierten Zuständen und Ergebnis/Fehler; die
Status-Ressource bleibt nach Abschluss eine dokumentierte Zeit erhalten [AIP-151]
[MS-API].
Prüfen: Endpunkte mit Laufzeit über wenigen Sekunden aus Logs/Metriken; deren Muster.

### API-19 · Ö · F — Webhooks sind signiert, deduplizierbar und wiederholbar
Ausgehend: Signatur (z. B. HMAC) über Inhalt + Zeitstempel, eindeutige
Nachrichten-ID, Retries mit Backoff, erneute Zustellung möglich. Eingehend: Signatur
und Zeitstempel prüfen, Duplikate über die ID erkennen, Verarbeitung idempotent
[STDWEBHOOKS — Community-Spezifikation].
Prüfen: Webhook-Empfänger mit gefälschter Signatur und mit doppelter ID aufrufen.

### API-20 · B · F — Jede Antwort hat eine bewusste Cache-Angabe
Personenbezogene Antworten `no-store` oder `private`; öffentliche, lesende Ressourcen
`max-age` + `ETag` für `304` [RFC9111] [OWASP-REST].
Prüfen: Header einer authentifizierten Antwort und einer öffentlichen Antwort.

### API-21 · B · F — Content-Type wird geprüft, nicht geraten
Unerwarteter `Content-Type` → `415` [OWASP-REST]. Bei nicht erfüllbarem `Accept`
erlaubt RFC 9110 § 12.4.1 auch, den Header zu ignorieren; `406` ist eine bewusste
Konvention, die das Projekt festlegt und einheitlich anwendet [RFC9110].
Prüfen: Request mit falschem `Content-Type`.

## Zugriff

### API-22 · B · F — Tokens nie in URLs
Keine Tokens oder API-Schlüssel in Query-Strings — sie landen in Logs, Referrern und
Browser-Verlauf [RFC9700] [ASVS5 V14.2.1].
Prüfen: Routen und Clients auf `token=`, `key=`, `api_key=`; Access-Logs.

### API-23 · Ö · E — Zugriffstokens sind kurzlebig, gebunden und widerrufbar
Authorization-Code-Flow mit PKCE, kein Implicit- und kein Passwort-Grant; exakter
Vergleich der Redirect-URIs; kurzlebige Access-Tokens mit Zielgruppe; Refresh-Tokens
öffentlicher Clients rotiert oder gebunden [RFC9700]. Statische Dauerschlüssel nur
für Maschinenkonten, mit Scope und Ablauf.
Prüfen: Token-Lebensdauer in der Konfiguration; Widerruf eines Tokens und sofortiger
Folge-Request.

### API-24 · B · F — Jeder Endpunkt prüft Scope und Objektberechtigung
„Eingeloggt“ reicht nicht; die Prüfung erfolgt serverseitig je Objekt → Punkt SEC-10.
Prüfen: siehe SEC-10.

### API-25 · Ö · F — CORS ist eine explizite Allowlist
Keine Wildcard mit Credentials, kein ungeprüftes Zurückspiegeln des `Origin`; wer
kein Cross-Origin braucht, sendet keine CORS-Header [OWASP-REST].
Prüfen: Preflight mit fremdem Origin; Antwort-Header.
