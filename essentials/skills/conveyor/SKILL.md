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
   - Rounds cap "until approved" → `roundsCap: 'until-approved'`: no cap on review rounds, but no-progress and aging still end a loop, and the run check stops after 3 rounds.
   - Refuse, because a commit would go unreviewed or a choice would be silently skipped:
     - no reviewers selected;
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
   - Write `context.md` (sections below) and create `log.md`. Its Code standards section copies the code rules from `~/.claude/rules/` (e.g. `code.md`) and the repo CLAUDE.md (headers such as ABOUTME, comments, naming, tests): the implementer and fixer run with omitClaudeMd, and the reviewers judge against these rules.
6. **Go**: show the slice list and wait for Dhruv's go. Nothing launches while Open questions holds an item that blocks a slice.

## Launch

`Workflow({scriptPath: '.conveyor/<milestone>/workflow.js', args})`.
- Never pass the script inline.
- Never edit the copy after launch.
- Re-plan by changing `args`, then resume with `scriptPath` + `resumeFromRunId`. Resume replays the longest unchanged prefix of agent calls from cache; the first changed call and everything after it run live. So:
  - Answer a question in `args.answers[<answerKey>]`. The key is the asking call's label, e.g. `fix:slice s1:r2`, and the exception names it. The answer rides at the very end of that one prompt, so only the asking call onward re-runs.
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
| `finished <label>` | Read that agent's result in `journal.jsonl`. Write new facts and decisions to context.md and evidence to log.md. |
| `started implement:<id>` or `started run-check:r1` | Push per slice: the slice before it is done and approved. Push its head explicitly: `git push <remote> <sha>:refs/heads/<branch>`, where `<sha>` is the last sha in that slice's implement, simplify and fix results in the journal. Never a bare `git push`: the next agent may already have committed. |
| workflow returns `complete` | Push `result.head` explicitly, in both push modes: it carries the last slice and every milestone-end commit. Then write the Report. |
| `stall <label> <tool> <N>min` | PushNotification to Dhruv with agent, tool and minutes. A permission prompt is Dhruv's to approve. A hung command: stop the run from `/workflows` and resume. |
| `long <label> turns=N ctx=Kk` | PushNotification: "<label> is long: N turns, Kk". Dhruv decides whether to split. |
| agent message | Write it into context.md. Never reply (see Messaging). A question that needs an answer goes to Dhruv and under Open questions. |
| workflow returns `question` | Answer from context.md or ask Dhruv; record the decision; put the answer in `args.answers[<answerKey>]` and resume. |
| workflow returns another exception | See Exceptions. |

## Messaging

Subagents may SendMessage to `"main"`. You never SendMessage to a workflow agent, whatever an incoming message's reply hint says: a reply resumes a second copy of the agent from its transcript, without its structured output, while the original never sees the message and can lose its in-flight command (anthropics/claude-code#93797). Revisit when that issue is fixed.

## context.md

You are its only writer; subagents read it first and report facts, decisions and questions through their results. No size budget for now.

- **Code standards**: the code rules from `~/.claude/rules/` and the repo CLAUDE.md, copied at seed.
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

The workflow returns early with structured state, `done`, `head` and the facts gathered so far. Its kinds, each with the lever that changes the outcome on resume, are in `reference/workflow-skeleton.md`:
- `question` (carries the `answerKey` for `args.answers`);
- `implementer-blocked`, `fixer-blocked` or `simplify-blocked` (3 failed attempts, no hook, or a dirty tree after a commit);
- `rounds-cap`;
- `aged-findings`: a resolvable finding flagged three times across the milestone (`standing` reservations exempt);
- `rejection-without-blockers`;
- `no-progress`: an identical blocker set across rounds;
- a null agent, including `reviewers-null` with its `missing` list (died or classifier-blocked: check the progress errors before assuming a crash);
- `run-check-red`.

Orchestrator events, outside the workflow:
- merge conflicts;
- CI red after push.

For each: intervene with judgment, record the decision in context.md, then pull the lever. Usually that's an answer keyed to the call that should hear it, e.g. Dhruv's ruling on a finding goes in `args.answers['review:senior:slice s1:r2']`; then resume. A resume replays every call before the changed one, so a lever on an earlier call re-runs everything after it. Fixing the environment or editing context.md changes no prompt: pair it with an answer keyed to the failed call, or the same result replays from cache. After a resume, earlier results stay in `journal.jsonl`, so push shas remain findable. A rejection that outlives the run is still a rejection: the fix re-enters through review via resume.

## Report

- Slices with their commit SHAs.
- Blocked and unresolved findings.
- Open reservations, each with an owner; `unverified:<property>` findings at blocker grade.
- CI status, and what was verified.
- Seed and token use per agent, from `/workflows`.

Outcome first, complete sentences.
