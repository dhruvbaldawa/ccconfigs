// ABOUTME: Unit tests for OpenCode adapter utilities that transform Claude plugin assets.
// ABOUTME: Validates placeholder conversion, frontmatter adaptation, JSONC parsing, and MCP translation.

import { describe, expect, test } from 'bun:test';

import {
  adaptAgentMarkdown,
  adaptClaudeMcpConfig,
  adaptCommandMarkdown,
  convertClaudeEnvSyntax,
  normalizeAgentColor,
  parseFrontmatter,
  parseJsonc,
} from './opencode-adapter-core';

describe('parseFrontmatter', () => {
  test('extracts simple frontmatter fields', () => {
    const source = [
      '---',
      'description: Example command',
      'model: claude-haiku-4-5',
      '---',
      '',
      'Body content',
    ].join('\n');

    const parsed = parseFrontmatter(source);

    expect(parsed.hasFrontmatter).toBe(true);
    expect(parsed.frontmatter.description).toBe('Example command');
    expect(parsed.frontmatter.model).toBe('claude-haiku-4-5');
    expect(parsed.body.trim()).toBe('Body content');
  });
});

describe('adaptCommandMarkdown', () => {
  test('keeps description and converts Claude args placeholders', () => {
    const source = [
      '---',
      'description: Plan implementation',
      '---',
      '',
      'Task: $ARGS',
      'Context: "${{{ARGS}}}"',
    ].join('\n');

    const adapted = adaptCommandMarkdown(source, 'fallback');

    expect(adapted.frontmatter.description).toBe('Plan implementation');
    expect(adapted.markdown).toContain('Task: $ARGUMENTS');
    expect(adapted.markdown).toContain('Context: "$ARGUMENTS"');
    expect(adapted.markdown).not.toContain('$ARGS');
  });
});

describe('adaptAgentMarkdown', () => {
  test('forces subagent mode and normalizes anthropic model IDs', () => {
    const source = [
      '---',
      'name: research-breadth',
      'description: Broad survey agent',
      'model: claude-haiku-4-5',
      'color: blue',
      '---',
      '',
      'You are a specialist.',
    ].join('\n');

    const adapted = adaptAgentMarkdown(source, 'fallback');

    expect(adapted.frontmatter.mode).toBe('subagent');
    expect(adapted.frontmatter.model).toBe('anthropic/claude-haiku-4-5');
    expect(adapted.frontmatter.color).toBe('info');
    expect(adapted.markdown).toContain('mode: subagent');
    expect(adapted.markdown).toContain('color: info');
  });

  test('drops invalid color values to avoid OpenCode config errors', () => {
    const source = [
      '---',
      'description: Generic reviewer',
      'color: bright-red-neon',
      '---',
      '',
      'Review code carefully.',
    ].join('\n');

    const adapted = adaptAgentMarkdown(source, 'fallback');

    expect(adapted.frontmatter.color).toBeUndefined();
    expect(adapted.markdown).not.toContain('color: bright-red-neon');
  });
});

describe('normalizeAgentColor', () => {
  test('maps claude-style named colors to OpenCode theme colors', () => {
    expect(normalizeAgentColor('red')).toBe('error');
    expect(normalizeAgentColor('yellow')).toBe('warning');
    expect(normalizeAgentColor('blue')).toBe('info');
  });

  test('returns null for unsupported color names', () => {
    expect(normalizeAgentColor('ultraviolet')).toBeNull();
  });
});

describe('convertClaudeEnvSyntax', () => {
  test('rewrites Claude env syntax to OpenCode env syntax', () => {
    const converted = convertClaudeEnvSyntax('${MCP_PROXY_HOST}/servers/context7/sse');
    expect(converted).toBe('{env:MCP_PROXY_HOST}/servers/context7/sse');
  });
});

describe('adaptClaudeMcpConfig', () => {
  test('converts claude mcpServers format to opencode mcp format', () => {
    const source = {
      mcpServers: {
        context7: {
          type: 'sse',
          url: '${MCP_PROXY_HOST}/servers/context7/sse',
          headers: {
            Authorization: 'Basic ${MCP_PROXY_AUTH}',
          },
        },
      },
    };

    const adapted = adaptClaudeMcpConfig(source);
    const context7 = adapted.context7 as Record<string, unknown>;

    expect(context7.type).toBe('remote');
    expect(context7.url).toBe('{env:MCP_PROXY_HOST}/servers/context7/sse');

    const headers = context7.headers as Record<string, unknown>;
    expect(headers.Authorization).toBe('Basic {env:MCP_PROXY_AUTH}');
  });
});

describe('parseJsonc', () => {
  test('parses json with comments and trailing commas', () => {
    const source = [
      '{',
      '  // comment',
      '  "theme": "opencode",',
      '  "mcp": {',
      '    "context7": {',
      '      "type": "remote",',
      '    },',
      '  },',
      '}',
    ].join('\n');

    const parsed = parseJsonc<{ theme: string; mcp: Record<string, unknown> }>(source);

    expect(parsed.theme).toBe('opencode');
    expect(parsed.mcp.context7).toBeDefined();
  });
});
