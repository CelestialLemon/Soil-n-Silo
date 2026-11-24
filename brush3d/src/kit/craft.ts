import * as THREE from 'three';
import { MeshBuilder, rng } from './builder.ts';
import { C } from './kit.ts';

// Inked timber the game places on its own land (docs/API.md, the painting kit): a plank bridge over a brook or a rill, and a
// split-rail fence along a yard or a field. As the farm demo's (scenes/farm.ts, its bridges and fences), with the bridge
// placed by its middle, its turn and its size and the fence by the points it runs through, each standing on the ground
// the game gives (heightAt: r.landAt). Both go into an inked MeshBuilder the caller adds (r.add(b.build(), 'ink')).

/** A plank bridge: its middle, which way it spans and how far, and how wide its deck is. */
export interface PlankBridgeOptions {
  /** Its middle (m). */
  x: number; z: number;
  /** Which way it spans, as a thing's yaw (radians about the vertical): 0 along +x, turning from +x away from +z. */
  yaw: number;
  /** How far it spans, end to end (m), and how wide its deck is (m). */
  length: number; width: number;
  /** The ground's height (m) at a point: r.landAt. */
  heightAt: (x: number, z: number) => number;
  /**
   * The top of its deck (m). Left out, a little over the higher of its two ends' ground (`lift`, 0.18 m by default), so it
   * rests on both banks and stands clear of the water between.
   */
  deck?: number;
  lift?: number;
  /** Standing on posts down to the ground under it (a jetty), rather than a low kerb along each side. */
  posts?: boolean;
  /** Its own seed: the planks' tilt and shade (the same seed, the same bridge). */
  seed?: number;
}

/** Inked planks across a deck on two side beams, a kerb along each side (or posts down to the ground, for a jetty). */
export function addPlankBridge(b: MeshBuilder, o: PlankBridgeOptions) {
  const rand = rng(o.seed ?? 29), span = o.length, width = o.width;
  const dx = Math.cos(o.yaw), dz = -Math.sin(o.yaw);
  const at = (along: number, across: number, y: number) => new THREE.Vector3(o.x + dx * along - dz * across, y, o.z + dz * along + dx * across);
  const ends = [-span / 2, span / 2].map((a) => { const p = at(a, 0, 0); return o.heightAt(p.x, p.z); });
  const deck = o.deck ?? Math.max(...ends) + (o.lift ?? 0.18);
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, o.yaw, 0));
  const one = new THREE.Vector3(1, 1, 1);
  for (let a = -span / 2; a < span / 2; a += 0.3) {
    const c = C.timber.clone().lerp(C.fence, 0.4).offsetHSL(0, 0, (rand() - 0.5) * 0.08);
    const plank = new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.03, o.yaw, 0));
    const p = at(a + 0.13, 0, deck - 0.035);
    b.addGeometry(new THREE.BoxGeometry(0.26, 0.07, width + (rand() - 0.5) * 0.12), new THREE.Matrix4().compose(p, plank, one), c, [0, 1, 0, 0]);
  }
  for (const side of [-1, 1]) {
    b.addGeometry(new THREE.BoxGeometry(span + 0.4, 0.2, 0.16), new THREE.Matrix4().compose(at(0, side * (width / 2 - 0.15), deck - 0.165), q, one),
      C.bark.clone().lerp(C.fence, 0.3), [0, 1, 0, 0]);
    if (!o.posts) {
      b.addGeometry(new THREE.BoxGeometry(span, 0.1, 0.1), new THREE.Matrix4().compose(at(0, side * (width / 2 - 0.05), deck + 0.045), q, one),
        C.fence, [0, 1, 0, 0]);
      continue;
    }
    // Posts from a little proud of the deck down into the ground under it.
    for (let a = -span / 2 + 0.3; a <= span / 2; a += 2) {
      const top = at(a, side * (width / 2 + 0.02), deck + 0.15), foot = o.heightAt(top.x, top.z) - 0.3, h = Math.max(0.3, top.y - foot);
      b.addGeometry(new THREE.BoxGeometry(0.16, h, 0.16), new THREE.Matrix4().makeTranslation(top.x, foot + h / 2, top.z), C.bark.clone().lerp(C.fence, 0.2), [0, 1, 0, 0]);
    }
  }
}

/** A split-rail fence: the points it runs through, and how it's made. */
export interface RailFenceOptions {
  /** The line it runs along (m), a post at its first point and then every `spacing` m along it. */
  points: readonly { x: number; z: number }[];
  /** The ground's height (m) at a point: r.landAt. */
  heightAt: (x: number, z: number) => number;
  /** Back round to its first point. */
  closed?: boolean;
  /** How far apart its posts stand along it (m): 2.3 by default, a little uneven. */
  spacing?: number;
  /** Its rails' heights over the ground (m): two, at 0.42 and 0.78, by default. */
  rails?: readonly number[];
  /** How tall its posts stand (m): 1 by default. */
  postHeight?: number;
  /** Its timber's colour (sRGB hex): the weathered fence's by default. */
  color?: number;
  /** Where a gate or a gap leaves it open: no rails between two posts whose middle lies within one of these (m). */
  gaps?: readonly { x: number; z: number; radius: number }[];
  /** Its own seed: each post's lean and each rail's sag (the same seed, the same fence). */
  seed?: number;
}

/** Inked posts every couple of metres along a line, each a little askew, with rails between them. */
export function addRailFence(b: MeshBuilder, o: RailFenceOptions) {
  const rand = rng(o.seed ?? 17), spacing = o.spacing ?? 2.3, rails = o.rails ?? [0.42, 0.78], postH = o.postHeight ?? 1;
  const colour = o.color === undefined ? C.fence : new THREE.Color(o.color);
  const pts = o.closed && o.points.length > 2 ? [...o.points, o.points[0]] : [...o.points];
  if (pts.length < 2) return;
  // The posts: along the line by its length, the last at its end.
  const posts: THREE.Vector3[] = [];
  const total = pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i].x, p.z - pts[i].z), 0);
  const along = (s: number) => {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], c = pts[i], l = Math.hypot(c.x - a.x, c.z - a.z);
      if (s <= l || i === pts.length - 1) { const t = l > 0 ? Math.min(1, s / l) : 0; return [a.x + (c.x - a.x) * t, a.z + (c.z - a.z) * t]; }
      s -= l;
    }
    return [pts[0].x, pts[0].z];
  };
  for (let s = 0; s < total - spacing * 0.4; s += spacing + (rand() - 0.5) * 0.3) { const [x, z] = along(s); posts.push(new THREE.Vector3(x, o.heightAt(x, z), z)); }
  const [ex, ez] = along(total);
  posts.push(new THREE.Vector3(ex, o.heightAt(ex, ez), ez));
  const one = new THREE.Vector3(1, 1, 1);
  for (const p of posts) {
    const h = postH + (rand() - 0.5) * 0.1;
    const lean = new THREE.Quaternion().setFromEuler(new THREE.Euler((rand() - 0.5) * 0.08, rand() * Math.PI, (rand() - 0.5) * 0.08));
    b.addGeometry(new THREE.BoxGeometry(0.11, h, 0.11), new THREE.Matrix4().compose(p.clone().add(new THREE.Vector3(0, h / 2 - 0.1, 0)), lean, one),
      colour.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.06), [0, 1, 0, 0]);
  }
  for (let i = 0; i < posts.length - 1; i++) {
    const a = posts[i], c = posts[i + 1], mx = (a.x + c.x) / 2, mz = (a.z + c.z) / 2;
    if (o.gaps?.some((g) => Math.hypot(g.x - mx, g.z - mz) < g.radius)) continue;
    for (const yr of rails) {
      const pa = a.clone().add(new THREE.Vector3(0, yr + (rand() - 0.5) * 0.06, 0)), pc = c.clone().add(new THREE.Vector3(0, yr + (rand() - 0.5) * 0.06, 0));
      const d = pc.clone().sub(pa), len = d.length() + 0.25;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.normalize());
      b.addGeometry(new THREE.BoxGeometry(len, 0.075, 0.055), new THREE.Matrix4().compose(pa.clone().lerp(pc, 0.5), q, one),
        colour.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.08), [0, 1, 0, 0]);
    }
  }
}
