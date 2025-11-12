---
name: implementing-tasks
description: Invoked by /implement-plan when task moves to implementation/ directory. Updates task file with status and notes.
---

# Implementation

Given task file path `.plans/<project>/implementation/NNN-task.md`:

## Process

1. Read task file - LLM Prompt, Working Result, Validation, Files
2. Follow LLM Prompt step-by-step, write code + tests, run full suite
3. Update task file using `scripts/task-helpers.sh`:
   ```bash
   # Update status atomically
   ./scripts/task-helpers.sh update_status "$task_file" "READY_FOR_REVIEW"

   # Append notes
   cat >> "$task_file" <<EOF

   **implementation:**
   - Followed LLM Prompt steps 1-N
   - Implemented [key functionality]
   - Added [N] tests: all passing
   - Full test suite: [M]/[M] passing
   - Working Result verified: ✓ [description]
   - Files: [list with brief descriptions]
   EOF
   ```
4. Mark validation checkboxes: `[ ]` → `[x]`
5. Report completion

## Stuck Handling

If blocked:
```bash
./scripts/task-helpers.sh update_status "$task_file" "STUCK"

cat >> "$task_file" <<EOF

**implementation:**
- Attempted [what tried]
- BLOCKED: [specific issue]
- Need [what's needed to proceed]
EOF
```

Then STOP and report blocker.

## Rejection Handling

If task moved back from review:
1. Read review notes for issues
2. Fix all blocking issues
3. Update status to `READY_FOR_REVIEW` again
4. Append revision notes:
   ```
   **implementation (revision):**
   - Fixed [issue 1]
   - Fixed [issue 2]
   - Re-ran tests: [M]/[M] passing
   ```
