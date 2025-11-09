#!/usr/bin/env bun
/**
 * Interactive task search using fzf
 * Fetches all tasks from configured Todoist project and presents them in fzf
 */

import { $ } from 'bun';
import { fetchTasks, loadConfig } from './todoist-api';

// ============================================================================
// Helpers
// ============================================================================

function formatTaskForDisplay(task: any): { id: string; display: string } {
  let display = task.content;

  // Add priority indicator (1=normal, 4=urgent)
  if (task.priority > 1) {
    display += ` | P${task.priority}`;
  }

  // Add due date
  if (task.due?.date) {
    display += ` | due: ${task.due.date}`;
  }

  // Add labels
  if (task.labels?.length > 0) {
    const labelStr = task.labels.map((l: string) => `#${l}`).join(' ');
    display += ` | ${labelStr}`;
  }

  return { id: task.id, display };
}

async function checkFzfInstalled(): Promise<boolean> {
  try {
    await $`which fzf`.quiet();
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    // Check if fzf is installed
    if (!(await checkFzfInstalled())) {
      console.error('Error: fzf is not installed. Please install it first:');
      console.error('  brew install fzf  # macOS');
      console.error('  apt install fzf   # Ubuntu/Debian');
      console.error('  pacman -S fzf     # Arch');
      process.exit(1);
    }

    // Load config and fetch tasks
    const config = loadConfig();
    console.error('Fetching tasks from Todoist...');

    // Fetch all tasks from the project (not filtered by section)
    const tasks = await fetchTasks();

    if (tasks.length === 0) {
      console.error('No tasks found in project.');
      process.exit(1);
    }

    // Format tasks for fzf
    const formattedTasks = tasks.map(formatTaskForDisplay);

    // Create input for fzf (format: ID\tDISPLAY)
    const fzfInput = formattedTasks
      .map(({ id, display }) => `${id}\t${display}`)
      .join('\n');

    // Run fzf
    const result = await $`echo ${fzfInput} | fzf \
      --header="Select a Todoist task (ESC to cancel)" \
      --delimiter='\t' \
      --with-nth=2.. \
      --preview="echo {2..}" \
      --preview-window=up:3:wrap \
      --height=60% \
      --border \
      --prompt="Search tasks: " \
      --no-multi`.text();

    // Extract task ID from selection
    const selectedId = result.trim().split('\t')[0];

    if (!selectedId) {
      console.error('No task selected.');
      process.exit(1);
    }

    // Output just the task ID
    console.log(selectedId);
  } catch (error) {
    // fzf returns exit code 130 when user cancels (Ctrl+C or ESC)
    if ((error as any)?.exitCode === 130) {
      console.error('No task selected.');
      process.exit(1);
    }

    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
