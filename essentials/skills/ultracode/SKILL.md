---
name: ultracode
description: Run the agreed slice workflow end-to-end with subagents — implement each slice with sonnet, review at slice boundaries with senior-engineer-reviewer and test-reviewer in parallel, fix until both approve, commit per the commit plan. Use when the user says "ultracode" or hands over a plan for autonomous execution.
argument-hint: <plan file or task> [notes]
---

# Ultracode

Execute the plan in $ARGUMENTS slice by slice with subagents. You orchestrate; subagents
implement, review, and fix. Author the workflow dynamically to fit the task — this file is
the contract, not the mechanics.

## Workspace

Create `.ultracode/<task-slug>/` in the project (add `.ultracode/` to `.git/info/exclude`).

- `context.md` is the shared memory. Seed it with the plan (or a pointer to it), base
  branch + SHA, and decisions already made. Every subagent reads it first and appends its
  outcome last — decisions, interfaces, gotchas, progress. Append, never rewrite others'
  entries.
- Subagents may drop extra working files in the directory when useful.
- Resume: read context.md and the git log, continue from the first unfinished slice.

## The loop

A slice ≈ 2-3 atomic commits from the plan. Default: one slice after another, in plan order.

1. **IMPLEMENT** — sonnet subagent: the slice's commits + tests per plan. No commits yet.
2. **REVIEW** — `essentials:senior-engineer-reviewer` and `essentials:test-reviewer` in
   parallel (one message) on the uncommitted diff. Approved = senior says SHIP IT or
   APPROVED WITH RESERVATIONS, and test says ACTUALLY GOOD or ACCEPTABLE. Anything else,
   including an unparseable verdict, is a rejection.
3. **FIX** — sonnet subagent addresses the findings; re-review. Iterate until both approve.
   After 3 rejected rounds: stop, record the unresolved findings in context.md, move on to
   the next independent slice, flag it in your report.
4. **COMMIT** — the slice's atomic commits exactly per the commit plan (`git status` before
   staging; planned messages verbatim).

Parallelize slices only when clearly independent (different files, no shared interfaces);
otherwise sequential. Any external repo you touch: work in a fresh `git worktree` of that
repo, never its main checkout.

## Subagent standards (include in every subagent prompt)

> Read <workspace>/context.md first; append your outcome when done.
> Verify before done: run the tests and exercise the change once end-to-end; paste the real
> command and output. "Should work" is not done.
> Report only what a tool result backs. Failures are reported as failures, with the output.
> Do exactly the planned scope. Adjacent problems: note them in context.md, don't fix them.
> Read every file you change (and its callers) before editing. After 3 failed attempts at
> one problem, stop and write up what you tried.

## Report

Slices completed with commit SHAs, anything blocked with its unresolved findings, what you
verified. Outcome first, complete sentences.
