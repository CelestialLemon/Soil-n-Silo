// Saves: a homestead written as a small JSON text and read back. A save holds the valley's recipe (its seeds, season,
// character, landform and terms), not its land: loading grows the same natural valley again from the recipe, then puts
// back what the player made (buildings, fields, rills, tracks, hedges, trees), the soil they farmed (only the cells whose
// fertility moved off their soil's, each exactly), and the living homestead as it stood (the clock, Supplies, goods,
// carts, the brief, the weather, the power). The land, the water, the wet banks and the bridges are worked out again from
// those.
//
// One version only: a save from any other version is refused, never migrated (AGENTS.md). A broken or tampered save is
// an expected failure, so reading one returns a Result and never throws (nor runs away with the time or memory it takes):
// its text is bounded, every value is checked against the shape and the ranges the game keeps it in, ids and references
// must agree, and what the player made must stand where the game would have let it, on the valley the recipe grows.
import { CATALOG, isThingKind, type ThingKind } from './catalog.ts';
import { recomputeBridges } from './bridges.ts';
import type { Cart, CartState, Endpoint } from './carts.ts';
import { naturalFertility } from './crops.ts';
import { coreObb, padTarget, recomposeEarth, thingObb } from './earth.ts';
import { TREE_CLEAR } from './fields.ts';
import { channelPath, refreshWater } from './flow.ts';
import { catmullRom, type Obb, obbCorners, obbDistance, obbSamples, obbsOverlap, type Point2 } from './geom.ts';
import { type Inventory, isGood } from './goods.ts';
import { BUILD_HALF, CELL_M, cellIx, cellIz, cellX, cellZ, COVER, fullRect, type Grid, GRID_N, GRID_X0, GRID_Z0, isWet } from './grid.ts';
import { PATH_SPACING, trackPath, TREE_SPACING } from './paths.ts';
import { inRace } from './place.ts';
import { powerFor } from './power/graph.ts';
import type { PowerNetwork, PowerSummary } from './power/sim.ts';
import { err, ok, type Result } from './result.ts';
import {
  CROPS, type Difficulty, type Field, type GameState, isDifficulty, isTerrainStyle, type Season, SEASONS, type SimState, STATE_VERSION,
  type Thing, type Tree, TREE_SPECIES,
} from './state.ts';
import { CART_COST, type DropId, MAX_CARTS, type SuppliesState } from './supplies.ts';
import { generateValley } from './valley/generate.ts';
import { type ClimateCharacter, FLOOD_MAX, isClimate, isWeatherSpell, type WeatherSpell, type WeatherState } from './weather.ts';
import { MAX_CHANNELS, MAX_PATH_LENGTH, MAX_PATH_POINTS, MAX_SAVED_ITEMS, strokesFault } from './limits.ts';
import { refreshWet } from './wet.ts';
import type { BriefState } from './brief.ts';
import { BYPRODUCTS, type ByproductTarget, type ThingRuntime } from './workshops.ts';

/** The longest save text read, in UTF-8 bytes (as a file's size counts them; a homestead well under way saves in about 15 KB). */
export const MAX_SAVE_BYTES = 4 * 1024 * 1024;
/** The most waypoints a cart's path holds (its way across the valley, on the carts' nav grid). */
const MAX_CART_PATH = 20000;
/** The highest next id (of a building, rill, track, hedge, tree or cart) a save may hold: far below where whole numbers stop
 * being exact, so the ids taken after it stay exact. */
export const MAX_SAVED_ID = 1_000_000_000;
/** The latest day a save may stand on (a century of seasons: the weather's timeline is read out to it). */
export const MAX_SAVE_DAY = 36500;
/** The largest a planted tree's scale may be. */
const MAX_TREE_SCALE = 5;

export const OLD_SAVE = 'This save is from an older or incompatible version and cannot be loaded.';
const NOT_A_SAVE = "This file isn't a Soil & Silo save.";
const damaged = (what: string) => `This save is damaged and cannot be loaded (${what}).`;

/** A field as saved: how its crop is doing, and its cells as runs [start, length, start, length, ...] of cell indices. */
interface SavedField extends Pick<Field, 'id' | 'crop' | 'growth' | 'fertility' | 'harvestReady' | 'pollinated' | 'frosted' | 'flooded' | 'avgMoisture'> {
  cells: number[];
}
interface SavedPath { id: number; points: Point2[] }

interface SaveFile {
  version: typeof STATE_VERSION;
  valley: {
    seed: number; weatherSeed: number; season: Season; climate: GameState['climate']; terrain: GameState['terrain']; sandbox: boolean;
    campaignId?: string; valleyTitle?: string; custom?: boolean; difficulty?: Difficulty; climateOverride?: ClimateCharacter;
    orderTargets: Inventory; suppliesCap: number; starterSupplies: number;
  };
  revision: number; nextId: number;
  things: Thing[];
  fields: SavedField[];
  channels: SavedPath[]; tracks: SavedPath[]; hedges: SavedPath[];
  plantedTrees: Tree[];
  /** [cell index, fertility] for each cell farmed off its soil's own: the soil's Float32 value exactly. */
  fertility: [number, number][];
  sim: {
    day: number; hour: number; supplies: SuppliesState; things: [number, ThingRuntime][]; carts: Cart[]; nextCartId: number;
    delivered: Inventory; brief: BriefState; weather: WeatherState; weatherOverride: WeatherSpell | null; soilHours: number;
    floodApplied: number; floodKey: number; networks: PowerNetwork[]; powerSummary: PowerSummary;
  };
}

// --- Writing ---------------------------------------------------------------------------------------------------------------

/** A field's cells as runs of consecutive indices. */
function runsOf(fieldOf: Uint16Array, id: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < fieldOf.length; i++) {
    if (fieldOf[i] !== id) continue;
    if (out.length > 0 && out[out.length - 2] + out[out.length - 1] === i) out[out.length - 1]++;
    else out.push(i, 1);
  }
  return out;
}

const points = (ps: readonly Point2[]): Point2[] => ps.map((p) => ({ x: p.x, z: p.z }));

/** Writes a homestead as a save's text. */
export function serializeSave(s: GameState): string {
  const g = s.grid, sup = s.sim.supplies;
  const fertility: [number, number][] = [];
  // The grid holds fertility as Float32: a cell is farmed when it holds anything but its soil's own, and is saved as it is.
  for (let i = 0; i < g.fertility.length; i++) if (g.fertility[i] !== Math.fround(naturalFertility(g, i))) fertility.push([i, g.fertility[i]]);
  const file: SaveFile = {
    version: STATE_VERSION,
    valley: {
      seed: s.seed, weatherSeed: s.weatherSeed, season: s.season, climate: s.climate, terrain: s.terrain, sandbox: s.sandbox,
      ...(s.campaignId === undefined ? {} : { campaignId: s.campaignId }),
      ...(s.valleyTitle === undefined ? {} : { valleyTitle: s.valleyTitle }),
      ...(s.custom ? { custom: true } : {}),
      ...(s.difficulty === undefined ? {} : { difficulty: s.difficulty }),
      ...(s.climateOverride === undefined ? {} : { climateOverride: s.climateOverride }),
      orderTargets: s.sim.brief.order.targets, suppliesCap: sup.cap,
      starterSupplies: sup.cap - sup.drops.reduce((n, d) => n + d.amount, 0),
    },
    revision: s.revision, nextId: s.nextId,
    things: s.things,
    fields: s.fields.map((f) => ({
      id: f.id, crop: f.crop, growth: f.growth, fertility: f.fertility, harvestReady: f.harvestReady, pollinated: f.pollinated,
      frosted: f.frosted, flooded: f.flooded, avgMoisture: f.avgMoisture, cells: runsOf(g.fieldOf, f.id),
    })),
    channels: s.channels.map((c) => ({ id: c.id, points: points(c.points) })),
    tracks: s.tracks.map((t) => ({ id: t.id, points: points(t.points) })),
    hedges: s.hedges.map((h) => ({ id: h.id, points: points(h.points) })),
    plantedTrees: s.plantedTrees,
    fertility,
    sim: {
      day: s.sim.day, hour: s.sim.hour, supplies: sup, things: [...s.sim.things.entries()], carts: s.sim.carts,
      nextCartId: s.sim.nextCartId, delivered: s.sim.delivered, brief: s.sim.brief, weather: s.sim.weather,
      weatherOverride: s.sim.weatherOverride, soilHours: s.sim.soilHours, floodApplied: s.sim.floodApplied, floodKey: s.sim.floodKey,
      networks: s.sim.networks, powerSummary: s.sim.powerSummary,
    },
  };
  return JSON.stringify(file);
}

// --- Checking ----------------------------------------------------------------------------------------------------------------
// A small shape checker: each Shape says what a value must be; `check` returns what's wrong with it, or undefined.

type Shape =
  | 'num' | 'int' | 'str' | 'bool' | 'point' | 'inventory'
  | { range: readonly [number, number] }
  | { enum: (v: unknown) => boolean }
  | { arr: Shape; max?: number }
  | { tuple: readonly Shape[] }
  | { obj: Readonly<Record<string, Shape>>; optional?: readonly string[] }
  | { nullable: Shape };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const oneOf = (list: readonly string[]) => ({ enum: (v: unknown) => typeof v === 'string' && list.includes(v) });
/** A value from a save, safe to name in a message: a short word as it is, anything else only by its type. */
const shown = (v: unknown) => (typeof v === 'string' && v.length <= 32 && /^[\w -]*$/.test(v) ? `"${v}"` : `of type ${v === null ? 'null' : typeof v}`);

function check(v: unknown, shape: Shape, at: string): string | undefined {
  if (shape === 'num') return typeof v === 'number' && Number.isFinite(v) ? undefined : `${at} isn't a number`;
  if (shape === 'int') return Number.isSafeInteger(v) ? undefined : `${at} isn't a whole number`;
  if (shape === 'str') return typeof v === 'string' ? undefined : `${at} isn't text`;
  if (shape === 'bool') return typeof v === 'boolean' ? undefined : `${at} isn't true or false`;
  if (shape === 'point') return check(v, { obj: { x: 'num', z: 'num' } }, at);
  if (shape === 'inventory') {
    if (!isRecord(v)) return `${at} isn't a list of goods`;
    for (const [k, n] of Object.entries(v)) {
      if (!isGood(k)) return `${at} has an unknown good ${shown(k)}`;
      if (!(typeof n === 'number' && Number.isFinite(n) && n >= 0)) return `${at}.${k} isn't a count`;
    }
    return undefined;
  }
  if ('range' in shape) {
    const [lo, hi] = shape.range;
    return typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? undefined : `${at} isn't a number from ${lo} to ${hi}`;
  }
  if ('enum' in shape) return shape.enum(v) ? undefined : `${at} has an unknown value ${shown(v)}`;
  if ('nullable' in shape) return v === null ? undefined : check(v, shape.nullable, at);
  if ('arr' in shape) {
    if (!Array.isArray(v)) return `${at} isn't a list`;
    if (shape.max !== undefined && v.length > shape.max) return `${at} holds more than ${shape.max}`;
    for (let i = 0; i < v.length; i++) { const e = check(v[i], shape.arr, `${at}[${i}]`); if (e) return e; }
    return undefined;
  }
  if ('tuple' in shape) {
    if (!Array.isArray(v) || v.length !== shape.tuple.length) return `${at} isn't a pair`;
    for (let i = 0; i < v.length; i++) { const e = check(v[i], shape.tuple[i], `${at}[${i}]`); if (e) return e; }
    return undefined;
  }
  if (!isRecord(v)) return `${at} is missing`;
  for (const [k, sub] of Object.entries(shape.obj)) {
    if (!(k in v) || v[k] === undefined) { if (shape.optional?.includes(k)) continue; return `${at}.${k} is missing`; }
    const e = check(v[k], sub, `${at}.${k}`);
    if (e) return e;
  }
  return undefined;
}

const SEASON = oneOf(SEASONS), CROP = oneOf(CROPS), SPECIES = oneOf(TREE_SPECIES);
const GOOD: Shape = { enum: (v) => typeof v === 'string' && isGood(v) };
const KIND: Shape = { enum: (v) => typeof v === 'string' && isThingKind(v) };
const CLIMATE: Shape = { enum: (v) => typeof v === 'string' && isClimate(v) };
const SPELL: Shape = { enum: (v) => typeof v === 'string' && isWeatherSpell(v) };
const TARGETS = [...new Set(Object.values(BYPRODUCTS).flatMap((b) => b.targets))] as ByproductTarget[];
const CART_STATES: readonly CartState[] = ['idle', 'charging', 'toPickup', 'toDropoff', 'returning'];
const DROP_IDS: readonly DropId[] = ['firstHarvest', 'firstCraft'];
const RECIPE = oneOf(['bread', 'honey_cake']);
const UNIT: Shape = { range: [0, 1] }, WATTS: Shape = { range: [0, 1e9] };
const SEAL = { progress: 'num', done: 'bool' } as const;
const PATH: Shape = { obj: { id: 'int', points: { arr: 'point', max: MAX_PATH_POINTS } } };
const ENDPOINT: Shape = { obj: { kind: oneOf(['thing', 'field']), id: 'int' } };

const FILE: Shape = {
  obj: {
    version: 'int',
    valley: {
      obj: {
        seed: 'int', weatherSeed: 'int', season: SEASON, climate: CLIMATE, terrain: { enum: isTerrainStyle }, sandbox: 'bool',
        campaignId: 'str', valleyTitle: 'str', custom: 'bool', difficulty: { enum: isDifficulty }, climateOverride: CLIMATE,
        orderTargets: 'inventory', suppliesCap: { range: [0, 100000] }, starterSupplies: { range: [0, 100000] },
      },
      optional: ['campaignId', 'valleyTitle', 'custom', 'difficulty', 'climateOverride'],
    },
    revision: 'int', nextId: 'int',
    things: { arr: { obj: { id: 'int', kind: KIND, x: 'num', z: 'num', yaw: 'num', padTargetY: 'num' } }, max: MAX_SAVED_ITEMS },
    fields: {
      arr: {
        obj: {
          id: 'int', crop: CROP, growth: { range: [0, 2] }, fertility: { range: [0, 2] }, harvestReady: 'int', pollinated: 'num', frosted: 'bool',
          flooded: 'bool', avgMoisture: 'num', cells: { arr: 'int', max: 2 * GRID_N * GRID_N },
        },
      },
      max: GRID_N * GRID_N,
    },
    channels: { arr: PATH, max: MAX_CHANNELS }, tracks: { arr: PATH, max: MAX_SAVED_ITEMS }, hedges: { arr: PATH, max: MAX_SAVED_ITEMS },
    plantedTrees: {
      arr: { obj: { id: 'int', x: 'num', z: 'num', species: SPECIES, scale: 'num', seed: 'int', planted: 'bool' } }, max: MAX_SAVED_ITEMS,
    },
    fertility: { arr: { tuple: ['int', { range: [0, 2] }] }, max: GRID_N * GRID_N },
    sim: {
      obj: {
        day: 'int', hour: 'num',
        supplies: {
          obj: {
            available: 'int', spent: 'int', unlocked: 'int', cap: 'int', unlimited: 'bool',
            drops: { arr: { obj: { id: oneOf(DROP_IDS), amount: 'int', label: 'str', received: 'bool' } }, max: DROP_IDS.length },
          },
        },
        things: {
          arr: {
            tuple: ['int', {
              obj: {
                id: 'int', kind: KIND, inputs: 'inventory', outputs: 'inventory', progress: 'num', working: 'bool', water: 'num',
                recipe: RECIPE, batch: RECIPE, priority: oneOf(TARGETS), greenhouseCrop: CROP, powered: 'bool', powerNetId: 'int',
                charge: 'num', siloFill: 'num', watts: 'num', made: 'int', status: 'str',
              },
            }],
          },
          max: MAX_SAVED_ITEMS,
        },
        carts: {
          arr: {
            obj: {
              id: 'int', x: 'num', z: 'num', yaw: 'num', speed: { range: [0, 1000] }, battery: UNIT,
              cargo: { nullable: { obj: { good: GOOD, count: 'int' } } }, state: oneOf(CART_STATES), jobDesc: 'str',
              path: { arr: 'point', max: MAX_CART_PATH }, pathIdx: 'int', targetLabel: 'str',
              job: { nullable: { obj: { from: ENDPOINT, to: ENDPOINT, good: GOOD, count: 'int', priority: 'num' } } },
              wait: { range: [0, 1000] }, navKey: 'str',
            },
            optional: ['targetLabel'],
          },
          max: MAX_CARTS,
        },
        nextCartId: 'int', delivered: 'inventory',
        brief: {
          obj: {
            order: { obj: { ...SEAL, targets: 'inventory', delivered: 'inventory' } },
            livingLand: { obj: { ...SEAL, plantedM2: 'num', avgFertility: 'num', targetM2: 'num', targetFertility: 'num' } },
            steadyHomestead: {
              obj: {
                ...SEAL, hours: 'num', targetHours: 'num', running: 'bool', resetReason: 'str', dryHours: 'num', paused: 'bool',
                pauseReason: 'str',
              },
            },
            restored: 'bool',
          },
        },
        weather: {
          obj: {
            spell: SPELL, label: 'str', cloudCover: UNIT, rain: UNIT, snow: UNIT, storm: UNIT, heat: UNIT, haze: UNIT,
            windSpeed: { range: [0, 60] }, tempC: { range: [-50, 60] }, floodSurge: { range: [0, FLOOD_MAX] }, groundWet: UNIT,
            snowDepth: UNIT, frostCover: UNIT, lightning: 'bool', soak: UNIT,
          },
        },
        weatherOverride: { nullable: SPELL },
        soilHours: { range: [0, 100000] }, floodApplied: { range: [0, FLOOD_MAX] }, floodKey: 'int',
        networks: {
          arr: {
            obj: {
              id: 'int', emitters: { arr: 'int', max: MAX_SAVED_ITEMS }, loads: { arr: 'int', max: MAX_SAVED_ITEMS }, generationW: WATTS,
              demandW: WATTS, servedW: WATTS, batteryWh: WATTS, batteryCapWh: WATTS, blackout: 'bool', fed: 'bool',
            },
          },
          max: MAX_SAVED_ITEMS,
        },
        powerSummary: {
          obj: { totalGenW: WATTS, totalDemandW: WATTS, totalStoredWh: WATTS, totalCapWh: WATTS, anyBlackout: 'bool', lastBlackoutReason: 'str' },
        },
      },
    },
  },
};

/** The grid's world bounds: everything on the map lies within them. */
const MAP_LO_X = GRID_X0, MAP_HI_X = GRID_X0 + GRID_N * CELL_M, MAP_LO_Z = GRID_Z0, MAP_HI_Z = GRID_Z0 + GRID_N * CELL_M;
const onMap = (p: Point2) => p.x >= MAP_LO_X && p.x <= MAP_HI_X && p.z >= MAP_LO_Z && p.z <= MAP_HI_Z;
/** Whether a point lies within `half` of the valley's middle. */
const within = (p: Point2, half: number) => Math.abs(p.x) <= half && Math.abs(p.z) <= half;

/** The first id that appears twice in a list, if any. */
function duplicate(ids: Iterable<number>): number | undefined {
  const seen = new Set<number>();
  for (const id of ids) { if (seen.has(id)) return id; seen.add(id); }
  return undefined;
}

/** What's wrong with a rill's, track's or hedge's stroke: its id, how many points, where they lie and how far it runs. */
function pathFault(p: SavedPath, what: string): string | undefined {
  if (p.id <= 0) return `a ${what}'s id ${p.id}`;
  if (p.points.length < 1) return `a ${what} ${p.id} with no points`;
  let length = 0;
  for (let k = 0; k < p.points.length; k++) {
    const q = p.points[k];
    if (!onMap(q)) return `a ${what} ${p.id} off the map`;
    if (k > 0) length += Math.hypot(q.x - p.points[k - 1].x, q.z - p.points[k - 1].z);
  }
  return length > MAX_PATH_LENGTH ? `a ${what} ${p.id} too long` : undefined;
}

/** What the shape checker can't see: ids that must agree, cells that must lie on the grid, counts and places in range. */
function checkSense(f: SaveFile, cells: number): string | undefined {
  // The clock and the counters.
  if (f.sim.hour < 0 || f.sim.hour >= 24 || f.sim.day < 1 || f.sim.day > MAX_SAVE_DAY) return 'the clock';
  if (f.revision < 0 || f.sim.floodKey < 0) return 'the counters';
  if (f.valley.starterSupplies > f.valley.suppliesCap) return "the valley's Supplies";

  // Buildings: one each of a kind that has one, a single Depot, ids of their own, inside the valley.
  if (f.things.filter((t) => t.kind === 'depot').length !== 1) return 'the valley has no Depot';
  const kinds = new Map<ThingKind, number>();
  for (const t of f.things) {
    if (t.id <= 0) return `a building's id ${t.id}`;
    kinds.set(t.kind, (kinds.get(t.kind) ?? 0) + 1);
    if (CATALOG[t.kind].oneOfEach && (kinds.get(t.kind) ?? 0) > 1) return `two of the ${CATALOG[t.kind].label}`;
    if (!within(t, BUILD_HALF) || obbCorners(thingObb(t)).some((p) => !within(p, BUILD_HALF + 1e-6))) return `the ${CATALOG[t.kind].label} ${t.id} off the valley`;
    if (Math.abs(t.padTargetY) > 1000) return `the ${CATALOG[t.kind].label} ${t.id}'s pad`;
  }
  const dupThing = duplicate(f.things.map((t) => t.id));
  if (dupThing !== undefined) return `two buildings share id ${dupThing}`;

  // Each building's runtime: exactly one each, of its own kind.
  const things = new Map(f.things.map((t) => [t.id, t]));
  const dupRuntime = duplicate(f.sim.things.map(([id]) => id));
  if (dupRuntime !== undefined) return `two runtimes for building ${dupRuntime}`;
  for (const [id, r] of f.sim.things) {
    const t = things.get(id);
    if (!t || r.id !== id || r.kind !== t.kind) return `a building's runtime ${id} doesn't match a building`;
    if (r.powerNetId < -1 || r.made < 0) return `building ${id}'s runtime`;
  }
  if (f.sim.things.length !== f.things.length) return 'a building without its runtime';

  // Fields: ids of their own (the fields' own numbering), cells on the grid, no cell in two.
  const taken = new Uint8Array(cells);
  const dupField = duplicate(f.fields.map((fd) => fd.id));
  if (dupField !== undefined) return `field id ${dupField}`;
  for (const fd of f.fields) {
    if (fd.id <= 0 || fd.id > 0xffff) return `field id ${fd.id}`;
    if (fd.harvestReady < 0) return `field ${fd.id}'s harvest`;
    if (fd.cells.length === 0 || fd.cells.length % 2 !== 0) return `field ${fd.id}'s cells`;
    for (let k = 0; k < fd.cells.length; k += 2) {
      const a = fd.cells[k], n = fd.cells[k + 1];
      if (a < 0 || n <= 0 || a + n > cells) return `field ${fd.id}'s cells`;
      for (let i = a; i < a + n; i++) { if (taken[i]) return `two fields on cell ${i}`; taken[i] = 1; }
    }
  }
  const dupSoil = duplicate(f.fertility.map(([i]) => i));
  if (dupSoil !== undefined) return `fertility at cell ${dupSoil} twice`;
  for (const [i] of f.fertility) if (i < 0 || i >= cells) return `fertility at cell ${i}`;

  // Rills, tracks and hedges: strokes of bounded size on the map (growing their curves stays cheap).
  for (const [list, what] of [[f.channels, 'rill'], [f.tracks, 'track'], [f.hedges, 'hedge']] as const) {
    for (const p of list) { const bad = pathFault(p, what); if (bad) return bad; }
  }
  const strokes = strokesFault(f);
  if (strokes) return strokes;
  for (const t of f.plantedTrees) {
    if (t.id <= 0 || !t.planted || !within(t, BUILD_HALF) || !(t.scale > 0 && t.scale <= MAX_TREE_SCALE)) return `planted tree ${t.id}`;
  }

  // One numbering for everything the player made (and the valley's rocks and trees, checked once it has grown).
  const made = [...f.things, ...f.channels, ...f.tracks, ...f.hedges, ...f.plantedTrees].map((v) => v.id);
  const dupMade = duplicate(made);
  if (dupMade !== undefined) return `two things share id ${dupMade}`;
  if (f.nextId <= 0 || f.nextId > MAX_SAVED_ID || made.some((id) => id >= f.nextId)) return 'the next id';

  // Carts: their own numbering, a Garage to belong to, on the map, paths and cursors that agree, jobs that make sense.
  const carts = f.sim.carts, garage = kinds.has('garage');
  const dupCart = duplicate(carts.map((c) => c.id));
  if (dupCart !== undefined) return `two carts share id ${dupCart}`;
  if (f.sim.nextCartId < 1 || f.sim.nextCartId > MAX_SAVED_ID || carts.some((c) => c.id <= 0 || c.id >= f.sim.nextCartId)) return "the carts' ids";
  if (garage !== (carts.length > 0)) return garage ? 'a Garage without its cart' : 'carts without a Garage';
  for (const c of carts) {
    if (!onMap(c) || !c.path.every(onMap)) return `cart ${c.id} off the map`;
    // Parked or charging: no job and no way to go. Out on a job: the job and the way to it. Heading home: no job, and a way
    // there (or none yet, when the way was cut and it waits to try again).
    const parked = c.state === 'idle' || c.state === 'charging', onJob = c.state === 'toPickup' || c.state === 'toDropoff';
    if ((parked || c.state === 'returning') && c.job !== null) return `cart ${c.id}'s job`;
    if (onJob && c.job === null) return `cart ${c.id}'s job`;
    if ((parked || onJob) && (c.path.length === 0) !== parked) return `cart ${c.id}'s path`;
    if (c.path.length === 0 ? c.pathIdx !== 0 : c.pathIdx < 0 || c.pathIdx > c.path.length) return `cart ${c.id}'s path`;
    if (c.cargo && c.cargo.count < 1) return `cart ${c.id}'s cargo`;
    if (c.job) {
      if (c.job.count < 1) return `cart ${c.id}'s job`;
      // A cart routing cargo it already holds has no pickup: its job comes from building -1.
      const end = (e: Endpoint, from: boolean) => (e.kind === 'field' ? e.id > 0 && e.id <= 0xffff : e.id > 0 ? e.id < f.nextId : from && e.id === -1);
      if (!end(c.job.from, true) || !end(c.job.to, false)) return `cart ${c.id}'s job`;
    }
  }

  // The power networks: their own ids, each building once in a list, batteries within their capacity.
  const dupNet = duplicate(f.sim.networks.map((n) => n.id));
  if (dupNet !== undefined) return `two power networks share id ${dupNet}`;
  // A network is named for one of its emitters, and each building stands in one network at most (as stepPower builds them).
  const dupMember = duplicate(f.sim.networks.flatMap((n) => [...n.emitters, ...n.loads]));
  if (dupMember !== undefined) return `building ${dupMember} in two power networks`;
  for (const n of f.sim.networks) {
    if (n.id <= 0 || !n.emitters.includes(n.id)) return `power network ${n.id}`;
    if ([...n.emitters, ...n.loads].some((id) => id <= 0 || id >= f.nextId)) return `power network ${n.id}`;
    if (n.batteryWh > n.batteryCapWh + 1e-6) return `power network ${n.id}'s battery`;
  }

  // The Supplies: never below nothing, what's free is what's unlocked less what's spent, and what's spent is what stands.
  const sup = f.sim.supplies;
  if (sup.available < 0 || sup.spent < 0 || sup.unlocked < 0 || sup.cap < 0 || sup.unlocked > sup.cap) return 'the Supplies';
  if (sup.unlimited !== f.valley.sandbox) return 'the Supplies';
  if (sup.unlimited ? sup.available !== sup.unlocked : sup.available !== sup.unlocked - sup.spent) return 'the Supplies';
  if (sup.cap !== f.valley.suppliesCap) return 'the Supplies';
  if (duplicate(sup.drops.map((d) => DROP_IDS.indexOf(d.id))) !== undefined || sup.drops.some((d) => d.amount < 0)) return "the Supplies' drops";
  const inUse = f.things.reduce((n, t) => n + CATALOG[t.kind].cost, 0) + Math.max(0, carts.length - 1) * CART_COST;
  if (sup.spent !== inUse) return "the Supplies in use";
  return undefined;
}

/** Whether every point within a hair of `p` lies on a cell `bad` refuses (so a point on a cell's edge is given the doubt). */
function solidly(g: Grid, p: Point2, bad: (i: number) => boolean): boolean {
  for (const [dx, dz] of [[-1e-3, -1e-3], [1e-3, -1e-3], [-1e-3, 1e-3], [1e-3, 1e-3]]) {
    if (!bad(cellIz(g, p.z + dz) * g.nx + cellIx(g, p.x + dx))) return false;
  }
  return true;
}

/**
 * What the save's homestead must agree with on the valley its recipe grew (`s`, as generated): its Depot where the valley
 * set it, ids that don't collide with the valley's rocks and trees, buildings standing where they could have been built,
 * pads at the height their ground gives them, and the Supplies the valley's terms give.
 */
function checkValley(f: SaveFile, s: GameState): string | undefined {
  const g = s.grid;
  // The Depot, as the valley set it.
  const depot = s.things.find((t) => t.kind === 'depot'), saved = f.things.find((t) => t.kind === 'depot');
  if (!depot || !saved || saved.id !== depot.id || Math.abs(saved.x - depot.x) > 1e-9 || Math.abs(saved.z - depot.z) > 1e-9
    || Math.abs(saved.yaw - depot.yaw) > 1e-9) return "the Depot isn't where the valley set it";

  // The valley's rocks and trees share the numbering with what the player made.
  const natural = new Set([...s.crags, ...s.wildTrees].map((v) => v.id));
  for (const v of [...f.things, ...f.channels, ...f.tracks, ...f.hedges, ...f.plantedTrees]) {
    if (natural.has(v.id)) return `id ${v.id} is one of the valley's own`;
  }
  if (f.nextId < s.nextId) return 'the next id';
  // References to buildings (a cart's job, a power network's members) name a building, or one taken down since the last
  // step (an edit while paused: the carts and the power find their feet on the next step), never anything else.
  const notBuildings = new Set([...natural, ...f.channels.map((c) => c.id), ...f.tracks.map((t) => t.id), ...f.hedges.map((h) => h.id),
    ...f.plantedTrees.map((t) => t.id)]);
  for (const c of f.sim.carts) {
    if (c.job && [c.job.from, c.job.to].some((e) => e.kind === 'thing' && notBuildings.has(e.id))) return `cart ${c.id}'s job`;
  }
  for (const n of f.sim.networks) if ([...n.emitters, ...n.loads].some((id) => notBuildings.has(id))) return `power network ${n.id}`;

  // The buildings: on their pads' own ground height, dry, clear of rock, woods and the valley's trees, and of each other.
  const boxes: { t: Thing; box: Obb; r: number }[] = [];
  for (const t of f.things) {
    const label = `the ${CATALOG[t.kind].label} ${t.id}`;
    if (Math.abs(t.padTargetY - padTarget(g, t)) > 1e-6) return `${label}'s pad`;
    for (const p of obbSamples(coreObb(t), 0.75)) {
      if (solidly(g, p, (i) => isWet(g.baseWaterLevel[i]))) return `${label} in the water`;
      if (solidly(g, p, (i) => g.baseCover[i] === COVER.rock || g.baseCover[i] === COVER.woods)) return `${label} on rock or in the woods`;
    }
    const box = thingObb(t);
    for (const c of s.crags) if (obbDistance(box, c.x, c.z) < c.radius - 1e-6) return `${label} on rock`;
    for (const w of s.wildTrees) if (obbDistance(box, w.x, w.z) < w.scale - 1e-6) return `${label} on a tree`;
    boxes.push({ t, box, r: Math.hypot(box.hw, box.hd) });
  }
  // The planted trees, where plantTree lets one grow: not in the brook or pond, nor on rock, nor under a building, nor
  // crowding the valley's own trees (none of which ever move).
  for (const t of f.plantedTrees) {
    const label = `planted tree ${t.id}`, c = g.baseCover[cellIz(g, t.z) * g.nx + cellIx(g, t.x)];
    if (c === COVER.water) return `${label} in the water`;
    if (c === COVER.rock || s.crags.some((k) => Math.hypot(t.x - k.x, t.z - k.z) < k.radius - 1e-6)) return `${label} on rock`;
    if (s.wildTrees.some((w) => Math.hypot(t.x - w.x, t.z - w.z) < TREE_SPACING - 1e-6)) return `${label} on a tree`;
    for (const { t: b, box, r } of boxes) {
      if (Math.hypot(t.x - box.cx, t.z - box.cz) <= r && obbDistance(box, t.x, t.z) <= 0) return `${label} under the ${CATALOG[b.kind].label} ${b.id}`;
    }
  }
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
    const A = boxes[a], B = boxes[b];
    if (Math.hypot(A.box.cx - B.box.cx, A.box.cz - B.box.cz) > A.r + B.r) continue;
    if (obbsOverlap(A.box, B.box, -0.01)) return `the ${CATALOG[A.t.kind].label} ${A.t.id} overlaps the ${CATALOG[B.t.kind].label} ${B.t.id}`;
  }

  // The Supplies the valley's terms give: its drops, and what's unlocked from its starter parcel and the drops received.
  const sup = f.sim.supplies, terms = s.sim.supplies;
  if (sup.drops.length !== terms.drops.length || sup.drops.some((d, k) => d.id !== terms.drops[k].id || d.amount !== terms.drops[k].amount
    || d.label !== terms.drops[k].label)) return "the Supplies' drops";
  if (sup.unlimited !== terms.unlimited || sup.cap !== terms.cap) return 'the Supplies';
  const given = sup.unlimited ? terms.unlocked : terms.unlocked + sup.drops.reduce((n, d) => n + (d.received ? d.amount : 0), 0);
  if (sup.unlocked !== Math.min(terms.cap, given)) return 'the Supplies unlocked';
  return undefined;
}

/**
 * What the rebuilt land must be: fields only on field ground clear of the valley's rocks and trees and of the buildings
 * that can't stand over a crop, and no broken heights.
 */
function checkLand(s: GameState): string | undefined {
  const g = s.grid;
  // A field cell under a building that can't stand over one. A field is painted only on cells whose centre lies outside
  // such a building (fieldAllowed), and a building is placed only where none of its footprint's samples falls on a field
  // (canPlace, a wheel's race aside), so a cell can be farmed under one only if it fails one of the two: both is a forgery.
  // (recomposeEarth paints a field's cover under anything, so the cover can't tell.)
  for (const t of s.things) {
    const def = CATALOG[t.kind];
    if (def.allowOnField) continue;
    const box = thingObb(t);
    for (const p of obbSamples(box, 0.75)) {
      if (def.onBank && inRace(t, p)) continue;
      const ix = cellIx(g, p.x), iz = cellIz(g, p.z), i = iz * g.nx + ix;
      if (g.fieldOf[i] !== 0 && obbDistance(box, cellX(g, ix), cellZ(g, iz)) <= 0) return `field ${g.fieldOf[i]} under the ${def.label} ${t.id}`;
    }
  }
  for (let i = 0; i < g.fieldOf.length; i++) {
    if (g.fieldOf[i] === 0) continue;
    const ix = i % g.nx, iz = (i - ix) / g.nx;
    if (g.cover[i] !== COVER.field || !within({ x: cellX(g, ix), z: cellZ(g, iz) }, BUILD_HALF + 1)) return `field ${g.fieldOf[i]} on ground that can't be farmed`;
  }
  const near = (x: number, z: number, r: number) => {
    for (let iz = cellIz(g, z - r); iz <= cellIz(g, z + r); iz++) for (let ix = cellIx(g, x - r); ix <= cellIx(g, x + r); ix++) {
      const i = iz * g.nx + ix;
      if (g.fieldOf[i] !== 0 && Math.hypot(cellX(g, ix) - x, cellZ(g, iz) - z) < r - 1e-6) return true;
    }
    return false;
  };
  for (const c of s.crags) if (near(c.x, c.z, c.radius)) return 'a field on rock';
  for (const t of s.wildTrees) if (near(t.x, t.z, TREE_CLEAR * t.scale)) return 'a field under a tree';
  for (const layer of [g.height, g.landHeight]) for (let i = 0; i < layer.length; i++) if (!Number.isFinite(layer[i])) return 'the land';
  // Dry cells hold no water level at all (-Infinity); anything else is a height.
  for (let i = 0; i < g.waterLevel.length; i++) { const w = g.waterLevel[i]; if (Number.isNaN(w) || w === Infinity) return 'the water'; }
  return undefined;
}

// --- Reading -----------------------------------------------------------------------------------------------------------------

/** Reads a save's text back into a homestead, or says why it can't. Never throws. */
export function deserializeSave(raw: string): Result<GameState, string> {
  try {
    // A string's length is at most its UTF-8 size: the quick check first, then the bytes themselves (as the file's size).
    if (typeof raw !== 'string' || raw.length > MAX_SAVE_BYTES || new TextEncoder().encode(raw).byteLength > MAX_SAVE_BYTES) return err(NOT_A_SAVE);
    let data: unknown;
    try { data = JSON.parse(raw); } catch { return err(NOT_A_SAVE); }
    if (!isRecord(data) || !('version' in data)) return err(NOT_A_SAVE);
    if (data.version !== STATE_VERSION) return err(OLD_SAVE);
    const bad = check(data, FILE, 'save');
    if (bad) return err(damaged(bad));
    const f = data as unknown as SaveFile;
    const sense = checkSense(f, GRID_N * GRID_N);
    if (sense) return err(damaged(sense));
    return rebuild(f);
  } catch (e) {
    // The recipe grew no valley (a seed edited by hand), or something else in it the checks let by: a broken save, not a bug.
    return err(damaged(e instanceof Error && e.message.length <= 200 ? e.message : 'its valley would not grow'));
  }
}

function rebuild(f: SaveFile): Result<GameState, string> {
  const v = f.valley;
  const s = generateValley(v.seed >>> 0, v.season, {
    weatherSeed: v.weatherSeed, climate: v.climate, terrain: v.terrain, sandbox: v.sandbox, order: v.orderTargets,
    suppliesCap: v.suppliesCap, starterSupplies: v.starterSupplies,
    ...(v.campaignId === undefined ? {} : { campaignId: v.campaignId }), ...(v.valleyTitle === undefined ? {} : { valleyTitle: v.valleyTitle }),
    ...(v.custom ? { custom: true } : {}), ...(v.difficulty === undefined ? {} : { difficulty: v.difficulty }),
    ...(v.climateOverride === undefined ? {} : { climateOverride: v.climateOverride }),
  });
  if (s.climate !== v.climate) return err(damaged("the valley's character"));
  const g = s.grid;
  const wrong = checkValley(f, s);
  if (wrong) return err(damaged(wrong));

  // What the player made, in place of what the valley came with (its Depot and starter track are among it). Each pad holds
  // the height its natural ground gives it, as when it was placed.
  s.things = f.things.map((t) => ({ id: t.id, kind: t.kind, x: t.x, z: t.z, yaw: t.yaw, padTargetY: padTarget(g, t) }));
  s.channels = f.channels.map((c) => ({ id: c.id, points: c.points, path: channelPath(c.points), flow: [] }));
  s.tracks = f.tracks.map((t) => ({ id: t.id, points: t.points, path: trackPath(t.points) }));
  s.hedges = f.hedges.map((h) => ({ id: h.id, points: h.points, path: catmullRom(h.points, PATH_SPACING) }));
  s.plantedTrees = f.plantedTrees.map((t) => ({ ...t, planted: true }));
  s.nextId = f.nextId;
  g.fieldOf.fill(0);
  s.fields = f.fields.map((fd) => {
    let x0 = g.nx, z0 = g.nz, x1 = -1, z1 = -1, count = 0;
    for (let k = 0; k < fd.cells.length; k += 2) for (let i = fd.cells[k]; i < fd.cells[k] + fd.cells[k + 1]; i++) {
      g.fieldOf[i] = fd.id;
      const ix = i % g.nx, iz = (i - ix) / g.nx;
      x0 = Math.min(x0, ix); x1 = Math.max(x1, ix); z0 = Math.min(z0, iz); z1 = Math.max(z1, iz);
      count++;
    }
    return {
      id: fd.id, crop: fd.crop, cellCount: count, areaM2: count * g.cell * g.cell, avgMoisture: fd.avgMoisture,
      bounds: { x0, z0, x1, z1 }, growth: fd.growth, fertility: fd.fertility, harvestReady: fd.harvestReady,
      pollinated: fd.pollinated, frosted: fd.frosted, flooded: fd.flooded,
    };
  }).sort((a, b) => a.id - b.id);
  for (const [i, fert] of f.fertility) g.fertility[i] = fert;

  // The living homestead as it stood.
  const sim: SimState = {
    day: f.sim.day, hour: f.sim.hour, supplies: f.sim.supplies, things: new Map(f.sim.things), carts: f.sim.carts,
    nextCartId: f.sim.nextCartId, delivered: f.sim.delivered, networks: f.sim.networks, powerSummary: f.sim.powerSummary,
    brief: f.sim.brief, soilHours: f.sim.soilHours, weather: f.sim.weather, weatherOverride: f.sim.weatherOverride,
    floodApplied: f.sim.floodApplied, floodKey: f.sim.floodKey,
  };
  s.sim = sim;

  // The land, the water (with the flood as it was drawn), the wet banks, the bridges and the power preview, from all that.
  // The power's networks and each building's watts are the ones saved (not read again now), so the first step after loading
  // runs exactly as the next step would have.
  recomposeEarth(s, fullRect(g));
  refreshWater(s);
  const land = checkLand(s);
  if (land) return err(damaged(land));
  refreshWet(s);
  recomputeBridges(s);
  s.power = powerFor(s);
  s.revision = f.revision;
  return ok(s);
}
