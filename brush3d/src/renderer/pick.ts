import * as THREE from 'three';

// Picking: what's under the pointer (Soil-n-Silo#206, docs/API.md "Picking"). The G-buffer already holds every pixel's
// depth as drawn, leaves, wind and all, so a pick copies the 3 × 3 pixels round the pointer out of it (a tiny pass into a
// float target, then read back: at once for a click, or a frame or two later without stalling for hovering) and turns the
// nearest depth into the point it shows. What stands there is then told apart on the CPU: a thing the game tagged whose
// box the point is in, else the land (the point is where the line of sight meets it), the water's surface, or a plant
// (what else stands on the land: trees, crops, rocks). A preview is never in the G-buffer, so it's never picked.

/** What a pick found: the game's tag (a thing's; null for the rest), what kind of thing, and where the pointer meets it (m). */
export interface PickHit {
  tag: unknown;
  what: 'thing' | 'plant' | 'land' | 'water';
  point: THREE.Vector3;
}

/** What the renderer gives a pick to tell what's at a point: where the land is met, and the water's surface. */
export interface PickWorld {
  landHit(ray: THREE.Ray, into?: THREE.Vector3): THREE.Vector3 | null;
  waterAt(x: number, z: number): number | null;
  /** The meshes the game tagged (visible or not). */
  tagged(): Iterable<THREE.Mesh>;
}

const COPY_VERT = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
// Each of the 3 × 3 pixels, its aux as the G-buffer has it (view normal, view depth, ink), or nothing off the picture.
const COPY_FRAG = /* glsl */ `
uniform sampler2D uPickAux;
uniform ivec2 uPickAt;
layout(location = 0) out vec4 outAux;
void main() {
  ivec2 p = uPickAt + ivec2(gl_FragCoord.xy) - 1, size = textureSize(uPickAux, 0);
  outAux = p.x < 0 || p.y < 0 || p.x >= size.x || p.y >= size.y ? vec4(0.0) : texelFetch(uPickAux, p, 0);
}
`;

/** How far a depth may be off along the line of sight (m): the G-buffer's half floats round it, by distance. */
const slack = (depth: number) => 0.3 + depth * 0.004;

export class Picker {
  private readonly target = new THREE.WebGLRenderTarget(3, 3, {
    type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: false,
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false,
  });
  private readonly material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: COPY_VERT, fragmentShader: COPY_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uPickAux: { value: null as THREE.Texture | null }, uPickAt: { value: new THREE.Vector2() } },
  });
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly world: PickWorld;

  constructor(world: PickWorld) {
    this.world = world;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.scene.add(quad);
  }

  /**
   * Copies the pixels round device pixel (x, y) of `aux` (from the top left, as the page counts) into the pick's target:
   * as the picture just drawn has them, before the next frame draws over them.
   */
  copy(gl: THREE.WebGLRenderer, aux: THREE.Texture, x: number, y: number, height: number) {
    this.material.uniforms.uPickAux.value = aux;
    (this.material.uniforms.uPickAt.value as THREE.Vector2).set(Math.floor(x), height - 1 - Math.floor(y));
    const was = gl.getRenderTarget();
    gl.setRenderTarget(this.target);
    gl.render(this.scene, this.camera);
    gl.setRenderTarget(was);
  }

  read(gl: THREE.WebGLRenderer): Float32Array {
    const out = new Float32Array(36);
    gl.readRenderTargetPixels(this.target, 0, 0, 3, 3, out);
    return out;
  }

  readAsync(gl: THREE.WebGLRenderer): Promise<Float32Array> {
    const read = gl.readRenderTargetPixelsAsync(this.target, 0, 0, 3, 3, new Float32Array(36)) as Promise<Float32Array>;
    // three (r180) leaves the read's buffer bound while it waits, and a click's pick read at once in the meantime would
    // read into it (WebGL refuses): unbound here, as the read binds it again to take its pixels.
    const c = gl.getContext() as WebGL2RenderingContext;
    c.bindBuffer(c.PIXEL_PACK_BUFFER, null);
    return read;
  }

  /**
   * What the pixels read show, seen by `camera` (as it drew them) through `ndc` (the pointer, -1..1): the nearest depth of
   * the nine (so a pointer on a thing's edge picks the thing, not a blend of it and what's behind), or null for the sky.
   */
  hit(pixels: Float32Array, camera: THREE.OrthographicCamera, ndc: THREE.Vector2): PickHit | null {
    let depth = Infinity;
    for (let i = 0; i < 9; i++) { const d = pixels[i * 4 + 2]; if (d > 0 && d < depth) depth = d; }
    if (!Number.isFinite(depth)) return null;
    // The line of sight from the camera's near plane; the camera is orthographic, so the depth is a distance along it.
    const ray = new THREE.Ray(new THREE.Vector3(ndc.x, ndc.y, -1).unproject(camera), camera.getWorldDirection(new THREE.Vector3()));
    const along = depth - camera.near, point = ray.at(along, new THREE.Vector3()), tol = slack(depth);
    // A tagged thing whose box (as placed) the point is in, the smallest if several.
    let best: THREE.Mesh | null = null, bestSize = Infinity;
    const local = new THREE.Ray(), inv = new THREE.Matrix4(), box = new THREE.Box3(), size = new THREE.Vector3();
    for (const mesh of this.world.tagged()) {
      if (!mesh.visible || !mesh.parent) continue;
      const g = mesh.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      inv.copy(mesh.matrixWorld).invert();
      local.copy(ray).applyMatrix4(inv);
      // Along the ray in the mesh's own frame, where it enters and leaves its box (a little bigger, for the slack).
      const scale = local.direction.length();
      local.direction.divideScalar(scale);
      box.copy(g.boundingBox!).expandByScalar(tol * 0.5);
      const span = slabs(local, box);
      if (!span) continue;
      const t = along * scale;
      if (t < span[0] - tol * scale || t > span[1] + tol * scale) continue;
      const s = box.getSize(size), volume = s.x * s.y * s.z;
      if (volume < bestSize) { best = mesh; bestSize = volume; }
    }
    if (best) return { tag: best.userData.tag, what: 'thing', point };
    // The land, where the line of sight meets it (exact, not the depth's rounding), if that's what shows.
    const land = this.world.landHit(ray);
    if (land && ray.origin.distanceTo(land) <= along + tol) return { tag: null, what: 'land', point: land };
    const water = this.world.waterAt(point.x, point.z);
    if (water !== null && Math.abs(point.y - water) < tol) return { tag: null, what: 'water', point };
    return { tag: null, what: 'plant', point };
  }
}

/** Where a ray (unit direction) enters and leaves a box, or null if it misses. */
function slabs(ray: THREE.Ray, box: THREE.Box3): [number, number] | null {
  let t0 = -Infinity, t1 = Infinity;
  for (const k of ['x', 'y', 'z'] as const) {
    const o = ray.origin[k], d = ray.direction[k];
    if (Math.abs(d) < 1e-12) { if (o < box.min[k] || o > box.max[k]) return null; continue; }
    let a = (box.min[k] - o) / d, b = (box.max[k] - o) / d;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    if (t0 > t1) return null;
  }
  return [t0, t1];
}
