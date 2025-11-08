// ABOUTME: Interactive permission management for Claude Code configurations
// ABOUTME: Promotes project permissions to global config and cleans up redundant local settings

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { checkbox, confirm, editor } from '@inquirer/prompts';

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

interface PermissionSource {
  project: string;
  permission: string;
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
 * Format permission display with project count
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

function getProjectPathsWithPermissions(
  projectPaths: string[]
): string[] {
  return projectPaths.filter(path => {
    const settingsPath = join(path, '.claude', 'settings.local.json');
    const settings = readSettingsFile(settingsPath);
    return settings?.permissions?.allow && settings.permissions.allow.length > 0;
  });
}

// ============================================================================
// UI LAYER - All user interaction
// ============================================================================

async function selectProjectsUI(
  suggestedPaths: string[] = []
): Promise<string[]> {
  const defaultPaths = suggestedPaths
    .map(p => resolve(p))
    .join('\n');

  const input = await editor({
    postfix: '.txt',
    default: defaultPaths || '# Enter project paths (one per line)',
    validate: (text: string) => {
      if (!text.trim()) {
        return 'Please enter at least one project path';
      }
      return true;
    },
  });

  return input
    .split('\n')
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('#'))
    .map(p => resolve(p.replace('~', homedir())));
}

async function selectPermissionsUI(
  permissionMap: Map<string, string[]>,
  allPermissions: string[]
): Promise<string[]> {
  if (allPermissions.length === 0) {
    console.log('No permissions found across projects.\n');
    return [];
  }

  console.log(
    `\nFound ${allPermissions.length} unique permissions across projects.\n`
  );

  const choices = allPermissions.map(perm => ({
    name: formatPermissionChoice(perm, permissionMap.get(perm)!),
    value: perm,
  }));

  const selected = await checkbox({
    message: 'Select permissions to add to global config:',
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
// MAIN - Orchestration and workflow
// ============================================================================

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const projectArgs = process.argv.slice(2).filter(arg => !arg.startsWith('--'));

  const globalSettingsPath = join(homedir(), '.claude', 'settings.json');

  console.log('Claude Code Permission Manager\n');

  // Phase 1: Get project paths
  let projectPaths: string[];

  if (projectArgs.length > 0) {
    // Use provided paths
    projectPaths = projectArgs.map(p => resolve(p));
  } else {
    // Ask user to enter paths
    console.log('No project paths provided.');
    console.log('Edit the file to enter project paths (one per line):\n');
    projectPaths = await selectProjectsUI();
  }

  // Validate paths have permissions
  const validPaths = getProjectPathsWithPermissions(projectPaths);

  if (validPaths.length === 0) {
    console.log('No projects with permissions found.');
    console.log('Checked paths:');
    projectPaths.forEach(p => {
      console.log(`  - ${p.replace(homedir(), '~')}/.claude/settings.local.json`);
    });
    process.exit(0);
  }

  console.log(
    `\nFound ${validPaths.length} project${validPaths.length !== 1 ? 's' : ''} with permissions\n`
  );

  // Phase 2: Collect and select permissions
  const readProjectSettings = (path: string) => {
    const settingsPath = join(path, '.claude', 'settings.local.json');
    return readSettingsFile(settingsPath);
  };

  const permissionMap = buildPermissionMap(validPaths, readProjectSettings);
  const allPermissions = getUniquePermissions(permissionMap);

  const selectedPermissions = await selectPermissionsUI(
    permissionMap,
    allPermissions
  );

  if (selectedPermissions.length === 0) {
    console.log('No permissions selected. Exiting.\n');
    process.exit(0);
  }

  // Phase 3: Preview and confirm global changes
  const globalSettings = readSettingsFile(globalSettingsPath) || {};
  const confirmGlobal = await confirmGlobalChangesUI(
    selectedPermissions,
    globalSettingsPath
  );

  if (!confirmGlobal) {
    console.log('Cancelled.\n');
    process.exit(0);
  }

  // Phase 4: Apply global changes
  const updatedGlobalSettings = addToGlobalPermissions(
    globalSettings,
    selectedPermissions
  );

  if (!isDryRun) {
    writeSettingsFile(globalSettingsPath, updatedGlobalSettings);
  }

  // Phase 5: Ask about cleanup
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

  // Phase 6: Preview cleanup
  displayCleanupSummary(validPaths, selectedPermissions);

  // Phase 7: Apply cleanup
  let projectsUpdated = 0;
  let permissionsRemoved = 0;

  for (const projectPath of validPaths) {
    const settingsPath = join(projectPath, '.claude', 'settings.local.json');
    const settings = readProjectSettings(projectPath);
    if (!settings?.permissions?.allow) continue;

    const originalCount = settings.permissions.allow.length;
    const updated = removeFromProjectSettings(settings, selectedPermissions);
    const newCount = updated.permissions?.allow?.length || 0;
    const removedCount = originalCount - newCount;

    if (removedCount > 0) {
      if (!isDryRun) {
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

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
