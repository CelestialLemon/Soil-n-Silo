// The one-of-each workshops and stores, and the closed loops between them: the Mill grinds wheat into flour and bran, the
// Coop's hens turn bran (or wheat) into eggs and manure, the Bakery bakes flour and eggs into bread, the Composter turns
// manure (or bran) into compost for the fields. The Silo stores goods; the Depot takes the Pantry Order to the settlement.
//
// Each building's live side (its goods, recipe, power and the one plain line its floating card shows) is a ThingRuntime,
// kept by id in `state.sim.things` beside the placed Thing; it comes and goes with the building.
import { CATALOG, isWorkshop, type ThingKind, type WorkshopKind } from './catalog.ts';
import { isNight } from './clock.ts';
import { addGood, capacity, countOf, describeInventory, GOOD_LABELS, type Good, type Inventory, takeGood, totalStored } from './goods.ts';
import type { GameState } from './state.ts';

export interface ThingRuntime {
  id: number; kind: ThingKind;
  /** Goods waiting to be worked (a workshop's), or nothing. */
  inputs: Inventory;
  /** Goods made and waiting for a cart (a workshop's), or a store's stock (the Silo's). */
  outputs: Inventory;
  /** 0..1 through the recipe under way. */
  progress: number;
  /** A recipe is under way (its inputs taken). */
  working: boolean;
  /** It has the power it needs (for a power building or relay: it's on a fed network). */
  powered: boolean;
  /** The network it draws from or belongs to (its root emitter's thing id), or -1. */
  powerNetId: number;
  /** 0..1: a Battery's charge (shown as its rings), else 0. */
  charge: number;
  /** 0..1: how full the Silo is, else 0. */
  siloFill: number;
  /** Watts it drew (a load) or made (a source) on the last step. */
  watts: number;
  /** Recipes it has finished. */
  made: number;
  /** One plain-English line for its floating card. */
  status: string;
}

/** A recipe's input: one unit-count of any of `options`, the first preferred; carts keep `keep` of it in stock. */
export interface RecipeInput { options: readonly Good[]; count: number; keep: number }
export interface Recipe { inputs: readonly RecipeInput[]; outputs: Inventory; hours: number; verb: string }

/** The workshops' recipes, paced for a 30-minute session (game hours: 30 s each at 1×). */
export const RECIPES: { readonly [K in WorkshopKind]: Recipe } = {
  mill: { inputs: [{ options: ['wheat'], count: 2, keep: 4 }], outputs: { flour: 2, bran: 1 }, hours: 1.6, verb: 'Grinding wheat into flour' },
  coop: { inputs: [{ options: ['bran', 'wheat'], count: 1, keep: 2 }], outputs: { eggs: 2, manure: 1 }, hours: 2, verb: 'Hens laying' },
  bakery: { inputs: [{ options: ['flour'], count: 1, keep: 2 }, { options: ['eggs'], count: 1, keep: 2 }], outputs: { bread: 2 }, hours: 1.8, verb: 'Baking bread' },
  composter: { inputs: [{ options: ['manure', 'bran'], count: 1, keep: 2 }], outputs: { compost: 2 }, hours: 2.2, verb: 'Turning compost' },
};

/** How many goods a workshop holds waiting, and made, in all. */
export const INPUT_CAP = 8, OUTPUT_CAP = 8;
/** How many goods the Silo stores, mixed. */
export const SILO_CAP = 60;

const blank = (id: number, kind: ThingKind): ThingRuntime => ({
  id, kind, inputs: {}, outputs: {}, progress: 0, working: false, powered: false, powerNetId: -1,
  charge: kind === 'battery' ? 0.5 : 0, siloFill: 0, watts: 0, made: 0, status: '',
});

/** Makes sure every placed thing has its runtime, and no runtime outlives its thing. */
export function syncRuntime(s: GameState): void {
  const rt = s.sim.things, ids = new Set<number>();
  for (const t of s.things) {
    ids.add(t.id);
    if (!rt.has(t.id)) rt.set(t.id, blank(t.id, t.kind));
  }
  for (const id of [...rt.keys()]) if (!ids.has(id)) rt.delete(id);
}

/** A thing's runtime: made now if it's missing (a thing placed since the last step). */
export function runtimeOf(s: GameState, id: number): ThingRuntime | undefined {
  const t = s.things.find((v) => v.id === id);
  if (!t) return undefined;
  let r = s.sim.things.get(id);
  if (!r) { r = blank(id, t.kind); s.sim.things.set(id, r); }
  return r;
}

/** Which of a recipe input's options it would take now, if it has enough of one. */
const pick = (inv: Inventory, input: RecipeInput) => input.options.find((g) => countOf(inv, g) >= input.count);

/** Whether a workshop has room for a recipe's outputs. */
const roomFor = (r: ThingRuntime, recipe: Recipe) => totalStored(r.outputs) + totalStored(recipe.outputs) <= OUTPUT_CAP;

/** Starts a recipe in every idle workshop that has its inputs and room for what it makes. */
export function startRecipes(s: GameState): void {
  for (const r of s.sim.things.values()) {
    if (!isWorkshop(r.kind) || r.working) continue;
    const recipe = RECIPES[r.kind];
    const picks = recipe.inputs.map((input) => pick(r.inputs, input));
    if (picks.some((g) => g === undefined) || !roomFor(r, recipe)) continue;
    recipe.inputs.forEach((input, k) => { const g = picks[k]; if (g) takeGood(r.inputs, g, input.count); });
    r.working = true;
    r.progress = 0;
  }
}

/** Works the recipes under way for `dtH` game hours, where power allows; returns the workshops that finished one. */
export function advanceRecipes(s: GameState, dtH: number): ThingRuntime[] {
  const done: ThingRuntime[] = [];
  for (const r of s.sim.things.values()) {
    if (!isWorkshop(r.kind) || !r.working) continue;
    const needsPower = CATALOG[r.kind].powerDemand > 0;
    if (needsPower && !r.powered) continue;
    const recipe = RECIPES[r.kind];
    r.progress = Math.min(1, r.progress + dtH / recipe.hours);
    if (r.progress >= 1) {
      for (const [g, n] of Object.entries(recipe.outputs) as [Good, number][]) addGood(r.outputs, g, n);
      r.working = false;
      r.progress = 0;
      r.made++;
      done.push(r);
    }
  }
  return done;
}

/** How many of `good` a building would take now (a workshop's inputs it keeps, the Silo's room), before carts en route. */
export function wantsInput(r: ThingRuntime, good: Good): number {
  if (r.kind === 'silo') return capacity(r.outputs, SILO_CAP);
  if (!isWorkshop(r.kind)) return 0;
  const recipe = RECIPES[r.kind];
  const room = capacity(r.inputs, INPUT_CAP);
  for (const input of recipe.inputs) {
    if (!input.options.includes(good)) continue;
    const have = input.options.reduce((n, g) => n + countOf(r.inputs, g), 0);
    return Math.max(0, Math.min(room, input.keep - have));
  }
  return 0;
}

/** The one plain line a building's card shows. */
export function describeRuntime(s: GameState, r: ThingRuntime): string {
  const def = CATALOG[r.kind];
  const dark = 'Needs a relay or power nearby';
  if (isWorkshop(r.kind)) {
    const recipe = RECIPES[r.kind];
    if (r.working) {
      if (def.powerDemand > 0 && !r.powered) return r.powerNetId >= 0 ? `Paused · not enough power (${def.powerDemand} W)` : dark;
      return `${recipe.verb} · ${Math.round(r.progress * 100)}%`;
    }
    if (!roomFor(r, recipe)) return `Full of ${describeInventory(r.outputs)} · waiting for a cart`;
    const missing = recipe.inputs.filter((input) => !pick(r.inputs, input)).map((input) => input.options.map((g) => GOOD_LABELS[g].label).join(' or '));
    return `Waiting for ${missing.join(' and ')}`;
  }
  switch (r.kind) {
    case 'silo': return totalStored(r.outputs) > 0 ? `Storing ${totalStored(r.outputs)} / ${SILO_CAP} · ${describeInventory(r.outputs)}` : `Empty · stores up to ${SILO_CAP} goods`;
    case 'depot': {
      const o = s.sim.brief.order;
      if (o.done) return 'Pantry Order filled · the settlement thanks you';
      return `Pantry Order · ${Object.entries(o.targets).map(([g, n]) => `${GOOD_LABELS[g as Good].label} ${Math.min(n, countOf(o.delivered, g as Good))}/${n}`).join(' · ')}`;
    }
    case 'farmhouse': return r.powered ? `Home · ${r.watts >= 0.5 ? 'Lamps lit' : 'Daylight'} (${r.watts.toFixed(1)} W)` : r.powerNetId >= 0 ? 'Home · Blackout' : `Home · ${dark}`;
    case 'garage': {
      const carts = s.sim.carts.length, charging = s.sim.carts.filter((c) => c.state === 'charging').length;
      const line = `${carts} cart${carts === 1 ? '' : 's'}${charging > 0 ? ` · ${charging} charging` : ''}`;
      return r.powered ? line : `${line} · ${r.powerNetId >= 0 ? 'Blackout: carts charge slowly from the roof' : dark}`;
    }
    case 'solar': case 'turbine': case 'waterwheel': return r.watts > 0.05 ? `Making ${r.watts.toFixed(1)} W` : r.kind === 'solar' ? 'Resting until sunrise' : 'Idle';
    case 'battery': return `Charge ${Math.round(r.charge * 100)}%`;
    case 'relay': return r.powered ? 'Passing power on' : 'Needs power within 15 m';
    // Its own solar cap lights it after dusk, on the homestead's power or not.
    case 'lantern': return isNight(s.sim.hour) ? 'Glowing along the way' : 'Glows after dusk';
    case 'bench': case 'planter': case 'crates': return def.label;
  }
}
