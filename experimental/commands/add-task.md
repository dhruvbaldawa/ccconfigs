---
description: Add an ad-hoc task to an existing project plan
---

# Add Task

Add a single task to an existing project's pending queue without going through full planning process.

## Usage

```
/add-task <project> <task description>
/add-task Add error handling to API endpoints
```

If project is omitted, will prompt to select from existing projects in `.plans/`.

## Your Task

Create a new task file in `.plans/<project>/pending/` based on the description: "${{{ARGS}}}"

### Step 1: Parse arguments

Extract project name and task description from args.
- If project name included (first arg matches existing .plans/<project>/ directory), use it
- Otherwise, list existing projects and ask user to specify which one
- Remaining args are the task description

### Step 2: Determine task number

Look at existing tasks in the project (across all directories: pending/, implementation/, review/, testing/, completed/).
- Find highest task number (e.g., 005-name.md → number is 5)
- New task number = highest + 1 (e.g., 006)
- Format as 3 digits with leading zeros (e.g., "006")

### Step 3: Create task file

Generate filename: `{number}-{slugified-description}.md`
- Slugify: lowercase, replace spaces with hyphens, remove special chars
- Example: "Add error handling" → "006-add-error-handling.md"

Use template from `experimental/templates/task.md` with these defaults:
- **Iteration:** Ask user or default to "Integration"
- **Status:** Pending
- **Dependencies:** None (user can edit later)
- **Files:** Leave empty or ask user (optional)
- **Description:** Use the task description from args, expanded if needed
- **Working Result:** Generate based on description
- **Validation:** Generate 2-3 basic checkboxes from description
- **LLM Prompt:** Create outcome-focused prompt with placeholders for:
  - Goal (derived from description)
  - Constraints (placeholder: "Review existing patterns in relevant files")
  - Implementation Guidance (placeholder: "Consider similar implementations")
  - Validation (placeholder: "Run relevant tests")
- **Notes/planning-agent:** Placeholder for context

### Step 4: Save and report

Write file to `.plans/<project>/pending/{number}-{slug}.md`

Report completion:
```
✅ Task added to <project>

File: .plans/<project>/pending/{number}-{slug}.md
Iteration: {iteration}
Status: Pending

Next steps:
- Review and refine task details in the file
- Add dependencies if needed
- Run: /implement-plan <project>
```

## Interactive Mode

If insufficient information provided:
1. Ask for project if not specified
2. Ask for iteration type (Foundation/Integration/Polish) - suggest based on description
3. Optionally ask for dependencies
4. Optionally ask for key files affected

## Examples

### Simple task
```
User: /add-task auth Add rate limiting to login endpoint
Assistant: Creates 006-add-rate-limiting-to-login-endpoint.md in .plans/auth/pending/
```

### No project specified
```
User: /add-task Refactor error handling
Assistant: Lists existing projects:
  1. auth
  2. notifications
  3. payments
Which project? [User responds: auth]
Creates 007-refactor-error-handling.md in .plans/auth/pending/
```

### Task with details
```
User: /add-task payments Add Stripe webhook validation - Foundation iteration
Assistant: Creates 003-add-stripe-webhook-validation.md in .plans/payments/pending/
          with Iteration: Foundation
```

## Notes

- This is a utility for quick task creation - doesn't run exploration agents or risk analysis
- Tasks follow same format as `/plan-feature` but created individually
- User can manually edit task file after creation to add more context
- If no projects exist in `.plans/`, suggest running `/plan-feature` first
