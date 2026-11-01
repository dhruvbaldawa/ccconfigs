// ABOUTME: Watches a conveyor Workflow transcript dir and prints one line per new event (started/finished/stall/long).
// ABOUTME: Runs under Monitor and never exits; state persists across the Monitor's 30-min relaunches (the cache heartbeat).

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Default state file name, kept inside the transcript dir so each run has its own.
export const STATE_FILE = '.watch-run-state.json';

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
  let ctx = 0;
  const pending = new Map<string, { name: string; ts: number }>();
  const answered = new Set<string>();

  for (const e of entries) {
    const msg = e.message;
    if (!msg || typeof msg !== 'object') continue;
    const content = Array.isArray(msg.content) ? msg.content : [];
    if (e.type === 'assistant') {
      if (typeof msg.id === 'string') turnIds.add(msg.id);
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
  return { turns: turnIds.size, ctx, stalled };
}

/** Resolves an agent's display label: meta description, then journal label, then the agent id. */
export function labelFor(agentId: string, metaDescription: string | undefined, journalLabel: string | undefined): string {
  return metaDescription || journalLabel || agentId;
}

/**
 * Memory of what has been printed, so no event is ever emitted twice. It is
 * persisted to a state file because the Monitor relaunches the watcher every
 * 30 min; without it each relaunch would replay the whole run's history.
 */
export interface Emitted {
  started: Set<string>;
  finished: Set<string>;
  stalls: Set<string>; // tool_use ids
  long: Set<string>; // agent ids
  // agentId or journal key -> label used on the first line printed for it, so
  // a meta file appearing later can't rename an agent mid-run
  labels: Map<string, string>;
}

export function newEmitted(): Emitted {
  return { started: new Set(), finished: new Set(), stalls: new Set(), long: new Set(), labels: new Map() };
}

/** Serializes Emitted to JSON text for the state file. */
export function serializeEmitted(e: Emitted): string {
  return JSON.stringify({
    started: [...e.started],
    finished: [...e.finished],
    stalls: [...e.stalls],
    long: [...e.long],
    labels: [...e.labels],
  });
}

/** Loads Emitted from state-file text; missing or corrupt state starts fresh. */
export function deserializeEmitted(text: string): Emitted {
  try {
    const v = JSON.parse(text);
    return {
      started: new Set(v.started),
      finished: new Set(v.finished),
      stalls: new Set(v.stalls),
      long: new Set(v.long),
      labels: new Map(v.labels),
    };
  } catch {
    return newEmitted();
  }
}

/**
 * Diffs the next state against what was already emitted and returns new event
 * lines in a stable order (journal order; started before finished). Mutates
 * `emitted` to record what it returned.
 */
export function diffEvents(emitted: Emitted, next: RunState, t: Thresholds): string[] {
  const lines: string[] = [];
  const stableLabel = (id: string, fresh: string) => {
    if (!emitted.labels.has(id)) emitted.labels.set(id, fresh);
    return emitted.labels.get(id)!;
  };
  const keyLabel = (key: string) => {
    const s = next.journal.started.get(key);
    const id = s?.agentId ?? key;
    return stableLabel(id, next.labels.get(id) ?? labelFor(id, undefined, s?.label));
  };
  // A finished agent can't stall or grow; its orphaned tool_uses (killed or
  // cancelled calls) must not raise alarms.
  const finishedAgents = new Set<string>();
  for (const key of next.journal.finished) finishedAgents.add(next.journal.started.get(key)?.agentId ?? key);

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
    if (finishedAgents.has(agentId)) continue;
    const label = stableLabel(agentId, next.labels.get(agentId) ?? agentId);
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

function parseArgs(argv: string[]): { dir: string; t: Thresholds; pollMs: number; statePath: string } {
  const opts: Record<string, number> = { 'stall-min': 10, 'long-turns': 150, 'long-ctx': 250000, 'poll-ms': 5000 };
  let dir = '';
  let statePath = '';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const name = a.slice(2);
      if (name === 'state') {
        statePath = argv[++i] ?? '';
        continue;
      }
      const value = Number(argv[++i]);
      if (!(name in opts) || !(value > 0)) {
        console.error(`unknown or invalid option: ${a}`);
        process.exit(2);
      }
      opts[name] = value;
    } else dir = a;
  }
  if (!dir) {
    console.error(
      'usage: bun watch-run.ts <transcriptDir> [--stall-min 10] [--long-turns 150] [--long-ctx 250000] [--poll-ms 5000] [--state <file>]',
    );
    process.exit(2);
  }
  return {
    dir,
    t: { stallMs: opts['stall-min'] * 60000, longTurns: opts['long-turns'], longCtx: opts['long-ctx'] },
    pollMs: opts['poll-ms'],
    statePath: statePath || join(dir, STATE_FILE),
  };
}

async function main(): Promise<void> {
  const { dir, t, pollMs, statePath } = parseArgs(process.argv.slice(2));
  const emitted = deserializeEmitted(readText(statePath));
  let saidWaiting = false;
  for (;;) {
    if (!existsSync(dir)) {
      if (!saidWaiting) console.log(`waiting ${dir}`);
      saidWaiting = true;
    } else {
      const lines = diffEvents(emitted, readRun(dir, Date.now(), t), t);
      for (const line of lines) console.log(line);
      if (lines.length) writeFileSync(statePath, serializeEmitted(emitted));
    }
    await Bun.sleep(pollMs);
  }
}

if (import.meta.main) await main();
