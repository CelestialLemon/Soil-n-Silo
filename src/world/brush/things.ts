import * as THREE from 'three';
import { loadModel, MeshBuilder, MODELS, ModelSet, PLAIN, srgb, type BrushRenderer, type ModelParts } from '../../../brush3d/src/index.ts';
import { BUILDINGS, type BuildingId } from '../../game/data.ts';
import { HANDOFF_SECONDS, recentHandoffs } from '../../game/sim/goods.ts';
import { buildingById, growsCrops, layoutOf, sizeOf, type Building, type GameState } from '../../game/state.ts';
import { standY, type Lie } from '../ground.ts';
import { MODEL_OF, TRUCK_MODEL, YAW } from './catalog.ts';
import { BED, Goods } from './goods.ts';
import { RISE, TILE } from './scale.ts';
import { partsLook, stateOf, type ThingState } from './states.ts';

// What the game builds and drives, as brush3d's solarpunk models (#203, brush3d/docs/MODELS.md): each building its model
// on its footprint, turned the way the game turns it (catalog.ts), standing level at the height the game levels it to; each
// truck the truck model, facing the way it drives and leaning with the ground on a ramp. A model's painted plants grow on
// it (its planted roofs and planters), as in the demo.
//
// The models load once, at the start; until they have (or if one fails), a grey stand-in shows, so what isn't drawn shows
// rather than silently missing. A field and a sapling aren't models: what grows is painted (wild.ts, #213); a field here is
// the low bed its crop grows on.
//
// A world that changes in play (#204): a building is made when it's placed (its model's meshes, 0.3 to 4 ms) and taken out
// when it's removed; only what its key holds makes it again (its kind, where it stands, which way, how high, and model or
// stand-in), never the game's other changes. The shelter map is drawn again only round it (brush3d's ShelterMap). Every
// truck draws the one truck shape (made once, never disposed), placed by its mesh's position and turn: a truck bought
// costs a mesh, not a model.
//
// Moving parts and building states (#205, states.ts): each building's model parts (brush3d's ModelParts) are on its record
// (Drawn), made with it and dropped with it, and told how they are at each step of the game without making the building
// again (its key stays as it is): rotors, wheels and stones turning at the pace the game gives, the running looks shown
// while it works, a battery's charge rings lit as it fills. The renderer eases each part to its pace and turns it on its
// own clock: at the game's 2× or 16× a rotor turns as at 1× (faster would strobe), and while the game is paused they come
// to rest. The trucks' wheels don't turn (every truck draws one shared shape). Each mesh is tagged with its building's or
// truck's id for the tools' picks and marks (tools.ts, #206: `meshesOf`, `changes`). The water wheel
// dips 0.87 m below its bank into a race the land has to cut for it (`wheelRace`, the land's: #202). Trees, rocks,
// saplings and the fields' crops are wild.ts's.
//
// The goods a truck carries ride in its bed, and goods handed to a building next door hop over the edge the two share
// (goods.ts: their look is the developer's pick). A good in a bed is tagged with its truck's id, so a pick on it gives the
// truck; one being handed over is tagged with none, so a pick on it gives the building on the tile it's over.

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

/**
 * A building or truck as drawn: its meshes, and the key of what they were made from (made again only when it changes);
 * a building's model parts (#205), made with its meshes and told how they are at each step (`syncParts`), and the state
 * it's read in.
 */
interface Drawn { meshes: THREE.Mesh[]; key: string; parts?: ModelParts; state?: ThingState }

const UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1), at = new THREE.Matrix4(), local = new THREE.Matrix4();
/** How high a good handed next door hops at the top of its arc (m). */
const HOP = 1.6;

/** Where a good crosses between footprints `a0`..`a0 + na` and `b0`..`b0 + nb` along one axis, and which way (as view.ts). */
function edge(a0: number, na: number, b0: number, nb: number): { at: number; dir: number } {
  if (a0 + na <= b0) return { at: b0, dir: 1 };
  if (b0 + nb <= a0) return { at: a0, dir: -1 };
  return { at: (Math.max(a0, b0) + Math.min(a0 + na, b0 + nb)) / 2, dir: 0 };
}

export class Things {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly buildings = new Map<number, Drawn>();
  private readonly trucks = new Map<number, Drawn>();
  private layout = -1;
  /** The models by name, once loaded (one that failed to load is missing, and draws as its stand-in). */
  private models: Map<string, THREE.Object3D> | null = null;
  /**
   * Counts the meshes made and taken out (a building placed, removed or redrawn, a truck bought), and a truck loaded or
   * unloaded: what is under the pointer may have changed (tools.ts, #206). Trucks driving on are not counted.
   */
  changes = 0;
  /** The game's clock at the last frame (to know it's paused), and the step its buildings' parts were last told. */
  private clock = -1;
  private told = -1;
  /** The truck's shape, model or stand-in, made once and shared by every truck (never disposed: it's small). */
  private readonly truckShapes = new Map<string, THREE.BufferGeometry>();

  /** Settles once the models are in (or failed): the load's end, for #210's profile. */
  readonly ready: Promise<void>;

  private readonly goods: Goods;

  constructor(r: BrushRenderer, lie: Lie, goods: Goods) {
    this.r = r; this.lie = lie; this.goods = goods;
    this.ready = this.load();
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
    this.syncParts(s);
    this.goods.begin();
    this.syncTrucks(s);
    this.syncHandoffs(s);
    this.goods.end();
    // A truck loaded or unloaded where it stands: what's under the pointer may have changed (a good handed next door moves
    // on its own each frame, and counts only as it shows and goes: a pick on it gives the building under it anyway).
    if (this.goods.changed) this.changes++;
  }

  /** The state a building is read in now (states.ts), if it's drawn. */
  stateOf(id: number): ThingState | undefined { return this.buildings.get(id)?.state; }

  /**
   * Tells each building's parts how they are, at each step of the game (and at once for one just made): their pace, the
   * running look, the charge. While the game is paused (its clock stands still), every part comes to rest.
   */
  private syncParts(s: GameState) {
    const clock = s.time + s.carry, paused = clock === this.clock;
    this.clock = clock;
    if (paused && this.told !== -1) for (const d of this.buildings.values()) d.parts?.spin(0);
    const fresh = !paused && this.told !== s.time;
    this.told = paused ? -1 : s.time;
    for (const b of s.buildings) {
      const d = this.buildings.get(b.id);
      // Each step, and at once for one just made (its parts start at rest, as if working).
      if (!d || (!fresh && d.state !== undefined)) continue;
      d.state = stateOf(b);
      if (!d.parts?.any) continue;
      const look = partsLook(s, b);
      d.parts.spin(paused ? 0 : look.pace);
      d.parts.show({ running: look.running, charge: look.charge });
    }
  }

  /** A building's or truck's meshes as drawn (the tools mark them, #206), or none. */
  meshesOf(id: number): readonly THREE.Mesh[] { return this.buildings.get(id)?.meshes ?? this.trucks.get(id)?.meshes ?? []; }

  /** The model a building is drawn with, once loaded (for its build preview, #206), or null: it draws as a stand-in. */
  modelOf(type: BuildingId): THREE.Object3D | null {
    const name = MODEL_OF[type];
    return (name && this.models?.get(name)) || null;
  }

  /** Where a truck is drawn (world units), if it is. */
  truckAt(id: number) {
    const m = this.trucks.get(id)?.meshes[0];
    return m ? { x: m.position.x / TILE, z: m.position.z / TILE } : null;
  }

  private syncBuildings(s: GameState) {
    const seen = new Set<number>(), drawn = this.models ? 'model' : 'stand-in';
    for (const b of s.buildings) {
      // A sapling is painted, as what grows is (wild.ts, #213).
      if (b.type === 'sapling') continue;
      seen.add(b.id);
      // Its kind, where it stands, which way it faces and how high: a building moved by earthworks under it stands anew.
      const n = sizeOf(b), y = standY(this.lie, s.map, n, b.x, b.y) * RISE * TILE, key = `${b.type} ${b.x} ${b.y} ${b.rot} ${y} ${drawn}`;
      const was = this.buildings.get(b.id);
      if (was?.key === key) continue;
      if (was) this.drop(was.meshes);
      this.buildings.set(b.id, { ...this.building(b, n, y), key });
      this.changes++;
    }
    for (const [id, was] of this.buildings) if (!seen.has(id)) { this.drop(was.meshes); this.buildings.delete(id); }
  }

  /** A building's meshes: its model (inked, its planted surfaces and its plants painted) and its parts, or its stand-in. */
  private building(b: Building, n: number, y: number): { meshes: THREE.Mesh[]; parts?: ModelParts } {
    const name = MODEL_OF[b.type], model = name ? this.models?.get(name) : undefined;
    const centre = new THREE.Vector3((b.x + n / 2) * TILE, y, (b.y + n / 2) * TILE);
    if (model) {
      // Its plants are seeded by where it stands, so it grows the same ones each time it's drawn there.
      const set = new ModelSet(1 + b.x * 7919 + b.y * 104729);
      const parts = set.add(model, new THREE.Matrix4().compose(centre, new THREE.Quaternion().setFromAxisAngle(UP, YAW[b.rot]), ONE));
      // Tagged with its id: a pick on it gives the building (#206).
      return { meshes: set.addTo(this.r, b.id), parts };
    }
    const side = n * TILE - 2 * INSET, mb = new MeshBuilder('ink');
    box(mb, side, standInHeight(b.type), side, new THREE.Matrix4().makeTranslation(centre), growsCrops(b) && b.type === 'field' ? FIELD : GREY);
    return { meshes: [this.r.add(mb.build(), 'ink', { tag: b.id })] };
  }

  /**
   * A truck's mesh, at the origin facing +z: its model, or a block (`drawn`). It's no roof: it moves (no cover). Tagged
   * with its id.
   */
  private truck(id: number, drawn: string): THREE.Mesh {
    let shape = this.truckShapes.get(drawn);
    if (!shape) {
      const model = this.models?.get(TRUCK_MODEL);
      if (model) {
        const set = new ModelSet();
        set.add(model, new THREE.Matrix4());
        shape = set.ink.build();
      } else {
        const mb = new MeshBuilder('ink');
        box(mb, 1.6, 1.4, 3.2, new THREE.Matrix4(), GREY);
        shape = mb.build();
      }
      this.truckShapes.set(drawn, shape);
    }
    return this.r.add(shape, 'ink', { cover: 'none', tag: id });
  }

  private syncTrucks(s: GameState) {
    const seen = new Set<number>(), drawn = this.models ? 'model' : 'stand-in';
    for (const t of s.trucks) {
      seen.add(t.id);
      let shown = this.trucks.get(t.id);
      if (shown?.key !== drawn) {
        if (shown) this.drop(shown.meshes, false);
        shown = { meshes: [this.truck(t.id, drawn)], key: drawn };
        this.changes++;
        this.trucks.set(t.id, shown);
      }
      // On a ramp it leans with the ground: the slope along its heading, from the ground a little ahead of it and behind.
      const fx = Math.sin(t.heading) * FEEL, fz = Math.cos(t.heading) * FEEL;
      const rise = (this.lie.y(t.x + fx, t.y + fz) - this.lie.y(t.x - fx, t.y - fz)) * RISE;
      const mesh = shown.meshes[0];
      mesh.position.set(t.x * TILE, this.lie.y(t.x, t.y) * RISE * TILE, t.y * TILE);
      mesh.rotation.set(-Math.atan2(rise, 2 * FEEL), t.heading, 0, 'YXZ');
      // Its cargo in its bed, two across and three along, leaning with it.
      if (t.cargo.length) {
        mesh.updateMatrix();
        t.cargo.forEach((item, i) => {
          const [x, z] = BED.slots[i % BED.slots.length];
          this.goods.put(item, at.copy(mesh.matrix).multiply(local.makeTranslation(x, BED.y, z)), t.id);
        });
      }
    }
    for (const [id, was] of this.trucks) if (!seen.has(id)) { this.drop(was.meshes, false); this.trucks.delete(id); }
  }

  /** Goods handed to a building next door, each hopping over the edge the two share (as the pixel world shows them). */
  private syncHandoffs(s: GameState) {
    for (const hd of recentHandoffs(s)) {
      const a = buildingById(s, hd.from), b = buildingById(s, hd.to);
      if (!a || !b) continue;
      const k = Math.min(1, Math.max(0, (s.time - hd.time) / HANDOFF_SECONDS));
      const ex = edge(a.x, sizeOf(a), b.x, sizeOf(b)), ez = edge(a.y, sizeOf(a), b.y, sizeOf(b));
      // From half a tile inside the giver to half a tile inside the taker, in an arc (down a cliff when the taker is lower).
      const x = ex.at + ex.dir * (k - 0.5), z = ez.at + ez.dir * (k - 0.5);
      const ya = standY(this.lie, s.map, sizeOf(a), a.x, a.y) * RISE * TILE, yb = standY(this.lie, s.map, sizeOf(b), b.x, b.y) * RISE * TILE;
      this.goods.put(hd.item, at.makeTranslation(x * TILE, ya + (yb - ya) * k * k + HOP * Math.sin(Math.PI * k), z * TILE));
    }
  }

  /** Takes meshes out; `own`: their geometry was theirs alone, and is freed (a truck's is the shared shape). */
  private drop(meshes: THREE.Mesh[], own = true) {
    this.changes++;
    for (const mesh of meshes) {
      this.r.remove(mesh);
      if (own) mesh.geometry.dispose();
    }
  }
}
