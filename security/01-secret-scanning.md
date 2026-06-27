# 01 — Secret-Scanning (pre-commit + Gate)

**Schützt vor:** Credentials/Keys/Tokens, die in einen Commit oder ins Repo
geraten. AI-Commits leaken Secrets überdurchschnittlich oft (~3,2 % vs. 1,5 %
Basis); zehntausende Secrets liegen in öffentlichen Configs.

Das Harness hat die *Regel* (GUARDRAILS Regel 3/4) — diese Kontrolle macht sie
**mechanisch**: ein Scanner, der vor dem Commit blockt.

## Tool
- [gitleaks](https://github.com/gitleaks/gitleaks) (★28k) — schnell, gute
  Defaults, einfache Pre-Commit-Integration. Empfehlung.
- Alternativ [trufflehog](https://github.com/trufflesecurity/trufflehog) (★27k) —
  verifiziert Funde (prüft, ob ein Key live ist), gründlicher, langsamer.

## Einrichtung

Installieren (macOS):
```bash
brew install gitleaks
```

Pre-Commit-Hook im Projekt (`.git/hooks/pre-commit` oder via pre-commit-Framework):
```bash
gitleaks protect --staged --redact --verbose
```
`--staged` scannt nur, was committet wird; `--redact` zeigt keine Klartext-Secrets
im Output. Exit ≠ 0 → Commit wird abgebrochen.

History scannen (einmalig, bei Übernahme eines Repos):
```bash
gitleaks detect --redact
```

## Ins Setup einklinken
- Als Schritt im Stack-Gate (z. B. vor `composer quality`/CI): `gitleaks protect
  --staged`.
- Im `/commit`-Command als Teil des Pre-Commit-Checks aufrufen.
- Optional als PreToolUse-/Pre-Commit-Hook global (siehe
  [02-tool-guard.md](02-tool-guard.md)).

## Regel
Fund → **nicht** committen, Secret rotieren (es gilt als kompromittiert, sobald es
im Diff war), aus dem Code in `.env`/Secret-Store verschieben. Keine Allowlist-
Ausnahme ohne bewusste Begründung (`.gitleaksignore` sparsam).
