---
description: Search and link a Todoist task to the current session
---

Search for tasks in your Todoist "To Do" section and link one to this Claude Code session. Once linked, the task will be automatically moved to "For Review" when the session ends.

**Usage:**
```bash
/search
```

**What happens:**
1. Fetches all tasks from your "To Do" section
2. Presents an interactive fzf search menu
3. Selected task is linked to this session (sets CLAUDE_TODOIST_TASK_ID)
4. Task is immediately moved to "In Progress"
5. Session-end hook will move it to "For Review" automatically

**Example:**
```
> /search
→ [Interactive menu shows tasks]
→ User selects: "Fix login bug | P1 | due: tomorrow | #backend"
→ Task moved to "In Progress"
→ Session now linked to task
```

**Implementation:**

Run the search script and update environment:

```bash
TASK_ID=$("${CLAUDE_PLUGIN_ROOT}/scripts/search-tasks.sh")

if [ $? -eq 0 ] && [ -n "$TASK_ID" ]; then
  # Update environment for current session
  echo "CLAUDE_TODOIST_TASK_ID=$TASK_ID" >> "$CLAUDE_ENV_FILE"
  export CLAUDE_TODOIST_TASK_ID="$TASK_ID"

  # Move task to "In Progress"
  "${CLAUDE_PLUGIN_ROOT}/scripts/todoist-api.sh" move_task "$TASK_ID" \
    "$(jq -r '.todoist.sections.inProgress' ~/.claude/settings.json)"

  echo "✓ Linked to Todoist task: $TASK_ID"
  echo "Task moved to 'In Progress'"
else
  echo "No task selected."
fi
```
