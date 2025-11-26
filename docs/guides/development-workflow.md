# Development Workflow Guide

Complete guide to using the experimental plugin for software development projects.

## Quick Start

```bash
# Plan a feature
/plan-feature Add JWT authentication to login endpoint

# Continue planning (next sprint)
/plan-feature user-auth

# Execute the plan
/implement-plan user-auth

# Or do both
/orchestrate Add JWT authentication to login endpoint
```

## Core Concept: Sprint-Based Planning

**Same rigor every sprint. Context accumulates.**

```
Sprint 1: [] → technical-planning → tasks for Milestone 1
Sprint 2: [Sprint 1 learnings] → technical-planning → tasks for Milestone 2
Sprint 3: [Sprint 1+2 learnings] → technical-planning → tasks for Milestone 3
```

Whether starting fresh or continuing, `/plan-feature` applies the same technical-planning methodology:
- Ask clarifying questions (never assume)
- Risk analysis (Critical+Unknown first)
- Outcome-focused tasks (WHAT and WHY, not HOW)
- Last Responsible Moment (defer decisions until you have enough information)

## Workflow Patterns

### Pattern 1: Standard Development

**Use when:** Requirements are reasonably clear

**Flow:**
```
/plan-feature <description>
    ↓
Technical-planning skill (risk analysis, clarifying questions)
    ↓
.plans/<project>/plan.md + tasks in pending/
    ↓
/implement-plan <project>
    ↓
Kanban flow: pending → implementation → testing → review → completed
```

**Example:**
```bash
# Plan
/plan-feature Add rate limiting to login endpoint using Redis

# What happens:
# 1. Technical-planning asks clarifying questions
# 2. Risk analysis (Critical+Unknown → Foundation iteration)
# 3. Creates outcome-focused tasks in pending/
# 4. Documents deferred items

# Execute
/implement-plan rate-limiting

# What happens:
# 1. Each task: implement → test → review → commit
# 2. Research agents launched if stuck
# 3. Review agents check security/quality/tests
# 4. Commit per task with descriptive message
```

### Pattern 2: Continuing a Project (Next Sprint)

**Use when:** Completed first milestone, ready for next batch of tasks

**Flow:**
```
/plan-feature <project-name>
    ↓
Loads context (completed tasks, learnings, architecture decisions)
    ↓
Technical-planning skill (SAME rigor, with accumulated context)
    ↓
New risks may emerge from learnings
    ↓
Tasks for next 1-2 iterations added to pending/
    ↓
/implement-plan <project>
```

**Example:**
```bash
# After completing Milestone 1
/plan-feature user-auth

# What happens:
# 1. Reads completed tasks, plan.md, architecture decisions
# 2. Technical-planning with full rigor (same as initial)
# 3. May discover NEW Critical+Unknown from implementation learnings
# 4. Generates next batch of tasks
# 5. Updates plan.md with progress

# Continue execution
/implement-plan user-auth
```

### Pattern 3: Ad-hoc Task Addition

**Use when:** Discovered task during implementation, quick tracking needed

```bash
# During implementation, discovered need for monitoring
/add-task rate-limiting Add Prometheus metrics for rate limit hits

# Creates: .plans/rate-limiting/pending/004-add-prometheus-metrics.md
# Will be implemented after current tasks complete
```

### Pattern 4: Stuck Task Research

**Use when:** Task is blocked by unknown

**Flow:**
```
Task Status: STUCK
    ↓
/research <task-file>
    ↓
2-3 research agents investigate in parallel
    ↓
Updates task file with findings
    ↓
Status: Pending (unblocked)
    ↓
/implement-plan <project>
```

**Example:**
```bash
# Task got stuck
/research .plans/user-auth/implementation/003-jwt-middleware.md

# Research agents:
# - research-breadth: Industry patterns
# - research-technical: Official docs
# - research-depth: Specific implementations

# Task updated with findings, status → Pending
# Resume
/implement-plan user-auth
```

## Command Reference

### /plan-feature

Sprint planning - same rigor whether initial or continuing.

```bash
# Initial sprint
/plan-feature Add user authentication with JWT

# Continuing sprint (loads context first)
/plan-feature user-auth
```

**Creates:**
- `.plans/<project>/plan.md` - Overview, risk analysis, milestones, deferrals
- `.plans/<project>/pending/*.md` - Outcome-focused task files

### /add-task

Add single task without full planning workflow:

```bash
/add-task <project> <description>
/add-task auth Add rate limiting to login endpoint
/add-task Add email verification  # Prompts for project
```

**Simpler than /plan-feature:** No risk analysis, just scaffolds task structure.

### /implement-plan

Execute tasks through Kanban flow:

```bash
/implement-plan <project>
/implement-plan <project> --auto  # Auto-commit and continue
```

**Without --auto (default):** Stops after each task, asks for commit confirmation.
**With --auto:** Commits automatically and continues to next task.

### /orchestrate

End-to-end: planning + implementation:

```bash
/orchestrate Add user authentication with JWT
```

Runs `/plan-feature` then `/implement-plan` with confirmation between.

### /research

Research blocker or question:

```bash
# For stuck task
/research <task-file-path>

# For general question
/research "How to implement rate limiting with Redis?"
```

## Understanding the Kanban Flow

### Directory Structure
```
.plans/<project>/
├── plan.md              # Overview, risk analysis, milestones, deferrals
├── pending/             # Tasks waiting to start
├── implementation/      # Being coded
├── testing/             # Test validation
├── review/              # Security/quality review
└── completed/           # Done
```

### File Movement = Handoffs
```bash
mv pending/001-task.md implementation/   # Claim task
mv implementation/001-task.md testing/   # Submit for testing
mv testing/001-task.md review/           # Submit for review
mv review/001-task.md completed/         # Approved
```

### Task File Structure (Outcome-Focused)

```markdown
#### Task 002: Implement Login Endpoint

Status: **Pending**

**Goal**: Enable users to authenticate and receive JWT tokens.

**Working Result**: User can login via POST /api/auth/login with valid credentials.

**Constraints**:
- Must integrate with existing Express middleware pattern
- Response time <100ms
- Rate limit: 5 requests/minute per IP

**Dependencies**: 001 (User model)

<guidance>
**Context**: The application uses session-based patterns in src/middleware/.

**Key Considerations**:
- Session vs token auth trade-offs
- Password hashing library choice (bcrypt vs argon2)
- Token expiry strategy

**Risks**:
- Session fixation vulnerabilities
- Timing attacks on password comparison

**Questions to Resolve**:
- Should "remember me" be included or deferred?

**Existing Patterns**: Review src/middleware/requestLogger.js
</guidance>

**Validation**:
- [ ] Valid login returns 200 + JWT token
- [ ] Invalid password returns 401
- [ ] Rate limit returns 429
- [ ] All tests passing
```

**Key difference from prescriptive tasks:**
- `<guidance>` block provides context and considerations
- Does NOT prescribe step-by-step implementation
- Implementer makes decisions based on what they learn

## Skills Used

### technical-planning (essentials)
- Risk-first development (Critical+Unknown first)
- Asks clarifying questions (never assumes)
- Last Responsible Moment (defer until you have information)
- Four phases: Requirements, Milestone Planning, Implementation Strategy, Execution

### implementing-tasks (experimental)
- Follows task guidance
- Writes code + tests together
- Launches research agents when stuck

### reviewing-code (experimental)
- Launches 3 review agents in parallel:
  - test-coverage-analyzer
  - error-handling-reviewer
  - security-reviewer
- Consolidates findings, APPROVE or REJECT

### testing (experimental)
- Validates tests
- Checks coverage >80% statements, >75% branches

### research-synthesis (essentials)
- Consolidates research agent findings
- Synthesizes into narrative (not bullet lists)

## Tips & Best Practices

### When to Use Multi-Agent Workflow

**Use when:**
- Complex features (>5 tasks)
- Security-critical (authentication, payments)
- Multiple integration points
- High-risk unknowns

**Skip when (use single agent):**
- Simple changes (1-2 files)
- Well-defined scope
- Standard patterns (CRUD)
- Quick bug fixes

### Continuing vs Starting Fresh

**Continue (`/plan-feature <project-name>`):**
- Plan exists, milestone partially complete
- Want next batch of tasks based on learnings
- Architecture evolved, need to adapt

**Start fresh (`/plan-feature <new description>`):**
- New project
- Completely different scope
- Previous plan obsolete

### Handling Stuck Tasks

1. **Read the blocker** - What's the specific issue?
2. **Use /research** - Let research agents investigate
3. **Or fix manually** - Update task, change Status: Pending

### Cost Awareness

Multi-agent uses more tokens:
- Simple (6 tasks): ~$0.50-1.00
- Medium (12 tasks): ~$1.00-2.50
- Complex (25 tasks): ~$3.00-5.00

## Troubleshooting

### "Task marked as Stuck"

1. Read task Notes for blocker details
2. `/research <task-file>` to investigate
3. Or manually provide guidance and set Status: Pending

### "Review keeps rejecting"

Common causes:
- Security score <80 (add validation, rate limiting)
- Tests failing
- Validation checklist incomplete

Fix: Read review notes, address all issues, resubmit

### "Planning takes too long"

- Answer clarifying questions directly
- Provide constraints upfront
- Say "let's defer X" for non-critical items

## Example: Complete Flow

```bash
# Sprint 1: Initial planning
/plan-feature Add user authentication with JWT

# AI asks clarifying questions about scope, constraints
# Creates plan.md + 4 tasks in pending/

# Execute Sprint 1
/implement-plan user-auth

# Each task: implement → test → review → commit
# Completed: 001-user-model, 002-login-endpoint, 003-jwt-middleware, 004-tests

# Sprint 2: Continue (discovered new requirements)
/plan-feature user-auth

# AI loads context from completed tasks
# Applies technical-planning with same rigor
# Adds 3 new tasks: password-reset, email-verification, rate-limiting

# Execute Sprint 2
/implement-plan user-auth

# Done!
```

## Further Reading

- `/breakdown` and `/do` commands (essentials - similar task patterns)
- `technical-planning` skill (essentials - risk-first methodology)
- `experimental/README.md` (detailed Kanban architecture)
