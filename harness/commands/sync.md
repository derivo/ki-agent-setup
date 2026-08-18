Bringe das lokale Setup auf den Repo-Stand: Instructions, Harness, Commands,
Skills, Hooks. Richtung ist **Repo → Maschine**; das Repo ist die Quelle, die
Client-Verzeichnisse sind Spiegel.

**Nicht zu verwechseln mit `/hx:retro` Schritt 5.** Der geht in die andere
Richtung (Maschine → Repo, geparkte Ideen als PR). Dieser Command hier *wendet
an*, er ändert das Repo nicht.

## Was dieser Command nicht selbst weiß

Die Einzelschritte stehen in [`APPLY.md`](../../APPLY.md) und werden vom
Skill `ki-agent-setup` orchestriert. Dieser Command **dupliziert sie nicht** — er
ist der Einstiegspunkt und ergänzt die zwei Schritte, die beim reinen Sync
zusätzlich anfallen. Bei Widerspruch gewinnt `APPLY.md`.

## Ablauf

1. **Repo-Wurzel finden** — dort liegen `APPLY.md`, `harness/`, `instructions/`.
   Nicht gefunden → melden und abbrechen, nicht raten. Ein Sync aus dem falschen
   Verzeichnis überschreibt Spiegel mit fremdem Inhalt.

2. **Geparkte Harness-Ideen zuerst lesen** — `cat ~/.agents/harness-inbox.md`
   (falls vorhanden). Einträge mit `Status: geparkt` **hier nur anzeigen**, nicht
   anwenden: was noch nicht im Repo ist, wird von diesem Command nicht deployt.
   Zweck ist die Warnung — sonst syncst du einen Stand, von dem du glaubst, er
   enthielte eine Idee, die tatsächlich nur lokal parkt. Übernehmen ist Sache von
   `/hx:retro` Schritt 5.

3. **Known-Good-Tool-Versionen prüfen** — `APPLY.md` Abschnitt A7. Je Zeile das
   Drift-Kommando laufen lassen und mit der Tabelle vergleichen. Abweichung →
   **melden**, nicht die Tabelle nachziehen: hinter den Einträgen stehen
   reproduzierte Verhaltensproben, und die gelten erst nach erneuter Prüfung.

4. **Setup anwenden** — Skill `ki-agent-setup` bzw. `APPLY.md` Teil A + den
   Teil-B-Block jedes einzurichtenden Clients. Welche das sind, entscheidet
   `APPLY.md` B0: nur Clients mit auffindbarer CLI, ein vorhandenes
   Config-Verzeichnis zählt nicht. Übersprungene Clients gehören in den Bericht
   (Schritt 6). Dabei gilt unverändert:
   - Bestehende User-Werte **mergen**, nicht blind überschreiben.
   - `rsync --delete` nur auf repo-owned Spiegel (`APPLY.md` A2 Guardrail) —
     **nie** auf `~/.claude/skills/`, dort liegen fremde Symlinks.
   - Plugin-eigene Hooks nicht in `settings.json` eintragen (`APPLY.md` B1.5).
   - Vor Änderungen an bestehenden Dateien unter den globalen
     Client-Verzeichnissen ein Datei-Backup.

5. **Verifizieren, nicht behaupten** — je Client der Verify-Block seines
   Teil-B-Abschnitts. Mindestens: die Harness-Kopien sind gegen das Repo
   identisch (`diff -qr`), die Instruction-Dateien byte-gleich (`cmp -s`), die
   Command-/Skill-Deploys sync
   (`scripts/deploy-codex-harness-skills.sh --check`). Ein Existenz-Check reicht
   nicht — er erkennt veraltete Kopien nicht.

6. **Bericht** — was gesynct wurde, welche Verify-Checks grün sind, welche
   Abweichung bewusst stehen bleibt, und ob die Inbox aus Schritt 2 noch
   geparkte Einträge enthält.

## Wann dieser Command fällig ist

Nach jedem `git pull` im Setup-Repo, der `instructions/`, `harness/`,
`doc-harness/`, `security/` oder `skills/` berührt hat. **Ein Merge macht die
Spiegel nicht aktuell** — bis zum Sync arbeitet jeder Client weiter mit dem alten
Stand, und ein grüner Repo-Gate sagt darüber nichts.
