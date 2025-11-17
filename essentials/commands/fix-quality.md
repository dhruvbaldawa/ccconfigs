---
description: Fix linting and quality issues following root-cause-first philosophy
argument-hint: [FILES OR PATTERN]
---

# Fix Quality Issues

Systematically fix linting, type errors, and quality issues following a principled approach.

## Your Task

Fix quality issues in the specified files or pattern (e.g., `src/**/*.ts`, `nanoagent/models/`, or `.` for entire project).

## Philosophy: Root Cause First

Follow this priority order:

**1. Fix Root Cause (ALWAYS try this first)**
- Understand WHY the issue exists
- Fix the underlying problem, not just the symptom
- Examples:
  - Unused import → Remove it (don't ignore)
  - Type mismatch → Fix the type (don't cast to `any`)
  - Unassigned variable → Use it or remove it (don't prefix with `_`)

**2. Safety & Reliability (If root cause fix complicates solution)**
- Add proper error handling instead of ignoring errors
- Add type guards instead of `any`
- Refactor to simpler, safer patterns
- Examples:
  - Complex type inference → Add explicit type annotations
  - Unsafe access → Add null checks or optional chaining
  - Side effects → Refactor to pure functions

**3. Local Ignores (ONLY when #1 and #2 complicate the solution)**
- Impact should be as LOCAL as possible
- Priority order (most local → least local):
  1. **Inline ignore** (single line): `// eslint-disable-next-line rule-name`
  2. **Block ignore** (section): `/* eslint-disable rule-name */` ... `/* eslint-enable rule-name */`
  3. **File-level ignore** (entire file): `/* eslint-disable rule-name */` at top
  4. **Pattern ignore** (glob): `.eslintignore` or config with `ignorePatterns: ['test/**']`
  5. **Global disable** (LAST RESORT): Modify config to disable rule globally

## Process

**Step 1: Gather All Issues**
```bash
# Run all quality checks and collect issues
npm run lint 2>&1 | tee /tmp/lint-issues.txt
# Or: ruff check . (Python)
# Or: mypy . (Python types)
# Or: tsc --noEmit (TypeScript)
```

**Step 2: Categorize Issues**
Group by:
- Root cause fixable (unused imports, simple type fixes)
- Requires refactoring (complex types, architectural)
- Legitimate ignores (test files, generated code)

**Step 3: Fix in Priority Order**

**3a. Fix Root Causes**
- Remove unused imports/variables
- Fix simple type errors
- Add missing return types
- Fix naming violations
- Document blockers encountered

**3b. Apply Safety/Reliability Fixes**
- Add type guards for complex types
- Add error handling for unsafe operations
- Refactor complex patterns to simpler ones
- Document why refactoring was needed

**3c. Apply Local Ignores (if necessary)**
For each ignore:
1. Document WHY it's being ignored (comment above ignore)
2. Choose most local scope possible
3. Use specific rule name (not blanket disable)
4. Examples of valid reasons:
   - Test files need `any` for mocking
   - Generated code shouldn't be modified
   - Third-party API requires unsafe type
   - Performance-critical code needs optimization

**Step 4: Validate**
```bash
# Verify all issues resolved
npm run lint
# Or: ruff check . && mypy .

# Run tests to ensure nothing broken
npm test
# Or: pytest
```

**Step 5: Report**
Summarize what was done:
```
✅ Quality Issues Fixed

Root Cause Fixes: X issues
- Removed Y unused imports
- Fixed Z type errors
- Added N return types

Safety/Reliability Improvements: X issues
- Added Y type guards
- Refactored Z complex patterns

Local Ignores Applied: X issues (with justification)
- test/foo.ts:42 - Mock requires 'any' type
- generated/api.ts - Third-party generated code

All checks passing ✓
Tests passing: X/X ✓
```

## Examples

**Example 1: Unused Import (Root Cause)**
```typescript
// ❌ Before
import { foo, bar } from './utils'  // bar unused
export const result = foo()

// ✅ After - Remove unused import
import { foo } from './utils'
export const result = foo()
```

**Example 2: Type Error (Safety)**
```typescript
// ❌ Before - Any cast
const data = JSON.parse(input) as any

// ✅ After - Type guard
interface Data { id: string; value: number }
function isData(obj: unknown): obj is Data {
  return typeof obj === 'object' && obj !== null &&
         'id' in obj && 'value' in obj
}
const parsed = JSON.parse(input)
const data = isData(parsed) ? parsed : null
```

**Example 3: Legitimate Ignore (Most Local)**
```typescript
// ✅ Inline ignore with justification
test('mock API call', () => {
  // Mock requires 'any' to match third-party API signature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockFn = jest.fn<any, any>()
})
```

**Example 4: Pattern Ignore (When Necessary)**
```json
// .eslintrc.json - Only for generated code
{
  "ignorePatterns": [
    "**/*.generated.ts",
    "dist/**"
  ]
}
```

## Anti-Patterns to Avoid

❌ **Blanket Disables**
```typescript
// BAD - No justification, too broad
/* eslint-disable */
```

❌ **Global Disables for Local Issues**
```json
// BAD - Disabling globally for one test file
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

❌ **Ignoring Without Understanding**
```typescript
// BAD - Just suppressing without fixing
// @ts-ignore
const result = dangerousOperation()
```

❌ **Fixing Symptoms Not Root Cause**
```typescript
// BAD - Unused variable prefixed instead of removed
const _unused = getValue()

// GOOD - Remove if truly unused
// (or fix code to actually use it)
```

## Notes

- Always run full test suite after quality fixes
- Document WHY ignores are necessary (comment above)
- Use most specific rule name possible (not blanket disable)
- Review ignore list periodically - some may become fixable
- If >10% of codebase needs ignores, reconsider the rule
- Use TodoWrite to track progress through large codebases

## Arguments

`{{ARGS}}` - Files, glob pattern, or `.` for entire project
