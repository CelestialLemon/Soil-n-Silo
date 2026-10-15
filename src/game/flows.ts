import { ITEMS, type ItemId } from './data.ts';
import { STAT_BUCKET, STAT_BUCKETS, type GameState } from './state.ts';

// Goods moving through the valley over the last ten minutes, for the ledger: what was made, what buildings used, and what
// reached the depot, in buckets of FLOW_BUCKET seconds; and soil health sampled as it goes, for its trend. Kept in memory
// only, like history.ts: it fills again within minutes of loading a save.

export const FLOW_BUCKET = 10, FLOW_SECONDS = 600;

export type FlowKind = 'made' | 'used' | 'delivered';
type Counts = Partial<Record<ItemId, number>>;

interface FlowBucket { from: number; made: Counts; used: Counts; delivered: Counts }

interface Flows {
  /** When recording began. */
  since: number;
  /** Oldest first. */
  buckets: FlowBucket[];
  /** Soil health, sampled once a bucket. */
  soil: { t: number; v: number }[];
}

const all = new WeakMap<GameState, Flows>();

function flows(s: GameState): Flows {
  let f = all.get(s);
  if (!f) all.set(s, (f = { since: s.time, buckets: [], soil: [] }));
  return f;
}

const bucketStart = (t: number) => Math.floor(t / FLOW_BUCKET + 1e-9) * FLOW_BUCKET;

/** Notes `n` of a good made, used by a building, or delivered, in the step that ended now. */
export function noteFlow(s: GameState, kind: FlowKind, item: ItemId, n = 1) {
  const f = flows(s), t = bucketStart(s.time - 1e-6);
  let last = f.buckets[f.buckets.length - 1];
  if (!last || last.from < t - 1e-6) f.buckets.push((last = { from: t, made: {}, used: {}, delivered: {} }));
  last[kind][item] = (last[kind][item] ?? 0) + n;
}

/** Samples soil health (once a bucket; cheap to call every step) and drops what is older than FLOW_SECONDS. */
export function tickFlows(s: GameState, soilHealth: () => number) {
  const f = flows(s), last = f.soil[f.soil.length - 1];
  if (!last || s.time - last.t >= FLOW_BUCKET - 1e-6) {
    f.soil.push({ t: s.time, v: soilHealth() });
    const cut = s.time - FLOW_SECONDS - FLOW_BUCKET;
    let i = 0;
    while (i < f.buckets.length && f.buckets[i].from + FLOW_BUCKET <= cut) i++;
    if (i) f.buckets.splice(0, i);
    let j = 0;
    while (j < f.soil.length && f.soil[j].t < cut) j++;
    if (j) f.soil.splice(0, j);
  }
}

/** Seconds of play the flows cover within the last `window` seconds. */
const covered = (s: GameState, window: number) => Math.max(0, Math.min(window, s.time - flows(s).since));

/** A good made, used or delivered a minute, averaged over the last `window` seconds (or as much of it as was recorded). */
export function flowRate(s: GameState, kind: FlowKind, item: ItemId, window = 300): number {
  const span = covered(s, window);
  if (span <= 0) return 0;
  let n = 0;
  for (const k of flows(s).buckets) if (k.from + FLOW_BUCKET > s.time - span + 1e-6) n += k[kind][item] ?? 0;
  return n / span * 60;
}

/**
 * A good made, used or delivered a minute in each of `points` stretches over the last `window` seconds, oldest first. A
 * stretch before recording began is null.
 */
export function flowSeries(s: GameState, kind: FlowKind, item: ItemId, window = FLOW_SECONDS, points = 10): (number | null)[] {
  const f = flows(s), step = window / points, start = s.time - window;
  return Array.from({ length: points }, (_, i) => {
    const a = start + i * step, b = a + step;
    if (b <= f.since + 1e-6) return null;
    let n = 0;
    for (const k of f.buckets) if (k.from >= a - 1e-6 && k.from < b - 1e-6) n += k[kind][item] ?? 0;
    return n / (b - Math.max(a, f.since)) * 60;
  });
}

/** How soil health has moved a minute, over the last `window` seconds (null until two samples that far apart). */
export function soilTrend(s: GameState, window = 60): number | null {
  const soil = flows(s).soil, now = soil[soil.length - 1];
  if (!now) return null;
  const then = soil.find((x) => x.t >= now.t - window - 1e-6);
  if (!then || now.t - then.t < window / 2) return null;
  return (now.v - then.v) / (now.t - then.t) * 60;
}

/** Every good sitting in the valley now: in machines' and fields' stores, silos, hives, and trucks' cargo. */
export function goodsHeld(s: GameState): Counts {
  const out: Counts = {};
  const add = (i: ItemId, n: number) => { if (n > 0) out[i] = (out[i] ?? 0) + n; };
  for (const b of s.buildings) {
    for (const src of [b.inputs, b.outputs, b.store]) if (src) for (const [i, n] of Object.entries(src) as [ItemId, number][]) add(i, n);
    if (b.type === 'field' && b.stored) add(b.harvest ?? b.crop!, b.stored);
    if (b.type === 'hive' && b.stored) add('honey', b.stored);
  }
  for (const t of s.trucks) for (const i of t.cargo) add(i, 1);
  return out;
}

/** Credits earned at the depot a minute, over the last minute (every delivery in it, at its price). */
export function creditsPerMin(s: GameState): number {
  const minute = STAT_BUCKET * (STAT_BUCKETS - 1), from = s.time - minute, span = Math.min(s.time, minute);
  if (span <= 0) return 0;
  let earned = 0;
  for (const [i, times] of Object.entries(s.stats.delivered) as [ItemId, number[]][]) for (const t of times) if (t > from) earned += ITEMS[i].price;
  return earned / span * 60;
}
