---
name: planning
description: Invoked by /plan-feature and /orchestrate. Creates .plans/ with risk-prioritized tasks. Skip for simple 1-2 file changes.
---

# Planning

## Process

1. Invoke technical-planning skill
2. Create `.plans/<project>/`:
   - `plan.md` - risk analysis, research findings, deferrals
   - `pending/*.md` - task files by iteration (reference research from plan.md)
   - `milestones.md` (if >10 tasks)
3. Report completion

### Research Findings Workflow

When you've validated approaches through research:
1. Document in plan.md § Research Findings (single source of truth)
2. Tasks reference the research instead of duplicating code/config
3. Benefits: No duplication, easier to update, clear decision rationale

## Execution Protocol

Follow this EXACT order when planning:

**Step 1: Create directory structure**

```bash
mkdir -p .plans/<project>/{pending,implementation,review,testing,completed}
```

**Step 2: Create plan.md FIRST**

This file MUST exist before creating any task files.

Use template: `experimental/templates/plan-single-milestone.md` or `plan-multi-milestone.md`

Required sections (outcome-based tracking):
- **Overview**: 1-2 sentence project description
- **Success Criteria**: Project-level outcomes (checkboxes) - when ALL checked, project complete
- **Milestones**: Major outcomes with completion status (✅/🔄/📋) and percentage
  - Each milestone has an **Outcome** statement (what's achieved, not how)
  - List expected deliverables as checkboxes under each milestone
  - Track milestone progress as deliverables complete
- **Risk Analysis**: Critical+Unknown (Foundation), Critical+Known (Integration), Non-Critical (Polish)
- **Architecture**: Key architectural decisions (updated as implementation progresses)
- **Task History**: Track completed, in-flight, and pending tasks
- **Next Planning Cycle**: Trigger and expected learnings before generating next batch
- **Deferred Items**: What's being deferred and when/why

**Two-Level Tracking:**
- **Strategic Level** (known upfront): Success criteria and milestone outcomes - stable, outcome-focused
- **Tactical Level** (just-in-time): Specific tasks to achieve milestones - emergent, implementation-focused

**Step 3: Create initial task files ONLY**

Following Last Responsible Moment principle:
- Generate tasks for **first 1-2 iterations only** (Foundation + early Integration)
- Do NOT plan entire project upfront - architecture will evolve as you learn
- Save to `.plans/<project>/pending/NNN-task-name.md`
- Use template: `experimental/templates/task.md`
- Each task file includes: Status, Dependencies, Description, Working Result, Validation, LLM Prompt

**Step 4: Document status tracking**

Add to plan.md:
```markdown
Status tracked via file location: pending/ → implementation/ → review/ → testing/ → completed/
```

Task files also have **Status:** field updated by implementation/review/testing skills.

**Step 5: Report completion**

Summary format:
```
Planning complete. Created .plans/<project-name>/.
Tasks: X total (Foundation: Y, Integration: Z)
Key risks: [List]
Next: /implement-plan <project-name>
```

## Iterative Planning Loop

After completing initial tasks, update plan based on learnings:

1. **Complete tasks** → learn about system architecture and constraints
2. **Update milestone progress** in plan.md:
   - Check off completed deliverables
   - Update milestone status (✅/🔄/📋) and percentage
   - Check success criteria as they're achieved
3. **Update plan.md** with design changes, new risks discovered, architectural decisions
4. **Update task history**: Move completed tasks to history, update in-flight status
5. **Generate next batch of tasks** in `pending/` based on updated understanding
6. **Update deferrals** as decisions get made or context changes
7. **Repeat** until all success criteria checked

Plan.md is a **living document** that tracks:
- **Outcome progress**: What's achieved (milestones, success criteria)
- **Architectural evolution**: How design changed as implementation progressed
- **Decision rationale**: Why choices were made or deferred

**VERIFICATION**: Before marking planning complete, confirm:
- [ ] plan.md exists with all required sections
- [ ] Success criteria defined (project-level outcomes)
- [ ] Milestones defined with outcome statements
- [ ] Task History section present
- [ ] Next Planning Cycle trigger documented
- [ ] Research Findings documented in plan.md (if applicable)
- [ ] Initial task files (1-2 iterations) created in pending/
- [ ] Tasks reference research findings and architecture from plan.md (not duplicating)
- [ ] Status tracking mechanism documented

## Task File Template

```markdown
# Task 001: Feature Name

**Iteration:** Foundation | Integration | Polish
**Status:** Pending
**Dependencies:** None (or 001, 002)
**Files:** src/file1.ts, tests/file1.test.ts

## Description
What needs to be built (2-3 sentences).

## Working Result
Concrete deliverable when complete.

## Validation
- [ ] Specific, testable check 1
- [ ] Specific, testable check 2
- [ ] All tests passing (no regressions)

## LLM Prompt
<prompt>
**Goal:** Enable users to authenticate securely via API endpoint

**Constraints:**
- Must integrate with existing session middleware
- Response time <100ms
- Rate limiting: 5 requests/min per IP
- Token expiry: 24h

**Implementation Guidance:**
- Review **src/middleware/auth.ts** for established patterns
- Consider session vs. token-based auth - choose based on existing architecture
- Error handling should cover: invalid credentials, rate limits, expired tokens
- Test coverage should include: valid login, invalid password, rate limiting behavior

**Validation:**
- Users can successfully authenticate via POST /api/login
- Invalid credentials return appropriate error
- Rate limiting prevents brute force attempts
- Run: `npm test`
</prompt>

## Notes

**planning:** [Context, patterns to follow, potential blockers]
```

### Example with Established Patterns (Prescriptive Mode)

Use this when you've validated an approach through research or have established codebase patterns:

```markdown
# Task 003: Add TypeScript ESLint Configuration

**Iteration:** Foundation
**Status:** Pending
**Dependencies:** None
**Files:** .eslintrc.js, tsconfig.json

## Description
Set up TypeScript ESLint with project-validated rules. Team has researched and agreed on specific ruleset.

## Working Result
ESLint runs on TypeScript files with agreed-upon rules, catches type errors during development.

## Validation
- [ ] `npm run lint` passes on existing TypeScript files
- [ ] VSCode shows inline ESLint errors
- [ ] Pre-commit hook runs ESLint successfully

## LLM Prompt
<prompt>
**Goal:** Configure TypeScript ESLint with team-validated ruleset

**Constraints:**
- Must work with existing tsconfig.json
- Should integrate with VSCode
- Pre-commit hooks must run in <5s

**Implementation Guidance:**
- Ensure compatibility with existing build pipeline
- Test on sample TypeScript file before committing

**Established Patterns**:
See plan.md § Research Findings > "TypeScript ESLint Configuration" for the complete validated setup.

Use the exact configuration documented there - it has been researched and team-approved. Do not modify without discussion.

**Validation:**
- Run `npm run lint` on existing codebase
- Verify VSCode shows inline errors
- Run: `npm test`
</prompt>

## Notes

**planning:** [Context, patterns to follow, potential blockers]
```

#### Corresponding plan.md Research Findings Entry

When using the reference pattern above, document the research in plan.md:

```markdown
## Research Findings

### TypeScript ESLint Configuration
**Decision**: Use @typescript-eslint with recommended-requiring-type-checking preset
**Research**: Evaluated ESLint, TSLint (deprecated), and rome. ESLint has best TypeScript support and active community.
**Validated Approach**:

1. Install dependencies:
```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

2. Create `.eslintrc.js`:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  },
};
```

3. Add to package.json:
```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx"
}
```

**References**:
- https://typescript-eslint.io/getting-started
- Internal: See src/config/eslint-base.js for shared rules
```

Now multiple tasks can reference this research without duplicating the configuration.

## Output

Report: `Planning complete. Created .plans/<project-name>/. Tasks: X total (Foundation: Y, Integration: Z, Polish: W)`
