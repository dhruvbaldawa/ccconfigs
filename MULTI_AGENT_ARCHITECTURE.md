# Multi-Agent Plugin Architecture

## Overview

Experimental plugin implementing orchestrator-worker pattern for complex software development workflows. Based on production patterns from Anthropic's research showing 90.2% performance improvement on complex tasks, with explicit economic awareness (15× token usage).

## Design Principles

1. **Progressive Complexity** - Start with 3 core agents, scale to 7 specialized roles
2. **Economic Awareness** - Built-in cost tracking, token estimates, only for high-value tasks
3. **Explicit State Management** - Shared state documents following `/breakdown` + `/do` pattern
4. **Pure Orchestrators** - Prevent "implementation drift" with strict role boundaries
5. **Isolated Context** - Each agent operates in separate context window
6. **Structured Handoffs** - JSON-based agent-to-agent communication with schema validation

## Directory Structure

```
multi-agent/
├── .claude-plugin/
│   └── plugin.json                    # Plugin metadata
│
├── agents/                             # Custom agent definitions (subagent spawning)
│   ├── planning-agent.md              # Analyzes requirements → task breakdown
│   ├── implementation-agent.md        # Executes tasks → code changes
│   ├── review-agent.md                # Quality gates → approval/feedback
│   ├── testing-agent.md               # Test generation → coverage validation
│   ├── documentation-agent.md         # README/API docs → user guides
│   ├── architecture-agent.md          # System design → ADRs
│   └── debugging-agent.md             # Root cause analysis → fixes
│
├── commands/                           # Orchestration entry points
│   ├── orchestrate.md                 # General multi-agent coordination
│   ├── plan-feature.md                # Planning workflow only
│   ├── implement-plan.md              # Execute existing plan with agents
│   └── full-cycle.md                  # Complete SDLC workflow
│
├── skills/                             # Agent coordination methodologies
│   ├── orchestration/
│   │   ├── SKILL.md                   # Core orchestration patterns
│   │   └── reference/
│   │       ├── coordination-patterns.md      # Sequential, concurrent, hierarchical
│   │       ├── handoff-protocol.md           # JSON schema for agent handoffs
│   │       ├── cost-optimization.md          # Caching, model selection, token budgets
│   │       ├── common-pitfalls.md            # Implementation drift, context pollution
│   │       └── when-to-use-multiagent.md     # Decision framework
│   │
│   ├── agent-planning/
│   │   ├── SKILL.md                   # Planning agent methodology
│   │   └── reference/
│   │       ├── task-decomposition.md
│   │       └── dependency-analysis.md
│   │
│   ├── agent-implementation/
│   │   ├── SKILL.md                   # Implementation agent methodology
│   │   └── reference/
│   │       └── execution-patterns.md
│   │
│   ├── agent-testing/
│   │   ├── SKILL.md                   # Testing agent methodology
│   │   └── reference/
│   │       ├── test-generation-patterns.md
│   │       └── coverage-strategies.md
│   │
│   └── agent-review/
│       ├── SKILL.md                   # Review agent methodology
│       └── reference/
│           ├── quality-gates.md
│           └── security-checklist.md
│
└── templates/                          # State management templates
    ├── agent-plan-template.md         # Task breakdown document
    ├── handoff-schema.json            # JSON schema for agent handoffs
    └── status-tracking.md             # Status document template
```

## Agent Definitions (Phase 1: Core 3)

### 1. Planning Agent (`agents/planning-agent.md`)

**Responsibilities:**
- Analyze feature requests and requirements
- Break down into specific, actionable tasks
- Identify dependencies and file impact areas
- Create structured plan documents
- **NEVER implement** - planning only

**Tool Access:** Read, Grep, Glob, Bash (read-only operations)

**Model:** Sonnet 4.5 (orchestration-level reasoning)

**Output Format:**
```markdown
# Feature Plan: [Feature Name]

## Requirements Analysis
- [Requirement 1]
- [Requirement 2]

## Task Breakdown
### Task 1: [Description]
- **Status:** pending
- **Dependencies:** None
- **Files:** src/foo.ts, tests/foo.test.ts
- **Estimated Tokens:** 5000
- **Validation Criteria:**
  - [ ] Criterion 1
  - [ ] Criterion 2

### Task 2: [Description]
...
```

### 2. Implementation Agent (`agents/implementation-agent.md`)

**Responsibilities:**
- Execute tasks from plan documents
- Implement features across multiple files
- Run tests after each change
- Update task status and report blockers
- **NEVER make architectural decisions** - execution only

**Tool Access:** Read, Edit, Write, Bash, Grep, Glob (full file operations)

**Model:** Haiku 4.5 (cost-optimized worker)

**Coordination:**
- Reads from `.agent-state/plan.md`
- Updates task status in-place
- Creates handoff to Testing Agent when complete

### 3. Review Agent (`agents/review-agent.md`)

**Responsibilities:**
- Static code analysis
- Security vulnerability detection (OWASP Top 10)
- Performance bottleneck identification
- Code quality scoring (0-100)
- Standards compliance validation

**Tool Access:** Read, Grep, Bash (analysis only, no modifications)

**Model:** Sonnet 4.5 (requires nuanced judgment)

**Output Format:**
```json
{
  "score": 85,
  "security": {
    "status": "pass",
    "issues": []
  },
  "quality": {
    "status": "pass",
    "issues": ["Minor: Consider extracting helper function at line 45"]
  },
  "performance": {
    "status": "warning",
    "issues": ["N+1 query detected in UserController.list()"]
  },
  "recommendation": "approve_with_changes",
  "blocking": false
}
```

## State Management Pattern

Following the `/breakdown` + `/do` pattern from essentials plugin:

**`.agent-state/` directory structure:**
```
.agent-state/
├── plan.md              # Task breakdown (single source of truth)
├── status.json          # Agent coordination state
├── handoffs.log         # Agent communication log
└── cost-tracking.json   # Token usage per agent/task
```

**State Flow:**
1. Planning Agent creates `.agent-state/plan.md`
2. Implementation Agent updates task status in `plan.md`
3. Handoffs logged to `handoffs.log` with JSON schema
4. Cost tracking accumulates in `cost-tracking.json`

## Coordination Patterns

### Sequential Pattern (Default)
```
User Request → Planning Agent → Implementation Agent → Review Agent → Done
```

Each agent waits for previous completion. Simple, deterministic, higher latency.

### Concurrent Pattern (Advanced)
```
User Request → Planning Agent → [Implementation Agent 1, Implementation Agent 2, Implementation Agent 3] → Review Agent → Done
```

Independent tasks run in parallel. Requires conflict resolution.

### Hierarchical Pattern (Complex Projects)
```
Orchestrator (Sonnet 4.5)
├── Planning Agent (Haiku 4.5)
├── Implementation Agents (3× Haiku 4.5 in parallel)
├── Testing Agent (Haiku 4.5)
└── Review Agent (Sonnet 4.5)
```

Central coordinator manages workflow. Best for large features.

## Handoff Protocol

**JSON Schema (`templates/handoff-schema.json`):**
```json
{
  "schema_version": "1.0",
  "trace_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "source_agent": "planning-agent",
  "target_agent": "implementation-agent",
  "payload": {
    "task_id": "task-001",
    "context": "Implement user authentication",
    "files": ["src/auth.ts", "tests/auth.test.ts"],
    "validation_criteria": ["Tests pass", "Security review approved"]
  },
  "metadata": {
    "estimated_tokens": 5000,
    "priority": "high"
  }
}
```

**Validation:** Each agent validates incoming handoffs against schema before processing.

## Economic Model

**Token Budget Tracking:**
- Each task in plan.md includes `estimated_tokens`
- Status tracking accumulates actual usage
- Warnings at 10K, 25K, 50K token thresholds

**Model Selection Strategy:**
- **Haiku 4.5** ($1/$5 per million tokens): Implementation, Testing, Documentation workers
- **Sonnet 4.5** ($3/$15 per million tokens): Planning, Review, Architecture, Orchestration
- **Opus 4** ($15/$75 per million tokens): Reserved for extremely complex design decisions

**Cost Optimization:**
- Prompt caching for unchanging context (75% reduction)
- Progressive disclosure via Skills (30-50 tokens vs thousands)
- Tool filtering (only grant necessary tools)

**When NOT to Use Multi-Agent:**
- Simple tasks completable in one pass
- Write-heavy workflows (code generation)
- Budget constraints (<$5 task value)
- Time-sensitive quick fixes

## Phase 1: Minimum Viable Multi-Agent (MVP)

**Scope:**
- 3 agents: Planning, Implementation, Review
- 2 commands: `/plan-feature`, `/implement-plan`
- 1 skill: orchestration/SKILL.md (basic coordination)
- State management: `.agent-state/plan.md`

**Success Criteria:**
- Can break down feature request into tasks
- Can execute tasks with implementation agent
- Can validate with review agent
- Total token usage < 20K for simple feature

## Phase 2: Testing & Documentation

**Added Agents:**
- Testing Agent (test generation, coverage validation)
- Documentation Agent (README, API docs)

**Added Skills:**
- agent-testing/SKILL.md
- agent-documentation/SKILL.md

**Added Command:**
- `/full-cycle` (plan → implement → test → review → document)

## Phase 3: Advanced Capabilities

**Added Agents:**
- Architecture Agent (system design, ADRs)
- Debugging Agent (root cause analysis)

**Advanced Features:**
- Concurrent execution pattern
- Hierarchical orchestration
- Cost optimization dashboard
- Agent performance analytics

## Common Pitfalls & Prevention

### 1. Implementation Drift
**Problem:** Orchestrator starts implementing instead of delegating
**Prevention:** Strict tool access (orchestrators get Read/Grep only)

### 2. Context Pollution
**Problem:** Agents inherit project CLAUDE.md causing inconsistency
**Prevention:** Custom agents explicitly NOT inheriting global context

### 3. State Synchronization Issues
**Problem:** Agent A has information Agent B needs
**Prevention:** Explicit handoff protocol with JSON schema validation

### 4. File Conflicts
**Problem:** Multiple agents modify same file simultaneously
**Prevention:** Sequential execution by default, dependency graphs for parallel

### 5. Over-Specialization
**Problem:** Too many agents with overlapping responsibilities
**Prevention:** Start with 3 agents, add more only when hitting clear limits

## Integration with Existing Plugins

**Essentials Plugin:**
- Multi-agent can spawn debugging agent using essentials' debugging skill
- Can use `/breakdown` format for compatibility
- MCP servers (Context7, Perplexity) available to all agents

**Writing Plugin:**
- Documentation Agent can use blog-writing skill for narrative docs
- Research-synthesis skill for gathering background

## Success Metrics

**Performance:**
- Task completion rate (% of tasks successfully executed)
- Agent efficiency (tasks per thousand tokens)
- Correctness (% passing validation criteria)

**Coordination:**
- Handoff success rate (% valid handoffs)
- Conflict rate (file conflicts per 100 tasks)
- Communication efficiency (overhead tokens / task tokens)

**Economics:**
- Token usage per task type
- Cost per feature (actual vs estimated)
- ROI (task value / token cost)

## Next Steps

1. Create plugin metadata (`.claude-plugin/plugin.json`)
2. Define core 3 agents (planning, implementation, review)
3. Build orchestration skill with coordination patterns
4. Implement state management templates
5. Create `/plan-feature` and `/implement-plan` commands
6. Test with real feature request
7. Document learnings and optimize

---

**This is an experimental plugin. Token usage will be 15× higher than single-agent approaches. Only use for genuinely complex, high-value tasks where parallelization and specialization justify the cost.**
