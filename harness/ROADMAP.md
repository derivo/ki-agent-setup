# Harness-Roadmap — die fünf Reifephasen

Ein Harness ist kein Zustand, sondern eine Leiter. Es gibt fünf Phasen, in denen
der Mensch immer weiter aus dem Detail rausrutscht — vom Entwickler über
Architekt und Product Owner bis zum Stakeholder. Wichtig: Man springt nicht nach
oben. Jede Sprosse wird verdient, indem die Gates der unteren Phase verlässlich
greifen.

Diese Datei mappt die Phasen auf dein Projekt (PHP 8.2 / Slim 4 / MariaDB / Pi).

---

## Phase 1 — Mikro-Management
**Was:** Du gibst Prompt für Prompt, lässt einzelnen Code generieren, reviewst
jede Funktionalität von Hand, iterierst.
**Deine Rolle:** Entwickler.
**Problem:** Sehr kleinteilig, das LLM produziert oft Code/Architektur, die nicht
passt.
**Dein Stand:** Das ist der Einstieg. Hier startest du jedes neue Thema, das du
noch nicht ins Harness gegossen hast.

## Phase 2 — Quality Driven
**Was:** Vor den Prompt kommt das Harness (deine `CLAUDE.md`-Hierarchie und die
Regeln in [GUARDRAILS.md](GUARDRAILS.md)). Zusätzlich prüfen statische Tools nach
JEDER Änderung mechanisch die Einhaltung — nicht das LLM. Bei Abweichung: Harness
korrigieren (Harness Correction Development).
**Deine Tools:** `deptrac` (Struktur) + `phpstan` + `php-cs-fixer` (Code),
gebündelt hinter `composer quality`.
**Deine Rolle:** Architekt.
**Voraussetzung zum Betreten:** Die Gates laufen lokal (`composer quality`) grün.

## Phase 3 — Spec Driven
**Was:** Du arbeitest nicht mehr primär mit freien Prompts, sondern mit Specs
(User Stories + Akzeptanzkriterien). Das Harness weiß, wie es eine Anforderung in
Entwicklungsaufgaben zerlegt (siehe [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md)).
**Deine Tools:** [FEATURE_TEMPLATE.md](FEATURE_TEMPLATE.md) + SPEC_WORKFLOW.md.
**Deine Rolle:** Übergang Architekt → Product Owner.
**Voraussetzung:** Phase 2 sitzt — der generierte Code hält sich zuverlässig an
die Architektur, ohne dass du jede Zeile prüfst.

## Phase 4 — Test Driven (aus Anforderungen)
**Was:** Aus jeder Spec wird ZUERST der Test generiert — abgeleitet aus den
Akzeptanzkriterien, nicht aus fertigem Code. Der Test verifiziert das
spezifizierte Verhalten. Dann Code, bis grün.
**Deine Tools:** Pest, die API-Test-Regel in [TESTS.md](TESTS.md).
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

## Ehrliche Einordnung für DEIN Projekt

Wer Phase 5 erreicht, hat meist jahrzehntelange Architektur-Erfahrung ins Harness
gesteckt. Die Geschwindigkeit ist nicht das Modell — es ist das Harness. Das
heißt für dich:

1. **Dein Harness wird nur so gut wie dein eigenes Verständnis** sauberer
   PHP-Architektur und deiner Wohngruppen-Domäne. Übernimm die Methode, nicht
   fremde Regelsätze — die musst du selbst schreiben.

2. **Der Punkt, an dem du aufhörst, den Code zu lesen** (Phase 5), kommt erst,
   wenn die Gates bewiesen haben, dass sie greifen. Bei einer App mit Daten von
   Minderjährigen setze diesen Punkt SPÄTER an. Lies den Code länger mit, als
   sich "nötig" anfühlt — die Gates prüfen Struktur, nicht ob eine
   Datenschutz-Annahme stimmt.

3. **Bleib auf der Sprosse, die du verdient hast.** Ein autonomer Agent (Phase 5)
   ohne griffige Gates aus Phase 2–4 ist genau das Vibe-Coding, das du vermeiden
   willst. Die Reihenfolge ist nicht optional.

Wo du heute stehst: Mit dem aktuellen Skelett bist du startklar für Phase 2 und
kannst Richtung 3–4 arbeiten. Phase 5 ist ein Ziel, kein nächster Schritt.
