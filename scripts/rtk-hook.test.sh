#!/usr/bin/env bash
# ABOUTME: Tests for rtk-hook.sh using a stub `rtk` on PATH that echoes what it received, so passthrough is observable.
# ABOUTME: Run with `bash scripts/rtk-hook.test.sh`; exits non-zero on the first failed assertion.
set -u

here=$(cd "$(dirname "$0")" && pwd)
hook="$here/rtk-hook.sh"
stub_dir=$(mktemp -d)
trap 'rm -rf "$stub_dir"' EXIT

# The stub stands in for `rtk hook claude`: it tags its output with its args and
# echoes stdin, so a test can compare the wrapper's output to rtk's directly.
cat > "$stub_dir/rtk" <<'STUB'
#!/usr/bin/env bash
printf 'rtk[%s]:' "$*"
cat
STUB
chmod +x "$stub_dir/rtk"
export PATH="$stub_dir:$PATH"

fails=0
check() { # name, input, expected output
  local got
  got=$(printf '%s' "$2" | "$hook")
  if [[ "$got" == "$3" ]]; then
    echo "ok   $1"
  else
    echo "FAIL $1"; echo "  expected: $3"; echo "  got:      $got"; fails=$((fails + 1))
  fi
}
rtk_out() { printf '%s' "$1" | rtk hook claude; }

in_wt_git='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"git status"}}'
in_wt_git_ws='{"cwd":"/x/.claude/worktrees/a/sub","tool_input":{"command":"  git log --oneline"}}'
in_wt_bare_git='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"git"}}'
out_git='{"cwd":"/home/u/repo","tool_input":{"command":"git status"}}'
in_wt_ls='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"ls -la"}}'
in_wt_gitlike='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"gitk --all"}}'
in_wt_chained='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"cd sub && git status"}}'
not_worktrees='{"cwd":"/x/.claude/worktrees-old/a","tool_input":{"command":"git status"}}'
malformed='{"cwd": "/x/.claude/worktrees/a", "tool_input": {"command": "git st'

check "git in a worktree → {}"                      "$in_wt_git"      '{}'
check "git with leading space in a worktree → {}"   "$in_wt_git_ws"   '{}'
check "bare git in a worktree → {}"                 "$in_wt_bare_git" '{}'
check "git outside a worktree → rtk output"         "$out_git"        "$(rtk_out "$out_git")"
check "ls in a worktree → rtk output"               "$in_wt_ls"       "$(rtk_out "$in_wt_ls")"
check "gitk in a worktree is not git → rtk output"  "$in_wt_gitlike"  "$(rtk_out "$in_wt_gitlike")"
check "command not starting with git → rtk output"  "$in_wt_chained"  "$(rtk_out "$in_wt_chained")"
check "worktrees-old is not a worktree → rtk"       "$not_worktrees"  "$(rtk_out "$not_worktrees")"
check "malformed JSON → passed through to rtk"      "$malformed"      "$(rtk_out "$malformed")"

# the stub really ran with `hook claude`, not some other invocation
check "passthrough calls rtk hook claude"           "$out_git"        "rtk[hook claude]:$out_git"

if (( fails )); then echo "$fails failed"; exit 1; fi
echo "all passed"
