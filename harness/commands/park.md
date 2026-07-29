Parke eine Harness-Idee für später: "$ARGUMENTS" — und arbeite dann weiter, wo du
warst. Dieser Command **ändert das Harness nicht**. Er hält fest, damit die Idee die
laufende Arbeit nicht unterbricht.

**Warum das nicht `/hx:retro` ist:** `/hx:retro` läuft am Session-Ende, klassifiziert
und will die Regel *jetzt* vorschlagen samt Freigabe. Genau diese Unterbrechung
vermeidet `/hx:park`. Und `gsd-capture` schreibt nach `.planning/` — projektlokal und
versioniert, also am Harness vorbei.

## Ziel-Datei

`~/.agents/harness-inbox.md` — **maschinenlokal, außerhalb jedes Repos.** Damit
liegt sie in keinem Working Tree, muss nirgends ignoriert werden und verschmutzt kein
Projekt-Repo. Existiert sie nicht, mit der Überschrift
`# Harness-Inbox — geparkte Anpassungen (maschinenlokal, nicht versioniert)` anlegen.

Tradeoff, benennen statt verschweigen (analog `SKILLS.md` zum Skill-Lockfile):
maschinenlokal heißt, bei Maschinenverlust ist die Inbox weg. Sie ist eine
**Warteschlange zum Abarbeiten**, kein Archiv. Was dauerhaft gelten soll, gehört ins
Setup-Repo — die Inbox ist nur der Weg dorthin.

## Ablauf

1. **Provenance selbst ermitteln**, nicht erfragen:
   ```bash
   pwd; git rev-parse --abbrev-ref HEAD 2>/dev/null; git remote get-url origin 2>/dev/null
   ```
2. **Eintrag anhängen** (nur anhängen, nie bestehende Einträge umschreiben):

```markdown
## <YYYY-MM-DD> · <kurzer Titel>
- **Projekt:** <Verzeichnisname> (<remote-slug oder "kein remote">, Branch `<branch>`)
- **Idee:** was am Harness anders sein sollte — eine bis drei Zeilen.
- **Auslöser:** was konkret passiert ist, das die Idee ausgelöst hat.
  Mit Beleg: `datei.ts:42`, Fehlermeldung, beobachtetes Verhalten.
- **Ziel (Vermutung):** `GUARDRAILS.md` / Stack-Adapter / Command / Skill / `EVALS.md`
  — unsicher ist ok, dann `offen`.
- **Status:** geparkt
```

3. **Auslöser ist Pflicht, nicht Deko.** „Regel für X fehlt" ist drei Wochen später
   nicht mehr umsetzbar; „Executor kopierte Hexwerte statt Generator, `styles.css:6`"
   ist es. Fehlt der Auslöser, einmal danach fragen — sonst wird die Idee mit dem
   Hinweis geparkt, dass sie ohne Beleg schwer zu bewerten ist.

4. **Nichts anderes tun.** Keine Regel formulieren, keine Datei im Harness anfassen,
   keinen Branch anlegen, kein Commit. Eine Zeile Bestätigung — welcher Titel wohin
   geparkt wurde — dann zurück zur eigentlichen Aufgabe.

## Lesen und abarbeiten

Ansehen: `cat ~/.agents/harness-inbox.md` (kein eigener Command — die Inbox ist eine
Datei, nicht ein Werkzeug).

Abgearbeitet wird sie **gebündelt**, in einer bewussten Harness-Session: `/hx:retro`
zieht die geparkten Einträge neben den Session-Erkenntnissen mit heran, [`/hx:sync`](sync.md)
zeigt sie vor dem Anwenden an. Übernommene Einträge bekommen `**Status:** übernommen
(<commit>)`, verworfene `**Status:** verworfen — <Grund>`. Nichts wird gelöscht: eine
verworfene Idee, die wiederkommt, ist selbst ein Signal.

**Der Weg ins Repo läuft dort, nicht hier.** `/hx:retro` Schritt 5 bündelt die
freigegebenen Einträge in **einen** Branch + PR gegen das Setup-Repo — mit sauberem
Tree, Gate-Lauf und eigener Freigabe für den Push. Genau deshalb tut dieser Command
davon nichts: beim Parken ist der Working Tree per Definition dirty, das Repo unter
dir ist meist das Projekt und nicht `ki-agent-setup`, und eine geparkte Idee ist noch
keine formulierte Regel, aus der ein PR werden könnte.

## Nicht Aufgabe dieses Commands

- **Die Änderung machen.** Das ist die gebündelte Session danach.
- **Projekt-Wissen parken.** Entscheidungen/Domänenfakten des Projekts gehen ins
  Projekt-Memory bzw. GSD (`gsd-capture`), nicht in die Harness-Inbox.
- **Bugs im Projekt parken.** Die gehören ins Projekt-Tracking.
