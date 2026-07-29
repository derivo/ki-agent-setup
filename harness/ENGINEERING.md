> **Lade wenn:** eine Design-Entscheidung steht an — Modularität, Kohäsion/Kopplung,
> Interface-Richtung, Fehler-Shape, Wann-abstrahieren.

# Engineering — Prinzipien & Muster

Referenz-Doc, on-demand gelesen. Expandiert die terse Arbeitsweise-Regeln aus
`AGENTS.md` (v.a. *Simplicity First*, *Consistency First*, *Modular by Default*)
mit dem **Warum** und konkreten Mustern. **Kein** Duplikat: harte Gates stehen in
`GUARDRAILS.md`, die Methode (Spec→Test→Code→Gate) in `README.md`, Stack-Spezifika
im jeweiligen `stacks/`-Adapter. Sprach-/Framework-neutral — Beispiele illustrativ.

Bei Konflikt gewinnt `GUARDRAILS.md` (hart) über dieses Doc (Prinzip).

**Nicht hier** (bewusst ausgelassen, um Doppelung/Wildwuchs zu vermeiden): Security
(→ `GUARDRAILS.md §E`), Secrets/Daten (→ `§B`), Fertig-Kriterium (→ `§C`), Naming/
Konventionen und Concurrency/State/Logging (→ Stack-Adapter bzw. Projekt-`AGENTS.md`).

---

## 1. Modularität & Grenzen

Ziel: Änderungen bleiben lokal. Ein neues Feature oder ein Bugfix soll wenige,
klar benennbare Einheiten anfassen — nicht quer durch die Codebase streuen.

- **Ein Modul = ein Grund zu ändern.** Bündle, was sich gemeinsam ändert; trenne,
  was sich unabhängig ändert. Wenn zwei Dinge aus verschiedenen Gründen wachsen,
  gehören sie nicht in dieselbe Datei/Klasse.
- **Schmale Schnittstellen statt geteiltem Zustand.** Module reden über explizite
  Ein-/Ausgaben (Funktionssignatur, DTO, Event), nicht über gemeinsam
  beschriebene globale Variablen, Singletons oder DB-Spalten als Seitenkanal.
- **Geschäftslogik raus aus Einstiegspunkten.** Controller/Handler/CLI/Job parsen
  Eingaben, autorisieren, delegieren — und geben zurück. Die Logik lebt in
  Services/Use-Cases/Domänen-Objekten, testbar ohne HTTP/CLI-Rahmen.
- **Keine Gott-Einheiten.** Eine Datei/Klasse, die „alles über X" weiß, ist ein
  Kopplungs-Magnet. Aufteilen entlang der Verantwortungen, sobald >1 Grund-zu-ändern
  erkennbar ist (nicht spekulativ vorab — siehe §5).
- **Abhängigkeitsrichtung zeigt nach innen** — die harte Fassung (Kern rein, keine
  IO in Einstiegspunkten) steht in `GUARDRAILS.md §A` und wird hier nicht wiederholt.

Smell-Test vor dem Schreiben: *„Welche Dateien muss ich anfassen, und warum genau
diese?"* Ist die Antwort „viele, quer verteilt", stimmt der Schnitt nicht.

## 2. Kohäsion & Kopplung

- **Hohe Kohäsion:** Was in einer Einheit steht, arbeitet am selben Zweck. Sammel-
  Utils-Halden (`helpers`, `misc`, `common`) sind meist niedrige Kohäsion — lieber
  entlang der Domäne benennen und schneiden.
- **Lose Kopplung:** Minimiere, was ein Modul über die Interna eines anderen wissen
  muss. Ein Aufrufer, der die Feld-Reihenfolge/Storage-Form des Callees kennt, ist
  zu eng gekoppelt.
- **Faustregel:** Kopplung, die du nicht in einem Satz erklären kannst, ist zu viel.

## 3. Interfaces & Dependency-Richtung

- **Interface-first bei Grenzen:** An Modul-/Prozessgrenzen den Vertrag (Eingaben,
  Ausgaben, Fehler) zuerst festlegen — Implementierung danach. Der Vertrag ist die
  stabile Fläche, gegen die getestet und ersetzt wird.
- **Dependency Injection statt Hardcoding:** Kollaborateure hereingeben (Konstruktor/
  Parameter), nicht im Inneren instanziieren — sonst nicht test-/ersetzbar.
- **Versionierte, stabile Außenverträge:** APIs/Events additiv erweitern; Breaking
  Changes explizit versionieren (vgl. Konventionen in `AGENTS.md`).

## 4. Fehler-Shape & Fehlerbehandlung

- **Fehler an der Grenze übersetzen:** Rohe IO-/Provider-Fehler nicht durchreichen —
  in eine domänentaugliche Form wandeln (typisierte Exception, Result-Objekt,
  Fehler-Envelope). Aufrufer sollen nicht den Stacktrace des Providers sehen.
- **Kein Error-Handling für Unmögliches** (Simplicity First). Aber Grenzen (Netz,
  Parsing, User-Input) defensiv behandeln.
- **Konsistente Form pro Schicht:** gleiche Fehler-Repräsentation für gleiche
  Schicht (alle API-Fehler ein Envelope, alle Service-Fehler eine Exception-Familie)
  — *Consistency First*.

## 5. Wann abstrahieren (YAGNI vs. Wiederholung)

- **Erst duplizieren, dann abstrahieren.** Eine Abstraktion für einen einzigen
  Aufrufer ist Ballast. Muster erst extrahieren, wenn es sich **belegt** wiederholt
  (Rule of Three), nicht bei der ersten Ahnung.
- **Falsche Abstraktion ist teurer als Duplikat.** Eine verkehrt geschnittene
  gemeinsame Basis koppelt Unverwandtes und bremst beide Seiten.
- **Naht wo Änderung erwartet wird**, nicht wo sie theoretisch möglich wäre.

## 6. Testbarkeit als Design-Signal

- **Schwer zu testen = Design-Smell.** Braucht ein Stück Logik viel Mock-Gerüst
  oder einen laufenden Server/DB, um geprüft zu werden, ist es meist zu eng an IO
  gekoppelt → Logik herauslösen (§1).
- **Verhalten testen, nicht Interna:** gegen den Vertrag (§3) testen, damit Refactor
  ohne Test-Umbau möglich bleibt.
- **Sichtbares Verhalten end-to-end belegen** (Fertig-Definition in `AGENTS.md`),
  nicht nur Unit-Ebene.

## 7. Externe Konventionen — erst Konsument, dann Artefakt

Ein publiziertes Konventions-Artefakt (Manifest, Metadaten-Datei, maschinenlesbarer
Index) ist erst dann eine Anforderung, wenn ein **Konsument es nachweislich liest**.
"Es gibt eine Spec" und "andere publizieren es auch" belegen das nicht — beides ist
Angebot, kein Bedarf. Adoptionszahlen messen die Publisher-Seite und beantworten die
Frage deshalb nie.

Prüfreihenfolge, bevor so ein Artefakt gebaut oder gepflegt wird:

1. **Formaler Status** — Standard (RFC/W3C) oder Proposal? Ein Proposal verpflichtet
   keinen Anbieter zu irgendwas.
2. **Konsument benannt** — *wer* liest es? Eine Zusage oder Doku des Konsumenten
   zählt, eine Ankündigung oder ein Blog-Post über die Konvention nicht.
3. **Abruf-Signal messbar** — wird die Datei in den eigenen Server-Logs geholt, und
   von wem? Fehlt das Signal, ist die Annahme widerlegt, nicht offen.
4. **Pflegekosten** — veraltet das Artefakt still, wenn die Quelle sich ändert? Dann
   ist es schlechter als keins (Doku ≠ Realität, `../doc-harness/README.md`).

Fallen 2 und 3 negativ aus, ist das Artefakt YAGNI (§5): nicht bauen — und die
Entscheidung mit Belegdatum notieren, damit sie nicht alle drei Monate neu
diskutiert wird.

**Wann es umgekehrt gebaut wird:** wenn ein Konsument **benannt und prüfbar** ist —
eigenes Tooling, das die Datei liest; eine Integration, die das Format dokumentiert
verlangt; ein Abnehmer, der es zusagt. Dann ist Schritt 2 erfüllt und das Artefakt
gehört zum Deliverable. Nicht ausreichend ist die Nähe zum Thema: dass eine Site
KI-Inhalte anbietet oder verarbeitet, macht aus ihr noch keinen Leser fremder
Konventionsdateien.

**Fallbeispiel `llms.txt`** (Stand Juli 2026, Quellen in [linklist.md](linklist.md)):

- Status: informelle Spec (Jeremy Howard, Sept. 2024), explizit kein RFC/W3C.
- Search: Google nutzt die Datei nicht — sie hilft und schadet den Rankings nicht.
- Abruf-Signal: Server-Log-Analyse über 137.000 Domains (Mai 2026) — 97 % der Dateien
  bekommen null Requests; die stärkste Abrufergruppe sind SEO-Tools, KI-Retrieval-Bots
  liegen im Promille- bis Prozentbereich.
- Publisher-Adoption dagegen ~8,7 % der Tranco-Top-1000 — genau die Asymmetrie, wegen
  der Schritt 3 nicht durch Schritt "viele machen es" ersetzbar ist.
- Ergebnis der Prüfung: für Sichtbarkeit/SEO ist **keine** Wirkung belegt.

`llms.txt` ist trotzdem **gesetzter Hausstandard** — Teil der Web-Baseline neben
`robots.txt` und `sitemap.xml` (`../instructions/AGENTS.md` → Konventionen). Das ist
eine **Baseline-Entscheidung, keine Evidenz-Aussage**: begründet mit
Vollständigkeit und nahezu null Erstellungskosten, nicht mit gemessenem Nutzen. Die
Prüfreihenfolge oben bleibt davon unberührt und gilt für jedes *andere*
Konventions-Artefakt — eine gesetzte Entscheidung ersetzt den Test nicht, sie
überspringt ihn bewusst an einer benannten Stelle. Damit die Datei nicht zum Fall
"Doku ≠ Realität" wird (Schritt 4), wird sie aus der echten Struktur generiert und
nicht von Hand gepflegt.

---

*Pflege: Ergänzungen hier statt in `AGENTS.md` (dort nur die terse Regel + Pointer).
Bei Regel-Änderung mit Wirkung auf die Referenzaufgaben → Eval-Lauf nach `EVALS.md`.*
