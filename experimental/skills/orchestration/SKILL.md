---
name: multi-agent-orchestration
description: Coordinate multiple specialized agents (planning, implementation, review, testing) for complex software development tasks. Use PROACTIVELY when tasks require multi-step development workflows.
---

# Multi-Agent Orchestration

Coordinate specialized agents to execute complex development workflows. This skill enables you to manage planning, implementation, review, and testing agents working together on features, bug fixes, and refactoring tasks.

## When to Use Multi-Agent Workflows

### ✅ Use Multi-Agent When:

- **Feature complexity**: >3 distinct implementation steps
- **Multiple file changes**: Touching 5+ files
- **Cross-cutting concerns**: Authentication, validation, error handling across layers
- **Quality requirements**: Explicit security, performance, or testing requirements
- **Architectural changes**: New patterns, significant refactoring
- **High-value tasks**: Worth 15× token cost (research shows multi-agent uses 15× more tokens)

### ❌ Use Single-Agent When:

- **Simple changes**: 1-2 file modifications
- **Quick fixes**: Bug fixes with known root cause
- **Documentation**: README updates, comment additions
- **Configuration**: Environment variable changes, dependency updates
- **Trivial features**: <3 implementation steps

### Decision Framework

```
Complexity Score:
  Files to change: _____ × 1 point
  New patterns:    _____ × 3 points
  Security risk:   _____ × 5 points
  Integration:     _____ × 2 points

Total < 10 points  → Single agent
Total 10-20 points → Multi-agent (3-4 agents)
Total > 20 points  → Multi-agent + architecture planning
```

## Available Agents

### 1. Planning Agent (`planning-agent`)
**Purpose:** Analyze requirements, create task breakdown, identify dependencies
**Tools:** Read, Grep, Glob, Bash (read-only)
**Model:** Sonnet (reasoning)
**Output:** `.plans/<project>/plan.md` with task breakdown

**When to use:**
- Feature requests without clear implementation steps
- Bug fixes requiring investigation
- Refactoring with unclear scope

### 2. Implementation Agent (`implementation-agent`)
**Purpose:** Execute tasks, write code, coordinate with review/testing
**Tools:** Read, Edit, Write, Bash, Grep, Glob (full access)
**Model:** Haiku (cost-optimized worker)
**Output:** Code changes, task status updates

**When to use:**
- After planning agent creates tasks
- Clear specifications exist
- Acceptance criteria defined

### 3. Review Agent (`review-agent`)
**Purpose:** Security, quality, performance, standards compliance
**Tools:** Read, Grep, Glob, Bash (analysis only)
**Model:** Sonnet (judgment)
**Output:** Review scores, feedback, approval/rejection

**When to use:**
- After implementation completes
- Before marking tasks complete
- Security-sensitive changes

### 4. Testing Agent (`testing-agent`)
**Purpose:** Design test scenarios, write tests at appropriate granularity
**Tools:** Read, Edit, Write, Bash, Grep, Glob
**Model:** Haiku (worker)
**Output:** Test files, coverage reports

**When to use:**
- After implementation completes
- Complex logic requiring comprehensive testing
- Integration/E2E scenarios

## Coordination Patterns

### Pattern 1: Sequential (Default)

**Flow:**
```
Planning → Implementation → Review → Testing → Complete
```

**When to use:**
- Clear dependencies between steps
- Quality gates required
- Most common pattern

**Example:**
```markdown
1. Planning agent analyzes "Add user authentication"
2. Creates .plans/user-authentication/plan.md with 6 tasks
3. Implementation agent executes Task 001
4. Review agent validates Task 001
5. Testing agent writes tests for Task 001
6. Task 001 marked complete
7. Repeat for Task 002-006
```

**Orchestration:**
```typescript
// Pseudo-code for sequential pattern
const project = await spawnAgent('planning-agent', {
  prompt: 'Analyze and create plan for: Add user authentication',
  description: 'Planning phase'
});

// Wait for planning complete, then start implementation
for (const task of project.tasks) {
  await spawnAgent('implementation-agent', {
    prompt: `Execute ${task.id} from .plans/user-authentication/`,
    description: `Implementing ${task.name}`
  });

  await spawnAgent('review-agent', {
    prompt: `Review ${task.id}`,
    description: `Reviewing ${task.name}`
  });

  await spawnAgent('testing-agent', {
    prompt: `Write tests for ${task.id}`,
    description: `Testing ${task.name}`
  });
}
```

### Pattern 2: Concurrent (Advanced)

**Flow:**
```
Planning → [Implementation 1 || Implementation 2 || Implementation 3] → Review → Complete
```

**When to use:**
- Tasks have no dependencies
- Can modify different files
- Time-sensitive delivery

**Example:**
```markdown
Planning agent creates tasks:
- Task 001: User model (src/models/User.ts)
- Task 002: Auth middleware (src/middleware/auth.ts)
- Task 003: Login route (src/routes/auth.ts)

Task 001 and 002 have no dependencies → run in parallel
Task 003 depends on 001, 002 → wait for completion
```

**Risks:**
- File conflicts if tasks touch same files
- Merge complexity
- Harder to debug

**Mitigation:**
- Planning agent must identify independent tasks
- File-level dependency tracking
- Sequential fallback if conflicts occur

### Pattern 3: Iterative Review (Quality-Focused)

**Flow:**
```
Planning → Implementation → Review → [Feedback → Fix → Review]* → Testing → Complete
```

**When to use:**
- Security-critical features
- High-quality requirements
- Learning/improvement focused

**Example:**
```markdown
1. Implementation agent implements login endpoint
2. Review agent finds security issue (missing rate limiting)
3. Implementation agent adds rate limiting
4. Review agent re-reviews → approves
5. Testing agent writes comprehensive tests
6. Task complete
```

## State Management

### Directory Structure

**Single-Milestone Project:**
```
.plans/<project>/
├── plan.md              # Single source of truth
├── tasks/
│   ├── 001-<task>.md
│   └── 002-<task>.md
└── handoffs.md          # Agent communication log
```

**Multi-Milestone Project:**
```
.plans/<project>/
├── plan.md              # Overview
├── milestones.md        # Milestone breakdown
├── technical-spec.md    # (if needed)
├── architecture.md      # (if needed)
├── milestones/
│   ├── m1-<name>/
│   │   ├── tasks/
│   │   └── status.md
│   └── m2-<name>/
└── handoffs.md
```

### Handoff Protocol

**Markdown-Based Handoffs (Simple):**

```markdown
## 2025-01-16 14:20 - planning-agent → implementation-agent

**Task:** 002-implement-login-endpoint
**Context:** Task created and ready for implementation

**From Planning Agent:**
Login endpoint needs JWT generation and bcrypt password validation.
User model already exists from Task 001.

**To Implementation Agent:**
Please implement per task specification. Pay attention to security.
```

**Key Elements:**
1. Timestamp
2. Source → Target agent
3. Task reference
4. Context summary
5. Specific instructions/concerns

### Task Status Flow

```
pending → in_progress → completed
           ↓
         blocked (if dependencies fail)
```

**Agents update status:**
- Planning agent: Creates tasks as `pending`
- Implementation agent: Updates to `in_progress`, then triggers review
- Review agent: Validates, may require changes
- Testing agent: Adds test validation
- Implementation agent: Marks `completed` when all approvals received

## Orchestration Workflow

### Step 1: Analyze Request

```markdown
User Request: "Add user authentication with JWT"

Analysis:
- Complexity: Moderate (3-4 files, security concern)
- Files: src/models/User.ts, src/controllers/auth.ts, src/middleware/auth.ts, tests/
- Security: HIGH (authentication logic)
- Dependencies: bcrypt, jsonwebtoken

Decision: Multi-agent workflow required
```

### Step 2: Spawn Planning Agent

```typescript
const planResult = await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  description: 'Plan user authentication feature',
  prompt: `
    Analyze and create implementation plan for:
    "Add user authentication with JWT"

    Create structured plan in .plans/user-authentication/:
    - Break down into specific tasks
    - Identify dependencies
    - Define acceptance criteria
    - Determine if single or multi-milestone

    Follow the .plans/ structure from .plans-structure-design.md
  `
});
```

**Planning agent creates:**
- `.plans/user-authentication/plan.md`
- `.plans/user-authentication/tasks/001-006.md`
- `.plans/user-authentication/handoffs.md` (initialized)

### Step 3: Execute Tasks Sequentially

```typescript
// Read plan to get task list
const plan = await Read('.plans/user-authentication/plan.md');
const tasks = extractTasks(plan);  // Parse tasks from plan.md

for (const task of tasks) {
  // Check if dependencies are met
  if (!task.dependencies.every(dep => isCompleted(dep))) {
    continue;  // Skip tasks with unmet dependencies
  }

  // Implementation phase
  await Task({
    subagent_type: 'implementation-agent',
    model: 'haiku',
    description: `Implement ${task.name}`,
    prompt: `
      Execute ${task.id} from .plans/user-authentication/

      1. Read task file: .plans/user-authentication/tasks/${task.id}.md
      2. Update status to "in_progress"
      3. Implement according to acceptance criteria
      4. Write tests
      5. Create handoff to review-agent

      Follow implementation-agent guidelines.
    `
  });

  // Review phase
  await Task({
    subagent_type: 'review-agent',
    model: 'sonnet',
    description: `Review ${task.name}`,
    prompt: `
      Review ${task.id} from .plans/user-authentication/

      1. Read latest handoff from implementation-agent
      2. Review changed files for security, quality, performance
      3. Provide scored feedback
      4. Create handoff with approval/changes required

      Focus on security for authentication code.
    `
  });

  // Check review outcome
  const reviewFeedback = await readLatestHandoff('review-agent');
  if (reviewFeedback.recommendation === 'CHANGES_REQUIRED') {
    // Re-run implementation to address feedback
    await Task({
      subagent_type: 'implementation-agent',
      model: 'haiku',
      description: `Fix issues in ${task.name}`,
      prompt: `
        Address review feedback for ${task.id}

        1. Read review-agent feedback from handoffs.md
        2. Implement requested changes
        3. Re-submit for review
      `
    });

    // Re-review
    await Task({
      subagent_type: 'review-agent',
      model: 'sonnet',
      description: `Re-review ${task.name}`,
      prompt: `Re-review ${task.id} after changes`
    });
  }

  // Testing phase
  await Task({
    subagent_type: 'testing-agent',
    model: 'haiku',
    description: `Test ${task.name}`,
    prompt: `
      Write comprehensive tests for ${task.id}

      1. Design test scenarios (behavior-focused)
      2. Choose appropriate granularity (unit/integration/e2e)
      3. Write tests
      4. Run tests and verify coverage
      5. Document results in task file

      Follow testing-agent guidelines: behavior over logic, right granularity.
    `
  });

  // Mark task complete
  await updateTaskStatus(task.id, 'completed');
}
```

### Step 4: Verify Completion

```markdown
All tasks completed:
- ✅ Task 001: Setup User Model (completed)
- ✅ Task 002: Implement Login Endpoint (completed)
- ✅ Task 003: JWT Validation Middleware (completed)
- ✅ Task 004: Password Reset Flow (completed)
- ✅ Task 005: Integration Tests (completed)
- ✅ Task 006: Documentation (completed)

Review scores:
- Average security score: 95/100
- Average quality score: 92/100
- Test coverage: 94%

Feature complete: User Authentication with JWT ✓
```

## Cost Optimization

### Token Economics

**Research findings:**
- Multi-agent uses **15× more tokens** than single-agent
- Justified for complex, high-value tasks
- Model selection impacts cost 2-3×

### Model Selection Strategy

**Sonnet 4.5** ($3/$15 per million tokens):
- Planning agent (requires reasoning)
- Review agent (requires judgment)
- Orchestrator (coordination logic)

**Haiku 4.5** ($1/$5 per million tokens):
- Implementation agent (worker)
- Testing agent (worker)
- 3× cheaper than Sonnet with 90% performance

### Optimization Techniques

**1. Prompt Caching (75% reduction):**
```typescript
// Place unchanging context at the beginning
const cachedContext = `
  [Project CLAUDE.md]
  [.plans/ structure design]
  [Agent guidelines]
`;

await Task({
  prompt: cachedContext + '\n\n' + taskSpecificPrompt
});
// Subsequent calls reuse cached portion (cheap)
```

**2. Progressive Disclosure:**
- Agents load only relevant task files
- Not the entire plan upfront
- Reduces context per agent invocation

**3. Efficient Handoffs:**
- Markdown (not JSON) - more compact
- Summary context, not full history
- Focus on actionable information

## Common Pitfalls

### 1. Implementation Drift

**Problem:** Orchestrator starts implementing instead of delegating

❌ **Bad:**
```typescript
// Orchestrator writing code
await Edit('src/auth.ts', ...);
```

✅ **Good:**
```typescript
// Orchestrator spawns implementation agent
await Task({ subagent_type: 'implementation-agent', ... });
```

**Prevention:** Orchestrator is read-only except for .plans/ management

### 2. Context Pollution

**Problem:** Agents inheriting inappropriate context

❌ **Bad:** Custom agents inherit project CLAUDE.md with conflicting instructions

✅ **Good:** Agents have focused, role-specific prompts

### 3. Over-Specialization

**Problem:** Too many agents with overlapping responsibilities

❌ **Bad:** validation-agent, sanitization-agent, input-checking-agent (redundant)

✅ **Good:** review-agent handles all quality aspects

**Rule:** Start with 4 agents. Add more only when hitting clear limits.

### 4. File Conflicts

**Problem:** Multiple agents modifying same file simultaneously

**Prevention:**
- Sequential execution by default
- Planning agent identifies file dependencies
- Task isolation (one task = one set of files)

### 5. Missing Handoffs

**Problem:** Agents don't communicate context

❌ **Bad:** Implementation agent completes, no handoff to review

✅ **Good:** Explicit handoff with context about what was implemented

## Success Metrics

**Track per project:**
- Task completion rate (target: >90%)
- Review approval rate (target: 60-80%)
- Rework cycles (target: <2 per task)
- Test coverage (target: >80%)
- Token usage (budget appropriately)

**Quality indicators:**
- Security scores >85
- Quality scores >85
- Tests passing first time >80%
- No critical issues in review

## Quick Reference

### Spawn Agents

```typescript
// Planning
await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  description: 'Plan feature',
  prompt: 'Analyze and create plan for: <requirement>'
});

// Implementation
await Task({
  subagent_type: 'implementation-agent',
  model: 'haiku',
  description: 'Implement task',
  prompt: 'Execute <task-id> from .plans/<project>/'
});

// Review
await Task({
  subagent_type: 'review-agent',
  model: 'sonnet',
  description: 'Review task',
  prompt: 'Review <task-id> for security, quality, performance'
});

// Testing
await Task({
  subagent_type: 'testing-agent',
  model: 'haiku',
  description: 'Test task',
  prompt: 'Write behavior-focused tests for <task-id>'
});
```

### Read State

```typescript
// Current plan
const plan = await Read('.plans/<project>/plan.md');

// Specific task
const task = await Read('.plans/<project>/tasks/001-<task>.md');

// Handoff history
const handoffs = await Read('.plans/<project>/handoffs.md');
```

### Update State

```typescript
// Update task status
await Edit('.plans/<project>/tasks/001-<task>.md',
  'Status: pending',
  'Status: in_progress'
);

// Add handoff
await Edit('.plans/<project>/handoffs.md',
  '# Agent Handoffs',
  '# Agent Handoffs\n\n' + newHandoff
);
```

---

For detailed coordination patterns, handoff protocols, and cost optimization strategies, see reference materials in `skills/orchestration/reference/`.

This skill enables autonomous multi-agent workflows while maintaining quality, cost-efficiency, and forward progress. Use strategically for complex, high-value development tasks.
