---
name: planning
description: Invoked by /plan-feature and /orchestrate. Creates .plans/ with risk-prioritized tasks. Skip for simple 1-2 file changes.
---

# Planning

## Process

1. Invoke technical-planning skill
2. Create `.plans/<project>/`:
   - `plan.md` - risk analysis, deferrals
   - `pending/*.md` - task files by iteration
   - `milestones.md` (if >10 tasks)
3. Report completion

## Task File Template

```markdown
# Task 001: Feature Name

**Iteration:** Foundation | Integration | Polish
**Status:** Pending
**Dependencies:** None (or 001, 002)
**Files:** src/file1.ts, tests/file1.test.ts

## Description
What needs to be built (2-3 sentences).

## Working Result
Concrete deliverable when complete.

## Validation
- [ ] Specific, testable check 1
- [ ] Specific, testable check 2
- [ ] All tests passing (no regressions)

## LLM Prompt
<prompt>
1. Read **src/existing-pattern.ts** for patterns
2. Create **src/routes/auth.ts** with POST /login
3. Implement bcrypt password verification
4. Generate JWT token (24h expiry)
5. Add rate limiting (5 req/min per IP)
6. Write tests: valid login, invalid password, rate limit
7. Run: `npm test`
</prompt>

## Notes

**planning:** [Context, patterns to follow, potential blockers]
```

## Output

Report: `Planning complete. Created .plans/<project-name>/. Tasks: X total (Foundation: Y, Integration: Z, Polish: W)`
