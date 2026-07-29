# Skills-Inventar

Skills, die **nicht** aus GSD oder caveman stammen — separat installiert und Teil
des Setups. Sie werden über einen Skill-Manager verwaltet, dessen Lockfile unter
`~/.agents/.skill-lock.json` liegt und nach `~/.claude/skills/` verlinkt/kopiert.
Quelle pro Skill = GitHub-Repo, damit das Inventar reproduzierbar bleibt.

> Sync-Quelle der Wahrheit: `~/.agents/.skill-lock.json`. Wer das
> Setup neu aufbaut, stellt die Skills aus diesem Lockfile wieder her oder
> installiert sie einzeln aus den unten genannten Repos.

> **Pinning & Reproduzierbarkeit:** Die Installation über die `skills`-CLI zieht
> den aktuellen Stand des jeweiligen Quell-Repos — den exakt installierten Stand
> kennt nur das Lockfile. Das Lockfile ist **maschinenlokal** und nicht Teil
> dieses Repos: nach Skill-Änderungen eine Kopie sichern (privates Backup).
> Sonst ist bei Maschinenverlust nur die Quellenliste hier rekonstruierbar,
> nicht der geprüfte Stand (analog zur Known-Good-Tabelle der Plugins in
> `APPLY.md` B1.2).

Nicht hier gelistet: GSD-Skills (`gsd-*`, eigener Installer) und caveman
(`caveman:*`, Plugin).

---

## Repo-eigene Skills

Diese stammen **nicht** aus einem fremden Repo und stehen nicht im Lockfile — sie
gehören diesem Setup-Repo. Ausgerollt werden sie per Symlink in den Checkout, nicht
über die `skills`-CLI: `APPLY.md` A5.1 (Inhalt) und B1.7 (Link-Schritt). Ohne diesen
Schritt liegen sie nur im Checkout und sind nicht ladbar.

| Skill | Quelle | Zweck |
|---|---|---|
| `ki-agent-setup` | dieses Repo, `skills/ki-agent-setup/` | `APPLY.md` autonom anwenden — Setup bootstrappen bzw. syncen |
| `design-md-curator` | dieses Repo, `skills/design-md-curator/` | `DESIGN.md` aus Repo-/URL-Evidenz erstellen, gegen `GUARDRAILS_UI.md` G validieren |
| `linklist-curator` | dieses Repo, `skills/linklist-curator/` | Links in `harness/linklist.md` aufnehmen, inkl. Provenance-Auflösung |

## Web / Frontend / Design / SEO

| Skill | Quelle (GitHub) | Zweck |
|---|---|---|
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill` | UI/UX-Design-Intelligenz (Styles, Paletten, Fonts) |
| `frontend-design` | `anthropics/skills` | Produktionsreife Frontend-Interfaces (gleichnamiges Claude-Plugin existiert zusätzlich, siehe `APPLY.md` B1.2) |
| `web-design-guidelines` | `vercel-labs/agent-skills` | UI-Code gegen Web Interface Guidelines prüfen |
| `web-quality-audit` | `addyosmani/web-quality-skills` | Audit: Performance, A11y, SEO, Best Practices |
| `accessibility` | `addyosmani/web-quality-skills` | WCAG 2.2 Audit & Verbesserung |
| `web-accessibility` | `supercent-io/skills-template` | A11y nach WCAG 2.1 implementieren |
| `performance` | `addyosmani/web-quality-skills` | Web-Performance optimieren (Ladezeit, CWV) |
| `seo-audit` | `coreyhaines31/marketingskills` | Technisches SEO / On-Page-Diagnose |
| `ecommerce-seo-audit` | `affilino/ecommerce-seo-audit-skill` | SEO-Audit für Shop-/Produktseiten |
| `remotion-best-practices` | `remotion-dev/skills` | Video-Erstellung mit Remotion (React) |

## Testing / QA / Browser

| Skill | Quelle (GitHub) | Zweck |
|---|---|---|
| `e2e-testing-patterns` | `wshobson/agents` | E2E mit Playwright/Cypress |
| `playwright-e2e-testing` | `bobmatnyc/claude-mpm-skills` | Playwright Test-Runner, Cross-Browser |
| `playwright-visual-testing` | `manutej/luxor-claude-marketplace` | Visual Regression / Screenshot-Validierung |
| `compatibility-testing` | `proffesor-for-testing/agentic-qe` | Cross-Browser/-Platform/-Device |
| `chaos-engineering-resilience` | `proffesor-for-testing/agentic-qe` | Fault Injection, Resilienz-Tests |
| `webapp-testing` | `anthropics/skills` | Lokale Web-Apps via Playwright testen |
| `browser-use` | `browser-use/browser-use` | Browser-Automation (Formulare, Screenshots, Extraktion) |
| `code-review-excellence` | `wshobson/agents` | Code-Review-Praktiken / konstruktives Feedback |

## Security

| Skill | Quelle (GitHub) | Zweck |
|---|---|---|
| `penetration-testing` | `aj-geddes/useful-ai-prompts` | Ethical Hacking / Security-Testing-Methodik |
| `pentest-checklist` | `sickn33/antigravity-awesome-skills` | Pentest-Planungs-/Durchführungs-Checkliste |

## PHP (projektrelevant für Slim/Laravel-Arbeit)

| Skill | Quelle (GitHub) | Zweck |
|---|---|---|
| `php-pro` | `jeffallan/claude-skills` | PHP 8.3+, Laravel/Symfony, PHPStan, Tests |
| `php-best-practices` | `asyrafhussin/agent-skills` | PHP 8.x Patterns, PSR, SOLID (umfangreich, 57 Dateien) |
| `php-development` | `mindrally/skills` | PHP 8+ mit SOLID/PSR |
| `php-laravel` | `pluginagentmarketplace/custom-plugin-php` | Laravel 11.x: Eloquent, Blade, APIs, Queues |
| `php-security-patterns` | `thebushidocollective/han` | Input-Validierung, SQLi/XSS/CSRF, Hashing |
| `php-mcp-server-generator` | `github/awesome-copilot` | PHP-MCP-Server-Projekt generieren |

## Meta / Sonstiges

| Skill | Quelle (GitHub) | Zweck |
|---|---|---|
| `find-skills` | `vercel-labs/skills` | Skills entdecken & installieren |
| `microsoft-foundry` | `microsoft/azure-skills` | Azure AI Foundry (in `~/.agents`, nicht aktiv verlinkt) |
| `ClaudeXMLStructuring` | lokal / ohne Upstream | `<thinking>`-Tags erzwingen (Eigenbau) |

---

## Bewertung — was davon im Kern-Setup bleiben sollte

Nicht alles davon ist für dein PHP/Slim/Laravel- + Web-Profil gleich nützlich.
Vorschlag zur Priorisierung beim Aufnehmen:

- **Kern (klar behalten):** alle `php-*`, `webapp-testing`, `e2e-testing-patterns`,
  `code-review-excellence`, `web-quality-audit`, `accessibility`,
  `web-design-guidelines`, `ui-ux-pro-max`, `seo-audit`.
- **Situativ (bei Bedarf):** `php-security-patterns`, `penetration-testing`,
  `pentest-checklist`, `playwright-*`, `browser-use`, `ecommerce-seo-audit`.
- **Selten/überlappend (kann raus):** `compatibility-testing` &
  `chaos-engineering-resilience` (eher Enterprise-QA), `remotion-best-practices`
  (nur bei Video), `microsoft-foundry` (Azure), `web-accessibility` (überlappt mit
  `accessibility`/`web-quality-audit`), `ClaudeXMLStructuring` (Thinking ist global
  schon aktiv).
