# ccconfigs

Personal configuration repository for Claude Code - a plugin marketplace containing essential tools and workflows.

## Quick Start

1. Install the marketplace:
   ```bash
   /plugin marketplace add dhruvbaldawa/ccconfigs
   ```

2. Set required API keys:
   ```bash
   export FIRECRAWL_API_KEY=your_firecrawl_key
   export PERPLEXITY_API_KEY=your_perplexity_key
   ```

3. Install plugins:
   ```bash
   /plugin
   # Install "essentials" and "writing" from ccconfigs
   ```

## Installation

### Environment Variables

Two MCP servers require API keys:

**Firecrawl** (web scraping):
1. Get API key from [firecrawl.dev](https://firecrawl.dev)
2. Set environment variable:
   ```bash
   export FIRECRAWL_API_KEY=your_key_here
   ```

**Perplexity** (AI search):
1. Get API key from [Perplexity API Console](https://www.perplexity.ai/settings/api)
2. Set environment variable:
   ```bash
   export PERPLEXITY_API_KEY=your_key_here
   ```

Add these variables to your shell profile (.zshrc, .bashrc) for persistence.

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

## Overview

This repository provides a structured plugin marketplace for Claude Code with two plugins:

- **essentials**: Systematic development workflows including MCP servers, task management commands, and debugging/planning skills
- **writing**: Conversation-driven blog writing workflow in Dhruv Baldawa's distinctive style

## Plugins

### Essentials Plugin

Systematic development workflows including MCP servers, task management commands, and debugging/planning skills.

#### MCP Servers

Pre-configured integrations with Model Context Protocol servers:

- **Firecrawl**: Web scraping and content extraction
- **Perplexity**: AI-powered search capabilities
- **Context7**: Library documentation lookup
- **Sequential-thinking**: Structured thinking framework

#### Slash Commands

- **`/breakdown [SPEC DOCUMENT]`**: Creates agile task breakdowns from design documents. Generates structured iteration plans with tasks, validation checklists, and LLM prompts.

- **`/do [SPEC DOCUMENT] [TASK NUMBER | --resume] [CONTEXT] [--auto]`**: Executes tasks from spec documents. Updates task status to "In Progress", follows LLM prompts, validates completion. With `--auto` flag, automatically commits after each task and continues.

- **`/optimize-doc [DOCUMENT]`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness. Can run idempotently across multiple passes.

#### Utility Scripts

**`manage-permissions.ts`**: Interactive tool for managing Claude Code permissions across projects. Auto-discovers projects by recursively scanning for `.claude/settings.local.json` files. Two modes: **promote** (default) moves permissions to global config, or **cleanup** removes permissions from project locals.

**Promote permissions to global:**
```bash
bun scripts/manage-permissions.ts                    # From home dir
bun scripts/manage-permissions.ts ~/Code ~/Projects  # From specific roots
bun scripts/manage-permissions.ts --dry-run          # Preview only
```

**Remove permissions from projects:**
```bash
bun scripts/manage-permissions.ts --cleanup          # Remove permissions
bun scripts/manage-permissions.ts --cleanup ~/Code   # From specific root
bun scripts/manage-permissions.ts --cleanup --dry-run  # Preview only
```

#### Skills

- **Debugging**: Systematic debugging framework using the UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment, with antipattern avoidance and reference materials.

- **Technical Planning**: Risk-first development methodology that emphasizes "what" over "how". Four-phase approach covering requirements & risk analysis, milestone planning, implementation strategy, and execution framework.

### Writing Plugin

Conversation-driven workflow for blog posts in Dhruv Baldawa's distinctive voice.

#### Two-Document Workflow

Every blog post uses two files:

- **braindump.md**: Collaborative workspace for research, notes, outline iterations, examples, and questions
- **draft.md**: Clean, polished blog post in Dhruv's voice

#### Slash Commands

- **`/new-post [topic]`**: Initializes new blog post with `posts/[topic]/` directory containing braindump.md and draft.md templates. Starts brainstorming conversation.

- **`/polish [topic or path]`**: Hybrid refinement workflow (suggest → confirm → apply). Runs quality checklist, presents 3-5 concrete improvements, waits for confirmation, applies approved changes. Can be run multiple times during writing.

#### Skills

- **blog-writing**: Transforms ideas from braindump to polished prose in Dhruv's voice - conversational yet analytical, grounded in personal experience, with clear structure optimized for Substack. Includes voice/tone principles, structure template, and quality checklist.

- **brainstorming**: Collaborative ideation through questions and exploration. Starts with questions, explores tensions, challenges assumptions, helps refine vague ideas into concrete topics. Updates braindump.md as ideas evolve.

- **research-synthesis**: Guides when to use Perplexity (broad research), Firecrawl (specific URLs), or Context7 (technical docs). Synthesizes findings into narrative, integrates naturally during conversation, maintains source attribution.

**Design philosophy**: Conversation-first workflow. Skills guide natural conversation, commands are utilities. Most operations happen through chat. MCP tools used proactively during conversation. Flow: Brainstorming → Research → Drafting → Polishing.



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
