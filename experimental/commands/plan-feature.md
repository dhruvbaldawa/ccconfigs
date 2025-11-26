---
argument-hint: [REQUEST or PROJECT]
description: Sprint planning - create or continue .plans/ with risk-prioritized tasks
---

# Plan Feature

Sprint planning for `.plans/<project>/` - same rigor whether starting fresh or continuing.

**Request:** $ARGS

## Detect Mode

Check if `.plans/<project>/plan.md` exists:
- **No** → Initial sprint (Step 1)
- **Yes** → Continuing sprint (Step 2)

## Step 1: Initial Sprint Planning

### 1.1 Load Context

No prior context. Start fresh with the request.

### 1.2 Invoke Technical-Planning Skill

Apply **technical-planning skill** with full rigor:

**Phase 1 - Requirements & Risk Analysis:**
- Ask clarifying questions (never assume)
- Identify user problems being solved
- Define success criteria
- Classify risks: Critical+Unknown, Critical+Known, Non-Critical

**Phase 2 - Milestone Planning:**
- Structure milestones (4-8 week cycles)
- Sequence by risk (Critical+Unknown first)
- Define success criteria per milestone
- Document deferrals with rationale

**Phase 3 - Implementation Strategy:**
- Prototype-first for risky assumptions
- Core before polish
- Integration early

### 1.3 Create Structure

```bash
mkdir -p .plans/<project>/{pending,implementation,review,testing,completed}
```

Create `plan.md` with:
- **Overview**: Project description
- **Success Criteria**: Project-level outcomes (checkboxes)
- **Milestones**: Outcomes with status (✅/🔄/📋)
- **Risk Analysis**: Prioritized risks from Phase 1
- **Architecture**: Key decisions (evolves during implementation)
- **Task History**: Completed and in-flight tracking
- **Deferred Items**: What's deferred and why

### 1.4 Generate Tasks

Create tasks for **first 1-2 iterations only** (Foundation + early Integration).

Use task format from `/breakdown` - outcome-focused, not prescriptive:

```markdown
#### Task NNN: <Name>

Status: **Pending**

**Goal**: What needs to be achieved (1-2 sentences)

**Working Result**: Concrete deliverable when complete

**Constraints**: Technical limitations, patterns to follow, performance needs

**Dependencies**: What this assumes exists

<guidance>
**Context**: Problem domain background
**Key Considerations**: Trade-offs, options to evaluate
**Risks**: What could go wrong
**Questions to Resolve**: Decisions to make during implementation
**Existing Patterns**: Reference similar code in codebase
</guidance>

**Validation**:
- [ ] Specific, testable check
- [ ] All tests passing
```

Save to `.plans/<project>/pending/NNN-task-name.md`

---

## Step 2: Continuing Sprint Planning

### 2.1 Load Context

Read existing state:
- `plan.md` - architecture decisions, completed milestones, deferrals
- `completed/*.md` - learnings from finished tasks
- `pending/*.md` - remaining work

Summarize:
- What was accomplished
- What was learned (architectural insights, new constraints)
- What risks materialized or were resolved
- What's still deferred

### 2.2 Invoke Technical-Planning Skill

Apply **technical-planning skill** with full rigor, informed by context:

**Phase 1 - Requirements & Risk Analysis:**
- Ask clarifying questions about next milestone
- Re-evaluate risks based on learnings (new Critical+Unknown may have emerged)
- Update success criteria if scope changed
- Review deferred items - still relevant? Ready to address?

**Phase 2 - Milestone Planning:**
- Plan next milestone with updated understanding
- Adjust risk prioritization based on what was learned
- Update deferrals - some may be ready, others eliminated

**Phase 3 - Implementation Strategy:**
- Apply learnings from completed work
- Adjust approach based on discovered constraints

### 2.3 Update Plan

Update `plan.md`:
- Check off completed deliverables
- Update milestone progress percentages
- Document new architectural decisions
- Move completed tasks to Task History
- Update deferrals

### 2.4 Generate Tasks

Create tasks for **next 1-2 iterations** based on updated understanding.

Same task format - outcome-focused, incorporating learnings:

```markdown
<guidance>
**Context**: [Include relevant learnings from completed tasks]
**Key Considerations**: [Updated based on what we discovered]
**Existing Patterns**: [Reference patterns established in earlier tasks]
</guidance>
```

---

## Report Completion

**Initial Sprint:**
```
Sprint planning complete. Created .plans/<project-name>/.

Milestone 1: <name>
Tasks: X in pending/ (Foundation: Y, Integration: Z)
Key risks: [Critical+Unknown items]
Deferred: [Items with rationale]

Next: /implement-plan <project-name>
```

**Continuing Sprint:**
```
Sprint planning complete for .plans/<project-name>/.

Progress: Milestone N at X% complete
Learnings applied: [Key insights from completed work]
New tasks: Y added to pending/
Risk updates: [Any new Critical+Unknown or resolved risks]

Next: /implement-plan <project-name>
```

---

## Key Principles

- **Same rigor every sprint** - technical-planning skill applies whether initial or continuing
- **Context accumulates** - each sprint builds on learnings from previous work
- **Risk-first** - Critical+Unknown always addressed first
- **Outcome-focused tasks** - define WHAT and WHY, not HOW
- **Last Responsible Moment** - defer decisions until you have enough information
- **Move fast** - only plan 1-2 iterations ahead, learn and adapt
