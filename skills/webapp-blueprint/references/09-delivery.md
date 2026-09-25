# 09 — Delivery & Releases

Ziel: Änderungen kommen klein, häufig und umkehrbar in Produktion, und jeder weiß,
welche Version läuft. Quellenkürzel → [QUELLEN.md](QUELLEN.md).

### DEL-01 · B · F — Ein Gate entscheidet über Merge, nicht die Selbsteinschätzung
Ein Kommando bündelt statische Analyse, Typprüfung, Formatter-Check und Tests; es läuft
in der CI bei jeder Änderung und blockiert den Merge per Pflicht-Check. In einer Studie
zu CI in Open-Source-Projekten (34.544 Projekte, rund 1,5 Mio. Builds) ging CI mit
häufigeren Releases einher — ein Zusammenhang, kein Kausalbeweis [HILTON16]. Ohne Branch-Schutz sind alle
Prüfungen nur Anzeigen. (Vollständiger Gate-Katalog → Skill `analyse-qs`, Abschnitt 5.)
Prüfen: Branch-Schutz-Einstellung; ein roter Lauf, der einen Merge verhindert hat.

### DEL-02 · B · F — Kurzlebige Branches, häufige Integration
Wenige aktive Branches, Integration in den Hauptzweig mindestens täglich, keine
Code-Freezes als Normalfall [DORA-TBD]. Die Stützung stammt aus Umfrageforschung
(→ QUELLEN, Evidenzlage).
Prüfen: Alter der ältesten offenen Branches.

### DEL-03 · B · F — Deploy ist automatisiert und in eine echte Umgebung geübt
Build einmal, dasselbe Artefakt nach Test und Produktion (→ OPS-07); Deploy per
Pipeline, nicht per Hand auf dem Server; eine produktionsnahe Testumgebung existiert.
Prüfen: Ablauf des letzten Deploys; manuelle Schritte darin.

### DEL-04 · B · F — Rollback ist ein geübter, schneller Vorgang
Die vorherige Version lässt sich in Minuten wiederherstellen; die Dauer ist gemessen.
Voraussetzung: Schema-Änderungen sind mit der Vorversion verträglich (→ DAT-04).
Prüfen: Dauer des letzten Rollbacks oder einer Übung.

### DEL-05 · Ö · G — Riskante Änderungen gehen schrittweise live
Canary oder gestaffelter Rollout mit wenigen SLI-Vergleichen zwischen neuer und alter
Version und automatischem oder klar definiertem Abbruch [SRE-CANARY]; Blue/Green als
Alternative. Bei `selbst-gehostet` ist die Entsprechung ein Release-Kanal mit
Vorabversionen, die vor der allgemeinen Freigabe bei einigen Betreibern laufen.
Prüfen: Rollout-Strategie der Pipeline; Abbruchkriterien.

### DEL-06 · Ö · F — Feature-Flags sind Inventar mit Ablaufdatum
Release-Flags leben kurz und haben einen Entfernungsplan; Betriebs-Flags dienen als
Notschalter; jedes Flag hat Eigentümer und Zweck [FOWLER-FLAGS].
Prüfen: Liste der Flags mit Alter; Flags älter als ihr geplantes Ende.

### DEL-07 · B · F — Versionierung nach SemVer, sichtbar im Betrieb
Releases nach Semantic Versioning [SEMVER]; die laufende Version samt Commit ist für
Betreiber abrufbar (intern oder im Footer, nicht zwingend öffentlich) und stammt aus
genau einer Quelle.
Prüfen: Version an zwei Stellen abrufen — stimmen sie überein?

### DEL-08 · B · L — Changelog pro Release
Für Menschen geschrieben, gegliedert nach Added, Changed, Deprecated, Removed, Fixed,
Security [KAC]. Bei `api-extern` zusätzlich API-07.
Prüfen: letzter Changelog-Eintrag gegen letzten Tag.

### DEL-09 · Ö (selbst-gehostet) · G — Es gibt einen sicheren Update-Pfad beim Betreiber
Update ohne Build auf dem Server, mit vorheriger Sicherung, Wartungsmodus, Prüfung der
Migrationen und Rückweg; unterstützte Update-Sprünge (Versionen überspringen?)
dokumentiert → OPS-21.
Prüfen: Update-Anleitung; Test eines Updates über zwei Versionen.

### DEL-10 · Ö · L — Lieferleistung wird gemessen
Die fünf DORA-Kennzahlen: Durchlaufzeit einer Änderung, Deploy-Häufigkeit, Zeit zur
Wiederherstellung nach fehlgeschlagenem Deploy, Änderungsfehlerrate,
Nacharbeitsquote von Deploys [DORA-METRICS]. Kennzahlen dienen der eigenen
Verbesserung, nicht dem Vergleich von Teams; möglichst aus Systemdaten statt aus
Selbstauskunft erhoben [FORSGREN-CACM18]. Die Forschung dahinter beruht auf Umfragen
[ACCELERATE] — sie zeigt Zusammenhänge, keinen Kausalbeweis.
Prüfen: Wo werden die Werte erhoben, und wann zuletzt angeschaut?

### DEL-11 · Ö · F — Umgebungen sind beschrieben und reproduzierbar
Infrastruktur und Konfiguration als versionierte Beschreibung; eine neue Umgebung
entsteht aus dem Repo plus Geheimnissen, ohne Wissen aus Köpfen. Vor einem Deploy
auf eine neue Umgebung ist der Umgebungs-Vertrag geklärt (Ziel, Artefaktweg,
Geheimnisse, Rollback).
Prüfen: Wie lange dauert es, eine Testumgebung neu aufzubauen?

### DEL-12 · Ö · L — Jede Konfigurationsoption ist inventarisiert und wirksam
Jede Einstellung und Umgebungsvariable hat Zweck, Default und Eigentümer und wird im
Code tatsächlich gelesen und durchgesetzt. Eine Option ohne Wirkung täuscht Betreiber:
sie glauben an ein Limit oder einen Schalter, den es nicht gibt → ARC-14.
Prüfen: Liste der Einstellungen gegen ihre Lesestellen im Code; je Limit ein Test.
