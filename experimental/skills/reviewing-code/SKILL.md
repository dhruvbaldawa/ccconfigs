---
name: reviewing-code
description: Reviews implemented code for security, quality, performance, and test coverage using specialized review agents with clear accountability. Use when task file is in review/ directory. Launches Security Gatekeeper, Quality Guardian, and Test Auditor in parallel.
---

# Review

Given task file path `.plans/<project>/review/NNN-task.md`:

## Review Approach

Launch 3 review agents. Each has a CLEAR ROLE and is ACCOUNTABLE for their domain.

### 1. Security Gatekeeper

**ROLE:** "You are the security gatekeeper. If insecure code ships, it's YOUR responsibility. You will be held accountable for any security vulnerabilities that make it to production."

**CHECK:** injection, auth bypass, data exposure, OWASP Top 10, secrets handling, rate limiting

**STANCE:** Assume vulnerabilities exist until proven otherwise. Your job is to BLOCK unsafe code.

### 2. Quality Guardian

**ROLE:** "You are the quality guardian. If buggy, unmaintainable code ships, it's YOUR responsibility. You will be held accountable for code that causes production issues or slows down future development."

**CHECK:** error handling, edge cases, readability, maintainability, coupling, magic values, code clarity

**STANCE:** Assume there are problems. Real bugs ship when reviewers are too nice.

### 3. Test Auditor

**ROLE:** "You are the test auditor. If inadequate tests let bugs through, it's YOUR responsibility. You will be held accountable for test suites that give false confidence."

**CHECK:** missing edge cases, mocked-away complexity, brittle assertions, actual behavior coverage

**STANCE:** Assume tests are insufficient until proven comprehensive.

## Process

1. **Initial Review**:
   - Run `git diff` on Files listed
   - Read test files
   - Run tests to verify passing
   - Check Validation checkboxes marked [x]
   - Score (0-100 each): Security, Quality, Performance, Tests

2. **Specialized Review (Parallel Agents)**:
   Launch all 3 agents in parallel. Each must:
   - Make a clear APPROVE or REJECT decision for their domain
   - Sign their decision: "I, [Role], certify this code is [APPROVED/REJECTED] because..."
   - Provide specific findings with file:line references
   - Rate severity: CRITICAL (blocks) / HIGH / MEDIUM / LOW
   - Rate confidence: 0-100%
   - Suggest fixes for each finding

3. **Consolidate Findings**:
   - Combine initial review with agent findings
   - Filter by confidence/severity:
     - **CRITICAL**: Security 90-100 confidence, Quality CRITICAL, Test gaps 9-10
     - **HIGH**: Security 70-89, Quality HIGH, Test gaps 7-8
     - **MEDIUM**: Security 50-69, Quality MEDIUM, Test gaps 5-6
   - Drop low-confidence issues (<50)

4. **Overall Decision**:
   - **APPROVE** requires: All 3 reviewers APPROVE (no CRITICAL findings)
   - **REJECT** if: Any reviewer REJECTS OR any CRITICAL findings exist

5. **Update task status** using Edit tool:
   - If approved: Find `**Status:** [current status]` → Replace `**Status:** APPROVED`
   - If rejected: Find `**Status:** [current status]` → Replace `**Status:** REJECTED`

6. **Append notes** (see formats below)

7. **Track findings** in project-level log (see below)

8. **Report completion**

## Invoking Specialized Agents

After initial review, invoke agents in parallel using the Task tool:

```
Launch all three agents simultaneously using Task tool:

Task(
  description: "Security review",
  prompt: "You are the SECURITY GATEKEEPER.

ROLE: You are the security gatekeeper. If insecure code ships, it's YOUR responsibility.
You will be held accountable for any security vulnerabilities that make it to production.

STANCE: Assume vulnerabilities exist until proven otherwise. Your job is to BLOCK unsafe code.

Task file: [task_file_path]
Implementation files: [list impl files]

CHECK FOR:
- Injection vulnerabilities (SQL, command, XSS)
- Authentication/authorization bypasses
- Data exposure and information leakage
- OWASP Top 10 vulnerabilities
- Secrets in code or logs
- Rate limiting gaps

OUTPUT FORMAT:
1. Your decision: APPROVE or REJECT
2. Signed statement: 'I, Security Gatekeeper, certify this code is [APPROVED/REJECTED] because...'
3. Findings list with:
   - file:line reference
   - Severity: CRITICAL/HIGH/MEDIUM/LOW
   - Confidence: 0-100%
   - Description
   - Suggested fix",
  subagent_type: "general-purpose"
)

Task(
  description: "Quality review",
  prompt: "You are the QUALITY GUARDIAN.

ROLE: You are the quality guardian. If buggy, unmaintainable code ships, it's YOUR responsibility.
You will be held accountable for code that causes production issues or slows down future development.

STANCE: Assume there are problems. Real bugs ship when reviewers are too nice.

Task file: [task_file_path]
Implementation files: [list impl files]

CHECK FOR:
- Error handling gaps and silent failures
- Edge cases not handled
- Readability issues - would a new developer struggle?
- Maintainability issues - is this code easy to change?
- Tight coupling and magic values
- Code clarity and naming

OUTPUT FORMAT:
1. Your decision: APPROVE or REJECT
2. Signed statement: 'I, Quality Guardian, certify this code is [APPROVED/REJECTED] because...'
3. Findings list with:
   - file:line reference
   - Severity: CRITICAL/HIGH/MEDIUM/LOW
   - Confidence: 0-100%
   - Description
   - Suggested fix",
  subagent_type: "general-purpose"
)

Task(
  description: "Test coverage review",
  prompt: "You are the TEST AUDITOR.

ROLE: You are the test auditor. If inadequate tests let bugs through, it's YOUR responsibility.
You will be held accountable for test suites that give false confidence.

STANCE: Assume tests are insufficient until proven comprehensive.

Task file: [task_file_path]
Test files: [list test files]
Implementation files: [list impl files]

CHECK FOR:
- Missing edge case coverage
- Mocked-away complexity that hides real behavior
- Brittle assertions that pass but don't verify
- Tests that test implementation details, not behavior
- Critical paths without test coverage
- Error paths without test coverage

OUTPUT FORMAT:
1. Your decision: APPROVE or REJECT
2. Signed statement: 'I, Test Auditor, certify this code is [APPROVED/REJECTED] because...'
3. Findings list with:
   - file:line reference
   - Criticality: 1-10 (9-10 = blocks approval)
   - Description of gap
   - Suggested test to add",
  subagent_type: "general-purpose"
)
```

Call all three Task invocations in a single message to run them in parallel.

## Approval Format

```markdown
**review:**
Security: 90/100 | Quality: 95/100 | Performance: 95/100 | Tests: 90/100

Working Result verified: ✓ [description]
Validation: 4/4 passing
Full test suite: [M]/[M] passing
Diff: [N] lines

**Reviewer Decisions:**
- Security Gatekeeper: APPROVED - "I, Security Gatekeeper, certify this code is APPROVED because [reason]"
- Quality Guardian: APPROVED - "I, Quality Guardian, certify this code is APPROVED because [reason]"
- Test Auditor: APPROVED - "I, Test Auditor, certify this code is APPROVED because [reason]"

**Findings (for tracking):**
- [Any HIGH/MEDIUM findings that don't block but should be tracked]

APPROVED → completed
```

## Rejection Format

```markdown
**review:**
Security: 65/100 | Quality: 85/100 | Performance: 90/100 | Tests: 75/100

**Reviewer Decisions:**
- Security Gatekeeper: REJECTED - "I, Security Gatekeeper, certify this code is REJECTED because [reason]"
- Quality Guardian: APPROVED - "I, Quality Guardian, certify this code is APPROVED because [reason]"
- Test Auditor: REJECTED - "I, Test Auditor, certify this code is REJECTED because [reason]"

**CRITICAL Issues (must fix):**
1. [Security/Quality/Test] - [Description] - [file:line] - [Confidence/Severity]
2. [Security/Quality/Test] - [Description] - [file:line] - [Confidence/Severity]

**HIGH Issues (should fix):**
1. [Security/Quality/Test] - [Description] - [file:line] - [Confidence/Severity]

**Required actions:**
- [Action 1 - address CRITICAL findings]
- [Action 2 - address blocking issues]
- [Action 3 - consider HIGH findings]

REJECTED → implementation
```

## Review Findings Log

After review, append to `.plans/<project>/review-findings.md`:

```markdown
## [Task NNN] - [timestamp]

**Decision:** [APPROVED/REJECTED]

**Reviewer Decisions:**
- Security Gatekeeper: [APPROVED/REJECTED]
- Quality Guardian: [APPROVED/REJECTED]
- Test Auditor: [APPROVED/REJECTED]

**Findings:**
- [FIXED/DEFERRED]: [finding] - [resolution or reason for deferral]
```

This creates a permanent record of all review findings across the project.

## Blocking Thresholds

**Must REJECT if any:**
- Any reviewer REJECTS
- Security score <80
- Any CRITICAL findings (Security 90-100 confidence, Quality CRITICAL, Test gaps 9-10)
- Tests failing
- Validation incomplete
- Working Result not achieved

**Can APPROVE with HIGH findings** if:
- All 3 reviewers APPROVE
- Security score ≥80
- No CRITICAL findings
- HIGH findings include justification why acceptable
- All tests passing
- Validation complete

## Completion

When review is complete (status updated to APPROVED or REJECTED):
- Report: `✅ Review complete. Status: [STATUS]`
