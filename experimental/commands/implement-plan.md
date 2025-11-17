---
description: Execute tasks from pending/ through Kanban flow (implementation → review → testing)
argument-hint: [PROJECT] [--auto]
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git status:*)
---

# Implement Plan

Execute tasks from `.plans/{{ARGS}}/pending/` through Kanban flow.

## Usage

```
/implement-plan user-authentication
/implement-plan realtime-notifications --auto
```

**Flags:**
- `--auto`: If present, automatically commit after each successful task and continue to the next. Without this flag, stop after each task for human review.

## Your Task

Orchestrate **implementation**, **review**, and **testing** skills to complete all tasks **end-to-end** per task.

### Setup

1. Verify plan exists: Check `.plans/{{ARGS}}/pending/` has tasks. If not: "❌ Plan not found. Run: /plan-feature [description] first"
2. Detect `--auto` flag in arguments (if present, enable auto-commit mode)
3. Create initial todo list with all pending tasks: `☐ Task NNN: [name]` for each task in pending/

### Main Loop

While tasks in pending/ OR in-flight:

#### 0. Setup Current Task Todos
Before starting task NNN:
- **Create granular sub-todos** for this specific task using TodoWrite:
  ```
  ☐ Read Task NNN requirements and guidance
  ☐ Implement Task NNN functionality
  ☐ Write tests for Task NNN
  ☐ Review Task NNN implementation
  ☐ Address review issues (if any)
  ☐ Commit Task NNN changes
  ☐ Move to next task
  ```
- Mark "Read Task NNN requirements" as in_progress

#### 1. Find Next Task
Find task in `pending/` with met dependencies (check Dependencies field, verify in `completed/`)

#### 2. Implementation Phase
- Move: `pending/NNN-*.md → implementation/NNN-*.md`
- Mark todo "Implement Task NNN functionality" as in_progress
- Report: `🔨 Implementing Task X/Y: [name]`
- Invoke implementation skill: "Implement .plans/{{ARGS}}/implementation/NNN-*.md"
- Mark "Implement Task NNN functionality" as completed
- Read Status from task file
- If `READY_FOR_REVIEW`:
  - Mark "Write tests for Task NNN" as completed
  - Move to `review/`, report "Task X/Y → review"
- If `STUCK`: STOP, show blocker, ask user how to proceed

#### 3. Review Phase
- Mark todo "Review Task NNN implementation" as in_progress
- Report: `🔍 Reviewing Task X/Y: [name]`
- Invoke review skill: "Review .plans/{{ARGS}}/review/NNN-*.md"
- Read Status from task file
- If `APPROVED`:
  - Mark "Review Task NNN implementation" as completed
  - Move to `testing/`, report "✅ Task X/Y approved → testing"
- If `REJECTED`:
  - Mark "Review Task NNN implementation" as completed
  - Mark "Address review issues (if any)" as in_progress
  - Move back to `implementation/`, show rejection reasons
  - Fix issues following rejection notes
  - Mark "Address review issues (if any)" as completed
  - Loop back to step 3 for re-review

#### 4. Testing Phase
- Report: `🧪 Testing Task X/Y: [name]`
- Invoke testing skill: "Validate tests in .plans/{{ARGS}}/testing/NNN-*.md"
- Read Status from task file
- If `COMPLETED`: Move to `completed/`, report "✅ Task X/Y completed"
- If `NEEDS_FIX`: Move back to `implementation/`, loop back to step 2

#### 5. Commit Phase
After successful testing (Status = COMPLETED):

**Smart commit strategy:**
- **Simple changes** (< 200 lines, single file): Commit after testing
- **Complex changes** (> 200 lines, multiple files, significant refactoring): Commit before review if it makes sense to checkpoint progress

Mark todo "Commit Task NNN changes" as in_progress

Create descriptive commit message:
- Read task file to understand Goal and Working Result
- Draft commit message that describes **what was accomplished** (not "Complete task NNN")
- Use conventional commit format if applicable (feat:, fix:, refactor:, etc.)
- Example: "Add user authentication with JWT tokens" NOT "Complete task 001"

Commit changes:
```bash
git add .
git commit -m "$(cat <<'EOF'
[Descriptive commit message]
EOF
)"
```

Mark "Commit Task NNN changes" as completed

**If `--auto` flag present:**
- Report: `✅ Task X/Y committed, moving to next task...`
- Mark "Move to next task" as completed
- Continue to next task (loop back to step 0)

**If `--auto` flag NOT present:**
- Report: `✅ Task X/Y completed and committed. Stop for human review.`
- STOP and wait for user to run `/implement-plan {{ARGS}}` again to continue

#### 6. Progress Update
After each task: `Progress: X/Y completed | Z in-flight | W pending`

### Final Summary

When all in completed/:

1. Extract scores from review notes: `grep "Security:" completed/*.md | awk...`
2. Count rejections: `grep -c "REJECTED" completed/*.md`
3. Count commits: `git log --oneline | wc -l` since start
4. Run: `npm test`
5. Report:

```markdown
✅ Implementation Complete

Project: {{ARGS}}
Completed: X/X tasks | Rejected during review: Y (fixed)
Commits: X (one per task)

Average Review Scores:
- Security: XX/100 | Quality: XX/100 | Performance: XX/100 | Tests: XX/100

Final Test Coverage: XX% | Full suite: XXX/XXX passing

All changes committed per-task with descriptive messages.
Review: git log --oneline -X
```

## Notes

- **End-to-end per task**: Each task goes through implementation → review → fix issues → commit → next task
- **Granular todos**: Creates sub-todos for each task (implement, test, review, commit, move to next)
- **Smart commits**: Commits after testing, or before review for complex changes (> 200 lines)
- **Auto mode**: With `--auto` flag, commits and continues to next task automatically
- **Manual mode**: Without `--auto`, stops after each task for human review
- **Descriptive commits**: Commit messages describe what was accomplished (not task numbers)
- Skills run in main conversation (full visibility)
- Orchestrator moves files based on Status field
- State persists (resume anytime with `/implement-plan {{ARGS}}`)
- Track rejection count per task (warn if >3)
