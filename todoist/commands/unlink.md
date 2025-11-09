---
description: Unlink the current Todoist task from this session
argument-hint: (no arguments)
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
- A task must be linked to this session
- If no task is linked, the command will display a message

**Note:** To link a different task after unlinking, use `/search`.

**Implementation:**

```bash
# Find plugin scripts directory (slash commands don't have CLAUDE_PLUGIN_ROOT)
PLUGIN_DIR="$HOME/.claude/plugins/todoist"
"${PLUGIN_DIR}/scripts/unlink.ts"
```
