#!/usr/bin/env bun
/**
 * Move the linked Todoist task to "For Review" immediately
 */

import { moveTask, loadConfig } from './todoist-api';

// ============================================================================
// Main
// ============================================================================

async function main() {
  // Check if a task is linked to this session
  const taskId = process.env.CLAUDE_TODOIST_TASK_ID;

  if (!taskId) {
    console.error('Error: No Todoist task linked to this session.');
    console.error('Use the claude-todoist wrapper or /search command to link a task first.');
    process.exit(1);
  }

  try {
    // Load configuration
    const config = loadConfig();

    // Move task to "For Review"
    console.error(`Moving task ${taskId} to 'For Review'...`);

    await moveTask(taskId, config.sections.forReview);

    console.error('✓ Task moved to "For Review"');
  } catch (error) {
    console.error('Error: Failed to move task.', (error as Error).message);
    process.exit(1);
  }
}

main();
