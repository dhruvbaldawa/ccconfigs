---
name: multi-agent-orchestration
description: Coordinate specialized agents via Kanban file flow. Use for complex development tasks (>10 complexity points).
---

# Multi-Agent Orchestration

Coordinate planning, implementation, review, testing agents using physical file movement (Kanban board).

## When to Use

Complexity score:
- Files to change: _____ × 1 point
- New patterns: _____ × 3 points
- Security risk: _____ × 5 points
- Integration: _____ × 2 points

**< 10 points:** Single agent
**10-20 points:** Multi-agent
**> 20 points:** Multi-agent + architecture planning

Multi-agent uses **15× more tokens**. Only for high-value, complex tasks.

## Kanban Flow

```
pending/ → implementation/ → review/ → testing/ → completed/
              ↓                ↓
              └────────────────┘ (rejection: move back)
```

**File location = current owner.** No separate status tracking.

## Agent Coordination

### Planning Agent (Sonnet)
```bash
# Creates structure
.plans/<project>/
├── plan.md
├── pending/
│   ├── 001-task.md
│   └── 002-task.md
├── implementation/
├── review/
├── testing/
└── completed/
```

### Implementation Agent (Haiku)
```bash
# Find task with met dependencies
for task in .plans/project/pending/*.md; do
  deps=$(grep "Dependencies:" "$task" | cut -d: -f2-)
  if [[ "$deps" == *"None"* ]] || dependencies_met "$deps"; then
    # Claim task
    mv "$task" ".plans/project/implementation/$(basename $task)"

    # Implement
    # ... write code ...

    # Append notes
    echo -e "\n**implementation-agent:** Implemented using bcrypt. All criteria met." >> "$task"

    # Handoff to review
    mv ".plans/project/implementation/$(basename $task)" ".plans/project/review/$(basename $task)"
    break
  fi
done
```

### Review Agent (Sonnet)
```bash
# Review tasks in review/
for task in .plans/project/review/*.md; do
  # Read task, check files
  files=$(grep "Files:" "$task" | cut -d: -f2-)

  # Review security, quality, performance
  # ... analyze code ...

  # Append scores
  echo -e "\n**review-agent:**\nSecurity: 90/100 | Quality: 95/100\nApproved → testing" >> "$task"

  # Approve: move to testing
  mv "$task" ".plans/project/testing/$(basename $task)"

  # Or reject: move back to implementation
  # mv "$task" ".plans/project/implementation/$(basename $task)"
done
```

### Testing Agent (Haiku)
```bash
# Test tasks in testing/
for task in .plans/project/testing/*.md; do
  # Write tests
  # ... create test files ...

  # Run tests
  npm test

  # Append results
  echo -e "\n**testing-agent:**\n15 tests, 94% coverage\nAll passing → completed" >> "$task"

  # Complete
  mv "$task" ".plans/project/completed/$(basename $task)"
done
```

## Progress Tracking

Derive from directories:

```bash
pending=$(find .plans/project/pending -name "*.md" 2>/dev/null | wc -l)
implementation=$(find .plans/project/implementation -name "*.md" 2>/dev/null | wc -l)
review=$(find .plans/project/review -name "*.md" 2>/dev/null | wc -l)
testing=$(find .plans/project/testing -name "*.md" 2>/dev/null | wc -l)
completed=$(find .plans/project/completed -name "*.md" 2>/dev/null | wc -l)
total=$((pending + implementation + review + testing + completed))

echo "Progress: $completed/$total completed"
```

No manual counters. File location = truth.

## Workflow

### Sequential (Default)

```typescript
// Planning
await Task({
  subagent_type: 'planning-agent',
  model: 'sonnet',
  prompt: `Create plan for: ${userRequest}

  Create .plans/<project>/ structure with pending/ tasks.`
});

// For each task
const tasks = glob('.plans/project/pending/*.md');

for (const task of tasks) {
  // Implementation
  await Task({
    subagent_type: 'implementation-agent',
    model: 'haiku',
    prompt: `Execute task from pending/ with met dependencies.

    1. mv pending/task.md implementation/task.md
    2. Implement per acceptance criteria
    3. Append notes
    4. mv implementation/task.md review/task.md`
  });

  // Review
  await Task({
    subagent_type: 'review-agent',
    model: 'sonnet',
    prompt: `Review task in review/.

    1. Check security/quality/performance
    2. Append scores
    3. If approved: mv review/task.md testing/task.md
    4. If rejected: mv review/task.md implementation/task.md`
  });

  // Testing
  await Task({
    subagent_type: 'testing-agent',
    model: 'haiku',
    prompt: `Test task in testing/.

    1. Design test scenarios (behavior-focused)
    2. Choose granularity (unit/integration/e2e)
    3. Write tests, run, check coverage
    4. Append results
    5. mv testing/task.md completed/task.md`
  });
}
```

### Concurrent (Advanced)

```typescript
// Find independent tasks (no dependencies)
const independent = tasks.filter(t =>
  !hasDependencies(t) && !hasFileConflicts(t, inProgress)
);

// Run in parallel
await Promise.all(
  independent.map(task => implementationAgent.execute(task))
);
```

## Cost Optimization

**Model Selection:**
- Orchestrator: Sonnet ($3/$15 per M tokens)
- Planning: Sonnet (requires reasoning)
- Implementation: Haiku ($1/$5 per M tokens)
- Review: Sonnet (requires judgment)
- Testing: Haiku (worker)

**Prompt Caching:**
Place static content first:
```typescript
const prompt = `
${CLAUDE_MD}           // Cached
${PLANS_STRUCTURE}     // Cached
---
Task: ${dynamicTask}   // Not cached (small)
`;
```

75% reduction on subsequent calls.

**Progressive Disclosure:**
Agent loads only current task file, not all 20 tasks.

## Common Patterns

**Dependency Check:**
```bash
dep="001"
if ls .plans/project/completed/$dep-*.md 2>/dev/null; then
  echo "Dependency met"
fi
```

**Rejection Flow:**
```markdown
## Notes

**implementation-agent:** Implemented login endpoint

**review-agent:**
Security: 65/100
REJECTED - Missing rate limiting
→ Moving back to implementation

**implementation-agent:** Added rate limiting. Resubmitting.

**review-agent:**
Security: 90/100
APPROVED → testing
```

File history in git log shows full journey.

**Blocked Tasks:**
```bash
# Move to pending/ with prefix
mv implementation/003-api.md pending/BLOCKED-003-api.md
```

Or create `blocked/` directory.

## Benefits

1. **Visual Kanban:** `ls .plans/project/*/` shows state
2. **O(1) Discovery:** Agent globs own directory only
3. **No Redundancy:** File location = status
4. **Atomic Handoffs:** `mv` is atomic
5. **Git History:** Task journey visible
6. **Natural Rejection:** Moving back is explicit

## Limitations

- Sequential only (no automatic parallelization yet)
- Manual conflict detection
- No cost budgeting at skill level

See `reference/` for detailed coordination patterns and cost optimization strategies.
