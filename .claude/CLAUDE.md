# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Personal Claude Code plugin marketplace containing the **essentials** plugin - systematic development workflows including MCP server integrations, slash commands, and development skills.

## Repository Structure

```
ccconfigs/
├── .claude-plugin/marketplace.json   # Marketplace definition (register new plugins here)
└── essentials/                       # The essentials plugin
    ├── .claude-plugin/plugin.json   # Plugin metadata
    ├── .mcp.json                    # MCP server configurations
    ├── commands/                    # Slash command definitions (.md files)
    │   ├── breakdown.md            # Creates agile task breakdowns
    │   └── do.md                   # Executes tasks from specs
    └── skills/                      # Development skill frameworks
        ├── debugging/              # UNDERSTAND methodology (10-step checklist)
        │   ├── SKILL.md
        │   └── reference/         # Root cause framework, antipatterns
        └── technical-planning/     # Risk-first planning (4-phase approach)
            └── SKILL.md
```

## Working with This Repository

### No Build System

Configuration files only (JSON and Markdown). No build, test, or lint commands.

### Git Workflow

- Commit all changes to plugin configurations
- `.claude/` directory is gitignored (personal workspace)

### Adding to This Repository

**New plugins**: Create sibling directory to `essentials/`, then register in `.claude-plugin/marketplace.json`

**MCP servers**: Add to `essentials/.mcp.json` using `pnpx` command pattern

**Slash commands**: Add `.md` files to `essentials/commands/` with YAML frontmatter

**Skills**: Create directory in `essentials/skills/` with `SKILL.md` and optional `reference/` subdirectory

## The Essentials Plugin

### Slash Commands

**`/breakdown [SPEC DOCUMENT]`**: Creates structured, agile task breakdowns from design documents. Outputs iterations with tasks that include status, goals, validation checklists, and detailed LLM prompts. Designed to work iteratively - generates one iteration at a time to avoid token limits.

**`/do [SPEC DOCUMENT] [TASK NUMBER | --resume] [ADDITIONAL CONTEXT] [--auto]`**: Executes tasks from breakdown documents. Updates task status to "In Progress", follows the LLM prompt, validates completion criteria. With `--auto` flag, automatically commits after each task and continues to the next. Supports `--resume` to continue from first incomplete task.

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

## Architecture Decisions

**Commands vs Skills**: Commands are explicit user entry points with arguments (`/breakdown spec.md`). Skills are reusable methodologies Claude can invoke proactively or on request ("use systematic debugging"). This separation allows skills to be referenced from multiple commands.

**Stateful commands**: `/breakdown` and `/do` maintain state in the spec document itself rather than in separate tracking. This makes the spec document the single source of truth for project progress.

**Markdown for everything**: Human-readable, version control friendly, no compilation required. Skills are structured as comprehensive frameworks with decision trees and quality checklists embedded directly in markdown.

**Reference subdirectories**: Complex skills (debugging, technical-planning) include `reference/` directories with supporting materials that provide deeper context without cluttering the main skill file.
