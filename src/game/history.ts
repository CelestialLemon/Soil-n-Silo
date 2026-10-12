import type { ItemId } from './data.ts';
import type { Building, GameState, Status } from './state.ts';

// What each building has been doing lately, for the inspector's history: when its status changed (and to what), the goods
// it made, and a reading sampled each step (a generator's watts, a battery's charge), in buckets of HISTORY_BUCKET seconds.
// Kept for the last HISTORY_SECONDS of play, in memory only (not saved: it fills again within minutes).

export const HISTORY_BUCKET = 5, HISTORY_SECONDS = 600;

/** A status held from `from` until the next run starts (or now). */
export interface Run {
  from: number;
  status: Status;
  need?: string;
  /** While low on power: the share of the power it wanted that it got, summed over `steps` steps. */
  share?: number;
  steps?: number;
}

/** HISTORY_BUCKET seconds of play from `from`. */
export interface Bucket {
  from: number;
  made: Partial<Record<ItemId, number>>;
  /** The reading summed over `steps` steps (0 steps: nothing read). */
  value: number;
  steps: number;
  /** Steps spent low on power, and the share of the power wanted that it got, summed over them. */
  lowSteps: number;
  lowShare: number;
}

export interface History {
  /** When it was first recorded (when it was built, or when recording began). */
  since: number;
  runs: Run[];
  /** Oldest first, one for every bucket since `since`. */
  buckets: Bucket[];
}

const all = new WeakMap<GameState, Map<number, History>>();
const lastPrune = new WeakMap<GameState, number>();

export const historyOf = (s: GameState, b: Building): History | null => all.get(s)?.get(b.id) ?? null;

/** Pylons, silos, the depot and saplings have nothing to look back on: always the same, or shown elsewhere. */
export const hasHistory = (b: Building) => b.type !== 'pylon' && b.type !== 'silo' && b.type !== 'depot' && b.type !== 'sapling';

const bucketStart = (t: number) => Math.floor(t / HISTORY_BUCKET + 1e-9) * HISTORY_BUCKET;

function current(s: GameState, b: Building, start: number): History {
  let map = all.get(s);
  if (!map) all.set(s, (map = new Map()));
  let h = map.get(b.id);
  if (!h) map.set(b.id, (h = { since: start, runs: [], buckets: [] }));
  return h;
}

function bucketAt(h: History, start: number): Bucket {
  const t = bucketStart(start);
  let last = h.buckets[h.buckets.length - 1];
  if (!last || last.from < t - 1e-6) h.buckets.push((last = { from: t, made: {}, value: 0, steps: 0, lowSteps: 0, lowShare: 0 }));
  return last;
}

/** Notes goods a building made this step. */
export function noteMade(s: GameState, b: Building, item: ItemId, n: number, dt: number) {
  if (!hasHistory(b)) return;
  const h = current(s, b, s.time - dt), k = bucketAt(h, s.time - dt);
  k.made[item] = (k.made[item] ?? 0) + n;
}

/**
 * Records a building's step that ended now (`dt` long): its status, the power share it got (while low on power) and a
 * reading (null: none for this building).
 */
export function noteStep(s: GameState, b: Building, dt: number, share: number, value: number | null) {
  if (!hasHistory(b)) return;
  const start = s.time - dt, h = current(s, b, start);
  const last = h.runs[h.runs.length - 1];
  let run = last;
  if (!last || last.status !== b.status || last.need !== b.need) h.runs.push((run = { from: start, status: b.status, need: b.need }));
  const k = bucketAt(h, start);
  if (b.status === 'lowpower') { run.share = (run.share ?? 0) + share; run.steps = (run.steps ?? 0) + 1; k.lowShare += share; k.lowSteps++; }
  if (value !== null) { k.value += value; k.steps++; }
}

/** Drops what is older than HISTORY_SECONDS, and the histories of buildings that are gone. Cheap to call every step. */
export function pruneHistory(s: GameState) {
  const map = all.get(s);
  if (!map || s.time - (lastPrune.get(s) ?? -Infinity) < HISTORY_BUCKET) return;
  lastPrune.set(s, s.time);
  const cut = s.time - HISTORY_SECONDS - HISTORY_BUCKET, here = new Set(s.buildings.map((b) => b.id));
  for (const [id, h] of map) {
    if (!here.has(id)) { map.delete(id); continue; }
    // Keep the run that was going at the cut: it says what the building was doing then.
    let i = 0;
    while (i + 1 < h.runs.length && h.runs[i + 1].from <= cut) i++;
    if (i) h.runs.splice(0, i);
    let j = 0;
    while (j < h.buckets.length && h.buckets[j].from + HISTORY_BUCKET <= cut) j++;
    if (j) h.buckets.splice(0, j);
  }
}

// ---- Reading it back ----

/** A run within the window (`began`: when the run really began, which may be before the window; `share`: the power share
 * it got over the whole run, while low on power). */
export interface Span { from: number; to: number; began: number; status: Status; need?: string; share?: number }
/** Time in a status over the window (`share`: the power share it got in the window, while low on power). */
export interface Share { status: Status; need?: string; seconds: number; share?: number }
export interface Bar { from: number; to: number; made: Partial<Record<ItemId, number>>; value: number | null }

export interface Summary {
  /** The window shown: from `start` (now minus the window) to `now`; history covers only `since` onwards. */
  start: number;
  now: number;
  since: number;
  spans: Span[];
  /** Time in each status (with its need) over the window, most first. */
  shares: Share[];
  /** One bar each `step` seconds, oldest first. */
  bars: Bar[];
  step: number;
  /** Goods made a minute over the window's buckets. */
  perMin: Partial<Record<ItemId, number>>;
  /** The reading over the window: its average over every step read, and the lowest and highest bar (null: none read). */
  reading: { avg: number; min: number; max: number } | null;
}

const runShare = (r: { share?: number; steps?: number }) => (r.steps ? r.share! / r.steps : undefined);

/** A building's history over the last `window` seconds, in about `bars` bars (each a whole number of buckets). */
export function summarize(h: History, now: number, window: number, bars = 60): Summary {
  const start = now - window, from = Math.max(start, h.since);
  const spans: Span[] = [];
  h.runs.forEach((r, i) => {
    const a = Math.max(r.from, from), b = Math.min(i + 1 < h.runs.length ? h.runs[i + 1].from : now, now);
    if (b > a + 1e-9) spans.push({ from: a, to: b, began: r.from, status: r.status, need: r.need, share: runShare(r) });
  });

  // Time in each status (with its need).
  const byKey = new Map<string, Share>();
  for (const sp of spans) {
    const key = `${sp.status}|${sp.need ?? ''}`;
    let x = byKey.get(key);
    if (!x) byKey.set(key, (x = { status: sp.status, need: sp.need, seconds: 0 }));
    x.seconds += sp.to - sp.from;
  }
  const shares = [...byKey.values()].sort((a, b) => b.seconds - a.seconds);

  const step = Math.max(1, Math.round(window / bars / HISTORY_BUCKET)) * HISTORY_BUCKET;
  const first = Math.floor(start / step + 1e-9) * step;
  const out: Bar[] = [];
  for (let t = first; t < now - 1e-9; t += step) out.push({ from: t, to: t + step, made: {}, value: null });
  const sums = out.map(() => ({ value: 0, steps: 0 }));
  const perMin: Partial<Record<ItemId, number>> = {};
  let value = 0, steps = 0, lowShare = 0, lowSteps = 0;
  for (const k of h.buckets) {
    const i = Math.floor((k.from - first) / step + 1e-9);
    if (i < 0 || i >= out.length) continue;
    for (const [item, n] of Object.entries(k.made) as [ItemId, number][]) {
      out[i].made[item] = (out[i].made[item] ?? 0) + n;
      perMin[item] = (perMin[item] ?? 0) + n;
    }
    sums[i].value += k.value; sums[i].steps += k.steps;
    value += k.value; steps += k.steps; lowShare += k.lowShare; lowSteps += k.lowSteps;
  }
  const low = shares.find((x) => x.status === 'lowpower');
  if (low && lowSteps) low.share = lowShare / lowSteps;
  out.forEach((b, i) => { if (sums[i].steps) b.value = sums[i].value / sums[i].steps; });
  // A rate over the time the bars cover, since the building was recorded.
  const covered = now - Math.max(first, h.since);
  for (const item of Object.keys(perMin) as ItemId[]) perMin[item] = covered > 0 ? (perMin[item]! / covered) * 60 : 0;
  const read = out.flatMap((x) => (x.value === null ? [] : [x.value]));
  const reading = steps ? { avg: value / steps, min: Math.min(...read), max: Math.max(...read) } : null;
  return { start, now, since: h.since, spans, shares, bars: out, step, perMin, reading };
}
