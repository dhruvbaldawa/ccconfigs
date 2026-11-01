# Conveyor workflow script

The script is `../workflow.js`. At seed, copy it unchanged to `.conveyor/<milestone>/workflow.js` and write `args.json` beside it. Launch with `Workflow({scriptPath: '.conveyor/<milestone>/workflow.js', args})`. Never pass the script inline, and never edit the copy after launch. To change course, change `args` and resume with `scriptPath` + `resumeFromRunId`. Resume replays the longest unchanged prefix of agent calls from cache; the first call whose prompt changed, and every call after it, runs live. Put answers in `answers` (appended at the end of one prompt), never in `standards` (the start of every prompt).

## args

| Field | Meaning |
|---|---|
| `workspace` | Absolute path to `.conveyor/<milestone>`. Agents read `context.md` there first. |
| `baseSha` | The commit the milestone starts from. The first slice's range starts here, and the milestone-end review covers `baseSha..head`. |
| `slices` | `[{ id, planExcerpt, commits: [{ files, message }] }]`, in order. Each slice has 1–3 commits. Messages describe the change only: no slice ids or other process markers. |
| `checkCommand` | The commit tier, the repo CLAUDE.md `Check:` line. The pre-commit hook runs it; the script never does. |
| `runCheck` | Optional. The run tier, the `Run check:` line. Runs once at milestone end via `rtk proxy`. Red → fixer with the last 80 lines as a `run-check-red` finding → run again. Ends red at `roundsCap` or when the same failure comes back. Without a milestone review, the slice reviewers review the fix commits. |
| `reviewers` | Subset of `['senior', 'test']`. |
| `reviewCover` | `'slice'`, `'slice+milestone'` or `'milestone'`: when the reviewers run. |
| `skills` | `{ simplify?: [...], 'security-audit'?: [...] }`, each a list of `'slice'` and/or `'milestone'`. |
| `roundsCap` | Review rounds per scope: a positive integer, or `'until-approved'` (no cap; no-progress and aging still end a loop). Never defaulted: a missing cap is `invalid-args`. |
| `answers` | Optional. `{ <slice id> \| 'milestone' \| 'run-check': [answer, ...] }`. Appended at the end of that scope's implementer and fixer prompts, after the carried facts. A `question` exception names its `answerKey`. |
| `standards` | Optional, short orchestrator-specific notes. The agent definitions hold the standards. |

## Flow

Per slice, in order:
1. **Implement**: `essentials:implementer` commits the planned commits through the hook.
2. **Simplify** (if `skills.simplify` includes `'slice'`): a default subagent runs the simplify skill on the slice's range and commits its edits through the hook.
3. **Review** (if `reviewCover` includes slices): the reviewers, plus security-audit if `'slice'`, run in parallel on the slice's commit range plus the last hook log. Security-audit runs as a default subagent returning the same verdict schema. A reviewer that returns nothing is a `reviewers-null` exception.
4. **Fix**: `essentials:fixer` gets exactly the blocking findings and makes new commits, then the rejecting reviewers re-review the fix commits, each with its own prior findings. Approvals carry unless the fixer's `extraFiles` go beyond the findings' files (workspace paths and other spellings of a finding's file don't count), which brings every reviewer back at full depth.

At milestone end:
1. The run check, with its fix loop, and a review of its fix commits when no milestone review follows.
2. Simplify, if `'milestone'`.
3. The milestone review, if `reviewCover` includes the milestone, plus security-audit if `'milestone'`, with the same fix loop.

Facts and decisions from every result are appended at the END of later prompts, so the shared prefix stays cacheable.

## Returns

- `{ status: 'complete', done, head, milestone, facts, decisions }`
- or `{ status: 'exception', kind, …, done, facts, decisions }`

Every return carries `done`, `head`, `facts` and `decisions` for the orchestrator to record. Exception kinds:

| Kind | Meaning |
|---|---|
| `invalid-args` | Bad or inconsistent args (including simplify at milestone end without milestone reviewers, or security-audit per slice with milestone-only review). Nothing launched. |
| `question` | An implementer or fixer needs an answer before building. Record it in context.md and in `answers[answerKey]`, then resume. |
| `implementer-blocked`, `fixer-blocked`, `simplify-blocked` | 3 failed attempts, a missing hook, or a dirty tree after a commit. |
| `implementer-null`, `fixer-null`, `reviewers-null`, `simplify-null`, `run-check-null` | The agent died or was classifier-blocked; `reviewers-null` lists the `missing` reviewers. Check the run's errors. |
| `rounds-cap` | Still blocked after `roundsCap` review rounds. |
| `no-progress` | The same blocker set came back twice. |
| `aged-findings` | A resolvable finding was flagged a third time anywhere in the milestone. Standing findings are exempt. |
| `rejection-without-blockers` | A rejection with no blocking finding gives the fixer nothing to act on. |
| `run-check-red` | The run tier is still red at the cap, failed the same way twice, or the fixer committed nothing. |

The behaviour is pinned by `../workflow.test.ts` (`bun test`).
