---
name: implementing-tasks
description: Implements tasks from .plans/ directories by following implementation guidance, writing code and tests, and updating task status. Use when task file is in implementation/ directory and requires code implementation with comprehensive testing. Launches research agents when stuck.
---

# Implementation

Given task file path `.plans/<project>/implementation/NNN-task.md`:

## Process

**Use TodoWrite to track implementation progress:**
```
☐ Read task file (LLM Prompt, Working Result, Validation)
☐ [LLM Prompt step 1]
☐ [LLM Prompt step 2]
...
☐ Write tests for new functionality
☐ Run full test suite
☐ Mark validation checkboxes
☐ Update status to READY_FOR_TESTING
```

Convert each step from the task's LLM Prompt into a todo. Mark completed as you progress.

1. Read task file - LLM Prompt, Working Result, Validation, Files
2. Follow LLM Prompt step-by-step, write code + tests, run full suite
3. Update task status using Edit tool:
   - For initial implementation: `**Status:** READY_FOR_TESTING`
   - For revision after rejection: `**Status:** READY_FOR_REVIEW` (skip testing, go back to review)
4. Append implementation notes using Edit tool (add to end of task file):
   ```markdown
   **implementation:**
   - Followed LLM Prompt steps 1-N
   - Implemented [key functionality]
   - Added [N] tests: all passing
   - Full test suite: [M]/[M] passing
   - Working Result verified: ✓ [description]
   - Files: [list with brief descriptions]
   ```
5. Mark validation checkboxes: `[ ]` → `[x]` using Edit tool
6. Report completion

## Stuck Handling

When blocked during implementation:

### 1. Mark Task as Stuck
- Update status using Edit tool:
  - Find: `**Status:** [current status]`
  - Replace: `**Status:** STUCK`
- Append notes using Edit tool (add to end of task file):
  ```markdown
  **implementation:**
  - Attempted [what tried]
  - BLOCKED: [specific issue]
  - Launching research agents to investigate...
  ```

### 2. Launch Research Agents

Based on blocker type, launch 2-3 agents in parallel:

**New technology/framework** → `research-breadth` + `research-technical`:
- research-breadth: General understanding of technology/approach
- research-technical: Official API documentation

**Specific error/issue** → `research-depth` + `research-technical`:
- research-depth: Detailed analysis of specific solutions
- research-technical: Official API documentation

**API integration** → `research-technical` + `research-depth`:
- research-technical: Official API documentation
- research-depth: Detailed implementation examples

**Best practices/patterns** → `research-breadth` + `research-depth`:
- research-breadth: General surveys and comparisons
- research-depth: Detailed analysis of specific approaches

Example:
```bash
# Launch agents with specific questions
research-breadth "How to [solve blocker]?"
research-depth "Detailed solutions for [specific issue]"
research-technical "[library/framework] official documentation for [feature]"
```

### 3. Synthesize Findings

Use research-synthesis skill (from essentials) to:
- Consolidate findings from all agents
- Identify concrete path forward
- Extract actionable implementation guidance

Update task file with research findings using Edit tool (add to end of task file):
```markdown
**research findings:**
- [Agent 1]: [key insights]
- [Agent 2]: [key insights]
- [Agent 3]: [key insights]

**resolution:**
[Concrete path forward based on research]
```

### 4. Continue or Escalate

**If unblocked:**
- Update status back to `IN_PROGRESS`
- Resume implementation following research guidance
- Complete normally as per main Process section

**If still stuck after research:**
- Keep status as `STUCK`
- Append escalation notes using Edit tool (add to end of task file):
  ```markdown
  **escalation:**
  - Research completed but blocker remains
  - Reason: [why research didn't unblock]
  - Need: [what's needed - human decision, missing requirement, etc.]
  ```
- Then STOP and report blocker with full context.

## Rejection Handling

If task moved back from review (check for `**review:**` notes in task file):
1. Read review notes for blocking issues
2. Fix all CRITICAL and HIGH issues
3. Update status to `READY_FOR_REVIEW` (go back to review, skip testing)
4. Append revision notes:
   ```
   **implementation (revision):**
   - Fixed [issue 1]
   - Fixed [issue 2]
   - Re-ran tests: [M]/[M] passing
   ```

## Test Fix Handling

If task moved back from testing (check for `**testing:**` notes with NEEDS_FIX):
1. Read testing notes for failures
2. Fix the failing tests or code
3. Update status to `READY_FOR_TESTING` (go back to testing)
4. Append fix notes:
   ```
   **implementation (test fix):**
   - Fixed [test issue]
   - Re-ran tests: [M]/[M] passing
   ```

## Completion

When implementation is complete:
- Initial implementation: Status = `READY_FOR_TESTING`
- After review rejection: Status = `READY_FOR_REVIEW`
- After test failure: Status = `READY_FOR_TESTING`

Report: `✅ Implementation complete. Status: [STATUS]`
