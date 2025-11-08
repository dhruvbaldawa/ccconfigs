#!/usr/bin/env bash
# Interactive task search and selection using fzf

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/todoist-api.sh"

# Check if fzf is available
if ! command -v fzf &> /dev/null; then
  echo "Error: fzf is not installed. Please install it first:" >&2
  echo "  brew install fzf  # macOS" >&2
  echo "  apt install fzf   # Ubuntu/Debian" >&2
  echo "  pacman -S fzf     # Arch" >&2
  exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install it first." >&2
  exit 1
fi

# Load configuration
load_config

# Fetch tasks from "To Do" section
echo "Fetching tasks from Todoist..." >&2
tasks_json=$(fetch_tasks "$TODOIST_SECTION_TODO")

# Check if we got any tasks
task_count=$(echo "$tasks_json" | jq 'length')
if [ "$task_count" -eq 0 ]; then
  echo "No tasks found in 'To Do' section." >&2
  exit 1
fi

# Format tasks for fzf display
# Format: task_id|content|priority|due_date|labels
formatted_tasks=$(echo "$tasks_json" | jq -r '.[] |
  [
    .id,
    .content,
    (.priority // 1),
    (.due.date // ""),
    ([.labels[]? // empty] | join(","))
  ] | join("|")')

# Create display format for fzf
# Format: Content | P[priority] | due: date | #labels
display_tasks=$(echo "$formatted_tasks" | while IFS='|' read -r id content priority due labels; do
  # Build display string
  display="$content"

  # Add priority indicator
  if [ "$priority" != "1" ]; then
    priority_label="P$priority"
    display="$display | $priority_label"
  fi

  # Add due date
  if [ -n "$due" ]; then
    display="$display | due: $due"
  fi

  # Add labels
  if [ -n "$labels" ]; then
    label_display=$(echo "$labels" | tr ',' ' ' | sed 's/ / #/g')
    display="$display | #$label_display"
  fi

  # Output format: ID\tDISPLAY_STRING
  echo -e "${id}\t${display}"
done)

# Use fzf to select a task
selected=$(echo "$display_tasks" | fzf \
  --header="Select a Todoist task (ESC to cancel)" \
  --delimiter='\t' \
  --with-nth=2.. \
  --preview="echo {2..}" \
  --preview-window=up:3:wrap \
  --height=60% \
  --border \
  --prompt="Search tasks: " \
  --no-multi) || {
  echo "No task selected." >&2
  exit 1
}

# Extract task ID from selection
task_id=$(echo "$selected" | cut -f1)

# Output just the task ID
echo "$task_id"
