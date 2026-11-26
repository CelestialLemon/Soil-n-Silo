// Procedural valleys and Sandbox: a fresh valley from any seed and season, with its own landform, character and Pantry
// Order, and a Supplies cap balanced against what the order needs. The cap is the Silo and the Garage, every building the
// order's goods are made in (followed down through their recipes: Bread needs the Bakery, the Mill and the Coop), the
// Heated Greenhouse in winter, and an allowance for power, water and carts that the difficulty sets.
import { CATALOG, type ThingKind, WORKSHOP_KINDS, type WorkshopKind } from './catalog.ts';
import { GOOD_LABELS, type Good, type Inventory } from './goods.ts';
import { makeRng, type Rng, subSeed } from './rng.ts';
import type { Difficulty, GameState, Season, TerrainStyle } from './state.ts';
import { TERRAIN_STYLES } from './state.ts';
import { generateValley } from './valley/generate.ts';
import { type ClimateCharacter, climateFor } from './weather.ts';
import { RECIPES } from './workshops.ts';

export { DIFFICULTIES, type Difficulty, isDifficulty } from './state.ts';

/** The Supplies a difficulty allows beyond the order's bare minimum, for power, water, carts and slack. */
export const DIFFICULTY_ALLOWANCE: { readonly [D in Difficulty]: number } = { relaxed: 12, standard: 9, tight: 6 };
/** No procedural valley's cap falls below this. */
export const MIN_PROCEDURAL_CAP = 18;
/** The share of the cap the starter parcel gives (the rest comes as the two milestone drops). */
export const STARTER_SHARE = 0.6;

/** The buildings every homestead needs whatever it makes: the Silo to store the harvest, the Garage and its cart. */
const CORE: readonly ThingKind[] = ['silo', 'garage'];

/** The workshop that makes a good first (byproducts from the maker they fall from), or undefined for what fields grow. */
function makerOf(good: Good): WorkshopKind | undefined {
  if (good === 'honey_cake') return 'bakery';
  return WORKSHOP_KINDS.find((k) => (RECIPES[k].outputs[good] ?? 0) > 0);
}

const costOfSet = (kinds: ReadonlySet<ThingKind>) => [...kinds].reduce((n, k) => n + CATALOG[k].cost, 0);

/** The fewest buildings that make a good, following its recipe's inputs down (the cheapest option of each). */
function buildingsFor(good: Good, seen: ReadonlySet<Good> = new Set()): Set<ThingKind> {
  if (good === 'honey') return new Set(['beehive']);
  if (GOOD_LABELS[good].category === 'harvest') return new Set();
  const maker = makerOf(good);
  if (!maker || seen.has(good)) return new Set();
  const out = new Set<ThingKind>([maker]), path = new Set([...seen, good]);
  const inputs = good === 'honey_cake' ? [...RECIPES.bakery.inputs, { options: ['honey'] as const, count: 1, keep: 2 }] : RECIPES[maker].inputs;
  for (const input of inputs) {
    let best: Set<ThingKind> | undefined;
    for (const option of input.options) {
      const need = buildingsFor(option, path);
      if (!best || costOfSet(need) < costOfSet(best)) best = need;
    }
    for (const k of best ?? []) out.add(k);
  }
  return out;
}

/** The buildings an order needs at the least: the Silo, the Garage, its goods' workshops, and in winter the Greenhouse. */
export function buildingsForOrder(order: Inventory, season: Season): Set<ThingKind> {
  const out = new Set<ThingKind>(CORE);
  for (const [good, n] of Object.entries(order) as [Good, number][]) if (n > 0) for (const k of buildingsFor(good)) out.add(k);
  if (season === 'winter') out.add('greenhouse');
  return out;
}

/** The fewest Supplies a homestead needs to make an order: its buildings' costs (buildingsForOrder). */
export function minimumSuppliesForOrder(order: Inventory, season: Season): number {
  return costOfSet(buildingsForOrder(order, season));
}

/** What each season's Pantry Orders draw on: its crafted goods (the heart of the order) and the plainer extras. */
const ORDER_POOLS: { readonly [S in Season]: { crafted: readonly Good[]; extras: readonly Good[] } } = {
  spring: { crafted: ['bread', 'honey_cake', 'flour', 'eggs'], extras: ['beans', 'wheat', 'honey'] },
  summer: { crafted: ['tomato_sauce', 'oil'], extras: ['beans', 'sunflower', 'tomato', 'honey'] },
  autumn: { crafted: ['linen', 'yarn', 'flour', 'bread'], extras: ['honey', 'wheat', 'flax'] },
  winter: { crafted: ['bread', 'flour', 'eggs'], extras: ['beans', 'wheat', 'honey'] },
};

/** How many of a good an order asks: even counts, honey fewer (one hive makes it slowly). */
function amountOf(rng: Rng, good: Good): number {
  if (good === 'honey') return 2 + 2 * rng.int(2);
  return GOOD_LABELS[good].category === 'harvest' ? 4 + 2 * rng.int(3) : 4 + 2 * rng.int(4);
}

function pickDistinct<T>(rng: Rng, list: readonly T[], n: number): T[] {
  const pool = [...list], out: T[] = [];
  while (out.length < n && pool.length > 0) out.push(pool.splice(rng.int(pool.length), 1)[0]);
  return out;
}

/** A season's Pantry Order rolled from a seed: one or two crafted goods and two plainer ones. */
export function rollPantryOrder(seed: number, season: Season): Inventory {
  const rng = makeRng(subSeed(seed, 71)), pool = ORDER_POOLS[season], order: Inventory = {};
  for (const g of pickDistinct(rng, pool.crafted, 1 + rng.int(2))) order[g] = amountOf(rng, g);
  for (const g of pickDistinct(rng, pool.extras, 2)) order[g] = amountOf(rng, g);
  return order;
}

/**
 * A balanced cap for an order: its minimum plus the difficulty's allowance, never below MIN_PROCEDURAL_CAP. A cheap order's
 * minimum is raised first (to what the tight allowance lifts to MIN_PROCEDURAL_CAP), so a tighter difficulty always means a
 * smaller cap.
 */
export function balancedCap(order: Inventory, season: Season, difficulty: Difficulty): number {
  const base = Math.max(minimumSuppliesForOrder(order, season), MIN_PROCEDURAL_CAP - DIFFICULTY_ALLOWANCE.tight);
  return base + DIFFICULTY_ALLOWANCE[difficulty];
}

const TITLE_WORDS: { readonly [T in TerrainStyle]: readonly string[] } = {
  meadow: ['Meadow', 'Lea', 'Green'], terrace: ['Terrace', 'Steps', 'Bank'], floodplain: ['Bend', 'Water', 'Flats'],
  ridge: ['Ridge', 'Edge', 'Knolls'], slope: ['Slope', 'Combe', 'Brae'], glen: ['Glen', 'Hollow', 'Dell'],
};
const TITLE_HEADS = ['Hazel', 'Bramble', 'Clover', 'Sorrel', 'Linden', 'Bracken', 'Thistle', 'Wren', 'Larch', 'Meadowsweet', 'Elder', 'Mallow'];

/** A procedural valley's name: "Hazel Glen". */
export function proceduralTitle(seed: number, terrain: TerrainStyle): string {
  const rng = makeRng(subSeed(seed, 73));
  return `${rng.pick(TITLE_HEADS)} ${rng.pick(TITLE_WORDS[terrain])}`;
}

export interface ProceduralOptions {
  seed: number; season: Season;
  /** Left out, one picked from the seed. */
  terrain?: TerrainStyle;
  /** Left out, standard. */
  difficulty?: Difficulty;
  /** Left out, the season's character for the seed (weather.ts climateFor); given, the valley's `climateOverride`. */
  climate?: ClimateCharacter;
  /** Left out, one from the seed (the game passes a fresh rollWeatherSeed()). */
  weatherSeed?: number;
  /** Supplies without limit. */
  sandbox?: boolean;
}

/**
 * Grows a procedural valley: its landform (picked from the seed if not given), its character, a Pantry Order rolled for
 * its season, and a Supplies cap balanced for the difficulty, about 60% of it in the starter parcel and the rest in the
 * two milestone drops (or, in Sandbox, Supplies without limit).
 */
export function generateProceduralValley(opts: ProceduralOptions): GameState {
  const seed = opts.seed >>> 0, season = opts.season, rng = makeRng(subSeed(seed, 70));
  const terrain = opts.terrain ?? rng.pick(TERRAIN_STYLES);
  const climate = opts.climate ?? climateFor(seed, season), difficulty = opts.difficulty ?? 'standard';
  const order = rollPantryOrder(seed, season);
  const cap = balancedCap(order, season, difficulty);
  return generateValley(seed, season, {
    climate, terrain, order, suppliesCap: cap, starterSupplies: Math.round(cap * STARTER_SHARE), sandbox: opts.sandbox ?? false,
    valleyTitle: proceduralTitle(seed, terrain), custom: true, difficulty,
    ...(opts.climate === undefined ? {} : { climateOverride: opts.climate }),
    ...(opts.weatherSeed === undefined ? {} : { weatherSeed: opts.weatherSeed }),
  });
}
