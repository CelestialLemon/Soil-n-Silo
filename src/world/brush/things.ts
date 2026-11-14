import * as THREE from 'three';
import { MeshBuilder, PLAIN, srgb, type BrushRenderer } from '../../../brush3d/src/index.ts';
import { BUILDINGS, type BuildingId } from '../../game/data.ts';
import { TERRAIN, type Land } from '../../game/map.ts';
import { growsCrops, layoutOf, sizeOf, type Building, type GameState } from '../../game/state.ts';
import { standY, type Lie } from '../ground.ts';
import { RISE, TILE } from './scale.ts';

// What stands on the land, plainly (#201's first light): every building, truck, tree and rock as a grey stand-in, so what
// isn't drawn yet shows rather than silently missing. A building is a grey block on its footprint, as tall as its kind
// roughly stands; a truck a small block that drives; a tree a grey spire, a rock a low block, on the map and in the country
// round it. The solarpunk models replace
// the buildings and trucks (#203), the game's crops and trees in paint the fields' crops and the trees (#213), and a world
// that changes without a stutter (#204) the meshes made and dropped here as the game places and removes things.

const GREY = srgb(0x9a968e), DARK = srgb(0x77736c), FIELD = srgb(0x8a7a62);
/** A tree's stand-in: a six-sided spire, 5 m tall. */
const SPIRE = new THREE.ConeGeometry(1.4, 5, 6).translate(0, 2.5, 0);
/** How far a block stands in from its footprint's edge (m). */
const INSET = 0.3;

/** How tall a building's stand-in stands (m): a field's bed low, a tall building tall, the rest by size. */
export function standInHeight(type: BuildingId) {
  const def = BUILDINGS[type];
  if (type === 'field') return 0.3;
  if (def.tall) return 9;
  return def.size === 1 ? 2.5 : def.size === 2 ? 5 : 4;
}

/** A box of `w` × `h` × `d` metres, standing on its middle at the origin, into `b`. */
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
  private trees: THREE.Mesh | null = null;
  private layout = -1;

  constructor(r: BrushRenderer, lie: Lie, land: Land, s: GameState) {
    this.r = r; this.lie = lie;
    // The country's trees and rocks, beyond the map: they never change, so they're one mesh made once.
    const m = s.map, M = land.margin, mb = new MeshBuilder('ink');
    for (let ly = 0; ly < land.height; ly++) for (let lx = 0; lx < land.width; lx++) {
      const x = lx - M, y = ly - M;
      if (x >= 0 && y >= 0 && x < m.width && y < m.height) continue;
      this.standIn(mb, land.terrain[ly * land.width + lx], x, y);
    }
    if (mb.vertexCount) r.add(mb.build(), 'ink', { tile: 64 });
  }

  /** The ground's height (m) at a point (world units), as drawn. */
  private ground(x: number, z: number) { return this.lie.y(x, z) * RISE * TILE; }

  /** Follows the game: buildings placed and removed, trees cleared, trucks driving. */
  sync(s: GameState) {
    const v = layoutOf(s);
    if (v !== this.layout) {
      this.layout = v;
      this.syncBuildings(s);
      this.syncTrees(s);
    }
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

  private syncTrees(s: GameState) {
    if (this.trees) this.drop(this.trees);
    const m = s.map, mb = new MeshBuilder('ink');
    for (let y = 0; y < m.height; y++) for (let x = 0; x < m.width; x++) this.standIn(mb, m.terrain[y * m.width + x], x, y);
    this.trees = mb.vertexCount ? this.r.add(mb.build(), 'ink') : null;
  }

  /** A tree's or a rock's stand-in on tile (x, y), into `mb`; nothing for other ground. */
  private standIn(mb: MeshBuilder, t: number, x: number, y: number) {
    if (t !== TERRAIN.tree && t !== TERRAIN.rock) return;
    const at = new THREE.Matrix4().makeTranslation((x + 0.5) * TILE, this.ground(x + 0.5, y + 0.5), (y + 0.5) * TILE);
    if (t === TERRAIN.rock) box(mb, 2.2, 0.9, 1.8, at, DARK);
    else mb.addGeometry(SPIRE, at, DARK, PLAIN);
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
      mesh.position.set(t.x * TILE, this.ground(t.x, t.y), t.y * TILE);
      mesh.rotation.y = t.heading;
    }
    for (const [id, mesh] of this.trucks) if (!seen.has(id)) { this.drop(mesh); this.trucks.delete(id); }
  }

  private drop(mesh: THREE.Mesh) {
    this.r.remove(mesh);
    mesh.geometry.dispose();
  }
}
