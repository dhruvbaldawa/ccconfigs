# Architecture Decisions

## Commands vs Skills vs Agents

Commands are explicit user entry points with arguments (`/breakdown spec.md`). Skills are reusable methodologies Claude can invoke proactively or on request ("use systematic debugging"). Agents are specialized subprocesses with isolated context for focused analysis (run via Task tool). This three-tier separation allows: (1) commands to orchestrate workflows, (2) skills to guide methodology and invoke agents, (3) agents to perform specialized analysis in parallel.

## Agents are for specialized analysis, not general workflows

Agents should have single, clear responsibilities with detailed output formats (research-breadth for surveys, test-coverage-analyzer for test gaps). General workflows use skills that orchestrate agents. Methodologies (debugging, prompt engineering) are skills, not agents.

## Stateful commands

`/breakdown` and `/do` (essentials) maintain state in the spec document itself rather than in separate tracking. This makes the spec document the single source of truth for project progress. Similarly, `/new-post` and `/polish` (writing) maintain state in braindump.md and draft.md files.

## Markdown for everything

Human-readable, version control friendly, no compilation required. Skills are structured as comprehensive frameworks with decision trees and quality checklists embedded directly in markdown.

## Reference subdirectories

Complex skills (debugging, technical-planning, brainstorming, research-synthesis) include `reference/` directories with supporting materials that provide deeper context without cluttering the main skill file. Following best practices: keep SKILL.md under 500 lines, move examples and detailed patterns to reference files.

## Conversation-driven workflow (writing plugin)

Emphasizes natural dialogue over rigid command sequences. Skills guide conversation flow (brainstorming → research → drafting → polishing), while commands are minimal utilities (`/new-post`, `/polish`). Most operations happen through chat, not separate commands.

## Two-document pattern (writing plugin)

Separates messy ideation (braindump.md) from polished output (draft.md). Allows back-and-forth collaboration without polluting the final deliverable. Similar to how `/breakdown` creates task lists separate from implementation.

## Parallel agent invocation (experimental plugin)

Agents designed for parallel execution using Promise.all pattern. Research agents (2-3 launched together), review agents (all 3 launched together). Skills consolidate findings using confidence scores, severity ratings, and synthesis methodology. This reduces latency and provides comprehensive analysis from multiple specialized perspectives.

## Sprint-based planning (experimental plugin)

`/plan-feature` applies same technical-planning rigor every sprint. Initial sprint starts fresh; continuing sprints load context from completed work (learnings, architectural decisions, resolved/new risks) before applying the full planning process. Context accumulates but process stays consistent - like an agile scrum master running sprint planning.

---

# Tool Integration Patterns

## TodoWrite for Progress Tracking

Use TodoWrite in skills and commands for multi-step workflows:

- **debugging**: Track UNDERSTAND checklist steps (U-N-D-E-R-S-T-A-N-D)
- **technical-planning**: Track planning phases (1-4) and deferral decisions
- **fix-quality**: Track issues by category (root cause, alternatives, ignores)
- **optimize-doc**: Track optimization passes per section
- **implementing-tasks**: Convert LLM Prompt steps into todos
- **testing**: Track validation steps and gap identification

**Exemplar**: `/implement-plan` command (Step 0) shows the gold standard for TodoWrite integration - converts Validation checklist, Working Result, and Implementation Guidance into specific, actionable todos.

## Task Tool for Agent Invocation

Invoke specialized agents using Task tool with `subagent_type="general-purpose"`:

```
Task(
  description: "Analyze test coverage",
  prompt: "[Full agent prompt with context]",
  subagent_type: "general-purpose"
)
```

For parallel invocation, call multiple Task invocations in a single message.
