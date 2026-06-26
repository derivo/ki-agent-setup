# Doc-Harness — dokumentarisches Set für Doku-Projekte

Anleitung, wie ein KI-Agent **Dokumentation** entwickelt: von der Klärung des
Zwecks über das Schreiben zum verifizierten, gegen die Quelle geprüften Ergebnis.
Schwesterstück zum [`harness/`](../harness/README.md) (das für Code gilt) — hier
für Doku-Projekte (README-Sammlungen, API-Docs, Handbücher, Compliance-Texte).

Wie das Code-Harness enthält dieses Set **keine Skripte und keine CI** — nur
Dokumentation, aus der ein Agent ableitet, *wie* Doku hier entsteht und wann sie
als fertig gilt.

## Der Kernunterschied zum Code-Harness

Code ist ausführbar — sein Gate ist der grüne Testlauf. Doku ist es nicht. Das
häufigste Doku-Versagen ist nicht "liest sich schlecht", sondern **Doku ≠
Realität**: veraltet, behauptet etwas, das der Code/das Produkt nicht (mehr) tut.
Kein Linter fängt das. Deshalb ist das zentrale Gate hier **Claims-gegen-Quelle**:
jede Faktenbehauptung wird in derselben Session gegen die echte Quelle geprüft
(siehe [VERIFY.md](VERIFY.md)).

## Dateien & Lesereihenfolge

1. **[DOC_GUARDRAILS.md](DOC_GUARDRAILS.md)** — die harten Regeln (Single-Source,
   keine Secrets, Claims belegbar, keine toten Links). Gelten immer.
2. **[DOC_WORKFLOW.md](DOC_WORKFLOW.md)** — der Ablauf: Zweck klären → gliedern →
   schreiben → Gate → korrigieren.
3. **[DOC_TEMPLATE.md](DOC_TEMPLATE.md)** — die Form: Zweck, Zielgruppe, Scope,
   Fertig-Kriterien, bevor geschrieben wird.
4. **[VERIFY.md](VERIFY.md)** — das Gate: mechanische Checks (Lint, Links,
   Mermaid, Terminologie) **plus** Claims-gegen-Quelle.
5. **[SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md)** — das Herz: die prüfende
   Schleife (wiederholen bis verifiziert, Update-Reflex) und wie das Harness aus
   jedem Fehler schärfer wird (Harness Correction).

## Reifegrade (schlank)

Kein 5-Stufen-Modell wie beim Code — Doku trägt das nicht. Vier Stufen reichen:

1. **Handgeschrieben** — schreiben, manuell reviewen.
2. **Quality-gated** — Lint + Link-Check mechanisch nach jeder Änderung.
3. **Spec-driven** — Zweck/Zielgruppe/Fertig-Kriterien stehen *vor* dem Schreiben.
4. **Source-verified** — jede Faktenbehauptung gegen die Quelle geprüft; das Gate
   ist erst grün, wenn Claims belegt sind.

Stufe 4 ist das Ziel: ab da ist die Doku so verlässlich wie ihr letzter
Verify-Lauf, nicht wie das Bauchgefühl des Autors.

## Wann nicht
Für ein paar kleine README-Dateien ist das Overkill (Simplicity First). Lohnt
sich bei großen, langlebigen oder korrektheitskritischen Doku-Basen — besonders,
wenn Doku an Code gekoppelt ist oder mehrere Autoren beteiligt sind.
