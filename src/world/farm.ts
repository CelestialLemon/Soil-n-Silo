import * as THREE from 'three';
import { FLAG, GeometryCollector, linearColor as lin, place, type PixelScene } from 'pixel3d-renderer';

// A placeholder farm, drawn from a character map, to prove the renderer and the camera before the real layout is decided
// (design doc, open question "Farm layout"). Each character is one 1 m tile; tile (col, row) covers x in [col, col + 1]
// and z in [row, row + 1].
//   .  grass    =  tilled soil    #  fence    T  tree    C  coop    B  shipping bin    @  where the camera starts
const MAP = [
  '##########################',
  '#T.......................#',
  '#..CCC.......====....T...#',
  '#..CCC.......====........#',
  '#..CCC.......====........#',
  '#............====..B.....#',
  '#........@...............#',
  '#.T......................#',
  '#................=====...#',
  '#......T.........=====...#',
  '#................=====..T#',
  '##########################',
];
export const WIDTH = MAP[0].length, DEPTH = MAP.length;

const BOX = new THREE.BoxGeometry(1, 1, 1);
export const box = (c: GeometryCollector, x: number, y: number, z: number, w: number, h: number, d: number, hex: number, flag: number = FLAG.NORMAL) =>
  c.add(BOX, place(x, y + h / 2, z, 0, 0, 0, w, h, d), lin(hex), flag);

/** Deterministic noise per tile, so the farm looks the same every load. */
const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

export interface Farm {
  scene: PixelScene;
  /** Every geometry the scene draws, for choosing the palette together with the objects'. */
  geometries: THREE.BufferGeometry[];
  /** The point the camera looks at when the game starts. */
  home: THREE.Vector3;
}

export function buildFarm(): Farm {
  const s = new GeometryCollector();
  let home = new THREE.Vector3(WIDTH / 2, 0, DEPTH / 2);
  const at = (col: number, row: number) => MAP[row]?.[col] ?? '#';
  let coopDone = false;

  for (let row = 0; row < DEPTH; row++) for (let col = 0; col < WIDTH; col++) {
    const ch = at(col, row), x = col + 0.5, z = row + 0.5, n = hash(col, row);
    if (ch === '=') {
      box(s, x, -0.5, z, 1, 0.47, 1, n < 0.5 ? 0x6a4a30 : 0x704e32);
      continue;
    }
    box(s, x, -0.5, z, 1, 0.5, 1, n < 0.5 ? 0x6f9a48 : 0x76a24c);
    if (ch === '@') home = new THREE.Vector3(x, 0, z);
    if (ch === '#') {
      box(s, x, 0, z, 0.12, 0.8, 0.12, 0x8a6a44);
      if (at(col + 1, row) === '#') box(s, x + 0.5, 0.5, z, 1, 0.08, 0.06, 0xa07a50);
      if (at(col, row + 1) === '#') box(s, x, 0.5, z + 0.5, 0.06, 0.08, 1, 0xa07a50);
    } else if (ch === 'T') {
      box(s, x, 0, z, 0.22, 1.2, 0.22, 0x6a4a30);
      s.add(new THREE.IcosahedronGeometry(0.75, 0), place(x, 1.65, z, n, n * 2, 0), lin(0x4f8a3a), FLAG.NORMAL, true);
    } else if (ch === 'C' && !coopDone) {
      // The coop: the first 'C' is its corner; it covers 3 x 3 tiles.
      coopDone = true;
      box(s, col + 1.5, 0, row + 1.5, 2.8, 1.6, 2.8, 0xb8603a);
      box(s, col + 1.5, 1.6, row + 1.5, 3.1, 0.2, 3.1, 0x5a4a3a);
      box(s, col + 1.5, 0, row + 2.95, 0.7, 1, 0.04, 0x4a3424);
    } else if (ch === 'B') {
      box(s, x, 0, z, 0.9, 0.6, 0.7, 0x9a7048);
      box(s, x, 0.6, z, 0.95, 0.06, 0.75, 0x6a4a30);
    }
  }

  // Meadow outside the fence, just below the tiles, so the camera never looks past the edge of the world.
  const M = 100;
  for (const [x, z, w, d] of [[WIDTH / 2, -M / 2, WIDTH + 2 * M, M], [WIDTH / 2, DEPTH + M / 2, WIDTH + 2 * M, M], [-M / 2, DEPTH / 2, M, DEPTH], [WIDTH + M / 2, DEPTH / 2, M, DEPTH]]) {
    box(s, x, -0.5, z, w, 0.48, d, 0x5f8a40);
  }

  const staticGeometry = s.build();
  const scene: PixelScene = { staticGeometry, shadow: { center: new THREE.Vector3(WIDTH / 2, 0, DEPTH / 2), radius: Math.max(WIDTH, DEPTH) * 0.6 } };
  return { scene, geometries: [staticGeometry], home };
}
