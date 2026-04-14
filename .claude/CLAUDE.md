# CLAUDE.md

Plugin marketplace for Claude Code: essentials, writing, experimental.

## Structure

```
.claude-plugin/marketplace.json   # Plugin registry
config/                          # Global config → ~/.claude/
essentials/                      # Commands, skills, MCP servers
writing/                         # Blog writing workflow
experimental/                    # Kanban workflow + agents
scripts/                        # Utilities
.claude/reference/              # Plugin docs
```

## Commands

```bash
cat [file].json | jq .              # Validate JSON
./setup-symlinks.sh                 # Setup after clone
bun scripts/manage-permissions.ts   # Manage permissions
```

## Git

- Commit configs and global config
- `.claude/settings.local.json` gitignored
- `config/` symlinked to `~/.claude/`

## Adding Things

- **Plugin**: dir + `.claude-plugin/plugin.json` + register in marketplace.json
- **MCP server**: `essentials/.mcp.json`, use `pnpx`
- **Command**: `.md` in `[plugin]/commands/`, YAML frontmatter
- **Skill**: `[plugin]/skills/[name]/SKILL.md`, optional `reference/`
- **Agent**: `.md` in `[plugin]/agents/`, YAML frontmatter

## Versioning

Bump `.claude-plugin/plugin.json` version on every change: patch/minor/major.

## Reference Docs

In `.claude/reference/`: essentials.md, writing.md, experimental.md, architecture.md, utility-scripts.md. Read before modifying a plugin.
