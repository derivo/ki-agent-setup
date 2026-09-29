# 06 — Datenschutz & Recht

**Prüfpunkte, keine Rechtsberatung.** Jeder Punkt nennt Norm und Anwendungsbedingung;
ob er im Einzelfall greift, entscheidet im Zweifel eine fachkundige Person. Rechtsstand:
Abrufdatum im [Quellenverzeichnis](QUELLEN.md). Rechtslage ändert sich — Punkte mit
Phase `L` gehören in einen wiederkehrenden Termin.

**Rechtsraum.** Die Punkte unten setzen die Pflichtthemen für **Deutschland und die
EU** um. Für jeden anderen Rechtsraum aus dem Profil gilt die Tabelle der
Pflichtthemen als Prüffrage: die dort geltende Norm wird mit abgerufener Quelle
ermittelt und je Rechtsraum eine eigene Registerzeile geführt; ohne belegte Norm
`UNBEKANNT`. Deutsche oder EU-Normen werden nicht stellvertretend angewendet.

| Pflichtthema | Prüffrage für jeden Rechtsraum | Umsetzung DE/EU |
|---|---|---|
| Anbieterangaben | Muss der Anbieter sich auf der Website ausweisen, und womit? | LAW-01, LAW-14 |
| Datenschutz | Rechtsgrundlagen, Informationspflichten, Verzeichnisse, Betroffenenrechte, Dienstleister, Voreinstellungen | LAW-02 bis LAW-04, LAW-06, LAW-07, LAW-21 |
| Einwilligung für Endgeräte und Tracking | Braucht Speichern/Auslesen im Browser eine Einwilligung? | LAW-05 |
| Datenpannen | Wer muss wem in welcher Frist melden? | LAW-08 |
| Barrierefreiheit | Gibt es eine gesetzliche Pflicht, für wen, mit welchem Standard? | LAW-09 |
| Online-Verträge mit Verbrauchern | Bestellablauf, Kündigung, Widerruf, Preisangaben | LAW-10 bis LAW-13 |
| Plattform- und Inhaltepflichten | Melde- und Beschwerdewege, Transparenz | LAW-15, LAW-18 |
| Marktplätze | Informationen zu Ranking und Anbieter, Identität der Händler, Regeln für gewerbliche Nutzer, Steuermeldungen, Geldflüsse | LAW-27 bis LAW-31 |
| KI-Transparenz | Kennzeichnungspflichten für KI-Interaktion und -Inhalte | LAW-16 |
| Werbung per E-Mail | Einwilligungsmodell und Nachweis | LAW-17 |
| Cybersicherheit der Organisation | Produkt- und Betreiberpflichten, Meldewege | LAW-19 |
| Aufbewahrung | Welche Unterlagen sind wie lange aufzubewahren, und wie verträgt sich das mit Löschpflichten? | LAW-23 |
| Rechnungsstellung | Ist ein elektronisches Rechnungsformat vorgeschrieben? | LAW-24 |
| Anbieterwechsel bei Cloud-Diensten | Muss der Kunde wechseln und seine Daten mitnehmen können? | LAW-25 |
| Lizenzen genutzter Software | gilt rechtsraumübergreifend (eine Registerzeile, `rechtsraum: "alle"`) | LAW-26 |
| Pflege der Rechtstexte | wiederkehrend | LAW-20, LAW-22 |

Alle Punkte dieses Bereichs tragen Stufe `B`: eine gesetzliche Pflicht hängt an ihrer
Anwendungsbedingung, nicht an der gewählten Schutzstufe, und ist keiner Risikoakzeptanz
zugänglich.

## Pflichtangaben

### LAW-01 · B · G — Anbieterkennzeichnung (Impressum)
Nach § 5 DDG „leicht erkennbar, unmittelbar erreichbar und ständig verfügbar“ bei
geschäftsmäßigen digitalen Diensten [DDG-5]. Verweise auf das frühere TMG sind veraltet
(DDG seit Mai 2024).
Prüfen: von jeder Seite aus erreichbar — Hausempfehlung: mit einem Klick (die Norm
nennt keine Klickzahl); Normverweis aktuell.

### LAW-02 · B · G — Datenschutzinformation
Informationen nach Art. 13 DSGVO zu allen Verarbeitungen der App, einschließlich
Dienstleistern, Speicherdauern und Rechten [DSGVO].
Prüfen: Abgleich der genannten Verarbeitungen und Dienstleister mit dem tatsächlichen
Bestand (Hosting, Mail, Fehlertracking, Analyse, Schriften, Karten, Zahlung).

## Datenschutz im Bau und Betrieb

### LAW-03 · B · E — Verzeichnis der Verarbeitungstätigkeiten mit Löschfristen
Nach Art. 30 DSGVO, inklusive geplanter Löschfristen und technisch-organisatorischer
Maßnahmen; die Ausnahme für kleine Betriebe greift bei regelmäßiger Verarbeitung — also
bei Web-Apps praktisch nie [DSGVO]. Technische Umsetzung → DAT-09.
Prüfen: Verzeichnis vorhanden und zu den Datenkategorien aus 04 passend.

### LAW-21 · B · E — Je Verarbeitung sind Zweck, Rechtsgrundlage und Rollen festgelegt
Für jede Verarbeitung: Zweck, Rechtsgrundlage nach Art. 6 DSGVO und bei besonderen
Kategorien zusätzlich Art. 9 [DSGVO-6] [DSGVO-9]; Rolle je Beteiligtem
(Verantwortlicher, gemeinsam Verantwortliche, Auftragsverarbeiter); Screening, ob eine
Datenschutz-Folgenabschätzung nach Art. 35 nötig ist [DSGVO-35]. Eine Verarbeitung ohne
tragfähige Rechtsgrundlage ist durch Technik nicht zu heilen.
Prüfen: je Eintrag im Verzeichnis (LAW-03) Rechtsgrundlage, Rollen und DSFA-Ergebnis.

### LAW-04 · B · F — Betroffenenrechte sind technisch umsetzbar
Auskunft mit Datenkopie (Art. 15 Abs. 3), Übertragbarkeit in maschinenlesbarem Format
(Art. 20), Berichtigung, Löschung; Antwort binnen eines Monats (Art. 12 Abs. 3)
[DSGVO] → DAT-10, DAT-11.
Prüfen: Wie lange dauert eine vollständige Auskunft heute, und wer kann sie erstellen?

### LAW-05 · B · F — Kein Zugriff auf Endgeräte vor der Einwilligung, außer unbedingt erforderlich
Nach § 25 TDDDG (früher TTDSG) brauchen Speichern und Auslesen im Endgerät eine
Einwilligung, außer sie sind für den ausdrücklich gewünschten Dienst unbedingt
erforderlich [TDDDG-25]. Analyse-, Marketing- und Einbettungsdienste laden erst nach
Einwilligung; Ablehnen ist so einfach wie Zustimmen.
Gilt für jeden Speicher im Endgerät — Cookies, `localStorage`, `sessionStorage`,
IndexedDB, Fingerprinting-Aufrufe.
Prüfen: vier Durchläufe in je frischem Browser — Erstaufruf ohne Interaktion, Ablehnen,
selektive Zustimmung, späterer Widerruf; jeweils Netzwerkanfragen und alle
Speicherarten. Nach Widerruf dürfen keine neuen Zugriffe folgen.

### LAW-06 · B · E — Rollen der Dienstleister sind geklärt und vertraglich geregelt
Zuerst die Rolle je Dienstleister klären (→ LAW-21): bei Auftragsverarbeitung ein
Vertrag nach Art. 28 Abs. 3 DSGVO [DSGVO], bei gemeinsamer Verantwortung eine
Vereinbarung nach Art. 26 [DSGVO-26]; eigenverantwortliche Empfänger in der
Datenschutzinformation. Übermittlungen in Drittländer geprüft.
Prüfen: Liste der Dienstleister mit Rolle gegen die Verträge bzw. Vereinbarungen.

### LAW-07 · B · E — Datenschutz durch Technik und Voreinstellung
Nach Art. 25 DSGVO: standardmäßig nur die für den Zweck nötigen Daten, Speicherdauer und
Sichtbarkeit per Voreinstellung begrenzt; Datenminimierung und Speicherbegrenzung nach
Art. 5 [DSGVO].
Prüfen: Pflichtfelder der Registrierung — wird jedes gebraucht? Standard-Sichtbarkeit
von Profilen und Inhalten.

### LAW-08 · B · G — Datenpannen werden dokumentiert, bewertet und fristgerecht gemeldet
Jede Panne wird dokumentiert; gemeldet wird an die Aufsicht binnen 72 Stunden ab
Kenntnis, außer sie führt voraussichtlich nicht zu einem Risiko (Art. 33) [DSGVO]. Bei
voraussichtlich hohem Risiko werden die Betroffenen benachrichtigt (Art. 34)
[DSGVO-34]. Auftragsverarbeiter melden dem Verantwortlichen unverzüglich — der Weg
dafür ist vertraglich und praktisch festgelegt → OPS-18.
Prüfen: schriftlicher Ablauf mit Zuständigkeit, Risikobewertung und Meldewegen der
Dienstleister; Pannenregister vorhanden, auch wenn leer.

## Barrierefreiheit

### LAW-09 · B (verbraucher) · E — BFSG: Anwendbarkeit, Informationen, kritische Funktionen
Seit 28.06.2025 gilt das Barrierefreiheitsstärkungsgesetz unter anderem für
Dienstleistungen im elektronischen Geschäftsverkehr gegenüber Verbrauchern; Kleinstunternehmen,
die Dienstleistungen erbringen, sind ausgenommen [BFSG]. B2B gilt nicht pauschal als
ausgenommen, wenn auch Verbraucher Zugang haben. Drei getrennte Pflichten:
(1) Einstufung dokumentieren; (2) Informationen zur Barrierefreiheit der Dienstleistung
nach § 14 und Anlage 3 bereitstellen [BFSG-14]; (3) Identifizierungs-,
Authentifizierungs-, Sicherheits- und Zahlungsfunktionen wahrnehmbar, bedienbar,
verständlich und robust gestalten [BFSGV-19]. Technische Umsetzung → UX-12 bis UX-15
(WCAG 2.2 AA) — die Konformität dort ersetzt die Punkte (1) und (2) nicht.
Prüfen: Einstufung mit Datum; Informationsseite vorhanden; Anmeldung, Zwei-Faktor,
Passwort-Reset und Bezahlen per Tastatur und Screenreader durchgespielt.

## Online-Verträge mit Verbrauchern

### LAW-10 · B (verbraucher) · G — Bestellablauf erfüllt § 312j BGB
Lieferbeschränkungen und akzeptierte Zahlungsmittel spätestens bei Beginn des
Bestellvorgangs (Abs. 1); die wesentlichen Informationen klar und hervorgehoben
unmittelbar vor der Bestellung (Abs. 2); Schaltfläche „zahlungspflichtig bestellen“
oder gleich eindeutig (Abs. 3) [BGB-312J].
Prüfen: ganzen Bestellablauf durchspielen — alle drei Absätze, nicht nur die
Beschriftung der letzten Schaltfläche.

### LAW-11 · B (abo) · G — Kündigungsschaltfläche
Nach § 312k BGB: „Verträge hier kündigen“, ständig verfügbar; Bestätigungsseite mit
Schaltfläche „jetzt kündigen“; sofortige Eingangsbestätigung mit Datum und Uhrzeit
[BGB-312K].
Prüfen: ganzen Kündigungsablauf durchspielen — Erreichbarkeit, Angaben zur
Vertragsidentifikation, Bestätigungsseite, Eingangsbestätigung mit Zeitstempel.

### LAW-12 · B (verbraucher) · G — Widerrufsfunktion (seit 19.06.2026)
Nach § 356a BGB: Funktion zum Widerruf während der gesamten Widerrufsfrist ständig
verfügbar und hervorgehoben, Bestätigungsschaltfläche, Eingangsbestätigung auf dauerhaftem
Datenträger [BGB-356A]; die Widerrufsbelehrung muss auf die Funktion hinweisen
[EGBGB-246A].
Prüfen: Widerruf vollständig durchspielen — Angaben zur Identifikation des Vertrags,
Bestätigung, Eingangsbestätigung mit Inhalt und Zeitpunkt; Belehrung auf neuem Stand.

### LAW-13 · B (verbraucher) · G — Preisangaben
Zuerst der Gesamtpreis einschließlich Umsatzsteuer (§ 3 PAngV) und die Angabe, ob
zusätzlich Fracht-, Liefer- oder Versandkosten anfallen (§ 6 PAngV); dann Grundpreis
neben dem Gesamtpreis bei Waren nach Menge (§ 4); bei Preisermäßigungen der niedrigste
Preis der letzten 30 Tage als Bezug (§ 11) [PANGV].
Prüfen: Produkt- und Warenkorbseiten auf Gesamtpreis und Versandkostenhinweis;
Produktseiten mit Rabatt auf Herkunft des Streichpreises.

### LAW-14 · B · L — Kein Verweis auf die abgeschaltete EU-Streitbeilegungsplattform
Die ODR-Plattform der EU wurde am 20.07.2025 abgeschaltet [ODR-EU]; ein verbliebener
Link ist ein Fehler.
Prüfen: Impressum und AGB nach dem Link durchsuchen.

## Inhalte, Werbung, KI

### LAW-15 · B (nutzerinhalte) · G — Pflichten als Hosting-Dienst nach dem DSA
Der Umfang hängt am Diensttyp: Bedingung `nutzerinhalte` (Inhalte werden im Auftrag
der Nutzer gespeichert) → Kontaktstelle, verständliche Nutzungsbedingungen, Melde- und
Abhilfeverfahren für rechtswidrige Inhalte, Begründung von Entfernungen. Bedingung
`plattform` (Inhalte werden zusätzlich öffentlich verbreitet) → zusätzlich internes
Beschwerdeverfahren und Verbot manipulativer Gestaltung; Erleichterungen für
Klein- und Kleinstunternehmen [DSA-QA]. Welche Artikel im Einzelnen entfallen, ist am
Verordnungstext zu prüfen.
Prüfen: Meldeformular, Kontaktstelle, Begründungstexte bei Entfernung.

### LAW-16 · B (ki) · F — KI-Interaktion ist erkennbar
Art. 50 KI-Verordnung (seit 02.08.2026) enthält getrennte Tatbestände, je nach Rolle
einzeln prüfen [AIACT-50]:
- Interaktion: Hinweis zu Beginn, dass man mit einem KI-System interagiert, sofern nicht
  offensichtlich (Anbieter).
- Erzeugte Inhalte: maschinenlesbar als künstlich erzeugt gekennzeichnet (Anbieter des
  Systems).
- Deepfakes: offengelegt (Betreiber).
- KI-Texte zur Information der Öffentlichkeit über Angelegenheiten öffentlichen
  Interesses: offengelegt — die Ausnahme bei redaktioneller Kontrolle gilt nur für
  diese Texte, nicht für Bild, Ton oder Video (Betreiber).
Prüfen: erster Bildschirm des Chat-Dialogs; Kennzeichnung erzeugter Medien.

### LAW-17 · B (newsletter) · F — Werbe-E-Mails nur mit nachweisbarer Einwilligung
Vorherige ausdrückliche Einwilligung (§ 7 Abs. 2 UWG); Ausnahme für Bestandskunden nur
bei allen Voraussetzungen des § 7 Abs. 3 UWG [UWG-7]; Einwilligung protokolliert
(Zeitpunkt, Bestätigung, Wortlaut) — technisch → MKT-12.
Prüfen: für eine Stichprobe von Adressen den Nachweis vorlegen.

### LAW-18 · B · G — Bewertungen werden nur mit Prüfverfahren als „echt“ ausgewiesen
Wer behauptet, Bewertungen stammten von Käufern, braucht angemessene
Überprüfungsmaßnahmen und informiert darüber; gefälschte Bewertungen sind stets
unzulässig [UWG-ANH Nr. 23b, 23c].
Prüfen: Herkunft angezeigter Bewertungen; Hinweistext zum Prüfverfahren.

## Marktplätze

### LAW-27 · B (marktplatz, verbraucher) · G — Verbraucher erfahren Ranking-Grundlagen und Anbieterstatus
Ein Online-Marktplatz informiert Verbraucher über die Hauptparameter des Rankings und
ihre relative Gewichtung, über einbezogene Anbieter bei Vergleichen, über
Verbundenheit mit dem Anbieter und darüber, ob der Anbieter nach eigener Erklärung
Unternehmer ist — falls nicht, dass das Verbraucherrecht für den Vertrag nicht gilt
[BGB-312L] [EGBGB-246D].
Prüfen: Hinweis an Suchergebnissen; Selbsterklärung „Unternehmer ja/nein“ im
Anbieterprofil und ihre Anzeige am Angebot.

### LAW-28 · B (marktplatz, verbraucher) · F — Händler sind vor dem Anbieten identifiziert, Pflichtangaben sind möglich
EU: Online-Plattformen, über die Verbraucher Fernabsatzverträge mit Unternehmern
schließen, lassen Unternehmer erst nach Erhalt von Name, Anschrift, Kontaktdaten,
Identitätsnachweis, Registereintrag und Selbstverpflichtung zu (Nachverfolgbarkeit), und
ihre Oberfläche erlaubt den Händlern die vorvertraglichen Pflicht- und
Produktsicherheitsangaben. Ausgenommen sind Anbieter, die Klein- oder
Kleinstunternehmen sind [DSA-30].
Prüfen: Onboarding-Ablauf für Händler (Pflichtfelder, Freischaltung erst danach);
Felder für Händlerangaben am Angebot.

### LAW-29 · B (marktplatz) · G — Gewerbliche Nutzer erhalten faire, transparente Bedingungen
EU: Vermittelt die App Angebote gewerblicher Nutzer an Verbraucher, gilt die
P2B-Verordnung: klare, jederzeit verfügbare AGB mit Gründen für Sperren und
Einschränkungen, begründete Sperrentscheidungen, die Hauptparameter des Rankings in
den AGB, ein kostenfreies internes Beschwerdesystem (entfällt für kleine
Unternehmen) und benannte Mediatoren [P2B-VO].
Prüfen: AGB für Anbieter gegen diese Liste; Sperrfunktion mit Begründungstext;
Beschwerdeweg für Anbieter.

### LAW-30 · B (marktplatz) · E — Meldepflicht über Anbieter an die Steuerbehörde ist geklärt
DE: Wer als Plattform Rechtsgeschäfte über relevante Tätigkeiten ermöglicht, ist
meldender Plattformbetreiber — nicht aber, wer nur Angebote auflistet, bewirbt oder
weiterleitet [PSTTG-3]. Dann: Registrierung, Sorgfaltspflichten zur Identifikation der
Anbieter und Meldung bis zum 31. Januar des Folgejahres [PSTTG-13]; die Pflicht folgt
aus EU-Recht (DAC7) und gilt entsprechend in allen Mitgliedstaaten.
Prüfen: Einordnung mit Begründung (etwa ADR); falls meldepflichtig: erhobene
Anbieterdaten, Exportweg für die Meldung.

### LAW-31 · B (marktplatz, zahlungen) · E — Geldflüsse zwischen Käufer und Anbieter sind aufsichtsrechtlich geklärt
DE: Nimmt der Betreiber Geld für Anbieter entgegen und leitet es weiter, kann das ein
erlaubnispflichtiger Zahlungsdienst sein [ZAG-10]; die Ausnahme für Handelsvertreter
ist eng — nur wer allein im Namen einer Seite verhandelt oder abschließt [ZAG-2].
Üblicher Weg: ein beaufsichtigter Zahlungsdienstleister mit Marktplatzmodell, bei dem
das Geld nie über Konten des Betreibers läuft.
Prüfen: Zahlungsfluss (wer hält das Geld zwischen Kauf und Auszahlung?); Vertrag
mit dem Zahlungsdienstleister oder Erlaubnis.

## Regulierung der Organisation

### LAW-19 · B · E — Anwendbarkeit von CRA und NIS2 ist geprüft
Der Cyber Resilience Act betrifft Produkte mit digitalen Elementen; reine Websites und
SaaS fallen in der Regel nicht darunter — anders, wenn installierbare Software, Apps
oder Bibliotheken ausgeliefert werden oder ein Produkt ohne das eigene Backend nicht
funktioniert [CRA]. Meldepflichten nach Art. 14 gelten seit 11.09.2026, volle
Anwendung ab 11.12.2027 [CRA-REP]. NIS2 (in Deutschland über das BSIG seit 06.12.2025)
trifft Einrichtungen nach Sektor und Größe, darunter Cloud-, Managed-Service- und
Marktplatz-Anbieter [NIS2-BSI] [BSIG-28]; betroffene Einrichtungen müssen sich
registrieren und Vorfälle melden.
Bei Betroffenheit folgt ein eigenes Arbeitspaket: Zuständigkeit, Registrierung,
Meldeablauf — NIS2: Erstmeldung erheblicher Sicherheitsvorfälle binnen 24 Stunden
[BSIG-32]; CRA: Meldungen aktiv ausgenutzter Schwachstellen und schwerer Vorfälle
[CRA-REP].
Prüfen: dokumentierte Betroffenheitsprüfung für beide Regelwerke mit Datum; bei
Betroffenheit Meldeablauf mit Fristen.

### LAW-20 · B · L — Rechtstexte werden auf Stand gehalten
Impressum, Datenschutzinformation, Nutzungsbedingungen, Widerrufsbelehrung mit Datum und
Verantwortlichem; Anlass zur Prüfung sind neue Verarbeitungen, neue Dienstleister und
Gesetzesänderungen.
Prüfen: Datum der letzten Prüfung je Text.

### LAW-22 · B (selbst-gehostet) · G — Die Software ermöglicht Betreibern ihre Pflichten
Bei selbst betriebener Software liegen Impressum, Datenschutzinformation,
Verarbeitungsverzeichnis und Meldewege beim Betreiber; die Software muss sie
ermöglichen: konfigurierbare Links oder Seiten für Impressum, Datenschutz und
Nutzungsbedingungen, eine Liste der eingebundenen Dienstleister und Datenflüsse,
Export und Löschung für Betroffenenrechte (→ LAW-04), Hinweise für das
Verarbeitungsverzeichnis. Grundregel „Hersteller oder Betreiber“ in SKILL.md.
Prüfen: Konfigurationsoptionen für Rechtstexte; Betreiberdoku zu Datenflüssen.

## Geschäftsunterlagen, Verträge, Lizenzen

### LAW-23 · B (zahlungen) · E — Aufbewahrungspflichten und Löschpflichten sind vereinbar
Rechnungen, Buchungsbelege und Geschäftsbriefe sind aufzubewahren — in Deutschland
Buchungsbelege acht Jahre, Bücher und Jahresabschlüsse zehn, sonstige steuerlich
bedeutsame Unterlagen sechs Jahre (§ 147 Abs. 3 AO) [AO-147]; handelsrechtlich
§ 257 HGB [HGB-257]. Während der Frist müssen sie verfügbar und lesbar bleiben. Die
Kontolöschung (DAT-10) sperrt diese Daten deshalb statt sie zu löschen, trennt sie vom
aktiven Bestand und löscht sie nach Fristende → DAT-09; die Frist steht als eigene
Löschregel im Verzeichnis (LAW-03).
Prüfen: Löschweg eines Kontos mit Rechnungen; Aufbewahrungsregel je Belegart; was nach
Fristende geschieht.

### LAW-24 · B (zahlungen) · F — Rechnungen entsprechen der vorgeschriebenen Form
In Deutschland ist für Leistungen an andere inländische Unternehmen eine elektronische
Rechnung in einem strukturierten Format nach der europäischen Norm vorgeschrieben;
Übergangsregeln erlauben andere Formate bis Ende 2026 bzw. Ende 2027 (§ 14 Abs. 1
und 2, § 27 Abs. 38 UStG) [USTG-14] [USTG-27]. Stellt die App Rechnungen aus oder verarbeitet sie
eingehende, ist das Format ein Anforderungsthema, kein Detail der Ausgabe.
Prüfen: Rechnungsarten (an Unternehmen, an Verbraucher) und ihr Format; Stichtag der
Umstellung in der Planung.

### LAW-25 · B (saas) · E — Kunden können zu einem anderen Anbieter wechseln
Der EU Data Act gilt seit 12.09.2025; sein Kapitel VI verpflichtet Anbieter von
Datenverarbeitungsdiensten einschließlich SaaS, Wechsel und parallele Nutzung
anderer Dienste zu ermöglichen: Mindestinhalte im Vertrag, offene Schnittstellen und
Export der Daten des Kunden samt Metadaten in einem gängigen, maschinenlesbaren
Format; Wechselentgelte einschließlich Datentransfer entfallen ab 12.01.2027
[DATA-ACT]. Technische Grundlage → DAT-11.
Prüfen: Export des gesamten Kundenbestands inklusive Metadaten; Vertragsklauseln zum
Wechsel; Entgelte für Export oder Datentransfer.

### LAW-26 · B · G — Lizenzen der verwendeten Software sind bekannt und erfüllt
Für jede eingebundene Komponente ist die Lizenz bekannt; Pflichten daraus
(Lizenztexte und Hinweise mitliefern, Quellcode bereitstellen, Weitergabe
beschränken) werden erfüllt, bevor ausgeliefert wird. Ein Prozess dafür nach einem
anerkannten Standard [OPENCHAIN] macht das wiederholbar; die Stückliste aus SEC-24 ist
die Grundlage. Besonders bei `selbst-gehostet` und `clients`, weil dort Software
weitergegeben wird.
Prüfen: Lizenzliste aus der Stückliste; Umgang mit starkem Copyleft; Hinweisdatei im
ausgelieferten Artefakt.
