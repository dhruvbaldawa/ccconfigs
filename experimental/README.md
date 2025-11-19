# Experimental: Multi-Skill Development Workflows

**Status:** Experimental (v0.3.0)
**Architecture:** Kanban Flow (File Movement = Handoff) + Skills (Visibility + Interaction)

Multi-skill orchestration plugin coordinating specialized skills via physical file movement. Task files move between directories like a Kanban board: `pending/` → `implementation/` → `review/` → `testing/` → `completed/`.

**Key improvement:** Skills run in main conversation (full visibility) instead of isolated subagents (black box).

## Quick Start

```bash
# Plan a feature
/plan-feature Add user authentication with JWT

# Add ad-hoc task to existing project
/add-task user-authentication Add email verification

# Execute the plan
/implement-plan user-authentication

# Or do both planning and implementation
/orchestrate Build real-time notifications
```

## Architecture: Skills + Kanban Flow

**Core concepts:**
- **File location = workflow stage** (pending/implementation/review/testing/completed)
- **Status field = completion state** (Pending → READY_FOR_REVIEW → APPROVED → COMPLETED)
- **Skills update task files** with status and detailed notes
- **Orchestrator moves files** between directories based on status
- **Everything visible** in main conversation (no hidden subagent execution)

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

## Four Specialized Skills

### 1. Planning Skill
- Uses **technical-planning skill** (risk-first development)
- Asks clarifying questions (never assumes)
- Creates risk-prioritized iterations (Foundation → Integration → Polish)
- Generates tasks with LLM Prompt blocks (step-by-step instructions)
- Documents deferred items with rationale
- Read-only (no code changes)
- **Runs in main conversation** → you see all questions and decisions

### 2. Implementation Skill
- Receives task file path from orchestrator
- **Follows LLM Prompt block step-by-step**
- Writes code + tests together (prevent regressions)
- **Updates task file:** Status → "READY_FOR_REVIEW", appends implementation notes
- Marks **Status: STUCK** if blocked, reports blocker
- **Runs in main conversation** → you see code being written, tests running

### 3. Review Skill
- Receives task file path from orchestrator
- **Fresh eyes** - reviews outputs (diff, tests) not implementation notes
- Checks security (OWASP Top 10), quality, performance, test coverage
- Verifies **Working Result** achieved and **Validation** checklist complete
- **Updates task file:** Status → "APPROVED" or "REJECTED", appends review notes with scores
- **Runs in main conversation** → you see security analysis, quality checks

### 4. Testing Skill
- Receives task file path from orchestrator
- Validates existing tests (implementation already wrote them)
- Adds missing edge cases only (minimal, no test bloat)
- Verifies behavior-focused (not implementation details)
- Checks coverage >80% statements, >75% branches
- **Updates task file:** Status → "COMPLETED", appends testing notes with coverage
- **Runs in main conversation** → you see test validation, coverage reports

## Slash Commands

### `/plan-feature [REQUEST]`
Creates `.plans/<project>/` with risk-prioritized tasks following Last Responsible Moment principle.
- Invokes **planning skill** (uses technical-planning + exploration agents)
- Launches architecture-explorer and codebase-analyzer in parallel
- Generates task files in `pending/` with LLM Prompt blocks
- Documents deferred items with rationale

**Example:** `/plan-feature Add user authentication with JWT`

### `/add-task [PROJECT] [TASK DESCRIPTION]`
Adds a single ad-hoc task to an existing project without full planning workflow.
- Auto-increments task number by scanning existing tasks
- Creates properly formatted task file in `pending/`
- Prompts for project if not specified
- Simpler than `/plan-feature` - no exploration agents or risk analysis
- Useful for tasks discovered during implementation

**Examples:**
- `/add-task auth Add rate limiting to login endpoint`
- `/add-task Add email verification` (prompts for project)

### `/implement-plan [PROJECT] [--auto]`
Executes tasks through kanban workflow (pending → implementation → review → testing → completed).
- Creates granular sub-todos for each task
- Launches research agents when stuck
- Launches all 3 review agents in parallel for comprehensive analysis
- With `--auto` flag: automatically commits and continues to next task
- Without flag: stops after each task for human review

**Example:** `/implement-plan user-authentication --auto`

### `/orchestrate [REQUEST]`
End-to-end workflow from planning through completion.
- Combines `/plan-feature` and `/implement-plan`
- User confirmation between phases

**Example:** `/orchestrate Build real-time notifications`

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

**Key updates:**
- **Status field:** Updated by skills (Pending → READY_FOR_REVIEW → APPROVED → COMPLETED)
- **Validation checkboxes:** Marked by implementation skill ([ ] → [x])
- **Notes section:** Each skill appends its own detailed notes
- **Location:** Updated by orchestrator based on status (pending/ → implementation/ → review/ → testing/ → completed/)

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

## Benefits Over Previous Subagent Architecture

### Visibility
- ✅ **See everything:** Skills run in main conversation
- ✅ **Real-time progress:** Watch code being written, tests running, reviews happening
- ❌ **Before:** Subagents ran in isolated contexts (black box)

### Interaction
- ✅ **Natural interruption:** Say "wait, that's wrong" anytime
- ✅ **Course correction:** Guide skills mid-execution
- ❌ **Before:** Could only resume via agentId (clunky)

### Kanban Flow
- ✅ **Guaranteed movement:** Orchestrator moves files based on status
- ✅ **Single source of truth:** Task file contains full history
- ❌ **Before:** Agents told to move files (not enforced)

### Additional Benefits
1. **Visual Kanban:** `ls .plans/project/*/` shows workflow state
2. **O(1) Discovery:** Orchestrator knows exactly which directory to check
3. **No Redundancy:** File location = workflow stage, Status field = completion state
4. **Atomic Handoffs:** `mv` is atomic operation
5. **Git History:** Task journey visible in git log with all skill notes
6. **Natural Rejection:** Moving file back is explicit
7. **Resume anytime:** Just run `/implement-plan <project>` again

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

**Add task mid-implementation:**
```bash
# Discovered we need email verification
/add-task user-auth Add email verification to registration flow
```

Creates `007-add-email-verification.md` in `pending/`, ready to be implemented after current tasks complete.

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

**Skills:** `skills/*/SKILL.md` (planning, implementation, review, testing)
**Commands:** `commands/*.md` (plan-feature, implement-plan, orchestrate)
**Templates:** `templates/*.md` (plan, task, milestones)

## References

- `.plans-structure-design.md` - Detailed Kanban structure specification
- Commands contain orchestration logic and Kanban flow patterns

---

## Migration from v0.2.0 (Subagents)

**v0.3.0 changes:**
- ✅ Agents converted to skills (run in main conversation)
- ✅ Commands refactored to invoke skills instead of Task tool
- ✅ Orchestrator explicitly handles file movement
- ✅ Skills update task files with status and notes
- ✅ Full visibility and interaction throughout workflow

**Old agents still available** in `agents/` directory but deprecated.

**Breaking changes:**
- Commands no longer use `await Task({ subagent_type: '...' })`
- Commands now invoke skills and handle orchestration directly
- Better visibility but slightly different invocation pattern

---

**Ultra-lean, token-efficient multi-skill workflows via Kanban file movement. Use strategically for complex, high-value tasks with full visibility.**
