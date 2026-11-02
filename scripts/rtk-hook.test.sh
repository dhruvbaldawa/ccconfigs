#!/usr/bin/env bash
# ABOUTME: Tests for rtk-hook.sh using a stub `rtk` on PATH that records exactly what it received and its exit code.
# ABOUTME: Run with `bash scripts/rtk-hook.test.sh`; prints each case and exits non-zero if any fails.
set -u

here=$(cd "$(dirname "$0")" && pwd)
hook="$here/rtk-hook.sh"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/bin" "$work/nojq" "$work/nortk"

# The stub stands in for `rtk hook claude`: it saves its stdin byte for byte,
# tags its output with its args, echoes stdin, and exits with $RTK_EXIT (default 0).
cat > "$work/bin/rtk" <<STUB
#!/usr/bin/env bash
cat > "$work/received"
printf 'rtk[%s]:' "\$*"
cat "$work/received"
exit "\${RTK_EXIT:-0}"
STUB
chmod +x "$work/bin/rtk"
export PATH="$work/bin:$PATH"

# Minimal PATHs for the missing-tool cases: nojq has the rtk stub but no jq,
# nortk has jq but no rtk.
for tool in bash cat; do
  p=$(command -v "$tool") && ln -sf "$p" "$work/nojq/$tool" && ln -sf "$p" "$work/nortk/$tool"
done
ln -sf "$work/bin/rtk" "$work/nojq/rtk"
ln -sf "$(command -v jq)" "$work/nortk/jq"

fails=0
pass() { echo "ok   $1"; }
fail() { echo "FAIL $1"; shift; printf '  %s\n' "$@"; fails=$((fails + 1)); }

# check NAME INPUT EXPECTED_STDOUT [EXPECTED_EXIT]
check() {
  local got code
  got=$(printf '%s' "$2" | "$hook"); code=$?
  if [[ "$got" == "$3" && "$code" == "${4:-0}" ]]; then pass "$1"
  else fail "$1" "expected: $3 (exit ${4:-0})" "got:      $got (exit $code)"; fi
}
rtk_out() { printf '%s' "$1" | rtk hook claude; }

in_wt_git='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"git status"}}'
in_wt_git_ws='{"cwd":"/x/.claude/worktrees/a/sub","tool_input":{"command":"  git log --oneline"}}'
in_wt_tab_before='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"\tgit status"}}'
in_wt_tab_after='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"git\tstatus"}}'
in_wt_bare_git='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"git"}}'
out_git='{"cwd":"/home/u/repo","tool_input":{"command":"git status"}}'
in_wt_ls='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"ls -la"}}'
in_wt_gitlike='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"gitk --all"}}'
in_wt_chained='{"cwd":"/x/.claude/worktrees/a","tool_input":{"command":"cd sub && git status"}}'
not_worktrees='{"cwd":"/x/.claude/worktrees-old/a","tool_input":{"command":"git status"}}'
malformed='{"cwd": "/x/.claude/worktrees/a", "tool_input": {"command": "git st'

check "git in a worktree → {}"                         "$in_wt_git"         '{}'
check "git with leading spaces in a worktree → {}"     "$in_wt_git_ws"      '{}'
check "tab before git in a worktree → {}"              "$in_wt_tab_before"  '{}'
check "tab after git in a worktree → {}"               "$in_wt_tab_after"   '{}'
check "bare git in a worktree → {}"                    "$in_wt_bare_git"    '{}'
check "git outside a worktree → rtk output"            "$out_git"           "$(rtk_out "$out_git")"
check "ls in a worktree → rtk output"                  "$in_wt_ls"          "$(rtk_out "$in_wt_ls")"
check "gitk in a worktree is not git → rtk output"     "$in_wt_gitlike"     "$(rtk_out "$in_wt_gitlike")"
check "git not leading the command → rtk output"       "$in_wt_chained"     "$(rtk_out "$in_wt_chained")"
check "worktrees-old is not a worktree → rtk"          "$not_worktrees"     "$(rtk_out "$not_worktrees")"
check "malformed JSON → passed through to rtk"         "$malformed"         "$(rtk_out "$malformed")"
check "passthrough calls rtk hook claude"              "$out_git"           "rtk[hook claude]:$out_git"

# rtk's exit code reaches Claude Code unchanged (exit 2 blocks the tool call).
RTK_EXIT=2 check "rtk's exit code propagates"          "$out_git"           "rtk[hook claude]:$out_git" 2

# Byte identity: an input ending in a newline reaches rtk with that newline.
printf '%s\n' "$out_git" > "$work/sent"
"$hook" < "$work/sent" > /dev/null
if cmp -s "$work/sent" "$work/received"; then pass "stdin reaches rtk byte for byte"
else fail "stdin reaches rtk byte for byte" "sent $(wc -c < "$work/sent") bytes, rtk got $(wc -c < "$work/received")"; fi

# Without jq the wrapper can't decide, so even worktree git falls through to rtk.
got=$(printf '%s' "$in_wt_git" | PATH="$work/nojq" "$hook"); code=$?
if [[ "$got" == "rtk[hook claude]:$in_wt_git" && $code == 0 ]]; then pass "missing jq → falls through to rtk"
else fail "missing jq → falls through to rtk" "got: $got (exit $code)"; fi

# Without rtk there is nothing to rewrite: {} and exit 0, never an error per Bash call.
got=$(printf '%s' "$out_git" | PATH="$work/nortk" "$hook"); code=$?
if [[ "$got" == '{}' && $code == 0 ]]; then pass "missing rtk → {} and exit 0"
else fail "missing rtk → {} and exit 0" "got: $got (exit $code)"; fi

if (( fails )); then echo "$fails failed"; exit 1; fi
echo "all passed"
