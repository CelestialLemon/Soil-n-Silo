import * as THREE from 'three';

// The game's tools painted onto the land (Soil-n-Silo#206, docs/API.md "The game's tools on the picture"): an overlay,
// a colour per tile washed over the ground (fertility, the ground's kinds, height, water, power, roads, bees), and the
// tile grid with the contour lines while the player builds or does earthworks. Both are drawn in the ground's own paint
// (GROUND_TOOLS_GLSL, at the end of the ground's shader), so they lie on the land as it's lit, under the things standing
// on it, and nothing else in the picture changes.

/** A tile the overlay leaves clear: any value over 0xffffff. */
export const OVERLAY_NONE = 0xffffffff;

/**
 * A colour per tile over the land. Tile (i, j) covers x from x0 + i × tile to x0 + (i + 1) × tile, and z the same from z0.
 * `color` holds width × height sRGB colours (0xrrggbb, OVERLAY_NONE for a clear tile), row by row along z, each row along x.
 */
export interface Overlay {
  width: number; height: number;
  color: Uint32Array;
  /** How strongly the colours cover the land, 0..1. */
  strength: number;
  /** The tiles' size (m) and where the first one's corner is: 4 m from (0, 0) by default, the game's. */
  tile?: number; x0?: number; z0?: number;
}

/** The tile grid and the contour lines, over a rectangle of tiles (Overlay's tiles: their size and corner, and how many). */
export interface Grid {
  width: number; height: number;
  tile?: number; x0?: number; z0?: number;
  /** How high a level stands (m): a contour line at each. 0 for none. */
  level: number;
}

/** How the overlay's tiles show at their edges, and how strong the grid's and the contours' lines are (a plain look until #206's pick). */
const EDGE = 0.35, GRID = 0.35, CONTOUR = 0.45;

export function createOverlayUniforms() {
  return {
    // The overlay: its tiles' colours (alpha 0 where clear), where they lie (x0, z0, the tile's size, how strong), their
    // count, whether there is one, and how dark a line between tiles of different colours is.
    tToolsOverlay: { value: null as THREE.Texture | null },
    uToolsOverlayRect: { value: new THREE.Vector4(0, 0, 4, 0) },
    uToolsOverlaySize: { value: new THREE.Vector2(1, 1) },
    uToolsOverlayOn: { value: 0 },
    uToolsOverlayEdge: { value: EDGE },
    // The grid: x0, z0, the tile's size, how high a level stands; its tiles' count; whether shown and its lines' strengths.
    uToolsGridRect: { value: new THREE.Vector4(0, 0, 4, 0) },
    uToolsGridSize: { value: new THREE.Vector2(1, 1) },
    uToolsGrid: { value: new THREE.Vector3(0, GRID, CONTOUR) },
  };
}
export type OverlayUniforms = ReturnType<typeof createOverlayUniforms>;

/**
 * At the end of the ground's paint: the overlay's colour over it, painted in the land's light (`light` and the bands the
 * ground was painted with), and the grid's and contours' lines. `p` is the point of the land, `n` its normal.
 */
export const GROUND_TOOLS_GLSL = /* glsl */ `
uniform sampler2D tToolsOverlay;
uniform vec4 uToolsOverlayRect;
uniform vec2 uToolsOverlaySize;
uniform float uToolsOverlayOn;
uniform float uToolsOverlayEdge;
uniform vec4 uToolsGridRect;
uniform vec2 uToolsGridSize;
uniform vec3 uToolsGrid;
vec3 toolsSrgbToLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
// The overlay's colour on tile t (alpha 0 off the overlay or where it's clear).
vec4 toolsOverlayAt(ivec2 t) {
  if (t.x < 0 || t.y < 0 || t.x >= int(uToolsOverlaySize.x) || t.y >= int(uToolsOverlaySize.y)) return vec4(0.0);
  return texelFetch(tToolsOverlay, t, 0);
}
vec3 groundTools(vec3 col, vec3 p, vec3 n, float light) {
  if (uToolsOverlayOn > 0.5) {
    vec2 q = (p.xz - uToolsOverlayRect.xy) / uToolsOverlayRect.z;
    ivec2 t = ivec2(floor(q));
    vec4 o = toolsOverlayAt(t);
    if (o.a > 0.0) {
      vec3 tint = paintBands(toolsSrgbToLin(o.rgb), light, 0.02, n.y * 0.5 + 0.5);
      // How far into the tile from its nearest side, in pixels, and whether the tile across that side has another colour.
      vec2 f = fract(q), fw = max(fwidth(q), vec2(1e-5));
      vec2 side = min(f, 1.0 - f) / fw;
      ivec2 across = t + ivec2(f.x < 0.5 ? -1 : 1, f.y < 0.5 ? -1 : 1);
      float differs = 0.0;
      if (side.x < 2.0 && distance(toolsOverlayAt(ivec2(across.x, t.y)), o) > 0.01) differs = 1.0 - smoothstep(0.5, 1.5, side.x);
      if (side.y < 2.0 && distance(toolsOverlayAt(ivec2(t.x, across.y)), o) > 0.01) differs = max(differs, 1.0 - smoothstep(0.5, 1.5, side.y));
      // A wash: the colour laid over the paint, which keeps its own light and dark.
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722)), own = max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 1e-3);
      col = mix(col, tint * (0.55 + 0.45 * lum / own), uToolsOverlayRect.w);
      col *= 1.0 - differs * uToolsOverlayEdge;
    }
  }
  if (uToolsGrid.x > 0.5) {
    vec2 q = (p.xz - uToolsGridRect.xy) / uToolsGridRect.z;
    if (q.x >= 0.0 && q.y >= 0.0 && q.x <= uToolsGridSize.x && q.y <= uToolsGridSize.y) {
      vec2 fw = max(fwidth(q), vec2(1e-5));
      vec2 g = abs(fract(q + 0.5) - 0.5) / fw;
      float line = 1.0 - smoothstep(0.4, 1.2, min(g.x, g.y));
      // A contour at each level's height, on the land that slopes across it gently (on a cliff they'd crowd into a smear;
      // on the flat, a terrace standing at a level, there's no line to draw, only the whole terrace).
      float contour = 0.0;
      if (uToolsGridRect.w > 0.0) {
        float h = p.y / uToolsGridRect.w, slope = fwidth(h), fh = max(slope, 1e-5);
        contour = (1.0 - smoothstep(0.5, 1.4, abs(fract(h + 0.5) - 0.5) / fh)) * (1.0 - smoothstep(0.25, 0.6, fh)) * smoothstep(1e-4, 5e-4, slope);
      }
      col *= 1.0 - max(line * uToolsGrid.y, contour * uToolsGrid.z);
    }
  }
  return col;
}
`;

/** The overlay and the grid as the renderer holds them, on the uniforms every material shares. */
export class GroundTools {
  readonly uniforms = createOverlayUniforms();
  private texture: THREE.DataTexture | null = null;

  setOverlay(o: Overlay | null) {
    const u = this.uniforms;
    if (!o) { u.uToolsOverlayOn.value = 0; return; }
    const { width: w, height: h } = o;
    if (!this.texture || this.texture.image.width !== w || this.texture.image.height !== h) {
      this.texture?.dispose();
      this.texture = new THREE.DataTexture(new Uint8Array(w * h * 4), w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
      this.texture.minFilter = this.texture.magFilter = THREE.NearestFilter;
      this.texture.generateMipmaps = false;
    }
    const data = this.texture.image.data as Uint8Array;
    for (let i = 0; i < w * h; i++) {
      const c = o.color[i] ?? OVERLAY_NONE, clear = c > 0xffffff;
      data[i * 4] = clear ? 0 : (c >> 16) & 255; data[i * 4 + 1] = clear ? 0 : (c >> 8) & 255; data[i * 4 + 2] = clear ? 0 : c & 255;
      data[i * 4 + 3] = clear ? 0 : 255;
    }
    this.texture.needsUpdate = true;
    u.tToolsOverlay.value = this.texture;
    u.uToolsOverlayRect.value.set(o.x0 ?? 0, o.z0 ?? 0, o.tile ?? 4, THREE.MathUtils.clamp(o.strength, 0, 1));
    u.uToolsOverlaySize.value.set(w, h);
    u.uToolsOverlayOn.value = 1;
  }

  setGrid(g: Grid | null) {
    const u = this.uniforms;
    if (!g) { u.uToolsGrid.value.x = 0; return; }
    u.uToolsGridRect.value.set(g.x0 ?? 0, g.z0 ?? 0, g.tile ?? 4, g.level);
    u.uToolsGridSize.value.set(g.width, g.height);
    u.uToolsGrid.value.x = 1;
  }
}
