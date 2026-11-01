# Conveyor workflow script

The script is `../workflow.js`. At seed, copy it unchanged to `.conveyor/<milestone>/workflow.js` and write `args.json` beside it. Launch with `Workflow({scriptPath: '.conveyor/<milestone>/workflow.js', args})`. Never pass the script inline, and never edit the copy after launch. To change course, change `args` and resume with `scriptPath` + `resumeFromRunId`: unchanged agent calls replay from cache, and changed args re-run only the calls they alter.

## args

| Field | Meaning |
|---|---|
| `workspace` | Absolute path to `.conveyor/<milestone>`. Agents read `context.md` there first. |
| `baseSha` | The commit the milestone starts from. The first slice's range starts here, and the milestone-end review covers `baseSha..head`. |
| `slices` | `[{ id, planExcerpt, commits: [{ files, message }] }]`, in order. Each slice has 1–3 commits. Messages describe the change only: no slice ids or other process markers. |
| `checkCommand` | The commit tier, the repo CLAUDE.md `Check:` line. The pre-commit hook runs it; the script never does. |
| `runCheck` | Optional. The run tier, the `Run check:` line. Runs once at milestone end via `rtk proxy`. Red → fixer with the last 80 lines → run again; counts toward `roundsCap`. |
| `reviewers` | Subset of `['senior', 'test']`. |
| `reviewCover` | `'slice'`, `'slice+milestone'` or `'milestone'`: when the reviewers run. |
| `skills` | `{ simplify?: [...], 'security-audit'?: [...] }`, each a list of `'slice'` and/or `'milestone'`. |
| `roundsCap` | Review rounds per scope (positive integer). Never defaulted: a missing cap is `invalid-args`. |
| `standards` | Optional, short orchestrator-specific notes. The agent definitions hold the standards. |

## Flow

Per slice, in order:
1. **Implement**: `essentials:implementer` commits the planned commits through the hook.
2. **Simplify** (if `skills.simplify` includes `'slice'`): a default subagent runs the simplify skill on the slice's range and commits its edits through the hook.
3. **Review** (if `reviewCover` includes slices, or `security-audit` includes `'slice'`): the reviewers run in parallel on the slice's commit range plus the last hook log. Security-audit runs as a default subagent returning the same verdict schema.
4. **Fix**: `essentials:fixer` gets exactly the blocking findings and makes new commits, then the rejecting reviewers re-review the fix commits. Approvals carry unless the fixer reports `extraFiles`, which brings every reviewer back at full depth.

At milestone end:
1. The run check, with its fix loop.
2. Simplify, if `'milestone'`.
3. The milestone review, if `reviewCover` includes the milestone, plus security-audit if `'milestone'`, with the same fix loop.

Facts and decisions from every result are appended at the END of later prompts, so the shared prefix stays cacheable.

## Returns

- `{ status: 'complete', done, head, milestone, facts, decisions }`
- or `{ status: 'exception', kind, …, done, facts, decisions }`

Every return carries `facts` and `decisions` for the orchestrator to write to `context.md`. Exception kinds:

| Kind | Meaning |
|---|---|
| `invalid-args` | Bad or inconsistent args. Nothing launched. |
| `question` | An implementer or fixer needs an answer before building. Record the answer in context.md and args, then resume. |
| `implementer-blocked`, `fixer-blocked`, `simplify-blocked` | 3 failed attempts, a missing hook, or a dirty tree after a commit. |
| `implementer-null`, `fixer-null`, `reviewers-null`, `simplify-null`, `run-check-null` | The agent died or was classifier-blocked. Check the run's errors. |
| `rounds-cap` | Still blocked after `roundsCap` review rounds. |
| `no-progress` | The same blocker set came back twice. |
| `aged-findings` | A resolvable finding was flagged a third time anywhere in the milestone. Standing findings are exempt. |
| `rejection-without-blockers` | A rejection with no blocking finding gives the fixer nothing to act on. |
| `run-check-red` | The run tier is still red at the cap. |

The behaviour is pinned by `../workflow.test.ts` (`bun test`).
