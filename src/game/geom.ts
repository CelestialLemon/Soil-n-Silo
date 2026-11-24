// Plane geometry in metres on the ground (x east, z south): splines for the drawn tracks, rills and hedges, distances,
// rotated boxes for free-placed buildings, and rasterizing strokes onto the grid's cells or vertices.
import { cellX, cellZ, type Grid, type Rect, rectOfWorld, vertexX, vertexZ } from './grid.ts';

export interface Point2 { x: number; z: number }

/** Distance from (px, pz) to the segment a–b, and how far along it (0..1) the nearest point lies. */
export function segmentDistance(px: number, pz: number, ax: number, az: number, bx: number, bz: number): { d: number; t: number } {
  const dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  let t = len2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / len2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return { d: Math.hypot(px - (ax + t * dx), pz - (az + t * dz)), t };
}

/** Distance from a point to a polyline (Infinity for an empty one), the segment it's nearest and how far along it. */
export function polylineDistance(px: number, pz: number, path: readonly Point2[]): { d: number; seg: number; t: number } {
  if (path.length === 1) { const p = path[0]; return { d: Math.hypot(px - p.x, pz - p.z), seg: 0, t: 0 }; }
  let best = { d: Infinity, seg: -1, t: 0 };
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i], b = path[i + 1];
    const r = segmentDistance(px, pz, a.x, a.z, b.x, b.z);
    if (r.d < best.d) best = { d: r.d, seg: i, t: r.t };
  }
  return best;
}

export const pathLength = (path: readonly Point2[]) => {
  let len = 0;
  for (let i = 1; i < path.length; i++) len += Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z);
  return len;
};

/** Resamples a polyline at even arc-length `spacing`, keeping both ends. */
export function resample(path: readonly Point2[], spacing: number): Point2[] {
  if (path.length === 0) return [];
  const out: Point2[] = [{ x: path[0].x, z: path[0].z }];
  let carry = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    let s = spacing - carry;
    while (s <= len + 1e-9) {
      const t = len > 0 ? s / len : 0;
      out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
      s += spacing;
    }
    carry = len - (s - spacing);
  }
  const last = path[path.length - 1], tail = out[out.length - 1];
  if (Math.hypot(last.x - tail.x, last.z - tail.z) > spacing * 0.25) out.push({ x: last.x, z: last.z });
  else { tail.x = last.x; tail.z = last.z; }
  return out;
}

/**
 * A smooth curve through the control points (a uniform Catmull-Rom spline, its ends held), resampled at even arc-length
 * `spacing`. Two points make a straight line; one point stays a point.
 */
export function catmullRom(points: readonly Point2[], spacing: number): Point2[] {
  const pts = dedupe(points);
  if (pts.length < 3) return resample(pts, spacing);
  const dense: Point2[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const steps = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.z - p1.z) / 0.1));
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push({ x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) });
    }
  }
  const end = pts[pts.length - 1];
  dense.push({ x: end.x, z: end.z });
  return resample(dense, spacing);
}

function dedupe(points: readonly Point2[]): Point2[] {
  const out: Point2[] = [];
  for (const p of points) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
    const last = out[out.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.z - last.z) > 1e-3) out.push({ x: p.x, z: p.z });
  }
  return out;
}

/** Whether segments a–b and c–d cross (or touch), and where. */
export function segmentsCross(a: Point2, b: Point2, c: Point2, d: Point2): Point2 | undefined {
  const rx = b.x - a.x, rz = b.z - a.z, sx = d.x - c.x, sz = d.z - c.z;
  const den = rx * sz - rz * sx;
  if (Math.abs(den) < 1e-12) return undefined;
  const t = ((c.x - a.x) * sz - (c.z - a.z) * sx) / den, u = ((c.x - a.x) * rz - (c.z - a.z) * rx) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { x: a.x + t * rx, z: a.z + t * rz } : undefined;
}

// --- Rotated boxes. Yaw turns about +y as three.js's rotation.y does: a model's local +x lies along world
// (cos yaw, -sin yaw) and its front, local +z, along world (sin yaw, cos yaw). ---------------------------------------------

/** A rotated box on the ground: its centre, half extents along its local x (width) and z (depth), and yaw. */
export interface Obb { cx: number; cz: number; hw: number; hd: number; yaw: number }

/** A point in a frame at (ox, oz) turned by yaw, from that frame's local coordinates. */
export function toWorld(ox: number, oz: number, yaw: number, lx: number, lz: number): Point2 {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return { x: ox + lx * c + lz * s, z: oz - lx * s + lz * c };
}

/** A world point's coordinates in a frame at (ox, oz) turned by yaw. */
export function toLocal(ox: number, oz: number, yaw: number, x: number, z: number): { lx: number; lz: number } {
  const c = Math.cos(yaw), s = Math.sin(yaw), dx = x - ox, dz = z - oz;
  return { lx: dx * c - dz * s, lz: dx * s + dz * c };
}

export function obbCorners(o: Obb): Point2[] {
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => toWorld(o.cx, o.cz, o.yaw, sx * o.hw, sz * o.hd));
}

/** Signed distance from a point to a box: negative inside. */
export function obbDistance(o: Obb, x: number, z: number): number {
  const { lx, lz } = toLocal(o.cx, o.cz, o.yaw, x, z);
  const qx = Math.abs(lx) - o.hw, qz = Math.abs(lz) - o.hd;
  return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0);
}

export const pointInObb = (o: Obb, x: number, z: number, margin = 0) => obbDistance(o, x, z) <= margin;

/** Whether two boxes overlap, each grown by `margin` (separating-axis test). */
export function obbsOverlap(a: Obb, b: Obb, margin = 0): boolean {
  const axes = [a.yaw, b.yaw].flatMap((y) => [{ x: Math.cos(y), z: -Math.sin(y) }, { x: Math.sin(y), z: Math.cos(y) }]);
  const ca = obbCorners({ ...a, hw: a.hw + margin, hd: a.hd + margin }), cb = obbCorners({ ...b, hw: b.hw + margin, hd: b.hd + margin });
  for (const ax of axes) {
    let amin = Infinity, amax = -Infinity, bmin = Infinity, bmax = -Infinity;
    for (const p of ca) { const d = p.x * ax.x + p.z * ax.z; amin = Math.min(amin, d); amax = Math.max(amax, d); }
    for (const p of cb) { const d = p.x * ax.x + p.z * ax.z; bmin = Math.min(bmin, d); bmax = Math.max(bmax, d); }
    if (amax < bmin || bmax < amin) return false;
  }
  return true;
}

/** The axis-aligned world bounds of a box grown by `margin`. */
export function obbBounds(o: Obb, margin = 0): { minX: number; minZ: number; maxX: number; maxZ: number } {
  const c = Math.abs(Math.cos(o.yaw)), s = Math.abs(Math.sin(o.yaw));
  const ex = o.hw * c + o.hd * s + margin, ez = o.hw * s + o.hd * c + margin;
  return { minX: o.cx - ex, minZ: o.cz - ez, maxX: o.cx + ex, maxZ: o.cz + ez };
}

/** The cells a box grown by `margin` may touch. */
export function obbRect(g: Grid, o: Obb, margin = 0): Rect | undefined {
  const b = obbBounds(o, margin);
  return rectOfWorld(g, b.minX, b.minZ, b.maxX, b.maxZ);
}

/** Points spread over a box (and its edge) about `step` apart, for sampling the ground under it. */
export function obbSamples(o: Obb, step = 1): Point2[] {
  const nw = Math.max(1, Math.ceil((2 * o.hw) / step)), nd = Math.max(1, Math.ceil((2 * o.hd) / step));
  const out: Point2[] = [];
  for (let i = 0; i <= nw; i++) for (let j = 0; j <= nd; j++)
    out.push(toWorld(o.cx, o.cz, o.yaw, -o.hw + (2 * o.hw * i) / nw, -o.hd + (2 * o.hd * j) / nd));
  return out;
}

// --- Rasterizing strokes. ---------------------------------------------------------------------------------------------

/** The world bounds of a polyline grown by `margin`. */
export function pathBounds(path: readonly Point2[], margin: number): { minX: number; minZ: number; maxX: number; maxZ: number } {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const p of path) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  return { minX: minX - margin, minZ: minZ - margin, maxX: maxX + margin, maxZ: maxZ + margin };
}

/** The cells a polyline grown by `margin` may touch. */
export function pathRect(g: Grid, path: readonly Point2[], margin: number): Rect | undefined {
  if (path.length === 0) return undefined;
  const b = pathBounds(path, margin);
  return rectOfWorld(g, b.minX, b.minZ, b.maxX, b.maxZ);
}

/**
 * Calls `fn` for every cell whose centre lies within `radius` of the polyline, with that distance (a lone point is a
 * round brush dab).
 */
export function forCellsNear(g: Grid, path: readonly Point2[], radius: number, fn: (ix: number, iz: number, d: number) => void) {
  nearPolyline(g, path, radius, false, fn);
}

/** Calls `fn` for every vertex within `radius` of the polyline, with that distance. */
export function forVerticesNear(g: Grid, path: readonly Point2[], radius: number, fn: (ix: number, iz: number, d: number) => void) {
  nearPolyline(g, path, radius, true, fn);
}

function nearPolyline(g: Grid, path: readonly Point2[], radius: number, vertices: boolean, fn: (ix: number, iz: number, d: number) => void) {
  const r = pathRect(g, path, radius + g.cell);
  if (!r) return;
  // Vertices run one further than cells along each axis.
  const x1 = vertices ? r.x1 + 1 : r.x1, z1 = vertices ? r.z1 + 1 : r.z1;
  const w = x1 - r.x0 + 1, h = z1 - r.z0 + 1;
  const dist = new Float32Array(w * h).fill(Infinity);
  const px = (ix: number) => (vertices ? vertexX(g, ix) : cellX(g, ix)), pz = (iz: number) => (vertices ? vertexZ(g, iz) : cellZ(g, iz));
  const off = vertices ? 0 : 0.5;
  const segs = path.length === 1 ? [[path[0], path[0]]] : path.slice(1).map((b, i) => [path[i], b]);
  for (const [a, b] of segs) {
    const ix0 = Math.max(r.x0, Math.floor((Math.min(a.x, b.x) - radius - g.x0) / g.cell - off));
    const ix1 = Math.min(x1, Math.ceil((Math.max(a.x, b.x) + radius - g.x0) / g.cell - off));
    const iz0 = Math.max(r.z0, Math.floor((Math.min(a.z, b.z) - radius - g.z0) / g.cell - off));
    const iz1 = Math.min(z1, Math.ceil((Math.max(a.z, b.z) + radius - g.z0) / g.cell - off));
    for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++) {
      const d = segmentDistance(px(ix), pz(iz), a.x, a.z, b.x, b.z).d;
      const k = (iz - r.z0) * w + (ix - r.x0);
      if (d < dist[k]) dist[k] = d;
    }
  }
  for (let iz = r.z0; iz <= z1; iz++) for (let ix = r.x0; ix <= x1; ix++) {
    const d = dist[(iz - r.z0) * w + (ix - r.x0)];
    if (d <= radius) fn(ix, iz, d);
  }
}

export const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
/** An angle wrapped into (-π, π]. */
export const wrapAngle = (a: number) => {
  const t = (a + Math.PI) % (2 * Math.PI);
  return (t <= 0 ? t + 2 * Math.PI : t) - Math.PI;
};

/**
 * A polyline indexed for fast nearest-point queries: its segments bucketed on a coarse square grid, searched ring by ring
 * outward from the query point. Answers exactly as `polylineDistance` does.
 */
export class PathIndex {
  private readonly buckets = new Map<number, number[]>();
  readonly path: readonly Point2[];
  private readonly size: number;
  private readonly minX: number; private readonly minZ: number; private readonly nx: number; private readonly nz: number;
  constructor(path: readonly Point2[], size = 4) {
    this.path = path; this.size = size;
    const b = pathBounds(path, 0);
    this.minX = b.minX; this.minZ = b.minZ;
    this.nx = Math.max(1, Math.ceil((b.maxX - b.minX) / size) + 1); this.nz = Math.max(1, Math.ceil((b.maxZ - b.minZ) / size) + 1);
    const n = Math.max(1, path.length - 1);
    for (let i = 0; i < n; i++) {
      const a = path[i], c = path[Math.min(i + 1, path.length - 1)];
      const x0 = this.bx(Math.min(a.x, c.x)), x1 = this.bx(Math.max(a.x, c.x)), z0 = this.bz(Math.min(a.z, c.z)), z1 = this.bz(Math.max(a.z, c.z));
      for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        const k = z * this.nx + x, list = this.buckets.get(k);
        if (list) list.push(i); else this.buckets.set(k, [i]);
      }
    }
  }
  private bx(x: number) { return Math.min(this.nx - 1, Math.max(0, Math.floor((x - this.minX) / this.size))); }
  private bz(z: number) { return Math.min(this.nz - 1, Math.max(0, Math.floor((z - this.minZ) / this.size))); }

  /**
   * The nearest point of the path: its distance, segment and how far along that segment. With `maxD`, a path farther than
   * that may answer { d: Infinity, seg: -1 } (cheaper, for questions about the path's near side only).
   */
  nearest(px: number, pz: number, maxD = Infinity): { d: number; seg: number; t: number } {
    const p = this.path;
    if (p.length < 2) return polylineDistance(px, pz, p);
    const cx = this.bx(px), cz = this.bz(pz);
    // How far the query lies outside the indexed box: rings nearer than that hold nothing closer.
    const outX = Math.max(0, this.minX - px, px - (this.minX + this.nx * this.size));
    const outZ = Math.max(0, this.minZ - pz, pz - (this.minZ + this.nz * this.size));
    const out = Math.hypot(outX, outZ);
    let best = { d: Infinity, seg: -1, t: 0 };
    const maxRing = Math.max(this.nx, this.nz);
    for (let ring = 0; ring <= maxRing; ring++) {
      // Everything in this ring or beyond lies at least (ring - 1) buckets from the query's spot in the box, and the box
      // at least `out` from the query (a projection onto a box: the two distances add as squares).
      const bound = Math.hypot(out, Math.max(0, ring - 1) * this.size);
      if (ring > 0 && best.d < bound) break;
      if (bound > maxD) break;
      const visit = (x: number, z: number) => {
        if (x < 0 || z < 0 || x >= this.nx || z >= this.nz) return;
        for (const i of this.buckets.get(z * this.nx + x) ?? []) {
          const a = p[i], b = p[i + 1], r = segmentDistance(px, pz, a.x, a.z, b.x, b.z);
          if (r.d < best.d || (r.d === best.d && i < best.seg)) best = { d: r.d, seg: i, t: r.t };
        }
      };
      if (ring === 0) { visit(cx, cz); continue; }
      // The ring's edge: its top and bottom rows, then its sides between them.
      for (let x = cx - ring; x <= cx + ring; x++) { visit(x, cz - ring); visit(x, cz + ring); }
      for (let z = cz - ring + 1; z <= cz + ring - 1; z++) { visit(cx - ring, z); visit(cx + ring, z); }
    }
    return best;
  }
}
