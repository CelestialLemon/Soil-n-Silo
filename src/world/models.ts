import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FLAG, GeometryCollector, motion, place } from './geometry.ts';
import { BUILDING_IDS, CROP_IDS, CROPS, ITEM_IDS, type BuildingId, type CropId, type ItemId } from '../game/data.ts';
import { bar, C, cropStandIn, frame, GHOST_WIRE, itemShape, marker, NET_COLOURS, rock, ROUTE_COLOURS, SOIL_BANDS, soilTile, standIn, tileFill, truck } from './shapes.ts';

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
  trees: Geo[];
  rocks: Geo[];
  truck: Geo;
  markers: Record<'red' | 'orange' | 'yellow' | 'blue' | 'purple', Geo>;
  cursor: Geo;
  frames: { ok: Geo[]; bad: Geo[] };
  /** A flat square filling a tile, tinted per overlay. */
  fill: Geo;
}

/** Which Blender model draws each building, in order of preference. */
const FILES: Partial<Record<BuildingId, string[]>> = {
  silo: ['silo'],
  sprinkler: ['sprinkler'], coop: ['coop_solar', 'coop'], hive: ['beehive'], composter: ['composter'],
  mill: ['mill_electric'], press: ['oil_press'], spinner: ['spinner'], loom: ['loom'], bakery: ['bakery'], cannery: ['cannery'],
  solar: ['solar_panel'], turbine: ['wind_turbine'], battery: ['battery'], digester: ['digester'], pylon: ['pylon'],
  sapling: ['sapling'], depot: ['depot'],
};

const url = (name: string) => `${import.meta.env.BASE_URL}models/${name}.glb`;

async function load(name: string): Promise<THREE.Group | null> {
  try {
    const gltf = await new GLTFLoader().loadAsync(url(name));
    return gltf.scene;
  } catch {
    return null;
  }
}

/**
 * Merge the accepted meshes under `root` into ordinary vertex-coloured geometry in the model root's local space.
 */
function collect(
  root: THREE.Object3D,
  keep: (o: THREE.Object3D) => boolean = () => true,
  animated = false,
  swayDecor = false,
  speedScale = 1,
  swayHeight = 0,
) {
  const c = new GeometryCollector();
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !keepAll(mesh, root, keep)) return;
    const matrix = inverse.clone().multiply(mesh.matrixWorld);
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const color = material && 'color' in material && material.color instanceof THREE.Color
      ? [material.color.r, material.color.g, material.color.b] : null;
    const emissive = material && 'emissive' in material && material.emissive instanceof THREE.Color
      && material.emissive.getHex() !== 0 && ('emissiveIntensity' in material ? Number(material.emissiveIntensity) > 0 : true);
    let mo;
    if (animated) {
      for (let node: THREE.Object3D | null = mesh; node; node = node.parent) {
        const moving = /^move_(spin|sway)_/i.exec(node.name);
        if (!moving) continue;
        const pivotWorld = node.getWorldPosition(new THREE.Vector3());
        const axisWorld = new THREE.Vector3().setFromMatrixColumn(node.matrixWorld, 0).normalize();
        const meshInverse = mesh.matrixWorld.clone().invert();
        const pivot = pivotWorld.applyMatrix4(meshInverse), axis = axisWorld.transformDirection(meshInverse);
        const props = node.userData as { speed?: number; amplitude?: number };
        mo = moving[1].toLowerCase() === 'spin'
          ? motion.spin(pivot.toArray(), axis.toArray(), (props.speed ?? 0.6) * speedScale)
          : motion.swing(pivot.toArray(), axis.toArray(), props.amplitude ?? 0.1);
        break;
      }
    }
    if (!mo && swayDecor) {
      for (let node: THREE.Object3D | null = mesh; node; node = node.parent) {
        if (/^decor_/i.test(node.name)) { mo = motion.sway(0, 0, 0, 2.4); break; }
        if (node === root) break;
      }
    }
    if (!mo && swayHeight > 0) {
      // Use the model root as the wind pivot even when this mesh's own origin sits partway up the plant.
      const rootOriginInMesh = mesh.matrixWorld.clone().invert().multiply(root.matrixWorld);
      const pivot = new THREE.Vector3().setFromMatrixPosition(rootOriginInMesh);
      mo = motion.sway(pivot.x, pivot.z, 0, swayHeight, pivot.y);
    }
    c.add(mesh.geometry, matrix, mesh.geometry.getAttribute('color') ? null : color, emissive ? FLAG.EMISSIVE : FLAG.NORMAL, false, mo);
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
  for (let i = 0; i < 4; i++) c.add(puff, place(at.x, at.y + i * 0.12, at.z, 0, 0, 0, 0.6 + i * 0.08, 0.6 + i * 0.08, 0.6 + i * 0.08), [0.78, 0.8, 0.76], FLAG.STEAM, false, motion.smoke([0, 0, 0], i / 4, seed + i * 0.17));
}

function lookFrom(root: THREE.Group, seed: number): { idle: Geo; running: Geo } {
  const idle = collect(root, not(named('running_'))).build();
  const c = collect(root, not(named('idle_')), true);
  addSmoke(c, root, seed);
  return { idle, running: c.build() };
}

const heightOf = (g: Geo) => { g.computeBoundingBox(); return g.boundingBox ? g.boundingBox.max.y : 1; };

export async function loadModels(): Promise<Models> {
  const names = new Set<string>(['wheat', 'tomato', 'beans', 'sunflower', 'flax', 'rock', 'truck', 'tree_oak', 'tree_pine', 'bush']);
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
  const turbine = [0.45, 1, 1.7].map((speed) => {
    if (turbineRoot) return collect(turbineRoot, () => true, true, false, speed).build();
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
      return collect(stage, undefined, true, false, 1, Math.max(0.3, height)).build();
    });
  }

  const rockRoot = roots.get('rock');
  const rocks = [0, 1, 2].map((v) => {
    const r = rockRoot?.getObjectByName(`variant_${v}`);
    return r ? collect(r).build() : rock(v);
  });
  const trees = (['tree_oak', 'tree_pine', 'bush'] as const).map((n) => {
    const r = roots.get(n);
    return r ? collect(r, undefined, true, true).build() : standIn('sapling').idle;
  });
  const truckRoot = roots.get('truck');

  const items = {} as Record<ItemId, Geo>;
  for (const id of ITEM_IDS) items[id] = itemShape(id);

  return {
    buildings, turbine, battery, crops, items, rocks, trees,
    wires: [...NET_COLOURS, GHOST_WIRE].map(bar), routes: ROUTE_COLOURS.map(bar),
    soil: Array.from({ length: SOIL_BANDS }, (_, b) => soilTile(b)),
    truck: truckRoot ? collect(truckRoot, undefined, true).build() : truck(),
    markers: { red: marker(0xff4a3a), orange: marker(0xffa030), yellow: marker(0xffe060), blue: marker(0x60b8ff), purple: marker(0xc070ff) },
    cursor: frame(1, 0xfff0c0),
    frames: { ok: [1, 2, 3].map((n) => frame(n, 0xd8ffb0)), bad: [1, 2, 3].map((n) => frame(n, 0xff5040)) },
    fill: tileFill(0xf4f0e0),
  };
}

export { C };
