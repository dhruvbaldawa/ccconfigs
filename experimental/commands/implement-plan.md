---
description: Execute tasks from existing plan using implementation, review, and testing agents. Coordinates multi-agent workflow.
---

# Implement Plan

You are coordinating an **implementation workflow** to execute tasks from an existing plan with implementation, review, and testing agents.

## Input

Project name: {{ARGS}}
Plan location: `.plans/{{ARGS}}/plan.md`

## Your Task

Execute all tasks from the plan using sequential coordination pattern (Planning → Implementation → Review → Testing).

### Step 1: Validate Plan Exists

```typescript
// Read the plan
const plan = await Read('.plans/{{ARGS}}/plan.md');

// Verify it's a valid plan
if (!plan) {
  throw new Error('Plan not found at .plans/{{ARGS}}/plan.md. Run /plan-feature first.');
}
```

### Step 2: Extract Task List

Parse the plan.md to identify all tasks:
- Task IDs (001, 002, 003, ...)
- Task status (pending, in_progress, completed)
- Dependencies

### Step 3: Execute Tasks Sequentially

For each task in order:

#### 3a. Check if Ready

```typescript
// Skip if already completed
if (task.status === 'completed') continue;

// Skip if dependencies not met
if (!allDependenciesCompleted(task.dependencies)) {
  console.log(`Skipping ${task.id} - dependencies not met`);
  continue;
}
```

#### 3b. Implementation Phase

```typescript
await Task({
  subagent_type: 'implementation-agent',
  model: 'haiku',
  description: `Implement ${task.name}`,
  prompt: `
    Execute ${task.id} from .plans/{{ARGS}}/

    1. Read task file: .plans/{{ARGS}}/tasks/${task.id}.md
    2. Update task status to "in_progress"
    3. Read and understand acceptance criteria
    4. Explore relevant code to understand patterns
    5. Implement the solution following project conventions
    6. Run tests to verify implementation
    7. Document implementation notes in task file
    8. Create handoff to review-agent

    Remember:
    - Follow existing patterns, don't invent new ones
    - One task at a time
    - No architectural decisions
    - Update handoffs.md with context for review agent
  `
});
```

#### 3c. Review Phase

```typescript
await Task({
  subagent_type: 'review-agent',
  model: 'sonnet',
  description: `Review ${task.name}`,
  prompt: `
    Review ${task.id} from .plans/{{ARGS}}/

    1. Read latest handoff from implementation-agent in handoffs.md
    2. Read the task file to understand what was supposed to be implemented
    3. Read all changed files
    4. Perform security review (OWASP Top 10)
    5. Perform code quality review
    6. Perform performance review
    7. Check standards compliance
    8. Calculate scores (security, quality, performance, standards)
    9. Provide recommendation: APPROVE | APPROVE WITH CHANGES | REJECT
    10. Create handoff with detailed feedback

    Focus areas for this task:
    ${task.securityCritical ? '- HIGH SECURITY SCRUTINY (authentication/authorization)' : ''}
    ${task.performanceCritical ? '- PERFORMANCE (query optimization, caching)' : ''}

    Be constructive but thorough. Blocking issues must be fixed.
  `
});
```

#### 3d. Handle Review Feedback

```typescript
// Check review outcome
const reviewHandoff = await readLatestHandoff('review-agent', task.id);

if (reviewHandoff.recommendation === 'APPROVE WITH CHANGES') {
  // Re-implement to address feedback
  await Task({
    subagent_type: 'implementation-agent',
    model: 'haiku',
    description: `Fix issues in ${task.name}`,
    prompt: `
      Address review feedback for ${task.id} from .plans/{{ARGS}}/

      1. Read review-agent feedback from handoffs.md
      2. Identify blocking issues that MUST be fixed
      3. Implement the requested changes
      4. Update implementation notes
      5. Re-submit handoff to review-agent for re-review
    `
  });

  // Re-review
  await Task({
    subagent_type: 'review-agent',
    model: 'sonnet',
    description: `Re-review ${task.name}`,
    prompt: `
      Re-review ${task.id} after implementation agent addressed feedback.

      1. Read latest handoff
      2. Verify blocking issues were fixed
      3. Provide updated scores and recommendation
    `
  });
}

if (reviewHandoff.recommendation === 'REJECT') {
  throw new Error(`${task.id} rejected by review agent. Check handoffs.md for details. May need replanning.`);
}
```

#### 3e. Testing Phase

```typescript
await Task({
  subagent_type: 'testing-agent',
  model: 'haiku',
  description: `Test ${task.name}`,
  prompt: `
    Write comprehensive tests for ${task.id} from .plans/{{ARGS}}/

    1. Read task file to understand acceptance criteria
    2. Read implementation to understand what was built
    3. Design test scenarios (behavior-focused, not logic-focused)
    4. Choose appropriate granularity:
       - Unit tests for pure functions
       - Integration tests for component interactions
       - E2E tests only for critical user workflows
    5. Write tests following project test patterns
    6. Run tests and verify coverage (target: >80%)
    7. Document test results in task file
    8. Create handoff summarizing test coverage

    IMPORTANT:
    - Behavior over logic (test what it does, not how)
    - Right granularity (simplest test type that provides confidence)
    - No test bloat (every test must have clear value)
    - Focus on edge cases and error handling
  `
});
```

#### 3f. Mark Task Complete

```typescript
// Update task status to completed
await updateTaskStatus(task.id, 'completed');

// Update progress in plan.md
await updatePlanProgress();

console.log(`✅ ${task.id} completed`);
```

### Step 4: Summary

After all tasks complete:

```markdown
✅ Implementation Complete

Project: {{ARGS}}
Tasks completed: {{completed}}/{{total}}

**Review Scores (Average):**
- Security: {{avg security score}}/100
- Quality: {{avg quality score}}/100
- Performance: {{avg performance score}}/100
- Standards: {{avg standards score}}/100

**Test Coverage:** {{coverage}}%

**Files Modified:**
- {{file1}}
- {{file2}}
- ...

**Next Steps:**
- Run full test suite: `npm test`
- Create commit: `git add . && git commit`
- Create PR if on feature branch
```

## Handling Blockers

If a task gets blocked:

```markdown
⚠️ Task ${task.id} blocked

Reason: {{blocker reason}}

Options:
1. Skip to next independent task
2. Escalate to planning agent for replanning
3. Manual intervention needed

Proceeding with option {{chosen option}}...
```

## Example Usage

```
/implement-plan user-authentication

/implement-plan realtime-notifications

/implement-plan database-refactor
```

## Cost Estimation

Before starting, estimate token usage:

```markdown
📊 Cost Estimate for {{ARGS}}

Tasks: {{N}}
Agents per task: 3-4 (implementation, review, testing, possible rework)
Model distribution:
- Haiku (workers): ~{{X}}K tokens
- Sonnet (review): ~{{Y}}K tokens

Estimated cost: ${{estimate}}

Proceed? (This is 15× more expensive than single-agent)
```

## Quality Gates

Enforce quality gates:
- Minimum security score: 80/100
- Minimum quality score: 80/100
- Minimum test coverage: 80%
- All tests must pass

If quality gates fail:
```markdown
❌ Quality Gate Failed

Task: {{task.id}}
Issue: {{Security score 65/100 (minimum 80)}}

Blocking implementation until quality standards met.
Requesting additional review iteration...
```
