# MCP-Server — empfohlene Erweiterungen

Sinnvolle MCP-Server für die tägliche Arbeit, mit Sicherheits-Hinweisen. MCP ist
Angriffsfläche (siehe [security/05-supply-chain.md](security/05-supply-chain.md)) —
deshalb nur reputable/offizielle Server, gepinnt, ohne Klartext-Secrets in der
Config, keine no-auth-Server aus dem Netz.

## Hoher Tagesnutzen

| Server | Quelle | Nutzen |
|---|---|---|
| **context7** | [upstash/context7](https://github.com/upstash/context7) (★58k) | Aktuelle Library-/Framework-Doku direkt im Kontext — gegen veraltetes Modellwissen. Größter Daily-ROI. |
| **GitHub MCP** | [github/github-mcp-server](https://github.com/github/github-mcp-server) (★31k, offiziell) | PRs, Issues, Repos, Actions direkt steuern. |
| **Playwright MCP** | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) (★34k, offiziell) | Live-Browser: Tests, Screenshots, E2E-Verify — passt zu `/verify`. |

## Situativ

| Server | Quelle | Nutzen |
|---|---|---|
| **Reference-Server** (fetch, memory, time …) | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) (★87k, offiziell) | Selektiv einzelne nehmen (z. B. `fetch`), nicht alle. |
| **Sentry MCP** | (offiziell, falls Sentry im Einsatz) | Fehler/Issues aus dem Monitoring in den Kontext. |

## Bewusst nicht
- **semgrep/mcp** — **archiviert**; SAST stattdessen per `semgrep`-CLI
  ([security/05](security/05-supply-chain.md)).
- **Filesystem-MCP** — Claude Code hat eigene Datei-Tools; zusätzlicher FS-Server
  vergrößert nur die Angriffsfläche.

## Einrichtung & Sicherheit
- Pro Server: offizielle Doku, **feste Version** pinnen.
- Tokens/Keys für den Server aus `.env`/Secret-Store, **nie** in `mcp.json` im
  Klartext, `mcp.json` nicht versionieren.
- Nur lokal laufende oder authentifizierte Server. Tool-Output eines MCP-Servers
  ist **untrusted** ([security/07](security/07-prompt-injection.md)).
- Neue MCP-Server in den periodischen Supply-Chain-Audit aufnehmen.
