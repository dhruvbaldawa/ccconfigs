// ABOUTME: Shared adapter logic for translating Claude plugin assets to OpenCode-compatible formats.
// ABOUTME: Includes markdown/frontmatter normalization, JSONC parsing, and MCP schema translation.

export interface ParsedFrontmatter {
  frontmatter: Record<string, string>;
  body: string;
  hasFrontmatter: boolean;
}

export interface AdaptedMarkdown {
  markdown: string;
  frontmatter: Record<string, string>;
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, '\n');
}

function serializeFrontmatterValue(value: string): string {
  if (value === 'true' || value === 'false') {
    return value;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return value;
  }

  if (/^[a-zA-Z0-9_./\-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

export function parseFrontmatter(markdown: string): ParsedFrontmatter {
  const normalized = normalizeNewlines(markdown);

  if (!normalized.startsWith('---\n')) {
    return {
      frontmatter: {},
      body: normalized,
      hasFrontmatter: false,
    };
  }

  const lines = normalized.split('\n');
  let closingIndex = -1;

  for (let index = 1; index < lines.length; index++) {
    if (lines[index].trim() === '---') {
      closingIndex = index;
      break;
    }
  }

  if (closingIndex === -1) {
    return {
      frontmatter: {},
      body: normalized,
      hasFrontmatter: false,
    };
  }

  const frontmatter: Record<string, string> = {};

  for (const line of lines.slice(1, closingIndex)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim());

    if (key) {
      frontmatter[key] = value;
    }
  }

  const body = lines.slice(closingIndex + 1).join('\n');

  return {
    frontmatter,
    body,
    hasFrontmatter: true,
  };
}

export function formatFrontmatter(frontmatter: Record<string, string>): string {
  const entries = Object.entries(frontmatter).filter(([, value]) =>
    value !== undefined && value !== null && value !== ''
  );

  if (entries.length === 0) {
    return '';
  }

  const lines = ['---'];

  for (const [key, value] of entries) {
    lines.push(`${key}: ${serializeFrontmatterValue(value)}`);
  }

  lines.push('---', '');
  return lines.join('\n');
}

export function toOpenCodeModelId(model: string): string {
  if (!model) {
    return model;
  }

  if (model === 'inherit' || model.includes('/')) {
    return model;
  }

  const aliasMap: Record<string, string> = {
    'claude-haiku-4-5': 'anthropic/claude-haiku-4-5',
    'claude-sonnet-4-5': 'anthropic/claude-sonnet-4-5',
    'claude-opus-4-1': 'anthropic/claude-opus-4-1',
  };

  if (aliasMap[model]) {
    return aliasMap[model];
  }

  if (model.startsWith('claude-')) {
    return `anthropic/${model}`;
  }

  return model;
}

const OPEN_CODE_THEME_COLORS = new Set([
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'info',
]);

const AGENT_COLOR_ALIASES: Record<string, string> = {
  red: 'error',
  yellow: 'warning',
  orange: 'warning',
  amber: 'warning',
  blue: 'info',
  cyan: 'info',
  teal: 'info',
  green: 'success',
  lime: 'success',
  purple: 'accent',
  pink: 'accent',
  magenta: 'accent',
  gray: 'secondary',
  grey: 'secondary',
};

function isValidHexColor(color: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
}

export function normalizeAgentColor(color: string): string | null {
  const normalized = color.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (isValidHexColor(normalized)) {
    return normalized;
  }

  if (OPEN_CODE_THEME_COLORS.has(normalized)) {
    return normalized;
  }

  return AGENT_COLOR_ALIASES[normalized] || null;
}

export function normalizeCommandTemplate(template: string): string {
  return template
    .replace(/\$\{\{\{ARGS\}\}\}/g, '$ARGUMENTS')
    .replace(/\$ARGS\b/g, '$ARGUMENTS');
}

export function adaptCommandMarkdown(
  markdown: string,
  fallbackDescription: string
): AdaptedMarkdown {
  const parsed = parseFrontmatter(markdown);
  const outputFrontmatter: Record<string, string> = {
    description: parsed.frontmatter.description || fallbackDescription,
  };

  if (parsed.frontmatter.agent) {
    outputFrontmatter.agent = parsed.frontmatter.agent;
  }

  if (parsed.frontmatter.model) {
    outputFrontmatter.model = toOpenCodeModelId(parsed.frontmatter.model);
  }

  if (parsed.frontmatter.subtask) {
    outputFrontmatter.subtask = parsed.frontmatter.subtask;
  }

  const templateBody = normalizeCommandTemplate(parsed.body).replace(/^\n+/, '');
  const suffix = templateBody.endsWith('\n') ? '' : '\n';

  return {
    frontmatter: outputFrontmatter,
    markdown: `${formatFrontmatter(outputFrontmatter)}${templateBody}${suffix}`,
  };
}

export function adaptAgentMarkdown(
  markdown: string,
  fallbackDescription: string
): AdaptedMarkdown {
  const parsed = parseFrontmatter(markdown);
  const outputFrontmatter: Record<string, string> = {
    description: parsed.frontmatter.description || fallbackDescription,
    mode: parsed.frontmatter.mode || 'subagent',
  };

  if (parsed.frontmatter.model) {
    outputFrontmatter.model = toOpenCodeModelId(parsed.frontmatter.model);
  }

  if (parsed.frontmatter.color) {
    const color = normalizeAgentColor(parsed.frontmatter.color);
    if (color) {
      outputFrontmatter.color = color;
    }
  }

  if (parsed.frontmatter.temperature) {
    outputFrontmatter.temperature = parsed.frontmatter.temperature;
  }

  if (parsed.frontmatter.hidden) {
    outputFrontmatter.hidden = parsed.frontmatter.hidden;
  }

  const body = parsed.body.replace(/^\n+/, '');
  const suffix = body.endsWith('\n') ? '' : '\n';

  return {
    frontmatter: outputFrontmatter,
    markdown: `${formatFrontmatter(outputFrontmatter)}${body}${suffix}`,
  };
}

export function convertClaudeEnvSyntax(value: string): string {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, '{env:$1}');
}

function transformStringValues(input: unknown): unknown {
  if (typeof input === 'string') {
    return convertClaudeEnvSyntax(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => transformStringValues(item));
  }

  if (input && typeof input === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      result[key] = transformStringValues(value);
    }

    return result;
  }

  return input;
}

export function adaptClaudeMcpConfig(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const root = input as Record<string, unknown>;
  const candidate = root.mcpServers;

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return {};
  }

  const output: Record<string, unknown> = {};

  for (const [serverName, serverConfig] of Object.entries(candidate)) {
    if (!serverConfig || typeof serverConfig !== 'object' || Array.isArray(serverConfig)) {
      continue;
    }

    const transformed = transformStringValues(serverConfig) as Record<string, unknown>;
    const type = transformed.type;

    if (typeof type === 'string') {
      if (type === 'sse') {
        transformed.type = 'remote';
      } else if (type === 'stdio') {
        transformed.type = 'local';
      }
    }

    output[serverName] = transformed;
  }

  return output;
}

function stripJsonComments(input: string): string {
  let output = '';
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    const next = input[index + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        output += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        index++;
      } else if (char === '\n') {
        output += char;
      }
      continue;
    }

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      index++;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      index++;
      continue;
    }

    output += char;
  }

  return output;
}

function stripTrailingCommas(input: string): string {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === ',') {
      let lookahead = index + 1;

      while (lookahead < input.length && /\s/.test(input[lookahead])) {
        lookahead++;
      }

      if (lookahead < input.length && (input[lookahead] === '}' || input[lookahead] === ']')) {
        continue;
      }
    }

    output += char;
  }

  return output;
}

export function parseJsonc<T>(raw: string): T {
  const normalized = normalizeNewlines(raw).trim();
  if (!normalized) {
    return {} as T;
  }

  const withoutComments = stripJsonComments(normalized);
  const withoutTrailingCommas = stripTrailingCommas(withoutComments);
  return JSON.parse(withoutTrailingCommas) as T;
}
