#!/usr/bin/env bun
/**
 * Attach asset (PR, doc, commit) to Todoist task as a comment
 */

import { addComment } from './todoist-api';

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Check arguments
  if (args.length < 1) {
    console.error('Usage: attach.ts <url> [description]');
    console.error('');
    console.error('Examples:');
    console.error('  attach.ts https://github.com/user/repo/pull/123');
    console.error('  attach.ts https://github.com/user/repo/pull/123 "Add feature X"');
    console.error('  attach.ts https://github.com/user/repo/commit/abc123 "Fix bug Y"');
    process.exit(1);
  }

  const url = args[0];
  const description = args.slice(1).join(' ');

  // Check if a task is linked to this session
  const taskId = process.env.CLAUDE_TODOIST_TASK_ID;

  if (!taskId) {
    console.error('Error: No Todoist task linked to this session.');
    console.error('Use the claude-todoist wrapper or /search command to link a task first.');
    process.exit(1);
  }

  try {
    // Build comment text
    const commentText = description
      ? `🔗 ${description}: ${url}`
      : `🔗 ${url}`;

    // Add comment to task
    console.error(`Attaching asset to Todoist task ${taskId}...`);

    await addComment(taskId, commentText);

    console.error('✓ Asset attached successfully');
  } catch (error) {
    console.error('Error: Failed to attach asset.', (error as Error).message);
    process.exit(1);
  }
}

main();
