---
description: Create implementation plan with task breakdown in pending/
---

# Plan Feature

Spawn planning agent to analyze request and create `.plans/<project>/` structure.

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
  prompt: `
    Analyze and plan: "${{{ARGS}}}"

    1. Glob codebase to understand patterns
    2. Determine single vs multi-milestone (<10 tasks vs >=10)
    3. Create .plans/<project-name>/ with:
       - plan.md
       - pending/, implementation/, review/, testing/, completed/ directories
       - All task files in pending/
       - milestones.md (if multi-milestone)

    4. Summarize:
       - Total tasks
       - Complexity estimate
       - Key files
       - Risks
  `
});
```

## Output

```markdown
✅ Planning Complete

Project: user-authentication
Tasks: 6 in pending/
Complexity: Medium
Key files: src/models/User.ts, src/routes/auth.ts, src/middleware/auth.ts

Next: /implement-plan user-authentication
```
