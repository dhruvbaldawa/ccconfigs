---
description: Execute tasks from pending/ through development loop (implementation → testing → review)
argument-hint: [PROJECT] [--auto] [--express "task"]
---

# Implement Plan

Execute tasks from `.plans/{{ARGS}}/pending/` through the development loop.

## Usage

```
/implement-plan user-authentication
/implement-plan realtime-notifications --auto
/implement-plan user-auth --express "add logging to login function"
```

**Flags:**
- `--auto`: Full development loop - execute all tasks continuously, auto-commit, only stop on hard failure or completion
- `--express "description"`: Lightweight mode for simple changes - no task file created, quick validation, direct commit

## Autonomy Levels

```
--auto:
  - Full development loop
  - Execute all tasks continuously
  - Only stop on: hard failure with dependencies, or all tasks done
  - Commit automatically after each task

(no flag) - DEFAULT:
  - Auto-flow within each task (implement → test → review → commit)
  - Pause between tasks using "commit/yes, skip, edit" prompt

--express "description":
  - Lightweight mode for simple, single-item changes
  - No task file created (ephemeral)
  - Quick validation (tests + self-review, no agents)
  - Direct commit with descriptive message
```

---

## Express Mode

For simple changes that don't warrant full kanban ceremony.

**When to use:**
- Single, well-defined change
- No dependencies on other work
- Low risk (not security-sensitive, not architectural)
- Estimated < 30 minutes

**Express Flow:**

1. **Parse description:**
   - Extract task from `--express "description"`
   - Report: `⚡ Express mode: [description]`

2. **Load context:**
   - Read critical-patterns.md if exists (still apply patterns)
   - Check current branch is clean

3. **Implement directly:**
   - Make the requested change
   - Follow any applicable critical patterns
   - No task file created

4. **Validate:**
   - Run full test suite (required - cannot skip)
   - Quick self-review (check for obvious issues)
   - If tests fail → fix immediately or abort
   - If obvious issues found → fix before proceeding

5. **Commit:**
   - Draft descriptive commit message
   - `git add .` + `git commit`
   - Report: `✅ Express complete: [summary]`

**Express does NOT:**
- Create task files
- Move files through kanban directories
- Launch review agents
- Track in plan.md

**Escape hatch - escalate to full workflow if:**
- More than 5 files need changes
- Changes touch auth/security/payment code (severity indicators)
- Tests fail after first fix attempt
- Implementation requires 3+ edit cycles
- Research agents would be helpful

When escalating:
- Report: `⚠️ Complexity detected. Escalating to full workflow.`
- Create task file in pending/
- Continue with normal /implement-plan flow

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

## Development Loop

The loop executes tasks autonomously. Within a task, flow through all stages without stopping.

```
WHILE unblocked tasks remain:
  1. Pick next task (by priority, then task number)
  2. Execute task through all stages (no stopping between stages)
  3. On success: run decision checkpoint, commit, move to completed/
  4. On failure after 3 retries:
     - Persist failure context to task file
     - Check if other tasks depend on this one
     - If dependencies exist: STOP loop, report
     - If isolated: Mark BLOCKED, continue to next task
  5. Check autonomy level for pause point
```

## State Machine

Execute transitions immediately. Do NOT pause between stages within a task.

### IMPLEMENTATION Stage
```
READY_FOR_TESTING → mv to testing/, invoke testing skill
READY_FOR_REVIEW  → mv to review/, invoke reviewing-code skill
STUCK             → increment retry count, persist context, retry or escalate
(other status)    → treat as error, stop and report
```

### TESTING Stage
```
READY_FOR_REVIEW → mv to review/, invoke reviewing-code skill
NEEDS_FIX        → mv to implementation/, invoke implementing-tasks skill
                   (track cycle count in task file)
```

### REVIEW Stage
```
APPROVED → run completion checklist, mv to completed/, commit, next task
REJECTED → run findings checklist, mv to implementation/, invoke implementing-tasks skill
           (track cycle count in task file)
```

**MAX CYCLES:** 3 per stage type (3 test fixes, 3 review rejections)
After max cycles: persist failure context, check dependencies, decide continue/stop

## Main Loop Steps

### 1. Claim Task
- Find next task with met dependencies (check `Dependencies:` field)
- Move: `pending/NNN-*.md → implementation/`
- Create todos from task's Validation checklist
- Report: `🔨 Implementing Task X/Y: [name]`

### 2. Implementation
- Invoke skill: `implementing-tasks`
- When skill reports `✅ Implementation complete`, check Status and transition immediately

### 3. Testing
- Report: `🧪 Testing Task X/Y: [name]`
- Invoke skill: `testing`
- When skill reports `✅ Testing complete`, check Status and transition immediately

### 4. Review
- Report: `🔍 Reviewing Task X/Y: [name]`
- Invoke skill: `reviewing-code` (launches 3 review agents in parallel)
- When skill reports `✅ Review complete`, check Status and transition immediately

### 5. Completion Checkpoint

Before moving task to `completed/`, verify:

```markdown
## Completion Checklist
- [ ] All items in task's Validation section are checked
- [ ] Working Result criteria is fully met (not partially)
- [ ] All CRITICAL and HIGH review findings were addressed (not just acknowledged)
- [ ] No TODO/FIXME comments in new code
- [ ] Tests actually test the behavior, not just pass
```

If any checkbox fails → do not proceed, address the gap first.

### 6. Commit

**Before commit:**
Append completion metadata to task file using Edit tool:
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

### 7. Progress
Report: `Progress: X/Y completed | Z blocked | W pending`

### 8. Session Checkpoint (Every 3 Tasks)

After every 3 completed tasks, pause and evaluate:

```markdown
## Session Checkpoint

Tasks completed this session: [N]
Total progress: [X/Y]

Health indicators:
- Review rejection rate: [R/N] ([%]) [OK | ⚠️ if >30%]
- Test fix cycles: [N] total [OK | ⚠️ if >3 per task average]
- STUCK occurrences: [N] [OK | ⚠️ if >1 per 3 tasks]
- Learnings captured: [N]

Recommendation: [CONTINUE | PAUSE | ESCALATE]
```

**Decision logic:**
- **CONTINUE**: All indicators OK, momentum is good
- **PAUSE**: 2+ warning indicators, suggest taking a break to avoid drift
- **ESCALATE**: Pattern of rejections or STUCK states suggests systemic issue

**With `--auto`:** Log checkpoint but continue (no pause).

**Without `--auto`:** Show checkpoint, ask:
```
Session checkpoint reached. [CONTINUE | PAUSE | ESCALATE]?
1. Continue to next task
2. Take a break (context saved, resume with /implement-plan)
3. Escalate blockers to human
```

## Findings Checklist (After Rejection)

Before re-submitting after rejection:

```markdown
## Findings Checklist
- [ ] Each CRITICAL finding has a code change (not just a comment saying "noted")
- [ ] Each HIGH finding is either fixed OR has explicit justification in task file
- [ ] No "will fix later" deferrals on security issues
```

If any checkbox fails → do not proceed, address the gap first.

## Failure Context Format

When a task fails, append to task file:

```markdown
## Attempt Log
### Attempt [N] - [ISO timestamp]
- Stage: [implementation/testing/review]
- Error: [what failed]
- Tried: [what was attempted]
- Result: [NEEDS_FIX/REJECTED/STUCK]
```

This enables informed retries and full resume across sessions.

## Stop-and-Report Protocol

When hitting a hard stop (stuck, max retries, blocking error):

```markdown
## STOP - Workflow Halted

**Task:** [NNN - title]
**Stage:** [implementation/testing/review]
**Attempts:** [N of 3]

**What was being attempted:**
[specific action]

**What failed:**
[error message or description]

**What was tried:**
1. [attempt 1]
2. [attempt 2]
3. [attempt 3]

**Suggested next steps:**
- [concrete suggestion]
- [alternative approach]

**To resume:** `/implement-plan [project]` or `/implement-plan [project] --auto`
```

No vague "I'm stuck." No asking "what should I do?" Clear report, then stop.

## Development Loop Rules

CRITICAL RULES during execution:

1. **Execute, don't explain** - Prefer running commands, editing files, invoking skills.
   Minimize "I'm about to..." messages.

2. **No permission between stages** - Within a task, flow through stages automatically.
   Pause points are ONLY at autonomy-level checkpoints (between tasks).

3. **Environment-anchored decisions** - Tests pass/fail. Linter passes/fails.
   Use concrete signals, not self-critique.

4. **Persist failure context** - Every retry attempt logged to task file.
   This enables informed retries and full resume.

5. **Dependency-aware continuation** - After a task fails:
   - Check if remaining tasks depend on it
   - If yes: stop loop
   - If no: mark BLOCKED, continue with unblocked tasks

6. **Clear completion** - Loop ends when:
   - All tasks in completed/ (success)
   - Hard stop triggered (failure with dependencies)
   - All remaining tasks are BLOCKED (partial success)

## Final Summary

```
✅ Development Loop Complete

Project: {{ARGS}}
Completed: X/X tasks | Blocked: Y | Commits: Z
Average Review Scores: Security: XX | Quality: XX | Tests: XX
Final Test Coverage: XX%
```

## Key Behaviors

- **Smooth flow**: Continue between stages automatically. Stop only at autonomy checkpoints or on failure
- **Session verification**: Check last completed task's test status before claiming new work
- **Session checkpoints**: Every 3 tasks, evaluate health indicators and recommend CONTINUE/PAUSE/ESCALATE
- **End-to-end per task**: implement → test → review → checkpoint → commit → next
- **Per-task confirmation** (default mode): Previous "yes" does NOT carry over
- **Task files committed**: Code + task file in each commit
- **Completion checkpoint**: Verify work is actually done before marking complete
- **Findings checkpoint**: Verify findings are actually addressed before re-submitting
- **Failure persistence**: All attempts logged to task file for resume
- **Descriptive commits**: Message describes what was accomplished
- **Cycle limits**: Max 3 rejections or test fixes before stop-and-report
- **Express mode**: `--express "task"` for simple changes without kanban ceremony
- **Skills run in main conversation**: Full visibility into implementation/review
- **State persists**: Resume anytime with `/implement-plan {{ARGS}}`
