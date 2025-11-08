---
description: Unlink the current Todoist task from this session
---

Remove the link between this Claude Code session and the currently linked Todoist task. After unlinking, the session-end hook will not move the task to "For Review".

**Usage:**
```bash
/unlink
```

**What happens:**
- Clears the `CLAUDE_TODOIST_TASK_ID` environment variable
- Task remains in its current section (not moved)
- Session-end hook will skip task updates

**Use cases:**
- You started working on a different task
- The linked task was incorrect
- You want to prevent automatic status updates

**Requirements:**
- A task must be linked to this session
- If no task is linked, the command will display a message

**Note:** To link a different task after unlinking, use `/search`.

**Implementation:**

```bash
if [ -z "${CLAUDE_TODOIST_TASK_ID:-}" ]; then
  echo "No Todoist task is currently linked to this session."
  exit 0
fi

UNLINKED_TASK_ID="$CLAUDE_TODOIST_TASK_ID"

# Clear the environment variable
unset CLAUDE_TODOIST_TASK_ID

# Update CLAUDE_ENV_FILE to clear it for subsequent bash commands
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  # Remove the line containing CLAUDE_TODOIST_TASK_ID
  if grep -q "CLAUDE_TODOIST_TASK_ID" "$CLAUDE_ENV_FILE"; then
    grep -v "CLAUDE_TODOIST_TASK_ID" "$CLAUDE_ENV_FILE" > "${CLAUDE_ENV_FILE}.tmp"
    mv "${CLAUDE_ENV_FILE}.tmp" "$CLAUDE_ENV_FILE"
  fi
fi

echo "✓ Unlinked task: $UNLINKED_TASK_ID"
echo "Session-end hook will not update task status."
```
