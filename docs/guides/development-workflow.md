# Development Workflow Guide

Complete guide to using Claude Code for software development projects.

## Quick Start

### Clear Requirements
```bash
/orchestrate Add JWT authentication to login endpoint
```

### Vague Ideas (Discovery Mode)
```bash
/orchestrate --discover "Something with real-time notifications?"
```

## Workflow Patterns

### Pattern 1: Standard Development (Clear Requirements)

**Use when:** Requirements are clear, scope is defined

**Flow:**
```
Requirements
    ↓
/orchestrate <clear request>
    ↓
Planning (technical-planning skill)
    ↓
.plans/<project>/plan.md + tasks in pending/
    ↓
Implementation Loop (Kanban flow)
    ↓
pending → implementation → review → testing → completed
```

**Example:**
```bash
# Start
/orchestrate Add rate limiting to login endpoint using Redis

# What happens:
# 1. Complexity check (is multi-agent justified?)
# 2. Planning agent creates risk-prioritized plan
# 3. Implementation loop executes tasks through Kanban
# 4. Each task: code + tests → review → test validation
# 5. Output: working feature with tests

# Result:
# .plans/rate-limiting/
# ├── plan.md
# ├── completed/
# │   ├── 001-redis-client.md
# │   ├── 002-rate-limit-middleware.md
# │   └── 003-integration-tests.md
```

### Pattern 2: Discovery + Development (Vague Ideas)

**Use when:** Idea is vague, constraints unclear, multiple approaches possible

**Flow:**
```
Vague Idea
    ↓
/orchestrate --discover <vague idea>
    ↓
Discovery Agent (brainstorming + research)
    ↓
Interactive conversation (questions, research, clarification)
    ↓
.plans/<project>/discovery.md
    ↓
[User confirms ready]
    ↓
Planning Agent (reads discovery.md)
    ↓
Standard workflow continues
```

**Example:**
```bash
# Start with vague idea
/orchestrate --discover "notifications system for our app"

# Discovery conversation:
AI: Let's explore this. What triggered the need for notifications?
    - Push notifications, email, or in-app?
    - Real-time or batch delivery?
    - Expected scale?

You: Real-time in-app notifications. Users need to see updates immediately.
     Maybe 10k concurrent users.

AI: [researches using Perplexity]
    Found 3 common approaches:
    1. WebSocket with Redis pub/sub
    2. Server-Sent Events (SSE)
    3. Long polling

    For 10k concurrent users, WebSocket + Redis recommended.

    [creates discovery.md with findings]

    Ready to create implementation plan?

You: Yes

# Then standard workflow continues with planning
```

### Pattern 3: Stuck Task Research

**Use when:** Agent marks task as Stuck (blocked by unknown)

**Flow:**
```
Task Status: Stuck
    ↓
/research <task-file>
    ↓
Discovery Agent investigates
    ↓
Uses MCP tools (Perplexity, Firecrawl, Context7)
    ↓
Updates task file with findings
    ↓
Status: Pending (unblocked)
    ↓
/implement-plan <project> --resume
```

**Example:**
```bash
# Task gets stuck
# In 003-jwt-middleware.md:
Status: Stuck
Notes:
**implementation-agent:** Cannot complete - unclear how to integrate
with existing auth middleware.

# Research the blocker
/research experimental/.plans/user-auth/implementation/003-jwt-middleware.md

# Discovery agent:
# 1. Reads task for context
# 2. Researches JWT + Express patterns (Perplexity)
# 3. Looks up library docs (Context7)
# 4. Updates task with findings:

Status: Pending
Notes:
**discovery-agent:** Researched JWT integration patterns.

Findings:
- Use express-jwt middleware with custom getToken function
- Integrate with existing auth via req.user population
- Pattern: verify JWT → populate req.user → call next()

Updated LLM Prompt with implementation steps.

# Resume implementation
/implement-plan user-auth
```

## Command Reference

### /orchestrate

**Standard Mode:**
```bash
/orchestrate <clear requirement>
```

**Discovery Mode:**
```bash
/orchestrate --discover "<vague idea>"
```

**Complexity Check:**
Multi-agent justified when score ≥ 10:
- Files to change: N × 1
- New patterns: N × 3
- Security risk: N × 5
- Integration: N × 2

### /plan-feature

Just planning, no implementation:
```bash
/plan-feature <requirement>
```

Creates `.plans/<project>/` with plan and tasks.

### /implement-plan

Execute existing plan:
```bash
/implement-plan <project-name>
```

Runs tasks through Kanban flow: pending → implementation → review → testing → completed

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
├── plan.md              # Overview, risk analysis, iterations
├── discovery.md         # (if using --discover) Research findings
├── pending/             # Tasks waiting to start
├── implementation/      # Being coded
├── review/             # Security/quality review
├── testing/            # Test validation
└── completed/          # Done
```

### File Movement = Handoffs
```
mv pending/001-task.md implementation/001-task.md   # Claim
mv implementation/001-task.md review/001-task.md    # Submit for review
mv review/001-task.md testing/001-task.md           # Approved
mv testing/001-task.md completed/001-task.md        # Complete
```

### Task File Structure
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
**planning-agent:** Follow auth patterns in src/middleware/
**implementation-agent:** [added after implementation]
**review-agent:** [added after review]
**testing-agent:** [added after testing]
```

## Agent Roles

### Planning Agent (Sonnet)
- Uses technical-planning skill (risk-first)
- Creates plan.md with risk analysis
- Generates tasks with LLM Prompt blocks
- Organizes by iteration (Foundation → Integration → Polish)
- Documents deferred items

### Implementation Agent (Haiku)
- Follows LLM Prompt block step-by-step
- Writes code + tests together
- Runs full test suite (prevent regressions)
- Marks Status: Stuck if blocked, STOPS
- Appends notes with results

### Review Agent (Sonnet)
- Fresh-eyes review (sees outputs only)
- Reviews git diff, tests
- Verifies Working Result achieved
- Checks security/quality/performance/tests
- Approves to testing/ or rejects to implementation/

### Testing Agent (Haiku)
- Validates existing tests (implementation wrote them)
- Adds missing edge cases only
- Checks coverage >80%
- Completes to completed/

### Discovery Agent (Sonnet)
- Brainstorms through questions (doesn't inject ideas)
- Researches using MCP tools
- Creates discovery.md with findings
- Transitions when ready

## Skills Used

### technical-planning (essentials)
- Risk-first development
- Asks clarifying questions (never assumes)
- Critical+Unknown → Iteration 1
- Managed deferral with rationale

### brainstorming (essentials)
- Collaborative ideation
- Draws out user's ideas through questions
- Explores tensions and assumptions
- Finds concrete angle from abstract

### research-synthesis (essentials)
- Perplexity: broad research, best practices
- Firecrawl: specific URLs, implementations
- Context7: library docs, API reference
- Synthesizes into narrative (not lists)

## Tips & Best Practices

### When to Use Discovery Mode

**Use --discover when:**
- Idea is vague ("something with notifications")
- Multiple approaches possible
- Constraints unclear (scale, security, integrations)
- You need to research patterns first

**Skip discovery when:**
- Requirements are clear
- Standard pattern (add CRUD endpoint)
- Time-sensitive (quick fix)

### Handling Stuck Tasks

**Agent marks Stuck when:**
- Missing dependencies or files
- Unclear requirements
- Technical blockers
- Cannot meet Validation checklist

**Your options:**
1. `/research <task-file>` - Let discovery-agent investigate
2. Manual fix - Update task yourself, change Status: Pending
3. Human guidance - Provide context, unblock manually

### Cost Optimization

Multi-agent uses **15× more tokens**:
- Simple (6 tasks): $0.45-0.80
- Medium (12 tasks): $0.95-2.00
- Complex (25 tasks): $2.80-4.50

**When to use single-agent instead:**
- Complexity score < 10
- Simple CRUD operations
- Quick bug fixes
- Well-defined, small scope

### Progressive Refinement

You can iterate:
```bash
# Start with discovery
/orchestrate --discover "notifications"

# [after discovery conversation]
# Decide to start small

/plan-feature In-app notifications only (defer push notifications)

# Execute
/implement-plan in-app-notifications

# Later, add more
/plan-feature Push notifications (reads existing in-app code)
```

## Troubleshooting

### "Agent marked task as Stuck"

**Check:**
1. Read task Notes - what's the blocker?
2. Is it research-able? Use `/research <task-file>`
3. Is it a constraint issue? Update discovery.md or plan.md
4. Is it a dependency? Check if dependency task completed

### "Review agent keeps rejecting"

**Common causes:**
- Security score < 80 (add rate limiting, validation, etc.)
- Tests failing
- Validation checklist incomplete
- Critical vulnerability (SQL injection, auth bypass)

**Fix:** Read review-agent notes, fix issues, resubmit

### "Too many tasks created"

**Cause:** Planning agent broke down too granularly

**Fix:**
- Use `/optimize-doc .plans/<project>/plan.md` to consolidate
- Or manually merge tasks (edit plan.md, combine task files)

### "Discovery taking too long"

**Tips:**
- Answer questions directly (don't explore every angle)
- Say "let's go with X" when ready
- Provide constraints upfront (scale, tech stack, timeline)

## Examples

### Example 1: E-commerce Cart

```bash
# Vague starting point
/orchestrate --discover "shopping cart for e-commerce site"

# Discovery conversation explores:
# - Persistent vs session-based?
# - Payment integration needed?
# - Inventory management?
# - Expected scale?

# Result: discovery.md with Redis-based cart, Stripe integration plan

# Then planning creates 8 tasks across 3 iterations:
# Foundation: Cart data model, Redis client
# Integration: Add to cart API, Stripe checkout
# Polish: Cart abandonment tracking, promo codes
```

### Example 2: Simple Bug Fix

```bash
# Don't use multi-agent for simple fixes
# Complexity: 1 file × 1 = 1 point (< 10)

# Just fix directly or use single command:
/do fix-login-bug.md
```

### Example 3: Microservice Migration

```bash
# Large, complex project
/orchestrate --discover "migrate monolith auth to microservice"

# Discovery explores:
# - Which endpoints to migrate?
# - Database strategy (shared vs separate)?
# - Service communication (REST vs gRPC)?
# - Backward compatibility?

# Creates discovery.md with phased migration plan

# Planning creates multi-milestone plan:
# M1: Extract auth service (keep shared DB)
# M2: Separate database, data migration
# M3: Remove auth from monolith
```

## Further Reading

- `/breakdown` and `/do` commands (similar task-based patterns)
- Technical-planning skill (risk-first methodology)
- Experimental plugin README (detailed Kanban architecture)
