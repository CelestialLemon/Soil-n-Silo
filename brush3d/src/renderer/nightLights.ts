import * as THREE from 'three';
import { GLOW, type Parts } from './parts';
import type { SharedUniforms } from './materials';

// The farm's lights at night (Soil-n-Silo#205; the developer's pick, C of three: A lamps only, B windows too). A building's
// lamps and fires (its `running_*` lights) glow while it works, in their own colour, whatever the light: from dusk, fully
// by night (INK_FRAG, by the parts' texture). Its windows (sea-glass panes) glow a warm lamplight while it works. And each
// throws a pool of that light on the ground and walls round it, laid over the painted picture in the post pass
// (NIGHT_POOLS_GLSL) as the lightning's glow is, so nothing new is drawn in the scene.
//
// And its smoke (#205; the developer's pick, puffs, C of three: A none, B thin wisps): round puffs rising from its
// chimneys while it works (SMOKE_VERT, with SMOKE's numbers).

/** The most lights that throw pools at once, the nearest the view's middle. */
export const MAX_POOLS = 16;
/** How far a pool reaches (m): a lamp's, a building's windows'. */
const REACH = { [GLOW.lamp]: 5, [GLOW.window]: 6 } as const;
/**
 * The smoke's puffs: how high one rises (m), its size, its life (s), and the share of a chimney's puffs drawn (of PUFFS:
 * model.ts).
 */
export const SMOKE = { rise: 4.5, size: 2.4, life: 5, share: 0.6 } as const;

/** How much the lamps glow at an hour's look (its `night`, 0 by day, 0.7 at dusk, 1 at night): from dusk, fully at night. */
export const glowAt = (night: number) => THREE.MathUtils.smoothstep(night, 0.3, 0.85);

export class NightLights {
  /** For the post pass. */
  readonly post = {
    uPools: { value: Array.from({ length: MAX_POOLS }, () => new THREE.Vector4()) },
    uPoolN: { value: 0 },
    uPoolGlow: { value: 0 },
  };

  /** Each frame: how much the lights glow at the hour (`night`, the clear look's), and the pools they throw near `to`. */
  update(s: SharedUniforms, parts: Parts, night: number, to: THREE.Vector3Like) {
    const glow = glowAt(night);
    s.uNightGlow.value = glow;
    const pu = this.post;
    pu.uPoolGlow.value = glow;
    if (glow <= 0) { pu.uPoolN.value = 0; return; }
    const lights = parts.glowing(to, MAX_POOLS);
    lights.forEach((l, i) => pu.uPools.value[i].set(l.x, l.y, l.z, REACH[l.glow as keyof typeof REACH]));
    pu.uPoolN.value = lights.length;
  }
}

/**
 * Pools of lamplight (the post pass, before the haze, on the scene's light): each light's warm light on what's round it,
 * the ground under it most, falling off to nothing at its reach. It lifts what's there (the dark less), so it reads as
 * light on the painted surfaces rather than a wash over them.
 */
export const NIGHT_POOLS_GLSL = /* glsl */ `
uniform vec4 uPools[${MAX_POOLS}];
uniform int uPoolN;
uniform float uPoolGlow;
vec3 nightPools(vec3 c, vec3 p) {
  float pool = 0.0;
  for (int i = 0; i < ${MAX_POOLS}; i++) {
    if (i >= uPoolN) break;
    vec4 l = uPools[i];
    vec3 d = p - l.xyz;
    // Spread wide on the ground below it, less up the walls above it.
    d.y *= d.y > 0.0 ? 1.5 : 0.4;
    float r = clamp(length(d) / l.w, 0.0, 1.0);
    pool += (1.0 - r) * (1.0 - r);
  }
  pool = min(pool, 1.4) * uPoolGlow;
  const vec3 LAMP = vec3(1.0, 0.62, 0.28);
  return c + (c * 3.5 + 0.02) * LAMP * pool;
}
`;
