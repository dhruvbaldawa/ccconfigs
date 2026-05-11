---
model: claude-haiku-4-5
allowed-tools: Bash(git:*)
argument-hint: "[optional: description or specific files]"
description: "Smart commit workflow - adapts to change size"
---

# Commit Assistant

Quick overview of changes:

!`git status --short && echo "" && echo "=== STATS ===" && git diff HEAD --numstat`

## Analysis Strategy

I will analyze changes intelligently based on scope:

**1. Small changesets** (<10 files, <500 lines):
- Show full diffs with `git diff HEAD -- <files>`
- Review all files in detail
- Single atomic commit

**2. Medium changesets** (10-50 files, 500-1500 lines):
- Show summary of all files
- Detailed diffs for source code only (`src/`, `lib/`, etc)
- Suggest atomic groupings for 1-2 commits

**3. Large changesets** (>50 files or >1500 lines):
- Show file list grouped by type
- Ask which specific files to review in detail
- Suggest commit strategy by file grouping

### Automatic Exclusions

Files skipped from detailed review:
- **Lockfiles**: `*lock*`, `*lock.json`, `*.lock` (dependency updates)
- **Generated**: `dist/`, `build/`, `.next/`, `out/` (build artifacts)
- **Large changes**: >500 lines modified (likely auto-generated)
- **Binary/compiled**: `*.min.js`, `*.map`, images, `.wasm`

These are mentioned in stats but not reviewed line-by-line.

## Commit Message Format

```
<type>(<scope>): <description>

[Optional body: explain what and why]
```

**Types**: `feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `style` | `perf` | `ci`

**Rules**:
- Imperative mood ("add" not "added")
- ~50 character subject line
- No period at end of subject
- Body lines wrapped at 72 characters
- Blank line between subject and body
- Body explains *what* and *why*, not *how*

## Examples

```
feat(auth): add JWT token refresh mechanism

Refresh tokens now expire after 7 days instead of never expiring.
Reduces security risk for long-lived tokens. Implements automatic
refresh logic when token is within 1 hour of expiration.

fix(api): handle missing Content-Type header gracefully

Previously crashed with 500 if Content-Type missing. Now defaults
to application/json and validates structure separately.
```

## Your Task

Commit message context: "${{{ARGS}}}"

### Step 1: Analyze Changes

${changeSize === 'large' ? `
- Run: \`git diff HEAD --numstat | head -50\`
- Group files by type (source vs config vs tests vs docs)
- Report file counts and total size
` : `
- Examine full diffs for all files
- Identify logical groupings
- Flag any unexpected changes
`}

### Step 2: Plan Commits

**If single logical change:**
- Create one commit with all files
- Clear message describing the change

**If multiple logical groupings:**
- Suggest 2-3 atomic commits
- Each commit should pass tests independently
- Group related changes together (e.g., feature + tests, not feature + unrelated refactor)

**Staging approach:**
- For single commit: \`git add .\` (if clean working directory)
- For selective: \`git add <files>\` for each atomic grouping
- For partial files: \`git add -p\` for manual hunk selection

### Step 3: Verify

Before committing:
- \`git diff --staged\` - review what will be committed
- \`git status\` - confirm all intended files are staged
- Consider: does each commit pass tests? can it be reverted cleanly?

### Step 4: Commit

Craft clear commit message with context provided above. Use the format guidelines.

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

[body explaining what and why]
EOF
)"
```

Then push or continue with additional commits.

## Context

The user mentioned: "${{{ARGS}}}"

Is there a specific aspect of the changes you'd like help with (staging strategy, message clarity, commit grouping)?
