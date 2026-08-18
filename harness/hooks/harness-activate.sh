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
#
# One exception to "keep the output short": after /compact the hook fires again
# (source=compact), but the harness files read during the session are gone —
# compaction keeps a summary of the conversation, not the file contents. A
# pointer is weaker there than it looks, because the agent remembers having read
# the rules and has no signal that the text is no longer in front of it. On that
# source only, Tier 1 is inlined instead of pointed at.

set -eu

# Read the hook payload to learn how the session started. Guarded on both sides:
# no stdin (manual run, tty) is skipped outright, and the read is bounded so a
# stdin that never reaches EOF cannot eat the hook timeout.
hook_source=""
if [ ! -t 0 ]; then
  IFS= read -r -d '' -t 1 hook_payload || true
  hook_source="$(printf '%s' "${hook_payload:-}" \
    | sed -n 's/.*"source"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
fi

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
printf 'Tier 1 = %s/GUARDRAILS.md — vor dem ersten Write/Edit an einem Auftrags-Artefakt (Code, Spec, Test, Plan) UND vor jeder Fertig-Meldung.\n' "${root}"
printf 'Sobald Code entsteht, zusätzlich der zum Projekt passende Adapter unter %s/stacks/; bei reiner Spec-/Planungsarbeit ohne Zielstack entfällt er.\n' "${root}"
printf 'Alles Weitere NUR gegen seinen Trigger nachladen (Tabelle: %s/README.md; jede Datei trägt oben eine "Lade wenn:"-Zeile). Nicht vorsorglich alles lesen.%s\n' "${root}" "${docline}"
printf 'Ablauf: Spec → Test → Code → Gate → Korrektur. "Fertig" = grüner Gate-Lauf des Stack-Adapters, nicht Selbsteinschätzung (GUARDRAILS.md C).\n'
printf '/hx:start lädt Harness + Projektstand explizit; /hx:eod am Tagesende.\n'

# After a compact the pointer above is not enough — inline Tier 1 itself.
if [ "${hook_source}" = "compact" ] && [ -f "${root}/GUARDRAILS.md" ]; then
  printf '\nNACH /compact — GUARDRAILS.md stand vor der Verdichtung im Kontext und ist jetzt weg. Deshalb hier im Volltext, damit Tier 1 nicht nur als Pointer dasteht. Stack-Adapter und Tier 2 sind NICHT enthalten: bei Bedarf selbst nachladen. Projektstand (git, .planning/) liefert /hx:start.\n\n'
  cat "${root}/GUARDRAILS.md"
fi
