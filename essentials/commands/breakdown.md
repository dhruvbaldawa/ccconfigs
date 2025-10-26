---
argument-hint: [SPEC DOCUMENT]
description: Create a task breakdown from a design document
---
Document: $1

You are my project-planning assistant.
Given a high-level feature or milestone description in the above document, produce an **agile task breakdown** in the following strict Markdown format, and update the above document.

For every task you generate, include:
1. **Iteration header** – `### 🔄 **Iteration <n>: <Theme>**`
2. **Task header** – `#### Task <n>: <Concise Task Name>`
3. **Status** – always start as `Status: **Pending**`
4. **Goal** – 1-2 sentences describing the purpose
5. **Working Result** – what is concretely “done” at the end of the task (code that runs, command that passes, etc.)
6. **Validation** – a checklist (`- [ ]`) of objective pass/fail checks (tests, scripts, CI runs, manual verifications)
7. **LLM Prompt** – a fenced <prompt></prompt> block with step-by-step instructions detailed enough for a coding LLM to implement the task in one shot
8. Separate tasks and iterations with `---`

Constraints & conventions:
- Each task must be a single atomic unit of work that results in running, testable code.
- Favor incremental progress over perfection; every task should leave the repo in a working state.
- Validation should prefer automated tests/scripts but may include human review items.
- Use present-tense, imperative verbs for prompt steps (e.g., “Create…”, “Add…”, “Run…”).
- Use **bold** for filenames, routes, commands, etc. inside prompts to improve readability.
- Keep the entire answer pure Markdown; do not embed explanatory prose outside of the required structure.
- You may run into output token limits, so write one iteration at a time in the document, then add another one
