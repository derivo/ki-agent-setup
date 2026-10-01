# RESEARCH_SOURCES.md — Quellen für die Trend-Recherche

**Lade wenn:** Eine Recherche nach neuen Erkenntnissen, Standards, Best Practices oder
Werkzeugen läuft (Skill `trend-scout`), oder eine Quelle soll aufgenommen/verworfen werden.

Single-Source-of-Truth für den Quellen-Roster. Jede Zeile trägt die **Kadenz** (wie oft
geprüft), die **verifizierte Abrufmechanik** (was tatsächlich funktioniert) und das
**Qualitätsurteil** (warum die Quelle hier steht). Ein Eintrag ohne diese drei ist kein
Eintrag — siehe „Neue Quelle aufnehmen".

Abgrenzung: `linklist.md` ist eine Nachschlage-Liste zum Arbeiten. Diese Datei listet
Quellen, die **periodisch abgefragt** werden, um Änderungen zu finden.

---

## 1. Methode & Harness-Engineering

**Jeden Lauf, billig — greifen als Ausschluss:**

| Quelle | Mechanik | Urteil |
|---|---|---|
| [anthropic.com/engineering](https://www.anthropic.com/engineering) | `curl` + grep auf `(Mon) DD, YYYY`; Index ist datiert | Methoden-Primärquelle. Hersteller mit Produktionsdaten. |
| [martinfowler.com/articles/harness-engineering.html](https://martinfowler.com/articles/harness-engineering.html) | `curl` + grep auf `Significant Revisions` | Vokabular/Konzepte. Revisionsdatum im Dokument. |
| [Claude Code CHANGELOG](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) | **nur die Raw-URL.** Mit `curl`+`awk` lesen, nicht per Fetch-Zusammenfassung | Plattform-Takt. Eine Plattform-Änderung kann eine Harness-Regel verbilligen oder erübrigen. |
| [simonwillison.net/tags/coding-agents/](https://simonwillison.net/tags/coding-agents/) | `curl` + grep auf `<h3>` und Datum | Der **unabhängige Prüfer** der Liste: verifiziert primär und widerspricht Hersteller-Zahlen. |

Die ersten beiden sind der günstigste Ausschluss: unverändertes Datum → kein Fund, ohne
weitere Abrufe.

**Jeden Lauf, teurer:**

| Quelle | Mechanik | Urteil |
|---|---|---|
| [arxiv.org/list/cs.SE/recent](https://arxiv.org/list/cs.SE/recent) | `curl` auf `?skip=0&show=50`, IDs + Titel parsen. **`export.arxiv.org` scheitert in der Sandbox** (0 Byte), die API-URL per Fetch läuft in den Timeout | Primärforschung. Durchweg ungeprüfte Preprints → Qualitätsfilter §4 zwingend. |

**Quartalsweise:**

| Quelle | Mechanik | Urteil |
|---|---|---|
| [cognition.com/blog](https://cognition.com/blog) | `curl` (301 von cognition.ai) | Zweiter Hersteller mit Produktionsdaten. Methoden-Posts selten, dazwischen Produkt/Umsatz. |

## 2. Werkzeuge & GitHub-Trends

| Quelle | Mechanik | Urteil |
|---|---|---|
| [github.com/trending](https://github.com/trending?since=weekly) | `curl` + grep auf `href="/owner/repo"`; `?since=weekly` bzw. `daily` | Breit und sprachunabhängig, also viel Rauschen. Taugt zum Entdecken, nicht zum Urteilen. |
| GitHub Search API | **`gh search repos` statt `curl`** — authentifiziert 30 Anfragen/min statt 10. `--sort stars`, Query mit `created:>YYYY-MM-DD` für Neues | Gezielter als Trending: sucht einen Begriff statt eines Zeitfensters. |

Stars sind **Aufmerksamkeit, nicht Qualität** — ein Werkzeug mit 7k Stars und zwei Wochen
Historie ist ein Kandidat, kein Standard. Was ein GitHub-Fund belegen muss, steht in §4.

## 3. KI-News (Tool- und Standard-Schicht)

Der breite Nachrichten-Roster liegt im Scheduled Task **`ki-news`** (Lab-Blogs,
Preprint-Server, Reddit/HN, YouTube, Newsletter, EU-AI-Act). Hier **nicht duplizieren** —
sonst laufen zwei Routinen gegen dieselben Seiten und melden dasselbe zweimal.

Für die Trend-Recherche wird aus dieser Schicht nur abgefischt, was **Methode, Standard
oder Werkzeug** betrifft:

| Quelle | Mechanik | Urteil |
|---|---|---|
| [news.ycombinator.com](https://hn.algolia.com/?query=coding%20agent&sort=byPopularity&type=story) | Algolia-API/Suche, Begriff + Popularität | Früher Indikator für Werkzeuge. Kommentare oft wertvoller als der Link. |
| [hamel.dev](https://hamel.dev/) | `curl`, datierter Index | LLM-Evals aus der Praxis — einschlägig fürs Gate-Thema. |
| [huyenchip.com/blog](https://huyenchip.com/blog/) | `curl`, datierter Index | Systemdesign um LLMs, keine Produkt-PR. |

Ist eine Meldung aus `ki-news` methodisch einschlägig, wird sie **hier** geprüft (gegen
§4), nicht dort — das Briefing berichtet, diese Routine urteilt.

## 4. Qualitätsprüfung — für Funde und für neue Quellen

### Ein Fund zählt erst, wenn er trägt
- **Papers:** zuerst das arxiv-Kommentarfeld auf **Venue-Annahme** prüfen (ICSE/FSE/ASE/
  MSR/EMSE). Ohne Annahme zählt ein Fund erst mit **Kontrollarm und Fallzahl**.
  Positionspapiere und N=1-Erfahrungsberichte sind die teuersten Fehlläufe.
- **Werkzeuge:** Was ist gemessen, gegen was? Ein README mit Benchmark-Tabelle ohne
  Kontrollarm ist Marketing. Ein Werkzeug qualifiziert sich über einen **reproduzierbaren
  Lauf**, nicht über Stars oder Release-Takt.
- **Blog-/Video-Praktikerberichte:** ohne Erhebung → **kein Methodenfund**. Sie dürfen
  einen Verdacht begründen, nie eine Regel.
- **Ebenen-Filter:** Agent-*Bau*, Benchmark-Design, RL-Training und Hook-/OS-Enforcement
  sind keine Methodenregeln für ein Solo-Dev-Set. Das schließt die Mehrzahl der Funde aus.

### Eine neue Quelle wird aufgenommen, wenn
1. **Sie in dieser Session aufgelöst ist** — abgerufen, nicht aus Erinnerung. Löst sie
   nicht auf: nicht aufnehmen und das benennen.
2. **Sie datiert ist.** Ohne Datum am Eintrag ist nicht entscheidbar, ob etwas neu ist —
   damit ist die Quelle nicht pollbar und als Routine-Quelle wertlos.
3. **Die Abrufmechanik geprüft ist.** Welcher Befehl liefert die Liste? Scheitert der
   Weg (JS-Rendering, Consent-Wall, 403, Timeout), wird **das** notiert statt einer
   Quelle, die im nächsten Lauf wieder Zeit kostet.
4. **Sie etwas trägt, das der Roster nicht schon hat.** Eine zweite Quelle, die dieselbe
   Primärquelle referiert, verdoppelt nur die Abrufkosten. Aggregatoren und
   Awesome-Listen sind Linksammlungen ohne Erhebung → **nein**.
5. **Ihr Qualitätsurteil benannt ist** — ein Satz, warum sie hier steht und was sie
   nicht kann (Bias, Produkt-Interesse, fehlende Erhebung).

Erfüllt sie das, kommt sie mit Kadenz + Mechanik + Urteil in die passende Tabelle oben.
Erfüllt sie es nicht, kommt sie nach §5 — damit kein Folgelauf sie erneut prüft.

## 5. Geprüft und bewusst nicht aufgenommen

| Quelle | Grund |
|---|---|
| [metr.org/blog](https://metr.org/blog) | Lebt, misst aber **Modelle** (Predeployment-Evals, Task-Horizons), nicht Harness-Methode. |
| openai.com/index/harness-engineering | **403 für Fetch**, mehrfach bestätigt. Nicht pollbar; bleibt Sekundärzitat. |
| YouTube-Kanäle zu Agenten-Praxis | Titel-Triage möglich (`WebSearch` mit `allowed_domains`), Inhalte nicht: Consent-Wall, kein `yt-dlp`. Hat noch nie eine Methodenregel getragen. |
| Awesome-Listen (`awesome-harness-engineering` u. a.) | Linksammlung ohne Erhebung. Einmal nach neuen Primärquellen durchsehen, nicht aufnehmen. |
| Medium-/SEO-Schicht zu „agent harness" | Wiederholt geprüft, nie ein Methodenfund. |

---

**Pflege:** Dieser Roster ist Teil der Methode, nicht Sammelbecken. Eine Quelle, die drei
Läufe in Folge nichts liefert und auch nichts ausschließt, wird gestrichen statt
mitgeschleppt — Abrufkosten ohne Ertrag sind dasselbe Problem wie ein ungenutzter Kontext.
