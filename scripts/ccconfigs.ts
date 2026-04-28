// ABOUTME: Unified CLI for syncing ccconfigs targets from canonical Claude plugin packs.
// ABOUTME: Dispatches list, doctor, sync, and check commands across OpenCode and Codex adapters.

import { existsSync, readFileSync } from 'fs';
import { homedir, hostname } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { loadPluginRegistry, normalizePluginList } from './ccconfigs-assets';
import { parseJsonc } from './ccconfigs-json';
import {
  type CcconfigsProfile,
  resolveObservabilityProfile,
} from './ccconfigs-profile';
import {
  readManagedState as readCodexManagedState,
  resolveScopePaths as resolveCodexScopePaths,
  syncPluginPacks as syncCodexPluginPacks,
} from './codex-sync';
import {
  type PluginScope,
  readManagedState as readOpenCodeManagedState,
  resolveScopePaths as resolveOpenCodeScopePaths,
  syncPluginPacks as syncOpenCodePluginPacks,
} from './opencode-sync';

type CommandName = 'sync' | 'check' | 'list' | 'doctor';
type TargetSelection = 'opencode' | 'codex' | 'all';
type ConcreteTarget = 'opencode' | 'codex';

export interface CliArgs {
  command?: CommandName;
  target: TargetSelection;
  scope: PluginScope;
  plugins?: string;
  enable?: string;
  disable?: string;
  repoPath?: string;
  sourceRoot?: string;
  profilePath?: string;
  machine?: string;
  dryRun: boolean;
  noObservability: boolean;
  help: boolean;
}

export interface CliRunResult {
  exitCode: number;
  output: string[];
}

const DEFAULT_SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROFILE_FILE = 'ccconfigs.jsonc';

function resolveUserPath(path: string): string {
  if (path.startsWith('~/')) {
    return resolve(homedir(), path.slice(2));
  }

  return resolve(path);
}

function withHomePrefix(path: string): string {
  return path.split(homedir()).join('~');
}

function parseTarget(value: string): TargetSelection {
  if (value === 'opencode' || value === 'codex' || value === 'all') {
    return value;
  }

  throw new Error(`Invalid --target: ${value}`);
}

function parseScope(value: string): PluginScope {
  if (value === 'global' || value === 'repo') {
    return value;
  }

  throw new Error(`Invalid --scope: ${value}`);
}

export function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    target: 'all',
    scope: 'repo',
    dryRun: false,
    noObservability: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];
    const next = argv[index + 1];

    if (!current.startsWith('-') && !args.command) {
      if (current === 'sync' || current === 'check' || current === 'list' || current === 'doctor') {
        args.command = current;
        continue;
      }

      throw new Error(`Unknown command: ${current}`);
    }

    if (current === '--target' && next !== undefined) {
      args.target = parseTarget(next);
      index++;
      continue;
    }

    if (current === '--scope' && next !== undefined) {
      args.scope = parseScope(next);
      index++;
      continue;
    }

    if (current === '--plugins' && next !== undefined) {
      args.plugins = next;
      index++;
      continue;
    }

    if (current === '--enable' && next !== undefined) {
      args.enable = next;
      index++;
      continue;
    }

    if (current === '--disable' && next !== undefined) {
      args.disable = next;
      index++;
      continue;
    }

    if (current === '--path' && next !== undefined) {
      args.repoPath = resolveUserPath(next);
      index++;
      continue;
    }

    if (current === '--source-root' && next !== undefined) {
      args.sourceRoot = resolveUserPath(next);
      index++;
      continue;
    }

    if (current === '--profile' && next !== undefined) {
      args.profilePath = resolveUserPath(next);
      index++;
      continue;
    }

    if (current === '--machine' && next !== undefined) {
      args.machine = next;
      index++;
      continue;
    }

    if (current === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (current === '--no-observability') {
      args.noObservability = true;
      continue;
    }

    if (current === '--help' || current === '-h') {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  return args;
}

function printHelp(output: string[]): void {
  output.push(`ccconfigs unified sync

Usage:
  bun scripts/ccconfigs.ts sync --target <opencode|codex|all> --plugins essentials,writing
  bun scripts/ccconfigs.ts check --target <opencode|codex|all> --plugins essentials
  bun scripts/ccconfigs.ts list
  bun scripts/ccconfigs.ts doctor --target all

Options:
  --target <target>       Target to manage (default: all)
  --scope <global|repo>   OpenCode scope only (default: repo)
  --path <repoPath>       Repository path for repo targets (default: cwd)
  --plugins <list>        Exact comma-separated plugin pack list
  --enable <list>         Enable plugin packs relative to current target state
  --disable <list>        Disable plugin packs relative to current target state
  --source-root <path>    ccconfigs repository root
  --profile <path>        Profile JSONC file (default: <source-root>/ccconfigs.jsonc when present)
  --machine <name>        Machine override key (default: hostname)
  --dry-run               Preview sync changes without modifying files
  --no-observability      Explicitly disable managed target observability
  --help                  Show this help`);
}

function selectedTargets(target: TargetSelection): ConcreteTarget[] {
  return target === 'all' ? ['opencode', 'codex'] : [target];
}

function readProfile(sourceRoot: string, profilePath: string | undefined): { profile: CcconfigsProfile; path?: string } {
  const candidatePath = profilePath || join(sourceRoot, PROFILE_FILE);
  if (!existsSync(candidatePath)) {
    return { profile: {} };
  }

  return {
    profile: parseJsonc<CcconfigsProfile>(readFileSync(candidatePath, 'utf8')),
    path: candidatePath,
  };
}

function validatePluginSelection(plugins: string[], availablePlugins: Set<string>): void {
  const unknownPlugins = plugins.filter(plugin => !availablePlugins.has(plugin));
  if (unknownPlugins.length > 0) {
    throw new Error(`Unknown plugin pack(s): ${unknownPlugins.join(', ')}`);
  }
}

function currentPluginsForTarget(
  target: ConcreteTarget,
  scope: PluginScope,
  repoPath: string | undefined
): string[] {
  if (target === 'opencode') {
    const paths = resolveOpenCodeScopePaths(scope, repoPath);
    return readOpenCodeManagedState(paths.statePath)?.plugins || [];
  }

  const paths = resolveCodexScopePaths(repoPath);
  return readCodexManagedState(paths.statePath)?.plugins || [];
}

function resolveTargetPlugins(
  target: ConcreteTarget,
  args: CliArgs,
  repoPath: string | undefined,
  availablePlugins: Set<string>
): string[] {
  if (args.plugins && (args.enable || args.disable)) {
    throw new Error('Use either --plugins or --enable/--disable, not both');
  }

  const plugins = args.plugins
    ? normalizePluginList(args.plugins.split(','))
    : normalizePluginList(currentPluginsForTarget(target, args.scope, repoPath));

  const nextPlugins = new Set(plugins);

  for (const plugin of normalizePluginList((args.enable || '').split(','))) {
    nextPlugins.add(plugin);
  }

  for (const plugin of normalizePluginList((args.disable || '').split(','))) {
    nextPlugins.delete(plugin);
  }

  const resolved = Array.from(nextPlugins).sort();
  validatePluginSelection(resolved, availablePlugins);
  return resolved;
}

function listPluginPacks(sourceRoot: string, output: string[]): void {
  const registry = loadPluginRegistry(sourceRoot, join('opencode', 'packs.json'));
  const plugins = Object.entries(registry.plugins)
    .map(([name, plugin]) => ({ name, description: plugin.description || 'No description provided' }))
    .sort((left, right) => left.name.localeCompare(right.name));

  output.push('Available plugin packs:');
  for (const plugin of plugins) {
    output.push(`- ${plugin.name}: ${plugin.description}`);
  }
}

function runDoctor(sourceRoot: string, args: CliArgs, output: string[]): void {
  const registry = loadPluginRegistry(sourceRoot, join('opencode', 'packs.json'));
  const profile = readProfile(sourceRoot, args.profilePath);
  const machine = args.machine || hostname();
  const observability = resolveObservabilityProfile(profile.profile, machine);

  output.push(`Source root: ${sourceRoot}`);
  output.push(`Registry version: ${registry.version}`);
  output.push(`Plugin packs: ${Object.keys(registry.plugins).sort().join(', ') || '(none)'}`);
  output.push(`Profile: ${profile.path ? withHomePrefix(profile.path) : '(defaults)'}`);
  output.push(`Machine: ${machine}`);
  output.push(`Observability: ${args.noObservability ? 'disabled by CLI' : observability.enabled ? 'enabled' : 'disabled'}`);

  const repoPath = args.repoPath || process.cwd();
  for (const target of selectedTargets(args.target)) {
    if (target === 'opencode') {
      const paths = resolveOpenCodeScopePaths(args.scope, repoPath);
      output.push(`OpenCode config: ${withHomePrefix(paths.configPath)}`);
      if (!args.noObservability && observability.opencode.enabled) {
        pushMissingEnvWarnings('OpenCode', [observability.opencode.endpointEnv, observability.opencode.headersEnv], output);
      }
    } else {
      const paths = resolveCodexScopePaths(repoPath);
      output.push(`Codex config: ${withHomePrefix(paths.configPath)}`);
      if (!args.noObservability && observability.codex.enabled) {
        pushInvalidEndpointWarning('Codex', observability.codex.endpoint, output);
        pushMissingEnvWarnings('Codex', [observability.codex.authorizationHeaderEnv], output);
      }
    }
  }
}

function pushInvalidEndpointWarning(target: string, endpoint: string, output: string[]): void {
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    output.push(`Warning: ${target} managed OTel endpoint should start with http:// or https://`);
  }
}

function pushMissingEnvWarnings(target: string, envNames: string[], output: string[]): void {
  for (const envName of envNames) {
    if (!process.env[envName]) {
      output.push(`Warning: ${target} managed OTel expects ${envName} to be set`);
    }
  }
}

function printSyncResult(target: ConcreteTarget, result: { changes: string[]; plugins: string[]; scopePaths: { configPath: string } }, output: string[]): void {
  output.push(`Target: ${target}`);
  output.push(`Selected plugins: ${result.plugins.join(', ') || '(none)'}`);
  output.push(`Config: ${withHomePrefix(result.scopePaths.configPath)}`);

  if (result.changes.length === 0) {
    output.push('Status: already up to date');
  } else {
    output.push(`Changes (${result.changes.length}):`);
    for (const change of result.changes) {
      output.push(`- ${withHomePrefix(change)}`);
    }
  }
}

export function runCcconfigsCli(argv: string[]): CliRunResult {
  const output: string[] = [];
  const args = parseCliArgs(argv);

  if (args.help || !args.command) {
    printHelp(output);
    return { exitCode: 0, output };
  }

  const sourceRoot = resolve(args.sourceRoot || DEFAULT_SOURCE_ROOT);

  if (args.command === 'list') {
    listPluginPacks(sourceRoot, output);
    return { exitCode: 0, output };
  }

  if (args.command === 'doctor') {
    runDoctor(sourceRoot, args, output);
    return { exitCode: 0, output };
  }

  const registry = loadPluginRegistry(sourceRoot, join('opencode', 'packs.json'));
  const availablePlugins = new Set(Object.keys(registry.plugins));
  const profile = readProfile(sourceRoot, args.profilePath);
  const machine = args.machine || hostname();
  const observability = resolveObservabilityProfile(profile.profile, machine);
  const repoPath = args.repoPath || process.cwd();
  const check = args.command === 'check';
  const targetResults: Array<{ changes: string[] }> = [];

  for (const target of selectedTargets(args.target)) {
    const plugins = resolveTargetPlugins(target, args, repoPath, availablePlugins);

    if (target === 'opencode') {
      const opencodeObservability = args.noObservability
        ? { ...observability.opencode, enabled: false }
        : observability.opencode;
      const result = syncOpenCodePluginPacks({
        sourceRoot,
        scope: args.scope,
        repoPath,
        plugins,
        observability: opencodeObservability,
        dryRun: args.dryRun,
        check,
      });

      output.push(`OpenCode scope: ${args.scope}`);
      printSyncResult(target, result, output);
      targetResults.push(result);
      continue;
    }

    const codexObservability = args.noObservability
      ? { ...observability.codex, enabled: false, environment: observability.environment }
      : { ...observability.codex, environment: observability.environment };
    const result = syncCodexPluginPacks({
      sourceRoot,
      repoPath,
      plugins,
      observability: codexObservability,
      dryRun: args.dryRun,
      check,
    });

    printSyncResult(target, result, output);
    targetResults.push(result);
  }

  const hasChanges = targetResults.some(result => result.changes.length > 0);
  return { exitCode: check && hasChanges ? 1 : 0, output };
}

if (import.meta.main) {
  try {
    const result = runCcconfigsCli(process.argv.slice(2));
    console.log(result.output.join('\n'));
    process.exit(result.exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
