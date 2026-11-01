// ABOUTME: Tests for the conveyor run watcher against fixture transcript dirs shaped like real Workflow output.
// ABOUTME: Covers started/finished ordering, stall and long thresholds, dedup across scans, malformed lines, and labels.

import { afterEach, describe, expect, test } from 'bun:test';
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  deserializeEmitted,
  diffEvents,
  newEmitted,
  readRun,
  serializeEmitted,
  STATE_FILE,
  type Thresholds,
} from './watch-run';

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
function userText(ts: string, text: string) {
  return { type: 'user', timestamp: ts, message: { role: 'user', content: text } };
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

  test('exactly at the threshold stalls; 1 ms short does not', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'agent-a1.jsonl'),
      jl(assistant('m1', new Date(NOW - T.stallMs).toISOString(), [toolUse('tu1', 'Bash')])),
    );
    meta(dir, 'a1', 'implement:s1');
    expect(scan(dir, newEmitted(), NOW - 1)).toEqual([]);
    expect(scan(dir)).toEqual(['stall implement:s1 Bash 10min']);
  });

  test('a finished agent never stalls, even with an orphaned tool_use', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'journal.jsonl'),
      jl(
        { type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1' },
        { type: 'result', key: 'k1', agentId: 'a1', result: {} },
      ),
    );
    writeFileSync(join(dir, 'agent-a1.jsonl'), jl(assistant('m1', minsAgo(30), [toolUse('tu1', 'Bash')])));
    expect(scan(dir)).toEqual(['started implement:s1', 'finished implement:s1']);
  });

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

describe('long ctx boundary', () => {
  test('ctx at exactly 250000, crossed by input_tokens → long; 249999 → none', () => {
    const at = (n: number) => {
      const dir = runDir();
      writeFileSync(
        join(dir, 'agent-a1.jsonl'),
        jl(assistant('m1', minsAgo(1), [], { input_tokens: n, cache_read_input_tokens: 200000, cache_creation_input_tokens: 49000 })),
      );
      return scan(dir);
    };
    expect(at(999)).toEqual([]);
    expect(at(1000)).toEqual(['long a1 turns=1 ctx=250k']);
  });

  test('ctx is the latest usage, not the max (compaction shrinks it)', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'agent-a1.jsonl'),
      jl(
        assistant('m1', minsAgo(2), [], { input_tokens: 300000 }),
        assistant('m2', minsAgo(1), [], { input_tokens: 100000 }),
      ),
    );
    expect(scan(dir)).toEqual([]);
  });
});

describe('ordering across keys and agents', () => {
  test('interleaved journal keeps journal order; result without started still reported', () => {
    const dir = runDir();
    writeFileSync(
      join(dir, 'journal.jsonl'),
      jl(
        { type: 'started', key: 'k1', agentId: 'a1', label: 'review:senior:s1:r1' },
        { type: 'started', key: 'k2', agentId: 'a2', label: 'review:test:s1:r1' },
        { type: 'result', key: 'k2', agentId: 'a2', result: {} },
        { type: 'result', key: 'k3', agentId: 'a3', result: {} },
      ),
    );
    writeFileSync(join(dir, 'agent-b2.jsonl'), jl(assistant('m1', minsAgo(15), [toolUse('t2', 'Read')])));
    writeFileSync(join(dir, 'agent-b1.jsonl'), jl(assistant('m1', minsAgo(20), [toolUse('t1', 'Bash')])));
    expect(scan(dir)).toEqual([
      'started review:senior:s1:r1',
      'started review:test:s1:r1',
      'finished review:test:s1:r1',
      'started a3',
      'finished a3',
      'stall b1 Bash 20min',
      'stall b2 Read 15min',
    ]);
  });
});

describe('restart and labels', () => {
  test('state survives a restart: a reloaded watcher emits nothing old, only new events', () => {
    const dir = runDir();
    const journal = join(dir, 'journal.jsonl');
    writeFileSync(journal, jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1' }));
    writeFileSync(join(dir, 'agent-a1.jsonl'), jl(assistant('m1', minsAgo(20), [toolUse('tu1')])));
    const first = newEmitted();
    expect(scan(dir, first)).toEqual(['started implement:s1', 'stall implement:s1 Bash 20min']);

    const reloaded = deserializeEmitted(serializeEmitted(first));
    expect(scan(dir, reloaded)).toEqual([]);
    appendFileSync(journal, jl({ type: 'result', key: 'k1', agentId: 'a1', result: {} }));
    expect(scan(dir, reloaded)).toEqual(['finished implement:s1']);
  });

  test('corrupt state starts fresh', () => {
    expect(deserializeEmitted('{not json')).toEqual(newEmitted());
    expect(deserializeEmitted('')).toEqual(newEmitted());
  });

  test('a meta file appearing later does not rename an agent mid-run', () => {
    const dir = runDir();
    const journal = join(dir, 'journal.jsonl');
    writeFileSync(journal, jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1' }));
    const emitted = newEmitted();
    expect(scan(dir, emitted)).toEqual(['started implement:s1']);
    meta(dir, 'a1', 'something else');
    appendFileSync(journal, jl({ type: 'result', key: 'k1', agentId: 'a1', result: {} }));
    expect(scan(dir, emitted)).toEqual(['finished implement:s1']);
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
    // the stalling agent is a2: a1 finished, and finished agents never stall
    writeFileSync(
      join(dir, 'agent-a2.jsonl'),
      '{{{garbage\n' + jl(userText(minsAgo(21), 'go'), assistant('m1', minsAgo(20), [toolUse('tu1', 'Bash')])),
    );
    meta(dir, 'a1', 'implement:s1');
    meta(dir, 'a2', 'implement:s2');
    expect(scan(dir)).toEqual([
      'started implement:s1',
      'finished implement:s1',
      'stall implement:s2 Bash 20min',
    ]);
  });
});

// Reads stdout until `want` lines have arrived (or the deadline passes), lets a
// few more polls run so any extra (wrong) line would show up too, then kills the
// watcher. `wasRunning` records that it had not exited on its own.
async function readLines(
  proc: ReturnType<typeof Bun.spawn>,
  want: number,
  settleMs = 200,
): Promise<{ lines: string[]; wasRunning: boolean }> {
  const reader = (proc.stdout as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let text = '';
  const deadline = Date.now() + 10000;
  const pump = async (until: () => boolean, stopAt: number) => {
    while (!until() && Date.now() < stopAt) {
      const chunk = await Promise.race([reader.read(), Bun.sleep(50).then(() => null)]);
      if (chunk && !chunk.done) text += decoder.decode(chunk.value);
      if (chunk?.done) break;
    }
  };
  const count = () => text.split('\n').filter(Boolean).length;
  await pump(() => count() >= want, deadline);
  await pump(() => false, Date.now() + settleMs);
  const wasRunning = proc.exitCode === null;
  proc.kill();
  return { lines: text.split('\n').filter(Boolean), wasRunning };
}

const WATCHER = join(import.meta.dir, 'watch-run.ts');

describe('CLI', () => {
  test('missing dir prints one waiting line and keeps polling', async () => {
    const missing = join(runDir(), 'not-yet');
    const proc = Bun.spawn(['bun', WATCHER, missing, '--poll-ms', '20'], { stdout: 'pipe' });
    const { lines, wasRunning } = await readLines(proc, 1);
    expect(wasRunning).toBe(true);
    expect(lines).toEqual([`waiting ${missing}`]);
  });

  test('prints events, persists state, and a relaunch replays nothing', async () => {
    const dir = runDir();
    writeFileSync(join(dir, 'journal.jsonl'), jl({ type: 'started', key: 'k1', agentId: 'a1', label: 'implement:s1' }));
    const first = Bun.spawn(['bun', WATCHER, dir, '--poll-ms', '20'], { stdout: 'pipe' });
    expect((await readLines(first, 1)).lines).toEqual(['started implement:s1']);
    await first.exited;
    expect(deserializeEmitted(readFileSync(join(dir, STATE_FILE), 'utf8')).started.has('k1')).toBe(true);

    appendFileSync(join(dir, 'journal.jsonl'), jl({ type: 'result', key: 'k1', agentId: 'a1', result: {} }));
    const second = Bun.spawn(['bun', WATCHER, dir, '--poll-ms', '20'], { stdout: 'pipe' });
    expect((await readLines(second, 1)).lines).toEqual(['finished implement:s1']);
  });

  test('rejects a non-positive --poll-ms', async () => {
    const proc = Bun.spawn(['bun', WATCHER, runDir(), '--poll-ms', '0'], { stdout: 'pipe', stderr: 'pipe' });
    expect(await proc.exited).toBe(2);
  });
});
