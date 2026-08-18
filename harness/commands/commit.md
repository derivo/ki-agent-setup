Committe die aktuellen Änderungen — sauber und atomar, kein blinder `git add .`.

1. **Pre-Commit-Check** (read-only): Gate grün? Keine Secrets/Debug-Reste im Diff?
   Doku/Tests zur Änderung passend? Abweichungen dem User **anzeigen**.
2. **Diff sichten** — nur zusammengehörige Änderungen in einen Commit. Mehrere
   Themen → mehrere Commits.
   Dabei den eigenen Ballast rausnehmen, solange er noch ungestaged ist:
   erklärende Kommentarblöcke, die den Code wiederholen; Abstraktionen mit einem
   einzigen Aufrufer; Doku zu Dingen, die niemand gefragt hat (GUARDRAILS §0,
   *Simplicity First*). Das betrifft **nur den eigenen Diff** — fremder Code wird
   erwähnt, nicht aufgeräumt (*Surgical Changes*). Für den geführten Durchgang:
   Skill `simplify`.
3. **Message** im Conventional-Commit-Format (`feat:`/`fix:`/`docs:`/`refactor:`
   …), Englisch, beschreibt das *Warum*. Keine generische „update".
4. **Nur committen, nicht pushen** — außer der User verlangt Push ausdrücklich
   (Freigabe-Regel, AGENTS.md).

Bei rotem Gate oder offenen Findings: nicht committen, erst melden.
