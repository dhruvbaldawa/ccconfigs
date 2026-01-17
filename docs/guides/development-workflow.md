# Development Workflow Guide

Guide to using the experimental plugin for software development projects.

## Quick Start

```bash
/plan-feature Add JWT authentication       # Plan
/implement-plan user-auth                  # Execute
/orchestrate Add JWT authentication        # Both
```

## Core Concept

**Same rigor every sprint. Context accumulates.**

```
Sprint 1: [] → technical-planning → tasks
Sprint 2: [Sprint 1 learnings] → technical-planning → tasks
Sprint 3: [Sprint 1+2 learnings] → technical-planning → tasks
```

## Workflow Patterns

### Pattern 1: Standard Development

```
/plan-feature <description>  →  .plans/<project>/  →  /implement-plan <project>
```

Technical-planning asks clarifying questions, creates risk-prioritized tasks, then Kanban flow executes them.

### Pattern 2: Continuing (Next Sprint)

```bash
/plan-feature user-auth  # Loads context, same rigor, generates next batch
```

### Pattern 3: Ad-hoc Task

```bash
/add-task rate-limiting Add Prometheus metrics
```

### Pattern 4: Stuck Task

```bash
/research .plans/user-auth/implementation/003-jwt-middleware.md
/implement-plan user-auth  # Resume
```

### Pattern 5: Enrich Plan Before Implementation

```bash
/plan-feature user-auth           # Create plan
/deepen-plan user-auth            # Add research insights
/implement-plan user-auth         # Execute enriched plan
```

### Pattern 6: Convert Review Findings to Tasks

```bash
/triage user-auth --from-task 003  # Process findings from task review
/triage user-auth --from-review    # Process from review-findings.md
```

## Command Reference

| Command | Purpose |
|---------|---------|
| `/plan-feature <request>` | Sprint planning (initial or continuing) |
| `/plan-feature <project>` | Continue existing project |
| `/add-task <project> <desc>` | Add single task without planning |
| `/deepen-plan <project>` | Enrich plan with research + learnings |
| `/implement-plan <project>` | Execute tasks through Kanban |
| `/implement-plan <project> --auto` | Auto-commit per task |
| `/implement-plan <project> --express "task"` | Quick change without kanban |
| `/triage <project> --from-task NNN` | Convert findings to todos |
| `/orchestrate <request>` | Plan + implement end-to-end |
| `/research <task-file>` | Research stuck task |

## Kanban Flow

```
.plans/<project>/
├── plan.md         # Overview, risks, milestones
├── pending/        # Tasks waiting
├── implementation/ # Being coded
├── testing/        # Test validation
├── review/         # Security/quality review
└── completed/      # Done
```

**Movement:** `pending → implementation → testing → review → completed`

## Task Format

Outcome-focused (WHAT/WHY, not HOW):

```markdown
**Goal**: Enable users to authenticate
**Working Result**: User can login via POST /api/auth/login
**Constraints**: Integrate with existing middleware, <100ms response

<guidance>
**Context**: Session-based patterns in src/middleware/
**Key Considerations**: Session vs token trade-offs
**Risks**: Session fixation, timing attacks
</guidance>

**Validation**:
- [ ] Valid login returns 200 + JWT
- [ ] All tests passing
```

## When to Use

**Multi-agent workflow:** Complex features, security-critical, >5 tasks

**Single agent:** Simple changes, 1-2 files, standard CRUD

## Knowledge Compounding

The workflow captures and reuses learnings automatically.

**Automatic capture triggers:**
- STUCK → resolved (blocker unblocked)
- REJECTED → approved (review issues fixed)
- Phrases: "that worked", "it's fixed", "figured it out"

**Learnings stored in:** `.plans/<project>/learnings/`

**Critical patterns:** High-confidence learnings promoted to `critical-patterns.md` are enforced during implementation and review.

## Two-Tier Review

Reviews are routed based on complexity and severity:

| Tier | When | What |
|------|------|------|
| LIGHTWEIGHT | Simple changes, no security/complexity indicators | Quick scan, no agents |
| FULL | Auth, crypto, payments, external APIs, was STUCK | 3 parallel review agents |

## Tips

- **Stuck?** Use `/research <task-file>`
- **Too many tasks?** Consolidate in plan.md
- **Slow planning?** Answer questions directly, defer non-critical items
- **Before complex features?** Run `/deepen-plan` to add research insights
- **After review with findings?** Run `/triage` to create actionable todos

## Example Flow

```bash
# Sprint 1
/plan-feature Add user authentication with JWT
/implement-plan user-auth

# Sprint 2 (continue)
/plan-feature user-auth
/implement-plan user-auth
```

## Further Reading

- `/breakdown` and `/do` (essentials)
- `technical-planning` skill (essentials)
- `experimental/README.md`
