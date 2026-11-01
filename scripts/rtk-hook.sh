#!/usr/bin/env bash
# ABOUTME: PreToolUse hook wrapper around `rtk hook claude` that leaves git commands alone inside worktree sessions.
# ABOUTME: Prints {} (no rewrite) for git under */.claude/worktrees/*; everything else, malformed input included, goes to rtk unchanged.
set -u

input=$(cat)

# jq failing (malformed JSON, missing fields) leaves both empty, so the input
# falls through to rtk, which decides what to do with it.
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null || true)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || true)

if [[ "$cwd" == */.claude/worktrees/* && "$command" =~ ^[[:space:]]*git([[:space:]]|$) ]]; then
  printf '{}\n'
  exit 0
fi

printf '%s' "$input" | exec rtk hook claude
