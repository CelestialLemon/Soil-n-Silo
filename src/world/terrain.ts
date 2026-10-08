import * as THREE from 'three';
import { FLAG, FLUIDS, FluidCollector, GeometryCollector, linearColor as lin, motion, place, type PixelScene } from 'pixel3d-renderer';
import { TERRAIN, type MapData } from '../game/map.ts';
import { box, hash } from './kit.ts';

// The static world of a commission, built once from its map: the ground (greener where the soil is richer), river and pond
// basins with water over them, and a wooded meadow beyond the edge so the camera never looks past the world. Trees and
// rocks inside the map are objects instead (view.ts), since they can be cleared.

export interface World {
  scene: PixelScene;
  geometries: THREE.BufferGeometry[];
}

/** Grass by fertility band: dry and yellow-green on poor soil, deep green on rich. */
const GRASS = [[0xa8a860, 0xb0ae66], [0x92a456, 0x98aa5a], [0x7c9e4c, 0x82a450], [0x6c9846, 0x72a04a], [0x5e9042, 0x649646]];

export function buildWorld(map: MapData, trees: THREE.BufferGeometry[]): World {
  const s = new GeometryCollector(), d = new GeometryCollector(true), fluids = new FluidCollector();
  const { width: w, height: h } = map;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? TERRAIN.grass : map.terrain[y * w + x]);
  const water = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && map.terrain[y * w + x] === TERRAIN.water;

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const cx = x + 0.5, cz = y + 0.5, n = hash(x, y);
    if (at(x, y) === TERRAIN.water) {
      box(s, cx, -0.6, cz, 1, 0.2, 1, 0x8a7a5a);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (!water(x + dx, y + dz)) box(s, cx + dx * 0.5, -0.6, cz + dz * 0.5, dz ? 1 : 0.02, 0.6, dx ? 1 : 0.02, 0x6a5a3e);
      }
      fluids.add(new THREE.PlaneGeometry(1, 1), place(cx, -0.12, cz, -Math.PI / 2), FLUIDS.water);
      continue;
    }
    const f = map.fertility[y * w + x], band = Math.min(4, Math.floor(f / 20));
    box(s, cx, -0.5, cz, 1, 0.5, 1, GRASS[band][n < 0.5 ? 0 : 1]);
  }

  // Beyond the edge: meadow, and a ring of trees with flowers swaying in it.
  const M = 60;
  for (const [x, z, bw, bd] of [[w / 2, -M / 2, w + 2 * M, M], [w / 2, h + M / 2, w + 2 * M, M], [-M / 2, h / 2, M, h], [w + M / 2, h / 2, M, h]]) {
    box(s, x, -0.5, z, bw, 0.48, bd, 0x5f8a40);
  }
  const ring = (x: number, z: number, i: number) => {
    const n = hash(x * 3.1, z * 1.7), g = trees[i % trees.length].clone();
    g.applyMatrix4(place(x, -0.02, z, 0, n * Math.PI * 2, 0, 0.85 + 0.35 * n));
    s.pushPrepared(g);
  };
  let i = 0;
  for (let x = -4; x < w + 4; x += 1.6) for (const z of [-1.4, -3.2, h + 1.4, h + 3.2]) ring(x + hash(x, z) * 0.8, z + hash(z, x) * 0.6, i++);
  for (let z = 0; z < h; z += 1.6) for (const x of [-1.4, -3.2, w + 1.4, w + 3.2]) ring(x + hash(x, z) * 0.6, z + hash(z, x) * 0.8, i++);
  const STEM = new THREE.BoxGeometry(1, 1, 1);
  for (let k = 0; k < 160; k++) {
    const side = k % 4, t = hash(k, 7);
    const fx = side < 2 ? -6 + t * (w + 12) : side === 2 ? -0.6 - hash(k, 9) * 0.5 : w + 0.6 + hash(k, 9) * 0.5;
    const fz = side >= 2 ? t * h : side === 0 ? -0.6 - hash(k, 9) * 0.5 : h + 0.6 + hash(k, 9) * 0.5;
    d.add(STEM, place(fx, 0.12, fz, 0, 0, 0, 0.04, 0.26, 0.04), lin(0x4a7a2a), FLAG.NORMAL, false, motion.sway(fx, fz, 0, 0.3));
    d.add(STEM, place(fx, 0.28, fz, 0, 0, 0, 0.11, 0.08, 0.11), lin([0xe05a7a, 0xf0d050, 0xa070e0, 0xf6f2ea][k % 4]), FLAG.NORMAL, false, motion.sway(fx, fz, 0, 0.3));
  }

  const staticGeometry = s.build(), dynamicGeometry = d.build();
  const scene: PixelScene = {
    staticGeometry, dynamicGeometry, fluids: fluids.build(),
    shadow: { center: new THREE.Vector3(w / 2, 0, h / 2), radius: Math.max(w, h) * 0.62 },
  };
  return { scene, geometries: [staticGeometry, dynamicGeometry] };
}
