// The Electric Carts (state.sim.carts): each drawn as brush3d's truck, built once at the origin and placed every frame by
// its mesh's position and turn (brush3d/docs/API.md: a truck moves cheaply that way), easing after where the game has it
// so a tick's step never jumps. It stands on the land as drawn (on a bridge's deck where it crosses one), tipped with the
// ground under its wheels, faces the way it drives (the game's yaw: forward is (sin yaw, cos yaw), the truck's front +z),
// and its wheels roll with how fast it really goes on screen. What it carries rides in its open timber bed: sheaves of
// wheat, baskets of beans or eggs, sacks of flour, bran, manure or compost, crates of bread, one heap a unit, in the good's
// own colour (GOOD_LABELS), gone when the bed is empty. Carts and their cargo are no roof to the rain (they move), and
// pick nothing (the game names carts on its own cards).
import * as THREE from 'three';
import { type BrushRenderer, MeshBuilder, type ModelParts, ModelSet, PLAIN, type Paint } from '../../brush3d/src/index.ts';
import { type Cart, CART_CAPACITY, clamp, type GameState, GOOD_LABELS, type Good, must, wrapAngle } from '../game/index.ts';
import { CART_MODEL, type ModelCache } from './things.ts';
import { dropAll, dropMesh } from './util.ts';

/** The truck's wheels: their radius (m) and the pace their model turns them at (radians a second, its `speed`). */
const WHEEL_R = 0.42, WHEEL_SPEED = 4;
/**
 * The bed's floor (m up) and its inside from the tailboard to the headboard (z), in the truck's own frame
 * (brush3d/tools/blender/models/truck.py); the goods keep within 0.8 m of its middle across (its boards stand at 1 m).
 */
const BED_Y = 1.08, BED_Z0 = -1.6, BED_Z1 = 0.16;
/** How fast a drawn cart catches up with the game's (1/s), and how far behind it may fall before it's simply put there (m). */
const FOLLOW = 12, SNAP = 6;
/** How far ahead and behind (m), and to either side, the ground is felt for the truck's tilt. */
const AXLE = 1.15, TRACK = 0.85;
/** How fast the wheels' pace follows the cart's speed (1/s). */
const PACE_EASE = 8;

/** How a good's heap looks: sheaves, baskets, sacks or crates. */
type Heap = 'sheaf' | 'basket' | 'sack' | 'crate';
const HEAP: { readonly [G in Good]: Heap } = {
  wheat: 'sheaf', beans: 'basket', eggs: 'basket', flour: 'sack', bran: 'sack', manure: 'sack', compost: 'sack', bread: 'crate', honey: 'basket', honey_cake: 'crate',
};
/** A basket's wicker and a crate's slats (sRGB). */
const WICKER = 0xa0703f, SLAT = 0x9b6a3c;
/** Timber's grain (the models' `timber` finish). */
const TIMBER: Paint = [2, 1, 0, 0];

interface Item {
  cart: Cart;
  meshes: THREE.Mesh[];
  parts: ModelParts;
  cargo: THREE.Mesh | null;
  /** What its bed shows ('' for nothing). */
  cargoKey: string;
  /** Where it's drawn (m), which way it faces, and its wheels' pace as last told (in tenths). */
  x: number; z: number; yaw: number; pace: number; told: number;
  placed: boolean;
}

export class Carts {
  private readonly r: BrushRenderer;
  private state: GameState;
  private readonly model: THREE.Object3D;
  private readonly items = new Map<number, Item>();
  private readonly e = new THREE.Euler(0, 0, 0, 'YXZ');

  constructor(r: BrushRenderer, state: GameState, models: ModelCache) {
    this.r = r; this.state = state;
    this.model = must(models.get(CART_MODEL), 'the cart\'s model');
    this.sync();
  }

  /** Adds a truck for each new cart and takes away each retired one's; fills or empties their beds. */
  sync() {
    const live = new Set<number>();
    for (const cart of this.state.sim.carts) {
      live.add(cart.id);
      const it = this.items.get(cart.id);
      if (it) it.cart = cart;
      else this.items.set(cart.id, this.build(cart));
    }
    for (const [id, it] of this.items) if (!live.has(id)) { this.drop(it); this.items.delete(id); }
    for (const it of this.items.values()) this.load(it);
  }

  /** Each frame: every truck eases after its cart, stands on the land, faces its way and rolls its wheels. */
  frame(dt: number) {
    if (dt <= 0) return;
    const k = 1 - Math.exp(-FOLLOW * dt);
    for (const it of this.items.values()) {
      const c = it.cart, far = Math.hypot(c.x - it.x, c.z - it.z) > SNAP;
      const px = it.x, pz = it.z;
      if (!it.placed || far) { it.x = c.x; it.z = c.z; it.yaw = c.yaw; }
      else { it.x += (c.x - it.x) * k; it.z += (c.z - it.z) * k; it.yaw += wrapAngle(c.yaw - it.yaw) * k; }
      // The wheels roll with the ground it covers on screen (a paused game, a jump: still).
      const moved = !it.placed || far ? 0 : Math.hypot(it.x - px, it.z - pz) / dt;
      it.pace += (moved / (WHEEL_R * WHEEL_SPEED) - it.pace) * (1 - Math.exp(-PACE_EASE * dt));
      const told = Math.round(it.pace * 10);
      if (told !== it.told) { it.told = told; it.parts.spin(told / 10); }
      it.placed = true;
      this.place(it);
    }
  }

  reset(state: GameState) {
    this.clear();
    this.state = state;
    this.sync();
  }

  dispose() { this.clear(); }

  private clear() {
    for (const it of this.items.values()) this.drop(it);
    this.items.clear();
  }

  // ---- Building ----

  private build(cart: Cart): Item {
    const set = new ModelSet(cart.id * 4271 + 29);
    const parts = set.add(this.model, new THREE.Matrix4());
    // Moving, so no roof to the rain: the shelter map is drawn only round what's added, where it stood then.
    const meshes = set.addTo({ add: (g, kind, o) => this.r.add(g, kind, { ...o, cover: 'none' }), parts: this.r.parts });
    parts.spin(0);
    const it: Item = { cart, meshes, parts, cargo: null, cargoKey: '', x: cart.x, z: cart.z, yaw: cart.yaw, pace: 0, told: 0, placed: false };
    this.place(it);
    return it;
  }

  private drop(it: Item) {
    dropAll(this.r, it.meshes);
    if (it.cargo) { dropMesh(this.r, it.cargo); it.cargo = null; }
  }

  /** Fills its bed as its cargo is now (built again only when the good or the number of heaps changes). */
  private load(it: Item) {
    const cargo = it.cart.cargo, heaps = cargo ? clamp(Math.ceil(cargo.count), 1, CART_CAPACITY) : 0;
    const key = cargo && heaps > 0 ? `${cargo.good} ${heaps}` : '';
    if (key === it.cargoKey) return;
    it.cargoKey = key;
    if (it.cargo) { dropMesh(this.r, it.cargo); it.cargo = null; }
    if (!cargo || heaps === 0) return;
    const b = new MeshBuilder('ink');
    goods(b, cargo.good, heaps, it.cart.id);
    it.cargo = this.r.add(b.build(), 'ink', { cover: 'none' });
    this.place(it);
  }

  /** Puts a truck (and its bed's goods) where it's drawn: on the land, tipped with it, facing its way. */
  private place(it: Item) {
    const { x, z, yaw } = it, fx = Math.sin(yaw), fz = Math.cos(yaw);
    const front = this.groundAt(x + fx * AXLE, z + fz * AXLE), back = this.groundAt(x - fx * AXLE, z - fz * AXLE);
    // Its own +x side (the game's local x, as toWorld's) and its other.
    const side = this.groundAt(x + fz * TRACK, z - fx * TRACK), other = this.groundAt(x - fz * TRACK, z + fx * TRACK);
    const y = Math.max((front + back) / 2, this.groundAt(x, z) - 0.05);
    // Nose up a rise (about x, after the yaw: a turn by +x tips +z down) and leaning with the ground across it (about z:
    // a turn by +z lifts +x).
    this.e.set(-Math.atan2(front - back, 2 * AXLE), yaw, Math.atan2(side - other, 2 * TRACK), 'YXZ');
    for (const m of it.cargo ? [...it.meshes, it.cargo] : it.meshes) {
      m.position.set(x, y, z);
      m.rotation.copy(this.e);
      m.updateMatrixWorld();
    }
  }

  /** The ground a wheel stands on: the land as drawn, or a bridge's deck where the cart crosses one. */
  private groundAt(x: number, z: number): number {
    let y = this.r.landAt(x, z);
    for (const b of this.state.bridges) {
      const dx = x - b.x, dz = z - b.z, s = Math.sin(b.yaw), c = Math.cos(b.yaw);
      const along = dx * s + dz * c, across = dx * c - dz * s;
      if (Math.abs(along) <= b.length / 2 && Math.abs(across) <= b.width / 2 + 0.3) y = Math.max(y, b.deckY);
    }
    return y;
  }
}

// ---- The goods in the bed ----

const box = new THREE.BoxGeometry(1, 1, 1);
const drum = new THREE.CylinderGeometry(0.5, 0.5, 1, 9);
const tub = new THREE.CylinderGeometry(0.5, 0.38, 1, 9);
const pillow = new THREE.SphereGeometry(0.5, 9, 6);
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

/** Adds a shape to the bed: centred at (x, y, z) in the truck's frame, turned `turn` about the vertical, sized (sx, sy, sz). */
function shape(b: MeshBuilder, g: THREE.BufferGeometry, x: number, y: number, z: number, sx: number, sy: number, sz: number, turn: number, c: THREE.Color, paint: Paint = PLAIN) {
  m4.compose(v.set(x, y, z), q.setFromAxisAngle(up, turn), sc.set(sx, sy, sz));
  b.addGeometry(g, m4, c, paint);
}

/** A good's colour (linear, as the meshes carry it), a touch lighter or darker by `shade`. */
const tint = (hex: string, shade: number) => new THREE.Color(hex).offsetHSL(0, 0, shade);

/** The heaps of a good in a truck's bed: one heap a unit, side by side from the headboard back. */
function goods(b: MeshBuilder, good: Good, heaps: number, seed: number) {
  const col = GOOD_LABELS[good].color, span = (BED_Z1 - BED_Z0) / CART_CAPACITY;
  for (let h = 0; h < heaps; h++) {
    const cz = BED_Z1 - span * (h + 0.5), wob = (k: number) => Math.sin(seed * 12.9898 + h * 78.233 + k * 37.719) * 0.5;
    switch (HEAP[good]) {
      case 'sheaf':
        // Three sheaves standing, bound at the waist, their ears a little lighter.
        for (let i = 0; i < 3; i++) {
          const x = (i - 1) * 0.55, z = cz + wob(i) * 0.12;
          shape(b, drum, x, BED_Y + 0.3, z, 0.34, 0.6, 0.34, 0, tint(col, -0.04));
          shape(b, drum, x, BED_Y + 0.3, z, 0.37, 0.07, 0.37, 0, new THREE.Color(0x8a5a2b));
          shape(b, pillow, x, BED_Y + 0.66, z, 0.46, 0.26, 0.46, wob(i + 3), tint(col, 0.06));
        }
        break;
      case 'basket':
        // Two wicker baskets heaped with the good.
        for (let i = 0; i < 2; i++) {
          const x = (i - 0.5) * 0.85, z = cz + wob(i) * 0.1;
          shape(b, tub, x, BED_Y + 0.17, z, 0.62, 0.34, 0.62, 0, new THREE.Color(WICKER), TIMBER);
          shape(b, pillow, x, BED_Y + 0.34, z, 0.56, 0.24, 0.56, wob(i + 2), tint(col, 0.02 * (i ? 1 : -1)));
        }
        break;
      case 'sack':
        // Two plump sacks lying across the bed, tied at the neck.
        for (let i = 0; i < 2; i++) {
          const x = (i - 0.5) * 0.82, z = cz + wob(i) * 0.08, turn = wob(i + 5) * 0.35;
          shape(b, pillow, x, BED_Y + 0.2, z, 0.7, 0.4, 0.62, turn, tint(col, 0.03 * (i ? 1 : -1)));
          shape(b, drum, x, BED_Y + 0.42, z, 0.12, 0.12, 0.12, 0, tint(col, -0.1));
        }
        break;
      case 'crate':
        // A low slatted crate with two rows of loaves heaped on it.
        shape(b, box, 0, BED_Y + 0.13, cz, 1.4, 0.26, span * 0.82, wob(1) * 0.08, new THREE.Color(SLAT), TIMBER);
        for (let i = 0; i < 6; i++) {
          const x = ((i % 3) - 1) * 0.44, z = cz + (i < 3 ? -0.17 : 0.17) + wob(i) * 0.04;
          shape(b, pillow, x, BED_Y + 0.33, z, 0.42, 0.24, 0.3, 0.3 * wob(i + 2), tint(col, 0.03 * ((i % 3) - 1)));
        }
        break;
    }
  }
}
