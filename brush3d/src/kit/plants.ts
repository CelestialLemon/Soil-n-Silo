import * as THREE from 'three';
import { MeshBuilder, noise2, rng, srgb, type Paint } from './builder';
import { C, addDab, smooth, type Ground, type Tree, type TreeForm } from './kit';
import { CRISP_EDGE, STIFF_STROKE } from '../renderer/materials';
import { TREE_BEND, type TreeKind, type TreeSpec } from '../renderer/trees';
import type { Season } from '../renderer/season';
import type { BrushRenderer } from '../renderer/renderer';
import type { Grove } from './seasonTrees';

// What the game grows, in its own words (docs/API.md, "What grows"; Soil-n-Silo#213): its five crops at their four stages,
// and its six tree species and the bushes. The game says which crop, which stage, which species; how each looks is the
// renderer's.
//
// Each crop has its own colours, height, flowers and fruit at each stage, laid as one soft blanket over its bed. Oak, birch,
// apple and the bushes are the kit's trees (growTree, seasonTrees.ts); pine, willow and poplar have shapes of their own
// (growSpecies): the pine a soft cone, the willow weeping. The developer picked these on #213's look PR (Soil-n-Silo#227),
// "for now": the crops' lay and the pine may be revisited. The candidates not picked (crops in rows of soil; the pine as a
// tiered spire or a Scots pine; a pollarded willow) are in the history of Soil-n-Silo#227 if they are.

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
/** Each species: its tree for the kit (pine's, willow's and poplar's own shapes are growSpecies's), and its colours from afar. */
const LOOKS: Record<Species, SpeciesLook> = {
  oak: { kind: 'broadleaf', leaf: srgb(0x3f7f44), scale: 1.5,
    far: { spring: srgb(0x76a84e), summer: srgb(0x467348), autumn: srgb(0xd98a32), winter: FAR_BARE } },
  birch: { kind: 'broadleaf', leaf: srgb(0x86b850), scale: 1.25,
    far: { spring: srgb(0x91bc61), summer: srgb(0x9cc068), autumn: srgb(0xe3b43c), winter: srgb(0x8c6c66) } },
  pine: { kind: 'cypress', leaf: srgb(0x2b5e4c), scale: 1.4,
    far: { spring: srgb(0x28564f), summer: srgb(0x28564f), autumn: srgb(0x28564f), winter: srgb(0x28564f) } },
  willow: { kind: 'broadleaf', form: 'willow', leaf: srgb(0x6f9c48), scale: 1.25,
    far: { spring: srgb(0x91bc61), summer: srgb(0x83b390), autumn: srgb(0xcdb04a), winter: srgb(0xb48d42) } },
  poplar: { kind: 'cypress', leaf: srgb(0x3f7a44), scale: 1.6,
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
export const speciesHeight = (species: Species) => LOOKS[species].scale * TALL[species];
const TALL: Record<Species, number> = { oak: 4.2, birch: 4.2, pine: 6.4, willow: 4.6, poplar: 7.2, apple: 4.2, bush: 1.4 };

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

/** Flowers, fruit or pods: dabs of a colour over the crop's top, `per` a square metre, `size` each dab's half-width (m). */
interface Bloom { color: THREE.Color; per: number; size: number; /** Width over length: 1 round, less a pod. */ shape?: number; /** How far below the top (m). */ sink?: number }
/** A sunflower's heads on their stems: `size` the head's half-width (m), `per` a square metre. */
interface Heads { petals: THREE.Color; eye: THREE.Color; size: number; per: number }
/** A crop at one stage. */
interface Stand {
  /** How tall it stands (m). */
  tall: number;
  /** The mass's colours: its own, its shade in the bands across it, its sunlit tips, and its foot at the field's edge. */
  base: THREE.Color; deep: THREE.Color; tip: THREE.Color; root: THREE.Color;
  /** Grassy stalks a square metre (wheat's and flax's), with ears on them (wheat's). */
  stalks?: number; ears?: boolean;
  /** Leafy plants (the broad-leaved crops'), the blanket scattering six-tenths this many a square metre, each a few leaf strokes over the mass, and their size. */
  plants?: number; leaf?: number;
  blooms?: Bloom[];
  heads?: Heads;
}

const WHEAT: Stand[] = [
  { tall: 0.1, base: srgb(0x8cb850), deep: srgb(0x6a9a44), tip: srgb(0xb0cc68), root: srgb(0x6a5a3a) },
  { tall: 0.35, base: srgb(0x7cb04a), deep: srgb(0x5a9442), tip: srgb(0xa8c860), root: srgb(0x4e7e38), stalks: 3 },
  { tall: 0.7, base: srgb(0x9cbc4a), deep: srgb(0x6e9a3e), tip: srgb(0xd2d070), root: srgb(0x5e8a3a), stalks: 5, ears: true },
  { tall: 0.85, base: C.wheat, deep: C.wheatDeep, tip: C.wheatTip, root: C.wheatRoot, stalks: 6, ears: true },
];
const BEAN = { base: srgb(0x4f8a3c), deep: srgb(0x30602a), tip: srgb(0x86b44e), root: srgb(0x3e5a2a) };
const BEANS: Stand[] = [
  { tall: 0.12, ...BEAN, base: srgb(0x6aa044), plants: 3, leaf: 0.09 },
  { tall: 0.4, ...BEAN, plants: 3, leaf: 0.16 },
  // Climbing their poles, in flower: white and lilac.
  { tall: 1.4, ...BEAN, plants: 3, leaf: 0.2,
    blooms: [{ color: srgb(0xf2ecf6), per: 5, size: 0.085 }, { color: srgb(0xc6a0e0), per: 3, size: 0.08 }] },
  // Hung with pods, the last flowers going over.
  { tall: 1.55, ...BEAN, base: srgb(0x4a8238), plants: 3, leaf: 0.2,
    blooms: [{ color: srgb(0x8cb43c), per: 9, size: 0.1, shape: 0.35, sink: 0.25 }, { color: srgb(0xf2ecf6), per: 1.5, size: 0.075 }] },
];
const TOMATO = { base: srgb(0x4e8a3a), deep: srgb(0x2c5a28), tip: srgb(0x8ab452), root: srgb(0x3c5628) };
const TOMATOES: Stand[] = [
  { tall: 0.12, ...TOMATO, base: srgb(0x66a046), plants: 1.6, leaf: 0.1 },
  { tall: 0.45, ...TOMATO, plants: 1.6, leaf: 0.2 },
  // Staked and leafy, in yellow flower.
  { tall: 0.85, ...TOMATO, plants: 1.6, leaf: 0.26, blooms: [{ color: srgb(0xf4d23c), per: 7, size: 0.075 }] },
  // Red fruit, a few still green, a last flower or two.
  { tall: 0.95, ...TOMATO, plants: 1.6, leaf: 0.26,
    blooms: [{ color: srgb(0xd8402a), per: 7, size: 0.11, sink: 0.12 }, { color: srgb(0xe0702e), per: 2, size: 0.1, sink: 0.15 }, { color: srgb(0xf4d23c), per: 1.5, size: 0.07 }] },
];
const SUN = { base: srgb(0x5a8f34), deep: srgb(0x35642a), tip: srgb(0x94bc4a), root: srgb(0x45602c) };
const SUNFLOWERS: Stand[] = [
  { tall: 0.15, ...SUN, base: srgb(0x70a444), plants: 2.2, leaf: 0.1 },
  { tall: 0.6, ...SUN, plants: 2.2, leaf: 0.22 },
  // Tall, the heads opening.
  { tall: 1.35, ...SUN, plants: 2.2, leaf: 0.26, heads: { petals: srgb(0xf2c41a), eye: srgb(0x6a5a24), size: 0.13, per: 2.2 } },
  // Full heads, dark-eyed.
  { tall: 1.6, ...SUN, plants: 2.2, leaf: 0.28, heads: { petals: srgb(0xf6c414), eye: srgb(0x4a3018), size: 0.2, per: 2.2 } },
];
const FLAX = { base: srgb(0x6e9e64), deep: srgb(0x4c7a52), tip: srgb(0x9cc086), root: srgb(0x52683c) };
const FLAXES: Stand[] = [
  { tall: 0.08, ...FLAX, base: srgb(0x86b060) },
  { tall: 0.3, ...FLAX, stalks: 3 },
  // A haze of sky-blue flowers.
  { tall: 0.55, ...FLAX, stalks: 4, blooms: [{ color: srgb(0x86aee6), per: 26, size: 0.06 }, { color: srgb(0xb0ccf0), per: 8, size: 0.05 }] },
  // The seed bolls browning, flowers still among them.
  { tall: 0.65, ...FLAX, base: srgb(0x8a9e5a), tip: srgb(0xc4b46a), stalks: 4,
    blooms: [{ color: srgb(0x86aee6), per: 14, size: 0.06 }, { color: srgb(0xb89a5a), per: 12, size: 0.05 }] },
];
const STANDS: Record<CropName, Stand[]> = { wheat: WHEAT, beans: BEANS, tomato: TOMATOES, sunflower: SUNFLOWERS, flax: FLAXES };

const UP = new THREE.Vector3(0, 1, 0);
const SIDES: [number, number, number][] = [[1, 0, -1], [2, 1, 0], [4, 0, 1], [8, -1, 0]];
const LEAF_PAINT: Paint = [0.5 + CRISP_EDGE, 0.7, -1, 0.5];
const BLOOM_PAINT: Paint = [0.2 + CRISP_EDGE, 1, -1, 0.3];

/** A set of crop tiles, painted into a few meshes: `add` each tile, then `addTo` a renderer. */
export class CropPatch {
  /** The crop's body: a painted mass over the soil. */
  private readonly mass = new MeshBuilder('crop');
  /** Stalks standing out of it, along its edges and through its top, and the sunflowers' stems. */
  private readonly stalks = new MeshBuilder('grass');
  /** Leaves, flowers, fruit and heads over it. */
  private readonly dabs = new MeshBuilder('foliage');

  add(t: CropTile) {
    const side = t.side ?? 4, half = side / 2, joins = t.joins ?? 0, st = STANDS[t.crop][t.stage];
    // How far inside the field a point is (m): to the nearest side the crop doesn't carry on past.
    const inside = (x: number, z: number) => {
      let d = Infinity;
      for (const [bit, dx, dz] of SIDES) if (!(joins & bit)) d = Math.min(d, dx ? half - dx * (x - t.x) : half - dz * (z - t.z));
      return d;
    };
    // How tall the crop stands at a point: its full height, falling to the soil at the sides it doesn't carry on past.
    const tall = (x: number, z: number) => Math.max(0.02, st.tall * smooth(0, 0.7, inside(x, z)) * (1 + 0.08 * noise2(x * 0.5, z * 0.5)));
    const grid = Math.max(2, Math.round(side / 0.5) + 1), step = side / (grid - 1), i0 = this.mass.vertexCount, c = new THREE.Color();
    for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
      const x = t.x - half + i * step, z = t.z - half + j * step, e = 0.12;
      const nrm = new THREE.Vector3(tall(x - e, z) - tall(x + e, z), 2 * e, tall(x, z - e) - tall(x, z + e)).normalize();
      // Banded across the field (along x) in its deeper colour, sunlit tips in patches, the root's at its edges.
      const band = smooth(-0.35, 0.35, Math.sin(z * 1.7 * Math.PI) + 0.3 * noise2(x * 0.08, z * 0.3));
      c.copy(st.base).lerp(st.deep, band * 0.6).lerp(st.tip, smooth(0.5, 0.9, noise2(x * 0.06 + 9, z * 0.09)) * 0.3)
        .lerp(st.root, (1 - smooth(0.1, 0.8, inside(x, z))) * 0.35);
      this.mass.vertex({ x, y: t.y + tall(x, z), z }, nrm, c, [0.5, 1.3, 0, 0]);
    }
    for (let j = 0; j < grid - 1; j++) for (let i = 0; i < grid - 1; i++) { const a = i0 + j * grid + i; this.mass.quad(a, a + grid, a + grid + 1, a + 1); }

    const rand = rng(Math.imul(Math.round(t.x * 13), 0x9e3779b1) ^ Math.round(t.z * 17));
    // A place anywhere on the crop, and how far inside the field it is.
    const spot = () => {
      const x = t.x + (rand() - 0.5) * side, z = t.z + (rand() - 0.5) * side;
      return { x, z, d: inside(x, z) };
    };
    const area = side * side;
    // Stalks: thick along the field's edges, to break them, and a few through its top.
    if (st.stalks) {
      for (let k = 0, n = Math.round(st.stalks * area * 2); k < n; k++) {
        const { x, z, d } = spot();
        if (d < 0.05 || (d > 0.8 && rand() > 0.35)) continue;
        this.stalk(x, t.y, z, tall(x, z) + st.tall * (0.05 + rand() * 0.15), st, rand, st.ears ?? false);
      }
    }
    // The broad-leaved crops' plants: each a few leaf strokes over its own top, so the crop reads as plants.
    if (st.plants && st.leaf) {
      for (let k = 0, n = Math.round(st.plants * area * 0.6); k < n; k++) {
        const { x, z, d } = spot();
        if (d < 0.1) continue;
        const top = t.y + tall(x, z);
        for (let l = 0; l < 3; l++) {
          const dir = new THREE.Vector3(rand() - 0.5, 0.9, rand() - 0.5).normalize();
          const p = new THREE.Vector3(x + dir.x * st.leaf, top - st.leaf * (0.2 + rand() * 0.5), z + dir.z * st.leaf);
          const lit = smooth(0, 1, dir.y + (rand() - 0.5) * 0.4);
          const col = st.base.clone().lerp(st.tip, lit * 0.5).lerp(st.deep, (1 - lit) * 0.4).offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.05);
          addDab(this.dabs, p, dir, col, st.leaf * (0.8 + rand() * 0.4), rand(), LEAF_PAINT);
        }
      }
    }
    for (const bl of st.blooms ?? []) {
      for (let k = 0, n = Math.round(bl.per * area); k < n; k++) {
        const { x, z, d } = spot();
        if (d < 0.15) continue;
        const y = t.y + tall(x, z) - (bl.sink ?? 0) * rand() + bl.size * 0.4;
        addDab(this.dabs, new THREE.Vector3(x, y, z), UP, bl.color.clone().offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.07),
          bl.size * (0.8 + rand() * 0.4), rand(), bl.shape ? [BLOOM_PAINT[0], bl.shape, Math.PI / 2 + (rand() - 0.5) * 0.4, 0.3] : BLOOM_PAINT);
      }
    }
    if (st.heads) {
      const h = st.heads;
      for (let k = 0, n = Math.round(h.per * area * 0.5); k < n; k++) {
        const { x, z, d } = spot();
        if (d < 0.2) continue;
        const y = t.y + st.tall * smooth(0, 0.7, d) * (0.95 + rand() * 0.15);
        this.stalk(x, t.y + tall(x, z) * 0.7, z, y - t.y - tall(x, z) * 0.7, st, rand, false);
        // The head faces the morning sun, east and up a little: its petals, then its eye a little before them.
        const p = new THREE.Vector3(x, y, z), face = new THREE.Vector3(0.6, 0.5, 0.3).normalize();
        addDab(this.dabs, p, face, h.petals.clone().offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.06), h.size * (0.85 + rand() * 0.3), rand(), [0.2 + CRISP_EDGE, 1, -1, 0.4]);
        addDab(this.dabs, p.clone().addScaledVector(face, h.size * 0.5), face, h.eye, h.size * 0.42, rand(), [0.1 + CRISP_EDGE, 1, -1, 0.1]);
      }
    }
  }

  /** One stalk, from y up `h`, with an ear on it if asked. */
  private stalk(x: number, y: number, z: number, h: number, st: Stand, rand: () => number, ear: boolean) {
    const g = this.stalks, w = 0.026, lean = (rand() - 0.5) * 0.12, dir = rand() * Math.PI, seed = rand();
    const ox = Math.cos(dir) * w, oz = Math.sin(dir) * w, paint: Paint = [0.5, 1.4, 0.4, 0.8];
    const tip = new THREE.Vector3(x + lean, y + h, z + lean * 0.5);
    const gold = st.tip.clone().lerp(st.deep, rand() * 0.6), mid = st.root.clone().lerp(gold, 0.7);
    const a = g.vertex({ x: x - ox, y, z: z - oz }, UP, st.root, paint, [0, 0], [0, seed, -w, dir]);
    const b = g.vertex({ x: x + ox, y, z: z + oz }, UP, st.root, paint, [0, 0], [0, seed, w, dir]);
    const c = g.vertex({ x: tip.x + ox * 0.6, y: tip.y - 0.16, z: tip.z + oz * 0.6 }, UP, mid, paint, [0, 0], [0.8, seed, w * 0.6, dir]);
    const d = g.vertex({ x: tip.x - ox * 0.6, y: tip.y - 0.16, z: tip.z - oz * 0.6 }, UP, mid, paint, [0, 0], [0.8, seed, -w * 0.6, dir]);
    g.quad(a, b, c, d);
    if (!ear) return;
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
    if (this.dabs.vertexCount) out.push(r.add(this.dabs.build(), 'foliage', { castShadow: false, cover: 'none' }));
    return out;
  }
}

// ---- Pine, willow and poplar: shapes of their own (#213's look) ----

type V3 = THREE.Vector3;
const BARK: Paint = [0.4, 2.5, 1.57, 0];
const randomDir = (r: () => number) => {
  const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
  return new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
};

/** A length of trunk or bough, from `a` to `b`, in rings so it bends in the wind. */
function bough(wood: MeshBuilder, a: V3, b: V3, ra: number, rb: number, col: THREE.Color) {
  const g = new THREE.CylinderGeometry(rb, ra, a.distanceTo(b), 7, 4);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, b.clone().sub(a).normalize());
  wood.addGeometry(g, new THREE.Matrix4().compose(a.clone().lerp(b, 0.5), q, new THREE.Vector3(1, 1, 1)), col, BARK);
  g.dispose();
}

/** A stroke's colour from where it sits, as on the kit's crowns: lighter and warmer turning up, darker deep inside. */
function shade(c: THREE.Color, nrm: V3, inner: number, r: () => number) {
  const up = smooth(-0.1, 0.9, nrm.y), hue = c.getHSL({ h: 0, s: 0, l: 0 }).h, warm = hue > 0.17 && hue < 0.55 ? -0.03 : 0.02;
  return c.clone().offsetHSL(warm * up, 0.05 * up, 0.09 * up).multiplyScalar(1 - inner * 0.42)
    .offsetHSL((r() - 0.5) * 0.012, (r() - 0.5) * 0.04, (r() - 0.5) * 0.03);
}

/** Makes what was just painted move in the wind as one tree, as the kit's trees do (see TreeSprings). */
function sway(parts: [MeshBuilder, number][], t: Tree, kind: TreeKind, y0: number, crownBase: number) {
  const s = t.scale ?? 1, ys = parts.flatMap(([b, from]) => b.heightsSince(from));
  const height = Math.max(...ys, y0 + s) - y0, bend = TREE_BEND[kind], crown = Math.max(crownBase, height * 0.2);
  const share = (y: number) => { const h = Math.max(y - y0, 0); return Math.min(h / crown, 1) ** 2 * (1 - bend) + Math.min(h / height, 1) ** 2 * bend; };
  const spec: TreeSpec = { x: t.x, z: t.z, height, kind, scale: s };
  for (const [b, from] of parts) if (b.vertexCount > from) b.markTree(from, spec, share);
}

/**
 * How many strokes of half-width `size` cover `area` square metres of a crown's skin `deep` times over, as thickly as the
 * kit's crowns lie (about seven deep), fewer at a looser `fill` (the tree's).
 */
const strokes = (area: number, size: number, t: Tree, deep = 7) => Math.round(deep * area / (4 * size * size) * (0.4 + 0.6 * (t.fill ?? 1)));

/**
 * Grows a tree of a species into a grove, in the grove's season: pine, willow and poplar in shapes of their own, the rest
 * as the kit grows them.
 */
export function growSpecies(grove: Grove, ground: Ground, species: Species, t: Tree, rand: () => number) {
  if (species === 'pine') pine(grove, ground, t, rand);
  else if (species === 'willow') willow(grove, ground, t, rand);
  else if (species === 'poplar') poplar(grove, ground, t, rand);
  else grove.grow(ground, t, rand);
}

const NEEDLES = srgb(0x2b5e4c);

/**
 * A pine: one soft cone of needles from near the ground to a point, its skin in tufts so the edge is ragged, not ruled.
 * Evergreen, the same in every season (a step fresher at its tips in spring).
 */
function pine(grove: Grove, ground: Ground, t: Tree, r: () => number) {
  const s = t.scale ?? 1, y0 = ground.height(t.x, t.z) - 0.05, base = new THREE.Vector3(t.x, y0, t.z);
  const { wood, leaves } = grove, wood0 = wood.vertexCount, leaves0 = leaves.vertexCount;
  const dabScale = Math.pow(s, 0.45) * (t.stroke ?? 1), green = t.leaf ?? NEEDLES;
  const tint = (nrm: V3, inner: number) => {
    const c = shade(green, nrm, inner, r);
    return grove.season === 'spring' && nrm.y > 0.4 && r() < 0.3 ? c.lerp(srgb(0x6f9a50), 0.35) : c;
  };
  const H = 6.4 * s, sq = Math.sqrt(s);
  bough(wood, base, base.clone().add(new THREE.Vector3(0, H * 0.9, 0)), 0.17 * sq, 0.04 * sq, C.bark);
  const foot = 0.08 * H, R = 1.75 * s, tufts = 6 + Math.floor(r() * 3), turn = r() * Math.PI * 2;
  const radius = (f: number) => R * Math.pow(1 - f, 1.05) + 0.08 * s;
  const size = 0.24 * dabScale, n = strokes(Math.PI * R * Math.hypot(R, H), size, t);
  for (let i = 0; i < n; i++) {
    const f = 1 - Math.sqrt(r()), phi = r() * Math.PI * 2, inner = r() < 0.18 ? 0.55 + r() * 0.3 : 0;
    const tuft = 0.84 + 0.22 * Math.max(0, Math.cos((phi - turn) * tufts * 0.5)) ** 2 + (r() - 0.5) * 0.08;
    const rr = radius(f) * tuft * (1 - inner * 0.6);
    const p = base.clone().add(new THREE.Vector3(Math.cos(phi) * rr, foot + f * (H - foot) - 0.25 * s * (rr / R), Math.sin(phi) * rr));
    const nrm = new THREE.Vector3(Math.cos(phi), 0.45 + f * 0.4, Math.sin(phi)).normalize();
    addDab(leaves, p, nrm, tint(nrm, inner), size * (inner ? 1.5 : 0.75 + r() * 0.5), r(), [0.65, 0.5, -1, 0.4]);
  }
  sway([[wood, wood0], [leaves, leaves0]], t, 'cypress', y0, foot);
}

/** The willow's leaves, by season: fresh in spring, soft grey-green in summer, yellow in autumn; its bare whips' in winter. */
function willowLeaf(t: Tree, season: Season, r: () => number) {
  const green = t.leaf ?? srgb(0x6f9c48);
  if (season === 'spring') return green.clone().lerp(srgb(0xb4d46a), 0.55);
  if (season === 'autumn') return green.clone().lerp(srgb(0xd8bc3c), 0.6 + r() * 0.3);
  return green.clone();
}

/** A weeping willow by the water: its leaves (or, in winter, its bare golden whips) on long hanging strands. */
function willow(grove: Grove, ground: Ground, t: Tree, r: () => number) {
  const s = t.scale ?? 1, y0 = ground.height(t.x, t.z) - 0.05, base = new THREE.Vector3(t.x, y0, t.z), sq = Math.sqrt(s);
  const { wood, leaves, twigs } = grove, wood0 = wood.vertexCount, leaves0 = leaves.vertexCount, twigs0 = twigs.vertexCount;
  const dabScale = Math.pow(s, 0.45) * (t.stroke ?? 1), winter = grove.season === 'winter';
  // In winter the whips are bare: thin, stiff and gold, in the twigs (no cover, no shadow), facing up more than out so the
  // side away from the sun stays gold rather than going to dark dashes; otherwise leafy strokes.
  const strand = winter ? twigs : leaves;
  const whip = (p: V3, nrm: V3, c: THREE.Color, size: number, angle: number) => winter
    ? addDab(strand, p, nrm.clone().setY(nrm.y + 1.4).normalize(), c, size * 0.75, r(), [0.4 + STIFF_STROKE + CRISP_EDGE, 0.16, angle, 0.3])
    : addDab(strand, p, nrm, c, size, r(), [0.6, 0.3, angle, 0.5]);
  const leaf = willowLeaf(t, grove.season, r);
  // A short leaning trunk, boughs arching up and out, a dome over them, and curtains hung from its rim.
  const fork = base.clone().add(new THREE.Vector3((r() - 0.5) * 0.4 * s, 1.3 * s, (r() - 0.5) * 0.4 * s));
  bough(wood, base, fork, 0.28 * sq, 0.2 * sq, C.bark);
  const c = fork.clone().add(new THREE.Vector3(0, 1.75 * s, 0)), R = 2.3 * s, rise = 1.25 * s;
  const nb = 4 + Math.floor(r() * 2), a0 = r() * Math.PI * 2;
  for (let i = 0; i < nb; i++) {
    const a = a0 + (i / nb) * Math.PI * 2 + (r() - 0.5) * 0.6;
    const end = c.clone().add(new THREE.Vector3(Math.cos(a) * R * 0.75, rise * 0.35, Math.sin(a) * R * 0.75));
    bough(wood, fork, fork.clone().lerp(end, 0.55).add(new THREE.Vector3(0, 0.5 * s, 0)), 0.12 * sq, 0.08 * sq, C.bark);
    bough(wood, fork.clone().lerp(end, 0.55).add(new THREE.Vector3(0, 0.5 * s, 0)), end, 0.08 * sq, 0.035 * sq, C.bark);
  }
  if (!winter) {
    // The dome: its upper half, in soft strokes.
    const size = 0.27 * dabScale, n = strokes(2 * Math.PI * R * R * 0.8, size, t);
    for (let i = 0; i < n; i++) {
      const dir = randomDir(r);
      if (dir.y < -0.15) dir.y = -dir.y * 0.4;
      const inner = r() < 0.2 ? 0.6 : 0, p = c.clone().add(new THREE.Vector3(dir.x * R, dir.y * rise, dir.z * R).multiplyScalar(inner ? 0.6 : 0.9 + r() * 0.15));
      addDab(leaves, p, dir, shade(leaf, dir, inner, r), size * (inner ? 1.4 : 0.8 + r() * 0.4), r(), [0.6, 0.55, -1, 0.5]);
    }
  }
  // The curtains: strands round the rim, falling nearly to the ground, bowing out a little; an inner ring darker.
  const gold = srgb(0xc8a040), spacing = (winter ? 0.2 : 0.22) * dabScale, around = Math.round(2 * Math.PI * R / spacing * (t.fill ?? 1));
  for (let i = 0; i < around * 1.3; i++) {
    const a = r() * Math.PI * 2, back = i >= around, rr = R * (back ? 0.7 : 0.9 + r() * 0.15);
    const top = c.y + rise * (0.05 + r() * 0.3) - (back ? 0.2 * s : 0), foot = y0 + (0.35 + r() * 0.7) * s;
    const step = (winter ? 0.24 : 0.3) * dabScale, m = Math.max(2, Math.round((top - foot) / step));
    for (let k = 0; k <= m; k++) {
      const f = k / m, out = rr + 0.3 * s * f * f, p = new THREE.Vector3(t.x + Math.cos(a) * out, top - f * (top - foot), t.z + Math.sin(a) * out);
      const nrm = new THREE.Vector3(Math.cos(a), 0.25 - 0.5 * f, Math.sin(a)).normalize();
      if (winter) whip(p, nrm, gold.clone().offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.08 - f * 0.05), 0.15 * dabScale, Math.PI / 2);
      else whip(p, nrm, shade(leaf, nrm, back ? 0.55 : f * 0.25, r), 0.2 * dabScale, Math.PI / 2 + (r() - 0.5) * 0.2);
    }
  }
  sway([[wood, wood0], [leaves, leaves0], [twigs, twigs0]], t, 'broadleaf', y0, 1.3 * s);
}

/** A Lombardy poplar: one tall narrow column of upswept strokes; fresh in spring, gold in autumn, a bare broom in winter. */
function poplar(grove: Grove, ground: Ground, t: Tree, r: () => number) {
  const s = t.scale ?? 1, y0 = ground.height(t.x, t.z) - 0.05, base = new THREE.Vector3(t.x, y0, t.z), sq = Math.sqrt(s);
  const { wood, leaves, twigs } = grove, wood0 = wood.vertexCount, leaves0 = leaves.vertexCount, twigs0 = twigs.vertexCount;
  const dabScale = Math.pow(s, 0.45) * (t.stroke ?? 1), season = grove.season, H = 7.2 * s, foot = 0.07 * H;
  bough(wood, base, base.clone().add(new THREE.Vector3(0, H * 0.88, 0)), 0.18 * sq, 0.04 * sq, C.bark);
  const radius = (f: number) => (0.22 + 0.6 * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + f * 0.92)), 0.7) * (1 - 0.4 * f)) * s;
  const green = t.leaf ?? srgb(0x3f7a44);
  const pace = (Math.imul(Math.round(t.x * 97), 0x9e3779b1) >>> 0) / 4294967296;
  const colour = season === 'spring' ? green.clone().lerp(srgb(0x9ccc5e), 0.6) : season === 'autumn' ? green.clone().lerp(srgb(0xe6b83a), 0.65 + pace * 0.35) : green;
  const winter = season === 'winter', b = winter ? twigs : leaves;
  const size = (winter ? 0.15 : 0.22) * dabScale, area = 2 * Math.PI * 0.6 * s * (H - foot);
  for (let i = 0, n = strokes(area, size, t, winter ? 3 : 7); i < n; i++) {
    const f = r(), phi = r() * Math.PI * 2, inner = winter ? 0 : r() < 0.18 ? 0.55 + r() * 0.3 : 0;
    const rr = radius(f) * (inner ? 0.5 : 0.85 + r() * 0.25);
    const p = base.clone().add(new THREE.Vector3(Math.cos(phi) * rr, foot + f * (H - foot), Math.sin(phi) * rr));
    const nrm = new THREE.Vector3(Math.cos(phi), winter ? 1.4 : 0.3 + f * 0.6, Math.sin(phi)).normalize();
    if (winter) addDab(b, p, nrm, C.bark.clone().lerp(srgb(0x4b3648), 0.3 + r() * 0.4).offsetHSL(0, 0, (r() - 0.5) * 0.05), size, r(), [0.4 + STIFF_STROKE + CRISP_EDGE, 0.14, Math.PI / 2 + (r() - 0.5) * 0.3, 0.2]);
    else addDab(b, p, nrm, shade(colour, nrm, inner, r), size * (inner ? 1.4 : 0.8 + r() * 0.4), r(), [0.6, 0.38, Math.PI / 2 + (r() - 0.5) * 0.35, 0.45]);
  }
  sway([[wood, wood0], [leaves, leaves0], [twigs, twigs0]], t, 'cypress', y0, foot);
}
