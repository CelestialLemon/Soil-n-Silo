// Saves: a homestead written as a small JSON text and read back. A save holds the valley's recipe (its seeds, season,
// character, landform and terms), not its land: loading grows the same natural valley again from the recipe, then puts
// back what the player made (buildings, fields, rills, tracks, hedges, trees), the soil they farmed (only the cells whose
// fertility moved off their soil's), and the living homestead as it stood (the clock, Supplies, goods, carts, the brief,
// the weather, the power). The land, the water, the wet banks and the bridges are worked out again from those.
//
// One version only: a save from any other version is refused, never migrated (AGENTS.md). A broken or tampered save is
// an expected failure, so reading one returns a Result and never throws.
import { CATALOG, isThingKind } from './catalog.ts';
import { recomputeBridges } from './bridges.ts';
import type { Cart, CartState } from './carts.ts';
import { naturalFertility } from './crops.ts';
import { recomposeEarth } from './earth.ts';
import { channelPath, refreshWater } from './flow.ts';
import { catmullRom, type Point2 } from './geom.ts';
import { type Inventory, isGood } from './goods.ts';
import { fullRect, GRID_N } from './grid.ts';
import { PATH_SPACING, trackPath } from './paths.ts';
import { powerFor } from './power/graph.ts';
import type { PowerNetwork, PowerSummary } from './power/sim.ts';
import { err, ok, type Result } from './result.ts';
import {
  CROPS, type Field, type GameState, isTerrainStyle, type Season, SEASONS, type SimState, STATE_VERSION, type Thing,
  type Tree, TREE_SPECIES,
} from './state.ts';
import type { DropId, SuppliesState } from './supplies.ts';
import { generateValley } from './valley/generate.ts';
import { isClimate, isWeatherSpell, type WeatherSpell, type WeatherState } from './weather.ts';
import { refreshWet } from './wet.ts';
import type { BriefState } from './brief.ts';
import { BYPRODUCTS, type ByproductTarget, type ThingRuntime } from './workshops.ts';

/** Cells whose fertility lies further than this from their soil's own are saved. */
export const FERTILITY_SAVE_EPS = 0.002;
/** Fertility is saved in thousandths. */
const FERTILITY_SCALE = 1000;

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
    campaignId?: string; valleyTitle?: string; orderTargets: Inventory; suppliesCap: number; starterSupplies: number;
  };
  revision: number; nextId: number;
  things: Thing[];
  fields: SavedField[];
  channels: SavedPath[]; tracks: SavedPath[]; hedges: SavedPath[];
  plantedTrees: Tree[];
  /** [cell index, fertility in thousandths] for each cell farmed off its soil's own. */
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
  for (let i = 0; i < g.fertility.length; i++) {
    if (Math.abs(g.fertility[i] - naturalFertility(g, i)) > FERTILITY_SAVE_EPS) fertility.push([i, Math.round(g.fertility[i] * FERTILITY_SCALE)]);
  }
  const file: SaveFile = {
    version: STATE_VERSION,
    valley: {
      seed: s.seed, weatherSeed: s.weatherSeed, season: s.season, climate: s.climate, terrain: s.terrain, sandbox: s.sandbox,
      ...(s.campaignId === undefined ? {} : { campaignId: s.campaignId }),
      ...(s.valleyTitle === undefined ? {} : { valleyTitle: s.valleyTitle }),
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
  | { enum: (v: unknown) => boolean }
  | { arr: Shape }
  | { tuple: readonly Shape[] }
  | { obj: Readonly<Record<string, Shape>>; optional?: readonly string[] }
  | { nullable: Shape };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const oneOf = (list: readonly string[]) => ({ enum: (v: unknown) => typeof v === 'string' && list.includes(v) });

function check(v: unknown, shape: Shape, at: string): string | undefined {
  if (shape === 'num') return typeof v === 'number' && Number.isFinite(v) ? undefined : `${at} isn't a number`;
  if (shape === 'int') return Number.isSafeInteger(v) ? undefined : `${at} isn't a whole number`;
  if (shape === 'str') return typeof v === 'string' ? undefined : `${at} isn't text`;
  if (shape === 'bool') return typeof v === 'boolean' ? undefined : `${at} isn't true or false`;
  if (shape === 'point') return check(v, { obj: { x: 'num', z: 'num' } }, at);
  if (shape === 'inventory') {
    if (!isRecord(v)) return `${at} isn't a list of goods`;
    for (const [k, n] of Object.entries(v)) {
      if (!isGood(k)) return `${at} has an unknown good "${k}"`;
      if (!(typeof n === 'number' && Number.isFinite(n) && n >= 0)) return `${at}.${k} isn't a count`;
    }
    return undefined;
  }
  if ('enum' in shape) return shape.enum(v) ? undefined : `${at} has an unknown value ${JSON.stringify(v)}`;
  if ('nullable' in shape) return v === null ? undefined : check(v, shape.nullable, at);
  if ('arr' in shape) {
    if (!Array.isArray(v)) return `${at} isn't a list`;
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
const TARGETS = [...new Set(Object.values(BYPRODUCTS).flatMap((b) => b.targets))] as ByproductTarget[];
const CART_STATES: readonly CartState[] = ['idle', 'charging', 'toPickup', 'toDropoff', 'returning'];
const DROP_IDS: readonly DropId[] = ['firstHarvest', 'firstCraft'];
const RECIPE = oneOf(['bread', 'honey_cake']);
const SEAL = { progress: 'num', done: 'bool' } as const;
const PATH: Shape = { obj: { id: 'int', points: { arr: 'point' } } };
const ENDPOINT: Shape = { obj: { kind: oneOf(['thing', 'field']), id: 'int' } };

const FILE: Shape = {
  obj: {
    version: 'int',
    valley: {
      obj: {
        seed: 'int', weatherSeed: 'int', season: SEASON, climate: { enum: (v) => typeof v === 'string' && isClimate(v) },
        terrain: { enum: isTerrainStyle }, sandbox: 'bool', campaignId: 'str', valleyTitle: 'str', orderTargets: 'inventory',
        suppliesCap: 'int', starterSupplies: 'int',
      },
      optional: ['campaignId', 'valleyTitle'],
    },
    revision: 'int', nextId: 'int',
    things: { arr: { obj: { id: 'int', kind: KIND, x: 'num', z: 'num', yaw: 'num', padTargetY: 'num' } } },
    fields: {
      arr: {
        obj: {
          id: 'int', crop: CROP, growth: 'num', fertility: 'num', harvestReady: 'int', pollinated: 'num', frosted: 'bool', flooded: 'bool',
          avgMoisture: 'num', cells: { arr: 'int' },
        },
      },
    },
    channels: { arr: PATH }, tracks: { arr: PATH }, hedges: { arr: PATH },
    plantedTrees: { arr: { obj: { id: 'int', x: 'num', z: 'num', species: SPECIES, scale: 'num', seed: 'int', planted: 'bool' } } },
    fertility: { arr: { tuple: ['int', 'int'] } },
    sim: {
      obj: {
        day: 'int', hour: 'num',
        supplies: {
          obj: {
            available: 'int', spent: 'int', unlocked: 'int', cap: 'int',
            drops: { arr: { obj: { id: oneOf(DROP_IDS), amount: 'int', label: 'str', received: 'bool' } } },
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
        },
        carts: {
          arr: {
            obj: {
              id: 'int', x: 'num', z: 'num', yaw: 'num', speed: 'num', battery: 'num',
              cargo: { nullable: { obj: { good: GOOD, count: 'int' } } }, state: oneOf(CART_STATES), jobDesc: 'str',
              path: { arr: 'point' }, pathIdx: 'int', targetLabel: 'str',
              job: { nullable: { obj: { from: ENDPOINT, to: ENDPOINT, good: GOOD, count: 'int', priority: 'num' } } },
              wait: 'num', navKey: 'str',
            },
            optional: ['targetLabel'],
          },
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
            spell: { enum: (v) => typeof v === 'string' && isWeatherSpell(v) }, label: 'str', cloudCover: 'num', rain: 'num', snow: 'num',
            storm: 'num', heat: 'num', haze: 'num', windSpeed: 'num', tempC: 'num', floodSurge: 'num', groundWet: 'num',
            snowDepth: 'num', frostCover: 'num', lightning: 'bool', soak: 'num',
          },
        },
        weatherOverride: { nullable: { enum: (v) => typeof v === 'string' && isWeatherSpell(v) } },
        soilHours: 'num', floodApplied: 'num', floodKey: 'int',
        networks: {
          arr: {
            obj: {
              id: 'int', emitters: { arr: 'int' }, loads: { arr: 'int' }, generationW: 'num', demandW: 'num', servedW: 'num',
              batteryWh: 'num', batteryCapWh: 'num', blackout: 'bool', fed: 'bool',
            },
          },
        },
        powerSummary: {
          obj: { totalGenW: 'num', totalDemandW: 'num', totalStoredWh: 'num', totalCapWh: 'num', anyBlackout: 'bool', lastBlackoutReason: 'str' },
        },
      },
    },
  },
};

/** What the shape checker can't see: ids that must agree, cells that must lie on the grid, counts in range. */
function checkSense(f: SaveFile, cells: number): string | undefined {
  const ids = new Set<number>();
  for (const t of f.things) {
    if (ids.has(t.id)) return `two buildings share id ${t.id}`;
    ids.add(t.id);
  }
  if (f.things.filter((t) => t.kind === 'depot').length !== 1) return 'the valley has no Depot';
  for (const t of f.things) if (CATALOG[t.kind].oneOfEach && f.things.filter((v) => v.kind === t.kind).length > 1) return `two of the ${CATALOG[t.kind].label}`;
  for (const [id, r] of f.sim.things) {
    const t = f.things.find((v) => v.id === id);
    if (!t || r.id !== id || r.kind !== t.kind) return `a building's runtime ${id} doesn't match a building`;
  }
  const taken = new Uint8Array(cells), fieldIds = new Set<number>();
  for (const fd of f.fields) {
    if (fd.id <= 0 || fd.id > 0xffff || fieldIds.has(fd.id)) return `field id ${fd.id}`;
    fieldIds.add(fd.id);
    if (fd.cells.length === 0 || fd.cells.length % 2 !== 0) return `field ${fd.id}'s cells`;
    for (let k = 0; k < fd.cells.length; k += 2) {
      const a = fd.cells[k], n = fd.cells[k + 1];
      if (a < 0 || n <= 0 || a + n > cells) return `field ${fd.id}'s cells`;
      for (let i = a; i < a + n; i++) { if (taken[i]) return `two fields on cell ${i}`; taken[i] = 1; }
    }
  }
  for (const [i, v] of f.fertility) if (i < 0 || i >= cells || v < 0 || v > FERTILITY_SCALE * 2) return `fertility at cell ${i}`;
  for (const p of [...f.channels, ...f.tracks, ...f.hedges]) if (p.points.length < 1) return `a path ${p.id} with no points`;
  for (const c of f.sim.carts) if (c.pathIdx < 0 || c.pathIdx > c.path.length) return `cart ${c.id}'s path`;
  const sup = f.sim.supplies;
  if (sup.available !== sup.unlocked - sup.spent || sup.unlocked > sup.cap || sup.spent < 0) return 'the Supplies';
  if (f.sim.hour < 0 || f.sim.hour >= 24 || f.sim.day < 1) return 'the clock';
  return undefined;
}

// --- Reading -----------------------------------------------------------------------------------------------------------------

/** Reads a save's text back into a homestead, or says why it can't. */
export function deserializeSave(raw: string): Result<GameState, string> {
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return err(NOT_A_SAVE); }
  if (!isRecord(data) || !('version' in data)) return err(NOT_A_SAVE);
  if (data.version !== STATE_VERSION) return err(OLD_SAVE);
  const bad = check(data, FILE, 'save');
  if (bad) return err(damaged(bad));
  const f = data as unknown as SaveFile;
  const sense = checkSense(f, GRID_N * GRID_N);
  if (sense) return err(damaged(sense));
  try {
    return rebuild(f);
  } catch (e) {
    // The recipe grew no valley (a seed edited by hand): a broken save, not a bug.
    return err(damaged(e instanceof Error ? e.message : 'its valley would not grow'));
  }
}

function rebuild(f: SaveFile): Result<GameState, string> {
  const v = f.valley;
  const s = generateValley(v.seed >>> 0, v.season, {
    weatherSeed: v.weatherSeed, climate: v.climate, terrain: v.terrain, sandbox: v.sandbox, order: v.orderTargets,
    suppliesCap: v.suppliesCap, starterSupplies: v.starterSupplies,
    ...(v.campaignId === undefined ? {} : { campaignId: v.campaignId }), ...(v.valleyTitle === undefined ? {} : { valleyTitle: v.valleyTitle }),
  });
  const g = s.grid;

  // What the player made, in place of what the valley came with (its Depot and starter track are among it).
  s.things = f.things.map((t) => ({ id: t.id, kind: t.kind, x: t.x, z: t.z, yaw: t.yaw, padTargetY: t.padTargetY }));
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
  for (const [i, v2] of f.fertility) g.fertility[i] = v2 / FERTILITY_SCALE;

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
  refreshWet(s);
  recomputeBridges(s);
  s.power = powerFor(s);
  s.revision = f.revision;
  return ok(s);
}
