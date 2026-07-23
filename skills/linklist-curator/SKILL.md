---
name: linklist-curator
description: Trägt einen Link kuratiert in die Harness-Linklist (harness/linklist.md) ein. Use when the user wants to remember/track a URL, tool, library, or source in the linklist — e.g. "merk dir den Link", "trag X in die Linklist ein", "füge die Quelle hinzu", "das gehört in die Linklist". Erklärt, wie ein Link hineinkommt: Provenance auflösen, dedupen, in den passenden Block, eine Zeile Beschreibung, sortiert halten.
---

# linklist-curator

`harness/linklist.md` ist eine **kuratierte** Nachschlage-Liste, kein Sammelbecken.
Dieser Skill beschreibt den einzigen Weg, wie ein Link dort hineinkommt — damit die
Liste knapp, korrekt und navigierbar bleibt. Ausgegeben wird sie mit `/hx:linklist`.

## Wann anwenden
- Der Nutzer will eine URL / ein Tool / eine Quelle dauerhaft festhalten.
- Ein Link taucht in der Arbeit auf, der als Grundlage wiederkehren wird.

## Ablauf

### 1. Provenance auflösen (Pflicht, zuerst)
Die URL **in dieser Session** abrufen (WebFetch/Suche), nicht aus Erinnerung
eintragen. Löst sie nicht auf → **nicht aufnehmen** und das benennen. Aus dem Abruf
kommt die Ein-Zeilen-Beschreibung (was es ist, nicht Marketing-Text).

### 2. Dedup — jeder Link genau einmal
Vor dem Eintragen prüfen, ob die Domain/URL schon in `harness/linklist.md` steht
(`grep` auf den Host). Existiert sie → nicht doppeln; höchstens die Beschreibung
schärfen oder in den besseren Block verschieben.

### 3. In den passenden Block
Die Liste ist in **thematische Blöcke** (`##`) gegliedert, in denen zusammengehörige
Links stehen. Den Link in den Block legen, der thematisch passt. Passt keiner:
**einen neuen Block** mit kurzem, sprechendem Titel anlegen — sparsam, Blöcke sind
grobe Kategorien, keine Ein-Link-Schubladen. Straddelt ein Link zwei Themen, nach
seinem **Hauptzweck** einsortieren (z. B. Komponenten-Bibliothek mit Animationen →
UI-Komponenten, nicht Animation).

### 4. Ein-Zeilen-Beschreibung
`- [Name](url) — was es ist / warum es hier steht.` Ein Satz, faktisch. Kein
Changelog, keine Wertung.

### 5. Sortiert halten
Blöcke in logischer Reihenfolge (Grundlagen/Methode vor spezifischen Tool-Blöcken);
innerhalb eines Blocks sinnvoll gruppiert. Die Liste liest sich von allgemein nach
speziell.

### 6. Committen
Atomarer Commit; in der Message steht, dass die URL in der Session aufgelöst wurde
(Provenance). Danach ggf. Deploy-Mirror syncen (Linklist liegt unter `harness/`,
wird per `rsync harness/ ~/.claude/harness/` mitgezogen — siehe `APPLY.md`).

## Nicht Aufgabe dieses Skills
Ausgeben/Ansehen der Liste → Command `/hx:linklist` (read-only). Dieser Skill
**schreibt**, der Command **liest**.
