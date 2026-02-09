// ABOUTME: Interactive and scriptable manager for enabling OpenCode plugin packs by scope.
// ABOUTME: Supports global and repository-local selection with dry-run/check workflows.

import { checkbox, input, select } from '@inquirer/prompts';
import { homedir } from 'os';
import { resolve } from 'path';

import {
  getDefaultSourceRoot,
  loadPluginRegistry,
  PluginScope,
  readManagedState,
  resolveScopePaths,
  syncPluginPacks,
} from './opencode-sync';

interface CliArgs {
  scope?: PluginScope;
  path?: string;
  set?: string;
  enable?: string;
  disable?: string;
  sourceRoot?: string;
  hasSet: boolean;
  hasEnable: boolean;
  hasDisable: boolean;
  list: boolean;
  dryRun: boolean;
  check: boolean;
  help: boolean;
}

function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    hasSet: false,
    hasEnable: false,
    hasDisable: false,
    list: false,
    dryRun: false,
    check: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === '--scope' && next !== undefined) {
      if (next === 'global' || next === 'repo') {
        args.scope = next;
        index++;
      }
      continue;
    }

    if (current === '--path' && next !== undefined) {
      args.path = next;
      index++;
      continue;
    }

    if (current === '--set' && next !== undefined) {
      args.set = next;
      args.hasSet = true;
      index++;
      continue;
    }

    if (current === '--enable' && next !== undefined) {
      args.enable = next;
      args.hasEnable = true;
      index++;
      continue;
    }

    if (current === '--disable' && next !== undefined) {
      args.disable = next;
      args.hasDisable = true;
      index++;
      continue;
    }

    if (current === '--source-root' && next !== undefined) {
      args.sourceRoot = next;
      index++;
      continue;
    }

    if (current === '--list') {
      args.list = true;
      continue;
    }

    if (current === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (current === '--check') {
      args.check = true;
      continue;
    }

    if (current === '--help' || current === '-h') {
      args.help = true;
    }
  }

  return args;
}

function parsePluginList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(value.split(',').map(entry => entry.trim()).filter(Boolean))
  ).sort();
}

function withHomePrefix(path: string): string {
  return path.split(homedir()).join('~');
}

function resolveUserPath(path: string): string {
  if (path.startsWith('~/')) {
    return resolve(joinHome(path.slice(2)));
  }
  return resolve(path);
}

function joinHome(path: string): string {
  return resolve(homedir(), path);
}

function printHelp(): void {
  console.log(`OpenCode plugin manager

Usage:
  bun scripts/manage-opencode.ts
  bun scripts/manage-opencode.ts --scope global --set essentials,writing
  bun scripts/manage-opencode.ts --scope repo --path ~/Code/myrepo --enable experimental

Options:
  --scope <global|repo>   Target scope for plugin enablement
  --path <repoPath>       Repository root for scope=repo (defaults to cwd)
  --set <plugins>         Set exact plugin list for scope (comma-separated)
  --enable <plugins>      Enable plugin packs relative to current scope state
  --disable <plugins>     Disable plugin packs relative to current scope state
  --list                  Show available plugin packs and exit
  --dry-run               Preview changes without modifying files
  --check                 Exit non-zero if sync would make changes
  --source-root <path>    ccconfigs repository root (defaults from script location)
  --help                  Show this help
`);
}

function readCurrentPlugins(scope: PluginScope, repoPath: string | undefined): string[] {
  const paths = resolveScopePaths(scope, repoPath);
  const state = readManagedState(paths.statePath);
  return state?.plugins || [];
}

function validatePluginNames(selectedPlugins: string[], availablePlugins: Set<string>): void {
  const unknownPlugins = selectedPlugins.filter(plugin => !availablePlugins.has(plugin));
  if (unknownPlugins.length > 0) {
    throw new Error(`Unknown plugin pack(s): ${unknownPlugins.join(', ')}`);
  }
}

async function runInteractiveSelection(
  availablePlugins: Array<{ name: string; description: string }>,
  initialScope?: PluginScope,
  initialRepoPath?: string
): Promise<{ scope: PluginScope; repoPath?: string; plugins: string[] }> {
  const scope = initialScope || await select<PluginScope>({
    message: 'Where should OpenCode plugin packs be applied?',
    choices: [
      {
        name: 'Global (~/.config/opencode)',
        value: 'global',
      },
      {
        name: 'Repository-local (<repo>/opencode.json + .opencode/)',
        value: 'repo',
      },
    ],
  });

  let repoPath = initialRepoPath;
  if (scope === 'repo' && !repoPath) {
    const enteredPath = await input({
      message: 'Repository path',
      default: process.cwd(),
      validate: value => value.trim().length > 0 || 'Repository path is required',
    });
    repoPath = resolveUserPath(enteredPath);
  }

  const currentPlugins = readCurrentPlugins(scope, repoPath);
  const selectedPlugins = await checkbox<string>({
    message: 'Select plugin packs to enable',
    choices: availablePlugins.map(plugin => ({
      name: `${plugin.name} - ${plugin.description}`,
      value: plugin.name,
      checked: currentPlugins.includes(plugin.name),
    })),
    loop: false,
    pageSize: 10,
  });

  return {
    scope,
    repoPath,
    plugins: selectedPlugins.sort(),
  };
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const sourceRoot = resolve(args.sourceRoot || getDefaultSourceRoot());
  const registry = loadPluginRegistry(sourceRoot);
  const available = Object.entries(registry.plugins)
    .map(([name, plugin]) => ({
      name,
      description: plugin.description || 'No description provided',
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (args.list) {
    console.log('Available plugin packs:\n');
    for (const plugin of available) {
      console.log(`- ${plugin.name}: ${plugin.description}`);
    }
    return;
  }

  const availablePluginNames = new Set(available.map(plugin => plugin.name));
  const hasExplicitSelection = args.hasSet || args.hasEnable || args.hasDisable;

  let scope = args.scope;
  let repoPath = args.path ? resolveUserPath(args.path) : undefined;
  let selectedPlugins: string[] = [];

  if (!hasExplicitSelection) {
    const interactiveSelection = await runInteractiveSelection(available, scope, repoPath);
    scope = interactiveSelection.scope;
    repoPath = interactiveSelection.repoPath;
    selectedPlugins = interactiveSelection.plugins;
  } else {
    if (!scope) {
      throw new Error('--scope is required when using --set/--enable/--disable');
    }

    if (scope === 'repo' && !repoPath) {
      repoPath = process.cwd();
    }

    if (args.hasSet) {
      selectedPlugins = parsePluginList(args.set);
    } else {
      const currentPlugins = readCurrentPlugins(scope, repoPath);
      const nextPlugins = new Set(currentPlugins);

      for (const plugin of parsePluginList(args.enable)) {
        nextPlugins.add(plugin);
      }

      for (const plugin of parsePluginList(args.disable)) {
        nextPlugins.delete(plugin);
      }

      selectedPlugins = Array.from(nextPlugins).sort();
    }
  }

  validatePluginNames(selectedPlugins, availablePluginNames);

  if (!scope) {
    throw new Error('Unable to determine scope');
  }

  const result = syncPluginPacks({
    sourceRoot,
    scope,
    repoPath,
    plugins: selectedPlugins,
    dryRun: args.dryRun,
    check: args.check,
  });

  console.log(`Scope: ${scope}`);
  if (scope === 'repo' && repoPath) {
    console.log(`Repository: ${withHomePrefix(repoPath)}`);
  }

  console.log(`Selected plugins: ${selectedPlugins.join(', ') || '(none)'}`);
  console.log(`Config: ${withHomePrefix(result.scopePaths.configPath)}`);

  if (result.changes.length === 0) {
    console.log('Status: already up to date');
  } else {
    console.log(`Changes (${result.changes.length}):`);
    result.changes.forEach(change => console.log(`- ${withHomePrefix(change)}`));
  }

  if (args.check && result.changes.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
