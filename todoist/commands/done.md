---
description: Move the linked Todoist task to 'For Review' immediately
---

Manually move the currently linked Todoist task to "For Review" section. Useful when you want to mark the task as complete before the session ends.

**Usage:**
```bash
/done
```

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
if [ -z "${CLAUDE_TODOIST_TASK_ID:-}" ]; then
  echo "Error: No Todoist task linked to this session."
  echo "Use the claude-todoist wrapper or /search command to link a task first."
  exit 1
fi

# Load configuration
source "${CLAUDE_PLUGIN_ROOT}/scripts/todoist-api.sh"
load_config

# Move task to "For Review"
echo "Moving task ${CLAUDE_TODOIST_TASK_ID} to 'For Review'..."

if move_task "$CLAUDE_TODOIST_TASK_ID" "$TODOIST_SECTION_FOR_REVIEW" > /dev/null; then
  echo "✓ Task moved to 'For Review'"
else
  echo "Error: Failed to move task. API error occurred."
  exit 1
fi
```
