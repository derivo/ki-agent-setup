# 08 — Betrieb & Resilienz

Ziel: Die App übersteht Teilausfälle, Deploys und Lastspitzen, und Daten lassen sich
nachweislich wiederherstellen. Quellenkürzel → [QUELLEN.md](QUELLEN.md).

## Fehlertoleranz

### OPS-01 · B · F — Jeder Aufruf über eine Prozessgrenze hat einen Timeout
HTTP-, Datenbank-, Cache- und Mail-Clients mit expliziten Verbindungs- und
Lese-Timeouts; ausgehende Timeouts liegen unter dem eigenen Request-Timeout, Fristen
schrumpfen von außen nach innen [SRE-CASCADE]. Fehlende Timeouts auf Fremdaufrufe
erschöpfen den Worker-Pool und legen den ganzen Dienst lahm.
Prüfen: Client-Konfigurationen; jede Stelle ohne expliziten Timeout ist ein Befund.

### OPS-02 · Ö · F — Wiederholungen sind begrenzt, gestreut und nur idempotent
Exponentielles Backoff mit Zufallsanteil (Jitter), Obergrenze, nur für idempotente
Operationen (→ API-15); Retries nur auf einer Ebene — drei Ebenen mit je drei
Wiederholungen zusätzlich zum Erstversuch ergeben 4 × 4 × 4 = 64 Aufrufe [SRE-CASCADE] [AWS-RETRY].
Prüfen: Retry-Stellen im Code und in Clients zählen, Ebenen übereinanderlegen.

### OPS-03 · Ö · F — Ausfälle von Abhängigkeiten bleiben begrenzt
Circuit Breaker für instabile Fremddienste (Zustandswechsel protokolliert, manuell
schaltbar) [FOWLER-CB]; getrennte Ressourcen-Pools für kritische und unkritische Wege
(Bulkheads); nicht-kritische Funktionen degradieren sichtbar statt mit `500`
[AWS-REL].
Prüfen: Fremddienst abschalten (Testumgebung); was sieht der Nutzer?

### OPS-04 · B · F — Gefangen heißt behandelt oder weitergereicht
Ein Fehlerpfad, der loggt und Erfolg meldet oder ein leeres Ergebnis als gültig
zurückgibt, macht aus einem Fehlschlag eine Zusage. Entweder propagieren oder dauerhaft
zur Wiederholung vormerken (Queue, Journal) und erst nach nachweislichem Erfolg
entfernen.
Prüfen: `catch`-Blöcke ohne Weiterreichen; Teilschreibvorgänge über mehrere Systeme.

### OPS-05 · B · F — Langsame Arbeit läuft außerhalb des Requests
E-Mail, PDF-Erzeugung, Importe, Fremd-API-Aufrufe in Hintergrundjobs; Jobs sind
idempotent, haben Retry-Grenze und eine Ablage für endgültig fehlgeschlagene Jobs, die
jemand sieht [AWS-REL].
Prüfen: Request-Pfade mit externen Aufrufen; Umgang mit endgültig gescheiterten Jobs.

### OPS-06 · Ö · G — Überlast wird abgewiesen statt mitgeschleppt
Kleine Warteschlangen, frühes Ablehnen (`429`/`503` mit `Retry-After`), billigere
Antworten unter Last (Load Shedding, Degradation) [SRE-CASCADE].
Prüfen: Verhalten im Lasttest jenseits der Kapazität.

## Prozesse und Konfiguration

### OPS-07 · B · F — Konfiguration kommt aus der Umgebung, dasselbe Artefakt überall
Keine umgebungsspezifischen Werte oder Geheimnisse im Code oder Image; dasselbe
Build-Artefakt läuft in Test und Produktion [12F III, V]. Die 12-Factor-Methode ist
seit 2024 offen weiterentwickelt; eine überarbeitete Fassung ist bisher nicht
veröffentlicht [12F-OSS].
Prüfen: Build-Pipeline — wird je Umgebung neu gebaut?

### OPS-08 · B · F — Prozesse sind zustandslos
Sitzungen, Uploads und Caches liegen in Hintergrunddiensten, nicht auf der Instanz
[12F VI]; eine Instanz kann jederzeit ersetzt werden.
Prüfen: Schreibzugriffe auf das lokale Dateisystem; Sitzungsspeicher-Konfiguration.

### OPS-09 · B · F — Prozesse beenden sich sauber
Auf das Stoppsignal: keine neuen Requests annehmen, Readiness auf „nicht bereit“,
laufende Requests beenden, Jobs zurückgeben — innerhalb der Frist der Plattform
[12F IX] [K8S-LIFECYCLE]. Web-Prozesse, Worker und Scheduler getrennt prüfen.
Prüfen: Deploy während eines laufenden Jobs; wird er abgeschlossen oder sauber
zurückgegeben?

### OPS-10 · Ö · F — Einmalige Verwaltungsaufgaben laufen als eigener Prozess mit demselben Release
Migrationen, Datenkorrekturen, Wartungsskripte laufen versioniert mit dem Code des
Releases, nicht als Handarbeit auf dem Server [12F XII].
Prüfen: Wie wurde die letzte Datenkorrektur ausgeführt, und ist sie nachvollziehbar?

### OPS-11 · B · E — Entwicklungs- und Produktionsumgebung gleichen sich
Gleiche Hintergrunddienste in gleichen Hauptversionen, lokal wie produktiv [12F X].
Prüfen: Versionen von Datenbank, Cache, Laufzeit je Umgebung vergleichen.

## Daten sichern

### OPS-12 · B · E — Wiederherstellungsziele sind festgelegt
Je Datenbestand: maximal tolerierter Datenverlust (RPO) und maximale Ausfallzeit (RTO),
mit den Verantwortlichen abgestimmt; die Sicherungshäufigkeit folgt aus dem RPO
[AWS-DR].
Prüfen: dokumentierte Werte je Bestand.

### OPS-13 · B · F — Sicherung nach 3-2-1, mit einer unlöschbaren Kopie
Drei Kopien, zwei Medientypen, eine außer Haus; verschlüsselt; mindestens eine Kopie,
die ein kompromittiertes Produktionskonto nicht löschen kann [CISA-BACKUP]. Replikation
ersetzt keine Sicherung zu einem Zeitpunkt — sie repliziert Löschungen und Korruption
mit. Gesichert werden **alle** Bestände: Datenbank, Uploads/Objektspeicher,
Konfiguration, Geheimnisse (getrennt), Infrastrukturbeschreibung.
Prüfen: Liste der Bestände gegen die Sicherungsjobs; Löschrechte auf das Sicherungsziel.

### OPS-14 · B · G/L — Wiederherstellung wird regelmäßig geübt und gemessen
Vollständiger und teilweiser Restore in eine getrennte Umgebung, Dauer gegen das RTO
gemessen, Ergebnis protokolliert. Ein Backup ohne geübten Restore ist unbelegt.
In einer Analyse von knapp 600 Cloud-Ausfällen waren nicht funktionierende Sicherungen
und ungetesteter Failover-Code wiederkehrende Ursachen [GUNAWI16].
Prüfen: vor dem Go-live ein erster Restore-Test; danach Datum und Dauer des letzten
Tests gegen den festgelegten Rhythmus.

### OPS-15 · K · G — Katastrophenfall ist geplant
Gewählte Strategie (Backup & Restore, Pilot Light, Warm Standby, Multi-Site) passend
zu RTO/RPO, mit Ablauf und Übung [AWS-DR].
Prüfen: DR-Plan, letzte Übung.

## Leistung und Kapazität

### OPS-16 · Ö · G — Der Bruchpunkt ist bekannt
Lasttest mit gleichmäßigem und stoßartigem Profil bis zur SLO-Verletzung, inklusive
Wiederanlauf; Abstand zur erwarteten Spitzenlast bekannt [SRE-CASCADE] [SRE-PRR].
Prüfen: Lasttestbericht mit Datum und Version.

### OPS-17 · B · F — Caching ist bewusst in Ebenen geplant
Statische Assets mit Hash im Namen und langer Lebensdauer; HTML revalidiert;
personenbezogene Antworten nie in geteilten Caches [WEBDEV-CACHE] → API-20. Auch nicht
über Umwege: bei Web Cache Deception speichert ein Cache eine private Seite, weil ihr
Pfad wie eine statische Datei aussieht — in einer Messung waren viele betroffene Sites
zwei Jahre nach Veröffentlichung noch verwundbar [MIRHEIDARI20].
Anwendungs- und Query-Caches mit definierter Invalidierung.
Prüfen: Header eines Assets, einer HTML-Seite, einer personenbezogenen Antwort (auch
mit angehängtem `/x.css`); für
einen Anwendungs-Cache: Daten ändern und prüfen, ob die nächste Antwort den neuen Stand
zeigt.

## Vorfälle

### OPS-18 · Ö · G — Wann ein Vorfall ausgerufen wird, steht fest
Kriterien (Kunden betroffen, mehrere Beteiligte nötig, keine Lösung nach fester Zeit),
Rollen (Leitung, Umsetzung, Kommunikation) und ein laufendes Vorfallsdokument
[SRE-INCIDENT]. Nutzerkommunikation über einen Kanal, der vom Hauptsystem unabhängig ist.
Prüfen: schriftliche Kriterien; Statuskanal außerhalb der eigenen Infrastruktur.

### OPS-19 · Ö · L — Nachbetrachtungen sind schuldfrei und ihre Maßnahmen werden verfolgt
Auslöser vorab definiert (Ausfall, Datenverlust, manueller Eingriff, Monitoring hat
versagt); Maßnahmen als Tickets bis zum Abschluss [SRE-POSTMORTEM]. Strukturiert erfasst
(Erkennung, Ursache, Behebung) zeigen Nachbetrachtungen Prozesslücken, die Erkennung
und Behebung verzögern [GHOSH22].
Prüfen: letzte Nachbetrachtung; Status ihrer Maßnahmen.

### OPS-20 · Ö · G — Vor dem Go-live steht eine Betriebsbereitschaftsprüfung
Architektur und Abhängigkeiten, Monitoring, Notfallablauf, Kapazität, Änderungsprozess,
Leistung — mit benanntem Eigentümer im Betrieb [SRE-PRR]. Dieser Katalog in Phase `G`
ist diese Prüfung.
Prüfen: Protokoll der Prüfung; benannter Betriebsverantwortlicher.

### OPS-21 · Ö (selbst-gehostet) · G — Betreiber haben eine Betriebsanleitung
Installation, Update (mit Wartungsmodus und Dauer langer Migrationen), Sicherung und
Wiederherstellung sind für Betreiber dokumentiert — reale Projekte wie Nextcloud und
BookStack führen genau diese Seiten [NC-UPGRADE] [NC-BACKUP] [BS-UPDATE] [BS-BACKUP].
Prüfen: Doku-Seiten vorhanden und zum aktuellen Release passend.

### OPS-22 · Ö · G — Betriebskosten haben Budget, Eigentümer und Grenzen
Die kostentreibenden Mengen sind bekannt (Rechenzeit, Speicher, Datentransfer,
Log- und Metrikvolumen samt Aufbewahrung, Fremddienste pro Aufruf); ein Budget mit
Eigentümer ist festgelegt, und es steht fest, was bei Überschreitung passiert —
Warnung, Drosselung oder bewusste Freigabe. Telemetrie mit hoher Kardinalität und
lange Aufbewahrung sind häufige stille Kostentreiber → OBS-03.
Prüfen: Kostenaufstellung der letzten Periode je Posten; Budgetalarm vorhanden; wer
entscheidet bei Überschreitung?

### OPS-23 · Ö · G — Skalierung ist geplant, nicht erhofft
Die App skaliert horizontal über zustandslose Prozesse (→ OPS-08) [12F VIII];
Verbindungs-Pools und Datenbankgrenzen sind auf die Zahl der Instanzen abgestimmt;
wo nötig entlasten Lese-Replikate und Caches (→ OPS-17). Aus Bruchpunkt (OPS-16) und
Wachstum ergibt sich eine Kapazitätsplanung mit Vorlauf [AWS-REL].
Prüfen: Rechnung Instanzen × Pool-Größe gegen die Verbindungsgrenze der Datenbank;
Kapazitätsplan mit Datum.

### OPS-24 · B · E — Hosting-Standorte und Datenflüsse sind bekannt
Für Anwendung, Datenbank, Backups, Objektspeicher, Logs und jeden Dienstleister ist
dokumentiert, in welchem Land bzw. welcher Region die Daten liegen und wohin sie
fließen. Das ist die Grundlage für die Rechtsräume im Profil und für Übermittlungen in
Drittländer (→ LAW-06, LAW-21).
Prüfen: Datenfluss-Übersicht mit Standorten gegen die tatsächliche Konfiguration.

### OPS-25 · Ö · G — Nutzer werden bei Störungen und Wartung informiert
Eine Statusseite, die nicht von der eigenen Infrastruktur abhängt; im Vorfall eine
benannte Rolle, die regelmäßig nach innen und außen informiert [SRE-INCIDENT];
geplante Wartung wird mit Vorlauf angekündigt.
Prüfen: Statusseite bei Ausfall der App erreichbar? Kommunikation im letzten Vorfall.

### OPS-26 · Ö · E — Zugesagte Verfügbarkeit ist aus den SLOs abgeleitet
Wo Kunden Verfügbarkeit oder Reaktionszeiten vertraglich zugesagt sind (SLA), liegen
die internen Ziele (OBS-15) strenger, die Messung ist objektiv und für beide Seiten
nachvollziehbar, und die Folgen eines Verfehlens sind festgelegt [SRE-SLA]. Ohne
Zusagen `n. a.`
Prüfen: SLA gegen SLO; Messweg; Bericht der letzten Periode.
