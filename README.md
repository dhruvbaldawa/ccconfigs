# ccconfigs

Personal configuration repository for Claude Code - a plugin marketplace containing my essential tools and workflows.

## Overview

This repository provides a structured plugin marketplace for Claude Code, focusing on systematic development practices through MCP server integrations, custom commands, and development skills.

## What's Included

The **essentials** plugin contains four main components:

### MCP Servers

Pre-configured integrations with Model Context Protocol servers:

- **Firecrawl**: Web scraping and content extraction
- **Perplexity**: AI-powered search capabilities
- **Context7**: Library documentation lookup
- **Sequential-thinking**: Structured thinking framework

### Slash Commands

Custom commands for project management and documentation:

- **`/breakdown`**: Creates agile task breakdowns from design documents. Generates structured iteration plans with tasks, validation checklists, and LLM prompts.

- **`/do`**: Executes tasks from spec documents. Supports `--resume` to continue from incomplete tasks and `--auto` for automated commit-and-continue workflow.

- **`/optimize-doc`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness, and can run idempotently across multiple passes.

### Skills

Comprehensive development workflow frameworks:

- **Debugging**: Systematic debugging framework using the UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment, with antipattern avoidance and reference materials on root cause analysis techniques.

- **Technical Planning**: Risk-first development methodology that emphasizes "what" over "how". Four-phase approach covering requirements & risk analysis, milestone planning, implementation strategy, and execution framework.

## Setup

### Global Configuration (Optional)

This repository includes global Claude Code configuration that can be shared across all projects:

```bash
# After cloning, run the setup script to create symlinks
./setup-symlinks.sh
```

This creates symlinks from `~/.claude/` to the `config/` directory in this repository, allowing you to:
- Version control your global Claude Code settings
- Edit your personal working rules from this repository
- Sync configuration across machines

The script is idempotent - you can run it multiple times safely.

**What gets symlinked:**
- `config/CLAUDE.md` → `~/.claude/CLAUDE.md` (your global working rules)
- `config/settings.json` → `~/.claude/settings.json` (global settings)

### Install this marketplace

If this repository is hosted on GitHub:

```bash
# In any Claude Code session, run:
/plugin marketplace add dhruvbaldawa/ccconfigs
```

If using a local clone:

```bash
# Clone the repository
git clone https://github.com/dhruvbaldawa/ccconfigs.git
# Or use your local path

# In Claude Code, add the local marketplace:
/plugin marketplace add /Users/dhruv/Code/ccconfigs
```

### Install the essentials plugin

Once the marketplace is added:

1. Open the plugin menu: `/plugin`
2. Browse available plugins from the ccconfigs marketplace
3. Select and install the "essentials" plugin

The plugin will automatically configure all MCP servers, slash commands, and skills.

## Usage

Once installed, you can:

- Use slash commands directly: `/breakdown <design-doc>` or `/do <spec-doc>`
- Access MCP server capabilities automatically through Claude Code
- Invoke skills when you need structured debugging or planning assistance

## Repository Structure

```
ccconfigs/
├── .claude-plugin/marketplace.json  # Plugin marketplace definition
├── config/                          # Global Claude Code configuration (symlinked to ~/.claude/)
│   ├── CLAUDE.md                   # Global working rules
│   └── settings.json               # Global settings
├── setup-symlinks.sh               # Idempotent setup script for global config
├── .claude/                        # Project-specific configuration
│   └── CLAUDE.md                  # Project instructions
└── essentials/                     # The essentials plugin
    ├── .mcp.json                  # MCP server configuration
    ├── .claude-plugin/plugin.json # Plugin metadata
    ├── commands/                  # Slash command definitions
    │   ├── breakdown.md
    │   ├── do.md
    │   └── optimize-doc.md        # Documentation optimization
    └── skills/                    # Development skills
        ├── debugging/
        └── technical-planning/
```
