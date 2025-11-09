---
description: Full workflow: planning → implementation → review → testing
---

# Orchestrate

Complete multi-agent workflow from planning through implementation.

## Usage

```
/orchestrate Add user authentication with JWT
/orchestrate Build real-time notifications using WebSocket
```

## Your Task

### 1. Complexity Check

```markdown
Complexity:
- Files: {{N}} × 1
- New patterns: {{N}} × 3
- Security: {{N}} × 5
- Integration: {{N}} × 2
Total: {{score}}

< 10 → Consider single-agent (cheaper, simpler)
>= 10 → Multi-agent justified
```

### 2. Planning Phase

```typescript
await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  description: 'Plan feature',
  prompt: `Plan: "${{{ARGS}}}"`
});
```

Planning agent uses technical-planning skill for risk-first breakdown.

### 3. Implementation Loop

Loop through tasks following Kanban flow:

```typescript
// While tasks in pending/
while (hasPendingTasks()) {
  // Implementation: code + tests
  await Task({
    subagent_type: 'implementation-agent',
    model: 'haiku',
    prompt: 'Execute next task from pending/'
  });

  // Review: fresh eyes on diff and tests
  await Task({
    subagent_type: 'review-agent',
    model: 'sonnet',
    prompt: 'Review task in review/'
  });

  // If rejected: loops back to implementation
  // If approved: continues to testing

  // Testing: validate + add missing edge cases
  await Task({
    subagent_type: 'testing-agent',
    model: 'haiku',
    prompt: 'Validate tests in testing/'
  });
}
```

### 4. Verification

```bash
# Run full test suite
npm test

# Check all tasks completed
completed=$(ls .plans/project/completed/*.md 2>/dev/null | wc -l)
total=$(find .plans/project -name "*.md" -not -name "plan.md" -not -name "milestones.md" | wc -l)

if [ $completed -eq $total ]; then
  echo "✅ All tasks complete"
fi
```

## Output

```markdown
✅ Feature Complete: "{{ARGS}}"

Plan: .plans/<project>/
Tasks: 8/8 completed (Foundation: 3, Integration: 4, Polish: 1)

Quality:
- Security: 90/100 avg
- Quality: 92/100 avg
- Performance: 95/100 avg
- Tests: 91/100 avg
- Coverage: 94%

Cost estimate: ~$1.50 (optimized with Haiku workers)

Next: git commit && git push
```

## Cost Warning

Multi-agent uses **15× more tokens**. Estimated cost based on complexity:
- Simple (6 tasks): $0.45-0.80
- Medium (12 tasks): $0.95-2.00
- Complex (25 tasks): $2.80-4.50

Only use for genuinely complex, high-value tasks.
