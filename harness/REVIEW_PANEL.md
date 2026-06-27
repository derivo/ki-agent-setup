# Review-Panel — Multi-Agent-Validierung statt Single-Pass

Ein einzelner Agent, der seinen eigenen Code reviewt, übersieht systematisch das,
was er beim Schreiben übersehen hat. Stärker: **mehrere Reviewer mit getrennten
Lenses, parallel, mit adversarialer Gegenprüfung** — eine Validierungskette, bevor
"fertig" gilt. Das ergänzt das Fertig-Gate (GUARDRAILS C) um eine Urteilsebene,
die das mechanische Gate nicht liefert.

Wann: bei nicht-trivialen Änderungen vor der Fertig-Meldung, bei PR-Vorbereitung,
und immer bei Diffs, die Auth, Krypto, Migrationen, Secrets oder das Harness
berühren. Triviale Änderungen brauchen kein Panel (Simplicity First).

## Die Lenses

Jede Lens ist ein **eigener Subagent mit isoliertem Context** — so verschmutzt die
Review nicht den Hauptthread und jeder Reviewer ist blind für die Annahmen der
anderen.

- **Korrektheit** — Bugs, Edge-Cases, falsche Annahmen, nicht abgedeckte ACs.
- **Security** — Injection (SQL/Command/Path), Secrets im Code, fehlende
  Authz/Authn, unsichere Defaults, gefährliche Deserialisierung. (Details:
  GUARDRAILS Abschnitt E — Security-Pass.)
- **Performance** — N+1-Queries, unnötige IO/Allokationen, offensichtliche
  Hotspots. Nur wo es real zählt, keine Mikro-Optimierung.

Weitere Lens je nach Diff ergänzen (z. B. **Daten/Migrations** bei Schema-Änderung,
**API-Kompatibilität** bei Schnittstellen).

## Der Ablauf

```
Diff bestimmen
      │
      ▼
parallel:  [Korrektheit]  [Security]  [Performance]   ◄─ je 1 Subagent, isoliert
      │          │            │            │
      └──────────┴─────┬──────┴────────────┘
                       ▼
            Funde einsammeln (dedupliziert)
                       │
                       ▼
      adversariale Gegenprüfung pro Fund   ◄─ zweiter Agent versucht zu WIDERLEGEN
      (Default: refuted=true bei Unsicherheit)
                       │
                       ▼
      nur bestätigte Funde → Bericht (Datei:Zeile · Lens · Schwere · Fix)
```

## Regeln

- **Adversarial verifizieren, nicht bestätigen.** Der Gegenprüf-Schritt ist
  angewiesen, den Fund zu *widerlegen*. Übersteht er das nicht, fällt er raus.
  Das killt plausible-aber-falsche Funde.
- **Keine Scope-Creep, kein Lob.** Eine Zeile pro echtem Fund, nach Schwere. Stil-
  Nits nur, wenn sie die Bedeutung ändern.
- **Ein reproduzierbarer Fund schlägt ein architektonisches Bauchgefühl.**
- **Konsens-Schwelle bei Unsicherheit:** Wird ein Fund von mehreren Lenses
  unterschiedlich bewertet, gewinnt der konkretere, belegte.
- Bestätigte Funde fließen zurück in die prüfende Schleife
  ([SELF_OPTIMIZATION.md](SELF_OPTIMIZATION.md)) — und wenn ein Fund eine fehlende
  Regel offenlegt, wird sie ergänzt (Harness Correction).

## Aufruf
Per [`commands/review.md`](commands/README.md) (`/hx:review`) oder direkt im Loop vor
der Fertig-Meldung. Bei großen Batch-Änderungen können die Lens-Agents in
isolierten Worktrees laufen, jeder testet E2E vor dem Zusammenführen.
