#!/usr/bin/env bun
/**
 * Todoist API client
 * Provides type-safe wrappers around Todoist REST API v2
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
  section_id: string;
  priority: number;
  due?: {
    date: string;
    datetime?: string;
    string: string;
  };
  labels: string[];
  created_at: string;
}

interface TodoistComment {
  id: string;
  task_id: string;
  content: string;
  posted_at: string;
}

// ============================================================================
// Configuration
// ============================================================================

export function loadConfig(): TodoistConfig {
  const settingsPath = join(homedir(), '.claude', 'settings.json');

  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));

    if (!settings.todoist?.apiToken) {
      throw new Error('todoist.apiToken not configured in settings.json');
    }

    if (!settings.todoist?.projectId) {
      throw new Error('todoist.projectId not configured in settings.json');
    }

    if (!settings.todoist?.sections?.todo ||
        !settings.todoist?.sections?.inProgress ||
        !settings.todoist?.sections?.forReview) {
      throw new Error('todoist.sections not fully configured in settings.json');
    }

    return settings.todoist as TodoistConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Settings file not found at ${settingsPath}`);
    }
    throw error;
  }
}

// ============================================================================
// API Client
// ============================================================================

const API_BASE = 'https://api.todoist.com/rest/v2';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = loadConfig();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Todoist API error (${response.status}): ${errorText}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

// ============================================================================
// Public API
// ============================================================================

export async function fetchTasks(sectionId?: string): Promise<TodoistTask[]> {
  const config = loadConfig();
  const section = sectionId || config.sections.todo;

  return apiRequest<TodoistTask[]>(`/tasks?section_id=${section}`);
}

export async function getTask(taskId: string): Promise<TodoistTask> {
  return apiRequest<TodoistTask>(`/tasks/${taskId}`);
}

export async function moveTask(
  taskId: string,
  sectionId: string
): Promise<TodoistTask> {
  return apiRequest<TodoistTask>(`/tasks/${taskId}`, {
    method: 'POST',
    body: JSON.stringify({ section_id: sectionId }),
  });
}

export async function addComment(
  taskId: string,
  content: string
): Promise<TodoistComment> {
  return apiRequest<TodoistComment>('/comments', {
    method: 'POST',
    body: JSON.stringify({
      task_id: taskId,
      content,
    }),
  });
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
        const movedTask = await moveTask(args[0], args[1]);
        console.log(JSON.stringify(movedTask, null, 2));
        break;

      case 'add_comment':
        if (!args[0] || !args[1]) {
          throw new Error('Usage: add_comment <task_id> <content>');
        }
        const comment = await addComment(args[0], args[1]);
        console.log(JSON.stringify(comment, null, 2));
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
