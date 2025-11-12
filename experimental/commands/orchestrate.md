---
description: Full workflow: planning → implementation → review → testing
---

# Orchestrate

Complete end-to-end workflow from planning through implementation.

## Usage

```
# Standard (clear requirements)
/orchestrate Add JWT authentication to login endpoint

# Discovery mode (vague idea - future)
/orchestrate --discover "Something with notifications, maybe realtime?"
```

## Your Task

You orchestrate the complete workflow: planning → implementation → review → testing.

### Phase 1: Planning

1. **Check if discovery needed** (if --discover flag):
   - TODO: Discovery workflow not yet implemented in skills version
   - For now, ask clarifying questions directly in this conversation

2. **Invoke planning skill** to analyze: "${{{ARGS}}}"

3. The planning skill will:
   - Ask clarifying questions if requirements unclear
   - Use technical-planning skill for risk-first analysis
   - Create .plans/<project>/ structure
   - Generate tasks in pending/

4. **After planning completes:**
   - Extract project name from .plans/ directory
   - Count tasks created
   - Summarize plan

5. **Ask user for confirmation:**
```
✅ Planning Complete

Project: <project-name>
Tasks: X total (Foundation: Y, Integration: Z, Polish: W)

Ready to start implementation? (yes/no/wait)
```

**Wait for user response:**
- "yes" → Continue to Phase 2
- "no" → Stop here (user can run /implement-plan <project> later)
- "wait" or edits → Let user review/modify plan, then ask again

### Phase 2: Implementation

Once user confirms, proceed with implementation by following the same workflow as `/implement-plan <project-name>`:

#### Main Loop

While tasks remain in pending/ OR in-flight:

1. **Find next task** with met dependencies in pending/

2. **Implementation Phase:**
   - Move: pending/ → implementation/
   - Report: "🔨 Implementing Task X/Y: [name]"
   - Invoke implementation skill on task file
   - Wait for skill to update Status to "READY_FOR_REVIEW" or "STUCK"
   - If STUCK: Stop and ask user
   - Move: implementation/ → review/

3. **Review Phase:**
   - Report: "🔍 Reviewing Task X/Y: [name]"
   - Invoke review skill on task file
   - Wait for skill to update Status to "APPROVED" or "REJECTED"
   - If APPROVED: Move review/ → testing/
   - If REJECTED: Move review/ → implementation/ (loop back to fix)

4. **Testing Phase:**
   - Report: "🧪 Testing Task X/Y: [name]"
   - Invoke testing skill on task file
   - Wait for skill to update Status to "COMPLETED" or "NEEDS_FIX"
   - If NEEDS_FIX: Move testing/ → implementation/ (loop back)
   - Move: testing/ → completed/

5. **Progress Update:**
   ```
   Progress: X/Y completed | Z in-flight | W pending
   ```

6. **Repeat** until all tasks in completed/

### Phase 3: Final Summary

When all tasks completed:

1. **Calculate averages** from review notes in completed/*.md
2. **Count rejections** that occurred during review
3. **Run final test suite:** `npm test`
4. **Report completion:**

```markdown
✅ Feature Complete: "{{{ARGS}}}"

Project: <project-name>
Tasks: X/X completed (Foundation: Y, Integration: Z, Polish: W)

Average Review Scores:
- Security: XX/100
- Quality: XX/100
- Performance: XX/100
- Tests: XX/100

Final Test Coverage: XX%
Full test suite: XXX/XXX passing

Tasks rejected during review: Y (then fixed and completed)

Next: git add . && git commit -m "Implement <project-name>"
```

## Key Differences from /implement-plan

1. **Planning included:** Orchestrate does planning first
2. **User checkpoint:** Asks "Ready to implement?" before starting
3. **Otherwise identical:** Implementation phase is the same

## When to Use

**Use /orchestrate when:**
- Starting from scratch (no plan yet)
- Want end-to-end automation with one command
- Requirements are clear enough to plan immediately

**Use /plan-feature + /implement-plan when:**
- Want to review/modify plan before implementing
- Planning multiple features before implementing any
- More control over the process

## Complexity Check

Before starting, assess complexity:

```
Files to change: ___ × 1
New patterns:    ___ × 3
Security risk:   ___ × 5
Integration:     ___ × 2
Total: ___

< 10 → Consider simple single-agent approach
>= 10 → Multi-skill workflow justified
```

## Notes

- Skills run in main conversation → full visibility of all work
- Orchestrator handles file movement → guaranteed Kanban flow
- Can interrupt at any point (Ctrl+C) and resume later
- State persists in .plans/ directory structure
- No hidden subagent execution → see everything happen

## Cost Warning

Multi-skill workflow uses more tokens than simple implementation. Estimated based on complexity:
- Simple (6 tasks): ~10-15k tokens
- Medium (12 tasks): ~25-40k tokens
- Complex (25 tasks): ~60-100k tokens

Use for genuinely complex, high-value features where the structured workflow adds value.
