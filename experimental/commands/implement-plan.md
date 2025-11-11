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

Loop through tasks in `.plans/{{ARGS}}/` following Kanban flow:

### 1. Implementation

```typescript
await Task({
  subagent_type: 'implementation-agent',
  model: 'haiku',
  description: 'Implement task',
  prompt: `Execute task from .plans/{{ARGS}}/pending/ with met dependencies.`
});
```

Implementation agent will:
- Find task with met dependencies, claim to implementation/
- Follow LLM Prompt block step-by-step
- Write code + tests together
- Mark Status: Stuck if blocked, STOP for human help
- Handoff to review/ when complete

### 2. Review

```typescript
await Task({
  subagent_type: 'review-agent',
  model: 'sonnet',
  description: 'Review task',
  prompt: `Review task in .plans/{{ARGS}}/review/ with fresh eyes.`
});
```

Review agent will:
- Review git diff, tests (outputs only, not process)
- Verify Working Result and Validation checklist
- Check security/quality/performance/tests
- Approve to testing/ or reject to implementation/

### 3. Testing

```typescript
await Task({
  subagent_type: 'testing-agent',
  model: 'haiku',
  description: 'Validate tests',
  prompt: `Validate tests in .plans/{{ARGS}}/testing/`
});
```

Testing agent will:
- Validate existing tests (implementation already wrote them)
- Add missing edge cases only (minimal, no bloat)
- Check coverage >80%
- Complete to completed/

### 4. Progress Check

```bash
completed=$(ls .plans/{{ARGS}}/completed/*.md 2>/dev/null | wc -l)
total=$(find .plans/{{ARGS}} -name "*.md" -not -name "plan.md" -not -name "milestones.md" | wc -l)
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
- Tests: 91/100

Test Coverage: 94%

Next: git add . && git commit
```
