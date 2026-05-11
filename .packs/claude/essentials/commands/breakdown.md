---
argument-hint: [SPEC DOCUMENT]
description: Create a task breakdown from a design document
---
Document: $1

You are my project-planning assistant.
Given a high-level feature or milestone description in the above document, produce an **agile task breakdown** following the **Last Responsible Moment** principle. Update the above document with this breakdown.

## Last Responsible Moment Principle

**Defer decisions until you have enough information, but not so late that it blocks progress.**

Tasks should provide:
- **Clear outcomes**: What needs to be achieved
- **Constraints**: Known requirements and limitations
- **Dependencies**: What this task relies on
- **Guidance**: Enough context to understand the problem

Tasks should NOT specify:
- **Implementation details**: Specific functions, classes, or algorithms (unless critical)
- **Step-by-step instructions**: How to write the code
- **Premature optimization**: Performance tuning before validating approach
- **Tool choices**: Specific libraries or patterns (unless required by existing architecture)

**Why**: Implementation details become clearer as you work. Early decisions lock you into approaches that may not fit the reality you discover during development.

## Task Format

For every task you generate, include:

1. **Iteration header** – `### 🔄 **Iteration <n>: <Theme>**`
2. **Task header** – `#### Task <n>: <Concise Task Name>`
3. **Status** – always start as `Status: **Pending**`
4. **Goal** – 1-2 sentences describing the purpose and outcome
5. **Working Result** – what is concretely "done" at the end (working code, passing test, validated integration)
6. **Constraints** – technical limitations, performance requirements, compatibility needs, existing patterns to follow
7. **Dependencies** – what this task assumes exists or depends on
8. **Implementation Guidance** – a fenced <guidance></guidance> block with:
   - Context about the problem domain
   - Key considerations and trade-offs
   - Risks to watch for
   - Questions to resolve during implementation
   - Reference to relevant existing code patterns (if applicable)

   **NOT**: step-by-step instructions or specific implementation choices

9. **Validation** – a checklist (`- [ ]`) of objective pass/fail checks (tests, scripts, CI runs, manual verifications)
10. Separate tasks and iterations with `---`

## Example Task Structure

```markdown
#### Task 3: User Authentication

Status: **Pending**

**Goal**: Enable users to securely authenticate and maintain sessions across requests.

**Working Result**: Users can log in, their session persists, and protected routes verify authentication.

**Constraints**:
- Must integrate with existing Express middleware pattern (see src/middleware/)
- Session data should not exceed 4KB
- Authentication must work with existing PostgreSQL user table

**Dependencies**:
- User registration system (Task 2)
- Database connection pool configured

<guidance>
**Context**: The application uses session-based auth (not JWT) following the pattern in src/middleware/. Refer to existing middleware for consistency.

**Key Considerations**:
- Session storage: Choose between in-memory (simple, dev-only) vs. Redis (production). Decision can be deferred until Task 8 (deployment planning)
- Password hashing: Use established library (bcrypt/argon2), but specific choice depends on performance testing in Task 7
- Session duration: Start with reasonable default (24h), tune based on user feedback

**Risks**:
- Session fixation vulnerabilities
- Timing attacks on password comparison
- CSRF if not using proper token validation

**Questions to Resolve**:
- Should "remember me" functionality be included in this task or deferred?
- What's the session renewal strategy?

**Existing Patterns**: Review src/middleware/requestLogger.js for middleware structure.
</guidance>

**Validation**:
- [ ] Users can log in with valid credentials
- [ ] Invalid credentials are rejected
- [ ] Sessions persist across page reloads
- [ ] Protected routes redirect unauthenticated users
- [ ] Tests cover authentication success and failure cases
- [ ] No timing vulnerabilities in password comparison
```

## Constraints & Conventions

- Each task must be a single atomic unit of work that results in running, testable code
- Favor incremental progress over perfection; every task should leave the repo in a working state
- Validation should prefer automated tests/scripts but may include human review items
- Use **bold** for filenames, routes, commands, entities to improve readability
- Keep the entire answer pure Markdown; do not embed explanatory prose outside of the required structure
- You may run into output token limits, so write one iteration at a time in the document, then add another one
- Focus on **what** needs to be achieved and **why**, not **how** to implement it
- When you must be specific (e.g., "use existing auth middleware pattern"), provide context about where to find examples
- Encourage learning and discovery during implementation rather than prescribing all decisions upfront
