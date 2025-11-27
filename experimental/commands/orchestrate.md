---
description: Full workflow: planning → implementation → review → testing
---

# Orchestrate

Complete end-to-end workflow from planning through implementation.

## Usage

```
/orchestrate Add JWT authentication to login endpoint
```

## Your Task

### Phase 1: Planning

1. Run `/plan-feature` workflow to analyze: "${{{ARGS}}}"
   - This invokes technical-planning skill with full rigor
   - Creates `.plans/<project>/` with plan.md and tasks in pending/
2. After planning, extract project name and summarize
3. Ask: "Ready to start implementation? (yes/no)"
   - yes → Continue to Phase 2
   - no → Stop (user can run `/implement-plan <project>` later)

### Phase 2: Implementation

Follow same workflow as `/implement-plan <project-name>`:

1. Find next task with met dependencies
2. Implementation → Review → Testing loop (move files based on Status)
3. Progress updates after each task
4. Final summary when all completed

### Phase 3: Final Summary

```markdown
✅ Feature Complete: "{{{ARGS}}}"

Project: <project-name>
Tasks: X/X completed (Foundation: Y, Integration: Z, Polish: W)

Average Review Scores: Security: XX/100 | Quality: XX/100 | Performance: XX/100 | Tests: XX/100
Final Test Coverage: XX% | Full suite: XXX/XXX passing
Tasks rejected during review: Y (fixed)

Next: git commit -m "Implement <project-name>"
```

## When to Use

**Use /orchestrate:** Start from scratch, end-to-end automation
**Use /plan-feature + /implement-plan:** Review/modify plan first, more control

## Notes

Skills run in main conversation (full visibility) | Orchestrator handles file movement | Can interrupt anytime | State persists
