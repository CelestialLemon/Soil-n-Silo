// The one-of-each workshops and stores, and the closed loops between them: the Mill grinds wheat into flour and bran, the
// Coop's hens turn bran (or seed cake, or wheat) into eggs and manure, the Bakery bakes flour and eggs into bread, the
// Composter turns manure (or bran, or seed cake) into compost for the fields. The Oil Press presses sunflowers into oil and
// seed cake, the Cannery simmers tomatoes and oil into sauce, the Spinner spins flax into yarn and the Loom weaves it into
// linen. The Biogas Digester burns the organic waste (manure, bran, seed cake) into steady power whatever the weather, lit
// only when its network needs it. The Silo stores goods; the Depot takes the Pantry Order to the settlement.
//
// Each building's live side (its goods, recipe, power and the one plain line its floating card shows) is a ThingRuntime,
// kept by id in `state.sim.things` beside the placed Thing; it comes and goes with the building.
import { CATALOG, isWorkshop, type ThingKind, type WorkshopKind } from './catalog.ts';
import { forageRate, hotMidday, effectiveMoisture, isLiquidRain, treeShade } from './microclimate.ts';
import type { SimEnv } from './power/sim.ts';
import { isNight } from './clock.ts';
import { addGood, capacity, countOf, describeInventory, GOOD_LABELS, type Good, type Inventory, takeGood, totalStored } from './goods.ts';
import type { Crop, GameState } from './state.ts';
import { describeWeather } from './weather.ts';

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
  /** Rain Tank reserve, 0..1. */
  water: number;
  recipe: 'bread' | 'honey_cake';
  /** Recipe paid for when this batch started, even if the player changes the next one. */
  batch: 'bread' | 'honey_cake';
  /** Where its byproduct goes first (the Mill's bran, the Coop's manure, the Oil Press's seed cake): BYPRODUCTS. */
  priority: ByproductTarget;
  /** The crop the Heated Greenhouse grows under its glass. */
  greenhouseCrop: Crop;
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

/** Where a byproduct may be sent first: 'auto' leaves it to the carts. */
export type ByproductTarget = 'auto' | 'coop' | 'composter' | 'digester' | 'silo';
export type ByproductMaker = 'mill' | 'coop' | 'oil_press';
/** Each byproduct maker's byproduct, and where the player may send it first (its card's pip cycles through these). */
export const BYPRODUCTS: { readonly [K in ByproductMaker]: { good: Good; targets: readonly ByproductTarget[] } } = {
  mill: { good: 'bran', targets: ['auto', 'coop', 'composter', 'digester'] },
  coop: { good: 'manure', targets: ['auto', 'composter', 'digester', 'silo'] },
  oil_press: { good: 'seed_cake', targets: ['auto', 'coop', 'composter', 'digester'] },
};
export const isByproductMaker = (k: ThingKind): k is ByproductMaker => Object.hasOwn(BYPRODUCTS, k);

/**
 * Where a maker's byproduct really goes first now: its chosen destination while one of that kind stands, else 'auto' (a
 * Digester chosen and then taken down leaves the carts to choose, as if the player had never picked).
 */
export function effectivePriority(s: GameState, r: ThingRuntime): ByproductTarget {
  const p = r.priority;
  return p === 'auto' || !s.things.some((t) => t.kind === p) ? 'auto' : p;
}

/** A recipe's input: one unit-count of any of `options`, the first preferred; carts keep `keep` of it in stock. */
export interface RecipeInput { options: readonly Good[]; count: number; keep: number }
export interface Recipe { inputs: readonly RecipeInput[]; outputs: Inventory; hours: number; verb: string }

/** The workshops' recipes, paced for a 30-minute session (game hours: 30 s each at 1×). */
export const RECIPES: { readonly [K in WorkshopKind]: Recipe } = {
  mill: { inputs: [{ options: ['wheat'], count: 2, keep: 4 }], outputs: { flour: 2, bran: 1 }, hours: 1.6, verb: 'Grinding wheat into flour' },
  coop: { inputs: [{ options: ['bran', 'seed_cake', 'wheat'], count: 1, keep: 2 }], outputs: { eggs: 2, manure: 1 }, hours: 2, verb: 'Hens laying' },
  bakery: { inputs: [{ options: ['flour'], count: 1, keep: 2 }, { options: ['eggs'], count: 1, keep: 2 }], outputs: { bread: 2 }, hours: 1.8, verb: 'Baking bread' },
  composter: { inputs: [{ options: ['manure', 'bran', 'seed_cake'], count: 1, keep: 2 }], outputs: { compost: 2 }, hours: 2.2, verb: 'Turning compost' },
  oil_press: { inputs: [{ options: ['sunflower'], count: 2, keep: 4 }], outputs: { oil: 2, seed_cake: 1 }, hours: 1.8, verb: 'Pressing sunflower oil' },
  cannery: { inputs: [{ options: ['tomato'], count: 2, keep: 4 }, { options: ['oil'], count: 1, keep: 2 }], outputs: { tomato_sauce: 2 }, hours: 2, verb: 'Simmering tomato sauce' },
  spinner: { inputs: [{ options: ['flax'], count: 2, keep: 4 }], outputs: { yarn: 2 }, hours: 1.8, verb: 'Spinning flax into yarn' },
  loom: { inputs: [{ options: ['yarn'], count: 2, keep: 4 }], outputs: { linen: 2 }, hours: 2.2, verb: 'Weaving linen' },
};

/** The Biogas Digester's fuel, the first preferred: the homestead's organic waste. */
export const DIGESTER_FUELS = ['manure', 'bran', 'seed_cake'] as const satisfies readonly Good[];
/** What it makes while it burns (day and night, in any weather), W; how long one unit of waste burns, game hours. */
export const DIGESTER_W = 4, DIGESTER_BURN_HOURS = 4;
/** Its hopper: the carts keep it stocked with this much waste. */
export const DIGESTER_FEED: RecipeInput = { options: DIGESTER_FUELS, count: 1, keep: 4 };

/** What a building takes in, as recipe inputs: a workshop's recipe's, or the Digester's fuel. Empty for the rest. */
export function inputsOf(r: ThingRuntime): readonly RecipeInput[] {
  if (isWorkshop(r.kind)) return recipeOf(r.kind, r).inputs;
  return r.kind === 'digester' ? [DIGESTER_FEED] : [];
}

const cake: Recipe = {
  inputs: [...RECIPES.bakery.inputs, { options: ['honey'], count: 1, keep: 2 }],
  outputs: { honey_cake: 2 }, hours: 2.2, verb: 'Baking honey cake',
};
export function recipeOf(kind: WorkshopKind, r: ThingRuntime, current = false): Recipe {
  return kind === 'bakery' && (current && r.working ? r.batch : r.recipe) === 'honey_cake' ? cake : RECIPES[kind];
}

export function stepEcology(s: GameState, dtH: number, env: SimEnv): void {
  const drain = new Map<number, number>();
  for (const f of s.fields) if (!f.harvestReady) effectiveMoisture(s, f, drain, env.weather);
  for (const t of s.things) {
    if (t.kind !== 'beehive' && t.kind !== 'rain_tank') continue;
    const r = s.sim.things.get(t.id);
    if (!r) continue;
    if (t.kind === 'rain_tank') {
      // Rain fills it (not snow: a storm falling as snow leaves it as it is); grey skies and the morning dew top it up, but
      // not while the air freezes.
      const thawed = s.sim.weather.tempC > 0;
      const refill = isLiquidRain(s, env.weather) ? 0.18 : !thawed ? 0 : env.weather === 'overcast' ? 0.05 : s.sim.hour >= 5 && s.sim.hour < 8 ? 0.02 : 0;
      // A 25 m² bed consumes 2.5% of a reserve per game hour.
      r.water = Math.max(0, Math.min(1, r.water + dtH * (refill - 0.001 * (drain.get(t.id) ?? 0))));
    } else {
      const rate = forageRate(s, t, env);
      r.working = rate > 0;
      if (totalStored(r.outputs) >= OUTPUT_CAP) continue;
      r.progress += dtH * rate / 4.5;
      const made = Math.min(OUTPUT_CAP - totalStored(r.outputs), Math.floor(r.progress));
      addGood(r.outputs, 'honey', made);
      r.made += made;
      r.progress %= 1;
    }
  }
}

/** The Heated Greenhouse: what it grows per harvest, how long one takes (game hours) and below what air it heats harder. */
export const GREENHOUSE_YIELD = 2, GREENHOUSE_HOURS = 3.2, GREENHOUSE_COLD_C = 10;
/** Its draw while it grows: heating hard in the cold, a little warmth and light otherwise, W. */
export const GREENHOUSE_COLD_W = 2, GREENHOUSE_MILD_W = 0.5;

/**
 * Grows the Heated Greenhouse's crop for `dtH` game hours: under glass, frost, snow, flood and drought never touch it, but
 * it grows only while powered, and only while it has room for the harvest (the carts take it away like a workshop's goods).
 * `working`: it wants to grow (it has room), so it draws its power; it grows when it has it.
 */
export function growGreenhouses(s: GameState, dtH: number): ThingRuntime[] {
  const done: ThingRuntime[] = [];
  for (const r of s.sim.things.values()) {
    if (r.kind !== 'greenhouse') continue;
    r.working = totalStored(r.outputs) + GREENHOUSE_YIELD <= OUTPUT_CAP;
    if (!r.working || !r.powered || dtH <= 0) continue;
    r.progress = Math.min(1, r.progress + dtH / GREENHOUSE_HOURS);
    if (r.progress >= 1) {
      addGood(r.outputs, r.greenhouseCrop, GREENHOUSE_YIELD);
      r.progress = 0;
      r.made++;
      done.push(r);
    }
  }
  return done;
}

/** How many goods a workshop holds waiting, and made, in all. */
export const INPUT_CAP = 8, OUTPUT_CAP = 8;
/** How many goods the Silo stores, mixed; and of any one good, so a glut of one never fills it against the rest. */
export const SILO_CAP = 60, SILO_GOOD_CAP = 14;

/** Room the Silo has now: for `good` (its share, within what's left), or for anything. */
export function siloRoom(r: ThingRuntime, good?: Good): number {
  const left = Math.max(0, SILO_CAP - totalStored(r.outputs));
  return good === undefined ? left : Math.max(0, Math.min(left, SILO_GOOD_CAP - countOf(r.outputs, good)));
}

/** A new building's runtime. A Battery is built empty, and a Digester cold with an empty hopper: only what the homestead
 * makes ever fills them (so taking one down and building it again can't make energy). */
const blank = (id: number, kind: ThingKind): ThingRuntime => ({
  id, kind, inputs: {}, outputs: {}, progress: 0, working: false, powered: false, powerNetId: -1,
  water: 0, recipe: 'bread', batch: 'bread', priority: 'auto', greenhouseCrop: 'beans',
  charge: 0, siloFill: 0, watts: 0, made: 0, status: '',
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

/** Room left in a workshop's outputs, keeping space for what the batch under way will make. */
export function outputRoom(r: ThingRuntime): number {
  const reserved = r.working && isWorkshop(r.kind) ? totalStored(recipeOf(r.kind, r, true).outputs) : 0;
  return Math.max(0, OUTPUT_CAP - totalStored(r.outputs) - reserved);
}

/** A Bakery baking bread sets out the Honey it no longer uses for the carts to take away, as its outputs have room. */
export function setOutHoney(r: ThingRuntime): void {
  if (r.kind !== 'bakery' || r.recipe !== 'bread') return;
  addGood(r.outputs, 'honey', takeGood(r.inputs, 'honey', outputRoom(r)));
}

/**
 * Notes which Heated Greenhouses want to grow (they have room for the harvest): read before the power runs, so a cold one
 * asks for its full heating from the first step and never grows a step on power it didn't get.
 */
export function syncGreenhouses(s: GameState): void {
  for (const r of s.sim.things.values()) if (r.kind === 'greenhouse') r.working = totalStored(r.outputs) + GREENHOUSE_YIELD <= OUTPUT_CAP;
}

/**
 * Starts a recipe in every idle workshop that has its inputs and room for what it makes (and readies the Greenhouses). The
 * Digester isn't one of them: the power lights it when its network needs it (power/sim.ts), so its waste waits for need.
 */
export function startRecipes(s: GameState): void {
  syncGreenhouses(s);
  for (const r of s.sim.things.values()) {
    setOutHoney(r);
    if (!isWorkshop(r.kind) || r.working) continue;
    const recipe = recipeOf(r.kind, r);
    const picks = recipe.inputs.map((input) => pick(r.inputs, input));
    if (picks.some((g) => g === undefined) || !roomFor(r, recipe)) continue;
    recipe.inputs.forEach((input, k) => { const g = picks[k]; if (g) takeGood(r.inputs, g, input.count); });
    r.batch = r.recipe;
    r.working = true;
    r.progress = 0;
  }
}

/**
 * A cold Digester with waste in its hopper takes a unit of it and starts burning; returns whether it lit. The power calls
 * it (stepPower) only when the Digester's network is short or its batteries are low.
 */
export function lightDigester(r: ThingRuntime): boolean {
  if (r.kind !== 'digester' || r.working) return false;
  const g = pick(r.inputs, DIGESTER_FEED);
  if (!g) return false;
  takeGood(r.inputs, g, DIGESTER_FEED.count);
  r.working = true;
  r.progress = 0;
  return true;
}

/** Waste in a Digester's hopper, all kinds together. */
export const digesterFuel = (r: ThingRuntime) => DIGESTER_FEED.options.reduce((n, g) => n + countOf(r.inputs, g), 0);

/**
 * Works the recipes under way for `dtH` game hours, where power allows, and burns the Digesters' waste; returns the
 * workshops that finished one.
 */
export function advanceRecipes(s: GameState, dtH: number, weather?: string): ThingRuntime[] {
  const done: ThingRuntime[] = [];
  for (const r of s.sim.things.values()) {
    if (r.kind === 'digester' && r.working && dtH > 0) {
      r.progress = Math.min(1, r.progress + dtH / DIGESTER_BURN_HOURS);
      // Burnt out: cold at once, so its card never shows the watts of a burn that's over.
      if (r.progress >= 1) { r.working = false; r.progress = 0; r.watts = 0; r.made++; }
      continue;
    }
    if (!isWorkshop(r.kind) || !r.working) continue;
    const needsPower = CATALOG[r.kind].powerDemand > 0;
    if (needsPower && !r.powered) continue;
    const recipe = recipeOf(r.kind, r, true);
    const coop = r.kind === 'coop' && hotMidday(s, weather) && s.things.find(t => t.id === r.id);
    const comfort = coop ? (treeShade(s, coop, 10) ? 1.15 : 0.9) : 1;
    r.progress = Math.min(1, r.progress + dtH * comfort / recipe.hours);
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

/**
 * How many of `good` a building would take now (a workshop's inputs it keeps, the Digester's fuel, the Silo's room), before
 * carts en route.
 */
export function wantsInput(r: ThingRuntime, good: Good): number {
  if (r.kind === 'silo') return siloRoom(r, good);
  const room = capacity(r.inputs, INPUT_CAP);
  for (const input of inputsOf(r)) {
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
    const recipe = recipeOf(r.kind, r, true);
    if (r.working) {
      if (def.powerDemand > 0 && !r.powered) return r.powerNetId >= 0 ? `Paused · not enough power (${def.powerDemand} W)` : dark;
      return `${recipe.verb} · ${Math.round(r.progress * 100)}%`;
    }
    if (!roomFor(r, recipe)) return `Full of ${describeInventory(r.outputs)} · waiting for a cart`;
    const missing = recipe.inputs.filter((input) => !pick(r.inputs, input)).map((input) => input.options.map((g) => GOOD_LABELS[g].label).join(' or '));
    return `Waiting for ${missing.join(' and ')}`;
  }
  switch (r.kind) {
    case 'rain_tank': return `Rainwater · ${Math.round(r.water * 100)}% full`;
    case 'weather_station': return describeWeather(s);
    case 'digester': {
      if (r.working) return `Burning biogas · ${DIGESTER_W.toFixed(1)} W (${Math.round(r.progress * 100)}%)`;
      const fuel = digesterFuel(r);
      return fuel > 0 ? `Standby · ${fuel} waste ready (${DIGESTER_W.toFixed(1)} W on demand)` : 'Waiting for manure, bran or seed cake';
    }
    case 'greenhouse': {
      const crop = GOOD_LABELS[r.greenhouseCrop].label;
      if (!r.working) return `Full of ${describeInventory(r.outputs)} · waiting for a cart`;
      if (!r.powered) return r.powerNetId >= 0 ? `Paused · not enough power to heat the glass` : dark;
      return `Growing ${crop} under glass · ${Math.round(r.progress * 100)}% · ${r.watts.toFixed(1)} W`;
    }
    case 'sprinkler': return r.watts > 0 ? 'Watering nearby fields · 1 W' : r.powered ? 'Waiting for dry crops' : dark;
    case 'beehive': return `${r.working ? 'Bees foraging' : 'Bees resting'} · ${countOf(r.outputs, 'honey')} Honey`;
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
    case 'lantern': return isNight(s.sim.hour, s.season) ? 'Glowing along the way' : 'Glows after dusk';
    case 'bench': case 'planter': case 'crates': return def.label;
  }
}
