#!/bin/sh

set -eu

usage() {
  echo "Usage: $0 [--check] [target-directory]" >&2
}

mode=deploy
if [ "${1:-}" = "--check" ]; then
  mode=check
  shift
fi

if [ "$#" -gt 1 ]; then
  usage
  exit 2
fi

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
command_root="$repo_root/harness/commands"
target_root=${1:-"$HOME/.agents/skills"}

case "$target_root" in
  ""|"/"|"."|".."|"$HOME")
    echo "Refusing unsafe target directory: $target_root" >&2
    exit 2
    ;;
esac

if [ "$(basename -- "$target_root")" != "skills" ]; then
  echo "Target directory must be a dedicated skills root: $target_root" >&2
  exit 2
fi

render_root=$(mktemp -d "${TMPDIR:-/tmp}/hx-codex-skills.XXXXXX")
trap 'rm -rf -- "$render_root"' EXIT HUP INT TERM

for source_file in "$command_root"/*.md; do
  source_name=$(basename -- "$source_file")
  [ "$source_name" = "README.md" ] && continue

  skill_name="hx-${source_name%.md}"
  case "$skill_name" in
    hx-commit) skill_action="commit current changes safely and atomically" ;;
    hx-eod) skill_action="close the workday and preserve project state" ;;
    hx-hot-reload) skill_action="preserve context before starting a fresh session" ;;
    hx-linklist) skill_action="show the curated harness link list" ;;
    hx-park) skill_action="park a harness idea without interrupting the work" ;;
    hx-pr) skill_action="prepare a verified pull request" ;;
    hx-retro) skill_action="capture and route durable session learnings" ;;
    hx-review) skill_action="review a diff using the harness review threshold" ;;
    hx-spec) skill_action="turn a feature request into a testable specification" ;;
    hx-start) skill_action="load the harness and current project state" ;;
    hx-verify) skill_action="verify changes through observed end-to-end behavior" ;;
    *)
      echo "Missing Codex skill metadata for $skill_name" >&2
      exit 1
      ;;
  esac

  skill_root="$render_root/$skill_name"
  mkdir -p "$skill_root/agents"

  {
    printf '%s\n' \
      "---" \
      "name: $skill_name" \
      "description: Run the $skill_name agent-harness workflow to $skill_action. Use only when the user explicitly invokes \$$skill_name." \
      "---" \
      "" \
      "Interpret \`\$ARGUMENTS\` below as any text supplied after \`\$$skill_name\` in the user's invocation." \
      ""
    case "$skill_name" in
      hx-park)
        sed \
          -e 's#/hx:#$hx-#g' \
          -e 's#`/harness-sync`#der Harness-Sync#g' \
          "$source_file"
        ;;
      hx-pr|hx-review|hx-spec)
        sed \
          -e 's#/hx:#$hx-#g' \
          -e 's#~/.claude/harness/#~/.codex/harness/#g' \
          "$source_file"
        ;;
      hx-hot-reload)
        sed \
          -e 's#/hx:#$hx-#g' \
          -e 's#jetzt `/clear` auszuführen#jetzt einen neuen Codex-Task/-Chat zu starten#g' \
          "$source_file"
        ;;
      hx-eod)
        sed \
          -e 's#/hx:#$hx-#g' \
          -e 's#(`/clear` + weitermachen)#(neuer Codex-Task/-Chat + weitermachen)#g' \
          "$source_file"
        ;;
      *)
        sed 's#/hx:#$hx-#g' "$source_file"
        ;;
    esac
  } > "$skill_root/SKILL.md"

  {
    printf '%s\n' \
      "interface:" \
      "  display_name: \"Harness: ${source_name%.md}\"" \
      "  short_description: \"Harness: $skill_action\"" \
      "  default_prompt: \"Use \$$skill_name to $skill_action.\"" \
      "policy:" \
      "  allow_implicit_invocation: false"
  } > "$skill_root/agents/openai.yaml"
done

if [ "$mode" = "check" ]; then
  check_status=0

  for expected_skill in "$render_root"/hx-*; do
    actual_skill="$target_root/$(basename -- "$expected_skill")"
    if [ ! -d "$actual_skill" ]; then
      echo "Missing Codex harness skill: $actual_skill" >&2
      check_status=1
    elif ! diff -qr "$expected_skill" "$actual_skill"; then
      check_status=1
    fi
  done

  for actual_skill in "$target_root"/hx-*; do
    if [ ! -e "$actual_skill" ] && [ ! -L "$actual_skill" ]; then
      continue
    fi
    if [ ! -d "$render_root/$(basename -- "$actual_skill")" ]; then
      echo "Unexpected Codex harness skill: $actual_skill" >&2
      check_status=1
    fi
  done

  if [ "$check_status" -eq 0 ]; then
    echo "Codex harness skills match the command sources."
  fi
  exit "$check_status"
fi

mkdir -p "$target_root"
resolved_target_root=$(CDPATH= cd -- "$target_root" && pwd -P)
case "$resolved_target_root" in
  ""|"/"|"."|".."|"$HOME")
    echo "Refusing unsafe resolved target directory: $resolved_target_root" >&2
    exit 2
    ;;
esac
target_root="$resolved_target_root"

for existing_skill in "$target_root"/hx-*; do
  if [ ! -e "$existing_skill" ] && [ ! -L "$existing_skill" ]; then
    continue
  fi
  rm -rf -- "$existing_skill"
done

for rendered_skill in "$render_root"/hx-*; do
  cp -R "$rendered_skill" "$target_root/"
done

echo "Codex harness skills deployed to $target_root."
