---
id: {{YYYYMMDD-NNN}}
date: {{ISO_DATE}}
task: {{NNN-task-name}}
trigger: {{stuck-resolution | review-rejection | explicit}}
category: {{debugging | architecture | tooling | integration | testing | performance | security}}
tags: [{{relevant}}, {{technology}}, {{keywords}}]
confidence: {{high | medium | low}}
---

# Problem: {{One-line problem statement}}

## Context

**What we were trying to do:**
{{Goal/feature being implemented}}

**What went wrong:**
{{Specific blocker, error, or issue}}

**Why it was hard:**
{{What made this non-obvious}}

## Solution

**What worked:**
{{Specific change/approach that resolved the issue}}

**Why it worked:**
{{Root cause explanation}}

**Key insight:**
{{Transferable lesson for future similar problems}}

## Prevention

**How to avoid this:**
{{Proactive steps - what to check first, patterns to follow}}

**Red flags to watch for:**
{{Warning signs - error messages, symptoms}}

## References

- Task: {{path to task file}}
- Commit: {{commit hash if available}}
- External: {{docs, resources that helped}}
