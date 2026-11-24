import * as THREE from 'three';
import { DEPTH_ORIGIN_GLSL } from './auxDepth.ts';
import { TILE_REACH } from './tiles';

// The shelter map: what's under cover, seen from straight above, so rain and snow stop at roofs (#10). Three depth maps
// over a square of the land, drawn from above: the highest full cover over each point (roofs: the inked things, solar
// panels among them), the highest partial cover (tree crowns, drawn as their leaves) and the land itself (the ground, so
// a drop in the open knows where it lands, #11). A raindrop or snowflake stops at the height they give; the ground under
// a roof stays dry, under a crown drier. Nothing in them moves, so they're drawn only when what's under cover changes (a
// building placed or removed, the ground changed), not every frame; the crowns are drawn at rest, without the wind.
//
// A change in play (Soil-n-Silo#204: a building placed, a tree cleared, an earthwork) redraws only the square round what
// changed, in the layers it's in: the map is cleared there and what stands there drawn again. The whole map is drawn again
// only when something new reaches above or below the heights the map holds, or the square it covers moves.

/** How a mesh shelters what's under it: as a roof does, as a crown does (some rain gets through), or not at all. */
export type Cover = 'full' | 'partial' | 'none';
/** A map the shelter draws: the roofs, the crowns, or the land under them (the ground). */
export type ShelterLayer = 'full' | 'partial' | 'land';
/** A rectangle of a map's texels. */
interface Rect { x: number; y: number; w: number; h: number }

/** How much of the rain and snow a crown keeps off (a roof keeps off all of it): the developer's "partly" (#10). */
export const PARTIAL_COVER = 0.6;

/** The square of land the map covers: centred at x, z, `side` metres across, turned `turn` radians about the vertical. */
export interface ShelterArea { x: number; z: number; side: number; turn: number }

/**
 * For any material that reads the map: its uniforms (spread a ShelterMap's `uniforms` into the material's) and
 * `shelter(p)`, how sheltered a point is: 1 under a roof, PARTIAL_COVER under a crown, 0 in the open (and off the map).
 * Edges are soft over a texel, as a shadow map's are, so a dry patch's edge doesn't step. `shelterTop(p)` is the height
 * of the highest roof over p (far below the land where there's none): where a raindrop stops.
 */
export const SHELTER_GLSL = /* glsl */ `
uniform highp sampler2D uShelterFull;
uniform highp sampler2D uShelterPartial;
uniform highp sampler2D uShelterLand;
uniform mat4 uShelterMatrix;
// The map's depth to height: height = x - depth * y.
uniform vec2 uShelterHeight;
uniform float uShelterTexels;
// Whether p is under what the map at its texel holds, by a margin, so a roof doesn't shelter itself. A texel left clear
// (1, the far plane) holds nothing, however low p is.
float shelterUnder(highp sampler2D map, ivec2 t, float depth) {
  t = clamp(t, ivec2(0), ivec2(int(uShelterTexels) - 1));
  float d = texelFetch(map, t, 0).r;
  return d < 1.0 ? step(d, depth) : 0.0;
}
// Bilinear: the four texels round p, each compared, then blended.
float shelterSoft(highp sampler2D map, vec2 uv, float depth) {
  vec2 st = uv * uShelterTexels - 0.5;
  vec2 f = fract(st);
  ivec2 t = ivec2(floor(st));
  float a = shelterUnder(map, t, depth), b = shelterUnder(map, t + ivec2(1, 0), depth);
  float c = shelterUnder(map, t + ivec2(0, 1), depth), d = shelterUnder(map, t + ivec2(1, 1), depth);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float shelter(vec3 p) {
  vec3 s = (uShelterMatrix * vec4(p, 1.0)).xyz;
  if (any(lessThan(s.xy, vec2(0.0))) || any(greaterThan(s.xy, vec2(1.0)))) return 0.0;
  // Ten centimetres: a texel of a roof's slope, and a little more.
  float depth = s.z - 0.1 / uShelterHeight.y;
  return max(shelterSoft(uShelterFull, s.xy, depth), ${PARTIAL_COVER.toFixed(2)} * shelterSoft(uShelterPartial, s.xy, depth));
}
// The height a map holds over a point (its nearest texel), or -1e4 where it holds nothing or off the map.
float shelterHeightIn(highp sampler2D map, vec3 p) {
  vec3 s = (uShelterMatrix * vec4(p, 1.0)).xyz;
  if (any(lessThan(s.xy, vec2(0.0))) || any(greaterThan(s.xy, vec2(1.0)))) return -1e4;
  ivec2 t = clamp(ivec2(s.xy * uShelterTexels), ivec2(0), ivec2(int(uShelterTexels) - 1));
  float d = texelFetch(map, t, 0).r;
  return d < 1.0 ? uShelterHeight.x - d * uShelterHeight.y : -1e4;
}
float shelterTop(vec3 p) { return shelterHeightIn(uShelterFull, p); }
// The highest crown over p (where a drop a crown catches stops), and the land's own height there (the ground).
float crownTop(vec3 p) { return shelterHeightIn(uShelterPartial, p); }
float landTop(vec3 p) { return shelterHeightIn(uShelterLand, p); }
`;

/**
 * How far past its box a mesh may draw in the map (m): a crown's leaves are cards about their middles, and the trees stand
 * at their rest, not quite where they were built (TILE_REACH's room, for the same reasons). A part of the map redrawn is
 * this much bigger than what changed, and draws everything within this much of it.
 */
const REACH = TILE_REACH;

/** Every point to (-2, -2): off the map, while there's none. */
const OFF_MAP = new THREE.Matrix4().set(0, 0, 0, -2, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0, 1);

/** A mesh as the map sees it: which of its maps it's drawn into ('none': none). */
export interface CoverMesh { mesh: THREE.Mesh; cover: Cover | 'land'; depth: THREE.Material }

const LAYERS = ['full', 'partial', 'land'] as const;
/** The layer a mesh's cover is drawn into ('none' is drawn into none: it's left out by its cover). */
const layerOf = (cover: Cover | 'land'): ShelterLayer => (cover === 'none' ? 'full' : cover);

/** A mesh's box in the world, as last placed, into `out`. */
function worldBox(mesh: THREE.Mesh, out: THREE.Box3) {
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  return out.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);
}

export class ShelterMap {
  /** For materials that read it (see SHELTER_GLSL). */
  readonly uniforms = {
    uShelterFull: { value: null as THREE.Texture | null },
    uShelterPartial: { value: null as THREE.Texture | null },
    uShelterLand: { value: null as THREE.Texture | null },
    // Until it's drawn, every point is off the map.
    uShelterMatrix: { value: new THREE.Matrix4().copy(OFF_MAP) },
    uShelterHeight: { value: new THREE.Vector2(0, 1) },
    uShelterTexels: { value: 1 },
  };
  /** The square it covers; null: the ground's own square (the one its brush is baked over), whatever the scene sets. */
  area: ShelterArea | null = null;
  private full: THREE.WebGLRenderTarget;
  private partial: THREE.WebGLRenderTarget;
  private land: THREE.WebGLRenderTarget;
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private overlay: THREE.ShaderMaterial;
  private overlayScene = new THREE.Scene();
  private box = new THREE.Box3();
  /** Whether the whole map is to be drawn again (see changed). */
  private whole = true;
  /** The parts of each layer to draw again (world boxes), when only parts are: a mesh removed, an earthwork. */
  private parts: Record<ShelterLayer, THREE.Box3 | null> = { full: null, partial: null, land: null };
  /** The meshes added since the map was drawn, and their layers: their boxes are taken as it's drawn (they may be placed after). */
  private added = new Map<THREE.Mesh, ShelterLayer>();
  /** As the map was last drawn whole: its square, and the heights from its top to its bottom (m). */
  private drawn: { area: ShelterArea; top: number; bottom: number } | null = null;

  /** What the last draw drew again (world, m): a part, or null for the whole map (for what reads the map, the hollows). */
  lastPart: THREE.Box3 | null = null;

  /** Whether the map must be drawn again before it's next read. */
  get dirty() { return this.whole || this.added.size > 0 || this.parts.full !== null || this.parts.partial !== null || this.parts.land !== null; }

  /** Texels across (see resize). */
  get size() { return this.full.width; }

  /** `size`: texels across (docs/PERFORMANCE.md: 1024 full quality, 512 reduced). */
  constructor(size = 1024) {
    const target = () => {
      // Only the depth is read; the colour it must have is the smallest there is, a byte a texel.
      const t = new THREE.WebGLRenderTarget(size, size, { depthBuffer: true, format: THREE.RedFormat });
      t.depthTexture = new THREE.DepthTexture(size, size, THREE.UnsignedIntType);
      return t;
    };
    this.full = target();
    this.partial = target();
    this.land = target();
    this.uniforms.uShelterFull.value = this.full.depthTexture;
    this.uniforms.uShelterPartial.value = this.partial.depthTexture;
    this.uniforms.uShelterLand.value = this.land.depthTexture;
    this.uniforms.uShelterTexels.value = size;
    this.overlay = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: OVERLAY_VERT, fragmentShader: OVERLAY_FRAG,
      uniforms: {
        ...this.uniforms, tAux: { value: null }, uDepthOrigin: { value: 0 }, uCameraWorld: { value: new THREE.Matrix4() }, uHalf: { value: new THREE.Vector2() },
        uResolution: { value: new THREE.Vector2() },
      },
      transparent: true, depthTest: false, depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.overlay);
    quad.frustumCulled = false;
    this.overlayScene.add(quad);
  }

  /** Makes the map `size` texels across (the quality, #209), drawn again before it's next read. */
  resize(size: number) {
    if (size === this.size) return;
    for (const t of [this.full, this.partial, this.land]) t.setSize(size, size);
    this.uniforms.uShelterTexels.value = size;
    this.whole = true;
  }

  /**
   * Something under cover changed (moved, shown or hidden): the whole map is drawn again before it's next read. A mesh
   * added or removed, or a part of the land changed, needs only its part drawn again: see add, remove and changedIn.
   */
  changed() { this.whole = true; }

  /** A mesh under cover of `layer` (the land: the ground) was added: only where it stands is drawn again. */
  add(mesh: THREE.Mesh, layer: ShelterLayer) { this.added.set(mesh, layer); }

  /** A mesh under cover of `layer` was taken out: only where it stood is drawn again. */
  remove(mesh: THREE.Mesh, layer: ShelterLayer) {
    if (this.added.delete(mesh)) return;
    mesh.updateMatrixWorld();
    this.changedIn(layer, worldBox(mesh, new THREE.Box3()));
  }

  /** A layer changed within `box` (world, m): only that part of it is drawn again. */
  changedIn(layer: ShelterLayer, box: THREE.Box3) {
    if (box.isEmpty()) return;
    const was = this.parts[layer];
    if (was) was.union(box); else this.parts[layer] = box.clone();
  }

  /** Sets the square it covers (null: the ground's own). */
  setArea(area: ShelterArea | null) { this.area = area; this.whole = true; }

  /**
   * Draws the map, if it's dirty: the full cover into one depth map, the partial into another and the land into the
   * third, each mesh with its depth material (`meshes`), from straight above, everything else hidden. `scene` holds them; `area` is the square to cover
   * when none is set. The wind is stilled while it draws (`still`), so crowns are at rest. Only the parts changed are
   * drawn, when that's all that changed (see add, remove, changedIn).
   */
  draw(gl: THREE.WebGLRenderer, scene: THREE.Scene, meshes: CoverMesh[], area: ShelterArea | null, still: () => () => void) {
    if (!this.dirty) return false;
    const a = this.area ?? area;
    const parts = this.takeParts();
    if (!a) {
      this.drawn = null; this.lastPart = null;
      this.uniforms.uShelterMatrix.value.copy(OFF_MAP);
      return true;
    }
    const d = this.drawn;
    if (parts && d && d.area.x === a.x && d.area.z === a.z && d.area.side === a.side && d.area.turn === a.turn && this.drawParts(gl, scene, meshes, parts, still)) {
      return true;
    }
    this.lastPart = null;
    this.drawWhole(gl, scene, meshes, a, still);
    return true;
  }

  /** What's to be drawn again, by layer, or null if the whole map is; and nothing left to draw after. */
  private takeParts() {
    const whole = this.whole, parts = this.parts, box = new THREE.Box3();
    for (const [mesh, layer] of this.added) {
      if (!mesh.parent) continue;
      (parts[layer] ??= new THREE.Box3()).union(worldBox(mesh, box));
    }
    this.whole = false;
    this.parts = { full: null, partial: null, land: null };
    this.added.clear();
    return whole ? null : parts;
  }

  /** The whole map. */
  private drawWhole(gl: THREE.WebGLRenderer, scene: THREE.Scene, meshes: CoverMesh[], a: ShelterArea, still: () => () => void) {
    // From a metre above the highest cover (or land), down to a metre below everything in the scene.
    const box = this.box.makeEmpty(), b = new THREE.Box3(), covers = new Set<THREE.Object3D>();
    for (const m of meshes) if (m.cover !== 'none') covers.add(m.mesh);
    let top = -Infinity;
    for (const o of scene.children) {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible) continue;
      worldBox(mesh, b);
      box.union(b);
      if (covers.has(mesh)) top = Math.max(top, b.max.y);
    }
    const bottom = (box.isEmpty() ? 0 : box.min.y) - 1;
    top = Math.max(top, bottom) + 1;
    this.drawn = { area: { ...a }, top, bottom };
    const c = this.camera, h = a.side / 2;
    c.left = -h; c.right = h; c.top = h; c.bottom = -h; c.near = 0; c.far = top - bottom;
    c.position.set(a.x, top, a.z);
    // Turned with the square; for the farm's, the map's up is the default view's (the debug view's corner shows it so).
    c.up.set(-Math.sin(a.turn), 0, -Math.cos(a.turn));
    c.lookAt(a.x, bottom, a.z);
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
    const bias = new THREE.Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    this.uniforms.uShelterMatrix.value.copy(bias).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
    this.uniforms.uShelterHeight.value.set(top, top - bottom);
    this.render(gl, scene, meshes, null, () => true, still);
  }

  /**
   * Only the parts changed: each layer's part (and REACH round it, what a dab or a card of what changed may have covered)
   * cleared, and everything that may draw within what's cleared drawn again, scissored to it. False (nothing drawn) if
   * something to draw reaches out of the heights the map holds: the whole map is drawn instead.
   */
  private drawParts(gl: THREE.WebGLRenderer, scene: THREE.Scene, meshes: CoverMesh[], parts: Record<ShelterLayer, THREE.Box3 | null>, still: () => () => void) {
    const { top, bottom } = this.drawn!, b = new THREE.Box3(), near = new Set<THREE.Mesh>();
    const rects: Record<ShelterLayer, Rect | null> = { full: null, partial: null, land: null };
    const feet: Record<ShelterLayer, THREE.Box3 | null> = { full: null, partial: null, land: null };
    for (const layer of LAYERS) {
      const part = parts[layer];
      if (!part) continue;
      rects[layer] = this.texels(part.clone().expandByScalar(REACH));
      // Where the cleared texels lie in the world (on a turned map, more than the part).
      if (rects[layer]) feet[layer] = this.footprint(rects[layer]);
    }
    for (const m of meshes) {
      const foot = m.cover === 'none' ? null : feet[layerOf(m.cover)];
      if (!foot || !m.mesh.visible) continue;
      // Its box and as far again as its dabs and cards reach past it.
      worldBox(m.mesh, b).expandByScalar(REACH);
      if (b.min.x > foot.max.x || b.max.x < foot.min.x || b.min.z > foot.max.z || b.max.z < foot.min.z) continue;
      if (b.max.y - REACH > top || b.min.y + REACH < bottom) return false;
      near.add(m.mesh);
    }
    this.render(gl, scene, meshes, rects, (m) => near.has(m), still);
    // What was drawn again: the world under the texels cleared.
    this.lastPart = new THREE.Box3();
    for (const layer of LAYERS) { const foot = feet[layer]; if (foot) this.lastPart.union(foot); }
    return true;
  }

  /**
   * Draws each layer's meshes (those `draws` picks, each with its depth material) into its map, from above: within its
   * rect only, where `rects` are given (a layer with none isn't drawn), else all of it.
   */
  private render(
    gl: THREE.WebGLRenderer, scene: THREE.Scene, meshes: CoverMesh[], rects: Record<ShelterLayer, Rect | null> | null,
    draws: (mesh: THREE.Mesh) => boolean, still: () => () => void,
  ) {
    const size = this.size;
    const hidden = new Set<THREE.Object3D>();
    for (const o of scene.children) if (o.visible) { o.visible = false; hidden.add(o); }
    const saved = meshes.map((m) => [m, m.mesh.material, m.mesh.visible] as const);
    const unstill = still();
    try {
      for (const cover of LAYERS) {
        const target = cover === 'full' ? this.full : cover === 'partial' ? this.partial : this.land;
        if (rects) {
          const rect = rects[cover];
          if (!rect) continue;
          target.scissor.set(rect.x, rect.y, rect.w, rect.h);
          target.scissorTest = true;
        }
        for (const m of meshes) {
          m.mesh.visible = layerOf(m.cover) === cover && m.cover !== 'none' && hidden.has(m.mesh) && draws(m.mesh);
          m.mesh.material = m.depth;
        }
        gl.setRenderTarget(target);
        gl.clear(false, true, false);
        gl.render(scene, this.camera);
        target.scissorTest = false;
        target.scissor.set(0, 0, size, size);
      }
    } finally {
      unstill();
      for (const [m, material, visible] of saved) { m.mesh.material = material; m.mesh.visible = visible; }
      for (const o of hidden) o.visible = true;
    }
    // The next target set picks up the scissor test cleared.
    gl.setRenderTarget(null);
  }

  /** The world's x and z (a box, any height) that the texels `rect` cover. */
  private footprint(rect: Rect) {
    const unmap = this.uniforms.uShelterMatrix.value.clone().invert(), p = new THREE.Vector3(), out = new THREE.Box3();
    for (const u of [rect.x, rect.x + rect.w]) for (const v of [rect.y, rect.y + rect.h]) {
      out.expandByPoint(p.set(u / this.size, v / this.size, 0.5).applyMatrix4(unmap));
    }
    return out;
  }

  /** The texels a world box covers (a texel more each way, for the soft edges), or null if none. */
  private texels(box: THREE.Box3): Rect | null {
    const m = this.uniforms.uShelterMatrix.value, size = this.size, p = new THREE.Vector3();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const x of [box.min.x, box.max.x]) for (const z of [box.min.z, box.max.z]) {
      p.set(x, 0, z).applyMatrix4(m);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    const ix0 = Math.max(0, Math.floor(x0 * size) - 1), iy0 = Math.max(0, Math.floor(y0 * size) - 1);
    const ix1 = Math.min(size, Math.ceil(x1 * size) + 1), iy1 = Math.min(size, Math.ceil(y1 * size) + 1);
    return ix1 > ix0 && iy1 > iy0 ? { x: ix0, y: iy0, w: ix1 - ix0, h: iy1 - iy0 } : null;
  }

  /**
   * The debug view, over the finished frame: the ground under a roof in blue, hatched; under a crown in pale teal; the
   * tops of the roofs (where rain lands, and snow will lie) in warm yellow; and the map itself, from above, in the corner.
   * `aux` is the G-buffer's (view normal, view depth, stored less `depthOrigin`: auxDepth.ts); `camera` the view's.
   */
  drawOverlay(gl: THREE.WebGLRenderer, aux: THREE.Texture, depthOrigin: number, camera: THREE.OrthographicCamera, width: number, height: number) {
    const u = this.overlay.uniforms;
    u.tAux.value = aux;
    u.uDepthOrigin.value = depthOrigin;
    (u.uCameraWorld.value as THREE.Matrix4).copy(camera.matrixWorld);
    (u.uHalf.value as THREE.Vector2).set(camera.right, camera.top);
    (u.uResolution.value as THREE.Vector2).set(width, height);
    gl.render(this.overlayScene, this.camera);
  }

  dispose() {
    this.full.dispose(); this.partial.dispose(); this.land.dispose(); this.overlay.dispose();
  }
}

const OVERLAY_VERT = /* glsl */ `
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const OVERLAY_FRAG = /* glsl */ `
precision highp float;
${SHELTER_GLSL}
uniform sampler2D tAux;
${DEPTH_ORIGIN_GLSL}
uniform mat4 uCameraWorld;
uniform vec2 uHalf;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;
void main() {
  // The map itself, from above, in the bottom-left corner: roofs blue (lighter higher up), crowns teal.
  float inset = min(uResolution.x, uResolution.y) * 0.32;
  vec2 px = gl_FragCoord.xy - 12.0;
  if (px.x >= 0.0 && px.y >= 0.0 && px.x < inset && px.y < inset) {
    vec2 uv = px / inset;
    float full = texture(uShelterFull, uv).r, part = texture(uShelterPartial, uv).r;
    vec3 col = vec3(0.93, 0.9, 0.82);
    if (part < 1.0) col = mix(vec3(0.55, 0.85, 0.75), vec3(0.2, 0.55, 0.5), part);
    if (full < 1.0 && full <= part) col = mix(vec3(0.75, 0.85, 1.0), vec3(0.1, 0.25, 0.75), smoothstep(0.0, 1.0, full));
    fragColor = vec4(col, 0.92);
    return;
  }
  vec4 aux = texture(tAux, vUv);
  aux.z = auxDepth(aux.z);
  if (aux.z <= 0.0) discard;
  // Where this pixel is: the view's orthographic camera, back along its view by the depth.
  vec3 p = (uCameraWorld * vec4((vUv * 2.0 - 1.0) * uHalf, -aux.z, 1.0)).xyz;
  float under = shelter(p);
  vec3 s = (uShelterMatrix * vec4(p, 1.0)).xyz;
  bool onMap = all(greaterThanEqual(s.xy, vec2(0.0))) && all(lessThanEqual(s.xy, vec2(1.0)));
  // A roof's own top: at the full map's height there.
  float top = onMap ? 1.0 - smoothstep(0.08, 0.2, abs(shelterTop(p) - p.y)) : 0.0;
  float hatch = step(0.5, fract((gl_FragCoord.x + gl_FragCoord.y) / 10.0));
  float full = clamp((under - ${PARTIAL_COVER.toFixed(2)}) / ${(1 - PARTIAL_COVER).toFixed(2)}, 0.0, 1.0);
  float part = min(under, ${PARTIAL_COVER.toFixed(2)}) / ${PARTIAL_COVER.toFixed(2)} - full;
  vec4 col = vec4(0.0);
  col = mix(col, vec4(0.45, 0.95, 0.85, 0.4), part);
  col = mix(col, vec4(0.15, 0.35, 1.0, 0.45 + 0.25 * hatch), full);
  col = mix(col, vec4(1.0, 0.85, 0.2, 0.55), top * (1.0 - full));
  if (col.a <= 0.0) discard;
  fragColor = col;
}
`;
