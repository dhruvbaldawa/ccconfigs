// ABOUTME: Loads canonical Claude plugin assets for target-specific ccconfigs generators.
// ABOUTME: Keeps filesystem inventory separate from OpenCode and Codex translation logic.

import { existsSync, readFileSync, readdirSync } from 'fs';
import { basename, join, resolve } from 'path';

import { parseJsonc } from './ccconfigs-json';

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

export interface LoadedMarkdownAsset {
  name: string;
  path: string;
  markdown: string;
}

export interface LoadedSkillAsset {
  name: string;
  path: string;
}

export interface LoadedPluginAssets {
  pluginName: string;
  plugin: PluginPack;
  commands: LoadedMarkdownAsset[];
  agents: LoadedMarkdownAsset[];
  skills: LoadedSkillAsset[];
  mcp: Record<string, unknown> | null;
  instructions: string[];
}

function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function normalizePluginList(plugins: string[]): string[] {
  return Array.from(
    new Set(plugins.map(plugin => plugin.trim()).filter(Boolean))
  ).sort();
}

export function readJsoncObject(path: string): Record<string, unknown> {
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

function loadMarkdownAssets(path: string, recursive: boolean): LoadedMarkdownAsset[] {
  return listMarkdownFiles(path, recursive).map(markdownPath => ({
    name: basename(markdownPath, '.md'),
    path: markdownPath,
    markdown: readFileSync(markdownPath, 'utf8'),
  }));
}

function loadSkillAssets(path: string): LoadedSkillAsset[] {
  return listSkillDirectories(path).map(skillPath => ({
    name: basename(skillPath),
    path: skillPath,
  }));
}

export function loadPluginRegistry(sourceRoot: string, registryFile: string): PluginRegistry {
  const registryPath = join(sourceRoot, registryFile);
  const parsed = readJsoncObject(registryPath);

  if (typeof parsed.version !== 'number' || !isNonEmptyObject(parsed.plugins)) {
    throw new Error(`Invalid plugin registry: ${registryPath}`);
  }

  return {
    version: parsed.version,
    plugins: parsed.plugins as Record<string, PluginPack>,
  };
}

export function collectClaudePluginAssets(
  sourceRoot: string,
  registry: PluginRegistry,
  plugins: string[]
): LoadedPluginAssets[] {
  return normalizePluginList(plugins).map(pluginName => {
    const plugin = registry.plugins[pluginName];
    if (!plugin) {
      throw new Error(`Unknown plugin pack: ${pluginName}`);
    }

    return {
      pluginName,
      plugin,
      commands: plugin.commands ? loadMarkdownAssets(join(sourceRoot, plugin.commands), false) : [],
      agents: plugin.agents ? loadMarkdownAssets(join(sourceRoot, plugin.agents), true) : [],
      skills: plugin.skills ? loadSkillAssets(join(sourceRoot, plugin.skills)) : [],
      mcp: plugin.mcp ? readJsoncObject(join(sourceRoot, plugin.mcp)) : null,
      instructions: (plugin.instructions || []).map(instructionPath => resolve(sourceRoot, instructionPath)).sort(),
    };
  });
}
