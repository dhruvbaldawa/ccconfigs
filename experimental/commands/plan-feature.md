---
description: Create implementation plan with task breakdown in pending/
---

# Plan Feature

Analyze request and create `.plans/<project>/` structure with task breakdown.

## Usage

```
/plan-feature Add user authentication with JWT
/plan-feature Build real-time notifications
```

## Your Task

Invoke the **planning skill** to analyze the request: "${{{ARGS}}}"

The planning skill will:
- Ask clarifying questions if requirements unclear
- Use technical-planning skill for risk-first analysis
- Create .plans/<project>/ structure with risk analysis and iterations
- Generate tasks with LLM Prompt blocks in pending/
- Document deferred items with rationale

After planning completes:
1. Count tasks created in pending/
2. Summarize iterations and risk mitigation strategy
3. List deferred items
4. Report next step: /implement-plan <project-name>

## Output Format

```markdown
✅ Planning Complete

Project: <project-name>
Tasks: X total (Foundation: Y, Integration: Z, Polish: W)

Risk Mitigation:
- Iteration 1 (Foundation): [Critical+Unknown]
- Iteration 2 (Integration): [Critical+Known]
- Iteration 3 (Polish): [Non-Critical]

Deferred: [Items with rationale]
Key Files: [List]

Next: /implement-plan <project-name>
```
