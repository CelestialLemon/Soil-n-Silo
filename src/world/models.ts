import * as THREE from 'three';
import type { Season } from '../game/seasons.ts';
import { collectGltf, GeometryCollector, loadGltf, motion, movingPartMotion, glassMeshRule, namedMeshRule, type Motion } from 'pixel3d-renderer';
import { BUILDING_IDS, CROP_IDS, CROPS, ITEM_IDS, type BuildingId, type CropId, type ItemId } from '../game/data.ts';
import { TREE_SPECIES, treeModel, type TreeKind } from './trees.ts';
import { bar, cropStandIn, frame, GHOST_WIRE, itemShape, NET_COLOURS, rock, ROUTE_COLOURS, standIn, truck } from './shapes.ts';

// The game's object geometries, in local space (origin on the ground at the footprint centre, front facing +z). They come
// from the Blender models in public/models/ (assets/<name>/build.py) where those exist, split by the node names the asset
// brief fixes (`stage_<n>`, `variant_<n>`, `running_*`/`idle_*`, `move_spin_*`, `smoke_emitter`), and from the stand-ins in
// shapes.ts where they don't, so a missing model never stops the game.

type Geo = THREE.BufferGeometry;

export interface Look { idle: Geo; running: Geo; height: number }

export interface Models {
  buildings: Record<BuildingId, Look>;
  /** Turbine rotors: standing still, then at three wind speeds. */
  turbine: Geo[];
  /** The weather station with its anemometer turning at three wind speeds (light, moderate, strong). */
  station: Geo[];
  /** Batteries with 0 to 4 charge rings lit. */
  battery: Geo[];
  /** Bars for drawing power: one per network colour (`NET_COLOURS`), then the build preview's. */
  wires: Geo[];
  /** Bars for drawing routes on the ground: one per route colour (`ROUTE_COLOURS`). */
  routes: Geo[];
  crops: Record<CropId, Geo[]>;
  items: Record<ItemId, Geo>;
  /** Each tree species' three variants in the level's season (a bush's three are the one model). */
  trees: Record<TreeKind, Geo[]>;
  rocks: Geo[];
  truck: Geo;
  frames: { ok: Geo[]; bad: Geo[] };
}

/** Which Blender model draws each building. */
const FILES: Partial<Record<BuildingId, string>> = {
  silo: 'silo', garage: 'garage', greenhouse: 'greenhouse',
  sprinkler: 'sprinkler', coop: 'coop_solar', hive: 'beehive', composter: 'composter',
  mill: 'mill_electric', press: 'oil_press', spinner: 'spinner', loom: 'loom', bakery: 'bakery', cannery: 'cannery',
  solar: 'solar_panel', turbine: 'wind_turbine', wheel: 'water_wheel', battery: 'battery', digester: 'digester', pylon: 'pylon', station: 'weather_station',
  sapling: 'sapling', depot: 'depot',
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
function collect(root: THREE.Object3D, keep: (o: THREE.Object3D) => boolean = () => true, mo?: (mesh: THREE.Mesh) => Motion | undefined, animated = !!mo, glass = false) {
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
    const named = (glass ? glassMeshRule : namedMeshRule)(mesh.userData.source as THREE.Mesh) ?? {};
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

function lookFrom(root: THREE.Group, seed: number, glass = false): { idle: Geo; running: Geo } {
  const idle = collect(root, not(named('running_')), undefined, false, glass).build();
  const c = collect(root, not(named('idle_')), glass ? undefined : movingPartMotion, !glass, glass);
  addSmoke(c, root, seed);
  return { idle, running: c.build() };
}

const heightOf = (g: Geo) => { g.computeBoundingBox(); return g.boundingBox ? g.boundingBox.max.y : 1; };

/** The game's models, with the trees and bushes of `season` (fixed for the level). */
export async function loadModels(season: Season): Promise<Models> {
  const names = new Set<string>(['wheat', 'tomato', 'beans', 'sunflower', 'flax', 'rock', 'truck', treeModel('bush', season), ...TREE_SPECIES.map((t) => treeModel(t, season))]);
  for (const n of Object.values(FILES)) names.add(n);
  const roots = new Map<string, THREE.Group | null>(await Promise.all([...names].map(async (n) => [n, await load(n)] as const)));
  const missing = [...roots].filter(([, r]) => !r).map(([n]) => n);
  if (missing.length) console.info(`models drawn from stand-ins: ${missing.join(', ')}`);

  const buildings = {} as Record<BuildingId, Look>;
  BUILDING_IDS.forEach((id, i) => {
    const file = FILES[id], root = file ? roots.get(file) ?? null : null;
    const look = root ? lookFrom(root, i * 0.13, id === 'greenhouse') : standIn(id);
    buildings[id] = { ...look, height: heightOf(look.idle) };
  });
  // Turbines turn, faster in stronger wind: three rotor speeds; a fourth look has the rotor standing still (stopped by a gale).
  const turbineRoot = roots.get('wind_turbine');
  const turbine = [null, 0.45, 1, 1.7].map((speed) => {
    if (!turbineRoot) return speed === null ? standIn('turbine').idle : standIn('turbine').running;
    if (speed === null) return collect(turbineRoot, () => true).build();
    return collect(turbineRoot, () => true, (m) => { const mo = movingPartMotion(m); return mo && mo.anim ? { ...mo, anim: [...(mo.anim as number[]).slice(0, 3), speed] as [number, number, number, number] } : mo; }, true).build();
  });

  // The weather station's cups turn with the wind whether it is powered or not: three speeds, light, moderate and strong (and every gale).
  const stationRoot = roots.get('weather_station');
  const station = [1.5, 3.5, 6].map((speed) => stationRoot
    ? collect(stationRoot, () => true, (m) => { const mo = movingPartMotion(m); return mo && mo.anim ? { ...mo, anim: [...(mo.anim as number[]).slice(0, 3), speed] as [number, number, number, number] } : mo; }, true).build()
    : standIn('station').running);

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
  const trees = {} as Record<TreeKind, Geo[]>;
  for (const t of TREE_SPECIES) {
    const root = roots.get(treeModel(t, season));
    trees[t] = [0, 1, 2].map((v) => { const r = root?.getObjectByName(`variant_${v}`); return r ? collect(r).build() : standIn('sapling').idle; });
  }
  const bushRoot = roots.get(treeModel('bush', season)), bush = bushRoot ? collect(bushRoot).build() : standIn('sapling').idle;
  trees.bush = [bush, bush, bush];
  const truckRoot = roots.get('truck');

  const items = {} as Record<ItemId, Geo>;
  for (const id of ITEM_IDS) items[id] = itemShape(id);

  return {
    buildings, turbine, station, battery, crops, items, rocks, trees,
    wires: [...NET_COLOURS, GHOST_WIRE].map(bar), routes: ROUTE_COLOURS.map(bar),
    truck: truckRoot ? collect(truckRoot).build() : truck(),
    frames: { ok: [1, 2, 3].map((n) => frame(n, 0xd8ffb0)), bad: [1, 2, 3].map((n) => frame(n, 0xff5040)) },
  };
}

/** Every geometry, for choosing the palette together with the scene's. */
export function allGeometries(m: Models): Geo[] {
  // Each once: some are shared (a bush's variants, stand-ins), and the palette recolours every geometry it is given.
  return [...new Set([
    ...Object.values(m.buildings).flatMap((l) => [l.idle, l.running]), ...m.turbine, ...m.station, ...m.battery, ...m.wires, ...m.routes, ...Object.values(m.crops).flat(), ...Object.values(m.items),
    ...Object.values(m.trees).flat(), ...m.rocks, m.truck, ...m.frames.ok, ...m.frames.bad,

  ])];
}
