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
const CAP = args.roundsCap                    // declared per milestone — never default it here
const STANDARDS = args.standards || ''        // short orchestrator-specific notes only
let head = args.baseSha                       // commit ranges start here

const uses = (skill, when) => (SKILLS[skill] || []).includes(when)
const reviewSlices = COVER === 'slice' || COVER === 'slice+milestone'
const reviewMilestone = COVER === 'milestone' || COVER === 'slice+milestone'

// Seed refuses these too; checking here keeps a hand-edited args.json honest.
const invalid = []
if (!Number.isInteger(CAP) || CAP < 1) invalid.push('roundsCap must be a positive integer')
if (!['slice', 'slice+milestone', 'milestone'].includes(COVER)) invalid.push('reviewCover must be slice | slice+milestone | milestone')
if (REVIEWERS.some(r => !['senior', 'test'].includes(r))) invalid.push('reviewers must be a subset of senior, test')
if (!WS || !CHECK || !head || !Array.isArray(SLICES)) invalid.push('workspace, checkCommand, baseSha and slices are required')
if (uses('simplify', 'milestone') && !(reviewMilestone && REVIEWERS.length))
  invalid.push('simplify at milestone end needs reviewers at milestone end, or its commit goes unreviewed')
if (invalid.length) return { status: 'exception', kind: 'invalid-args', problems: invalid, done: [], facts: [], decisions: [] }

// ---- schemas ----
// Only status and summary are required: unfillable required fields pressure
// agents into placeholder values, and a successful StructuredOutput is final.
const IMPL = {
  type: 'object', required: ['status', 'summary'],
  properties: {
    status: { enum: ['committed', 'question', 'blocked'] },
    shas: { type: 'array', items: { type: 'string' } },
    hookLog: { type: 'string', description: 'tail of the last hook run, then git status --porcelain after the last commit' },
    redEvidence: { type: 'array', items: { type: 'string' } },
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

// ---- facts carry-forward ----
// Facts and decisions from every result ride at the END of later prompts, so
// the shared prompt prefix stays cacheable and replayed calls keep their keys.
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
const prompt = body => (STANDARDS ? STANDARDS + '\n' : '') +
  'Workspace: ' + WS + ' (read context.md there first). Commit tier: ' + CHECK + '\n' + body + carried()

const done = []
let lastHookLog = null   // the most recent hook log any committing agent reported
const exit = (kind, extra) => ({ status: 'exception', kind, ...extra, done, facts, decisions })
const lastSha = r => (r.shas && r.shas.length ? r.shas[r.shas.length - 1] : null)

// ---- review / fix loop shared by slices and the milestone end ----
// Findings age across the WHOLE milestone: deferred defects recur across slices.
const seen = {}

// reviewerSet: { key: { type?, prompt? } }. security-audit is a default subagent
// invoking the skill; the essentials reviewers are custom agentTypes.
function reviewerSet(when) {
  const set = {}
  for (const r of REVIEWERS) set[r] = { agentType: TYPE[r] }
  if (uses('security-audit', when)) set.security = { skill: 'security-audit' }
  return set
}

async function reviewLoop(scope, base, hookLog, set, P) {
  const keys = Object.keys(set)
  if (!keys.length) return { ok: true, rounds: 0, open: [] }
  let pending = Object.fromEntries(keys.map(k => [k, true]))
  let firstRound = true, prior = [], blockers = [], prevIds = null, fixRange = null
  const verdicts = {}
  let rounds = 0
  while (rounds < CAP) {
    rounds++
    const range = base + '..' + head
    const reviews = (await parallel(keys.filter(k => pending[k]).map(k => () => {
      const who = set[k]
      const body = (who.skill
          ? 'Invoke the ' + who.skill + ' skill in focused-review mode on commit range ' + range + '. Do not spawn agents. Map its results onto the verdict schema.\n'
          : '') +
        (firstRound
          ? 'First review — full depth: judge ' + scope + ' (commit range ' + range + ') against the whole repo.'
          : 'Re-review — delta only. Fix commits: ' + fixRange + '. Prior findings (reuse each id verbatim if you re-flag it): ' + JSON.stringify(prior)) +
        '\nHook log from the last commit: ' + (hookLog || '(missing — re-run the commit tier yourself)')
      return agent(prompt(body), who.agentType
        ? { label: 'review:' + k + ':' + scope + ':r' + rounds, agentType: who.agentType, schema: VERDICT, phase: P }
        : { label: 'review:' + k + ':' + scope + ':r' + rounds, schema: VERDICT, phase: P })
        .then(v => v && { k, v })
    }))).filter(Boolean)
    if (!reviews.length) return { exception: exit('reviewers-null', { scope }) }

    for (const { k, v } of reviews) { pending[k] = !isApproved(v); verdicts[k] = v.verdict; absorb(v) }
    const found = reviews.flatMap(({ v }) => v.findings || [])
    found.forEach(f => { seen[f.id] = (seen[f.id] || 0) + 1 })
    prior = found
    blockers = found.filter(f => f.blocking)

    const aged = found.filter(f => !f.standing && seen[f.id] >= 3)
    if (aged.length) return { exception: exit('aged-findings', { scope, findings: aged }) }
    if (keys.every(k => !pending[k])) return { ok: true, rounds, verdicts, open: found.filter(f => !f.blocking) }
    if (!blockers.length) return { exception: exit('rejection-without-blockers', { scope, findings: prior }) }
    const ids = blockers.map(f => f.id).sort().join('|')
    if (ids === prevIds) return { exception: exit('no-progress', { scope, findings: blockers }) }
    prevIds = ids
    if (rounds >= CAP) break

    const fixBase = head
    const fix = await agent(prompt(
      'Fix exactly these blocking findings on ' + scope + ' (commit range ' + range + '):\n' + JSON.stringify(blockers)),
      { label: 'fix:' + scope + ':r' + rounds, agentType: 'essentials:fixer', schema: IMPL, phase: P })
    if (!fix) return { exception: exit('fixer-null', { scope, findings: blockers }) }
    absorb(fix)
    if (fix.status === 'question') return { exception: exit('question', { scope, questions: fix.questions || [], summary: fix.summary }) }
    if (fix.status !== 'committed') return { exception: exit('fixer-blocked', { scope, summary: fix.summary, hookLog: fix.hookLog }) }
    head = lastSha(fix) || head
    hookLog = lastHookLog = fix.hookLog
    fixRange = fixBase + '..' + head

    // The fixer lists anything beyond the findings' files and their tests in
    // extraFiles; that stales carried approvals and brings everyone back at full depth.
    if ((fix.extraFiles || []).length) { pending = Object.fromEntries(keys.map(k => [k, true])); firstRound = true }
    else firstRound = false
  }
  return { exception: exit('rounds-cap', { scope, findings: blockers, verdicts }) }
}

async function simplify(scope, base, P) {
  const r = await agent(prompt(
    'Invoke the simplify skill on commit range ' + base + '..' + head + ' (' + scope + '). Apply its edits, then commit them through the pre-commit hook as new commits whose messages describe the change only (never --no-verify or --amend). No edits worth making → status committed with no shas.'),
    { label: 'simplify:' + scope, schema: IMPL, phase: P })
  if (!r) return exit('simplify-null', { scope })
  absorb(r)
  if (r.status !== 'committed') return exit('simplify-blocked', { scope, summary: r.summary })
  if (lastSha(r)) { head = lastSha(r); lastHookLog = r.hookLog }
  return null
}

// ---- per slice ----
for (const slice of SLICES) {
  const P = 'Slice ' + slice.id
  const base = head

  const impl = await agent(prompt(
    'Implement slice ' + slice.id + ': ' + slice.planExcerpt +
    '\nPlanned commits, in order: ' + JSON.stringify(slice.commits)),
    { label: 'implement:' + slice.id, agentType: 'essentials:implementer', schema: IMPL, phase: P })
  if (!impl) return exit('implementer-null', { slice: slice.id })
  absorb(impl)
  if (impl.status === 'question') return exit('question', { slice: slice.id, questions: impl.questions || [], summary: impl.summary })
  if (impl.status !== 'committed') return exit('implementer-blocked', { slice: slice.id, summary: impl.summary, hookLog: impl.hookLog })
  head = lastSha(impl) || head
  lastHookLog = impl.hookLog

  if (uses('simplify', 'slice')) {
    const ex = await simplify('slice ' + slice.id, base, P)
    if (ex) return ex
  }

  let result = { rounds: 0, open: [] }
  if (reviewSlices || uses('security-audit', 'slice')) {
    const set = reviewSlices ? reviewerSet('slice') : { security: { skill: 'security-audit' } }
    result = await reviewLoop('slice ' + slice.id, base, lastHookLog, set, P)
    if (result.exception) return { ...result.exception, slice: slice.id }
  }

  done.push({ slice: slice.id, base, head, rounds: result.rounds, extraFiles: impl.extraFiles || [], open: result.open })
  log('Slice ' + slice.id + ' done (' + result.rounds + ' review round(s)) at ' + head)
}

// ---- milestone end ----
const P = 'Milestone end'
const milestoneBase = args.baseSha

if (RUN_CHECK) {
  let checkRounds = 0
  for (;;) {
    checkRounds++
    const check = await agent(
      'Run exactly this command from the repo root and report the result; change nothing: rtk proxy ' + RUN_CHECK +
      '\n(rtk proxy bypasses output rewriting; if rtk is not installed, run the command directly.)' +
      '\npass is true only when the exit code is 0. tail is the last 80 lines of output.',
      { label: 'run-check:r' + checkRounds, model: 'haiku', schema: CHECK_RESULT, phase: P })
    if (!check) return exit('run-check-null', {})
    if (check.pass) break
    if (checkRounds >= CAP) return exit('run-check-red', { tail: check.tail })
    const fix = await agent(prompt(
      'The milestone run check (' + RUN_CHECK + ') is red. Fix the failures it shows, as new commits:\n' + check.tail),
      { label: 'fix:run-check:r' + checkRounds, agentType: 'essentials:fixer', schema: IMPL, phase: P })
    if (!fix) return exit('fixer-null', { scope: 'run-check' })
    absorb(fix)
    if (fix.status === 'question') return exit('question', { scope: 'run-check', questions: fix.questions || [], summary: fix.summary })
    if (fix.status !== 'committed') return exit('fixer-blocked', { scope: 'run-check', summary: fix.summary, hookLog: fix.hookLog })
    head = lastSha(fix) || head
    lastHookLog = fix.hookLog
  }
}

if (uses('simplify', 'milestone')) {
  const ex = await simplify('milestone', milestoneBase, P)
  if (ex) return ex
}

const endSet = reviewMilestone ? reviewerSet('milestone')
  : (uses('security-audit', 'milestone') ? { security: { skill: 'security-audit' } } : {})
const end = await reviewLoop('milestone', milestoneBase, lastHookLog, endSet, P)
if (end.exception) return end.exception

return { status: 'complete', done, head, milestone: { rounds: end.rounds, open: end.open || [] }, facts, decisions }
