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

**conveyor**: The slice execution loop as a slim contract (per-task scripts adapt `essentials/skills/conveyor/reference/workflow-skeleton.md`; the skill explicitly authorizes the Workflow tool). One workflow call runs every slice in-band: sonnet implements, senior-engineer-reviewer + test-reviewer review the slice's uncommitted diff in parallel (first review full-depth against the whole repo; re-reviews delta-only), sonnet fixes until both approve, then a cheap deterministic commit agent (haiku-class) reruns the local checks — exit codes are the gate, not the implementer's evidence — stages exactly the planned files, commits verbatim, and pushes so CI verifies async. The expensive orchestrator never stages, reruns checks, or re-verifies approved work: it seeds, launches, monitors, intervenes on exceptions, and reports. Checks are two-tier, declared at seed in `.conveyor/<task-slug>/context.md`: **local** (fast — lint, typecheck, affected tests; the per-commit floor that never lowers) and **CI** (pipeline owns the full suite; no CI → local = everything). Exceptions end the run early with structured state — rounds cap, any resolvable finding flagged three times task-wide (`standing` reservations exempt — they get owners in the report), a rejection with zero blocking findings (vacuous fix dispatches invite improvisation), an identical blocker set across rounds, stuck or null subagents (died vs classifier-blocked), red/un-greenable/un-runnable checks, unplanned tree changes, classifier flags, merge conflicts, CI red after a fix round — then `resumeFromRunId` replays completed slices from cache; interventions change `args`, never the script body, and carry the same context.md append obligation. The environment is pre-flighted at seed: local checks classified green / needs-sandbox-disable / cannot-run-here (the last demotes to CI or a named human gate), git probed (SSH commit/push needing sandbox-disable is a sanctioned, recorded escalation — config-level controls still apply; the literal flag stays out of script text), and the integration target (branch, push destination, PR-vs-direct) recorded so no commit agent infers it from HEAD. Reviewer verdicts are one shared schema enum (REJECT / NEEDS WORK / APPROVED WITH RESERVATIONS / SHIP IT) — off-scale labels can't occur. Shared memory in context.md (subagents read first — including Known environment facts — and append after); each slice's review ledger is written deterministically by the commit agent from captured verdict JSON, so the record never depends on reviewer diligence. Approvals carry across fix rounds — only the rejecting reviewer re-reviews, with re-reviews fed the latest fix evidence, unless a fix went beyond the findings (path-normalized, workspace writes excluded), which stales carried approvals and brings both back at full depth. Reservations get an owner and deadline slice; a finding a reviewer would re-flag next round is blocking by definition, and a core behavior no check can exercise returns as an `unverified:<property>` finding at blocker grade. Implementers propose plan file-list corrections via `extraFiles` (reviewers gate the addition). Parallel slices only when clearly independent, capped at 2-3, own worktrees, in-order merge-back. Rounds cap set per task — no assumed default.

## Agents

**senior-engineer-reviewer** (claude-opus-4-6[1m], xhigh): Brutal architecture/maintainability review with a round-aware contract — first review judges the diff against the whole repo; re-reviews are delta-only against prior findings. Verdicts on the shared reviewer scale: REJECT / NEEDS WORK / APPROVED WITH RESERVATIONS / SHIP IT — approved means the last two. Writes only to the task workspace, never the code under review. Half of the conveyor review gate.

**test-reviewer** (sonnet, xhigh): Brutal test-quality review — useless tests, flaky patterns, missing assertions, isolation failures; same round-aware contract. Verdicts on the same shared scale: REJECT / NEEDS WORK / APPROVED WITH RESERVATIONS / SHIP IT — approved means the last two. The other half of the gate.

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
