import * as THREE from 'three';
import { splitsNwSe } from '../game/relief.ts';
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

/**
 * Marks on one tile: `y` is the ground's height (m) at its corners (north-west, north-east, south-east, south-west), its top
 * the two triangles the ground is drawn as; a frame round its edge, and dots at the corners listed in `dots`.
 */
export interface CursorPatch { x: number; y: number; heights: readonly number[]; frame: boolean; dots: readonly number[] }

export class TileCursor {
  private readonly el = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D;
  private readonly view: HTMLCanvasElement;
  private readonly rgb: [number, number, number];
  private readonly width: number;
  private readonly corner = new THREE.Vector3();
  private drawn = false;

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
    if (el.width !== w || el.height !== h) { el.width = w; el.height = h; this.drawn = false; }
    for (const k of ['left', 'top', 'width', 'height'] as const) el.style[k] = this.view.style[k];
    if (this.drawn) { ctx.clearRect(0, 0, w, h); this.drawn = false; }
    if (!patches.length) return;

    // Each patch's corners in art pixels, and each of its two triangles with the tile coordinates of its corners. The camera
    // is orthographic, so a triangle of ground maps to the screen affinely.
    camera.updateMatrixWorld();
    const at = (x: number, z: number, gy: number) => {
      this.corner.set(x, gy + 0.03, z).project(camera);
      return [(this.corner.x + 1) / 2 * w, (1 - this.corner.y) / 2 * h];
    };
    const tris: { p: number[][]; uv: number[][]; patch: CursorPatch }[] = [];
    let x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (const patch of patches) {
      const p = UV.map(([u, v], k) => at(patch.x + u, patch.y + v, patch.heights[k]));
      for (const q of p) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      for (const t of splitsNwSe(patch.heights) ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]]) tris.push({ p: t.map((k) => p[k]), uv: t.map((k) => UV[k]), patch });
    }
    x0 = Math.max(0, Math.floor(x0)); x1 = Math.min(w, Math.ceil(x1)); y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(h, Math.ceil(y1));
    if (x1 <= x0 || y1 <= y0) return;

    // Which of each art pixel's SUB points fall on a mark (a bit each), found triangle by triangle in the tile's own
    // coordinates.
    const bw = x1 - x0, hits = new Uint16Array(bw * (y1 - y0)), t = this.width;
    for (const { p, uv, patch } of tris) {
      const [a, b, c] = p, det = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(det) < 1e-9) continue;
      const tx0 = Math.max(x0, Math.floor(Math.min(a[0], b[0], c[0]))), tx1 = Math.min(x1, Math.ceil(Math.max(a[0], b[0], c[0])));
      const ty0 = Math.max(y0, Math.floor(Math.min(a[1], b[1], c[1]))), ty1 = Math.min(y1, Math.ceil(Math.max(a[1], b[1], c[1])));
      for (let py = ty0; py < ty1; py++) for (let px = tx0; px < tx1; px++) SUB.forEach(([sx, sy], bit) => {
        const x = px + sx, y = py + sy;
        const la = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / det, lb = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / det, lc = 1 - la - lb;
        if (la < 0 || lb < 0 || lc < 0) return;
        const u = la * uv[0][0] + lb * uv[1][0] + lc * uv[2][0], v = la * uv[0][1] + lb * uv[1][1] + lc * uv[2][1];
        if ((patch.frame && Math.min(u, 1 - u, v, 1 - v) < t) || patch.dots.some((k) => Math.hypot(u - UV[k][0], v - UV[k][1]) < DOT)) hits[(py - y0) * bw + px - x0] |= 1 << bit;
      });
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
