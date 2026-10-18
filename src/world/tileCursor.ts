import * as THREE from 'three';
import { must } from '../game/result.ts';

/**
 * The marks on the ground under the pointer: a frame round a tile, a dot on a point of the ground. They are interface, not
 * part of the world, so they are drawn on their own canvas over the view, in the same art pixels, where no sun, night grade
 * or lamp halo reaches them. An art pixel is filled when any of its SUB points falls on a mark, so the frame's thin lines
 * stay unbroken, as the renderer keeps them.
 */
/** Where an art pixel is sampled: a 3 × 3 grid, like the renderer's supersampling. */
const SUB = [1, 3, 5].flatMap((y) => [1, 3, 5].map((x) => [x / 6, y / 6]));
const COVER = 3;
/** A dot's radius, in tiles. */
const DOT = 0.2;
/** A tile's corners in its own coordinates (0 to 1 along each edge): north-west, north-east, south-east, south-west. */
const UV = [[0, 0], [1, 0], [1, 1], [0, 1]];

/** How many pieces a side a tile's ground is taken as, under its marks. */
export const CURSOR_GRID = 8;

/**
 * Marks on one tile: `heights` is the ground's height (m) on a CURSOR_GRID × CURSOR_GRID grid across it ((CURSOR_GRID +
 * 1)² points, row by row along z, each row along x); a frame along the sides in `edges` (a bit each: 1 north, 2 east, 4
 * south, 8 west), and dots at the corners (north-west, north-east, south-east, south-west) listed in `dots`.
 */
export interface CursorPatch { x: number; y: number; heights: readonly number[]; edges: number; dots: number[] }

export class TileCursor {
  private readonly el = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D;
  private readonly view: HTMLCanvasElement;
  private readonly rgb: [number, number, number];
  private readonly width: number;
  private readonly corner = new THREE.Vector3();
  private drawn = false;
  /** What was drawn last (the marks, the camera and the size), so the same marks under a still camera aren't redrawn. */
  private last = '';

  /** `hex` is the marks' colour; `width` the frame's width in tiles. */
  constructor(view: HTMLCanvasElement, hex: number, width = 0.06) {
    this.view = view;
    this.width = width;
    this.rgb = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    this.el.className = 'tile-cursor';
    view.after(this.el);
    this.ctx = must(this.el.getContext('2d'), '2d canvas context');
  }

  /** Draws `patches` (or none) as `camera` sees them, on art `w` × `h` pixels laid out like the view. */
  draw(patches: readonly CursorPatch[], camera: THREE.Camera, w: number, h: number) {
    const el = this.el, ctx = this.ctx;
    for (const k of ['left', 'top', 'width', 'height'] as const) el.style[k] = this.view.style[k];
    camera.updateMatrixWorld();
    const key = `${w} ${h} ${camera.matrixWorldInverse.elements.join(',')} ${camera.projectionMatrix.elements.join(',')} ${JSON.stringify(patches)}`;
    if (key === this.last) return;
    this.last = key;
    if (el.width !== w || el.height !== h) { el.width = w; el.height = h; this.drawn = false; }
    if (this.drawn) { ctx.clearRect(0, 0, w, h); this.drawn = false; }
    if (!patches.length) return;

    // Each patch's grid points in art pixels, and each of its triangles with the tile coordinates of its corners. The camera
    // is orthographic, so a triangle of ground maps to the screen affinely.
    const at = (x: number, z: number, gy: number) => {
      this.corner.set(x, gy + 0.03, z).project(camera);
      return [(this.corner.x + 1) / 2 * w, (1 - this.corner.y) / 2 * h];
    };
    const tris: { p: number[][]; uv: number[][]; patch: CursorPatch }[] = [];
    let x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (const patch of patches) {
      if (!patch.edges && !patch.dots.length) continue;
      const G = CURSOR_GRID, uv = Array.from({ length: (G + 1) ** 2 }, (_, i) => [(i % (G + 1)) / G, Math.floor(i / (G + 1)) / G]);
      const p = uv.map(([u, v], i) => at(patch.x + u, patch.y + v, patch.heights[i]));
      for (const q of p) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const a = j * (G + 1) + i, b = a + 1, c = a + G + 2, d = a + G + 1;
        for (const t of [[a, b, c], [a, c, d]]) tris.push({ p: t.map((k) => p[k]), uv: t.map((k) => uv[k]), patch });
      }
    }
    x0 = Math.max(0, Math.floor(x0)); x1 = Math.min(w, Math.ceil(x1)); y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(h, Math.ceil(y1));
    if (x1 <= x0 || y1 <= y0) return;

    // Which of each art pixel's SUB points fall on a mark (a bit each), found triangle by triangle in the tile's own
    // coordinates; only over the marks (the frame's strips, a square round each dot), mapped onto the screen the way the
    // triangle maps, as the tiles between are empty.
    const bw = x1 - x0, hits = new Uint16Array(bw * (y1 - y0)), t = this.width;
    for (const { p, uv, patch } of tris) {
      const [a, b, c] = p, det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(det) < 1e-9) continue;
      // The triangle's map from (u, v) to the screen.
      const du1 = uv[1][0] - uv[0][0], dv1 = uv[1][1] - uv[0][1], du2 = uv[2][0] - uv[0][0], dv2 = uv[2][1] - uv[0][1], d = du1 * dv2 - du2 * dv1;
      const screen = (u: number, v: number) => {
        const s1 = ((u - uv[0][0]) * dv2 - (v - uv[0][1]) * du2) / d, s2 = ((v - uv[0][1]) * du1 - (u - uv[0][0]) * dv1) / d;
        return [a[0] + (b[0] - a[0]) * s1 + (c[0] - a[0]) * s2, a[1] + (b[1] - a[1]) * s1 + (c[1] - a[1]) * s2];
      };
      const tx0 = Math.max(x0, Math.floor(Math.min(a[0], b[0], c[0]))), tx1 = Math.min(x1, Math.ceil(Math.max(a[0], b[0], c[0])));
      const ty0 = Math.max(y0, Math.floor(Math.min(a[1], b[1], c[1]))), ty1 = Math.min(y1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (const [u0, v0, u1, v1] of marksOf(patch, t)) {
        const q = [screen(u0, v0), screen(u1, v0), screen(u1, v1), screen(u0, v1)];
        const rx0 = Math.max(tx0, Math.floor(Math.min(...q.map((e) => e[0])))), rx1 = Math.min(tx1, Math.ceil(Math.max(...q.map((e) => e[0]))));
        const ry0 = Math.max(ty0, Math.floor(Math.min(...q.map((e) => e[1])))), ry1 = Math.min(ty1, Math.ceil(Math.max(...q.map((e) => e[1]))));
        for (let py = ry0; py < ry1; py++) for (let px = rx0; px < rx1; px++) SUB.forEach(([sx, sy], bit) => {
          const x = px + sx, y = py + sy;
          const la = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / det, lb = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / det, lc = 1 - la - lb;
          if (la < 0 || lb < 0 || lc < 0) return;
          const u = la * uv[0][0] + lb * uv[1][0] + lc * uv[2][0], v = la * uv[0][1] + lb * uv[1][1] + lc * uv[2][1];
          if (onFrame(patch.edges, u, v, t) || patch.dots.some((k) => Math.hypot(u - UV[k][0], v - UV[k][1]) < DOT)) hits[(py - y0) * bw + px - x0] |= 1 << bit;
        });
      }
    }
    const img = ctx.createImageData(bw, y1 - y0), [r, g, b] = this.rgb;
    hits.forEach((m, i) => {
      let n = 0;
      for (let k = m; k; k &= k - 1) n++;
      if (n < COVER) return;
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
    });
    ctx.putImageData(img, x0, y0);
    this.drawn = true;
  }
}

/** Whether (u, v) across a tile lies on its frame's sides `edges` (CursorPatch), `t` wide. */
const onFrame = (edges: number, u: number, v: number, t: number) =>
  ((edges & 1) && v < t) || ((edges & 2) && 1 - u < t) || ((edges & 4) && 1 - v < t) || ((edges & 8) && u < t);

/** Where a patch's marks lie across its tile, as rectangles [u0, v0, u1, v1]: a strip `t` wide along each framed side, a square round each dot. */
function marksOf(patch: CursorPatch, t: number): number[][] {
  const out: number[][] = [];
  if (patch.edges & 1) out.push([0, 0, 1, t]);
  if (patch.edges & 2) out.push([1 - t, 0, 1, 1]);
  if (patch.edges & 4) out.push([0, 1 - t, 1, 1]);
  if (patch.edges & 8) out.push([0, 0, t, 1]);
  for (const k of patch.dots) {
    const [u, v] = UV[k];
    out.push([Math.max(0, u - DOT), Math.max(0, v - DOT), Math.min(1, u + DOT), Math.min(1, v + DOT)]);
  }
  return out;
}
