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
4. Run coverage - verify >80% statements, >75% branches
5. Update task status using Edit tool:
   - Find: `**Status:** [current status]`
   - Replace: `**Status:** COMPLETED`
6. Append testing notes:
   ```bash
   cat >> "$task_file" <<EOF

   **testing:**
   Validated [N] tests (behavior-focused)

   Added [M] edge cases:
   - [Test description]
   - [Test description]

   Test breakdown: Unit: X | Integration: Y | Total: Z
   Coverage: Statements: XX% | Branches: XX% | Functions: XX% | Lines: XX%
   Full suite: XXX/XXX passing
   Working Result verified: ✓ [description]

   COMPLETED
   EOF
   ```
7. Report completion

## Test Quality

Good: `expect(response.status).toBe(401)` (tests behavior)
Bad: `expect(bcrypt.compare).toHaveBeenCalled()` (tests implementation)

Granularity: Pure functions → Unit | DB/API → Integration | Critical workflows → E2E (rare)

## Failure Handling

If tests fail or coverage <80%:
- Fix test scenarios first
- If code bug found:
  - Update status using Edit tool: Find `**Status:** [current status]` → Replace `**Status:** NEEDS_FIX`
  - Append notes:
    ```bash
    cat >> "$task_file" <<EOF

    **testing:**
    Found issues:
    - [Specific issue]
    - [Specific issue]

    Requires code fixes. Moving back to implementation.
    EOF
    ```
