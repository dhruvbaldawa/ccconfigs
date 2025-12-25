---
name: reviewing-code
description: Reviews implemented code for security, quality, performance, and test coverage using specialized review agents. Use when task file is in review/ directory and requires comprehensive code review before approval. Launches test-coverage-analyzer, error-handling-reviewer, and security-reviewer in parallel.
---

# Review

Given task file path `.plans/<project>/review/NNN-task.md`:

## Process

1. **Initial Review**:
   - Run `git diff` on Files listed
   - Read test files
   - Run tests to verify passing
   - Check Validation checkboxes marked [x]
   - Score (0-100 each): Security, Quality, Performance, Tests

2. **Specialized Review (Parallel Agents)**:
   Launch 3 review agents in parallel for deep analysis:
   - **test-coverage-analyzer**: Identifies critical test gaps (1-10 criticality ratings)
   - **error-handling-reviewer**: Finds silent failures and poor error handling (CRITICAL/HIGH/MEDIUM severity)
   - **security-reviewer**: Checks for OWASP Top 10 vulnerabilities (0-100 confidence scores)

   Agents run in separate contexts and return scored findings.

3. **Consolidate Findings**:
   - Combine initial review with agent findings
   - Filter by confidence/severity:
     - **CRITICAL**: Security 90-100 confidence, Error handling CRITICAL, Test gaps 9-10
     - **HIGH**: Security 70-89, Error handling HIGH, Test gaps 7-8
     - **MEDIUM**: Security 50-69, Error handling MEDIUM, Test gaps 5-6
   - Drop low-confidence issues (<50)
   - Prioritize by severity

4. **Decide** - APPROVE or REJECT:
   - APPROVE: Security ≥80, no CRITICAL findings from agents
   - REJECT: Security <80 OR any CRITICAL findings
   - HIGH findings acceptable with justification

5. **Update task status** using Edit tool:
   - If approved: Find `**Status:** [current status]` → Replace `**Status:** APPROVED`
   - If rejected: Find `**Status:** [current status]` → Replace `**Status:** REJECTED`

6. **Append notes** (see formats below) - include agent findings
7. **Report completion**

## Review Focus

| Area | Check |
|------|-------|
| **Security** | Input validation, auth checks, secrets in env, rate limiting, SQL parameterized |
| **Quality** | Readable, no duplication, error handling, follows patterns, diff <500 lines |
| **Performance** | No N+1 queries, efficient algorithms, proper indexing |
| **Tests** | Covers Validation, behavior-focused, edge cases, error paths, suite passing |

## Invoking Specialized Agents

After initial review, invoke agents in parallel using the Task tool with `subagent_type="general-purpose"`:

```
Launch all three agents simultaneously using Task tool:

Task(
  description: "Analyze test coverage",
  prompt: "You are test-coverage-analyzer. Analyze test coverage for:
    Task file: [task_file_path]
    Test files: [list test files]
    Implementation files: [list impl files]
    [Include full agent prompt from experimental/agents/review/test-coverage-analyzer.md]",
  subagent_type: "general-purpose"
)

Task(
  description: "Review error handling",
  prompt: "You are error-handling-reviewer. Review error handling in:
    Task file: [task_file_path]
    Implementation files: [list impl files]
    [Include full agent prompt from experimental/agents/review/error-handling-reviewer.md]",
  subagent_type: "general-purpose"
)

Task(
  description: "Security review",
  prompt: "You are security-reviewer. Review security in:
    Task file: [task_file_path]
    Implementation files: [list impl files]
    [Include full agent prompt from experimental/agents/review/security-reviewer.md]",
  subagent_type: "general-purpose"
)
```

Call all three Task invocations in a single message to run them in parallel.

Each agent returns:
- **test-coverage-analyzer**: List of test gaps with 1-10 criticality scores
- **error-handling-reviewer**: List of error handling issues with CRITICAL/HIGH/MEDIUM severity
- **security-reviewer**: List of vulnerabilities with 0-100 confidence scores and OWASP categories

Consolidate findings using the confidence/severity mappings from Process step 3.

## Approval Format

```markdown
**review:**
Security: 90/100 | Quality: 95/100 | Performance: 95/100 | Tests: 90/100

Working Result verified: ✓ [description]
Validation: 4/4 passing
Full test suite: [M]/[M] passing
Diff: [N] lines

**Specialized Review Findings:**
- Test Coverage: No CRITICAL gaps (0 gaps rated 9-10)
- Error Handling: 1 HIGH finding - [description with justification why acceptable]
- Security: No vulnerabilities detected (0 findings >70 confidence)

APPROVED → testing
```

## Rejection Format

```markdown
**review:**
Security: 65/100 | Quality: 85/100 | Performance: 90/100 | Tests: 75/100

**Specialized Review Findings:**

CRITICAL Issues (must fix):
1. [Security/Test/Error] - [Description from agent] - [Confidence/Severity/Criticality score]
2. [Security/Test/Error] - [Description from agent] - [Confidence/Severity/Criticality score]

HIGH Issues (review recommended):
1. [Security/Test/Error] - [Description from agent] - [Confidence/Severity/Criticality score]

REJECTED - Blocking issues:
1. [Specific issue + fix needed]
2. [Specific issue + fix needed]

Required actions:
- [Action 1 - address CRITICAL findings]
- [Action 2 - address blocking issues]
- [Action 3 - consider HIGH findings]

REJECTED → implementation
```

## Blocking Thresholds

**Must REJECT if any:**
- Security score <80
- Critical vulnerability from initial review
- Any CRITICAL findings from specialized agents (Security 90-100 confidence, Error handling CRITICAL, Test gaps 9-10)
- Tests failing
- Validation incomplete
- Working Result not achieved

**Can APPROVE with HIGH findings** if:
- Security score ≥80
- No CRITICAL findings
- HIGH findings include justification why acceptable
- All tests passing
- Validation complete

## Completion

When review is complete (status updated to APPROVED or REJECTED):
- Report: `✅ Review complete. Status: [STATUS]`
