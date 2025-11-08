#!/usr/bin/env bash
# Todoist API helper functions

set -euo pipefail

# Load configuration from Claude Code settings
load_config() {
  # Try to read from settings.json
  local settings_file="${HOME}/.claude/settings.json"

  if [ ! -f "$settings_file" ]; then
    echo "Error: settings.json not found at $settings_file" >&2
    return 1
  fi

  # Export config variables
  export TODOIST_API_TOKEN=$(jq -r '.todoist.apiToken // empty' "$settings_file")
  export TODOIST_PROJECT_ID=$(jq -r '.todoist.projectId // empty' "$settings_file")
  export TODOIST_SECTION_TODO=$(jq -r '.todoist.sections.todo // empty' "$settings_file")
  export TODOIST_SECTION_IN_PROGRESS=$(jq -r '.todoist.sections.inProgress // empty' "$settings_file")
  export TODOIST_SECTION_FOR_REVIEW=$(jq -r '.todoist.sections.forReview // empty' "$settings_file")

  if [ -z "$TODOIST_API_TOKEN" ]; then
    echo "Error: todoist.apiToken not configured in settings.json" >&2
    return 1
  fi
}

# Fetch tasks from a specific section
# Usage: fetch_tasks [section_id]
fetch_tasks() {
  local section_id="${1:-$TODOIST_SECTION_TODO}"

  curl -s -X GET \
    "https://api.todoist.com/rest/v2/tasks?section_id=${section_id}" \
    -H "Authorization: Bearer ${TODOIST_API_TOKEN}" \
    2>/dev/null
}

# Move task to a different section
# Usage: move_task [task_id] [section_id]
move_task() {
  local task_id="$1"
  local section_id="$2"

  curl -s -X POST \
    "https://api.todoist.com/rest/v2/tasks/${task_id}" \
    -H "Authorization: Bearer ${TODOIST_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"section_id\": \"${section_id}\"}" \
    2>/dev/null
}

# Add comment to a task
# Usage: add_comment [task_id] [comment_text]
add_comment() {
  local task_id="$1"
  local comment_text="$2"

  curl -s -X POST \
    "https://api.todoist.com/rest/v2/comments" \
    -H "Authorization: Bearer ${TODOIST_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg task_id "$task_id" --arg content "$comment_text" \
      '{task_id: $task_id, content: $content}')" \
    2>/dev/null
}

# Get task details
# Usage: get_task [task_id]
get_task() {
  local task_id="$1"

  curl -s -X GET \
    "https://api.todoist.com/rest/v2/tasks/${task_id}" \
    -H "Authorization: Bearer ${TODOIST_API_TOKEN}" \
    2>/dev/null
}

# Main entry point for direct script invocation
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  load_config

  case "${1:-}" in
    fetch_tasks)
      fetch_tasks "${2:-}"
      ;;
    move_task)
      move_task "$2" "$3"
      ;;
    add_comment)
      add_comment "$2" "$3"
      ;;
    get_task)
      get_task "$2"
      ;;
    *)
      echo "Usage: $0 {fetch_tasks|move_task|add_comment|get_task} [args...]" >&2
      exit 1
      ;;
  esac
fi
