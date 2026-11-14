import * as THREE from 'three';
import {
  type BrushRenderer, MeshBuilder, noise2, rng, srgb, PLAIN, type Paint, C, addTuft, groundOf, smooth, type Season, type Stream, type Obstacle,
  CROP_LOOKS, CROP_NAMES, CropPatch, dressFor, Grove, growSpecies, speciesTree, treeWind, type CropStage, type Species, type PineLook,
  type WillowLook,
} from '../../index';

// The plants (Soil-n-Silo#213): what the game grows, side by side, for looking at its looks in any season, hour and weather.
// - Two blocks of fields, one for each way of laying a crop (`rows` west, `blanket` east): a column for each of the five
//   crops (wheat, beans, tomato, sunflower, flax, west to east) and a row for each stage (just sown north to ripe south),
//   each field 2 × 2 of the game's 4 m tiles on its inked bed.
// - South of them, the trees in a row, west to east: oak, birch, the three pines (spire, cone, Scots), the two willows
//   (weeping, pollard), poplar, apple and a bush. Painted as the game paints them (its broader, looser strokes).

const SIZE = 160, STEP = 0.5, TILE = 4, FIELD = 2 * TILE, GAP = 3;
const BLOCK = CROP_NAMES.length * (FIELD + GAP) - GAP;
/** The west edge of each look's block, and the north edge of both. */
const BLOCK_X = [-BLOCK - 4, 4], BLOCK_Z = -36;
const TREE_Z = 14, TREE_GAP = 10;
const TREES: { species: Species; pine?: PineLook; willow?: WillowLook }[] = [
  { species: 'oak' }, { species: 'birch' }, { species: 'pine', pine: 'spire' }, { species: 'pine', pine: 'cone' }, { species: 'pine', pine: 'scots' },
  { species: 'willow', willow: 'weeping' }, { species: 'willow', willow: 'pollard' }, { species: 'poplar' }, { species: 'apple' }, { species: 'bush' },
];
/** The game's strokes (src/world/brush/wild.ts): broader and looser than the demo's own trees. */
const STROKE = 1.8, FILL = 0.55;
const BED = 0.3, BED_COLOUR = srgb(0x8a7a62);

/** Where field (crop c, stage g) of a look's block stands: its north-west corner. */
const fieldAt = (look: number, c: number, g: number) => ({ x: BLOCK_X[look] + c * (FIELD + GAP), z: BLOCK_Z + g * (FIELD + GAP) });
const inField = (x: number, z: number) => {
  for (let look = 0; look < 2; look++) for (let c = 0; c < CROP_NAMES.length; c++) for (let g = 0; g < 4; g++) {
    const f = fieldAt(look, c, g);
    if (x > f.x - 0.6 && x < f.x + FIELD + 0.6 && z > f.z - 0.6 && z < f.z + FIELD + 0.6) return true;
  }
  return false;
};

const height = (x: number, z: number) => 0.15 * noise2(x * 0.03, z * 0.03);
const ground = groundOf(height);
const STREAM: Stream = { level: -3, grid: { nx: 8, nz: 8, cell: SIZE / 8, x0: -SIZE / 2, z0: -SIZE / 2 }, channel: () => false, along: () => [0, 0] };

export interface Plants {
  center: THREE.Vector3; radius: number; stream: Stream; wind: Obstacle[];
  height: (x: number, z: number) => number; bare: (x: number, z: number) => number;
}

export function buildPlants(r: BrushRenderer, season: Season): Plants {
  const b = new MeshBuilder('paint');
  const n = Math.round(SIZE / STEP) + 1, half = SIZE / 2, c = new THREE.Color();
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x = -half + i * STEP, z = -half + j * STEP, m = noise2(x * 0.07 + 11, z * 0.07 - 4) * 0.5 + 0.5;
    c.copy(C.meadow).lerp(C.lime, smooth(0.55, 0.9, m) * 0.5).lerp(C.emerald, smooth(0.6, 0.95, 1 - m) * 0.5);
    const paint: Paint = [0.2, 2.0, 0.7 + noise2(x * 0.05, z * 0.05) * 0.9, 0];
    b.vertex({ x, y: height(x, z), z }, ground.normal(x, z), c, paint);
  }
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i; b.quad(a, a + n, a + n + 1, a + 1); }
  r.add(b.build(), 'ground', { under: true, fields: { x: 0, z: 0, side: SIZE, turn: 0 } });

  const g = new MeshBuilder('grass'), rand = rng(213);
  for (let k = 0; k < 6000; k++) {
    const x = (rand() * 2 - 1) * half, z = (rand() * 2 - 1) * half;
    if (inField(x, z) || rand() > 0.3 + 0.7 * smooth(0.4, 0.8, noise2(x * 0.09 + 40, z * 0.09) * 0.5 + 0.5)) continue;
    addTuft(g, ground, x, z, 0.2 + rand() * 0.2, C.meadow.clone().lerp(C.lime, rand() * 0.5), rand);
  }
  r.add(g.build(), 'grass', { castShadow: false });

  // The fields: each on its inked bed, as the game's (things.ts), its crop painted over it.
  const beds = new MeshBuilder('ink');
  CROP_LOOKS.forEach((look, l) => {
    const patch = new CropPatch(look);
    CROP_NAMES.forEach((crop, ci) => {
      for (let st = 0; st < 4; st++) {
        const f = fieldAt(l, ci, st), y = height(f.x + FIELD / 2, f.z + FIELD / 2) + BED;
        const box = new THREE.BoxGeometry(FIELD - 0.6, BED + 0.4, FIELD - 0.6).translate(f.x + FIELD / 2, y - (BED + 0.4) / 2, f.z + FIELD / 2);
        beds.addGeometry(box, new THREE.Matrix4(), BED_COLOUR, PLAIN);
        box.dispose();
        for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
          const joins = (j > 0 ? 1 : 0) | (i < 1 ? 2 : 0) | (j < 1 ? 4 : 0) | (i > 0 ? 8 : 0);
          patch.add({ x: f.x + (i + 0.5) * TILE, y, z: f.z + (j + 0.5) * TILE, crop, stage: st as CropStage, joins, side: TILE });
        }
      }
    });
    patch.addTo(r);
  });
  r.add(beds.build(), 'ink');

  // The trees, in the season's dress.
  const grove = new Grove(dressFor(season, () => true)), wind: Obstacle[] = [];
  TREES.forEach((t, i) => {
    const x = (i - (TREES.length - 1) / 2) * TREE_GAP, seed = 1000 + i * 77;
    const tree = { ...speciesTree(t.species, x, TREE_Z, 1, seed), stroke: STROKE, fill: FILL };
    growSpecies(grove, ground, t.species, tree, rng(seed), { pine: t.pine ?? 'spire', willow: t.willow ?? 'weeping' });
    wind.push(treeWind(tree));
  });
  grove.addTo(r);
  return { center: new THREE.Vector3(0, 0, 0), radius: half * Math.SQRT2, stream: STREAM, wind, height, bare: () => 0 };
}
