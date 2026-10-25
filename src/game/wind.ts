import { activeEvents, allowed, endOf, EVENTS, feltPush, type Active, type WeatherEvent } from './events.ts';
import type { Climate } from './seasons.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import type { GameState } from './state.ts';

// The wind events (the gale, the tropical storm and its severe form, the hurricane): what they do beyond the levers they push
// (wind, sun, rain). A turbine stops when the gale it feels is over its limit, and shelter lowers what it feels, so a gale alone
// rarely stops a sheltered one; the bees stay in; in a hurricane the hens stop and the trucks stay in their garages through the
// worst hours. Pure rules; the holds that mark them are found in hold.ts.

/**
 * What the wind rules read of the weather: the events in force and, for a projection (3.4), the unsteadiness of a turbine in a gale
 * (the seeded noise unless the view says; a projection does not know it).
 */
export type View = Pick<Scenario, 'events'> & { gust?: (time: number, id: number) => number };

/** A turbine stops while the gale it feels (the event's `gale` times the turbine's exposure to the wind) is over this. */
export const TURBINE_LIMIT = 1;
/** A turbine in a gale furls its blades: at the limit it gives this share of its power, more the less gale it feels. */
const FURLED = 0.5;
/** The gusts' hold on a turbine that keeps turning: at the limit they take up to this share of what is left, in an unsteady rhythm. */
const UNSTEADY = 0.5;
/** The share of the bees' flight below which they stay in. */
export const BEES_IN = 0.5;
/** A turbine making this share of its power or less in a gale is marked (it makes less than it would; above, the gale barely touches it). */
export const TURBINE_WEAK = 0.85;

/** The event under way that blows hardest, with the gale a turbine of `exposure` feels from it; null when no gale is blowing. */
export function galeFor(sc: Pick<Scenario, 'events'>, time: number, exposure: number): { cause: Active; felt: number } | null {
  let cause: Active | null = null, strongest = 0;
  for (const a of activeEvents(sc, time)) {
    const g = feltPush(a, 'gale');
    if (g !== undefined && g > strongest) { cause = a; strongest = g; }
  }
  return cause ? { cause, felt: strongest * exposure } : null;
}

/**
 * How a gale leaves a turbine: the cause and the share of its power it makes, 0 when it has stopped. Up to the limit it furls
 * more the harder the gale blows past it, and its output rises and falls with the gusts; null when no gale blows.
 */
export function turbineInGale(s: GameState, id: number, exposure: number, time = s.time, view: View = s.scenario): { cause: Active; share: number } | null {
  const g = galeFor(view, time, exposure);
  if (!g) return null;
  if (g.felt > TURBINE_LIMIT) return { cause: g.cause, share: 0 };
  const k = g.felt / TURBINE_LIMIT, gust = view.gust ? view.gust(time, id) : noise1(time / 4, s.scenario.seed + 79 + id * 17);
  return { cause: g.cause, share: (1 - (1 - FURLED) * k) * (1 - UNSTEADY * k * gust) };
}

/** The share of its power a turbine makes in the gale blowing at a time (default now), 1 when none is. */
export const turbineShare = (s: GameState, id: number, exposure: number, time = s.time, view: View = s.scenario): number => turbineInGale(s, id, exposure, time, view)?.share ?? 1;

/** The event under way that keeps the bees in, if the weather does. */
export function keepingBeesIn(sc: Pick<Scenario, 'events'>, time: number): Active | null {
  let cause: Active | null = null, low = BEES_IN;
  for (const a of activeEvents(sc, time)) {
    const felt = feltPush(a, 'bees');
    if (felt !== undefined && felt < low) { cause = a; low = felt; }
  }
  return cause;
}

/** The event under way, in its worst hours, that keeps the trucks in their garages (the middle share of its length that its entry says). */
export function garaging(sc: Pick<Scenario, 'events'>, time: number): WeatherEvent | null {
  for (const { event } of activeEvents(sc, time)) {
    const share = EVENTS[event.kind].garages?.[event.strength];
    if (!share) continue;
    const slack = event.length * (1 - share) / 2;
    if (time >= event.start + slack && time < endOf(event) - slack) return event;
  }
  return null;
}

// ---- For the cards ----

/** The strength of the severe gale, in multiples of a full wind: what a turbine's exposure is held against. */
export const SEVERE_GALE = EVENTS.gale.push.severe?.gale ?? 0;

/** Whether a turbine of this exposure keeps turning in a gale of this strength (a hurricane's is stronger than any shelter). */
export const standsGale = (gale: number, exposure: number) => gale * exposure <= TURBINE_LIMIT;

/** Whether a gale can come in a climate (the sandbox has none of its own: it can bring any). */
export const canGale = (c: Pick<Climate, 'season' | 'character'>) => allowed('gale', c);
