// ABOUTME: Synchronizes selected Claude plugin packs into Codex repository-local configuration.
// ABOUTME: Generates Codex config.toml, AGENTS.md, links skills, and merges managed MCP/OTel idempotently.

import {
  existsSync,
  type Stats,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
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
import type { ResolvedCodexObservability } from './ccconfigs-profile';
import {
  adaptCodexAgentMarkdown,
  adaptCodexMcpConfig,
  buildCodexAgentsFile,
  buildCodexMcpToml,
  buildCodexOtelToml,
} from './codex-adapter-core';

export type { PluginPack, PluginRegistry } from './ccconfigs-assets';

export interface ManagedArtifacts {
  agents: string[];
  skills: string[];
  mcp: string[];
  otel: boolean;
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
  agentsPath: string;
  skillsDir: string;
}

export interface SyncOptions {
  plugins: string[];
  repoPath?: string;
  sourceRoot?: string;
  observability?: ResolvedCodexObservability;
  dryRun?: boolean;
  check?: boolean;
}

export interface SyncResult {
  plugins: string[];
  scopePaths: ScopePaths;
  upToDate: boolean;
  changes: string[];
  generated: ManagedArtifacts;
}

interface GeneratedAssets {
  agents: Array<{ name: string; description: string; model?: string; markdown: string }>;
  skills: Map<string, string>;
  mcp: Record<string, unknown>;
  otel: boolean;
  instructions: string[];
}

const STATE_FILE = '.ccconfigs-codex-state.json';
const REGISTRY_FILE = join('opencode', 'packs.json');
const DEFAULT_SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANAGED_AGENTS_START = '<!-- ccconfigs-codex:start -->';
const MANAGED_AGENTS_END = '<!-- ccconfigs-codex:end -->';

function emptyArtifacts(): ManagedArtifacts {
  return {
    agents: [],
    skills: [],
    mcp: [],
    otel: false,
    instructions: [],
  };
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

function lstatIfExists(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function removeManagedSymlink(
  sourcePath: string,
  targetPath: string,
  dryRun: boolean,
  changes: string[]
): void {
  const stats = lstatIfExists(targetPath);
  if (!stats) {
    return;
  }

  if (!stats.isSymbolicLink()) {
    throw new Error(`Cannot remove managed skill link at ${targetPath}: path is no longer a symlink`);
  }

  const linkTarget = resolve(dirname(targetPath), readlinkSync(targetPath));
  const resolvedSource = resolve(sourcePath);

  if (linkTarget !== resolvedSource) {
    throw new Error(`Cannot remove managed skill link at ${targetPath}: symlink target changed`);
  }

  changes.push(`remove ${targetPath}`);
  if (!dryRun) {
    rmSync(targetPath, { recursive: true, force: true });
  }
}

function ensureSymlink(
  sourcePath: string,
  targetPath: string,
  dryRun: boolean,
  changes: string[]
): void {
  const stats = lstatIfExists(targetPath);
  if (stats) {

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
    artifacts.agents.length > 0 ||
    artifacts.skills.length > 0 ||
    artifacts.mcp.length > 0 ||
    artifacts.otel ||
    artifacts.instructions.length > 0
  );
}

export function getDefaultSourceRoot(): string {
  return DEFAULT_SOURCE_ROOT;
}

export function loadPluginRegistry(sourceRoot = DEFAULT_SOURCE_ROOT): PluginRegistry {
  return loadSharedPluginRegistry(sourceRoot, REGISTRY_FILE);
}

export function resolveScopePaths(repoPath?: string): ScopePaths {
  const resolvedRepoPath = resolve(repoPath || process.cwd());
  const configDir = join(resolvedRepoPath, '.codex');

  return {
    scopeRoot: resolvedRepoPath,
    configDir,
    configPath: join(resolvedRepoPath, 'config.toml'),
    statePath: join(configDir, STATE_FILE),
    agentsPath: join(resolvedRepoPath, 'AGENTS.md'),
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
        agents: parsed.generated.agents || [],
        skills: parsed.generated.skills || [],
        mcp: parsed.generated.mcp || [],
        otel: Boolean(parsed.generated.otel),
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
  const agents: GeneratedAssets['agents'] = [];
  const agentNames = new Set<string>();
  const skillMap = new Map<string, string>();
  const mcpMap: Record<string, unknown> = {};
  const instructions = new Set<string>();
  const loadedPlugins = collectClaudePluginAssets(sourceRoot, registry, plugins);

  for (const loadedPlugin of loadedPlugins) {
    if (loadedPlugin.plugin.agents) {
      for (const agent of loadedPlugin.agents) {
        const adapted = adaptCodexAgentMarkdown(agent.markdown, `${agent.name} agent`);

        if (agentNames.has(adapted.name)) {
          throw new Error(`Agent name conflict: ${adapted.name}`);
        }

        agentNames.add(adapted.name);
        agents.push(adapted);
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
      const mcpConfig = adaptCodexMcpConfig(loadedPlugin.mcp);

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
    agents: agents.sort((left, right) => left.name.localeCompare(right.name)),
    skills: skillMap,
    mcp: sortRecordKeys(mcpMap),
    otel: false,
    instructions: Array.from(instructions).sort(),
  };
}

function cleanupManagedArtifacts(
  previousState: ManagedState | null,
  previousAssets: GeneratedAssets | null,
  nextAssets: GeneratedAssets,
  paths: ScopePaths,
  dryRun: boolean,
  changes: string[]
): void {
  if (!previousState) {
    return;
  }

  const nextSkillNames = new Set(nextAssets.skills.keys());

  for (const skillName of previousState.generated.skills || []) {
    if (!nextSkillNames.has(skillName)) {
      const previousSkillSource = previousAssets?.skills.get(skillName);
      if (!previousSkillSource) {
        throw new Error(`Cannot remove managed skill link ${skillName}: previous source is unknown`);
      }

      removeManagedSymlink(
        previousSkillSource,
        join(paths.skillsDir, skillName),
        dryRun,
        changes
      );
    }
  }
}

function buildCodexConfig(
  currentConfigToml: string,
  previousState: ManagedState | null,
  nextMcp: Record<string, unknown>,
  nextOtelToml: string
): string {
  const managedMcpNames = new Set(previousState?.generated.mcp || []);
  const managedOtel = previousState?.generated.otel || false;

  let configToml = currentConfigToml;

  for (const mcpName of Object.keys(nextMcp)) {
    if (!managedMcpNames.has(mcpName) && hasTomlSection(configToml, `mcp_servers.${mcpName}`)) {
      throw new Error(`Cannot manage Codex MCP server ${mcpName}: config.toml already has an unmanaged section`);
    }
  }

  if (nextOtelToml && !managedOtel && hasTomlSection(configToml, 'otel')) {
    throw new Error('Cannot manage Codex OTel config: config.toml already has an unmanaged [otel] section');
  }

  configToml = removeTomlSections(configToml, header => {
    if (managedOtel && isTomlHeaderAtOrBelow(header, 'otel')) {
      return true;
    }

    for (const mcpName of managedMcpNames) {
      if (isTomlHeaderAtOrBelow(header, `mcp_servers.${mcpName}`)) {
        return true;
      }
    }

    return false;
  }).trim();

  const mcpToml = buildCodexMcpToml(nextMcp);
  const chunks = [configToml, mcpToml.trim(), nextOtelToml.trim()]
    .filter(Boolean)
    .join('\n\n');

  return chunks ? chunks + '\n' : '';
}

function hasTomlSection(toml: string, sectionHeader: string): boolean {
  for (const line of toml.replace(/\r\n/g, '\n').split('\n')) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)]\s*$/);
    if (!sectionMatch) {
      continue;
    }

    if (isTomlHeaderAtOrBelow(sectionMatch[1], sectionHeader)) {
      return true;
    }
  }

  return false;
}

function isTomlHeaderAtOrBelow(header: string, sectionHeader: string): boolean {
  const headerParts = splitTomlHeader(header);
  const sectionParts = splitTomlHeader(sectionHeader);

  if (headerParts.length < sectionParts.length) {
    return false;
  }

  return sectionParts.every((part, index) => headerParts[index] === part);
}

function splitTomlHeader(header: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (const char of header.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (quote === '"' && char === '\\') {
      escaped = true;
      continue;
    }

    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote ? null : char;
      continue;
    }

    if (!quote && char === '.') {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  parts.push(current.trim());
  return parts;
}

function removeTomlSections(toml: string, shouldRemoveHeader: (header: string) => boolean): string {
  const output: string[] = [];
  let skipping = false;

  for (const line of toml.replace(/\r\n/g, '\n').split('\n')) {
    const sectionMatch = line.match(/^\s*\[([^\]]+)]\s*$/);

    if (sectionMatch) {
      skipping = shouldRemoveHeader(sectionMatch[1]);
    }

    if (!skipping) {
      output.push(line);
    }
  }

  return output.join('\n');
}

function removeManagedAgentsBlock(markdown: string): string {
  const startIndex = markdown.indexOf(MANAGED_AGENTS_START);
  const endIndex = markdown.indexOf(MANAGED_AGENTS_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return markdown;
  }

  return (markdown.slice(0, startIndex) + markdown.slice(endIndex + MANAGED_AGENTS_END.length))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function mergeManagedAgentsMarkdown(currentMarkdown: string, managedMarkdown: string): string {
  const unmanagedMarkdown = removeManagedAgentsBlock(currentMarkdown);
  const trimmedManaged = managedMarkdown.trim();

  if (!trimmedManaged) {
    return unmanagedMarkdown ? unmanagedMarkdown + '\n' : '';
  }

  const managedBlock = [
    MANAGED_AGENTS_START,
    trimmedManaged,
    MANAGED_AGENTS_END,
  ].join('\n');

  return [unmanagedMarkdown, managedBlock].filter(Boolean).join('\n\n') + '\n';
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
      agents: assets.agents.map(agent => agent.name).sort(),
      skills: Array.from(assets.skills.keys()).sort(),
      mcp: Object.keys(assets.mcp).sort(),
      otel: assets.otel,
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

function readConfigToml(path: string): string {
  if (!existsSync(path)) {
    return '';
  }

  return readFileSync(path, 'utf8');
}

function readTextFile(path: string): string {
  if (!existsSync(path)) {
    return '';
  }

  return readFileSync(path, 'utf8');
}

export function syncPluginPacks(options: SyncOptions): SyncResult {
  const sourceRoot = resolve(options.sourceRoot || DEFAULT_SOURCE_ROOT);
  const plugins = normalizePluginList(options.plugins);
  const registry = loadPluginRegistry(sourceRoot);
  const scopePaths = resolveScopePaths(options.repoPath);
  const dryRun = Boolean(options.dryRun || options.check);
  const changes: string[] = [];

  for (const pluginName of plugins) {
    if (!registry.plugins[pluginName]) {
      throw new Error(`Unknown plugin pack: ${pluginName}`);
    }
  }

  const previousState = readManagedState(scopePaths.statePath);
  const previousAssets = previousState
    ? collectGeneratedAssets(
        previousState.sourceRoot || sourceRoot,
        loadPluginRegistry(previousState.sourceRoot || sourceRoot),
        previousState.plugins
      )
    : null;
  const assets = collectGeneratedAssets(sourceRoot, registry, plugins);

  const otelEnabled = Boolean(options.observability?.enabled);
  assets.otel = otelEnabled;

  const otelToml = buildCodexOtelToml(options.observability);

  if (!previousState && plugins.length === 0 && !assets.otel) {
    return {
      plugins,
      scopePaths,
      upToDate: true,
      changes,
      generated: emptyArtifacts(),
    };
  }

  const currentConfigToml = readConfigToml(scopePaths.configPath);
  const nextConfigToml = buildCodexConfig(
    currentConfigToml,
    previousState,
    assets.mcp,
    otelToml
  );

  ensureDirectory(scopePaths.configDir, dryRun, changes);
  ensureDirectory(scopePaths.skillsDir, dryRun, changes);

  cleanupManagedArtifacts(previousState, previousAssets, assets, scopePaths, dryRun, changes);

  for (const [skillName, skillSourcePath] of assets.skills.entries()) {
    ensureSymlink(
      skillSourcePath,
      join(scopePaths.skillsDir, skillName),
      dryRun,
      changes
    );
  }

  const instructions = assets.instructions.map(instructionPath => readFileSync(instructionPath, 'utf8'));
  const agentsContent = mergeManagedAgentsMarkdown(
    readTextFile(scopePaths.agentsPath),
    buildCodexAgentsFile(assets.agents, instructions)
  );
  if (agentsContent) {
    writeFileIfChanged(scopePaths.agentsPath, agentsContent, dryRun, changes);
  } else {
    removePath(scopePaths.agentsPath, dryRun, changes);
  }

  if (nextConfigToml) {
    writeFileIfChanged(scopePaths.configPath, nextConfigToml, dryRun, changes);
  } else {
    removePath(scopePaths.configPath, dryRun, changes);
  }

  const managedState = buildManagedState(sourceRoot, plugins, assets);

  if (hasGeneratedArtifacts(managedState.generated) || plugins.length > 0) {
    writeManagedState(scopePaths.statePath, managedState, dryRun, changes);
  } else {
    removePath(scopePaths.statePath, dryRun, changes);
  }

  return {
    plugins,
    scopePaths,
    upToDate: changes.length === 0,
    changes,
    generated: managedState.generated,
  };
}
