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
- `--auto`: If present, automatically commit after each successful task and continue to the next. Without this flag, stop after each task for human review.

## Your Task

Orchestrate **implementation**, **testing**, and **review** skills to complete all tasks **end-to-end** per task.

### Setup

1. Verify plan exists: Check `.plans/{{ARGS}}/pending/` has tasks. If not: "❌ Plan not found. Run: /plan-feature [description] first"
2. Detect `--auto` flag in arguments (if present, enable auto-commit mode)
3. Create initial todo list with all pending tasks: `☐ Task NNN: [name]` for each task in pending/

### Main Loop

While tasks in pending/ OR in-flight:

#### 0. Setup Current Task Todos
Before starting task NNN:
- Read the task file sections: Goal, Working Result, Validation checklist, Implementation Guidance
- **Use TodoWrite to create specific todos from the task description:**
  - Convert **Validation** checklist items directly to todos
  - Break down **Working Result** into concrete steps
  - Extract key requirements from **Implementation Guidance**
  - Example from task file with Validation checklist:
    ```
    [ ] Pydantic models validate input correctly
    [ ] JWT token handling implemented
    [ ] All tests passing
    [ ] Code passes linting
    ```
    Becomes todos:
    - "Implement Pydantic validation for User model"
    - "Add JWT token handling to auth model"
    - "Write and pass all unit tests"
    - "Fix linting issues"
- Use TodoWrite throughout to track progress as you work

#### 1. Find Next Task
Find task in `pending/` with met dependencies (check Dependencies field, verify in `completed/`)

#### 2. Implementation Phase
- Move: `pending/NNN-*.md → implementation/NNN-*.md`
- Report: `🔨 Implementing Task X/Y: [name]`
- **Invoke implementing-tasks skill** - follow its complete process
  - Critical: ALL tests must pass (no exceptions, no "tests not part of task" rationalizations)
  - Critical: ALL linting/quality checks must pass (fix ALL issues, not just task-specific ones)
  - If STUCK: Launch research agents per skill guidance
- Read Status from task file after update
- If `READY_FOR_TESTING`: Move to `testing/`, report "Task X/Y → testing"
- If `STUCK`: STOP, show blocker, ask user how to proceed

#### 3. Testing Phase
- Report: `🧪 Testing Task X/Y: [name]`
- **Invoke testing skill** - follow its complete process
  - Critical: Validate ALL tests passing (full suite, no skips)
  - Critical: Validate ALL linting/quality checks passing (no regressions)
  - Critical: Verify >80% statement coverage, >75% branch coverage
- Read Status from task file after update
- If `READY_FOR_REVIEW`: Move to `review/`, report "Task X/Y → review"
- If `NEEDS_FIX`: Move back to `implementation/`, loop back to step 2

#### 4. Review Phase
- Report: `🔍 Reviewing Task X/Y: [name]`
- **Invoke reviewing-code skill** - follow its complete process, do NOT skip steps or substitute ad-hoc reviews
  - Critical: Verify ALL tests passing (run full test suite, no exceptions)
  - Critical: Verify ALL linting/quality checks passing (no warnings, no "not part of task" excuses)
  - Critical: Launch all 3 review agents in parallel (test-coverage-analyzer, error-handling-reviewer, security-reviewer)
  - Critical: REJECT if Security <80 OR any CRITICAL findings OR any tests failing OR any linting errors
- Read Status from task file after update
- If `APPROVED`: Move to `completed/`, report "✅ Task X/Y approved"
- If `REJECTED`:
  - Move back to `implementation/`, show rejection reasons
  - Fix ALL blocking issues from review
  - Loop back to step 2 (re-implement → re-test → re-review)

#### 5. Commit Phase
After successful review (Status = APPROVED):

**CRITICAL: Detect --auto flag before any commit action**

STEP 1: Check command arguments for "--auto" flag
- Parse the original command arguments: `{{ARGS}}`
- Output explicitly: "Flag check: --auto is [PRESENT/ABSENT]"

STEP 2: Route to the correct workflow based on flag detection

<auto_flag_absent>
**DEFAULT BEHAVIOR (--auto flag ABSENT):**

This is the MOST COMMON case. DO NOT commit automatically.

**IMPORTANT: Each task requires its own commit confirmation. Previous "yes" responses do NOT carry over to subsequent tasks.**

You MUST follow this exact sequence FOR EVERY TASK:

1. Draft descriptive commit message:
   - Read task file to understand Goal and Working Result
   - Describe **what was accomplished** (not "Complete task NNN")
   - Use conventional commit format if applicable (feat:, fix:, refactor:, etc.)
   - Example: "Add user authentication with JWT tokens" NOT "Complete task 001"

2. Report to user:
   ```
   ✅ Task X/Y completed and approved.

   Proposed commit message:
   [Show full commit message here]

   Ready to commit. Please respond:
   - "commit" or "yes" to proceed with commit
   - "skip" to move to next task without committing
   - "edit [message]" to use a different commit message
   ```

3. STOP and WAIT for user response
   - DO NOT proceed until user responds
   - DO NOT commit automatically
   - DO NOT continue to next task
   - DO NOT assume previous "yes" applies to this task

4. After user responds:
   - If "commit" or "yes":
     * Execute git commit with the proposed message
     * Report: "✅ Committed. Moving to next task..."
     * Continue to next task (loop back to step 0)
   - If "skip":
     * Report: "Skipping commit. Moving to next task..."
     * Move to next task without committing
   - If "edit [message]":
     * Execute git commit with their provided message
     * Report: "✅ Committed with custom message. Moving to next task..."
     * Continue to next task (loop back to step 0)

**Note:** The user's response applies ONLY to the current task. When the next task completes, you MUST prompt for commit confirmation again.
</auto_flag_absent>

<auto_flag_present>
**AUTOMATIC BEHAVIOR (--auto flag PRESENT):**

Only use this workflow if "--auto" was detected in command arguments.

1. Draft descriptive commit message:
   - Read task file to understand Goal and Working Result
   - Describe **what was accomplished** (not "Complete task NNN")
   - Use conventional commit format if applicable (feat:, fix:, refactor:, etc.)

2. Execute git commit automatically:
   ```bash
   git add .
   git commit -m "$(cat <<'EOF'
   [Descriptive commit message]
   EOF
   )"
   ```

3. Report: `✅ Task X/Y committed automatically, moving to next task...`

4. Continue to next task immediately (loop back to step 0)
</auto_flag_present>

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

- **End-to-end per task**: Each task goes through implementation → testing → review → commit → next task
- **Meaningful todos**: Creates specific, actionable todos based on actual work (not generic templates)
- **Commit timing**: Always after review approval (tests already validated in testing phase)
- **Flag detection**: Always checks for `--auto` flag and explicitly reports whether it's PRESENT or ABSENT
- **Auto mode** (`--auto` flag PRESENT): Commits automatically and continues to next task without stopping
- **Manual mode** (`--auto` flag ABSENT - DEFAULT): Stops BEFORE committing each task. Displays proposed commit message and WAITS for user confirmation. Each task requires its own confirmation - previous "yes" does NOT carry over.
- **Descriptive commits**: Commit messages describe what was accomplished (not task numbers)
- **Skills run in main conversation** (full visibility)
- **Orchestrator moves files** based on Status field
- **State persists** (resume anytime with `/implement-plan {{ARGS}}`)
- **Track rejection count** per task (warn if >3)
