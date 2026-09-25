---
name: analyse-qs
description: 'Prüft und strukturiert Analyse und Qualitätssicherung eines Projekts: Requirements Engineering (IREB), req42, arc42, Domain-Driven Design (Domäne, Bounded Contexts, Aggregate, Factory) und den QS-Gate-Katalog der CI. Use when the user asks whether requirements were elicited properly, wants architecture docs on arc42, asks about req42, wants the domain modelled (DDD, Glossar, Bounded Context, Factory), or asks which quality gates are missing — e.g. "haben wir die Anforderungen sauber erhoben", "macht arc42 Sinn", "bau die Architektur-Doku auf arc42 um", "definier die Domäne", "welche QS-Gates fehlen", "sind wir public-ready". Default ist ein Read-only-Audit mit belegter Lückenliste; Artefakte entstehen erst nach Freigabe.'
---

# analyse-qs

Anforderungen, Architektur-Doku, Domänenmodell und Qualitäts-Gates beantworten dieselbe
Frage aus vier Richtungen: **Bauen wir das Richtige, ist es nachvollziehbar
beschrieben, und wird es mechanisch festgehalten?** Dieser Skill prüft alle vier gegen
den Bestand und liefert eine belegte Lückenliste — kein Methoden-Vortrag, keine
Dokumente auf Vorrat.

## Grundregeln

- **Audit zuerst, read-only.** Ohne ausdrückliche Freigabe entsteht keine Datei, kein
  Issue, keine CI-Änderung. Entscheidungen des Nutzers per Rückfrage-Tool, eine Frage je
  Entscheidung, Empfehlung zuerst.
- **Bestand vor Vorlage.** Existiert schon eine Architektur-Doku, ein Requirements-File,
  ein Glossar oder ADRs, wird **umgebaut, nicht daneben gestellt**. Zwei Quellen für
  dieselbe Sache sind schlechter als eine unvollständige.
- **Jede Aussage belegt** — Datei:Zeile, Befehl + Ergebnis, Workflow-Name. Was nur ein
  Lauf belegen könnte und nicht gelaufen ist: `UNBEKANNT`.
- **Methode liefert Struktur, nicht Umfang** (`harness/GUARDRAILS.md` §0). Ein
  arc42-Kapitel, das für das Projekt nichts trägt, wird mit Begründung als „nicht
  relevant“ markiert, nicht mit Füllprosa befüllt.
- **Nicht doppeln, verweisen:** Spec-Zerlegung → `harness/SPEC_WORKFLOW.md`, Tests und
  Matrix → `harness/TESTS.md`, Fertig-Kriterium und Security-Pass →
  `harness/GUARDRAILS.md` C/E, Doku-Struktur und Claims-Gate → `doc-harness/`,
  Design-Quelle → Skill `design-md-curator`, UI-Testlücken → Skill `ui-test-gap-audit`,
  ADR-Form → `harness/ADR_TEMPLATE.md`, Diagramme → `harness/ENGINEERING.md` §8.

## 1. Requirements Engineering (IREB-Kernaktivitäten)

Geprüft wird, ob jede der vier Aktivitäten stattgefunden hat — nicht, ob ein Dokument
mit dem richtigen Namen existiert.

| Aktivität | Prüffrage | Typische Lücke |
|---|---|---|
| **Ermitteln** | Wer sind die Stakeholder (Nutzerrollen, Betreiber, Admin, Recht/DSGVO, Integratoren)? Welche wurden tatsächlich befragt? Welche Quellen (Gespräch, Code-Befund, Bestandssystem, Norm)? | Nur ein Stakeholder; Anforderungen nur aus Befunden abgeleitet statt gegen eine Checkliste |
| **Dokumentieren** | Gibt es Ziele, Systemkontext/Scope, funktionale Anforderungen, **Qualitätsanforderungen als messbare Szenarien**, Randbedingungen (technisch, organisatorisch, **rechtlich**) und ein Glossar? | Qualität und Randbedingungen fehlen fast immer |
| **Prüfen & Abstimmen** | Ist jede Anforderung atomar, lösungsneutral, prüfbar (Akzeptanzkriterium), eindeutig, begründet und vom Stakeholder freigegeben? | Lösung steht in der Anforderung („Prometheus“, „Dialog“); mehrere Anforderungen in einer Zeile |
| **Verwalten** | Haben Anforderungen IDs, Priorität (Muss/Soll/Kann), Status und Traceability Anforderung ↔ Issue ↔ Phase ↔ Test? Wie werden Änderungen nachgezogen? | Alles „Muss“; Traceability endet vor dem Test |

**Lebenszyklus-Checkliste für eine öffentlich erreichbare Web-App** — jede Zeile ist
entweder als Anforderung erfasst oder begründet ausgeschlossen:

- Betrieb: https hinter Proxy (nur vertraute Forwarded-Header), sichtbare Version aus
  einer Quelle, Changelog, Update ohne Build auf dem Server mit Backup und Rollback,
  Update-Hinweis, Health- und nicht-öffentliche Metrik-Endpunkte, Backup/Restore mit
  Zielwerten (RTO/RPO)
- Konten: E-Mail-Bestätigung, abgesicherte Erst-Einrichtung (kein Doppel-Admin),
  Sperren mit **sofortiger** Wirkung auch auf gültige Tokens, Löschen (endgültig +
  Anonymisierung geteilter Beiträge), Aufbewahrungsfrist für Archiviertes
- Recht/DSGVO: Datenexport, Impressum, Datenschutzerklärung, AGB bei offener
  Registrierung, benannter Verantwortlicher
- Auth: kurzlebige, widerrufbare Zugänge statt statischer Keys, keine Tokens in
  Query-Strings, Rate-Limits auf Anmeldung und Anlage

## 2. req42 — als Struktur-Checkliste, nicht als drittes Dokument

req42 ordnet Anforderungsarbeit in Ziele, Stakeholder, Kontext, Anforderungen,
Qualität, Randbedingungen, Glossar und Priorisierung. **Empfehlung im Normalfall:** keine
eigene req42-Dokumentation, wenn Issues und ein Requirements-File (z. B. GSD
`.planning/REQUIREMENTS.md`) schon die Anforderungsquelle sind. Übernommen werden:

- die Gliederung als Checkliste für Abschnitt 1,
- die **Priorisierung** (Spalte Muss/Soll/Kann im bestehenden Requirements-File),
- Ziele, Stakeholder, Kontext, Qualität, Glossar — diese wandern nach arc42 Kapitel 1,
  2, 3, 10, 12 (Abschnitt 3), damit sie genau eine Heimat haben.

Eigenes req42-Dokument nur, wenn mehrere Stakeholder-Gruppen außerhalb des
Entwicklerteams Anforderungen lesen und abnehmen müssen — dann mit Nutzer klären.

## 3. arc42 — Architektur-Doku mit fester Gliederung

Zwölf Kapitel; die Tabelle nennt, was aus dem Bestand wohin wandert.

| Kap. | Inhalt | Quelle im Bestand / Befüllung |
|---|---|---|
| 1 | Ziele, Top-3–5 Qualitätsziele, Stakeholder | Aus der RE-Runde (Abschnitt 1), nicht aus dem Code geraten |
| 2 | Randbedingungen | technisch, organisatorisch, rechtlich |
| 3 | Kontext (fachlich + technisch) | externe Systeme, Clients, Protokolle |
| 4 | Lösungsstrategie | Kernentscheidungen in Kurzform, verweist auf 9 |
| 5 | Bausteinsicht | bei DDD: ein Baustein je Bounded Context (Abschnitt 4) |
| 6 | Laufzeitsicht | kritische Abläufe (Login, Sync, Update) |
| 7 | Verteilungssicht | Container, Proxy, Netze, Umgebungen |
| 8 | Querschnittliche Konzepte | Auth, Mandantentrennung, Fehler-Shape, Logging, i18n |
| 9 | Architekturentscheidungen | **bestehende ADRs verlinken**, nicht kopieren |
| 10 | Qualitätsanforderungen | Qualitätsbaum + **Szenarien mit Zielwert** (Sicherheit, Verfügbarkeit, Backup/Restore, Performance) |
| 11 | Risiken & technische Schulden | offene Befunde, bekannte Lücken |
| 12 | Glossar | = Ubiquitous Language (Abschnitt 4), eine Liste |

- Bestehende Architektur-Doku wird **in die Gliederung umsortiert**; veraltete Aussagen
  fliegen raus (Claims-Gate `doc-harness/VERIFY.md`).
- Die arc42-Gliederung ist die „vorher definierte Struktur“, die das Doc-Harness für
  generierte Doku verlangt (`doc-harness/DOC_TEMPLATE.md`).
- **Timing:** vor einem großen Umbau (z. B. Auth-Modell) einführen, damit der Umbau
  direkt im richtigen Kapitel dokumentiert wird.
- Diagramme in Kap. 3, 5, 6, 7 nach `harness/ENGINEERING.md` §8.

## 4. Domain-Driven Design — Domäne und Bausteine

Erst prüfen, ob DDD trägt: Bei überwiegend CRUD ohne fachliche Invarianten reicht ein
Glossar plus Kontextgrenzen — taktische Muster wären Abstraktion auf Vorrat
(`GUARDRAILS.md` §0, `ENGINEERING.md` §5).

**Strategisch** (fast immer lohnend):
- **Domäne und Subdomänen:** Core (Differenzierung, hier liegt der Aufwand), Supporting,
  Generic (einkaufen oder Standard nutzen).
- **Bounded Contexts:** Grenze, innerhalb derer ein Begriff genau eine Bedeutung hat.
  Prüffrage: Hat ein Wort („Projekt“, „Owner“, „Nutzer“) an zwei Stellen verschiedene
  Regeln? Dann sind es zwei Kontexte oder ein Modellfehler.
- **Ubiquitous Language:** Begriffe aus Gesprächen, Code, UI und Doku stimmen überein.
  Befund, wenn Code `Item` sagt und die UI „Bibliothek“ — entweder angleichen oder im
  Glossar als Synonym festhalten. Das Glossar ist arc42 Kap. 12.
- **Context Map:** Beziehungen zwischen Kontexten (Shared Kernel, Customer/Supplier,
  Anticorruption Layer, Open Host Service) — nur die, die tatsächlich existieren.

**Taktisch** (nur im Core, nur wo Invarianten es verlangen):

| Baustein | Definition | Prüffrage im Code |
|---|---|---|
| Entity | Identität über die Zeit (ID), Zustand ändert sich | Trägt das Objekt eine stabile ID und Lebenszyklus? |
| Value Object | Durch Werte definiert, unveränderlich, ohne ID | Werden Beträge, Slugs, Zeitfenster als rohe Strings/Zahlen herumgereicht und an mehreren Stellen validiert? |
| Aggregate | Konsistenzgrenze mit Root; Invarianten gelten nach jeder Transaktion; Zugriff von außen nur über die Root | Wo steht „mindestens ein Owner“, „Slug eindeutig“? Verstreut über Router → Aggregat-Kandidat |
| Domain Service | Fachlogik, die keinem Aggregat allein gehört | Liegt Fachlogik im Controller/Handler? |
| Domain Event | Fachlich bedeutsames Ereignis in Vergangenheitsform | Werden Nebenwirkungen (Mail, Badge, Webhook) inline im Handler ausgelöst? |
| Repository | Laden/Speichern ganzer Aggregate, Persistenz verborgen | Greifen Handler direkt auf Tabellen mehrerer Aggregate zu? |
| **Factory** | Kapselt die **Erzeugung** eines Aggregats, wenn dabei Invarianten gelten oder mehrere Teile konsistent entstehen müssen | Wird ein Objekt an mehreren Stellen mit denselben Pflichtschritten angelegt (z. B. Projekt + Owner-Mitgliedschaft + Default-Einstellungen)? Dann eine Factory — sonst nicht. Ein Konstruktor ohne Invarianten braucht keine. |

Ergebnis des Audits ist eine Liste **konkreter** Kandidaten mit Datei:Zeile, keine
Umbau-Empfehlung für alles. Umsetzung nur nach Freigabe, als eigene Spec
(`harness/SPEC_WORKFLOW.md`).

## 5. QS-Gate-Katalog

Jedes Gate zählt nur, wenn es **einen Merge blockiert**. Ohne Branch-Protection mit
Pflicht-Checks sind alle Gates nur Anzeigen — das ist Befund Nr. 1, wenn es fehlt.

| Gate | Soll | Beleg |
|---|---|---|
| Branch-Protection | Pflicht-Checks auf dem Hauptbranch | Repo-Einstellung / API-Abfrage |
| Lint | Regelsatz konfiguriert, Hauptbranch befundfrei, Ausnahmen begründet | Linter-Lauf Exit 0 |
| Format | nur auf geänderten Dateien, kein Repo-Sweep als Nebenwirkung | CI-Schritt auf dem Diff |
| Tests | Teststrategie nach `harness/TESTS.md`, Durchstich vorhanden, Formular-Matrix | Testlauf + Zählung |
| Coverage | gemessen, Schwelle = Stand (Ratchet), Plan zum Ziel | Bericht als Artefakt |
| Dependencies | Update-Bot, gruppiert, kein Auto-Merge ohne Pflicht-Checks | Bot-Konfig |
| Schwachstellen (SCA) | Audit je Ökosystem, Gate ab „hoch“, Ausnahmen mit Ablaufdatum | CI-Lauf |
| SAST | z. B. CodeQL für die Sprachen des Repos | Workflow |
| Secrets | Secret-Scan (z. B. gitleaks) im PR | Workflow |
| Images | Scan veröffentlichter Images in der Release-Pipeline | Workflow |
| Barrierefreiheit | axe/pa11y je berührter Seite, alle Farbmodi | Tool + Befundzahl |
| Release | SemVer-Tags, Changelog pro Release, Version aus einer Quelle | Tag + Datei |
| Migrationen | jede mit Rückweg (`downgrade()`/`down()`), Upgrade-Test | Test-Workflow |
| Autorisierung | jede Route mit Test gegen ein fremdes Konto | Testliste je Route |
| Doku-Drift | ADRs/arc42 gegen Code geprüft | Check oder Claims-Gate |

## 6. Ablauf

1. **Bestand erheben:** Requirements-Quelle, Issues, Architektur-Doku, ADRs, Glossar,
   CI-Workflows, Repo-Einstellungen. Nur lesen.
2. **Je Abschnitt 1–5 bewerten:** Status `vorhanden` / `teilweise` / `fehlt` /
   `nicht relevant` (mit Grund) / `UNBEKANNT`, jeweils mit Beleg.
3. **Lücken nach Risiko sortieren** — für einen öffentlichen Betrieb zuerst Recht,
   Sicherheit, Datenverlust, dann Nachvollziehbarkeit.
4. **Vorschlag je Lücke:** wo sie hingehört (bestehendes Issue, neues Issue, Phase,
   arc42-Kapitel), Aufwand grob. Entscheidungen per Rückfrage-Tool.
5. **Erst nach Freigabe:** Issues anlegen, Doku umbauen, Gates einführen — jede Einheit
   mit eigenem Akzeptanzkriterium; Batches über drei PRs brauchen Zwischenfreigabe
   (`instructions/AGENTS.md` → Autonome Batches).

## Ausgabe

- Tabelle: Nr · Bereich · Prüfpunkt · Status · Beleg · Anmerkung
- Liste der Lücken nach Risiko, je mit Vorschlag für den Ablageort
- Abschnitt „Offen / UNBEKANNT“ mit dem, was ein Lauf oder eine Nutzerentscheidung
  klären muss
- Keine Methoden-Erklärung, außer der Nutzer fragt danach

## Was dieser Skill nicht tut

- Entscheiden, **ob** arc42, req42 oder DDD eingeführt wird — er empfiehlt, der Nutzer
  entscheidet.
- Anforderungen aus dem Code „erraten“ und als abgestimmt ausgeben.
- Tests schreiben (→ `harness/TESTS.md`, `ui-test-gap-audit`), eine `DESIGN.md` bauen
  (→ `design-md-curator`) oder Repo-Einstellungen ohne Freigabe ändern.
