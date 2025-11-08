#!/usr/bin/env bash
# Session-end hook: Move linked task to "For Review"

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

# Move task to "For Review" section
echo "Moving Todoist task ${CLAUDE_TODOIST_TASK_ID} to 'For Review'..." >&2

if move_task "$CLAUDE_TODOIST_TASK_ID" "$TODOIST_SECTION_FOR_REVIEW" > /dev/null; then
  echo "✓ Task moved to 'For Review'" >&2
else
  echo "Warning: Failed to move task to 'For Review'. Task may not exist or API error occurred." >&2
  exit 0
fi
