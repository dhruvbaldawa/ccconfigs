# Critical Patterns

Patterns every agent MUST follow. Violations should block review.

---

## How to Use This File

**For implementing-tasks skill:**
- Read this file at the start of implementation
- Apply all patterns that match the current context
- Violations are automatic CRITICAL findings in review

**For reviewing-code skill:**
- Check implementation against all applicable patterns
- Any violation = CRITICAL finding (blocks approval)

**Promotion flow:**
- After knowledge-capturer creates a learning with `confidence: high`
- If the learning affects multiple modules or represents a recurring mistake
- The implementing-tasks skill suggests: "Consider promoting to critical patterns"
- User can then manually add the pattern below following the template

---

## Pattern Template

```markdown
## Pattern N: [Name]

**Context:** [When this pattern applies - technologies, scenarios]

❌ **WRONG:**
```[language]
[Anti-pattern with code example]
```
[Why this is wrong - consequences]

✅ **CORRECT:**
```[language]
[Correct pattern with code example]
```
[Why this works - benefits]

**Source:** [Link to learning that surfaced this]
**Added:** [Date]
```

---

## Patterns

{{Patterns will be added here as learnings are promoted}}

<!-- Example pattern for reference (uncomment and modify when adding first pattern):

## Pattern 1: [Example Pattern Name]

**Context:** [When this applies]

❌ **WRONG:**
```typescript
// Anti-pattern example
```
[Explanation of why this is wrong]

✅ **CORRECT:**
```typescript
// Correct pattern example
```
[Explanation of why this works]

**Source:** learnings/20260118-001-example.md
**Added:** 2026-01-18

-->
