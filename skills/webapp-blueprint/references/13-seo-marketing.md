# 13 — SEO & Marketing

Suchmaschinen-Punkte gelten mit Bedingung `öffentliche-inhalte`; Marketing-Punkte, wo
gemessen oder geworben wird. Einzelaudit → Skill `seo-audit`. Rechtliche Grundlage der
Werbung → Bereich 06. Quellenkürzel → [QUELLEN.md](QUELLEN.md).

## Auffindbarkeit

### MKT-01 · B (öffentliche-inhalte) · F — Web-Baseline: `robots.txt`, `sitemap.xml`, `llms.txt`
Hausstandard im ki-agent-setup, aus der echten Struktur generiert statt von Hand
gepflegt. `robots.txt` steuert nur das Crawlen und ist öffentlich lesbar — kein
Zugriffsschutz; antwortet sie mit `5xx`, gilt die ganze Site als gesperrt [RFC9309].
Die Sitemap enthält nur absolute, kanonische URLs [G-SITEMAP]. Für `llms.txt` ist
keine Wirkung auf Auffindbarkeit belegt; sie ist Hausstandard des ki-agent-setup und
außerhalb davon eine Empfehlung, deren Fehlen kein Befund ist.
Prüfen: alle drei abrufbar; Sitemap-URLs antworten mit `200` und sind kanonisch.

### MKT-02 · B (öffentliche-inhalte) · G — Keine Staging-Sperre in Produktion
Kein `Disallow: /` und kein `noindex` aus der Testumgebung im Livebetrieb; umgekehrt ist
die Testumgebung gesperrt. Aus dem Index hält man Seiten mit `noindex`, nicht mit
`robots.txt` — gesperrte Seiten sieht Google das `noindex` nie [G-BLOCK].
Prüfen: `robots.txt` und `X-Robots-Tag` im Livebetrieb.

### MKT-03 · B (öffentliche-inhalte) · F — Inhalt steht im ausgelieferten HTML
Serverseitiges Rendern oder Vorrendern für indexierbare Seiten; Links sind echte
`<a href>`; nicht gefundene Inhalte liefern `404` bzw. `410`, keine leere Seite mit `200`
(Soft-404) [G-JS] [G-HTTP].
Prüfen: Seite ohne JavaScript abrufen; Statuscode einer nicht existierenden Ressource.

### MKT-04 · B (öffentliche-inhalte) · F — Eine kanonische URL je Inhalt
Varianten (http/https, www, Parameter, Sortierung) zeigen per Weiterleitung oder
`rel=canonical` auf eine URL; Canonical, Weiterleitung und Sitemap stimmen überein;
paginierte Seiten verweisen auf sich selbst, nicht auf Seite 1 [G-CANON] [G-PAGINATION].
Prüfen: Canonical auf Seite 2 einer Liste; Varianten der Startseite.

### MKT-05 · B (öffentliche-inhalte) · L — URL-Änderungen sind Umzüge mit Weiterleitungstabelle
Jede je indexierte URL hat ein Ziel, serverseitige `301`/`308`, keine Ketten,
Weiterleitungen mindestens ein Jahr halten; kein Sammelziel Startseite [G-MOVE].
Prüfen: Weiterleitungstabelle beim letzten Umbau; Stichprobe alter URLs.

### MKT-06 · B (öffentliche-inhalte) · F — Titel, Beschreibung und Vorschau je Seite eindeutig
Eigener, beschreibender `<title>`, seitenspezifische Beschreibung, Open-Graph-Angaben mit
kanonischer URL [G-TITLE] [G-SNIPPET] [OGP]; mobile Fassung inhaltlich gleichwertig
[G-MOBILE].
Prüfen: doppelte Titel und Beschreibungen über alle indexierbaren Seiten.

### MKT-07 · Ö (öffentliche-inhalte) · F — Strukturierte Daten entsprechen dem Sichtbaren
JSON-LD nach schema.org nur für Inhalte, die auf der Seite sichtbar sind; Pflichtfelder
des Typs gesetzt [G-SD].
Prüfen: Markup gegen sichtbaren Inhalt (Preis, Bewertung).

### MKT-08 · Ö (öffentliche-inhalte) · L — Inhalte sind für Menschen geschrieben
Erkennbar, wer den Inhalt verantwortet und warum er vertrauenswürdig ist; massenhaft
erzeugte Seiten ohne eigenen Mehrwert verstoßen gegen die Richtlinien. Für KI-Funktionen
der Suche nennt Google keine zusätzlichen Anforderungen; Steuerung über die bekannten
Snippet- und Index-Angaben [G-HELPFUL] [G-AI].
Prüfen: Autorenangaben; Seiten ohne eigenen Inhalt.

### MKT-09 · Ö (öffentliche-inhalte, mehrsprachig) · F — Sprachfassungen sind verknüpft
Siehe I18N-06 [G-HREFLANG].

## Messen und Werben

### MKT-10 · Ö · E — Erst Messkonzept, dann Messung
Ziele, Kennzahlen und je Ereignis der Zweck stehen vor dem Einbau fest; jedes Ereignis
dient einer Entscheidung. Messung ohne Einwilligung nur, wo kein Endgerätezugriff nötig
oder dieser unbedingt erforderlich ist → LAW-05. Serverseitige Messung verlagert die
Verarbeitung, ersetzt aber weder Einwilligung noch Rechtsgrundlage.
Prüfen: Messkonzept; erhobene Ereignisse ohne Zweck.

### MKT-11 · Ö · F — Kampagnenparameter folgen einer Konvention
`utm_source`, `utm_medium`, `utm_campaign` immer gemeinsam, klein geschrieben, nach
dokumentierter Konvention; Parameter-URLs nicht als Canonical [GA-UTM] → MKT-04.
Prüfen: Dubletten in den Kampagnenberichten.

### MKT-12 · B · F — E-Mails kommen an
Absenderdomain mit SPF und DKIM, DMARC mit Ausrichtung; Transaktions- und Werbemails
getrennt. Große Postfachanbieter weisen nicht konforme Massenmails zurück; für
Massenversender gilt One-Click-Abmeldung nach RFC 8058 mit von DKIM signierten
Headern und Umsetzung binnen zwei Tagen [G-SENDER] [G-SENDER-FAQ] [YAHOO-SENDER]
[RFC8058]. Die Mechanismen sind standardisiert [RFC7208] [RFC6376] [RFC9989]; sie
schützen zugleich Anmelde- und Reset-Mails vor Fälschung. Rechtliche Einwilligung →
LAW-17.
Prüfen: Header einer versendeten Mail; DMARC-Eintrag der Domain.
