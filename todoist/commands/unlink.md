---
description: Unlink the current Todoist task from this session
argument-hint: (no arguments)
allowed-tools: Bash(${TODOIST_PLUGIN_ROOT}/scripts/unlink.ts:*)
---

Remove the link between this Claude Code session and the currently linked Todoist task. After unlinking, the session-end hook will not move the task to "For Review".

**What happens:**
- Clears the `CLAUDE_TODOIST_TASK_ID` environment variable
- Task remains in its current section (not moved)
- Session-end hook will skip task updates

**Use cases:**
- You started working on a different task
- The linked task was incorrect
- You want to prevent automatic status updates

**Requirements:**
- A task must be linked to this session (via `claude-todoist` wrapper or `/search`)
- The task ID is automatically read from the `CLAUDE_TODOIST_TASK_ID` environment variable
- If no task is linked, the command will display a message

**Note:** To link a different task after unlinking, use `/search`.

**Implementation:**

```bash
# Use TODOIST_PLUGIN_ROOT set by claude-todoist wrapper
"${TODOIST_PLUGIN_ROOT}/scripts/unlink.ts"
```
