---
description: Execute tasks from pending/ through Kanban flow (implementation → review → testing)
---

# Implement Plan

Execute tasks from `.plans/{{ARGS}}/pending/` through Kanban flow.

## Usage

```
/implement-plan user-authentication
/implement-plan realtime-notifications
```

## Your Task

Orchestrate **implementation**, **review**, and **testing** skills to complete all tasks.

### Setup

Verify plan exists: Check `.plans/{{ARGS}}/pending/` has tasks. If not: "❌ Plan not found. Run: /plan-feature [description] first"

### Main Loop

While tasks in pending/ OR in-flight:

#### 1. Find Next Task
Find task in `pending/` with met dependencies (check Dependencies field, verify in `completed/`)

#### 2. Implementation Phase
- Move: `pending/NNN-*.md → implementation/NNN-*.md`
- Report: `🔨 Implementing Task X/Y: [name]`
- Invoke implementation skill: "Implement .plans/{{ARGS}}/implementation/NNN-*.md"
- Read Status from task file
- If `READY_FOR_REVIEW`: Move to `review/`, report "Task X/Y → review"
- If `STUCK`: STOP, show blocker, ask user how to proceed

#### 3. Review Phase
- Report: `🔍 Reviewing Task X/Y: [name]`
- Invoke review skill: "Review .plans/{{ARGS}}/review/NNN-*.md"
- Read Status from task file
- If `APPROVED`: Move to `testing/`, report "✅ Task X/Y approved → testing"
- If `REJECTED`: Move back to `implementation/`, show rejection reasons, loop back to step 2

#### 4. Testing Phase
- Report: `🧪 Testing Task X/Y: [name]`
- Invoke testing skill: "Validate tests in .plans/{{ARGS}}/testing/NNN-*.md"
- Read Status from task file
- If `COMPLETED`: Move to `completed/`, report "✅ Task X/Y completed"
- If `NEEDS_FIX`: Move back to `implementation/`, loop back to step 2

#### 5. Progress Update
After each task: `Progress: X/Y completed | Z in-flight | W pending`

### Final Summary

When all in completed/:

1. Extract scores from review notes: `grep "Security:" completed/*.md | awk...`
2. Count rejections: `grep -c "REJECTED" completed/*.md`
3. Run: `npm test`
4. Report:

```markdown
✅ Implementation Complete

Project: {{ARGS}}
Completed: X/X tasks | Rejected during review: Y (fixed)

Average Review Scores:
- Security: XX/100 | Quality: XX/100 | Performance: XX/100 | Tests: XX/100

Final Test Coverage: XX% | Full suite: XXX/XXX passing

Next: git add . && git commit -m "Implement {{ARGS}}"
```

## Notes

- Skills run in main conversation (full visibility)
- Orchestrator moves files based on Status field
- State persists (resume anytime with `/implement-plan {{ARGS}}`)
- Track rejection count per task (warn if >3)
