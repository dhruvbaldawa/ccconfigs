# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Personal Claude Code plugin marketplace containing:
- **essentials** - Systematic development workflows including MCP server integrations, slash commands, and development skills
- **writing** - Blog writing with conversation-driven workflow for ideation, research, drafting, and polishing

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
├── essentials/                     # The essentials plugin
│   ├── .claude-plugin/plugin.json # Plugin metadata
│   ├── .mcp.json                  # MCP server configurations
│   ├── commands/                  # Slash command definitions (.md files)
│   │   ├── breakdown.md          # Creates agile task breakdowns
│   │   ├── do.md                 # Executes tasks from specs
│   │   ├── optimize-doc.md       # Optimizes documentation
│   │   └── research.md           # Research using specialized agents (breadth/depth/technical)
│   └── skills/                    # Development skill frameworks
│       ├── brainstorming/        # Collaborative ideation (projects + writing)
│       │   ├── SKILL.md
│       │   └── reference/        # Conversation examples
│       ├── debugging/            # UNDERSTAND methodology (10-step checklist)
│       │   ├── SKILL.md
│       │   └── reference/        # Root cause framework, antipatterns
│       ├── research-synthesis/   # MCP tool usage and synthesis
│       │   ├── SKILL.md
│       │   └── reference/        # Research examples
│       └── technical-planning/   # Risk-first planning (4-phase approach)
│           └── SKILL.md
├── writing/                        # The writing plugin
│   ├── .claude-plugin/plugin.json # Plugin metadata
│   ├── commands/                  # Slash command definitions
│   │   ├── new-post.md           # Initialize new blog post (braindump + draft)
│   │   └── polish.md             # Hybrid refinement (suggest → confirm → apply)
│   └── skills/                    # Writing skill frameworks
│       └── blog-writing/         # Dhruv's distinctive voice and style
│           └── SKILL.md
└── experimental/                   # Experimental workflows plugin
    ├── .claude-plugin/plugin.json # Plugin metadata
    ├── agents/                    # Specialized agents (used by implementing, reviewing skills)
    │   ├── research/              # Research agents (parallel invocation)
    │   │   ├── research-breadth.md      # Broad surveys via Perplexity (haiku)
    │   │   ├── research-depth.md        # Deep-dive via Firecrawl (haiku)
    │   │   └── research-technical.md    # Official docs via Context7 (haiku)
    │   └── review/                # Code review agents (parallel invocation)
    │       ├── test-coverage-analyzer.md    # Behavioral test gaps (sonnet)
    │       ├── error-handling-reviewer.md   # Silent failures audit (sonnet)
    │       └── security-reviewer.md         # OWASP Top 10 vulnerabilities (sonnet)
    ├── commands/                  # Workflow commands
    │   ├── plan-feature.md       # Create .plans/ with risk-prioritized tasks (milestone-aware)
    │   ├── add-task.md           # Add ad-hoc task to existing project
    │   ├── implement-plan.md     # Execute tasks through kanban workflow
    │   └── orchestrate.md        # End-to-end: planning → implementation → review
    └── skills/                    # Workflow skills (invoked by commands)
        ├── implementing-tasks/    # Uses research agents when stuck
        ├── reviewing-code/        # Uses review agents in parallel
        └── testing/               # Test execution and validation
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

**New plugins**: Create sibling directory to `essentials/` or `writing/`, then register in `.claude-plugin/marketplace.json`

**MCP servers**: Add to `essentials/.mcp.json` using `pnpx` command pattern

**Slash commands**: Add `.md` files to `[plugin]/commands/` with YAML frontmatter
- Official documentation: https://code.claude.com/docs/en/slash-commands
- Best for: Quick, frequently-used prompts and workflows that require explicit user invocation
- Format: Markdown file with optional YAML frontmatter (description, model)
- Keep concise - for complex multi-step capabilities, use Skills instead

**Skills**: Create directory in `[plugin]/skills/` with `SKILL.md` and optional `reference/` subdirectory for examples and supporting materials
- Official documentation: https://code.claude.com/docs/en/skills
- Best practices: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices
- Best for: Reusable methodologies that Claude can invoke proactively based on context
- Key feature: **Model-invoked** - Claude decides when to use them (unlike commands)
- Structure: Main SKILL.md (<500 lines) + reference/ for examples and detailed patterns
- Include clear description in frontmatter for discoverability

**Agents**: Create `.md` files in `[plugin]/agents/` with YAML frontmatter
- Official documentation: https://code.claude.com/docs/en/sub-agents
- Best practices: https://code.claude.com/docs/en/sub-agents#best-practices
- Best for: Specialized analysis with isolated context (research, code review)
- Design principles:
  - **Single, clear responsibility** - focused agents over multi-purpose ones
  - **Detailed prompts** - include specific instructions, examples, constraints
  - **Parallel invocation** - design agents to work together (2-3 research, 3 review)
  - **Model optimization** - use haiku for cost-efficient tasks, sonnet for quality-critical
- Required frontmatter: name, description, model (optional: color for UX)
- Agents vs Skills: Use agents for specialized subprocess analysis, skills for methodologies

## The Essentials Plugin

### Slash Commands

**`/breakdown [SPEC DOCUMENT]`**: Creates structured, agile task breakdowns from design documents following the **Last Responsible Moment** principle. Outputs iterations with tasks that include status, goals, constraints, dependencies, implementation guidance (not step-by-step instructions), and validation checklists. Tasks focus on outcomes and provide context for decision-making rather than prescribing implementation details. Designed to work iteratively - generates one iteration at a time to avoid token limits.

**`/do [SPEC DOCUMENT] [TASK NUMBER | --resume] [ADDITIONAL CONTEXT] [--auto]`**: Executes tasks from breakdown documents. Updates task status to "In Progress", reads the implementation guidance to understand context and considerations, makes informed implementation decisions during development, and validates completion criteria. With `--auto` flag, automatically commits after each task and continues to the next. Supports `--resume` to continue from first incomplete task.

**`/optimize-doc [DOCUMENT]`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness. Can run idempotently - multiple passes won't degrade quality.

**`/research [TASK FILE | QUESTION]`**: Research blockers or questions using specialized research agents. Analyzes question type and launches 2-3 agents in parallel (research-breadth for industry patterns, research-depth for specific solutions, research-technical for official docs). Uses research-synthesis skill to consolidate findings. For stuck tasks, updates task file with findings. For general questions, provides summary with sources. See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed patterns.

**`/fix-quality [FILES OR PATTERN]`**: Systematically fix linting, type errors, and quality issues following root-cause-first philosophy. Priority order: (1) Fix root cause (remove unused imports, fix types), (2) Apply safety/reliability improvements (type guards, error handling), (3) Use local ignores only when necessary (inline > file > pattern > global). Documents why ignores are needed. Validates all checks pass and tests remain green. Emphasizes fixing problems over suppressing warnings.

**Key pattern**: `/breakdown` and `/do` work with shared state in a spec document. Breakdown creates the plan, do executes tasks one by one while maintaining state in the document.

### Skills

**brainstorming**: Collaborative ideation for projects and writing. Asks clarifying questions, suggests angles, challenges assumptions, helps refine vague ideas into concrete requirements or topics. Context-aware transitions - guides to technical-planning for projects or blog-writing for posts. Emphasizes drawing out user's ideas (not injecting your own).

**research-synthesis**: Research tool usage patterns and synthesis methodology. Prioritizes built-in tools (WebFetch for URLs, WebSearch for general queries), uses MCP servers as fallback (Parallel Search for advanced synthesis, Perplexity for broad surveys, Context7 for technical docs). Synthesizes findings into narrative (not just lists), integrates naturally during conversation, maintains source attribution. Includes decision tree and quality standards.

**debugging**: Systematic debugging using UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment. Prioritizes built-in tools (WebSearch) then MCP servers (Parallel Search for advanced research, Perplexity for broad surveys, Context7 for official docs, SequentialThinking for complex analysis). Includes antipattern awareness and decision framework for when to use which tools. Reference materials document common debugging failures.

**technical-planning**: Risk-first development methodology with Last Responsible Moment decision-making. Four-phase approach: Requirements & Risk Analysis, Milestone Planning, Implementation Strategy, Execution Framework. Emphasizes "what" over "how", defers implementation decisions until execution, manages deferral explicitly, and addresses highest-risk challenges first. Includes decision timing framework (what to decide early vs. defer), task breakdown guidelines (outcome-focused vs. prescriptive), and decision framework for handling unclear requirements.

### MCP Servers

**Priority:** Built-in tools (WebFetch, WebSearch) are used first, MCP servers as fallback for advanced capabilities.

- **Parallel Search**: Advanced web search with agentic mode for complex queries, fact-checking, multi-source synthesis, and deep content extraction (optional API key)
- **Perplexity**: AI-powered search for broad research and multiple perspectives (optional API key)
- **Context7**: Library documentation lookup for official API references and technical specs (always available)
- **Sequential-thinking**: Structured thinking framework for complex analysis (always available)

**Research tool priority order:**
1. WebFetch (specific URLs) / WebSearch (general searches) - always available
2. Parallel Search (advanced synthesis, fact-checking, deep extraction) - optional
3. Perplexity (broad surveys) - optional
4. Context7 (official technical docs only) - always available

Skills reference MCP tools by prefixed names (e.g., `Context7:get-library-docs`, `Parallel-Search:web_search_preview`, `Perplexity:search`).

## The Writing Plugin

### Overview

Conversation-driven workflow for blog writing in Dhruv Baldawa's distinctive style. Emphasizes natural back-and-forth over rigid command sequences, with two-document approach separating messy ideation from polished prose.

### Two-Document Workflow

**braindump.md** - Messy collaborative workspace:
- Research findings, citations, sources
- Rough ideas and notes
- Outline iterations
- Examples and anecdotes
- Questions to resolve

**draft.md** - Clean blog post:
- Structured markdown in Dhruv's voice
- Polished, publishable content
- References research from braindump

### Slash Commands

**`/new-post [topic]`**: Initializes new blog post with directory structure. Creates `posts/[topic]/` containing braindump.md (with template sections: Context, Research, Examples, etc.) and draft.md (with frontmatter and structure). Kicks off brainstorming conversation.

**`/polish [topic or path]`**: Hybrid refinement workflow (suggest → confirm → apply). Runs quality checklist from blog-writing skill, presents 3-5 concrete improvements, waits for user confirmation, applies approved changes. Can be run multiple times during writing process, not just final pass.

### Skills

**blog-writing**: Write posts in Dhruv's distinctive voice - conversational yet analytical, grounded in personal experience, with clear structure and practical insights optimized for Substack. Active during drafting phase. Transforms ideas from braindump → polished prose in draft. Includes voice/tone principles, structure template, language guidelines, quality checklist (14 points), and common pitfalls.

**Uses skills from essentials plugin:**
- **brainstorming** (essentials): Collaborative ideation through questions and exploration. Context-aware for writing - updates braindump.md, transitions to drafting when ready.
- **research-synthesis** (essentials): Research tool usage for research. Synthesizes findings into braindump.md during ideation.

**Key pattern**: Skills guide natural conversation, commands are just utilities. Most operations (add to braindump, revise draft) happen through chat. Research tools (WebFetch, WebSearch, Parallel Search, Perplexity, Context7) used proactively during conversation, not via separate commands.

### Design Philosophy

- **Conversation-first**: Natural dialogue over rigid command sequences
- **Minimal commands**: Only `/new-post` and `/polish` - everything else through chat
- **Iterative**: Write section by section, pause, resume
- **Skills guide flow**: Brainstorming → Research → Drafting → Polishing
- **Progressive disclosure**: Main SKILL.md files concise (<500 lines), examples in reference/

## The Experimental Plugin

### Overview

Multi-skill workflow system using kanban file movement for complex, high-value tasks. Features 6 specialized agents organized in 2 categories (research, review), all optimized for parallel invocation.

### Specialized Agents

**Research Agents** (3 agents - all haiku, parallel invocation):
- **research-breadth**: Broad surveys via WebSearch → Parallel Search → Perplexity (industry trends, consensus, multiple perspectives)
- **research-depth**: Deep-dive via WebFetch → Parallel Search (specific URLs, implementation details, case studies)
- **research-technical**: Official docs via Context7 (API references, method signatures, configurations)

**Review Agents** (3 agents - all sonnet, parallel invocation):
- **test-coverage-analyzer**: Behavioral test gaps with 1-10 criticality ratings
- **error-handling-reviewer**: Silent failures and poor error handling with severity levels
- **security-reviewer**: OWASP Top 10 vulnerabilities with 0-100 confidence scores

### Agent Invocation Patterns

**Research agents** used when:
- `/research` command invoked (2-3 agents based on question type)
- `implementing-tasks` skill encounters STUCK status (automatic parallel launch)

**Review agents** used when:
- `reviewing-code` skill runs (all 3 agents in parallel for comprehensive review)

See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed multi-agent patterns.

### Slash Commands

**`/plan-feature [REQUEST]`**: Sprint planning for `.plans/<project>/`. Same rigor whether starting fresh or continuing - always invokes `technical-planning` skill (from essentials) with full risk analysis. For continuing sprints, loads context from completed work and applies learnings. Generates outcome-focused task files in pending/ following Last Responsible Moment principle.

**`/add-task [PROJECT] [TASK DESCRIPTION]`**: Adds a single ad-hoc task to an existing project's pending queue without full planning. Creates properly formatted task file in `.plans/<project>/pending/` with auto-incremented task number. Useful for adding tasks discovered during implementation or tracking quick work items. Prompts for project if not specified. Simpler than `/plan-feature` - no risk analysis, just scaffolds task structure for manual refinement.

**`/implement-plan [PROJECT] [--auto]`**: Executes tasks through kanban workflow with end-to-end completion per task (implementation → review → fix issues → commit → next task). Creates granular sub-todos for each task (read requirements, implement, test, review, address issues, commit). With `--auto` flag, automatically commits and continues to next task; without flag, stops after each task for human review. Uses smart commit strategy (commits after testing, or before review for complex changes > 200 lines). Commit messages describe what was accomplished (not task numbers). Invokes implementing-tasks skill which launches research agents when stuck, reviewing-code skill which launches all 3 review agents in parallel, and testing skill for validation.

**`/orchestrate [REQUEST]`**: End-to-end workflow from planning through completion. Combines `/plan-feature` and `/implement-plan` in single command with user confirmation between phases.

### Skills

**implementing-tasks**: Invoked by `/implement-plan` for tasks in implementation/. When stuck, marks task as STUCK and launches 2-3 research agents in parallel based on blocker type. Uses research-synthesis skill to consolidate findings and update task file.

**reviewing-code**: Invoked by `/implement-plan` for tasks in review/. Performs initial review scoring (security, quality, performance, tests), then launches all 3 review agents in parallel (test-coverage-analyzer, error-handling-reviewer, security-reviewer). Consolidates findings by confidence/severity and decides APPROVE or REJECT.

**testing**: Invoked by `/implement-plan` for tasks in testing/. Runs test suite, validates completion criteria, moves to completed/ on success.

### Design Philosophy

- **Agents for specialized analysis**: Each agent has single, clear responsibility with detailed output format
- **Parallel invocation**: All agents designed for parallel execution (2-3 research, 3 review)
- **Skills orchestrate agents**: Skills determine which agents to launch and consolidate findings
- **Model optimization**: Haiku for research (cost-efficient), Sonnet for review (quality-critical)
- **Sprint-based planning**: Same technical-planning rigor every sprint - context accumulates but process stays consistent
- **Stateful kanban**: Tasks move through directories based on status (pending → implementation → review → testing → completed)
- **End-to-end per task**: Each task completes fully (implement → review → fix → commit) before moving to next, with granular sub-todos for visibility. Smart commits per task with descriptive messages (not task numbers).

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

**Commands vs Skills vs Agents**: Commands are explicit user entry points with arguments (`/breakdown spec.md`). Skills are reusable methodologies Claude can invoke proactively or on request ("use systematic debugging"). Agents are specialized subprocesses with isolated context for focused analysis (run via Task tool). This three-tier separation allows: (1) commands to orchestrate workflows, (2) skills to guide methodology and invoke agents, (3) agents to perform specialized analysis in parallel.

**Agents are for specialized analysis, not general workflows**: Agents should have single, clear responsibilities with detailed output formats (research-breadth for surveys, test-coverage-analyzer for test gaps). General workflows use skills that orchestrate agents. Methodologies (debugging, prompt engineering) are skills, not agents.

**Stateful commands**: `/breakdown` and `/do` (essentials) maintain state in the spec document itself rather than in separate tracking. This makes the spec document the single source of truth for project progress. Similarly, `/new-post` and `/polish` (writing) maintain state in braindump.md and draft.md files.

**Markdown for everything**: Human-readable, version control friendly, no compilation required. Skills are structured as comprehensive frameworks with decision trees and quality checklists embedded directly in markdown.

**Reference subdirectories**: Complex skills (debugging, technical-planning, brainstorming, research-synthesis) include `reference/` directories with supporting materials that provide deeper context without cluttering the main skill file. Following best practices: keep SKILL.md under 500 lines, move examples and detailed patterns to reference files.

**Conversation-driven workflow** (writing plugin): Emphasizes natural dialogue over rigid command sequences. Skills guide conversation flow (brainstorming → research → drafting → polishing), while commands are minimal utilities (`/new-post`, `/polish`). Most operations happen through chat, not separate commands.

**Two-document pattern** (writing plugin): Separates messy ideation (braindump.md) from polished output (draft.md). Allows back-and-forth collaboration without polluting the final deliverable. Similar to how `/breakdown` creates task lists separate from implementation.

**Parallel agent invocation** (experimental plugin): Agents designed for parallel execution using Promise.all pattern. Research agents (2-3 launched together), review agents (all 3 launched together). Skills consolidate findings using confidence scores, severity ratings, and synthesis methodology. This reduces latency and provides comprehensive analysis from multiple specialized perspectives.

**Sprint-based planning** (experimental plugin): `/plan-feature` applies same technical-planning rigor every sprint. Initial sprint starts fresh; continuing sprints load context from completed work (learnings, architectural decisions, resolved/new risks) before applying the full planning process. Context accumulates but process stays consistent - like an agile scrum master running sprint planning.
