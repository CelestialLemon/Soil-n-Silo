// The game's state: the valley's land (its grid), what nature put on it, what the player has made, and the living
// homestead running on it (`sim`: the clock, Supplies, goods, power, carts and the brief). Plain data; the rules that
// change the land all go through `apply` (actions.ts), and time moves through `stepSim` (sim.ts).
import type { BriefState } from './brief.ts';
import { blankBrief } from './brief.ts';
import type { Cart } from './carts.ts';
import type { ThingKind } from './catalog.ts';
import type { Point2 } from './geom.ts';
import type { Inventory } from './goods.ts';
import { createGrid, type Grid, type Rect } from './grid.ts';
import type { PowerNetwork, PowerSummary } from './power/sim.ts';
import { starterSupplies, type SuppliesState } from './supplies.ts';
import type { ThingRuntime } from './workshops.ts';

export const STATE_VERSION = 6;

/** The valley's one season (brush3d's SEASONS). */
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

/** The trees brush3d grows (its kit/plants.ts SPECIES). */
export const TREE_SPECIES = ['oak', 'birch', 'pine', 'willow', 'poplar', 'apple', 'bush'] as const;
export type TreeSpecies = (typeof TREE_SPECIES)[number];

export const CROPS = ['wheat', 'beans'] as const;
export type Crop = (typeof CROPS)[number];

/** A placed building or prop. `padTargetY`: the height its settled pad holds, the mean of the natural ground under its core. */
export interface Thing { id: number; kind: ThingKind; x: number; z: number; yaw: number; padTargetY: number }

/** A rock outcrop the valley grew: unbuildable, unmovable. */
export interface Crag { id: number; x: number; z: number; radius: number; height: number; seed: number }

/** A tree: wild (the valley's) or planted (the player's). */
export interface Tree { id: number; x: number; z: number; species: TreeSpecies; scale: number; seed: number; planted: boolean }

/**
 * A painted field: one connected patch of a crop, and how its crop is doing (crops.ts): how far it has grown, the soil's
 * fertility under it, and the ripe harvest waiting at its edge for the carts.
 */
export interface Field {
  id: number; crop: Crop; cellCount: number; areaM2: number; avgMoisture: number; bounds: Rect;
  /** 0..1: how grown the crop is (freshly sown fields start at SOWN_GROWTH, so seedlings show at once). */
  growth: number;
  /** 0..1: the soil's fertility under it (wheat draws it down, beans and compost build it up). */
  fertility: number;
  /** Whole units of ripe harvest waiting at its edge for an Electric Cart; 0 while it grows. */
  harvestReady: number;
  /** Bees visited during this crop cycle, including crops that ripen after dusk. */
  pollinated: boolean;
}

/** The water along a rill's centreline at one sample. */
export interface FlowSample { x: number; z: number; wet: boolean; waterLevel: number; bedHeight: number; bankHeight: number }

/** A hand-dug rill: the stroke the player drew (`points`), its smooth centreline (`path`) and the water along it. */
export interface Channel { id: number; points: Point2[]; path: Point2[]; flow: FlowSample[] }

/** A dirt track. */
export interface Track { id: number; points: Point2[]; path: Point2[] }

/**
 * A plank bridge where a track crosses water or a rill: centred at (x, z), its length running along `yaw` (local +z, as
 * the models' fronts), its deck at `deckY`. Rebuilt from the tracks and rills whenever either changes.
 */
export interface Bridge { id: string; trackId: number; x: number; z: number; yaw: number; length: number; width: number; deckY: number }

export interface Hedge { id: number; points: Point2[]; path: Point2[] }

/** A power building's or relay's soft wireless field. */
export interface PowerRadius { id: number; x: number; z: number; radius: number; powered: boolean }
/**
 * The power preview: which things join a network and which get power (Milestone 1: connectivity, no watts yet). Power is
 * wireless: no lines, only the fields round power buildings and relays.
 */
export interface PowerState {
  radii: PowerRadius[];
  /** Things on a network of two or more. */
  connected: number[];
  /** Things on a network with a source or a store. */
  powered: number[];
}

/** Where the valley's landmarks lie, for the camera, the tests and the tools. */
export interface Valley {
  /** A gentle spot by the brook the generator kept for the farmhouse. */
  homestead: Point2;
  /** The brook's centreline, upstream to downstream, and its water surface at each point (never rising). */
  brook: Point2[]; brookLevel: number[];
  pond: { x: number; z: number; radius: number; level: number };
}

/** The living homestead: everything that moves with time rather than with the player's edits. */
export interface SimState {
  /** The valley's clock: day 1 is the first, and the hour of day (0..24). */
  day: number; hour: number;
  supplies: SuppliesState;
  /** Each building's goods, recipe, power and status, by its id (workshops.ts). */
  things: Map<number, ThingRuntime>;
  carts: Cart[];
  nextCartId: number;
  /** Everything delivered to the Depot so far. */
  delivered: Inventory;
  /** The wireless power networks as they ran on the last step (power/sim.ts). */
  networks: PowerNetwork[];
  powerSummary: PowerSummary;
  brief: BriefState;
  /** Game hours since resting ground last drifted back toward its soil's fertility (crops.ts restSoil, once an hour). */
  soilHours: number;
}

/** A fresh homestead: morning of day 1, the starter Supplies parcel, nothing running yet. */
export function blankSim(): SimState {
  return {
    day: 1, hour: 8, supplies: starterSupplies(), things: new Map(), carts: [], nextCartId: 1, delivered: {}, networks: [],
    powerSummary: { totalGenW: 0, totalDemandW: 0, totalStoredWh: 0, totalCapWh: 0, anyBlackout: false, lastBlackoutReason: '' },
    brief: blankBrief(), soilHours: 0,
  };
}

export interface GameState {
  version: typeof STATE_VERSION;
  seed: number;
  season: Season;
  /** Bumped on every edit to the land, so the picture can tell which land it shows. */
  revision: number;
  grid: Grid;
  valley: Valley;
  crags: Crag[];
  wildTrees: Tree[];
  things: Thing[];
  fields: Field[];
  channels: Channel[];
  tracks: Track[];
  bridges: Bridge[];
  hedges: Hedge[];
  plantedTrees: Tree[];
  power: PowerState;
  sim: SimState;
  nextId: number;
}

/** A blank state: flat grass at height 0, no water, no things. The valley generator (and the tests) fill it in. */
export function blankState(seed: number, season: Season): GameState {
  return {
    version: STATE_VERSION, seed, season, revision: 0, grid: createGrid(),
    valley: { homestead: { x: 0, z: 0 }, brook: [], brookLevel: [], pond: { x: 0, z: 0, radius: 0, level: 0 } },
    crags: [], wildTrees: [], things: [], fields: [], channels: [], tracks: [], bridges: [], hedges: [], plantedTrees: [],
    power: { radii: [], connected: [], powered: [] }, sim: blankSim(), nextId: 1,
  };
}

export const takeId = (s: GameState) => s.nextId++;
