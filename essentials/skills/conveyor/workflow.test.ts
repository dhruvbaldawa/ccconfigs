// ABOUTME: Tests the conveyor workflow script's control flow by running its body with a stubbed agent() and recording calls.
// ABOUTME: Covers slices, questions, fix loops, rounds cap, no-progress, aging, simplify, review cover, security-audit, facts, run check.

import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const SOURCE = readFileSync(join(import.meta.dir, 'workflow.js'), 'utf8');

/** The script body without its `export const meta = {…}` block (a pure literal ending at a line `}`). */
function body(): string {
  const start = SOURCE.indexOf('export const meta = {');
  if (start < 0) throw new Error('meta block not found');
  const end = SOURCE.indexOf('\n}\n', start);
  return SOURCE.slice(0, start) + SOURCE.slice(end + 3);
}

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

interface Call {
  label: string;
  prompt: string;
  opts: Record<string, any>;
}

type Responder = (call: Call, nth: number) => any;

/**
 * Runs the workflow with responders keyed by label prefix (longest prefix
 * wins). Each responder gets the call and how many earlier calls matched the
 * same prefix, so a test can script round-by-round answers.
 */
async function run(args: Record<string, any>, responders: Record<string, Responder>) {
  const calls: Call[] = [];
  const counts: Record<string, number> = {};
  const agent = async (prompt: string, opts: Record<string, any> = {}) => {
    const call = { label: opts.label ?? '', prompt, opts };
    calls.push(call);
    const prefix = Object.keys(responders)
      .filter((p) => call.label.startsWith(p))
      .sort((a, b) => b.length - a.length)[0];
    if (!prefix) throw new Error(`no responder for ${call.label}`);
    const nth = counts[prefix] ?? 0;
    counts[prefix] = nth + 1;
    return responders[prefix](call, nth);
  };
  const parallel = (thunks: Array<() => Promise<any>>) => Promise.all(thunks.map((t) => t().catch(() => null)));
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', body());
  const result = await fn(agent, parallel, undefined, () => {}, () => {}, args);
  return { result, calls, labels: calls.map((c) => c.label) };
}

const SLICE = (id: string) => ({ id, planExcerpt: `do ${id}`, commits: [{ files: [`${id}.ts`], message: `feat: ${id}` }] });
const ARGS = (over: Record<string, any> = {}) => ({
  workspace: '/repo/.conveyor/m1',
  baseSha: 'base0',
  slices: [SLICE('s1'), SLICE('s2')],
  checkCommand: 'make check',
  reviewers: ['senior', 'test'],
  reviewCover: 'slice',
  skills: {},
  roundsCap: 2,
  ...over,
});

let shaN = 0;
const committed = (extra: Record<string, any> = {}) => ({
  status: 'committed',
  shas: [`sha${++shaN}`],
  hookLog: 'hook: ok',
  summary: 'done',
  ...extra,
});
const ship = { verdict: 'SHIP IT', findings: [] };
const needsWork = (...ids: string[]) => ({
  verdict: 'NEEDS WORK',
  findings: ids.map((id) => ({ id, summary: `problem ${id}`, file: `${id}.ts`, blocking: true })),
});

const ok: Record<string, Responder> = {
  'implement:': () => committed(),
  'review:': () => ship,
  'fix:': () => committed(),
  'simplify:': () => committed(),
};

describe('slices', () => {
  test('happy path, 2 slices: implementer → reviewers → next slice; no commit agent', async () => {
    const { result, calls, labels } = await run(ARGS(), ok);
    expect(result.status).toBe('complete');
    expect(labels).toEqual([
      'implement:s1',
      'review:senior:slice s1:r1',
      'review:test:slice s1:r1',
      'implement:s2',
      'review:senior:slice s2:r1',
      'review:test:slice s2:r1',
    ]);
    expect(calls.filter((c) => c.label.startsWith('implement:')).every((c) => c.opts.agentType === 'essentials:implementer')).toBe(true);
    expect(labels.some((l) => l.startsWith('commit:'))).toBe(false);
    expect(result.done.map((d: any) => d.slice)).toEqual(['s1', 's2']);
  });

  test('reviewers get the slice commit range and the hook log', async () => {
    const { calls } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'implement:': () => ({ ...committed(), shas: ['a1', 'a2'], hookLog: 'HOOK-TAIL' }),
    });
    const review = calls.find((c) => c.label === 'review:senior:slice s1:r1')!;
    expect(review.prompt).toContain('base0..a2');
    expect(review.prompt).toContain('HOOK-TAIL');
    expect(review.opts.agentType).toBe('essentials:senior-engineer-reviewer');
  });

  test('implementer question → question exception; no reviewer call for that slice', async () => {
    const { result, labels } = await run(ARGS(), {
      ...ok,
      'implement:': () => ({ status: 'question', questions: ['which API?'], summary: 'unsure' }),
    });
    expect(result).toMatchObject({ status: 'exception', kind: 'question', slice: 's1', questions: ['which API?'] });
    expect(labels).toEqual(['implement:s1']);
  });

  test('implementer blocked → implementer-blocked exception', async () => {
    const { result } = await run(ARGS(), { ...ok, 'implement:': () => ({ status: 'blocked', summary: 'red', hookLog: 'boom' }) });
    expect(result).toMatchObject({ kind: 'implementer-blocked', slice: 's1', hookLog: 'boom' });
  });
});

describe('fix loop', () => {
  test('NEEDS WORK with a blocker → fixer gets exactly the blockers → re-review → approved', async () => {
    const { result, calls, labels } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'review:senior:': (_c, n) =>
        n === 0
          ? {
              verdict: 'NEEDS WORK',
              findings: [
                { id: 'a-bug', summary: 'bug', file: 'a.ts', blocking: true },
                { id: 'a-nit', summary: 'nit', file: 'a.ts', blocking: false },
              ],
            }
          : ship,
    });
    expect(result.status).toBe('complete');
    expect(labels).toEqual([
      'implement:s1',
      'review:senior:slice s1:r1',
      'review:test:slice s1:r1',
      'fix:slice s1:r1',
      'review:senior:slice s1:r2', // approval carries: only the rejecting reviewer returns
    ]);
    const fix = calls.find((c) => c.label === 'fix:slice s1:r1')!;
    expect(fix.opts.agentType).toBe('essentials:fixer');
    const sent = JSON.parse(fix.prompt.slice(fix.prompt.indexOf('[{'), fix.prompt.lastIndexOf('}]') + 2));
    expect(sent.map((f: any) => f.id)).toEqual(['a-bug']);
  });

  test('fixer extraFiles stale carried approvals: every reviewer returns', async () => {
    const { labels } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'review:senior:': (_c, n) => (n === 0 ? needsWork('x') : ship),
      'fix:': () => committed({ extraFiles: [{ file: 'other.ts', reason: 'needed' }] }),
    });
    expect(labels.filter((l) => l.endsWith(':r2'))).toEqual(['review:senior:slice s1:r2', 'review:test:slice s1:r2']);
  });

  test('rounds cap 2 with a different blocker set each round → rounds-cap', async () => {
    const { result, labels } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'review:senior:': (_c, n) => needsWork(`f${n}`),
    });
    expect(result).toMatchObject({ status: 'exception', kind: 'rounds-cap', slice: 's1' });
    expect(labels.filter((l) => l.startsWith('review:senior:'))).toHaveLength(2);
    expect(labels.filter((l) => l.startsWith('fix:'))).toHaveLength(1);
  });

  test('roundsCap 3 allows a third review round', async () => {
    const { result } = await run(ARGS({ slices: [SLICE('s1')], roundsCap: 3 }), {
      ...ok,
      'review:senior:': (_c, n) => (n < 2 ? needsWork(`f${n}`) : ship),
    });
    expect(result.status).toBe('complete');
  });

  test('same blocker set twice → no-progress', async () => {
    const { result } = await run(ARGS({ slices: [SLICE('s1')], roundsCap: 3 }), {
      ...ok,
      'review:senior:': () => needsWork('same'),
    });
    expect(result).toMatchObject({ kind: 'no-progress', slice: 's1' });
  });

  test('rejection with no blocking findings → rejection-without-blockers', async () => {
    const { result, labels } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'review:senior:': () => ({ verdict: 'REJECT', findings: [] }),
    });
    expect(result).toMatchObject({ kind: 'rejection-without-blockers' });
    expect(labels.some((l) => l.startsWith('fix:'))).toBe(false);
  });

  test('a finding flagged three times across slices → aged-findings; a standing one does not age', async () => {
    const reservation = (standing: boolean) => ({
      verdict: 'APPROVED WITH RESERVATIONS',
      findings: [{ id: 'r1', summary: 'meh', file: 'a.ts', blocking: false, standing }],
    });
    const three = ARGS({ slices: [SLICE('s1'), SLICE('s2'), SLICE('s3')], reviewers: ['senior'] });

    const aging = await run(three, { ...ok, 'review:senior:': () => reservation(false) });
    expect(aging.result).toMatchObject({ kind: 'aged-findings', slice: 's3' });

    const standing = await run(three, { ...ok, 'review:senior:': () => reservation(true) });
    expect(standing.result.status).toBe('complete');
  });

  test('fixer question → question exception with the scope', async () => {
    const { result } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'review:senior:': () => needsWork('x'),
      'fix:': () => ({ status: 'question', questions: ['is x real?'], summary: 'doubt' }),
    });
    expect(result).toMatchObject({ kind: 'question', scope: 'slice s1', questions: ['is x real?'] });
  });
});

describe('skills and cover', () => {
  test('simplify per slice runs after the implementer and before every reviewer of that slice', async () => {
    const { labels } = await run(ARGS({ skills: { simplify: ['slice'] } }), ok);
    for (const s of ['s1', 's2']) {
      const impl = labels.indexOf(`implement:${s}`);
      const simp = labels.indexOf(`simplify:slice ${s}`);
      const reviews = labels.map((l, i) => (l.startsWith('review:') && l.includes(`slice ${s}:`) ? i : -1)).filter((i) => i >= 0);
      expect(impl).toBeGreaterThanOrEqual(0);
      expect(simp).toBeGreaterThan(impl);
      expect(reviews.length).toBeGreaterThan(0);
      expect(reviews.every((i) => i > simp)).toBe(true);
    }
  });

  test('reviewCover milestone → no per-slice reviews; one milestone review at the end', async () => {
    const { result, labels } = await run(ARGS({ reviewCover: 'milestone' }), ok);
    expect(result.status).toBe('complete');
    expect(labels).toEqual(['implement:s1', 'implement:s2', 'review:senior:milestone:r1', 'review:test:milestone:r1']);
    expect(result.milestone.rounds).toBe(1);
  });

  test('milestone review covers the whole milestone range', async () => {
    const { calls } = await run(ARGS({ reviewCover: 'milestone' }), ok);
    const last = calls.filter((c) => c.label.startsWith('implement:')).length;
    expect(last).toBe(2);
    expect(calls.find((c) => c.label === 'review:senior:milestone:r1')!.prompt).toMatch(/base0\.\.sha\d+/);
  });

  test("security-audit ['milestone'] → called once, at milestone end only", async () => {
    const { labels } = await run(ARGS({ skills: { 'security-audit': ['milestone'] } }), ok);
    const sec = labels.filter((l) => l.startsWith('review:security:'));
    expect(sec).toEqual(['review:security:milestone:r1']);
    expect(labels.indexOf('review:security:milestone:r1')).toBe(labels.length - 1);
  });

  test("security-audit ['slice'] joins each slice's review as a default subagent", async () => {
    const { calls } = await run(ARGS({ skills: { 'security-audit': ['slice'] } }), ok);
    const sec = calls.filter((c) => c.label.startsWith('review:security:'));
    expect(sec.map((c) => c.label)).toEqual(['review:security:slice s1:r1', 'review:security:slice s2:r1']);
    expect(sec.every((c) => c.opts.agentType === undefined && c.prompt.includes('security-audit'))).toBe(true);
  });

  test('simplify at milestone end without milestone reviewers → invalid-args, nothing launched', async () => {
    const { result, labels } = await run(ARGS({ skills: { simplify: ['milestone'] }, reviewCover: 'slice' }), ok);
    expect(result).toMatchObject({ status: 'exception', kind: 'invalid-args' });
    expect(labels).toEqual([]);
  });

  test('roundsCap is never defaulted', async () => {
    const { result, labels } = await run(ARGS({ roundsCap: undefined }), ok);
    expect(result.kind).toBe('invalid-args');
    expect(labels).toEqual([]);
  });
});

describe('facts carry-forward', () => {
  test("slice 1's facts appear at the end of slice 2's implementer prompt, not in slice 1's", async () => {
    const { calls } = await run(ARGS(), {
      ...ok,
      'implement:': (c) => (c.label === 'implement:s1' ? committed({ facts: ['FACT-ONE'], decisions: ['DEC-ONE'] }) : committed()),
    });
    const p1 = calls.find((c) => c.label === 'implement:s1')!.prompt;
    const p2 = calls.find((c) => c.label === 'implement:s2')!.prompt;
    expect(p1).not.toContain('FACT-ONE');
    expect(p2).toContain('FACT-ONE');
    expect(p2).toContain('DEC-ONE');
    // at the END: the slice-specific text comes before the carried block
    expect(p2.indexOf('FACT-ONE')).toBeGreaterThan(p2.indexOf('Implement slice s2'));
    expect(p2.trimEnd().endsWith('decision: DEC-ONE')).toBe(true);
  });

  test('reviewer facts are carried and returned', async () => {
    const { result } = await run(ARGS({ slices: [SLICE('s1')] }), {
      ...ok,
      'review:test:': () => ({ ...ship, facts: ['REVIEW-FACT'] }),
    });
    expect(result.facts).toContain('REVIEW-FACT');
  });

  test('exceptions carry the facts gathered so far', async () => {
    const { result } = await run(ARGS(), {
      ...ok,
      'implement:': (c) => (c.label === 'implement:s1' ? committed({ facts: ['F1'] }) : { status: 'blocked', summary: 'x' }),
    });
    expect(result.kind).toBe('implementer-blocked');
    expect(result.facts).toEqual(['F1']);
  });
});

describe('run check', () => {
  test('red → fixer with the tail → run check again → green', async () => {
    const { result, calls, labels } = await run(ARGS({ slices: [SLICE('s1')], runCheck: 'make check-run' }), {
      ...ok,
      'run-check:': (_c, n) => (n === 0 ? { pass: false, tail: 'TAIL-RED' } : { pass: true, tail: 'ok' }),
    });
    expect(result.status).toBe('complete');
    expect(labels.slice(-3)).toEqual(['run-check:r1', 'fix:run-check:r1', 'run-check:r2']);
    expect(calls.find((c) => c.label === 'fix:run-check:r1')!.prompt).toContain('TAIL-RED');
    const check = calls.find((c) => c.label === 'run-check:r1')!;
    expect(check.opts.model).toBe('haiku');
    expect(check.prompt).toContain('rtk proxy make check-run');
  });

  test('red past the rounds cap → run-check-red', async () => {
    const { result, labels } = await run(ARGS({ slices: [SLICE('s1')], runCheck: 'make check-run' }), {
      ...ok,
      'run-check:': () => ({ pass: false, tail: 'still red' }),
    });
    expect(result).toMatchObject({ kind: 'run-check-red', tail: 'still red' });
    expect(labels.filter((l) => l.startsWith('run-check:'))).toHaveLength(2);
  });
});

describe('schemas', () => {
  test('every schema passed to agent() has type object and required ⊆ properties', async () => {
    const { calls } = await run(
      ARGS({ skills: { simplify: ['slice'], 'security-audit': ['slice'] }, reviewCover: 'slice+milestone', runCheck: 'x' }),
      {
        ...ok,
        'run-check:': () => ({ pass: true, tail: '' }),
        'review:senior:slice s1': (_c, n) => (n === 0 ? needsWork('q') : ship),
      },
    );
    const schemas = calls.map((c) => c.opts.schema);
    expect(schemas.every(Boolean)).toBe(true);
    const check = (s: any): void => {
      expect(s.type).toBe('object');
      for (const r of s.required ?? []) expect(Object.keys(s.properties)).toContain(r);
      for (const p of Object.values<any>(s.properties)) {
        if (p.type === 'object') check(p);
        if (p.type === 'array' && p.items?.type === 'object') check(p.items);
      }
    };
    new Set(schemas).forEach(check);
    expect(new Set(schemas).size).toBeGreaterThanOrEqual(3); // IMPL, VERDICT, CHECK_RESULT
  });
});
