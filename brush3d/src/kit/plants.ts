import * as THREE from 'three';
import { MeshBuilder, noise2, rng, srgb, type Paint } from './builder';
import { C, addDab, smooth, type Tree, type TreeForm } from './kit';
import type { TreeKind } from '../renderer/trees';
import type { Season } from '../renderer/season';
import type { BrushRenderer } from '../renderer/renderer';

// What the game grows, in its own words (docs/API.md, "What grows"; Soil-n-Silo#213): its five crops at their four stages,
// and its six tree species and the bushes. The game says which crop, which stage, which species; how each looks is the
// renderer's.
//
// Today (#213's groundwork) every crop is painted as the demo's wheat at its stage, and each species is one of the kit's
// tree shapes (pine, willow and poplar have none of their own yet). #213's look work gives each crop and species its own.

export const CROP_NAMES = ['wheat', 'beans', 'tomato', 'sunflower', 'flax'] as const;
export type CropName = (typeof CROP_NAMES)[number];
/** A crop's growth stages: 0 just sown, 1 young, 2 grown (flowering, for the crops that flower), 3 ripe. */
export type CropStage = 0 | 1 | 2 | 3;

export const SPECIES = ['oak', 'birch', 'pine', 'willow', 'poplar', 'apple', 'bush'] as const;
/** The game's tree species, and its bushes. */
export type Species = (typeof SPECIES)[number];

// ---- Trees ----

interface SpeciesLook {
  kind: TreeKind;
  /** Where it grows, for its seasons (seasonTrees.ts); none for a plain deciduous tree (no holm oaks, no wild blossom). */
  form?: TreeForm;
  leaf?: THREE.Color;
  /** A grown tree's size against the kit's (about 4 m tall at 1). */
  scale: number;
  /** Its crown's colour from afar, in each season (the far woods' crowns, `addCanopy`). */
  far: Record<Season, THREE.Color>;
}

const FAR_BARE = srgb(0x7a6758);
/** Each species on the kit's shapes (#213's groundwork: pine, willow and poplar stand in as a cypress and broadleaves). */
const LOOKS: Record<Species, SpeciesLook> = {
  oak: { kind: 'broadleaf', leaf: srgb(0x3f7f44), scale: 1.5,
    far: { spring: srgb(0x76a84e), summer: srgb(0x467348), autumn: srgb(0xd98a32), winter: FAR_BARE } },
  birch: { kind: 'broadleaf', leaf: srgb(0x86b850), scale: 1.25,
    far: { spring: srgb(0x91bc61), summer: srgb(0x9cc068), autumn: srgb(0xe3b43c), winter: srgb(0x8c6c66) } },
  pine: { kind: 'cypress', leaf: srgb(0x2b5e4c), scale: 1.4,
    far: { spring: srgb(0x28564f), summer: srgb(0x28564f), autumn: srgb(0x28564f), winter: srgb(0x28564f) } },
  willow: { kind: 'broadleaf', form: 'willow', leaf: srgb(0x7fb07a), scale: 1.35,
    far: { spring: srgb(0x91bc61), summer: srgb(0x83b390), autumn: srgb(0xcdb04a), winter: srgb(0xb48d42) } },
  // A broadleaf until the poplar's own column (#213's look): a cypress would keep its leaves through the winter.
  poplar: { kind: 'broadleaf', form: 'hedge', leaf: srgb(0x2f6a3e), scale: 1.6,
    far: { spring: srgb(0x588650), summer: srgb(0x2e633d), autumn: srgb(0xe3b43c), winter: FAR_BARE } },
  apple: { kind: 'fruit', form: 'orchard', scale: 1.05,
    far: { spring: srgb(0xe9c3c0), summer: srgb(0x567843), autumn: srgb(0xc0782e), winter: FAR_BARE } },
  bush: { kind: 'bush', form: 'thicket', scale: 1.3,
    far: { spring: srgb(0x76a84e), summer: srgb(0x52823c), autumn: srgb(0xa8502f), winter: srgb(0x6d5644) } },
};

/**
 * A tree of a species, for `growTree` or a `Grove`: standing at (x, z), `size` 1 grown (a sapling less), `seed` its own
 * (its shape; the same seed, the same tree).
 */
export function speciesTree(species: Species, x: number, z: number, size: number, seed: number): Tree {
  const l = LOOKS[species];
  return { kind: l.kind, form: l.form, leaf: l.leaf, x, z, seed, scale: l.scale * size };
}

/** How tall a grown tree of the species stands, roughly (m). */
export const speciesHeight = (species: Species) => LOOKS[species].scale * (LOOKS[species].kind === 'cypress' ? 6.6 : 4.2);

/**
 * A far wood's crown: a loose ball of broad strokes `radius` across, its foot at (x, y, z), in the species' colour from afar
 * in the season. For woods too far off to tell one tree's limbs from another's, at a sliver of a tree's cost.
 */
export function addCanopy(b: MeshBuilder, x: number, y: number, z: number, radius: number, species: Species, season: Season, rand: () => number) {
  const base = LOOKS[species].far[season];
  const cy = y + radius * 1.3, n = Math.round(3 + 1.5 * radius);
  for (let i = 0; i < n; i++) {
    const u = rand() * 2 - 1, phi = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const dir = new THREE.Vector3(s * Math.cos(phi), u < 0 ? u * 0.6 : u, s * Math.sin(phi));
    const p = new THREE.Vector3(x, cy, z).addScaledVector(dir, radius * (0.55 + rand() * 0.4));
    const lit = smooth(-0.2, 0.9, dir.y);
    const c = base.clone().offsetHSL(-0.02 * lit, 0.04 * lit, 0.08 * lit - 0.06).offsetHSL(0, 0, (rand() - 0.5) * 0.05);
    addDab(b, p, dir, c, (0.42 + rand() * 0.14) * radius, rand(), [0.7, 0.5 + rand() * 0.3, -1, 0.6]);
  }
}

// ---- Crops ----

/**
 * One tile of a field: its middle (x, z) and the top of its soil (y), metres; `side` the tile's width (4 m); `joins` the
 * sides on which the same crop carries on (1 north, -z; 2 east, +x; 4 south, +z; 8 west, -x), so a field's tiles paint as
 * one crop, rounding down only at its edges.
 */
export interface CropTile { x: number; y: number; z: number; crop: CropName; stage: CropStage; joins?: number; side?: number }

/** How the groundwork paints every crop: the demo's wheat at the stage (meadow.ts, farm.ts). */
interface Stand { tall: number; base: THREE.Color; deep: THREE.Color; tip: THREE.Color; root: THREE.Color; ears: boolean; stalks: number }
const STANDS: Record<CropStage, Stand> = {
  0: { tall: 0.1, base: srgb(0x8cb850), deep: srgb(0x6a9a44), tip: srgb(0xb0cc68), root: srgb(0x6a5a3a), ears: false, stalks: 0 },
  1: { tall: 0.35, base: srgb(0x7cb04a), deep: srgb(0x5a9442), tip: srgb(0xa8c860), root: srgb(0x4e7e38), ears: false, stalks: 3 },
  2: { tall: 0.7, base: srgb(0x9cbc4a), deep: srgb(0x6e9a3e), tip: srgb(0xd2d070), root: srgb(0x5e8a3a), ears: true, stalks: 5 },
  3: { tall: 0.85, base: C.wheat, deep: C.wheatDeep, tip: C.wheatTip, root: C.wheatRoot, ears: true, stalks: 6 },
};
const STEP = 0.5, UP = new THREE.Vector3(0, 1, 0);
const SIDES: [number, number, number][] = [[1, 0, -1], [2, 1, 0], [4, 0, 1], [8, -1, 0]];

/** A set of crop tiles, painted into a few meshes: `add` each tile, then `addTo` a renderer. */
export class CropPatch {
  /** The crop's body: a painted mass over the soil. */
  private readonly mass = new MeshBuilder('crop');
  /** Stalks standing out of it, along its edges and through its top. */
  private readonly stalks = new MeshBuilder('grass');

  add(t: CropTile) {
    const side = t.side ?? 4, half = side / 2, joins = t.joins ?? 0, st = STANDS[t.stage];
    // How far inside the field a point is (m): to the nearest side the crop doesn't carry on past.
    const inside = (x: number, z: number) => {
      let d = Infinity;
      for (const [bit, dx, dz] of SIDES) if (!(joins & bit)) d = Math.min(d, dx ? half - dx * (x - t.x) : half - dz * (z - t.z));
      return d;
    };
    const tall = (x: number, z: number) => Math.max(0.02, st.tall * smooth(0, 0.7, inside(x, z)) * (1 + 0.08 * noise2(x * 0.5, z * 0.5)));
    const n = Math.round(side / STEP) + 1, i0 = this.mass.vertexCount, c = new THREE.Color();
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = t.x - half + i * STEP, z = t.z - half + j * STEP, e = 0.25;
      const nrm = new THREE.Vector3(tall(x - e, z) - tall(x + e, z), 2 * e, tall(x, z - e) - tall(x, z + e)).normalize();
      // Rows across the field (along x), banded in its deeper colour, sunlit tips in patches, the root's at its edges.
      const band = smooth(-0.35, 0.35, Math.sin(z * 1.7 * Math.PI) + 0.3 * noise2(x * 0.08, z * 0.3));
      c.copy(st.base).lerp(st.deep, band * 0.6).lerp(st.tip, smooth(0.5, 0.9, noise2(x * 0.06 + 9, z * 0.09)) * 0.3)
        .lerp(st.root, (1 - smooth(0.1, 0.8, inside(x, z))) * 0.35);
      this.mass.vertex({ x, y: t.y + tall(x, z), z }, nrm, c, [0.5, 1.3, 0, 0]);
    }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) { const a = i0 + j * n + i; this.mass.quad(a, a + n, a + n + 1, a + 1); }
    if (!st.stalks) return;
    // Stalks: thick along the field's edges, to break them, and a few through its top.
    const rand = rng(Math.imul(Math.round(t.x * 13), 0x9e3779b1) ^ Math.round(t.z * 17));
    const count = Math.round(st.stalks * side * side);
    for (let k = 0; k < count * 2; k++) {
      const x = t.x + (rand() - 0.5) * side, z = t.z + (rand() - 0.5) * side, d = inside(x, z);
      if (d < 0.05 || (d > 0.8 && rand() > 0.35)) continue;
      this.stalk(x, t.y, z, st.tall * (0.75 + smooth(0, 0.7, d) * 0.3 + rand() * 0.15), st, rand);
    }
  }

  /** One stalk, with an ear on it if the stage has them. */
  private stalk(x: number, y: number, z: number, h: number, st: Stand, rand: () => number) {
    const g = this.stalks, w = 0.026, lean = (rand() - 0.5) * 0.12, dir = rand() * Math.PI, seed = rand();
    const ox = Math.cos(dir) * w, oz = Math.sin(dir) * w, paint: Paint = [0.5, 1.4, 0.4, 0.8];
    const tip = new THREE.Vector3(x + lean, y + h, z + lean * 0.5);
    const gold = st.tip.clone().lerp(st.deep, rand() * 0.6), mid = st.root.clone().lerp(gold, 0.7);
    const a = g.vertex({ x: x - ox, y, z: z - oz }, UP, st.root, paint, [0, 0], [0, seed, -w, dir]);
    const b = g.vertex({ x: x + ox, y, z: z + oz }, UP, st.root, paint, [0, 0], [0, seed, w, dir]);
    const c = g.vertex({ x: tip.x + ox * 0.6, y: tip.y - 0.16, z: tip.z + oz * 0.6 }, UP, mid, paint, [0, 0], [0.8, seed, w * 0.6, dir]);
    const d = g.vertex({ x: tip.x - ox * 0.6, y: tip.y - 0.16, z: tip.z - oz * 0.6 }, UP, mid, paint, [0, 0], [0.8, seed, -w * 0.6, dir]);
    g.quad(a, b, c, d);
    if (!st.ears) return;
    const e1 = g.vertex({ x: tip.x - ox * 2.2, y: tip.y - 0.06, z: tip.z - oz * 2.2 }, UP, gold, paint, [0, 0], [0.9, seed, -w * 2.2, dir]);
    const e2 = g.vertex({ x: tip.x + ox * 2.2, y: tip.y - 0.06, z: tip.z + oz * 2.2 }, UP, gold, paint, [0, 0], [0.9, seed, w * 2.2, dir]);
    const e3 = g.vertex({ x: tip.x + lean * 0.3, y: tip.y + 0.12, z: tip.z }, UP, gold, paint, [0, 0], [1, seed]);
    g.tri(d, c, e2); g.tri(d, e2, e3); g.tri(d, e3, e1);
  }

  /** Adds the patch to a renderer; returns its meshes (to `remove` from it, and dispose of their geometry, when it goes). */
  addTo(r: Pick<BrushRenderer, 'add'>): THREE.Mesh[] {
    const out = [r.add(this.mass.build(), 'crop')];
    // The crop's own colour, not the season's (#13).
    if (this.stalks.vertexCount) out.push(r.add(this.stalks.build(), 'grass', { castShadow: false, seasonal: false }));
    return out;
  }
}
