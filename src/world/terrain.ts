import * as THREE from 'three';
import { FLAG, FLUIDS, FluidCollector, GeometryCollector, linearColor as lin, place, type PixelScene } from 'pixel3d-renderer';
import { TERRAIN, type Land, type MapData } from '../game/map.ts';
import { baseLevel, joins, SIDES } from '../game/relief.ts';
import { cliff, geography, grassOf, isBank, landRelief, LEVEL_HEIGHT, top, Tris, type Halo, type Lie } from './ground.ts';
import { box, hash } from './kit.ts';
import { CANOPY, treeAt, wetAt, type TreeKind } from './trees.ts';

// The static world of a commission, built once from its map: river and pond basins with water over them, and the country
// around the map so the camera never looks past the world. The river runs with its current, over falls where it drops a
// level, and round boulders. Beyond the edge the land carries on (the river, a track from the depot, woods) and rises in
// terraces into wooded hills. The map's own ground is drawn apart (ground.ts, MapGround), since earthworks change it; trees
// and rocks inside the map are objects too (view.ts), since they can be cleared.

export interface World {
  scene: PixelScene;
  geometries: THREE.BufferGeometry[];
  /** The country drawn with the map's ground (`HALO`): its tiles' colours, how its walls are dulled, its trees and rocks. */
  halo: Halo;
}

/** How many tiles of country are drawn past each edge of the map (generate the land with this margin). */
export const COUNTRY = 56;
/** How far past the country an apron of distant woods goes, so even a far view never sees past the world. */
const APRON = 120;
/** Over the country's last `RIM` tiles the river and the track run out of sight. */
const RIM = 10;
/** How far past the edge trees and rocks are models; further out the woods are rounded crowns over the hills. */
const NEAR = 12;

/** The distant apron's woods, a few greens; nearer woods take their trees' own colours (trees.ts). */
const WOODS = [0x4a7a38, 0x52823c, 0x5a8a40, 0x447034], FLOOR = 0x4a6a34;
const ROAD = [0xa48c62, 0x9a845c], RUT = 0x8a7652;
const BED = 0x8a7a5a, BANK = 0x6a5a3e, LEDGE = 0x8a8478, BOULDER = 0x8c8a80, DECK = 0x8a6440;

/** A river reads as moving water: less see-through, rougher and with shorter ripples than a still pond. */
const RIVER = { ...FLUIDS.water, clarity: 0.8, roughness: 0.3, waveScale: 0.7 };
type Fluid = typeof RIVER;
/** The water's surface below the level it lies at (its banks' top), and how deep the water is. */
const WATER_Y = -0.12, DEPTH = 0.3;

const PLANE = new THREE.PlaneGeometry(1, 1), STONE = new THREE.IcosahedronGeometry(1, 0);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
const smoothstep = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const H = LEVEL_HEIGHT;
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

export function buildWorld(map: MapData, land: Land, lie: Lie, models: { trees: Record<TreeKind, THREE.BufferGeometry[]>; rocks: THREE.BufferGeometry[] }): World {
  const s = new GeometryCollector(), d = new GeometryCollector(true), fluids = new FluidCollector();
  const { width: w, height: h } = map, M = land.margin;
  const onMap = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const onLand = (x: number, y: number) => x >= -M && y >= -M && x < w + M && y < h + M;
  const li = (x: number, y: number) => (y + M) * land.width + x + M;
  const kind = (x: number, y: number) => (onMap(x, y) ? map.terrain[y * w + x] : land.terrain[li(x, y)]);
  /** How far (tiles) a point is inside the country's outer edge. Water stops short of it, where the hills close in. */
  const rim = (x: number, y: number) => Math.min(x + M, y + M, w + M - x, h + M - y);
  const water = (x: number, y: number) => onLand(x, y) && kind(x, y) === TERRAIN.water && rim(x + 0.5, y + 0.5) > RIM + 2;
  /** How far (tiles) a point is beyond the map's edge. */
  const beyond = (x: number, y: number) => Math.hypot(Math.max(0, -x, x - w), Math.max(0, -y, y - h));

  // A track leads off the south edge from the depot, bending away once it is out of sight of the map (laid by the generator).
  const track = (x: number, y: number) => onLand(x, y) && land.track[li(x, y)] === 1;

  // The land's relief, in map coordinates; the country is drawn as the generator made it.
  const lr = landRelief(land);
  /** How dry each land tile lies, for its grass. */
  const dry = geography(land, lr);
  const gy = (qx: number, qz: number) => lie.y(qx, qz);
  const levelAt = (x: number, y: number) => baseLevel(lr, x + M, y + M);
  /** Whether water is near a tile, and the tree model there (its species by where it stands, trees.ts). */
  const wet = (x: number, y: number) => wetAt((wx, wy) => onLand(wx, wy) && kind(wx, wy) === TERRAIN.water, x, y);
  const treeModel = (x: number, y: number) => { const t = treeAt(x, y, levelAt(x, y), wet(x, y)); return models.trees[t.species][t.variant]; };

  // Woods far out are cheap crowns over a dark forest floor rather than tree models.
  const canopy = (x: number, y: number) => onLand(x, y) && !onMap(x, y) && land.terrain[li(x, y)] === TERRAIN.tree && !track(x, y)
    && beyond(x + 0.5, y + 0.5) > NEAR;
  /** Near the country's edge the river and the track run off under the woods, so their ends are never seen. */
  const hidden = (x: number, y: number) => !onMap(x, y) && (kind(x, y) === TERRAIN.water || track(x, y)) && rim(x + 0.5, y + 0.5) < RIM + 8;

  // The ground beyond the map: each tile's top and its cliffs, coloured like the map's but a little duller. The ring of it
  // round the map moves with the map's (`HALO`), so MapGround draws it; its colours are left for it.
  const ground = new Tris(), halo: Halo = { colour: new Map(), tone: dim, things: [] }, dulled = new Map<THREE.BufferGeometry, THREE.BufferGeometry>();
  /** A tree or rock on the country: in the scene, or on the halo (the view stands it on the ground as it moves). */
  const thing = (g: THREE.BufferGeometry, x: number, z: number, yaw: number, scale: number, sink: number) => {
    if (!lie.withMap(Math.floor(x) + M, Math.floor(z) + M)) { s.pushPrepared(country(g, place(x, gy(x, z) - sink, z, 0, yaw, 0, scale))); return; }
    let d = dulled.get(g);
    if (!d) { d = country(g, new THREE.Matrix4()); dulled.set(g, d); }
    halo.things.push({ g: d, x, z, yaw, scale, sink });
  };
  const countryTile = (x: number, y: number, hex: number) => {
    if (lie.withMap(x + M, y + M)) { halo.colour.set(li(x, y), hex); return; }
    top(ground, lie, x + M, y + M, hex);
    for (let side = 0; side < 4; side++) {
      const nx = x + SIDES[side][0], ny = y + SIDES[side][1];
      if (!onLand(nx, ny) || joins(lie.relief, x + M, y + M, side)) continue;
      cliff(ground, lie, x + M, y + M, side, water(nx, ny) ? levelAt(nx, ny) * H : null, dim);
    }
  };

  for (let y = -M; y < h + M; y++) for (let x = -M; x < w + M; x++) {
    const cx = x + 0.5, cz = y + 0.5, n = hash(x, y), t = kind(x, y);
    // A crown for each 2 × 2 block of far woods.
    if ((canopy(x, y) || hidden(x, y)) && (x & 1) === 0 && (y & 1) === 0) {
      const r = 1.1 + 0.4 * n, ox = hash(x + 3, y) - 0.5, oz = hash(x, y + 3) - 0.5;
      const crown = CANOPY[treeAt(x, y, levelAt(x, y), wet(x, y)).species];
      s.add(STONE, place(x + 1 + ox, gy(x + 1 + ox, y + 1 + oz) + 0.5 + r * 0.6, y + 1 + oz, 0, n * 6, 0, r, r * 0.85, r), lin(dim(crown)), FLAG.NORMAL, true);
    }
    if (water(x, y)) {
      waterTile(x, y);
      if (track(x, y)) box(s, cx, levelAt(x, y) * H - 0.02, cz, 1, 0.08, 1.1, dim(DECK));
      continue;
    }
    if (onMap(x, y)) continue;   // the map's ground is MapGround's
    const far = beyond(cx, cz);
    if (canopy(x, y) || hidden(x, y)) { countryTile(x, y, dim(FLOOR)); continue; }
    if (track(x, y)) { countryTile(x, y, dim(track(x - 1, y) && track(x + 1, y) ? RUT : ROAD[n < 0.5 ? 0 : 1])); continue; }
    countryTile(x, y, dim(grassOf(dry[li(x, y)], isBank(lr, x + M, y + M))));
    if (far > NEAR) continue;
    // Trees and rocks the same as on the map (view.ts), only dulled.
    if (t === TERRAIN.tree) thing(treeModel(x, y), cx, cz, n * Math.PI * 2, 0.62 + 0.25 * n, 0.02);
    else if (t === TERRAIN.rock) thing(models.rocks[Math.floor(n * 3) % 3], cx, cz, n * Math.PI * 2, 1, 0);
  }
  s.pushPrepared(ground.geometry());

  // The apron: distant woods in coarse cells all round the country, rising and falling a little away from its edge, from the
  // height the country settles to at its rim. The cells share one grid (every 4 tiles, plus the country's edges), so
  // neighbouring cells always meet.
  const rimY = levelAt(-M, -M) * H;
  const apronY = (x: number, y: number) => rimY + (hash(x * 0.37, y * 0.71) - 0.5) * 1.6 * smoothstep(0, 8, -rim(x, y));
  const lines = (from: number, to: number, edges: number[]) =>
    [...new Set([...Array.from({ length: Math.floor((to - from) / 4) + 1 }, (_, k) => from + 4 * k), ...edges, to])].sort((a, b) => a - b);
  const xs = lines(-M - APRON, w + M + APRON, [-M, w + M]), ys = lines(-M - APRON, h + M + APRON, [-M, h + M]);
  const apron = new Tris();
  for (let j = 0; j + 1 < ys.length; j++) for (let i = 0; i + 1 < xs.length; i++) {
    const x = xs[i], y = ys[j], xe = xs[i + 1], ye = ys[j + 1];
    if (x >= -M && xe <= w + M && y >= -M && ye <= h + M) continue;   // the country itself
    apron.quad([x, apronY(x, y), y], [x, apronY(x, ye), ye], [xe, apronY(xe, ye), ye], [xe, apronY(xe, y), y], dim(dim(WOODS[Math.floor(hash(x, y) * 4)])), [0, 1, 0]);
  }
  s.pushPrepared(apron.geometry());

  /**
   * A water tile: its bed, its banks up to the level it lies at (the land beside it draws its own cliff above that), its
   * surface, and a fall over a ledge to a tile a level lower.
   */
  function waterTile(x: number, y: number) {
    const cx = x + 0.5, cz = y + 0.5, i = li(x, y), k = levelAt(x, y);
    const fx = land.flow[i * 2], fz = land.flow[i * 2 + 1], river = fx !== 0 || fz !== 0;
    const inside = onMap(x, y), surf = k * H + WATER_Y, bed = surf - DEPTH, tone = inside ? (c: number) => c : dim;
    const running = inside ? FLUID.river : FLUID.outsideRiver;
    box(s, cx, bed - 0.2, cz, 1, 0.2, 1, tone(BED));
    let falls = false;
    for (const [dx, dz] of DIRS) {
      if (!water(x + dx, y + dz)) { box(s, cx + dx * 0.5, bed - 0.2, cz + dz * 0.5, dz ? 1 : 0.02, k * H - bed + 0.2, dx ? 1 : 0.02, tone(BANK)); continue; }
      const below = levelAt(x + dx, y + dz);
      if (below >= k) continue;
      // The river drops a level here: a rock ledge under the lip, the water spilling down its face.
      falls = true;
      const low = below * H + WATER_Y, ex = cx + dx * 0.5, ez = cz + dz * 0.5;
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

  const staticGeometry = s.build(), dynamicGeometry = d.build();
  const scene: PixelScene = {
    staticGeometry, dynamicGeometry, fluids: fluids.build(),
    shadow: { center: new THREE.Vector3(w / 2, 0, h / 2), radius: Math.max(w, h) * 0.62 + 8 },
  };
  return { scene, geometries: [staticGeometry, dynamicGeometry, ...dulled.values()], halo };
}
