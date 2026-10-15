import { TRUCK } from './data.ts';
import { legLength } from './roads.ts';
import { buildingById, type GameState, type Route, type Truck } from './state.ts';
import { runtimeOf } from './runtime.ts';
import { must } from './result.ts';

// What the trucks have been doing lately, for the routes card: when a truck reached each stop of its route, and how each
// truck spent its time (driving, moving goods, waiting at a stop, charging). Measured over the last FLEET_SECONDS of play,
// in memory only (like history.ts). From it: a route's loop time, the gap between trucks at each stop, and each truck's
// idle share. Arrivals are observed, not worked out from the loop: trucks skip stops they can't reach, go home to charge,
// queue and crawl.

export const FLEET_SECONDS = 600, FLEET_BUCKET = 5;

/** What a truck is doing in a step: driving, moving goods at a stop, waiting at one (queued, or docked with nothing to
 * move), charging or parked at its garage, or stuck. */
export type Activity = 'drive' | 'work' | 'wait' | 'charge' | 'parked' | 'stuck';

interface Arrival { truck: number; stop: number; building: number; time: number }
interface TruckBucket { from: number; route: number | null; seconds: Partial<Record<Activity, number>> }

export interface Fleet {
  since: number;
  /** Arrivals by route id, oldest first. */
  arrivals: Map<number, Arrival[]>;
  /** Buckets by truck id, oldest first. */
  trucks: Map<number, TruckBucket[]>;
  lastPrune: number;
}

function fleet(s: GameState): Fleet {
  const r = runtimeOf(s);
  let f = r.fleet;
  if (!f) r.fleet = (f = { since: s.time, arrivals: new Map(), trucks: new Map(), lastPrune: -Infinity });
  return f;
}

export function activityOf(t: Truck): Activity {
  switch (t.phase) {
    case 'drive': return 'drive';
    case 'dock': return t.idle > 0 ? 'wait' : 'work';
    case 'queue': return 'wait';
    case 'charge': return 'charge';
    case 'parked': return t.route === null ? 'parked' : 'charge';
    case 'stuck': return 'stuck';
  }
}

/** Notes a truck reaching the stop it was driving to (now). */
export function noteArrival(s: GameState, t: Truck) {
  if (t.route === null || t.target === null) return;
  const f = fleet(s);
  let list = f.arrivals.get(t.route);
  if (!list) f.arrivals.set(t.route, (list = []));
  list.push({ truck: t.id, stop: t.stop, building: t.target, time: s.time });
}

/** Notes what every truck did in the step that ended now, and drops what is older than FLEET_SECONDS. */
export function noteTrucks(s: GameState, dt: number) {
  const f = fleet(s), start = s.time - dt, from = Math.floor(start / FLEET_BUCKET + 1e-9) * FLEET_BUCKET;
  for (const t of s.trucks) {
    let list = f.trucks.get(t.id);
    if (!list) f.trucks.set(t.id, (list = []));
    let last = list[list.length - 1];
    if (!last || last.from < from - 1e-6 || last.route !== t.route) list.push((last = { from, route: t.route, seconds: {} }));
    const a = activityOf(t);
    last.seconds[a] = (last.seconds[a] ?? 0) + dt;
  }
  if (s.time - f.lastPrune < FLEET_BUCKET) return;
  f.lastPrune = s.time;
  const cut = s.time - FLEET_SECONDS - FLEET_BUCKET, routes = new Set(s.routes.map((r) => r.id)), trucks = new Set(s.trucks.map((t) => t.id));
  for (const [id, list] of f.arrivals) {
    if (!routes.has(id)) { f.arrivals.delete(id); continue; }
    let i = 0;
    while (i < list.length && list[i].time < cut) i++;
    if (i) list.splice(0, i);
  }
  for (const [id, list] of f.trucks) {
    if (!trucks.has(id)) { f.trucks.delete(id); continue; }
    let i = 0;
    while (i < list.length && list[i].from + FLEET_BUCKET <= cut) i++;
    if (i) list.splice(0, i);
  }
}

export interface StopTiming {
  /** Trucks that reached it in the window. */
  arrivals: number;
  /** The average gap between them (null with fewer than two). */
  gap: number | null;
}

export interface RouteTiming {
  /** The seconds measured: the last FLEET_SECONDS, or less if recording began since. */
  window: number;
  /** The average time a truck took to come round to the same stop again (null: none came round in the window). */
  loop: number | null;
  /** The time a truck spends driving one round, from the road distances alone (null: some leg can't be driven). */
  driving: number | null;
  stops: StopTiming[];
  /** The stop trucks reach least often: the longest gap, or one that saw a single truck or none (null without trucks). */
  slowest: { stop: number; timing: StopTiming } | null;
}

/** How a route's trucks have been serving it over the last FLEET_SECONDS. */
export function routeTiming(s: GameState, r: Route): RouteTiming {
  const f = fleet(s), window = Math.min(FLEET_SECONDS, s.time - f.since), from = s.time - window;
  const arrivals = (f.arrivals.get(r.id) ?? []).filter((a) => a.time >= from - 1e-6);
  const stops: StopTiming[] = r.stops.map((st, i) => {
    const times = arrivals.filter((a) => a.stop === i && a.building === st.building).map((a) => a.time);
    return { arrivals: times.length, gap: times.length >= 2 ? (times[times.length - 1] - times[0]) / (times.length - 1) : null };
  });
  // A round: a truck's consecutive arrivals at the same stop.
  const rounds: number[] = [];
  const lastAt = new Map<string, number>();
  for (const a of arrivals) {
    const k = `${a.truck}:${a.stop}:${a.building}`, prev = lastAt.get(k);
    if (prev !== undefined) rounds.push(a.time - prev);
    lastAt.set(k, a.time);
  }
  const loop = rounds.length ? rounds.reduce((n, x) => n + x, 0) / rounds.length : null;
  let driving: number | null = 0;
  const bs = r.stops.map((st) => buildingById(s, st.building));
  for (let i = 0; i < bs.length && bs.length > 1; i++) {
    const a = bs[i], b = bs[(i + 1) % bs.length];
    if (!a || !b) { driving = null; break; }
    if (a === b) continue;
    const d = legLength(s, a, b);
    if (d === Infinity) { driving = null; break; }
    driving += d / TRUCK.speed;
  }
  const hasTrucks = s.trucks.some((t) => t.route === r.id);
  let slowest: RouteTiming['slowest'] = null;
  if (hasTrucks) {
    // No truck is slowest, then one; among stops seen twice or more, the longer gap. Lower ranks are slower.
    const rank = (x: StopTiming) => (x.arrivals < 2 ? (x.arrivals - 2) * 1e9 : -must(x.gap, 'stop gap'));
    stops.forEach((timing, stop) => { if (!slowest || rank(timing) < rank(slowest.timing)) slowest = { stop, timing }; });
  }
  return { window, loop, driving: r.stops.length > 1 ? driving : null, stops, slowest };
}

export interface TruckTime {
  /** Seconds on a route in the window, and seconds by activity. */
  total: number;
  seconds: Partial<Record<Activity, number>>;
  /** The share of its time on a route spent waiting at stops (null: none on a route). */
  idle: number | null;
}

/** How a truck spent the last FLEET_SECONDS (only the time it ran `route`, if given). */
export function truckTime(s: GameState, t: Truck, route?: number): TruckTime {
  const f = fleet(s), cut = s.time - FLEET_SECONDS, seconds: Partial<Record<Activity, number>> = {};
  let total = 0;
  for (const k of f.trucks.get(t.id) ?? []) {
    if (k.from + FLEET_BUCKET <= cut || k.route === null || (route !== undefined && k.route !== route)) continue;
    for (const [a, n] of Object.entries(k.seconds) as [Activity, number][]) {
      seconds[a] = (seconds[a] ?? 0) + n;
      if (a !== 'parked') total += n;
    }
  }
  return { total, seconds, idle: total > 0 ? (seconds.wait ?? 0) / total : null };
}
