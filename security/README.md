# Security — Hardening-Layer um den Agenten

Dokumentarischer Sicherheits-Layer um das Agent-Setup. Keine Skripte hier — jede
Datei beschreibt **eine Kontrolle**: was sie schützt, warum, und wie man sie
konkret einklinkt (Tool, Befehl, Hook-Config). Der Agent/Mensch setzt sie nach
diesen Anleitungen auf; APPLY referenziert sie.

Prinzip: **Defense in Depth** — keine einzelne Kontrolle reicht. Mehrere Schichten,
jede fail-closed (im Zweifel blocken/fragen), mit Audit-Trail.

## Bedrohung → Kontrolle

| Bedrohung | Kontrolle | Datei |
|---|---|---|
| Secrets im Commit/Code | Secret-Scan (pre-commit + Gate) | [01-secret-scanning.md](01-secret-scanning.md) |
| Gefährliche Tool-Aufrufe (`rm -rf`, force-push, `eval`) | PreToolUse-Block-Hook | [02-tool-guard.md](02-tool-guard.md) |
| Keine Sicht auf Requests / Egress-Exfil | Logging-Proxy / LLM-Gateway | [03-request-proxy.md](03-request-proxy.md) |
| Daten-Exfil über Netzwerk | Egress-Allowlist + Sandbox | [04-egress.md](04-egress.md) |
| Verwundbare Skills/MCP-Server | Supply-Chain-Audit | [05-supply-chain.md](05-supply-chain.md) |
| Vergiftete oder still geänderte Tool-Beschreibung (Tool-Poisoning, Rug-Pull) | Beschreibung bei Freigabe hashen, periodisch dagegen prüfen | [05-supply-chain.md](05-supply-chain.md) |
| Autonome Läufe ohne Isolation | Sandbox / VM | [06-sandbox.md](06-sandbox.md) |
| Prompt-Injection / Goal-Hijacking | Untrusted-Content-Disziplin | [07-prompt-injection.md](07-prompt-injection.md) |

## Basis aus dem Setup
Was das Setup ohnehin mitbringt und worauf dieser Layer aufbaut:
- GSD-Guards (`gsd-prompt-guard`, `gsd-read-guard`, `gsd-read-injection-scanner`,
  `gsd-validate-commit`) — Hooks aus dem GSD-Installer.
- [GUARDRAILS.md Abschnitt E](../harness/GUARDRAILS.md) — Security-Pass als
  Pflicht-Selbstcheck im Harness.
- Review-Panel Security-Lens ([REVIEW_PANEL.md](../harness/REVIEW_PANEL.md)).

Dieser Layer härtet das **mechanisch** ab, was dort nur als Regel/Selbstcheck
steht — inkl. eines optionalen Audit-Trail-Hooks (PostToolUse).

## Priorität
1–2 zuerst (mechanischer Block, billig). 3 für Observability/Egress-DLP. 4–7 je
nach Autonomiegrad — je autonomer der Agent läuft, desto wichtiger werden Egress,
Sandbox und Injection-Disziplin.

## Kuratierte Quelle
[efij/awesome-claude-code-security](https://github.com/efij/awesome-claude-code-security)
— Hardening-Tools, Threat-Research, Governance.
