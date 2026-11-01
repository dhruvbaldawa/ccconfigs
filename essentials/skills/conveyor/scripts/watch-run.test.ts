// ABOUTME: Tests for the conveyor run watcher against fixture transcript dirs shaped like real Workflow output.
// ABOUTME: Covers started/finished ordering, stall and long thresholds, dedup across scans, malformed lines, and labels.

import { afterEach, describe, expect, test } from 'bun:test';
import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { diffEvents, newEmitted, readRun, type Thresholds } from './watch-run';

const T: Thresholds = { stallMs: 10 * 60000, longTurns: 150, longCtx: 250000 };
const NOW = Date.parse('2026-11-01T12:00:00.000Z');
const minsAgo = (m: number) => new Date(NOW - m * 60000).toISOString();

const dirs: string[] = [];
function runDir(): string {
  const d = mkdtempSync(join(tmpdir(), 'watch-run-'));
  dirs.push(d);
  return d;
}
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

const jl = (...objs: unknown[]) => objs.map((o) => JSON.stringify(o)).join('\n') + '\n';

function assistant(msgId: string, ts: string, blocks: unknown[], usage?: Record<string, number>) {
  return { type: 'assistant', timestamp: ts, message: { id: msgId, role: 'assistant', content: blocks, usage } };
}
function toolUse(id: string, name = 'Bash') {
  return { type: 'tool_use', id, name, input: {} };
}
function toolResult(id: string, ts: string) {
  return { type: 'user', timestamp: ts, message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: id }] } };
}
function meta(dir: string, agentId: string, description: string) {
  writeFileSync(join(dir, `agent-${agentId}.meta.json`), JSON.stringify({ description }));
}

function scan(dir: string, emitted = newEmitted(), now = NOW) {
  return diffEvents(emitted, readRun(dir, now, T), T);
}

describe('journal events', () => {
  test('started then result → one started, one finished, in order; rescan emits nothing', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'journal.jsonl'),
      jl(
        { type: 'launched' },
        { type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1', phase: 'Slice s1' },
        { type: 'result', key: 'k1', agentId: 'a1', result: { status: 'committed' }, toolsUsed: 3 },
      ),
    );
    meta(dir, 'a1', 'implement:s1');
    const emitted = newEmitted();
    expect(scan(dir, emitted)).toEqual(['started implement:s1', 'finished implement:s1']);
    expect(scan(dir, emitted)).toEqual([]);
  });

  test('started and result arriving on separate polls each emit once', () => {
    const dir = runDir();
    const journal = join(dir, 'journal.jsonl');
    writeFileSync(journal, jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'review:senior:s1:r1' }));
    const emitted = newEmitted();
    expect(scan(dir, emitted)).toEqual(['started review:senior:s1:r1']);
    appendFileSync(journal, jl({ type: 'result', key: 'k1', agentId: 'a1', result: null }));
    expect(scan(dir, emitted)).toEqual(['finished review:senior:s1:r1']);
    expect(scan(dir, emitted)).toEqual([]);
  });

  test('no meta file → label falls back to the journal label', () => {
    const dir = runDir();
    writeFileSync(join(dir, 'journal.jsonl'), jl({ type: 'started', key: 'k9', agentId: 'a9', label: 'fix:s2:r1' }));
    writeFileSync(join(dir, 'agent-a9.jsonl'), jl(assistant('m1', minsAgo(1), [{ type: 'text', text: 'hi' }])));
    expect(scan(dir)).toEqual(['started fix:s2:r1']);
  });

  test('neither meta nor journal label → agent id', () => {
    const dir = runDir();
    writeFileSync(join(dir, 'journal.jsonl'), jl({ type: 'started', key: 'k9', agentId: 'a9' }));
    expect(scan(dir)).toEqual(['started a9']);
  });

  test('meta description wins over journal label', () => {
    const dir = runDir();
    writeFileSync(join(dir, 'journal.jsonl'), jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'journal-label' }));
    meta(dir, 'a1', 'meta-label');
    expect(scan(dir)).toEqual(['started meta-label']);
  });
});

describe('stall', () => {
  function stallDir(ageMin: number) {
    const dir = runDir();
    writeFileSync(join(dir, 'journal.jsonl'), jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1' }));
    writeFileSync(join(dir, 'agent-a1.jsonl'), jl(assistant('m1', minsAgo(ageMin), [toolUse('tu1', 'Bash')])));
    return dir;
  }

  test('unanswered tool_use 9 min old → no stall', () => {
    expect(scan(stallDir(9))).toEqual(['started implement:s1']);
  });

  test('unanswered tool_use 11 min old → one stall, never repeated', () => {
    const dir = stallDir(11);
    const emitted = newEmitted();
    expect(scan(dir, emitted)).toEqual(['started implement:s1', 'stall implement:s1 Bash 11min']);
    expect(scan(dir, emitted, NOW + 5 * 60000)).toEqual([]);
  });

  test('tool_use followed by its tool_result → never a stall', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'agent-a1.jsonl'),
      jl(assistant('m1', minsAgo(60), [toolUse('tu1')]), toolResult('tu1', minsAgo(59))),
    );
    expect(scan(dir)).toEqual([]);
    expect(scan(dir, newEmitted(), NOW + 120 * 60000)).toEqual([]);
  });

  test('a fresh unanswered tool_use after an answered one: only the fresh one can stall', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'agent-a1.jsonl'),
      jl(
        assistant('m1', minsAgo(30), [toolUse('tu1', 'Read')]),
        toolResult('tu1', minsAgo(29)),
        assistant('m2', minsAgo(12), [toolUse('tu2', 'Bash')]),
      ),
    );
    meta(dir, 'a1', 'implement:s1');
    expect(scan(dir)).toEqual(['stall implement:s1 Bash 12min']);
  });
});

describe('long', () => {
  test('turns crossing 150 → one long', () => {
    const dir = runDir();
    meta(dir, 'a1', 'implement:s1');
    const path = join(dir, 'agent-a1.jsonl');
    const turns = (from: number, to: number) =>
      Array.from({ length: to - from }, (_, i) =>
        assistant(`m${from + i}`, minsAgo(1), [{ type: 'text', text: 'x' }], { input_tokens: 10 }),
      );
    writeFileSync(path, jl(...turns(0, 149)));
    const emitted = newEmitted();
    expect(scan(dir, emitted)).toEqual([]);
    appendFileSync(path, jl(...turns(149, 150)));
    expect(scan(dir, emitted)).toEqual(['long implement:s1 turns=150 ctx=0k']);
    appendFileSync(path, jl(...turns(150, 160)));
    expect(scan(dir, emitted)).toEqual([]);
  });

  test('one message split over several lines counts as one turn', () => {
    const dir = runDir();
    const lines = Array.from({ length: 200 }, () => assistant('same-id', minsAgo(1), [{ type: 'text', text: 'x' }]));
    writeFileSync(join(dir, 'agent-a1.jsonl'), jl(...lines));
    expect(scan(dir)).toEqual([]);
  });

  test('ctx crossing 250k with few turns → one long', () => {
    const dir = runDir();
    meta(dir, 'a1', 'implement:s1');
    const path = join(dir, 'agent-a1.jsonl');
    writeFileSync(
      path,
      jl(assistant('m1', minsAgo(1), [], { input_tokens: 5, cache_read_input_tokens: 200000, cache_creation_input_tokens: 40000 })),
    );
    const emitted = newEmitted();
    expect(scan(dir, emitted)).toEqual([]);
    appendFileSync(
      path,
      jl(assistant('m2', minsAgo(1), [], { input_tokens: 5, cache_read_input_tokens: 240000, cache_creation_input_tokens: 12000 })),
    );
    expect(scan(dir, emitted)).toEqual(['long implement:s1 turns=2 ctx=252k']);
    expect(scan(dir, emitted)).toEqual([]);
  });
});

describe('malformed input', () => {
  test('malformed journal and transcript lines are skipped; other events still emitted', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'journal.jsonl'),
      '{"type":"started","key":"k1","agentId":"a1","label":"implement:s1"}\n' +
        'not json at all\n' +
        '{"type":"result","key":"k1","agentId":"a1","result":{}}\n' +
        '{"type":"started","key":"k2","agentId":"a2","lab', // partial trailing line
    );
    writeFileSync(
      join(dir, 'agent-a1.jsonl'),
      '{{{garbage\n' + jl(assistant('m1', minsAgo(20), [toolUse('tu1', 'Bash')])),
    );
    meta(dir, 'a1', 'implement:s1');
    expect(scan(dir)).toEqual([
      'started implement:s1',
      'finished implement:s1',
      'stall implement:s1 Bash 20min',
    ]);
  });
});

describe('CLI', () => {
  test('missing dir prints one waiting line and keeps polling', async () => {
    const missing = join(runDir(), 'not-yet');
    const proc = Bun.spawn(['bun', join(import.meta.dir, 'watch-run.ts'), missing, '--poll-ms', '20'], {
      stdout: 'pipe',
    });
    await Bun.sleep(400);
    expect(proc.exitCode).toBeNull(); // still running
    proc.kill();
    const out = await new Response(proc.stdout).text();
    expect(out).toBe(`waiting ${missing}\n`);
  });

  test('prints events for an existing dir', async () => {
    const dir = runDir();
    writeFileSync(join(dir, 'journal.jsonl'), jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1' }));
    const proc = Bun.spawn(['bun', join(import.meta.dir, 'watch-run.ts'), dir, '--poll-ms', '20'], { stdout: 'pipe' });
    await Bun.sleep(400);
    proc.kill();
    expect(await new Response(proc.stdout).text()).toBe('started implement:s1\n');
  });
});
