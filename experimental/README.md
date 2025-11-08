# Experimental: Multi-Agent Development Workflows

**Status:** Experimental (v0.1.0)
**Author:** Dhruv Baldawa
**Claude Code:** >=1.0.0

Multi-agent orchestration plugin for complex software development workflows. Coordinates specialized agents (planning, implementation, review, testing) based on production patterns showing 90.2% performance improvement on complex tasks.

## ⚠️ Important: Token Economics

Multi-agent systems use **15× more tokens** than single-agent approaches. Only use for:
- Complex features (>10 tasks)
- Security-critical implementations
- High-value tasks justifying cost

**Typical costs:**
- Simple feature (8 tasks): $0.45-2.50 depending on optimization
- Auth system (12 tasks): $0.95-4.80
- Microservice (25 tasks): $2.80-12.00

See [cost-optimization.md](skills/orchestration/reference/cost-optimization.md) for strategies.

## Overview

This plugin implements the orchestrator-worker pattern with four specialized agents:

1. **Planning Agent** - Analyzes requirements, creates task breakdowns
2. **Implementation Agent** - Executes tasks, writes code
3. **Review Agent** - Security, quality, performance, standards validation
4. **Testing Agent** - Behavior-focused test design at appropriate granularity

## Quick Start

### 1. Plan a Feature

```bash
/plan-feature Add user authentication with JWT
```

**Creates:**
- `.plans/user-authentication/plan.md` - Single source of truth
- `.plans/user-authentication/tasks/001-006.md` - Individual task specs
- `.plans/user-authentication/handoffs.md` - Agent communication log

### 2. Implement the Plan

```bash
/implement-plan user-authentication
```

**Executes:**
- Implementation agent → implements each task
- Review agent → validates security/quality
- Testing agent → writes behavior-focused tests
- Iterates until all tasks complete

### 3. Full Workflow (Plan + Implement)

```bash
/orchestrate Add real-time notifications using WebSocket
```

**Complete cycle:**
- Planning → Implementation → Review → Testing → Done

## Architecture

### Directory Structure

```
experimental/
├── agents/                    # Custom agent definitions
│   ├── planning-agent.md
│   ├── implementation-agent.md
│   ├── review-agent.md
│   └── testing-agent.md
│
├── commands/                  # Slash commands
│   ├── plan-feature.md       # Planning only
│   ├── implement-plan.md     # Execute existing plan
│   └── orchestrate.md        # Full workflow
│
├── skills/
│   └── orchestration/
│       ├── SKILL.md          # Core orchestration patterns
│       └── reference/
│           ├── coordination-patterns.md
│           └── cost-optimization.md
│
└── templates/                 # State management templates
    ├── plan-single-milestone.md
    ├── plan-multi-milestone.md
    ├── task.md
    └── handoffs.md
```

### State Management (.plans/)

All agents read/write shared state:

**Single-Milestone Project:**
```
.plans/user-authentication/
├── plan.md              # Single source of truth
├── tasks/
│   ├── 001-setup-user-model.md
│   └── 002-login-endpoint.md
└── handoffs.md          # Agent communication log
```

**Multi-Milestone Project:**
```
.plans/realtime-collab/
├── plan.md              # Overview
├── milestones.md        # Milestone breakdown
├── technical-spec.md    # Detailed specs
├── architecture.md      # Design decisions
├── milestones/
│   ├── m1-websocket-foundation/
│   │   └── tasks/
│   └── m2-operational-transform/
│       └── tasks/
└── handoffs.md
```

## Agent Behaviors

### Planning Agent

**Purpose:** Requirements analysis → task breakdown

**Capabilities:**
- Read-only codebase access
- Determines single vs multi-milestone structure
- Creates atomic, actionable tasks
- Defines acceptance criteria

**Model:** Sonnet (requires reasoning)

**Example output:**
```markdown
# Plan: User Authentication

**Tasks:** 6 total

### Task 001: Setup User Model
**Files:** src/models/User.ts
**Acceptance Criteria:**
- [ ] User model with email, passwordHash fields
- [ ] Bcrypt integration for password hashing
- [ ] Validation schema defined
```

### Implementation Agent

**Purpose:** Execute tasks → write code

**Capabilities:**
- Full file operations (Read, Edit, Write)
- Follows existing patterns
- Updates task status
- Creates handoffs for review

**Model:** Haiku (cost-optimized worker)

**Constraints:**
- ❌ No architectural decisions
- ❌ One task at a time
- ❌ Can't modify acceptance criteria

### Review Agent

**Purpose:** Quality validation → approval/feedback

**Capabilities:**
- Security review (OWASP Top 10)
- Code quality assessment
- Performance analysis
- Standards compliance

**Model:** Sonnet (requires judgment)

**Scores:**
- Security (0-100)
- Quality (0-100)
- Performance (0-100)
- Standards (0-100)

**Recommendations:**
- `APPROVE` - All quality gates passed
- `APPROVE WITH CHANGES` - Minor fixes needed
- `REJECT` - Significant issues, reimplement required

### Testing Agent

**Purpose:** Test design → comprehensive coverage

**Capabilities:**
- Behavior-focused scenarios (not logic-focused)
- Chooses appropriate granularity (unit/integration/e2e)
- Prevents excessive/useless tests
- Targets >80% coverage

**Model:** Haiku (worker)

**Principles:**
1. **Behavior over logic** - Test what it does, not how
2. **Right granularity** - Unit for pure functions, integration for component interactions, E2E for critical workflows
3. **No test bloat** - Every test must have clear value

## Coordination Patterns

### Sequential (Default)

```
Planning → Implementation → Review → Testing → Complete
```

**When:** Clear dependencies, quality gates required
**Cost:** Standard (~10-15K tokens per task)
**Speed:** 3-5 tasks/hour

### Concurrent (Advanced)

```
Planning → [Impl 1 || Impl 2 || Impl 3] → Review → Complete
```

**When:** Independent tasks, no file conflicts
**Cost:** Higher (~12-18K tokens per task)
**Speed:** 8-12 tasks/hour for parallelizable work

### Iterative Review (Quality-Focused)

```
Implementation → Review → [Feedback → Fix]* → Testing
```

**When:** Security-critical, high-quality requirements
**Cost:** Higher (15-25K tokens per task)
**Iterations:** Average 1.5-2.5 per task

See [coordination-patterns.md](skills/orchestration/reference/coordination-patterns.md) for detailed patterns.

## Usage Examples

### Example 1: Simple CRUD API

```bash
/plan-feature Add CRUD endpoints for blog posts

# Creates plan with 8 tasks:
# - Task 001: Post model
# - Task 002: GET /api/posts
# - Task 003: POST /api/posts
# - Task 004: PUT /api/posts/:id
# - Task 005: DELETE /api/posts/:id
# - Task 006: Validation middleware
# - Task 007: Integration tests
# - Task 008: API documentation

/implement-plan blog-posts-crud
```

**Expected:**
- Duration: 2-3 hours
- Cost: $0.45-0.80 (optimized)
- Review cycles: 1-2 per task
- Test coverage: 85-95%

### Example 2: Authentication System

```bash
/orchestrate Add user authentication with JWT and rate limiting

# Planning agent creates:
# - 12 tasks across single milestone
# - Security considerations documented
# - Rate limiting requirements specified

# Implementation proceeds:
# - Task 001: User model → approved after security review
# - Task 002: Login endpoint → required rate limiting addition
# - Task 003: JWT middleware → approved first pass
# - ...continues through all tasks
```

**Expected:**
- Duration: 4-6 hours
- Cost: $0.95-2.00 (optimized)
- Review cycles: 2-3 per task (security scrutiny)
- Security score: 90+ required

### Example 3: Complex Multi-Milestone Project

```bash
/plan-feature Build real-time collaborative editing with operational transform

# Planning agent determines:
# - Multi-milestone structure (3 milestones)
# - Creates technical-spec.md (OT algorithm, WebSocket protocol)
# - Creates architecture.md (component design)
# - Total: 18 tasks across 3 milestones

/implement-plan realtime-collab

# Executes sequentially by milestone:
# M1: WebSocket foundation (5 tasks)
# M2: Operational transform (8 tasks)
# M3: Production deployment (5 tasks)
```

**Expected:**
- Duration: 12-18 hours
- Cost: $4.50-8.00 (optimized)
- Milestones provide natural checkpoints
- Architecture review between milestones

## Monitoring Progress

### View Plan Status

```bash
cat .plans/<project>/plan.md
```

Shows:
- Task status (pending/in_progress/completed)
- Progress summary (X/Y completed)
- Current agent working
- Last updated timestamp

### View Agent Communication

```bash
cat .plans/<project>/handoffs.md
```

Shows:
- Agent-to-agent handoffs
- Context provided
- Feedback/issues raised
- Timestamp trail

### View Task Details

```bash
cat .plans/<project>/tasks/002-implement-login.md
```

Shows:
- Acceptance criteria
- Implementation notes
- Review scores
- Test results

## Cost Optimization

### 1. Model Selection (60% savings)

```json
{
  "planning": "sonnet",      // Reasoning required
  "implementation": "haiku", // Worker executing specs
  "review": "sonnet",        // Judgment required
  "testing": "haiku"         // Worker following patterns
}
```

### 2. Prompt Caching (75% savings)

```markdown
# Structure prompts with static content first:
[CLAUDE.md]               ← Cached
[Agent Guidelines]        ← Cached
[Orchestration Skill]     ← Cached
---
Task: Implement X         ← Not cached (small)
```

### 3. Progressive Disclosure (90% savings)

- Don't load all 20 tasks into every prompt
- Agent loads only current task details
- Reference other tasks by ID only

### 4. Tool Filtering (70% savings on tool overhead)

- Planning agent: Read, Grep, Glob, Bash (read-only)
- Implementation agent: Full tools
- Review agent: Read, Grep, Glob, Bash (analysis only)

See [cost-optimization.md](skills/orchestration/reference/cost-optimization.md) for complete strategies.

## Common Pitfalls

### ❌ Implementation Drift

**Problem:** Planning agent starts writing code
**Prevention:** Strict tool access (read-only for planning)

### ❌ Over-Specialization

**Problem:** Too many agents with overlapping roles
**Prevention:** Start with 4 agents, only add more when hitting clear limits

### ❌ File Conflicts

**Problem:** Multiple agents modifying same file
**Prevention:** Sequential execution by default, dependency tracking

### ❌ Missing Handoffs

**Problem:** Agents don't communicate context
**Prevention:** Explicit handoff protocol, validated in handoffs.md

## When NOT to Use Multi-Agent

Use single-agent when:
- ❌ Simple changes (1-2 files)
- ❌ Quick fixes with known root cause
- ❌ Documentation updates
- ❌ Configuration changes
- ❌ Budget constraints
- ❌ Tasks completable in one pass

**Decision framework:**
```
Complexity Score:
  Files to change: _____ × 1 point
  New patterns:    _____ × 3 points
  Security risk:   _____ × 5 points
  Integration:     _____ × 2 points

< 10 points  → Single agent
10-20 points → Multi-agent
> 20 points  → Multi-agent + architecture
```

## Quality Gates

Enforced minimums:
- Security score: ≥80/100
- Quality score: ≥80/100
- Test coverage: ≥80%
- All tests must pass

Tasks failing quality gates require rework before completion.

## Success Metrics

Target metrics per project:
- Task completion rate: >90%
- Review approval rate: 60-80% (first pass)
- Rework cycles: <2 per task
- Test coverage: >80%
- Security scores: >85

## Limitations

**Current limitations:**
- No concurrent task execution (sequential only)
- No automatic conflict resolution
- Maximum 5 review cycles per task
- No cost budgeting at CLI level (manual tracking)
- Experimental status (expect rough edges)

**Roadmap:**
- Concurrent execution pattern implementation
- Automatic file conflict detection
- Built-in cost tracking dashboard
- Agent performance analytics
- Integration with CI/CD hooks

## Troubleshooting

### Task Blocked

```markdown
⚠️ Task 003 blocked

Reason: Dependencies not met (Task 002 failed review)

Actions:
1. Fix Task 002 issues
2. Retry Task 003 when dependency resolved
```

### Review Rejection Loop

```markdown
❌ Task 004 exceeded max review iterations (5)

Options:
1. Escalate to planning agent (may need replanning)
2. Manual intervention required
3. Skip task, continue with independents
```

### Cost Exceeded

```markdown
🚨 Project cost $12.50 exceeded budget $10.00

Actions:
1. Review completed tasks
2. Adjust remaining work scope
3. Increase budget if justified
```

## Contributing

This is an experimental plugin. Feedback and improvements welcome:

1. Issues with agent coordination
2. Cost optimization discoveries
3. Quality gate calibration
4. New coordination patterns

## References

- [MULTI_AGENT_ARCHITECTURE.md](../MULTI_AGENT_ARCHITECTURE.md) - Complete architecture design
- [.plans-structure-design.md](.plans-structure-design.md) - State management details
- [coordination-patterns.md](skills/orchestration/reference/coordination-patterns.md) - Agent coordination strategies
- [cost-optimization.md](skills/orchestration/reference/cost-optimization.md) - Token economics and optimization

## Research Sources

Based on production patterns from:
- Anthropic's multi-agent research (90.2% improvement on complex tasks)
- Claude Code best practices (October 2024 - January 2025)
- Real-world implementations (claude-flow, wshobson/agents)
- Token economics research (15× multi-agent overhead findings)

---

**Experimental Plugin** - Use strategically for complex, high-value development tasks. The 15× token cost is real, but strategic implementation with proper optimization can reduce to 3-5× overhead while gaining significant quality and capability benefits.
