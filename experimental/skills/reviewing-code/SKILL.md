---
name: reviewing-code
description: Invoked by /implement-plan when task moves to review/ directory. Checks security, quality, performance.
---

# Review

Given task file path `.plans/<project>/review/NNN-task.md`:

## Process

1. Review outputs:
   - Run `git diff` on Files listed
   - Read test files
   - Run tests to verify passing
   - Check Validation checkboxes marked [x]
2. Score (0-100 each): Security, Quality, Performance, Tests
3. Decide - APPROVE (security ≥80, no critical issues) or REJECT
4. Update task file using `scripts/task-helpers.sh`:
   ```bash
   # Approve
   ./scripts/task-helpers.sh update_status "$task_file" "APPROVED"

   # Or reject
   ./scripts/task-helpers.sh update_status "$task_file" "REJECTED"
   ```
5. Append notes (see formats below)
6. Report completion

## Review Focus

| Area | Check |
|------|-------|
| **Security** | Input validation, auth checks, secrets in env, rate limiting, SQL parameterized |
| **Quality** | Readable, no duplication, error handling, follows patterns, diff <500 lines |
| **Performance** | No N+1 queries, efficient algorithms, proper indexing |
| **Tests** | Covers Validation, behavior-focused, edge cases, error paths, suite passing |

## Approval Format

```markdown
**review:**
Security: 90/100 | Quality: 95/100 | Performance: 95/100 | Tests: 90/100

Working Result verified: ✓ [description]
Validation: 4/4 passing
Full test suite: [M]/[M] passing
Diff: [N] lines

APPROVED → testing
```

## Rejection Format

```markdown
**review:**
Security: 65/100 | Quality: 85/100 | Performance: 90/100 | Tests: 75/100

REJECTED - Blocking issues:
1. [Specific issue + fix needed]
2. [Specific issue + fix needed]

Required actions:
- [Action 1]
- [Action 2]

REJECTED → implementation
```

## Blocking Thresholds

Security <80 | Critical vulnerability | Tests failing | Validation incomplete | Working Result not achieved → REJECT
