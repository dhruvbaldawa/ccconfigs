# ccconfigs

Dhruv's Claude Code setup: a plugin marketplace plus the global config that `~/.claude/` links to.

## Setup

```bash
git clone https://github.com/dhruvbaldawa/ccconfigs.git
cd ccconfigs
./setup-symlinks.sh
```

`setup-symlinks.sh` is idempotent. It links:

- `config/CLAUDE.md` → `~/.claude/CLAUDE.md` (global working rules)
- `config/rules/code.md` → `~/.claude/rules/code.md` (coding rules, loaded only for source files)
- `config/settings.json` → `~/.claude/settings.json`
- `config/statusline.json` → `~/.config/ccstatusline/settings.json`

Then add the marketplace and install plugins from it:

```bash
/plugin marketplace add dhruvbaldawa/ccconfigs
/plugin
```

## Plugins

| Plugin | What it holds | Docs |
|---|---|---|
| **essentials** | Conveyor (implement/review/commit loop) and its reviewer agents; skills for planning, debugging, design, prototyping, explainers, handoffs, retros, and PR bodies; `/catchup`, `/optimize-doc` | `.claude/reference/essentials.md` |
| **writing** | Blog workflow in Dhruv's voice: `/new-post`, `/polish`, blog-writing, writing-like-me | `.claude/reference/writing.md` |
| **mcp** | MCPJungle gateway for the essentials tool group (Context7, Parallel, Brave). Needs `MCP_PROXY_HOST` and `MCP_PROXY_AUTH` set | `mcp/.mcp.json` |
| **notifications** | Apprise push when Claude Code needs input | `notifications/` |
| **todoist** | Links a session to a Todoist task | `todoist/` |
| **experimental** | Empty sandbox for trying things before they move to essentials | `.claude/reference/experimental.md` |

Design notes live in `.claude/reference/architecture.md`.
