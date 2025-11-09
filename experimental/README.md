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
- Uses **technical-planning skill** (risk-first development)
- Asks clarifying questions (never assumes)
- Creates risk-prioritized iterations (Foundation → Integration → Polish)
- Generates tasks with LLM Prompt blocks (step-by-step instructions)
- Documents deferred items with rationale
- Read-only (no code changes)
- **~100 lines**

### 2. Implementation Agent (Haiku)
- Globs `pending/` for tasks with met dependencies
- Claims: `mv pending/ → implementation/`
- **Follows LLM Prompt block step-by-step**
- Writes code + tests together (prevent regressions)
- Marks **Status: Stuck** if blocked, STOPS for human help
- Handoff: `mv implementation/ → review/`
- **~93 lines**

### 3. Review Agent (Sonnet)
- Globs `review/` for tasks
- **Fresh eyes** - reviews outputs (diff, tests) not implementation notes
- Checks security (OWASP Top 10), quality, performance, test coverage
- Verifies **Working Result** achieved and **Validation** checklist complete
- Approves: `mv review/ → testing/`
- Rejects: `mv review/ → implementation/`
- **~102 lines**

### 4. Testing Agent (Haiku)
- Globs `testing/` for tasks
- Validates existing tests (implementation already wrote them)
- Adds missing edge cases only (minimal, no test bloat)
- Verifies behavior-focused (not implementation details)
- Checks coverage >80% statements, >75% branches
- Completes: `mv testing/ → completed/`
- **~92 lines**

## Task File (Single Source of Truth)

```markdown
# Task 002: Implement Login Endpoint

**Iteration:** Foundation
**Status:** Pending
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
1. Read **src/middleware/auth.ts** to understand existing auth patterns
2. Create **src/routes/auth.ts** with POST /login endpoint
3. Implement email validation (valid format)
4. Implement bcrypt password verification
5. Generate JWT token (24h expiry, HS256 algorithm)
6. Add rate limiting using express-rate-limit (5 req/min per IP)
7. Write tests in **tests/auth.test.ts**:
   - Valid login returns 200 + token
   - Invalid password returns 401
   - Missing email returns 400
   - Rate limit blocks 6th request
8. Run full test suite: `npm test`
</prompt>

## Notes

**planning-agent:** Follow auth patterns in src/middleware/. Rate limiting required for OWASP A04. Mark Stuck if auth middleware missing.

**implementation-agent:**
- Followed LLM Prompt steps 1-8
- Implemented bcrypt + JWT (HS256, 24h expiry)
- Added express-rate-limit (5 req/min)
- 12 tests written, all passing
- Full test suite: 94/94 passing (no regressions)
- Working Result verified ✓

**review-agent:**
Security: 90/100 | Quality: 95/100 | Performance: 95/100 | Tests: 90/100
Working Result verified: ✓
Validation: 4/4 passing
Full test suite: 94/94 passing
Diff: 145 lines (reasonable)
APPROVED → testing

**testing-agent:**
Validated 12 tests (all behavior-focused)
Added 3 edge case tests (empty email, JWT expiry, concurrent requests)
Coverage: 94% statements, 88% branches
Working Result verified ✓
Completed → moving to completed/
```

**Status field tracks blockers. Location tracks workflow stage.**

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
