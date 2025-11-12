---
name: planning
description: Risk-first task breakdown for features. Use when breaking down complex feature requests or analyzing requirements.
---

# Planning

Analyze requirements and create actionable task breakdowns using technical-planning skill.

## Process

1. **Invoke technical-planning skill** for risk analysis and iteration sequencing
2. **Glob codebase** to understand existing patterns
3. **Create** `.plans/<project>/` structure:
   - `plan.md` - overview, risk analysis, deferred items
   - `pending/*.md` - task files by iteration
   - `milestones.md` (if >10 tasks)
4. **Report** completion with summary

## Constraints

Read-only | Ask first (never assume) | Risk-first ordering | Atomic tasks | Document deferrals

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
Concrete deliverable when task complete (e.g., "User can login via POST /api/auth/login and receive JWT").

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

**planning:** Follow auth patterns in src/middleware/. Rate limiting for OWASP A04.
```

## Output

Report: `Planning complete. Created .plans/<project-name>/. Tasks: X total (Foundation: Y, Integration: Z, Polish: W)`
