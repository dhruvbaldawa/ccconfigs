---
description: Fix linting and quality issues following root-cause-first philosophy
argument-hint: [FILES OR PATTERN]
---

# Fix Quality Issues

Fix quality issues in `{{ARGS}}` (files, glob pattern, or `.` for entire project).

## Priority Order

**1. Fix Root Cause** (ALWAYS first)
- Remove unused imports/variables
- Fix type errors properly
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
Run linting and type checking tools to collect all issues. Group by: root cause fixable, needs alternative approach, legitimate ignore.

**For large codebases (>20 issues)**: Use TodoWrite to track fixes by category:
```
☐ Root cause fixes (X issues)
  ☐ Remove unused imports (N files)
  ☐ Fix type errors (N issues)
  ☐ Add missing return types (N functions)
☐ Safety alternatives (Y issues)
☐ Legitimate ignores (Z issues)
☐ Validate all checks pass
☐ Run full test suite
```

**2. Fix in Priority Order**
- Root causes: Remove unused, fix types, add return types
- Safety alternatives: Refactor without deteriorating quality
- Ignores: Document reason, choose local scope, specific rule

Mark todos completed as you fix each category. This prevents losing track when interrupted.

**3. Validate**
All linting checks + full test suite must pass.

**4. Report**
```
✅ Quality Fixed: X root cause, Y alternatives, Z ignores
All checks ✓ | Tests X/X ✓
```

## Locality Hierarchy (for ignores)

1. **Inline**: Single line ignore
2. **Block**: Section/function ignore
3. **File**: Entire file ignore
4. **Pattern**: Glob pattern ignore (e.g., test files, generated code)
5. **Global**: Config-level disable (LAST RESORT)

## Anti-Patterns

❌ Blanket disable without justification
❌ Global disable for local issue
❌ Ignoring without understanding why
❌ Fixing symptoms instead of root cause
❌ Making code less safe to silence warnings

## Valid Ignore Reasons

- Test code needs flexibility for mocking third-party APIs
- Generated code shouldn't be modified
- Performance-critical code needs specific optimization
- Third-party contract requires specific implementation

## Notes

- Run full test suite after fixes
- Review ignores periodically (some may become fixable)
- If >10% needs ignores, reconsider the rule
