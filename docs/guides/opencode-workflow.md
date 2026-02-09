# OpenCode Workflow Guide

Guide for reusing this repository's Claude assets in OpenCode with minimal duplication.

## Goals

- Keep Claude assets as the single source of truth (`config/`, `essentials/`, `writing/`, `experimental/`)
- Select which plugin packs are enabled globally vs per repository
- Avoid manual copying by generating OpenCode adapters and symlinking skills

## How It Works

The OpenCode manager uses three components:

1. `opencode/packs.json` defines plugin packs and their source paths
2. `scripts/opencode-sync.ts` syncs selected packs into OpenCode config locations
3. `scripts/manage-opencode.ts` provides interactive and CLI control

### Generated/Managed Outputs

For each scope, sync manages:

- `commands/` markdown adapters (from Claude slash commands)
- `agents/` markdown adapters (from Claude subagents)
- `skills/` symlinks (no content duplication)
- `opencode.json` managed keys (`mcp`, `instructions`) while preserving unmanaged keys

## Scopes

- **Global scope**: `~/.config/opencode/`
- **Repository scope**: `<repo>/opencode.json` and `<repo>/.opencode/`

OpenCode merges global and local config, so a practical pattern is:

- Keep global baseline small (for example, `essentials`)
- Enable additional packs locally per repo (`writing`, `experimental`)

## Commands

### Interactive (recommended)

```bash
bun scripts/manage-opencode.ts
```

Prompts for scope and plugin pack selection.

### Set exact plugin list for a scope

```bash
# Global
bun scripts/manage-opencode.ts --scope global --set essentials

# Repo-local (current directory)
bun scripts/manage-opencode.ts --scope repo --set writing,experimental

# Repo-local (explicit path)
bun scripts/manage-opencode.ts --scope repo --path ~/Code/myrepo --set essentials,experimental
```

### Incremental changes

```bash
bun scripts/manage-opencode.ts --scope repo --enable writing
bun scripts/manage-opencode.ts --scope repo --disable experimental
```

### Preview and drift checks

```bash
# Preview without writing
bun scripts/manage-opencode.ts --scope repo --set essentials --dry-run

# CI-style check (exit 1 if changes are needed)
bun scripts/manage-opencode.ts --scope repo --set essentials --check
```

### List available packs

```bash
bun scripts/manage-opencode.ts --list
```

## Notes

- MCP config is translated from Claude format (`mcpServers`) to OpenCode format (`mcp`)
- Claude env placeholders (`${VAR}`) are translated to OpenCode placeholders (`{env:VAR}`)
- Command templates convert Claude argument placeholder `$ARGS` to OpenCode `$ARGUMENTS`
- Agent color aliases are normalized to OpenCode-safe values (for example, `red` -> `error`)
- If a managed command/agent/skill name conflicts with an existing unmanaged artifact, sync fails fast instead of overwriting
