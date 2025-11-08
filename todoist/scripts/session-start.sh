#!/usr/bin/env bash
# Session-start hook: Move linked task to "In Progress"

set -euo pipefail

# Determine script directory (works with CLAUDE_PLUGIN_ROOT)
if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  SCRIPT_DIR="${CLAUDE_PLUGIN_ROOT}/scripts"
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

source "${SCRIPT_DIR}/todoist-api.sh"

# Check if a task is linked to this session
if [ -z "${CLAUDE_TODOIST_TASK_ID:-}" ]; then
  # No task linked - exit silently
  exit 0
fi

# Load Todoist configuration
if ! load_config; then
  echo "Warning: Failed to load Todoist configuration. Task status will not be updated." >&2
  exit 0
fi

# Move task to "In Progress" section
echo "Moving Todoist task ${CLAUDE_TODOIST_TASK_ID} to 'In Progress'..." >&2

if move_task "$CLAUDE_TODOIST_TASK_ID" "$TODOIST_SECTION_IN_PROGRESS" > /dev/null; then
  echo "✓ Task moved to 'In Progress'" >&2

  # Add a comment to track session start
  if [ -n "${CLAUDE_SESSION_ID:-}" ]; then
    add_comment "$CLAUDE_TODOIST_TASK_ID" \
      "🤖 Claude Code session started (session: ${CLAUDE_SESSION_ID})" > /dev/null
  fi

  # Persist the task ID for the rest of the session
  if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "CLAUDE_TODOIST_TASK_ID=${CLAUDE_TODOIST_TASK_ID}" >> "$CLAUDE_ENV_FILE"
  fi

  # Output context message for Claude
  echo "Linked to Todoist task: ${CLAUDE_TODOIST_TASK_ID}"
else
  echo "Warning: Failed to move task to 'In Progress'. Task may not exist or API error occurred." >&2
  exit 0
fi
