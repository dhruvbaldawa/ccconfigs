// ABOUTME: Tests the unified ccconfigs CLI dispatcher across OpenCode and Codex targets.
// ABOUTME: Verifies list/check/sync behavior, profile resolution, and observability wiring.

import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { parseCliArgs, runCcconfigsCli } from './ccconfigs';

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
  const sourceRoot = createTempPath('ccconfigs-cli-source-');

  write(
    join(sourceRoot, 'opencode', 'packs.json'),
    JSON.stringify(
      {
        version: 1,
        plugins: {
          essentials: {
            description: 'Core workflows',
            commands: 'essentials/commands',
            agents: 'essentials/agents',
            skills: 'essentials/skills',
            mcp: 'essentials/.mcp.json',
            instructions: ['config/CLAUDE.md'],
          },
          writing: {
            description: 'Writing workflows',
            commands: 'writing/commands',
            instructions: ['config/CLAUDE.md'],
          },
        },
      },
      null,
      2
    ) + '\n'
  );

  write(join(sourceRoot, 'config', 'CLAUDE.md'), 'Global instructions\n');
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
      'model: sonnet',
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
          },
        },
      },
      null,
      2
    ) + '\n'
  );
  write(join(sourceRoot, 'writing', 'commands', 'draft.md'), '# Draft\n');

  return sourceRoot;
}

afterEach(() => {
  for (const path of tempPaths.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe('parseCliArgs', () => {
  test('parses command and target flags', () => {
    const args = parseCliArgs([
      'sync',
      '--target',
      'codex',
      '--plugins',
      'essentials,writing',
      '--no-observability',
    ]);

    expect(args.command).toBe('sync');
    expect(args.target).toBe('codex');
    expect(args.plugins).toBe('essentials,writing');
    expect(args.noObservability).toBe(true);
  });
});

describe('runCcconfigsCli', () => {
  test('lists plugin packs from the registry', () => {
    const sourceRoot = createFixtureSourceRoot();

    const result = runCcconfigsCli(['list', '--source-root', sourceRoot]);

    expect(result.exitCode).toBe(0);
    expect(result.output.join('\n')).toContain('- essentials: Core workflows');
    expect(result.output.join('\n')).toContain('- writing: Writing workflows');
  });

  test('check exits non-zero without writing pending changes', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-cli-repo-');

    const result = runCcconfigsCli([
      'check',
      '--target',
      'codex',
      '--plugins',
      'essentials',
      '--path',
      repoPath,
      '--source-root',
      sourceRoot,
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.output.join('\n')).toContain('Target: codex');
    expect(existsSync(join(repoPath, 'config.toml'))).toBe(false);
    expect(existsSync(join(repoPath, '.codex'))).toBe(false);
    expect(existsSync(join(repoPath, 'AGENTS.md'))).toBe(false);
  });

  test('syncs OpenCode and Codex targets with observability defaults', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-cli-repo-');

    const result = runCcconfigsCli([
      'sync',
      '--target',
      'all',
      '--plugins',
      'essentials',
      '--scope',
      'repo',
      '--path',
      repoPath,
      '--source-root',
      sourceRoot,
    ]);

    expect(result.exitCode).toBe(0);

    const opencodeConfig = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(opencodeConfig.plugin).toContain('@devtheops/opencode-plugin-otel');
    expect(opencodeConfig.mcp.context7.type).toBe('remote');

    const codexConfig = readFileSync(join(repoPath, 'config.toml'), 'utf8');
    expect(codexConfig).toContain('[otel]');
    expect(codexConfig).toContain('environment = "dev"');
    expect(codexConfig).toContain('[mcp_servers.context7]');

    expect(readFileSync(join(repoPath, '.opencode', 'commands', 'plan.md'), 'utf8')).toContain('$ARGUMENTS');
    expect(readFileSync(join(repoPath, 'AGENTS.md'), 'utf8')).toContain('Global instructions');
  });

  test('uses machine profile for Codex observability environment', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-cli-repo-');

    write(
      join(sourceRoot, 'ccconfigs.jsonc'),
      JSON.stringify(
        {
          observability: {
            environment: 'prod',
          },
          machines: {
            laptop: {
              observability: {
                environment: 'local-dev',
              },
            },
          },
        },
        null,
        2
      ) + '\n'
    );

    const result = runCcconfigsCli([
      'sync',
      '--target',
      'codex',
      '--plugins',
      'essentials',
      '--path',
      repoPath,
      '--source-root',
      sourceRoot,
      '--machine',
      'laptop',
    ]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(repoPath, 'config.toml'), 'utf8')).toContain('environment = "local-dev"');
  });

  test('explicitly disables managed observability with --no-observability', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-cli-repo-');

    const result = runCcconfigsCli([
      'sync',
      '--target',
      'codex',
      '--plugins',
      'essentials',
      '--path',
      repoPath,
      '--source-root',
      sourceRoot,
      '--no-observability',
    ]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(repoPath, 'config.toml'), 'utf8')).not.toContain('[otel]');
  });

  test('explicitly disables managed OpenCode observability with --no-observability', () => {
    const sourceRoot = createFixtureSourceRoot();
    const repoPath = createTempPath('ccconfigs-cli-repo-');

    const result = runCcconfigsCli([
      'sync',
      '--target',
      'opencode',
      '--plugins',
      'essentials',
      '--scope',
      'repo',
      '--path',
      repoPath,
      '--source-root',
      sourceRoot,
      '--no-observability',
    ]);

    expect(result.exitCode).toBe(0);

    const config = JSON.parse(readFileSync(join(repoPath, 'opencode.json'), 'utf8'));
    expect(config.plugin).toBeUndefined();
  });
});
