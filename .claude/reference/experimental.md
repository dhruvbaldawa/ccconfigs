# The Experimental Plugin

## Overview

Multi-skill workflow system using kanban file movement for complex, high-value tasks. Features specialized agents for research, review, and capture, optimized for parallel invocation.

## Specialized Agents

**Research Agents** (3 agents - all haiku, parallel invocation):
- **research-breadth**: Broad surveys via WebSearch → Parallel Search → Perplexity (industry trends, consensus, multiple perspectives)
- **research-depth**: Deep-dive via WebFetch → Parallel Search (specific URLs, implementation details, case studies)
- **research-technical**: Official docs via Context7 (API references, method signatures, configurations)

**Review Agents** (3 agents in `agents/review/`, inherits model, parallel invocation):
- **security-reviewer**: OWASP Top 10, injection, auth bypasses, secrets handling, confidence scoring
- **quality-guardian**: Promise Theory, error handling, edge cases, maintainability, readability metrics
- **test-coverage-analyzer**: Behavioral coverage, criticality rating, test quality issues

**Capture Agents** (1 agent - haiku):
- **knowledge-capturer**: Extracts structured learnings when blockers are resolved (STUCK → resolved, REJECTED → approved)

## Agent Invocation Patterns

**Research agents** used when:
- `/research` command invoked (2-3 agents based on question type)
- `implementing-tasks` skill encounters STUCK status (automatic parallel launch)

**Review agents** used when:
- `reviewing-code` skill runs FULL review (all 3 agents in parallel for comprehensive review)
- LIGHTWEIGHT review does NOT invoke agents (quick self-scan only)

**Capture agents** used when:
- Task moves from STUCK to resolved (automatic)
- Task moves from REJECTED to approved after fixing issues (automatic)
- Phrase triggers detected: "that worked", "it's fixed", "figured it out", etc. (prompts user)

See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed multi-agent patterns.

## Slash Commands

**`/plan-feature [REQUEST]`**: Sprint planning for `.plans/<project>/`. Same rigor whether starting fresh or continuing - always invokes `technical-planning` skill (from essentials) with full risk analysis. For continuing sprints, loads context from completed work and applies learnings. Generates outcome-focused task files in pending/ following Last Responsible Moment principle.

**`/add-task [PROJECT] [TASK DESCRIPTION]`**: Adds a single ad-hoc task to an existing project's pending queue without full planning. Creates properly formatted task file in `.plans/<project>/pending/` with auto-incremented task number. Useful for adding tasks discovered during implementation or tracking quick work items. Prompts for project if not specified. Simpler than `/plan-feature` - no risk analysis, just scaffolds task structure for manual refinement.

**`/implement-plan [PROJECT] [--auto] [--express "task"]`**: Executes tasks through kanban workflow with end-to-end completion per task (implementation → review → fix issues → commit → next task).

Flags:
- `--auto`: Full autonomous mode - commits and continues without pausing
- `--express "description"`: Lightweight mode for simple changes - no task file, quick validation, direct commit

Features:
- **Session start verification**: Checks last completed task's test status before claiming new work
- **Session checkpoints**: Every 3 tasks, evaluates health indicators and recommends CONTINUE/PAUSE/ESCALATE
- **Two-tier review**: Routes to LIGHTWEIGHT or FULL review based on complexity/severity
- **Knowledge capture**: Auto-captures learnings when blockers are resolved
- **Critical patterns**: Loads and enforces project-level patterns during implementation and review

**`/orchestrate [REQUEST]`**: End-to-end workflow from planning through completion. Combines `/plan-feature` and `/implement-plan` in single command with user confirmation between phases.

**`/deepen-plan [PROJECT]`**: Enriches existing plan with parallel research, institutional learnings, and best practices. Adds "Research Insights" subsections to each plan section. Run before `/implement-plan` for complex features.

**`/triage [PROJECT] [--from-task NNN | --from-review]`**: Converts review findings into actionable todo files. Presents each finding for yes/next/custom decision. Creates properly formatted task files in pending/.

## Skills

**implementing-tasks**: Invoked by `/implement-plan` for tasks in implementation/.
- Loads critical patterns (if exists) before implementing
- When stuck, marks task as STUCK and launches 2-3 research agents in parallel
- On resolution, auto-invokes knowledge-capturer to capture learning
- Collects implementation metadata for review triage (files_changed, severity_indicators, etc.)

**reviewing-code**: Invoked by `/implement-plan` for tasks in review/.
- **Triage step**: Reads implementation_metadata to decide LIGHTWEIGHT or FULL review
- **LIGHTWEIGHT**: Quick scan for obvious issues (empty catches, hardcoded secrets), no agents
- **FULL**: Launches all 3 review agents in parallel, consolidates by confidence/severity
- Checks implementation against critical patterns (violations = CRITICAL findings)

**testing**: Invoked by `/implement-plan` for tasks in testing/. Runs test suite, validates completion criteria, moves to completed/ on success.

## Knowledge System

**Learnings** (`.plans/<project>/learnings/`):
- Auto-captured when blockers are resolved
- Phrase-triggered: "that worked", "it's fixed" → prompts for capture
- Structured format: problem, solution, root cause, prevention
- Searchable index in `learnings/index.md`
- YAML frontmatter with category, tags, confidence

**Critical Patterns** (`.plans/<project>/critical-patterns.md`):
- Promoted from high-confidence learnings that affect multiple areas
- Format: ❌ WRONG vs ✅ CORRECT with code examples
- Loaded by implementing-tasks skill before coding
- Checked by reviewing-code skill (violations block approval)

## Design Philosophy

- **Two-tier review**: Thorough when needed (security, complexity), fast when appropriate (simple changes)
- **Knowledge compounding**: Capture solutions when problems are solved, compound team knowledge
- **Phrase triggers**: Capture knowledge when it's fresh - detect resolution phrases during implementation
- **Plan enrichment**: Research before implementing - `/deepen-plan` adds institutional learnings and best practices
- **Finding→Todo pipeline**: Review findings become actionable tasks via `/triage` command
- **Express mode**: Skip ceremony for trivial work - `--express` for quick changes
- **Session checkpoints**: Periodic reflection to combat drift and tunnel vision
- **Critical patterns**: Learn once, enforce everywhere
- **Agents for specialized analysis**: Each agent has single, clear responsibility with detailed output format
- **Parallel invocation**: All agents designed for parallel execution (2-3 research, 3 review)
- **Skills orchestrate agents**: Skills determine which agents to launch and consolidate findings
- **Model optimization**: Haiku for research/capture (cost-efficient), review agents inherit from parent
- **Sprint-based planning**: Same technical-planning rigor every sprint - context accumulates but process stays consistent
- **Stateful kanban**: Tasks move through directories based on status (pending → implementation → review → testing → completed)
- **End-to-end per task**: Each task completes fully (implement → review → fix → commit) before moving to next, with granular sub-todos for visibility
- **Session continuity**: Task files track completion metadata (commit hash, session timestamp, test status) enabling new sessions to quickly orient and verify baseline before starting new work
