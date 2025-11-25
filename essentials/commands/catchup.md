---
model: haiku
description: "Review all changes between current branch and main"
allowed-tools: Bash(git:*), Read
---

# Catch Up on Branch Changes

Comprehensive overview of what's been done on this branch vs main.

## Current Branch Status

!`git rev-parse --abbrev-ref HEAD`

!`git fetch origin main 2>/dev/null; echo "=== COMMITS ===" && git log main..HEAD --oneline && echo "" && echo "=== CHANGED FILES ===" && git diff main...HEAD --name-only && echo "" && echo "=== STATS ===" && git diff main...HEAD --stat | tail -1`

## Analysis Steps

### Step 1: Verify Branch Context

- Confirm current branch is not main
- Check if branch tracks remote (has upstream)
- Count commits since divergence from main

### Step 2: Categorize Changed Files

Group files by type and significance:

**High Priority** (manifests, configs, critical paths):
- Plugin metadata: `*.json` in `.claude-plugin/`, `plugin.json`
- Core commands: `commands/*.md`
- Core skills: `skills/*/SKILL.md`
- Configuration: `.mcp.json`, `settings.json`, `CLAUDE.md`

**Source Changes** (implementation):
- Command implementations: `commands/**/*.md`
- Skill implementations: `skills/**/*.md`
- Scripts: `scripts/*.ts`, `scripts/*.js`

**Supporting** (docs, examples, references):
- Documentation: `README.md`, `*.md` in `reference/`
- Examples: `reference/**/*.md`
- Tests: `*.test.*`, `__tests__/**`

**Maintenance** (lockfiles, generated):
- Dependencies: `*lock*`, `package.json`
- Build: `dist/`, `build/`, `.next/`

### Step 3: Analyze Key Files

Read and understand the most important changed files:

1. **If manifest changes** - Understand new plugins or features being registered
2. **If command changes** - Review the command purpose and implementation guidance
3. **If skill changes** - Understand the methodology or workflow being added/modified
4. **If config changes** - See what settings or integrations were updated

### Step 4: Identify Impact & Patterns

Look for:
- **New capabilities** - What features or workflows are being added?
- **Architecture changes** - Are we reorganizing how things work?
- **Integration points** - New dependencies, MCP servers, or external tools?
- **Breaking changes** - Anything that could affect existing workflows?
- **Patterns** - Consistency with repository conventions?

### Step 5: Provide Comprehensive Summary

Structure summary as:

```
## Branch Overview

**Purpose**: [What this branch accomplishes]

**Scope**: [Number] commits, [Number] files changed

## Key Changes

**[Category]**: [What was changed and why]
- File: [path] - [significance]
- File: [path] - [significance]

## Impact Analysis

**New Capabilities**:
- [What users can now do]

**Modified Workflows**:
- [How existing workflows change]

**Integration Changes**:
- [New tools, MCP servers, or dependencies]

## Suggested Review Focus

1. [First priority item with reasoning]
2. [Second priority item with reasoning]
3. [Third priority item with reasoning]

## Related Commits

[List of important commits with messages]
```

## Implementation

1. Show current branch verification
2. Display commit log and changed files
3. Categorize files by type
4. Read 2-3 most important changed files
5. Synthesize findings into comprehensive summary
6. Highlight review focus areas and potential impacts

Use this to understand: What was built? Why? What should I test? What integrations exist?
