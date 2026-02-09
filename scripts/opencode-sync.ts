// ABOUTME: Synchronizes selected Claude plugin packs into OpenCode global or repository-local configuration.
// ABOUTME: Generates OpenCode commands/agents, links skills, and merges managed MCP/instructions idempotently.

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { homedir } from 'os';
import { basename, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import {
  adaptAgentMarkdown,
  adaptClaudeMcpConfig,
  adaptCommandMarkdown,
  parseFrontmatter,
  parseJsonc,
} from './opencode-adapter-core';

export type PluginScope = 'global' | 'repo';

export interface PluginPack {
  description?: string;
  commands?: string;
  agents?: string;
  skills?: string;
  mcp?: string;
  instructions?: string[];
}

export interface PluginRegistry {
  version: number;
  plugins: Record<string, PluginPack>;
}

export interface ManagedArtifacts {
  commands: string[];
  agents: string[];
  skills: string[];
  mcp: string[];
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
    instructions: [],
  };
}

function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizePluginList(plugins: string[]): string[] {
  return Array.from(
    new Set(plugins.map(plugin => plugin.trim()).filter(Boolean))
  ).sort();
}

function listMarkdownFiles(path: string, recursive: boolean): string[] {
  if (!existsSync(path)) {
    return [];
  }

  const entries = readdirSync(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = join(path, entry.name);

    if (entry.isDirectory() && recursive) {
      files.push(...listMarkdownFiles(absolutePath, true));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function listSkillDirectories(path: string): string[] {
  if (!existsSync(path)) {
    return [];
  }

  const entries = readdirSync(path, { withFileTypes: true });
  const directories: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const absolutePath = join(path, entry.name);
    if (existsSync(join(absolutePath, 'SKILL.md'))) {
      directories.push(absolutePath);
    }
  }

  return directories.sort();
}

function readJsoncObject(path: string): Record<string, unknown> {
  if (!existsSync(path)) {
    return {};
  }

  const raw = readFileSync(path, 'utf8');
  const parsed = parseJsonc<unknown>(raw);
  if (!isNonEmptyObject(parsed)) {
    return {};
  }

  return parsed;
}

function sortRecordKeys(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) =>
    left.localeCompare(right)
  ));
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
  const registryPath = join(sourceRoot, REGISTRY_FILE);
  const parsed = readJsoncObject(registryPath);

  if (typeof parsed.version !== 'number' || !isNonEmptyObject(parsed.plugins)) {
    throw new Error(`Invalid plugin registry: ${registryPath}`);
  }

  return {
    version: parsed.version,
    plugins: parsed.plugins as Record<string, PluginPack>,
  };
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

  for (const pluginName of plugins) {
    const plugin = registry.plugins[pluginName];
    if (!plugin) {
      throw new Error(`Unknown plugin pack: ${pluginName}`);
    }

    if (plugin.commands) {
      const commandsDir = join(sourceRoot, plugin.commands);

      for (const commandPath of listMarkdownFiles(commandsDir, false)) {
        const commandName = basename(commandPath, '.md');
        if (commandMap.has(commandName)) {
          throw new Error(`Command name conflict: ${commandName}`);
        }

        const source = readFileSync(commandPath, 'utf8');
        const adapted = adaptCommandMarkdown(source, `${commandName} command`);
        commandMap.set(commandName, adapted.markdown);
      }
    }

    if (plugin.agents) {
      const agentsDir = join(sourceRoot, plugin.agents);

      for (const agentPath of listMarkdownFiles(agentsDir, true)) {
        const source = readFileSync(agentPath, 'utf8');
        const parsed = parseFrontmatter(source);
        const agentName = parsed.frontmatter.name || basename(agentPath, '.md');

        if (agentMap.has(agentName)) {
          throw new Error(`Agent name conflict: ${agentName}`);
        }

        const adapted = adaptAgentMarkdown(source, `${agentName} agent`);
        agentMap.set(agentName, adapted.markdown);
      }
    }

    if (plugin.skills) {
      const skillsDir = join(sourceRoot, plugin.skills);

      for (const skillDir of listSkillDirectories(skillsDir)) {
        const skillName = basename(skillDir);
        const existing = skillMap.get(skillName);

        if (existing && resolve(existing) !== resolve(skillDir)) {
          throw new Error(`Skill name conflict: ${skillName}`);
        }

        skillMap.set(skillName, skillDir);
      }
    }

    if (plugin.mcp) {
      const mcpPath = join(sourceRoot, plugin.mcp);
      const mcpConfig = adaptClaudeMcpConfig(readJsoncObject(mcpPath));

      for (const [serverName, serverConfig] of Object.entries(mcpConfig)) {
        if (mcpMap[serverName]) {
          throw new Error(`MCP server name conflict: ${serverName}`);
        }

        mcpMap[serverName] = serverConfig;
      }
    }

    for (const instructionPath of plugin.instructions || []) {
      instructions.add(resolve(sourceRoot, instructionPath));
    }
  }

  return {
    commands: commandMap,
    agents: agentMap,
    skills: skillMap,
    mcp: sortRecordKeys(mcpMap),
    instructions: Array.from(instructions).sort(),
  };
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
  nextInstructions: string[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...currentConfig };

  if (!merged.$schema) {
    merged.$schema = DEFAULT_SCHEMA;
  }

  const managedMcpNames = new Set(previousState?.generated.mcp || []);
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
  const assets = collectGeneratedAssets(sourceRoot, registry, plugins);

  if (!previousState && plugins.length === 0) {
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

  const currentConfig = readJsoncObject(scopePaths.configPath);
  const nextConfig = mergeManagedConfig(
    currentConfig,
    previousState,
    assets.mcp,
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
