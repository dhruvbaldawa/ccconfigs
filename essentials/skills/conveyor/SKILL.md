---
name: conveyor
description: Slice execution loop with subagents — sonnet implements, senior-engineer-reviewer + test-reviewer gate each slice, a cheap agent commits in-band, CI verifies async. Use when the user says "conveyor" or hands over a plan for autonomous execution.
argument-hint: <plan file or task> [notes]
---

# Conveyor

Execute $ARGUMENTS slice by slice. You seed, launch, monitor, and intervene on
exceptions; subagents implement, review, fix, and commit — in-band. Your context is
for judgment: never stage/unstage, rerun checks, or re-verify approved work.
One workflow call runs the whole task — per-slice or per-stage scripts are an
anti-pattern; needing a new script mid-task is itself an exception, recorded in
context.md. This skill explicitly authorizes the Workflow tool; adapt
`reference/workflow-skeleton.md` rather than re-deriving the control flow.

## Workspace

`.conveyor/<task-slug>/` in the project (add `.conveyor/` to `.git/info/exclude`).

- `context.md` = shared memory. Seed: plan (or pointer), base branch + SHA, decisions,
  chosen loop mechanics, and the **two check tiers** from the plan's validation criteria:
  **local** — fast feedback (lint, typecheck, affected tests): the per-commit gate;
  **CI** — the pipeline owns the full suite. No CI in the repo → local tier = everything.
  Every subagent reads context.md first, appends its outcome last. Append-only.
- **Pre-flight the environment at seed**: run each local check once and classify —
  green; needs-sandbox-disable (record it); cannot-run-here (demote to CI-tier or
  a named human gate in the report — a check that can't run is not a check). Probe
  git too: SSH commits/pushes legitimately need the sandbox disabled — that's a
  sanctioned, expected escalation (sandbox controls are config-level); record it
  as a Known environment fact so agents follow the recorded workaround instead of
  improvising. Keep the literal escalation flag out of workflow script text — the
  classifier has denied launches that mention it.
- **Record the integration target**: branch, push destination, PR-vs-direct — read
  it from recent history or ask; a commit agent must never infer it from wherever
  HEAD happens to point.
- Seed a **Known environment facts** section: subagents check it before diagnosing
  any check failure and append new facts (sandbox quirks, bootstrap incantations,
  wrapper hazards) — each environment fact gets diagnosed once, ever. Prime fresh
  worktrees before launch (deps, provider init, config trust) or record the exact
  bootstrap incantation here.
- Subagents may add working files beside it.
- Resume: context.md + git log → continue from the first unfinished slice;
  `resumeFromRunId` replays completed slices from cache.

## The loop

Slice ≈ 2-3 atomic commits, in plan order. One workflow call runs every slice in-band —
control returns to you only when the run completes or an exception ends it early.
Before launching: record mechanics in context.md.

**Testing floor — never below it; above is always fine**: local tier green at IMPLEMENT,
after every FIX, and at COMMIT. Full-suite assurance is CI's job, not a local rerun.

1. **IMPLEMENT** (sonnet): the slice's commits + tests per plan; run the local checks,
   exercise the change end-to-end, evidence (command + output tail) → context.md. No
   commits yet.
2. **REVIEW**: `essentials:senior-engineer-reviewer` ∥ `essentials:test-reviewer` (one
   message) on the slice's uncommitted diff + evidence. First review is full-depth —
   judge against the whole repo. Re-reviews are delta-only per the carryover rule.
   One shared scale for both reviewers: REJECT / NEEDS WORK / APPROVED WITH
   RESERVATIONS / SHIP IT — approved = the last two. Verdicts are schema-enforced
   enums — off-scale or verbose labels can't occur; a missing result = rejection. Reservations and other non-blocking
   findings land in the harness-recorded ledger and the final report **with an
   owner and a deadline slice** — approval never silently drops them, and a
   finding a reviewer would re-flag next round is blocking by definition. When no
   declared check can exercise the slice's core behavior, the strongest honest
   verdict is APPROVED WITH RESERVATIONS plus an `unverified:<property>` finding —
   the report surfaces it at blocker grade as a named human verification step.
   Reservations that recur by design (unverified properties, cross-repo facts)
   are marked `standing`: exempt from aging, owned in the report.
3. **FIX** (sonnet): address findings, local checks green — never partial; re-review.
   Approvals carry: only the rejecting reviewer(s) re-review IF fixes stayed within
   their findings; anything beyond stales carried approvals — both again, at full
   depth. Findings age individually **across the whole task** (deferred defects
   recur across slices, not within one): a third flag of any resolvable finding is
   an exception; `standing` reservations are exempt. A rejection with zero blocking
   findings is unactionable — exception, never an empty fix dispatch. An identical
   blocker set across rounds: exception.
4. **COMMIT** (cheap agent, haiku-class): append the slice's harness-composed review
   ledger to context.md (the deterministic record — reviewer appends are optional
   detail), rerun the local checks — exit codes are the gate, not the implementer's
   evidence — then `git status`, stage EXACTLY the planned files plus any
   reviewer-approved `extraFiles` (the implementer's channel for a wrong plan
   file-list; silent expansion stays an exception), commit messages verbatim, push
   (CI starts async). Red checks, unplanned changes in the tree, or a failed push =
   exception; never "fix it while committing."

CI runs on pushed slices while later slices proceed — nobody polls. After the last
slice: check CI once. Red → dispatch a cheap fix subagent on CI's failure output
(a new slice through the same loop) — not a local full-suite rerun, and not your
own context.

## Exceptions — your only job

Rounds cap hit; any resolvable finding flagged three times across the task
(`standing` reservations exempt); a rejection carrying zero blocking findings;
an identical blocker set across rounds; a subagent stuck (3 failed attempts) or returned null
(died or classifier-blocked — check the progress errors before assuming a crash);
red, un-greenable, or un-runnable checks; unplanned tree changes; classifier flags;
merge conflicts; CI red after a fix round. The workflow returns early with
structured state — intervene with judgment, record the decision in context.md,
resume. Interventions carry the same append obligation as subagent outcomes.
Re-plan by changing `args` and resuming — never by editing code under review,
running checks, or issuing git write commands in your own context. A rejection
that outlives the run is still a rejection: the fix re-enters through REVIEW via
resume, never straight to commit or PR. Never absorb mechanical retries into your
own context.

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
  says so. Never override reviewer model/effort below the agent definitions without
  recording it in the mechanics. Mechanical equivalence proofs (no-op moves, rename
  completeness) belong to one reviewer; the other spot-checks rather than re-derives.
- **Depth**: match the surface — UI: browser; API: real requests; library/CLI: tests.
- **Rounds cap**: no assumed default — take it from the plan's Review cycles preference,
  or ask the user at seed time; record it in context.md with the rest of the mechanics.
  Guide: 1 for trivial slices, more for high-risk work. Whatever the cap, the
  no-progress and finding-aging exits still apply.

## Subagent standards (in every subagent prompt)

> Read <workspace>/context.md first — including Known environment facts — and
> append your outcome when done.
> Verify before done: run your stage's local checks (implementers also exercise the
> change end-to-end); paste the real command + output into context.md. "Should work"
> isn't done. Testing is never where you save tokens.
> A successful structured-output call ends your run immediately — never submit
> placeholder values; if validation rejects your report, fix the shape, not the truth.
> Never commit unless you were dispatched as this slice's COMMIT agent —
> IMPLEMENT and FIX end with the working tree uncommitted, even if everything
> looks approved and done.
> An environment-blocked action has its sanctioned workaround recorded in Known
> environment facts; if none is recorded, report the failure and stop — never
> invent an escalation.
> Any command whose exit code or output gates a decision must bypass
> output-rewriting wrappers (`rtk proxy ...`) and be negative-tested once — prove
> the gate can fail before trusting that it passed.
> Report only what a tool result backs. Failures are failures, with output.
> Exactly the planned scope. Adjacent problems → context.md, not the diff.
> Read every file you change (and its callers) first. 3 failed attempts at one
> problem → stop, write up what you tried.

## Report

Slices + commit SHAs; blocked + unresolved findings; open reservations, each with
an owner; `unverified:<property>` findings at blocker grade; CI status; what was
verified. Outcome first, complete sentences.
