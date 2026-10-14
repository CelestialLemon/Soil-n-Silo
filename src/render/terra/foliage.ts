import * as THREE from 'three';
import { TERRAIN } from '../../game/map.ts';
import { buildingAt, layoutOf, type GameState } from '../../game/state.ts';
import { hash } from '../../world/kit.ts';
import { GRASS } from '../../world/terrain.ts';
import { GRASS_COLOUR, NOISE } from './ground.ts';
import { patch, shared, WIND } from './material.ts';

// The terra look's ground foliage: grass tufts and little clumps of wildflowers scattered over the open ground (grass and
// the ground under trees; not water, rocks or anything built), swaying in the wind. Two instanced meshes of tiny low-poly
// blades, placed deterministically from each tile's coordinates and rebuilt when the layout changes (a building placed or
// removed, a tree cleared). Richer soil grows more of it, and more flowers. The grass takes the ground's own colour (the
// same world-space patches as ground.ts) at the base, lighter towards the tips. Not in the renderer's objects, so never
// picked; no shadows cast (too small to matter, and the shadow pass would pay for every blade).

/** Grass tufts on an open tile: at least this many, plus up to TUFTS_RICH more on the richest soil. */
const TUFTS_MIN = 8, TUFTS_RICH = 10;
/** Flower clumps on an open tile, at most. */
const FLOWERS_MAX = 5;
/** Lean per metre² of height at full wind: blades bend much more than tree crowns. */
const SWAY = 1.3;
/** Wildflower colours (sRGB) and how common each is. */
const PETALS: [number, number][] = [[0xf6f3ea, 0.34], [0xf4d03a, 0.3], [0xa070dc, 0.2], [0xee82b4, 0.16]];

/** A small seeded random generator (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Geometry built from triangles, each vertex with a shade: 0 at the foot, 1 at a blade's tip, 2 for a flower's head. */
class Builder {
  private readonly pos: number[] = [];
  private readonly shade: number[] = [];
  tri(a: number[], b: number[], c: number[], sa: number, sb: number, sc: number) {
    this.pos.push(...a, ...b, ...c);
    this.shade.push(sa, sb, sc);
  }
  /** A tapering blade from (x, z) on the ground, `h` tall, leaning `lean` towards `dir` (radians). */
  blade(x: number, z: number, w: number, h: number, dir: number, lean: number) {
    const cx = Math.cos(dir), sz = Math.sin(dir), px = -sz * w / 2, pz = cx * w / 2;
    this.tri([x - px, 0, z - pz], [x + px, 0, z + pz], [x + cx * lean, h, z + sz * lean], 0, 0, 1);
  }
  /** A flower head: a squashed octahedron at (x, y, z). */
  head(x: number, y: number, z: number, r: number) {
    const top = [x, y + r * 0.55, z], bot = [x, y - r * 0.45, z];
    const ring = [0, 1, 2, 3].map((k) => [x + Math.cos(k * Math.PI / 2 + 0.4) * r, y, z + Math.sin(k * Math.PI / 2 + 0.4) * r]);
    for (let k = 0; k < 4; k++) {
      const a = ring[k], b = ring[(k + 1) % 4];
      this.tri(a, b, top, 2, 2, 2);
      this.tri(b, a, bot, 2, 2, 2);
    }
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    // Lit like the ground it grows from, whichever way a blade faces.
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    g.setAttribute('aShade', new THREE.Float32BufferAttribute(this.shade, 1));
    return g;
  }
}

/** A tuft: nine blades fanning out from a small patch, about 0.17 m tall. */
function tuftGeometry() {
  const b = new Builder(), r = rng(7);
  for (let k = 0; k < 9; k++) {
    const dir = k * 2.39996 + r() * 0.5, d = 0.035 * Math.sqrt(r());
    b.blade(Math.cos(dir) * d, Math.sin(dir) * d, 0.028 + 0.012 * r(), 0.1 + 0.09 * r(), dir, 0.03 + 0.05 * r());
  }
  return b.build();
}

/** A clump of three flowers on thin stems, with a couple of leaves at their feet. */
function flowerGeometry() {
  const b = new Builder(), r = rng(11);
  for (let k = 0; k < 3; k++) {
    const dir = k * 2.1 + r() * 0.6, d = 0.03 + 0.03 * r(), x = Math.cos(dir) * d, z = Math.sin(dir) * d, h = 0.15 + 0.08 * r();
    const lean = 0.02 * r();
    b.blade(x, z, 0.016, h, dir, lean);
    b.blade(x, z, 0.016, h, dir + Math.PI / 2, lean);
    b.head(x + Math.cos(dir) * lean, h, z + Math.sin(dir) * lean, 0.04 + 0.012 * r());
  }
  for (let k = 0; k < 3; k++) b.blade(0, 0, 0.03, 0.08 + 0.03 * r(), k * 2.1 + 0.9, 0.05);
  return b.build();
}

const VARY = /* glsl */ `
varying float vShade; varying vec3 vGround; varying vec4 vPetal;
`;

function foliageMaterial() {
  const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, side: THREE.DoubleSide });
  m.customProgramCacheKey = () => 'terra:foliage';
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared, { uFoliageHeight: foliageHeight });
    let vs = `uniform float uTerraTime; uniform float uFoliageHeight;
attribute float aShade; attribute vec3 aGround; attribute vec4 aPetal;
${WIND}${NOISE}${GRASS_COLOUR}${VARY}${shader.vertexShader}`;
    vs = patch(vs, '#include <begin_vertex>', /* glsl */ `
      vec3 transformed = vec3(position);
      transformed.y *= uFoliageHeight;
      vec2 base = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xz;
      float h = max(transformed.y, 0.0) * length(instanceMatrix[1].xyz);
      // Each tuft on its own beat too, so neighbours don't bend in lockstep.
      float t = uTerraTime + aPetal.w * 1.7;
      vec2 lean = terraWindLean(base, t) * SWAY * h * h;
      // Added in world space, after the instance's transform (project_vertex below).
      vec3 terraLean = vec3(lean.x, -0.35 * dot(lean, lean) / max(h, 0.01), lean.y);
      vShade = aShade; vPetal = aPetal;
      // The ground's colour where the plant stands (the same for all its vertices; cheaper here than per fragment).
      vGround = terraGrass(aGround, base) * mix(0.88, 1.12, aPetal.w);
    `.replace('SWAY', SWAY.toFixed(3)));
    vs = patch(vs, '#include <project_vertex>', /* glsl */ `
      vec4 mvPosition = instanceMatrix * vec4(transformed, 1.0);
      mvPosition.xyz += terraLean;
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;
    `);
    shader.vertexShader = vs;
    let fs = `${VARY}${shader.fragmentShader}`;
    fs = patch(fs, '#include <color_fragment>', /* glsl */ `#include <color_fragment>
      float s = clamp(vShade, 0.0, 1.0);
      vec3 col = vGround * mix(0.66, 1.5, s * s);
      col = mix(col, col * vec3(1.18, 1.12, 0.72), s * s * 0.45);   // sunlit, yellower tips
      if (vShade > 1.5) col = vPetal.rgb;
      diffuseColor.rgb = col;`);
    // Blades are lit as the ground under them is, from either side.
    fs = patch(fs, '#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize(vNormal);');
    shader.fragmentShader = fs;
  };
  return m;
}

/** Foliage height (0 to 1): pressed flat while an overlay colours the tiles, so the overlay reads. */
const foliageHeight = { value: 1 };

class Layer {
  readonly mesh: THREE.InstancedMesh;
  readonly ground: THREE.InstancedBufferAttribute;
  readonly petal: THREE.InstancedBufferAttribute;
  count = 0;
  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, capacity: number, scene: THREE.Scene) {
    this.ground = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3);
    this.petal = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    geometry.setAttribute('aGround', this.ground);
    geometry.setAttribute('aPetal', this.petal);
    this.mesh = new THREE.InstancedMesh(geometry, material, capacity);
    this.mesh.count = 0;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
    this.mesh.frustumCulled = false;   // spread over the whole map: one sphere would rarely cull it
    this.mesh.raycast = () => {};      // never picked
    scene.add(this.mesh);
  }
  put(m: THREE.Matrix4, ground: THREE.Color, petal: THREE.Color | null, vary: number) {
    const i = this.count++;
    this.mesh.setMatrixAt(i, m);
    this.ground.setXYZ(i, ground.r, ground.g, ground.b);
    this.petal.setXYZW(i, petal?.r ?? 0, petal?.g ?? 0, petal?.b ?? 0, vary);
  }
  done() {
    this.mesh.count = this.count;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.ground.needsUpdate = true;
    this.petal.needsUpdate = true;
  }
}

const GRASS_LIN = GRASS.map((pair) => pair.map((hex) => new THREE.Color(hex)));
const PETAL_LIN = PETALS.map(([hex]) => new THREE.Color(hex));
const PETAL_TOTAL = PETALS.reduce((a, [, w]) => a + w, 0);
function petalOf(u: number) {
  let acc = 0;
  for (let i = 0; i < PETALS.length; i++) { acc += PETALS[i][1] / PETAL_TOTAL; if (u < acc) return PETAL_LIN[i]; }
  return PETAL_LIN[PETAL_LIN.length - 1];
}

const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

export class TerraFoliage {
  private tufts: Layer | null = null;
  private flowers: Layer | null = null;
  private layout = -1;
  private readonly scene: THREE.Scene;
  private readonly material = foliageMaterial();

  constructor(scene: THREE.Scene) { this.scene = scene; }

  /** Lays the foliage out again if the layout changed; `flat` presses it down (for overlays), easing over `dt` seconds. */
  sync(s: GameState, flat: boolean, dt: number) {
    const goal = flat ? 0.05 : 1;
    foliageHeight.value += (goal - foliageHeight.value) * Math.min(1, dt * 12);
    const layout = layoutOf(s);
    if (layout === this.layout) return;
    this.layout = layout;
    const { width: w, height: h, terrain, fertility } = s.map;
    if (!this.tufts || !this.flowers) {
      this.tufts = new Layer(tuftGeometry(), this.material, w * h * (TUFTS_MIN + TUFTS_RICH), this.scene);
      this.flowers = new Layer(flowerGeometry(), this.material, w * h * FLOWERS_MAX, this.scene);
    }
    const tufts = this.tufts, flowers = this.flowers;
    tufts.count = flowers.count = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, t = terrain[i];
      if ((t !== TERRAIN.grass && t !== TERRAIN.tree) || buildingAt(s, x, y)) continue;
      const r = rng(Math.imul(x + 1, 73856093) ^ Math.imul(y + 1, 19349663));
      const f = fertility[i] / 100, band = Math.min(4, Math.floor(fertility[i] / 20));
      // The same tile colour as the ground under it (terrain.ts picks between the band's two by the same hash).
      const ground = GRASS_LIN[band][hash(x, y) < 0.5 ? 0 : 1];
      const under = t === TERRAIN.tree;
      let n = TUFTS_MIN + Math.round(TUFTS_RICH * f * (0.6 + 0.4 * r()));
      if (under) n = Math.round(n * 0.5);
      for (let k = 0; k < n; k++) {
        // Mostly small tufts, now and then a broad clump.
        const big = r() < 0.15;
        place(x + 0.04 + 0.92 * r(), y + 0.04 + 0.92 * r(), r() * Math.PI * 2, big ? 1.5 + 0.4 * r() : 0.8 + 0.5 * r(), big ? 1.1 + 0.3 * r() : 0.7 + 0.6 * r());
        tufts.put(m4, ground, null, r());
      }
      if (under) continue;
      // Flowers grow in drifts of one or two colours with bare grass between, more on rich soil.
      const patch = smoothstep(0.38, 0.72, smooth(x / 3.7, y / 3.7)), patchHue = smooth(x / 2.9 + 40, y / 2.9 + 17);
      const nf = Math.min(FLOWERS_MAX, Math.floor((1 + 3.5 * f) * patch + 0.25 * r()));
      for (let k = 0; k < nf; k++) {
        place(x + 0.08 + 0.84 * r(), y + 0.08 + 0.84 * r(), r() * Math.PI * 2, 0.85 + 0.3 * r(), 0.8 + 0.4 * r());
        flowers.put(m4, ground, petalOf(r() < 0.75 ? patchHue : r()), r());
      }
    }
    tufts.done(); flowers.done();
  }
}

/** Sets m4 to a plant at ground point (x, z), turned `yaw`, `wide` across and `tall` up. */
function place(x: number, z: number, yaw: number, wide: number, tall: number) {
  m4.compose(p3.set(x, 0, z), q.setFromAxisAngle(up, yaw), s3.set(wide, tall, wide));
}

const smoothstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Smooth value noise in [0, 1] over tile coordinates, for patches. */
function smooth(x: number, y: number) {
  const h = (i: number, j: number) => rng(Math.imul(i, 374761393) ^ Math.imul(j, 668265263))();
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return (h(i, j) * (1 - ux) + h(i + 1, j) * ux) * (1 - uy) + (h(i, j + 1) * (1 - ux) + h(i + 1, j + 1) * ux) * uy;
}
