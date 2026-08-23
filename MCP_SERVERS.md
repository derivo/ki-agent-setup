# MCP-Server — empfohlene Erweiterungen

Sinnvolle MCP-Server für die tägliche Arbeit, mit Sicherheits-Hinweisen. MCP ist
Angriffsfläche (siehe [security/05-supply-chain.md](security/05-supply-chain.md)) —
deshalb nur reputable/offizielle Server, gepinnt, ohne Klartext-Secrets in der
Config, keine no-auth-Server aus dem Netz.

Diese Datei ist zugleich das **secret-freie Inventar** des Setups: `mcp.json`
wird (wegen Tokens/Pfaden) nicht versioniert — reproduziert wird aus den Tabellen
hier ([`APPLY.md`](APPLY.md) A4 installiert das Kern-Set). Ändert sich
der installierte Server-Bestand dauerhaft, diese Datei nachziehen.

## Kern-Set — hoher Tagesnutzen (wird in APPLY.md A4 reproduziert)

| Server | Quelle | Nutzen |
|---|---|---|
| **context7** | [upstash/context7](https://github.com/upstash/context7) (★58k) | Aktuelle Library-/Framework-Doku direkt im Kontext — gegen veraltetes Modellwissen. Größter Daily-ROI. |
| **GitHub MCP** | [github/github-mcp-server](https://github.com/github/github-mcp-server) (★31k, offiziell) | PRs, Issues, Repos, Actions direkt steuern. |
| **Playwright MCP** | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) (★34k, offiziell) | Live-Browser: Tests, Screenshots, E2E-Verify — passt zu `/hx:verify`. |

## Entwicklung (lokaler Dev-Stack)

Für PHP/Laravel + MySQL/MariaDB + Docker.

| Server | Quelle | Nutzen |
|---|---|---|
| **dbhub** (Datenbank) | [bytebase/dbhub](https://github.com/bytebase/dbhub) (★3k) | MySQL/MariaDB/Postgres/SQL Server abfragen — Schema, Tabellen, Queries. Zero-dependency, **read-only by default**. |
| **Docker MCP** | [ckreiling/mcp-server-docker](https://github.com/ckreiling/mcp-server-docker) (★723) | Container inspizieren, **Logs streamen**, compose verwalten — passt zur Docker-Dev-Umgebung. Deckt auch „Logs analysieren" für Container ab. |
| **Sentry MCP** | (offiziell, falls Sentry im Einsatz) | Fehler/Issues aus dem Monitoring in den Kontext. |
| **Reference-Server** (fetch, memory, time …) | [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) (★87k, offiziell) | Selektiv einzelne nehmen (z. B. `fetch`), nicht alle. |

> **Docker-MCP-Setup (macOS/Docker-Desktop):** läuft via `uvx
> mcp-server-docker` (braucht `uv`: `brew install uv`). Docker Desktop hat **kein**
> `/var/run/docker.sock` → `DOCKER_HOST` auf den realen Socket setzen, sonst
> „Failed to connect":
> ```bash
> claude mcp add docker --scope user \
>   --env DOCKER_HOST=unix://$HOME/.docker/run/docker.sock -- uvx mcp-server-docker
> ```
> Den Pfad mit `docker context inspect --format '{{.Endpoints.docker.Host}}'`
> bestätigen. **Achtung:** der Server kann Container nicht nur lesen, sondern auch
> stoppen/entfernen — nur in vertrauenswürdiger Umgebung, Tool-Output untrusted.

### E-Mail-Testing & Log-Analyse — ehrliche Einordnung
- **Mailpit** ([axllent/mailpit](https://github.com/axllent/mailpit), ★9.7k) ist ein
  super E-Mail/SMTP-Test-Tool mit **REST-API + Web-UI** — aber **kein** reifer
  MCP-Server. Es gibt nur Mini-Community-Wrapper (★0–2, ungeprüft). Empfehlung:
  Mailpit normal nutzen (UI/API); MCP nur, wenn ein Wrapper vorher reviewt wird
  ([security/05](security/05-supply-chain.md)).
- **Log-Analyse:** dedizierte Log-MCP-Server sind unreif (alle ★0–5). Für
  Container-Logs den **Docker-MCP** nehmen; für Dateilogs reichen die nativen
  Tools (`rg`, `tail`, `grep`) — kein MCP nötig.

### Sicherheit für DB-MCP (wichtig)
30+ CVEs gegen MCP-Server allein Jan–Feb 2026; Findings in ~66 % populärer Server.
Für `dbhub`/DB-Server: **read-only**, gegen lokale Test-/Dev-DB oder Read-Replica,
**nie** Produktions-Credentials. Verbindungsstring aus `.env`, nicht in `mcp.json`.

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
