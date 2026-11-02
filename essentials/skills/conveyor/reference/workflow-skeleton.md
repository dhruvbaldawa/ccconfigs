# Conveyor workflow script

The script is `../workflow.js`. At seed, copy it unchanged to `.conveyor/<milestone>/workflow.js` and write `args.json` beside it. Launch with `Workflow({scriptPath: '.conveyor/<milestone>/workflow.js', args})`. Never pass the script inline, and never edit the copy after launch. To change course, change `args` and resume with `scriptPath` + `resumeFromRunId`. Resume replays the longest unchanged prefix of agent calls from cache; the first call whose prompt changed, and every call after it, runs live. Put answers in `answers`, keyed by the label of the call that asked (appended at the end of that one prompt), never in `standards` (the start of every prompt).

## args

| Field | Meaning |
|---|---|
| `workspace` | Absolute path to `.conveyor/<milestone>`. Agents read `context.md` there first. |
| `baseSha` | The commit the milestone starts from. The first slice's range starts here, and the milestone-end review covers `baseSha..head`. |
| `slices` | `[{ id, planExcerpt, commits: [{ files, message }] }]`, in order. Each slice has 1–3 commits. Messages describe the change only: no slice ids or other process markers. |
| `checkCommand` | The commit tier, the repo CLAUDE.md `Check:` line. The pre-commit hook runs it; the script never does. |
| `runCheck` | Optional. The run tier, the `Run check:` line. Runs once at milestone end as `rtk proxy sh -c '<runCheck>'`, so a compound command runs whole. Red → fixer with the last 80 lines as a `run-check-red` finding → run again. Ends red at `roundsCap` (3 rounds with `'until-approved'`), when the same failure comes back, or when the fixer commits nothing. Without a milestone review, the slice reviewers (and a per-slice security-audit) review the fix commits. Fixes made by a review after the run check are not run through it again; CI after push covers them. |
| `reviewers` | Non-empty subset of `['senior', 'test']`. |
| `reviewCover` | `'slice'`, `'slice+milestone'` or `'milestone'`: when the reviewers run. |
| `skills` | `{ simplify?: [...], 'security-audit'?: [...] }`, each a list of `'slice'` and/or `'milestone'`. |
| `roundsCap` | Review rounds per scope: a positive integer, or `'until-approved'` (no cap; no-progress and aging still end a loop). Never defaulted: a missing cap is `invalid-args`. |
| `answers` | Optional. `{ <agent label>: [answer, ...] }`, e.g. `'implement:s2'`, `'fix:slice s1:r2'`, `'review:senior:slice s1:r2'`, `'run-check:r1'`. Appended at the end of that one prompt, after the carried facts, so every earlier call replays from cache. A `question` exception names its `answerKey`; for other exceptions, key the answer to the call that should hear it (see Lever below). |
| `standards` | Optional, short orchestrator-specific notes. The agent definitions hold the standards. |

## Flow

Per slice, in order:
1. **Implement**: `essentials:implementer` commits the planned commits through the hook.
2. **Simplify** (if `skills.simplify` includes `'slice'`): a default subagent runs the simplify skill on the slice's range and commits its edits through the hook.
3. **Review** (if `reviewCover` includes slices): the reviewers, plus security-audit if `'slice'`, run in parallel on the slice's commit range plus the last hook log. Security-audit runs as a default subagent returning the same verdict schema. A reviewer that returns nothing is a `reviewers-null` exception.
4. **Fix**: `essentials:fixer` gets exactly the blocking findings and makes new commits, then the rejecting reviewers re-review the fix commits, each with its own prior findings. Approvals carry unless the fixer's `extraFiles` go beyond the findings' files (workspace paths and absolute or relative spellings of a finding's file don't count; a different file with a similar name does), which brings every reviewer back at full depth.

At milestone end:
1. The run check, with its fix loop, and a review of its fix commits when no milestone review follows.
2. Simplify, if `'milestone'`.
3. The milestone review, if `reviewCover` includes the milestone, plus security-audit if `'milestone'`, with the same fix loop.

Facts and decisions from every result are appended at the END of later prompts, so the shared prefix stays cacheable.

## Returns

- `{ status: 'complete', done, head, runCheck, milestone, facts, decisions }`: `runCheck` holds the run check's rounds, its review rounds, open reservations and extra files.
- or `{ status: 'exception', kind, …, done, facts, decisions }`

Every return carries `done`, `head`, `facts` and `decisions` for the orchestrator to record. Exception kinds:

| Kind | Meaning | Lever on resume |
|---|---|---|
| `invalid-args` | Bad or inconsistent args (including no reviewers, an answer that is not a list of strings, simplify at milestone end without milestone reviewers, or security-audit per slice with milestone-only review). Nothing launched. | Fix args and launch. |
| `question` | An implementer or fixer needs an answer before building. | `answers[answerKey]`. |
| `implementer-blocked`, `fixer-blocked`, `simplify-blocked` | 3 failed attempts, a missing hook, or a dirty tree after a commit. Commits an attempt made past `head` stay; a re-run starts from `git log`. | Answer the blocked call by its label (`implement:<id>`, `fix:…`, `simplify:<scope>`). After fixing the environment, record it in Environment facts AND key an answer such as `environment fixed: <what>` to that label: context.md is in no prompt, so without the answer the blocked result replays from cache. |
| `implementer-null`, `fixer-null`, `reviewers-null`, `simplify-null`, `run-check-null` | The agent died or was classifier-blocked; `reviewers-null` lists the `missing` reviewers. Check the run's errors. | Fix the cause, then resume. If the null result replays from cache, key an answer to that call's label to run it live. |
| `rounds-cap` | Still blocked after `roundsCap` review rounds. | Raise `roundsCap`, or answer the last fixer or reviewer by label. |
| `no-progress` | The same blocker set came back twice. | Answer the reviewer (e.g. a ruling on the finding) or the fixer, by label. |
| `aged-findings` | A resolvable finding was flagged a third time anywhere in the milestone. Standing findings are exempt. | Answer the reviewer by label: mark it standing, or rule on it. |
| `rejection-without-blockers` | A rejection with no blocking finding gives the fixer nothing to act on. | Answer the reviewer by label. |
| `run-check-red` | The run tier is still red at the cap, failed the same way twice, or the fixer committed nothing. | Answer the last run-check fixer by label. After fixing the environment, key `environment fixed: <what>` to `run-check:r<N>` of the red check so it runs live. |

The behaviour is pinned by `../workflow.test.ts` (`bun test`).
