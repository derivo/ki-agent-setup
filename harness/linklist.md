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

## UI-Komponenten-Bibliotheken
- [Kokonut UI](https://kokonutui.com) — 100+ UI-Komponenten (Tailwind, shadcn/ui, Motion; React/Next).
- [React Bits](https://reactbits.dev) — animierte UI-Komponenten für React.
- [Magic UI](https://magicui.design) — 150+ animierte Komponenten (React/TS/Tailwind/Motion), shadcn/ui-Begleiter, für Landingpages.

## Animation
- [Anime.js](https://animejs.com) — schnelle, flexible JavaScript-Animationsbibliothek.
- [Motion](https://motion.dev) — Open-Source-Animationsbibliothek für React, JavaScript und Vue.
