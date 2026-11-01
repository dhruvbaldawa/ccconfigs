# Architecture Decisions

## Commands vs Skills vs Agents

Commands are explicit user entry points with arguments (`/new-post "topic"`). Skills are reusable methodologies Claude can invoke proactively or on request ("use systematic debugging"). Agents are specialized subprocesses with isolated context for focused analysis (run via the Agent tool). This three-tier separation allows: (1) commands to orchestrate workflows, (2) skills to guide methodology and invoke agents, (3) agents to perform specialized analysis in parallel.

## Agents are for specialized analysis, not general workflows

Agents should have single, clear responsibilities with detailed output formats (senior-engineer-reviewer for design, test-reviewer for test quality). General workflows use skills that orchestrate agents. Methodologies (debugging, planning) are skills, not agents.

## Stateful commands

`/new-post` and `/polish` (writing) maintain state in braindump.md and draft.md files. Conveyor (essentials) keeps shared state for a run in `.conveyor/<task-slug>/context.md`.

## Markdown for everything

Human-readable, version control friendly, no compilation required. Skills are structured as comprehensive frameworks with decision trees and quality checklists embedded directly in markdown.

## Reference subdirectories

Complex skills (debugging, conveyor, codebase-design, prototype, teach) include `reference/` directories with supporting materials that provide deeper context without cluttering the main skill file. Following best practices: keep SKILL.md under 500 lines, move examples and detailed patterns to reference files.

## Conversation-driven workflow (writing plugin)

Emphasizes natural dialogue over rigid command sequences. Skills guide conversation flow (ideation → research → drafting → polishing), while commands are minimal utilities (`/new-post`, `/polish`). Most operations happen through chat, not separate commands.

## Two-document pattern (writing plugin)

Separates messy ideation (braindump.md) from polished output (draft.md). Allows back-and-forth collaboration without polluting the final deliverable.

## Parallel agent invocation

Launch independent Agent calls in a single message so they run concurrently: conveyor runs senior-engineer-reviewer and test-reviewer in parallel on each slice.

---

# Tool Integration Patterns

## Progress Tracking

Skills and commands don't name a todo tool: Claude Code offers the task-tracking tools only on older models, and current models track multi-step work without one. Put durable progress in the plan or task file instead.

## Agent Tool for Agent Invocation

Invoke a plugin agent by its namespaced name; the agent file supplies the prompt, so pass only the task context:

```
Agent(
  description: "Review the slice diff for test quality",
  prompt: "[Diff scope, task workspace path, review round]",
  subagent_type: "essentials:test-reviewer"
)
```

For parallel invocation, put multiple Agent calls in a single message.
