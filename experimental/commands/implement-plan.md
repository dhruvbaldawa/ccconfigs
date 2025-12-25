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

## Session Start

Before claiming any task, verify baseline state:

1. **Check last completed task** (if any exist in `completed/`):
   - Read most recent task file's `**testing:**` block
   - Extract test status (e.g., "142/142 passing")

2. **Determine baseline**:
   - If tests were green (all passing) → Trust baseline, continue
   - If tests were red OR no completed tasks → Run test suite first
   - If tests fail now → Fix before claiming new work

3. **Report session state**:
   ```
   Session: [NEW | RESUMING]
   Baseline: [GREEN (trusted from task XXX) | VERIFIED (ran suite) | FIXING (X failures)]
   Progress: X completed | Y pending
   ```

This prevents cascading failures where new work compounds bugs from previous sessions.

## Main Loop

**Flow:** Continue through stages automatically when things proceed normally. Stop and ask for input when:
- Task is STUCK or blocked
- Unexpected issues discovered (failing tests, security concerns, architectural questions)
- Commit confirmation needed (without `--auto` flag)
- Review finds CRITICAL issues worth discussing before fix

While tasks remain:

### 1. Claim Task
- Find next task with met dependencies
- Move: `pending/NNN-*.md → implementation/`
- Create todos from task's Validation checklist

### 2. Implementation
- Report: `🔨 Implementing Task X/Y: [name]`
- Invoke skill: `implementing-tasks`
- When skill reports `✅ Implementation complete`, immediately check Status and proceed:
  - If STUCK: Stop, show blocker, ask user
  - If READY_FOR_TESTING: Move to `testing/` → step 3
  - If READY_FOR_REVIEW: Move to `review/` → step 4

### 3. Testing
- Report: `🧪 Testing Task X/Y: [name]`
- Invoke skill: `testing`
- When skill reports `✅ Testing complete`, immediately check Status and proceed:
  - If NEEDS_FIX: Move back to `implementation/` → step 2
  - If READY_FOR_REVIEW: Move to `review/` → step 4

### 4. Review
- Report: `🔍 Reviewing Task X/Y: [name]`
- Invoke skill: `reviewing-code` (launches 3 review agents in parallel)
- When skill reports `✅ Review complete`, immediately check Status and proceed:
  - If REJECTED: Move back to `implementation/` → step 2
  - If APPROVED: Move to `completed/` → step 5

### 5. Commit

**Before commit (both modes):**
1. Append completion metadata to task file using Edit tool (add to end of file):
   ```markdown
   **completed:**
   - Session: [ISO timestamp]
   ```

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

- **Smooth flow with checkpoints**: Continue between stages when proceeding normally. Stop for user input when stuck, unexpected issues arise, or decisions are needed
- **Session start verification**: Check last completed task's test status before claiming new work
- **End-to-end per task**: implement → test → review → commit → next
- **Per-task commit confirmation**: Previous "yes" does NOT carry over to subsequent tasks
- **Task files committed**: Code + task file in each commit (git history shows project progress)
- **Completion metadata**: Before commit, append session timestamp to task file (commit hash available via git history)
- **Flag detection**: Always report "Flag check: --auto is [PRESENT/ABSENT]" at start
- **Descriptive commits**: Message describes what was accomplished (not "Complete task NNN")
- **Track rejections**: Warn if task rejected >3 times
- **Skills run in main conversation**: Full visibility into implementation/review
- **Orchestrator moves files**: Based on Status field in task file
- **State persists**: Resume anytime with `/implement-plan {{ARGS}}`
