// ABOUTME: Unit tests for shared Claude plugin asset loading used by target sync adapters.
// ABOUTME: Verifies plugin registry parsing, asset discovery, and JSONC object loading.

import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  collectClaudePluginAssets,
  loadPluginRegistry,
  normalizePluginList,
  readJsoncObject,
} from './ccconfigs-assets';

const tempPaths: string[] = [];

function createTempPath(prefix: string): string {
  const path = mkdtempSync(join(tmpdir(), prefix));
  tempPaths.push(path);
  return path;
}

function write(path: string, content: string): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

function createFixtureSourceRoot(): string {
  const sourceRoot = createTempPath('ccconfigs-assets-');

  write(
    join(sourceRoot, 'registry.jsonc'),
    [
      '{',
      '  // Plugin packs are canonical Claude asset locations.',
      '  "version": 1,',
      '  "plugins": {',
      '    "writing": {',
      '      "commands": "writing/commands",',
      '    },',
      '    "essentials": {',
      '      "commands": "essentials/commands",',
      '      "agents": "essentials/agents",',
      '      "skills": "essentials/skills",',
      '      "mcp": "essentials/.mcp.json",',
      '      "instructions": ["config/Z.md", "config/A.md"],',
      '    },',
      '  },',
      '}',
    ].join('\n') + '\n'
  );

  write(join(sourceRoot, 'essentials', 'commands', 'plan.md'), '# Plan\n');
  write(join(sourceRoot, 'essentials', 'commands', 'nested', 'ignored.md'), '# Ignored\n');
  write(join(sourceRoot, 'essentials', 'agents', 'reviewer.md'), '# Reviewer\n');
  write(join(sourceRoot, 'essentials', 'agents', 'nested', 'deep-reviewer.md'), '# Deep reviewer\n');
  write(join(sourceRoot, 'essentials', 'skills', 'debugging', 'SKILL.md'), '# Debugging\n');
  write(join(sourceRoot, 'essentials', 'skills', 'draft', 'README.md'), '# Not a skill\n');
  write(
    join(sourceRoot, 'essentials', '.mcp.json'),
    [
      '{',
      '  "mcpServers": {',
      '    "context7": {',
      '      "type": "sse",',
      '    },',
      '  },',
      '}',
    ].join('\n') + '\n'
  );
  write(join(sourceRoot, 'writing', 'commands', 'draft.md'), '# Draft\n');
  write(join(sourceRoot, 'config', 'A.md'), 'A\n');
  write(join(sourceRoot, 'config', 'Z.md'), 'Z\n');

  return sourceRoot;
}

afterEach(() => {
  for (const path of tempPaths.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe('normalizePluginList', () => {
  test('deduplicates, trims, and sorts plugin names', () => {
    expect(normalizePluginList([' writing ', '', 'essentials', 'writing'])).toEqual([
      'essentials',
      'writing',
    ]);
  });
});

describe('readJsoncObject', () => {
  test('parses jsonc objects and ignores missing or non-object files', () => {
    const sourceRoot = createFixtureSourceRoot();
    const objectPath = join(sourceRoot, 'object.jsonc');
    const arrayPath = join(sourceRoot, 'array.jsonc');

    write(objectPath, '{\n  // comment\n  "enabled": true,\n}\n');
    write(arrayPath, '["not", "an", "object"]\n');

    expect(readJsoncObject(objectPath)).toEqual({ enabled: true });
    expect(readJsoncObject(arrayPath)).toEqual({});
    expect(readJsoncObject(join(sourceRoot, 'missing.jsonc'))).toEqual({});
  });
});

describe('loadPluginRegistry', () => {
  test('loads a jsonc plugin registry', () => {
    const sourceRoot = createFixtureSourceRoot();
    const registry = loadPluginRegistry(sourceRoot, 'registry.jsonc');

    expect(registry.version).toBe(1);
    expect(Object.keys(registry.plugins)).toEqual(['writing', 'essentials']);
  });
});

describe('collectClaudePluginAssets', () => {
  test('loads canonical assets for normalized plugin selections', () => {
    const sourceRoot = createFixtureSourceRoot();
    const registry = loadPluginRegistry(sourceRoot, 'registry.jsonc');

    const assets = collectClaudePluginAssets(sourceRoot, registry, [
      'writing',
      'essentials',
      'writing',
    ]);

    expect(assets.map(asset => asset.pluginName)).toEqual(['essentials', 'writing']);

    const essentials = assets[0];
    expect(essentials.commands.map(command => command.name)).toEqual(['plan']);
    expect(essentials.agents.map(agent => agent.name)).toEqual(['deep-reviewer', 'reviewer']);
    expect(essentials.skills.map(skill => skill.name)).toEqual(['debugging']);
    expect(essentials.mcp).toEqual({
      mcpServers: {
        context7: {
          type: 'sse',
        },
      },
    });
    expect(essentials.instructions).toEqual([
      join(sourceRoot, 'config', 'A.md'),
      join(sourceRoot, 'config', 'Z.md'),
    ]);

    expect(assets[1].commands.map(command => command.name)).toEqual(['draft']);
  });

  test('throws for unknown plugin names', () => {
    const sourceRoot = createFixtureSourceRoot();
    const registry = loadPluginRegistry(sourceRoot, 'registry.jsonc');

    expect(() => collectClaudePluginAssets(sourceRoot, registry, ['missing'])).toThrow(
      'Unknown plugin pack: missing'
    );
  });
});
