import * as THREE from 'three';
import { MeshBuilder, PLAIN, srgb, type BrushRenderer } from '../../../brush3d/src/index.ts';
import { BUILDINGS, type BuildingId } from '../../game/data.ts';
import { growsCrops, layoutOf, sizeOf, type Building, type GameState } from '../../game/state.ts';
import { standY, type Lie } from '../ground.ts';
import { RISE, TILE } from './scale.ts';

// What the game builds and drives, plainly (#201's first light): every building and truck as a grey stand-in, so what
// isn't drawn yet shows rather than silently missing. A building is a grey block on its footprint, as tall as its kind
// roughly stands (a field a low bed); a truck a small block that drives. The solarpunk models replace them (#203), a world
// that changes without a stutter (#204) the meshes made and dropped here as the game places and removes things, and the
// moving parts, building states and markers (#205) come with the models. (Trees and rocks are wild.ts's.)

const GREY = srgb(0x9a968e), FIELD = srgb(0x8a7a62);
/** How far a block stands in from its footprint's edge (m). */
const INSET = 0.3;

/** How tall a building's stand-in stands (m): a field's bed low, a tall building tall, the rest by size. */
export function standInHeight(type: BuildingId) {
  const def = BUILDINGS[type];
  if (type === 'field') return 0.3;
  if (def.tall) return 9;
  return def.size === 1 ? 2.5 : def.size === 2 ? 5 : 4;
}

/** A box of `w` × `h` × `d` metres, standing on its middle at `at`, into `b`. */
function box(b: MeshBuilder, w: number, h: number, d: number, at: THREE.Matrix4, c: THREE.Color) {
  const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
  b.addGeometry(g, at, c, PLAIN);
  g.dispose();
}

interface Shown { mesh: THREE.Mesh; key: string }

export class StandIns {
  private readonly r: BrushRenderer;
  private readonly lie: Lie;
  private readonly buildings = new Map<number, Shown>();
  private readonly trucks = new Map<number, THREE.Mesh>();
  private layout = -1;

  constructor(r: BrushRenderer, lie: Lie) { this.r = r; this.lie = lie; }

  /** Follows the game: buildings placed, removed and moved by earthworks, trucks driving. */
  sync(s: GameState) {
    const v = layoutOf(s);
    if (v !== this.layout) { this.layout = v; this.syncBuildings(s); }
    this.syncTrucks(s);
  }

  /** Where a truck is drawn (world units), if it is. */
  truckAt(id: number) {
    const m = this.trucks.get(id);
    return m ? { x: m.position.x / TILE, z: m.position.z / TILE } : null;
  }

  private syncBuildings(s: GameState) {
    const seen = new Set<number>();
    for (const b of s.buildings) {
      seen.add(b.id);
      // Its kind, where it stands and how high: a building moved by earthworks under it stands anew.
      const n = sizeOf(b), y = standY(this.lie, s.map, n, b.x, b.y) * RISE * TILE, key = `${b.type} ${b.x} ${b.y} ${y}`;
      const was = this.buildings.get(b.id);
      if (was?.key === key) continue;
      if (was) this.drop(was.mesh);
      this.buildings.set(b.id, { mesh: this.r.add(this.building(b, n, y), 'ink'), key });
    }
    for (const [id, was] of this.buildings) if (!seen.has(id)) { this.drop(was.mesh); this.buildings.delete(id); }
  }

  private building(b: Building, n: number, y: number) {
    const side = n * TILE - 2 * INSET, h = standInHeight(b.type), mb = new MeshBuilder('ink');
    const at = new THREE.Matrix4().makeTranslation((b.x + n / 2) * TILE, y, (b.y + n / 2) * TILE);
    box(mb, side, h, side, at, growsCrops(b) && b.type === 'field' ? FIELD : GREY);
    return mb.build();
  }

  private syncTrucks(s: GameState) {
    const seen = new Set<number>();
    for (const t of s.trucks) {
      seen.add(t.id);
      let mesh = this.trucks.get(t.id);
      if (!mesh) {
        const mb = new MeshBuilder('ink');
        box(mb, 1.6, 1.4, 3.2, new THREE.Matrix4(), GREY);
        mesh = this.r.add(mb.build(), 'ink', { cover: 'none' });
        this.trucks.set(t.id, mesh);
      }
      mesh.position.set(t.x * TILE, this.lie.y(t.x, t.y) * RISE * TILE, t.y * TILE);
      mesh.rotation.y = t.heading;
    }
    for (const [id, mesh] of this.trucks) if (!seen.has(id)) { this.drop(mesh); this.trucks.delete(id); }
  }

  private drop(mesh: THREE.Mesh) {
    this.r.remove(mesh);
    mesh.geometry.dispose();
  }
}
