# Experimental: Multi-Agent Development Workflows

**Status:** Experimental (v0.2.0)
**Architecture:** Kanban Flow (File Movement = Handoff)

Multi-agent orchestration plugin coordinating specialized agents via physical file movement. Task files move between directories like a Kanban board: `pending/` → `implementation/` → `review/` → `testing/` → `completed/`.

## Quick Start

```bash
# Plan a feature
/plan-feature Add user authentication with JWT

# Execute the plan
/implement-plan user-authentication

# Or do both
/orchestrate Build real-time notifications
```

## Architecture: Kanban Flow

**Core concept:** File location = current owner. No separate status tracking.

```
.plans/user-auth/
├── plan.md
├── pending/              # Tasks waiting
│   └── 002-login.md
├── implementation/       # Being coded
│   └── 003-jwt-middleware.md
├── review/              # Code review
│   └── 004-rate-limit.md
├── testing/             # Test writing
│   └── 005-password-reset.md
└── completed/           # Done
    └── 001-user-model.md
```

**Workflow:**
```
pending → implementation → review → testing → completed
            ↓                ↓
            └────────────────┘ (rejection: move back)
```

**Agents move files as handoffs:**
```bash
# Implementation claims task
mv pending/002-login.md implementation/002-login.md

# Implements, then hands off to review
mv implementation/002-login.md review/002-login.md

# Review approves, hands to testing
mv review/002-login.md testing/002-login.md

# Testing completes
mv testing/002-login.md completed/002-login.md
```

## Four Specialized Agents

### 1. Planning Agent (Sonnet)
- Analyzes requirements
- Creates task breakdown in `pending/`
- Read-only (no code changes)
- **~75 lines** (ultra-lean, activation-focused)

### 2. Implementation Agent (Haiku)
- Globs `pending/` for tasks with met dependencies
- Claims: `mv pending/ → implementation/`
- Writes code, runs tests
- Handoff: `mv implementation/ → review/`
- **~75 lines**

### 3. Review Agent (Sonnet)
- Globs `review/` for tasks
- Checks security (OWASP Top 10), quality, performance
- Approves: `mv review/ → testing/`
- Rejects: `mv review/ → implementation/`
- **~75 lines**

### 4. Testing Agent (Haiku)
- Globs `testing/` for tasks
- Writes behavior-focused tests (not logic-focused)
- Chooses granularity (unit/integration/e2e)
- Completes: `mv testing/ → completed/`
- **~78 lines**

## Task File (Single Source of Truth)

```markdown
# Task 002: Implement Login Endpoint

**Dependencies:** 001
**Files:** src/routes/auth.ts, src/controllers/authController.ts

## Description
POST /api/auth/login accepting email/password, returning JWT.

## Acceptance
- [ ] Validates email format
- [ ] Bcrypt password check
- [ ] Returns JWT token
- [ ] Rate limited (5/min)

## Notes

**planning-agent:** Follow auth patterns in src/middleware/

**implementation-agent:** Used bcrypt + JWT. Added rate limiting.

**review-agent:**
Security: 90/100 | Quality: 95/100
Approved → testing

**testing-agent:**
15 tests, 94% coverage
All passing → completed
```

**No timestamps. No status field. Location = status.**

## Progress Tracking (Derived)

```bash
pending=$(ls .plans/project/pending/*.md 2>/dev/null | wc -l)
implementation=$(ls .plans/project/implementation/*.md 2>/dev/null | wc -l)
review=$(ls .plans/project/review/*.md 2>/dev/null | wc -l)
testing=$(ls .plans/project/testing/*.md 2>/dev/null | wc -l)
completed=$(ls .plans/project/completed/*.md 2>/dev/null | wc -l)
total=$((pending + implementation + review + testing + completed))

echo "Progress: $completed/$total"
```

No manual counters. Glob and count.

## Token Economics

Multi-agent uses **15× more tokens** than single-agent. Optimizations:

**Model Selection** (60% savings):
- Haiku workers: $1/$5 per M tokens
- Sonnet orchestration/review: $3/$15 per M tokens

**Prompt Caching** (75% savings):
```typescript
// Static content first
const prompt = `
${CLAUDE_MD}        // Cached
${AGENT_GUIDELINES} // Cached
---
Task: ${dynamic}    // Not cached (small)
`;
```

**Progressive Disclosure** (90% savings):
- Agent loads only current task file
- Not all 20 tasks

**Typical Costs (Optimized):**
- Simple (6 tasks): $0.45-0.80
- Medium (12 tasks): $0.95-2.00
- Complex (25 tasks): $2.80-4.50

## When to Use

**Complexity Score:**
```
Files to change: _____ × 1
New patterns:    _____ × 3
Security risk:   _____ × 5
Integration:     _____ × 2
```

- **< 10 points:** Single agent (simpler, cheaper)
- **10-20 points:** Multi-agent justified
- **> 20 points:** Multi-agent + architecture planning

**Use when:**
- Complex features (>10 tasks)
- Security-critical (authentication, payments)
- High integration complexity
- Task value justifies 15× cost

**Don't use when:**
- Simple changes (1-2 files)
- Quick fixes
- Documentation updates
- Budget constraints

## Benefits

1. **Visual Kanban:** `ls .plans/project/*/` shows workflow state
2. **O(1) Discovery:** Agents glob only their directory
3. **No Redundancy:** File location = status (single source of truth)
4. **Atomic Handoffs:** `mv` is atomic operation
5. **Git History:** Task journey visible in git log
6. **Natural Rejection:** Moving file back is explicit
7. **Parallelization:** Multiple tasks in same directory can run concurrently

## Example: Simple Auth Feature

```bash
/plan-feature Add user authentication with JWT
```

**Planning agent creates:**
```
.plans/user-auth/
├── plan.md
└── pending/
    ├── 001-user-model.md
    ├── 002-login-endpoint.md
    ├── 003-jwt-middleware.md
    ├── 004-rate-limiting.md
    ├── 005-password-reset.md
    └── 006-tests.md
```

**Execute:**
```bash
/implement-plan user-auth
```

**Flow:**
1. Implementation claims 001 (no dependencies)
2. `mv pending/001-*.md implementation/001-*.md`
3. Creates User model with bcrypt
4. `mv implementation/001-*.md review/001-*.md`
5. Review checks security, approves
6. `mv review/001-*.md testing/001-*.md`
7. Testing writes 12 unit tests, 94% coverage
8. `mv testing/001-*.md completed/001-*.md`
9. Repeat for 002-006

**Result:**
```
.plans/user-auth/
├── plan.md
├── pending/         (empty)
├── implementation/  (empty)
├── review/          (empty)
├── testing/         (empty)
└── completed/
    ├── 001-user-model.md
    ├── 002-login-endpoint.md
    ├── 003-jwt-middleware.md
    ├── 004-rate-limiting.md
    ├── 005-password-reset.md
    └── 006-tests.md
```

**Git log shows full task journey!**

## Rejection Example

```markdown
## Notes

**implementation-agent:** Implemented login endpoint

**review-agent:**
Security: 65/100
REJECTED - Missing rate limiting (OWASP A04)
→ Moving back to implementation

**implementation-agent:** Added express-rate-limit (5 req/min). Resubmitting.

**review-agent:**
Security: 90/100
APPROVED → testing
```

**File moves:**
1. `pending/002-*.md`
2. → `implementation/002-*.md` (claimed)
3. → `review/002-*.md` (submitted)
4. → `implementation/002-*.md` (rejected, moved back!)
5. → `review/002-*.md` (resubmitted)
6. → `testing/002-*.md` (approved)
7. → `completed/002-*.md` (done)

## Limitations

- Sequential execution only (no automatic parallelization)
- Manual conflict detection
- No built-in cost budgeting
- Experimental status (expect rough edges)

## Files

**Agents:** `agents/*.md` (~75 lines each, ultra-lean)
**Commands:** `commands/*.md` (plan-feature, implement-plan, orchestrate)
**Skill:** `skills/orchestration/SKILL.md` (Kanban flow patterns)
**Templates:** `templates/*.md` (plan, task, milestones)
**Reference:** `skills/orchestration/reference/` (detailed patterns, cost optimization)

## References

- `.plans-structure-design.md` - Detailed Kanban structure specification
- `skills/orchestration/reference/coordination-patterns.md` - Agent coordination strategies
- `skills/orchestration/reference/cost-optimization.md` - Token economics (70-85% savings)

---

**Ultra-lean, token-efficient multi-agent workflows via Kanban file movement. Use strategically for complex, high-value tasks.**
