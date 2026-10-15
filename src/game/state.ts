import { BUILDINGS, isMachineId, recipesFor, type BuildingId, type CropId, type MachineId, type ItemId } from './data.ts';
import { generateMap, TERRAIN, type MapData } from './map.ts';
import { newRunLog, type RunLog } from './runlog.ts';
import type { Scenario } from './scenarios.ts';

// The state of a commission in progress: plain data, so it saves as JSON. Lookups that only speed things up (which building
// is on a tile, the power networks) live in a cache beside it and are rebuilt when the layout changes.

/** Which way a building faces (for looks): north, east, south, west. */
export type Dir = 0 | 1 | 2 | 3;

/** A stop on a route: a building, the goods to drop there and to pick up (never both for one good), and how long to wait. */
export interface Stop {
  building: number;
  drop: ItemId[];
  pick: ItemId[];
  /** Seconds a truck waits for room or goods after the last good moved. */
  wait: number;
  /** The next of its pick-up goods to take, so a mix comes out even, across every visit and truck. */
  turn: number;
}

/** A loop of stops that trucks drive, stop 1 to the last and round again. */
export interface Route {
  id: number;
  name: string;
  stops: Stop[];
  /** When each good was dropped by its trucks, over the last minute (for goods a minute). */
  moved: number[];
}

/**
 * A truck. It belongs to a garage and runs a route, or none. `parked` and `charge` are at its garage; `drive` follows `path`
 * to `target` (a stop's building, or its garage); `queue` waits beside a building for its turn, `dock` moves goods there;
 * `stuck` can reach none of its stops.
 */
export interface Truck {
  id: number;
  garage: number;
  route: number | null;
  /** The stop it is heading to or at. */
  stop: number;
  phase: 'parked' | 'charge' | 'drive' | 'queue' | 'dock' | 'stuck';
  /** Where it is, in tiles (a tile's centre is at +0.5), and which way it faces (radians, 0 towards +y). */
  x: number; y: number; heading: number;
  /** Tiles still to drive through, by index, the last one beside its target. */
  path: number[];
  target: number | null;
  energy: number;
  cargo: ItemId[];
  /** At a stop: seconds with nothing to move; at its garage: seconds without charge. */
  idle: number;
  /** Goods it may move now at a stop (moveRate a second, at most one in hand). */
  budget: number;
  /** When it came to the queue, so trucks dock in the order they came. */
  arrived: number;
  /** Leaving its garage after charging: it goes on without checking its battery again. */
  charged: boolean;
}

export type Status = 'ok' | 'idle' | 'input' | 'blocked' | 'power' | 'lowpower' | 'nolink' | 'noroad' | 'noroute' | 'flowers' | 'dry';

interface BuildingBase {
  id: number;
  /** North-west tile. */
  x: number; y: number;
  rot: Dir;
  /** Why it isn't working, for the marker and the inspector (worked out each step). */
  status: Status;
  /** What it's waiting for or blocked by, for the status line. */
  need?: string;
}

export interface FieldBuilding extends BuildingBase {
  type: 'field';
  crop: CropId;
  /** The crop the stored harvest is (it may differ from `crop` just after the crop was changed). */
  harvest?: CropId;
  growth: number;
  stored: number;
}

export interface HiveBuilding extends BuildingBase {
  type: 'hive';
  growth: number;
  stored: number;
}

/** A building that works a recipe: the machines, and the coop, composter and digester. */
export interface MachineBuilding extends BuildingBase {
  type: MachineId;
  recipe: string;
  inputs: Partial<Record<ItemId, number>>;
  outputs: Partial<Record<ItemId, number>>;
  /** Seconds into the batch it's working on; null when it isn't. */
  progress: number | null;
}

export interface BatteryBuilding extends BuildingBase {
  type: 'battery';
  charge: number;
}

/** Holds goods. */
export interface SiloBuilding extends BuildingBase {
  type: 'silo';
  store: Partial<Record<ItemId, number>>;
}

export interface SaplingBuilding extends BuildingBase {
  type: 'sapling';
  age: number;
}

/** A building with no state of its own. */
export interface PlainBuilding extends BuildingBase {
  type: Exclude<BuildingId, MachineId | 'field' | 'hive' | 'battery' | 'silo' | 'sapling'>;
}

export type Building = FieldBuilding | HiveBuilding | MachineBuilding | BatteryBuilding | SiloBuilding | SaplingBuilding | PlainBuilding;

/** The shape of the building of a type (or of a union of types). */
export type BuildingOf<K extends BuildingId> =
  K extends MachineId ? MachineBuilding : K extends PlainBuilding['type'] ? PlainBuilding : Extract<Building, { type: K }>;

/** Whether a building works a recipe (the data says which types do). */
export const isMachine = (b: Building): b is MachineBuilding => isMachineId(b.type);

/** Where a building stands, or would: its type (for its size) and north-west tile. */
export type Footprint = Pick<Building, 'type' | 'x' | 'y'>;

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
  version: 4;
  scenario: Scenario;
  map: MapData;
  /** Each tile's fertility at the start: resting ground recovers up to it. */
  soilBase: number[];
  initialTrees: number;
  buildings: Building[];
  routes: Route[];
  trucks: Truck[];
  /** The next id for a building, route or truck (they share one count, so an id names one thing). */
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
  /** The run so far, for the results (runlog.ts). */
  run: RunLog;
}

export function newGame(sc: Scenario): GameState {
  const map = generateMap(sc);
  const s: GameState = {
    version: 4, scenario: sc, map, soilBase: [...map.fertility], initialTrees: map.terrain.filter((t) => t === TERRAIN.tree).length,
    buildings: [], routes: [], trucks: [], nextId: 1, credits: sc.credits, time: 0, carry: 0, delivered: {}, earned: 0,
    stats: { since: 0, made: [{}], delivered: {} }, reached: sc.goals.map(() => false), completedAt: null, made: {}, run: newRunLog(),
  };
  s.buildings.push(makeBuilding(s, 'depot', map.depot.x, map.depot.y, 0));
  return s;
}

/** A new building with the state its type needs (not yet in the game). */
export const makeBuilding = (s: GameState, type: BuildingId, x: number, y: number, rot: Dir): Building => blankBuilding(s.nextId++, type, x, y, rot);

/** A building with an id of the caller's choosing and the state its type needs. */
export function blankBuilding(id: number, type: BuildingId, x: number, y: number, rot: Dir): Building {
  const base = { id, x, y, rot, status: 'idle' as Status };
  switch (type) {
    case 'field': return { ...base, type, crop: 'wheat', growth: 0, stored: 0 };
    case 'hive': return { ...base, type, growth: 0, stored: 0 };
    case 'battery': return { ...base, type, charge: 0 };
    case 'silo': return { ...base, type, store: {} };
    case 'sapling': return { ...base, type, age: 0 };
  }
  if (isMachineId(type)) return { ...base, type, recipe: recipesFor(type)[0].id, inputs: {}, outputs: {}, progress: null };
  return { ...base, type };
}

export const sizeOf = (b: { type: BuildingId }) => BUILDINGS[b.type].size;

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
export const routeById = (s: GameState, id: number | null) => (id === null ? null : s.routes.find((r) => r.id === id) ?? null);
export const truckById = (s: GameState, id: number | null) => (id === null ? null : s.trucks.find((t) => t.id === id) ?? null);

export const terrainAt = (s: GameState, x: number, y: number) => s.map.terrain[y * s.map.width + x];

/** The centre of a building's footprint, in tiles. */
export function centre(b: Footprint) {
  const n = sizeOf(b);
  return { x: b.x + n / 2, y: b.y + n / 2 };
}

/** The distance in tiles from a tile to the nearest tile of a building (0 when on it), as the larger of the axes. */
export function reachTo(b: Footprint, x: number, y: number) {
  const n = sizeOf(b);
  const dx = x < b.x ? b.x - x : x >= b.x + n ? x - (b.x + n - 1) : 0;
  const dy = y < b.y ? b.y - y : y >= b.y + n ? y - (b.y + n - 1) : 0;
  return Math.max(dx, dy);
}

export const countTrees = (s: GameState) => { let n = 0; for (const t of s.map.terrain) if (t === TERRAIN.tree) n++; return n; };
