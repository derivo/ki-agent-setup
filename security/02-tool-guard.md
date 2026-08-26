# 02 — PreToolUse-Block-Hook (aktiv blocken)

**Schützt vor:** zerstörerischen oder gefährlichen Tool-Aufrufen, **bevor** sie
laufen — `rm -rf`, `git push --force`, `eval`, Schreiben von Secrets, offensichtliche
Injection-Muster. Ein Audit-Log-Hook schreibt nur mit (passiv); diese Kontrolle
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

## Umsetzung — liegt hier

Der Hook ist [`tool-guard.js`](tool-guard.js) in diesem Verzeichnis; das Repo ist
die **Quelle**, `~/.claude/hooks/security-tool-guard.js` der Mirror. Deploy und
Registrierung: `APPLY.md` B1.5. Nie im Mirror editieren — die Änderung wäre beim
nächsten Sync weg und hätte nie ein Review gesehen.

Sein Verhalten ist von [`tool-guard.test.js`](tool-guard.test.js) abgedeckt
(`make verify`): je Fall ein Hook-Payload, geprüft wird der Exit-Code — 2 für
blockt, 0 für lässt durch. Neue Muster kommen mit einem Fall dort hinein, sonst
ist nicht belegt, dass sie greifen.

Als fertige Alternative existiert
[mafiaguy/claude-security-guardrails](https://github.com/mafiaguy/claude-security-guardrails)
(PreToolUse/PostToolUse, 30+ Muster, Dashboard) — wenig verbreitet (★2), vor
Einsatz Code reviewen (ein Security-Hook hat vollen Tool-Input-Zugriff; ungeprüft
einzubinden widerspricht [05](05-supply-chain.md)).

## Threat-Model — was der Guard leistet und was nicht

Maßgeblich ist dieser Abschnitt: weicht der Code von der hier erklärten Absicht
ab, ist **der Code** der Fehler. Bei Änderungen an `tool-guard.js` gegen diesen
Abschnitt prüfen.

Der Guard ist ein **Sicherheitsnetz gegen den Unfall, keine Sicherheitsgrenze.**
Er unterstellt einen nicht-adversarialen Bediener, dessen reales Risiko der
Vertipper oder das falsche Verzeichnis ist — plus ein Modell, das ein
manipulierter Prompt zu einem plausiblen, aber falschen Kommando verleiten kann.
Gegen jemanden, der ihn umgehen *will*, hält er nicht.

**Blockt** (gemessen, `tool-guard.test.js`): `rm -rf` außerhalb von Temp-Pfaden ·
`git push --force` (nicht `--force-with-lease`) · Pipe-to-Shell · `chmod 777` ·
Fork-Bomb · `dd of=/dev/…` · `eval` auf dynamischem Input · Zugriff auf `~/.ssh`
und `~/.aws` · Secret-Muster in geschriebenem Datei-Inhalt.

**Lässt bewusst durch:** `rm -rf` unter `/tmp`, `/var/tmp`, `/var/folders`,
`$TMPDIR` · `--force-with-lease` · Secret-Muster in `.env`-Dateien (der laut
`AGENTS.md` → Konventionen vorgesehene Ort).

**Bekannte Lücken — gemessen, nicht vermutet:**
- **Nur Textmuster.** `rm --recursive --force`, `R=rm; $R -rf …`, Quoting,
  Aliase, Wrapper und `env -i` kommen durch. Die `rm`-Erkennung greift nur bei
  zusammengefassten Kurzflags direkt hinter `rm`.
- **Nur die genannten Werkzeuge.** `find … -delete`, `git clean -xfd`,
  `truncate`, Editoren und alles über MCP-Tools statt Bash sind nicht abgedeckt.
- **Fail-open bei kaputtem Input.** Unparsebarer Hook-Payload beendet mit 0 statt
  zu blocken — Absicht, damit eine Harness-Änderung nicht die ganze Session
  verklemmt. Die Fail-closed-Zusage oben gilt also **ab erkanntem Muster**, nicht
  davor.
- **Nur schreibende Pfade.** Exfiltration über lesende Kommandos ist Sache der
  Permission-Ebene, nicht dieses Guards.

## Verhältnis zu den GSD-Hooks
Ergänzt `gsd-validate-commit` (Commit-Zeitpunkt) und `gsd-prompt-guard` um eine
generische Gefahren-Blockade auf Tool-Ebene. Reihenfolge: erst blocken (dieser
Hook), dann loggen (Audit-Hook).
