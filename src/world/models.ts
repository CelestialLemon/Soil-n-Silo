import * as THREE from 'three';
import { collectGltf, GeometryCollector, loadGltf, motion, movingPartMotion, namedMeshRule, type Motion, type RGB } from 'pixel3d-renderer';
import { BUILDING_IDS, CROP_IDS, CROPS, ITEM_IDS, type BuildingId, type CropId, type ItemId } from '../game/data.ts';
import { bar, C, cropStandIn, frame, GHOST_WIRE, itemShape, NET_COLOURS, rock, ROUTE_COLOURS, SOIL_BANDS, soilTile, standIn, terraSoilTile, tileFill, truck } from './shapes.ts';

// The game's object geometries, in local space (origin on the ground at the footprint centre, front facing +z). They come
// from the Blender models in public/models/ (assets/<name>/build.py) where those exist, split by the node names the asset
// brief fixes (`stage_<n>`, `variant_<n>`, `running_*`/`idle_*`, `move_spin_*`, `smoke_emitter`), and from the stand-ins in
// shapes.ts where they don't, so a missing model never stops the game.

type Geo = THREE.BufferGeometry;

export interface Look { idle: Geo; running: Geo; height: number }

export interface Models {
  buildings: Record<BuildingId, Look>;
  /** Turbine rotors at three wind speeds. */
  turbine: Geo[];
  /** Batteries with 0 to 4 charge rings lit. */
  battery: Geo[];
  /** Bars for drawing power: one per network colour (`NET_COLOURS`), then the build preview's. */
  wires: Geo[];
  /** Bars for drawing routes on the ground: one per route colour (`ROUTE_COLOURS`). */
  routes: Geo[];
  crops: Record<CropId, Geo[]>;
  items: Record<ItemId, Geo>;
  soil: Geo[];
  /** The terra look only: field soil by band and place in its 3x3 field (`fieldSoil[band][row * 3 + col]`). */
  fieldSoil?: Geo[][];
  trees: Geo[];
  rocks: Geo[];
  truck: Geo;
  cursor: Geo;
  frames: { ok: Geo[]; bad: Geo[] };
  /** A flat square filling a tile, tinted per overlay. */
  fill: Geo;
}

/** Which Blender model draws each building, in order of preference. */
const FILES: Partial<Record<BuildingId, string[]>> = {
  silo: ['silo'], garage: ['garage'],
  sprinkler: ['sprinkler'], coop: ['coop_solar', 'coop'], hive: ['beehive'], composter: ['composter'],
  mill: ['mill_electric'], press: ['oil_press'], spinner: ['spinner'], loom: ['loom'], bakery: ['bakery'], cannery: ['cannery'],
  solar: ['solar_panel'], turbine: ['wind_turbine'], battery: ['battery'], digester: ['digester'], pylon: ['pylon'],
  sapling: ['sapling'], depot: ['depot'],
};

const url = (name: string, dir = '') => `${import.meta.env.BASE_URL}models/${dir}${name}.glb`;

/**
 * The model `name`, or null if it can't be loaded. With `terra`, the terra look's restyled model
 * (public/models/terra/<name>.glb, assets/terra/) is tried first: any model there is picked up, and one that isn't there
 * fails to load (a 404, or the dev server's index.html, which doesn't parse) and falls back to the original.
 */
async function load(name: string, terra: boolean): Promise<{ root: THREE.Group; terra: boolean } | null> {
  if (terra) {
    try {
      return { root: await loadGltf(url(name, 'terra/')), terra: true };
    } catch { /* not restyled (yet): the original */ }
  }
  try {
    return { root: await loadGltf(url(name)), terra: false };
  } catch {
    return null;
  }
}

/**
 * A collector that keeps a mesh's vertex colours (`COLOR_0`, linear), multiplying them into `aColor`, which otherwise
 * holds only the material's flat colour. The terra models carry their whole albedo (palette and baked AO) there, on
 * white materials. Used in the terra look only, so the pixel look's geometry is exactly as before.
 */
class VertexColourCollector extends GeometryCollector {
  /** The source's colours as non-indexed triangles, and whether `add` mirrored them, while `add` runs. */
  private colours: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | null = null;
  private mirrored = false;

  override add(src: Geo, m: THREE.Matrix4 | null, color: RGB, flag?: number, flat = false, mo?: Motion) {
    const c = src.getAttribute('color');
    this.colours = c ? (src.index ? src.toNonIndexed().getAttribute('color') : c) : null;
    this.mirrored = !!m && m.determinant() < 0;
    try {
      super.add(src, m, color, flag, flat, mo);
    } finally {
      this.colours = null;
    }
  }

  override push(g: Geo, color: RGB, flag: number, mo?: Motion) {
    super.push(g, color, flag, mo);
    const vc = this.colours;
    if (!vc) return;
    const out = g.getAttribute('aColor') as THREE.BufferAttribute;
    for (let i = 0; i < out.count; i++) {
      // `add` swaps each mirrored triangle's second and third vertices (`flip`); follow it.
      const k = i % 3, j = !this.mirrored || k === 0 ? i : k === 1 ? i + 1 : i - 1;
      out.setXYZ(i, out.getX(i) * vc.getX(j), out.getY(i) * vc.getY(j), out.getZ(i) * vc.getZ(j));
    }
  }
}

/** Set by `loadModels`: collect vertex colours (the terra look). */
let vertexColours = false;

/**
 * One geometry from the meshes under `root` that `keep` accepts, in `root`'s space. `mo` gives a mesh its motion; with
 * it, the geometry has motion attributes (a dynamic collector), so the renderer animates it.
 */
function collect(root: THREE.Object3D, keep: (o: THREE.Object3D) => boolean = () => true, mo?: (mesh: THREE.Mesh) => Motion | undefined, animated = !!mo) {
  const c = vertexColours ? new VertexColourCollector(animated) : new GeometryCollector(animated);
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const local = new THREE.Group();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !keepAll(mesh, root, keep)) return;
    const copy = new THREE.Mesh(mesh.geometry, mesh.material);
    copy.name = mesh.name;
    copy.userData = { source: mesh };
    copy.matrixAutoUpdate = false;
    copy.matrix.multiplyMatrices(inverse, mesh.matrixWorld);
    local.add(copy);
  });
  local.updateMatrixWorld(true);
  collectGltf(local, c, c, (mesh) => {
    const named = namedMeshRule(mesh.userData.source as THREE.Mesh) ?? {};
    const m = mo?.(mesh.userData.source as THREE.Mesh);
    return m ? { ...named, motion: m } : named;
  });
  return c;
}

function keepAll(o: THREE.Object3D, root: THREE.Object3D, keep: (o: THREE.Object3D) => boolean) {
  for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) if (!keep(p)) return false;
  return true;
}

const named = (prefix: string) => (o: THREE.Object3D) => o.name.toLowerCase().startsWith(prefix);
const not = (f: (o: THREE.Object3D) => boolean) => (o: THREE.Object3D) => !f(o);

/** Smoke puffs from a model's `smoke_emitter`, added to its running look. */
function addSmoke(c: GeometryCollector, root: THREE.Object3D, seed: number) {
  const emitter = root.getObjectByName('smoke_emitter');
  if (!emitter) return;
  root.updateMatrixWorld(true);
  const at = emitter.getWorldPosition(new THREE.Vector3()).applyMatrix4(root.matrixWorld.clone().invert());
  const puff = new THREE.IcosahedronGeometry(0.16, 1);
  for (let i = 0; i < 4; i++) c.add(puff, null, [0.82, 0.8, 0.86], 3, false, motion.smoke(at.toArray(), i / 4, seed + i * 0.17));
}

function lookFrom(root: THREE.Group, seed: number): { idle: Geo; running: Geo } {
  const idle = collect(root, not(named('running_'))).build();
  const c = collect(root, not(named('idle_')), movingPartMotion, true);
  addSmoke(c, root, seed);
  return { idle, running: c.build() };
}

const heightOf = (g: Geo) => { g.computeBoundingBox(); return g.boundingBox ? g.boundingBox.max.y : 1; };

/** `terra`: the terra look, which prefers its restyled models and draws their vertex colours. */
export async function loadModels({ terra = false } = {}): Promise<Models> {
  vertexColours = terra;
  const names = new Set<string>(['wheat', 'tomato', 'beans', 'sunflower', 'flax', 'rock', 'truck', 'tree_oak', 'tree_pine', 'bush']);
  for (const list of Object.values(FILES)) for (const n of list!) names.add(n);
  const loaded = new Map(await Promise.all([...names].map(async (n) => [n, await load(n, terra)] as const)));
  const roots = new Map([...loaded].map(([n, l]) => [n, l?.root ?? null]));
  const missing = [...roots].filter(([, r]) => !r).map(([n]) => n);
  if (missing.length) console.info(`models drawn from stand-ins: ${missing.join(', ')}`);
  const restyled = [...loaded].filter(([, l]) => l?.terra).map(([n]) => n);
  if (terra) console.info(`terra models: ${restyled.join(', ') || 'none'}`);

  const buildings = {} as Record<BuildingId, Look>;
  BUILDING_IDS.forEach((id, i) => {
    const root = FILES[id]?.map((n) => roots.get(n)).find((r) => r) ?? null;
    const look = root ? lookFrom(root, i * 0.13) : standIn(id);
    buildings[id] = { ...look, height: heightOf(look.idle) };
  });
  // Turbines always turn, faster in stronger wind: three rotor speeds.
  const turbineRoot = roots.get('wind_turbine');
  const turbine = [0.45, 1, 1.7].map((speed) => {
    if (turbineRoot) return collect(turbineRoot, () => true, (m) => { const mo = movingPartMotion(m); return mo && mo.anim ? { ...mo, anim: [...(mo.anim as number[]).slice(0, 3), speed] as [number, number, number, number] } : mo; }, true).build();
    return standIn('turbine').running;
  });

  // A battery's charge rings (`charge_<n>`) light from the bottom up: level k shows rings 0..k-1.
  const batteryRoot = roots.get('battery');
  const battery = [0, 1, 2, 3, 4].map((level) => batteryRoot
    ? collect(batteryRoot, (o) => { const m = /^charge_(\d+)/.exec(o.name); return !m || Number(m[1]) < level; }).build()
    : buildings.battery.idle);

  const crops = {} as Record<CropId, Geo[]>;
  for (const id of CROP_IDS) {
    const n = CROPS[id].stages, root = roots.get(id);
    const stages: THREE.Object3D[] = [];
    if (root) for (let i = 0; ; i++) { const s = root.getObjectByName(`stage_${i}`); if (!s) break; stages.push(s); }
    crops[id] = Array.from({ length: n }, (_, i) => {
      if (stages.length < 2) return cropStandIn(id, i, n);
      // Spread the model's stages over the game's.
      const stage = stages[Math.round(i * (stages.length - 1) / (n - 1))];
      const height = new THREE.Box3().setFromObject(stage).max.y;
      return collect(stage, undefined, () => motion.sway(0, 0, 0, Math.max(0.3, height))).build();
    });
  }

  const rockRoot = roots.get('rock');
  const rocks = [0, 1, 2].map((v) => {
    const r = rockRoot?.getObjectByName(`variant_${v}`);
    return r ? collect(r).build() : rock(v);
  });
  const trees = (['tree_oak', 'tree_pine', 'bush'] as const).map((n) => {
    const r = roots.get(n);
    return r ? collect(r).build() : standIn('sapling').idle;
  });
  const truckRoot = roots.get('truck');

  const items = {} as Record<ItemId, Geo>;
  for (const id of ITEM_IDS) items[id] = itemShape(id);

  return {
    buildings, turbine, battery, crops, items, rocks, trees,
    wires: [...NET_COLOURS, GHOST_WIRE].map(bar), routes: ROUTE_COLOURS.map(bar),
    soil: Array.from({ length: SOIL_BANDS }, (_, b) => (terra ? terraSoilTile(b) : soilTile(b))),
    fieldSoil: terra ? Array.from({ length: SOIL_BANDS }, (_, b) => Array.from({ length: 9 }, (_, k) => terraSoilTile(b, k % 3, Math.floor(k / 3)))) : undefined,
    truck: truckRoot ? collect(truckRoot).build() : truck(),
    cursor: frame(1, 0xfff0c0),
    frames: { ok: [1, 2, 3].map((n) => frame(n, 0xd8ffb0)), bad: [1, 2, 3].map((n) => frame(n, 0xff5040)) },
    fill: tileFill(0xf4f0e0),
  };
}

/** Every geometry, for choosing the palette together with the scene's. */
export function allGeometries(m: Models): Geo[] {
  return [
    ...Object.values(m.buildings).flatMap((l) => [l.idle, l.running]), ...m.turbine, ...m.battery, ...m.wires, ...m.routes, ...Object.values(m.crops).flat(), ...Object.values(m.items),
    ...m.soil, ...m.trees, ...m.rocks, m.truck, m.cursor, ...m.frames.ok, ...m.frames.bad,
    m.fill,
  ];
}

export { C };
