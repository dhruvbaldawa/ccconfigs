---
name: conveyor
description: Slice execution loop with subagents — sonnet implements, senior-engineer-reviewer + test-reviewer gate each slice, fix until both approve, commit per the commit plan. Use when the user says "conveyor" or hands over a plan for autonomous execution.
argument-hint: <plan file or task> [notes]
---

# Conveyor

Execute $ARGUMENTS slice by slice. You orchestrate; subagents implement, review, fix.
Author the workflow to fit the task — this file is the contract, not the mechanics.
This skill explicitly authorizes the Workflow tool: use it for fan-out (parallel
reviews, independent slices), authoring the script per task.

## Workspace

`.conveyor/<task-slug>/` in the project (add `.conveyor/` to `.git/info/exclude`).

- `context.md` = shared memory. Seed: plan (or pointer), base branch + SHA, decisions,
  chosen loop mechanics, and **checks** — the executable commands that define green for
  this repo (tests, lint, typecheck, build), taken from the plan's validation criteria.
  Every subagent reads it first, appends its outcome last. Append-only.
- Subagents may add working files beside it.
- Resume: context.md + git log → continue from the first unfinished slice.

## The loop

Slice ≈ 2-3 atomic commits, in plan order. Before the first slice: record mechanics in
context.md, then set `/goal every slice committed with declared checks green and both
reviewers approving; stop after the agreed rounds cap` — ask the user to set it if you can't.

**Testing floor — never below it; above is always fine**: declared checks in full at
IMPLEMENT, after every FIX, and green before COMMIT.

1. **IMPLEMENT** (sonnet): the slice's commits + tests per plan; run the declared checks,
   exercise the change end-to-end, evidence (command + output tail) → context.md. No
   commits yet.
2. **REVIEW**: `essentials:senior-engineer-reviewer` ∥ `essentials:test-reviewer` (one
   message) on the uncommitted diff + evidence. First review of a slice is full-depth —
   reviewers judge the diff against the whole repo. Re-reviews are delta-only per the
   carryover rule. They rerun anything they doubt and cover what wasn't run.
   Approved = senior: SHIP IT / APPROVED WITH RESERVATIONS; test: ACTUALLY GOOD /
   ACCEPTABLE. Anything else, or unparseable, = rejection. Reservations and other
   non-blocking findings land in context.md and the final report — approval never
   silently drops them.
3. **FIX** (sonnet): address findings, declared checks green — never partial; re-review.
   Approvals carry: only the rejecting reviewer(s) re-review IF fixes stayed within their
   findings; anything beyond stales carried approvals — both again, at full depth. If a
   rejecting reviewer's findings don't shrink after a fix round, stop early — record and
   move on rather than burning remaining rounds. At the rounds cap: record unresolved
   findings in context.md, move to the next independent slice, flag it in your report.
4. **COMMIT**: run the declared checks yourself — the orchestrator's own run, not the
   implementer's evidence, is the commit gate — then atomic commits exactly per plan
   (`git status` before staging; messages verbatim).

Parallelism: independent slices only (different files, no shared interfaces), max 2-3 —
more multiplies review load and merge risk; in doubt, sequential. Same-repo parallel
slices: own `git worktree` + branch, merged back in slice order; conflict or red
post-merge checks = rejection → fix round. External repos: always a fresh worktree,
never their main checkout.

## Tune the loop

Lightest mechanics the risk allows; record at the top of context.md — binds every subagent.
Tuning never lowers the testing floor.

- **Cadence**: slice boundary; every commit for risky work (auth, migrations, concurrency,
  data loss); batch 2-3 mechanical slices (renames, config, docs) per review.
- **Reviewers**: both; senior only if no test/behavior changes; skip only if the user says so.
- **Depth**: match the surface — UI: browser; API: real requests; library/CLI: tests.
- **Rounds cap**: no assumed default — take it from the plan's Review cycles preference,
  or ask the user at seed time; record it in context.md with the rest of the mechanics.
  Guide: 1 for trivial slices, more for high-risk work. Whatever the cap, the
  no-progress exit (findings not shrinking) still applies.

## Subagent standards (in every subagent prompt)

> Read <workspace>/context.md first; append your outcome when done.
> Verify before done: run your stage's checks (implementers also exercise the change
> end-to-end); paste the real command + output into context.md. "Should work" isn't done.
> Testing is never where you save tokens.
> Report only what a tool result backs. Failures are failures, with output.
> Exactly the planned scope. Adjacent problems → context.md, not the diff.
> Read every file you change (and its callers) first. 3 failed attempts at one problem →
> stop, write up what you tried.

## Report

Slices + commit SHAs; blocked + unresolved findings; what you verified. Outcome first,
complete sentences.
