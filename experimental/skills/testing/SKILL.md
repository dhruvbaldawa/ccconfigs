---
name: testing
description: Validates test coverage and quality by checking behavior focus, identifying gaps, and ensuring >80% statement coverage. Use when task file is in testing/ directory and requires test validation before marking complete. Adds minimal tests for genuinely missing edge cases.
---

# Testing

Given task file path `.plans/<project>/testing/NNN-task.md`:

## Process

1. Validate existing tests - behavior-focused? Covers Validation?
2. Identify gaps - empty/null inputs, boundaries, errors, race conditions, security
3. Add minimal tests if genuinely missing
4. Run full test suite - verify all tests passing
5. Run quality checks:
   - **Linting**: Run project's linter (eslint, pylint, ruff, etc.) - must pass with 0 errors
   - **Type checking**: Run type checker (tsc, mypy, etc.) - must pass with 0 errors
   - Fix ALL issues found (no exceptions, no "not part of task" rationalizations)
6. Run coverage - verify >80% statements, >75% branches
7. Update task status using Edit tool:
   - Find: `**Status:** [current status]`
   - Replace: `**Status:** READY_FOR_REVIEW`
8. Append testing notes:
   ```bash
   cat >> "$task_file" <<EOF

   **testing:**
   Validated [N] tests (behavior-focused)

   Added [M] edge cases:
   - [Test description]
   - [Test description]

   Quality checks:
   - Linting: ✓ Passed (0 errors)
   - Type checking: ✓ Passed (0 errors)

   Test breakdown: Unit: X | Integration: Y | Total: Z
   Coverage: Statements: XX% | Branches: XX% | Functions: XX% | Lines: XX%
   Full suite: XXX/XXX passing
   Working Result verified: ✓ [description]

   READY_FOR_REVIEW
   EOF
   ```
9. Report completion

## Test Quality

Good: `expect(response.status).toBe(401)` (tests behavior)
Bad: `expect(bcrypt.compare).toHaveBeenCalled()` (tests implementation)

Granularity: Pure functions → Unit | DB/API → Integration | Critical workflows → E2E (rare)

## Failure Handling

If tests fail, quality checks fail, or coverage <80%:
- Fix test scenarios first
- Fix ALL linting and type checking errors (no exceptions)
- If code bug found:
  - Update status using Edit tool: Find `**Status:** [current status]` → Replace `**Status:** NEEDS_FIX`
  - Append notes:
    ```bash
    cat >> "$task_file" <<EOF

    **testing:**
    Found issues:
    - [Specific issue]
    - [Specific issue]

    Quality check failures:
    - Linting: [X] errors
    - Type checking: [Y] errors

    Requires code fixes. Moving back to implementation.
    EOF
    ```
