---
description: Do the actual task
argument-hint: [SPEC DOCUMENT] [TASK NUMBER | --resume] [ADDITIONAL CONTEXT] [--auto]
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git status:*)
---
**Flags:**
- `--resume`: If present, the agent starts from the first incomplete task instead of the specified task number
- `--auto`: If present, the agent will automatically:
  1. Perform the task
  2. Commit changes with a descriptive message describing what was done
  3. Move to the next task
  4. If unable to complete a task, update the document with current progress and stop for user feedback

# Instructions
1. Update the document when you start by changing the task status to **In Progress**
2. Read the full task including the LLM Prompt to guide your approach
3. Perform the actual task:
   - Follow the step-by-step instructions in the task's `<prompt>` block
   - Implement the code/changes needed to meet the "Working Result" criteria
   - Ensure the implementation passes the "Validation" checklist
4. After completion:
   - Update the document with your progress
   - Change task status to **Complete** if finished successfully
   - If using `--auto` flag, create a commit with a message describing what was done (e.g., "Initialize Repository", "Set up API endpoints", not "Complete task 1")
   - Move to the next task if `--auto` is enabled
5. If unable to complete the task:
   - Document what was attempted and any blockers
   - Update task status to **Blocked** or **Pending Review**
   - If `--auto` is enabled, stop and request user feedback before proceeding

Context: $1
Implement task $2
$ARGUMENTS
