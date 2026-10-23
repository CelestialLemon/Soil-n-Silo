import { activeEvents, EVENT_KINDS, EVENTS, eventName, feltPush, STRENGTHS, type Active, type EventKind, type Lever, type Shape, type Strength } from './events.ts';
import { floodHolds, floodUnder } from './flood.ts';
import { frostTakes } from './frost.ts';
import { coopPace } from './rules.ts';
import { PANEL_FROM, panelSnow } from './snow.ts';
import type { Scenario } from './scenarios.ts';
import type { Building, GameState, Truck } from './state.ts';
import { fieldPace } from './sim/buildings.ts';
import { daylight } from './sim/clock.ts';
import { runsInFrost } from './sim/layout.ts';
import { warmthOf } from './warmth.ts';
import { exposureOf } from './sim/layout.ts';
import { routeOf } from './sim/trucks.ts';
import { garaging, keepingBeesIn, TURBINE_WEAK, turbineInGale } from './wind.ts';

// Weather holds: a building or truck that weather stops or slows. It carries the status `weather`, whose `need` names the cause
// (the event, its strength and what it does), so the marker, the card, the history ribbon and the results all tell it from a
// layout's problem ("Turbine: stopped, gale" against "no power"). An event only has to say what it holds: its rule sets the
// status with `holdNeed`, and everything else reads it back with `readHold`. The holds that exist now are found here
// (`buildingHold`, `truckHold`); each event in 2.4–2.8 adds its own.

/** What weather does to a building or truck: stops it, slows it, makes it give less (a generator), or takes what it grows. */
export const EFFECTS = ['stopped', 'slowed', 'weak', 'lost'] as const;
export type Effect = typeof EFFECTS[number];

/** The cause of a hold. */
export interface Hold { kind: EventKind; strength: Strength; effect: Effect }

/** The `need` a held building carries: "fog:ordinary:slowed". */
export const holdNeed = (h: Hold) => `${h.kind}:${h.strength}:${h.effect}`;

/** The hold a `need` names, or null if it isn't one. */
export function readHold(need: string | undefined): Hold | null {
  const [kind, strength, effect] = typeof need === 'string' ? need.split(':') : [];
  if (!EVENT_KINDS.includes(kind as EventKind) || !STRENGTHS.includes(strength as Strength) || !EFFECTS.includes(effect as Effect)) return null;
  return { kind: kind as EventKind, strength: strength as Strength, effect: effect as Effect };
}

/** The cause in words, lower case: "gale", "severe fog", "hurricane". */
export const causeName = (h: Pick<Hold, 'kind' | 'strength'>) => eventName(h.kind, h.strength).toLowerCase();

/** The shape of the marker for a hold's `need`: its event's own (a diamond where the cause is unknown). */
export const holdShape = (need: string | undefined): Shape => EVENTS[readHold(need)?.kind ?? 'fog'].shape ?? 'diamond';

const WORD: Record<Effect, string> = { stopped: 'Stopped', slowed: 'Slowed', weak: 'Weak', lost: 'Lost' };

/** A hold as a pill's words: "Stopped · gale". */
export const holdLabel = (h: Hold) => `${WORD[h.effect]} · ${causeName(h)}`;

// ---- Finding holds ----

/** An event cuts a lever this much (a share of its normal value) before the buildings it hits are marked. */
const CUT = 0.2;

/** The event under way that takes a multiplying lever (the sun, the trucks' speed) lowest, if it takes it down by at least CUT. */
function cutting(active: readonly Active[], lever: Lever): Active | null {
  let best: Active | null = null, low = 1 - CUT;
  for (const a of active) {
    const felt = feltPush(a, lever);
    if (felt !== undefined && felt <= low) { best = a; low = felt; }
  }
  return best;
}

/** The event under way that warms the valley most. */
function warming(active: readonly Active[]): Active | null {
  let best: Active | null = null, high = 0;
  for (const a of active) {
    const felt = feltPush(a, 'warmth');
    if (felt !== undefined && felt > high) { best = a; high = felt; }
  }
  return best;
}

/** The event under way that freezes the river hardest, if it freezes it by at least `from`. */
function freezing(active: readonly Active[], from: number): Active | null {
  let best: Active | null = null, high = from;
  for (const a of active) {
    const felt = feltPush(a, 'ice');
    if (felt !== undefined && felt >= high) { best = a; high = felt; }
  }
  return best;
}

const holdOfEvent = (a: Active | null, effect: Effect): Hold | null => (a ? { kind: a.event.kind, strength: a.event.strength, effect } : null);

/** A panel's sun is called dark, not weak, when an event leaves it this little; a river is called frozen shut when the ice reaches this much. */
const DARK = 0.05, FROZEN = 0.95;

/** The share of its pace without the event that the hens and fields are left, below which they are marked. */
const SLOW_BELOW = 0.85;
/** The share of its pace below which a building is called stopped, not slowed. */
const STOPPED = 0.05;

/**
 * What stops or slows a building now, among the events under way (null: nothing, or the building runs as its layout lets it).
 * Only a building that would otherwise be running is held: a layout's problem comes first.
 */
export function buildingHold(s: GameState, b: Building, active: readonly Active[]): Hold | null {
  // Flood water stops whatever stands in it, and takes the crop a field was growing.
  if (floodHolds(s, b)) return holdOfEvent(floodUnder(s.scenario, s.time), b.type === 'field' ? 'lost' : 'stopped');
  switch (b.type) {
    // A panel makes less in the cloud and dark of a storm or a fog, none in a blizzard, and little under the snow it leaves.
    case 'solar': {
      if (b.status !== 'ok' && !(b.status === 'idle' && daylight(s.scenario, s.time))) return null;
      const dim = cutting(active, 'sun');
      if (dim) return holdOfEvent(dim, (feltPush(dim, 'sun') ?? 1) <= DARK ? 'stopped' : 'weak');
      const snow = panelSnow(s.scenario, s.time);
      return snow && snow.intensity >= PANEL_FROM ? holdOfEvent(snow, 'weak') : null;
    }
    // A turbine stops in a gale stronger than its shelter lets it stand, and makes less when it keeps turning (wind.ts).
    case 'turbine': {
      const g = b.status === 'ok' ? turbineInGale(s, b.id, exposureOf(s, b)) : null;
      return g && g.share <= TURBINE_WEAK ? holdOfEvent(g.cause, g.share <= 0 ? 'stopped' : 'weak') : null;
    }
    // A wheel on frozen river is slowed as the ice forms and stopped once it is shut (a wheel at a fall runs on).
    case 'wheel': {
      const ice = b.status === 'ok' && !runsInFrost(s, b) ? freezing(active, CUT) : null;
      return ice ? holdOfEvent(ice, (feltPush(ice, 'ice') ?? 0) >= FROZEN ? 'stopped' : 'slowed') : null;
    }
    // The bees stay in when the weather says so.
    case 'hive': return b.status === 'ok' ? holdOfEvent(keepingBeesIn(s.scenario, s.time), 'stopped') : null;
    // The hens lay slower in the heat or cold an event brings (and in what the season's own weather leaves them: that is not weather's), and stop in a hurricane.
    case 'coop': {
      const stormed = b.status === 'ok' ? cutting(active, 'hens') : null;
      if (stormed) return holdOfEvent(stormed, (feltPush(stormed, 'hens') ?? 1) <= STOPPED ? 'stopped' : 'slowed');
      const heat = b.status === 'ok' ? warming(active) : null;
      if (!heat) return null;
      const w = warmthOf(s), calm = w - (feltPush(heat, 'warmth') ?? 0);
      return coopPace(s, b.x, b.y, w) <= coopPace(s, b.x, b.y, calm) * SLOW_BELOW ? holdOfEvent(heat, 'slowed') : null;
    }
    // A late frost takes the tender crop a field lies in the frost with (it starts again); a field grows slower in a heat wave's heat, a good deal slower without water.
    case 'field': {
      const frost = frostTakes(s, b);
      if (frost) return holdOfEvent(frost, 'lost');
      const heat = b.status === 'ok' || b.status === 'dry' ? warming(active) : null;
      if (!heat) return null;
      const w = warmthOf(s);
      return fieldPace(s, b, w).pace <= fieldPace(s, b, w - (feltPush(heat, 'warmth') ?? 0)).pace * SLOW_BELOW ? holdOfEvent(heat, 'slowed') : null;
    }
    default: return null;
  }
}

/** What stops or slows a truck now: a driving truck, in fog; a truck with a route, kept in its garage by a hurricane's worst hours. */
export function truckHold(s: GameState, t: Truck, active: readonly Active[] = activeEvents(s.scenario, s.time)): Hold | null {
  if (t.phase === 'drive' && t.path.length) return holdOfEvent(cutting(active, 'trucks'), 'slowed');
  const kept = (t.phase === 'parked' || t.phase === 'charge') && routeOf(s, t)?.stops.length ? garaging(s.scenario, s.time) : null;
  return kept ? { kind: kept.kind, strength: kept.strength, effect: 'stopped' } : null;
}

/** Sets the status of every building the weather holds. Run after the buildings' own statuses are final. */
export function applyHolds(s: GameState) {
  const active = activeEvents(s.scenario, s.time);
  if (!active.length && !panelSnow(s.scenario, s.time)) return;
  for (const b of s.buildings) {
    const h = buildingHold(s, b, active);
    if (h) { b.status = 'weather'; b.need = holdNeed(h); }
  }
}

/**
 * The index in the scenario's events of the one a hold names: the one under way at `time`, or, for an event whose effects linger
 * (the snow on the panels after a blizzard), the latest of its kind to have begun; -1 if none is.
 */
export function eventIndex(sc: Pick<Scenario, 'events'>, time: number, h: Pick<Hold, 'kind' | 'strength'>): number {
  const under = activeEvents(sc, time).filter((a) => a.event.kind === h.kind && a.event.strength === h.strength);
  if (under.length) return sc.events.indexOf(under[under.length - 1].event);
  if (!EVENTS[h.kind].lingers) return -1;
  let last = -1;
  sc.events.forEach((e, i) => { if (e.kind === h.kind && e.strength === h.strength && e.start <= time && (last < 0 || e.start >= sc.events[last].start)) last = i; });
  return last;
}
