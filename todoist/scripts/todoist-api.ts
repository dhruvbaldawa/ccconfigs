#!/usr/bin/env bun
/**
 * Todoist API client
 * Provides type-safe wrappers around Todoist Sync API v9
 */

import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// ============================================================================
// Types
// ============================================================================

interface TodoistConfig {
  apiToken: string;
  projectId: string;
  sections: {
    todo: string;
    inProgress: string;
    forReview: string;
  };
}

interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  section_id: string | null;
  priority: number;
  due?: {
    date: string;
    datetime?: string;
    string: string;
  };
  labels: string[];
  added_at: string;
}

interface TodoistComment {
  id: string;
  item_id: string;
  content: string;
  posted_at: string;
}

interface SyncResponse {
  sync_token: string;
  items?: TodoistTask[];
  notes?: TodoistComment[];
}

interface Command {
  type: string;
  uuid: string;
  args: Record<string, any>;
  temp_id?: string;
}

// ============================================================================
// Configuration
// ============================================================================

export function loadConfig(): TodoistConfig {
  const configPath = join(homedir(), '.config', 'ccconfigs', 'todoist.json');

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    if (!config.apiToken) {
      throw new Error('apiToken not configured in todoist.json');
    }

    if (!config.projectId) {
      throw new Error('projectId not configured in todoist.json');
    }

    if (!config.sections?.todo ||
        !config.sections?.inProgress ||
        !config.sections?.forReview) {
      throw new Error('sections not fully configured in todoist.json');
    }

    return config as TodoistConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Config file not found at ${configPath}`);
    }
    throw error;
  }
}

// ============================================================================
// API Client (Sync API v9)
// ============================================================================

const API_BASE = 'https://api.todoist.com/sync/v9/sync';

function generateUUID(): string {
  return crypto.randomUUID();
}

async function syncRequest(
  syncToken: string,
  resourceTypes: string[],
  commands?: Command[]
): Promise<SyncResponse> {
  const config = loadConfig();

  const formData = new URLSearchParams();
  formData.append('sync_token', syncToken);
  formData.append('resource_types', JSON.stringify(resourceTypes));

  if (commands && commands.length > 0) {
    formData.append('commands', JSON.stringify(commands));
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Todoist API error (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<SyncResponse>;
}

// ============================================================================
// Public API
// ============================================================================

export async function fetchTasks(sectionId?: string): Promise<TodoistTask[]> {
  const config = loadConfig();

  // Fetch all items
  const response = await syncRequest('*', ['items']);

  if (!response.items) {
    return [];
  }

  // Filter by section_id or project_id (client-side)
  if (sectionId) {
    return response.items.filter(item => item.section_id === sectionId);
  }

  // Filter by project_id
  return response.items.filter(item => item.project_id === config.projectId);
}

export async function getTask(taskId: string): Promise<TodoistTask | null> {
  const response = await syncRequest('*', ['items']);

  if (!response.items) {
    return null;
  }

  return response.items.find(item => item.id === taskId) || null;
}

export async function moveTask(
  taskId: string,
  sectionId: string
): Promise<void> {
  const command: Command = {
    type: 'item_move',
    uuid: generateUUID(),
    args: {
      id: taskId,
      section_id: sectionId,
    },
  };

  await syncRequest('*', [], [command]);
}

export async function addComment(
  taskId: string,
  content: string
): Promise<void> {
  const command: Command = {
    type: 'note_add',
    uuid: generateUUID(),
    temp_id: generateUUID(),
    args: {
      item_id: taskId,
      content,
    },
  };

  await syncRequest('*', [], [command]);
}

// ============================================================================
// CLI Support
// ============================================================================

if (import.meta.main) {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case 'fetch_tasks':
        const tasks = await fetchTasks(args[0]);
        console.log(JSON.stringify(tasks, null, 2));
        break;

      case 'get_task':
        if (!args[0]) throw new Error('Usage: get_task <task_id>');
        const task = await getTask(args[0]);
        console.log(JSON.stringify(task, null, 2));
        break;

      case 'move_task':
        if (!args[0] || !args[1]) {
          throw new Error('Usage: move_task <task_id> <section_id>');
        }
        await moveTask(args[0], args[1]);
        console.log('Task moved successfully');
        break;

      case 'add_comment':
        if (!args[0] || !args[1]) {
          throw new Error('Usage: add_comment <task_id> <content>');
        }
        await addComment(args[0], args[1]);
        console.log('Comment added successfully');
        break;

      default:
        console.error('Usage: todoist-api.ts {fetch_tasks|get_task|move_task|add_comment} [args...]');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}
