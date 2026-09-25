# 02 — Architektur & Dokumentation

Architektur ist hier die Summe der Entscheidungen, die später teuer zu ändern sind —
und ihre Dokumentation ist das, was diese Entscheidungen nachvollziehbar hält.
Quellenkürzel → [QUELLEN.md](QUELLEN.md).

## Struktur

### ARC-01 · B · E — Module nach Änderungsgründen schneiden
Jedes Modul kapselt eine Entscheidung, die sich wahrscheinlich ändert (Information
Hiding), nicht einen Ablaufschritt [PARNAS72]. Fachliche Grenzen (Bounded Contexts)
sind die natürlichen Modulgrenzen.
Prüfen: Welche Module ändern sich bei einer typischen Fachänderung gemeinsam? Viele →
Schnitt prüfen.

### ARC-02 · B · E — Abhängigkeiten zeigen nach innen
Fachkern ohne Framework-, Transport- und IO-Abhängigkeiten; Einstiegspunkte
(Controller, Handler, CLI) rufen Anwendungsfälle auf und greifen nicht selbst auf
Persistenz zu; Geschäftslogik liegt nicht im Einstiegspunkt.
Prüfen: Importe des Kerns; Datenbankzugriffe aus Controllern.

### ARC-03 · B · E — Modularer Monolith als Ausgangspunkt
Verteilung (Microservices) nur, wenn eine benannte Qualitätsanforderung sie erzwingt
(unabhängige Skalierung, getrennte Teams, getrennte Release-Zyklen). Die Belege für
Vorteile von Microservices stammen überwiegend aus grauer Literatur, und Rückmigrationen
zum Monolithen sind dokumentiert [SOLDANI18] [SU24].
Prüfen: ADR zum Architekturstil mit der erzwingenden Anforderung.

### ARC-04 · Ö · E — Team- und Modulgrenzen werden gemeinsam geplant
Die Struktur eines Systems spiegelt häufig die Kommunikationsstruktur der Organisation;
der Effekt ist innerhalb von Firmen gut belegt, in offenen Communities schwächer
[CONWAY68] [COLFER16].
Prüfen: Zuständigkeit je Modul; Module mit mehreren gleichberechtigten Teams.

### ARC-05 · Ö · F — Architekturregeln werden mechanisch geprüft
Erlaubte Abhängigkeitsrichtungen als automatischer Check in der CI; Abweichungen sind
bewusste Entscheidungen (ADR) oder erfasste Schuld. Erosion hat auch organisatorische
Ursachen, gegen die Doku allein nicht hilft [LI-EROSION22].
Prüfen: Architektur-Check im Gate; letzte erfasste Abweichung.

### ARC-06 · B · E — Querschnittsthemen haben genau eine Umsetzung
Authentifizierung, Autorisierung, Fehlerformat, Logging, Konfiguration, Übersetzung,
Mandantenfilter: je ein Baustein, der überall wiederverwendet wird (arc42 Kap. 8).
Prüfen: Suche nach Parallelimplementierungen desselben Querschnittsthemas.

### ARC-07 · Ö · L — Technische Schulden stehen in einem Register
Bewusst eingegangene und entdeckte Schulden mit Ursache, Folgekosten und Plan (arc42
Kap. 11) [KRUCHTEN12]; laufende Anpassung ist fest eingeplant, weil genutzte Software
sonst an Komplexität zunimmt [LEHMAN80].
Prüfen: Register vorhanden; ältester Eintrag und sein Status.

## Dokumentation

### ARC-08 · Ö · E — Architekturdoku in einem festen Gerüst
arc42 (zwölf Kapitel, Version 9.0) [ARC42] oder eine gleichwertige feste Struktur, die
dieselben Anliegen abdeckt, als Gliederung; nicht zutreffende Kapitel mit
Begründung als „nicht relevant“ markiert statt mit Füllprosa. Bestehende Doku wird in das
Gerüst umsortiert, nicht daneben gestellt. Die Gliederung folgt den Anliegen der
Stakeholder: Wer muss was verstehen oder entscheiden? [ISO42010]
Prüfen: Kapitelübersicht; Kapitel 1, 3, 4, 5, 9, 10 befüllt.

### ARC-09 · Ö · E — Entscheidungen als kurze, versionierte ADRs
Kontext, Entscheidung, Konsequenzen; neben dem Code, unveränderlich, durch neue ADRs
ersetzt statt überschrieben [NYGARD11]. In einer Aktionsforschungsstudie halfen ADRs
bei Wissenstransfer und Doku-Kultur — die Evidenz ist schmal [AHMETI24].
Prüfen: ADR-Verzeichnis; die Entscheidungen aus Phase `E` (Skill-Abschnitt 4) sind
jeweils ein ADR.

### ARC-10 · Ö · E — Diagramme mit festen Abstraktionsebenen
Kontext, Container, Komponenten (C4-Ebenen) [C4]; jedes Diagramm sagt, welche Ebene es
zeigt. Diagramme stehen als Quelltext im Repo und rendern.
Prüfen: Kontext- und Containerdiagramm vorhanden und aktuell zum Code.

### ARC-11 · B · L — Doku lebt im Repo und wird im Review geprüft
Veraltete Doku ist eine der häufigsten Dokumentationsschwächen [AGHAJANI19]; Doku, die
eine Änderung betrifft, wird im selben Pull Request angepasst, und Behauptungen werden
gegen den Code geprüft.
Prüfen: letzte Architekturänderung — wurde die Doku im selben PR angepasst?

### ARC-12 · Ö · G — Betriebsdoku existiert für die, die nachts gerufen werden
Runbooks je Alarm (→ OBS-17), Deploy- und Rollback-Anleitung, Restore-Anleitung,
Kontaktliste; auffindbar ohne Zugriff auf das laufende System.
Prüfen: Runbook-Verzeichnis; wo liegt es, wenn die App ausfällt?

### ARC-13 · B · F — Der Einstieg für Entwickler ist in unter einer Stunde möglich
README mit Zweck, lokalem Start, Tests, Gate-Kommando und Verweis auf die Architekturdoku.
Prüfen: frischer Checkout nach README starten und die Zeit messen.

### ARC-14 · B · L — Schutz- und Betriebsbehauptungen der Doku sind belegt
Was die Doku über Limits, Verschlüsselung, Trennung, Fail-fast, Backups oder
Schalter verspricht, verweist je Aussage auf die Stelle, die es durchsetzt, oder den
Test, der es zeigt. Eine unbelegte Schutzbehauptung ist gefährlicher als keine, weil
Betreiber und Prüfer sich darauf verlassen → ARC-11.
Prüfen: jede solche Aussage in README, Architektur- und Betriebsdoku gegen Code
oder Test.
