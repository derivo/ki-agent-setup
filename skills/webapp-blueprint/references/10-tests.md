# 10 — Qualität & Tests

Ziel: Tests finden Fehler, bevor Nutzer es tun, und sind so verlässlich, dass ein roter
Lauf ernst genommen wird. Vollständiger Gate-Katalog → Skill `analyse-qs` Abschnitt 5;
UI-Testlücken je Rolle und Formular → Skill `ui-test-gap-audit`. Begriffe und
Testprozess nach ISO/IEC/IEEE 29119 [ISO29119] und dem ISTQB-Lehrplan [ISTQB-CTFL4].
Quellenkürzel → [QUELLEN.md](QUELLEN.md).

### TST-01 · B · E — Die Teststrategie ist aus den Risiken abgeleitet
Welche Ebenen (Unit, Integration, End-to-End) welche Risiken abdecken, steht fest. Das
Mengenverhältnis der Testpyramide ist eine Praxisheuristik, keine belegte Regel — selbst
Google nennt 80/15/5 ausdrücklich eine „very rough guideline“ [SWEBOOK20]; eine Studie,
die ein bestimmtes Verhältnis stützt, ist nicht bekannt. Maßgeblich ist, dass jedes
relevante Risiko auf der billigsten Ebene getroffen wird, auf der die Grenze wirklich
wirkt. Risiko hängt auch an der Änderung: bei Google schlugen Tests vor allem nahe am
geänderten Code fehl, und Code, den kürzlich viele Personen geändert hatten, brach
häufiger [MEMON17].
Prüfen: Strategie-Dokument; Top-Risiken aus 01/05 und die Tests, die sie abdecken.

### TST-02 · B · F — Ein Durchstich-Test von Anfang an
Mindestens ein Test, der die App wie im Betrieb startet und einen Ablauf durch alle
Schichten fährt — echte Datenbank, echte Konfiguration.
Prüfen: Testname und letzter Lauf.

### TST-03 · B · F — Autorisierung ist je Endpunkt gegen ein fremdes Konto getestet
Siehe SEC-10; die Liste der Endpunkte kommt aus der Routenliste.
Prüfen: Endpunkte ohne Fremdkonto-Test zählen.

### TST-04 · B · F — Formulare sind mit einer Fehlerfall-Matrix getestet
Je Feld genau ein Fehler, alle anderen korrekt, durch alle Felder rotiert; exakte
Fehlertexte; Absenden per Tastatur als eigener Pfad; Happy Path zuletzt. Die
Fehlerwerte je Feld kommen aus Äquivalenzklassen und Grenzwerten [ISTQB-CTFL4]
(Hausstandard des ki-agent-setup für UI-Formulare).
Prüfen: Matrix-Tests je Formular.

### TST-05 · B · F — Tests sind deterministisch
Keine festen Wartezeiten, sondern Warten auf Zustände; Tests unabhängig von Reihenfolge
und voneinander isoliert; die häufigsten Ursachen instabiler Tests sind asynchrones
Warten, Nebenläufigkeit und Reihenfolgeabhängigkeit [LUO14]; in 22.352 Python-Projekten
gingen 59 % der instabilen Tests auf Reihenfolgeabhängigkeit zurück [GRUBER21].
Deshalb läuft die Suite in zufälliger Reihenfolge. Instabilität entwertet jeden roten
Lauf: bei Google betrafen 84 % der Wechsel von grün nach rot einen instabilen Test
[MICCO16]. Wiederholen ist kein Nachweis — für 95 % Sicherheit, dass ein Test stabil
ist, wären im Schnitt 170 Wiederholungen nötig [GRUBER21]. Instabile Tests werden mit
Eigentümer und Frist in Quarantäne genommen und behoben, nicht wiederholt, bis sie grün
sind [PARRY21].
Prüfen: `sleep`-Aufrufe in Tests; Wiederholungs-Plugins; Reihenfolge zufällig?;
Quarantäneliste mit Frist; Rate instabiler Läufe.

### TST-06 · Ö · L — Abdeckung ist ein Hinweis, kein Ziel
Abdeckung wird gemessen und darf nicht sinken, ist aber nur schwach mit der Wirksamkeit
einer Testsuite korreliert [INOZEMTSEVA14]. Für die Testgüte an kritischen Stellen ist
Mutationstesten aussagekräftiger: erkannte Mutanten hängen mit erkannten realen Fehlern
zusammen [JUST14], und bei Google führte es zu mehr und besseren Tests [PETROVIC21].
Prüfen: Abdeckungsverlauf; Mutationsergebnis für Kernmodule (bei K).

### TST-07 · B · F — Grenzen werden auf dem Pfad getestet, auf dem sie wirken
Ein Test, der die durchsetzende Schicht überspringt (Fake-Upload statt echter Grenze,
Übersetzungsschlüssel gegen sich selbst geprüft), belegt die Grenze nicht.
Prüfen: Tests für Limits und Validierungen — wo greift die Grenze im Betrieb?

### TST-08 · Ö · F — Statische Analyse ist eine Schicht unter mehreren
Befunde erscheinen im Review des Pull Requests; laute Regeln werden abgeschaltet statt
ignoriert [SADOWSKI18] [JOHNSON13]. Werkzeuge übersehen einen großen Teil realer
Schwachstellen [LIPP22] — grüne Analyse ist kein Sicherheitsnachweis.
Prüfen: Analyse im Gate; Umgang mit Befunden im letzten PR.

### TST-09 · Ö · G — Barrierefreiheit ist geprüft
Automatische Prüfung auf jeder berührten Seite in allen Farbmodi plus Tastatur-Durchgang
bei interaktiven Änderungen → UX-12 bis UX-15.
Prüfen: Befehl + Ergebnis des letzten Laufs.

### TST-10 · Ö · G — Nicht-funktionale Anforderungen haben Tests
Jedes Qualitätsszenario aus REQ-05 hat einen Test oder eine Messung mit Zielwert
(Last, Latenz, Wiederherstellungszeit). Lasttests planen alle drei Phasen ausdrücklich:
realistische Last entwerfen (Nutzungsmix, Datenmenge), ausführen, Ergebnisse gegen den
Zielwert auswerten [JIANG15].
Prüfen: Szenarioliste gegen Testliste; Herkunft des Lastprofils.

### TST-11 · B · F — Tests laufen gegen isolierte Daten
Keine parallelen Suiten gegen eine geteilte Datenbank; jede Suite räumt ihre Daten
selbst auf oder läuft in einer Transaktion.
Prüfen: CI-Konfiguration der Testdatenbanken.

### TST-12 · B · F — Fehlerbehandlung ist getestet
Jeder Fehlerpfad — `catch`, Fallback, Retry, Rollback — hat einen Test, der den Fehler
auslöst; leere oder nur loggende Handler sind ein Befund. In 198 Ausfällen verteilter
Systeme gingen 92 % der katastrophalen auf falsch behandelte, ausdrücklich gemeldete
Fehler zurück; in 58 % hätte einfaches Testen des Fehlerbehandlungscodes genügt
[YUAN14] → SEC-29.
Prüfen: Fehler-Handler im Code gegen Tests, die sie auslösen; Handler, die nur loggen.

### TST-13 · B · F — Tests prüfen das fachliche Ergebnis
Eine Assertion prüft, was herauskommen soll — Wert, Zustand, Nebenwirkung —, nicht nur,
dass nichts abstürzt. Ohne starkes Orakel findet auch hohe Abdeckung wenig
[BARR15] → TST-06. Wo das erwartete Ergebnis schwer zu bestimmen ist, helfen
Eigenschaften und Beziehungen zwischen Ergebnissen (→ TST-14).
Prüfen: Stichprobe von zehn Tests — wie viele prüfen ein fachliches Ergebnis?

### TST-14 · Ö · F — Vertrauensgrenzen werden mit erzeugten Eingaben geprüft
Parser, Validierung, Serialisierung und Upload-Verarbeitung werden zusätzlich zu
Beispielen mit generierten Eingaben geprüft: als Eigenschaften, die für alle Eingaben
gelten [CLAESSEN00], und als Fuzzing mit ungültigen und unerwarteten Eingaben
[BOEHME21]. In der Praxis lohnt sich eigenschaftsbasiertes Testen vor allem bei
komplexem Code, kostet aber Aufwand für Generatoren [GOLDSTEIN24]. Für HTTP-APIs gibt
es automatische Testgeneratoren; sie ergänzen, ersetzen aber keine fachlichen Tests
[GOLMOHAMMADI23] [KIM22].
Prüfen: Liste der Vertrauensgrenzen; welche haben generierte Eingaben?

### TST-15 · B · F — Jeder behobene Fehler hat einen Regressionstest
Vor dem Fix ein Test, der den Fehler reproduziert und rot ist; danach grün. So bleibt
der Fehler behoben und der Test belegt, dass er die Ursache trifft. Hausstandard des
ki-agent-setup; Praxisregel ohne eigenen Studienbeleg.
Prüfen: die letzten fünf Bugfixes — je ein Test, der vor dem Fix scheiterte?

### TST-16 · Ö · F — Sicherheitsanforderungen und -befunde werden zu Tests
Die gewählten ASVS-Anforderungen sind prüfbare Aussagen [ASVS5]; die wichtigsten davon
— Autorisierung (TST-03), Sitzungsende, Header, Rate-Limits, Uploads — laufen als
automatisierte Tests im Gate. Jeder Befund aus Scan, Pentest oder Meldung (SEC-28,
SEC-30, SEC-33) bekommt nach dem Fix einen Regressionstest (→ TST-15). Sicherheits-
tests brauchen Sicherheitswissen [VOTIPKA18].
Prüfen: Sicherheitsbefunde des letzten Jahres gegen Tests; Sicherheitstests im Gate.

### TST-17 · Ö · G — Ausfall und Verlangsamung von Abhängigkeiten sind getestet
Datenbank, Cache, Queue und Fremddienste werden im Test gezielt abgeschaltet oder
verlangsamt; beobachtet wird, ob Timeouts, Circuit Breaker und Fehlermeldungen wie
geplant wirken → OPS-01 bis OPS-03. Systematische Experimente dieser Art beschreibt
Chaos Engineering [BASIRI16]. Experimente in Produktion — Netflix automatisiert sie
[BASIRI19] — nur bei K, mit begrenztem Wirkungsbereich und Abbruchkriterium.
Prüfen: letzter Test mit ausgefallener und mit langsamer Abhängigkeit; Ergebnis.

### TST-18 · Ö · L — Testcode hat Qualitätsregeln
Ein Verhalten je Test, sprechende Namen, klare Assertions, keine Tests, die ihr Ziel nur
indirekt über andere Klassen prüfen. Test Smells sind verbreitet und erschweren das
Verständnis [BAVOTA12]; Tests mit Smells sind fehleranfälliger, ebenso der Produktions-
code, den sie prüfen [SPADINI18]. Testcode wird wie Produktionscode reviewt.
Prüfen: Review-Kommentare zu Tests im letzten PR; Stichprobe auf Smells.

### TST-19 · Ö · G — Exploratives Testen ist geplant
Vor größeren Releases zeitlich begrenzte Sitzungen mit Ziel und Notizen, durchgeführt
von Personen mit Domänenwissen. Im Experiment fand exploratives Testen Fehler ebenso
effizient wie testfallbasiertes, bei weniger falschen Fehlermeldungen [ITKONEN07]; viele
Funde lagen außerhalb des eigentlichen Testfokus [ITKONEN13].
Prüfen: Notizen der letzten Sitzung; daraus entstandene Tickets.

### TST-20 · Ö · F — Migrationen werden gegen realistische Daten getestet
Jede Migration läuft in der CI auf leerer Datenbank und vor dem Deploy auf einer Kopie
mit produktionsnaher Menge (synthetisch oder anonymisiert → DAT-13); gemessen werden
Dauer und Sperren, geprüft wird der Rückweg (→ DAT-03, DAT-04). Praxisregel ohne
eigenen Studienbeleg.
Prüfen: Laufzeit der letzten Migration auf produktionsnahen Daten.
