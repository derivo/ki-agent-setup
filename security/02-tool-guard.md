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
- Zugriff auf sensible Pfade (`~/.ssh`, `~/.aws`) und Schreiben in die eigene
  Guard-/Permission-Config (`~/.claude/hooks`, `~/.claude/settings*`).

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

**Blockt** (jede Zeile hat einen Fall in `tool-guard.test.js`): `rm -rf` außerhalb
von Temp-Pfaden, auch mehrzeilig und mit `..` im Ziel · `git push --force` und die
`+refspec`-Schreibweise (nicht `--force-with-lease`) · Pipe-to-Shell · `chmod 777`
und `0777` · Fork-Bomb · Schreiben auf Device-Nodes · `eval` auf dynamischem
Input · Zugriff auf `~/.ssh` und `~/.aws` in allen drei Schreibweisen (`~`,
`$HOME`, absoluter `/Users/…`-Pfad) · Schreiben nach `~/.claude/hooks` oder
`~/.claude/settings*` · Secret-Muster in geschriebenem Datei-Inhalt.

**Lässt bewusst durch:** `rm -rf` unter `/tmp`, `/var/tmp`, `/var/folders`,
`$TMPDIR` · `--force-with-lease` und normales `git push` · Secret-Muster in
`.env`-Dateien (der laut `AGENTS.md` → Konventionen vorgesehene Ort) — **nicht**
in `.env.example`/`.sample`/`.dist`/`.template`, die committet werden.

**Bekannte Lücken — gemessen, nicht vermutet:**
- **Nur Textmuster.** `rm --recursive --force`, `R=rm; $R -rf …`, Quoting,
  Aliase, Wrapper und `env -i` kommen durch. Die `rm`-Erkennung greift nur bei
  zusammengefassten Kurzflags direkt hinter `rm`; kommen die Ziele über eine
  Pipe (`… | xargs rm -rf`), sieht der Guard keine und lässt durch.
- **Nur die genannten Werkzeuge.** `find … -delete`, `git clean -xfd`,
  `truncate`, Editoren und alles über MCP-Tools statt Bash sind nicht abgedeckt.
- **Zwei Fail-open-Pfade.** Ein unparsebarer Hook-Payload endet mit 0, und wenn
  stdin nicht innerhalb von 3 Sekunden schließt, ebenfalls. Beides ist Absicht —
  eine Harness-Änderung soll nicht die ganze Session verklemmen. Die
  Fail-closed-Zusage oben gilt damit **ab erkanntem Muster**, nicht davor.
- **Nur schreibende Pfade.** Exfiltration über lesende Kommandos ist Sache der
  Permission-Ebene, nicht dieses Guards. Die `~/.ssh`/`~/.aws`-Regeln sind die
  Ausnahme: sie greifen auch lesend, weil der Pfad im Kommandotext steht.
- **Secret-Muster sind eine Auswahl.** AWS, GitHub, GitLab, Slack, Google,
  Stripe-Live, `sk-`-Keys und Private-Key-Header sind abgedeckt; jedes andere
  Format läuft durch. Der Guard ersetzt `gitleaks` (Kontrolle
  [01](01-secret-scanning.md)) nicht, er greift nur früher.

**Wenn der Guard im Weg steht.** Er sieht Kommandotext, nicht Absicht: eine
PR-Beschreibung, ein Testfall oder ein Kommentar, der ein Blockmuster als
Literal enthält, wird geblockt. Das ist kein Defekt — der Ausweg ist, den Text
über `--body-file` zu übergeben oder das Literal im Quelltext zusammenzusetzen
(so macht es `tool-guard.test.js` selbst).

## Verhältnis zu den GSD-Hooks
Ergänzt `gsd-validate-commit` (Commit-Zeitpunkt) und `gsd-prompt-guard` um eine
generische Gefahren-Blockade auf Tool-Ebene. Reihenfolge: erst blocken (dieser
Hook), dann loggen (Audit-Hook).
