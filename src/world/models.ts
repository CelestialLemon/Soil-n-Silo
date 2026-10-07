import * as THREE from 'three';
import { collectGltf, FLAG, GeometryCollector, linearColor as lin, loadGltf, motion, movingPartMotion, namedMeshRule, type Motion } from 'pixel3d-renderer';
import { CROPS, type CropId } from '../game/crops.ts';
import { box } from './kit.ts';

// The game's object geometries, in local space (origin on the ground at the footprint centre, front facing +z). Most come
// from the Blender models in public/models/ (assets/<name>/build.py), split by the node names the asset brief fixes:
// `stage_<n>` growth stages, `running_*`/`idle_*` machine looks, `smoke_emitter`, the coop's `door` and the trough's `fill`.
// A model that fails to load is drawn as a plain box of its size, so a missing file shows rather than breaking the game.

type Geo = THREE.BufferGeometry;

export interface Models {
  crops: Record<CropId, Geo[]>;
  chicken: Geo;
  coop: Geo;
  /** The coop door, its origin on the hinge; `doorHinge` is where the hinge sits in the coop's space. */
  coopDoor: Geo;
  doorHinge: THREE.Vector3;
  trough: { empty: Geo; full: Geo };
  farmhouse: Geo;
  shop: Geo;
  bin: Geo;
  mill: { idle: Geo; running: Geo };
  oven: { idle: Geo; running: Geo };
  eggNest: Geo;
  manure: Geo;
  /** Farm dressing, baked into the static scene. */
  trees: { oak: Geo; pine: Geo; bush: Geo };
  /** Tilled soil, one per fertility band, dry then watered: soil[band][watered ? 1 : 0]. */
  soil: Geo[][];
  /** The frame marking the tile under the pointer, and the 2 x 2 frame for placing a machine where it fits and where it doesn't. */
  cursor: Geo;
  place: { ok: Geo; bad: Geo };
}

export const SOIL_BANDS = 5;
/** Soil colour per fertility band (design doc: pale to rich dark brown as fertility rises), dry and watered. */
const SOIL = [[0xb09468, 0x8a7050], [0x9a7a52, 0x76583c], [0x82603e, 0x604530], [0x664730, 0x4a3222], [0x4e3422, 0x36231a]];
export const soilBand = (fertility: number) => Math.min(SOIL_BANDS - 1, Math.floor(fertility / (100 / SOIL_BANDS)));
/** Height of the top of tilled soil above the grass. */
export const SOIL_TOP = 0.03;

const url = (name: string) => `${import.meta.env.BASE_URL}models/${name}.glb`;

async function load(name: string): Promise<THREE.Group | null> {
  try {
    return await loadGltf(url(name));
  } catch (e) {
    console.warn(`model ${name}: ${(e as Error).message}; drawing a placeholder`);
    return null;
  }
}

/**
 * One geometry from the meshes under `root` that `keep` accepts, in `root`'s space. `mo` gives a mesh its motion; with
 * it, the geometry has motion attributes (a dynamic collector), so the renderer animates it.
 */
function collect(root: THREE.Object3D, keep: (o: THREE.Object3D) => boolean = () => true, mo?: (mesh: THREE.Mesh) => Motion | undefined, animated = !!mo) {
  const c = new GeometryCollector(animated);
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const local = new THREE.Group();
  // Collect in the root's own space: copy each kept mesh with its transform relative to the root.
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

/** `keep` holds for the mesh and every ancestor up to `root`. */
function keepAll(o: THREE.Object3D, root: THREE.Object3D, keep: (o: THREE.Object3D) => boolean) {
  for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) if (!keep(p)) return false;
  return true;
}

const named = (prefix: string) => (o: THREE.Object3D) => o.name.toLowerCase().startsWith(prefix);
const not = (f: (o: THREE.Object3D) => boolean) => (o: THREE.Object3D) => !f(o);

/** A placeholder: a box of the model's size and colour. */
function placeholder(w: number, h: number, d: number, hex: number, animated = false) {
  const c = new GeometryCollector(animated);
  box(c, 0, 0, 0, w, h, d, hex);
  return c.build();
}

/** Puffs of smoke rising from `emitter`, added to a machine's running look. */
function smoke(c: GeometryCollector, emitter: THREE.Vector3, seed: number) {
  const puff = new THREE.IcosahedronGeometry(0.2, 1);
  for (let i = 0; i < 5; i++) c.add(puff, null, lin(0xe8e4ee), FLAG.STEAM, false, motion.smoke(emitter.toArray(), i / 5, seed + i * 0.17));
}

function cropStages(root: THREE.Group | null, id: CropId): Geo[] {
  const n = CROPS[id].stages;
  return Array.from({ length: n }, (_, i) => {
    const stage = root?.getObjectByName(`stage_${i}`);
    if (!stage) return placeholder(0.3 + 0.1 * i, 0.1 + 0.15 * i, 0.3 + 0.1 * i, i === n - 1 ? 0xe0a030 : 0x5a9a3a, true);
    // Every part leans in the wind about the plant's foot; the lean grows with height, so low fruit barely moves.
    const height = new THREE.Box3().setFromObject(stage).max.y;
    return collect(stage, undefined, () => motion.sway(0, 0, 0, Math.max(0.3, height))).build();
  });
}

function machine(root: THREE.Group | null, size: [number, number, number], hex: number, seed: number) {
  if (!root) return { idle: placeholder(...size, hex), running: placeholder(...size, 0xffb050) };
  const idle = collect(root, not(named('running_'))).build();
  const c = collect(root, not(named('idle_')), movingPartMotion, true);
  const emitter = root.getObjectByName('smoke_emitter');
  if (emitter) smoke(c, emitter.getWorldPosition(new THREE.Vector3()), seed);
  return { idle, running: c.build() };
}

function frame(w: number, d: number, hex: number) {
  const c = new GeometryCollector();
  const t = 0.06, x = w / 2 - t / 2, z = d / 2 - t / 2;
  for (const [cx, cz, fw, fd] of [[0, -z, w, t], [0, z, w, t], [-x, 0, t, d - 2 * t], [x, 0, t, d - 2 * t]]) box(c, cx, 0, cz, fw, 0.02, fd, hex, FLAG.EMISSIVE);
  return c.build();
}

export async function loadModels(): Promise<Models> {
  const names = ['wheat', 'tomato', 'pumpkin', 'chicken', 'coop', 'trough', 'farmhouse', 'shop_stall', 'shipping_bin', 'mill', 'oven', 'egg_nest', 'manure', 'tree_oak', 'tree_pine', 'bush'] as const;
  const roots = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await load(n)] as const))) as Record<typeof names[number], THREE.Group | null>;
  const model = (n: typeof names[number], size: [number, number, number], hex: number) => (roots[n] ? collect(roots[n]).build() : placeholder(...size, hex));

  let coop: Geo, coopDoor: Geo, doorHinge = new THREE.Vector3(-0.3, 0, 1.3);
  const door = roots.coop?.getObjectByName('door');
  if (roots.coop && door) {
    coop = collect(roots.coop, not(named('door'))).build();
    door.updateWorldMatrix(true, false);
    doorHinge = door.getWorldPosition(new THREE.Vector3());
    coopDoor = collect(door).build();
  } else {
    coop = model('coop', [2.6, 1.8, 2.4], 0xb8603a);
    coopDoor = placeholder(0.6, 0.9, 0.05, 0x4a3424);
    coopDoor.translate(0.3, 0, 0);
  }

  const trough = roots.trough
    ? { empty: collect(roots.trough, not(named('fill'))).build(), full: collect(roots.trough).build() }
    : { empty: placeholder(1, 0.3, 0.4, 0x8a6a44), full: placeholder(1, 0.35, 0.4, 0xd8b860) };

  const soil = SOIL.map((pair) => pair.map((hex) => {
    const c = new GeometryCollector();
    box(c, 0, -0.08, 0, 0.94, 0.08 + SOIL_TOP, 0.94, hex);
    return c.build();
  }));

  return {
    crops: { wheat: cropStages(roots.wheat, 'wheat'), tomato: cropStages(roots.tomato, 'tomato'), pumpkin: cropStages(roots.pumpkin, 'pumpkin') },
    chicken: model('chicken', [0.3, 0.35, 0.4], 0xf4efe4),
    coop, coopDoor, doorHinge, trough,
    farmhouse: model('farmhouse', [3.6, 2.4, 2.6], 0xd8c8a8),
    shop: model('shop_stall', [1.9, 1.8, 0.9], 0xc04040),
    bin: model('shipping_bin', [0.9, 0.7, 0.7], 0x9a7048),
    mill: machine(roots.mill, [1.6, 2.6, 1.6], 0xe0d4b8, 0.3),
    oven: machine(roots.oven, [1.6, 1.4, 1.6], 0xb06040, 0.7),
    eggNest: model('egg_nest', [0.35, 0.18, 0.35], 0xf0e8d0),
    manure: model('manure', [0.3, 0.14, 0.3], 0x5a3a20),
    trees: { oak: model('tree_oak', [1.6, 3, 1.6], 0x4f8a3a), pine: model('tree_pine', [1.4, 3.2, 1.4], 0x3a6a3a), bush: model('bush', [0.8, 0.7, 0.8], 0x4f8a3a) },
    soil,
    cursor: frame(1, 1, 0xfff0c0),
    place: { ok: frame(2, 2, 0xfff0c0), bad: frame(2, 2, 0xff5040) },
  };
}

/** Every geometry, for choosing the palette together with the scene's. */
export function allGeometries(m: Models): Geo[] {
  return [
    ...Object.values(m.crops).flat(), m.chicken, m.coop, m.coopDoor, m.trough.empty, m.trough.full, m.farmhouse, m.shop, m.bin,
    m.mill.idle, m.mill.running, m.oven.idle, m.oven.running, m.eggNest, m.manure, ...m.soil.flat(), m.cursor, m.place.ok, m.place.bad,
  ];
}
