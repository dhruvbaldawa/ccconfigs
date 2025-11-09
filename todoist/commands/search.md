---
description: Search and link a Todoist task to the current session
argument-hint: (no arguments)
allowed-tools: Bash(${TODOIST_PLUGIN_ROOT}/scripts/*), Bash(jq:*)
---

Search for tasks in your configured Todoist project and link one to this Claude Code session. Once linked, the task will be automatically moved to "For Review" when the session ends.

**What happens:**
1. Fetches all tasks from your configured project
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

```bash
# Use TODOIST_PLUGIN_ROOT set by claude-todoist wrapper
SEARCH_SCRIPT="${TODOIST_PLUGIN_ROOT}/scripts/search-tasks.ts"

if [ ! -f "$SEARCH_SCRIPT" ]; then
  echo "Error: Todoist plugin scripts not found at $TODOIST_PLUGIN_ROOT"
  echo "Make sure you're using the claude-todoist wrapper to launch Claude."
  exit 1
fi

# Run the search script
TASK_ID=$("$SEARCH_SCRIPT" 2>&1)

if [ $? -eq 0 ] && [ -n "$TASK_ID" ]; then
  # Update environment for current session
  echo "CLAUDE_TODOIST_TASK_ID=$TASK_ID" >> "$CLAUDE_ENV_FILE"
  export CLAUDE_TODOIST_TASK_ID="$TASK_ID"

  # Move task to "In Progress"
  SECTION_ID=$(jq -r '.sections.inProgress' ~/.config/ccconfigs/todoist.json)
  "${TODOIST_PLUGIN_ROOT}/scripts/todoist-api.ts" move_task "$TASK_ID" "$SECTION_ID" > /dev/null 2>&1

  echo "✓ Linked to Todoist task: $TASK_ID"
  echo "Task moved to 'In Progress'"
else
  echo "No task selected."
fi
```
