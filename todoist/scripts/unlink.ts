#!/usr/bin/env bun
/**
 * Unlink the current Todoist task from this session
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

// ============================================================================
// Main
// ============================================================================

async function main() {
  // Check if a task is linked to this session
  const taskId = process.env.CLAUDE_TODOIST_TASK_ID;

  if (!taskId) {
    console.log('No Todoist task is currently linked to this session.');
    process.exit(0);
  }

  try {
    // Clear the environment variable for this process
    delete process.env.CLAUDE_TODOIST_TASK_ID;

    // Update CLAUDE_ENV_FILE to clear it for subsequent bash commands
    const envFile = process.env.CLAUDE_ENV_FILE;

    if (envFile && existsSync(envFile)) {
      // Read the file and remove the line containing CLAUDE_TODOIST_TASK_ID
      const lines = readFileSync(envFile, 'utf-8').split('\n');
      const filteredLines = lines.filter(
        (line) => !line.startsWith('CLAUDE_TODOIST_TASK_ID=')
      );
      writeFileSync(envFile, filteredLines.join('\n'));
    }

    console.log(`✓ Unlinked task: ${taskId}`);
    console.log('Session-end hook will not update task status.');
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
