// The homestead's roster (Vertical Slice 1 and the core loop of Milestone 2): what the player can place, drawn with
// brush3d's models (brush3d/docs/MODELS.md), and what each costs from the one capped Supplies pool (docs/DESIGN.md).
//
// Footprints are in metres, from each model's real bounds in its own frame (brush3d/src/models/index.json: `lo`, `hi`; x
// along its front, z out through it), not from the old 4 m tiles (its `tiles`). The bounds are copied here as plain numbers
// so the rules stay free of the renderer and its bundler; test/catalog.test.ts checks them against index.json.

export type Category = 'homestead' | 'power' | 'prop';
/**
 * How a thing takes part in the power preview: a `source` makes power, a `store` holds it, a `load` uses it, and a `relay`
 * passes the wireless field on.
 */
export type PowerRole = 'source' | 'store' | 'load' | 'relay' | 'none';

interface Spec {
  label: string; category: Category;
  /** brush3d's model (brush3d/src/models/index.json). */
  model: string;
  /** The model's bounds on the ground in its own frame, metres: [minX, minZ] and [maxX, maxZ], and its top. */
  lo: readonly [number, number]; hi: readonly [number, number]; top: number;
  /** How far the settled pad eases into the slope round the footprint, m (0: it stands on the ground as it is). */
  padEase: number;
  /** The steepest natural ground (rise over run across the footprint) it may stand on. */
  maxSlope: number;
  /** At most one per valley. */
  oneOfEach: boolean;
  /** It may stand over a painted field (solar canopies over crops: agrivoltaics). */
  allowOnField: boolean;
  /** It stands on a brook's bank with its front in the water (the water wheel). */
  onBank: boolean;
  /** For an `onBank` thing: how far out from its middle along its front (local +z) the wheel turns in the race, m. */
  raceOffset: number;
  powerRole: PowerRole;
  /** How far its wireless field reaches, m. 0 when it makes none. */
  powerRange: number;
  /** What it costs from the capped Supplies pool (refunded in full when it's removed). */
  cost: number;
  /** The watts it draws while it works (a `load`); 0 for everything else. */
  powerDemand: number;
  /** Fixed in the valley: it can't be moved, turned or removed (the Depot). */
  immovable: boolean;
}

const fixed = { cost: 0, powerDemand: 0, immovable: false } as const;
const home = { ...fixed, category: 'homestead', padEase: 3.5, maxSlope: 0.14, oneOfEach: true, allowOnField: false, onBank: false, raceOffset: 0, powerRole: 'load', powerRange: 0 } as const;
const power = { ...fixed, category: 'power', padEase: 2.5, maxSlope: 0.18, oneOfEach: false, allowOnField: false, onBank: false, raceOffset: 0, powerRole: 'source', powerRange: 15 } as const;
const prop = { ...fixed, category: 'prop', padEase: 0, maxSlope: 0.35, oneOfEach: false, allowOnField: false, onBank: false, raceOffset: 0, powerRole: 'none', powerRange: 0 } as const;

const SPECS = {
  // Supplies costs: provisional v0.2 tuning (docs/DESIGN.md, Provisional Supplies Costs). Watts: Milestone 2's power sim.
  farmhouse: { ...home, label: 'Farmhouse', model: 'farmhouse', powerDemand: 0.5, lo: [-5.8, -5.8], hi: [5.8, 5.8], top: 8.95 },
  silo: { ...home, label: 'Silo', model: 'silo', padEase: 3, cost: 2, lo: [-3.75, -3.75], hi: [3.75, 3.75], top: 10.05 },
  mill: { ...home, label: 'Mill', model: 'mill', padEase: 3, cost: 2, powerDemand: 2, lo: [-3.75, -3.75], hi: [3.75, 3.75], top: 7.75 },
  bakery: { ...home, label: 'Bakery', model: 'bakery', padEase: 3, cost: 2, powerDemand: 2.5, lo: [-3.75, -3.8], hi: [3.75, 3.75], top: 7.85 },
  coop: { ...home, label: 'Coop', model: 'coop', padEase: 3, cost: 2, powerDemand: 0.5, lo: [-5.67, -5.85], hi: [5.67, 5.69], top: 5.05 },
  // Pure biology: the composter needs no power.
  composter: { ...home, label: 'Composter', model: 'composter', padEase: 2.5, cost: 2, powerRole: 'none', lo: [-3.67, -3.68], hi: [3.67, 3.56], top: 3.68 },
  // Comes with one Electric Cart; draws its full watts while it charges one.
  garage: { ...home, label: 'Garage', model: 'garage', padEase: 2.5, cost: 2, powerDemand: 1.5, lo: [-3.78, -3.85], hi: [3.78, 3.75], top: 4.7 },
  // The valley's link to the settlement, set at its edge when the valley grows: a stone platform standing on the ground as
  // it is (no pad), so the valley's land stays its own.
  depot: { ...home, label: 'Depot', model: 'depot', padEase: 0, maxSlope: 0.12, powerRole: 'none', immovable: true, lo: [-5.8, -5.8], hi: [5.8, 5.8], top: 10.17 },
  solar: { ...power, label: 'Solar Canopy', model: 'solar_panel', padEase: 0, allowOnField: true, cost: 1, lo: [-3.7, -2.04], hi: [3.7, 2.62], top: 3.3 },
  turbine: { ...power, label: 'Wind Turbine', model: 'wind_turbine', maxSlope: 0.25, cost: 3, lo: [-2.58, -1.5], hi: [4.95, 1.57], top: 18.75 },
  waterwheel: { ...power, label: 'Water Wheel', model: 'water_wheel', onBank: true, raceOffset: 4.5, maxSlope: 0.2, cost: 3, lo: [-3.75, -3.8], hi: [3.75, 6.79], top: 4.63 },
  battery: { ...power, label: 'Battery', model: 'battery', powerRole: 'store', cost: 1, lo: [-3.6, -3.6], hi: [3.6, 3.6], top: 4.52 },
  // No relay model yet: the relay mast borrows brush3d's slim pylon (a renderer may dress it differently).
  relay: { ...prop, label: 'Power Relay', category: 'power', model: 'pylon', maxSlope: 0.45, powerRole: 'relay', powerRange: 15, lo: [-1, -0.4], hi: [1, 0.88], top: 5.72 },
  // Milestone 4: the Weather Station reads the next days' weather (weather.ts forecastDays); the Heated Greenhouse grows a
  // protected crop under glass through frost, snow, flood and drought, and lets bees forage inside it in the cold.
  weather_station: { ...home, label: 'Weather Station', model: 'weather_station', padEase: 2.5, maxSlope: 0.18, cost: 1, powerRole: 'none', lo: [-1.54, -1.85], hi: [1.91, 1.52], top: 4.67 },
  greenhouse: { ...home, label: 'Heated Greenhouse', model: 'greenhouse', padEase: 3, cost: 3, powerDemand: 2, lo: [-5.5, -5.65], hi: [5.64, 5.96], top: 5.26 },
  // Milestone 5A: the full roster's workshops (workshops.ts RECIPES) and the Biogas Digester, a storm-proof source that burns
  // the homestead's organic waste (manure, bran, seed cake) into steady power, day and night.
  oil_press: { ...home, label: 'Oil Press', model: 'oil_press', padEase: 3, cost: 2, powerDemand: 1.5, lo: [-3.83, -3.75], hi: [3.75, 3.75], top: 5.38 },
  cannery: { ...home, label: 'Cannery', model: 'cannery', padEase: 3, cost: 2, powerDemand: 2, lo: [-3.75, -3.75], hi: [3.85, 3.75], top: 5.6 },
  spinner: { ...home, label: 'Spinner', model: 'spinner', padEase: 3, cost: 2, powerDemand: 1.5, lo: [-3.75, -3.8], hi: [3.75, 3.75], top: 4.6 },
  loom: { ...home, label: 'Loom', model: 'loom', padEase: 3, cost: 2, powerDemand: 2, lo: [-3.75, -3.75], hi: [3.75, 3.75], top: 4.38 },
  digester: { ...power, label: 'Biogas Digester', model: 'digester', padEase: 3, maxSlope: 0.16, oneOfEach: true, cost: 3, lo: [-3.78, -3.78], hi: [3.78, 3.78], top: 6.95 },
  rain_tank: { ...prop, category: 'homestead', padEase: 2.5, cost: 1, label: 'Rain Tank', model: 'rain_tank', lo: [-1.21, -1.05], hi: [1.05, 1.55], top: 3.67 },
  sprinkler: { ...prop, category: 'homestead', padEase: 2.5, powerRole: 'load', powerDemand: 1, cost: 1, label: 'Sprinkler', model: 'sprinkler', lo: [-1.85, -0.85], hi: [1.44, 0.85], top: 3.06 },
  beehive: { ...prop, category: 'homestead', padEase: 2.5, cost: 1, label: 'Beehive', model: 'beehive', lo: [-1.7, -0.95], hi: [1.7, 1.6], top: 2.29 },
  bench: { ...prop, label: 'Bench', model: 'bench', lo: [-1.98, -0.46], hi: [1.98, 0.26], top: 1 },
  lantern: { ...prop, label: 'Solar Lantern', model: 'lantern', powerRole: 'load', powerDemand: 0.05, lo: [-0.4, -0.3], hi: [0.4, 0.82], top: 3.31 },
  planter: { ...prop, label: 'Planter', model: 'planter', lo: [-1.7, -1.6], hi: [1.78, 1.4], top: 0.56 },
  crates: { ...prop, label: 'Crates', model: 'crates', lo: [-1.5, -1.2], hi: [1.26, 1.26], top: 1.57 },
} as const satisfies Record<string, Spec>;

export type ThingKind = keyof typeof SPECS;
export const THING_KINDS = Object.keys(SPECS) as ThingKind[];

/** A placeable thing's rules. Footprint: a box `halfW` × `halfD` about (offX, offZ) in the model's own frame. */
export interface ThingDef extends Spec {
  kind: ThingKind;
  halfW: number; halfD: number; offX: number; offZ: number;
  /** The part of the footprint the pad holds flat and that must stand on dry ground (all of it, but the wheel's race). */
  core: { halfW: number; halfD: number; offX: number; offZ: number };
}

/** Where a water wheel's race begins, local z: the pit in its own footprint (brush3d/src/models/catalog.ts wheelRace). */
export const RACE_START = 1.7;

function define(kind: ThingKind, s: Spec): ThingDef {
  const halfW = (s.hi[0] - s.lo[0]) / 2, halfD = (s.hi[1] - s.lo[1]) / 2;
  const offX = (s.hi[0] + s.lo[0]) / 2, offZ = (s.hi[1] + s.lo[1]) / 2;
  const coreHi = s.onBank ? Math.min(s.hi[1], RACE_START) : s.hi[1];
  return {
    ...s, kind, halfW, halfD, offX, offZ,
    core: { halfW, halfD: (coreHi - s.lo[1]) / 2, offX, offZ: (coreHi + s.lo[1]) / 2 },
  };
}

export const CATALOG: { readonly [K in ThingKind]: ThingDef } =
  Object.fromEntries(THING_KINDS.map((k) => [k, define(k, SPECS[k])])) as { [K in ThingKind]: ThingDef };

export const isThingKind = (k: string): k is ThingKind => Object.hasOwn(SPECS, k);

/** The craft workshops: one of each, each turning goods into other goods (workshops.ts). */
export const WORKSHOP_KINDS = ['mill', 'coop', 'bakery', 'composter', 'oil_press', 'cannery', 'spinner', 'loom'] as const satisfies readonly ThingKind[];
export type WorkshopKind = (typeof WORKSHOP_KINDS)[number];
export const isWorkshop = (k: ThingKind): k is WorkshopKind => (WORKSHOP_KINDS as readonly ThingKind[]).includes(k);
