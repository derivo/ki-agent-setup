# 02 — PreToolUse-Block-Hook (aktiv blocken)

**Schützt vor:** zerstörerischen oder gefährlichen Tool-Aufrufen, **bevor** sie
laufen — `rm -rf`, `git push --force`, `eval`, Schreiben von Secrets, offensichtliche
Injection-Muster. Unser `audit-log.js` schreibt nur mit (passiv); diese Kontrolle
**blockt** (aktiv).

## Mechanik
Ein PreToolUse-Hook (matcher `Bash|Write|Edit`) liest das Tool-Input auf stdin,
prüft gegen Block-Muster und beendet mit **exit 2** bei Treffer → der Aufruf wird
verhindert, die stderr-Meldung geht als Feedback an den Agenten. **Fail-closed:**
Bei Unsicherheit blocken/zur manuellen Freigabe zwingen, nicht durchlassen.

## Mindest-Blockliste
- `rm -rf` auf nicht-temporären Pfaden, `:(){ :|:& };:`, `dd of=/dev/…`.
- `git push --force`/`-f` auf geschützte Branches.
- `eval`/`exec` auf dynamischem Input, `curl … | bash`, `chmod 777`.
- Schreiben von Dateien mit Secret-Mustern (an [01](01-secret-scanning.md) koppeln:
  `gitleaks` über den zu schreibenden Inhalt laufen lassen).
- Zugriff auf sensible Pfade (`~/.ssh`, `~/.aws`, `.env` lesen+exfiltrieren).

## Umsetzung — zwei Wege
1. **Eigener Hook (empfohlen):** kleines Skript nach dem Muster der bestehenden
   `gsd-*`-Guards, in `settings.json` als PreToolUse registriert. Volle Kontrolle,
   keine fremde Abhängigkeit. Die Block-Muster oben als Startpunkt.
2. **Fertige Lösung:**
   [mafiaguy/claude-security-guardrails](https://github.com/mafiaguy/claude-security-guardrails)
   (PreToolUse/PostToolUse, 30+ Muster, Dashboard). **Achtung:** wenig verbreitet
   (★2) — vor Einsatz Code reviewen (ein Security-Hook hat vollen Tool-Input-
   Zugriff; ungeprüft einzubinden widerspricht [05](05-supply-chain.md)).

## Verhältnis zu bestehenden Hooks
Ergänzt `gsd-validate-commit` (Commit-Zeitpunkt) und `gsd-prompt-guard` um eine
generische Gefahren-Blockade auf Tool-Ebene. Reihenfolge: erst blocken (dieser
Hook), dann loggen (`audit-log.js`).
