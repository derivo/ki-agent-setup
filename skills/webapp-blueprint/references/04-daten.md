# 04 — Daten & Persistenz

Ziel: Daten bleiben korrekt, Schemaänderungen sind umkehrbar, und jede Datenkategorie
hat einen Lebenszyklus. Quellenkürzel → [QUELLEN.md](QUELLEN.md).

### DAT-01 · B · E — Integrität liegt in der Datenbank, nicht nur im Code
Pflichtfelder, Eindeutigkeit, Fremdschlüssel und Wertebereiche als Constraints; der
Code validiert zusätzlich für gute Fehlermeldungen, ersetzt die Constraints aber nicht.
Prüfen: Schema auf fehlende `NOT NULL`, Unique- und Fremdschlüssel-Constraints dort,
wo der Code sie voraussetzt.

### DAT-02 · B · F — Zusammengehörige Schreibvorgänge sind eine Transaktion
Invarianten, die mehrere Tabellen betreffen („Projekt hat immer einen Owner“), entstehen
atomar. Außenwirkungen (Mail, Webhook) erst nach dem Commit, zuverlässig über eine
Ausgangs-Warteschlange (Outbox), nicht innerhalb der Transaktion.
Prüfen: Anlage-Pfade mit mehreren Inserts; Versand von Nachrichten innerhalb offener
Transaktionen.

### DAT-03 · B · F — Schemaänderungen sind versionierte Migrationen mit Rückweg
Jede Änderung als Migration im Repo, in Reihenfolge, mit nachweisbarem Rückweg — als
Umkehr-Migration oder als dokumentierter Weg (Restore-Punkt, Vorwärts-Korrektur bei
Expand/Contract → DAT-04). Hausstandard im ki-agent-setup ist eine `down`-Migration je
Änderung; anderswo ist das eine Option, keine Pflicht. Kein Handeingriff am
Produktionsschema.
Prüfen: je Migration der Rückweg; Abgleich Schema der Produktion gegen Migrationsstand.

### DAT-04 · Ö · F — Schemaänderungen sind mit der Vorversion der App verträglich
Erweitern → Migrieren → Zusammenziehen (Expand/Contract): alte und neue App-Version
laufen gegen dasselbe Schema, destruktive Änderungen kommen in einem späteren Release
[FOWLER-PC]. Damit bleibt ein App-Rollback möglich, ohne das Schema zurückzudrehen.
Prüfen: Releases, in denen eine Spalte umbenannt oder gelöscht wurde, während der Code
sie im selben Release zuletzt nutzte.

### DAT-05 · Ö · G — Lange Migrationen sind geplant
Migrationen auf großen Tabellen (Indexaufbau, Datenumbau) laufen ohne lange Sperren oder
als eigener, überwachter Schritt; ihre Dauer ist vorher an realistischen Datenmengen
gemessen.
Prüfen: Migrationen mit Sperrwirkung; Messung auf einer Kopie der Produktionsgröße.

### DAT-06 · B · E — Zeitpunkte in UTC, künftige Termine mit Zeitzonen-ID
Zeitpunkte als UTC speichern; künftige lokale Termine als Wanduhrzeit plus IANA-Zeitzone
(keine festen Offsets — Sommerzeitregeln ändern sich); Geburtstage und Feiertage als
Datum ohne Zeitzone [W3C-TZ].
Prüfen: Spaltentypen und Speicherkonventionen für Zeit; wiederkehrende Termine.

### DAT-07 · B · E — Geldbeträge als Ganzzahl in kleinster Einheit mit Währungscode
Keine Fließkommazahlen für Geld; Betrag in Minor Units plus ISO-4217-Code; Rundungsregel
festgelegt.
Prüfen: Spaltentypen für Beträge.

### DAT-08 · B · F — Text ist durchgehend UTF-8, Vergleiche sind normalisiert
UTF-8 in Datenbank, Verbindung, Dateien und HTTP; Normalisierung (NFC) vor Vergleich
und Eindeutigkeitsprüfung; Sortierung sprachabhängig, wo Nutzer sortierte Listen sehen
[W3C-ENC] [UAX15] [UTS10] → I18N.
Prüfen: Zeichensatz und Collation der Datenbank und der Verbindung.

### DAT-09 · Ö · E — Jede Datenkategorie hat Zweck, Frist und Löschweg
Löschkonzept je Kategorie (Konto, Bestellung, Log, Upload, Sicherung): Aufbewahrungsfrist,
Rechtsgrundlage, technischer Löschjob. „Weich gelöscht“ ist nicht gelöscht; Fristen gelten
auch in Logs und Sicherungen (dort mit dokumentiertem Auslaufen) [EU: DSGVO Art. 5,
17, 30] → LAW-03; gesetzliche Aufbewahrungsfristen → LAW-23.
Prüfen: Löschjobs gegen das Konzept; Soft-Delete ohne endgültige Löschung.

### DAT-10 · B · F — Konten lassen sich vollständig löschen, geteilte Beiträge anonymisieren
Endgültiges Löschen eines Kontos inklusive abhängiger Daten; Beiträge, die anderen
gehören oder geteilt sind, werden anonymisiert statt gelöscht, wo das fachlich nötig ist.
Prüfen: Konto löschen und Datenbank nach Resten durchsuchen.

### DAT-11 · B · F — Nutzer bekommen ihre Daten maschinenlesbar heraus
Export in einem gängigen, strukturierten Format [EU: DSGVO Art. 15 Abs. 3, Art. 20] → LAW-04, LAW-25.
Prüfen: Export auslösen und Vollständigkeit gegen das Datenmodell prüfen.

### DAT-12 · Ö · E — Personenbezogene und sensible Daten sind markiert
Im Datenmodell ist erkennbar, welche Felder personenbezogen oder besonders sensibel sind;
daraus folgen Verschlüsselung, Log-Ausschluss, Export und Löschung.
Prüfen: Liste der Felder mit Personenbezug; stimmt sie mit Export und Löschung überein?

### DAT-13 · B · F — Test- und Beispieldaten sind synthetisch
Keine echten Produktionsdaten in Test, Entwicklung oder Beispielen; Seeds erzeugen
offensichtlich erfundene Werte.
Prüfen: Seeds und Fixtures; Herkunft von Testdatenbanken.

### DAT-14 · Ö · G — Datenbankzugriffe sind auf ihre Last geprüft
Keine N+1-Abfragen auf Listen, Indizes für die häufigen Filter, langsame Abfragen werden
protokolliert und regelmäßig angesehen.
Prüfen: Query-Log einer Listen-Seite; Protokoll langsamer Abfragen.

### DAT-15 · B (zahlungen) · F — Zahlungen folgen einem Zustandsmodell mit Abgleich
Jede Zahlung hat explizite Zustände und erlaubte Übergänge (angelegt, autorisiert,
bezahlt, fehlgeschlagen, erstattet …); Ereignisse des Zahlungsdienstes werden
idempotent verarbeitet und vertragen Verspätung, Doppelung und falsche Reihenfolge
(→ API-15). Ein regelmäßiger Abgleich mit dem Zahlungsdienst findet Abweichungen, statt
sich auf eingehende Benachrichtigungen allein zu verlassen.
Prüfen: Zustandsmodell dokumentiert; dasselbe Ereignis zweimal und zwei Ereignisse in
vertauschter Reihenfolge einspielen; Ergebnis des letzten Abgleichs.

### DAT-16 · Ö · F — Objektspeicher und Suchindex folgen den Regeln der Datenbank
Dateien und Indexeinträge haben dieselben Zugriffsrechte, Mandantengrenzen und
Löschfristen wie die Datensätze, zu denen sie gehören: Löschung wird weitergegeben,
verwaiste Objekte werden gefunden und entfernt, der Suchindex lässt sich aus der Quelle
neu aufbauen → SEC-11, DAT-10.
Prüfen: Datensatz mit Anhang löschen — sind Datei und Indexeintrag weg? Zahl verwaister
Objekte; Dauer eines Index-Neuaufbaus.
