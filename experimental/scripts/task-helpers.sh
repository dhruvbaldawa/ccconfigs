#!/bin/bash
# Helper functions for atomic task file operations

set -e

update_status() {
  local task_file="$1"
  local new_status="$2"

  if [ ! -f "$task_file" ]; then
    echo "✗ File not found: $task_file" >&2
    return 1
  fi

  # Create backup
  cp "$task_file" "${task_file}.bak"

  # Update status atomically using sed
  if grep -q "^\*\*Status:\*\* " "$task_file"; then
    sed -i "s/^\*\*Status:\*\* .*/\*\*Status:\*\* $new_status/" "$task_file"
  else
    echo "✗ No Status field found in $task_file" >&2
    mv "${task_file}.bak" "$task_file"
    return 1
  fi

  # Verify update
  if grep -q "^\*\*Status:\*\* $new_status" "$task_file"; then
    rm "${task_file}.bak"
    echo "✓ Status updated to $new_status"
    return 0
  else
    echo "✗ Failed to update status" >&2
    mv "${task_file}.bak" "$task_file"
    return 1
  fi
}

move_task_file() {
  local from_dir="$1"
  local to_dir="$2"
  local task_file="$3"

  if [ ! -f "$from_dir/$task_file" ]; then
    echo "✗ File not found: $from_dir/$task_file" >&2
    return 1
  fi

  if [ ! -d "$to_dir" ]; then
    echo "✗ Directory not found: $to_dir" >&2
    return 1
  fi

  # Atomic move with verification
  mv "$from_dir/$task_file" "$to_dir/$task_file"

  if [ -f "$to_dir/$task_file" ] && [ ! -f "$from_dir/$task_file" ]; then
    echo "✓ Moved $task_file: $(basename "$from_dir") → $(basename "$to_dir")"
    return 0
  else
    echo "✗ Failed to move $task_file" >&2
    return 1
  fi
}

# Allow calling functions directly: ./task-helpers.sh update_status "file.md" "COMPLETED"
if [ $# -gt 0 ]; then
  "$@"
fi
