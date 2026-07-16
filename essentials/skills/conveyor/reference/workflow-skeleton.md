# Conveyor workflow skeleton

Canonical per-run script: every slice in-band (implement → review → fix → commit),
early return on exceptions, resume-friendly. Adapt it — don't re-derive the control
flow; the null-guards, carryover, and finding-aging logic below are the parts
authored-from-scratch scripts get wrong. Pass task specifics via `args`
(Workflow `args` param), never hardcode timestamps or defaults.

```js
export const meta = {
  name: 'conveyor-run',
  description: 'Implement, review, fix, commit every slice in-band; return early on exceptions',
  phases: [{ title: 'Slices' }],
}

// ---- from context.md mechanics, passed via args ----
const WS = args.workspace              // '.conveyor/<task-slug>'
const SLICES = args.slices             // [{ id, planExcerpt, commits: [{ files, message }] }]
const LOCAL_CHECKS = args.localChecks  // fast tier, e.g. ['pnpm lint', 'pnpm test --filter foo']
const CAP = args.roundsCap             // declared per task — never default it here
const PUSH = args.push !== false       // push per slice so CI runs async
const STANDARDS = args.standards       // the subagent-standards block, verbatim

const EVIDENCE = {
  type: 'object', required: ['summary', 'evidence', 'touchedFiles'],
  properties: {
    summary: { type: 'string' },
    evidence: { type: 'string', description: 'real command + output tail you ran' },
    touchedFiles: { type: 'array', items: { type: 'string' } },
  },
}

const VERDICT = {
  type: 'object', required: ['verdict', 'findings'],
  properties: {
    verdict: { type: 'string', description: 'your verdict scale value, verbatim' },
    findings: { type: 'array', items: { type: 'object',
      required: ['id', 'summary', 'blocking'],
      properties: {
        id: { type: 'string', description: 'stable slug: <file>-<short-issue> — reuse it when re-flagging' },
        summary: { type: 'string' },
        file: { type: 'string' },
        blocking: { type: 'boolean' },
      } } } },
}

const COMMIT_RESULT = {
  type: 'object', required: ['status'],
  properties: {
    status: { enum: ['committed', 'checks-red', 'stage-mismatch', 'push-failed'] },
    shas: { type: 'array', items: { type: 'string' } },
    detail: { type: 'string' },
  },
}

// Unparseable or missing verdict never counts as approval.
const APPROVED = {
  senior: ['SHIP IT', 'APPROVED WITH RESERVATIONS'],
  test: ['ACTUALLY GOOD', 'ACCEPTABLE'],
}
const TYPE = { senior: 'essentials:senior-engineer-reviewer', test: 'essentials:test-reviewer' }

const done = []
for (const slice of SLICES) {
  const P = 'Slice ' + slice.id

  // ---- IMPLEMENT (no commits) ----
  const impl = await agent(
    STANDARDS + '\nImplement slice ' + slice.id + ': ' + slice.planExcerpt +
    '\nRun the local checks (' + LOCAL_CHECKS.join(' && ') + ') and exercise the change end-to-end. Do NOT commit.',
    { label: 'implement:' + slice.id, model: 'sonnet', schema: EVIDENCE, phase: P })
  if (!impl) return { status: 'exception', kind: 'implementer-died', slice: slice.id, done }

  // ---- REVIEW / FIX loop: approval carryover + per-finding aging ----
  const seen = {}                              // finding.id -> times flagged
  let pending = { senior: true, test: true }   // trim per the declared reviewer set
  let firstRound = true, blockers = [], prevCount = Infinity, rounds = 0

  while (rounds < CAP) {
    rounds++
    const reviews = (await parallel(Object.keys(pending).filter(r => pending[r]).map(r => () =>
      agent(
        STANDARDS + '\n' + (firstRound
          ? 'First review — full depth: judge this slice against the whole repo.'
          : 'Re-review — delta only. Prior findings: ' + JSON.stringify(blockers)) +
        '\nReview the uncommitted diff for slice ' + slice.id + '. Implementer evidence: ' + impl.evidence,
        { label: 'review:' + r + ':' + slice.id + ':r' + rounds, agentType: TYPE[r], schema: VERDICT, phase: P })
        .then(v => v && { r, v })))).filter(Boolean)
    if (!reviews.length) return { status: 'exception', kind: 'reviewers-died', slice: slice.id, done }

    for (const { r, v } of reviews) pending[r] = !APPROVED[r].includes((v.verdict || '').trim())
    blockers = reviews.flatMap(({ v }) => (v.findings || []).filter(f => f.blocking))
    blockers.forEach(f => { seen[f.id] = (seen[f.id] || 0) + 1 })

    const aged = blockers.filter(f => seen[f.id] >= 3)   // third flag = the loop isn't converging on it
    if (aged.length) return { status: 'exception', kind: 'aged-findings', slice: slice.id, findings: aged, done }
    if (Object.values(pending).every(p => !p)) break     // all approved
    if (blockers.length >= prevCount)
      return { status: 'exception', kind: 'no-progress', slice: slice.id, findings: blockers, done }
    prevCount = blockers.length

    const fix = await agent(
      STANDARDS + '\nFix exactly these findings on slice ' + slice.id + ' (local checks green, nothing else): ' +
      JSON.stringify(blockers),
      { label: 'fix:' + slice.id + ':r' + rounds, model: 'sonnet', schema: EVIDENCE, phase: P })
    if (!fix) return { status: 'exception', kind: 'fixer-died', slice: slice.id, findings: blockers, done }

    // Fixes beyond the findings stale carried approvals: both reviewers return, full depth.
    const findingFiles = new Set(blockers.map(f => f.file).filter(Boolean))
    const beyond = (fix.touchedFiles || []).some(f => !findingFiles.has(f))
    if (beyond) { pending = { senior: true, test: true }; firstRound = true }
    else firstRound = false
  }
  if (Object.values(pending).some(p => p))
    return { status: 'exception', kind: 'rounds-cap', slice: slice.id, findings: blockers, done }

  // ---- COMMIT: cheap + deterministic; its own check run is the gate ----
  const commit = await agent(
    STANDARDS + '\nCommit slice ' + slice.id + ' mechanically:\n' +
    '1. Run: ' + LOCAL_CHECKS.join(' && ') + ' — any non-zero exit: report checks-red, commit nothing.\n' +
    '2. git status; stage EXACTLY the planned files per commit: ' + JSON.stringify(slice.commits) +
    '. Unplanned changes in the tree: report stage-mismatch, commit nothing.\n' +
    '3. Commit with the planned messages verbatim.' + (PUSH ? ' Then git push.' : ''),
    { label: 'commit:' + slice.id, model: 'haiku', schema: COMMIT_RESULT, phase: P })
  if (!commit || commit.status !== 'committed')
    return { status: 'exception', kind: 'commit-' + (commit ? commit.status : 'died'),
             slice: slice.id, detail: commit && commit.detail, done }

  done.push({ slice: slice.id, shas: commit.shas, rounds })
  log('Slice ' + slice.id + ' committed (' + rounds + ' round(s))')
}

return { status: 'complete', done }
```

After the run, the orchestrator: checks CI once on the pushed branch (if CI exists);
red → dispatch a cheap fix subagent on CI's failure output and re-enter the loop.
On any exception return: intervene, record the decision in context.md, and relaunch
with `resumeFromRunId` — completed slices replay from cache.

Parallel batches (independent slices in worktrees): wrap the per-slice body in a
function and `parallel()` over the batch, each slice's IMPLEMENT prompt pinned to its
own worktree path; merge back in slice order and treat conflicts or red post-merge
checks as an exception. Keep sequential unless independence is obvious.
