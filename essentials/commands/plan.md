---
description: Plan implementation with atomic commits
argument-hint: <task description>
---

# Plan with Atomic Commits

**Task:** $ARGS

Enter plan mode and create a plan following this structure:

## Plan Format Requirements

1. **Atomic Commits**: Break work into discrete commits where each:
   - Makes one logical change
   - Leaves the codebase in a working state
   - Has a clear, descriptive commit message

2. **Per-Commit Verification**: Each commit step must include:
   - What to implement
   - How to verify (tests to run, manual checks)
   - Expected outcome

3. **Multi-Repo Sequencing**: If work spans multiple repositories:
   - Complete ALL commits in one repo before moving to the next
   - Document the repo order and dependencies between them

## Plan Template

For each commit:

### Commit N: <description>
- **Changes**: What files/code to modify
- **Verify**: How to confirm it works
- **Commit message**: The actual message to use
