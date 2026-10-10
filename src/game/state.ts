import { BUILDINGS, PRODUCTS, recipesFor, SILO, type BuildingId, type CropId, type ItemId, type SellMode } from './data.ts';
import { DEPOT_SIZE, generateMap, TERRAIN, type MapData } from './map.ts';
import type { Scenario } from './scenarios.ts';

// The state of a commission in progress: plain data, so it saves as JSON. Lookups that only speed things up (which building
// is on a tile, the power networks) live in a cache beside it and are rebuilt when the layout changes.

/** Which way a building faces (for looks): north, east, south, west. */
export type Dir = 0 | 1 | 2 | 3;

/**
 * A silo's job for a drone: feed a building (cargo from the silo), collect from a building or fetch from another silo
 * (cargo back to the silo), or sell at the depot.
 */
export interface Task {
  kind: 'feed' | 'collect' | 'fetch' | 'sell';
  /** The building it flies to, and that building's centre (kept, so a drone whose target goes still knows the way home). */
  target: number; tx: number; ty: number;
  item: ItemId;
  /** Goods it set out to bring back (collect, fetch). */
  n: number;
}

/**
 * A silo's drone. At home it is idle or charging for its next flight; it flies out to its task's target, works there
 * (loading or unloading), charges there for the way back if the target is another silo, and flies back.
 */
export interface Drone {
  phase: 'idle' | 'charge' | 'out' | 'work' | 'recharge' | 'back';
  /** Flight progress 0–1 while flying; seconds into the work while working. */
  t: number;
  /** Joules in hand for the next leg. */
  energy: number;
  task: Task | null;
  cargo: ItemId[];
}

export type Status = 'ok' | 'idle' | 'input' | 'blocked' | 'power' | 'lowpower' | 'nolink' | 'nosilo' | 'flowers' | 'dry';

export interface Building {
  id: number;
  type: BuildingId;
  /** North-west tile. */
  x: number; y: number;
  rot: Dir;
  /** Why it isn't working, for the marker and the inspector (worked out each step). */
  status: Status;
  /** What it's waiting for or blocked by, for the status line. */
  need?: string;
  // Machines (and the coop, composter and digester).
  recipe?: string;
  inputs?: Partial<Record<ItemId, number>>;
  outputs?: Partial<Record<ItemId, number>>;
  /** Seconds into the batch it's working on; null when it isn't. */
  progress?: number | null;
  /** Goods it won't take from silos (any building that takes goods). */
  refuse?: ItemId[];
  // Fields and hives.
  crop?: CropId;
  /** The crop the stored harvest is (it may differ from `crop` just after the crop was changed). */
  harvest?: CropId;
  growth?: number;
  stored?: number;
  compost?: number;
  // Batteries.
  charge?: number;
  // Silos: goods held, drones, and how long sellable goods have waited for a full load. `shared` keeps a good sold by half
  // fair between buildings and the depot: goods fed less goods sold, per good.
  store?: Partial<Record<ItemId, number>>;
  shared?: Partial<Record<ItemId, number>>;
  drones?: Drone[];
  waited?: number;
  // The depot: the goods silos send it, and how.
  sell?: Partial<Record<ItemId, SellMode>>;
  // Saplings.
  age?: number;
}

export interface Stats {
  /** Start time of the newest bucket. */
  since: number;
  /** Goods made, in ten-second buckets, newest first (the one filling now and six full ones). */
  made: Partial<Record<ItemId, number>>[];
  /** When each good was delivered, over the last minute (exact, for rate goals). */
  delivered: Partial<Record<ItemId, number[]>>;
}

/** The current bucket plus six full ones, so a whole minute is always covered. */
export const STAT_BUCKET = 10, STAT_BUCKETS = 7;

export interface GameState {
  version: 2;
  scenario: Scenario;
  map: MapData;
  /** Each tile's fertility at the start: resting ground recovers up to it. */
  soilBase: number[];
  initialTrees: number;
  buildings: Building[];
  nextId: number;
  credits: number;
  /** Seconds of play. */
  time: number;
  /** Time left over from the last frame, less than a step. */
  carry: number;
  delivered: Partial<Record<ItemId, number>>;
  earned: number;
  stats: Stats;
  /** Rate goals once reached stay reached. */
  reached: boolean[];
  completedAt: number | null;
  /** Total made of each good over the commission. */
  made: Partial<Record<ItemId, number>>;
}

export function newGame(sc: Scenario): GameState {
  const map = generateMap(sc);
  const s: GameState = {
    version: 2, scenario: sc, map, soilBase: [...map.fertility], initialTrees: map.terrain.filter((t) => t === TERRAIN.tree).length,
    buildings: [], nextId: 1, credits: sc.credits, time: 0, carry: 0, delivered: {}, earned: 0,
    stats: { since: 0, made: [{}], delivered: {} }, reached: sc.goals.map(() => false), completedAt: null, made: {},
  };
  const depot = makeBuilding(s, 'depot', map.depot.x, map.depot.y, 0);
  // The depot sells the products, and half of whatever else the commission asks for.
  depot.sell = {};
  for (const i of PRODUCTS) depot.sell[i] = 'spare';
  for (const g of sc.goals) if (g.kind !== 'soil' && !PRODUCTS.includes(g.item)) depot.sell[g.item] = 'half';
  s.buildings.push(depot);
  return s;
}

/** A new building with the state its type needs (not yet in the game). */
export function makeBuilding(s: GameState, type: BuildingId, x: number, y: number, rot: Dir): Building {
  const b: Building = { id: s.nextId++, type, x, y, rot, status: 'idle' };
  switch (type) {
    case 'field': b.crop = 'wheat'; b.growth = 0; b.stored = 0; b.compost = 0; b.refuse = []; break;
    case 'hive': b.growth = 0; b.stored = 0; break;
    case 'battery': b.charge = 0; break;
    case 'silo':
      b.store = {}; b.shared = {}; b.waited = 0;
      b.drones = Array.from({ length: SILO.drones }, () => ({ phase: 'idle' as const, t: 0, energy: 0, task: null, cargo: [] }));
      break;
    case 'sapling': b.age = 0; break;
    default: {
      const rs = recipesFor(type);
      if (rs.length) { b.recipe = rs[0].id; b.inputs = {}; b.outputs = {}; b.progress = null; b.refuse = []; }
    }
  }
  return b;
}

export const sizeOf = (b: { type: BuildingId }) => BUILDINGS[b.type].size;
export const DEPOT = DEPOT_SIZE;

// ---- The cache: who stands where, by id ----

interface Cache { grid: Int32Array; byId: Map<number, Building>; layout: number }
const caches = new WeakMap<GameState, Cache>();
/** Bumped whenever buildings are added or removed, so derived caches (power networks, the view) know to rebuild. */
let layoutVersion = 1;

function cache(s: GameState): Cache {
  let c = caches.get(s);
  if (!c) {
    c = { grid: new Int32Array(s.map.width * s.map.height), byId: new Map(), layout: layoutVersion++ };
    for (const b of s.buildings) occupy(s, c, b, b.id);
    caches.set(s, c);
  }
  return c;
}

function occupy(s: GameState, c: Cache, b: Building, id: number) {
  const n = sizeOf(b);
  for (let y = b.y; y < b.y + n; y++) for (let x = b.x; x < b.x + n; x++) c.grid[y * s.map.width + x] = id;
  if (id) c.byId.set(b.id, b); else c.byId.delete(b.id);
}

/** The layout's version: changes whenever a building is added or removed. */
export const layoutOf = (s: GameState) => cache(s).layout;

export function addBuilding(s: GameState, b: Building) {
  const c = cache(s);
  s.buildings.push(b);
  occupy(s, c, b, b.id);
  c.layout = layoutVersion++;
}

/** Marks the layout changed without adding or removing anything (a tree cleared, a sapling grown). */
export function touchLayout(s: GameState) {
  cache(s).layout = layoutVersion++;
}

export function removeBuilding(s: GameState, b: Building) {
  const c = cache(s);
  const i = s.buildings.indexOf(b);
  if (i >= 0) s.buildings.splice(i, 1);
  occupy(s, c, b, 0);
  c.layout = layoutVersion++;
}

export const inMap = (s: GameState, x: number, y: number) => x >= 0 && y >= 0 && x < s.map.width && y < s.map.height;
export const tileIndex = (s: GameState, x: number, y: number) => y * s.map.width + x;

/** The building on a tile, if any. */
export function buildingAt(s: GameState, x: number, y: number): Building | null {
  if (!inMap(s, x, y)) return null;
  const id = cache(s).grid[y * s.map.width + x];
  return id ? cache(s).byId.get(id) ?? null : null;
}

export const buildingById = (s: GameState, id: number) => cache(s).byId.get(id) ?? null;

export const terrainAt = (s: GameState, x: number, y: number) => s.map.terrain[y * s.map.width + x];

/** The centre of a building's footprint, in tiles. */
export function centre(b: Building) {
  const n = sizeOf(b);
  return { x: b.x + n / 2, y: b.y + n / 2 };
}

/** The gap in tiles between two buildings' footprints (0 when they touch or overlap), as the larger of the axes. */
export function gapBetween(a: Building, b: Building) {
  const na = sizeOf(a), nb = sizeOf(b);
  const dx = Math.max(0, a.x - (b.x + nb - 1), b.x - (a.x + na - 1));
  const dy = Math.max(0, a.y - (b.y + nb - 1), b.y - (a.y + na - 1));
  return Math.max(dx, dy);
}

/** The distance in tiles from a tile to the nearest tile of a building (0 when on it), as the larger of the axes. */
export function reachTo(b: Building, x: number, y: number) {
  const n = sizeOf(b);
  const dx = x < b.x ? b.x - x : x >= b.x + n ? x - (b.x + n - 1) : 0;
  const dy = y < b.y ? b.y - y : y >= b.y + n ? y - (b.y + n - 1) : 0;
  return Math.max(dx, dy);
}

export const countTrees = (s: GameState) => { let n = 0; for (const t of s.map.terrain) if (t === TERRAIN.tree) n++; return n; };
