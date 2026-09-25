# 01 — Produkt & Anforderungen

Die teuersten Fehler entstehen vor dem Code: In einer Befragung von 228 Unternehmen
waren unvollständige oder verdeckte Anforderungen, Kommunikationslücken zum Kunden und
sich verschiebende Ziele die meistgenannten Ursachen gescheiterter Projekte [NAPIRE].
Gliederungsrahmen: req42 [REQ42]. Tiefe Erhebung und DDD → Skill `analyse-qs`, Abschnitte 1, 2, 4. Quellenkürzel
→ [QUELLEN.md](QUELLEN.md).

### REQ-01 · B · E — Ziele und Nicht-Ziele stehen fest
Wofür die App da ist, woran Erfolg gemessen wird, und was ausdrücklich nicht dazugehört.
Prüfen: Dokument mit Zielen und Erfolgskriterien (arc42 Kap. 1); Nicht-Ziele benannt.

### REQ-02 · B · E — Stakeholder sind vollständig erfasst und wirklich befragt
Nutzerrollen, Betrieb, Administration, Recht/Datenschutz, Integratoren, Support — und je
Gruppe die tatsächlich genutzte Quelle (Gespräch, Beobachtung, Bestandssystem, Norm)
[IREB-CPRE] [NAPIRE].
Prüfen: Liste mit Quelle je Gruppe; Gruppen ohne Quelle sind eine Lücke.

### REQ-03 · B · E — Systemkontext und Schnittstellen nach außen sind abgegrenzt
Welche Nutzer und Fremdsysteme mit der App sprechen, über welche Kanäle, mit welchen
Daten (arc42 Kap. 3) [ARC42].
Prüfen: Kontextdiagramm gegen die tatsächlichen Integrationen im Code.

### REQ-04 · B · E — Anforderungen sind einzeln prüfbar formuliert
Atomar, eindeutig, lösungsneutral, mit Akzeptanzkriterium und Begründung [ISO29148]
[IREB-CPRE]. Zu abstrakte Anforderungen sind ein häufig genanntes Problem [NAPIRE].
Prüfen: Stichprobe von zehn Anforderungen gegen diese Kriterien.

### REQ-05 · Ö · E — Qualitätsanforderungen sind messbare Szenarien
Nicht „schnell und sicher“, sondern Quelle, Auslöser, Umgebung, Reaktion und Messgröße
(„95 % der Suchanfragen unter 300 ms bei 200 gleichzeitigen Nutzern“)
[BASS-SAIP]. Vollständigkeit gegen die Merkmale des Qualitätsmodells prüfen
(funktionale Eignung, Effizienz, Kompatibilität, Interaktionsfähigkeit, Zuverlässigkeit,
Sicherheit, Wartbarkeit, Flexibilität, Safety) [ISO25010]. Studien zeigen, dass
Qualitätsanforderungen in der Praxis meist vage, ohne Maß und getrennt von den
funktionalen stehen, oft vom Architekten allein festgelegt [ECKHARDT16] [AMELLER12].
Prüfen: Liste der Qualitätsszenarien mit Zielwert (arc42 Kap. 10); Merkmale ohne
Szenario sind begründet ausgeschlossen.

### REQ-06 · B · E — Randbedingungen einschließlich Recht sind erfasst
Technisch (Hosting, Sprachen, Bestandssysteme), organisatorisch (Team, Budget, Termine)
und rechtlich (→ Bereich 06) — als eigene Liste (arc42 Kap. 2).
Prüfen: Liste vorhanden; rechtliche Bedingungen aus Abschnitt 1 des Skills (Profil)
übernommen.

### REQ-07 · Ö · E — Anforderungen haben ID, Priorität und Status
Muss/Soll/Kann, Status, Herkunft; Rückverfolgbarkeit Anforderung → Umsetzung → Test.
Prüfen: Stichprobe — lässt sich von einer Anforderung zum Test gehen?

### REQ-08 · B · L — Änderungen an Anforderungen folgen einem Weg
Sich ändernde Ziele sind normal; entscheidend ist, dass Änderungen bewertet, entschieden
und nachgezogen werden [NAPIRE].
Prüfen: letzte geänderte Anforderung — wo steht die Entscheidung?

### REQ-09 · B · E — Ein Glossar legt die Fachbegriffe fest
Ein Begriff pro Konzept, identisch in Gesprächen, Code, UI und Doku (arc42 Kap. 12);
Abweichungen sind entweder Fehler oder dokumentierte Synonyme.
Prüfen: drei Kernbegriffe in Code, UI und Doku vergleichen.

### REQ-10 · Ö · E — Der Lebenszyklus einer öffentlichen App ist vollständig bedacht
Jeder Punkt dieser Liste ist Anforderung oder begründet ausgeschlossen: Registrierung mit
Bestätigung, abgesicherte Ersteinrichtung, Sperren mit sofortiger Wirkung, Konto löschen
und Daten exportieren, Rechtstexte, Update- und Backup-Weg, sichtbare Version,
Support-Kontakt. Details in den Bereichen 04–09.
Prüfen: Liste gegen die Anforderungen abhaken.
