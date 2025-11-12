---
name: implementation
description: Executes tasks from .plans/*/implementation/. Writes code and tests. Use when implementing planned tasks.
---

# Implementation

Execute tasks from `implementation/` directory, write code + tests, update task file.

## Process

Given task file path `.plans/<project>/implementation/NNN-task.md`:

1. **Read task file** - understand LLM Prompt, Working Result, Validation, Files
2. **Execute work** - follow LLM Prompt step-by-step, write code + tests, run full suite
3. **Update task file** (use Edit tool):
   - Status: `Pending` → `READY_FOR_REVIEW` (or `STUCK` if blocked)
   - Validation: Mark checkboxes `[ ]` → `[x]`
   - Notes: Append implementation section
4. **Report** completion to orchestrator

## Update Format

```markdown
**Status:** READY_FOR_REVIEW

**Validation:**
- [x] All items marked complete

**Notes:**

**implementation:**
- Followed LLM Prompt steps 1-N
- Implemented [key functionality]
- Added [N] tests: all passing
- Full test suite: [M]/[M] passing
- Working Result verified: ✓ [description]
- Files changed: [list with brief descriptions]
```

## Stuck Handling

If blocked (missing deps, unclear requirements):
- Status: `STUCK` (not READY_FOR_REVIEW)
- Notes: Explain blocker clearly
- STOP and report

```markdown
**Status:** STUCK

**implementation:**
- Attempted [what you tried]
- BLOCKED: [specific issue]
- Need [what's needed]
```

## Rejection Handling

If task moved back from review, read review notes, fix issues, update Status to `READY_FOR_REVIEW` again, append:

```markdown
**implementation (revision):**
- Fixed [issue 1]
- Fixed [issue 2]
- Re-ran tests: [M]/[M] passing
```

## Constraints

Follow LLM Prompt exactly | Write tests with code | Security-aware | No architecture changes
