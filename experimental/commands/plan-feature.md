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
- Iteration 1 (Foundation): [Critical+Unknown items addressed first]
- Iteration 2 (Integration): [Critical+Known items]
- Iteration 3 (Polish): [Non-Critical items]

Deferred Items:
- [Item]: [Rationale for deferring]

Key Files Impacted:
- [List of main files that will be modified]

Next: /implement-plan <project-name>
```

## Example

```
/plan-feature Add user authentication with JWT
```

**Output:**
```markdown
✅ Planning Complete

Project: user-authentication
Tasks: 6 total (Foundation: 2, Integration: 3, Polish: 1)

Risk Mitigation:
- Iteration 1 (Foundation): Bcrypt password hashing (Critical+Unknown)
- Iteration 2 (Integration): JWT middleware, rate limiting (Critical+Known)
- Iteration 3 (Polish): Password reset flow (Non-Critical)

Deferred Items:
- OAuth integration: Deferred to separate feature (out of scope)

Key Files Impacted:
- src/models/User.ts
- src/routes/auth.ts
- src/middleware/auth.ts
- tests/auth.test.ts

Next: /implement-plan user-authentication
```
