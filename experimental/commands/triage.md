---
description: Convert review findings into actionable todo files
argument-hint: [PROJECT] [--from-task NNN | --from-review]
---

# Triage

Process review findings and create actionable todo files in pending/.

## Usage

```
/triage user-auth --from-task 003
/triage user-auth --from-review
```

## Process

### 1. Load Findings

**`--from-task NNN`**: Read `**review:**` section from `.plans/<project>/*/NNN-*.md`

**`--from-review`**: Read `.plans/<project>/review-findings.md`

Parse findings into structured list:
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- Location (file:line)
- Problem description
- Suggested fix

Report: `Found N findings to triage`

### 2. Present Each Finding

For each finding, display:

```
[1/N] CRITICAL: SQL Injection in login handler

Location: src/auth/login.ts:45
Problem: User input concatenated directly into query
Fix: Use parameterized queries

Action? (y)es, (n)ext, (c)ustom
```

Use AskUserQuestion tool with options:
- **yes**: Create todo file
- **next**: Skip this finding
- **custom**: Modify before creating

### 3. Handle Decision

**yes**: Create todo file immediately, continue to next

**next**: Skip, move to next finding

**custom**:
1. Ask for modifications (priority, description, solution)
2. Apply changes
3. Create todo file
4. Continue to next

### 4. Create Todo File

Auto-increment task number from existing files in pending/.

File: `.plans/<project>/pending/NNN-fix-[slug].md`

```markdown
# Fix: [Finding title]

**Priority:** [P1/P2/P3]
**Source:** Task [NNN] review
**Created:** [ISO timestamp]

## Problem

[Finding description]

Location: [file:line]

## Solution

[Suggested fix from review]

## Validation

- [ ] Fix implemented
- [ ] Tests pass
- [ ] Original issue no longer reproducible
```

### 5. Summary

After processing all findings:

```
✅ Triage complete

Created: 5 todos in pending/
Skipped: 2 findings

Next steps:
- Review pending/ to adjust priorities
- Run /implement-plan {{ARGS}} to start fixing
```

## Priority Mapping

| Severity | Priority | Meaning |
|----------|----------|---------|
| CRITICAL | P1 | Blocks merge, security/data risk |
| HIGH | P2 | Should fix before release |
| MEDIUM | P3 | Nice to have, can defer |
| LOW | - | Suggest skipping |

## Key Behaviors

- **One at a time**: Present findings sequentially, not all at once
- **No coding**: Only triage and organize, don't implement fixes
- **Actionable todos**: Each todo has clear problem, solution, validation
- **Source tracking**: Todo links back to original review finding
- **Auto-numbering**: Task numbers continue from highest in pending/

## When to Use

- After a review with multiple findings
- To convert ad-hoc review notes into tracked work
- When review-findings.md has accumulated items
- To prioritize and filter what actually needs fixing
