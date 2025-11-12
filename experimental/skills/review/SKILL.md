---
name: review
description: Fresh-eyes security, quality, performance review. Use for reviewing implemented tasks.
---

# Review

Review code in `review/` with fresh eyes - focus on outputs (diff, tests) not process.

## Process

Given task file path `.plans/<project>/review/NNN-task.md`:

1. **Review outputs** (fresh eyes):
   - Run `git diff` on Files listed
   - Read test files
   - Run tests to verify passing
   - Check Validation checklist marked [x]
2. **Score** (0-100 each): Security, Quality, Performance, Tests
3. **Decide** - APPROVE (security ≥80, no critical issues) or REJECT
4. **Update task file** (use Edit tool):
   - Status: `READY_FOR_REVIEW` → `APPROVED` or `REJECTED`
   - Notes: Append review section with scores and findings
5. **Report** completion to orchestrator

## Review Checklist

**Security:** Input validation | Auth checks | Secrets in env | Rate limiting | SQL parameterized | Password hashing

**Quality:** Readable | No duplication | Error handling | Follows patterns | Diff <500 lines

**Performance:** No N+1 queries | Efficient algorithms | Proper indexing

**Tests:** Covers Validation | Behavior-focused | Edge cases | Error paths | Suite passing

## Update Format

**If APPROVED:**
```markdown
**Status:** APPROVED

**review:**
Security: 90/100 | Quality: 95/100 | Performance: 95/100 | Tests: 90/100

Working Result verified: ✓ [description]
Validation: 4/4 passing
Full test suite: [M]/[M] passing
Diff size: [N] lines (reasonable)

Security highlights: [key checks]

APPROVED → testing
```

**If REJECTED:**
```markdown
**Status:** REJECTED

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

Otherwise → APPROVE (with warnings if minor issues)
