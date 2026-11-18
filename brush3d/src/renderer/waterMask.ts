import * as THREE from 'three';

// Where the water's two passes (the bed under it and the scene mirrored in it) need drawing (#249): only where the water
// can show, and as far round it as the water reads them. The river is one mesh across the map, so the box round it on
// screen covers nearly all of it, though the water itself covers a few percent; drawn whole, the two passes cost about as
// much as the rest of the frame's passes but the main one.
//
// In plain words: the water's footprint (WaterField.footprint, boxes in the world) is laid on a coarse grid over the
// screen, each square marked if the water, or anything it reads, can reach into it. Before a pass draws, the marked
// squares are stamped into its depth: everywhere else is made "nearer than anything", so the GPU drops every pixel drawn
// there before painting it. And a thing whose bounds miss every marked square isn't drawn in that pass at all. Inside the
// marked squares the pass draws exactly as it did; outside them, nothing reads it.

/** The screen grid's squares across and up: 48 kept about 95% of a per-triangle mask's saving (#210's findings). */
export const MASK_GRID = 48;

/** One water pass's mask: which squares of the screen it draws, and the quads that stamp them into its depth. */
export class WaterMask {
  /** How many squares are marked: none, and the pass needn't be drawn at all. */
  filled = 0;
  /** The marked squares' bounds (squares, inclusive), for the pass's scissor. */
  private x0 = 0; private y0 = 0; private x1 = -1; private y1 = -1;
  private readonly grid = new Uint8Array(MASK_GRID * MASK_GRID);
  /** Marked squares summed from the corner, (MASK_GRID + 1) square, to ask of any rectangle at once. */
  private readonly sums = new Int32Array((MASK_GRID + 1) * (MASK_GRID + 1));
  private readonly positions = new Float32Array(MASK_GRID * MASK_GRID * 18);
  private readonly attribute = new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage);
  private readonly geometry = new THREE.BufferGeometry();
  /** The quads, alone, to draw into the pass's target before it. */
  readonly scene = new THREE.Scene();

  constructor() {
    this.geometry.setAttribute('position', this.attribute);
    // Far depth over the marked squares, nothing else: the colour stays as cleared, and the pass then draws there as
    // it would over a plain clear.
    const material = new THREE.ShaderMaterial({
      vertexShader: 'void main() { gl_Position = vec4(position.xy, 1.0, 1.0); }',
      fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }',
      colorWrite: false, depthFunc: THREE.AlwaysDepth, depthWrite: true,
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.scene.matrixWorldAutoUpdate = false;
  }

  /** Whether every square is marked: the pass draws as it would without a mask. */
  get full() { return this.filled === MASK_GRID * MASK_GRID; }

  /**
   * Marks the squares the boxes (six numbers each: min x, y, z, max x, y, z) cover on screen, `m` the world-to-screen
   * matrix's elements (an orthographic camera's: projected straight, no divide), each widened by `padX`, `padY` (the
   * screen's -1 to 1); mirrored about the height `mirror` first if given (where the reflection is read for that water),
   * `texelX`, `texelY` then half a texel of the pass's target (the screen's -1 to 1). Lays the quads: a run of marked
   * squares along a row, one quad.
   */
  build(boxes: Float32Array, m: ArrayLike<number>, padX: number, padY: number, mirror: number | null = null, texelX = 0, texelY = 0) {
    // A read off the target takes its edge texel (it clamps): brought onto that texel's middle, where it's drawn.
    const inX = (v: number) => Math.min(1 - texelX, Math.max(-1 + texelX, v)), inY = (v: number) => Math.min(1 - texelY, Math.max(-1 + texelY, v));
    const N = MASK_GRID, grid = this.grid;
    grid.fill(0);
    for (let b = 0; b < boxes.length; b += 6) {
      const my = (boxes[b + 1] + boxes[b + 4]) / 2;
      const cx = (boxes[b] + boxes[b + 3]) / 2, cy = mirror === null ? my : 2 * mirror - my, cz = (boxes[b + 2] + boxes[b + 5]) / 2;
      const ex = (boxes[b + 3] - boxes[b]) / 2, ey = (boxes[b + 4] - boxes[b + 1]) / 2, ez = (boxes[b + 5] - boxes[b + 2]) / 2;
      // The box's middle on screen, and how far it reaches either side of it.
      const X = m[0] * cx + m[4] * cy + m[8] * cz + m[12], Y = m[1] * cx + m[5] * cy + m[9] * cz + m[13];
      const ax = Math.abs(m[0]) * ex + Math.abs(m[4]) * ey + Math.abs(m[8]) * ez;
      const ay = Math.abs(m[1]) * ex + Math.abs(m[5]) * ey + Math.abs(m[9]) * ez;
      const rx = ax + padX, ry = ay + padY;
      if (mirror === null) { this.markRect(X - rx, Y - ry, X + rx, Y + ry); continue; }
      // While the water itself is on screen its reads are brought onto the target's edge: a pond near the bottom whose
      // mirror image falls below it reads the bottom row.
      const wx = X + m[4] * (my - cy), wy = Y + m[5] * (my - cy);
      if (!(wx + ax >= -1 && wx - ax <= 1 && wy + ay >= -1 && wy - ay <= 1)) continue;
      this.markRect(inX(X - rx), inY(Y - ry), inX(X + rx), inY(Y + ry));
    }
    // The sums, the bounds and the quads.
    const S = N + 1, sums = this.sums, p = this.positions;
    let filled = 0, v = 0, x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let y = 0; y < N; y++) {
      let row = 0;
      for (let x = 0; x < N; x++) {
        row += grid[y * N + x];
        sums[(y + 1) * S + x + 1] = sums[y * S + x + 1] + row;
      }
      for (let x = 0; x < N; x++) {
        if (!grid[y * N + x]) continue;
        const start = x;
        while (x + 1 < N && grid[y * N + x + 1]) x++;
        filled += x + 1 - start;
        if (start < x0) x0 = start; if (x > x1) x1 = x;
        if (y < y0) y0 = y; y1 = y;
        const a = (2 * start) / N - 1, c = (2 * (x + 1)) / N - 1, b0 = (2 * y) / N - 1, d = (2 * (y + 1)) / N - 1;
        p[v++] = a; p[v++] = b0; p[v++] = 0; p[v++] = c; p[v++] = b0; p[v++] = 0; p[v++] = a; p[v++] = d; p[v++] = 0;
        p[v++] = c; p[v++] = b0; p[v++] = 0; p[v++] = c; p[v++] = d; p[v++] = 0; p[v++] = a; p[v++] = d; p[v++] = 0;
      }
    }
    this.filled = filled;
    this.x0 = x0; this.y0 = y0; this.x1 = x1; this.y1 = y1;
    this.attribute.clearUpdateRanges();
    this.attribute.addUpdateRange(0, v);
    this.attribute.needsUpdate = true;
    this.geometry.setDrawRange(0, v / 3);
  }

  /** Marks every square a rectangle of the screen (-1 to 1) touches. */
  private markRect(lx: number, ly: number, hx: number, hy: number) {
    const r = this.squares(lx, ly, hx, hy);
    if (!r) return;
    for (let y = r[1]; y <= r[3]; y++) this.grid.fill(1, y * MASK_GRID + r[0], y * MASK_GRID + r[2] + 1);
  }

  private range = [0, 0, 0, 0];
  /** The squares (inclusive) a rectangle of the screen touches, or null if it's off the screen. */
  private squares(lx: number, ly: number, hx: number, hy: number) {
    const N = MASK_GRID;
    if (!(hx >= -1 && lx <= 1 && hy >= -1 && ly <= 1)) return null;
    const r = this.range;
    // (Clamped both ways: a rectangle on the screen's very edge, 1, is in the last square.)
    const at = (v: number) => Math.min(N - 1, Math.max(0, Math.floor(((v + 1) * N) / 2)));
    r[0] = at(lx); r[1] = at(ly); r[2] = at(hx); r[3] = at(hy);
    return r;
  }

  /** Whether a rectangle of the screen (-1 to 1) touches a marked square. */
  touches(lx: number, ly: number, hx: number, hy: number) {
    const r = this.squares(lx, ly, hx, hy);
    if (!r) return false;
    const S = MASK_GRID + 1, s = this.sums;
    return s[(r[3] + 1) * S + r[2] + 1] - s[r[1] * S + r[2] + 1] - s[(r[3] + 1) * S + r[0]] + s[r[1] * S + r[0]] > 0;
  }

  /** The marked squares' bounds in a target's pixels, as a scissor (x, y, width, height). */
  scissor(target: THREE.WebGLRenderTarget, into: THREE.Vector4) {
    const N = MASK_GRID, w = target.width, h = target.height;
    const x0 = Math.floor((this.x0 * w) / N), y0 = Math.floor((this.y0 * h) / N);
    const x1 = Math.ceil(((this.x1 + 1) * w) / N), y1 = Math.ceil(((this.y1 + 1) * h) / N);
    return into.set(x0, y0, x1 - x0, y1 - y0);
  }
}
