// ABOUTME: Interactive permission management for Claude Code configurations
// ABOUTME: Promotes project permissions to global config and cleans up redundant local settings

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { checkbox, confirm } from '@inquirer/prompts';

// ============================================================================
// DOMAIN LAYER - Pure functions for business logic
// ============================================================================

interface ClaudeGlobalConfig {
  projects?: {
    [projectPath: string]: any;
  };
}

interface ProjectSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
    ask?: string[];
  };
}

interface PermissionSource {
  project: string;
  permission: string;
}

interface PermissionSummary {
  permissionMap: Map<string, string[]>;
  allPermissions: string[];
}

/**
 * Build a map of permission -> list of projects that have it
 */
function buildPermissionMap(
  projectPaths: string[],
  readProjectSettings: (path: string) => ProjectSettings | null
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
 * Merge selected permissions into global config
 */
function addToGlobalPermissions(
  globalConfig: ClaudeGlobalConfig,
  selectedPermissions: string[]
): ClaudeGlobalConfig {
  const updated = { ...globalConfig };
  if (!updated.projects) updated.projects = {};

  // Use current working directory as the key
  const cwd = process.cwd();
  if (!updated.projects[cwd]) {
    updated.projects[cwd] = {};
  }

  if (!updated.projects[cwd].permissions) {
    updated.projects[cwd].permissions = {};
  }

  const existing = updated.projects[cwd].permissions.allow || [];
  const combined = Array.from(new Set([...existing, ...selectedPermissions]));

  updated.projects[cwd].permissions.allow = combined.sort();
  return updated;
}

/**
 * Remove permissions from project local settings
 */
function removeFromProjectSettings(
  settings: ProjectSettings,
  permissionsToRemove: string[]
): ProjectSettings {
  const removeSet = new Set(permissionsToRemove);
  const updated = { ...settings };

  if (updated.permissions?.allow) {
    updated.permissions.allow = updated.permissions.allow.filter(
      p => !removeSet.has(p)
    );
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
  return `${permission} (${projects.length} project${projects.length !== 1 ? 's' : ''})`;
}

// ============================================================================
// FILESYSTEM LAYER - All I/O operations
// ============================================================================

function readGlobalConfig(globalConfigPath: string): ClaudeGlobalConfig {
  if (!existsSync(globalConfigPath)) {
    return { projects: {} };
  }
  return JSON.parse(readFileSync(globalConfigPath, 'utf-8'));
}

function writeGlobalConfig(
  globalConfigPath: string,
  config: ClaudeGlobalConfig
): void {
  writeFileSync(globalConfigPath, JSON.stringify(config, null, 2) + '\n');
}

function readProjectSettingsFile(projectPath: string): ProjectSettings | null {
  const settingsPath = join(projectPath, '.claude', 'settings.local.json');
  if (!existsSync(settingsPath)) return null;

  try {
    return JSON.parse(readFileSync(settingsPath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeProjectSettingsFile(
  projectPath: string,
  settings: ProjectSettings
): void {
  const settingsPath = join(projectPath, '.claude', 'settings.local.json');
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

function getProjectPathsFromGlobal(
  globalConfig: ClaudeGlobalConfig
): string[] {
  if (!globalConfig.projects) return [];
  return Object.keys(globalConfig.projects).filter(path => {
    const settings = readProjectSettingsFile(path);
    return settings?.permissions?.allow && settings.permissions.allow.length > 0;
  });
}

// ============================================================================
// UI LAYER - All user interaction
// ============================================================================

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
  });

  return selected;
}

async function confirmGlobalChangesUI(
  selectedPermissions: string[]
): Promise<boolean> {
  if (selectedPermissions.length === 0) {
    return false;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Global config changes:');
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
  console.log(`Permissions to remove: ${permissionsToRemove.length}`);
  permissionsToRemove.forEach(p => console.log(`  - ${p}`));
  console.log('='.repeat(60) + '\n');
}

function displayResults(
  globalChanged: boolean,
  globalCount: number,
  projectsUpdated: number,
  permissionsRemoved: number,
  isDryRun: boolean
): void {
  console.log('\n' + '='.repeat(60));
  console.log(isDryRun ? 'DRY RUN RESULTS' : 'COMPLETED');
  console.log('='.repeat(60));

  if (globalChanged) {
    console.log(`✓ Global config: +${globalCount} permissions`);
  } else {
    console.log('- Global config: no changes');
  }

  if (projectsUpdated > 0) {
    console.log(
      `✓ Project settings: ${projectsUpdated} file${projectsUpdated !== 1 ? 's' : ''} updated`
    );
    console.log(`  Removed ${permissionsRemoved} redundant permission${permissionsRemoved !== 1 ? 's' : ''}`);
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
  const globalConfigPath = join(homedir(), '.claude.json');

  console.log('Claude Code Permission Manager\n');

  // Phase 1: Collect permissions
  const globalConfig = readGlobalConfig(globalConfigPath);
  const projectPaths = getProjectPathsFromGlobal(globalConfig);

  if (projectPaths.length === 0) {
    console.log('No projects with permissions found in ~/.claude.json');
    process.exit(0);
  }

  console.log(`Found ${projectPaths.length} projects with permissions\n`);

  const permissionMap = buildPermissionMap(projectPaths, readProjectSettingsFile);
  const allPermissions = getUniquePermissions(permissionMap);

  // Phase 2: Select permissions
  const selectedPermissions = await selectPermissionsUI(
    permissionMap,
    allPermissions
  );

  if (selectedPermissions.length === 0) {
    console.log('No permissions selected. Exiting.\n');
    process.exit(0);
  }

  // Phase 3: Preview and confirm global changes
  const confirmGlobal = await confirmGlobalChangesUI(selectedPermissions);

  if (!confirmGlobal) {
    console.log('Cancelled.\n');
    process.exit(0);
  }

  // Phase 4: Apply global changes
  let updatedGlobalConfig = addToGlobalPermissions(globalConfig, selectedPermissions);
  if (!isDryRun) {
    writeGlobalConfig(globalConfigPath, updatedGlobalConfig);
  }

  // Phase 5: Ask about cleanup
  const confirmCleanup = await confirmCleanupUI();

  if (!confirmCleanup) {
    displayResults(true, selectedPermissions.length, 0, 0, isDryRun);
    process.exit(0);
  }

  // Phase 6: Preview cleanup
  displayCleanupSummary(projectPaths, selectedPermissions);

  // Phase 7: Apply cleanup
  let projectsUpdated = 0;
  let permissionsRemoved = 0;

  for (const projectPath of projectPaths) {
    const settings = readProjectSettingsFile(projectPath);
    if (!settings?.permissions?.allow) continue;

    const originalCount = settings.permissions.allow.length;
    const updated = removeFromProjectSettings(settings, selectedPermissions);
    const newCount = updated.permissions?.allow?.length || 0;
    const removedCount = originalCount - newCount;

    if (removedCount > 0) {
      if (!isDryRun) {
        writeProjectSettingsFile(projectPath, updated);
      }
      projectsUpdated++;
      permissionsRemoved += removedCount;
    }
  }

  displayResults(
    true,
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
