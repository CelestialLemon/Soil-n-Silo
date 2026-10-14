import * as THREE from 'three';

// The terra look's ground, done in the shaders so the PixelScene (which the pixel renderer also draws) stays as it is:
// painterly, mottled grass in world-space colour patches; gentle mottling on soil and other ground; chunky earth cliffs
// (dark soil, lighter strata, a grassy lip) on the ground's vertical faces, i.e. the riverbanks and the map border; and
// the meadow beyond the map dropped a little, so the map's edge stands as a cliff.

/** How far the world beyond the map's edge is dropped (metres). */
export const BEYOND_DROP = 0.55;

/** Shared by the terra materials: the map's size in tiles (x, z). */
export const groundUniforms = {
  uTerraMap: { value: new THREE.Vector2(1, 1) },
};

/** A GLSL `vec3` of a hex colour, in linear RGB (the shaders work in linear). */
const lin = (hex: number) => { const c = new THREE.Color(hex); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; };

/** Value noise and a three-octave fbm over world xz; both in [0, 1]. */
export const NOISE = /* glsl */ `
float terraHash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float terraNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(terraHash(i), terraHash(i + vec2(1.0, 0.0)), u.x), mix(terraHash(i + vec2(0.0, 1.0)), terraHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float terraFbm(vec2 p) { return 0.5 * terraNoise(p) + 0.3 * terraNoise(p * 2.03 + 17.1) + 0.2 * terraNoise(p * 4.01 + 3.7); }
`;

/**
 * How far a world-mesh vertex drops: everything beyond the map's edge, plus the vertices on the edge that belong to the
 * meadow's top (the only ground at y = -0.02) or are the bottoms of boxes. The map's boxes keep their top edges, so their
 * sides, stretched down, become the cliff.
 */
export const DROP = /* glsl */ `
uniform vec2 uTerraMap;
float terraDrop(vec3 p) {
  const float e = 0.004;
  bool outside = p.x < -e || p.z < -e || p.x > uTerraMap.x + e || p.z > uTerraMap.y + e;
  bool onEdge = p.x < e || p.z < e || p.x > uTerraMap.x - e || p.z > uTerraMap.y - e;
  return (outside || (onEdge && (abs(p.y + 0.02) < 0.005 || p.y < -0.45))) ? ${BEYOND_DROP.toFixed(3)} : 0.0;
}
`;

/** `terraGrass(c, p)`: the painterly grass colour at world point p over a tile of colour `c` (needs NOISE). */
export const GRASS_COLOUR = /* glsl */ `
float terraLum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
// Fine speckle: a few lighter and darker dots per tile-tenth.
float terraSpeck(vec2 p) {
  vec2 cell = floor(p * 11.0), f = fract(p * 11.0) - 0.5;
  float h = terraHash(cell), dot_ = 1.0 - smoothstep(0.2, 0.42, length(f + (vec2(terraHash(cell + 7.1), terraHash(cell + 3.3)) - 0.5) * 0.3));
  return (h > 0.86 ? 0.16 : h < 0.12 ? -0.13 : 0.0) * dot_;
}
vec3 terraGrass(vec3 c, vec2 p) {
  float big = terraFbm(p * 0.11), mid = terraFbm(p * 0.42 + 7.3), warm = terraFbm(p * 0.16 + 31.0);
  float blot = terraFbm(p * 1.3 + 3.1), fine = terraNoise(p * 4.5);
  vec3 g = mix(${lin(0x438d2c)}, ${lin(0x5ba636)}, smoothstep(0.3, 0.58, big));
  g = mix(g, ${lin(0x7aba42)}, smoothstep(0.5, 0.72, 0.6 * mid + 0.4 * big));
  g = mix(g, ${lin(0x347826)}, smoothstep(0.4, 0.22, mid) * 0.4);
  g = mix(g, ${lin(0xa9c955)}, smoothstep(0.58, 0.78, warm) * 0.7);
  g *= 0.9 + 0.2 * smoothstep(0.3, 0.7, blot);
  // The tile's own colour (richer soil, greener grass) still shows through.
  vec3 own = c * (terraLum(g) / max(terraLum(c), 1e-3));
  g = mix(g, own, 0.3);
  return g * (0.92 + 0.16 * fine) * (1.0 + 1.4 * terraSpeck(p));
}
`;

/**
 * `terraSurface(c)`: the base colour of a fragment, given its vertex colour `c`. Uses the varyings vTerraPos (world
 * position), vTerraOrig (world position before the drop) and vTerraNormal (world normal).
 */
export const SURFACE = /* glsl */ `${GRASS_COLOUR}
vec3 terraMottle(vec3 c, vec2 p, float k) {
  return c * (1.0 + k * (terraFbm(p * 0.6 + 11.0) - 0.5) + k * 0.5 * (terraNoise(p * 3.1) - 0.5)) * (1.0 + 0.6 * terraSpeck(p));
}
// An earth cliff face: depth below the top (y = 0) sets the grassy lip, the strata and a darkening downwards.
vec3 terraCliff(vec3 pos) {
  float along = pos.x + pos.z, depth = -pos.y;
  float lip = depth - 0.05 - 0.035 * (terraNoise(vec2(along * 7.0, 1.3)) - 0.3) - 0.03 * terraNoise(vec2(along * 19.0, 4.1));
  float wave = depth * 30.0 + 2.2 * terraNoise(vec2(along * 1.7, 2.0)) + 0.8 * terraNoise(vec2(along * 6.0, 8.0));
  float strata = smoothstep(0.55, 0.8, 0.5 + 0.5 * sin(wave));
  vec3 soil = mix(${lin(0x6a4630)}, ${lin(0x9a7050)}, strata * 0.8);
  soil = mix(soil, ${lin(0x3a2618)}, smoothstep(0.2, 0.75, depth) * 0.6);
  soil *= 0.9 + 0.2 * terraNoise(vec2(along * 13.0, depth * 13.0));
  soil *= 1.0 + 0.8 * terraSpeck(vec2(along, depth * 1.3) + 5.0);
  vec3 grass = mix(${lin(0x3f8a2c)}, ${lin(0x5a9e34)}, terraNoise(vec2(along * 5.0, 0.0))) * (1.0 - 0.5 * smoothstep(-0.03, 0.0, lip));
  return lip < 0.0 ? grass : soil * (0.75 + 0.25 * smoothstep(0.0, 0.03, lip));
}
// Tilled field soil (the soil tiles' tops; world space, so the furrows run on unbroken across a field): the tile's
// fertility band (pale poor soil to dark rich soil) as a rich brown, furrows along x, damp patches, clods and a few pebbles.
const float TERRA_FURROWS = 4.0;   // per metre
float terraFurrowPhase(vec2 p) { return p.y * TERRA_FURROWS + 0.18 * terraNoise(p * vec2(1.3, 0.6)); }
vec3 terraFurrowTilt(vec2 p) { return vec3(0.0, 0.0, 0.45 * sin(6.2832 * terraFurrowPhase(p))); }
vec3 terraSoil(vec3 c, vec2 p, bool top) {
  float poor = smoothstep(0.03, 0.33, terraLum(c));
  vec3 s = mix(${lin(0x4e2f1c)}, ${lin(0x9a7650)}, poor);
  float damp = terraFbm(p * 0.8 + 5.0), clod = terraNoise(p * vec2(9.0, 14.0));
  s *= 0.82 + 0.3 * damp;
  s = mix(s, s * vec3(1.08, 0.95, 0.85), smoothstep(0.55, 0.8, terraFbm(p * 0.35 + 9.0)) * 0.6);   // warmer, redder patches
  if (!top) {
    // The slab's sides, where they stand above the grass (y 0 to 0.03): darker earth towards its foot, a crumbly lighter
    // band under the top edge, so the edge reads as a soft rim of soil rather than a hard box.
    float h = clamp(vTerraPos.y / 0.03, 0.0, 1.0);
    float crumb = terraNoise(vec2((p.x + p.y) * 23.0, h * 3.0));
    return s * mix(0.42, 0.78, h * h) * (1.0 + 0.25 * smoothstep(0.6, 1.0, h + 0.2 * crumb)) * (0.85 + 0.3 * clod);
  }
  float ridge = 0.5 + 0.5 * cos(6.2832 * terraFurrowPhase(p));
  s *= mix(0.6, 1.1, smoothstep(0.0, 0.85, ridge)) * (0.86 + 0.28 * clod);
  return s * (1.0 + 1.2 * terraSpeck(p * 1.4 + 2.0));
}
// Straw and ripe-grain yellows (red over green over blue, green 45-95% of red: wheat, not wood or orange paint) pushed
// richer and a little lighter, so ripe crops read as warm gold rather than khaki.
vec3 terraGold(vec3 c) {
  float gr = c.g / max(c.r, 1e-4), bg = c.b / max(c.g, 1e-4);
  float w = smoothstep(0.42, 0.58, gr) * (1.0 - smoothstep(0.85, 0.97, gr)) * (1.0 - smoothstep(0.35, 0.7, bg));
  if (w <= 0.0) return c;
  float l = terraLum(c);
  vec3 g = max(mix(vec3(l), c, 1.3), 0.0) * vec3(1.12, 1.04, 0.86);
  return mix(c, g, w);
}
vec3 terraSurface(vec3 c) {
  vec3 n = normalize(vTerraNormal);
  vec2 p = vTerraPos.xz;
  #ifdef TERRA_INSTANCED
  if (vTerraSoil > 0.5) return terraSoil(c, p, n.y > 0.7);
  // Objects: only low, flat-topped ones (overlays) are mottled, gently.
  if (n.y > 0.7 && vTerraPos.y < 0.06) return terraMottle(c, p, 0.16);
  return terraGold(c);
  #else
  if (vTerraOrig.y > 0.002) return c;   // the trees and flowers standing on the ground
  if (abs(n.y) < 0.5) return terraCliff(vTerraPos);
  if (vTerraPos.y < -0.3) return mix(terraMottle(c, p, 0.2), ${lin(0x1e4a4a)}, 0.6);   // a riverbed, under the water
  float grassy = smoothstep(-0.02, 0.03, c.g - c.r) * smoothstep(0.02, 0.1, c.g - c.b);
  return mix(terraMottle(c, p, 0.22), terraGrass(c, p), grassy);
  #endif
}
`;
