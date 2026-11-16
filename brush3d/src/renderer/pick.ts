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
  /**
   * A mesh's positions with its moving parts as drawn (parts.ts): now, or as `pose` had them (a copy taken as the picture
   * was drawn); null if it has none (#205).
   */
  posed?(geometry: THREE.BufferGeometry, pose?: Float32Array): THREE.BufferAttribute | null;
}

/**
 * What smoke (#205) writes as its ink in the G-buffer: under the lines' threshold (post.ts: none drawn on it, as on any
 * painted surface), but not 0, so a pick tells a puff from what's painted. A pick sees past smoke: it's no thing.
 */
export const SMOKE_INK = 1 / 256;

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
  private readonly raycaster = new THREE.Raycaster();

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
   * What the pixels read show, seen by `camera` (as it drew them) through `ndc` (the pointer, -1..1; `px` a pixel's size
   * in it): the nearest depth of the nine (so a pointer on a thing's edge picks the thing, not a blend of it and what's
   * behind), seen along that pixel's own line of sight; or null for the sky.
   */
  /** The tagged meshes shown, each as placed now: what a pick read later sees, as the picture copied had them. */
  snapshot(): Placed[] {
    const out: Placed[] = [];
    for (const mesh of this.world.tagged()) if (mesh.visible && mesh.parent) out.push({ mesh, matrix: mesh.matrixWorld.clone(), tag: mesh.userData.tag });
    return out;
  }

  hit(pixels: Float32Array, camera: THREE.OrthographicCamera, ndc: THREE.Vector2, px: THREE.Vector2, placed?: Placed[], pose?: Float32Array): PickHit | null {
    let depth = Infinity, nearest = 4;
    for (let i = 0; i < 9; i++) { const d = pixels[i * 4 + 2]; if (d > 0 && d < depth) { depth = d; nearest = i; } }
    if (!Number.isFinite(depth)) return null;
    // The pixels were read bottom row first, as the picture's own rows go up the screen.
    const at = new THREE.Vector3(ndc.x + ((nearest % 3) - 1) * px.x, ndc.y + (Math.floor(nearest / 3) - 1) * px.y, -1);
    // The line of sight from the camera's near plane; the camera is orthographic, so the depth is a distance along it.
    const ray = new THREE.Ray(at.unproject(camera), camera.getWorldDirection(new THREE.Vector3()));
    const along = depth - camera.near, point = ray.at(along, new THREE.Vector3()), tol = slack(depth);
    const things = placed ?? this.snapshot();
    // Smoke, over most of the pixel (its samples averaged: with what's painted, less; with what's inked, far more): what's
    // behind it along the line of sight (or, against the sky, nothing).
    const ink = pixels[nearest * 4 + 3], smoke = (k: number) => k > SMOKE_INK * 0.5 && k < SMOKE_INK * 1.5;
    if (smoke(ink)) return this.past(ray, along - tol, things, pose);
    // A tagged thing the line of sight meets where the depth says it does (the nearest such meeting): its box narrows
    // them down, its triangles decide, so the empty air in a box (round a turbine's mast, under its blades) isn't it.
    // A thing's leaves (a planted roof) are dabs drawn bigger than their cards: their box is enough.
    let best: THREE.Mesh | null = null, bestTag: unknown = null, off = Infinity;
    const local = new THREE.Vector3(), inv = new THREE.Matrix4(), box = new THREE.Box3(), pad = new THREE.Vector3(), hits: THREE.Intersection[] = [];
    this.raycaster.ray.copy(ray);
    for (const { mesh, matrix, tag } of things) {
      const g = mesh.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      // The point in the mesh's own frame, in its box (a little bigger, for the depth's rounding, along each of its axes
      // however it's scaled).
      inv.copy(matrix).invert();
      local.copy(point).applyMatrix4(inv);
      const e = inv.elements;
      pad.set(Math.hypot(e[0], e[4], e[8]), Math.hypot(e[1], e[5], e[9]), Math.hypot(e[2], e[6], e[10])).multiplyScalar(tol);
      box.copy(g.boundingBox!);
      box.min.sub(pad); box.max.add(pad);
      if (!box.containsPoint(local)) continue;
      let d = 0;
      if (!DABS.has(mesh.userData.kind as string)) {
        d = Infinity;
        for (const h of this.meet(mesh, matrix, pose, hits)) d = Math.min(d, Math.abs(h.distance - along));
        if (d > tol) continue;
      }
      if (d < off) { best = mesh; bestTag = tag; off = d; }
    }
    if (best) return { tag: bestTag, what: 'thing', point };
    // A pixel only partly smoke, its samples averaged with what's inked or painted behind or in front (its ink between
    // theirs), and its depth with theirs, so it may meet nothing at that depth: what the line of sight meets first. Smoke
    // only (a pixel by it is smoke): a tree's crown against a building averages to an ink between too, and is the tree.
    // (Known limit: a crown's edge over a building with a puff in the next pixel picks the building, a pixel's worth; the
    // samples can't tell it from a puff's edge, which is common, over its own chimney's building.)
    let byPuff = false;
    for (let i = 0; i < 9; i++) if (smoke(pixels[i * 4 + 3])) byPuff = true;
    if (byPuff && ink > SMOKE_INK * 0.1 && ink < 0.99) {
      const seen = this.past(ray, 0, things, pose);
      if (seen) return seen;
    }
    // The land, where the line of sight meets it (exact, not the depth's rounding), if that's what shows.
    const land = this.world.landHit(ray);
    if (land && ray.origin.distanceTo(land) <= along + tol) return { tag: null, what: 'land', point: land };
    const water = this.world.waterAt(point.x, point.z);
    if (water !== null && Math.abs(point.y - water) < tol) return { tag: null, what: 'water', point };
    return { tag: null, what: 'plant', point };
  }

  /** Where the line of sight meets a mesh's triangles, as it was placed and its parts turned when the picture was drawn. */
  private meet(mesh: THREE.Mesh, matrix: THREE.Matrix4, pose: Float32Array | undefined, hits: THREE.Intersection[]) {
    // Its triangles, its parts turned as they're drawn (#205).
    const posed = this.world.posed?.(mesh.geometry, pose);
    hits.length = 0;
    if (posed) {
      const turned = new THREE.BufferGeometry();
      turned.setAttribute('position', posed);
      turned.setIndex(mesh.geometry.index);
      const m = new THREE.Mesh(turned, mesh.material);
      m.matrixWorld.copy(matrix);
      m.raycast(this.raycaster, hits);
    } else {
      const now = mesh.matrixWorld.clone();
      mesh.matrixWorld.copy(matrix);
      mesh.raycast(this.raycaster, hits);
      mesh.matrixWorld.copy(now);
    }
    return hits;
  }

  /**
   * What the line of sight meets first past `from` (m along it), whatever the depth drawn: a thing's triangles, else the
   * land or the water over it; null if nothing (the sky). Not a plant (they're dabs, bigger than their cards): behind
   * smoke, the land it stands on.
   */
  private past(ray: THREE.Ray, from: number, placed: Placed[], pose?: Float32Array): PickHit | null {
    let best: Placed | null = null, near = Infinity;
    const hits: THREE.Intersection[] = [];
    this.raycaster.ray.copy(ray);
    for (const p of placed) {
      if (DABS.has(p.mesh.userData.kind as string)) continue;
      for (const h of this.meet(p.mesh, p.matrix, pose, hits)) if (h.distance >= from && h.distance < near) { near = h.distance; best = p; }
    }
    const land = this.world.landHit(ray);
    const ground = land ? ray.origin.distanceTo(land) : Infinity;
    if (best && near <= ground) return { tag: best.tag, what: 'thing', point: ray.at(near, new THREE.Vector3()) };
    if (!land || ground < from) return null;
    const water = this.world.waterAt(land.x, land.z);
    if (water !== null && water > land.y && ray.direction.y < 0) {
      // Where it meets the water's surface, if the water is there too (by a bank, that can be over dry land).
      const at = ray.at((water - ray.origin.y) / ray.direction.y, new THREE.Vector3()), there = this.world.waterAt(at.x, at.z);
      if (there !== null && Math.abs(there - water) < 0.05) return { tag: null, what: 'water', point: at };
    }
    return { tag: null, what: 'land', point: land };
  }
}

/**
 * A tagged mesh as it was placed when a picture was drawn, and its tag then: a game may hand a mesh to another thing
 * between frames (a good in a truck's bed, Soil-n-Silo#203), and the pick answers for what it drew.
 */
export interface Placed { mesh: THREE.Mesh; matrix: THREE.Matrix4; tag: unknown }

/** The kinds drawn as dabs on cards, bigger than the cards themselves. */
const DABS = new Set(['foliage', 'debris', 'smoke']);
