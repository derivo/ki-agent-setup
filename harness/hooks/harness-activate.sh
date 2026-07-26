#!/usr/bin/env bash
# harness-activate — Claude Code SessionStart hook.
#
# Purpose: raise the salience of the (already documentary) development harness at
# the start of every session. The harness pointer already lives in
# instructions/AGENTS.md, but buried in a long file it is easy to skip — as
# happened in practice (agent coded a feature without consulting the harness).
# This hook re-injects a short, unavoidable reminder as SessionStart context.
#
# It is a REMINDER, not a gate: it blocks nothing and enforces nothing (the
# harness stays "selbst-erzwungene Gates statt Hooks"). It only makes the
# lookup + done-criterion impossible to miss. This is the optional "Härtung"
# that harness/README.md leaves the door open for.
#
# Contract: Claude Code injects a SessionStart hook's stdout into the session
# context (same mechanism the caveman-activate hook uses). Keep the output
# short — it is paid for on every session start.
#
# Lookup mirrors instructions/AGENTS.md: prefer $AGENT_HARNESS_ROOT, else the
# per-client copy under the resolved config dir.

set -eu

# Resolve the harness root the same way the global instructions tell the agent to.
if [ -n "${AGENT_HARNESS_ROOT:-}" ] && [ -f "${AGENT_HARNESS_ROOT}/README.md" ]; then
  root="${AGENT_HARNESS_ROOT}"
else
  cfg="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
  root="${cfg}/harness"
fi

# Nothing to point at → stay silent (never fabricate a path).
[ -f "${root}/README.md" ] || { printf 'OK'; exit 0; }

# Dev- and doc-harness are sibling directories in both client-local and central
# layouts. Derive the sibling from the resolved root instead of assuming a
# particular basename such as "harness".
doc="$(dirname "${root%/}")/doc-harness"
docline=""
[ -f "${doc}/README.md" ] && docline=" Doku-Arbeit → ${doc}/README.md."

printf 'HARNESS AKTIV — bei Feature-/Code-Arbeit gilt das Entwicklungs-Harness (nicht bei trivialen Tasks oder reiner Konversation).\n'
printf 'Vor dem ersten Write/Edit an Code: %s/README.md lesen (Lesereihenfolge dort), dann den passenden Stack-Adapter unter %s/stacks/.%s\n' "${root}" "${root}" "${docline}"
printf 'Ablauf: Spec → Test → Code → Gate → Korrektur. "Fertig" = grüner Gate-Lauf des Stack-Adapters, nicht Selbsteinschätzung (GUARDRAILS.md C).\n'
printf '/hx:start lädt Harness + Projektstand explizit; /hx:eod am Tagesende.\n'
