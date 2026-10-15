import * as THREE from 'three';

/**
 * The frame round the tile under the pointer. It is interface, not part of the world, so it is drawn on its own canvas over
 * the view, in the same art pixels, where no sun, night grade or lamp halo reaches it. An art pixel is filled when any of
 * its SUB points falls on the frame's band of ground, so the frame's thin lines stay unbroken, as the renderer keeps them.
 */
/** Where an art pixel is sampled: a 3 × 3 grid, like the renderer's supersampling. */
const SUB = [1, 3, 5].flatMap((y) => [1, 3, 5].map((x) => [x / 6, y / 6]));
const COVER = 3;

export class TileCursor {
  private readonly el = document.createElement('canvas');
  private readonly ctx: CanvasRenderingContext2D;
  private readonly view: HTMLCanvasElement;
  private readonly rgb: [number, number, number];
  private readonly width: number;
  private readonly corner = new THREE.Vector3();
  private drawn = false;

  /** `hex` is the frame's colour; `width` its width in tiles. */
  constructor(view: HTMLCanvasElement, hex: number, width = 0.06) {
    this.view = view;
    this.width = width;
    this.rgb = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    this.el.className = 'tile-cursor';
    view.after(this.el);
    this.ctx = this.el.getContext('2d')!;
  }

  /** Draws the frame round `tile` (or none) as `camera` sees it, on art `w` × `h` pixels laid out like the view. */
  draw(tile: { x: number; y: number } | null, camera: THREE.Camera, w: number, h: number) {
    const el = this.el, ctx = this.ctx;
    if (el.width !== w || el.height !== h) { el.width = w; el.height = h; this.drawn = false; }
    for (const k of ['left', 'top', 'width', 'height'] as const) el.style[k] = this.view.style[k];
    if (this.drawn) { ctx.clearRect(0, 0, w, h); this.drawn = false; }
    if (!tile) return;

    // The tile's corners in art pixels. The camera is orthographic, so the ground maps to the screen affinely.
    camera.updateMatrixWorld();
    const at = (x: number, z: number) => {
      this.corner.set(x, 0.03, z).project(camera);
      return { x: (this.corner.x + 1) / 2 * w, y: (1 - this.corner.y) / 2 * h };
    };
    const o = at(tile.x, tile.y), ex = at(tile.x + 1, tile.y), ez = at(tile.x, tile.y + 1);
    const ux = ex.x - o.x, uy = ex.y - o.y, vx = ez.x - o.x, vy = ez.y - o.y, det = ux * vy - uy * vx;
    if (Math.abs(det) < 1e-9) return;
    const xs = [o.x, ex.x, ez.x, ex.x + vx], ys = [o.y, ex.y, ez.y, ex.y + vy];
    const x0 = Math.max(0, Math.floor(Math.min(...xs))), x1 = Math.min(w, Math.ceil(Math.max(...xs)));
    const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(h, Math.ceil(Math.max(...ys)));
    if (x1 <= x0 || y1 <= y0) return;

    const img = ctx.createImageData(x1 - x0, y1 - y0), [r, g, b] = this.rgb, t = this.width;
    // A point of the art, in pixels, in the tile's own coordinates (0 to 1 along each edge): is it on the frame?
    const onFrame = (x: number, y: number) => {
      const dx = x - o.x, dy = y - o.y, u = (dx * vy - dy * vx) / det, v = (ux * dy - uy * dx) / det;
      return u >= 0 && u < 1 && v >= 0 && v < 1 && Math.min(u, 1 - u, v, 1 - v) < t;
    };
    for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) {
      if (SUB.filter(([sx, sy]) => onFrame(px + sx, py + sy)).length < COVER) continue;
      const i = ((py - y0) * (x1 - x0) + px - x0) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
    ctx.putImageData(img, x0, y0);
    this.drawn = true;
  }
}
