#!/usr/bin/env bash
# ABOUTME: Send notifications via Apprise when Claude Code needs user input.
# ABOUTME: Hooks into PermissionRequest and Notification (idle_prompt) events.

set -euo pipefail

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract fields from hook input
HOOK_EVENT=$(echo "$HOOK_INPUT" | jq -r '.hook_event_name // "unknown"')
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '.message // empty')
NOTIFICATION_TYPE=$(echo "$HOOK_INPUT" | jq -r '.notification_type // empty')

# Extract additional fields for richer notifications
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$HOOK_INPUT" | jq -r '.tool_input // empty')
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // empty')
CWD=$(echo "$HOOK_INPUT" | jq -r '.cwd // empty')

# Get context
# Get project name from git remote URL (handles worktrees too)
GIT_DIR="${CLAUDE_PROJECT_DIR:-.}"
PROJECT=$(git -C "$GIT_DIR" remote get-url origin 2>/dev/null | sed 's|.*/||; s|\.git$||' || basename "${CLAUDE_PROJECT_DIR:-unknown}")
BRANCH=$(git -C "$GIT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
HOST=$(hostname -s)

# Helper to summarize tool input for notifications
summarize_tool_input() {
  local tool="$1"
  local input="$2"

  case "$tool" in
    "Bash")
      # Extract command, truncate if too long
      local cmd=$(echo "$input" | jq -r '.command // empty' 2>/dev/null)
      if [ -n "$cmd" ]; then
        # Truncate to 80 chars
        if [ ${#cmd} -gt 80 ]; then
          echo "${cmd:0:77}..."
        else
          echo "$cmd"
        fi
      fi
      ;;
    "Write"|"Edit"|"MultiEdit")
      # Show file path
      echo "$input" | jq -r '.file_path // empty' 2>/dev/null
      ;;
    "Read")
      echo "$input" | jq -r '.file_path // empty' 2>/dev/null
      ;;
    "Glob"|"Grep")
      echo "$input" | jq -r '.pattern // empty' 2>/dev/null
      ;;
    *)
      # For other tools, just indicate tool name is enough
      echo ""
      ;;
  esac
}

# Determine notification title and details
case "$HOOK_EVENT" in
  "PermissionRequest")
    TITLE="🔐 Claude Code needs permission"
    if [ -n "$TOOL_NAME" ]; then
      TOOL_SUMMARY=$(summarize_tool_input "$TOOL_NAME" "$TOOL_INPUT")
      if [ -n "$TOOL_SUMMARY" ]; then
        DETAIL="🔧 ${TOOL_NAME}: ${TOOL_SUMMARY}"
      else
        DETAIL="🔧 ${TOOL_NAME}"
      fi
    else
      DETAIL="${MESSAGE:-Permission required}"
    fi
    ;;
  "Notification")
    TITLE="💬 Claude Code needs input"
    DETAIL="${MESSAGE:-Waiting for response}"
    ;;
  *)
    TITLE="Claude Code notification"
    DETAIL=""
    ;;
esac

# Check APPRISE_URLS is set
if [ -z "${APPRISE_URLS:-}" ]; then
  echo "Warning: APPRISE_URLS not set, skipping notification" >&2
  exit 0
fi

# Build notification body (project@host is in bot name, so just branch + detail)
BODY="🌿 ${BRANCH}"

if [ -n "$DETAIL" ]; then
  BODY="${BODY}
${DETAIL}"
fi

# Build bot name from project and host
# URL-encode the bot name (@ becomes %40, safe for URI)
BOTNAME=$(printf '%s' "${PROJECT}@${HOST}" | jq -sRr @uri)

uvx apprise -t "$TITLE" -b "$BODY" "${APPRISE_URLS}?botname=${BOTNAME}&avatar=No" 2>/dev/null || true
