# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Purpose

Personal Claude Code plugin marketplace containing:
- **essentials** - Development workflows, MCP servers, slash commands, and skills
- **writing** - Blog writing with conversation-driven workflow
- **experimental** - Multi-skill kanban workflow system with specialized agents

## Repository Structure

```
ccconfigs/
├── .claude-plugin/marketplace.json   # Register new plugins here
├── config/                          # Global config (symlinked to ~/.claude/)
├── .claude/                         # Project config
│   ├── CLAUDE.md                   # This file
│   └── reference/                  # Detailed plugin documentation
├── essentials/                      # Commands, skills, MCP servers
├── writing/                         # Blog writing workflow
├── experimental/                    # Kanban workflow + agents
└── scripts/                        # Utility scripts
```

## Essential Commands

No build system - configuration files only (JSON and Markdown).

```bash
# Validate JSON syntax
cat [file].json | jq .

# Setup global config symlinks (run after cloning)
./setup-symlinks.sh

# Manage permissions across projects
bun scripts/manage-permissions.ts
```

## Git Workflow

- Commit plugin configurations and global config
- `.claude/settings.local.json` is gitignored
- Global config in `config/` is symlinked to `~/.claude/`

## Adding to This Repository

**New plugins**: Create directory, add `.claude-plugin/plugin.json`, register in marketplace.json

**MCP servers**: Add to `essentials/.mcp.json` using `pnpx` pattern

**Slash commands**: Add `.md` files to `[plugin]/commands/` with YAML frontmatter
- Docs: https://code.claude.com/docs/en/slash-commands

**Skills**: Create `[plugin]/skills/[name]/SKILL.md` with optional `reference/` subdirectory
- Docs: https://code.claude.com/docs/en/skills
- Best practices: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices

**Agents**: Create `.md` files in `[plugin]/agents/` with YAML frontmatter
- Docs: https://code.claude.com/docs/en/sub-agents

## Plugin Documentation

Detailed documentation for each plugin in `.claude/reference/`:

- **essentials.md** - Slash commands (/breakdown, /do, /research, /fix-quality), skills (brainstorming, debugging, technical-planning, research-synthesis, claude-md-authoring), MCP servers
- **writing.md** - Two-document workflow (braindump.md + draft.md), /new-post, /polish commands, blog-writing skill
- **experimental.md** - Kanban workflow, research agents (breadth/depth/technical), review agents (test-coverage/error-handling/security), /plan-feature, /implement-plan commands
- **architecture.md** - Design decisions: commands vs skills vs agents, stateful commands, parallel agent invocation, tool integration patterns
- **utility-scripts.md** - manage-permissions.ts usage and architecture

Read the relevant reference file when working on a specific plugin.
