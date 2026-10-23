import { activeEvents, EVENT_KINDS, EVENTS, eventName, feltPush, STRENGTHS, type Active, type EventKind, type Lever, type Shape, type Strength } from './events.ts';
import { floodHolds, floodUnder } from './flood.ts';
import { frostTakes } from './frost.ts';
import { coopPace } from './rules.ts';
import type { Scenario } from './scenarios.ts';
import type { Building, GameState, Truck } from './state.ts';
import { fieldPace } from './sim/buildings.ts';
import { warmthOf } from './warmth.ts';

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

const holdOfEvent = (a: Active | null, effect: Effect): Hold | null => (a ? { kind: a.event.kind, strength: a.event.strength, effect } : null);

/** The share of its pace without the event that the hens and fields are left, below which they are marked. */
const SLOW_BELOW = 0.85;

/**
 * What stops or slows a building now, among the events under way (null: nothing, or the building runs as its layout lets it).
 * Only a building that would otherwise be running is held: a layout's problem comes first.
 */
export function buildingHold(s: GameState, b: Building, active: readonly Active[]): Hold | null {
  // Flood water stops whatever stands in it, and takes the crop a field was growing.
  if (floodHolds(s, b)) return holdOfEvent(floodUnder(s.scenario, s.time), b.type === 'field' ? 'lost' : 'stopped');
  switch (b.type) {
    // A panel makes less in the cloud and dark of a storm or a fog.
    case 'solar': return b.status === 'ok' ? holdOfEvent(cutting(active, 'sun'), 'weak') : null;
    // The hens lay slower in the heat an event brings (and in what the season's own heat leaves them: that is not weather's).
    case 'coop': {
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

/** What slows a truck now: a driving truck, in fog. */
export function truckHold(s: GameState, t: Truck, active: readonly Active[] = activeEvents(s.scenario, s.time)): Hold | null {
  return t.phase === 'drive' && t.path.length ? holdOfEvent(cutting(active, 'trucks'), 'slowed') : null;
}

/** Sets the status of every building the weather holds. Run after the buildings' own statuses are final. */
export function applyHolds(s: GameState) {
  const active = activeEvents(s.scenario, s.time);
  if (!active.length) return;
  for (const b of s.buildings) {
    const h = buildingHold(s, b, active);
    if (h) { b.status = 'weather'; b.need = holdNeed(h); }
  }
}

/** The index in the scenario's events of the one under way (at `time`) that a hold names; -1 if none is. */
export function eventIndex(sc: Pick<Scenario, 'events'>, time: number, h: Pick<Hold, 'kind' | 'strength'>): number {
  const under = activeEvents(sc, time).filter((a) => a.event.kind === h.kind && a.event.strength === h.strength);
  return under.length ? sc.events.indexOf(under[under.length - 1].event) : -1;
}
