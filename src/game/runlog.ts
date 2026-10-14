import type { BuildingId, ItemId } from './data.ts';
import { nightOf } from './powerlog.ts';
import type { Scenario } from './scenarios.ts';
import type { GameState } from './state.ts';

// The run, for the results screen: milestones as they happen (the first of each good, the first night short of power, the
// first trucks, a second of a building, a byproduct put to use, each goal reached), the goal good delivered over time, and
// what held the valley back (the time each kind of building spent in each problem, nights short of power, trucks waiting at
// stops). Unlike the other logs it is saved with the game: the results come at the end of a run that may span many sessions.

/**
 * Seconds of play between samples of the goal good's curve at first, and the most samples kept: a run that fills them keeps
 * every other one and samples half as often, so the curve always spans the whole run.
 */
export const RUN_SAMPLE = 10, RUN_MAX_SAMPLES = 2000;
/** The most nights kept (over 33 hours of play): a run that long stops adding them, so its save stays bounded. */
export const RUN_MAX_NIGHTS = 500;

export type MarkKind = 'first' | 'night' | 'truck' | 'second' | 'loop' | 'goal';
/** A milestone. `t` is when it happened; -1 if before the run was recorded (a save from before the log). */
export interface Mark { t: number; kind: MarkKind; item?: ItemId; type?: BuildingId; goal?: number; n?: number }

export interface RunLog {
  marks: Mark[];
  /** The goal good delivered, sampled every `curveStep` seconds from `curveFrom`. */
  curveFrom: number;
  curveStep: number;
  curve: number[];
  /** Seconds each kind of building stood, and seconds spent in each problem, keyed `type|status|need`. */
  time: Partial<Record<BuildingId, number>>;
  problems: Record<string, number>;
  /** Nights by the day they began on: seconds any network was short, and the kinds of building that went short. */
  nights: { day: number; short: number; types: BuildingId[] }[];
  /** Truck seconds on a route, waiting at stops in all, and waiting at each kind of building. */
  trucks: { total: number; wait: number; at: Partial<Record<BuildingId, number>> };
}

export const newRunLog = (): RunLog => ({ marks: [], curveFrom: 0, curveStep: RUN_SAMPLE, curve: [0], time: {}, problems: {}, nights: [], trucks: { total: 0, wait: 0, at: {} } });

/** Byproducts: put to use, they close a loop. */
const BYPRODUCTS: ItemId[] = ['bran', 'seedcake', 'manure'];
/** Buildings whose second copy is a milestone. */
const SECONDS = new Set<BuildingId>(['coop', 'hive', 'composter', 'mill', 'press', 'spinner', 'loom', 'bakery', 'cannery', 'digester', 'garage', 'silo', 'battery']);
/** Statuses that aren't problems. */
const FINE = new Set(['ok', 'idle']);

/** The good the commission's curve follows: its first delivery goal, else its first rate goal (null: none). */
export function goalGood(sc: Scenario): ItemId | null {
  const g = sc.goals.find((x) => x.kind === 'deliver') ?? sc.goals.find((x) => x.kind === 'rate');
  return g && 'item' in g ? g.item : null;
}

/**
 * A log for a game saved before runs were logged: what has already happened is marked as before the record (t −1), and
 * the curve starts now.
 */
export function startedRunLog(s: GameState): RunLog {
  const run = newRunLog();
  for (const i of Object.keys(s.made) as ItemId[]) if (s.made[i]) run.marks.push({ t: -1, kind: 'first', item: i });
  if (s.trucks.length) run.marks.push({ t: -1, kind: 'truck', n: Math.min(2, s.trucks.length) });
  run.curveFrom = Math.floor(s.time / RUN_SAMPLE) * RUN_SAMPLE;
  const item = goalGood(s.scenario);
  run.curve = [item ? s.delivered[item] ?? 0 : 0];
  return run;
}

/**
 * Whether the run is still being recorded: until the step that completes the commission (the results cover the run, and a
 * game kept playing after it doesn't grow its save), and never in the sandbox, which has no results.
 */
const recording = (s: GameState) => !s.scenario.sandbox && (s.completedAt === null || s.completedAt >= s.time - 1e-9);

const marked = (run: RunLog, kind: MarkKind, test: (m: Mark) => boolean) => run.marks.some((m) => m.kind === kind && test(m));

/** Notes a good used by a building: the first byproduct put to use closes a loop. */
export function noteRunUse(s: GameState, item: ItemId) {
  if (!recording(s)) return;
  if (BYPRODUCTS.includes(item) && !marked(s.run, 'loop', (m) => m.item === item)) s.run.marks.push({ t: s.time, kind: 'loop', item });
}

/**
 * Records the step that ended now (`dt` long): each building's problems, trucks waiting, a night short of power; and once a
 * second the milestones. `night`: no sun; `short`: some network was short; `done`: each goal met now.
 */
export function noteRun(s: GameState, dt: number, night: boolean, short: boolean, done: () => boolean[]) {
  if (!recording(s)) return;
  const run = s.run;
  const n = night ? nightEntry(s) : null;
  if (n && short) n.short += dt;
  for (const b of s.buildings) {
    if (b.type === 'depot' || b.type === 'pylon' || b.type === 'sapling') continue;
    run.time[b.type] = (run.time[b.type] ?? 0) + dt;
    if (FINE.has(b.status)) continue;
    const key = `${b.type}|${b.status}|${b.need ?? ''}`;
    run.problems[key] = (run.problems[key] ?? 0) + dt;
    if (n && short && (b.status === 'power' || b.status === 'lowpower') && !n.types.includes(b.type)) n.types.push(b.type);
  }
  for (const t of s.trucks) {
    if (t.route === null) continue;
    run.trucks.total += dt;
    if (t.phase !== 'queue' && !(t.phase === 'dock' && t.idle > 0)) continue;
    run.trucks.wait += dt;
    const at = t.target !== null ? s.buildings.find((b) => b.id === t.target) : null;
    if (at) run.trucks.at[at.type] = (run.trucks.at[at.type] ?? 0) + dt;
  }
  // The curve, every `curveStep` seconds until the commission is complete, and a last sample on the step that completes it
  // (the results draw it at the completion time).
  const item = goalGood(s.scenario);
  if (item && (s.completedAt !== null || s.time >= run.curveFrom + run.curve.length * run.curveStep - 1e-6)) {
    if (run.curve.length >= RUN_MAX_SAMPLES) {
      run.curve = run.curve.filter((_, i) => i % 2 === 0);
      run.curveStep *= 2;
    }
    run.curve.push(s.delivered[item] ?? 0);
  }
  // Once a second, and on the step that completes the commission: the milestones.
  if (Math.floor(s.time + 1e-6) === Math.floor(s.time - dt + 1e-6) && s.completedAt === null) return;
  for (const i of Object.keys(s.made) as ItemId[]) if (s.made[i] && !marked(run, 'first', (m) => m.item === i)) run.marks.push({ t: s.time, kind: 'first', item: i });
  for (let k = 1; k <= Math.min(2, s.trucks.length); k++) if (!marked(run, 'truck', (m) => (m.n ?? 1) >= k)) run.marks.push({ t: s.time, kind: 'truck', n: k });
  const count = new Map<BuildingId, number>();
  for (const b of s.buildings) if (SECONDS.has(b.type)) count.set(b.type, (count.get(b.type) ?? 0) + 1);
  for (const [type, k] of count) if (k >= 2 && !marked(run, 'second', (m) => m.type === type)) run.marks.push({ t: s.time, kind: 'second', type });
  done().forEach((d, i) => { if (d && !marked(run, 'goal', (m) => m.goal === i)) run.marks.push({ t: s.time, kind: 'goal', goal: i }); });
  if (run.nights.some((x) => x.short > 0) && !marked(run, 'night', () => true)) {
    const first = run.nights.find((x) => x.short > 0)!;
    run.marks.push({ t: s.time, kind: 'night', n: first.day });
  }
}

/** The entry for the night going on now; null once RUN_MAX_NIGHTS are kept and this is a new one. */
function nightEntry(s: GameState) {
  const day = nightOf(s.time, s.scenario.weather.sunset);
  let n = s.run.nights[s.run.nights.length - 1];
  if (!n || n.day !== day) {
    if (s.run.nights.length >= RUN_MAX_NIGHTS) return null;
    s.run.nights.push((n = { day, short: 0, types: [] }));
  }
  return n;
}

export interface Wait { type: BuildingId; status: string; need: string; seconds: number; share: number }

/** What held the run back, longest first: each kind of building's time in each problem, as a share of the time it stood. */
export function runWaits(run: RunLog): Wait[] {
  return Object.entries(run.problems).map(([k, seconds]) => {
    const [type, status, need] = k.split('|') as [BuildingId, string, string];
    return { type, status, need, seconds, share: seconds / Math.max(1e-9, run.time[type] ?? 0) };
  }).sort((a, b) => b.share - a.share || b.seconds - a.seconds);
}
