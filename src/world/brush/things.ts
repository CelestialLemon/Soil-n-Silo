import * as THREE from 'three';
import { loadModel, MeshBuilder, MODELS, ModelSet, PLAIN, srgb, type BrushRenderer } from '../../../brush3d/src/index.ts';
import { BUILDINGS, type BuildingId } from '../../game/data.ts';
import { growsCrops, layoutOf, sizeOf, type Building, type GameState } from '../../game/state.ts';
import { standY, type Lie } from '../ground.ts';
import { MODEL_OF, TRUCK_MODEL, YAW } from './catalog.ts';
import { RISE, TILE } from './scale.ts';

// What the game builds and drives, as brush3d's solarpunk models (#203, brush3d/docs/MODELS.md): each building its model
// on its footprint, turned the way the game turns it (catalog.ts), standing level at the height the game levels it to; each
// truck the truck model, facing the way it drives and leaning with the ground on a ramp. A model's painted plants grow on
// it (its planted roofs and planters), as in the demo.
//
// The models load once, at the start; until they have (or if one fails), a grey stand-in shows, so what isn't drawn shows
// rather than silently missing. A field and a sapling aren't models: what grows is painted, and #213 draws them (here a
// low bed and a grey block until then).
//
// Still to come: a world that changes without a stutter (#204: today a building's meshes are made and dropped here as the
// game places and removes it), the moving parts and building states (#205: rotors, wheels and millstones are drawn at
// rest and every `running_*` look as if working, as in the demo), and the markers and the build preview (#206). The
// water wheel dips 0.87 m below its bank into a race the land has to cut for it (`wheelRace`, the land's: #202). Trees and
// rocks are wild.ts's.

const GREY = srgb(0x9a968e), FIELD = srgb(0x8a7a62);
/** How far a stand-in block stands in from its footprint's edge (m). */
const INSET = 0.3;
/** How far ahead of and behind its middle a truck feels the ground for its lean (world units, as the pixel world's). */
const FEEL = 0.3;

/** How tall a building's stand-in stands (m): a field's bed low, a tall building tall, the rest by size. */
function standInHeight(type: BuildingId) {
  const def = BUILDINGS[type];
  if (type === 'field') return 0.3;
  if (def.tall) return 9;
  return def.size === 1 ? 2.5 : def.size === 2 ? 5 : 4;
}

/** How tall a building stands (m): its model's top, or its stand-in's (for where its marker and its card go). */
export function thingHeight(type: BuildingId) {
  const name = MODEL_OF[type];
  return name ? MODELS[name].hi[1] : standInHeight(type);
}

/** A box of `w` × `h` × `d` metres, standing on its middle at `at`, into `b`. */
function box(b: MeshBuilder, w: number, h: number, d: number, at: THREE.Matrix4, c: THREE.Color) {
  const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
  b.addGeometry(g, at, c, PLAIN);
  g.dispose();
}

interface Shown { meshes: THREE.Mesh[]; key: string }

const UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1);

export class Things {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly buildings = new Map<number, Shown>();
  private readonly trucks = new Map<number, Shown>();
  private layout = -1;
  /** The models by name, once loaded (one that failed to load is missing, and draws as its stand-in). */
  private models: Map<string, THREE.Object3D> | null = null;

  constructor(r: BrushRenderer, lie: Lie) {
    this.r = r; this.lie = lie;
    void this.load();
  }

  private async load() {
    const names = [...new Set([...Object.values(MODEL_OF), TRUCK_MODEL])];
    const loaded = await Promise.all(names.map(async (name) => {
      try { return [name, await loadModel(MODELS[name].url)] as const; } catch (e) { console.warn(`brush3d: the ${name} model failed to load`, e); return null; }
    }));
    this.models = new Map(loaded.filter((l) => l !== null));
    // Every stand-in is swapped for its model at the next sync.
    this.layout = -1;
  }

  /** Follows the game: buildings placed, removed and moved by earthworks, trucks driving. */
  sync(s: GameState) {
    const v = layoutOf(s);
    if (v !== this.layout) { this.layout = v; this.syncBuildings(s); }
    this.syncTrucks(s);
  }

  /** Where a truck is drawn (world units), if it is. */
  truckAt(id: number) {
    const m = this.trucks.get(id)?.meshes[0];
    return m ? { x: m.position.x / TILE, z: m.position.z / TILE } : null;
  }

  private syncBuildings(s: GameState) {
    const seen = new Set<number>(), drawn = this.models ? 'model' : 'stand-in';
    for (const b of s.buildings) {
      seen.add(b.id);
      // Its kind, where it stands, which way it faces and how high: a building moved by earthworks under it stands anew.
      const n = sizeOf(b), y = standY(this.lie, s.map, n, b.x, b.y) * RISE * TILE, key = `${b.type} ${b.x} ${b.y} ${b.rot} ${y} ${drawn}`;
      const was = this.buildings.get(b.id);
      if (was?.key === key) continue;
      if (was) this.drop(was.meshes);
      this.buildings.set(b.id, { meshes: this.building(b, n, y), key });
    }
    for (const [id, was] of this.buildings) if (!seen.has(id)) { this.drop(was.meshes); this.buildings.delete(id); }
  }

  /** A building's meshes: its model (inked, its planted surfaces and its plants painted), or its stand-in. */
  private building(b: Building, n: number, y: number): THREE.Mesh[] {
    const name = MODEL_OF[b.type], model = name ? this.models?.get(name) : undefined;
    const centre = new THREE.Vector3((b.x + n / 2) * TILE, y, (b.y + n / 2) * TILE);
    if (model) {
      // Its plants are seeded by where it stands, so it grows the same ones each time it's drawn there.
      const set = new ModelSet(1 + b.x * 7919 + b.y * 104729);
      set.add(model, new THREE.Matrix4().compose(centre, new THREE.Quaternion().setFromAxisAngle(UP, YAW[b.rot]), ONE));
      return set.addTo(this.r);
    }
    const side = n * TILE - 2 * INSET, mb = new MeshBuilder('ink');
    box(mb, side, standInHeight(b.type), side, new THREE.Matrix4().makeTranslation(centre), growsCrops(b) && b.type === 'field' ? FIELD : GREY);
    return [this.r.add(mb.build(), 'ink')];
  }

  /** A truck's mesh, at the origin facing +z: its model, or a block. It's no roof: it moves (no cover). */
  private truck(): THREE.Mesh {
    const model = this.models?.get(TRUCK_MODEL);
    if (model) {
      const set = new ModelSet();
      set.add(model, new THREE.Matrix4());
      return this.r.add(set.ink.build(), 'ink', { cover: 'none' });
    }
    const mb = new MeshBuilder('ink');
    box(mb, 1.6, 1.4, 3.2, new THREE.Matrix4(), GREY);
    return this.r.add(mb.build(), 'ink', { cover: 'none' });
  }

  private syncTrucks(s: GameState) {
    const seen = new Set<number>(), drawn = this.models ? 'model' : 'stand-in';
    for (const t of s.trucks) {
      seen.add(t.id);
      let shown = this.trucks.get(t.id);
      if (shown?.key !== drawn) {
        if (shown) this.drop(shown.meshes);
        shown = { meshes: [this.truck()], key: drawn };
        this.trucks.set(t.id, shown);
      }
      // On a ramp it leans with the ground: the slope along its heading, from the ground a little ahead of it and behind.
      const fx = Math.sin(t.heading) * FEEL, fz = Math.cos(t.heading) * FEEL;
      const rise = (this.lie.y(t.x + fx, t.y + fz) - this.lie.y(t.x - fx, t.y - fz)) * RISE;
      const mesh = shown.meshes[0];
      mesh.position.set(t.x * TILE, this.lie.y(t.x, t.y) * RISE * TILE, t.y * TILE);
      mesh.rotation.set(-Math.atan2(rise, 2 * FEEL), t.heading, 0, 'YXZ');
    }
    for (const [id, was] of this.trucks) if (!seen.has(id)) { this.drop(was.meshes); this.trucks.delete(id); }
  }

  private drop(meshes: THREE.Mesh[]) {
    for (const mesh of meshes) {
      this.r.remove(mesh);
      mesh.geometry.dispose();
    }
  }
}
