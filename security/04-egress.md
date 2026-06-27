# 04 — Egress-Allowlist

**Schützt vor:** Daten-Exfiltration über ausgehende Netzwerkverbindungen — der
Agent (oder injizierter Code) sendet Secrets/Quellcode an eine Angreifer-Adresse.
Besonders relevant bei autonomen Läufen.

## Prinzip
Standardmäßig **kein** ausgehender Traffic; nur eine explizite **Allowlist** an
Zielen ist erlaubt (Paket-Registries, die echte API, interne Dienste). Alles
andere wird geblockt.

**Wichtig:** Egress-Allowlist allein reicht nicht — ein erlaubtes Ziel (GitHub,
npm, die LLM-API) kann selbst zum Exfil-Kanal werden. Deshalb **mit Output-Filter
kombinieren**: was rausgeht, wird auf Secrets/sensible Inhalte geprüft (siehe
[03 DLP](03-request-proxy.md)).

## Umsetzung
- **In einer VM/Sandbox** (falls vorhanden): Firewall-Regeln am VM-Gateway,
  default-deny, nur Allowlist offen. Der saubere Ort dafür — der autonome Lauf
  passiert ohnehin isoliert ([06-sandbox.md](06-sandbox.md)).
- **Claude Code Sandbox-Bash:** Netzwerk-Isolation aktiv; Netzzugriff nur über den
  Proxy außerhalb der Sandbox, der die Allowlist durchsetzt.
- **Tool-Egress:** Bash-`curl`/`wget` auf nicht-allowlistete Hosts über den
  Block-Hook ([02-tool-guard.md](02-tool-guard.md)) oder die Firewall stoppen.

## Allowlist-Startpunkt
Paket-Registry (npm/packagist/pypi), Git-Remote, die LLM-API, interne Test-Hosts.
Neues Ziel → bewusst aufnehmen, nicht automatisch.

## Verhältnis
Greift Hand in Hand mit Sandbox (06) und Proxy/DLP (03). Ohne Output-Filter ist
die Allowlist ein halber Schutz.
