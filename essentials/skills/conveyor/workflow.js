// ABOUTME: Canonical conveyor v2 Workflow script: per slice implement → [simplify] → review → fix, then milestone-end checks.
// ABOUTME: Copied to .conveyor/<milestone>/workflow.js and launched only by scriptPath; everything task-specific comes from args.

export const meta = {
  name: 'conveyor-run',
  description: 'Implement, review and fix every slice through the pre-commit hook; return early on exceptions',
  // No phases entry: each slice declares its own phase() group below.
}

// ---- args (written by the orchestrator at seed; see reference/workflow-skeleton.md) ----
const WS = args.workspace                     // absolute path to .conveyor/<milestone>
const SLICES = args.slices                    // [{ id, planExcerpt, commits: [{ files, message }] }]
const CHECK = args.checkCommand               // commit tier; the pre-commit hook runs it
const RUN_CHECK = args.runCheck || null       // optional run tier, once at milestone end
const REVIEWERS = args.reviewers || []        // subset of ['senior', 'test']
const COVER = args.reviewCover                // 'slice' | 'slice+milestone' | 'milestone'
const SKILLS = args.skills || {}              // { simplify?: [...], 'security-audit'?: [...] } of 'slice' | 'milestone'
const ANSWERS = args.answers || {}            // { <label of the asking call>: [answer, ...] }
const STANDARDS = args.standards || ''        // short orchestrator-specific notes only
// Rounds cap per review scope: a positive integer, or 'until-approved' (no cap;
// the no-progress and aging exits still end a loop that isn't converging).
const CAP = args.roundsCap === 'until-approved' ? Infinity : args.roundsCap
// The run check compares failures by their tail, which timings and timestamps
// defeat, so an uncapped run check still stops after 3 rounds.
const RUN_CAP = CAP === Infinity ? 3 : CAP
let head = args.baseSha                       // commit ranges start here

const uses = (skill, when) => (SKILLS[skill] || []).includes(when)
const reviewSlices = COVER === 'slice' || COVER === 'slice+milestone'
const reviewMilestone = COVER === 'milestone' || COVER === 'slice+milestone'

// Seed refuses these too; checking here keeps a hand-edited args.json honest.
const invalid = []
if (!(CAP === Infinity || (Number.isInteger(CAP) && CAP >= 1))) invalid.push("roundsCap must be a positive integer or 'until-approved'")
if (!['slice', 'slice+milestone', 'milestone'].includes(COVER)) invalid.push('reviewCover must be slice | slice+milestone | milestone')
if (REVIEWERS.some(r => !['senior', 'test'].includes(r))) invalid.push('reviewers must be a subset of senior, test')
if (!REVIEWERS.length) invalid.push('reviewers must name at least one reviewer, or commits go unreviewed')
if (!WS || !CHECK || !head || !Array.isArray(SLICES)) invalid.push('workspace, checkCommand, baseSha and slices are required')
if (uses('simplify', 'milestone') && !reviewMilestone)
  invalid.push('simplify at milestone end needs reviewers at milestone end, or its commit goes unreviewed')
if (uses('security-audit', 'slice') && !reviewSlices)
  invalid.push('security-audit per slice needs per-slice review; with milestone-only review, choose it at milestone end')
if (invalid.length) return { status: 'exception', kind: 'invalid-args', problems: invalid, done: [], head, facts: [], decisions: [] }

// ---- schemas ----
// Only status and summary are required: unfillable required fields pressure
// agents into placeholder values, and a successful StructuredOutput is final.
const IMPL = {
  type: 'object', required: ['status', 'summary'],
  properties: {
    status: { enum: ['committed', 'question', 'blocked'] },
    shas: { type: 'array', items: { type: 'string' } },
    hookLog: { type: 'string', description: 'tail of the last hook run, then git status --porcelain after the last commit' },
    redEvidence: { type: 'array', items: { type: 'object', required: ['id', 'tail'],
      properties: { id: { type: 'string', description: 'behaviour or finding id' }, tail: { type: 'string' } } } },
    extraFiles: { type: 'array', items: { type: 'object', required: ['file', 'reason'],
      properties: { file: { type: 'string' }, reason: { type: 'string' } } } },
    fixed: { type: 'array', items: { type: 'object', required: ['id', 'sha'],
      properties: { id: { type: 'string' }, sha: { type: 'string' } } } },
    facts: { type: 'array', items: { type: 'string' } },
    decisions: { type: 'array', items: { type: 'string' } },
    questions: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
}

// One shared verdict scale for every reviewer, enum-enforced.
const SCALE = ['REJECT', 'NEEDS WORK', 'APPROVED WITH RESERVATIONS', 'SHIP IT']
const VERDICT = {
  type: 'object', required: ['verdict', 'findings'],
  properties: {
    verdict: { enum: SCALE },
    findings: { type: 'array', items: { type: 'object',
      required: ['id', 'summary', 'file', 'blocking'],
      properties: {
        id: { type: 'string', description: 'stable slug: <file>-<short-issue> — reuse the exact id when re-flagging' },
        summary: { type: 'string' },
        file: { type: 'string', description: 'repo-relative path' },
        blocking: { type: 'boolean' },
        standing: { type: 'boolean', description: 'true for reservations that recur by design — exempt from aging' },
      } } },
    facts: { type: 'array', items: { type: 'string' }, description: 'reusable environment facts for context.md' },
  },
}

const CHECK_RESULT = {
  type: 'object', required: ['pass', 'tail'],
  properties: {
    pass: { type: 'boolean', description: 'true only when the command exited 0' },
    exitCode: { type: 'number' },
    tail: { type: 'string', description: 'last 80 lines of output' },
  },
}

const APPROVED = ['SHIP IT', 'APPROVED WITH RESERVATIONS']
const TYPE = { senior: 'essentials:senior-engineer-reviewer', test: 'essentials:test-reviewer' }
const isApproved = v => APPROVED.includes(v.verdict)

// ---- facts carry-forward and answers ----
// Facts and decisions from every result ride at the END of later prompts, so
// the shared prompt prefix stays cacheable and replayed calls keep their keys.
// Answers are keyed by the label of the call that asked and ride at the very
// end of that one prompt, so a resume replays every earlier call from cache
// and re-runs only the asking call onward.
const facts = []
const decisions = []
const absorb = r => {
  if (!r) return
  for (const f of r.facts || []) if (!facts.includes(f)) facts.push(f)
  for (const d of r.decisions || []) if (!decisions.includes(d)) decisions.push(d)
}
const carried = () => (facts.length || decisions.length)
  ? '\n\n## Carried facts and decisions\n' + facts.map(f => '- fact: ' + f).concat(decisions.map(d => '- decision: ' + d)).join('\n')
  : ''
const answered = key => (ANSWERS[key] || []).length
  ? '\n\n## Answers from the orchestrator\n' + ANSWERS[key].map(a => '- ' + a).join('\n')
  : ''
const prompt = (body, label) => (STANDARDS ? STANDARDS + '\n' : '') +
  'Workspace: ' + WS + ' (read context.md there first). Commit tier: ' + CHECK + '\n' + body + carried() +
  (label ? answered(label) : '')

const done = []
let lastHookLog = null   // the most recent hook log any committing agent reported
const exit = (kind, extra) => ({ status: 'exception', kind, ...extra, done, head, facts, decisions })
// Single-quotes a string for sh, so a compound Run check (a && b) runs whole under rtk proxy.
const shellQuote = s => "'" + s.replace(/'/g, "'\\''") + "'"
const lastSha = r => (r.shas && r.shas.length ? r.shas[r.shas.length - 1] : null)

// Takes a committing agent's result: records facts, moves head and the hook log.
// New commits without a hook log clear it, so reviewers re-run the commit tier
// rather than trust an older agent's log.
const landed = r => {
  absorb(r)
  if (lastSha(r)) { head = lastSha(r); lastHookLog = r.hookLog || null }
}

// Path hygiene for approval staleness: extraFiles may come back absolute or
// relative, and workspace writes never count as going beyond the findings.
const norm = p => (p || '').replace(/\\/g, '/')
const isWorkspace = p => norm(p).includes('.conveyor/')
// Same file: equal, or one is the other with leading directories (an absolute
// path vs a repo-relative one). Matching on a segment boundary keeps
// src/data.ts from passing for a.ts.
const sameFile = (a, b) => {
  const x = norm(a), y = norm(b)
  return !!x && !!y && (x === y || x.endsWith('/' + y) || y.endsWith('/' + x))
}
const beyondFindings = (extra, findings) => (extra || []).map(e => e.file)
  .filter(f => !isWorkspace(f))
  .some(f => !findings.some(x => sameFile(f, x.file)))

// ---- review / fix loop shared by slices, run-check fixes and the milestone end ----
// Findings age across the WHOLE milestone: deferred defects recur across slices.
const seen = {}

// set: { key: { agentType } | { skill } }. security-audit is a default subagent
// invoking the skill; the essentials reviewers are custom agentTypes.
function reviewerSet(when) {
  const set = {}
  for (const r of REVIEWERS) set[r] = { agentType: TYPE[r] }
  if (uses('security-audit', when)) set.security = { skill: 'security-audit' }
  return set
}

async function reviewLoop(scope, base, set, P) {
  const keys = Object.keys(set)
  if (!keys.length) return { ok: true, rounds: 0, open: [], extraFiles: [] }
  let pending = Object.fromEntries(keys.map(k => [k, true]))
  const prior = {}      // reviewer -> its own last findings
  const verdicts = {}
  const extraFiles = []
  let firstRound = true, blockers = [], prevIds = null, fixRange = null, rounds = 0
  while (rounds < CAP) {
    rounds++
    const range = base + '..' + head
    const asked = keys.filter(k => pending[k])
    const reviews = (await parallel(asked.map(k => () => {
      const who = set[k]
      const body = (who.skill
          ? 'Invoke the ' + who.skill + ' skill in focused-review mode on commit range ' + range + '. Do not spawn agents. Map its results onto the verdict schema.\n'
          : '') +
        (firstRound
          ? 'First review — full depth: judge ' + scope + ' (commit range ' + range + ') against the whole repo.'
          : 'Re-review — delta only, on ' + scope + ' (commit range ' + range + '). Fix commits: ' + fixRange + '. Your prior findings (reuse each id verbatim if you re-flag it): ' + JSON.stringify(prior[k] || [])) +
        '\nHook log from the last commit: ' + (lastHookLog || '(missing — re-run the commit tier yourself)')
      const opts = { label: 'review:' + k + ':' + scope + ':r' + rounds, schema: VERDICT, phase: P }
      if (who.agentType) opts.agentType = who.agentType
      return agent(prompt(body, opts.label), opts).then(v => v && { k, v })
    }))).filter(Boolean)
    // Any reviewer missing (died, skipped, classifier-blocked) is an exception:
    // treating its silence as approval or rejection would misreport the slice.
    const missing = asked.filter(k => !reviews.some(r => r.k === k))
    if (missing.length) return { exception: exit('reviewers-null', { scope, missing }) }

    for (const { k, v } of reviews) { pending[k] = !isApproved(v); verdicts[k] = v.verdict; prior[k] = v.findings || []; absorb(v) }
    const found = reviews.flatMap(({ v }) => v.findings || [])
    found.forEach(f => { seen[f.id] = (seen[f.id] || 0) + 1 })
    blockers = found.filter(f => f.blocking)

    const aged = found.filter(f => !f.standing && seen[f.id] >= 3)
    if (aged.length) return { exception: exit('aged-findings', { scope, findings: aged }) }
    if (keys.every(k => !pending[k]))
      return { ok: true, rounds, verdicts, extraFiles, open: Object.values(prior).flat().filter(f => !f.blocking) }
    if (!blockers.length) return { exception: exit('rejection-without-blockers', { scope, findings: found }) }
    const ids = blockers.map(f => f.id).sort().join('|')
    if (ids === prevIds) return { exception: exit('no-progress', { scope, findings: blockers }) }
    prevIds = ids
    if (rounds >= CAP) break

    const fixBase = head
    const fixLabel = 'fix:' + scope + ':r' + rounds
    const fix = await agent(prompt(
      'Fix exactly these blocking findings on ' + scope + ' (commit range ' + range + '):\n' + JSON.stringify(blockers), fixLabel),
      { label: fixLabel, agentType: 'essentials:fixer', schema: IMPL, phase: P })
    if (!fix) return { exception: exit('fixer-null', { scope, findings: blockers }) }
    if (fix.status === 'question') { absorb(fix); return { exception: exit('question', { scope, answerKey: fixLabel, questions: fix.questions || [], summary: fix.summary }) } }
    if (fix.status !== 'committed') { absorb(fix); return { exception: exit('fixer-blocked', { scope, summary: fix.summary, hookLog: fix.hookLog }) } }
    landed(fix)
    fixRange = fixBase + '..' + head
    extraFiles.push(...(fix.extraFiles || []))

    // Files beyond the findings (after path hygiene) stale carried approvals:
    // every reviewer comes back at full depth.
    if (beyondFindings(fix.extraFiles, blockers)) { pending = Object.fromEntries(keys.map(k => [k, true])); firstRound = true }
    else firstRound = false
  }
  return { exception: exit('rounds-cap', { scope, findings: blockers, verdicts }) }
}

async function simplify(scope, base, P) {
  const r = await agent(prompt(
    'Invoke the simplify skill on commit range ' + base + '..' + head + ' (' + scope + '). Apply its edits, then commit them through the pre-commit hook as new commits whose messages describe the change only (never --no-verify or --amend). No edits worth making → status committed with no shas. ' +
    'Report hookLog: the tail of the last hook run, then `git status --porcelain` after your last commit. A path you edited still showing there means the hook passed on code the commit lacks → status blocked with that output.'),
    { label: 'simplify:' + scope, schema: IMPL, phase: P })
  if (!r) return exit('simplify-null', { scope })
  if (r.status !== 'committed') { absorb(r); return exit('simplify-blocked', { scope, summary: r.summary }) }
  landed(r)
  return null
}

// ---- per slice ----
for (const slice of SLICES) {
  const P = 'Slice ' + slice.id
  const base = head

  const impl = await agent(prompt(
    'Implement slice ' + slice.id + ': ' + slice.planExcerpt +
    '\nPlanned commits, in order: ' + JSON.stringify(slice.commits), 'implement:' + slice.id),
    { label: 'implement:' + slice.id, agentType: 'essentials:implementer', schema: IMPL, phase: P })
  if (!impl) return exit('implementer-null', { slice: slice.id })
  if (impl.status === 'question') { absorb(impl); return exit('question', { slice: slice.id, answerKey: 'implement:' + slice.id, questions: impl.questions || [], summary: impl.summary }) }
  if (impl.status !== 'committed') { absorb(impl); return exit('implementer-blocked', { slice: slice.id, summary: impl.summary, hookLog: impl.hookLog }) }
  landed(impl)

  if (uses('simplify', 'slice')) {
    const ex = await simplify('slice ' + slice.id, base, P)
    if (ex) return { ...ex, slice: slice.id }
  }

  let result = { rounds: 0, open: [], extraFiles: [] }
  if (reviewSlices) {
    result = await reviewLoop('slice ' + slice.id, base, reviewerSet('slice'), P)
    if (result.exception) return { ...result.exception, slice: slice.id }
  }

  done.push({ slice: slice.id, base, head, rounds: result.rounds,
    extraFiles: (impl.extraFiles || []).concat(result.extraFiles), open: result.open })
  log('Slice ' + slice.id + ' done (' + result.rounds + ' review round(s)) at ' + head)
}

// ---- milestone end ----
const P = 'Milestone end'
const milestoneBase = args.baseSha

const runCheck = { rounds: 0, reviewRounds: 0, open: [], extraFiles: [] }
if (RUN_CHECK) {
  const checkBase = head
  let checkRounds = 0, prevTail = null
  for (;;) {
    checkRounds++
    const checkLabel = 'run-check:r' + checkRounds
    const check = await agent(
      'Run exactly this command from the repo root and report the result; change nothing: rtk proxy sh -c ' + shellQuote(RUN_CHECK) +
      '\n(rtk proxy bypasses output rewriting; if rtk is not installed, run sh -c with the same argument.)' +
      '\npass is true only when the exit code is 0. tail is the last 80 lines of output.' + answered(checkLabel),
      { label: checkLabel, model: 'haiku', schema: CHECK_RESULT, phase: P })
    if (!check) return exit('run-check-null', {})
    if (check.pass) break
    if (checkRounds >= RUN_CAP || check.tail === prevTail) return exit('run-check-red', { tail: check.tail, rounds: checkRounds })
    prevTail = check.tail
    const fixBase = head
    const fixLabel = 'fix:run-check:r' + checkRounds
    const fix = await agent(prompt(
      'The milestone run check is red. Fix exactly this finding, as new commits (commit range ' + milestoneBase + '..' + head + '):\n' +
      JSON.stringify([{ id: 'run-check-red', file: '', blocking: true, summary: RUN_CHECK + ' failed; last 80 lines:\n' + check.tail }]), fixLabel),
      { label: fixLabel, agentType: 'essentials:fixer', schema: IMPL, phase: P })
    if (!fix) return exit('fixer-null', { scope: 'run-check' })
    if (fix.status === 'question') { absorb(fix); return exit('question', { scope: 'run-check', answerKey: fixLabel, questions: fix.questions || [], summary: fix.summary }) }
    if (fix.status !== 'committed') { absorb(fix); return exit('fixer-blocked', { scope: 'run-check', summary: fix.summary, hookLog: fix.hookLog }) }
    landed(fix)
    runCheck.extraFiles.push(...(fix.extraFiles || []))
    if (head === fixBase) return exit('run-check-red', { tail: check.tail, rounds: checkRounds, summary: 'fixer committed nothing' })
  }
  // Run-check fixes are new code: without a milestone review to cover them,
  // the slice reviewers review them here so no commit goes unreviewed.
  // Known gap: fixes made by this review or the milestone review are not run
  // through the run check again; CI after push catches what they break.
  if (head !== checkBase && !reviewMilestone) {
    const r = await reviewLoop('run-check fixes', checkBase, reviewerSet('slice'), P)
    if (r.exception) return r.exception
    runCheck.reviewRounds = r.rounds
    runCheck.open = r.open
    runCheck.extraFiles.push(...r.extraFiles)
  }
  runCheck.rounds = checkRounds
}

if (uses('simplify', 'milestone')) {
  const ex = await simplify('milestone', milestoneBase, P)
  if (ex) return ex
}

const endSet = reviewMilestone ? reviewerSet('milestone')
  : (uses('security-audit', 'milestone') ? { security: { skill: 'security-audit' } } : {})
const end = await reviewLoop('milestone', milestoneBase, endSet, P)
if (end.exception) return end.exception

return { status: 'complete', done, head, runCheck, milestone: { rounds: end.rounds, open: end.open || [], extraFiles: end.extraFiles || [] }, facts, decisions }
