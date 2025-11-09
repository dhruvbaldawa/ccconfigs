---
description: Move the linked Todoist task to 'For Review' immediately
argument-hint: (no arguments)
allowed-tools: Bash(${TODOIST_PLUGIN_ROOT}/scripts/done.ts:*)
---

Manually move the currently linked Todoist task to "For Review" section. Useful when you want to mark the task as complete before the session ends.

**What happens:**
- Moves the linked task from "In Progress" to "For Review"
- Task remains linked to the session
- Session-end hook will skip moving it (already in "For Review")

**Use cases:**
- Task is complete and ready for review
- You want to mark progress before taking a break
- You're switching to a different task in the same session

**Requirements:**
- A task must be linked to this session (via `claude-todoist` wrapper or `/search`)
- If no task is linked, the command will fail with an error

**Note:** This does NOT unlink the task from the session. To unlink, use `/unlink`.

**Implementation:**

```bash
# Use TODOIST_PLUGIN_ROOT set by claude-todoist wrapper
"${TODOIST_PLUGIN_ROOT}/scripts/done.ts"
```
