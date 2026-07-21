# Conveyor workflow skeleton

Canonical per-run script: every slice in-band (implement → review → fix → commit),
early return on exceptions, resume-friendly. Adapt it — don't re-derive the control
flow; the null-guards, carryover, finding-aging, and path-hygiene logic below are
the parts authored-from-scratch scripts get wrong. Everything task-specific lives
in `args`, never in the script body: interventions resume with changed args instead
of script surgery, and unchanged slices still replay from cache.

```js
export const meta = {
  name: 'conveyor-run',
  description: 'Implement, review, fix, commit every slice in-band; return early on exceptions',
  // No phases entry: each slice declares its own phase() group below. If you do
  // list meta.phases, the titles must match the phase strings EXACTLY.
}

// ---- from context.md mechanics, passed via args ----
const WS = args.workspace              // '.conveyor/<task-slug>'
const SLICES = args.slices             // [{ id, planExcerpt, commits: [{ files, message }] }]
const LOCAL_CHECKS = args.localChecks  // pre-flighted at seed: only checks that can actually run here
const CAP = args.roundsCap             // declared per task — never default it here
const PUSH = args.push !== false       // push per slice so CI runs async
const STANDARDS = args.standards       // the subagent-standards block, verbatim

// Only `summary` is required: unfillable required fields pressure agents into
// placeholder values, and a successful StructuredOutput call is final.
const EVIDENCE = {
  type: 'object', required: ['summary'],
  properties: {
    summary: { type: 'string' },
    evidence: { type: 'string', description: 'real command + output tail you ran' },
    touchedFiles: { type: 'array', items: { type: 'string' }, description: 'repo-relative paths' },
    extraFiles: { type: 'array', description: 'files the plan missed but the slice genuinely needs — reviewers gate the addition',
      items: { type: 'object', required: ['file', 'reason'],
        properties: { file: { type: 'string' }, reason: { type: 'string' } } } },
  },
}

const VERDICT = {
  type: 'object', required: ['approved', 'verdict', 'findings'],
  properties: {
    approved: { type: 'boolean', description: 'true ONLY if your verdict is an approving value on your scale' },
    verdict: { type: 'string', description: 'your verdict scale value, verbatim' },
    findings: { type: 'array', items: { type: 'object',
      required: ['id', 'summary', 'file', 'blocking'],
      properties: {
        id: { type: 'string', description: 'stable slug: <file>-<short-issue> — reuse the exact id when re-flagging' },
        summary: { type: 'string' },
        file: { type: 'string', description: 'repo-relative path' },
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

// Approval needs BOTH the boolean and an on-scale verdict string — a creative
// label or a mismatched pair is a rejection, never a silent pass.
const APPROVED = {
  senior: ['SHIP IT', 'APPROVED WITH RESERVATIONS'],
  test: ['ACTUALLY GOOD', 'ACCEPTABLE'],
}
const TYPE = { senior: 'essentials:senior-engineer-reviewer', test: 'essentials:test-reviewer' }
const isApproved = (r, v) => v.approved === true && APPROVED[r].includes((v.verdict || '').trim())

// Path hygiene for the carryover-staleness test: touched files come back absolute,
// finding files repo-relative — compare by suffix, and workspace/bookkeeping
// writes never count as going beyond the findings.
const norm = p => (p || '').replace(/\\/g, '/')
const isWorkspace = p => norm(p).includes('.conveyor/')
const sameFile = (a, b) => norm(a).endsWith(norm(b)) || norm(b).endsWith(norm(a))

const done = []
for (const slice of SLICES) {
  const P = 'Slice ' + slice.id

  // ---- IMPLEMENT (no commits) ----
  const impl = await agent(
    STANDARDS + '\nImplement slice ' + slice.id + ': ' + slice.planExcerpt +
    '\nRun the local checks (' + LOCAL_CHECKS.join(' && ') + ') and exercise the change end-to-end. Do NOT commit.' +
    '\nIf the planned file list is wrong, list the additions under extraFiles with reasons — never expand silently.',
    { label: 'implement:' + slice.id, model: 'sonnet', schema: EVIDENCE, phase: P })
  // agent() returns null for a dead OR classifier-blocked subagent — check the
  // run's progress errors before assuming a crash.
  if (!impl) return { status: 'exception', kind: 'implementer-null', slice: slice.id, done }

  let lastEvidence = impl.evidence || impl.summary   // re-reviews must see the LATEST evidence
  let extras = impl.extraFiles || []

  // ---- REVIEW / FIX loop: approval carryover + per-finding aging ----
  const seen = {}                              // finding.id -> times flagged — ALL findings, not just blockers
  const verdicts = {}                          // reviewer -> last verdict string, for the ledger
  let pending = { senior: true, test: true }   // trim per the declared reviewer set
  let firstRound = true, prior = [], blockers = [], prevIds = null, rounds = 0

  while (rounds < CAP) {
    rounds++
    const reviews = (await parallel(Object.keys(pending).filter(r => pending[r]).map(r => () =>
      agent(
        STANDARDS + '\n' + (firstRound
          ? 'First review — full depth: judge this slice against the whole repo.'
          : 'Re-review — delta only. Prior findings (reuse each id verbatim if you re-flag it): ' + JSON.stringify(prior)) +
        '\nReview the uncommitted diff for slice ' + slice.id + '. Latest evidence: ' + lastEvidence +
        (extras.length ? '\nThe implementer proposes adding these files to the planned commit set — approve or flag: ' + JSON.stringify(extras) : '') +
        '\nThe commit agent re-runs all local checks as the gate; re-run one yourself only if the evidence is stale, incomplete, or doubted.',
        { label: 'review:' + r + ':' + slice.id + ':r' + rounds, agentType: TYPE[r], schema: VERDICT, phase: P })
        .then(v => v && { r, v })))).filter(Boolean)
    if (!reviews.length) return { status: 'exception', kind: 'reviewers-null', slice: slice.id, done }

    for (const { r, v } of reviews) { pending[r] = !isApproved(r, v); verdicts[r] = v.verdict }
    const found = reviews.flatMap(({ v }) => v.findings || [])
    found.forEach(f => { seen[f.id] = (seen[f.id] || 0) + 1 })
    prior = found
    blockers = found.filter(f => f.blocking)

    // Aging covers EVERY finding: a perpetually-non-blocking finding re-flagged a
    // third time is the loop failing to converge, exactly like a blocker.
    const aged = found.filter(f => seen[f.id] >= 3)
    if (aged.length) return { status: 'exception', kind: 'aged-findings', slice: slice.id, findings: aged, done }
    if (Object.values(pending).every(p => !p)) break     // all approved
    const ids = blockers.map(f => f.id).sort().join('|')
    if (ids && ids === prevIds)                          // identical blocker set = spinning, regardless of count
      return { status: 'exception', kind: 'no-progress', slice: slice.id, findings: blockers, done }
    prevIds = ids

    const fix = await agent(
      STANDARDS + '\nFix exactly these findings on slice ' + slice.id + ' (local checks green, nothing else): ' +
      JSON.stringify(blockers),
      { label: 'fix:' + slice.id + ':r' + rounds, model: 'sonnet', schema: EVIDENCE, phase: P })
    if (!fix) return { status: 'exception', kind: 'fixer-null', slice: slice.id, findings: blockers, done }
    lastEvidence = fix.evidence || fix.summary
    extras = extras.concat(fix.extraFiles || [])

    // Fixes beyond the findings stale carried approvals: both reviewers return, full depth.
    const findingFiles = blockers.map(f => f.file).filter(Boolean)
    const beyond = (fix.touchedFiles || []).filter(t => !isWorkspace(t))
      .some(t => !findingFiles.some(f => sameFile(t, f)))
    if (beyond) { pending = { senior: true, test: true }; firstRound = true }
    else firstRound = false
  }
  if (Object.values(pending).some(p => p))
    return { status: 'exception', kind: 'rounds-cap', slice: slice.id, findings: blockers, done }

  // ---- COMMIT: cheap + deterministic; its own check run is the gate ----
  // The ledger is the deterministic review record — reviewers' own context.md
  // appends are optional detail; this write is not.
  const ledger = '\n### Slice ' + slice.id + ' — review ledger (harness-recorded)\n' +
    'Rounds: ' + rounds + '. Verdicts: ' + JSON.stringify(verdicts) + '.\n' +
    'Findings seen (id -> times flagged): ' + JSON.stringify(seen) + '\n' +
    'Open non-blocking findings (need an owner in the report): ' +
    JSON.stringify(prior.filter(f => !f.blocking)) + '\n'
  const commit = await agent(
    STANDARDS + '\nCommit slice ' + slice.id + ' mechanically:\n' +
    '0. Append this block verbatim to ' + WS + '/context.md:\n' + ledger +
    '1. Run: ' + LOCAL_CHECKS.join(' && ') + ' — any non-zero exit: report checks-red, commit nothing.\n' +
    '2. git status; stage EXACTLY the planned files per commit: ' + JSON.stringify(slice.commits) +
    (extras.length ? ' plus these reviewer-approved additions (stage with the last commit): ' + JSON.stringify(extras.map(e => e.file)) : '') +
    '. Anything else in the tree: report stage-mismatch, commit nothing.\n' +
    '3. Commit with the planned messages verbatim.' + (PUSH ? ' Then git push.' : ''),
    { label: 'commit:' + slice.id, model: 'haiku', schema: COMMIT_RESULT, phase: P })
  if (!commit || commit.status !== 'committed')
    return { status: 'exception', kind: 'commit-' + (commit ? commit.status : 'null'),
             slice: slice.id, detail: commit && commit.detail, done }

  done.push({ slice: slice.id, shas: commit.shas, rounds })
  log('Slice ' + slice.id + ' committed (' + rounds + ' round(s))')
}

return { status: 'complete', done }
```

After the run, the orchestrator: checks CI once on the pushed branch (if CI exists);
red → dispatch a cheap fix subagent on CI's failure output and re-enter the loop.
On any exception return: intervene, record the decision in context.md, and relaunch
with `resumeFromRunId` — completed slices replay from cache. To drop or change a
slice, change `args` and resume; never edit the script body (an edited agent-call
prompt invalidates the cache from that call onward, changed args only re-run the
slices they alter).

Parallel batches (independent slices in worktrees): wrap the per-slice body in a
function and `parallel()` over the batch, each slice's IMPLEMENT prompt pinned to its
own worktree path; merge back in slice order and treat conflicts or red post-merge
checks as an exception. Keep sequential unless independence is obvious.
