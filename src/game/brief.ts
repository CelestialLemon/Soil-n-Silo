// The Open Homestead Brief: the valley's quiet postcard of three seals, open from minute one, with no timer
// (docs/DESIGN.md, "Open Homestead Brief"). Each seal fills as the homestead meets it and, once filled, stays filled.
//   1. The Pantry Order: deliver the settlement's goods to the Depot.
//   2. Living Land: keep a good spread of fields on healthy soil.
//   3. Steady Homestead: once the homestead runs (a Farmhouse, a Garage and a workshop), keep it powered without a
//      blackout through two full days and nights. A blackout resets it, and says why.
// When all three fill, the valley is Restored.
import { CATALOG, isWorkshop } from './catalog.ts';
import type { SimEvent } from './events.ts';
import { countOf, type Good, type Inventory } from './goods.ts';
import type { GameState } from './state.ts';

/** The Spring Valley's Pantry Order. */
export const PANTRY_ORDER: Inventory = { bread: 10, flour: 6, beans: 6 };
export const LIVING_LAND_M2 = 100, LIVING_LAND_FERTILITY = 0.75;
/** Two full days and nights, game hours. */
export const STEADY_HOURS = 48;

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
}
export interface BriefState { order: PantryOrderSeal; livingLand: LivingLandSeal; steadyHomestead: SteadyHomesteadSeal; restored: boolean }

export type SealId = 'order' | 'livingLand' | 'steadyHomestead';
export const SEAL_LABELS: { readonly [K in SealId]: string } = { order: 'The Pantry Order', livingLand: 'Living Land', steadyHomestead: 'Steady Homestead' };

export function blankBrief(): BriefState {
  return {
    order: { targets: { ...PANTRY_ORDER }, delivered: {}, progress: 0, done: false },
    livingLand: { plantedM2: 0, avgFertility: 0, targetM2: LIVING_LAND_M2, targetFertility: LIVING_LAND_FERTILITY, progress: 0, done: false },
    steadyHomestead: { hours: 0, targetHours: STEADY_HOURS, running: false, resetReason: '', progress: 0, done: false },
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
    const kinds = new Set(s.things.map((t) => t.kind));
    h.running = kinds.has('farmhouse') && kinds.has('garage') && [...kinds].some(isWorkshop);
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
      } else h.hours += dtH;
    }
    h.progress = Math.min(1, h.hours / h.targetHours);
  }
  seal('steadyHomestead', h);

  if (!b.restored && o.done && l.done && h.done) {
    b.restored = true;
    events.push({ type: 'restored', message: 'Valley Restored! Your homestead holds in balance.' });
  }
}
