---
description: Attach a link (PR, doc, commit) to the linked Todoist task
---

Add a comment with a link to the currently linked Todoist task. Useful for tracking related pull requests, documentation, commits, or other assets.

**Usage:**
```bash
/attach <url> [description]
```

**Arguments:**
- `url` (required): URL to attach (PR, commit, doc, etc.)
- `description` (optional): Human-readable description of the link

**Examples:**
```bash
# Attach a PR
/attach https://github.com/user/repo/pull/123

# Attach a PR with description
/attach https://github.com/user/repo/pull/123 "Add user authentication"

# Attach a commit
/attach https://github.com/user/repo/commit/abc123 "Fix login bug"

# Attach documentation
/attach https://docs.example.com/feature-spec "Feature specification"
```

**What happens:**
- Adds a comment to the linked Todoist task with the URL and description
- Comment format: `🔗 [description]: url` or `🔗 url` if no description

**Requirements:**
- A task must be linked to this session (via `claude-todoist` wrapper or `/search`)
- If no task is linked, the command will fail with an error

**Implementation:**

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/attach-asset.sh" "$@"
```
