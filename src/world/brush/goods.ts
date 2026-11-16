import * as THREE from 'three';
import { MeshBuilder, PLAIN, srgb, type BrushRenderer } from '../../../brush3d/src/index.ts';
import { ITEM_IDS, ITEMS, type ItemId } from '../../game/data.ts';

// The goods the game moves, drawn (#203): in a truck's bed, and handed over the edge between buildings next door. brush3d's
// model set has no goods, so they are made here, in code: the pixel game's goods as they were, one simple shape and one
// strong colour each (a jar, a bolt, a sheaf, an egg), grown to the 4 m tile. The developer picked these "tokens" over
// goods in containers (sacks, crates, jars, baskets) and over one crate for every good (#222): the goods are a few pixels
// across at the game's zoom, where a strong colour and a distinct shape tell one load from another.
//
// Every good is about half a metre across and as tall, so six fit a truck's bed (2 m × 1.9 m) two by three and show over
// its boards (0.42 m) from the game's camera.

/** Where the goods sit in the truck model's bed (brush3d/tools/blender/models/truck.py): its floor's height and six spots, two across and three along, in the truck's frame (m). */
export const BED = { y: 1.08, slots: [[-0.48, -0.1], [0.48, -0.1], [-0.48, -0.72], [0.48, -0.72], [-0.48, -1.34], [0.48, -1.34]] as [number, number][] };

/** Shapes standing on their foot at the origin, into one builder. */
class Shapes {
  readonly b = new MeshBuilder('ink');
  private readonly m = new THREE.Matrix4();
  private put(g: THREE.BufferGeometry, x: number, y: number, z: number, hex: number) {
    this.m.makeTranslation(x, y, z);
    this.b.addGeometry(g, this.m, srgb(hex), PLAIN);
    g.dispose();
    return this;
  }
  /** A box `w` × `h` × `d`, its foot at height `y`. */
  box(x: number, y: number, z: number, w: number, h: number, d: number, hex: number) { return this.put(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), x, y, z, hex); }
  /** An upright cylinder, its foot at `y`. */
  cyl(x: number, y: number, z: number, r: number, h: number, hex: number, top = r, seg = 14) { return this.put(new THREE.CylinderGeometry(top, r, h, seg).translate(0, h / 2, 0), x, y, z, hex); }
  /** A ball of radius `r` squashed to `sy` of its height, its foot at `y`. */
  ball(x: number, y: number, z: number, r: number, hex: number, sy = 1) {
    return this.put(new THREE.SphereGeometry(r, 14, 10).scale(1, sy, 1).translate(0, r * sy, 0), x, y, z, hex);
  }
}

/** A good: the pixel game's shape for it (one shape and one strong colour, #222) at 3 times its size, so it fills a slot and shows over the bed's boards. */
function token(id: ItemId, k: Shapes) {
  const hex = ITEMS[id].colour, s = 3;
  switch (id) {
    case 'egg': return k.ball(0, 0, 0, 0.09 * s, hex, 1.25);
    case 'tomato': case 'honey': return k.ball(0, 0, 0, 0.1 * s, hex);
    case 'oil': case 'sauce': return k.cyl(0, 0, 0, 0.09 * s, 0.2 * s, hex, undefined, 8).cyl(0, 0.2 * s, 0, 0.05 * s, 0.05 * s, 0x4a3a30, undefined, 8);
    case 'bread': return k.ball(0, 0, 0, 0.14 * s, hex, 0.6);
    case 'honeycake': return k.cyl(0, 0, 0, 0.13 * s, 0.12 * s, hex).cyl(0, 0.12 * s, 0, 0.13 * s, 0.03 * s, 0xf8e8c8);
    case 'linen': case 'yarn': return k.cyl(0, 0, 0, 0.1 * s, 0.16 * s, hex);
    case 'wheat': case 'flax': return k.box(0, 0, 0, 0.12 * s, 0.22 * s, 0.12 * s, hex);
    case 'manure': case 'compost': return k.ball(0, 0, 0, 0.12 * s, hex, 0.5);
    default: return k.box(0, 0, 0, 0.18 * s, 0.16 * s, 0.18 * s, hex);
  }
}

/** A good's mesh geometry, standing at the origin. */
export function goodGeometry(id: ItemId) {
  const k = new Shapes();
  token(id, k);
  return k.b.build();
}

/** The goods shown this frame: a pool of meshes for each good, drawn where they're put, the rest hidden. */
export class Goods {
  private readonly r: BrushRenderer;
  private readonly geometry = new Map<ItemId, THREE.BufferGeometry>();
  private readonly pools = new Map<ItemId, { meshes: THREE.Mesh[]; used: number }>();
  /** What was shown: each good put this frame and its tag, in order, as pairs (`end` compares them to the last frame's). */
  private shown: number[] = [];
  private lastShown: number[] | null = null;
  /** Whether a good showed, went or changed hands at the last `end` (a truck loaded or unloaded): what a pick met may have changed. */
  changed = false;

  constructor(r: BrushRenderer) { this.r = r; }

  /** Starts a frame: every good is free to be put again. */
  begin() {
    for (const p of this.pools.values()) p.used = 0;
    this.shown.length = 0;
  }

  /**
   * Puts a good at `matrix` (world, metres). They cast shadows, but are no roof (they move). `tag`: what a pick on it gives
   * (a truck's id for the goods in its bed, #206), or null: the building on the tile it's over. The meshes are shared out
   * afresh each frame, so a mesh's tag is set each time it's put.
   */
  put(id: ItemId, matrix: THREE.Matrix4, tag: number | null = null) {
    let p = this.pools.get(id);
    if (!p) { p = { meshes: [], used: 0 }; this.pools.set(id, p); }
    let mesh = p.meshes[p.used];
    if (!mesh) {
      let g = this.geometry.get(id);
      if (!g) { g = goodGeometry(id); this.geometry.set(id, g); }
      // Tagged (null until put), so a pick meets the good rather than looking through it to the ground below.
      mesh = this.r.add(g, 'ink', { cover: 'none', tag: null });
      p.meshes.push(mesh);
    }
    p.used++;
    mesh.visible = true;
    mesh.userData.tag = tag;
    this.shown.push(ITEM_IDS.indexOf(id), tag ?? -1);
    matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
  }

  /** Ends a frame: the goods not put are hidden. */
  end() {
    for (const p of this.pools.values()) for (let i = p.used; i < p.meshes.length; i++) p.meshes[i].visible = false;
    const was = this.lastShown, now = this.shown;
    this.changed = !was || was.length !== now.length || now.some((v, i) => v !== was[i]);
    // The two lists swap, so neither is made anew each frame.
    this.shown = was ?? [];
    this.lastShown = now;
  }
}
