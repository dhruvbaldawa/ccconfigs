// ABOUTME: Shared adapter logic for translating Claude plugin assets to Codex-compatible formats.
// ABOUTME: Handles MCP config translation, agent markdown adaptation, and TOML config generation.

import { stringify } from 'smol-toml';

import { parseFrontmatter } from './opencode-adapter-core';

export interface AdaptedCodexAgent {
  name: string;
  description: string;
  model?: string;
  markdown: string;
}

export interface CodexOtelTomlConfig {
  enabled: boolean;
  environment?: string;
  exporter: string;
  traceExporter: string;
  metricsExporter: string;
  endpointEnv: string;
  headersEnv: string;
  httpProtocol: string;
  logUserPrompt: boolean;
}

function buildExporterValue(
  exporter: string,
  endpointEnv: string,
  protocol: string
): string | Record<string, unknown> {
  if (exporter === 'none') {
    return 'none';
  }

  return {
    [exporter]: {
      endpoint: `\${${endpointEnv}}`,
      protocol,
    },
  };
}

export function adaptCodexMcpConfig(input: unknown): Record<string, unknown> {
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

    const transformed: Record<string, unknown> = {};
    const config = serverConfig as Record<string, unknown>;

    if (typeof config.type === 'string') {
      transformed.type = config.type === 'sse' ? 'sse' : config.type === 'stdio' ? 'stdio' : config.type;
    }

    if (typeof config.url === 'string') {
      transformed.url = config.url;
    }

    if (typeof config.command === 'string') {
      transformed.command = config.command;
    }

    if (Array.isArray(config.args)) {
      transformed.args = config.args;
    }

    if (config.headers && typeof config.headers === 'object' && !Array.isArray(config.headers)) {
      transformed.headers = { ...(config.headers as Record<string, unknown>) };
    }

    if (config.env && typeof config.env === 'object' && !Array.isArray(config.env)) {
      transformed.env = { ...(config.env as Record<string, unknown>) };
    }

    output[serverName] = transformed;
  }

  return output;
}

export function buildCodexMcpToml(mcpConfig: Record<string, unknown>): string {
  if (Object.keys(mcpConfig).length === 0) {
    return '';
  }

  return stringify({ mcp_servers: mcpConfig });
}

export function buildCodexOtelToml(
  observability: CodexOtelTomlConfig | undefined
): string {
  if (!observability || !observability.enabled) {
    return '';
  }

  const otel: Record<string, unknown> = {
    environment: observability.environment || 'dev',
    exporter: buildExporterValue(
      observability.exporter,
      observability.endpointEnv,
      observability.httpProtocol
    ),
    log_user_prompt: observability.logUserPrompt,
  };

  if (observability.traceExporter !== observability.exporter) {
    otel.trace_exporter = buildExporterValue(
      observability.traceExporter,
      observability.endpointEnv,
      observability.httpProtocol
    );
  }

  if (observability.metricsExporter !== observability.exporter) {
    otel.metrics_exporter = buildExporterValue(
      observability.metricsExporter,
      observability.endpointEnv,
      observability.httpProtocol
    );
  }

  return stringify({ otel });
}

export function adaptCodexAgentMarkdown(markdown: string, fallbackDescription: string): AdaptedCodexAgent {
  const parsed = parseFrontmatter(markdown);
  const name = parsed.frontmatter.name || 'unnamed';
  const description = parsed.frontmatter.description || fallbackDescription;
  const model = parsed.frontmatter.model;

  return {
    name,
    description,
    model,
    markdown,
  };
}

export function buildCodexAgentsFile(agents: AdaptedCodexAgent[], instructions: string[] = []): string {
  if (agents.length === 0 && instructions.length === 0) {
    return '';
  }

  const sections: string[] = [];

  if (instructions.length > 0) {
    sections.push(['# Instructions', '', ...instructions.map(instruction => instruction.trim())].join('\n'));
  }

  if (agents.length > 0) {
    sections.push('# Agents\n');
  }

  for (const agent of agents) {
    const lines: string[] = [`## ${agent.name}`];
    lines.push('');
    lines.push(`**Description:** ${agent.description}`);

    if (agent.model) {
      lines.push(`**Model:** ${agent.model}`);
    }

    lines.push('');
    sections.push(lines.join('\n'));
  }

  return sections.join('\n');
}
