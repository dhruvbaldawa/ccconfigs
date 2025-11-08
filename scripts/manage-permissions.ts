// ABOUTME: Interactive permission management for Claude Code configurations
// ABOUTME: Auto-discovers projects and promotes permissions to global config

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { checkbox, confirm } from '@inquirer/prompts';

// ============================================================================
// DOMAIN LAYER - Pure functions for business logic
// ============================================================================

interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
    ask?: string[];
  };
  [key: string]: any;
}

/**
 * Build a map of permission -> list of projects that have it
 */
function buildPermissionMap(
  projectPaths: string[],
  readProjectSettings: (path: string) => ClaudeSettings | null
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const projectPath of projectPaths) {
    const settings = readProjectSettings(projectPath);
    if (!settings?.permissions?.allow) continue;

    for (const permission of settings.permissions.allow) {
      if (!map.has(permission)) {
        map.set(permission, []);
      }
      map.get(permission)!.push(projectPath);
    }
  }

  return map;
}

/**
 * Get sorted unique list of all permissions
 */
function getUniquePermissions(permissionMap: Map<string, string[]>): string[] {
  return Array.from(permissionMap.keys()).sort();
}

/**
 * Merge selected permissions into settings
 */
function addToGlobalPermissions(
  settings: ClaudeSettings,
  selectedPermissions: string[]
): ClaudeSettings {
  const updated = { ...settings };

  if (!updated.permissions) {
    updated.permissions = {};
  }

  const existing = updated.permissions.allow || [];
  const combined = Array.from(new Set([...existing, ...selectedPermissions]));

  updated.permissions.allow = combined.sort();
  return updated;
}

/**
 * Remove permissions from project local settings
 */
function removeFromProjectSettings(
  settings: ClaudeSettings,
  permissionsToRemove: string[]
): ClaudeSettings {
  const removeSet = new Set(permissionsToRemove);
  const updated = { ...settings };

  if (updated.permissions?.allow) {
    updated.permissions.allow = updated.permissions.allow.filter(
      p => !removeSet.has(p)
    );
    // Remove empty permissions object if no rules remain
    if (
      updated.permissions.allow.length === 0 &&
      !updated.permissions.deny?.length &&
      !updated.permissions.ask?.length
    ) {
      delete updated.permissions;
    }
  }

  return updated;
}

/**
 * Format permission display with project paths
 */
function formatPermissionChoice(
  permission: string,
  projects: string[]
): string {
  const projectDisplay = projects
    .map(p => p.replace(homedir(), '~'))
    .join(', ');
  return `${permission}\n    ${projectDisplay}`;
}

// ============================================================================
// FILESYSTEM LAYER - All I/O operations
// ============================================================================

const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.cache',
  '.next',
  'dist',
  'build',
  'target',
  '__pycache__',
  '.venv',
  'venv',
  '.env.local',
  '.env',
  'vendor',
  '.gradle',
  '.m2',
  'Library',
  '.local',
  'snap',
  '.cargo',
  '.npm',
  '.go',
  '.deno',
]);

/**
 * Recursively find all .claude/settings.local.json files
 */
function findProjectsWithPermissions(rootPath: string): string[] {
  const projects: string[] = [];
  const visited = new Set<string>();

  function walk(dir: string, depth: number = 0): void {
    // Prevent infinite loops and limit depth
    if (depth > 10) return;

    const realPath = resolve(dir);
    if (visited.has(realPath)) return;
    visited.add(realPath);

    // Check if this directory has .claude/settings.local.json
    const settingsPath = join(dir, '.claude', 'settings.local.json');
    if (existsSync(settingsPath)) {
      const settings = readSettingsFile(settingsPath);
      if (settings?.permissions?.allow && settings.permissions.allow.length > 0) {
        projects.push(dir);
        return; // Don't recurse into projects that have settings
      }
    }

    // Recurse into subdirectories
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip hidden directories and known exclusions
        if (entry.name.startsWith('.') && !entry.name.startsWith('.claude')) {
          continue;
        }
        if (SKIP_DIRS.has(entry.name)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subPath = join(dir, entry.name);
          walk(subPath, depth + 1);
        }
      }
    } catch {
      // Silently skip directories we can't read
    }
  }

  walk(rootPath);
  return projects;
}

function readSettingsFile(filePath: string): ClaudeSettings | null {
  if (!existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeSettingsFile(filePath: string, settings: ClaudeSettings): void {
  writeFileSync(filePath, JSON.stringify(settings, null, 2) + '\n');
}

// ============================================================================
// UI LAYER - All user interaction
// ============================================================================

async function selectPermissionsUI(
  permissionMap: Map<string, string[]>,
  allPermissions: string[],
  message: string = 'Select permissions to add to global config:'
): Promise<string[]> {
  if (allPermissions.length === 0) {
    console.log('No permissions found.\n');
    return [];
  }

  console.log(
    `\nFound ${allPermissions.length} unique permission${allPermissions.length !== 1 ? 's' : ''} across projects.\n`
  );

  const choices = allPermissions.map(perm => ({
    name: formatPermissionChoice(perm, permissionMap.get(perm)!),
    value: perm,
  }));

  const selected = await checkbox({
    message,
    choices,
    loop: false,
    pageSize: 10,
  });

  return selected;
}

async function confirmGlobalChangesUI(
  selectedPermissions: string[],
  targetPath: string
): Promise<boolean> {
  if (selectedPermissions.length === 0) {
    return false;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Updating: ${targetPath.replace(homedir(), '~')}`);
  console.log('='.repeat(60));
  selectedPermissions.forEach(p => console.log(`  + ${p}`));
  console.log('='.repeat(60) + '\n');

  return await confirm({
    message: 'Add these permissions to global config?',
    default: true,
  });
}

async function confirmCleanupUI(): Promise<boolean> {
  return await confirm({
    message: 'Remove promoted permissions from project local settings?',
    default: true,
  });
}

function displayCleanupSummary(
  projectPaths: string[],
  permissionsToRemove: string[]
): void {
  console.log('\n' + '='.repeat(60));
  console.log('Cleanup scope:');
  console.log('='.repeat(60));
  console.log(`Projects to update: ${projectPaths.length}`);
  projectPaths.forEach(p => console.log(`  - ${p.replace(homedir(), '~')}`));
  console.log(`\nPermissions to remove: ${permissionsToRemove.length}`);
  permissionsToRemove.forEach(p => console.log(`  - ${p}`));
  console.log('='.repeat(60) + '\n');
}

function displayResults(
  globalChanged: boolean,
  globalPath: string,
  globalCount: number,
  projectsUpdated: number,
  permissionsRemoved: number,
  isDryRun: boolean
): void {
  console.log('\n' + '='.repeat(60));
  console.log(isDryRun ? 'DRY RUN RESULTS' : 'COMPLETED');
  console.log('='.repeat(60));

  if (globalChanged) {
    console.log(
      `✓ ${globalPath.replace(homedir(), '~')}: +${globalCount} permissions`
    );
  } else {
    console.log('- Global config: no changes');
  }

  if (projectsUpdated > 0) {
    console.log(
      `✓ Project settings: ${projectsUpdated} file${projectsUpdated !== 1 ? 's' : ''} updated`
    );
    console.log(
      `  Removed ${permissionsRemoved} redundant permission${permissionsRemoved !== 1 ? 's' : ''}`
    );
  } else {
    console.log('- Project settings: no changes');
  }

  if (isDryRun) {
    console.log('\nNo files were modified (dry-run mode)');
  }

  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// WORKFLOWS
// ============================================================================

/**
 * Promote workflow: select permissions to promote to global, optionally cleanup
 */
async function promoteWorkflow(
  projectPaths: string[],
  globalSettingsPath: string,
  isDryRun: boolean
) {
  const readProjectSettings = (path: string) => {
    const settingsPath = join(path, '.claude', 'settings.local.json');
    return readSettingsFile(settingsPath);
  };

  // Phase 1: Collect and select permissions
  const permissionMap = buildPermissionMap(projectPaths, readProjectSettings);
  const allPermissions = getUniquePermissions(permissionMap);

  const selectedPermissions = await selectPermissionsUI(
    permissionMap,
    allPermissions
  );

  if (selectedPermissions.length === 0) {
    console.log('No permissions selected. Exiting.\n');
    process.exit(0);
  }

  // Phase 2: Preview and confirm global changes
  const globalSettings = readSettingsFile(globalSettingsPath) || {};
  const confirmGlobal = await confirmGlobalChangesUI(
    selectedPermissions,
    globalSettingsPath
  );

  if (!confirmGlobal) {
    console.log('Cancelled.\n');
    process.exit(0);
  }

  // Phase 3: Apply global changes
  const updatedGlobalSettings = addToGlobalPermissions(
    globalSettings,
    selectedPermissions
  );

  if (!isDryRun) {
    writeSettingsFile(globalSettingsPath, updatedGlobalSettings);
  }

  // Phase 4: Ask about cleanup
  const confirmCleanup = await confirmCleanupUI();

  if (!confirmCleanup) {
    displayResults(
      true,
      globalSettingsPath,
      selectedPermissions.length,
      0,
      0,
      isDryRun
    );
    process.exit(0);
  }

  // Phase 5: Preview cleanup
  displayCleanupSummary(projectPaths, selectedPermissions);

  // Phase 6: Apply cleanup
  let projectsUpdated = 0;
  let permissionsRemoved = 0;

  for (const projectPath of projectPaths) {
    const settings = readProjectSettings(projectPath);
    if (!settings?.permissions?.allow) continue;

    const originalCount = settings.permissions.allow.length;
    const updated = removeFromProjectSettings(settings, selectedPermissions);
    const newCount = updated.permissions?.allow?.length || 0;
    const removedCount = originalCount - newCount;

    if (removedCount > 0) {
      if (!isDryRun) {
        const settingsPath = join(projectPath, '.claude', 'settings.local.json');
        writeSettingsFile(settingsPath, updated);
      }
      projectsUpdated++;
      permissionsRemoved += removedCount;
    }
  }

  displayResults(
    true,
    globalSettingsPath,
    selectedPermissions.length,
    projectsUpdated,
    permissionsRemoved,
    isDryRun
  );
}

/**
 * Cleanup workflow: select and remove permissions from project local settings
 */
async function cleanupWorkflow(
  projectPaths: string[],
  isDryRun: boolean
) {
  const readProjectSettings = (path: string) => {
    const settingsPath = join(path, '.claude', 'settings.local.json');
    return readSettingsFile(settingsPath);
  };

  console.log('Cleanup Mode: Removing permissions from project local settings\n');

  // Phase 1: Collect all permissions from projects
  const permissionMap = buildPermissionMap(projectPaths, readProjectSettings);
  const allPermissions = getUniquePermissions(permissionMap);

  // Phase 2: User selects which permissions to remove
  const selectedPermissions = await selectPermissionsUI(
    permissionMap,
    allPermissions,
    'Select permissions to remove from project local settings:'
  );

  if (selectedPermissions.length === 0) {
    console.log('No permissions selected. Exiting.\n');
    process.exit(0);
  }

  // Phase 3: Preview cleanup
  displayCleanupSummary(projectPaths, selectedPermissions);

  // Phase 4: Confirm cleanup
  const confirmCleanup = await confirmCleanupUI();

  if (!confirmCleanup) {
    console.log('Cancelled.\n');
    process.exit(0);
  }

  // Phase 5: Apply cleanup
  let projectsUpdated = 0;
  let permissionsRemoved = 0;

  for (const projectPath of projectPaths) {
    const settings = readProjectSettings(projectPath);
    if (!settings?.permissions?.allow) continue;

    const originalCount = settings.permissions.allow.length;
    const updated = removeFromProjectSettings(settings, selectedPermissions);
    const newCount = updated.permissions?.allow?.length || 0;
    const removedCount = originalCount - newCount;

    if (removedCount > 0) {
      if (!isDryRun) {
        const settingsPath = join(projectPath, '.claude', 'settings.local.json');
        writeSettingsFile(settingsPath, updated);
      }
      projectsUpdated++;
      permissionsRemoved += removedCount;
    }
  }

  // Phase 6: Display results
  console.log('\n' + '='.repeat(60));
  console.log(isDryRun ? 'DRY RUN RESULTS' : 'COMPLETED');
  console.log('='.repeat(60));

  if (projectsUpdated > 0) {
    console.log(
      `✓ Project settings: ${projectsUpdated} file${projectsUpdated !== 1 ? 's' : ''} updated`
    );
    console.log(
      `  Removed ${permissionsRemoved} permission${permissionsRemoved !== 1 ? 's' : ''}`
    );
  } else {
    console.log('- No permissions were removed');
  }

  if (isDryRun) {
    console.log('\nNo files were modified (dry-run mode)');
  }

  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// MAIN - Orchestration and workflow
// ============================================================================

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isCleanupMode = process.argv.includes('--cleanup');
  const rootPaths = process.argv
    .slice(2)
    .filter(arg => !arg.startsWith('--'))
    .map(p => resolve(p.replace('~', homedir())));

  // Default to home directory if no roots provided
  if (rootPaths.length === 0) {
    rootPaths.push(homedir());
  }

  const globalSettingsPath = join(homedir(), '.claude', 'settings.json');

  console.log('Claude Code Permission Manager\n');
  console.log(
    `Searching for .claude/settings.local.json in: ${rootPaths.map(p => p.replace(homedir(), '~')).join(', ')}\n`
  );

  // Phase 1: Discover projects
  const allProjectPaths = new Set<string>();
  for (const rootPath of rootPaths) {
    console.log(`Scanning ${rootPath.replace(homedir(), '~')}...`);
    const found = findProjectsWithPermissions(rootPath);
    found.forEach(p => allProjectPaths.add(p));
  }

  const projectPaths = Array.from(allProjectPaths).sort();

  if (projectPaths.length === 0) {
    console.log('\nNo projects with permissions found.');
    process.exit(0);
  }

  console.log(`\nFound ${projectPaths.length} project${projectPaths.length !== 1 ? 's' : ''} with permissions:\n`);
  projectPaths.forEach(p => console.log(`  - ${p.replace(homedir(), '~')}`));

  // Route to appropriate workflow
  if (isCleanupMode) {
    await cleanupWorkflow(projectPaths, isDryRun);
  } else {
    await promoteWorkflow(projectPaths, globalSettingsPath, isDryRun);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
