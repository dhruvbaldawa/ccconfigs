---
description: Execute tasks from pending/ using implementation, review, testing agents
---

# Implement Plan

Execute tasks from `.plans/<project>/pending/` through Kanban flow.

## Usage

```
/implement-plan user-authentication
/implement-plan realtime-notifications
```

## Your Task

For each task in `pending/`:

### 1. Implementation

```typescript
await Task({
  subagent_type: 'implementation-agent',
  model: 'haiku',
  description: 'Implement task',
  prompt: `
    Execute task from .plans/{{ARGS}}/pending/ with met dependencies.

    1. Find task: glob pending/*.md, check dependencies in completed/
    2. Claim: mv pending/XXX.md implementation/XXX.md
    3. Implement per acceptance criteria
    4. Run tests
    5. Append notes to task file
    6. Handoff: mv implementation/XXX.md review/XXX.md
  `
});
```

### 2. Review

```typescript
await Task({
  subagent_type: 'review-agent',
  model: 'sonnet',
  description: 'Review task',
  prompt: `
    Review task in .plans/{{ARGS}}/review/

    1. Read task, check changed files
    2. Security: OWASP Top 10, rate limiting, input validation
    3. Quality: readability, patterns, error handling
    4. Performance: N+1 queries, indexes
    5. Append scores and issues
    6. If approved (security >80): mv review/XXX.md testing/XXX.md
    7. If rejected: mv review/XXX.md implementation/XXX.md
  `
});
```

### 3. Testing

```typescript
await Task({
  subagent_type: 'testing-agent',
  model: 'haiku',
  description: 'Test task',
  prompt: `
    Test task in .plans/{{ARGS}}/testing/

    1. Design test scenarios (behavior-focused)
    2. Choose granularity (unit/integration/e2e)
    3. Write tests, run them
    4. Check coverage (>80%)
    5. Append results
    6. Complete: mv testing/XXX.md completed/XXX.md
  `
});
```

### 4. Check Progress

```bash
pending=$(ls .plans/{{ARGS}}/pending/*.md 2>/dev/null | wc -l)
completed=$(ls .plans/{{ARGS}}/completed/*.md 2>/dev/null | wc -l)
total=$((pending + completed + ...))
echo "Progress: $completed/$total"
```

## Output

```markdown
✅ Implementation Complete

Project: {{ARGS}}
Completed: 6/6 tasks

Review Scores (avg):
- Security: 92/100
- Quality: 90/100
- Performance: 95/100

Test Coverage: 94%

Next: git add . && git commit
```
