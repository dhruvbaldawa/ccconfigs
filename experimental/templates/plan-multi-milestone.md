# Plan: {{PROJECT_NAME}}

## Overview

{{1-2 paragraph description of what will be built}}

## Requirements

- {{Requirement 1}}
- {{Requirement 2}}

## Risk Analysis

**Critical + Unknown (Address in M1):**
- {{High-impact risk requiring proof-of-concept or validation}}

**Critical + Known (Address in M1-M2):**
- {{Important risk with established patterns}}

**Non-Critical (Address in M2-M3 or defer):**
- {{Lower priority items or optimizations}}

## Architecture

- {{Key decision 1}}
- {{Key decision 2}}

## Milestones

See `milestones.md` for detailed breakdown.

**M1 (Foundation):** {{Milestone 1 name}} - {{Risk mitigation + core functionality}}
- Focus: Critical + Unknown risks, proof-of-concepts
- Iterations: Foundation → Integration

**M2 (Integration):** {{Milestone 2 name}} - {{Integration + critical features}}
- Focus: Critical + Known risks, system integration
- Iterations: Integration → Polish

**M3 (Polish):** {{Milestone 3 name}} - {{Optimization + deferred items}}
- Focus: Non-critical features, performance, UX polish
- Iterations: Polish

## Documents

- `milestones.md` - Milestone breakdown with iterations and task dependencies
- `architecture.md` (if architecturally complex) - System design decisions
- `technical-spec.md` (if needed) - Detailed technical requirements

## Progress

Status tracked via file location:
```bash
# Check current workflow state
ls .plans/{{project}}/pending/      # Tasks waiting
ls .plans/{{project}}/implementation/  # Being coded
ls .plans/{{project}}/review/       # Under review
ls .plans/{{project}}/testing/      # Test validation
ls .plans/{{project}}/completed/    # Done

# Count progress
completed=$(ls .plans/{{project}}/completed/*.md 2>/dev/null | wc -l)
total=$(find .plans/{{project}} -name "*.md" -not -name "plan.md" -not -name "milestones.md" | wc -l)
echo "Progress: $completed/$total"
```

## Deferred Items

**To M2:**
- {{Item deferred from M1 with rationale}}

**To M3:**
- {{Item deferred from M1-M2 with rationale}}

**To Future Phases:**
- {{Item deferred beyond current project scope with rationale}}

**Eliminated:**
- {{Item deemed unnecessary with rationale}}
