# Doc-Guardrails — die harten Regeln

Gelten immer, bei jeder Doku-Änderung. Der Agent prüft sie vor jedem Schreiben
(Selbst-Critic) und vor jeder Fertig-Meldung. Verstoß → nicht schreiben, sondern
korrigieren. Fehlt eine Regel, die einen Fehler verhindert hätte → hier ergänzen.

---

## A. Wahrheit & Belegbarkeit

### Regel 1 — Claims sind belegbar
Jede Faktenbehauptung (Verhalten, Pfad, Befehl, Versionsnummer, Konfigwert) muss
gegen eine echte Quelle prüfbar sein — Code, Config, Tool-Output, offizielle Doku.
Nicht aus Erinnerung schreiben. Was nicht belegt werden kann, wird nicht als
Faktum behauptet (siehe [VERIFY.md](VERIFY.md)).

### Regel 2 — URL-Provenance in der Session
Jede URL in einem committeten Dokument wird in derselben Session aufgelöst
(WebFetch/WebSearch oder direkter Abruf), nie aus dem Gedächtnis rekonstruiert.
Nicht auflösbare URLs werden entfernt und das wird benannt.

### Regel 3 — Ehrlichkeit
Keine geschönten oder erfundenen Angaben. Unsicheres wird als unsicher markiert
("unverifiziert", "TODO: gegen X prüfen"), nicht als Faktum getarnt. Was nicht
funktioniert/nicht belegt ist, wird klar benannt statt übergangen.

## B. Struktur & Pflegbarkeit

### Regel 4 — Single-Source, kein Duplikat
Eine Information lebt an genau einer Stelle. Andere Dokumente **verweisen**
darauf (Pointer/Link), statt sie zu kopieren. Duplikate driften auseinander und
sind die zweithäufigste Quelle veralteter Doku.

### Regel 5 — Keine toten Links
Interne Links zeigen auf existierende Dateien/Anker, externe auf erreichbare
Ziele. Eingebettete Diagramme (z. B. Mermaid) müssen rendern.

### Regel 6 — Konsistente Terminologie
Ein Begriff pro Konzept, durchgängig. Keine Synonym-Schwankung (nicht mal
"Nutzer", mal "User", mal "Anwender" für dasselbe). Bestehende Begriffe und den
Schreibstil des Projekts matchen.

## C. Datenschutz & Secrets

### Regel 7 — Keine Secrets, keine echten personenbezogenen Daten
Keine API-Keys, Tokens, Passwörter, internen Hostnamen in Beispielen. Beispieldaten
sind synthetisch (Platzhalter, offensichtlich erfunden), niemals echte Personen-
oder Produktionsdaten.

## D. Chirurgische Änderungen

### Regel 8 — Nur das Nötige anfassen
Kein "Verbessern" angrenzender Abschnitte, keine Umformatierung unbeteiligter
Teile. Jede geänderte Zeile ist auf den Auftrag zurückführbar. Fremde Schwächen
erwähnen, nicht ungefragt umschreiben.

---

## Das Fertig-Kriterium

> Du bewertest deine Arbeit nicht selbst.

Ein Dokument gilt erst als fertig, wenn das Gate aus [VERIFY.md](VERIFY.md) grün
ist: mechanische Checks (Lint, Links, Render, Terminologie) bestanden **und**
jede Faktenbehauptung gegen ihre Quelle geprüft. "Liest sich gut" ist kein
Fertig-Kriterium.
