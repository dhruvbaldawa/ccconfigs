---
name: conveyor
description: Slice execution loop with subagents — sonnet implements, senior-engineer-reviewer + test-reviewer gate each slice, a cheap agent commits in-band, CI verifies async. Use when the user says "conveyor" or hands over a plan for autonomous execution.
argument-hint: <plan file or task> [notes]
---

# Conveyor

Execute $ARGUMENTS slice by slice. You seed, launch, monitor, and intervene on
exceptions; subagents implement, review, fix, and commit — in-band. Your context is
for judgment: never stage/unstage, rerun checks, or re-verify approved work.
Author the workflow to fit the task — this file is the contract, not the mechanics.
This skill explicitly authorizes the Workflow tool; adapt
`reference/workflow-skeleton.md` rather than re-deriving the control flow.

## Workspace

`.conveyor/<task-slug>/` in the project (add `.conveyor/` to `.git/info/exclude`).

- `context.md` = shared memory. Seed: plan (or pointer), base branch + SHA, decisions,
  chosen loop mechanics, and the **two check tiers** from the plan's validation criteria:
  **local** — fast feedback (lint, typecheck, affected tests): the per-commit gate;
  **CI** — the pipeline owns the full suite. No CI in the repo → local tier = everything.
  Every subagent reads context.md first, appends its outcome last. Append-only.
- Subagents may add working files beside it.
- Resume: context.md + git log → continue from the first unfinished slice;
  `resumeFromRunId` replays completed slices from cache.

## The loop

Slice ≈ 2-3 atomic commits, in plan order. One workflow call runs every slice in-band —
control returns to you only when the run completes or an exception ends it early.
Before launching: record mechanics in context.md, then set `/goal every slice committed
with local checks green and both reviewers approving; stop on any exception`.

**Testing floor — never below it; above is always fine**: local tier green at IMPLEMENT,
after every FIX, and at COMMIT. Full-suite assurance is CI's job, not a local rerun.

1. **IMPLEMENT** (sonnet): the slice's commits + tests per plan; run the local checks,
   exercise the change end-to-end, evidence (command + output tail) → context.md. No
   commits yet.
2. **REVIEW**: `essentials:senior-engineer-reviewer` ∥ `essentials:test-reviewer` (one
   message) on the slice's uncommitted diff + evidence. First review is full-depth —
   judge against the whole repo. Re-reviews are delta-only per the carryover rule.
   Approved = senior: SHIP IT / APPROVED WITH RESERVATIONS; test: ACTUALLY GOOD /
   ACCEPTABLE. Anything else, or unparseable, = rejection. Reservations and other
   non-blocking findings land in context.md and the final report — approval never
   silently drops them.
3. **FIX** (sonnet): address findings, local checks green — never partial; re-review.
   Approvals carry: only the rejecting reviewer(s) re-review IF fixes stayed within
   their findings; anything beyond stales carried approvals — both again, at full
   depth. Findings age individually: re-flagged after a fix round = one last chance;
   a third flag is an exception. Findings whose count stops shrinking: exception.
4. **COMMIT** (cheap agent, haiku-class): rerun the local checks — exit codes are the
   gate, not the implementer's evidence — then `git status`, stage EXACTLY the planned
   files, commit messages verbatim, push (CI starts async). Red checks, unplanned
   changes in the tree, or a failed push = exception; never "fix it while committing."

CI runs on pushed slices while later slices proceed — nobody polls. After the last
slice: check CI once. Red → dispatch a cheap fix subagent on CI's failure output
(a new slice through the same loop) — not a local full-suite rerun, and not your
own context.

## Exceptions — your only job

Rounds cap hit; a finding flagged three times; findings not shrinking; a subagent
stuck (3 failed attempts); red or un-greenable checks; unplanned tree changes;
classifier flags; merge conflicts; CI red after a fix round. The workflow returns
early with structured state — intervene with judgment (decide, re-plan, fix directly
if warranted), record the decision in context.md, resume. Never absorb mechanical
retries into your own context.

## Parallelism

Independent slices only (different files, no shared interfaces), max 2-3 — more
multiplies review load and merge risk; in doubt, sequential. Same-repo parallel
slices: own `git worktree` + branch, merged back in slice order; conflict or red
post-merge checks = exception. External repos: always a fresh worktree, never their
main checkout.

## Tune the loop

Lightest mechanics the risk allows; record at the top of context.md — binds every
subagent. Tuning never lowers the testing floor.

- **Cadence**: slice boundary; every commit for risky work (auth, migrations,
  concurrency, data loss); batch 2-3 mechanical slices (renames, config, docs) per
  review. Push after each slice by default; defer pushes only if the user says so.
- **Reviewers**: both; senior only if no test/behavior changes; skip only if the user
  says so.
- **Depth**: match the surface — UI: browser; API: real requests; library/CLI: tests.
- **Rounds cap**: no assumed default — take it from the plan's Review cycles preference,
  or ask the user at seed time; record it in context.md with the rest of the mechanics.
  Guide: 1 for trivial slices, more for high-risk work. Whatever the cap, the
  no-progress and finding-aging exits still apply.

## Subagent standards (in every subagent prompt)

> Read <workspace>/context.md first; append your outcome when done.
> Verify before done: run your stage's local checks (implementers also exercise the
> change end-to-end); paste the real command + output into context.md. "Should work"
> isn't done. Testing is never where you save tokens.
> Report only what a tool result backs. Failures are failures, with output.
> Exactly the planned scope. Adjacent problems → context.md, not the diff.
> Read every file you change (and its callers) first. 3 failed attempts at one
> problem → stop, write up what you tried.

## Report

Slices + commit SHAs; blocked + unresolved findings; CI status; what was verified.
Outcome first, complete sentences.
