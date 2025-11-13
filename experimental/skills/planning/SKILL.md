---
name: planning
description: Invoked by /plan-feature and /orchestrate. Creates .plans/ with risk-prioritized tasks. Skip for simple 1-2 file changes.
---

# Planning

## Process

1. Invoke technical-planning skill
2. Create `.plans/<project>/`:
   - `plan.md` - risk analysis, deferrals
   - `pending/*.md` - task files by iteration
   - `milestones.md` (if >10 tasks)
3. Report completion

## Execution Protocol

Follow this EXACT order when planning:

**Step 1: Create directory structure**

```bash
mkdir -p .plans/<project>/{pending,implementation,review,testing,completed}
```

**Step 2: Create plan.md FIRST**

This file MUST exist before creating any task files.

Use template: `experimental/templates/plan-single-milestone.md` or `plan-multi-milestone.md`

Required sections:
- **Overview**: 1-2 sentence project description
- **Requirements**: Core requirements list
- **Risk Analysis**: Critical+Unknown (Foundation), Critical+Known (Integration), Non-Critical (Polish)
- **Architecture**: Key architectural decisions
- **Tasks by Iteration**: List of task files with one-line descriptions and dependencies
- **Deferred Items**: What's being deferred and when/why

**Step 3: Create initial task files ONLY**

Following Last Responsible Moment principle:
- Generate tasks for **first 1-2 iterations only** (Foundation + early Integration)
- Do NOT plan entire project upfront - architecture will evolve as you learn
- Save to `.plans/<project>/pending/NNN-task-name.md`
- Use template: `experimental/templates/task.md`
- Each task file includes: Status, Dependencies, Description, Working Result, Validation, LLM Prompt

**Step 4: Document status tracking**

Add to plan.md:
```markdown
Status tracked via file location: pending/ → implementation/ → review/ → testing/ → completed/
```

Task files also have **Status:** field updated by implementation/review/testing skills.

**Step 5: Report completion**

Summary format:
```
Planning complete. Created .plans/<project-name>/.
Tasks: X total (Foundation: Y, Integration: Z)
Key risks: [List]
Next: /implement-plan <project-name>
```

## Iterative Planning Loop

After completing initial tasks, update plan based on learnings:

1. **Complete tasks** → learn about system architecture and constraints
2. **Update plan.md** with design changes, new risks discovered, architectural decisions
3. **Generate next batch of tasks** in `pending/` based on updated understanding
4. **Update deferrals** as decisions get made or context changes
5. **Repeat** until project complete

Plan.md is a **living document** that tracks architectural evolution, not a static waterfall plan.

**VERIFICATION**: Before marking planning complete, confirm:
- [ ] plan.md exists with all required sections
- [ ] Initial task files (1-2 iterations) created in pending/
- [ ] Task files reference architecture decisions from plan.md
- [ ] Status tracking mechanism documented in plan.md

## Task File Template

```markdown
# Task 001: Feature Name

**Iteration:** Foundation | Integration | Polish
**Status:** Pending
**Dependencies:** None (or 001, 002)
**Files:** src/file1.ts, tests/file1.test.ts

## Description
What needs to be built (2-3 sentences).

## Working Result
Concrete deliverable when complete.

## Validation
- [ ] Specific, testable check 1
- [ ] Specific, testable check 2
- [ ] All tests passing (no regressions)

## LLM Prompt
<prompt>
1. Read **src/existing-pattern.ts** for patterns
2. Create **src/routes/auth.ts** with POST /login
3. Implement bcrypt password verification
4. Generate JWT token (24h expiry)
5. Add rate limiting (5 req/min per IP)
6. Write tests: valid login, invalid password, rate limit
7. Run: `npm test`
</prompt>

## Notes

**planning:** [Context, patterns to follow, potential blockers]
```

## Output

Report: `Planning complete. Created .plans/<project-name>/. Tasks: X total (Foundation: Y, Integration: Z, Polish: W)`
