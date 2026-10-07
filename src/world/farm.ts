import * as THREE from 'three';
import { GeometryCollector, place, type PixelScene } from 'pixel3d-renderer';
import { at, DEPTH, home, WIDTH } from '../game/layout.ts';
import { box, hash } from './kit.ts';
import type { Models } from './models.ts';

// The static farm, drawn from the layout map (src/game/layout.ts): grass, the field, paths, fences, trees and bushes, and
// meadow beyond the fence so the camera never looks past the edge of the world. Everything the player clicks (buildings,
// soil, crops, chickens, machines) is an object instead, so `pick` can tell what it is and it can be highlighted.

export interface Farm {
  scene: PixelScene;
  /** Every geometry the scene draws, for choosing the palette together with the objects'. */
  geometries: THREE.BufferGeometry[];
  /** The point the camera looks at when the game starts. */
  home: THREE.Vector3;
}

const isFence = (ch: string) => ch === '#' || ch === 'f';

/** Adds a model's geometry, already built in its local space, at a place in the world. */
function stamp(c: GeometryCollector, g: THREE.BufferGeometry, m: THREE.Matrix4) {
  const copy = g.clone();
  copy.applyMatrix4(m);
  c.pushPrepared(copy);
}

export function buildFarm(models: Models): Farm {
  const s = new GeometryCollector();

  for (let row = 0; row < DEPTH; row++) for (let col = 0; col < WIDTH; col++) {
    const ch = at(col, row), x = col + 0.5, z = row + 0.5, n = hash(col, row);
    if (ch === '-') box(s, x, -0.5, z, 1, 0.5, 1, n < 0.5 ? 0xb89a6a : 0xb09262);
    else if (ch === ',') box(s, x, -0.5, z, 1, 0.5, 1, n < 0.5 ? 0x8eaa52 : 0x96ae58);   // the field: drier, yellower grass
    else box(s, x, -0.5, z, 1, 0.5, 1, n < 0.5 ? 0x6f9a48 : 0x76a24c);
    if (isFence(ch)) {
      box(s, x, 0, z, 0.12, 0.8, 0.12, 0x8a6a44);
      if (isFence(at(col + 1, row)) && col + 1 < WIDTH) box(s, x + 0.5, 0.5, z, 1, 0.08, 0.06, 0xa07a50);
      if (isFence(at(col, row + 1)) && row + 1 < DEPTH) box(s, x, 0.5, z + 0.5, 0.06, 0.08, 1, 0xa07a50);
    } else if (ch === 'T' || ch === 'P' || ch === 'b') {
      const g = ch === 'T' ? models.trees.oak : ch === 'P' ? models.trees.pine : models.trees.bush;
      const scale = 0.85 + 0.3 * n;
      stamp(s, g, place(x, 0, z, 0, n * Math.PI * 2, 0, scale));
    }
  }

  // Meadow outside the fence, just below the tiles.
  const M = 100;
  for (const [x, z, w, d] of [[WIDTH / 2, -M / 2, WIDTH + 2 * M, M], [WIDTH / 2, DEPTH + M / 2, WIDTH + 2 * M, M], [-M / 2, DEPTH / 2, M, DEPTH], [WIDTH + M / 2, DEPTH / 2, M, DEPTH]]) {
    box(s, x, -0.5, z, w, 0.48, d, 0x5f8a40);
  }

  const staticGeometry = s.build();
  const h = home();
  const scene: PixelScene = { staticGeometry, shadow: { center: new THREE.Vector3(WIDTH / 2, 0, DEPTH / 2), radius: Math.max(WIDTH, DEPTH) * 0.62 } };
  return { scene, geometries: [staticGeometry], home: new THREE.Vector3(h.col + 0.5, 0, h.row + 0.5) };
}
