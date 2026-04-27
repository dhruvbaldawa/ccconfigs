// ABOUTME: Synchronizes selected Claude plugin packs into OpenCode global or repository-local configuration.
// ABOUTME: Generates OpenCode commands/agents, links skills, and merges managed MCP/instructions idempotently.

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import {
  collectClaudePluginAssets,
  loadPluginRegistry as loadSharedPluginRegistry,
  normalizePluginList,
  readJsoncObject,
  type PluginRegistry,
} from './ccconfigs-assets';
import { parseJsonc } from './ccconfigs-json';
import type { ResolvedOpenCodeObservability } from './ccconfigs-profile';
import {
  adaptAgentMarkdown,
  adaptClaudeMcpConfig,
  adaptCommandMarkdown,
  parseFrontmatter,
} from './opencode-adapter-core';

export type { PluginPack, PluginRegistry } from './ccconfigs-assets';

export type PluginScope = 'global' | 'repo';

export interface ManagedArtifacts {
  commands: string[];
  agents: string[];
  skills: string[];
  mcp: string[];
  configPlugins: string[];
  instructions: string[];
}

export interface ManagedState {
  sourceRoot: string;
  plugins: string[];
  generated: ManagedArtifacts;
}

export interface ScopePaths {
  scopeRoot: string;
  configDir: string;
  configPath: string;
  statePath: string;
  commandsDir: string;
  agentsDir: string;
  skillsDir: string;
}

export interface SyncOptions {
  scope: PluginScope;
  plugins: string[];
  repoPath?: string;
  sourceRoot?: string;
  observability?: ResolvedOpenCodeObservability;
  dryRun?: boolean;
  check?: boolean;
}

export interface SyncResult {
  scope: PluginScope;
  plugins: string[];
  scopePaths: ScopePaths;
  upToDate: boolean;
  changes: string[];
  generated: ManagedArtifacts;
}

interface GeneratedAssets {
  commands: Map<string, string>;
  agents: Map<string, string>;
  skills: Map<string, string>;
  mcp: Record<string, unknown>;
  configPlugins: string[];
  instructions: string[];
}

interface CliArgs {
  scope?: PluginScope;
  plugins?: string;
  path?: string;
  sourceRoot?: string;
  dryRun: boolean;
  check: boolean;
  help: boolean;
}

const STATE_FILE = '.ccconfigs-opencode-state.json';
const REGISTRY_FILE = join('opencode', 'packs.json');
const DEFAULT_SCHEMA = 'https://opencode.ai/config.json';
const DEFAULT_SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function emptyArtifacts(): ManagedArtifacts {
  return {
    commands: [],
    agents: [],
    skills: [],
    mcp: [],
    configPlugins: [],
    instructions: [],
  };
}

function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function sortRecordKeys(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) =>
    left.localeCompare(right)
  ));
}

function readConfigPluginList(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.plugin)) {
    return [];
  }

  return config.plugin.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function ensureDirectory(path: string, dryRun: boolean, changes: string[]): void {
  if (existsSync(path)) {
    return;
  }

  changes.push(`mkdir ${path}`);
  if (!dryRun) {
    mkdirSync(path, { recursive: true });
  }
}

function writeFileIfChanged(
  path: string,
  content: string,
  dryRun: boolean,
  changes: string[]
): void {
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (current === content) {
    return;
  }

  changes.push(`${existsSync(path) ? 'update' : 'create'} ${path}`);
  if (!dryRun) {
    writeFileSync(path, content);
  }
}

function removePath(path: string, dryRun: boolean, changes: string[]): void {
  if (!existsSync(path)) {
    return;
  }

  changes.push(`remove ${path}`);
  if (!dryRun) {
    rmSync(path, { recursive: true, force: true });
  }
}

function ensureSymlink(
  sourcePath: string,
  targetPath: string,
  dryRun: boolean,
  changes: string[]
): void {
  if (existsSync(targetPath)) {
    const stats = lstatSync(targetPath);

    if (stats.isSymbolicLink()) {
      const linkTarget = resolve(dirname(targetPath), readlinkSync(targetPath));
      const resolvedSource = resolve(sourcePath);

      if (linkTarget === resolvedSource) {
        return;
      }
    }

    throw new Error(
      `Cannot create managed skill link at ${targetPath}: path already exists and is not managed`
    );
  }

  changes.push(`link ${targetPath} -> ${sourcePath}`);
  if (!dryRun) {
    symlinkSync(sourcePath, targetPath, 'junction');
  }
}

function hasGeneratedArtifacts(artifacts: ManagedArtifacts): boolean {
  return (
    artifacts.commands.length > 0 ||
    artifacts.agents.length > 0 ||
    artifacts.skills.length > 0 ||
    artifacts.mcp.length > 0 ||
    artifacts.configPlugins.length > 0 ||
    artifacts.instructions.length > 0
  );
}

function parseCliArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
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

    if (current === '--plugins' && next !== undefined) {
      args.plugins = next;
      index++;
      continue;
    }

    if (current === '--path' && next !== undefined) {
      args.path = next;
      index++;
      continue;
    }

    if (current === '--source-root' && next !== undefined) {
      args.sourceRoot = next;
      index++;
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

function parsePluginList(input: string | undefined): string[] {
  if (!input) {
    return [];
  }

  return normalizePluginList(input.split(','));
}

function printHelp(): void {
  console.log(`OpenCode sync utility

Usage:
  bun scripts/opencode-sync.ts --scope <global|repo> --plugins <comma-separated>

Options:
  --scope <global|repo>   Target OpenCode scope
  --plugins <list>        Plugin pack list, for example: essentials,writing
  --path <repoPath>       Repository root for --scope repo (defaults to cwd)
  --source-root <path>    Path to ccconfigs repository root
  --dry-run               Preview changes without writing files
  --check                 Exit non-zero if sync would make changes
  --help                  Show this help
`);
}

export function getDefaultSourceRoot(): string {
  return DEFAULT_SOURCE_ROOT;
}

export function loadPluginRegistry(sourceRoot = DEFAULT_SOURCE_ROOT): PluginRegistry {
  return loadSharedPluginRegistry(sourceRoot, REGISTRY_FILE);
}

export function resolveScopePaths(scope: PluginScope, repoPath?: string): ScopePaths {
  if (scope === 'global') {
    const configDir = join(homedir(), '.config', 'opencode');
    return {
      scopeRoot: configDir,
      configDir,
      configPath: join(configDir, 'opencode.json'),
      statePath: join(configDir, STATE_FILE),
      commandsDir: join(configDir, 'commands'),
      agentsDir: join(configDir, 'agents'),
      skillsDir: join(configDir, 'skills'),
    };
  }

  const resolvedRepoPath = resolve(repoPath || process.cwd());
  const configDir = join(resolvedRepoPath, '.opencode');

  return {
    scopeRoot: resolvedRepoPath,
    configDir,
    configPath: join(resolvedRepoPath, 'opencode.json'),
    statePath: join(configDir, STATE_FILE),
    commandsDir: join(configDir, 'commands'),
    agentsDir: join(configDir, 'agents'),
    skillsDir: join(configDir, 'skills'),
  };
}

export function readManagedState(path: string): ManagedState | null {
  if (!existsSync(path)) {
    return null;
  }

  try {
    const parsed = parseJsonc<ManagedState>(readFileSync(path, 'utf8'));
    if (!parsed || !Array.isArray(parsed.plugins) || !parsed.generated) {
      return null;
    }

    return {
      sourceRoot: parsed.sourceRoot,
      plugins: normalizePluginList(parsed.plugins),
      generated: {
        commands: parsed.generated.commands || [],
        agents: parsed.generated.agents || [],
        skills: parsed.generated.skills || [],
        mcp: parsed.generated.mcp || [],
        configPlugins: parsed.generated.configPlugins || [],
        instructions: parsed.generated.instructions || [],
      },
    };
  } catch {
    return null;
  }
}

function collectGeneratedAssets(
  sourceRoot: string,
  registry: PluginRegistry,
  plugins: string[]
): GeneratedAssets {
  const commandMap = new Map<string, string>();
  const agentMap = new Map<string, string>();
  const skillMap = new Map<string, string>();
  const mcpMap: Record<string, unknown> = {};
  const instructions = new Set<string>();
  const loadedPlugins = collectClaudePluginAssets(sourceRoot, registry, plugins);

  for (const loadedPlugin of loadedPlugins) {
    if (loadedPlugin.plugin.commands) {
      for (const command of loadedPlugin.commands) {
        const commandName = command.name;
        if (commandMap.has(commandName)) {
          throw new Error(`Command name conflict: ${commandName}`);
        }

        const adapted = adaptCommandMarkdown(command.markdown, `${commandName} command`);
        commandMap.set(commandName, adapted.markdown);
      }
    }

    if (loadedPlugin.plugin.agents) {
      for (const agent of loadedPlugin.agents) {
        const parsed = parseFrontmatter(agent.markdown);
        const agentName = parsed.frontmatter.name || agent.name;

        if (agentMap.has(agentName)) {
          throw new Error(`Agent name conflict: ${agentName}`);
        }

        const adapted = adaptAgentMarkdown(agent.markdown, `${agentName} agent`);
        agentMap.set(agentName, adapted.markdown);
      }
    }

    if (loadedPlugin.plugin.skills) {
      for (const skill of loadedPlugin.skills) {
        const skillName = skill.name;
        const existing = skillMap.get(skillName);

        if (existing && resolve(existing) !== resolve(skill.path)) {
          throw new Error(`Skill name conflict: ${skillName}`);
        }

        skillMap.set(skillName, skill.path);
      }
    }

    if (loadedPlugin.mcp) {
      const mcpConfig = adaptClaudeMcpConfig(loadedPlugin.mcp);

      for (const [serverName, serverConfig] of Object.entries(mcpConfig)) {
        if (mcpMap[serverName]) {
          throw new Error(`MCP server name conflict: ${serverName}`);
        }

        mcpMap[serverName] = serverConfig;
      }
    }

    for (const instructionPath of loadedPlugin.instructions) {
      instructions.add(instructionPath);
    }
  }

  return {
    commands: commandMap,
    agents: agentMap,
    skills: skillMap,
    mcp: sortRecordKeys(mcpMap),
    configPlugins: [],
    instructions: Array.from(instructions).sort(),
  };
}

function resolveManagedConfigPlugins(
  currentConfig: Record<string, unknown>,
  previousState: ManagedState | null,
  observability: ResolvedOpenCodeObservability | undefined
): string[] {
  if (!observability) {
    return previousState?.generated.configPlugins || [];
  }

  if (!observability.enabled || !observability.plugin) {
    return [];
  }

  const previouslyManaged = new Set(previousState?.generated.configPlugins || []);
  if (previouslyManaged.has(observability.plugin)) {
    return [observability.plugin];
  }

  return readConfigPluginList(currentConfig).includes(observability.plugin)
    ? []
    : [observability.plugin];
}

function cleanupManagedArtifacts(
  previousState: ManagedState | null,
  nextAssets: GeneratedAssets,
  paths: ScopePaths,
  dryRun: boolean,
  changes: string[]
): void {
  if (!previousState) {
    return;
  }

  const nextCommands = new Set(nextAssets.commands.keys());
  const nextAgents = new Set(nextAssets.agents.keys());
  const nextSkills = new Set(nextAssets.skills.keys());

  for (const commandName of previousState.generated.commands || []) {
    if (!nextCommands.has(commandName)) {
      removePath(join(paths.commandsDir, `${commandName}.md`), dryRun, changes);
    }
  }

  for (const agentName of previousState.generated.agents || []) {
    if (!nextAgents.has(agentName)) {
      removePath(join(paths.agentsDir, `${agentName}.md`), dryRun, changes);
    }
  }

  for (const skillName of previousState.generated.skills || []) {
    if (!nextSkills.has(skillName)) {
      removePath(join(paths.skillsDir, skillName), dryRun, changes);
    }
  }
}

function mergeManagedConfig(
  currentConfig: Record<string, unknown>,
  previousState: ManagedState | null,
  nextMcp: Record<string, unknown>,
  nextConfigPlugins: string[],
  nextInstructions: string[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...currentConfig };

  if (!merged.$schema) {
    merged.$schema = DEFAULT_SCHEMA;
  }

  const managedMcpNames = new Set(previousState?.generated.mcp || []);
  const managedConfigPlugins = new Set(previousState?.generated.configPlugins || []);
  const managedInstructions = new Set(previousState?.generated.instructions || []);

  const mergedMcp = isNonEmptyObject(merged.mcp)
    ? { ...(merged.mcp as Record<string, unknown>) }
    : {};

  for (const managedName of managedMcpNames) {
    delete mergedMcp[managedName];
  }

  for (const [serverName, serverConfig] of Object.entries(nextMcp)) {
    mergedMcp[serverName] = serverConfig;
  }

  if (Object.keys(mergedMcp).length > 0) {
    merged.mcp = sortRecordKeys(mergedMcp);
  } else {
    delete merged.mcp;
  }

  const existingPlugins = Array.isArray(merged.plugin) ? merged.plugin : [];
  const nextPluginList: unknown[] = [];
  const nextPluginSet = new Set<string>();

  for (const plugin of existingPlugins) {
    if (typeof plugin === 'string') {
      if (managedConfigPlugins.has(plugin) || nextPluginSet.has(plugin)) {
        continue;
      }

      nextPluginSet.add(plugin);
    }

    nextPluginList.push(plugin);
  }

  for (const plugin of nextConfigPlugins) {
    if (nextPluginSet.has(plugin)) {
      continue;
    }

    nextPluginList.push(plugin);
    nextPluginSet.add(plugin);
  }

  if (nextPluginList.length > 0) {
    merged.plugin = nextPluginList;
  } else {
    delete merged.plugin;
  }

  const existingInstructions = Array.isArray(merged.instructions)
    ? merged.instructions.filter((entry): entry is string => typeof entry === 'string')
    : [];

  const nextInstructionSet = new Set(
    existingInstructions.filter(path => !managedInstructions.has(path))
  );

  for (const instructionPath of nextInstructions) {
    nextInstructionSet.add(instructionPath);
  }

  if (nextInstructionSet.size > 0) {
    merged.instructions = Array.from(nextInstructionSet).sort();
  } else {
    delete merged.instructions;
  }

  return merged;
}

function buildManagedState(
  sourceRoot: string,
  plugins: string[],
  assets: GeneratedAssets
): ManagedState {
  return {
    sourceRoot,
    plugins,
    generated: {
      commands: Array.from(assets.commands.keys()).sort(),
      agents: Array.from(assets.agents.keys()).sort(),
      skills: Array.from(assets.skills.keys()).sort(),
      mcp: Object.keys(assets.mcp).sort(),
      configPlugins: [...assets.configPlugins].sort(),
      instructions: [...assets.instructions],
    },
  };
}

function writeManagedState(
  statePath: string,
  state: ManagedState,
  dryRun: boolean,
  changes: string[]
): void {
  const content = JSON.stringify(state, null, 2) + '\n';
  writeFileIfChanged(statePath, content, dryRun, changes);
}

export function syncPluginPacks(options: SyncOptions): SyncResult {
  const sourceRoot = resolve(options.sourceRoot || DEFAULT_SOURCE_ROOT);
  const plugins = normalizePluginList(options.plugins);
  const registry = loadPluginRegistry(sourceRoot);
  const scopePaths = resolveScopePaths(options.scope, options.repoPath);
  const dryRun = Boolean(options.dryRun || options.check);
  const changes: string[] = [];

  for (const pluginName of plugins) {
    if (!registry.plugins[pluginName]) {
      throw new Error(`Unknown plugin pack: ${pluginName}`);
    }
  }

  const previousState = readManagedState(scopePaths.statePath);
  const currentConfig = readJsoncObject(scopePaths.configPath);
  const assets = collectGeneratedAssets(sourceRoot, registry, plugins);
  assets.configPlugins = resolveManagedConfigPlugins(currentConfig, previousState, options.observability);

  if (!previousState && plugins.length === 0 && assets.configPlugins.length === 0) {
    return {
      scope: options.scope,
      plugins,
      scopePaths,
      upToDate: true,
      changes,
      generated: emptyArtifacts(),
    };
  }

  ensureDirectory(scopePaths.configDir, dryRun, changes);
  ensureDirectory(scopePaths.commandsDir, dryRun, changes);
  ensureDirectory(scopePaths.agentsDir, dryRun, changes);
  ensureDirectory(scopePaths.skillsDir, dryRun, changes);

  cleanupManagedArtifacts(previousState, assets, scopePaths, dryRun, changes);

  for (const [commandName, commandMarkdown] of assets.commands.entries()) {
    writeFileIfChanged(
      join(scopePaths.commandsDir, `${commandName}.md`),
      commandMarkdown,
      dryRun,
      changes
    );
  }

  for (const [agentName, agentMarkdown] of assets.agents.entries()) {
    writeFileIfChanged(
      join(scopePaths.agentsDir, `${agentName}.md`),
      agentMarkdown,
      dryRun,
      changes
    );
  }

  for (const [skillName, skillSourcePath] of assets.skills.entries()) {
    ensureSymlink(
      skillSourcePath,
      join(scopePaths.skillsDir, skillName),
      dryRun,
      changes
    );
  }

  const nextConfig = mergeManagedConfig(
    currentConfig,
    previousState,
    assets.mcp,
    assets.configPlugins,
    assets.instructions
  );
  const nextConfigContent = JSON.stringify(nextConfig, null, 2) + '\n';
  writeFileIfChanged(scopePaths.configPath, nextConfigContent, dryRun, changes);

  const managedState = buildManagedState(sourceRoot, plugins, assets);

  if (hasGeneratedArtifacts(managedState.generated) || plugins.length > 0) {
    writeManagedState(scopePaths.statePath, managedState, dryRun, changes);
  } else {
    removePath(scopePaths.statePath, dryRun, changes);
  }

  return {
    scope: options.scope,
    plugins,
    scopePaths,
    upToDate: changes.length === 0,
    changes,
    generated: managedState.generated,
  };
}

function runFromCli(): void {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.scope) {
    throw new Error('--scope is required');
  }

  const plugins = parsePluginList(args.plugins);

  const result = syncPluginPacks({
    scope: args.scope,
    plugins,
    repoPath: args.path,
    sourceRoot: args.sourceRoot,
    dryRun: args.dryRun,
    check: args.check,
  });

  console.log(`Scope: ${result.scope}`);
  console.log(`Plugins: ${result.plugins.join(', ') || '(none)'}`);
  console.log(`Config: ${result.scopePaths.configPath}`);

  if (result.changes.length === 0) {
    console.log('Status: already up to date');
  } else {
    console.log(`Changes (${result.changes.length}):`);
    result.changes.forEach(change => console.log(`- ${change}`));
  }

  if (args.check && result.changes.length > 0) {
    process.exit(1);
  }
}

if (import.meta.main) {
  try {
    runFromCli();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
