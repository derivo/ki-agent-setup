# 06 — Sandbox / Isolation

**Schützt vor:** Schaden außerhalb eines klar begrenzten Bereichs — gefährliche
Befehle, Datei-Zugriffe und Netzwerk treffen nur die Sandbox, nicht das Host-System
oder fremde Projekte. Voraussetzung für höhere Autonomie (ROADMAP Phase 4–5).

## Stufen (von leicht zu stark)

1. **Claude Code Sandbox-Bash** (`/sandbox`) — Built-in FS- + Netz-Isolation für
   autonome Bash-Läufe. Netzzugriff nur über den externen Proxy (→ Allowlist,
   [04](04-egress.md)). Schnellster Einstieg, kein extra Setup.
2. **Container/Devcontainer** — Projekt läuft in Docker/Podman, definierte Mounts,
   eigene Netzwerk-Policy. Gut für reproduzierbare, projektgebundene Isolation.
3. **VM** (z. B. Tart, Lima, UTM) — stärkste Isolation: eigener Kernel, eigenes
   Netz. Der richtige Ort für vollautonome Läufe + Egress-Firewall.

## Regeln
- **Autonome / unbeaufsichtigte Läufe** (Agent arbeitet längere Strecken ohne
  Freigabe) laufen in Sandbox/VM, nie direkt auf dem Host.
- **Fail-closed:** unbekannter Befehl/Netzzugriff → manuelle Freigabe, nicht
  automatisch durchlassen.
- **Secrets nicht in die Sandbox spiegeln**, die sie nicht braucht — scoped
  Credentials statt voller `~/.aws`/`~/.ssh`.
- Sandbox ist **kein** Ersatz für die anderen Kontrollen — Block-Hook (02),
  Egress (04) und DLP (03) gelten auch drinnen (Defense in Depth).

## Verhältnis
Sandbox begrenzt den Radius, Egress (04) die Richtung, der Block-Hook (02) die Tat.
Zusammen erlauben sie, den Agenten autonomer laufen zu lassen, ohne den Host zu
riskieren.
