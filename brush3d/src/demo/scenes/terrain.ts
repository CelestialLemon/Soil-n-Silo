import * as THREE from 'three';
import {
  type BrushRenderer, MeshBuilder, MapLine, noise2, rng, smooth, addTuft, groundOf, C, LAND_COVER, OrganicCropField, cropCode,
  addPlankBridge, addRailFence, sampleHeightfield, type Stream, type Obstacle, type TerrainMap, type WaterMap,
  type CropMask,
} from '../../index';
import type { WaterState } from '../water';

// The continuous terrain (setTerrain, docs/API.md): the game's v0.2 land, 160 × 160 cells of 1 m, as the game will send
// it. Rolling ground falling gently east; a rill a cell or two wide cut down it on the diagonal into a pond, its water
// sent as narrow water (WaterMap.narrow) so it doesn't spill its level over its banks lower down; a track crossing it on
// a plank bridge (addPlankBridge); a wheat field and a bean field painted from a mask of cells (OrganicCropField), the
// wheat fenced round (addRailFence) with a gate on the track.
//   contours (the contour lines with no grid: setGrid's contourStrength alone; contours=grid with the grid too)
//   narrow=0 (the rill's water as broad water, to compare)

const N = 160, CELL = 1, X0 = -N / 2, Z0 = -N / 2;
/** How far under the ground the rill is cut (m), how deep its water runs, and how fast (m/s). */
const CUT = 0.35, DEPTH = 0.12, RILL_SPEED = 0.4;
const POND = { x: 60, z: 36, r: 8 };

/** The ground before the rill and the pond: rolling, falling gently east. */
const base = (x: number, z: number) => 1.8 * noise2(x * 0.022 + 3.1, z * 0.022 - 7.4) + 0.7 * noise2(x * 0.06 - 2, z * 0.06 + 5) - 0.03 * x - 0.012 * z;

const RILL = new MapLine([[-72, -50], [-50, -38], [-30, -31], [-12, -17], [0, -7], [16, 3], [32, 16], [46, 24], [POND.x - 4, POND.z - 2]]);
const TRACK = new MapLine([[-16, 78], [-11, 40], [-9, 12], [-6, -12], [-2, -34], [8, -78]]);

export interface TerrainScene {
  center: THREE.Vector3; radius: number; stream: Stream; wind: Obstacle[];
  height: (x: number, z: number) => number; bare: (x: number, z: number) => number;
  /** The scene's own water (its rill runs down a slope: not the demo's flat stream). */
  water: { map(state: WaterState): WaterMap };
}

export function buildTerrain(r: BrushRenderer): TerrainScene {
  const params = new URLSearchParams(location.search);
  const row = N + 1, height = new Float32Array(row * row), cover = new Uint8Array(N * N), worked = new Uint8Array(N * N);
  // The rill's bed along it: under the ground by CUT, and always falling (it runs on down through a rise).
  const bedStep = 0.5, beds: number[] = [];
  for (let s = 0; s <= RILL.length; s += bedStep) {
    const p = RILL.at(s), raw = base(p.x, p.z) - CUT;
    beds.push(beds.length ? Math.min(beds[beds.length - 1] - 0.002, raw) : raw);
  }
  const bedAt = (along: number) => beds[Math.min(beds.length - 1, Math.max(0, Math.round(along / bedStep)))];
  const pondTop = bedAt(RILL.length) + DEPTH;
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const x = X0 + i * CELL, z = Z0 + j * CELL;
    let h = base(x, z);
    const d = RILL.distance(x, z);
    if (d < 2.5) {
      // (Its banks slope over a couple of metres: the cells are a metre, so a sharper cut would show their triangles.)
      const w = 1 - smooth(0.2, 1.9, d), target = bedAt(RILL.near(x, z).along);
      h = Math.min(h, h + (target - h) * w);
    }
    // The pond: a bowl from its rim down to a metre under its water.
    const pr = Math.hypot(x - POND.x, z - POND.z) / POND.r;
    if (pr < 1.3) h = Math.min(h, pondTop - 1 + 1.15 * smooth(0, 1.2, pr) + Math.max(0, pr - 1) * 0.6);
    height[j * row + i] = h;
  }
  const centre = (i: number, j: number) => sampleHeightfield(height, N, N, CELL, X0, Z0, X0 + (i + 0.5) * CELL, Z0 + (j + 0.5) * CELL);

  // The water: the rill's cells (their middles within a cell of its line) and the pond's (what its level floods from its middle).
  const level = new Float32Array(N * N).fill(NaN), flowX = new Float32Array(N * N), flowZ = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = X0 + (i + 0.5) * CELL, z = Z0 + (j + 0.5) * CELL;
    if (RILL.distance(x, z) >= 0.65) continue;
    const n = RILL.near(x, z), k = j * N + i;
    cover[k] = LAND_COVER.rill;
    level[k] = Math.max(bedAt(n.along), centre(i, j) - 0.04) + DEPTH;
    flowX[k] = n.dx * RILL_SPEED; flowZ[k] = n.dz * RILL_SPEED;
  }
  const start = Math.floor((POND.z - Z0) / CELL) * N + Math.floor((POND.x - X0) / CELL), queue = [start];
  for (let q = 0; q < queue.length; q++) {
    const k = queue[q], i = k % N, j = (k - i) / N;
    if (cover[k] === LAND_COVER.water || centre(i, j) >= pondTop - 0.02) continue;
    cover[k] = LAND_COVER.water; level[k] = pondTop; flowX[k] = 0; flowZ[k] = 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a >= 0 && b >= 0 && a < N && b < N) queue.push(b * N + a);
    }
  }

  // The track (not over the water), and the fields, worked: wheat in a ragged round on the hill west of the track, beans
  // east of it over the rill.
  const crop = new Uint8Array(N * N), stage = new Float32Array(N * N);
  const WHEAT = { x: -38, z: 18, r: 14 }, BEANS = { x: 22, z: -26, r: 10 };
  const inBlob = (x: number, z: number, b: { x: number; z: number; r: number }, seed: number) =>
    Math.hypot(x - b.x, z - b.z) < b.r * (1 + 0.22 * noise2(Math.atan2(z - b.z, x - b.x) * 1.3 + seed, seed));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = X0 + (i + 0.5) * CELL, z = Z0 + (j + 0.5) * CELL, k = j * N + i;
    if (cover[k] !== LAND_COVER.grass) continue;
    if (TRACK.distance(x, z) < 1.1) { cover[k] = LAND_COVER.track; continue; }
    if (RILL.distance(x, z) < 2.2 || TRACK.distance(x, z) < 3) continue;
    const wheat = inBlob(x, z, WHEAT, 4.2), beans = inBlob(x, z, BEANS, 9.7);
    if (!wheat && !beans) continue;
    worked[k] = 1;
    crop[k] = cropCode(wheat ? 'wheat' : 'beans');
    stage[k] = wheat ? 2.7 + 0.3 * smooth(-0.5, 0.5, noise2(x * 0.08, z * 0.08)) : 2;
  }
  const map: TerrainMap = { nx: N, nz: N, cell: CELL, x0: X0, z0: Z0, height, cover, worked };
  r.setTerrain(map);
  const landAt = (x: number, z: number) => r.landAt(x, z);
  const mask: CropMask = { nx: N, nz: N, cell: CELL, x0: X0, z0: Z0, crop, stage };
  new OrganicCropField(r, mask, { heightAt: landAt, rows: Math.PI / 5 });

  // The bridge where the track crosses the rill, spanning along the track.
  let cross = 0, nearest = Infinity;
  for (let s = 0; s < TRACK.length; s += 0.25) { const p = TRACK.at(s), d = RILL.distance(p.x, p.z); if (d < nearest) { nearest = d; cross = s; } }
  const at = TRACK.at(cross), timber = new MeshBuilder('ink');
  addPlankBridge(timber, { x: at.x, z: at.z, yaw: Math.atan2(-at.dz, at.dx), length: 4, width: 1.6, heightAt: landAt });
  // The wheat's fence, round it a couple of metres out, with a gate where it's nearest the track.
  const fence: { x: number; z: number }[] = [];
  for (let k = 0; k < 30; k++) {
    const a = (k / 30) * Math.PI * 2, rr = WHEAT.r * (1 + 0.22 * noise2(a * 1.3 + 4.2, 4.2)) + 2.2;
    fence.push({ x: WHEAT.x + Math.cos(a) * rr, z: WHEAT.z + Math.sin(a) * rr });
  }
  const gate = fence.reduce((g, p) => (TRACK.distance(p.x, p.z) < TRACK.distance(g.x, g.z) ? p : g));
  addRailFence(timber, { points: fence, closed: true, heightAt: landAt, gaps: [{ x: gate.x, z: gate.z, radius: 2 }] });
  r.add(timber.build(), 'ink');

  // Grass tufts over the meadow, thinning in drifts; none on the track, the fields or in the water.
  const ground = groundOf(landAt), g = new MeshBuilder('grass'), rand = rng(511);
  for (let k = 0; k < 9000; k++) {
    const x = X0 + rand() * N * CELL, z = Z0 + rand() * N * CELL;
    const i = Math.floor((x - X0) / CELL), j = Math.floor((z - Z0) / CELL), c = j * N + i;
    if (cover[c] !== LAND_COVER.grass || worked[c] || RILL.distance(x, z) < 1) continue;
    if (rand() > 0.3 + 0.7 * smooth(0.4, 0.8, noise2(x * 0.09 + 40, z * 0.09) * 0.5 + 0.5)) continue;
    addTuft(g, ground, x, z, 0.2 + rand() * 0.2, C.meadow.clone().lerp(C.lime, rand() * 0.5), rand);
  }
  r.add(g.build(), 'grass', { castShadow: false });

  const contours = params.get('contours');
  if (contours !== null) {
    r.setGrid({ width: N, height: N, tile: CELL, x0: X0, z0: Z0, level: 0.5, ...(contours === 'grid' ? {} : { gridStrength: 0, contourStrength: 0.55 }) });
  }

  const narrow = params.get('narrow') !== '0';
  const water = {
    map(w: WaterState): WaterMap {
      const lv = level.map((v) => v + w.rise), mud = new Float32Array(N * N).fill(w.mud);
      return {
        nx: N, nz: N, cell: CELL, x0: X0, z0: Z0, level: lv, mud, narrow,
        flowX: flowX.map((v) => v * w.flow), flowZ: flowZ.map((v) => v * w.flow),
        ...(w.ice > 0 ? { ice: new Float32Array(N * N).fill(w.ice) } : {}),
      };
    },
  };
  const cellOf = (x: number, z: number) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor((x - X0) / CELL))), j = Math.min(N - 1, Math.max(0, Math.floor((z - Z0) / CELL)));
    return j * N + i;
  };
  const stream: Stream = { level: -100, grid: { nx: N / 4, nz: N / 4, cell: 4 * CELL, x0: X0, z0: Z0 }, channel: () => false, along: () => [0, 0] };
  return {
    center: new THREE.Vector3(-6, landAt(-6, -10), -10), radius: 40, stream, wind: [], height: landAt,
    bare: (x, z) => { const c = cellOf(x, z); return cover[c] === LAND_COVER.track || worked[c] ? 1 : 0; },
    water,
  };
}
