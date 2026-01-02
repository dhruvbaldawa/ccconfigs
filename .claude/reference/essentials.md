# The Essentials Plugin

## Slash Commands

**`/breakdown [SPEC DOCUMENT]`**: Creates structured, agile task breakdowns from design documents following the **Last Responsible Moment** principle. Outputs iterations with tasks that include status, goals, constraints, dependencies, implementation guidance (not step-by-step instructions), and validation checklists. Tasks focus on outcomes and provide context for decision-making rather than prescribing implementation details. Designed to work iteratively - generates one iteration at a time to avoid token limits.

**`/do [SPEC DOCUMENT] [TASK NUMBER | --resume] [ADDITIONAL CONTEXT] [--auto]`**: Executes tasks from breakdown documents. Updates task status to "In Progress", reads the implementation guidance to understand context and considerations, makes informed implementation decisions during development, and validates completion criteria. With `--auto` flag, automatically commits after each task and continues to the next. Supports `--resume` to continue from first incomplete task.

**`/optimize-doc [DOCUMENT]`**: Optimizes documentation for conciseness and clarity. Strengthens vague instructions, removes redundancy while preserving correctness. Can run idempotently - multiple passes won't degrade quality.

**`/research [TASK FILE | QUESTION]`**: Research blockers or questions using specialized research agents. Analyzes question type and launches 2-3 agents in parallel (research-breadth for industry patterns, research-depth for specific solutions, research-technical for official docs). Uses research-synthesis skill to consolidate findings. For stuck tasks, updates task file with findings. For general questions, provides summary with sources. See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed patterns.

**`/fix-quality [FILES OR PATTERN]`**: Systematically fix linting, type errors, and quality issues following root-cause-first philosophy. Priority order: (1) Fix root cause (remove unused imports, fix types), (2) Apply safety/reliability improvements (type guards, error handling), (3) Use local ignores only when necessary (inline > file > pattern > global). Documents why ignores are needed. Validates all checks pass and tests remain green. Emphasizes fixing problems over suppressing warnings.

**`/interview [TOPIC or FILE (optional)]`**: Systematic interview to deeply understand what you're trying to achieve. Use when there's ambiguity, unclear requirements, or hidden complexity. Asks **non-obvious questions** that probe the "why", constraints, edge cases, tradeoffs, and assumptions. Follows threads organically until saturation. No required output - the understanding is the value.

**Key pattern**: `/breakdown` and `/do` work with shared state in a spec document. `/interview` can be used anytime to clarify requirements or thinking. Breakdown creates the plan, do executes tasks one by one while maintaining state in the document.

## Skills

**brainstorming**: Collaborative ideation for projects and writing. Asks clarifying questions, suggests angles, challenges assumptions, helps refine vague ideas into concrete requirements or topics. Context-aware transitions - guides to technical-planning for projects or blog-writing for posts. Emphasizes drawing out user's ideas (not injecting your own).

**research-synthesis**: Research tool usage patterns and synthesis methodology. Prioritizes built-in tools (WebFetch for URLs, WebSearch for general queries), uses MCP servers as fallback (Parallel Search for advanced synthesis, Perplexity for broad surveys, Context7 for technical docs). Synthesizes findings into narrative (not just lists), integrates naturally during conversation, maintains source attribution. Includes decision tree and quality standards.

**debugging**: Systematic debugging using UNDERSTAND methodology (10-step checklist). Focuses on root cause analysis over symptom treatment. Prioritizes built-in tools (WebSearch) then MCP servers (Parallel Search for advanced research, Perplexity for broad surveys, Context7 for official docs, SequentialThinking for complex analysis). Includes antipattern awareness and decision framework for when to use which tools. Reference materials document common debugging failures.

**technical-planning**: Risk-first development methodology with Last Responsible Moment decision-making. Four-phase approach: Requirements & Risk Analysis, Milestone Planning, Implementation Strategy, Execution Framework. Emphasizes "what" over "how", defers implementation decisions until execution, manages deferral explicitly, and addresses highest-risk challenges first. Includes decision timing framework (what to decide early vs. defer), task breakdown guidelines (outcome-focused vs. prescriptive), and decision framework for handling unclear requirements.

**claude-md-authoring**: Write effective CLAUDE.md files for Claude Code. Applies HumanLayer guidelines: instruction budgets (~50 user-level, ~100 project-level), WHAT/WHY/HOW framework for project-level, universal applicability for user-level, and progressive disclosure. Includes anti-patterns (never use Claude as linter for style rules), scope decision framework, structure templates, and quality checklist.

## MCP Servers

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
