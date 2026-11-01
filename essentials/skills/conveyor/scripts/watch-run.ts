// ABOUTME: Watches a conveyor Workflow transcript dir and prints one line per new event (started/finished/stall/long).
// ABOUTME: Run under the Monitor tool; never exits on its own — the Monitor's 30-min expiry doubles as a cache heartbeat.

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface Thresholds {
  stallMs: number;
  longTurns: number;
  longCtx: number;
}

export interface JournalState {
  // key -> { agentId, label } from "started" lines
  started: Map<string, { agentId?: string; label?: string }>;
  // keys that have a "result" line
  finished: Set<string>;
  // journal start order, so output follows the journal
  order: string[];
}

export interface AgentScan {
  turns: number;
  ctx: number;
  // tool_use ids with no tool_result whose age >= stall threshold -> { name, minutes }
  stalled: Map<string, { name: string; minutes: number }>;
}

export interface RunState {
  journal: JournalState;
  agents: Map<string, AgentScan>; // agentId -> scan
  labels: Map<string, string>; // agentId -> label
}

/** Parses JSONL text into objects, skipping blank, malformed, or partial lines. */
export function parseLines(text: string): any[] {
  const out: any[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try {
      const v = JSON.parse(line);
      if (v && typeof v === 'object') out.push(v);
    } catch {
      // partial trailing line or garbage: skip, the next poll sees the completed line
    }
  }
  return out;
}

/** Folds journal.jsonl entries into started/finished state keyed by the journal key. */
export function parseJournal(entries: any[]): JournalState {
  const state: JournalState = { started: new Map(), finished: new Set(), order: [] };
  for (const e of entries) {
    const key = e.key ?? e.agentId;
    if (typeof key !== 'string') continue;
    if (e.type === 'started') {
      if (!state.started.has(key)) state.order.push(key);
      state.started.set(key, { agentId: e.agentId, label: e.label });
    } else if (e.type === 'result') {
      if (!state.started.has(key)) {
        state.order.push(key);
        state.started.set(key, { agentId: e.agentId });
      }
      state.finished.add(key);
    }
  }
  return state;
}

/**
 * Scans an agent transcript: counts assistant turns (distinct message ids; one
 * message can span several lines), takes the latest context size from usage,
 * and lists tool_use ids still unanswered after the stall threshold.
 */
export function scanTranscript(entries: any[], nowMs: number, t: Thresholds): AgentScan {
  const turnIds = new Set<string>();
  let anonTurns = 0;
  let ctx = 0;
  const pending = new Map<string, { name: string; ts: number }>();
  const answered = new Set<string>();

  for (const e of entries) {
    const msg = e.message;
    if (!msg || typeof msg !== 'object') continue;
    const content = Array.isArray(msg.content) ? msg.content : [];
    if (e.type === 'assistant') {
      if (typeof msg.id === 'string') turnIds.add(msg.id);
      else anonTurns++;
      const u = msg.usage;
      if (u && typeof u === 'object') {
        const total =
          (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
        if (total > 0) ctx = total;
      }
      const ts = Date.parse(e.timestamp);
      for (const block of content) {
        if (block?.type === 'tool_use' && typeof block.id === 'string' && !Number.isNaN(ts)) {
          pending.set(block.id, { name: String(block.name ?? '?'), ts });
        }
      }
    } else if (e.type === 'user') {
      for (const block of content) {
        if (block?.type === 'tool_result' && typeof block.tool_use_id === 'string') {
          answered.add(block.tool_use_id);
        }
      }
    }
  }

  const stalled = new Map<string, { name: string; minutes: number }>();
  for (const [id, { name, ts }] of pending) {
    if (answered.has(id)) continue;
    const age = nowMs - ts;
    if (age >= t.stallMs) stalled.set(id, { name, minutes: Math.floor(age / 60000) });
  }
  return { turns: turnIds.size + anonTurns, ctx, stalled };
}

/** Resolves an agent's display label: meta description, then journal label, then the agent id. */
export function labelFor(agentId: string, metaDescription: string | undefined, journalLabel: string | undefined): string {
  return metaDescription || journalLabel || agentId;
}

/** Memory of what has been printed, so no event is ever emitted twice. */
export interface Emitted {
  started: Set<string>;
  finished: Set<string>;
  stalls: Set<string>; // tool_use ids
  long: Set<string>; // agent ids
}

export function newEmitted(): Emitted {
  return { started: new Set(), finished: new Set(), stalls: new Set(), long: new Set() };
}

/**
 * Diffs the next state against what was already emitted and returns new event
 * lines in a stable order (journal order; started before finished). Mutates
 * `emitted` to record what it returned.
 */
export function diffEvents(emitted: Emitted, next: RunState, t: Thresholds): string[] {
  const lines: string[] = [];
  const keyLabel = (key: string) => {
    const s = next.journal.started.get(key);
    const id = s?.agentId ?? key;
    return next.labels.get(id) ?? labelFor(id, undefined, s?.label);
  };

  for (const key of next.journal.order) {
    if (!emitted.started.has(key)) {
      emitted.started.add(key);
      lines.push(`started ${keyLabel(key)}`);
    }
    if (next.journal.finished.has(key) && !emitted.finished.has(key)) {
      emitted.finished.add(key);
      lines.push(`finished ${keyLabel(key)}`);
    }
  }

  for (const [agentId, scan] of [...next.agents].sort(([a], [b]) => a.localeCompare(b))) {
    const label = next.labels.get(agentId) ?? agentId;
    for (const [toolId, { name, minutes }] of scan.stalled) {
      if (emitted.stalls.has(toolId)) continue;
      emitted.stalls.add(toolId);
      lines.push(`stall ${label} ${name} ${minutes}min`);
    }
    if (!emitted.long.has(agentId) && (scan.turns >= t.longTurns || scan.ctx >= t.longCtx)) {
      emitted.long.add(agentId);
      lines.push(`long ${label} turns=${scan.turns} ctx=${Math.round(scan.ctx / 1000)}k`);
    }
  }
  return lines;
}

function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

/** Reads the whole transcript dir into a RunState. */
export function readRun(dir: string, nowMs: number, t: Thresholds): RunState {
  const journal = parseJournal(parseLines(readText(join(dir, 'journal.jsonl'))));
  const journalLabels = new Map<string, string>();
  for (const s of journal.started.values()) {
    if (s.agentId && s.label) journalLabels.set(s.agentId, s.label);
  }

  const agents = new Map<string, AgentScan>();
  const labels = new Map<string, string>();
  let files: string[] = [];
  try {
    files = readdirSync(dir);
  } catch {
    files = [];
  }
  for (const f of files) {
    const m = /^agent-(.+)\.jsonl$/.exec(f);
    if (!m) continue;
    const agentId = m[1];
    agents.set(agentId, scanTranscript(parseLines(readText(join(dir, f))), nowMs, t));
  }
  const ids = new Set<string>([...agents.keys(), ...journalLabels.keys()]);
  for (const agentId of ids) {
    let description: string | undefined;
    try {
      description = JSON.parse(readText(join(dir, `agent-${agentId}.meta.json`))).description;
    } catch {
      description = undefined;
    }
    labels.set(agentId, labelFor(agentId, description, journalLabels.get(agentId)));
  }
  return { journal, agents, labels };
}

function parseArgs(argv: string[]): { dir: string; t: Thresholds; pollMs: number } {
  const opts: Record<string, number> = { 'stall-min': 10, 'long-turns': 150, 'long-ctx': 250000, 'poll-ms': 5000 };
  let dir = '';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const name = a.slice(2);
      const value = Number(argv[++i]);
      if (!(name in opts) || Number.isNaN(value)) {
        console.error(`unknown or invalid option: ${a}`);
        process.exit(2);
      }
      opts[name] = value;
    } else dir = a;
  }
  if (!dir) {
    console.error('usage: bun watch-run.ts <transcriptDir> [--stall-min 10] [--long-turns 150] [--long-ctx 250000] [--poll-ms 5000]');
    process.exit(2);
  }
  return {
    dir,
    t: { stallMs: opts['stall-min'] * 60000, longTurns: opts['long-turns'], longCtx: opts['long-ctx'] },
    pollMs: opts['poll-ms'],
  };
}

async function main(): Promise<void> {
  const { dir, t, pollMs } = parseArgs(process.argv.slice(2));
  const emitted = newEmitted();
  let saidWaiting = false;
  for (;;) {
    if (!existsSync(dir)) {
      if (!saidWaiting) console.log(`waiting ${dir}`);
      saidWaiting = true;
    } else {
      for (const line of diffEvents(emitted, readRun(dir, Date.now(), t), t)) console.log(line);
    }
    await Bun.sleep(pollMs);
  }
}

if (import.meta.main) await main();
