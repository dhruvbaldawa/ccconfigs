---
name: testing
description: Invoked by /implement-plan when task moves to testing/ directory. Validates tests and adds missing edge cases.
---

# Testing

Given task file path `.plans/<project>/testing/NNN-task.md`:

## Process

1. Validate existing tests - behavior-focused? Covers Validation?
2. Identify gaps - empty/null inputs, boundaries, errors, race conditions, security
3. Add minimal tests if genuinely missing
4. Run coverage - verify >80% statements, >75% branches
5. Update task file using `scripts/task-helpers.sh`:
   ```bash
   ./scripts/task-helpers.sh update_status "$task_file" "COMPLETED"

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
6. Report completion

## Test Quality

Good: `expect(response.status).toBe(401)` (tests behavior)
Bad: `expect(bcrypt.compare).toHaveBeenCalled()` (tests implementation)

Granularity: Pure functions → Unit | DB/API → Integration | Critical workflows → E2E (rare)

## Failure Handling

If tests fail or coverage <80%:
- Fix test scenarios first
- If code bug found:
  ```bash
  ./scripts/task-helpers.sh update_status "$task_file" "NEEDS_FIX"

  cat >> "$task_file" <<EOF

  **testing:**
  Found issues:
  - [Specific issue]
  - [Specific issue]

  Requires code fixes. Moving back to implementation.
  EOF
  ```
