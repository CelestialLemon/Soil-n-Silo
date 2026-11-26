import { CLOUD_MAP_GLSL, MIRROR } from './cloudMap';
import { UNDER_CLOUD_CAP, UNDER_CLOUD_FADE } from './overcast';
import { HIDDEN_DIVE, WATER_MAP_GLSL } from './water';

// Shared GLSL: noise, OKLab colour, and the painted light model every surface uses.
//
// The look is built in OKLab/OKLCh rather than RGB, so a shadow can turn teal or violet and a lit band warm gold without
// muddying: lightness, chroma and hue move separately, the way a painter mixes a shade instead of adding black.

/** Hashes and noise. All of it is keyed to world positions, never screen ones, so the paint stays put as the camera moves. */
export const NOISE = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
// 2D simplex noise (Ashima Arts, MIT), in [-1, 1].
vec3 permute3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm2(vec2 p) { return snoise(p) * 0.65 + snoise(p * 2.13 + 17.1) * 0.35; }
// Brush strokes: noise stretched along a direction, so it reads as dabs laid side by side rather than as a cloud.
float strokes(vec2 p, float angle) {
  float c = cos(angle), s = sin(angle);
  vec2 q = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  return snoise(q * vec2(0.55, 2.6)) * 0.6 + snoise(q * vec2(1.3, 5.5) + 31.7) * 0.4;
}
// Brush dabs: the plane covered in overlapping, elongated dabs (cells in a stretched, turned frame), each with its own
// value, the way a painter lays strokes side by side. The cells blend softly into their neighbours (a smooth Voronoi), so a
// dab has a soft, rounded edge rather than a cut one. Returns the dab value in about [-1, 1].
float dabs(vec2 p, float angle, float stretch) {
  float c = cos(angle), s = sin(angle);
  vec2 q = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  q.x /= stretch;
  vec2 i = floor(q), f = fract(q);
  float sum = 0.0, wsum = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = hash22(i + g) * 0.9 + 0.05;
    vec2 r = g + o - f;
    r.x *= stretch * 0.5;
    float w = exp(-9.0 * dot(r, r));
    sum += w * (hash12(i + g + 4.1) * 2.0 - 1.0);
    wsum += w;
  }
  return sum / max(wsum, 1e-5);
}
// Two layers of dabs at different sizes and angles, so no grid shows: a value in about [-1, 1].
float dabLayer(vec2 p, float scale, float angle) {
  float a = dabs(p * scale, angle, 2.6);
  float b = dabs(p * scale * 1.9 + 17.3, angle + 0.4, 2.2);
  // Bristle streaks along the stroke.
  float hair = snoise(vec2(dot(p, vec2(cos(angle), sin(angle))) * scale * 1.2, dot(p, vec2(-sin(angle), cos(angle))) * scale * 9.0));
  return clamp(a * 1.25, -1.0, 1.0) * 0.6 + b * 0.3 + hair * 0.12;
}
// Dabs laid along a direction that may change across a surface. Turning the whole pattern by a varying angle would swirl it
// (far from the origin a small turn is a big shift), so the dabs are laid at fixed 30° steps and the two nearest blended.
float paintDabs(vec2 p, float scale, float angle) {
  const float STEP = 0.5235988;
  float k = angle / STEP, k0 = floor(k), w = smoothstep(0.3, 0.7, k - k0);
  return mix(dabLayer(p, scale, k0 * STEP), dabLayer(p, scale, (k0 + 1.0) * STEP), w);
}
float paintStrokes(vec2 p, float angle) {
  const float STEP = 0.5235988;
  float k = angle / STEP, k0 = floor(k), w = smoothstep(0.3, 0.7, k - k0);
  return mix(strokes(p, k0 * STEP), strokes(p, (k0 + 1.0) * STEP), w);
}
`;

/** OKLab conversions (Björn Ottosson), on linear sRGB. */
export const OKLAB = /* glsl */ `
vec3 linToOklab(vec3 c) {
  c = max(c, 0.0);
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(l, 1.0 / 3.0); m = pow(m, 1.0 / 3.0); s = pow(s, 1.0 / 3.0);
  return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
              1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
              0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLinRaw(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
              -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
              -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 oklabToLin(vec3 c) { return max(oklabToLinRaw(c), 0.0); }
// To linear sRGB, keeping the hue and lightness and giving up chroma when the colour is out of gamut, as a painter's pigment
// would (clipping the channels instead turns a deep green shade neon).
vec3 oklabToLinFit(vec3 lab) {
  vec3 c = oklabToLinRaw(lab);
  if (min(c.r, min(c.g, c.b)) >= 0.0) return c;
  float lo = 0.0, hi = 1.0;
  for (int i = 0; i < 6; i++) {
    float m = (lo + hi) * 0.5;
    vec3 t = oklabToLinRaw(vec3(lab.x, lab.yz * m));
    if (min(t.r, min(t.g, t.b)) >= 0.0) lo = m; else hi = m;
  }
  return max(oklabToLinRaw(vec3(lab.x, lab.yz * lo)), 0.0);
}
// Rotates a colour's hue by 'turn' radians, scales its chroma and shifts its lightness, in OKLCh.
vec3 lchShift(vec3 lab, float dL, float cMul, float turn) {
  float c = cos(turn), s = sin(turn);
  vec2 ab = vec2(c * lab.y - s * lab.z, s * lab.y + c * lab.z) * cMul;
  return vec3(lab.x + dL, ab);
}
// Pulls a colour's hue part of the way towards a target hue (radians in OKLab's a-b plane), the short way round, and never
// more than about 40°: a painter cools a shade, he doesn't swap its colour (yellow wheat in shade stays a warm olive).
vec3 hueToward(vec3 lab, float target, float amount) {
  float h = atan(lab.z, lab.y);
  float d = mod(target - h + 3.14159265, 6.2831853) - 3.14159265;
  float c = length(lab.yz), nh = h + clamp(d * amount, -0.7, 0.7);
  return vec3(lab.x, c * cos(nh), c * sin(nh));
}
`;

/** The time-of-day light, set once per frame by the renderer. */
export const LIGHT_UNIFORMS = /* glsl */ `
uniform vec3 uSunDir;        // world, towards the sun
uniform vec3 uSunColor;      // linear, multiplies the lit band
uniform vec3 uSkyColor;      // linear, the light that fills shadows from above
uniform vec3 uRimColor;      // linear, the warm edge light on foliage
uniform float uShadeHue;     // OKLab hue the shade band leans to (radians)
uniform float uShadeLean;    // how far it leans (0..1)
uniform float uShadeDepth;   // lightness taken off in shade
uniform float uLitHue;       // OKLab hue the lit band leans to
uniform float uLitLean;
uniform vec3 uOvercast;      // under cloud: x the share of light from the whole sky, y the share of cast shadow taken away,
                             // z how much wider shadows' edges get (see overcast.ts)
uniform float uTime;
uniform vec2 uWindDir;       // where the wind blows towards, a unit vector in xz
uniform float uWindSpeed;    // m/s, the wind's average (the game's, eased by the game)
uniform vec2 uWindDrift;     // how far the leaves in the air have been carried downwind (metres)
uniform float uWindFlutter;  // the leaves' flutter phase (radians)
uniform vec3 uViewBack;     // the main camera's backward direction (wind moves things only across it)
uniform sampler2D uShadowMap;
uniform mat4 uShadowMatrix;  // world -> shadow-map uv and depth
uniform vec2 uShadowTexel;
uniform vec2 uShadowArea;    // how much of the map, from its corner, the sun's view is drawn into (shadowDepthAt)
uniform float uMirror;       // 1 while drawing the water's reflection: the scene mirrored in the plane y = uMirrorY
uniform float uMirrorY;      // (the water at another height reads it shifted on screen: see WATER_FRAG)
${WATER_MAP_GLSL}
`;

/**
 * Under a cloud (#8): the light there is the overcast look's (overcast.ts) where the light elsewhere is the gaps', mixed
 * by the cloud's shade at the pixel. Each surface calls cloudAt first; the light model's pieces then read the light
 * there (overcastHere, sunColorHere, ...), and exposeHere brightens or dims the finished colour to it. The uniforms are
 * set by the renderer from the looks.
 */
export const CLOUD_LIGHT = /* glsl */ `
${CLOUD_MAP_GLSL}
uniform float uCloudStrength;  // how much a cloud's shade counts: as direct as the sun is (none before dawn, faint by the moon)
uniform vec3 uCloudOvercast;   // under a cloud, as uOvercast
uniform vec3 uCloudSunColor;   // under a cloud, as uSunColor
uniform vec3 uCloudRimColor;   // under a cloud, as uRimColor
uniform vec4 uCloudBands;      // under a cloud: the shade's hue (radians from uShadeHue, the short way), its depth, the lit
                               // band's lean, and the exposure (over the grade's)
uniform vec2 uCloudTint;       // under a cloud, from the gaps': the lit band's hue (radians, the short way) and the shade's
                               // lean (a storm's, storm.ts; none without one)
uniform float uLightExposure;  // in the gaps: the exposure, over the grade's
uniform float uCloudShadow;    // TEMPORARY (#316): the look a cast shadow takes under a cloud, 0 orig, 1 a, 2 b, 3 c (sunVisibility)
uniform float uCloudOne;       // TEMPORARY (#316): always 1 (see bandsOf)
uniform float uCloudPart;      // TEMPORARY (#316): how far the candidates apply: 1 while the gaps between the clouds are in the
                               // sun, easing to 0 as the sky closes (renderer.ts), where they're the old look
// The cloud's shade here, 0 in the sun .. 1 under the deepest of it, as strong as the sun is direct.
float gCloud = 0.0;
void cloudAt(vec3 p) { gCloud = cloudMapShade(p.xz) * uCloudStrength; }
vec3 overcastHere() { return mix(uOvercast, uCloudOvercast, gCloud); }
vec3 sunColorHere() { return mix(uSunColor, uCloudSunColor, gCloud); }
vec3 rimColorHere() { return mix(uRimColor, uCloudRimColor, gCloud); }
float shadeHueHere() { return uShadeHue + uCloudBands.x * gCloud; }
float litHueHere() { return uLitHue + uCloudTint.x * gCloud; }
float shadeLeanHere() { return uShadeLean + uCloudTint.y * gCloud; }
vec3 exposeHere(vec3 c) { return c * mix(uLightExposure, uCloudBands.w, gCloud); }
// TEMPORARY (#316, sunVisibility): where a cloud softens a cast shadow (candidates b and c), how far the painted colour
// goes from the shadow's towards the colour there with no shadow (paintBands, snowPaint), the light it would have with
// none (each material's, gLightOpen), and the light the same shadow has in the gaps between the clouds (gLightGap, c's
// ceiling); 0 elsewhere: the colour as it was. gVisGap is the sun's visibility in the gaps' light. And gSunVis is the
// sun's visibility for what only the direct sun makes (a glint, a sparkle, the sun on the bed): none inside a cast
// shadow while the sun shines in the gaps, cloud or not.
float gOpen = 0.0;
float gLightOpen = 1.0;
float gLightGap = 1.0;
float gVisGap = 1.0;
float gSunVis = 1.0;
// 1 where the paint isn't exposed after (exposeHere: the ice, which the water blends as it is), so c's ceiling compares
// the colours as they are; 0, exposed, everywhere else.
float gUnexposed = 0.0;
// c: the same paint in the gaps (paintBands' 'gap'), less this paint brought to the gaps' exposure: what frostPaint adds
// to its paint for the same paint (and what was laid over it since) in the gaps.
vec3 gGapShift = vec3(0.0);
// The exposures under the cloud here and in the gaps, as the paint will be (gUnexposed).
float exposeCloud() { return gUnexposed > 0.5 ? 1.0 : mix(uLightExposure, uCloudBands.w, gCloud); }
float exposeGap() { return gUnexposed > 0.5 ? 1.0 : uLightExposure; }
// 'lift': the light the cast shadow takes away here; 'toGap': what the gaps' light (sunLightGap, gVisGap) adds to it.
void lightOpen(float light, float lift, float toGap) { if (gOpen > 0.0) { gLightOpen = light + lift; gLightGap = light + toGap; } }
// The share of the way from the shadow's colour here ('shut') to the open colour: b's, gOpen; c's no more than keeps it
// as dark, exposed (exposeHere), as the same shadow in the gaps' light ('gap'), so a shadow is never lighter under a
// cloud than it is in the sun beside it.
float openShare(vec3 shut, vec3 open, vec3 gap) {
  if (uCloudShadow < 2.5) return gOpen;
  vec3 lum = vec3(0.2126, 0.7152, 0.0722);
  float e = exposeCloud(), ys = dot(shut, lum) * e, yo = dot(open, lum) * e;
  return clamp(min(gOpen, (dot(gap, lum) * exposeGap() - ys) / max(yo - ys, 1e-6)), 0.0, 1.0);
}
// c's ceiling: a shadow already lighter under the cloud than in the gaps (the cloud's flatter light lifts a low sun's
// dim faces, at dusk) darkened to the gaps' (as exposed, exposeCloud and exposeGap), as far as the candidates apply
// (uCloudPart).
vec3 gapCeiling(vec3 c, vec3 gap) {
  if (uCloudShadow < 2.5) return c;
  vec3 lum = vec3(0.2126, 0.7152, 0.0722);
  float y = dot(c, lum) * exposeCloud(), yg = dot(gap, lum) * exposeGap();
  return y > yg ? c * mix(1.0, yg / y, uCloudPart) : c;
}
`;

/**
 * The sky mirrored in the water and the solar glass (#8): the gaps' sky, and the clouds in it from the sky map (cloudMap.ts,
 * MIRROR), lit by the hour (warm at dawn and dusk) and brightest on the side towards the sun, thickening into the
 * overcast sky as it closes. The uniforms are set by the renderer from the looks. Needs CLOUD_LIGHT.
 */
export const MIRROR_SKY = /* glsl */ `
uniform sampler2D uSkyMap;
uniform vec4 uSkyRect;        // the sky map's corner (x, z) and 1 / its side
uniform vec3 uGapSkyTop;      // the sky in the gaps between the clouds, overhead
uniform vec3 uGapSkyBottom;   // and low down
uniform vec3 uCloudLit;       // a cloud's sunlit side, in the hour's light
uniform vec3 uCloudBelly;     // its underside; and the whole sky once it closes
uniform float uSkyClosed;     // how far the sky has closed, 0..1
float skyCloudAt(vec2 xz) { return texture(uSkyMap, (xz - uSkyRect.xy) * uSkyRect.zw).r; }
// Where a ray from p along r meets the clouds; rays near the horizon as if a little higher.
vec2 skyPoint(vec3 p, vec3 r) { return p.xz + r.xz / max(r.y, ${MIRROR.rise.toFixed(2)}) * ${MIRROR.height.toFixed(1)}; }
// The sky at xz, the gaps' between the top and the bottom by low (0 overhead .. 1 the horizon); cloud is how much of it
// is cloud.
vec3 mirrorSky(vec2 xz, float low, out float cloud) {
  vec3 gap = mix(uGapSkyTop, uGapSkyBottom, low);
  cloud = skyCloudAt(xz);
  float closed = uSkyClosed;
  // Lit (the developer's pick, #8): the side towards the sun bright, the thick middle a cooler grey.
  float sunward = skyCloudAt(xz + normalize(uSunDir.xz + vec2(1e-4, 0.0)) * 8.0);
  float edge = smoothstep(0.0, 0.25, cloud - sunward);
  vec3 belly = mix(mix(uCloudLit, uCloudBelly, 0.85) * 0.9, uCloudBelly, closed);
  vec3 col = mix(mix(mix(uCloudLit, uCloudBelly, closed), belly, smoothstep(0.5, 1.0, cloud)), uCloudLit * 1.15,
    edge * (1.0 - closed));
  return mix(gap, col, cloud);
}
`;

/**
 * The shadow map's depth at `uv`, a point of the sun's view (0..1 across its window). The view is drawn into only a corner
 * of the map when a low sun's narrow window would take more detail than the cap (uShadowArea, #251: BrushRenderer
 * followView), so `uv` is mapped to that corner, and kept to its outermost texels' centres as the whole map's own edge keeps
 * it: past them is an older frame's. With all the map drawn (uShadowArea 1) it reads just what `uv` would. For every reader
 * of the map, with uShadowMap, uShadowTexel and uShadowArea declared.
 */
export const SHADOW_DEPTH = /* glsl */ `
float shadowDepthAt(vec2 uv) {
  return texture(uShadowMap, clamp(uv * uShadowArea, uShadowTexel * 0.5, uShadowArea - uShadowTexel * 0.5)).r;
}
// How much further (metres) a surface with normal n is pushed off itself before it reads the map, past its own push for
// all the map drawn over the window: the corner's texels are coarser (uShadowArea < 1), each a bigger patch whose depth is
// its centre's, and a surface at a slant to the sun sits in front of or behind that by its slope across the patch (shadow
// acne: lit ground at a low sun dashed with its own shade). A push of a texel's growth across the sun's view along the
// normal's lean in each axis covers it: the point is up to half a texel from the centre read, but half a texel's growth
// still left a speckle at the widest zoom, so a whole one. The price: every shadow comes up short by the push (stretched
// by a low sun), and what stands lower than it (a sill, at Low zoomed out) throws none, where the capped map could show
// one. None with all the map drawn: just as before.
float shadowSlack(vec3 n) {
  vec3 ax = vec3(uShadowMatrix[0][0], uShadowMatrix[1][0], uShadowMatrix[2][0]);   // uv a metre, across and up
  vec3 ay = vec3(uShadowMatrix[0][1], uShadowMatrix[1][1], uShadowMatrix[2][1]);
  vec2 grow = uShadowTexel * (1.0 - uShadowArea) / uShadowArea;                     // the texel's growth, in uv
  return abs(dot(n, ax)) * grow.x / dot(ax, ax) + abs(dot(n, ay)) * grow.y / dot(ay, ay);
}
`;

/**
 * Sun visibility from the shadow map, softened by a small rotated disc of taps and nudged by the brush, in 0..1. The taps
 * and the brush's nudge are measured across the view's window (in texels of all the map drawn over it), so the soft edge
 * keeps its width on the ground however much of the map is drawn (shadowDepthAt).
 */
export const SHADOW = /* glsl */ `
${SHADOW_DEPTH}
float sunVisibility(vec3 worldPos, vec3 n, float brush) {
  vec3 p = worldPos + n * (0.04 + shadowSlack(n));
  vec4 s = uShadowMatrix * vec4(p, 1.0);
  vec3 uvz = s.xyz / s.w;
  if (uvz.x < 0.0 || uvz.x > 1.0 || uvz.y < 0.0 || uvz.y > 1.0 || uvz.z > 1.0) return 1.0;
  // The brush wobbles where the edge is sampled, so a shadow's border is painted rather than ruled.
  vec2 wob = vec2(brush, snoise(worldPos.xz * 1.7 + 9.0)) * uShadowTexel * 2.5;
  vec3 overcast = overcastHere();
  // TEMPORARY (#316): the look candidates for a cast shadow under a cloud, while the sun shines in the gaps between the
  // clouds (uCloudPart; once the sky closes every candidate eases into the old look). In the old look (orig) a cloud
  // took most of the shadow away by lifting its light (UNDER_CLOUD_FADE), which swept the shadow up through the
  // half-tone into the lit band as the cloud's edge crossed it (a moving seam), and shrank and widened it as its soft
  // edge crossed the bands: shadows brightened, slid and banded at the cloud's edge. Every candidate keeps the light in a
  // shadow the gaps' (its shape and strength), so nothing crosses a band as a cloud passes; b and c then soften the
  // shadow in its colour, part of the way to the colour there with no shadow (gOpen, paintBands), which can't light a
  // shadow past the open colour:
  //   a, a veil: no softening; the cloud dims and cools the shadow with the ground round it, a darker shadow.
  //   b, a dissolve: most of the way (UNDER_CLOUD_FADE), to a faint trace.
  //   c, a half step: some of the way (UNDER_CLOUD_CAP), and never lighter than the shadow is in the sun (openShare).
  bool cand = gCloud > 0.0 && uCloudShadow > 0.5 && uCloudPart > 0.0;
  float fade = overcast.y;
  if (cand) {
    fade = mix(overcast.y, uOvercast.y, uCloudPart);
    overcast.z = mix(overcast.z, uOvercast.z, uCloudPart);
  }
  float vis = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 2.39996 + hash12(worldPos.xz * 31.0) * 6.283;
    float r = sqrt((float(i) + 0.5) / 8.0) * 2.2 * (1.0 + overcast.z);
    vec2 o = vec2(cos(a), sin(a)) * r * uShadowTexel + wob;
    float d = shadowDepthAt(uvz.xy + o);
    vis += (uvz.z - 0.0015 > d) ? 0.0 : 1.0;
  }
  vis /= 8.0;
  float lit = mix(vis, 1.0, fade);
  gSunVis = lit;
  if (cand) {
    // The direct sun: none where the shadow map is blocked (not the shadow's lift, which is the sky's light), easing
    // into the old look as the sky closes (uCloudPart) and in from the gaps' over the cloud's edge (gCloud to 0.1).
    gSunVis = mix(mix(vis, 1.0, overcast.y), vis, uCloudPart * min(gCloud * 10.0, 1.0));
    gVisGap = mix(vis, 1.0, uOvercast.y);
    if (uCloudShadow > 1.5 && vis < 1.0) gOpen = gCloud * uCloudPart * (uCloudShadow > 2.5 ? ${UNDER_CLOUD_CAP.toFixed(2)} : ${UNDER_CLOUD_FADE.toFixed(2)});
  }
  return lit;
}
`;

/**
 * The painted light model. `base` is the surface's own colour (linear); `light` is how lit it is (0 deep shade .. 1 full sun),
 * with the brush already in it. Three bands (shade, half-tone, lit) with soft, brush-broken edges: `soft` is how wide an edge is.
 */
export const PAINT = /* glsl */ `
// The look's light colours as tints: their hue, at a set strength, with the brightness left to the exposure.
vec3 tintOf(vec3 c, float amount) { return mix(vec3(1.0), c / max(max(c.r, c.g), max(c.b, 1e-3)), amount); }
vec3 sunTint() { return tintOf(sunColorHere(), 0.4); }
vec3 skyTint() { return tintOf(uSkyColor, 0.45); }
// How lit a surface is by the sun, 0..1, measured against flat ground: flat ground is in full sun whatever the hour (a
// painter keeps an evening meadow warm and lit), slopes and sides turned away from the sun fall into half-tone and shade.
// Under cloud the light comes from the whole sky instead: tops lit, sides in half-tone, undersides in shade.
float sunLight(vec3 n, float wrap) {
  float rel = dot(n, uSunDir) / max(uSunDir.y, 0.3);
  float sun = clamp((rel + wrap) / (1.0 + wrap), 0.0, 1.0);
  return mix(sun, clamp(0.5 + 0.5 * n.y, 0.0, 1.0), overcastHere().x);
}
// TEMPORARY (#316): sunLight in the gaps between the clouds (their sky's share, not the cloud's), from copies as bandsOf.
float sunLightGap(vec3 n, float wrap) {
  n *= uCloudOne;
  float rel = dot(n, uSunDir) / max(uSunDir.y, 0.3);
  float sun = clamp((rel + wrap) / (1.0 + wrap), 0.0, 1.0);
  return mix(sun, clamp(0.5 + 0.5 * n.y, 0.0, 1.0), uOvercast.x);
}
// The direction brush strokes run on the ground: along the contours where it slopes, a set angle where it's flat.
float contourAngle(vec3 n, float fallback) {
  float m = length(n.xz);
  float a = atan(n.z, n.x) + 1.5707963;
  vec2 v = vec2(cos(2.0 * a), sin(2.0 * a)) * smoothstep(0.02, 0.12, m) + vec2(cos(2.0 * fallback), sin(2.0 * fallback)) * 0.25;
  return mod(atan(v.y, v.x) * 0.5, 3.14159265);
}

// TEMPORARY (#316): paintBands' colour for a surface ('lab', OKLab) in the light with 'cloud' of a cloud's shade over it.
// The same sums, worked out again from copies the compiler can't merge with paintBands' own (each input multiplied by
// uCloudOne, always 1): merged, they change how it rounds paintBands' own sums, and a frame without a cloud by a bit.
vec3 bandsOf(vec3 lab, float light, float soft, float upness, float cloud) {
  light *= uCloudOne; soft *= uCloudOne; upness *= uCloudOne; cloud *= uCloudOne;
  float shadeHue = uShadeHue + uCloudBands.x * cloud, shadeDepth = mix(uShadeDepth, uCloudBands.y, cloud);
  float litLean = mix(uLitLean, uCloudBands.z, cloud), litHue = uLitHue + uCloudTint.x * cloud;
  vec3 shadeMix = vec3(0.0, cos(shadeHue), sin(shadeHue)) * (uShadeLean + uCloudTint.y * cloud) * 0.09;
  vec3 shade = lchShift(lab, -shadeDepth * lab.x, 1.1, 0.0) + shadeMix;
  vec3 half_ = lchShift(lab, -shadeDepth * 0.45 * lab.x, 1.06, 0.0) + shadeMix * 0.45;
  vec3 lit = lchShift(lab, 0.02, 1.05, 0.0) + vec3(0.0, cos(litHue), sin(litHue)) * litLean * 0.09;
  float t1 = smoothstep(0.30 - soft, 0.30 + soft, light), t2 = smoothstep(0.62 - soft, 0.62 + soft, light);
  vec3 col = oklabToLinFit(mix(mix(shade, half_, t1), lit, t2));
  vec3 sky = tintOf(uSkyColor * uCloudOne, 0.45) * (0.8 + 0.2 * upness);
  return mix(col * sky, col * tintOf(mix(uSunColor, uCloudSunColor, cloud), 0.4), t2 * 0.85 + t1 * 0.15);
}

vec3 paintBands(vec3 base, float light, float soft, float upness) {
  vec3 lab = linToOklab(base);
  float shadeHue = shadeHueHere(), shadeDepth = mix(uShadeDepth, uCloudBands.y, gCloud), litLean = mix(uLitLean, uCloudBands.z, gCloud);
  // Shade: darker, a touch richer, with some of the look's shade colour mixed in (teal at noon, violet at dusk), the way a
  // painter cools a shadow with blue rather than black. Mixing, not turning the hue: yellow wheat in shade goes olive, not red.
  vec3 shadeMix = vec3(0.0, cos(shadeHue), sin(shadeHue)) * shadeLeanHere() * 0.09;
  vec3 shade = lchShift(lab, -shadeDepth * lab.x, 1.1, 0.0) + shadeMix;
  // Half-tone: between, with less of it.
  vec3 half_ = lchShift(lab, -shadeDepth * 0.45 * lab.x, 1.06, 0.0) + shadeMix * 0.45;
  // Lit: the colour itself, warmed by the hour.
  float litHue = litHueHere();
  vec3 lit = lchShift(lab, 0.02, 1.05, 0.0) + vec3(0.0, cos(litHue), sin(litHue)) * litLean * 0.09;
  float t1 = smoothstep(0.30 - soft, 0.30 + soft, light);
  float t2 = smoothstep(0.62 - soft, 0.62 + soft, light);
  vec3 col = oklabToLinFit(mix(mix(shade, half_, t1), lit, t2));
  // The sky fills the shade from above; the sun tints the lit band.
  vec3 sky = skyTint() * (0.8 + 0.2 * upness);
  vec3 painted = mix(col * sky, col * sunTint(), t2 * 0.85 + t1 * 0.15);
  // TEMPORARY (#316): a cast shadow under a cloud softened in its colour, towards the colour with no shadow (gOpen); c
  // no lighter than the same shadow in the gaps' light (openShare, gapCeiling).
  if (gOpen > 0.0) {
    vec3 lab1 = linToOklab(base * uCloudOne);
    vec3 open = bandsOf(lab1, gLightOpen, soft, upness, gCloud);
    vec3 gap = uCloudShadow > 2.5 ? bandsOf(lab1, gLightGap, soft, upness, 0.0) : painted;
    painted = gapCeiling(mix(painted, open, openShare(painted, open, gap)), gap);
    if (uCloudShadow > 2.5) gGapShift = gap - painted * (exposeCloud() / exposeGap());
  }
  return painted;
}
`;

/** World-to-view normal and the G-buffer write every scene material ends with. */
export const GBUFFER_OUT = /* glsl */ `
// The waterline on things standing in the water (#18, the developer's pick "foam line"): a thin line of foam where the
// water meets them (not along blades and leaves, where it would speckle), and a faint wet band above it, darker where the
// water has wetted them, its top ragged.
// Only where the water is drawn, not where the sheet dives under the land, and not on things floating in it (gFloats, set
// by the material: a boat's inside is dry, and its own wet line rides with it).
float gFloats = 0.0;
vec3 waterline(vec3 color, vec3 p, float dy) {
  vec3 sheet = waterSheet(p.xz);
  // Where the water is drawn (as sheetHidden judges it).
  float shown = smoothstep(-${HIDDEN_DIVE}, -${HIDDEN_DIVE / 2}, sheet.z);
  float h = p.y - sheet.x;
  if (shown <= 0.0 || h < -0.05 || h > 0.3) return color;
  float top = 0.16 + 0.07 * snoise(p.xz * 2.7 + p.y * 1.3);
  float wet = (1.0 - smoothstep(top * 0.6, top, h)) * smoothstep(-0.05, 0.0, h) * shown;
  vec3 lab = linToOklab(color);
  vec3 wetColor = oklabToLin(vec3(lab.x * 0.66, lab.yz * 1.15));
  color = mix(color, wetColor, wet * 0.55);
#ifndef THIN
  float w = max(dy, 0.004);
  // (And no more than a few pixels from where the water meets it: on ground nearly as flat as the water, a flooded meadow's,
  // the height's band alone would lie over a wide patch, #19. dy, the caller's, is taken before any fragment leaves; the
  // water's level barely changes over a pixel, so it measures the height above it as well.)
  float off = abs(h - 0.01);
  float line = (1.0 - smoothstep(0.025, 0.025 + w, off)) * (1.0 - smoothstep(1.5, 3.0, off / max(dy, 1e-5))) * shown;
  // Fainter along the ground's shore than round things standing in the water.
#ifdef FIELDS
  line *= 0.45;
#endif
  color = mix(color, exposeHere(vec3(0.86, 0.86, 0.82) * mix(skyTint(), sunTint(), 0.5)), line * 0.8);
#endif
  return color;
}
layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gAux;   // view normal xy, view depth (less uDepthOrigin: auxDepth.ts), ink (1 inked, 0 painted)
uniform float uDepthOrigin;
void writeGBuffer(vec3 color, vec3 worldNormal, float viewDepth, float ink, float alpha) {
  // (Taken before any fragment leaves, where its neighbours' are still there to compare with.)
  float dy = fwidth(vWorldPos.y);
  // In the reflection, what's under the water isn't reflected: under the water nearest (waterNear; a flood stands higher
  // than the river).
  if (uMirror > 0.5 && vWorldPos.y < waterNear(vWorldPos.xz) - 0.01) discard;
#ifndef WATER_SHEET
  if (gFloats < 0.5 && vWorldPos.y < uWaterHigh + 0.3) color = waterline(color, vWorldPos, dy);
#endif
  vec3 vn = normalize((viewMatrix * vec4(worldNormal, 0.0)).xyz);
  // The reflection is stored premultiplied (over a clear, transparent black), so the water can filter it without darkening
  // the edges of what's reflected.
  gColor = vec4(uMirror > 0.5 ? color * alpha : color, alpha);
  gAux = vec4(vn.xy, viewDepth - uDepthOrigin, ink);
}
`;
