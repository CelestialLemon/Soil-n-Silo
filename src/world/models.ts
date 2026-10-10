import * as THREE from 'three';
import { collectGltf, GeometryCollector, loadGltf, motion, movingPartMotion, namedMeshRule, type Motion } from 'pixel3d-renderer';
import { BELT, BUILDING_IDS, CROP_IDS, CROPS, ITEM_IDS, type BuildingId, type CropId, type ItemId } from '../game/data.ts';
import { arrow, C, cropStandIn, drone, frame, itemShape, marker, rock, SOIL_BANDS, soilTile, standIn, tileFill } from './shapes.ts';

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
  crops: Record<CropId, Geo[]>;
  items: Record<ItemId, Geo>;
  soil: Geo[];
  trees: Geo[];
  rocks: Geo[];
  drone: Geo;
  markers: Record<'red' | 'orange' | 'yellow' | 'blue' | 'purple', Geo>;
  cursor: Geo;
  frames: { ok: Geo[]; bad: Geo[] };
  /** A flat square filling a tile, tinted per overlay. */
  fill: Geo;
  /** Chevrons gliding along a belt's deck the way goods go (built along +x). */
  arrow: Geo;
}

/** Which Blender model draws each building, in order of preference. */
const FILES: Partial<Record<BuildingId, string[]>> = {
  belt: ['belt'], splitter: ['splitter'], sorter: ['sorter'], crossing: ['crossing'], pad: ['drone_pad'],
  sprinkler: ['sprinkler'], coop: ['coop_solar', 'coop'], hive: ['beehive'], composter: ['composter'],
  mill: ['mill_electric'], press: ['oil_press'], spinner: ['spinner'], loom: ['loom'], bakery: ['bakery'], cannery: ['cannery'],
  solar: ['solar_panel'], turbine: ['wind_turbine'], battery: ['battery'], digester: ['digester'], pylon: ['pylon'],
  sapling: ['sapling'], depot: ['depot'],
};

const url = (name: string) => `${import.meta.env.BASE_URL}models/${name}.glb`;

async function load(name: string): Promise<THREE.Group | null> {
  try {
    return await loadGltf(url(name));
  } catch {
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

export async function loadModels(): Promise<Models> {
  const names = new Set<string>(['wheat', 'tomato', 'beans', 'sunflower', 'flax', 'rock', 'drone', 'tree_oak', 'tree_pine', 'bush']);
  for (const list of Object.values(FILES)) for (const n of list!) names.add(n);
  const roots = new Map<string, THREE.Group | null>(await Promise.all([...names].map(async (n) => [n, await load(n)] as const)));
  const missing = [...roots].filter(([, r]) => !r).map(([n]) => n);
  if (missing.length) console.info(`models drawn from stand-ins: ${missing.join(', ')}`);

  const buildings = {} as Record<BuildingId, Look>;
  BUILDING_IDS.forEach((id, i) => {
    const root = FILES[id]?.map((n) => roots.get(n)).find((r) => r) ?? null;
    const look = root ? lookFrom(root, i * 0.13) : standIn(id);
    buildings[id] = { ...look, height: heightOf(look.idle) };
  });
  // Turbines always turn, faster in stronger wind: three rotor speeds.
  const turbineRoot = roots.get('wind_turbine');
  const turbine = [0.6, 1.6, 3].map((speed) => {
    if (turbineRoot) return collect(turbineRoot, () => true, (m) => { const mo = movingPartMotion(m); return mo && mo.anim ? { ...mo, anim: [...(mo.anim as number[]).slice(0, 3), speed] as [number, number, number, number] } : mo; }, true).build();
    return standIn('turbine').running;
  });

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
  const droneRoot = roots.get('drone');

  const items = {} as Record<ItemId, Geo>;
  for (const id of ITEM_IDS) items[id] = itemShape(id);

  return {
    buildings, turbine, crops, items, rocks, trees,
    soil: Array.from({ length: SOIL_BANDS }, (_, b) => soilTile(b)),
    drone: droneRoot ? collect(droneRoot, () => true, movingPartMotion, true).build() : drone(),
    markers: { red: marker(0xff4a3a), orange: marker(0xffa030), yellow: marker(0xffe060), blue: marker(0x60b8ff), purple: marker(0xc070ff) },
    cursor: frame(1, 0xfff0c0),
    frames: { ok: [1, 2, 3].map((n) => frame(n, 0xd8ffb0)), bad: [1, 2, 3].map((n) => frame(n, 0xff5040)) },
    fill: tileFill(0xf4f0e0),
    arrow: arrow(BELT.speed),
  };
}

/** Every geometry, for choosing the palette together with the scene's. */
export function allGeometries(m: Models): Geo[] {
  return [
    ...Object.values(m.buildings).flatMap((l) => [l.idle, l.running]), ...m.turbine, ...Object.values(m.crops).flat(), ...Object.values(m.items),
    ...m.soil, ...m.trees, ...m.rocks, m.drone, ...Object.values(m.markers), m.cursor, ...m.frames.ok, ...m.frames.bad,
    m.fill, m.arrow,
  ];
}

export { C };
