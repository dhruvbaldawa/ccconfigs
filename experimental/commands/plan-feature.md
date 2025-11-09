---
description: Create implementation plan with task breakdown in pending/
---

# Plan Feature

Spawn planning-agent to analyze request and create `.plans/<project>/` structure.

## Usage

```
/plan-feature Add user authentication with JWT
/plan-feature Build real-time notifications
```

## Your Task

```typescript
await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  description: 'Plan feature',
  prompt: `Plan: "${{{ARGS}}}"`
});
```

Planning agent will:
- Use technical-planning skill for risk-first analysis
- Create .plans/<project>/ with risk analysis and iterations
- Generate tasks with LLM Prompt blocks in pending/
- Document deferred items

## Output

```markdown
✅ Planning Complete

Project: user-authentication
Tasks: 6 total (Foundation: 2, Integration: 3, Polish: 1)

Risk Mitigation:
- Iteration 1 (Foundation): Bcrypt password hashing (Critical+Unknown)
- Iteration 2 (Integration): JWT middleware, rate limiting (Critical+Known)
- Iteration 3 (Polish): Password reset flow (Non-Critical)

Deferred to Iteration 2: OAuth integration

Next: /implement-plan user-authentication
```
