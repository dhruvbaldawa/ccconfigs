---
description: Full multi-agent workflow from planning through implementation. Coordinates planning, implementation, review, and testing agents for complete feature delivery.
---

# Orchestrate

You are coordinating a **complete multi-agent workflow** from planning through implementation, review, and testing.

## Input

Feature request: {{ARGS}}

## Your Task

Execute the full development lifecycle using the multi-agent orchestration skill.

### Step 1: Complexity Analysis

```markdown
Analyzing request: "{{ARGS}}"

Complexity Score:
- Estimated files to change: {{N}} × 1 point = {{score}}
- New patterns needed: {{N}} × 3 points = {{score}}
- Security sensitivity: {{N}} × 5 points = {{score}}
- Integration complexity: {{N}} × 2 points = {{score}}

Total: {{total}} points

Decision:
{{<10 points}} → Consider single-agent approach (simpler, cheaper)
{{10-20 points}} → Multi-agent recommended
{{>20 points}} → Multi-agent + architectural planning required

Proceeding with multi-agent workflow.
```

### Step 2: Planning Phase

Spawn planning agent to create structured plan:

```typescript
await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  description: 'Plan feature implementation',
  prompt: `
    Analyze and create implementation plan for:
    "${{{ARGS}}}"

    1. Explore codebase to understand existing patterns
    2. Determine single vs multi-milestone structure
    3. Create .plans/<project-name>/ with appropriate structure
    4. Break down into atomic, actionable tasks
    5. Identify dependencies and file impacts
    6. Define clear acceptance criteria for each task
    7. Document architecture decisions if needed
    8. Create initial handoff to implementation agent

    Templates available in: experimental/templates/

    Follow planning-agent guidelines.
  `
});
```

**Output:**
```markdown
✅ Planning Complete

Created: .plans/{{project-name}}/plan.md
Structure: {{Single | Multi}}-milestone
Tasks: {{N}} total
Complexity: {{Low | Medium | High}}
```

### Step 3: Implementation Phase

Execute tasks using sequential coordination:

```typescript
const plan = await Read('.plans/{{project-name}}/plan.md');
const tasks = extractTasks(plan);

for (const task of tasks) {
  // Skip if not ready
  if (!isReadyForImplementation(task)) continue;

  // Implementation
  await Task({
    subagent_type: 'implementation-agent',
    model: 'haiku',
    description: `Implement ${task.name}`,
    prompt: `Execute ${task.id} from .plans/{{project-name}}/`
  });

  // Review
  await Task({
    subagent_type: 'review-agent',
    model: 'sonnet',
    description: `Review ${task.name}`,
    prompt: `Review ${task.id} for security, quality, performance, standards`
  });

  // Handle review feedback
  const review = await readLatestHandoff('review-agent');
  if (review.requiresChanges) {
    await Task({
      subagent_type: 'implementation-agent',
      model: 'haiku',
      description: `Fix ${task.name}`,
      prompt: `Address review feedback for ${task.id}`
    });
    // Re-review...
  }

  // Testing
  await Task({
    subagent_type: 'testing-agent',
    model: 'haiku',
    description: `Test ${task.name}`,
    prompt: `Write behavior-focused tests for ${task.id}`
  });

  // Mark complete
  await updateTaskStatus(task.id, 'completed');

  console.log(`✅ ${task.id} complete`);
}
```

### Step 4: Verification

After all tasks complete:

```typescript
// Run full test suite
await Bash('npm test');

// Check coverage
await Bash('npm run test:coverage');

// Verify quality gates
const qualityReport = generateQualityReport();

if (qualityReport.allPassed) {
  console.log('✅ All quality gates passed');
} else {
  console.log('⚠️  Quality gates failed:', qualityReport.failures);
}
```

### Step 5: Summary

```markdown
✅ Feature Complete: "{{ARGS}}"

**Plan:** .plans/{{project-name}}/
**Tasks Completed:** {{completed}}/{{total}}

**Quality Metrics:**
- Average Security Score: {{score}}/100
- Average Quality Score: {{score}}/100
- Average Performance Score: {{score}}/100
- Test Coverage: {{coverage}}%

**Files Modified:**
- {{file1}} ({{created | modified}})
- {{file2}} ({{created | modified}})
- ...

**Review Iterations:**
- Total review cycles: {{N}}
- Average per task: {{avg}}

**Cost Estimate:**
- Total tokens used: ~{{tokens}}K
- Estimated cost: ${{cost}}

**Next Steps:**
1. Review changes: `git diff`
2. Run final tests: `npm test`
3. Create commit: `git add . && git commit -m "{{commit message}}"`
4. Push and create PR
```

## Coordination Flow

```
┌─────────────────────────────────────────────────┐
│ User Request: "{{ARGS}}"                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Complexity Analysis                             │
│ - Files to change: {{N}}                        │
│ - Security sensitivity: {{High | Low}}          │
│ - Decision: Multi-agent workflow                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ PLANNING AGENT (Sonnet)                         │
│ - Analyze codebase                              │
│ - Create task breakdown                         │
│ - Define acceptance criteria                    │
│ Output: .plans/{{project}}/plan.md              │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ For Each Task   │
         └────────┬────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ IMPLEMENTATION AGENT (Haiku)│
    │ - Execute task              │
    │ - Write code                │
    │ - Update status             │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │ REVIEW AGENT (Sonnet)       │
    │ - Security check            │
    │ - Quality check             │
    │ - Performance check         │
    │ - Provide feedback          │
    └──────────┬──────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Changes Required?            │
    ├─────────┬────────────────────┤
    │ YES     │ NO                 │
    │ ↓       │ ↓                  │
    │ Re-impl │ Continue           │
    └─────────┴──────────┬─────────┘
                         │
                         ▼
    ┌─────────────────────────────┐
    │ TESTING AGENT (Haiku)       │
    │ - Design test scenarios     │
    │ - Choose granularity        │
    │ - Write tests               │
    │ - Verify coverage           │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │ Task Complete ✓             │
    └──────────┬──────────────────┘
               │
               └──────► Next Task

                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ All Tasks Complete                              │
│ - Run full test suite                           │
│ - Generate quality report                       │
│ - Provide summary                               │
└─────────────────────────────────────────────────┘
```

## Cost Awareness

**Before starting:**

```markdown
💰 Multi-Agent Cost Estimate

Feature: "{{ARGS}}"
Estimated complexity: {{Low | Medium | High}}
Estimated tasks: {{N}}

Token estimate:
- Planning: ~{{X}}K tokens (Sonnet)
- Implementation: ~{{Y}}K tokens per task (Haiku)
- Review: ~{{Z}}K tokens per task (Sonnet)
- Testing: ~{{W}}K tokens per task (Haiku)
- Total: ~{{total}}K tokens

Cost estimate: ${{cost}}

⚠️  This is approximately 15× more expensive than single-agent approach.

Proceed only if:
- Feature is complex (>10 tasks)
- Quality is critical (security, performance)
- Task value justifies cost

Proceed? [Y/n]
```

## Error Handling

### Planning Failures

```markdown
❌ Planning Failed

Reason: {{error}}

Options:
1. Retry with more context
2. Simplify request
3. Manual planning
```

### Implementation Blockers

```markdown
⚠️ Task {{task.id}} Blocked

Reason: {{Missing dependency | Unclear spec | Technical issue}}

Actions:
1. Skip to next independent task
2. Escalate to planning agent
3. Request human intervention
```

### Review Rejections

```markdown
❌ Review Rejected: {{task.id}}

Security Score: {{score}}/100 (Critical vulnerabilities found)

Blocking issues:
- {{Issue 1}}
- {{Issue 2}}

Options:
1. Re-implement with security fixes
2. Escalate to architecture review
3. Abandon task (if unfixable)

Proceeding with option 1...
```

### Testing Failures

```markdown
❌ Tests Failing: {{task.id}}

Failed tests:
- {{test 1}}
- {{test 2}}

Coverage: {{X}}% (target: 80%)

Actions:
1. Implementation agent fixes failing tests
2. Testing agent refines test scenarios
3. Review acceptance criteria (may need adjustment)
```

## Quality Gates

Enforce minimum standards:

```typescript
const qualityGates = {
  minSecurityScore: 80,
  minQualityScore: 80,
  minCoverage: 80,
  allTestsMustPass: true
};

if (!meetsQualityGates(task, qualityGates)) {
  throw new Error('Quality gates not met. Blocking task completion.');
}
```

## Example Usage

```
/orchestrate Add user authentication with JWT and rate limiting

/orchestrate Build real-time notification system using WebSocket

/orchestrate Refactor API layer to use GraphQL instead of REST
```

## When to Stop and Regroup

**Stop orchestration if:**
- More than 3 review rejection cycles for a task
- Planning agent can't determine appropriate breakdown
- Fundamental architectural questions arise
- Cost estimate exceeds $50 for a single feature

**Escalate to human:**
- Architecture decisions needed
- Trade-off analysis required
- Ambiguous requirements
- Security design questions
