# 03 — Logging-Proxy / LLM-Gateway

**Schützt vor / liefert:** vollständige Sicht auf das, was der Agent an das Modell
sendet und zurückbekommt — plus die Möglichkeit, auf dem Weg nach draußen Secrets
zu filtern (Egress-DLP) und Egress-Ziele zu kontrollieren. Das ist „der Proxy, der
die Anfragen mitloggt".

## Funktionsweise
Claude Code respektiert `ANTHROPIC_BASE_URL`. Zeigt diese Variable auf einen
lokalen Proxy, läuft jeder Request durch ihn:

```bash
export ANTHROPIC_BASE_URL="http://127.0.0.1:8080"
```

Der Proxy leitet an die echte API weiter und protokolliert dabei Request/Response
(Prompt, Tool-Calls, Tokens, Kosten). Optional **DLP**: ausgehende Prompts auf
Secret-Muster prüfen und blocken/redacten, bevor sie das Gerät verlassen.

## Optionen
- **Eigener Mini-Proxy** (Python/Node, ~50 Zeilen): reicht für reines Logging.
  Volle Kontrolle, keine Daten an Dritte. Empfehlung zum Start.
- **LLM-Gateway** (z. B. LiteLLM-Proxy o. ä.): Logging + Rate-Limits + Key-
  Management + DLP-Plugins out-of-the-box. Mehr Setup, mehr Funktion.
- **On-device Policy-Proxy** für gesamten Agent-/Browser-Traffic, wenn auch andere
  Clients (Codex, Browser-Tools) erfasst werden sollen.

## Sicherheits-Hinweise (wichtig)
- Der Proxy sieht **alle** Prompts im Klartext — die Logs sind hochsensibel.
  Lokal, verschlüsselt, mit Zugriffsschutz speichern; nicht versionieren.
- TLS zur echten API beibehalten; keine Zertifikatsprüfung deaktivieren.
- API-Key bleibt im Proxy/Env — nicht in die Logs schreiben.
- Egress-Kontrolle hier wirkt nur für API-Traffic; Tool-Egress (Bash `curl`) deckt
  [04-egress.md](04-egress.md) ab.

## Nutzen im Alltag
Nachvollziehen, *warum* der Agent etwas tat (Prompt-Historie), Kosten/Token pro
Task, und ein zweites Netz gegen Secret-Leaks Richtung Modell.
