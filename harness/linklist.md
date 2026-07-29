# Linklist — kuratierte Grundlagen-Quellen

Nachschlage-Liste stabiler externer Quellen, auf die sich Setup/Harness stützen
oder die bei Design-/Frontend-Arbeit wiederkehren. **Kuratiert, nicht gesammelt:**
jeder Link genau **einmal**, in dem Block, wo er thematisch hingehört.

- Wie ein Link hier hineinkommt: Skill [`linklist-curator`](../skills/linklist-curator/SKILL.md).
- Ausgeben: `/hx:linklist`.
- **Provenance:** jede URL wird beim Eintragen in derselben Session aufgelöst; nicht
  auflösbare Links werden nicht aufgenommen (siehe Skill).

## Agent-Setup & Methode
- [design.md (google-labs-code)](https://github.com/google-labs-code/design.md) — Format-Spec, um ein Design-System maschinenlesbar an AI-Agents zu geben (Token-YAML + Prosa); im Harness als kanonische Token-Quelle verankert (GUARDRAILS Abschnitt G).
- [Design Tokens Format Module 2025.10 (W3C DTCG)](https://www.designtokens.org/tr/2025.10/format/) — Final Community Group Report (28.10.2025, keine W3C Recommendation), definiert Design-Tokens als `$value`/`$type`-JSON; im Harness das Austauschformat, von dem das Token-Modell der `DESIGN.md` abstammt.
- [skills.sh](https://skills.sh) — Open Agent Skills Directory: wiederverwendbare Agent-Skills per Kommando finden und installieren.
- [ui-skills (ibelick)](https://github.com/ibelick/ui-skills) — Agent-Skills für Design-Engineering-Aufgaben (`npx ui-skills`); Herkunft unseres `skills/design-md-curator` (adaptiert aus dessen `create-design-md`, nicht übernommen).

## Maschinenlesbare Artefakte für Agents
- [llms.txt (llmstxt.org)](https://llmstxt.org/) — informelle Spec (Jeremy Howard, Sept. 2024) für eine kuratierte Markdown-Landkarte einer Site unter `/llms.txt`; kein RFC/W3C.
- [Google: llms.txt beeinflusst Rankings nicht (Search Engine Land)](https://searchengineland.com/google-says-llms-txt-files-wont-harm-or-help-your-search-rankings-480264) — Googles Position aus dem AI-Search-Optimization-Guide: Search nutzt die Datei nicht, sie hilft und schadet nicht.
- [llms.txt: 97 % der Dateien ohne KI-Requests (PPC Land)](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/) — Ahrefs-Server-Log-Analyse über 137.000 Domains (Mai 2026); stärkste Abrufergruppe sind SEO-Tools, nicht KI-Bots.
- [llms.txt-Adoption der Tranco-Top-1000 (Rankability)](https://www.rankability.com/data/llms-txt-adoption/) — monatlich gemessene Publisher-Adoption mit offengelegter Methodik (HTTP 200 + Plaintext, Unerreichbare im Denominator).

## UI-Komponenten-Bibliotheken
- [Kokonut UI](https://kokonutui.com) — 100+ UI-Komponenten (Tailwind, shadcn/ui, Motion; React/Next).
- [React Bits](https://reactbits.dev) — animierte UI-Komponenten für React.
- [Magic UI](https://magicui.design) — 150+ animierte Komponenten (React/TS/Tailwind/Motion), shadcn/ui-Begleiter, für Landingpages.

## Animation
- [Anime.js](https://animejs.com) — schnelle, flexible JavaScript-Animationsbibliothek.
- [Motion](https://motion.dev) — Open-Source-Animationsbibliothek für React, JavaScript und Vue.
