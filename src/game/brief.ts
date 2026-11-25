// The Open Homestead Brief: the valley's quiet postcard of three seals, open from minute one, with no timer
// (docs/DESIGN.md, "Open Homestead Brief"). Each seal fills as the homestead meets it and, once filled, stays filled.
//   1. The Pantry Order: deliver the settlement's goods to the Depot.
//   2. Living Land: keep a good spread of fields on healthy soil.
//   3. Steady Homestead: once the homestead runs (a Farmhouse, a Garage and a workshop), keep it powered without a
//      blackout through two full days and nights of living weather, lived through. A blackout or an unpowered homestead
//      building resets it, and says why; so does taking down what makes it run, or jumping the clock (the hours must be
//      lived, not skipped). Fields left parched for hours on end pause it (no reset) until they're watered again.
// When all three fill, the valley is Restored.
import { CATALOG, isWorkshop } from './catalog.ts';
import type { SimEvent } from './events.ts';
import { countOf, type Good, type Inventory } from './goods.ts';
import type { GameState, Season } from './state.ts';
import { fieldMoisture } from './crops.ts';

/**
 * Each season's Pantry Order, all within the 20-Supply cap. Winter's leans on the Heated Greenhouse (wheat and beans under
 * glass) and a Beehive foraging inside it.
 */
export const PANTRY_ORDERS: { readonly [S in Season]: Inventory } = {
  spring: { bread: 10, flour: 6, beans: 6, honey: 4 },
  summer: { bread: 10, flour: 6, beans: 8, honey: 4 },
  autumn: { bread: 10, flour: 8, beans: 6, honey: 2 },
  winter: { bread: 8, flour: 6, beans: 6, honey: 2 },
};
/** The Spring Valley's Pantry Order. */
export const PANTRY_ORDER: Inventory = PANTRY_ORDERS.spring;
/** Fields this dry are parched (their crop's own moisture, devices and weather counted). */
export const PARCHED = 0.25;
/** How long every growing field may stay parched before Steady Homestead pauses, game hours. */
export const DRY_GRACE_HOURS = 6;
export const DRY_FIELDS = 'Fields are dry — dig a rill, add a Rain Tank or power a Sprinkler';
export const LIVING_LAND_M2 = 100, LIVING_LAND_FERTILITY = 0.75;
/** Two full days and nights, game hours. */
export const STEADY_HOURS = 48;
/** Why Steady Homestead starts over when what makes the homestead run comes down, or the clock jumps. */
export const SETUP_CHANGED = 'Homestead setup changed — Steady Homestead reset';
export const CLOCK_JUMPED = 'Time jumped — Steady Homestead timer reset';

export interface Seal { progress: number; done: boolean }
export interface PantryOrderSeal extends Seal {
  targets: Inventory;
  /** What's counted toward it (never above its target). */
  delivered: Inventory;
}
export interface LivingLandSeal extends Seal { plantedM2: number; avgFertility: number; targetM2: number; targetFertility: number }
export interface SteadyHomesteadSeal extends Seal {
  /** Blackout-free hours so far. */
  hours: number; targetHours: number;
  /** The homestead runs (a Farmhouse, a Garage and a craft workshop stand), so the hours count. */
  running: boolean;
  /** Why it last went back to zero, in plain words (empty if it never has). */
  resetReason: string;
  /** Game hours every growing field has stood parched in a row (dry fields stall the homestead after DRY_GRACE_HOURS). */
  dryHours: number;
  /** The hours aren't counting for now, though nothing reset them; `pauseReason` says why (empty while counting). */
  paused: boolean;
  pauseReason: string;
}
export interface BriefState { order: PantryOrderSeal; livingLand: LivingLandSeal; steadyHomestead: SteadyHomesteadSeal; restored: boolean }

export type SealId = 'order' | 'livingLand' | 'steadyHomestead';
export const SEAL_LABELS: { readonly [K in SealId]: string } = { order: 'The Pantry Order', livingLand: 'Living Land', steadyHomestead: 'Steady Homestead' };

export function blankBrief(season: Season = 'spring'): BriefState {
  const targets = { ...PANTRY_ORDERS[season] };
  return {
    order: { targets, delivered: {}, progress: 0, done: false },
    livingLand: { plantedM2: 0, avgFertility: 0, targetM2: LIVING_LAND_M2, targetFertility: LIVING_LAND_FERTILITY, progress: 0, done: false },
    steadyHomestead: { hours: 0, targetHours: STEADY_HOURS, running: false, resetReason: '', dryHours: 0, paused: false, pauseReason: '', progress: 0, done: false },
    restored: false,
  };
}

/** Steps the brief by `dtH` game hours (after the power and the carts have run), noting what filled. */
export function stepBrief(s: GameState, dtH: number, events: SimEvent[]): void {
  const b = s.sim.brief;
  const seal = (id: SealId, v: Seal) => {
    if (v.done || v.progress < 1) return;
    v.done = true;
    events.push({ type: 'seal', message: `Seal earned: ${SEAL_LABELS[id]}!` });
  };

  // 1. The Pantry Order.
  const o = b.order;
  let want = 0, got = 0;
  for (const [g, n] of Object.entries(o.targets) as [Good, number][]) {
    const d = Math.min(n, countOf(s.sim.delivered, g));
    o.delivered[g] = d;
    want += n; got += d;
  }
  if (!o.done) o.progress = want > 0 ? got / want : 1;
  seal('order', o);

  // 2. Living Land.
  const l = b.livingLand;
  const area = s.fields.reduce((v, f) => v + f.areaM2, 0);
  l.plantedM2 = area;
  l.avgFertility = area > 0 ? s.fields.reduce((v, f) => v + f.fertility * f.areaM2, 0) / area : 0;
  if (!l.done) l.progress = 0.5 * Math.min(1, area / l.targetM2) + 0.5 * Math.min(1, l.avgFertility / l.targetFertility);
  seal('livingLand', l);

  // 3. Steady Homestead.
  const h = b.steadyHomestead;
  if (!h.done) {
    if (resetSteadyOnSetupChange(s)) events.push({ type: 'steadyReset', message: SETUP_CHANGED });
    if (h.running && dtH > 0) {
      const dark = s.things.find((t) => CATALOG[t.kind].category === 'homestead' && CATALOG[t.kind].powerRole === 'load' && s.sim.things.get(t.id)?.powered !== true);
      const why = s.sim.powerSummary.anyBlackout ? s.sim.powerSummary.lastBlackoutReason
        : dark ? `The ${CATALOG[dark.kind].label} has no power: bring it inside a power field.` : '';
      if (why) {
        if (h.hours > 0) {
          h.resetReason = why;
          events.push({ type: 'steadyReset', message: `${SEAL_LABELS.steadyHomestead} starts over. ${why}` });
        }
        h.hours = 0;
        h.paused = false; h.pauseReason = '';
      } else {
        h.dryHours = fieldsParched(s) ? h.dryHours + dtH : 0;
        h.paused = h.dryHours > DRY_GRACE_HOURS;
        h.pauseReason = h.paused ? DRY_FIELDS : '';
        if (!h.paused) h.hours += dtH;
      }
    }
    h.progress = Math.min(1, h.hours / h.targetHours);
  }
  seal('steadyHomestead', h);

  if (!b.restored && o.done && l.done && h.done) {
    b.restored = true;
    events.push({ type: 'restored', message: 'Valley Restored! Your homestead holds in balance.' });
  }
}

/**
 * Whether the homestead has painted fields and every one that's growing (not ripe, frosted or flooded) stands parched:
 * dry fields stall it (Steady Homestead pauses after DRY_GRACE_HOURS of it, and goes on once they're watered).
 */
export function fieldsParched(s: GameState): boolean {
  const growing = s.fields.filter((f) => f.harvestReady === 0 && !f.frosted && !f.flooded);
  return growing.length > 0 && growing.every((f) => fieldMoisture(s, f, s.sim.weather.spell) < PARCHED);
}

/** Whether the homestead runs: a Farmhouse, a Garage and a craft workshop stand. */
export function homesteadRuns(s: GameState): boolean {
  const kinds = new Set(s.things.map((t) => t.kind));
  return kinds.has('farmhouse') && kinds.has('garage') && [...kinds].some(isWorkshop);
}

/**
 * Notes whether the homestead runs; if the Farmhouse, the Garage or the last workshop came down mid-run, an unfinished
 * Steady Homestead starts over (the hours so far don't count). Called the moment a building comes down, not only on the
 * next tick, so taking one down and building it again while paused can't keep the hours. Returns whether it started over.
 */
export function resetSteadyOnSetupChange(s: GameState): boolean {
  const h = s.sim.brief.steadyHomestead;
  if (h.done) return false;
  h.running = homesteadRuns(s);
  if (h.running || h.hours <= 0) return false;
  h.hours = 0;
  h.progress = 0;
  h.resetReason = SETUP_CHANGED;
  return true;
}

/**
 * The clock jumped (Dawn, Noon, Golden or Dusk on the sky strip): an unfinished Steady Homestead starts over, as the hours
 * it skipped weren't lived through. A filled seal stays filled. Returns whether it started over.
 */
export function resetSteadyOnClockJump(s: GameState): boolean {
  const h = s.sim.brief.steadyHomestead;
  if (h.done || h.hours <= 0) return false;
  h.hours = 0;
  h.progress = 0;
  h.resetReason = CLOCK_JUMPED;
  return true;
}
