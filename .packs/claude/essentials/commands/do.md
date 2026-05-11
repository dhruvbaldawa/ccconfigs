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
2. Read the full task including:
   - **Goal**: What outcome needs to be achieved
   - **Working Result**: Concrete definition of "done"
   - **Constraints**: Technical limitations and requirements
   - **Dependencies**: What this task relies on
   - **Implementation Guidance** (`<guidance>` block): Context, considerations, and trade-offs
   - **Validation**: Pass/fail checks
3. Perform the actual task:
   - Use the guidance to understand the problem domain and key considerations
   - Make implementation decisions based on what you learn during development
   - Aim to meet the "Working Result" criteria
   - Ensure the implementation passes the "Validation" checklist
   - **Important**: The guidance provides context, not step-by-step instructions. Use your judgment to choose the best approach as you work.
4. After completion:
   - Update the document with your progress
   - Change task status to **Complete** if finished successfully
   - If using `--auto` flag, create a commit with a message describing what was done (e.g., "Initialize Repository", "Set up API endpoints", not "Complete task 1")
   - Move to the next task if `--auto` is enabled
5. If unable to complete the task:
   - Document what was attempted and any blockers
   - Update task status to **Blocked** or **Pending Review**
   - If `--auto` is enabled, stop and request user feedback before proceeding

## Working with Implementation Guidance

The `<guidance>` blocks provide context and considerations, not prescriptive instructions:
- **Context**: Understanding of the problem domain
- **Key Considerations**: Trade-offs and options to evaluate
- **Risks**: What to watch out for
- **Questions to Resolve**: Decisions to make during implementation
- **Existing Patterns**: References to similar code in the codebase

You should:
- Read and understand the guidance before starting
- Make informed decisions based on what you discover during implementation
- Follow existing code patterns where referenced
- Resolve open questions using your best judgment
- Document significant decisions if they differ from what the guidance suggested

Context: $1
Implement task $2
$ARGUMENTS
