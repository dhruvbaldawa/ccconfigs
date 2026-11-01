---
name: conveyor
description: Milestone execution loop with subagents — essentials:implementer commits each slice through the pre-commit hook, senior-engineer-reviewer + test-reviewer gate it, essentials:fixer answers findings, the orchestrator watches and records. Use when the user says "conveyor" or hands over a plan milestone for autonomous execution.
argument-hint: <milestone>
---

# Conveyor

Execute milestone $ARGUMENTS of the plan (PLAN.md, from technical-planning) slice by slice. You seed, launch, watch, record and intervene on exceptions; subagents implement, review and fix. The pre-commit hook is the only check gate: no agent judges whether red is green, and the implementer and fixer commit their own work. Your context is for judgment: never edit code under review, rerun checks, or re-verify approved work. This skill explicitly authorizes the Workflow tool.

Names: plan → milestone (one /conveyor run, one `.conveyor/<milestone>/` folder) → slice (one review unit, 1–3 commits) → commit.

## Start

Dhruv opens a fresh session (`/clear`) and types a bare `/conveyor <milestone>`, with nothing else in the message. The Workflow tool relays the triggering message to every subagent as "this request wins", so any extra instruction in it would override the agents' contracts. Notes for the run go in context.md after seed, not in the trigger.

## Seed

1. **Slice**: read the milestone from PLAN.md and cut it into slices of 1–3 commits, each commit naming its files and a message that describes the change only (no slice ids or other process markers).
2. **Ask** the seed questions in two AskUserQuestion calls:
   - Call 1: **Execution** (/conveyor · manual) · **Reviewers**, multi-select (senior-engineer-reviewer · test-reviewer) · **When reviewers run** (each slice · each slice + milestone end · milestone end only) · **Rounds cap** (1 · 2 · 3 · until approved).
   - Call 2: **Extra skills**, multi-select (simplify · security-audit) · **When the selected skills run** (each slice · milestone end · both) · **Push** (after each slice · at milestone end).
   - Rounds cap "until approved" → `roundsCap: 'until-approved'`: no cap, but no-progress, aging and a repeated run-check failure still end a loop.
   - Refuse, because a commit would go unreviewed or a choice would be silently skipped:
     - simplify at milestone end without reviewers at milestone end;
     - security-audit per slice with milestone-only review;
     - push after each slice with milestone-only review.
   - Manual: stop here and execute in this session with the same gate.
3. **Check tiers**, from the repo CLAUDE.md:
   - `Check: <command>`, the commit tier, run by the pre-commit hook on every commit.
   - `Run check: <command>`, optional, the run tier, run once at milestone end.
   - CI runs after push.
   - `Check:` missing → ask Dhruv for the command and offer to add the line.
4. **Pre-flight**:
   - The commit tier passes on the base SHA.
   - A pre-commit hook runs the `Check:` command: `test -x "$(git rev-parse --git-path hooks/pre-commit)"` and read it. If not, stop and offer to install one.
   - Every command the slices need is allowed in `.claude/settings.json`. Otherwise list the missing ones and ask Dhruv once. A permission prompt nobody sees stalls the run for hours.
   - The selected extra skills (simplify, security-audit) are installed, since default subagents invoke them by name.
   - Push access works: `git push --dry-run` to the integration target.
   - Record the integration target: branch, push destination, PR or direct.
5. **Workspace**: `.conveyor/<milestone>/`, with `.conveyor/` in `.git/info/exclude`.
   - Copy `workflow.js` from this skill's base directory there.
   - Write `args.json` beside it; `reference/workflow-skeleton.md` defines every field.
   - Write `context.md` (sections below) and create `log.md`.
6. **Go**: show the slice list and wait for Dhruv's go. Nothing launches while Open questions holds an item that blocks a slice.

## Launch

`Workflow({scriptPath: '.conveyor/<milestone>/workflow.js', args})`.
- Never pass the script inline.
- Never edit the copy after launch.
- Re-plan by changing `args`, then resume with `scriptPath` + `resumeFromRunId`. Resume replays the longest unchanged prefix of agent calls from cache; the first changed call and everything after it run live. So:
  - Answer a question in `args.answers[<answerKey>]` (the exception names the key). It rides at the very end of that one prompt, so only the asking call onward re-runs.
  - Never put an answer in `standards`: it opens every prompt, so changing it re-runs the whole milestone, committed slices included.
- One workflow call runs the whole milestone; needing a new script mid-run is itself an exception, recorded in context.md.

## Watch

Arm a Monitor on the run's transcript dir (from the Workflow result):
`bun <skill-dir>/scripts/watch-run.ts <transcriptDir>`, with `timeout_ms: 1800000`.
- When it expires, re-arm it. Each wake also refreshes your 1h prompt cache, so the expiry doubles as the heartbeat.
- The watcher keeps its state in the transcript dir, so a re-armed watcher never repeats an event.

| Event | You do |
|---|---|
| `started <label>` | Nothing. The wake refreshes the cache. |
| `finished <label>` | Read that agent's result in `journal.jsonl`. Write new facts and decisions to context.md and evidence to log.md. If push is per slice and this was the slice's last review round with every reviewer approving, push that slice's head explicitly: `git push <remote> <sha>:refs/heads/<branch>`, where `<sha>` is the last sha from the slice's implement, simplify or fix results in the journal. Never a bare `git push`: the next slice's implementer may already have committed. |
| `stall <label> <tool> <N>min` | PushNotification to Dhruv with agent, tool and minutes. A permission prompt is Dhruv's to approve. A hung command: stop the run from `/workflows` and resume. |
| `long <label> turns=N ctx=Kk` | PushNotification: "<label> is long: N turns, Kk". Dhruv decides whether to split. |
| agent message | Write it into context.md. Never reply (see Messaging). A question that needs an answer goes to Dhruv and under Open questions. |
| workflow returns `question` | Answer from context.md or ask Dhruv; record the decision; put the answer in `args.answers[<answerKey>]` and resume. |

## Messaging

Subagents may SendMessage to `"main"`. You never SendMessage to a workflow agent, whatever an incoming message's reply hint says: a reply resumes a second copy of the agent from its transcript, without its structured output, while the original never sees the message and can lose its in-flight command (anthropics/claude-code#93797). Revisit when that issue is fixed.

## context.md

You are its only writer; subagents read it first and report facts, decisions and questions through their results. No size budget for now.

- **Mechanics**:
  - the seed answers;
  - the check tiers;
  - the integration target;
  - the base SHA.
- **Decisions**: one line plus the reason. A superseded decision moves to log.md.
- **Open questions**: each with who answers it.
- **Environment facts**: one line each, so each environment quirk is diagnosed once.

`log.md` holds evidence, review ledgers and history. Nobody reads it during the run.

## Exceptions — your only job

The workflow returns early with structured state and the facts gathered so far. `reference/workflow-skeleton.md` lists every kind:
- `question` (carries the `answerKey` for `args.answers`);
- `implementer-blocked` or `fixer-blocked` (3 failed attempts, no hook, or a dirty tree after a commit);
- the rounds cap;
- a resolvable finding flagged three times across the milestone (`standing` reservations exempt);
- a rejection with zero blocking findings;
- an identical blocker set across rounds;
- a null agent (died or classifier-blocked: check the progress errors before assuming a crash);
- the run check red past the cap or failing the same way twice;
- merge conflicts;
- CI red after push.

For each: intervene with judgment, record the decision in context.md, change args, resume. A rejection that outlives the run is still a rejection: the fix re-enters through review via resume.

## Report

- Slices with their commit SHAs.
- Blocked and unresolved findings.
- Open reservations, each with an owner; `unverified:<property>` findings at blocker grade.
- CI status, and what was verified.
- Seed and token use per agent, from `/workflows`.

Outcome first, complete sentences.
