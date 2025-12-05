# The Experimental Plugin

## Overview

Multi-skill workflow system using kanban file movement for complex, high-value tasks. Features 6 specialized agents organized in 2 categories (research, review), all optimized for parallel invocation.

## Specialized Agents

**Research Agents** (3 agents - all haiku, parallel invocation):
- **research-breadth**: Broad surveys via WebSearch → Parallel Search → Perplexity (industry trends, consensus, multiple perspectives)
- **research-depth**: Deep-dive via WebFetch → Parallel Search (specific URLs, implementation details, case studies)
- **research-technical**: Official docs via Context7 (API references, method signatures, configurations)

**Review Agents** (3 agents - all sonnet, parallel invocation):
- **test-coverage-analyzer**: Behavioral test gaps with 1-10 criticality ratings
- **error-handling-reviewer**: Silent failures and poor error handling with severity levels
- **security-reviewer**: OWASP Top 10 vulnerabilities with 0-100 confidence scores

## Agent Invocation Patterns

**Research agents** used when:
- `/research` command invoked (2-3 agents based on question type)
- `implementing-tasks` skill encounters STUCK status (automatic parallel launch)

**Review agents** used when:
- `reviewing-code` skill runs (all 3 agents in parallel for comprehensive review)

See `essentials/skills/research-synthesis/reference/multi-agent-invocation.md` for detailed multi-agent patterns.

## Slash Commands

**`/plan-feature [REQUEST]`**: Sprint planning for `.plans/<project>/`. Same rigor whether starting fresh or continuing - always invokes `technical-planning` skill (from essentials) with full risk analysis. For continuing sprints, loads context from completed work and applies learnings. Generates outcome-focused task files in pending/ following Last Responsible Moment principle.

**`/add-task [PROJECT] [TASK DESCRIPTION]`**: Adds a single ad-hoc task to an existing project's pending queue without full planning. Creates properly formatted task file in `.plans/<project>/pending/` with auto-incremented task number. Useful for adding tasks discovered during implementation or tracking quick work items. Prompts for project if not specified. Simpler than `/plan-feature` - no risk analysis, just scaffolds task structure for manual refinement.

**`/implement-plan [PROJECT] [--auto]`**: Executes tasks through kanban workflow with end-to-end completion per task (implementation → review → fix issues → commit → next task). **Session start verification**: checks last completed task's test status before claiming new work - only runs test suite if tests were red or no prior completions (prevents cascading failures from previous sessions). Creates granular sub-todos for each task (read requirements, implement, test, review, address issues, commit). With `--auto` flag, automatically commits and continues to next task; without flag, stops after each task for human review. **Completion metadata**: appends commit hash + session timestamp to task files after each commit for session continuity. Commit messages describe what was accomplished (not task numbers). Invokes implementing-tasks skill which launches research agents when stuck, reviewing-code skill which launches all 3 review agents in parallel, and testing skill for validation.

**`/orchestrate [REQUEST]`**: End-to-end workflow from planning through completion. Combines `/plan-feature` and `/implement-plan` in single command with user confirmation between phases.

## Skills

**implementing-tasks**: Invoked by `/implement-plan` for tasks in implementation/. When stuck, marks task as STUCK and launches 2-3 research agents in parallel based on blocker type. Uses research-synthesis skill to consolidate findings and update task file.

**reviewing-code**: Invoked by `/implement-plan` for tasks in review/. Performs initial review scoring (security, quality, performance, tests), then launches all 3 review agents in parallel (test-coverage-analyzer, error-handling-reviewer, security-reviewer). Consolidates findings by confidence/severity and decides APPROVE or REJECT.

**testing**: Invoked by `/implement-plan` for tasks in testing/. Runs test suite, validates completion criteria, moves to completed/ on success.

## Design Philosophy

- **Agents for specialized analysis**: Each agent has single, clear responsibility with detailed output format
- **Parallel invocation**: All agents designed for parallel execution (2-3 research, 3 review)
- **Skills orchestrate agents**: Skills determine which agents to launch and consolidate findings
- **Model optimization**: Haiku for research (cost-efficient), Sonnet for review (quality-critical)
- **Sprint-based planning**: Same technical-planning rigor every sprint - context accumulates but process stays consistent
- **Stateful kanban**: Tasks move through directories based on status (pending → implementation → review → testing → completed)
- **End-to-end per task**: Each task completes fully (implement → review → fix → commit) before moving to next, with granular sub-todos for visibility. Smart commits per task with descriptive messages (not task numbers).
- **Session continuity**: Task files track completion metadata (commit hash, session timestamp, test status) enabling new sessions to quickly orient and verify baseline before starting new work.
