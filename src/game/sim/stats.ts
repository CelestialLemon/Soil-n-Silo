import { FIELD, type ItemId } from '../data.ts';
import { hasHistory, noteStep, pruneHistory } from '../history.ts';
import { networkOf } from '../power.ts';
import { SILVER_PAR } from '../scenarios.ts';
import { STAT_BUCKET, STAT_BUCKETS, type GameState, type Route } from '../state.ts';
import { derived } from './layout.ts';
import { soilHealth } from './soil.ts';
import { shareOf, makes } from './energy.ts';

// Stats: the history, rates and goals the step keeps up to date.

/** Each building's step for its history: its status, and a reading where one tells more (a generator's watts, a battery's charge). */
export function recordHistory(s: GameState, sun: number, wind: number, dt: number) {
  for (const b of s.buildings) {
    if (!hasHistory(b)) continue;
    const value = b.type === 'solar' || b.type === 'turbine' || b.type === 'wheel' ? (networkOf(s, b) ? makes(s, b, sun, wind) : 0) : b.type === 'battery' ? b.charge : null;
    noteStep(s, b, dt, shareOf(s, b), value);
  }
  pruneHistory(s);
}

export function rest(s: GameState) {
  const fielded = derived(s).fielded, f = s.map.fertility, base = s.soilBase;
  for (let i = 0; i < f.length; i++) if (f[i] < base[i] && !fielded.has(i)) f[i] = Math.min(base[i], f[i] + FIELD.rest);
}

export function updateStats(s: GameState) {
  const st = s.stats;
  pruneDeliveries(s);
  if (s.time - st.since >= STAT_BUCKET) {
    st.since += STAT_BUCKET;
    st.made.unshift({});
    if (st.made.length > STAT_BUCKETS) st.made.length = STAT_BUCKETS;
  }
}

/** Per-minute rate of a good over the last minute, from the stat buckets. */
export function ratePerMin(s: GameState, item: ItemId, which: 'made' | 'delivered') {
  const minute = STAT_BUCKET * (STAT_BUCKETS - 1);
  if (which === 'delivered') {
    // Exact: every delivery in the last minute.
    const times = s.stats.delivered[item] ?? [], from = s.time - minute;
    let n = 0;
    for (const t of times) if (t > from) n++;
    const span = Math.min(s.time, minute);
    return span > 0 ? n / span * 60 : 0;
  }
  const buckets = s.stats.made, into = s.time - s.stats.since;
  // Goods made, for the stats: the newest buckets whole, the oldest only for the part of it still inside the last minute.
  let total = 0;
  buckets.forEach((b, i) => {
    const n = b[item] ?? 0;
    total += i === STAT_BUCKETS - 1 ? n * Math.max(0, 1 - into / STAT_BUCKET) : n;
  });
  const span = Math.min(s.time, minute);
  return span > 0 ? total / span * 60 : 0;
}

/** Forgets deliveries, and goods routes moved, older than a minute. */
function pruneDeliveries(s: GameState) {
  const from = s.time - STAT_BUCKET * (STAT_BUCKETS - 1);
  for (const times of [...Object.values(s.stats.delivered), ...s.routes.map((r) => r.moved)]) {
    let k = 0;
    while (k < times.length && times[k] <= from) k++;
    if (k) times.splice(0, k);
  }
}

/** Goods a route's trucks dropped over the last minute, a minute. */
export function routeRate(s: GameState, r: Route) {
  const span = Math.min(s.time, STAT_BUCKET * (STAT_BUCKETS - 1));
  return span > 0 ? r.moved.filter((t) => t > s.time - span).length / span * 60 : 0;
}

export function goalDone(s: GameState, i: number): boolean {
  const g = s.scenario.goals[i];
  if (g.kind === 'deliver') return (s.delivered[g.item] ?? 0) >= g.n;
  if (g.kind === 'rate') return s.reached[i];
  return soilHealth(s) >= g.min;
}

export function updateGoals(s: GameState) {
  const goals = s.scenario.goals;
  goals.forEach((g, i) => {
    // A rate goal counts only once a full minute of deliveries has been measured.
    if (g.kind === 'rate' && !s.reached[i] && s.time >= 60 && ratePerMin(s, g.item, 'delivered') >= g.perMin) s.reached[i] = true;
  });
  if (s.completedAt === null && goals.length && goals.every((_, i) => goalDone(s, i))) s.completedAt = s.time;
}

export type Medal = 'gold' | 'silver' | 'bronze';
export function medalFor(par: number, time: number): Medal {
  return time <= par ? 'gold' : time <= par * SILVER_PAR ? 'silver' : 'bronze';
}
