# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Personal Claude Code plugin marketplace containing the **essentials** plugin - systematic development workflows including MCP server integrations, slash commands, and development skills.

## Repository Structure

```
ccconfigs/
├── .claude-plugin/marketplace.json   # Marketplace definition (register new plugins here)
├── config/                          # Global Claude Code configuration (symlinked to ~/.claude/)
│   ├── CLAUDE.md                   # Global working rules
│   └── settings.json               # Global settings
├── setup-symlinks.sh               # Idempotent setup script for global config
├── scripts/                        # Utility scripts for configuration management
│   └── manage-permissions.ts       # Interactive permission promoter and cleanup
├── .claude/                        # Project-specific configuration
│   ├── CLAUDE.md                  # This file - repository guidance
│   └── settings.local.json        # Local overrides (gitignored)
└── essentials/                     # The essentials plugin
    ├── .claude-plugin/plugin.json # Plugin metadata
    ├── .mcp.json                  # MCP server configurations
    ├── commands/                  # Slash command definitions (.md files)
    │   ├── breakdown.md          # Creates agile task breakdowns
    │   ├── do.md                 # Executes tasks from specs
    │   └── optimize-doc.md       # Optimizes documentation
    └── skills/                    # Development skill frameworks
        ├── debugging/            # UNDERSTAND methodology (10-step checklist)
        │   ├── SKILL.md
        │   └── reference/       # Root cause framework, antipatterns
        └── technical-planning/   # Risk-first planning (4-phase approach)
            └── SKILL.md
```

## Working with This Repository

### No Build System

Configuration files only (JSON and Markdown). No build, test, or lint commands.

### Git Workflow

- Commit all changes to plugin configurations and global config
- `.claude/settings.local.json` is gitignored (local permissions and overrides)
- Global configuration in `config/` is version controlled and symlinked to `~/.claude/`
- Run `./setup-symlinks.sh` after cloning to set up global config symlinks

### Adding to This Repository

**New plugins**: Create sibling directory to `essentials/`, then register in `.claude-plugin/marketplace.json`

**MCP servers**: Add to `essentials/.mcp.json` using `pnpx` command pattern

**Slash commands**: Add `.md` files to `essentials/commands/` with YAML frontmatter

**Skills**: Create directory in `essentials/skills/` with `SKILL.md` and optional `reference/` subdirectory

## The Essentials Plugin

### Slash Commands

**`/breakdown [SPEC DOCUMENT]`**: Creates structured, agile task breakdowns from design documents. Outputs iterations with tasks that include status, goals, validation checklists, and detailed LLM prompts. Designed to work iteratively - generates one iteration at a time to avoid token limits.

**`/do [SPEC DOCUMENT] [TASK NUMBER | --resume] [ADDITIONAL CONTEXT] [--auto]`**: Executes tasks from breakdown documents. Updates task status to "In Progress", follows the LLM prompt, validates completion criteria. With `--auto` flag, automatically commits after each task and continues to the next. Supports `--resume` to continue from first incomplete task.

**`/optimize-doc [DOCUMENT]`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness. Can run idempotently - multiple passes won't degrade quality.

**Key pattern**: `/breakdown` and `/do` work with shared state in a spec document. Breakdown creates the plan, do executes tasks one by one while maintaining state in the document.

### Skills

**debugging**: Systematic debugging using UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment. Integrates with MCP tools (Context7 for docs, Firecrawl for research, SequentialThinking for complex analysis). Includes antipattern awareness and decision framework for when to use which tools. Reference materials document common debugging failures.

**technical-planning**: Risk-first development methodology. Four-phase approach: Requirements & Risk Analysis, Milestone Planning, Implementation Strategy, Execution Framework. Emphasizes "what" over "how", managed deferral, and addressing highest-risk challenges first. Includes decision framework for handling unclear requirements.

### MCP Servers

- **Firecrawl**: Web scraping and content extraction
- **Perplexity**: AI-powered search
- **Context7**: Library documentation lookup
- **Sequential-thinking**: Structured thinking framework

Skills reference MCP tools by prefixed names (e.g., `Context7:get-library-docs`, `Firecrawl:search`).

## Utility Scripts

### `manage-permissions.ts`

Interactive tool for managing Claude Code permissions across project configurations. Auto-discovers projects, promotes project-specific permissions to global config, and optionally cleans up redundant local settings. Built with functional programming principles and clean separation of concerns (domain, filesystem, UI layers).

**Features:**
- Auto-discovers all projects with permissions by recursively scanning filesystem
- Default: searches home directory; optionally specify root path(s)
- Skips common build/dependency directories (node_modules, .git, .cache, etc.)
- Collects permissions from `.claude/settings.local.json` in discovered projects
- Multi-select interface to choose which permissions to promote to global
- Merges selected permissions into `~/.claude/settings.json`
- Optionally removes promoted permissions from project-specific files
- `--dry-run` mode to preview changes without modifying files

**Usage:**

**Promote mode** (default: select permissions to promote to global):
```bash
# Auto-discover and promote
bun scripts/manage-permissions.ts

# From specific roots
bun scripts/manage-permissions.ts ~/Code ~/Projects

# Dry-run preview
bun scripts/manage-permissions.ts --dry-run ~/Code
```

**Cleanup mode** (remove permissions from project local settings):
```bash
# Cleanup: select and remove permissions from projects
bun scripts/manage-permissions.ts --cleanup

# Cleanup from specific roots
bun scripts/manage-permissions.ts --cleanup ~/Code

# Cleanup dry-run
bun scripts/manage-permissions.ts --cleanup --dry-run
```

**Workflow:**

*Promote Mode* (default):
1. Recursively scans filesystem for projects
2. Collects all unique permissions from project local settings
3. Displays permissions in multi-select interface (with project counts)
4. User selects which permissions to promote to global config
5. Previews changes to `~/.claude/settings.json` and confirms
6. Updates global settings with selected permissions
7. Asks if user wants to remove promoted permissions from local settings
8. Shows summary of all changes applied

*Cleanup Mode* (`--cleanup` flag):
1. Recursively scans filesystem for projects
2. Collects all permissions from project local settings
3. Displays permissions in multi-select interface (with project counts)
4. User selects which permissions to remove from project locals
5. Previews cleanup scope (which projects/permissions affected)
6. Confirms and removes selected permissions from local settings
7. Shows summary of permissions removed (or would remove in dry-run mode)

**Architecture:**
- **Domain Layer**: Pure functions for permission operations (no I/O)
- **Filesystem Layer**: Recursive directory scanner, settings.json read/write
- **UI Layer**: User interaction via `@inquirer/prompts` (checkbox, confirm)
- **Main**: Orchestration, CLI argument parsing, workflow coordination

**Settings files touched:**
- Reads: `.claude/settings.local.json` from discovered projects
- Writes: `~/.claude/settings.json` (global user settings)

**Directories skipped during scan:**
Build artifacts, dependencies, and system dirs: `.git`, `node_modules`, `.next`, `dist`, `build`, `target`, `vendor`, `venv`, and others.

**No `package.json` required** - Bun auto-installs `@inquirer/prompts` on first run.

## Architecture Decisions

**Commands vs Skills**: Commands are explicit user entry points with arguments (`/breakdown spec.md`). Skills are reusable methodologies Claude can invoke proactively or on request ("use systematic debugging"). This separation allows skills to be referenced from multiple commands.

**Stateful commands**: `/breakdown` and `/do` maintain state in the spec document itself rather than in separate tracking. This makes the spec document the single source of truth for project progress.

**Markdown for everything**: Human-readable, version control friendly, no compilation required. Skills are structured as comprehensive frameworks with decision trees and quality checklists embedded directly in markdown.

**Reference subdirectories**: Complex skills (debugging, technical-planning) include `reference/` directories with supporting materials that provide deeper context without cluttering the main skill file.
