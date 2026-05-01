<!-- ABOUTME: Describes how ccconfigs syncs canonical Claude assets into OpenCode and Codex targets. -->
<!-- ABOUTME: Covers target scopes, commands, observability setup, and operational caveats. -->

# OpenCode And Codex Target Sync Guide

Guide for reusing this repository's canonical Claude assets in OpenCode and Codex.

## Goals

- Keep Claude assets as the single source of truth (`config/`, `essentials/`, `writing`, `experimental`)
- Use one script for OpenCode and Codex setup: `bun scripts/ccconfigs.ts`
- Avoid manual copying by generating target adapters and symlinking skills
- Keep collector tokens and OTLP headers outside the repository

## How It Works

Target sync uses four components:

1. `opencode/packs.json` defines plugin packs and their source paths.
2. `scripts/ccconfigs.ts` provides the unified CLI.
3. `scripts/opencode-sync.ts` generates OpenCode config.
4. `scripts/codex-sync.ts` generates Codex config.

### Generated/Managed Outputs

For OpenCode, sync manages:

- `commands/` markdown adapters (from Claude slash commands)
- `agents/` markdown adapters (from Claude subagents)
- `skills/` symlinks (no content duplication)
- `opencode.json` managed keys (`mcp`, `instructions`, managed OTel plugin entry) while preserving unmanaged keys that do not use selected pack server names

For Codex, sync manages:

- `.codex/config.toml` managed MCP and `[otel]` sections while preserving unrelated TOML sections
- `AGENTS.md` managed ccconfigs block while preserving unmanaged repository instructions
- `.codex/skills/` symlinks (no content duplication)

## Scopes

- **OpenCode global scope**: `~/.config/opencode/`
- **OpenCode repository scope**: `<repo>/opencode.json` and `<repo>/.opencode/`
- **Codex repository scope**: `<repo>/.codex/config.toml`, `<repo>/AGENTS.md`, and `<repo>/.codex/`

OpenCode merges global and local config, so a practical pattern is:

- Keep global baseline small (for example, `essentials`)
- Enable additional packs locally per repo (`writing`, `experimental`)

## Commands

### List Packs

```bash
bun scripts/ccconfigs.ts list
```

### Sync Exact Plugin List

```bash
# OpenCode and Codex in the current repo
bun scripts/ccconfigs.ts sync --target all --plugins essentials,writing

# OpenCode global baseline
bun scripts/ccconfigs.ts sync --target opencode --scope global --plugins essentials

# OpenCode repo-local add-ons
bun scripts/ccconfigs.ts sync --target opencode --scope repo --plugins writing,experimental

# Codex repo-local only
bun scripts/ccconfigs.ts sync --target codex --plugins essentials,experimental
```

### Incremental Changes

```bash
bun scripts/ccconfigs.ts sync --target all --enable writing
bun scripts/ccconfigs.ts sync --target opencode --scope repo --disable experimental
```

Incremental changes read each target's managed state, so OpenCode and Codex can diverge intentionally.

### Preview And Drift Checks

```bash
# Preview without writing
bun scripts/ccconfigs.ts sync --target all --plugins essentials --dry-run

# CI-style check; exits 1 if changes are needed
bun scripts/ccconfigs.ts check --target all --plugins essentials
```

### Doctor

```bash
bun scripts/ccconfigs.ts doctor --target all
```

Doctor loads the source registry/profile and prints the selected machine name, observability status, and resolved target config paths.

## Profiles

`ccconfigs.ts` reads `<source-root>/ccconfigs.jsonc` when present, or a file supplied with `--profile`.

```jsonc
{
  "observability": {
    "environment": "dev",
    "targets": {
      "opencode": { "enabled": true },
      "codex": { "enabled": true }
    }
  },
  "machines": {
    "work-laptop": {
      "observability": {
        "environment": "work"
      }
    }
  }
}
```

Use `--machine <name>` to select a machine override. Without it, the CLI uses the host name.

## Observability

Managed observability is enabled by default.

OpenCode:

- Adds `/home/dhruv/Code/opencode-otel-usage-plugin/dist/index.js` to `opencode.json` `plugin`.
- Uses standard OpenTelemetry environment variables.
- Preserves unmanaged plugins.
- Removes only previously managed plugin entries when disabled.
- OpenCode loads the built local plugin file, so rebuild `/home/dhruv/Code/opencode-otel-usage-plugin` after plugin changes.
- Cost policy: positive OpenCode-reported cost wins; otherwise the plugin estimates cost from token counts and its vendored LiteLLM pricing snapshot.
- Unpriced requests emit `opencode.llm.unpriced_requests`; they do not emit zero-valued `opencode.llm.cost` datapoints.

Codex:

- Writes native `[otel]` config to `.codex/config.toml`.
- Emits logs, traces, and metrics to direct OTLP/HTTP endpoints under the configured literal endpoint base.
- Writes only environment placeholders for backend auth; token values stay outside the repo.
- Codex `0.125.0` does not expand env vars in OTel endpoint fields, so endpoints are literal while auth stays env-based.

Expected environment variables:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=https://collector.example
export OTEL_EXPORTER_OTLP_AUTHORIZATION='Bearer ...'
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=${OTEL_EXPORTER_OTLP_AUTHORIZATION}"
```

`OTEL_EXPORTER_OTLP_ENDPOINT` is used by OpenCode. Codex uses the literal endpoint configured in the ccconfigs profile; the default is `https://otel.dhruv.cc`.

Codex generated OTel config uses that endpoint base for per-signal URLs:

```toml
[otel.exporter.otlp-http]
endpoint = "https://otel.dhruv.cc/v1/logs"
protocol = "binary"

[otel.exporter.otlp-http.headers]
Authorization = "${OTEL_EXPORTER_OTLP_AUTHORIZATION}"

[otel.trace_exporter.otlp-http]
endpoint = "https://otel.dhruv.cc/v1/traces"
protocol = "binary"

[otel.trace_exporter.otlp-http.headers]
Authorization = "${OTEL_EXPORTER_OTLP_AUTHORIZATION}"

[otel.metrics_exporter.otlp-http]
endpoint = "https://otel.dhruv.cc/v1/metrics"
protocol = "binary"

[otel.metrics_exporter.otlp-http.headers]
Authorization = "${OTEL_EXPORTER_OTLP_AUTHORIZATION}"
```

Verify OpenCode with a tagged run:

```bash
PROBE_ID=ccconfigs-opencode-$(date +%s)
OTEL_RESOURCE_ATTRIBUTES="probe.id=$PROBE_ID,probe.source=opencode" \
  opencode run --model openai/gpt-5.5 'Use the bash tool to run exactly: sleep 4. After it finishes, reply exactly: ok'
```

Verify Codex with a tagged run:

```bash
PROBE_ID=ccconfigs-codex-$(date +%s)
OTEL_RESOURCE_ATTRIBUTES="probe.id=$PROBE_ID,probe.source=codex" \
  codex exec --cd . 'Use the shell to run exactly: sleep 4. After it finishes, reply exactly: ok'
```

Then query the backend for each `probe.id`. This verifies exporter wiring from the client process through the direct OTLP backend.

Use `--no-observability` to disable and remove managed target observability.

## Notes

- OpenCode MCP config is translated from Claude format (`mcpServers`) to OpenCode format (`mcp`).
- OpenCode env placeholders (`${VAR}`) are translated to `{env:VAR}`.
- OpenCode command templates convert Claude argument placeholders (`$ARGS`, `${{{ARGS}}}`, `{{ARGS}}`) to `$ARGUMENTS`.
- Codex MCP config is emitted as `[mcp_servers.<name>]` TOML sections.
- Codex `AGENTS.md` uses a marked managed block so repository-owned instructions remain intact.
- Sync fails fast for unmanaged Codex MCP/OTel sections and skill path conflicts. Existing OpenCode command/agent filenames and MCP server names should be treated as managed output names once a pack is selected.
