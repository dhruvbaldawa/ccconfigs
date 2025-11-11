# Coordination Patterns for Multi-Agent Workflows

Detailed patterns for coordinating planning, implementation, review, and testing agents.

## Pattern 1: Sequential Execution (Default)

### When to Use
- Clear dependencies between tasks
- Quality gates required between phases
- Most common pattern (70% of use cases)
- First-time implementation of a feature

### Flow Diagram
```
Planning Agent
    ↓
Implementation Agent (Task 1)
    ↓
Review Agent (Task 1)
    ↓
Testing Agent (Task 1)
    ↓ (if approved)
Implementation Agent (Task 2)
    ↓
Review Agent (Task 2)
    ↓
Testing Agent (Task 2)
    ↓
...continue for all tasks
```

### Implementation Example

```typescript
// Pseudo-code for sequential pattern
const tasks = await planningAgent.createPlan(userRequest);

for (const task of tasks) {
  // Check dependencies
  if (!task.dependencies.every(dep => dep.status === 'completed')) {
    console.log(`Skipping ${task.id} - unmet dependencies`);
    continue;
  }

  // Implementation
  const implementation = await implementationAgent.execute(task);

  // Review
  const review = await reviewAgent.evaluate(implementation);

  // Handle feedback loop
  while (review.requiresChanges) {
    await implementationAgent.fix(review.feedback);
    review = await reviewAgent.reevaluate();
  }

  // Testing
  await testingAgent.createTests(task);

  // Mark complete
  task.status = 'completed';
}
```

### Advantages
- ✅ Simple to reason about
- ✅ Clear failure points
- ✅ Easy to debug
- ✅ Predictable cost (no parallel overhead)
- ✅ Quality gates enforced

### Disadvantages
- ❌ Higher latency (tasks run one after another)
- ❌ No parallelization benefits
- ❌ Slower for independent tasks

### Metrics
- Expected throughput: 3-5 tasks per hour
- Token usage: ~10-15K per task
- Review cycles: Average 1.5 per task

## Pattern 2: Concurrent Execution (Advanced)

### When to Use
- Tasks have no dependencies
- Files don't conflict
- Time-sensitive delivery
- High confidence in parallelization

### Flow Diagram
```
Planning Agent
    ↓
    ├──> Implementation Agent (Task 1)
    ├──> Implementation Agent (Task 2)
    └──> Implementation Agent (Task 3)
           ↓ (all complete)
    ├──> Review Agent (Task 1)
    ├──> Review Agent (Task 2)
    └──> Review Agent (Task 3)
           ↓ (all complete)
    ├──> Testing Agent (Task 1)
    ├──> Testing Agent (Task 2)
    └──> Testing Agent (Task 3)
```

### Implementation Example

```typescript
// Identify independent tasks
const independentTasks = tasks.filter(task =>
  task.dependencies.length === 0 &&
  !hasFileConflicts(task, tasks)
);

// Run implementations in parallel
await Promise.all(
  independentTasks.map(task =>
    implementationAgent.execute(task)
  )
);

// Run reviews in parallel
await Promise.all(
  independentTasks.map(task =>
    reviewAgent.evaluate(task)
  )
);

// Run testing in parallel
await Promise.all(
  independentTasks.map(task =>
    testingAgent.createTests(task)
  )
);

// Execute dependent tasks sequentially after
const dependentTasks = tasks.filter(task =>
  task.dependencies.length > 0
);
// ... sequential execution for dependent tasks
```

### File Conflict Detection

```typescript
const hasFileConflicts = (task, allTasks) => {
  const taskFiles = new Set(task.files);

  for (const otherTask of allTasks) {
    if (otherTask.id === task.id) continue;
    if (otherTask.status === 'in_progress') {
      const overlap = otherTask.files.some(f => taskFiles.has(f));
      if (overlap) return true;
    }
  }

  return false;
};
```

### Advantages
- ✅ Faster completion (2-3× speedup for independent tasks)
- ✅ Better resource utilization
- ✅ Reduced overall latency

### Disadvantages
- ❌ Risk of file conflicts
- ❌ Harder to debug
- ❌ Merge complexity
- ❌ Higher token usage (more context per agent)

### Risk Mitigation
1. **Planning agent identifies independent tasks explicitly**
2. **File-level dependency tracking**
3. **Automatic conflict detection before spawning**
4. **Rollback to sequential on conflict**

### Metrics
- Expected throughput: 8-12 tasks per hour (if parallelizable)
- Token usage: ~12-18K per task (higher due to parallel context)
- Conflict rate: Target <5%

## Pattern 3: Iterative Review (Quality-Focused)

### When to Use
- Security-critical features
- Performance requirements strict
- Learning/improvement focused
- High-stakes production code

### Flow Diagram
```
Implementation Agent
    ↓
Review Agent
    ↓
Feedback? ──YES──> Implementation Agent (fix)
    │                     ↓
    NO                Review Agent (re-review)
    ↓                     ↓
Testing Agent      (loop until approved)
```

### Implementation Example

```typescript
let review;
let iteration = 0;
const MAX_ITERATIONS = 5;

do {
  if (iteration > 0) {
    // Fix based on feedback
    await implementationAgent.fix(review.feedback);
  } else {
    // Initial implementation
    await implementationAgent.execute(task);
  }

  // Review
  review = await reviewAgent.evaluate(task);
  iteration++;

  if (iteration >= MAX_ITERATIONS) {
    throw new Error(`Task ${task.id} exceeded maximum review iterations. Manual intervention required.`);
  }

} while (review.requiresChanges);

// Only proceed to testing after approval
await testingAgent.createTests(task);
```

### Quality Gates

```typescript
const qualityGates = {
  security: {
    minimum: 85,
    critical: ['SQL injection', 'XSS', 'Auth bypass']
  },
  performance: {
    minimum: 80,
    criticalMetrics: ['Response time >200ms', 'N+1 queries']
  },
  coverage: {
    minimum: 90,
    branches: 85
  }
};

const passesQualityGates = (review) => {
  if (review.securityScore < qualityGates.security.minimum) {
    return false;
  }

  if (review.hasCriticalIssues(qualityGates.security.critical)) {
    return false;
  }

  return true;
};
```

### Advantages
- ✅ Highest quality output
- ✅ Security vulnerabilities caught early
- ✅ Performance issues identified
- ✅ Learning opportunity for continuous improvement

### Disadvantages
- ❌ Slower (multiple review cycles)
- ❌ Higher token cost (2-3× due to iterations)
- ❌ Can get stuck in review loop

### Iteration Limits
- Maximum 5 review cycles per task
- After 3 cycles, escalate to human review
- Automatic fallback if quality gates never pass

### Metrics
- Expected iterations: 1.5-2.5 per task
- Token usage: ~15-25K per task
- Time to approval: 30-45 minutes

## Pattern 4: Hybrid (Most Practical)

### When to Use
- Mixed complexity (some simple, some complex tasks)
- Some tasks parallelizable, others sequential
- Balancing speed and quality

### Flow Diagram
```
Planning Agent
    ↓
Phase 1: Foundation (Sequential, Quality-Focused)
    Task 001: Database Model
        ↓ (iterative review)
    Task 002: API Schema
        ↓ (iterative review)

Phase 2: Features (Concurrent where possible)
    ├──> Task 003: Login Endpoint
    ├──> Task 004: Signup Endpoint
    └──> Task 005: Password Reset
           ↓ (all complete)
    Reviews in parallel
           ↓

Phase 3: Integration (Sequential)
    Task 006: Integration Tests
        ↓
    Task 007: Documentation
```

### Implementation Example

```typescript
const phases = groupTasksByPhase(tasks);

for (const phase of phases) {
  if (phase.requiresSequential) {
    // Sequential execution with quality focus
    for (const task of phase.tasks) {
      await executeWithIterativeReview(task);
    }
  } else {
    // Concurrent execution
    const independent = identifyIndependentTasks(phase.tasks);
    await executeConcurrently(independent);

    const dependent = phase.tasks.filter(t => !independent.includes(t));
    for (const task of dependent) {
      await executeSequentially(task);
    }
  }
}
```

### Phase Definitions

**Foundation Phase** (Sequential, High Quality):
- Database schemas
- Core models
- Authentication/authorization
- Security infrastructure

**Feature Phase** (Concurrent where possible):
- API endpoints
- Business logic
- UI components
- Independent features

**Integration Phase** (Sequential):
- Integration tests
- E2E tests
- Documentation
- Performance testing

### Advantages
- ✅ Balanced approach (speed + quality)
- ✅ Optimized for real-world complexity
- ✅ Flexible adaptation to task characteristics

### Disadvantages
- ❌ More complex orchestration logic
- ❌ Requires sophisticated planning

### Metrics
- Expected throughput: 6-8 tasks per hour
- Token usage: ~12-18K per task (varies by phase)
- Quality score: 90+ on foundation, 85+ on features

## Choosing the Right Pattern

### Decision Matrix

| Factor | Sequential | Concurrent | Iterative | Hybrid |
|--------|-----------|-----------|-----------|--------|
| Task dependencies | Many | Few | Any | Mixed |
| Quality requirements | Standard | Standard | High | Varies |
| Time pressure | Low | High | Low | Medium |
| Complexity | Low-Med | Low | High | Mixed |
| Team experience | Any | High | Any | High |

### Decision Tree

```
Are tasks independent with no file conflicts?
├─ YES: Can use concurrent
│   └─ Is quality critical?
│       ├─ YES: Concurrent + Iterative Review
│       └─ NO: Concurrent
└─ NO: Cannot use concurrent
    └─ Is quality critical?
        ├─ YES: Sequential + Iterative Review
        └─ NO: Sequential

Multiple phases with different characteristics?
└─ YES: Use Hybrid pattern
```

### Pattern Selection Examples

**Example 1: Simple CRUD API**
- Pattern: Sequential
- Reason: Low complexity, standard quality, straightforward dependencies
- Expected: 4-6 hours for 8 tasks

**Example 2: Authentication System**
- Pattern: Iterative Review (Sequential)
- Reason: Security-critical, dependencies exist
- Expected: 6-8 hours for 6 tasks (multiple review cycles)

**Example 3: Microservice with 15 Endpoints**
- Pattern: Hybrid
- Reason: Foundation (DB schema) sequential, endpoints concurrent, tests sequential
- Expected: 8-12 hours for 20 tasks

**Example 4: UI Component Library**
- Pattern: Concurrent
- Reason: Independent components, no file conflicts, parallel development
- Expected: 4-6 hours for 12 tasks

## Handoff Coordination

### Explicit Handoffs

Every agent transition should include:

```markdown
## {{TIMESTAMP}} - {{SOURCE_AGENT}} → {{TARGET_AGENT}}

**Task:** {{TASK_ID}}
**Context:** {{What was done, current state}}

**From {{SOURCE_AGENT}}:**
{{Key information, decisions made, issues encountered}}

**To {{TARGET_AGENT}}:**
{{What needs to be done next, specific focus areas}}
```

### Context Preservation

**What to include:**
- ✅ Files modified
- ✅ Key decisions made
- ✅ Issues encountered and resolved
- ✅ Remaining concerns
- ✅ Specific areas for review/testing

**What to omit:**
- ❌ Full implementation details (read files instead)
- ❌ Redundant information (already in task file)
- ❌ Speculation or uncertainty

### Handoff Validation

```typescript
const validateHandoff = (handoff) => {
  const required = ['timestamp', 'source', 'target', 'task', 'context'];

  for (const field of required) {
    if (!handoff[field]) {
      throw new Error(`Handoff missing required field: ${field}`);
    }
  }

  // Context should be actionable
  if (handoff.context.length < 50) {
    console.warn('Handoff context seems too brief');
  }

  return true;
};
```

## State Synchronization

### Centralized State (.plans/)

All agents read and write to shared state:

```
.plans/<project>/
├── plan.md              # Single source of truth for task status
├── tasks/*.md           # Individual task details
└── handoffs.md          # Communication log
```

### State Update Protocol

1. **Read before write** (check current state)
2. **Atomic updates** (one agent modifies at a time)
3. **Timestamp all changes**
4. **Document who made the change**

### Conflict Prevention

```typescript
// Before updating task status
const currentStatus = await readTaskStatus(taskId);

if (currentStatus === 'in_progress' && newStatus === 'in_progress') {
  throw new Error(`Task ${taskId} already in progress by another agent`);
}

// Update with agent identification
await updateTaskStatus(taskId, {
  status: 'in_progress',
  agent: 'implementation-agent',
  timestamp: new Date().toISOString()
});
```

### Progress Tracking

```typescript
const updatePlanProgress = async (planPath) => {
  const plan = await Read(planPath);
  const tasks = extractTasks(plan);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;

  await Edit(planPath, {
    old: '## Progress',
    new: `## Progress

- ✅ ${completed}/${tasks.length} tasks completed
- 🔄 ${inProgress} tasks in progress
- ⏳ ${pending} tasks pending`
  });
};
```

## Error Recovery

### Review Rejection Recovery

```typescript
if (review.recommendation === 'REJECT') {
  // Log the rejection
  await logRejection(task, review);

  // Options:
  // 1. Escalate to planning agent (architectural issue)
  if (review.reason === 'architectural') {
    await escalateToPlanningAgent(task, review);
  }

  // 2. Multiple rework attempts
  if (review.reason === 'implementation') {
    let attempts = 0;
    while (attempts < 3) {
      await implementationAgent.rework(task, review);
      review = await reviewAgent.reevaluate(task);

      if (review.recommendation === 'APPROVE') break;
      attempts++;
    }
  }

  // 3. Mark as blocked, continue with other tasks
  if (attempts >= 3) {
    await updateTaskStatus(task.id, 'blocked');
    await notifyBlocker(task, review);
  }
}
```

### Blocked Task Management

```typescript
const handleBlockedTasks = async (tasks) => {
  const blocked = tasks.filter(t => t.status === 'blocked');

  for (const task of blocked) {
    console.log(`⚠️  Task ${task.id} blocked: ${task.blockerReason}`);

    // Try to find alternative independent tasks
    const alternatives = findIndependentTasks(tasks, blocked);

    if (alternatives.length > 0) {
      console.log(`Proceeding with ${alternatives.length} alternative tasks`);
      return alternatives;
    } else {
      throw new Error('All remaining tasks are blocked. Manual intervention required.');
    }
  }
};
```

### Timeout Handling

```typescript
const executeWithTimeout = async (agent, task, timeoutMs = 600000) => {
  return Promise.race([
    agent.execute(task),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Agent execution timeout')), timeoutMs)
    )
  ]);
};

try {
  await executeWithTimeout(implementationAgent, task, 10 * 60 * 1000); // 10 min
} catch (err) {
  if (err.message === 'Agent execution timeout') {
    console.error(`Task ${task.id} timed out. Marking as blocked.`);
    await updateTaskStatus(task.id, 'blocked');
  }
}
```

## Monitoring and Observability

### Agent Activity Tracking

```typescript
const agentActivity = {
  planning: { invocations: 0, totalTokens: 0, avgDuration: 0 },
  implementation: { invocations: 0, totalTokens: 0, avgDuration: 0 },
  review: { invocations: 0, totalTokens: 0, avgDuration: 0 },
  testing: { invocations: 0, totalTokens: 0, avgDuration: 0 }
};

const trackAgentInvocation = (agentType, tokens, durationMs) => {
  const stats = agentActivity[agentType];
  stats.invocations++;
  stats.totalTokens += tokens;
  stats.avgDuration =
    (stats.avgDuration * (stats.invocations - 1) + durationMs) / stats.invocations;
};
```

### Quality Metrics Aggregation

```typescript
const aggregateQualityMetrics = (tasks) => {
  const reviews = tasks.flatMap(t => t.reviews);

  return {
    avgSecurityScore: avg(reviews.map(r => r.securityScore)),
    avgQualityScore: avg(reviews.map(r => r.qualityScore)),
    avgPerformanceScore: avg(reviews.map(r => r.performanceScore)),
    reviewCyclesPerTask: reviews.length / tasks.length,
    approvalRate: reviews.filter(r => r.approved).length / reviews.length
  };
};
```

### Cost Tracking

```typescript
const costTracker = {
  sonnetTokens: 0,
  haikuTokens: 0,

  trackUsage(model, tokens) {
    if (model === 'sonnet') {
      this.sonnetTokens += tokens;
    } else if (model === 'haiku') {
      this.haikuTokens += tokens;
    }
  },

  estimateCost() {
    // Sonnet: $3 input / $15 output per million
    // Haiku: $1 input / $5 output per million
    // Assume 30% output, 70% input
    const sonnetCost =
      (this.sonnetTokens * 0.7 * 3 + this.sonnetTokens * 0.3 * 15) / 1_000_000;
    const haikuCost =
      (this.haikuTokens * 0.7 * 1 + this.haikuTokens * 0.3 * 5) / 1_000_000;

    return {
      sonnet: sonnetCost,
      haiku: haikuCost,
      total: sonnetCost + haikuCost
    };
  }
};
```

---

Use these patterns strategically based on task characteristics, quality requirements, and time constraints. Most projects benefit from the Hybrid pattern, adapting coordination strategy per phase.
