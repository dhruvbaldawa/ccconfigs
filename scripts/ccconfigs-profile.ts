// ABOUTME: Resolves shared ccconfigs profile settings before target-specific config generation.
// ABOUTME: Keeps observability defaults and machine overrides pure so sync IO stays isolated.

export type TargetName = 'opencode' | 'codex';

export type OpenCodeOtelProtocol = 'grpc' | 'http/protobuf';

export type CodexOtelExporter = 'none' | 'otlp-http' | 'otlp-grpc';

export type CodexOtelHttpProtocol = 'binary' | 'json';

export interface OpenCodeObservabilityProfile {
  enabled?: boolean;
  plugin?: string;
  endpointEnv?: string;
  protocolEnv?: string;
  headersEnv?: string;
  resourceAttributesEnv?: string;
  enableTelemetryEnv?: string;
  metricPrefix?: string;
  protocol?: OpenCodeOtelProtocol;
  disabledMetrics?: string[];
  disabledTraces?: string[];
}

export interface CodexObservabilityProfile {
  enabled?: boolean;
  exporter?: CodexOtelExporter;
  traceExporter?: CodexOtelExporter;
  metricsExporter?: CodexOtelExporter;
  endpointEnv?: string;
  headersEnv?: string;
  httpProtocol?: CodexOtelHttpProtocol;
  logUserPrompt?: boolean;
}

export interface ObservabilityProfile {
  enabled?: boolean;
  environment?: string;
  serviceNamespace?: string;
  targets?: Partial<Record<TargetName, { enabled?: boolean }>>;
  opencode?: OpenCodeObservabilityProfile;
  codex?: CodexObservabilityProfile;
}

export interface MachineProfile {
  observability?: ObservabilityProfile;
}

export interface CcconfigsProfile {
  observability?: ObservabilityProfile;
  machines?: Record<string, MachineProfile>;
}

export interface ResolvedOpenCodeObservability {
  enabled: boolean;
  plugin: string;
  endpointEnv: string;
  protocolEnv: string;
  headersEnv: string;
  resourceAttributesEnv: string;
  enableTelemetryEnv: string;
  metricPrefix: string;
  protocol: OpenCodeOtelProtocol;
  disabledMetrics: string[];
  disabledTraces: string[];
}

export interface ResolvedCodexObservability {
  enabled: boolean;
  exporter: CodexOtelExporter;
  traceExporter: CodexOtelExporter;
  metricsExporter: CodexOtelExporter;
  endpointEnv: string;
  headersEnv: string;
  httpProtocol: CodexOtelHttpProtocol;
  logUserPrompt: boolean;
}

export interface ResolvedObservability {
  enabled: boolean;
  environment: string;
  serviceNamespace: string;
  opencode: ResolvedOpenCodeObservability;
  codex: ResolvedCodexObservability;
}

const DEFAULT_OPENCODE_PLUGIN = '/home/dhruv/Code/opencode-otel-usage-plugin/dist/index.js';

const DEFAULT_OBSERVABILITY: ResolvedObservability = {
  enabled: true,
  environment: 'dev',
  serviceNamespace: 'ccconfigs',
  opencode: {
    enabled: true,
    plugin: DEFAULT_OPENCODE_PLUGIN,
    endpointEnv: 'OPENCODE_OTLP_ENDPOINT',
    protocolEnv: 'OPENCODE_OTLP_PROTOCOL',
    headersEnv: 'OPENCODE_OTLP_HEADERS',
    resourceAttributesEnv: 'OPENCODE_RESOURCE_ATTRIBUTES',
    enableTelemetryEnv: 'OPENCODE_ENABLE_TELEMETRY',
    metricPrefix: 'opencode.',
    protocol: 'grpc',
    disabledMetrics: [],
    disabledTraces: [],
  },
  codex: {
    enabled: true,
    exporter: 'otlp-http',
    traceExporter: 'otlp-http',
    metricsExporter: 'otlp-http',
    endpointEnv: 'OTEL_EXPORTER_OTLP_ENDPOINT',
    headersEnv: 'OTEL_EXPORTER_OTLP_HEADERS',
    httpProtocol: 'binary',
    logUserPrompt: false,
  },
};

function pickString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function pickStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function pickOpenCodeProtocol(value: unknown, fallback: OpenCodeOtelProtocol): OpenCodeOtelProtocol {
  return value === 'grpc' || value === 'http/protobuf' ? value : fallback;
}

function pickCodexExporter(value: unknown, fallback: CodexOtelExporter): CodexOtelExporter {
  return value === 'none' || value === 'otlp-http' || value === 'otlp-grpc' ? value : fallback;
}

function pickCodexHttpProtocol(value: unknown, fallback: CodexOtelHttpProtocol): CodexOtelHttpProtocol {
  return value === 'binary' || value === 'json' ? value : fallback;
}

function resolveOpenCodeObservability(
  profile: OpenCodeObservabilityProfile | undefined,
  base: ResolvedOpenCodeObservability
): ResolvedOpenCodeObservability {
  return {
    enabled: pickBoolean(profile?.enabled, base.enabled),
    plugin: pickString(profile?.plugin, base.plugin),
    endpointEnv: pickString(profile?.endpointEnv, base.endpointEnv),
    protocolEnv: pickString(profile?.protocolEnv, base.protocolEnv),
    headersEnv: pickString(profile?.headersEnv, base.headersEnv),
    resourceAttributesEnv: pickString(profile?.resourceAttributesEnv, base.resourceAttributesEnv),
    enableTelemetryEnv: pickString(profile?.enableTelemetryEnv, base.enableTelemetryEnv),
    metricPrefix: pickString(profile?.metricPrefix, base.metricPrefix),
    protocol: pickOpenCodeProtocol(profile?.protocol, base.protocol),
    disabledMetrics: pickStringArray(profile?.disabledMetrics, base.disabledMetrics),
    disabledTraces: pickStringArray(profile?.disabledTraces, base.disabledTraces),
  };
}

function resolveCodexObservability(
  profile: CodexObservabilityProfile | undefined,
  base: ResolvedCodexObservability
): ResolvedCodexObservability {
  return {
    enabled: pickBoolean(profile?.enabled, base.enabled),
    exporter: pickCodexExporter(profile?.exporter, base.exporter),
    traceExporter: pickCodexExporter(profile?.traceExporter, base.traceExporter),
    metricsExporter: pickCodexExporter(profile?.metricsExporter, base.metricsExporter),
    endpointEnv: pickString(profile?.endpointEnv, base.endpointEnv),
    headersEnv: pickString(profile?.headersEnv, base.headersEnv),
    httpProtocol: pickCodexHttpProtocol(profile?.httpProtocol, base.httpProtocol),
    logUserPrompt: pickBoolean(profile?.logUserPrompt, base.logUserPrompt),
  };
}

function applyObservabilityProfile(
  base: ResolvedObservability,
  profile: ObservabilityProfile | undefined
): ResolvedObservability {
  if (!profile) {
    return {
      ...base,
      opencode: { ...base.opencode, disabledMetrics: [...base.opencode.disabledMetrics], disabledTraces: [...base.opencode.disabledTraces] },
      codex: { ...base.codex },
    };
  }

  const enabled = pickBoolean(profile.enabled, base.enabled);
  const targetFallback = typeof profile.enabled === 'boolean' ? enabled : undefined;
  const opencodeTargetEnabled = pickBoolean(
    profile.targets?.opencode?.enabled,
    targetFallback ?? base.opencode.enabled
  );
  const codexTargetEnabled = pickBoolean(
    profile.targets?.codex?.enabled,
    targetFallback ?? base.codex.enabled
  );

  return {
    enabled,
    environment: pickString(profile.environment, base.environment),
    serviceNamespace: pickString(profile.serviceNamespace, base.serviceNamespace),
    opencode: {
      ...resolveOpenCodeObservability(profile.opencode, base.opencode),
      enabled: pickBoolean(profile.opencode?.enabled, opencodeTargetEnabled),
    },
    codex: {
      ...resolveCodexObservability(profile.codex, base.codex),
      enabled: pickBoolean(profile.codex?.enabled, codexTargetEnabled),
    },
  };
}

export function resolveObservabilityProfile(
  profile: CcconfigsProfile = {},
  machineName?: string
): ResolvedObservability {
  const globalResolved = applyObservabilityProfile(DEFAULT_OBSERVABILITY, profile.observability);
  const machineProfile = machineName ? profile.machines?.[machineName]?.observability : undefined;
  return applyObservabilityProfile(globalResolved, machineProfile);
}
