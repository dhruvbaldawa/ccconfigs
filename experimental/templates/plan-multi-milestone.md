# Plan: {{PROJECT_NAME}}

## Overview

{{1-2 paragraph description of what will be built}}

## Success Criteria (Project Complete When...)

- [ ] {{Core outcome 1 - measurable, testable}}
- [ ] {{Core outcome 2 - measurable, testable}}
- [ ] {{Core outcome 3 - measurable, testable}}
- [ ] {{Core outcome 4 - measurable, testable}}
- [ ] {{All tests passing with >80% coverage}}

## Milestones

See `milestones.md` for detailed breakdown with iterations and task dependencies.

### M1: Foundation 📋 Not Started (0%)
**Name**: {{Milestone 1 name}}
**Outcome**: {{What's achieved - core functionality working}}

Deliverables:
- [ ] {{Concrete deliverable 1}}
- [ ] {{Concrete deliverable 2}}
- [ ] {{Concrete deliverable 3}}

**Risk Focus**: Critical + Unknown (proof-of-concepts, validate assumptions)

### M2: Integration 📋 Not Started (0%)
**Name**: {{Milestone 2 name}}
**Outcome**: {{What's achieved - production-ready with integrations}}

Deliverables:
- [ ] {{Concrete deliverable 1}}
- [ ] {{Concrete deliverable 2}}

**Risk Focus**: Critical + Known (use established patterns, system integration)

### M3: Polish 📋 Not Started (0%)
**Name**: {{Milestone 3 name}}
**Outcome**: {{What's achieved - optimized, documented, deployed}}

Deliverables:
- [ ] {{Concrete deliverable 1}}
- [ ] {{Concrete deliverable 2}}

**Risk Focus**: Non-Critical (refinements, performance, UX polish)

**Overall Progress**: M0/M3 complete (0%)

---

## Risk Analysis

**Critical + Unknown (Address in M1):**
- {{High-impact risk requiring proof-of-concept or validation}}

**Critical + Known (Address in M1-M2):**
- {{Important risk with established patterns}}

**Non-Critical (Address in M2-M3 or defer):**
- {{Lower priority items or optimizations}}

## Architecture

{{Key architectural decisions - update as implementation progresses}}

- {{Key decision 1}}
- {{Key decision 2}}

## Research Findings

{{Document research that validates specific approaches - tasks can reference these instead of duplicating}}

### {{Research Topic 1}} (e.g., "TypeScript Testing Framework")
**Decision**: {{What was chosen and why}}
**Research**: {{Brief summary of what was evaluated}}
**Validated Approach**:
```{{language}}
{{Proven code/config to use as-is - referenced by tasks}}
```
**References**: {{Links to docs, articles, or internal files}}

### {{Research Topic 2}}
...

---

## Task History

**Completed** (in completed/):
- {{List completed tasks as they finish}}

**In Flight**:
- {{Tasks currently in implementation/review/testing}}

**Pending** (current iteration):
- See `milestones.md` for current iteration tasks
- Generate tasks for M1 iterations only (Foundation, early Integration)

Status tracked via file location: `pending/` → `implementation/` → `review/` → `testing/` → `completed/`

Learnings captured in: `learnings/` (auto-generated when blockers resolved)

---

## Learnings

Knowledge captured from resolved blockers and non-trivial fixes. See `learnings/index.md` for searchable index.

**High-Confidence Learnings** (proven, reusable):
- {{List learnings as they're captured}}

**Critical Patterns** (promoted to `critical-patterns.md`):
- {{Patterns that all agents must follow}}

---

## Next Planning Cycle

**Trigger**: {{When to generate next batch - usually milestone completion}}

**Actions**:
1. Review learnings from {{current milestone}}
2. Generate {{next milestone}} tasks based on actual architecture
3. Update risk analysis with new findings
4. Review deferred items for relevance

**Expected learnings before {{next milestone}}**:
- {{What you'll discover that informs next planning cycle}}

---

## Supporting Documents

- `milestones.md` - Detailed milestone breakdown with iterations and task dependencies
- `learnings/` - Knowledge captured from resolved blockers
- `critical-patterns.md` - Patterns all agents must follow (promoted from learnings)
- `architecture.md` (if complex) - System design decisions and evolution
- `technical-spec.md` (if needed) - Detailed technical requirements

---

## Deferred Items

**To M2:**
- {{Item deferred from M1 with rationale}}

**To M3:**
- {{Item deferred from M1-M2 with rationale}}

**To Future Phases:**
- {{Item deferred beyond current project scope with rationale}}

**Eliminated:**
- {{Item deemed unnecessary with rationale}}
