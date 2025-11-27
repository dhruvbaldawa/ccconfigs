---
argument-hint: [REQUEST or PROJECT]
description: Sprint planning - create or continue .plans/ with risk-prioritized tasks
---

# Plan Feature

Sprint planning for `.plans/<project>/` - same rigor whether starting fresh or continuing.

**Request:** $ARGS

## Detect Mode

Check if `.plans/<project>/plan.md` exists:
- **No** → Initial sprint
- **Yes** → Continuing sprint

## Process

### 1. Load Context

**Initial:** Start fresh with the request.

**Continuing:** Read existing state and summarize:
- `plan.md` - architecture decisions, completed milestones, deferrals
- `completed/*.md` - learnings from finished tasks
- What was accomplished, learned, and what's still deferred

### 2. Invoke Technical-Planning Skill

Apply **technical-planning skill** with full rigor (same process for initial or continuing):
- Phase 1: Requirements & Risk Analysis (ask clarifying questions, classify risks)
- Phase 2: Milestone Planning (sequence by risk, document deferrals)
- Phase 3: Implementation Strategy (prototype-first, core before polish)

For continuing sprints: Re-evaluate risks based on learnings, update deferrals.

### 3. Create/Update Structure

**Initial:** Create directories and `plan.md`:
```bash
mkdir -p .plans/<project>/{pending,implementation,review,testing,completed}
```

**Continuing:** Update `plan.md` with progress, new decisions, updated deferrals.

### 4. Generate Tasks

Create tasks for **next 1-2 iterations only** in `pending/`.

Use outcome-focused format from `/breakdown`:
- Goal, Working Result, Constraints, Dependencies
- `<guidance>` block with context and considerations (not step-by-step)
- Validation checklist

## Report

```
Sprint planning complete for .plans/<project-name>/.

[Initial: "Created" | Continuing: "Progress: Milestone N at X%"]
Tasks: X in pending/
Key risks: [Critical+Unknown items]
Deferred: [Items with rationale]

Next: /implement-plan <project-name>
```

## Key Principles

- **Same rigor every sprint** - technical-planning skill applies whether initial or continuing
- **Context accumulates** - each sprint builds on learnings from previous work
- **Outcome-focused tasks** - define WHAT and WHY, not HOW
- **Move fast** - only plan 1-2 iterations ahead, learn and adapt
