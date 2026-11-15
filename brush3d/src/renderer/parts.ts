import * as THREE from 'three';

// The parts of models that move or change with what the game says (Soil-n-Silo#205): a rotor, a wheel, millstones turning
// (`move_spin_*`), a lamp or a fire shown only while its building works (`running_*`), the battery's charge rings lit one
// by one (`charge_<n>`). Each part has a slot in a small texture, read by the vertex shader of the inked and planted
// meshes (STATIC_VERT's movePart): where its axle is and which way it runs, how far round it has turned, and whether it
// shows. So a part moves without its building's meshes being made again or drawn apart: its vertices carry their slot
// (aPart), and every pass (the painting, its silhouettes, the sun's shadow, the marks) turns them the same way, so its
// ink lines and its shadow go round with it. A part hidden is folded to its axle: it draws nothing in any pass.
//
// The game says how fast a part should turn, as a share of the pace its model gives it (its `speed`, radians a second):
// 0 stands it still, 1 at its usual pace, more in a strong wind. The renderer eases each part to the pace it's given
// (`EASE`), as a rotor has weight, and turns it on its own clock. The turn is worked out from the time, not stepped
// frame by frame, so a frame at a time is the same however it was reached (the tools draw frames out of order): each part
// keeps its last few changes of pace, to go back through.

/** Texels a part: [axle's point, angle], [axle's direction, shown], two spare (#205's look: a part's glow, its tint). */
export const PART_TEXELS = 4;
/** Texels a row of the texture (a whole number of parts). */
const ROW = 256;
/** How long a part takes to come most of the way to a new pace (s): it comes 63% of the way in this time. */
export const EASE = 1.5;

/** How a part turns from `t0` (null: from the next update): towards `target`, from `pace0` then, at `angle0` then. */
interface Leg { target: number; pace0: number; angle0: number; t0: number | null }
/**
 * A part as it is turning: its leg now, the legs before it (the latest last, up to `PAST`) for a jump back, and the legs
 * after it that a jump back went back past (the next last), to play again going forward: until it's told a new pace,
 * which starts a new course from there.
 */
interface Turn extends Leg { speed: number; past: Leg[]; next: Leg[] }
/** Legs kept a part, for a tool seeking back to draw a frame again as it was (the game changes a pace a tick at most). */
const PAST = 64;

const legOf = (t: Leg): Leg => ({ target: t.target, pace0: t.pace0, angle0: t.angle0, t0: t.t0 });

export class Parts {
  texture = Parts.makeTexture(1);
  /** Per slot: how it turns (null: free, or a part that doesn't turn). */
  private turns: (Turn | null)[] = [];
  /** Per slot: how many meshes hold it (0: free). */
  private holds: number[] = [];
  /** Per slot: how many parts have had it, so a handle to a part freed never moves the next part in its slot. */
  private gens: number[] = [];
  private readonly free: number[] = [];
  /** The renderer's clock at the last update (null before the first). */
  private time: number | null = null;
  private dirty = false;

  private static makeTexture(rows: number) {
    const t = new THREE.DataTexture(new Float32Array(ROW * rows * 4), ROW, rows, THREE.RGBAFormat, THREE.FloatType);
    t.needsUpdate = true;
    return t;
  }

  /** The parts held. */
  get count() { return this.holds.filter((h) => h > 0).length; }

  /**
   * A new part: its axle through `origin` along `axis` (unit), in the coordinates of the mesh it's in, turning at `speed`
   * radians a second at its usual pace (0: it never turns). Shown, at rest. Returns its slot; the mesh's vertices carry
   * slot + 1 (0 is none).
   */
  add(origin: THREE.Vector3Like, axis: THREE.Vector3Like, speed: number): number {
    let slot = this.free.pop();
    if (slot === undefined) {
      slot = this.holds.length;
      this.holds.push(0); this.turns.push(null); this.gens.push(0);
      const rows = Math.ceil(this.holds.length * PART_TEXELS / ROW);
      if (rows !== this.texture.image.height) {
        const old = this.texture.image.data as Float32Array;
        this.texture.dispose(); this.texture = Parts.makeTexture(rows);
        (this.texture.image.data as Float32Array).set(old);
      }
    }
    this.turns[slot] = speed ? { speed, target: 0, pace0: 0, angle0: 0, t0: null, past: [], next: [] } : null;
    const d = this.texture.image.data as Float32Array, i = slot * PART_TEXELS * 4;
    d.fill(0, i, i + PART_TEXELS * 4);
    d[i] = origin.x; d[i + 1] = origin.y; d[i + 2] = origin.z;
    d[i + 4] = axis.x; d[i + 5] = axis.y; d[i + 6] = axis.z; d[i + 7] = 1;
    this.dirty = true;
    return slot;
  }

  /** A mesh holds these parts (it's added), so they live until the last mesh holding them lets go (release). */
  hold(slots: Iterable<number>) { for (const s of slots) this.holds[s]++; }

  /** A mesh lets go of these parts (it's taken out): a part no mesh holds is freed, for the next new one. */
  release(slots: Iterable<number>) {
    for (const s of slots) {
      if (!(this.holds[s] > 0) || --this.holds[s] > 0) continue;
      this.turns[s] = null;
      this.gens[s]++;
      this.free.push(s);
    }
  }

  /** Frees those of these new slots that no mesh took (a part with nothing of it drawn). */
  unheld(slots: Iterable<number>) {
    for (const s of slots) if (!(this.holds[s] > 0) && !this.free.includes(s)) { this.turns[s] = null; this.gens[s]++; this.free.push(s); }
  }

  /** Which part a slot holds now (it changes when the slot is freed): a handle keeps it, and does nothing once it's changed. */
  generation(slot: number) { return this.gens[slot]; }

  /** Turns a part at `pace` times its usual speed (0 still), eased to from how it turns now. */
  spin(slot: number, pace: number) {
    const t = this.turns[slot];
    if (!t || t.target === pace) return;
    t.next.length = 0;
    if (t.t0 !== null && this.time !== null) this.anchor(t, this.time);
    t.target = pace;
    this.dirty = true;
  }

  /** Shows or hides a part (hidden, it's folded to its axle). */
  show(slot: number, shown: boolean) {
    const d = this.texture.image.data as Float32Array, i = slot * PART_TEXELS * 4 + 7, v = shown ? 1 : 0;
    if (d[i] === v) return;
    d[i] = v;
    this.dirty = true;
  }

  /** Starts a new leg at `time`, from how it turns then (the leg before kept, for a jump back). */
  private anchor(t: Turn, time: number) {
    t.past.push(legOf(t));
    if (t.past.length > PAST) t.past.shift();
    t.angle0 = this.angleOf(t, time) % (2 * Math.PI);
    t.pace0 = this.paceOf(t, time);
    t.t0 = time;
  }

  /** How fast it turns at `time`, as a share of its usual pace. */
  private paceOf(t: Turn, time: number) {
    const d = Math.max(0, time - (t.t0 ?? time));
    return t.target + (t.pace0 - t.target) * Math.exp(-d / EASE);
  }

  /** How far round it is at `time` (radians): turning at its pace as it eases from pace0 to target since t0. */
  private angleOf(t: Turn, time: number) {
    const d = Math.max(0, time - (t.t0 ?? time));
    return t.angle0 + t.speed * (t.target * d + (t.pace0 - t.target) * EASE * (1 - Math.exp(-d / EASE)));
  }

  /**
   * Grows a mesh's bounds to hold its parts wherever they turn (each part's vertices swept round its axle), so a rotor
   * turned out past where it rests is neither culled nor missed by a pick's box. The rest is bounded as it stands.
   */
  sweep(g: THREE.BufferGeometry) {
    const part = g.getAttribute('aPart'), pos = g.getAttribute('position');
    if (!part) return;
    const d = this.texture.image.data as Float32Array, box = new THREE.Box3(), p = new THREE.Vector3();
    const o = new THREE.Vector3(), k = new THREE.Vector3(), c = new THREE.Vector3(), r = new THREE.Vector3();
    for (let v = 0; v < pos.count; v++) {
      p.fromBufferAttribute(pos, v);
      const s = Math.round(part.getX(v)) - 1;
      if (s < 0) { box.expandByPoint(p); continue; }
      const i = s * PART_TEXELS * 4;
      o.set(d[i], d[i + 1], d[i + 2]); k.set(d[i + 4], d[i + 5], d[i + 6]);
      // The circle it turns on: its centre on the axle, its radius from it; its box is r·√(1 − kᵢ²) about the centre on each axis.
      p.sub(o);
      c.copy(k).multiplyScalar(k.dot(p)).add(o);
      const rad = p.addScaledVector(k, -k.dot(p)).length();
      r.set(Math.sqrt(Math.max(0, 1 - k.x * k.x)), Math.sqrt(Math.max(0, 1 - k.y * k.y)), Math.sqrt(Math.max(0, 1 - k.z * k.z))).multiplyScalar(rad);
      box.expandByPoint(c.clone().sub(r)); box.expandByPoint(c.add(r));
    }
    // Any bounds it has already (a tile's, grown for what sways out of it) are kept, and grown to hold the sweep.
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    g.boundingBox = g.boundingBox ? g.boundingBox.union(box) : box;
    g.boundingSphere = g.boundingSphere ? g.boundingSphere.union(sphere) : sphere;
  }

  /** Every part as it's drawn now (each slot's texels), for a pick read later to see them as the picture had them. */
  pose(): Float32Array { return this.texture.image.data as Float32Array; }

  /**
   * A mesh's positions with its parts turned as the vertex shader turns them (STATIC_VERT's movePart), as `pose` has
   * them (now, or a copy of an earlier `pose()`), for a pick to test the triangles drawn; null if it has no parts.
   */
  posed(g: THREE.BufferGeometry, pose = this.pose()): THREE.BufferAttribute | null {
    const part = g.getAttribute('aPart'), pos = g.getAttribute('position');
    if (!part) return null;
    const d = pose, out = new Float32Array(pos.count * 3), p = new THREE.Vector3(), o = new THREE.Vector3(), k = new THREE.Vector3();
    for (let v = 0; v < pos.count; v++) {
      p.fromBufferAttribute(pos, v);
      const s = Math.round(part.getX(v)) - 1;
      if (s >= 0 && (s + 1) * PART_TEXELS * 4 <= d.length) {
        const i = s * PART_TEXELS * 4;
        o.set(d[i], d[i + 1], d[i + 2]);
        if (d[i + 7] < 0.5) p.copy(o);
        else if (d[i + 3] !== 0) p.sub(o).applyAxisAngle(k.set(d[i + 4], d[i + 5], d[i + 6]), d[i + 3]).add(o);
      }
      p.toArray(out, v * 3);
    }
    return new THREE.BufferAttribute(out, 3);
  }

  /** Turns every part on to `time` (seconds, the renderer's clock), and sends what changed to the texture. */
  update(time: number) {
    // A jump back (a tool seeking): each part as it was then, from the legs it kept. Before its first leg it stands where
    // that leg starts (a leg never turns before its start), so further back than it kept is the same frame each time.
    if (this.time !== null && time < this.time) {
      for (const t of this.turns) while (t && t.past.length && t.t0 !== null && time < t.t0) { t.next.push(legOf(t)); Object.assign(t, t.past.pop()); }
    }
    // Forward again over legs a jump back went back past: each as it was.
    for (const t of this.turns) {
      while (t && t.next.length && time >= t.next[t.next.length - 1].t0!) {
        t.past.push(legOf(t));
        if (t.past.length > PAST) t.past.shift();
        Object.assign(t, t.next.pop());
      }
    }
    this.time = time;
    const d = this.texture.image.data as Float32Array;
    let moved = false;
    for (let s = 0; s < this.turns.length; s++) {
      const t = this.turns[s];
      if (!t) continue;
      // A part starts turning from the first frame after it's told to (so a still frame shows it at rest).
      if (t.t0 === null) { if (t.target === 0) continue; t.t0 = time; }
      // Kept within a turn: the GPU's sine loses its way on large angles.
      const a = this.angleOf(t, time) % (2 * Math.PI), i = s * PART_TEXELS * 4 + 3;
      if (d[i] !== a) { d[i] = a; moved = true; }
      // Come to rest: start afresh from here, its angle kept (so it stops sending a new angle every frame).
      // (Not while there are legs to play again: they say how it went.)
      if (t.target === 0 && t.pace0 !== 0 && !t.next.length && Math.abs(this.paceOf(t, time)) < 1e-4) { this.anchor(t, time); t.pace0 = 0; }
    }
    if (moved || this.dirty) { this.texture.needsUpdate = true; this.dirty = false; }
  }
}
