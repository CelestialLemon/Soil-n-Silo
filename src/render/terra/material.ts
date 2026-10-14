import * as THREE from 'three';
import { DROP, groundUniforms, NOISE, SURFACE } from './ground.ts';
import { TERRA_SOIL_FLAG } from '../../world/shapes.ts';

// The terra look's one material family: MeshStandardMaterial (and a matching depth material for posed shadows), patched to
// read the game's vertex attributes. `aColor` (linear RGB) is the base colour; vertices flagged EMISSIVE or GLOW glow,
// more after dusk; instanced objects carry a tint, an opacity, a highlight and a clock phase per instance; geometry with
// motion attributes (`aMode`, `aAnchor`, `aAnim`, see the renderer's motion.ts for the encoding) is posed on the GPU.
// The world meshes (not instanced) are the ground and what stands on it: ground.ts shades them and drops what lies beyond
// the map's edge; low flat objects get a gentle mottling.

/** What varies between the material variants. */
export interface Variant {
  /** Drawn as an InstancedMesh with the per-instance attributes below. */
  instanced: boolean;
  /** The geometry has motion attributes. */
  motion: boolean;
  /** See-through objects (opacity below 1): blended, no depth writes. */
  transparent: boolean;
}

/** Per-instance attributes of an instanced object mesh: tint (linear rgb, strength) and extra (opacity, highlight, phase, sway). */
export const INSTANCE_TINT = 'aTint', INSTANCE_EXTRA = 'aExtra';

/** Uniforms every variant shares, so one write reaches them all. */
export const shared = {
  uTerraTime: { value: 0 },
  /** How strongly emissive surfaces glow (rises after dusk). */
  uTerraGlow: { value: 0.6 },
  /** How hard the wind blows plants about (0 calm to about 1.5 in a gale), from the game's weather. */
  uTerraWind: { value: 0.6 },
  ...groundUniforms,
};

/**
 * The wind, for everything that sways in it (tree crowns, bushes, the ground foliage): `terraWindLean(p, t)` is the
 * world-space (x, z) lean per metre² of height of a plant standing at ground point p. Two slow travelling waves (gusts
 * rolling across the map) over a slight steady lean downwind, plus a quicker flutter; scaled by uTerraWind.
 */
export const WIND = /* glsl */ `
uniform float uTerraWind;
vec2 terraWindLean(vec2 p, float t) {
  float g = 0.6 * sin(dot(p, vec2(0.31, 0.19)) - 1.1 * t) + 0.4 * sin(dot(p, vec2(-0.17, 0.43)) - 1.9 * t + 1.7);
  float flutter = sin(dot(p, vec2(1.7, -1.3)) + 3.7 * t);
  return uTerraWind * (vec2(0.86, 0.5) * (0.35 + g) + vec2(-0.5, 0.86) * 0.25 * flutter);
}
`;

// Attributes, uniforms and the posing code: both the lit and the depth vertex shaders take these.
const VERTEX_COMMON = /* glsl */ `
uniform float uTerraTime;
${DROP}
${WIND}
/** How far tree crowns lean, per metre² of height, at full wind. */
const float TERRA_TREE_SWAY = 0.022;
#ifdef TERRA_INSTANCED
// A swaying object (w = aExtra.w > 0: trees, bushes): leans with the wind by its height above its base squared, so the trunk's
// foot stays put. p is in the object's own space.
vec3 terraSway(vec3 p, float w) {
  mat4 m = modelMatrix * instanceMatrix;
  vec2 base = (m * vec4(0.0, 0.0, 0.0, 1.0)).xz;
  float h = max(p.y, 0.0) * length(m[1].xyz);
  vec2 lean = terraWindLean(base, uTerraTime) * TERRA_TREE_SWAY * w * h * h;
  return p + inverse(mat3(m)) * vec3(lean.x, 0.0, lean.y);
}
#else
// The trees beyond the map's edge, part of the world mesh: everything standing above the ground (y > 0) sways, by its
// height above the meadow (y = -0.02). The phase follows the vertex, slowly enough that a crown bends rather than tears.
vec3 terraSwayWorld(vec3 p) {
  if (p.y < 0.002) return p;
  float h = p.y + 0.02;
  vec2 lean = terraWindLean(p.xz, uTerraTime) * TERRA_TREE_SWAY * h * h;
  return p + vec3(lean.x, 0.0, lean.y);
}
#endif
#ifdef TERRA_INSTANCED
attribute vec4 aTint; attribute vec4 aExtra;
#endif
#ifdef TERRA_MOTION
attribute float aMode; attribute vec3 aAnchor; attribute vec4 aAnim;
// Two travelling waves of wind; p is the plant's base on the ground.
float terraGust(vec2 p, float t) {
  return 0.6 * sin(dot(p, vec2(0.41, 0.28)) + 1.5 * t) + 0.4 * sin(dot(p, vec2(0.9, -0.62)) + 2.6 * t);
}
vec3 terraRotate(vec3 v, vec3 k, float a) { float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c); }
// Moves a rest-pose vertex (position and normal, in the geometry's own space) by its motion mode.
void terraPose(inout vec3 p, inout vec3 n) {
  float t = uTerraTime;
  #ifdef TERRA_INSTANCED
  t += aExtra.z * 97.0;   // each instance on its own clock, so copies don't move in lockstep
  mat4 terraModel = modelMatrix * instanceMatrix;
  #endif
  int mode = int(aMode + 0.5);
  if (mode == 1) {                    // sway: anim = (weight, base x, base z); the lean is in world space
    vec2 base = aAnim.yz;
    #ifdef TERRA_INSTANCED
    base = (terraModel * vec4(aAnim.y, 0.0, aAnim.z, 1.0)).xz;
    #endif
    float g = terraGust(base, t), w = aAnim.x;
    vec3 lean = vec3(0.13 * g * w, -0.025 * abs(g) * w, 0.045 * g * w);
    #ifdef TERRA_INSTANCED
    lean = inverse(mat3(terraModel)) * lean;
    #endif
    p += lean;
  } else if (mode == 2) {             // conveyor along +x: anim = (start x, length, speed)
    float x1 = aAnim.x, len = aAnim.y;
    float x = x1 + mod(aAnchor.x - x1 + t * aAnim.z, len);
    float grow = smoothstep(x1, x1 + 0.3, x) * (1.0 - smoothstep(x1 + len - 0.3, x1 + len, x));
    p = aAnchor + (p - aAnchor) * grow + vec3(x - aAnchor.x, 0.0, 0.0);
  } else if (mode == 3) {             // smoke puff: rises from the anchor, swells, then shrinks away. anim = (phase, seed)
    float u = fract(t * 0.09 + aAnim.x), seed = aAnim.y;
    float size = mix(0.2, 0.8, smoothstep(0.0, 0.8, u)) * (0.85 + 0.3 * seed);
    float fade = smoothstep(0.0, 0.07, u) * (1.0 - smoothstep(0.5, 0.98, u));
    vec3 drift = vec3(0.3 * u + 0.5 * u * u + 0.2 * sin(7.0 * u + 20.0 * seed), 2.5 * u, 0.1 * sin(5.0 * u + 11.0 * seed));
    p = aAnchor + drift + p * size * fade;
  } else if (mode == 4 || mode == 5) {  // butterflies and fireflies: not drawn yet
    p = aAnchor;
  } else if (mode == 6 || mode == 7) {  // spin / swing about an axis through the anchor: anim = (axis, speed or amplitude)
    float a = mode == 6 ? t * aAnim.w : aAnim.w * sin(1.3 * t + dot(aAnchor, vec3(1.7, 0.3, 2.1)));
    p = aAnchor + terraRotate(p - aAnchor, aAnim.xyz, a);
    n = terraRotate(n, aAnim.xyz, a);
  }
}
#endif
`;

const VARYINGS = /* glsl */ `
varying vec3 vTerraColor; varying float vTerraGlow; varying float vTerraAlpha; varying float vTerraHighlight;
varying vec3 vTerraPos; varying vec3 vTerraOrig; varying vec3 vTerraNormal; varying float vTerraSoil;
`;

/** Replaces a chunk in a three.js shader, failing loudly if a three upgrade renamed it. */
export function patch(src: string, find: string, put: string) {
  if (!src.includes(find)) throw new Error(`terra material: three's shader has no '${find}'`);
  return src.replace(find, put);
}

function defines(v: Variant): Record<string, string> {
  const d: Record<string, string> = {};
  if (v.instanced) d.TERRA_INSTANCED = '';
  if (v.motion) d.TERRA_MOTION = '';
  return d;
}

const key = (v: Variant) => `terra:${+v.instanced}${+v.motion}${+v.transparent}`;

function makeLit(v: Variant): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, transparent: v.transparent, depthWrite: !v.transparent });
  Object.assign(m, { defines: defines(v) });   // three reads `defines` on any material; the types only declare it on some
  m.customProgramCacheKey = () => key(v);
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);
    let vs = `attribute vec3 aColor;\nattribute float aFlag;\n${VERTEX_COMMON}${VARYINGS}${shader.vertexShader}`;
    vs = patch(vs, '#include <beginnormal_vertex>', /* glsl */ `
      vec3 objectNormal = vec3(normal);
      vec3 terraPos = vec3(position);
      #ifdef TERRA_MOTION
      terraPose(terraPos, objectNormal);
      #endif
      #ifdef TERRA_INSTANCED
      if (aExtra.w > 0.0) terraPos = terraSway(terraPos, aExtra.w);
      #endif
      int terraFlag = int(floor(aFlag + 0.5));
      vTerraColor = aColor;
      vTerraGlow = (terraFlag == 1 || terraFlag == 5) ? 1.0 : 0.0;
      vTerraAlpha = 1.0; vTerraHighlight = 0.0;
      vTerraSoil = terraFlag == ${TERRA_SOIL_FLAG} ? 1.0 : 0.0;
      #ifdef TERRA_INSTANCED
      vTerraColor = mix(aColor, aTint.rgb, aTint.w);
      vTerraAlpha = aExtra.x; vTerraHighlight = aExtra.y;
      vTerraPos = vTerraOrig = (modelMatrix * instanceMatrix * vec4(terraPos, 1.0)).xyz;
      vTerraNormal = mat3(modelMatrix * instanceMatrix) * objectNormal;
      #else
      vTerraOrig = terraPos;   // the world meshes sit at the origin, unscaled: object space is world space
      #ifndef TERRA_MOTION
      terraPos = terraSwayWorld(terraPos);
      #endif
      terraPos.y -= terraDrop(terraPos);
      vTerraPos = terraPos;
      vTerraNormal = objectNormal;
      #endif
    `);
    vs = patch(vs, '#include <begin_vertex>', 'vec3 transformed = terraPos;');
    shader.vertexShader = vs;

    let fs = `uniform float uTerraGlow;\n${VARYINGS}${NOISE}${SURFACE}${shader.fragmentShader}`;
    fs = patch(fs, '#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= terraSurface(vTerraColor);\ndiffuseColor.a *= vTerraAlpha;');
    // Field soil's furrows tilt its normal, so the sun picks out their ridges (terraFurrowTilt, ground.ts).
    fs = patch(fs, '#include <normal_fragment_maps>', /* glsl */ `#include <normal_fragment_maps>
      if (vTerraSoil > 0.5 && vTerraNormal.y > 0.7) normal = normalize(normal + mat3(viewMatrix) * terraFurrowTilt(vTerraPos.xz));`);
    fs = patch(fs, '#include <emissivemap_fragment>', /* glsl */ `#include <emissivemap_fragment>
      totalEmissiveRadiance += vTerraColor * vTerraGlow * uTerraGlow;
      if (vTerraHighlight > 0.5) {   // a warm rim and a slight lift
        vec3 viewDir = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);
        float rim = pow(1.0 - clamp(abs(dot(viewDir, normal)), 0.0, 1.0), 2.0);
        totalEmissiveRadiance += vec3(1.0, 0.92, 0.75) * (0.04 + 0.35 * rim);
      }`);
    shader.fragmentShader = fs;
  };
  return m;
}

function makeDepth(v: Variant): THREE.MeshDepthMaterial {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  Object.assign(m, { defines: defines(v) });
  m.customProgramCacheKey = () => `${key(v)}:depth`;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);
    shader.vertexShader = patch(`${VERTEX_COMMON}${shader.vertexShader}`, '#include <begin_vertex>', /* glsl */ `
      vec3 transformed = vec3(position);
      #ifdef TERRA_MOTION
      vec3 terraNormal = vec3(0.0, 1.0, 0.0);
      terraPose(transformed, terraNormal);
      #endif
      #ifdef TERRA_INSTANCED
      if (aExtra.w > 0.0) transformed = terraSway(transformed, aExtra.w);
      #else
      #ifndef TERRA_MOTION
      transformed = terraSwayWorld(transformed);
      #endif
      transformed.y -= terraDrop(transformed);
      #endif
    `);
  };
  return m;
}

const lit = new Map<string, THREE.MeshStandardMaterial>(), depth = new Map<string, THREE.MeshDepthMaterial>();

/** The lit material for a variant (one per variant, shared by every mesh using it). */
export function litMaterial(v: Variant) {
  let m = lit.get(key(v));
  if (!m) lit.set(key(v), m = makeLit(v));
  return m;
}

/** The shadow depth material (every variant poses, sways or drops its vertices somehow). */
export function depthMaterial(v: Variant) {
  let m = depth.get(key(v));
  if (!m) depth.set(key(v), m = makeDepth(v));
  return m;
}
