---
description: Execute tasks from pending/ through Kanban flow (implementation → testing → review)
argument-hint: [PROJECT] [--auto]
---

# Implement Plan

Execute tasks from `.plans/{{ARGS}}/pending/` through Kanban flow.

## Usage

```
/implement-plan user-authentication
/implement-plan realtime-notifications --auto
```

**Flags:**
- `--auto`: Auto-commit after each task and continue. Without flag, prompt for commit confirmation per task.

## Setup

1. Verify `.plans/{{ARGS}}/pending/` has tasks (if not: "Run /plan-feature first")
2. Detect `--auto` flag, report: "Flag check: --auto is [PRESENT/ABSENT]"
3. Create todo list from pending tasks

## Main Loop

While tasks remain:

### 1. Claim Task
- Find next task with met dependencies
- Move: `pending/NNN-*.md → implementation/`
- Create todos from task's Validation checklist

### 2. Implementation
- Report: `🔨 Implementing Task X/Y: [name]`
- **Invoke implementing-tasks skill**
- If STUCK: Stop, show blocker, ask user
- If READY_FOR_TESTING: Move to `testing/`

### 3. Testing
- Report: `🧪 Testing Task X/Y: [name]`
- **Invoke testing skill**
- If NEEDS_FIX: Move back to `implementation/`, loop
- If READY_FOR_REVIEW: Move to `review/`

### 4. Review
- Report: `🔍 Reviewing Task X/Y: [name]`
- **Invoke reviewing-code skill** (launches 3 review agents in parallel)
- If REJECTED: Move back to `implementation/`, fix issues, loop
- If APPROVED: Move to `completed/`

### 5. Commit

**With `--auto`:** Commit automatically, continue to next task.

**Without `--auto` (default):**
1. Draft descriptive commit message (what was accomplished, not "task NNN")
2. Show message, ask: "commit/yes", "skip", or "edit [message]"
3. **STOP and WAIT** - each task needs its own confirmation
4. Stage code + task file: `git add . .plans/{{ARGS}}/completed/NNN-*.md`
5. Commit, then continue to next task

### 6. Progress
Report: `Progress: X/Y completed | Z in-flight | W pending`

## Final Summary

```
✅ Implementation Complete

Project: {{ARGS}}
Completed: X/X tasks | Commits: X
Average Review Scores: Security: XX | Quality: XX | Tests: XX
Final Test Coverage: XX%
```

## Key Behaviors

- **End-to-end per task**: implement → test → review → commit → next
- **Per-task commit confirmation**: Previous "yes" does NOT carry over
- **Task files committed**: Code + task file in each commit
- **Skills run in main conversation**: Full visibility
- **State persists**: Resume anytime with `/implement-plan {{ARGS}}`
