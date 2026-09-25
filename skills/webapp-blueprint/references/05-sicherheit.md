# 05 — Sicherheit

Dieser Bereich formuliert Sicherheit **nicht** neu aus, sondern verankert die
Vorgehensweise und bildet auf den OWASP Application Security Verification Standard
5.0 ab [ASVS5]. ASVS-IDs (z. B. `V8.2.2`) sind die prüfbare Tiefe; die Punkte hier sind
die Stellen, an denen reale Projekte am häufigsten Lücken haben. Quellenkürzel →
[QUELLEN.md](QUELLEN.md).

## Rahmen

### SEC-01 · B · E — Zielniveau ist gewählt, begründet und kapitelweise zugeschnitten
Stufe B → ASVS L1, Ö → L2, K → L3 in den betroffenen Kapiteln. ASVS selbst empfiehlt
L2 für die meisten Anwendungen; die Level sind kumulativ. Kapitel, die nicht zutreffen
(z. B. V17 WebRTC), werden mit Grund ausgeschlossen. Die OWASP Top 10 sind ein
Sensibilisierungsdokument, kein Prüfstandard [OWASP-T10-2025]. Wo ein Punkt dieses
Bereichs eine ASVS-Anforderung auf niedrigerer Stufe verlangt, als ASVS sie einordnet,
steht „strenger als ASVS Lx“ am Punkt — das ist eine bewusste Festlegung des Katalogs.
Prüfen: Festlegung in arc42 Kap. 10 oder ADR; Nachweis je Anforderungs-ID.

### SEC-02 · Ö · E — Bedrohungsmodell vor dem Bau, fortgeschrieben bei Änderungen
Vier Fragen: Woran arbeiten wir? Was kann schiefgehen? Was tun wir dagegen? Haben wir
es gut gemacht? — früh im Entwurf, erneut bei neuen Features, Vorfällen,
Architekturänderungen [OWASP-TM]. Die Evidenz zur Wirksamkeit einzelner Methoden ist
dünn (→ QUELLEN, Evidenzlage); der Wert liegt im systematischen Durchgehen der
Vertrauensgrenzen.
Prüfen: Dokument mit Datum jünger als die letzte Architekturänderung.

## Identität und Sitzung

### SEC-03 · B · F — Passwortregeln nach aktuellem Stand
Länge statt Zusammensetzungsregeln: mindestens 15 Zeichen, wenn das Passwort der
einzige Faktor ist, 8 als Teil von MFA; mindestens 64 Zeichen erlaubt; Abgleich gegen
Liste bekannter/kompromittierter Passwörter; kein erzwungener periodischer Wechsel;
keine Sicherheitsfragen; Einfügen und Passwortmanager erlaubt [NIST-63B-4]
[ASVS5 V6.2]. Erzwungene Wechsel schaden: Folgepasswörter ließen sich in einer Studie
oft in Sekunden aus dem Vorgänger ableiten [ZHANG10]. Speicherung mit einem langsamen, gesalzenen Passwort-Hash
[NIST-63B-4 §3.1.1.2].
Prüfen: Validierungsregeln im Code; Hash-Verfahren und Kostenparameter.

### SEC-04 · Ö · F — Eine phishing-resistente Anmeldung wird angeboten
Passkeys/WebAuthn oder vergleichbar; mindestens TOTP als zweiter Faktor für
privilegierte Konten [NIST-63B-4 §2.2]. Bei K: MFA Pflicht für alle Konten mit
Zugriff auf sensible Daten.
Prüfen: Anmeldeoptionen im UI und in der Konfiguration.

### SEC-05 · B · F — Anmeldung und Passwort-Reset verraten keine Konten
Gleiche Meldung, gleicher Statuscode, vergleichbare Antwortzeit für „unbekannt“ und
„falsch“ — auch bei Registrierung und „Passwort vergessen“ [ASVS5 V6.3.8] (strenger
als ASVS L3: Kontenaufzählung ist bei öffentlichen Apps billig und häufig).
Prüfen: beide Fälle ausführen und Text, Status, Zeit vergleichen.

### SEC-06 · B · F — Anmeldeversuche sind begrenzt
Rate-Limit je Konto und je Quelle gegen Credential Stuffing und Brute Force,
dokumentiert [ASVS5 V6.1.1, V6.3.1].
Prüfen: Serie falscher Versuche; ab wann greift die Bremse, und wie?

### SEC-07 · B · F — Sitzungen entstehen neu und enden wirklich
Neues Session-Token nach Anmeldung [V7.2.4]; Abmeldung invalidiert serverseitig
[V7.4.1]; Sperren oder Löschen eines Kontos beendet **alle** seine Sitzungen und
Tokens sofort [V7.4.2]; nach Faktorwechsel wird angeboten, andere Sitzungen zu
beenden [V7.4.3] (strenger als ASVS L2).
Prüfen: Konto sperren, während eine Sitzung offen ist; nächster Request mit der alten
Sitzung muss scheitern.

### SEC-08 · Ö · F — Sitzungsdauer ist begrenzt und sichtbar
Absolute und Inaktivitäts-Grenze festgelegt (Referenz AAL2: 24 h / 1 h)
[NIST-63B-4]; Nutzer sehen aktive Sitzungen und können sie beenden [V7.5.2].
Prüfen: Konfiguration; Sitzungsübersicht im Konto.

### SEC-09 · B · F — Session-Cookies sind gehärtet
`Secure`, `HttpOnly`, passendes `SameSite`, Präfix `__Host-` (sonst `__Secure-`)
[ASVS5 V3.3] (Präfix: strenger als ASVS L2).
Prüfen: `Set-Cookie`-Header nach Anmeldung.

## Autorisierung

### SEC-10 · B · F — Standardmäßig verboten, geprüft je Funktion, Objekt und Feld
Serverseitig in einer zentralen Schicht [V8.3.1]: Funktion [V8.2.1], Objekt — der
häufigste API-Fehler (BOLA/IDOR) [V8.2.2] [OWASP-API-2023 API1] — und Feld
[V8.2.3]. Admin-Funktionen getrennt geprüft. Grundlage ist eine Matrix aus Rolle,
Aktion und Feld — geschrieben, bevor die Prüfungen implementiert werden.
Prüfen: Matrix vorhanden; je Endpunkt mit Objekt-ID ein Test „Konto A greift auf
Objekt von Konto B zu“ → `403`/`404`; je Rolle ein Test gegen eine verbotene Aktion und
ein verbotenes Feld. Die Endpunktliste kommt aus der Routenliste, nicht aus der
Erinnerung.

### SEC-11 · Ö (mandanten) · E — Mandantentrennung ist zentral erzwungen
Der Mandantenkontext wird serverseitig aus der Sitzung abgeleitet und gegen die
Berechtigung geprüft, nie aus dem Request übernommen; der Filter wird an einer Stelle
erzwungen (Query-Scope, Row-Level-Security o. Ä.), nicht in jeder Query einzeln. Das
gilt für alle Datenwege: Datenbank, Caches (Schlüssel enthalten den Mandanten),
Dateiablage, Suchindex, Hintergrundjobs (Kontext wird mitgegeben und neu geprüft),
Exporte.
Prüfen: Suche nach Queries ohne Mandantenfilter; Test mit zwei Mandanten über jeden
dieser Datenwege.

### SEC-12 · B · F — Besitzwechsel wird gegen den Zielzustand autorisiert
Eine Operation, die Besitzer oder Mandant eines Datensatzes ändert, prüft das Recht am
beanspruchten Zielzustand, nicht nur am Ist-Zustand.
Prüfen: Endpunkte, die `owner`/`tenant`/`user_id` schreiben.

## Eingabe, Ausgabe, Dateien

### SEC-13 · B · F — Eingaben werden an der Vertrauensgrenze validiert
Gegen erlaubte Werte (Allowlist), einschließlich Geschäftsregeln [ASVS5 V2].
Prüfen: Validierung je Einstiegspunkt; Endpunkte, die Rohdaten durchreichen.

### SEC-14 · B · F — Ausgabe kontextgerecht kodiert, Queries parametrisiert
Kein SQL, Shell-Kommando, Pfad oder HTML per String-Verkettung mit Nutzerdaten
[ASVS5 V1]. Im Browser gilt dasselbe für gefährliche DOM-Senken (`innerHTML`,
`eval`, dynamische Skript-URLs): nur geprüfte Werte, wo verfügbar erzwungen über
Trusted Types [TT] (W3C-Entwurf). Kodierung ist die erste Linie; Browser-Mitigations
wie CSP sind die zweite — Script Gadgets in verbreiteten JS-Frameworks umgingen alle
damals bekannten XSS-Mitigations [LEKIES17].
Prüfen: Suche nach Verkettung in Query-/Exec-Aufrufen und nach DOM-Senken im
Frontend-Code; Template-Engine mit Auto-Escaping aktiv.

### SEC-15 · B · F — Schreibbare Felder sind je Aktion festgelegt
Kein Mass Assignment: Felder wie `role`, `is_admin`, `tenant_id` sind nicht über
Requests setzbar [ASVS5 V15.3.3] (strenger als ASVS L2).
Prüfen: Modelle/DTOs ohne Feld-Allowlist; Request mit zusätzlichem `role`-Feld.

### SEC-16 · Ö · F — Serverseitige Abrufe sind auf Ziele beschränkt
URLs, die der Server abruft (Webhooks, Vorschauen, Importe), werden gegen erlaubte
Protokolle, Hosts und Ports geprüft; interne Adressen und Metadaten-Endpunkte sind
nicht erreichbar [ASVS5 V1.3.6].
Prüfen: Funktion mit einer internen Adresse als Ziel aufrufen.

### SEC-17 · B (uploads) · F — Uploads werden als feindlich behandelt
Erlaubte Endungen, Prüfung des Inhalts statt des gemeldeten Typs, Umbenennen, Ablage
außerhalb des Webroots oder auf eigener Domain, Größenlimits — auch für entpackte
Archive [ASVS5 V5.2, V5.3] [OWASP-UPLOAD]. Auslieferung mit sicherem `Content-Type`
und `Content-Disposition`.
Prüfen: HTML- oder SVG-Datei hochladen und per Direktlink aufrufen.

## Browser-Schutz

### SEC-18 · B · F — Sicherheits-Header zentral auf allen Antworten
HSTS (≥ 1 Jahr, ab Ö mit Subdomains), CSP inkl. `frame-ancestors`,
`Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options: nosniff`, ab Ö
`Cross-Origin-Opener-Policy` [ASVS5 V3.4] [OWASP-HEADERS] (CSP: strenger als ASVS L2;
COOP: strenger als ASVS L3) — auch auf Fehlerseiten,
API-Antworten und Antworten, die ein Proxy selbst erzeugt.
Prüfen: Header einer normalen Seite, eines 404, eines API-Fehlers vergleichen.

### SEC-19 · Ö · G — Die CSP ist scharf, nicht nur im Report-Modus
Ohne `unsafe-inline` für Skripte, bevorzugt nonce-basiert mit `strict-dynamic`;
Report-Only nur als Übergang mit Enddatum. Vorhandensein belegt keine Wirkung: in einer
Messung über 1,68 Mio. Hosts waren fast alle Policies, die Skripte beschränken sollten,
wirkungslos [WEICHSELBAUM16].
Prüfen: CSP-Header im Produktionsbetrieb; ob er eingeschleustes Inline-Skript
tatsächlich blockiert.

### SEC-20 · B · F — Zustandsänderungen sind gegen CSRF geschützt
Synchronizer-Token oder signiertes Double-Submit-Cookie; `SameSite` ist
Zusatzschutz, nicht alleiniger Schutz; keine Zustandsänderung per `GET`
[OWASP-CSRF] [ASVS5 V3.5].
Prüfen: `POST` von einer fremden Origin.

## Geheimnisse und Kryptografie

### SEC-21 · B · F — Geheimnisse liegen außerhalb von Code und Images
Aus der Umgebung oder einem Secret-Store, mit minimalen Rechten [ASVS5 V13.3];
Secret-Scan im Commit-Pfad und in der CI. Ein geleaktes Geheimnis wird rotiert, nicht
nur aus der Historie entfernt — öffentliche Repos werden laufend nach Schlüsseln
durchsucht; eine Messung fand Leaks in über 100.000 Repositories und täglich
Tausende neue [MELI19].
Prüfen: Suche in Repo-Historie, Images, CI-Konfiguration; Ablauf für den Leak-Fall.

### SEC-22 · Ö · L — Schlüssel haben einen Lebenszyklus
Inventar aller Schlüssel, Zertifikate und Algorithmen [V11.1.2], Rotationsverfahren
[V11.1.1], bei K mit Ablauf [V13.3.4]. Ein Schlüsseltausch wurde mindestens einmal
geübt.
Prüfen: Inventar; Datum der letzten Rotation.

### SEC-23 · B · F — Transport nur verschlüsselt
TLS 1.2 oder 1.3, 1.3 bevorzugt [ASVS5 V12.1.1]; auch intern zwischen Diensten ab Ö.
Prüfen: TLS-Konfiguration des Endpunkts.

## Lieferkette

### SEC-24 · B · F — Abhängigkeiten sind festgeschrieben und bekannt
Lockfiles im Repo; Inventar (SBOM) je Release ab Ö [ASVS5 V15.1.2]; CI-Bausteine
und Basis-Images gepinnt.
Prüfen: Lockfile vorhanden und aktuell; SBOM-Artefakt des letzten Releases.

### SEC-25 · B · L — Schwachstellen in Abhängigkeiten haben Fristen
Risikobasierte Update-Fristen festgelegt [V15.1.1] und eingehalten [V15.2.1]; der
Scan läuft in der CI, schließt transitive Abhängigkeiten ein und bricht ab einer
festgelegten Schwere. Ohne Automatik veralten Abhängigkeiten nachweislich [KULA18];
Lücken pflanzen sich transitiv fort [DECAN18]; Befunde nach Erreichbarkeit priorisieren —
ein Teil betrifft nur Entwicklungs-Abhängigkeiten [PASHCHENKO18].
Prüfen: offene Befunde und ihr Alter gegen die Frist.

### SEC-26 · K · F — Build-Herkunft ist nachweisbar
Signierte Release-Artefakte und Provenienz nach SLSA; Zielstufe festgelegt [SLSA].
Prüfen: Signatur und Provenienz-Nachweis des letzten Releases.

## Erkennen und Melden

### SEC-27 · Ö · F — Sicherheitsereignisse werden protokolliert und alarmiert
Alle Anmeldeereignisse [V16.3.1], verweigerte Zugriffe [V16.3.2],
Umgehungsversuche [V16.3.3]; Einträge mit wer/was/wann/wo [V16.2.1]; auf einem
getrennten System mit Alarmierung [V16.4.3]. „Logging **and Alerting**“ ist seit der
Top-10-Ausgabe 2025 ausdrücklich Teil der Kategorie [OWASP-T10-2025 A09].
Prüfen: absichtlich fehlgeschlagene Anmeldungen erzeugen; kommen Log und Alarm an?

### SEC-28 · Ö · G — Es gibt einen Meldeweg für Schwachstellen
`/.well-known/security.txt` mit `Contact` und `Expires` (höchstens ein Jahr in der
Zukunft) [RFC9116], verlinkte Disclosure-Policy; bei offenem Quellcode zusätzlich
`SECURITY.md`. Auch große Projekte haben hier Lücken — kein Grund, sie zu kopieren.
Prüfen: Datei abrufen; `Expires` in der Zukunft?

### SEC-29 · Ö · L — Fehler- und Ausnahmezustände sind geprüft
Unerwartete Zustände enden in einem sicheren Zustand statt in offenem Zugriff oder
halb geschriebenen Daten — seit 2025 eigene Top-10-Kategorie
[OWASP-T10-2025 A10]. → siehe auch OPS-01 bis OPS-04 (Timeouts, Fehlerpfade).
Prüfen: `catch`-Blöcke, die loggen und Erfolg melden; Fehlerpfade bei Teilschreibvorgängen.

### SEC-30 · K · G — Unabhängige Prüfung vor dem Go-live
Externer Penetrationstest oder Review gegen das gewählte ASVS-Niveau, Befunde mit
Frist behoben. Prüfende brauchen Sicherheitswissen, nicht nur Testerfahrung: Hacker
und Tester gehen ähnlich vor, finden aber Verschiedenes, weil sich Erfahrung und
Wissen über Sicherheitskonzepte unterscheiden [VOTIPKA18].
Prüfen: Bericht, Befundliste mit Status.

### SEC-31 · B · F — Kontowiederherstellung und Faktorwechsel sind abgesichert
Reset- und Wiederherstellungs-Tokens sind zufällig, einmalig und kurz befristet; der
Verlust des zweiten Faktors hat einen festgelegten Weg, der die Stärke der Anmeldung
nicht unterläuft; die Änderung der Wiederherstellungsadresse oder das Hinzufügen eines
Authenticators verlangt eine erneute Anmeldung, und der Kontoinhaber wird über einen
unabhängigen Kanal benachrichtigt [NIST-EVENTS] [ASVS5 V6.4] (V6.4.3, V6.4.4: strenger als ASVS L2) → SEC-07.
Prüfen: Reset-Link zweimal verwenden und nach Ablauf verwenden; Wiederherstellung bei
verlorenem zweiten Faktor durchspielen; neuen Faktor hinzufügen — kommt die
Benachrichtigung an die bisherige Adresse?

## Prozess und Prüfverfahren

### SEC-32 · Ö · E — Sichere Entwicklung ist ein Prozess, nicht ein Test am Ende
Die Kernpraktiken sind festgelegt und verankert: Organisation vorbereiten, Software
schützen (Repo, Build, Signatur), sicher entwickeln (Anforderungen, Design-Review,
Code-Review, sichere Voreinstellungen), auf Schwachstellen reagieren [SSDF]; der
Reifegrad lässt sich gegen ein Modell einschätzen [SAMM]. Übernommener Code —
Snippets aus Foren wie auch KI-generierter — geht durch dasselbe Review wie eigener:
in einer Laborstudie schrieb, wer nur Stack Overflow nutzen durfte, signifikant
unsichereren Code [ACAR16]; 97,9 % der Android-Apps mit sicherheitsrelevanten
Snippets von dort enthielten mindestens ein unsicheres [FISCHER17] (Mobil, als
Analogie).
Prüfen: je Praxisgruppe des SSDF die gelebte Entsprechung; Review-Regel für
übernommenen Code.

### SEC-33 · Ö · G — Sicherheit wird mit mehreren Verfahren geprüft
Statische Analyse, dynamischer Scan und manuelle Prüfung ergänzen sich: in einem
Vergleich an einer Web-App fand jedes Verfahren Lücken, die die anderen übersahen;
statische Analyse fand die meisten, exploratives manuelles Pentesting die schwersten
[ELDER22]. Automatische Black-Box-Scanner verfehlen ganze Klassen wie gespeichertes
XSS und scheitern oft schon am Crawlen [BAU10] [DOUPE10]. Kein einzelnes grünes
Werkzeug ist ein Sicherheitsnachweis → TST-08. Aktive Scans nur in freigegebener
Testumgebung (SKILL.md, Grundregeln).
Prüfen: welche Verfahren wann laufen; Befunde der letzten Runde je Verfahren.

## Weitere Angriffsflächen

### SEC-34 · Ö · F — Geschäftsabläufe halten Reihenfolge, Limits und Nebenläufigkeit aus
Mehrstufige Abläufe nur in der vorgesehenen Reihenfolge [ASVS5 V2.3.1]; fachliche
Limits (je Nutzer und global) dokumentiert und durchgesetzt [V2.1.3, V2.3.2];
Vorgänge um Geld, Bestand und Kontingente atomar — Transaktion, bedingtes Update oder
Sperre statt „lesen, prüfen, schreiben“ [V2.3.3, V2.3.4]; bei K Zustandsprüfung und
Aktion als eine atomare Operation [V15.4.2]. In 12 verbreiteten Shop-Anwendungen
fanden sich 22 kritische Angriffe über gleichzeitige Requests — manipulierte
Lagerbestände, überzogene Gutscheine, gestohlene Ware [ACIDRAIN17].
Prüfen: für Gutschein, Guthaben oder Bestand zwei parallele Requests in
freigegebener Testumgebung; einen Schritt eines mehrstufigen Ablaufs überspringen.

### SEC-35 · B · F — CORS ist eng konfiguriert
`Access-Control-Allow-Origin` ist fest oder gegen eine Allowlist geprüft — keine
gespiegelte Origin, kein `null`, Credentials nur für explizit erlaubte Origins
[ASVS5 V3.4.2, V3.5.1, V3.5.2]. CORS-Semantik wird häufig missverstanden und
lockert Cross-Origin-Zugriffe subtiler, als Entwickler annehmen [CHEN18].
Prüfen: Request mit fremder und mit `null`-Origin gegen einen authentifizierten
Endpunkt; Antwort-Header vergleichen.

### SEC-36 · Ö · F — Weiterleitungen gehen nur an erlaubte Ziele
Redirect-Ziele aus Parametern sind relativ oder gegen eine Allowlist geprüft
[ASVS5 V3.7.2] [OWASP-REDIRECT]; das gilt besonders nach Anmeldung und Abmeldung.
Prüfen: Login- und Logout-Weiterleitung mit fremder Domain als Ziel.

### SEC-37 · Ö · F — Skripte Dritter sind inventarisiert und begrenzt
Jedes fremde Skript läuft mit den Rechten der eigenen Seite und kann Daten und
Sitzung lesen [NIKIFORAKIS12]. Deshalb: Inventar mit Zweck und Eigentümer; selbst
hosten oder mit Integritäts-Hash einbinden [SRI] [ASVS5 V3.6.1] (strenger als
ASVS L3); CSP-Allowlist passend; Marketing-Skripte erst nach Einwilligung → LAW-05.
Prüfen: Liste der externen Skripte gegen die tatsächlich geladenen; `integrity`
an extern geladenen Ressourcen.

### SEC-38 · B · F — Tokens und föderierte Anmeldung werden vollständig geprüft
Wo selbsttragende Tokens (etwa JWT) im Einsatz sind: Signatur mit Algorithmus aus
fester Allowlist, Schlüssel nur aus vorkonfigurierter Quelle, Gültigkeitszeitraum,
Aussteller und Zielgruppe [ASVS5 V9.1.1–V9.1.3, V9.2.1, V9.2.3] [RFC8725]. Wo
OAuth/OIDC im Einsatz ist: exakt registrierte Redirect-URIs, Schutz gegen CSRF im
Code-Flow (PKCE bzw. `state`), `nonce` bei ID-Tokens [V10.4.1, V10.2.1, V10.5.1]
[RFC9700]; formale Analysen fanden in OAuth 2.0 praktisch ausnutzbare Angriffe, die
erst mit den Korrekturen der Best Practices ausgeschlossen sind [FETT16]. V9.2.3,
V10.2.1, V10.5.1: strenger als ASVS L2. Ohne Tokens und Föderation `n. a.`
Prüfen: Token mit `alg: none`, fremder Zielgruppe und abgelaufenem Zeitstempel
einreichen; Redirect-URI mit angehängtem Pfad.

### SEC-39 · B · F — Keine native Deserialisierung nicht vertrauenswürdiger Daten
Daten von außen werden als einfache Formate (JSON o. Ä.) mit Schema gelesen, nicht
über Mechanismen, die beliebige Objekte erzeugen; wo unvermeidbar, nur mit
Typ-Allowlist [ASVS5 V1.5.2] (strenger als ASVS L2) [OWASP-DESER].
Prüfen: Suche nach nativen Deserialisierungsaufrufen auf Request-, Cookie-, Cache-
und Queue-Daten.

### SEC-40 · Ö · F — Privilegierte Zugänge sind stärker geschützt
Konten mit Admin- oder Betreiberrechten nur mit zweitem Faktor [ASVS5 V6.3.3],
bevorzugt phishing-resistent → SEC-04; Admin-Funktionen getrennt erreichbar und
protokolliert → OBS-09; bei K mehrschichtig abgesichert [V8.4.2]. Rechte werden
regelmäßig überprüft und entzogen, wenn die Aufgabe endet.
Prüfen: Liste privilegierter Konten mit Faktor; letzte Rechteüberprüfung.

### SEC-41 · Ö · L — Domains und DNS-Einträge sind inventarisiert
Beim Abbau von Cloud-Ressourcen werden die zugehörigen DNS-Einträge mit entfernt;
verwaiste Einträge erlauben die Übernahme der Subdomain samt gültigem Zertifikat. Eine
Messung fand 467 ausnutzbare verwaiste Einträge in 277 der 10.000 meistbesuchten
Domains [LIU16]. Cookies ohne `__Host-`-Präfix gelten auch für Subdomains → SEC-09.
Prüfen: DNS-Zonen gegen existierende Ressourcen abgleichen; Einträge auf fremde
Dienste ohne Gegenstück.

### SEC-42 · B (ki) · F — LLM-Funktionen behandeln Modellein- und -ausgaben als nicht vertrauenswürdig
Inhalte, die das Modell liest (Webseiten, Dokumente, Mails), können Anweisungen
enthalten: indirekte Prompt Injection führte in realen LLM-Anwendungen zu
Datendiebstahl und Missbrauch angebundener Funktionen [GRESHAKE23]. Deshalb:
Modellausgaben wie Nutzereingaben kodieren und validieren, Werkzeugrechte des Modells
minimal und bei folgenreichen Aktionen mit Bestätigung, keine Geheimnisse im
System-Prompt, Verbrauch je Nutzer begrenzt [OWASP-LLM-2025 LLM01, LLM05, LLM06, LLM07,
LLM10]. Kennzeichnungspflichten → LAW-16.
Prüfen: Dokument mit eingebetteter Anweisung einspeisen; Liste der Werkzeuge mit
Rechten; Limit je Nutzer.

### SEC-43 · Ö · F — Die Laufzeit hat minimale Rechte
Prozesse laufen nicht als Root, Dateisystem wo möglich nur lesbar, Images minimal
und aus vertrauenswürdiger Quelle, ausgehende Verbindungen auf benötigte Ziele
beschränkt [NIST-800-190] → SEC-16.
Prüfen: Benutzer des laufenden Prozesses; schreibbare Pfade; Egress-Regeln.

### SEC-44 · B (ki-werkzeug) · F — Kontext und Werkzeuge für KI-Agenten sind begrenzt und gekennzeichnet
Was die App an Agenten ausliefert, kann dort als Anweisung wirken; Inhalte anderer
Nutzer sind damit ein Weg für indirekte Prompt Injection in fremde Agenten
[GRESHAKE23] [OWASP-LLM-2025 LLM01, LLM06]. Deshalb: ausgelieferter Kontext ist nach
Herkunft gekennzeichnet und fremde Beiträge sind von eigenen getrennt; schreibende
Werkzeuge haben Rechte je Schlüssel und Mandant, mit Limits; der Werkzeugvertrag
(Namen, Argumente, Limits) ist versioniert wie eine API → API-01. Autorisierung wie
bei jedem anderen Endpunkt → SEC-10.
Prüfen: Beitrag eines anderen Nutzers mit eingebetteter Anweisung — wie erscheint er
im ausgelieferten Kontext? Liste der Werkzeuge mit Rechten und Limits.

### SEC-45 · B · F — Die App startet nicht mit leeren, Standard- oder Beispielgeheimnissen
Beim Start in Produktion wird jedes Geheimnis geprüft: nicht leer, nicht gleich einem
Wert aus Vorlagen (`.env.example`, Doku, Compose-Dateien), ausreichend lang; sonst
bricht der Start ab. Standardkonten gibt es nicht oder sie sind deaktiviert
[ASVS5 V6.3.2, V13.2.3] (V13.2.3: strenger als ASVS L2) → SEC-21.
Prüfen: alle Beispielwerte aus Vorlagen gegen die Startprüfung; Start mit leerem
Geheimnis in freigegebener Testumgebung.

### SEC-46 · B · F — Die Ersteinrichtung kann nur der Betreiber vornehmen
Der erste Admin entsteht nicht dadurch, dass sich jemand als Erster registriert: eine
frisch gestartete, erreichbare Instanz wäre sonst ein Wettlauf. Stattdessen ein
einmaliges Einrichtungs-Token aus Log oder Umgebung, Anlage per Kommandozeile oder
Bindung an den lokalen Zugang. Praxisregel ohne eigenen Studienbeleg → REQ-10.
Prüfen: Code der Registrierung und Ersteinrichtung; wer wird bei leerer Datenbank
Admin?

### SEC-47 · Ö (clients) · G — Ausgelieferte Client-Software ist gepinnt, nachprüfbar und minimal berechtigt
Plugins, Hooks und Skripte, die auf Rechnern der Nutzer laufen, werden in festen
Versionen ausgeliefert, ihre Herkunft ist prüfbar (Signatur oder Prüfsumme) → SEC-26,
sie laden zur Laufzeit keinen unversionierten Code nach und schreiben nur, wo sie
müssen. Updates sind für Nutzer erkennbar.
Prüfen: Auslieferungsweg einer Client-Komponente; was sie beim Start lädt und wohin
sie schreibt.
