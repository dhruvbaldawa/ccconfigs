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
  outcome last — decisions, interfaces, gotchas, progress, verification evidence. Append,
  never rewrite others' entries.
- Subagents may drop extra working files in the directory when useful.
- Resume: read context.md and the git log, continue from the first unfinished slice.

## The loop

A slice ≈ 2-3 atomic commits from the plan. Default: one slice after another, in plan order.

Before the first slice: record your chosen mechanics at the top of context.md (see "Tune
the loop"), and set the stop condition with /goal — ask the user to set it if you cannot:
`/goal every slice committed with both reviewers approving; stop after the agreed rounds cap`.

1. **IMPLEMENT** — sonnet subagent: the slice's commits + tests per plan; verification
   evidence (command + output tail) goes into context.md. No commits yet.
2. **REVIEW** — `essentials:senior-engineer-reviewer` and `essentials:test-reviewer` in
   parallel (one message) on the uncommitted diff plus the recorded evidence. Rerun a check
   only with a specific reason to distrust it, or to cover what the implementer didn't —
   never the full suite by default. Approved = senior says SHIP IT or APPROVED WITH
   RESERVATIONS, and test says ACTUALLY GOOD or ACCEPTABLE. Anything else, including an
   unparseable verdict, is a rejection.
3. **FIX** — sonnet subagent addresses the findings, rerunning only the failing or affected
   checks; re-review. Iterate until both approve. At the rounds cap: stop, record the
   unresolved findings in context.md, move on to the next independent slice, flag it in
   your report.
4. **COMMIT** — the slice's atomic commits exactly per the commit plan (`git status` before
   staging; planned messages verbatim). If fix rounds happened, run the full relevant suite
   once first.

Parallelize slices only when clearly independent (different files, no shared interfaces);
otherwise sequential. Any external repo you touch: work in a fresh `git worktree` of that
repo, never its main checkout.

## Tune the loop

Pick the lightest mechanics the risk allows; record the choices at the top of context.md so
every subagent follows the same rules for the whole run.

- **Review cadence**: slice boundary by default; every commit for risky work (auth,
  migrations, concurrency, data-loss paths); batch 2-3 mechanical slices (renames, config,
  docs) into one review.
- **Reviewers**: both by default; senior only for slices with no test or behavior changes;
  skip the gate only if the user says so.
- **Verification depth**: match the surface — UI: drive it in a browser once; API: one real
  request; library/CLI: tests are enough. Verify once per stage and share the evidence;
  never re-derive what context.md already proves.
- **Rounds cap**: 3 by default; 1 for trivial slices; raise it only when the user flags a
  slice as high-risk.

## Subagent standards (include in every subagent prompt)

> Read <workspace>/context.md first; append your outcome when done.
> Verify before done: run your stage's checks — implementers also exercise the change once
> end-to-end — and paste the real command and output into context.md. "Should work" is not
> done. Don't rerun checks context.md already proves.
> Report only what a tool result backs. Failures are reported as failures, with the output.
> Do exactly the planned scope. Adjacent problems: note them in context.md, don't fix them.
> Read every file you change (and its callers) before editing. After 3 failed attempts at
> one problem, stop and write up what you tried.

## Report

Slices completed with commit SHAs, anything blocked with its unresolved findings, what you
verified. Outcome first, complete sentences.
