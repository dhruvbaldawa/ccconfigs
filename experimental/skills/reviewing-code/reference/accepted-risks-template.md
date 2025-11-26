# Accepted Risks

Project-level tracking of risk-accepted review findings. Items listed here are automatically filtered during reviews - they won't block approval or require re-acceptance.

## How to Add Items

Use `/accept-risk [project]` command, or manually add entries below following the format.

## Accepted Items

<!--
Format: One entry per block. Use exact patterns for matching.

Fields:
- **Agent**: Which review agent found it (test-coverage-analyzer | error-handling-reviewer | security-reviewer)
- **Severity**: Original severity (CRITICAL | HIGH | MEDIUM)
- **Pattern**: Matching pattern - can be:
  - File path pattern: `src/legacy/*.ts` (glob-style)
  - Code pattern: `catch (error) { /* intentional */` (substring match)
  - Description pattern: `Missing test for deprecated` (substring in agent output)
- **Scope**: Where this applies (project-wide | specific files listed)
- **Justification**: Why this is acceptable (required)
- **Accepted**: Date and task where first accepted
- **Expires**: Optional - date when this should be re-evaluated

Example entry:
-->

### AR-001: Missing integration tests for legacy endpoints

- **Agent**: test-coverage-analyzer
- **Severity**: HIGH (criticality 7-8)
- **Pattern**: `src/legacy/` OR description contains "legacy endpoint"
- **Scope**: Files in `src/legacy/`
- **Justification**: Legacy endpoints are being deprecated in Q2. Not worth investment in new tests. Existing manual QA process covers critical paths.
- **Accepted**: 2025-01-15 (Task 003)
- **Expires**: 2025-06-30

---

### AR-002: Intentional empty catch blocks in event handlers

- **Agent**: error-handling-reviewer
- **Severity**: MEDIUM
- **Pattern**: `catch (e) { /* fire-and-forget */`
- **Scope**: Project-wide
- **Justification**: Analytics events use fire-and-forget pattern. Failures are logged at network layer. UI should never block on analytics.
- **Accepted**: 2025-01-20 (Task 007)

---

### AR-003: SQL-like syntax in query builder (false positive)

- **Agent**: security-reviewer
- **Severity**: HIGH (confidence 70-89)
- **Pattern**: description contains "SQL injection" AND file matches `**/query-builder.ts`
- **Scope**: `src/db/query-builder.ts`
- **Justification**: Query builder uses parameterized queries internally. The DSL syntax triggers false positives but all values are properly escaped before execution.
- **Accepted**: 2025-01-22 (Task 012)

---

<!-- Add new entries above this line -->
