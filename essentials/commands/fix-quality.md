---
description: Fix linting and quality issues following root-cause-first philosophy
argument-hint: [FILES OR PATTERN]
---

# Fix Quality Issues

Fix quality issues in `{{ARGS}}` (files, pattern like `src/**/*.ts`, or `.` for project).

## Priority Order

**1. Fix Root Cause** (ALWAYS first)
- Remove unused imports/variables
- Fix type errors properly (not cast to `any`)
- Add missing return types
- Fix naming violations

**2. Maintain/Improve Safety & Reliability** (if #1 complicates)
- Find alternative approach that keeps code at least as safe as before
- Don't add hacks or workarounds that deteriorate quality
- Refactor to simpler patterns if needed
- Add proper validation/checks

**3. Local Ignores** (ONLY when #1 and #2 both complicate)
- Use most LOCAL scope: inline > file > pattern > global
- Document WHY (comment above ignore)
- Use specific rule name (not blanket disable)

## Process

**1. Gather & Categorize**
```bash
npm run lint 2>&1 | tee /tmp/lint.txt  # Or: ruff check . | mypy .
```
Group by: root cause fixable, needs alternative approach, legitimate ignore

**2. Fix in Priority Order**
- Root causes: Remove unused, fix types, add return types
- Safety alternatives: Refactor without deteriorating quality
- Ignores: Document reason, choose local scope, specific rule

**3. Validate**
```bash
npm run lint && npm test  # Or: ruff check . && mypy . && pytest
```
All checks + tests must pass

**4. Report**
```
✅ Quality Fixed: X root cause, Y alternatives, Z ignores
All checks ✓ | Tests X/X ✓
```

## Locality Hierarchy (for ignores)

1. **Inline**: `// eslint-disable-next-line rule-name` (1 line)
2. **Block**: `/* eslint-disable rule */` ... `/* eslint-enable */`
3. **File**: `/* eslint-disable rule */` (top of file)
4. **Pattern**: `.eslintignore` or `ignorePatterns: ['test/**']`
5. **Global**: Config rule disable (LAST RESORT)

## Anti-Patterns

❌ Blanket disable without justification
❌ Global disable for local issue
❌ Ignoring without understanding why
❌ Fixing symptoms instead of root cause (e.g., `const _unused = getValue()`)
❌ Making code less safe to silence warnings

## Valid Ignore Reasons

- Test mocks need `any` for third-party API signatures
- Generated code shouldn't be modified
- Performance-critical code needs specific optimization
- Third-party API contract requires unsafe type

## Notes

- Run full test suite after fixes
- Review ignores periodically (some may become fixable)
- If >10% needs ignores, reconsider the rule
- Use TodoWrite for large codebases
