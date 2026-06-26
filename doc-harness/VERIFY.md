# Verify — das Doku-Gate

Das Gate entscheidet, ob ein Dokument fertig ist — nicht die Selbsteinschätzung.
Zwei Ebenen: **mechanische Checks** (billig, automatisierbar) und
**Claims-gegen-Quelle** (der eigentliche Doku-Schutz, ein Agent-Task).

Dieses Set schreibt keine Skripte/CI vor; es beschreibt, was geprüft werden muss.
Wer das härten will, gießt die mechanische Ebene später in einen Pre-Commit-Hook
oder eine Pipeline.

---

## Ebene 1 — Mechanische Checks

Nach jeder Änderung, billig und eindeutig pass/fail:

- **Markdown-Lint** — Struktur/Format konsistent (z. B. `markdownlint`).
- **Link-Check** — interne Links zeigen auf existierende Dateien/Anker, externe
  sind erreichbar (z. B. `lychee` / `markdown-link-check`).
- **Render-Check** — eingebettete Diagramme (Mermaid u. a.) rendern fehlerfrei.
- **Terminologie/Spelling** — ein Begriff pro Konzept (Regel 6), keine Tippfehler
  in Befehlen/Pfaden.
- **Secrets-Scan** — keine Keys/Tokens/echten PII im Diff (Regel 7).

Beispielhafte lokale Befehle (an Projekt anpassen):
```
markdownlint "**/*.md"
lychee --no-progress "**/*.md"
```

## Ebene 2 — Claims-gegen-Quelle (der Kern)

Mechanische Checks sagen nichts darüber, ob der **Inhalt stimmt**. Diese Ebene
schon. Für jede Faktenbehauptung im geänderten Text:

1. **Behauptung isolieren** — Pfad, Befehl, Verhalten, Versionsnummer, Configwert,
   Anzahl, Ablauf.
2. **Quelle abrufen** — Code lesen, Befehl ausführen und Output prüfen, Config
   öffnen, URL in der Session auflösen (nicht aus Erinnerung).
3. **Abgleich** — stimmt die Behauptung exakt mit der Quelle? Bei Abweichung:
   Text korrigieren, nicht die Quelle "passend" interpretieren.
4. **Nicht belegbar?** — Behauptung entfernen oder klar als unverifiziert
   markieren und das benennen (Regel 3).

Besonders bei **Updates**: auch stehengelassene Behauptungen erneut prüfen — sie
sind der Hauptkanal für "Doku ≠ Realität".

## Fertig — Definition

Das Dokument ist fertig, wenn **beide** Ebenen grün sind und der Agent das
mechanisch beobachtbar meldet:
- Welche Checks liefen, mit welchem Ergebnis (Befehl + Resultat).
- Welche Claims gegen welche Quelle geprüft wurden.
- Was bewusst als unverifiziert markiert blieb (falls vorhanden).

Solange eine Ebene rot ist: beheben statt beenden. Keine "kosmetische" Grün-
Färbung (Link entfernen statt fixen, Claim verschleiern statt belegen).
