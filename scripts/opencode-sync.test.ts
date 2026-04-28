// ABOUTME: Integration tests for OpenCode plugin pack synchronization across repository-local scope.
// ABOUTME: Verifies idempotent generation, cleanup behavior, and preservation of unmanaged config keys.

import { afterEach, describe, expect, test } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { resolveObservabilityProfile } from './ccconfigs-profile';
import { syncPluginPacks } from './opencode-sync';

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
  const sourceRoot = createTempPath('ccconfigs-source-');

  write(
    join(sourceRoot, 'opencode', 'packs.json'),
    JSON.stringify(
      {
        version: 1,
        plugins: {
          essentials: {
            commands: 'essentials/commands',
            agents: 'essentials/agents',
            skills: 'essentials/skills',
            mcp: 'essentials/.mcp.json',
            instructions: ['config/CLAUDE.md'],
          },
        },
      },
      null,
      2
    ) + '\n'
  );

  write(
    join(sourceRoot, 'config', 'CLAUDE.md'),
    'Global instructions\n'
  );

  write(
    join(sourceRoot, 'essentials', 'commands', 'plan.md'),
    ['---', 'description: Plan implementation', '---', '', 'Task: $ARGS'].join('\n') + '\n'
  );

  write(
    join(sourceRoot, 'essentials', 'agents', 'reviewer.md'),
    [
      '---',
      'name: reviewer',
      'description: Reviews code',
      'model: claude-haiku-4-5',
      'color: red',
      '---',
      '',
      'Review changes.',
    ].join('\n') + '\n'
  );

  write(
    join(sourceRoot, 'essentials', 'skills', 'debugging', 'SKILL.md'),
    ['---', 'name: debugging', 'description: Debug issues', '---', '', '# Debugging'].join('\n') + '\n'
  );

  write(
    join(sourceRoot, 'essentials', '.mcp.json'),
    JSON.stringify(
      {
        mcpServers: {
          context7: {
            type: 'sse',
            url: '${MCP_PROXY_HOST}/servers/context7/sse',
            headers: {
              Authorization: 'Basic ${MCP_PROXY_AUTH}',
            },
          },
        },
      },
      null,
      2
    ) + '\n'
  );

  return sourceRoot;
}

afterEach(() => {
  for (const path of tempPaths.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe('syncPluginPacks', () => {
  test('does nothing when no plugins are selected and no state exists', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');

    const result = syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
    });

    expect(result.upToDate).toBe(true);
    expect(result.changes.length).toBe(0);
    expect(existsSync(join(repoPath, '.opencode'))).toBe(false);
    expect(existsSync(join(repoPath, 'opencode.json'))).toBe(false);
  });

  test('creates commands, agents, skills, and managed config for repo scope', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');

    const result = syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: ['essentials'],
    });

    expect(result.upToDate).toBe(false);

    const commandPath = join(repoPath, '.opencode', 'commands', 'plan.md');
    const commandContent = readFileSync(commandPath, 'utf8');
    expect(commandContent).toContain('Task: $ARGUMENTS');

    const agentPath = join(repoPath, '.opencode', 'agents', 'reviewer.md');
    const agentContent = readFileSync(agentPath, 'utf8');
    expect(agentContent).toContain('mode: subagent');
    expect(agentContent).toContain('model: anthropic/claude-haiku-4-5');
    expect(agentContent).toContain('color: error');

    const skillPath = join(repoPath, '.opencode', 'skills', 'debugging');
    expect(lstatSync(skillPath).isSymbolicLink()).toBe(true);

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.mcp.context7.type).toBe('remote');
    expect(config.instructions).toContain(join(sourceRoot, 'config', 'CLAUDE.md'));

    const statePath = join(repoPath, '.opencode', '.ccconfigs-opencode-state.json');
    expect(existsSync(statePath)).toBe(true);
  });

  test('is idempotent when run twice with same plugin selection', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: ['essentials'],
    });

    const secondRun = syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: ['essentials'],
    });

    expect(secondRun.upToDate).toBe(true);
    expect(secondRun.changes.length).toBe(0);
  });

  test('removes managed artifacts when no plugins are selected', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: ['essentials'],
    });

    const cleanup = syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
    });

    expect(cleanup.upToDate).toBe(false);
    expect(existsSync(join(repoPath, '.opencode', 'commands', 'plan.md'))).toBe(false);
    expect(existsSync(join(repoPath, '.opencode', 'agents', 'reviewer.md'))).toBe(false);
    expect(existsSync(join(repoPath, '.opencode', 'skills', 'debugging'))).toBe(false);

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.mcp).toBeUndefined();
    expect(config.instructions).toBeUndefined();

    const statePath = join(repoPath, '.opencode', '.ccconfigs-opencode-state.json');
    expect(existsSync(statePath)).toBe(false);
  });

  test('preserves unmanaged config keys during sync', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');

    write(
      join(repoPath, 'opencode.json'),
      [
        '{',
        '  // custom value should survive sync',
        '  "theme": "opencode",',
        '}',
      ].join('\n')
    );

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: ['essentials'],
    });

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.theme).toBe('opencode');
    expect(config.mcp.context7).toBeDefined();
  });

  test('preserves unmanaged mcp and instructions during managed cleanup', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');

    write(
      join(repoPath, 'opencode.json'),
      JSON.stringify(
        {
          mcp: {
            local: {
              type: 'local',
              command: ['custom-mcp'],
            },
          },
          instructions: ['/custom/instructions.md'],
        },
        null,
        2
      ) + '\n'
    );

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: ['essentials'],
    });

    const syncedConfig = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(syncedConfig.mcp.local).toBeDefined();
    expect(syncedConfig.mcp.context7).toBeDefined();
    expect(syncedConfig.instructions).toContain('/custom/instructions.md');
    expect(syncedConfig.instructions).toContain(join(sourceRoot, 'config', 'CLAUDE.md'));

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
    });

    const cleanedConfig = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(cleanedConfig.mcp).toEqual({
      local: {
        type: 'local',
        command: ['custom-mcp'],
      },
    });
    expect(cleanedConfig.instructions).toEqual(['/custom/instructions.md']);
  });

  test('merges managed OpenCode observability plugin with unmanaged plugins', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');
    const observability = resolveObservabilityProfile().opencode;

    write(
      join(repoPath, 'opencode.json'),
      JSON.stringify(
        {
          plugin: ['custom-plugin'],
        },
        null,
        2
      ) + '\n'
    );

    const result = syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability,
    });

    expect(result.generated.configPlugins).toEqual([observability.plugin]);

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.plugin).toEqual(['custom-plugin', observability.plugin]);
    expect(config.experimental?.openTelemetry).toBeUndefined();
    expect(JSON.stringify(config)).not.toContain(observability.endpointEnv);
    expect(JSON.stringify(config)).not.toContain(observability.headersEnv);
    expect(JSON.stringify(config)).not.toContain(observability.enableTelemetryEnv);

    const statePath = join(repoPath, '.opencode', '.ccconfigs-opencode-state.json');
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    expect(state.generated.configPlugins).toEqual([observability.plugin]);
    expect(existsSync(join(repoPath, '.opencode', 'commands'))).toBe(false);
    expect(existsSync(join(repoPath, '.opencode', 'agents'))).toBe(false);
    expect(existsSync(join(repoPath, '.opencode', 'skills'))).toBe(false);
  });

  test('preserves managed OpenCode observability when observability option is omitted', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');
    const observability = resolveObservabilityProfile().opencode;

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability,
    });

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
    });

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.plugin).toEqual([observability.plugin]);

    const statePath = join(repoPath, '.opencode', '.ccconfigs-opencode-state.json');
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    expect(state.generated.configPlugins).toEqual([observability.plugin]);
  });

  test('replaces the old managed OpenCode OTel plugin from prior state', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');
    const observability = resolveObservabilityProfile().opencode;

    write(
      join(repoPath, 'opencode.json'),
      JSON.stringify(
        {
          plugin: ['custom-plugin', 'opencode-otel-plugin'],
        },
        null,
        2
      ) + '\n'
    );
    write(
      join(repoPath, '.opencode', '.ccconfigs-opencode-state.json'),
      JSON.stringify(
        {
          sourceRoot,
          plugins: [],
          generated: {
            commands: [],
            agents: [],
            skills: [],
            mcp: [],
            configPlugins: ['opencode-otel-plugin'],
            instructions: [],
          },
        },
        null,
        2
      ) + '\n'
    );

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability,
    });

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.plugin).toEqual(['custom-plugin', observability.plugin]);

    const state = JSON.parse(readFileSync(join(repoPath, '.opencode', '.ccconfigs-opencode-state.json'), 'utf8'));
    expect(state.generated.configPlugins).toEqual([observability.plugin]);
  });

  test('does not adopt a pre-existing unmanaged OpenCode observability plugin', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');
    const observability = resolveObservabilityProfile().opencode;

    write(
      join(repoPath, 'opencode.json'),
      JSON.stringify(
        {
          plugin: [observability.plugin, 'custom-plugin'],
        },
        null,
        2
      ) + '\n'
    );

    const enabledRun = syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability,
    });

    expect(enabledRun.generated.configPlugins).toEqual([]);
    expect(existsSync(join(repoPath, '.opencode', '.ccconfigs-opencode-state.json'))).toBe(false);

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability: {
        ...observability,
        enabled: false,
      },
    });

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.plugin).toEqual([observability.plugin, 'custom-plugin']);
  });

  test('refuses unmanaged legacy plugin when new plugin is already managed', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');
    const observability = resolveObservabilityProfile().opencode;

    write(
      join(repoPath, 'opencode.json'),
      JSON.stringify(
        {
          plugin: [observability.plugin, '@devtheops/opencode-plugin-otel'],
        },
        null,
        2
      ) + '\n'
    );
    write(
      join(repoPath, '.opencode', '.ccconfigs-opencode-state.json'),
      JSON.stringify(
        {
          sourceRoot,
          plugins: [],
          generated: {
            commands: [],
            agents: [],
            skills: [],
            mcp: [],
            configPlugins: [observability.plugin],
            instructions: [],
          },
        },
        null,
        2
      ) + '\n'
    );

    expect(() => syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability,
    })).toThrow('Cannot manage OpenCode observability: remove unmanaged legacy plugin @devtheops/opencode-plugin-otel');
  });

  test('refuses to add OpenCode OTel when legacy plugin exists unmanaged', () => {
    const sourceRoot = createFixtureSourceRoot();
    const observability = resolveObservabilityProfile().opencode;

    for (const legacyPlugin of ['@devtheops/opencode-plugin-otel', 'opencode-otel-plugin']) {
      const repoPath = createTempPath('ccconfigs-repo-');
      write(
        join(repoPath, 'opencode.json'),
        JSON.stringify(
          {
            plugin: [legacyPlugin, 'custom-plugin'],
          },
          null,
          2
        ) + '\n'
      );

      expect(() => syncPluginPacks({
        sourceRoot,
        scope: 'repo',
        repoPath,
        plugins: [],
        observability,
      })).toThrow(`Cannot manage OpenCode observability: remove unmanaged legacy plugin ${legacyPlugin}`);
      const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
      expect(config.plugin).toEqual([legacyPlugin, 'custom-plugin']);
      expect(existsSync(join(repoPath, '.opencode', '.ccconfigs-opencode-state.json'))).toBe(false);
    }
  });

  test('removes only managed OpenCode observability plugin when disabled', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-repo-');
    const observability = resolveObservabilityProfile().opencode;

    write(
      join(repoPath, 'opencode.json'),
      JSON.stringify(
        {
          plugin: ['custom-plugin'],
        },
        null,
        2
      ) + '\n'
    );

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability,
    });

    syncPluginPacks({
      sourceRoot,
      scope: 'repo',
      repoPath,
      plugins: [],
      observability: {
        ...observability,
        enabled: false,
      },
    });

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.plugin).toEqual(['custom-plugin']);
    expect(config.experimental?.openTelemetry).toBeUndefined();

    const statePath = join(repoPath, '.opencode', '.ccconfigs-opencode-state.json');
    expect(existsSync(statePath)).toBe(false);
  });
});
