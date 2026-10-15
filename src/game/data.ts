// The game's content as data: goods, crops, buildings and recipes, with every number to tune in one place (DESIGN.md has the
// tables these come from).

// ---- Goods ----

export const ITEM_IDS = [
  'wheat', 'beans', 'tomato', 'sunflower', 'flax', 'egg', 'manure', 'honey', 'flour', 'bran', 'oil', 'seedcake', 'compost', 'yarn',
  'linen', 'bread', 'sauce', 'honeycake',
] as const;
export type ItemId = typeof ITEM_IDS[number];

export interface ItemDef {
  name: string; price: number; colour: number; hint: string;
  /** Its plural, where it isn't the name (for counts in recipes: "2 sunflowers"). */
  many?: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  wheat: { name: 'Wheat', price: 2, colour: 0xe2c25a, hint: 'Milled into flour.' },
  beans: { name: 'Beans', price: 2, colour: 0x6a9a3a, hint: 'Chicken feed. Bean fields restore the soil.' },
  tomato: { name: 'Tomato', many: 'tomatoes', price: 3, colour: 0xe0503a, hint: 'Cooked into sauce.' },
  sunflower: { name: 'Sunflower', many: 'sunflowers', price: 3, colour: 0xf2c63a, hint: 'Pressed into oil.' },
  flax: { name: 'Flax', price: 3, colour: 0x8aa8d8, hint: 'Spun into yarn.' },
  egg: { name: 'Egg', many: 'eggs', price: 6, colour: 0xf6efe0, hint: 'Baked into bread and cake.' },
  manure: { name: 'Manure', price: 1, colour: 0x6a442e, hint: 'Composted, or burnt in the digester.' },
  honey: { name: 'Honey', price: 10, colour: 0xf0a020, hint: 'Baked into honey cake.' },
  flour: { name: 'Flour', price: 7, colour: 0xf4ecd8, hint: 'Baked into bread and cake.' },
  bran: { name: 'Bran', price: 1, colour: 0xb88a4a, hint: 'A milling byproduct: chicken feed, compost or fuel.' },
  oil: { name: 'Oil', price: 12, colour: 0xe8c040, hint: 'Cooked into sauce.' },
  seedcake: { name: 'Seed cake', price: 2, colour: 0x9a7a4a, hint: 'A pressing byproduct: chicken feed, compost or fuel.' },
  compost: { name: 'Compost', price: 4, colour: 0x4a3626, hint: 'Feeds the soil: fields take it when their soil drops.' },
  yarn: { name: 'Yarn', price: 10, colour: 0xd8d0e8, hint: 'Woven into linen.' },
  linen: { name: 'Linen', price: 45, colour: 0xece4d0, hint: 'A product. Deliver it.' },
  bread: { name: 'Bread', price: 22, colour: 0xc88a4a, hint: 'A product. Deliver it.' },
  sauce: { name: 'Tomato sauce', price: 40, colour: 0xc8302a, hint: 'A product. Deliver it.' },
  honeycake: { name: 'Honey cake', price: 60, colour: 0xe8b060, hint: 'A product. Deliver it.' },
};

/** Groups a recipe can take any member of. */
export const GROUPS = {
  feed: ['beans', 'bran', 'seedcake'],
  organic: ['manure', 'bran', 'seedcake'],
} as const satisfies Record<string, readonly ItemId[]>;
export type GroupId = keyof typeof GROUPS;
const lcItem = (i: ItemId) => ITEMS[i].name.toLowerCase();
/** A group's members in words: "manure, bran or seed cake". */
export const anyOf = (g: GroupId) => { const n = GROUPS[g].map(lcItem); return `${n.slice(0, -1).join(', ')} or ${n[n.length - 1]}`; };
const GROUP_WORDS: Record<GroupId, string> = { feed: 'feed', organic: 'organic matter' };
export const GROUP_NAMES: Record<GroupId, string> = { feed: `${GROUP_WORDS.feed} (${anyOf('feed')})`, organic: `${GROUP_WORDS.organic} (${anyOf('organic')})` };

// ---- Crops ----

export const CROP_IDS = ['wheat', 'beans', 'tomato', 'sunflower', 'flax'] as const;
export type CropId = typeof CROP_IDS[number];

export interface CropDef {
  name: string;
  /** Seconds from planting to harvest, watered, at fertility 60 (growth ×1.0). */
  grow: number;
  yield: number;
  /** Fertility change on each of the field's tiles per harvest. */
  soil: number;
  /** Flowers (bees make honey from it, and a pollinated field yields one more). */
  flowers: boolean;
  /** Growth stages drawn. */
  stages: number;
}

export const CROPS: Record<CropId, CropDef> = {
  wheat: { name: 'Wheat', grow: 40, yield: 3, soil: -1, flowers: false, stages: 4 },
  beans: { name: 'Beans', grow: 50, yield: 2, soil: 2.5, flowers: true, stages: 4 },
  tomato: { name: 'Tomato', grow: 60, yield: 4, soil: -1.5, flowers: true, stages: 4 },
  sunflower: { name: 'Sunflower', grow: 70, yield: 3, soil: -2, flowers: true, stages: 4 },
  flax: { name: 'Flax', grow: 55, yield: 3, soil: -1.5, flowers: true, stages: 4 },
};

/** Goods a pollinated field of a flowering crop yields on top of its usual yield, every harvest. */
export const POLLINATION_BONUS = 1;

export const FIELD = {
  /** Harvested goods a field holds before it stops growing. */
  store: 6,
  /** A field takes compost, and spreads it at once, only while its average fertility is below this. */
  compostBelow: 85,
  compostGain: 12,
  /** Growth multiplier without water. */
  dry: 0.4,
  /** Growth multiplier at fertility 0 and 100 (linear between). */
  poorSoil: 0.4, richSoil: 1.4,
  /** Fertility a second that ground without a field regains, up to what it started at. */
  rest: 0.1,
};

// ---- Buildings ----

export const BUILDING_IDS = [
  'silo', 'garage',
  'field', 'sprinkler', 'coop', 'hive', 'composter',
  'mill', 'press', 'spinner', 'loom', 'bakery', 'cannery',
  'solar', 'turbine', 'battery', 'digester', 'pylon',
  'sapling', 'depot',
] as const;
export type BuildingId = typeof BUILDING_IDS[number];
/** The ids that make something from a recipe (the ones `RECIPES` is for; `isMachine` checks the data). */
export type MachineId = 'coop' | 'composter' | 'mill' | 'press' | 'spinner' | 'loom' | 'bakery' | 'cannery' | 'digester';

export type Category = 'logistics' | 'farming' | 'processing' | 'power' | 'ecology';
export const CATEGORIES: { id: Category; name: string }[] = [
  { id: 'logistics', name: 'Logistics' }, { id: 'farming', name: 'Farming' }, { id: 'processing', name: 'Processing' },
  { id: 'power', name: 'Power' }, { id: 'ecology', name: 'Ecology' },
];

export interface BuildingDef {
  name: string;
  size: number;
  cost: number;
  category: Category | null;
  /** Watts it draws while working. */
  power?: number;
  /** Tall: shelters a wind turbine next to it. */
  tall?: boolean;
  /** Can stand on water (a little bridge). */
  onWater?: boolean;
  /** A line on what it does (the ones that quote numbers are getters, built from the tables below). */
  hint: string;
  key?: string;
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  silo: { name: 'Silo', size: 2, cost: 80, category: 'logistics', tall: true, key: 'L', hint: 'Stores goods: trucks drop them here and pick them up again.' },
  garage: { name: 'Garage', size: 2, cost: 100, category: 'logistics', power: 20, key: 'T', get hint() { return `Home of up to ${TRUCK.perGarage} trucks: buy them here, give them routes. Charges them.`; } },
  field: { name: 'Field', size: 3, cost: 30, category: 'farming', key: 'F', hint: 'Grows a crop on rich soil. Water it with sprinklers; feed it compost.' },
  sprinkler: { name: 'Sprinkler', size: 1, cost: 25, category: 'farming', power: 3, get hint() { return `Waters fields within ${POWER.sprinklerReach} tiles. Cheaper to run near water.`; } },
  coop: { name: 'Coop', size: 3, cost: 150, category: 'farming', get hint() { return `Chickens: ${recipeWords('eggs')}.`; } },
  hive: { name: 'Beehive', size: 1, cost: 60, category: 'farming', hint: 'Honey from flowering fields nearby; pollinates them for a bigger harvest.' },
  composter: { name: 'Composter', size: 2, cost: 60, category: 'farming', get hint() { return `Turns ${anyOf('organic')} into compost.`; } },
  mill: { name: 'Mill', size: 2, cost: 200, category: 'processing', power: 12, tall: true, get hint() { return `${recipeWords('flour')}.`; } },
  press: { name: 'Oil press', size: 2, cost: 220, category: 'processing', power: 15, get hint() { return `${recipeWords('oil')}.`; } },
  spinner: { name: 'Spinner', size: 2, cost: 200, category: 'processing', power: 10, get hint() { return `${recipeWords('yarn')}.`; } },
  loom: { name: 'Loom', size: 2, cost: 300, category: 'processing', power: 20, get hint() { return `${recipeWords('linen')}.`; } },
  bakery: { name: 'Bakery', size: 2, cost: 350, category: 'processing', power: 25, tall: true, get hint() { return `${sentence(recipeWords('bread'))}, or ${recipeWords('honeycake')}.`; } },
  cannery: { name: 'Cannery', size: 2, cost: 300, category: 'processing', power: 18, get hint() { return `${sentence(recipeWords('sauce'))}.`; } },
  solar: { name: 'Solar panel', size: 2, cost: 70, category: 'power', key: 'S', get hint() { return `${POWER.solar} W at noon; nothing at night.`; } },
  turbine: { name: 'Wind turbine', size: 1, cost: 120, category: 'power', tall: true, get hint() { return `${POWER.turbine} W in full wind. Trees and tall buildings close by shelter it.`; } },
  battery: { name: 'Battery', size: 2, cost: 150, category: 'power', hint: 'Stores power for the night.' },
  digester: { name: 'Digester', size: 2, cost: 180, category: 'power', get hint() { return `Burns ${anyOf('organic')} for a steady ${POWER.digester} W.`; } },
  pylon: { name: 'Pylon', size: 1, cost: 10, category: 'power', onWater: true, key: 'P', get hint() { return `Powers buildings within ${POWER.pylon.reach} tiles; links to pylons within ${POWER.pylon.link}.`; } },
  sapling: { name: 'Sapling', size: 1, cost: 5, category: 'ecology', hint: 'Grows into a tree.' },
  depot: { name: 'Freight depot', size: 3, cost: 0, category: null, hint: 'Deliver goods here.' },
};

// ---- Recipes ----

export type Ingredient = { item: ItemId; n: number } | { group: GroupId; n: number };

export interface Recipe {
  id: string;
  building: MachineId;
  inputs: Ingredient[];
  outputs: { item: ItemId; n: number }[];
  /** Seconds at full power. */
  time: number;
}

export const RECIPES: Recipe[] = [
  { id: 'flour', building: 'mill', inputs: [{ item: 'wheat', n: 2 }], outputs: [{ item: 'flour', n: 1 }, { item: 'bran', n: 1 }], time: 6 },
  { id: 'oil', building: 'press', inputs: [{ item: 'sunflower', n: 2 }], outputs: [{ item: 'oil', n: 1 }, { item: 'seedcake', n: 1 }], time: 8 },
  { id: 'yarn', building: 'spinner', inputs: [{ item: 'flax', n: 2 }], outputs: [{ item: 'yarn', n: 1 }], time: 6 },
  { id: 'linen', building: 'loom', inputs: [{ item: 'yarn', n: 3 }], outputs: [{ item: 'linen', n: 1 }], time: 10 },
  { id: 'bread', building: 'bakery', inputs: [{ item: 'flour', n: 1 }, { item: 'egg', n: 1 }], outputs: [{ item: 'bread', n: 1 }], time: 8 },
  { id: 'honeycake', building: 'bakery', inputs: [{ item: 'flour', n: 1 }, { item: 'egg', n: 1 }, { item: 'honey', n: 1 }], outputs: [{ item: 'honeycake', n: 1 }], time: 12 },
  { id: 'sauce', building: 'cannery', inputs: [{ item: 'tomato', n: 3 }, { item: 'oil', n: 1 }], outputs: [{ item: 'sauce', n: 1 }], time: 10 },
  { id: 'compost', building: 'composter', inputs: [{ group: 'organic', n: 2 }], outputs: [{ item: 'compost', n: 1 }], time: 20 },
  { id: 'eggs', building: 'coop', inputs: [{ group: 'feed', n: 2 }], outputs: [{ item: 'egg', n: 2 }, { item: 'manure', n: 1 }], time: 16 },
  { id: 'burn', building: 'digester', inputs: [{ group: 'organic', n: 1 }], outputs: [], time: 10 },
];

const MACHINE_IDS = new Set<BuildingId>(RECIPES.map((r) => r.building));
/** Whether buildings of this type work a recipe: the ones `RECIPES` has recipes for. */
export const isMachineId = (t: BuildingId): t is MachineId => MACHINE_IDS.has(t);
export const recipesFor = (b: BuildingId) => RECIPES.filter((r) => r.building === b);
/** The recipe with an id. Ids come from this file or from a validated save, so an unknown one is a bug and throws. */
export function recipeById(id: string): Recipe {
  const r = RECIPES.find((x) => x.id === id);
  if (!r) throw new Error(`No recipe with id ${id}`);
  return r;
}

const counted = (x: Ingredient) => {
  const one = 'item' in x ? lcItem(x.item) : GROUP_WORDS[x.group], many = 'item' in x ? ITEMS[x.item].many ?? one : one;
  return x.n > 1 ? `${x.n} ${many}` : one;
};
/** A recipe in a few words: "2 wheat → flour + bran". */
export const recipeWords = (id: string) => { const r = recipeById(id); return `${r.inputs.map(counted).join(' + ')} → ${r.outputs.map(counted).join(' + ')}`; };
const sentence = (s: string) => s[0].toUpperCase() + s.slice(1);

/** A machine holds this many batches' worth of each input, and of each output. */
export const INPUT_BATCHES = 3;
export const OUTPUT_BATCHES = 3;

// ---- Power ----

export const POWER = {
  solar: 30,
  turbine: 40,
  /** Fraction of a turbine's output lost per tree or tall building within `shelterReach` tiles, and the least it keeps. */
  shelter: 0.1, shelterFloor: 0.4, shelterReach: 2,
  digester: 30,
  battery: { capacity: 2400, rate: 40 },
  pylon: { reach: 3, link: 8 },
  sprinklerNearWater: 3, sprinklerFar: 8, waterNear: 8,
  sprinklerReach: 3,
};

export const HIVE = { reach: 4, maxFlowers: 3, honeySeconds: 45, store: 6 };
export const SAPLING_SECONDS = 60;

// ---- Logistics ----

export const SILO = {
  /** Goods of each kind it holds. */
  perGood: 30,
};
export const TRUCK = {
  cost: 60,
  /** Trucks a garage holds. */
  perGarage: 4,
  /** Goods it carries (any mix), and goods a second it moves at a stop. */
  cargo: 6, moveRate: 4,
  /** Tiles a second, and on an empty battery. */
  speed: 3, crawl: 0.5,
  /** Joules its battery holds, joules a tile driven, and the watts it charges at. */
  battery: 300, joulesPerTile: 1, chargeRate: 20,
  /** A stop's wait unless set, and the longest it can be, in seconds. */
  wait: 5, maxWait: 60,
  /** At a garage that gives it no charge for this long, it goes on anyway. */
  giveUp: 5,
  /** Stops a route can have. */
  maxStops: 8,
};
/** Trucks a building loads or unloads at once; the rest queue. */
export const bays = (b: BuildingId) => (b === 'depot' ? 2 : 1);

// ---- Clearing ----

export const CLEAR_COST = { tree: 5, rock: 15 };
/** Soil health gained per tree more than the map started with (lost per tree fewer), and the most it moves either way. */
export const TREE_HEALTH = { perTree: 0.25, cap: 10 };

// ---- Time ----

/** Seconds of play per in-game day. */
export const DAY_SECONDS = 240;
export const START_HOUR = 7;
export const TICK = 0.1;
