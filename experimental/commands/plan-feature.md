---
description: Create structured implementation plan using planning agent. Analyzes requirements, breaks down tasks, identifies dependencies.
---

# Plan Feature

You are coordinating a **planning workflow** to analyze a feature request and create a structured implementation plan.

## Input

The user has requested planning for: {{ARGS}}

## Your Task

Spawn the planning agent to analyze this request and create a comprehensive plan in `.plans/<project>/`.

```typescript
await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  description: 'Analyze and plan feature',
  prompt: `
    Analyze and create implementation plan for:
    "${{{ARGS}}}"

    Follow these steps:

    1. **Understand the Requirement**
       - What is being requested?
       - Why is it needed?
       - What's the expected outcome?

    2. **Explore the Codebase**
       - Use Glob to find relevant files
       - Use Grep to understand existing patterns
       - Read similar implementations for context

    3. **Determine Project Structure**
       - Decide: single-milestone or multi-milestone?
       - Decision criteria:
         * <10 tasks → single-milestone
         * >=10 tasks OR >2 weeks duration → multi-milestone
         * High architectural complexity → multi-milestone + architecture.md

    4. **Create Project Structure**
       - Use templates from experimental/templates/
       - Create .plans/<project-name>/
       - Generate plan.md (use appropriate template)
       - Create all task files in tasks/
       - Initialize handoffs.md

    5. **Task Breakdown**
       - Each task should be atomic (1-2 hours work)
       - Specific file changes listed
       - Clear acceptance criteria
       - Dependencies explicitly stated

    6. **Quality Check**
       - Verify all tasks have acceptance criteria
       - Ensure dependencies are clear
       - Confirm file impacts are identified
       - Security implications considered

    7. **Summarize the Plan**
       - Total number of tasks
       - Estimated complexity
       - Key files to be modified
       - Any risks or uncertainties

    IMPORTANT:
    - You are planning ONLY - do not implement
    - Read-only operations on codebase
    - Create clear, actionable tasks
    - Enable implementation agent to work autonomously
  `
});
```

## After Planning Complete

Summarize the plan for the user:

```markdown
✅ Planning Complete

Created plan for "{{feature name}}" in .plans/{{project-name}}/

**Structure:** {{Single milestone | Multi-milestone}}
**Tasks:** {{N}} total
**Estimated Duration:** {{estimate}}
**Complexity:** {{Low | Medium | High}}

**Key Files:**
- {{file1}} ({{create | modify}})
- {{file2}} ({{create | modify}})
- ...

**Risks:**
- {{Risk 1 if any}}
- {{Risk 2 if any}}

**Next Steps:**
- Ready for implementation: Use `/implement-plan {{project-name}}`
- Or review plan: `Read .plans/{{project-name}}/plan.md`
```

## Example Usage

```
/plan-feature Add user authentication with JWT

/plan-feature Implement real-time notifications using WebSocket

/plan-feature Refactor database layer to use Prisma ORM
```
