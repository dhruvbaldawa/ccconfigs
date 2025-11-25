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

Now I'll analyze the most important changed files to understand what was done.

Based on the files above, I'll prioritize by significance:
1. Manifest files (`.claude-plugin/`, `.mcp.json`)
2. Commands and skills (`.md` files in `commands/` and `skills/`)
3. Configuration files (`CLAUDE.md`, `settings.json`)
4. Scripts and supporting code

Let me read the key files and provide a comprehensive summary of what's been done.
