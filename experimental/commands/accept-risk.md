---
description: Add a finding to accepted risks for future reviews
argument-hint: [PROJECT] [FINDING DESCRIPTION]
---

# Accept Risk

Add a review finding to the project's accepted risks file so it won't block future reviews.

## Usage

```
/accept-risk <project> <finding description>
/accept-risk auth Missing tests for legacy endpoints
/accept-risk payments SQL-like syntax false positive in query builder
```

If project is omitted, will prompt to select from existing projects in `.plans/`.

## Your Task

Add an entry to `.plans/<project>/accepted-risks.md` based on: "${{ARGS}}"

### Step 1: Parse arguments

Extract project name and finding description from args.
- If first arg matches existing `.plans/<project>/` directory, use it as project
- Otherwise, list existing projects and ask user to specify
- Remaining args are the finding description

### Step 2: Gather details

Ask user for required information:

1. **Agent** (required): Which review agent found this?
   - `test-coverage-analyzer` - test gap finding
   - `error-handling-reviewer` - error handling issue
   - `security-reviewer` - security vulnerability

2. **Severity** (required): What was the severity?
   - For test-coverage: criticality 1-10 (map to HIGH if 7-8, MEDIUM if 5-6)
   - For error-handling: CRITICAL/HIGH/MEDIUM
   - For security: confidence 0-100 (map to HIGH if 70-89, MEDIUM if 50-69)
   - Note: CRITICAL findings cannot be accepted - must be fixed

3. **Pattern** (required): How should future findings be matched?
   - File pattern: `src/legacy/*.ts` (glob style)
   - Description pattern: text that appears in finding description
   - Location pattern: specific file:line reference

4. **Scope** (required): Where does this apply?
   - `project-wide` - applies everywhere
   - Specific paths: `src/legacy/`, `src/utils/query-builder.ts`

5. **Justification** (required): Why is this acceptable?
   - Must be a clear explanation
   - Examples: "Deprecated code being removed in Q2", "False positive - uses parameterized queries"

6. **Expires** (optional): When should this be re-evaluated?
   - Format: YYYY-MM-DD
   - Leave blank if no expiration

### Step 3: Create or update accepted-risks.md

Check if `.plans/<project>/accepted-risks.md` exists:
- If not, create from template at `experimental/skills/reviewing-code/reference/accepted-risks-template.md`

Determine next AR number:
- Find highest `### AR-NNN:` in file
- New number = highest + 1 (e.g., AR-004)

Add new entry before the `<!-- Add new entries above this line -->` marker:

```markdown
### AR-{NNN}: {Short description}

- **Agent**: {agent}
- **Severity**: {severity}
- **Pattern**: {pattern}
- **Scope**: {scope}
- **Justification**: {justification}
- **Accepted**: {today's date} (Task {current task number if in /implement-plan context, else "manual"})
{if expires}- **Expires**: {expires}{/if}

---
```

### Step 4: Report completion

```
✅ Risk accepted for <project>

AR-{NNN}: {short description}
Agent: {agent}
Severity: {severity}
Pattern: {pattern}

This finding will be filtered from future reviews.

File updated: .plans/<project>/accepted-risks.md
```

## Quick Mode

If user provides all details in one line (e.g., from a review rejection), parse directly:

```
/accept-risk auth error-handling-reviewer HIGH "empty catch block" src/events/ "fire-and-forget pattern is intentional"
```

Parses as:
- Project: auth
- Agent: error-handling-reviewer
- Severity: HIGH
- Pattern: "empty catch block"
- Scope: src/events/
- Justification: "fire-and-forget pattern is intentional"

## Validation Rules

- CRITICAL severity cannot be accepted - inform user and abort
- Pattern must be specific enough to avoid over-matching
- Justification must be provided (not empty)
- If project doesn't exist in `.plans/`, inform user

## Notes

- Accepted risks are checked during review phase (reviewing-code skill)
- Matched findings show as "Previously Accepted" and don't block approval
- Use `/implement-plan` review output to identify findings to accept
- Re-run `/accept-risk` with same pattern overwrites existing entry (updates justification/expiry)
