// ABOUTME: Unit tests for shared ccconfigs profile and observability resolution.
// ABOUTME: Verifies defaults, machine overrides, and secret-safe environment variable handling.

import { describe, expect, test } from 'bun:test';

import { resolveObservabilityProfile } from './ccconfigs-profile';

describe('resolveObservabilityProfile', () => {
  test('returns enabled OpenCode and Codex observability defaults', () => {
    const resolved = resolveObservabilityProfile();

    expect(resolved.enabled).toBe(true);
    expect(resolved.environment).toBe('dev');
    expect(resolved.serviceNamespace).toBe('ccconfigs');
    expect(resolved.opencode.enabled).toBe(true);
    expect(resolved.opencode.plugin).toBe('@devtheops/opencode-plugin-otel');
    expect(resolved.opencode.enableTelemetryEnv).toBe('OPENCODE_ENABLE_TELEMETRY');
    expect(resolved.codex.enabled).toBe(true);
    expect(resolved.codex.exporter).toBe('otlp-http');
    expect(resolved.codex.logUserPrompt).toBe(false);
  });

  test('applies machine-specific observability overrides after global settings', () => {
    const resolved = resolveObservabilityProfile(
      {
        observability: {
          enabled: true,
          environment: 'prod',
          opencode: {
            protocol: 'http/protobuf',
          },
        },
        machines: {
          laptop: {
            observability: {
              enabled: false,
              environment: 'dev',
            },
          },
        },
      },
      'laptop'
    );

    expect(resolved.enabled).toBe(false);
    expect(resolved.environment).toBe('dev');
    expect(resolved.opencode.enabled).toBe(false);
    expect(resolved.opencode.protocol).toBe('http/protobuf');
    expect(resolved.codex.enabled).toBe(false);
  });

  test('supports disabling one target without disabling the other target', () => {
    const resolved = resolveObservabilityProfile({
      observability: {
        enabled: true,
        targets: {
          opencode: { enabled: true },
          codex: { enabled: false },
        },
      },
    });

    expect(resolved.enabled).toBe(true);
    expect(resolved.opencode.enabled).toBe(true);
    expect(resolved.codex.enabled).toBe(false);
  });

  test('preserves global target disables when machine override changes another field', () => {
    const resolved = resolveObservabilityProfile(
      {
        observability: {
          enabled: true,
          targets: {
            codex: { enabled: false },
          },
        },
        machines: {
          laptop: {
            observability: {
              environment: 'dev',
            },
          },
        },
      },
      'laptop'
    );

    expect(resolved.enabled).toBe(true);
    expect(resolved.opencode.enabled).toBe(true);
    expect(resolved.codex.enabled).toBe(false);
  });

  test('keeps only secret environment variable names in resolved settings', () => {
    const resolved = resolveObservabilityProfile({
      observability: {
        opencode: {
          headersEnv: 'OPENCODE_OTLP_HEADERS',
          headers: 'secret-token',
        },
        codex: {
          headersEnv: 'OTEL_EXPORTER_OTLP_HEADERS',
          headers: 'another-secret',
        },
      },
    } as never);

    const serialized = JSON.stringify(resolved);

    expect(serialized).toContain('OPENCODE_OTLP_HEADERS');
    expect(serialized).toContain('OTEL_EXPORTER_OTLP_HEADERS');
    expect(serialized).not.toContain('secret-token');
    expect(serialized).not.toContain('another-secret');
  });
});
