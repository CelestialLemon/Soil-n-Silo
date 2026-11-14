import * as THREE from 'three';
import { MeshBuilder, PLAIN, srgb, type BrushRenderer } from '../../../brush3d/src/index.ts';
import { ITEMS, type ItemId } from '../../game/data.ts';

// The goods the game moves, drawn (#203): in a truck's bed, and handed over the edge between buildings next door. brush3d's
// model set has no goods, so they are made here, in code, from a few plain shapes in the set's palette
// (brush3d/docs/MODELS.md). How they look is the developer's pick (#203's look PR): three candidates, behind `?goods=`
// and a Goods button in the HUD, the ones not picked removed before it merges.
//
//   a  Tokens: the pixel game's goods as they were, one shape and colour each (a jar, a bolt, a sheaf, an egg), grown to
//      the 4 m tile.
//   b  Containers: each good in what a farm would carry it in, from the set's materials: grain, flour and meal in linen
//      sacks banded in the good's colour, produce in timber crates heaped with it, honey, oil and sauce in jars with copper
//      lids, eggs and bakes in baskets, yarn on spools and linen in bolts.
//   c  Crates: every good in the same small timber crate, heaped with the good's colour: calm and alike, the colour says
//      which.
//
// Every good is about half a metre across and as tall, so six fit a truck's bed (2 m × 1.9 m) two by three and show over
// its boards (0.42 m) from the game's camera.

export const STYLES = ['a', 'b', 'c'] as const;
export type GoodsStyle = (typeof STYLES)[number];
export const STYLE_NAMES: Record<GoodsStyle, string> = { a: 'Tokens', b: 'Containers', c: 'Crates' };

const PICKED = 'brush3d-goods';

/** The candidate shown: `?goods=` (kept across the game's reloads), else the last one picked, else Tokens (recommended: they read best from the game's camera). */
export function pickedStyle(): GoodsStyle {
  const asked = new URLSearchParams(location.search).get('goods') as GoodsStyle | null;
  let style = asked && STYLES.includes(asked) ? asked : null;
  try {
    if (style) localStorage.setItem(PICKED, style);
    else style = localStorage.getItem(PICKED) as GoodsStyle | null;
  } catch { /* no storage: the URL's or the default */ }
  return style && STYLES.includes(style) ? style : 'a';
}

/** Remembers a pick, and puts it in the address so a reload (or a shared link) keeps it. */
export function rememberStyle(style: GoodsStyle) {
  try { localStorage.setItem(PICKED, style); } catch { /* the URL carries it */ }
  const q = new URLSearchParams(location.search);
  q.set('goods', style);
  history.replaceState(null, '', `${location.pathname}?${q}`);
}

/** Where the goods sit in the truck model's bed (brush3d/tools/blender/models/truck.py): its floor's height and six spots, two across and three along, in the truck's frame (m). */
export const BED = { y: 1.08, slots: [[-0.48, -0.1], [0.48, -0.1], [-0.48, -0.72], [0.48, -0.72], [-0.48, -1.34], [0.48, -1.34]] as [number, number][] };

// The set's palette (brush3d/tools/blender/kit.py).
const LINEN = 0xf0e6ca, TIMBER = 0xc9975c, TIMBER_DARK = 0x9c6e3e, TIMBER_LIGHT = 0xdcb27c, COPPER = 0xc87848, CERAMIC = 0xf6f2e8, SEAGLASS = 0x9ad2c8;

/** Shapes standing on their foot at the origin, into one builder. */
class Shapes {
  readonly b = new MeshBuilder('ink');
  private readonly m = new THREE.Matrix4();
  private put(g: THREE.BufferGeometry, x: number, y: number, z: number, hex: number, turn?: THREE.Euler) {
    this.m.makeRotationFromEuler(turn ?? new THREE.Euler()).setPosition(x, y, z);
    this.b.addGeometry(g, this.m, srgb(hex), PLAIN);
    g.dispose();
    return this;
  }
  /** A box `w` × `h` × `d`, its foot at height `y`. */
  box(x: number, y: number, z: number, w: number, h: number, d: number, hex: number) { return this.put(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), x, y, z, hex); }
  /** An upright cylinder, its foot at `y`. */
  cyl(x: number, y: number, z: number, r: number, h: number, hex: number, top = r, seg = 14) { return this.put(new THREE.CylinderGeometry(top, r, h, seg).translate(0, h / 2, 0), x, y, z, hex); }
  /** A cylinder lying along x, its underside at `y`. */
  roll(x: number, y: number, z: number, r: number, len: number, hex: number) { return this.put(new THREE.CylinderGeometry(r, r, len, 14), x, y + r, z, hex, new THREE.Euler(0, 0, Math.PI / 2)); }
  /** A ball of radius `r` squashed to `sy` of its height, its foot at `y`. */
  ball(x: number, y: number, z: number, r: number, hex: number, sy = 1) {
    return this.put(new THREE.SphereGeometry(r, 14, 10).scale(1, sy, 1).translate(0, r * sy, 0), x, y, z, hex);
  }
}

/** Tokens: the pixel game's shapes (shapes.ts, itemShape) at 3 times their size, so they fill a slot and show over the bed's boards. */
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

/** A timber crate heaped with `hex`: boards in two tones, the heap a low mound proud of the rim. */
function crate(k: Shapes, hex: number, w = 0.5, h = 0.46) {
  k.box(0, 0, 0, w, h, w, TIMBER).box(0, h * 0.45, 0, w + 0.004, h * 0.18, w + 0.004, TIMBER_DARK);
  return k.ball(0, h - 0.06, 0, w * 0.44, hex, 0.45);
}

/** Containers: what a farm would carry each good in. */
function container(id: ItemId, k: Shapes) {
  const hex = ITEMS[id].colour;
  switch (id) {
    // Linen sacks, banded in the good's colour, tied at the top.
    case 'wheat': case 'beans': case 'flour': case 'bran': case 'seedcake': case 'compost': case 'manure':
      return k.cyl(0, 0, 0, 0.25, 0.56, LINEN, 0.2).cyl(0, 0.3, 0, 0.233, 0.11, hex, 0.222).ball(0, 0.53, 0, 0.1, LINEN, 0.8);
    // Produce in a crate.
    case 'tomato': case 'sunflower': return crate(k, hex);
    // A bundle of stalks tied with a copper band.
    case 'flax': return k.cyl(0, 0, 0, 0.19, 0.66, hex, 0.22).cyl(0, 0.36, 0, 0.205, 0.07, COPPER);
    // Jars of the good, with copper lids.
    case 'honey': case 'oil': case 'sauce':
      return k.cyl(0, 0, 0, 0.2, 0.5, hex, 0.18).cyl(0, 0.5, 0, 0.13, 0.06, CERAMIC).cyl(0, 0.56, 0, 0.15, 0.07, COPPER);
    // A round basket of eggs or bakes.
    case 'egg': case 'bread': case 'honeycake':
      k.cyl(0, 0, 0, 0.21, 0.42, TIMBER_LIGHT, 0.26).cyl(0, 0.2, 0, 0.24, 0.06, TIMBER_DARK, 0.245);
      return id === 'egg' ? k.ball(-0.08, 0.36, 0, 0.09, hex, 1.2).ball(0.09, 0.36, 0.05, 0.09, hex, 1.2).ball(0.01, 0.36, -0.1, 0.09, hex, 1.2)
        : k.ball(0, 0.34, 0, 0.22, hex, 0.6);
    // Yarn on a timber spool, lying down.
    case 'yarn': return k.roll(0, 0.02, 0, 0.26, 0.5, hex).roll(-0.27, 0, 0, 0.28, 0.04, TIMBER).roll(0.27, 0, 0, 0.28, 0.04, TIMBER);
    // A bolt of linen, lying down, with a sea-glass stripe.
    case 'linen': return k.roll(0, 0, 0, 0.26, 0.6, hex).roll(0, 0, 0, 0.265, 0.09, SEAGLASS);
  }
}

/** A good's mesh geometry in a style, standing at the origin. */
export function goodGeometry(id: ItemId, style: GoodsStyle) {
  const k = new Shapes();
  if (style === 'a') token(id, k);
  else if (style === 'b') container(id, k);
  else crate(k, ITEMS[id].colour, 0.5, 0.44);
  return k.b.build();
}

/** The goods shown this frame: a pool of meshes for each good, drawn where they're put, the rest hidden. */
export class Goods {
  private readonly r: BrushRenderer;
  private readonly geometry = new Map<ItemId, THREE.BufferGeometry>();
  private readonly pools = new Map<ItemId, { meshes: THREE.Mesh[]; used: number }>();
  style: GoodsStyle;

  constructor(r: BrushRenderer, style: GoodsStyle) { this.r = r; this.style = style; }

  /** Shows them in another style from the next frame. */
  restyle(style: GoodsStyle) {
    if (style === this.style) return;
    this.style = style;
    for (const p of this.pools.values()) for (const m of p.meshes) this.r.remove(m);
    for (const g of this.geometry.values()) g.dispose();
    this.pools.clear();
    this.geometry.clear();
  }

  /** Starts a frame: every good is free to be put again. */
  begin() { for (const p of this.pools.values()) p.used = 0; }

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
      if (!g) { g = goodGeometry(id, this.style); this.geometry.set(id, g); }
      // Tagged (null until put), so a pick meets the good rather than looking through it to the ground below.
      mesh = this.r.add(g, 'ink', { cover: 'none', tag: null });
      p.meshes.push(mesh);
    }
    p.used++;
    mesh.visible = true;
    mesh.userData.tag = tag;
    matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
  }

  /** Ends a frame: the goods not put are hidden. */
  end() { for (const p of this.pools.values()) for (let i = p.used; i < p.meshes.length; i++) p.meshes[i].visible = false; }
}
