// ABOUTME: Integration tests for Codex plugin pack synchronization across repository-local scope.
// ABOUTME: Verifies idempotent generation, cleanup behavior, and preservation of unmanaged config keys.

import { afterEach, describe, expect, test } from 'bun:test';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { resolveObservabilityProfile } from './ccconfigs-profile';
import { syncPluginPacks } from './codex-sync';

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
  const sourceRoot = createTempPath('ccconfigs-codex-source-');

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
    join(sourceRoot, 'essentials', 'agents', 'reviewer.md'),
    [
      '---',
      'name: reviewer',
      'description: Reviews code',
      'model: claude-haiku-4-5',
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
    const repoPath = createTempPath('ccconfigs-codex-repo-');

    const result = syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
    });

    expect(result.upToDate).toBe(true);
    expect(result.changes.length).toBe(0);
    expect(existsSync(join(repoPath, '.codex'))).toBe(false);
    expect(existsSync(join(repoPath, 'config.toml'))).toBe(false);
  });

  test('creates agents, skills, and managed config for repo scope', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');

    const result = syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    expect(result.upToDate).toBe(false);

    const agentsPath = join(repoPath, 'AGENTS.md');
    const agentsContent = readFileSync(agentsPath, 'utf8');
    expect(agentsContent).toContain('Global instructions');
    expect(agentsContent).toContain('## reviewer');
    expect(agentsContent).toContain('**Description:** Reviews code');

    const skillPath = join(repoPath, '.codex', 'skills', 'debugging');
    expect(lstatSync(skillPath).isSymbolicLink()).toBe(true);
    expect(readlinkSync(skillPath)).toBe(join(sourceRoot, 'essentials', 'skills', 'debugging'));

    const configToml = readFileSync(join(repoPath, 'config.toml'), 'utf8');
    expect(configToml).toContain('[mcp_servers.context7]');
    expect(configToml).toContain('type = "sse"');
    expect(configToml).toContain('${MCP_PROXY_HOST}');
    expect(configToml).toContain('${MCP_PROXY_AUTH}');

    const statePath = join(repoPath, '.codex', '.ccconfigs-codex-state.json');
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    expect(state.sourceRoot).toBe(sourceRoot);
    expect(state.plugins).toEqual(['essentials']);
    expect(state.generated.agents).toEqual(['reviewer']);
    expect(state.generated.skills).toEqual(['debugging']);
    expect(state.generated.mcp).toEqual(['context7']);
    expect(state.generated.instructions).toEqual([join(sourceRoot, 'config', 'CLAUDE.md')]);
  });

  test('is idempotent when run twice with same plugin selection', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    const secondRun = syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    expect(secondRun.upToDate).toBe(true);
    expect(secondRun.changes.length).toBe(0);
  });

  test('replaces an existing managed AGENTS.md block on later syncs', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');
    const instructionPath = join(sourceRoot, 'config', 'CLAUDE.md');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    write(instructionPath, 'Updated global instructions\n');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    const agentsContent = readFileSync(join(repoPath, 'AGENTS.md'), 'utf8');
    expect(agentsContent).toContain('Updated global instructions');
    expect(agentsContent).not.toContain('Global instructions\n\n# Agents');
    expect(agentsContent.match(/<!-- ccconfigs-codex:start -->/g)?.length).toBe(1);
  });

  test('removes managed artifacts when no plugins are selected', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    const cleanup = syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
    });

    expect(cleanup.upToDate).toBe(false);
    expect(existsSync(join(repoPath, 'AGENTS.md'))).toBe(false);
    expect(existsSync(join(repoPath, '.codex', 'skills', 'debugging'))).toBe(false);
    expect(existsSync(join(repoPath, 'config.toml'))).toBe(false);

    const statePath = join(repoPath, '.codex', '.ccconfigs-codex-state.json');
    expect(existsSync(statePath)).toBe(false);
  });

  test('adds OTel config when observability is enabled', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');
    const observability = resolveObservabilityProfile().codex;

    const result = syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
      observability,
    });

    expect(result.generated.otel).toBe(true);

    const configToml = readFileSync(join(repoPath, 'config.toml'), 'utf8');
    expect(configToml).toContain('[otel]');
    expect(configToml).toContain('environment = "dev"');
    expect(configToml).toContain('log_user_prompt = false');
    expect(configToml).toContain('${OTEL_EXPORTER_OTLP_ENDPOINT}');
    expect(configToml).not.toContain('${OTEL_EXPORTER_OTLP_HEADERS}');

    const statePath = join(repoPath, '.codex', '.ccconfigs-codex-state.json');
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    expect(state.generated.otel).toBe(true);
  });

  test('writes none signal exporters without endpoint tables', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');
    const observability = resolveObservabilityProfile().codex;

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
      observability: {
        ...observability,
        metricsExporter: 'none',
      },
    });

    const configToml = readFileSync(join(repoPath, 'config.toml'), 'utf8');
    expect(configToml).toContain('metrics_exporter = "none"');
    expect(configToml).not.toContain('[otel.metrics_exporter.none]');
  });

  test('removes OTel config when observability is disabled', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');
    const observability = resolveObservabilityProfile().codex;

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
      observability,
    });

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
      observability: {
        ...observability,
        enabled: false,
      },
    });

    expect(existsSync(join(repoPath, 'config.toml'))).toBe(false);

    const statePath = join(repoPath, '.codex', '.ccconfigs-codex-state.json');
    expect(existsSync(statePath)).toBe(false);
  });

  test('preserves unmanaged config keys during sync', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');

    write(
      join(repoPath, 'AGENTS.md'),
      'Repo-specific instructions\n'
    );

    write(
      join(repoPath, 'config.toml'),
      [
        '# Custom config',
        '[model]',
        'provider = "openai"',
      ].join('\n') + '\n'
    );

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    const configToml = readFileSync(join(repoPath, 'config.toml'), 'utf8');
    expect(configToml).toContain('[model]');
    expect(configToml).toContain('provider = "openai"');
    expect(configToml).toContain('[mcp_servers.context7]');

    const agentsContent = readFileSync(join(repoPath, 'AGENTS.md'), 'utf8');
    expect(agentsContent).toContain('Repo-specific instructions');
    expect(agentsContent).toContain('<!-- ccconfigs-codex:start -->');
    expect(agentsContent).toContain('Global instructions');
  });

  test('preserves unmanaged config and AGENTS.md content during cleanup', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');

    write(join(repoPath, 'AGENTS.md'), 'Repo-specific instructions\n');
    write(join(repoPath, 'config.toml'), '[model]\nprovider = "openai"\n');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
    });

    const configToml = readFileSync(join(repoPath, 'config.toml'), 'utf8');
    expect(configToml).toContain('[model]');
    expect(configToml).not.toContain('[mcp_servers.context7]');

    const agentsContent = readFileSync(join(repoPath, 'AGENTS.md'), 'utf8');
    expect(agentsContent).toBe('Repo-specific instructions\n');
  });

  test('fails fast instead of duplicating unmanaged MCP or OTel TOML sections', () => {
    const sourceRoot = createFixtureSourceRoot();
    const mcpRepoPath = createTempPath('ccconfigs-codex-repo-');
    const otelRepoPath = createTempPath('ccconfigs-codex-repo-');
    const observability = resolveObservabilityProfile().codex;

    write(join(mcpRepoPath, 'config.toml'), "[mcp_servers.'context7']\ntype = \"sse\"\n");
    write(join(otelRepoPath, 'config.toml'), '[otel]\nenvironment = "prod"\n');

    expect(() => syncPluginPacks({
      sourceRoot,
      repoPath: mcpRepoPath,
      plugins: ['essentials'],
    })).toThrow('Cannot manage Codex MCP server context7');
    expect(existsSync(join(mcpRepoPath, '.codex'))).toBe(false);
    expect(existsSync(join(mcpRepoPath, 'AGENTS.md'))).toBe(false);

    expect(() => syncPluginPacks({
      sourceRoot,
      repoPath: otelRepoPath,
      plugins: [],
      observability,
    })).toThrow('Cannot manage Codex OTel config');
    expect(existsSync(join(otelRepoPath, '.codex'))).toBe(false);
  });

  test('refuses to delete replaced managed skill paths during cleanup', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');
    const skillPath = join(repoPath, '.codex', 'skills', 'debugging');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    rmSync(skillPath, { recursive: true, force: true });
    write(skillPath, 'user-owned skill content\n');

    expect(() => syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
    })).toThrow('path is no longer a symlink');

    expect(readFileSync(skillPath, 'utf8')).toBe('user-owned skill content\n');
  });

  test('refuses to delete replaced dangling managed skill symlinks during cleanup', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-codex-repo-');
    const skillPath = join(repoPath, '.codex', 'skills', 'debugging');

    syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: ['essentials'],
    });

    rmSync(skillPath, { recursive: true, force: true });
    symlinkSync(join(repoPath, 'missing-skill'), skillPath, 'junction');

    expect(() => syncPluginPacks({
      sourceRoot,
      repoPath,
      plugins: [],
    })).toThrow('symlink target changed');

    expect(lstatSync(skillPath).isSymbolicLink()).toBe(true);
  });
});
