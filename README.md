# ccconfigs

Personal configuration repository for Claude Code - a plugin marketplace containing my essential tools and workflows.

## Overview

This repository provides a structured plugin marketplace for Claude Code with two plugins:

- **essentials**: Systematic development workflows including MCP servers, task management commands, and debugging/planning skills
- **writing**: Conversation-driven blog writing workflow in Dhruv Baldawa's distinctive style

## Plugins

### Essentials Plugin

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

### Utility Scripts

**`manage-permissions.ts`**: Interactive tool for managing Claude Code permissions across projects.

Auto-discovers projects by recursively scanning for `.claude/settings.local.json` files. Two modes: **promote** (default) moves permissions to global config with optional cleanup, or **cleanup** (with `--cleanup` flag) removes permissions from project locals only. Features auto-discovery, multi-select interface, dry-run preview mode, and clean functional architecture (domain, filesystem, UI layers).

**Promote mode** (select permissions to move to global):
```bash
bun scripts/manage-permissions.ts                    # From home dir
bun scripts/manage-permissions.ts ~/Code ~/Projects  # From specific roots
bun scripts/manage-permissions.ts --dry-run          # Preview only
```

**Cleanup mode** (remove permissions from projects):
```bash
bun scripts/manage-permissions.ts --cleanup          # Remove permissions
bun scripts/manage-permissions.ts --cleanup ~/Code   # From specific root
bun scripts/manage-permissions.ts --cleanup --dry-run  # Preview only
```

### Skills

Comprehensive development workflow frameworks:

- **Debugging**: Systematic debugging framework using the UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment, with antipattern avoidance and reference materials on root cause analysis techniques.

- **Technical Planning**: Risk-first development methodology that emphasizes "what" over "how". Four-phase approach covering requirements & risk analysis, milestone planning, implementation strategy, and execution framework.

### Writing Plugin

The **writing** plugin provides a conversation-driven workflow for blog posts in Dhruv Baldawa's distinctive voice.

#### Two-Document Workflow

Every blog post uses two files:

- **braindump.md**: Messy collaborative workspace for research, notes, outline iterations, examples, and questions
- **draft.md**: Clean, polished blog post in Dhruv's voice

#### Slash Commands

- **`/new-post [topic]`**: Initializes new blog post with `posts/[topic]/` directory containing braindump.md and draft.md templates. Kicks off brainstorming conversation.

- **`/polish [topic or path]`**: Hybrid refinement workflow (suggest → confirm → apply). Runs quality checklist, presents 3-5 concrete improvements, waits for confirmation, applies approved changes. Can be run multiple times during writing.

#### Skills

Three skills guide the conversation:

- **blog-writing**: Transforms ideas from braindump → polished prose in draft. Dhruv's distinctive voice - conversational yet analytical, grounded in personal experience, with clear structure and practical insights optimized for Substack. Includes voice/tone principles, structure template, language guidelines, and 14-point quality checklist.

- **brainstorming**: Collaborative ideation through questions and exploration. Starts with questions not suggestions, explores tensions, challenges assumptions, helps refine vague ideas into concrete topics. Updates braindump.md as ideas evolve. Knows when to transition to drafting.

- **research-synthesis**: Guides when to use Perplexity (broad research), Firecrawl (specific URLs), or Context7 (technical docs). Synthesizes findings into narrative (not just lists), integrates naturally during conversation, maintains source attribution.

**Key pattern**: Skills guide natural conversation, commands are just utilities. Most operations (add to braindump, revise draft) happen through chat. MCP tools used proactively during conversation, not via separate commands.

**Design philosophy**: Conversation-first workflow. Emphasizes natural back-and-forth over rigid command sequences. Write section by section, pause, resume. Skills guide flow: Brainstorming → Research → Drafting → Polishing.

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

### Install plugins

Once the marketplace is added:

1. Open the plugin menu: `/plugin`
2. Browse available plugins from the ccconfigs marketplace
3. Select and install plugins:
   - **essentials**: For development workflows (MCP servers, task management, debugging/planning)
   - **writing**: For blog post writing in Dhruv's style

Plugins automatically configure all MCP servers, slash commands, and skills.

## Usage

### Essentials Plugin

- Use slash commands: `/breakdown <design-doc>`, `/do <spec-doc>`, `/optimize-doc <document>`
- Access MCP server capabilities automatically (Perplexity, Firecrawl, Context7, Sequential-thinking)
- Invoke debugging and technical-planning skills when needed

### Writing Plugin

- Start a new post: `/new-post [topic]`
- Brainstorm through natural conversation (brainstorming skill guides you)
- Research claims with MCP tools (research-synthesis skill integrates Perplexity/Firecrawl/Context7)
- Draft sections iteratively (blog-writing skill maintains Dhruv's voice)
- Polish the draft: `/polish [topic]` (suggest → confirm → apply)
- All work happens in `posts/[topic]/` with braindump.md and draft.md

## Repository Structure

```
ccconfigs/
├── .claude-plugin/marketplace.json  # Plugin marketplace definition
├── config/                          # Global Claude Code configuration (symlinked to ~/.claude/)
│   ├── CLAUDE.md                   # Global working rules
│   └── settings.json               # Global settings
├── setup-symlinks.sh               # Idempotent setup script for global config
├── scripts/                        # Utility scripts
│   └── manage-permissions.ts       # Interactive permission management
├── .claude/                        # Project-specific configuration
│   └── CLAUDE.md                  # Project instructions
├── essentials/                     # The essentials plugin
│   ├── .mcp.json                  # MCP server configuration
│   ├── .claude-plugin/plugin.json # Plugin metadata
│   ├── commands/                  # Slash command definitions
│   │   ├── breakdown.md
│   │   ├── do.md
│   │   └── optimize-doc.md
│   └── skills/                    # Development skills
│       ├── debugging/             # UNDERSTAND methodology
│       │   ├── SKILL.md
│       │   └── reference/         # Root cause framework, antipatterns
│       └── technical-planning/    # Risk-first planning
│           └── SKILL.md
└── writing/                        # The writing plugin
    ├── .claude-plugin/plugin.json # Plugin metadata
    ├── commands/                  # Slash command definitions
    │   ├── new-post.md            # Initialize blog post
    │   └── polish.md              # Hybrid refinement
    └── skills/                    # Writing skills
        ├── blog-writing/          # Dhruv's voice and style
        │   └── SKILL.md
        ├── brainstorming/         # Collaborative ideation
        │   ├── SKILL.md
        │   └── reference/         # Conversation examples
        └── research-synthesis/    # MCP tool integration
            ├── SKILL.md
            └── reference/         # Research examples
```
