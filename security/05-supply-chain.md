# 05 — Supply-Chain-Audit (Skills & MCP-Server)

**Schützt vor:** verwundbaren oder bösartigen Erweiterungen. Ein Audit fand bei
**36,8 %** von ~4.000 gescannten Agent-Skills ≥1 Sicherheitsproblem; hunderte
MCP-Server stehen ohne Authentifizierung offen im Netz. Jeder Skill/MCP-Server
läuft mit den Rechten des Agenten — das ist Angriffsfläche.

Du hast **28 Skills aus zufälligen GitHub-Repos** + mehrere MCP-Server → das ist
hier konkret relevant.

## Regeln für neue Erweiterungen
- **Herkunft prüfen** vor Installation: offizielles/reputables Repo? Aktiv
  gepflegt? Sterne/Issues realistisch? (Ein 2-★-Security-Hook ist selbst ein
  Risiko — siehe [02](02-tool-guard.md).)
- **Pinnen:** feste Version/Commit, kein `@latest` für sicherheitsrelevante Teile.
  Das Lockfile `~/.agents/.skill-lock.json` hält Quelle + Commit-Hash fest.
- **Least privilege:** nur Skills/MCP installieren, die wirklich gebraucht werden
  (Priorisierung in [`SKILLS.md`](../SKILLS.md) → "Bewertung").

## Periodischer Audit
- **Skills:** Quellen aus `SKILLS.md`/Lockfile gegen die Upstream-Repos prüfen —
  archiviert? verwaist? bekannte Lücken? Verdächtige Skills entfernen.
- **MCP-Server:** Configs (`~/.claude/mcp.json`, Projekt-MCP) auf **Secrets im
  Klartext** und **no-auth-Server** prüfen. Kein MCP-Server ohne Authentifizierung
  ins Netz. Nur lokale/vertrauenswürdige Server.
- **Code-Scan:** Skills sind Markdown + ggf. Skripte/MCP — verdächtige Befehle,
  Egress, `eval` darin suchen.

## Tooling
- SAST über den Code neuer Dependencies: `semgrep` (CLI — die `semgrep/mcp`-
  Variante ist **archiviert**, daher CLI nutzen).
- Secret-Scan über MCP-Configs: `gitleaks detect` ([01](01-secret-scanning.md)).

## Rhythmus
Als wiederkehrender Check (z. B. monatlich oder bei jeder neuen Skill/MCP-
Installation) — nicht einmalig. Befund → entfernen oder pinnen + dokumentieren.

## Empfohlene MCP-Server
Eine kuratierte, sicherheitsbewusste Liste sinnvoller Server steht in
[`MCP_SERVERS.md`](../MCP_SERVERS.md).
