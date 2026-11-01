#!/usr/bin/env bash
# ABOUTME: PreToolUse hook wrapper around `rtk hook claude` that leaves git commands alone inside worktree sessions.
# ABOUTME: Prints {} (no rewrite) for git under */.claude/worktrees/*; all other input reaches rtk byte for byte.
set -u

# Keep trailing newlines: $(cat) alone would strip them before rtk sees the input.
input=$(cat; printf x)
input=${input%x}

# Without rtk there is nothing to rewrite; stay out of the way like the legacy hook.
command -v rtk >/dev/null 2>&1 || { printf '{}\n'; exit 0; }

# One jq call decides. Only the leading command is checked: `cd x && git …` or
# `VAR=1 git …` still reach rtk. Malformed JSON or a missing jq makes the test
# fail, so the input falls through to rtk, which decides what to do with it.
if printf '%s' "$input" | jq -e '
    ((.cwd // "") | contains("/.claude/worktrees/"))
    and ((.tool_input.command // "") | test("^\\s*git(\\s|$)"))' >/dev/null 2>&1; then
  printf '{}\n'
  exit 0
fi

printf '%s' "$input" | exec rtk hook claude
