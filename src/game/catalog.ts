// The starter homestead (Vertical Slice 1): what the player can place, drawn with brush3d's models (brush3d/docs/MODELS.md).
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
}

const home = { category: 'homestead', padEase: 3.5, maxSlope: 0.14, oneOfEach: true, allowOnField: false, onBank: false, raceOffset: 0, powerRole: 'load', powerRange: 0 } as const;
const power = { category: 'power', padEase: 2.5, maxSlope: 0.18, oneOfEach: false, allowOnField: false, onBank: false, raceOffset: 0, powerRole: 'source', powerRange: 15 } as const;
const prop = { category: 'prop', padEase: 0, maxSlope: 0.35, oneOfEach: false, allowOnField: false, onBank: false, raceOffset: 0, powerRole: 'none', powerRange: 0 } as const;

const SPECS = {
  farmhouse: { ...home, label: 'Farmhouse', model: 'farmhouse', lo: [-5.8, -5.8], hi: [5.8, 5.8], top: 8.95 },
  silo: { ...home, label: 'Silo', model: 'silo', padEase: 3, lo: [-3.75, -3.75], hi: [3.75, 3.75], top: 10.05 },
  mill: { ...home, label: 'Mill', model: 'mill', padEase: 3, lo: [-3.75, -3.75], hi: [3.75, 3.75], top: 7.75 },
  bakery: { ...home, label: 'Bakery', model: 'bakery', padEase: 3, lo: [-3.75, -3.8], hi: [3.75, 3.75], top: 7.85 },
  solar: { ...power, label: 'Solar Canopy', model: 'solar_panel', padEase: 0, allowOnField: true, lo: [-3.7, -2.04], hi: [3.7, 2.62], top: 3.3 },
  turbine: { ...power, label: 'Wind Turbine', model: 'wind_turbine', maxSlope: 0.25, lo: [-2.58, -1.5], hi: [4.95, 1.57], top: 18.75 },
  waterwheel: { ...power, label: 'Water Wheel', model: 'water_wheel', onBank: true, raceOffset: 4.5, maxSlope: 0.2, lo: [-3.75, -3.8], hi: [3.75, 6.79], top: 4.63 },
  battery: { ...power, label: 'Battery', model: 'battery', powerRole: 'store', lo: [-3.6, -3.6], hi: [3.6, 3.6], top: 4.52 },
  // No relay model yet: the relay mast borrows brush3d's slim pylon (a renderer may dress it differently).
  relay: { ...prop, label: 'Power Relay', category: 'power', model: 'pylon', maxSlope: 0.45, powerRole: 'relay', powerRange: 15, lo: [-1, -0.4], hi: [1, 0.88], top: 5.72 },
  bench: { ...prop, label: 'Bench', model: 'bench', lo: [-1.98, -0.46], hi: [1.98, 0.26], top: 1 },
  lantern: { ...prop, label: 'Solar Lantern', model: 'lantern', powerRole: 'load', lo: [-0.4, -0.3], hi: [0.4, 0.82], top: 3.31 },
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
