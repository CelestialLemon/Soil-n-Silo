// The game's content as data: goods, crops, buildings and recipes, with every number to tune in one place (DESIGN.md has the
// tables these come from).

// ---- Goods ----

export const ITEM_IDS = [
  'wheat', 'beans', 'tomato', 'sunflower', 'flax', 'egg', 'manure', 'honey', 'flour', 'bran', 'oil', 'seedcake', 'compost', 'yarn',
  'linen', 'bread', 'sauce', 'honeycake',
] as const;
export type ItemId = typeof ITEM_IDS[number];

export interface ItemDef { name: string; price: number; colour: number; hint: string }

export const ITEMS: Record<ItemId, ItemDef> = {
  wheat: { name: 'Wheat', price: 2, colour: 0xe2c25a, hint: 'Milled into flour.' },
  beans: { name: 'Beans', price: 2, colour: 0x6a9a3a, hint: 'Chicken feed. Bean fields restore the soil.' },
  tomato: { name: 'Tomato', price: 3, colour: 0xe0503a, hint: 'Cooked into sauce.' },
  sunflower: { name: 'Sunflower', price: 3, colour: 0xf2c63a, hint: 'Pressed into oil.' },
  flax: { name: 'Flax', price: 3, colour: 0x8aa8d8, hint: 'Spun into yarn.' },
  egg: { name: 'Egg', price: 6, colour: 0xf6efe0, hint: 'Baked into bread and cake.' },
  manure: { name: 'Manure', price: 1, colour: 0x6a442e, hint: 'Composted, or burnt in the digester.' },
  honey: { name: 'Honey', price: 10, colour: 0xf0a020, hint: 'Baked into honey cake.' },
  flour: { name: 'Flour', price: 7, colour: 0xf4ecd8, hint: 'Baked into bread and cake.' },
  bran: { name: 'Bran', price: 1, colour: 0xb88a4a, hint: 'A milling byproduct: chicken feed, compost or fuel.' },
  oil: { name: 'Oil', price: 12, colour: 0xe8c040, hint: 'Cooked into sauce.' },
  seedcake: { name: 'Seed cake', price: 2, colour: 0x9a7a4a, hint: 'A pressing byproduct: chicken feed, compost or fuel.' },
  compost: { name: 'Compost', price: 4, colour: 0x4a3626, hint: 'Feeds the soil: fields take it from belts.' },
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
export const GROUP_NAMES: Record<GroupId, string> = { feed: 'feed (beans, bran or seed cake)', organic: 'organic matter (manure, bran or seed cake)' };

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

export const FIELD = {
  /** Harvested goods a field holds before it stops growing. */
  store: 6,
  compostStore: 4,
  /** A field uses compost while its average fertility is below this. */
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
  'belt', 'splitter', 'sorter', 'crossing', 'pad',
  'field', 'sprinkler', 'coop', 'hive', 'composter',
  'mill', 'press', 'spinner', 'loom', 'bakery', 'cannery',
  'solar', 'turbine', 'battery', 'digester', 'pylon',
  'sapling', 'depot',
] as const;
export type BuildingId = typeof BUILDING_IDS[number];

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
  /** Its direction matters (belts, sorters); others turn only for looks. */
  directional?: boolean;
  /** Tall: shelters a wind turbine next to it. */
  tall?: boolean;
  /** Can stand on water (a little bridge). */
  onWater?: boolean;
  hint: string;
  key?: string;
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  belt: { name: 'Belt', size: 1, cost: 2, category: 'logistics', directional: true, onWater: true, key: 'B', hint: 'Carries goods. Drag to lay a line; R turns it.' },
  splitter: { name: 'Splitter', size: 1, cost: 15, category: 'logistics', onWater: true, hint: 'Shares what comes in between the belts leading out of it.' },
  sorter: { name: 'Sorter', size: 1, cost: 20, category: 'logistics', directional: true, onWater: true, hint: 'The chosen good goes straight on; the rest go left or right.' },
  crossing: { name: 'Crossing', size: 1, cost: 10, category: 'logistics', onWater: true, hint: 'Two belts cross without mixing.' },
  pad: { name: 'Drone pad', size: 2, cost: 120, category: 'logistics', power: 15, hint: 'Sends goods by drone to a linked pad (or the depot), up to 40 tiles away. Power while flying.' },
  field: { name: 'Field', size: 3, cost: 30, category: 'farming', key: 'F', hint: 'Grows a crop on rich soil. Water it with sprinklers; feed it compost.' },
  sprinkler: { name: 'Sprinkler', size: 1, cost: 25, category: 'farming', power: 3, hint: 'Waters fields within 3 tiles. Cheaper to run near water.' },
  coop: { name: 'Coop', size: 3, cost: 150, category: 'farming', hint: 'Chickens: 2 feed → 2 eggs + manure.' },
  hive: { name: 'Beehive', size: 1, cost: 60, category: 'farming', hint: 'Honey from flowering fields nearby; pollinates them for a bigger harvest.' },
  composter: { name: 'Composter', size: 2, cost: 60, category: 'farming', hint: 'Turns manure, bran or seed cake into compost.' },
  mill: { name: 'Mill', size: 2, cost: 200, category: 'processing', power: 12, tall: true, hint: '2 wheat → flour + bran.' },
  press: { name: 'Oil press', size: 2, cost: 220, category: 'processing', power: 15, hint: '2 sunflowers → oil + seed cake.' },
  spinner: { name: 'Spinner', size: 2, cost: 200, category: 'processing', power: 10, hint: '2 flax → yarn.' },
  loom: { name: 'Loom', size: 2, cost: 300, category: 'processing', power: 20, hint: '3 yarn → linen.' },
  bakery: { name: 'Bakery', size: 2, cost: 350, category: 'processing', power: 25, tall: true, hint: 'Flour + egg → bread, or + honey → honey cake.' },
  cannery: { name: 'Cannery', size: 2, cost: 300, category: 'processing', power: 18, hint: '3 tomatoes + oil → tomato sauce.' },
  solar: { name: 'Solar panel', size: 2, cost: 70, category: 'power', key: 'S', hint: '30 W at noon; nothing at night.' },
  turbine: { name: 'Wind turbine', size: 1, cost: 120, category: 'power', tall: true, hint: '40 W in full wind. Trees and tall buildings close by shelter it.' },
  battery: { name: 'Battery', size: 2, cost: 150, category: 'power', hint: 'Stores power for the night.' },
  digester: { name: 'Digester', size: 2, cost: 180, category: 'power', hint: 'Burns manure, bran or seed cake for a steady 30 W.' },
  pylon: { name: 'Pylon', size: 1, cost: 10, category: 'power', onWater: true, key: 'P', hint: 'Powers buildings within 3 tiles; links to pylons within 8.' },
  sapling: { name: 'Sapling', size: 1, cost: 5, category: 'ecology', hint: 'Grows into a tree.' },
  depot: { name: 'Freight depot', size: 3, cost: 0, category: null, hint: 'Deliver goods here.' },
};

// ---- Recipes ----

export type Ingredient = { item: ItemId; n: number } | { group: GroupId; n: number };

export interface Recipe {
  id: string;
  building: BuildingId;
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

export const recipesFor = (b: BuildingId) => RECIPES.filter((r) => r.building === b);
export const recipeById = (id: string) => RECIPES.find((r) => r.id === id)!;

/** A machine holds this many batches' worth of each input, and of each output. */
export const INPUT_BATCHES = 3;
export const OUTPUT_BATCHES = 3;

// ---- Power ----

export const POWER = {
  solar: 30,
  turbine: 40,
  /** Fraction of a turbine's output lost per tree or tall building within 2 tiles, and the least it keeps. */
  shelter: 0.1, shelterFloor: 0.4,
  digester: 30,
  battery: { capacity: 2400, rate: 40 },
  pylon: { reach: 3, link: 8 },
  sprinklerNearWater: 3, sprinklerFar: 8, waterNear: 8,
  sprinklerReach: 3,
};

export const HIVE = { reach: 4, maxFlowers: 3, honeySeconds: 45, store: 6 };
export const SAPLING_SECONDS = 60;

// ---- Logistics ----

export const BELT = {
  /** Tiles per second. */
  speed: 1.2,
  /** Least distance between goods on a belt, in tiles. */
  spacing: 0.5,
};
export const ROUTER_SECONDS = 0.35;
export const PAD = { store: 10, receiveStore: 20, cargo: 5, speed: 5, range: 40, waitSeconds: 4 };

// ---- Clearing ----

export const CLEAR_COST = { tree: 5, rock: 15 };
/** Soil health gained per tree more than the map started with (lost per tree fewer), and the most it moves either way. */
export const TREE_HEALTH = { perTree: 0.25, cap: 10 };

// ---- Time ----

/** Seconds of play per in-game day. */
export const DAY_SECONDS = 240;
export const START_HOUR = 7;
export const TICK = 0.1;
