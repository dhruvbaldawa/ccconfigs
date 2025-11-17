---
description: Fix linting and quality issues following root-cause-first philosophy
argument-hint: [FILES OR PATTERN]
---

# Fix Quality Issues

Fix quality issues in `{{ARGS}}` (files, pattern like `src/**/*.ts`, or `.` for project).

## Priority Order

**1. Fix Root Cause** (ALWAYS first)
- Remove unused imports/variables (don't ignore)
- Fix type errors properly (don't cast to `any`)
- Add missing return types, fix naming violations

**2. Safety & Reliability** (if #1 complicates solution)
- Add type guards instead of `any`
- Add error handling instead of ignoring errors
- Refactor to simpler, safer patterns

**3. Local Ignores** (ONLY when #1 and #2 complicate)
- Use most LOCAL scope: inline > file > pattern > global
- Document WHY (comment above ignore)
- Use specific rule name (not blanket disable)

## Process

**1. Gather & Categorize**
```bash
npm run lint 2>&1 | tee /tmp/lint.txt  # Or: ruff check . | mypy .
```
Group by: root cause fixable, requires refactor, legitimate ignore

**2. Fix in Priority Order**
- Root causes: Remove unused, fix types, add return types
- Safety: Add type guards, error handling, refactor patterns
- Ignores: Document reason, choose local scope, specific rule

**3. Validate**
```bash
npm run lint && npm test  # Or: ruff check . && mypy . && pytest
```
All checks + tests must pass

**4. Report**
```
✅ Quality Fixed: X root cause, Y safety, Z ignores
All checks ✓ | Tests X/X ✓
```

## Examples

**Root Cause Fix:**
```typescript
// ❌ import { foo, bar } from './utils'  // bar unused
// ✅ import { foo } from './utils'
```

**Safety Fix:**
```typescript
// ❌ const data = JSON.parse(input) as any
// ✅ const data = isValidData(JSON.parse(input)) ? parsed : null
```

**Local Ignore (when necessary):**
```typescript
// Mock requires 'any' to match third-party API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFn = jest.fn<any, any>()
```

## Anti-Patterns

❌ Blanket disable: `/* eslint-disable */` (no justification)
❌ Global disable for local issue (config file for one test)
❌ Ignoring without understanding (`@ts-ignore` without comment)
❌ Symptom fix: `const _unused = getValue()` (should remove or use)

## Valid Ignore Reasons

- Test mocks need `any` for third-party API signatures
- Generated code shouldn't be modified
- Performance-critical code needs specific optimization
- Third-party API contract requires unsafe type

## Locality Hierarchy

1. **Inline**: `// eslint-disable-next-line rule-name` (1 line)
2. **Block**: `/* eslint-disable rule */` ... `/* eslint-enable */`
3. **File**: `/* eslint-disable rule */` (top of file)
4. **Pattern**: `.eslintignore` or `ignorePatterns: ['test/**']`
5. **Global**: Config rule disable (LAST RESORT)

## Notes

- Run full test suite after fixes
- Review ignores periodically (some may become fixable)
- If >10% needs ignores, reconsider the rule
- Use TodoWrite for large codebases
