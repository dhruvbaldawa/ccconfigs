# ccconfigs

Personal configuration repository for Claude Code - a plugin marketplace containing essential tools and workflows.

## Quick Start

1. Install the marketplace:
   ```bash
   /plugin marketplace add dhruvbaldawa/ccconfigs
   ```

2. Set API keys (optional - for MCP servers):
   ```bash
   export PARALLEL_API_KEY=your_parallel_key       # Optional: Parallel Search
   export PERPLEXITY_API_KEY=your_perplexity_key   # Optional: Perplexity
   ```

3. Install plugins:
   ```bash
   /plugin
   # Install "essentials", "writing", and optionally "experimental" from ccconfigs
   ```

## Installation

### Environment Variables

**All MCP servers are optional.** The essentials plugin uses built-in tools (WebFetch, WebSearch) first, with MCP servers as fallback for advanced capabilities.

**Parallel Search** (advanced web search with agentic mode):
1. Get API key from [parallel.ai](https://parallel.ai)
2. Set environment variable:
   ```bash
   export PARALLEL_API_KEY=your_key_here
   ```

**Perplexity** (AI-powered search):
1. Get API key from [Perplexity API Console](https://www.perplexity.ai/settings/api)
2. Set environment variable:
   ```bash
   export PERPLEXITY_API_KEY=your_key_here
   ```

Add these variables to your shell profile (.zshrc, .bashrc) for persistence. Without these keys, built-in tools (WebFetch, WebSearch) still provide full functionality.

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
   - **essentials**: For development workflows (MCP servers, task management, research, debugging/planning)
   - **writing**: For blog post writing in Dhruv's style
   - **experimental**: For complex development workflows with specialized agents (research, review)

Plugins automatically configure all MCP servers, slash commands, skills, and agents.

## Overview

This repository provides a structured plugin marketplace for Claude Code with three plugins:

- **essentials**: Systematic development workflows including MCP servers, task management commands, research capabilities, and debugging/planning skills
- **writing**: Conversation-driven blog writing workflow in Dhruv Baldawa's distinctive style
- **experimental**: Multi-skill workflow system with 6 specialized agents for complex development tasks (research, code review)

## Plugins

### Essentials Plugin

Systematic development workflows including MCP servers, task management commands, and debugging/planning skills.

#### MCP Servers

Pre-configured integrations with Model Context Protocol servers. Built-in tools (WebFetch, WebSearch) are prioritized, with MCP servers as fallback for advanced capabilities:

- **Parallel Search**: Advanced web search with agentic mode for complex queries, fact-checking, multi-source synthesis, and deep content extraction (optional API key)
- **Perplexity**: AI-powered search for broad research and multiple perspectives (optional API key)
- **Context7**: Library documentation lookup for official API references and technical specs (always available)
- **Sequential-thinking**: Structured thinking framework for complex analysis (always available)

**Research tool priority order:**
1. **Built-in tools** (always available): WebFetch (specific URLs) / WebSearch (general searches)
2. **Parallel Search** (optional): Advanced synthesis, fact-checking, agentic mode, deep extraction
3. **Perplexity** (optional): Broad surveys
4. **Context7** (always available): Official technical docs only

#### Slash Commands

- **`/breakdown [SPEC DOCUMENT]`**: Creates agile task breakdowns from design documents. Generates structured iteration plans with tasks, validation checklists, and LLM prompts.

- **`/do [SPEC DOCUMENT] [TASK NUMBER | --resume] [CONTEXT] [--auto]`**: Executes tasks from spec documents. Updates task status to "In Progress", follows LLM prompts, validates completion. With `--auto` flag, automatically commits after each task and continues.

- **`/optimize-doc [DOCUMENT]`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness. Can run idempotently across multiple passes.

- **`/research [TASK FILE | QUESTION]`**: Research blockers or questions using specialized research agents. Analyzes question type and launches 2-3 agents in parallel (research-breadth for industry patterns, research-depth for specific solutions, research-technical for official docs). Uses research-synthesis skill to consolidate findings. For stuck tasks, updates task file with findings. For general questions, provides summary with sources.

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

- **research-synthesis**: Prioritizes built-in tools (WebFetch for URLs, WebSearch for general queries), uses MCP servers as fallback (Parallel Search for advanced synthesis, Context7 for technical docs). Synthesizes findings into narrative, integrates naturally during conversation, maintains source attribution.

**Design philosophy**: Conversation-first workflow. Skills guide natural conversation, commands are utilities. Most operations happen through chat. Research tools used proactively during conversation. Flow: Brainstorming → Research → Drafting → Polishing.

### Experimental Plugin

Multi-skill workflow system using kanban file movement for complex, high-value development tasks. Features 6 specialized agents organized in 2 categories (research, review), all optimized for parallel invocation.

#### Specialized Agents (6 total)

**Research Agents** (3 agents - all haiku):
- **research-breadth**: Broad surveys via WebSearch → Parallel Search → Perplexity (industry trends, consensus, multiple perspectives)
- **research-depth**: Deep-dive via WebFetch → Parallel Search (specific URLs, implementation details, case studies)
- **research-technical**: Official docs via Context7 (API references, method signatures, configurations)

**Review Agents** (3 agents - all sonnet):
- **test-coverage-analyzer**: Behavioral test gaps with 1-10 criticality ratings
- **error-handling-reviewer**: Silent failures and poor error handling with severity levels
- **security-reviewer**: OWASP Top 10 vulnerabilities with 0-100 confidence scores

#### Slash Commands

- **`/plan-feature [REQUEST]`**: Creates `.plans/<project>/` with risk-prioritized tasks. Milestone-aware: detects existing plans and generates next batch of tasks for continuing projects. Generates task files in pending/ following Last Responsible Moment principle.

- **`/add-task [PROJECT] [TASK DESCRIPTION]`**: Adds a single ad-hoc task to an existing project's pending queue without full planning. Creates properly formatted task file with auto-incremented task number. Useful for adding tasks discovered during implementation. Prompts for project if not specified.

- **`/implement-plan [PROJECT]`**: Executes tasks through kanban workflow (pending → implementation → review → testing → completed). Launches research agents when stuck, review agents (all 3) in parallel for comprehensive analysis.

- **`/orchestrate [REQUEST]`**: End-to-end workflow from planning through completion. Combines `/plan-feature` and `/implement-plan` in single command with user confirmation between phases.

#### Skills

- **implementing-tasks**: Launches 2-3 research agents in parallel when stuck based on blocker type, consolidates findings using research-synthesis skill
- **reviewing-code**: Launches all 3 review agents in parallel, consolidates findings by confidence/severity, decides APPROVE or REJECT
- **testing**: Test suite execution and validation

**Design philosophy**: Agents for specialized analysis with single, clear responsibilities. Skills orchestrate agents and consolidate findings. Parallel invocation reduces latency (2-3 research, 3 review agents together). Model optimization: Haiku for research (cost-efficient), Sonnet for review (quality-critical).

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
│   │   ├── optimize-doc.md
│   │   └── research.md            # Research using specialized agents
│   └── skills/                    # Development skills
│       ├── brainstorming/         # Collaborative ideation
│       │   ├── SKILL.md
│       │   └── reference/
│       ├── debugging/             # UNDERSTAND methodology
│       │   ├── SKILL.md
│       │   └── reference/
│       ├── engineering-prompts/   # Prompt engineering methodology
│       │   └── SKILL.md
│       ├── research-synthesis/    # MCP tool integration
│       │   ├── SKILL.md
│       │   └── reference/
│       │       └── multi-agent-invocation.md  # Multi-agent patterns
│       ├── technical-planning/    # Risk-first planning
│       │   └── SKILL.md
│       └── writing-documentation/ # Documentation best practices
│           └── SKILL.md
├── writing/                        # The writing plugin
│   ├── .claude-plugin/plugin.json # Plugin metadata
│   ├── commands/                  # Slash command definitions
│   │   ├── new-post.md            # Initialize blog post
│   │   └── polish.md              # Hybrid refinement
│   └── skills/                    # Writing skills
│       └── blog-writing/          # Dhruv's voice and style
│           └── SKILL.md
└── experimental/                   # The experimental plugin
    ├── .claude-plugin/plugin.json # Plugin metadata
    ├── agents/                    # Specialized agents (6 total)
    │   ├── research/              # Research agents (parallel invocation)
    │   │   ├── research-breadth.md
    │   │   ├── research-depth.md
    │   │   └── research-technical.md
    │   └── review/                # Code review agents
    │       ├── test-coverage-analyzer.md
    │       ├── error-handling-reviewer.md
    │       └── security-reviewer.md
    ├── commands/                  # Workflow commands
    │   ├── plan-feature.md
    │   ├── add-task.md
    │   ├── implement-plan.md
    │   └── orchestrate.md
    └── skills/                    # Workflow skills
        ├── implementing-tasks/
        ├── reviewing-code/
        └── testing/
```
