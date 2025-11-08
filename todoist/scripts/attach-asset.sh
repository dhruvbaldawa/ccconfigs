#!/usr/bin/env bash
# Attach asset (PR, doc, commit) to Todoist task as a comment

set -euo pipefail

# Determine script directory (works with CLAUDE_PLUGIN_ROOT)
if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  SCRIPT_DIR="${CLAUDE_PLUGIN_ROOT}/scripts"
else
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

source "${SCRIPT_DIR}/todoist-api.sh"

# Usage information
usage() {
  echo "Usage: $0 <url> [description]" >&2
  echo "" >&2
  echo "Examples:" >&2
  echo "  $0 https://github.com/user/repo/pull/123" >&2
  echo "  $0 https://github.com/user/repo/pull/123 'Add feature X'" >&2
  echo "  $0 https://github.com/user/repo/commit/abc123 'Fix bug Y'" >&2
  exit 1
}

# Check arguments
if [ $# -lt 1 ]; then
  usage
fi

URL="$1"
DESCRIPTION="${2:-}"

# Check if a task is linked to this session
if [ -z "${CLAUDE_TODOIST_TASK_ID:-}" ]; then
  echo "Error: No Todoist task linked to this session." >&2
  echo "Use the claude-todoist wrapper or /search command to link a task first." >&2
  exit 1
fi

# Load Todoist configuration
if ! load_config; then
  echo "Error: Failed to load Todoist configuration." >&2
  exit 1
fi

# Build comment text
if [ -n "$DESCRIPTION" ]; then
  COMMENT_TEXT="🔗 ${DESCRIPTION}: ${URL}"
else
  COMMENT_TEXT="🔗 ${URL}"
fi

# Add comment to task
echo "Attaching asset to Todoist task ${CLAUDE_TODOIST_TASK_ID}..." >&2

if add_comment "$CLAUDE_TODOIST_TASK_ID" "$COMMENT_TEXT" > /dev/null; then
  echo "✓ Asset attached successfully" >&2
else
  echo "Error: Failed to attach asset. API error occurred." >&2
  exit 1
fi
