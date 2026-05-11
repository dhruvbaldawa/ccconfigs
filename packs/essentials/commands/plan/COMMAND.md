---
description: Plan implementation with atomic commits
argument-hint: <task description>
---

# Plan with Atomic Commits

**Task:** $ARGS

**FIRST**: Use the EnterPlanMode tool immediately.

Follow plan mode's normal workflow (explore, design, review). When writing your final plan, include an **Atomic Commits** section at the end with this structure:

## Atomic Commits Section Requirements

Each commit must:
- Make one logical change (feature, bugfix, or refactor)
- Leave the codebase in a working state
- Have a clear commit message

**Right-sized commits** group related changes together:
- Implementation + tests + imports + error handling = ONE commit
- Refactor + all affected call sites = ONE commit

**Avoid overly granular commits** like:
- Separate commits for imports, function, tests, error handling
- One commit per file when files are related
- One commit per step in implementation

For each commit, specify:

### Commit N: <description>
- **Changes**: What files/code to modify
- **Verify**: How to confirm it works (tests, manual checks)
- **Commit message**: The actual message to use

If work spans multiple repositories, complete ALL commits in one repo before moving to the next.
