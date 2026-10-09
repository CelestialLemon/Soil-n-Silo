import * as THREE from 'three';
import { FLAG, GeometryCollector, linearColor as lin, motion, place, type Motion } from 'pixel3d-renderer';

// Small helpers for building geometry in code.

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new Map<number, THREE.CylinderGeometry>();
const BALL = new THREE.IcosahedronGeometry(1, 1);
const CONE = new Map<number, THREE.ConeGeometry>();

/** A box with its base centred at (x, y, z). */
export const box = (c: GeometryCollector, x: number, y: number, z: number, w: number, h: number, d: number, hex: number, flag: number = FLAG.NORMAL) =>
  c.add(BOX, place(x, y + h / 2, z, 0, 0, 0, w, h, d), lin(hex), flag);

/** Deterministic noise per tile, so the world looks the same every load. */
export const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * A collector with shape helpers. With `animated`, parts given a motion move (a dynamic collector); without, the motion is
 * dropped and the part is still, so one builder makes both a model's idle and running looks.
 */
export class Kit {
  readonly c: GeometryCollector;
  readonly animated: boolean;
  constructor(animated = false) { this.animated = animated; this.c = new GeometryCollector(animated); }

  private add(g: THREE.BufferGeometry, m: THREE.Matrix4, hex: number, flag: number, mo?: Motion, flat = true) {
    this.c.add(g, m, lin(hex), flag, flat, this.animated ? mo : undefined);
  }

  /** Box with its base centred at (x, y, z), turned `ry` about y. */
  box(x: number, y: number, z: number, w: number, h: number, d: number, hex: number, o: { ry?: number; rx?: number; rz?: number; flag?: number; mo?: Motion } = {}) {
    this.add(BOX, place(x, y + h / 2, z, o.rx ?? 0, o.ry ?? 0, o.rz ?? 0, w, h, d), hex, o.flag ?? FLAG.NORMAL, o.mo, false);
    return this;
  }

  /** Box centred at (x, y, z) (not its base), with any rotation. */
  boxAt(x: number, y: number, z: number, w: number, h: number, d: number, hex: number, o: { ry?: number; rx?: number; rz?: number; flag?: number; mo?: Motion } = {}) {
    this.add(BOX, place(x, y, z, o.rx ?? 0, o.ry ?? 0, o.rz ?? 0, w, h, d), hex, o.flag ?? FLAG.NORMAL, o.mo, false);
    return this;
  }

  /** Upright cylinder with its base at (x, y, z). */
  cyl(x: number, y: number, z: number, r: number, h: number, hex: number, o: { seg?: number; flag?: number; mo?: Motion; rx?: number; rz?: number; top?: number } = {}) {
    const seg = o.seg ?? 8, key = seg * 1000 + Math.round((o.top ?? 1) * 100);
    let g = CYL.get(key);
    if (!g) { g = new THREE.CylinderGeometry(o.top ?? 1, 1, 1, seg); CYL.set(key, g); }
    const m = place(x, y + h / 2, z, o.rx ?? 0, 0, o.rz ?? 0, r, h, r);
    if (o.rx || o.rz) m.copy(place(x, y, z, o.rx ?? 0, 0, o.rz ?? 0).multiply(place(0, h / 2, 0, 0, 0, 0, r, h, r)));
    this.add(g, m, hex, o.flag ?? FLAG.NORMAL, o.mo);
    return this;
  }

  /** Cone with its base at (x, y, z). */
  cone(x: number, y: number, z: number, r: number, h: number, hex: number, o: { seg?: number; flag?: number } = {}) {
    const seg = o.seg ?? 8;
    let g = CONE.get(seg);
    if (!g) { g = new THREE.ConeGeometry(1, 1, seg); CONE.set(seg, g); }
    this.add(g, place(x, y + h / 2, z, 0, 0, 0, r, h, r), hex, o.flag ?? FLAG.NORMAL);
    return this;
  }

  /** A faceted ball centred at (x, y, z). */
  ball(x: number, y: number, z: number, r: number, hex: number, o: { sy?: number; flag?: number; mo?: Motion } = {}) {
    this.add(BALL, place(x, y, z, 0, 0, 0, r, r * (o.sy ?? 1), r), hex, o.flag ?? FLAG.NORMAL, o.mo);
    return this;
  }

  /** Puffs of steam or smoke rising from (x, y, z) while running. */
  smoke(x: number, y: number, z: number, seed: number, n = 4, hex = 0xece8f0) {
    if (!this.animated) return this;
    const puff = new THREE.IcosahedronGeometry(0.16, 1);
    for (let i = 0; i < n; i++) this.c.add(puff, null, lin(hex), FLAG.STEAM, false, motion.smoke([x, y, z], i / n, seed + i * 0.17));
    return this;
  }

  build() { return this.c.build(); }
}
