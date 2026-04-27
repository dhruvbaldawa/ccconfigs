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

- `config.toml` managed MCP and `[otel]` sections while preserving unrelated TOML sections
- `AGENTS.md` managed ccconfigs block while preserving unmanaged repository instructions
- `.codex/skills/` symlinks (no content duplication)

## Scopes

- **OpenCode global scope**: `~/.config/opencode/`
- **OpenCode repository scope**: `<repo>/opencode.json` and `<repo>/.opencode/`
- **Codex repository scope**: `<repo>/config.toml`, `<repo>/AGENTS.md`, and `<repo>/.codex/`

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

- Adds `@devtheops/opencode-plugin-otel` to `opencode.json` `plugin`.
- Preserves unmanaged plugins.
- Removes only previously managed plugin entries when disabled.

Codex:

- Writes native `[otel]` config to `config.toml`.
- Uses environment variable references for the OTLP endpoint.
- Does not store tokens or OTLP header values.

Expected environment variables:

```bash
export OPENCODE_ENABLE_TELEMETRY=1
export OPENCODE_OTLP_ENDPOINT=https://collector.example/v1/traces
export OPENCODE_OTLP_HEADERS='Authorization=Bearer ...'

export OTEL_EXPORTER_OTLP_ENDPOINT=https://collector.example/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS='Authorization=Bearer ...'
```

Use `--no-observability` to disable and remove managed target observability.

## Notes

- OpenCode MCP config is translated from Claude format (`mcpServers`) to OpenCode format (`mcp`).
- OpenCode env placeholders (`${VAR}`) are translated to `{env:VAR}`.
- OpenCode command templates convert Claude argument placeholders (`$ARGS`, `${{{ARGS}}}`, `{{ARGS}}`) to `$ARGUMENTS`.
- Codex MCP config is emitted as `[mcp_servers.<name>]` TOML sections.
- Codex `AGENTS.md` uses a marked managed block so repository-owned instructions remain intact.
- Sync fails fast for unmanaged Codex MCP/OTel sections and skill path conflicts. Existing OpenCode command/agent filenames and MCP server names should be treated as managed output names once a pack is selected.
