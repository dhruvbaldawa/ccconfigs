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

**Continuing a project:**
```
/plan-feature user-auth   # Detects existing plan, generates next batch of tasks
```

## Your Task

Plan the feature request: "$ARGS"

### Step 1: Detect Mode

Check if `.plans/<project>/plan.md` exists:
- **Exists**: This is **continuing planning** - skip to Step 4
- **Does not exist**: This is **initial planning** - continue to Step 2

### Step 2: Initial Planning - Requirements Analysis

Invoke the **technical-planning skill** to:
- Ask clarifying questions about requirements
- Identify high-risk unknowns (Critical+Unknown → Foundation iteration)
- Understand scope and constraints
- Document what to defer vs decide now (Last Responsible Moment)

### Step 3: Initial Planning - Create Structure

Create directory and plan file:

```bash
mkdir -p .plans/<project>/{pending,implementation,review,testing,completed}
```

Create `plan.md` with sections:
- **Overview**: 1-2 sentence project description
- **Success Criteria**: Project-level outcomes (checkboxes)
- **Milestones**: Major outcomes with status (✅/🔄/📋)
- **Risk Analysis**: Critical+Unknown (Foundation), Critical+Known (Integration), Non-Critical (Polish)
- **Architecture**: Key decisions (updated during implementation)
- **Task History**: Completed and in-flight tracking
- **Deferred Items**: What's deferred and why

Create initial task files in `pending/` for first 1-2 iterations only (Foundation + early Integration).

Use task template from `experimental/templates/task.md`.

### Step 4: Continuing Planning

If plan.md already exists, this is a **lightweight continuation** (no full re-planning):

1. **Read existing plan** - review context, architecture decisions, completed milestones, learnings
2. **Update milestone progress** - check off deliverables, update percentages
3. **Generate next batch of tasks** - create 1-2 iterations of tasks in `pending/` based on:
   - What was learned from completed tasks
   - Architectural decisions made during implementation
   - Any new risks or constraints discovered
4. **Update plan.md** - move completed to history, update deferrals, document new decisions

### Step 5: Report Completion

**Initial Planning:**
```
Planning complete. Created .plans/<project-name>/.

Tasks: X total (Foundation: Y, Integration: Z)
Key risks: [List]
Deferred: [Items with rationale]

Next: /implement-plan <project-name>
```

**Continuing Planning:**
```
Planning continued for .plans/<project-name>/.

Milestone progress: [Current milestone] at X%
New tasks: Y added to pending/

Next: /implement-plan <project-name>
```
