# Harness-Roadmap — die fünf Reifephasen

Ein Harness ist kein Zustand, sondern eine Leiter. Es gibt fünf Phasen, in denen
der Mensch immer weiter aus dem Detail rausrutscht — vom Entwickler über
Architekt und Product Owner bis zum Stakeholder. Wichtig: Man springt nicht nach
oben. Jede Sprosse wird verdient, indem die Gates der unteren Phase verlässlich
greifen.

Die Phasen sind stack-agnostisch. Welche konkreten Tools die Gates bilden, sagt
der Stack-Adapter ([`stacks/`](stacks/)).

---

## Phase 1 — Mikro-Management
**Was:** Du gibst Prompt für Prompt, lässt einzelnen Code generieren, reviewst
jede Funktionalität von Hand, iterierst.
**Deine Rolle:** Entwickler.
**Problem:** Sehr kleinteilig, das LLM produziert oft Code/Architektur, die nicht
passt.
**Stand:** Der Einstieg. Hier startet jedes neue Thema, das noch nicht ins Harness
gegossen ist.

## Phase 2 — Quality Driven
**Was:** Vor den Prompt kommt das Harness (die Regeln in
[GUARDRAILS.md](GUARDRAILS.md) und die globalen Instructions). Zusätzlich prüfen
statische Tools nach JEDER Änderung mechanisch die Einhaltung — nicht das LLM.
Bei Abweichung: Harness korrigieren (Harness Correction Development).
**Tools:** statische Analyse (Struktur/Abhängigkeiten) + Typprüfung + Formatter,
gebündelt hinter **einem** Gate-Kommando (stack-spezifisch — siehe Adapter).
**Deine Rolle:** Architekt.
**Voraussetzung zum Betreten:** Das Gate läuft lokal grün.

## Phase 3 — Spec Driven
**Was:** Du arbeitest nicht mehr primär mit freien Prompts, sondern mit Specs
(User Stories + Akzeptanzkriterien). Das Harness weiß, wie es eine Anforderung in
Entwicklungsaufgaben zerlegt (siehe [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md)).
**Tools:** [FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) + SPEC_WORKFLOW.md.
**Deine Rolle:** Übergang Architekt → Product Owner.
**Voraussetzung:** Phase 2 sitzt — der generierte Code hält sich zuverlässig an
die Architektur, ohne dass du jede Zeile prüfst.

## Phase 4 — Test Driven (aus Anforderungen)
**Was:** Aus jeder Spec wird ZUERST der Test generiert — abgeleitet aus den
Akzeptanzkriterien, nicht aus fertigem Code. Der Test verifiziert das
spezifizierte Verhalten. Dann Code, bis grün.
**Tools:** das Test-Framework des Stacks + die Durchstich-Regel in
[TESTS.md](TESTS.md).
**Deine Rolle:** Product Owner.
**Voraussetzung:** Phase 3 sitzt — Specs werden sauber zerlegt und abgearbeitet.

## Phase 5 — Idea / Voice Driven
**Was:** Du gibst nur noch Ideen rein (getippt oder diktiert). Das Harness weiß,
wie eine Idee aussieht, zerlegt sie in Anforderungen, die du im Review prüfst, und
entwickelt daraus. Du bewertest auf Business-Ebene, nicht mehr auf Code-Ebene.
**Deine Rolle:** Stakeholder.
**Voraussetzung:** Phase 2–4 greifen so verlässlich, dass du den Code nicht mehr
Zeile für Zeile lesen MUSST, weil die Tools garantieren, dass die Struktur stimmt.

---

## Ehrliche Einordnung

Wer Phase 5 erreicht, hat meist jahrelange Architektur-Erfahrung ins Harness
gesteckt. Die Geschwindigkeit ist nicht das Modell — es ist das Harness. Daraus
folgt:

1. **Das Harness wird nur so gut wie das eigene Verständnis** sauberer
   Architektur und der Domäne. Übernimm die Methode, nicht fremde Regelsätze —
   die konkreten Regeln (im Stack-Adapter) musst du selbst schreiben.

2. **Der Punkt, an dem man aufhört, den Code zu lesen** (Phase 5), kommt erst,
   wenn die Gates bewiesen haben, dass sie greifen. Bei sensiblen Domänen
   (personenbezogene Daten, Geld, Sicherheit) setze diesen Punkt SPÄTER an — die
   Gates prüfen Struktur, nicht ob eine fachliche/rechtliche Annahme stimmt.

3. **Bleib auf der Sprosse, die du verdient hast.** Ein autonomer Agent (Phase 5)
   ohne griffige Gates aus Phase 2–4 ist genau das Vibe-Coding, das vermieden
   werden soll. Die Reihenfolge ist nicht optional.
