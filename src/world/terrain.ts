import * as THREE from 'three';
import { FLAG, FLUIDS, FluidCollector, GeometryCollector, linearColor as lin, motion, place, type PixelScene } from 'pixel3d-renderer';
import { TERRAIN, type Land, type MapData } from '../game/map.ts';
import { fbm2 } from '../game/rng.ts';
import { box, hash } from './kit.ts';

// The static world of a commission, built once from its map: the ground (greener where the soil is richer), river and pond
// basins with water over them, and the country around the map so the camera never looks past the world. The river runs
// with its current, over two small falls and round boulders. Beyond the edge the land carries on (the river, a track from
// the depot, woods) and rises into wooded hills. Trees and rocks inside the map are objects instead (view.ts), since they
// can be cleared.

export interface World {
  scene: PixelScene;
  geometries: THREE.BufferGeometry[];
}

/** How many tiles of country are drawn past each edge of the map (generate the land with this margin). */
export const COUNTRY = 56;
/** How far past the country an apron of distant woods goes, so even a far view never sees past the world. */
const APRON = 120;
/** The country levels out to this height over its last `RIM` tiles, where the apron starts. */
const RIM_Y = 4, RIM = 10;
/** How far past the edge trees and rocks are models; further out the woods are rounded crowns over the hills. */
const NEAR = 12;

/** Grass by fertility band: dry and yellow-green on poor soil, deep green on rich. */
const GRASS = [[0xa8a860, 0xb0ae66], [0x92a456, 0x98aa5a], [0x7c9e4c, 0x82a450], [0x6c9846, 0x72a04a], [0x5e9042, 0x649646]];
const CANOPY = [0x4a7a38, 0x52823c, 0x5a8a40, 0x447034], FLOOR = 0x4a6a34;
const ROAD = [0xa48c62, 0x9a845c], RUT = 0x8a7652;
const BED = 0x8a7a5a, BANK = 0x6a5a3e, LEDGE = 0x8a8478, BOULDER = 0x8c8a80, DECK = 0x8a6440;

/** A river reads as moving water: less see-through, rougher and with shorter ripples than a still pond. */
const RIVER = { ...FLUIDS.water, clarity: 0.8, roughness: 0.3, waveScale: 0.7 };
type Fluid = typeof RIVER;
/** The water's surface at the river's source and on ponds, how far each fall drops it, and how deep the water is. */
const WATER_Y = -0.12, FALL = 0.15, DEPTH = 0.3;

const PLANE = new THREE.PlaneGeometry(1, 1), STONE = new THREE.IcosahedronGeometry(1, 0), STEM = new THREE.BoxGeometry(1, 1, 1);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
/** Beyond the map everything is a shade duller, so the edge of where you can build reads at a glance. */
const OUTSIDE = 0.84;
const dim = (hex: number) => new THREE.Color(hex).multiplyScalar(OUTSIDE).getHex();
/** A fluid dulled like the rest of the country. */
const dimFluid = (f: Fluid): Fluid => ({ ...f, shallow: dim(f.shallow), deep: dim(f.deep), foam: dim(f.foam) });
const FLUID = { river: RIVER, still: FLUIDS.water, outsideRiver: dimFluid(RIVER), outsideStill: dimFluid(FLUIDS.water) };
/** A prepared model, placed and dulled like the rest of the country. */
const country = (g: THREE.BufferGeometry, m: THREE.Matrix4) => {
  const c = g.clone();
  c.applyMatrix4(m);
  const a = c.getAttribute('aColor') as THREE.BufferAttribute;
  c.setAttribute('aColor', new THREE.BufferAttribute((a.array as Float32Array).map((v) => v * OUTSIDE), 3));
  return c;
};

/** Faceted triangles (positions and linear colours, three numbers a vertex) as a geometry ready for the static collector. */
function prepared(pos: number[], col: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aFlag', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3).fill(FLAG.NORMAL), 1));
  return g;
}

export function buildWorld(map: MapData, land: Land, models: { trees: THREE.BufferGeometry[]; rocks: THREE.BufferGeometry[] }): World {
  const s = new GeometryCollector(), d = new GeometryCollector(true), fluids = new FluidCollector();
  const { width: w, height: h } = map, M = land.margin, seed = land.seed;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const onLand = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  const li = (x: number, y: number) => (y + M) * land.width + x + M;
  const kind = (x: number, y: number) => (onMap(x, y) ? map.terrain[y * w + x] : land.terrain[li(x, y)]);
  /** How far (tiles) a point is inside the country's outer edge. Water stops short of it, where the hills close in. */
  const rim = (x: number, y: number) => Math.min(x + M, y + M, w + M - x, h + M - y);
  const water = (x: number, y: number) => onLand(x, y) && kind(x, y) === TERRAIN.water && rim(x + 0.5, y + 0.5) > RIM + 2;
  /** How far (tiles) a point is beyond the map's edge. */
  const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - w), Math.max(0, -y, y - h));

  // A track leads off the south edge from the depot, bending away once it is out of sight of the map.
  const bend = hash(seed, 3) < 0.5 ? -1 : 1;
  const trackAt = (y: number) => land.depot.x + 1 + Math.round(bend * 5 * smoothstep(h + 6, h + 26, y));
  const track = (x: number, y: number) => y >= h && Math.abs(x - trackAt(y)) <= 1;

  // Each land tile's distance (tiles) from water or the track, so the hills open into flat valleys along them.
  const open = new Float32Array(land.width * land.height).fill(1e9);
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) if (water(x, y) || track(x, y)) open[li(x, y)] = 0;
  const relax = (x: number, y: number, dx: number, dy: number, c: number) => {
    if (onLand(x + dx, y + dy)) open[li(x, y)] = Math.min(open[li(x, y)], open[li(x + dx, y + dy)] + c);
  };
  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) { relax(x, y, -1, 0, 1); relax(x, y, 0, -1, 1); relax(x, y, -1, -1, 1.41); relax(x, y, 1, -1, 1.41); }
  for (let y = h + M - 1; y >= -M; y--) for (let x = w + M - 1; x >= -M; x--) { relax(x, y, 1, 0, 1); relax(x, y, 0, 1, 1); relax(x, y, 1, 1, 1.41); relax(x, y, -1, 1, 1.41); }

  // Woods far out are cheap crowns over a dark forest floor rather than tree models.
  const canopy = (x: number, y: number) => onLand(x, y) && !onMap(x, y) && land.terrain[li(x, y)] === TERRAIN.tree && !track(x, y)
    && beyond(x + 0.5, y + 0.5) > NEAR;
  /** The ground's height at a tile corner: flat on the map and along the river and track, rising into hills beyond. */
  const corner = (x: number, y: number) => {
    let near = 1e9;
    for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) if (onLand(x + dx, y + dy)) near = Math.min(near, open[li(x + dx, y + dy)]);
    const hill = smoothstep(4, 24, beyond(x, y)) * (1.5 + 6 * fbm2(x / 13, y / 13, seed + 71, 3)) * smoothstep(1.5, 8, near);
    return hill + (RIM_Y - hill) * smoothstep(RIM, 0, rim(x, y));
  };
  const cw = land.width + 1, heights = new Float32Array(cw * (land.height + 1));
  for (let y = -M; y <= h + M; y++) for (let x = -M; x <= w + M; x++) heights[(y + M) * cw + x + M] = x >= 0 && y >= 0 && x <= w && y <= h ? 0 : corner(x, y);
  const hAt = (x: number, y: number) => heights[(y + M) * cw + x + M];
  /** The ground's height at a point (held to the country), on the two triangles each tile of the height field is cut into (see `quad`). */
  const groundAt = (qx: number, qz: number) => {
    const px = Math.min(Math.max(qx, -M), w + M - 1e-6), pz = Math.min(Math.max(qz, -M), h + M - 1e-6);
    const x = Math.floor(px), y = Math.floor(pz), u = px - x, v = pz - y, h00 = hAt(x, y), h11 = hAt(x + 1, y + 1);
    return u > v ? h00 + u * (hAt(x + 1, y) - h00) + v * (h11 - hAt(x + 1, y)) : h00 + v * (hAt(x, y + 1) - h00) + u * (h11 - hAt(x, y + 1));
  };

  // The ground beyond the map: a tile of the height field each, coloured like the map's but a little duller.
  const pos: number[] = [], col: number[] = [];
  const quad = (x: number, y: number, hex: number) => {
    const c = lin(hex), p00 = [x, hAt(x, y), y], p10 = [x + 1, hAt(x + 1, y), y], p11 = [x + 1, hAt(x + 1, y + 1), y + 1], p01 = [x, hAt(x, y + 1), y + 1];
    for (const p of [p00, p01, p11, p00, p11, p10]) { pos.push(...p); col.push(...c); }
  };

  /** Near the country's edge the river and the track run off under the woods, so their ends are never seen. */
  const hidden = (x: number, y: number) => !onMap(x, y) && (kind(x, y) === TERRAIN.water || track(x, y)) && rim(x + 0.5, y + 0.5) < RIM + 8;

  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const cx = x + 0.5, cz = y + 0.5, n = hash(x, y), t = kind(x, y);
    // A crown for each 2 × 2 block of far woods.
    if ((canopy(x, y) || hidden(x, y)) && (x & 1) === 0 && (y & 1) === 0) {
      const r = 1.1 + 0.4 * n, ox = hash(x + 3, y) - 0.5, oz = hash(x, y + 3) - 0.5;
      s.add(STONE, place(x + 1 + ox, groundAt(x + 1 + ox, y + 1 + oz) + 0.5 + r * 0.6, y + 1 + oz, 0, n * 6, 0, r, r * 0.85, r), lin(dim(CANOPY[Math.floor(hash(y, x + 1) * 4)])), FLAG.NORMAL, true);
    }
    if (water(x, y)) {
      waterTile(x, y);
      if (track(x, y)) box(s, cx, -0.02, cz, 1, 0.08, 1.1, dim(DECK));
      continue;
    }
    if (onMap(x, y)) {
      const f = map.fertility[y * w + x], band = Math.min(4, Math.floor(f / 20));
      box(s, cx, -0.5, cz, 1, 0.5, 1, GRASS[band][n < 0.5 ? 0 : 1]);
      continue;
    }
    const far = beyond(cx, cz), band = Math.min(4, Math.floor(land.fertility[li(x, y)] / 20));
    if (canopy(x, y) || hidden(x, y)) { quad(x, y, dim(FLOOR)); continue; }
    if (track(x, y)) { quad(x, y, dim(x === trackAt(y) ? RUT : ROAD[n < 0.5 ? 0 : 1])); continue; }
    quad(x, y, dim(GRASS[band][n < 0.5 ? 0 : 1]));
    if (far > NEAR) continue;
    // Trees and rocks the same as on the map (view.ts), only dulled.
    if (t === TERRAIN.tree) s.pushPrepared(country(models.trees[n < 0.55 ? 0 : n < 0.85 ? 1 : 2], place(cx, groundAt(cx, cz) - 0.02, cz, 0, n * Math.PI * 2, 0, 0.62 + 0.25 * n)));
    else if (t === TERRAIN.rock) s.pushPrepared(country(models.rocks[Math.floor(n * 3) % 3], place(cx, groundAt(cx, cz), cz, 0, n * Math.PI * 2, 0)));
  }
  s.pushPrepared(prepared(pos, col));

  // The apron: distant woods in coarse cells all round the country, rising and falling a little away from its edge. The
  // cells share one grid (every 4 tiles, plus the country's edges), so neighbouring cells always meet.
  const apronY = (x: number, y: number) => RIM_Y + (hash(x * 0.37, y * 0.71) - 0.5) * 1.6 * smoothstep(0, 8, -rim(x, y));
  const lines = (from: number, to: number, edges: number[]) =>
    [...new Set([...Array.from({ length: Math.floor((to - from) / 4) + 1 }, (_, k) => from + 4 * k), ...edges, to])].sort((a, b) => a - b);
  const xs = lines(-M - APRON, w + M + APRON, [-M, w + M]), ys = lines(-M - APRON, h + M + APRON, [-M, h + M]);
  const apron: number[] = [], apronCol: number[] = [];
  for (let j = 0; j + 1 < ys.length; j++) for (let i = 0; i + 1 < xs.length; i++) {
    const x = xs[i], y = ys[j], xe = xs[i + 1], ye = ys[j + 1];
    if (x >= -M && xe <= w + M && y >= -M && ye <= h + M) continue;   // the country itself
    const c = lin(dim(dim(CANOPY[Math.floor(hash(x, y) * 4)])));
    const p00 = [x, apronY(x, y), y], p10 = [xe, apronY(xe, y), y], p11 = [xe, apronY(xe, ye), ye], p01 = [x, apronY(x, ye), ye];
    for (const p of [p00, p01, p11, p00, p11, p10]) { apron.push(...p); apronCol.push(...c); }
  }
  s.pushPrepared(prepared(apron, apronCol));

  /** A water tile: its bed and banks, its surface at the river's level there, and a fall over a ledge to a lower tile. */
  function waterTile(x: number, y: number) {
    const cx = x + 0.5, cz = y + 0.5, i = li(x, y), k = land.drop[i];
    const fx = land.flow[i * 2], fz = land.flow[i * 2 + 1], river = fx !== 0 || fz !== 0;
    const inside = onMap(x, y), surf = WATER_Y - FALL * k, bed = surf - DEPTH, tone = inside ? (c: number) => c : dim;
    const running = inside ? FLUID.river : FLUID.outsideRiver;
    box(s, cx, bed - 0.2, cz, 1, 0.2, 1, tone(BED));
    let falls = false;
    for (const [dx, dz] of DIRS) {
      if (!water(x + dx, y + dz)) { box(s, cx + dx * 0.5, bed - 0.2, cz + dz * 0.5, dz ? 1 : 0.02, 0.2 - bed, dx ? 1 : 0.02, tone(BANK)); continue; }
      const below = land.drop[li(x + dx, y + dz)];
      if (below <= k) continue;
      // The river drops a step here: a rock ledge under the lip, the water spilling down its face.
      falls = true;
      const low = WATER_Y - FALL * below, ex = cx + dx * 0.5, ez = cz + dz * 0.5;
      box(s, ex - dx * 0.07, low - DEPTH - 0.2, ez - dz * 0.07, dz ? 1 : 0.14, surf - 0.03 - (low - DEPTH - 0.2), dx ? 1 : 0.14, tone(LEDGE));
      fluids.add(PLANE, place(ex + dx * 0.02, (surf + low) / 2, ez + dz * 0.02, 0, Math.atan2(dx, dz), 0, 1, surf - low, 1), running);
    }
    fluids.add(PLANE, place(cx, surf, cz, -Math.PI / 2), river ? running : inside ? FLUID.still : FLUID.outsideStill, [fx, fz]);
    // Now and then a boulder breaks the current (never at a fall, nor where the track crosses).
    if (river && !falls && !track(x, y) && hash(x * 1.3, y * 2.1) < 0.07) {
      const n = hash(y, x), ox = (n - 0.5) * 0.4, oz = (hash(x + 9, y) - 0.5) * 0.4;
      s.add(STONE, place(cx + ox, surf - 0.04, cz + oz, n, n * 5, 0, 0.26, 0.17, 0.22), lin(tone(BOULDER)), FLAG.NORMAL, true);
    }
  }

  // Flowers swaying in the meadow just beyond the edge.
  for (let k = 0, tries = 0; k < 160 && tries < 4000; tries++) {
    const x = Math.floor(-10 + hash(tries, 7) * (w + 20)), y = Math.floor(-10 + hash(tries, 9) * (h + 20));
    if (onMap(x, y) || !onLand(x, y) || kind(x, y) !== TERRAIN.grass || track(x, y)) continue;
    const fx = x + hash(x, tries), fz = y + hash(tries, y), gy = groundAt(fx, fz);
    d.add(STEM, place(fx, gy + 0.13, fz, 0, 0, 0, 0.04, 0.26, 0.04), lin(dim(0x4a7a2a)), FLAG.NORMAL, false, motion.sway(fx, fz, 0, 0.3));
    d.add(STEM, place(fx, gy + 0.29, fz, 0, 0, 0, 0.11, 0.08, 0.11), lin(dim([0xe05a7a, 0xf0d050, 0xa070e0, 0xf6f2ea][k % 4])), FLAG.NORMAL, false, motion.sway(fx, fz, 0, 0.3));
    k++;
  }

  const staticGeometry = s.build(), dynamicGeometry = d.build();
  const scene: PixelScene = {
    staticGeometry, dynamicGeometry, fluids: fluids.build(),
    shadow: { center: new THREE.Vector3(w / 2, 0, h / 2), radius: Math.max(w, h) * 0.62 + 8 },
  };
  return { scene, geometries: [staticGeometry, dynamicGeometry] };
}
