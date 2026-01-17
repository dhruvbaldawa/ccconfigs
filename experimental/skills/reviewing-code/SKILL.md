---
name: reviewing-code
description: Reviews implemented code for security, quality, performance, and test coverage using specialized review agents with clear accountability. Use when task file is in review/ directory. Launches Security Gatekeeper, Quality Guardian, and Test Auditor in parallel.
---

# Review

Given task file path `.plans/<project>/review/NNN-task.md`:

## Review Agents

Launch 3 specialized agents in parallel (FULL review only):
- **Security Gatekeeper** (`security-reviewer`): OWASP Top 10, injection, auth, secrets
- **Quality Guardian** (`quality-guardian`): Error handling, edge cases, maintainability
- **Test Auditor** (`test-coverage-analyzer`): Coverage gaps, test quality, behavioral coverage

Each agent has full instructions in its agent file. They are accountable for their domain.

---

## Review Triage

**FIRST**, read `**implementation_metadata:**` from task file and determine review tier.

### FULL Review Triggers

Route to FULL review (all 3 agents) if ANY of these are true:

**Severity-based:**
- `severity_indicators` contains: auth, password, token, session, jwt, crypto, encrypt, secret, payment, billing, migration, permission, api_key

**Complexity-based:**
- `complexity_indicators` contains: state-machine, external-api, async-patterns, database-migration

**History-based:**
- `was_stuck: true`
- `research_agents_used` is not empty/none

**Quantitative (supporting):**
- `files_changed >= 10`
- `lines_changed >= 500`

### LIGHTWEIGHT Review Triggers

Route to LIGHTWEIGHT review (quick scan, no agents) if ALL of these are true:
- No severity_indicators present
- No complexity_indicators present
- `was_stuck: false`
- `research_agents_used: none`
- `files_changed < 10`
- `lines_changed < 500`

**Report triage decision:**
```
Review tier: [LIGHTWEIGHT | FULL]
Reason: [why this tier was selected]
```

---

## LIGHTWEIGHT Review Process

Quick validation without launching specialized agents. Faster but catches obvious issues.

0. **Load Critical Patterns (if exists):**
   - Check for `.plans/<project>/critical-patterns.md`
   - If exists, check implementation against ALL patterns
   - Any violation = CRITICAL finding → escalate to FULL review

1. **Baseline checks:**
   - Run `git diff` on Files listed
   - Run tests to verify passing
   - Check Validation checkboxes marked [x]
   - Score (0-100 each): Security, Quality, Performance, Tests

2. **Quick scan for obvious issues:**
   - Empty catch blocks: `catch \(.*\) \{\s*\}`
   - Hardcoded secrets: `password\s*=\s*["']`, `api_key\s*=\s*["']`, `secret\s*=\s*["']`
   - Console.log in production code (not in tests)
   - Missing error handling on critical paths (try without catch, Promise without .catch)
   - Magic numbers/strings without explanation in business logic

3. **Escalation check:**
   - If any HIGH or CRITICAL issues found → Escalate to FULL review
   - Report: `⚠️ Escalating to FULL review: [reason]`
   - Then proceed to FULL Review Process below

4. **LIGHTWEIGHT Approval/Rejection:**
   - If no HIGH/CRITICAL issues → APPROVE
   - Update status and append notes (see LIGHTWEIGHT formats below)
   - Report: `✅ Review complete (LIGHTWEIGHT). Status: [STATUS]`

### LIGHTWEIGHT Approval Format

```markdown
**review (LIGHTWEIGHT):**
Security: [N]/100 | Quality: [N]/100 | Performance: [N]/100 | Tests: [N]/100

Review tier: LIGHTWEIGHT
Reason: [No severity/complexity indicators, small scope]

Working Result verified: ✓ [description]
Validation: [N]/[N] passing
Full test suite: [M]/[M] passing
Diff: [N] lines

Quick scan: PASSED
- No empty catch blocks
- No hardcoded secrets
- No console.log in production code
- Error handling present

APPROVED → completed
```

### LIGHTWEIGHT Rejection Format (Escalates to FULL)

If LIGHTWEIGHT finds issues, it escalates to FULL review rather than rejecting directly.

---

## FULL Review Process

Launch all 3 specialized agents for comprehensive review. Use for security-sensitive, complex, or high-risk changes.

0. **Load Critical Patterns (if exists):**
   - Check for `.plans/<project>/critical-patterns.md`
   - If exists, verify implementation follows ALL patterns
   - Any violation = CRITICAL finding (blocks approval)
   - Include pattern violations in agent context for thorough review

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

After initial review, invoke all three agents in parallel using the Task tool.

**Required output format (all agents):**
- Decision: APPROVE or REJECT
- Signed: "I, [Role], certify this code is [APPROVED/REJECTED] because..."
- Findings: file:line, Severity/Criticality, Confidence, Description, Fix

```
Task(
  description: "Security review",
  prompt: "Task file: [path] | Files: [list] | Use standard output format.",
  subagent_type: "experimental:review:security-reviewer"
)

Task(
  description: "Quality review",
  prompt: "Task file: [path] | Files: [list] | Use standard output format.",
  subagent_type: "experimental:review:quality-guardian"
)

Task(
  description: "Test coverage review",
  prompt: "Task file: [path] | Test files: [list] | Impl files: [list] | Use standard output format.",
  subagent_type: "experimental:review:test-coverage-analyzer"
)
```

Call all three Task invocations in a single message to run them in parallel.

### FULL Approval Format

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

### FULL Rejection Format

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
- LIGHTWEIGHT: Report `✅ Review complete (LIGHTWEIGHT). Status: [STATUS]`
- FULL: Report `✅ Review complete (FULL). Status: [STATUS]`
