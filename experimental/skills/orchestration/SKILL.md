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
# Uses technical-planning skill for risk-first breakdown
# Creates structure with LLM Prompt blocks
.plans/<project>/
├── plan.md (with risk analysis, deferred items)
├── pending/
│   ├── 001-task.md (Iteration: Foundation, LLM Prompt block)
│   └── 002-task.md (Iteration: Integration, LLM Prompt block)
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

    # Follow LLM Prompt block step-by-step
    # Write code + tests together
    # Mark Status: Stuck if blocked, STOP

    # Append notes
    echo -e "\n**implementation-agent:**" >> "$task"
    echo "- Followed LLM Prompt steps 1-7" >> "$task"
    echo "- Implemented bcrypt + JWT" >> "$task"
    echo "- Added 12 tests: all passing" >> "$task"
    echo "- Full test suite: 94/94 passing (no regressions)" >> "$task"
    echo "- Working Result verified ✓" >> "$task"

    # Handoff to review
    mv ".plans/project/implementation/$(basename $task)" ".plans/project/review/$(basename $task)"
    break
  fi
done
```

### Review Agent (Sonnet)
```bash
# Review tasks in review/ with fresh eyes
for task in .plans/project/review/*.md; do
  # Read task for Working Result and Validation checklist
  files=$(grep "Files:" "$task" | cut -d: -f2-)

  # Review outputs: git diff, tests (not implementation notes)
  # Check security, quality, performance, test coverage
  # Verify Working Result achieved

  # Append scores
  echo -e "\n**review-agent:**" >> "$task"
  echo "Security: 90/100 | Quality: 95/100 | Performance: 95/100 | Tests: 90/100" >> "$task"
  echo "Working Result verified: ✓" >> "$task"
  echo "Validation checklist: 3/3 passing" >> "$task"
  echo "APPROVED → testing" >> "$task"

  # Approve: move to testing
  mv "$task" ".plans/project/testing/$(basename $task)"

  # Or reject: move back to implementation
  # mv "$task" ".plans/project/implementation/$(basename $task)"
done
```

### Testing Agent (Haiku)
```bash
# Validate tests in testing/ (implementation already wrote them)
for task in .plans/project/testing/*.md; do
  # Validate existing tests (behavior-focused? right granularity?)
  # Add missing edge cases only (minimal, no bloat)

  # Run tests + coverage
  npm test
  npm run coverage

  # Append results
  echo -e "\n**testing-agent:**" >> "$task"
  echo "Validated 12 existing tests (all behavior-focused)" >> "$task"
  echo "Added 3 edge case tests" >> "$task"
  echo "Coverage: 94% statements, 88% branches" >> "$task"
  echo "Working Result verified ✓" >> "$task"
  echo "Completed → moving to completed/" >> "$task"

  # Complete
  mv "$task" ".plans/project/completed/$(basename $task)"
done
```

## Task File Structure

```markdown
# Task 002: Implement Login Endpoint

**Iteration:** Foundation
**Status:** Pending | Stuck
**Dependencies:** 001
**Files:** src/routes/auth.ts, tests/auth.test.ts

## Description
POST /api/auth/login accepting email/password, returning JWT.

## Working Result
User can login via POST /api/auth/login with valid credentials and receive JWT token.

## Validation
- [ ] Valid login returns 200 + JWT token
- [ ] Invalid password returns 401
- [ ] Rate limit returns 429 (5 req/min)
- [ ] All tests passing (no regressions)

## LLM Prompt
<prompt>
1. Read **src/middleware/auth.ts** to understand patterns
2. Create **src/routes/auth.ts** with POST /login endpoint
3. Implement email validation
4. Implement bcrypt password verification
5. Generate JWT token (24h expiry, HS256)
6. Add rate limiting (5 req/min per IP)
7. Write tests in **tests/auth.test.ts**:
   - Valid login returns 200 + token
   - Invalid password returns 401
   - Rate limit blocks 6th request
8. Run full test suite: `npm test`
</prompt>

## Notes

**planning-agent:** Follow auth patterns in src/middleware/. Mark Stuck if auth middleware missing.

**implementation-agent:** [Added after implementation]

**review-agent:** [Added after review]

**testing-agent:** [Added after testing]
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
  prompt: `Plan: ${userRequest}`
});

// For each task
const tasks = glob('.plans/project/pending/*.md');

for (const task of tasks) {
  // Implementation: code + tests
  await Task({
    subagent_type: 'implementation-agent',
    model: 'haiku',
    prompt: `Execute task from pending/ with met dependencies.`
  });

  // Review: fresh eyes on diff and tests
  await Task({
    subagent_type: 'review-agent',
    model: 'sonnet',
    prompt: `Review task in review/.`
  });

  // Testing: validate + add missing edge cases
  await Task({
    subagent_type: 'testing-agent',
    model: 'haiku',
    prompt: `Validate tests in testing/.`
  });
}
```

Agents know their responsibilities from agent definitions. Commands just orchestrate.

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

**Stuck Handling:**
```markdown
**Status:** Stuck

## Notes

**implementation-agent:** Cannot complete - missing auth middleware (expected src/middleware/auth.ts). Stopping for human guidance.
```

Agent stops, human reviews, provides guidance or fixes blocker.

**Rejection Flow:**
```markdown
## Notes

**implementation-agent:** Implemented login endpoint

**review-agent:**
Security: 65/100
REJECTED - Missing rate limiting (OWASP A04)
→ Moving back to implementation

**implementation-agent:** Added express-rate-limit. Resubmitting.

**review-agent:**
Security: 90/100
APPROVED → testing
```

File history in git log shows full journey.

## Benefits

1. **Visual Kanban:** `ls .plans/project/*/` shows state
2. **O(1) Discovery:** Agent globs own directory only
3. **No Redundancy:** File location = status
4. **Atomic Handoffs:** `mv` is atomic
5. **Git History:** Task journey visible
6. **Natural Rejection:** Moving back is explicit
7. **Stuck Handling:** Agents stop for human help

## Limitations

- Sequential only (no automatic parallelization yet)
- Manual conflict detection
- No cost budgeting at skill level

See `reference/` for detailed coordination patterns and cost optimization strategies.
