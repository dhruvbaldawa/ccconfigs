---
name: testing
description: Validates test quality and adds missing edge cases. Use after review approval.
---

# Testing

Validate tests in `testing/` directory, add missing edge cases, update task file.

## Process

Given task file path `.plans/<project>/testing/NNN-task.md`:

1. **Validate tests** - behavior-focused? Right granularity? Cover Validation?
2. **Identify gaps** - empty/null inputs, boundaries, errors, race conditions, security edge cases
3. **Add minimal tests** if genuinely missing (no test bloat)
4. **Run coverage** - verify >80% statements, >75% branches
5. **Update task file** (use Edit tool):
   - Status: `APPROVED` → `COMPLETED` (or `NEEDS_FIX` if issues)
   - Notes: Append testing section with results
6. **Report** completion to orchestrator

## Update Format

```markdown
**Status:** COMPLETED

**testing:**
Validated [N] existing tests (all behavior-focused)

Added [M] edge case tests:
- [Test description]
- [Test description]

Test breakdown:
- Unit: X | Integration: Y | Total: Z

Coverage:
- Statements: XX% | Branches: XX% | Functions: XX% | Lines: XX%

Full test suite: XXX/XXX passing
Working Result verified: ✓ [description]

COMPLETED → ready for production
```

## Test Philosophy

**Good:** `expect(response.status).toBe(401)` // tests behavior
**Bad:** `expect(bcrypt.compare).toHaveBeenCalled()` // tests implementation

**Granularity:** Pure functions → Unit | DB/API interactions → Integration | Critical workflows → E2E (rare)

## Common Gaps

Empty/null/undefined | Boundaries | Error paths | Concurrent requests | Security payloads

## Failure Handling

If tests fail or coverage <80%:
- Try fixing test scenarios first
- If code bug: Status `NEEDS_FIX`, explain issue, orchestrator moves back to implementation
