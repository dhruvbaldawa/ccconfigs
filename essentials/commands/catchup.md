---
model: haiku
description: "Review all changes between current branch and main"
allowed-tools: Bash(git:*), Read
---

# Catch Up on Branch Changes

Analyzing this branch vs main...

## Branch Info

Current branch: `git rev-parse --abbrev-ref HEAD`

!`git fetch origin main 2>/dev/null; echo "Commits ahead of main:" && git log main..HEAD --oneline | wc -l && echo "" && echo "Files changed:" && git diff main...HEAD --name-only | wc -l`

## All Changed Files

!`git diff main...HEAD --name-only | sort`

## Change Summary

!`git diff main...HEAD --stat`

## Recent Commits

!`git log main..HEAD --oneline`

---

## Analysis

Read the key files that were changed (prioritize manifest files, commands, skills, and config), understand the changes, and provide a concise summary including:

- What was built or changed (purpose and scope)
- Why it matters (new capabilities, workflow improvements, config changes)
- Key impact areas and potential testing focus
- Any breaking changes or architectural shifts
