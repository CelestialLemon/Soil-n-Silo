import * as THREE from 'three';
import { GLOW, type Parts } from './parts';
import type { SharedUniforms } from './materials';

// The farm's lights at night (Soil-n-Silo#205). A building's lamps and fires (its `running_*` lights) glow while it works,
// in their own colour, whatever the light: from dusk, fully by night (INK_FRAG, by the parts' texture). The look's
// candidates, for the developer to pick (the others go once picked): its windows lit too (sea-glass panes glowing a warm
// lamplight while it works), and pools of that light on the ground and walls round each light, laid over the painted
// picture in the post pass (NIGHT_POOLS_GLSL) as the lightning's glow is, so nothing new is drawn in the scene.
//
// And its smoke (#205): puffs rising from its chimneys while it works (SMOKE_VERT), in the look picked.

/** The night's lights as the game picks them: windows lit with the lamps, and the pools of light they throw. */
export interface NightLightsLook { windows: boolean; pools: boolean }
/** The smoke's look: none, thin wisps, or round puffs (a candidate each). */
export type SmokeLook = 'none' | 'wisps' | 'puffs';

/** The most lights that throw pools at once, the nearest the view's middle. */
export const MAX_POOLS = 16;
/** How far a pool reaches (m): a lamp's, a building's windows'. */
const REACH = { [GLOW.lamp]: 5, [GLOW.window]: 6 } as const;
/**
 * The smoke's looks: how high a puff rises (m), its size, its life (s); its width over its height, and the share of the
 * puffs drawn (of PUFFS a chimney: model.ts).
 */
const SMOKE: Record<Exclude<SmokeLook, 'none'>, { rise: number; size: number; life: number; width: number; share: number }> = {
  wisps: { rise: 6, size: 1.3, life: 6, width: 0.55, share: 1 },
  puffs: { rise: 4.5, size: 2.4, life: 5, width: 1, share: 0.6 },
};

/** How much the lamps glow at an hour's look (its `night`, 0 by day, 0.7 at dusk, 1 at night): from dusk, fully at night. */
export const glowAt = (night: number) => THREE.MathUtils.smoothstep(night, 0.3, 0.85);

export class NightLights {
  look: NightLightsLook = { windows: false, pools: false };
  /** For the post pass. */
  readonly post = {
    uPools: { value: Array.from({ length: MAX_POOLS }, () => new THREE.Vector4()) },
    uPoolN: { value: 0 },
    uPoolGlow: { value: 0 },
  };

  /** The smoke's look, into the shaders' uniforms. */
  static smoke(s: SharedUniforms, look: SmokeLook) {
    if (look === 'none') { s.uSmoke.value.set(0, 0, 1, 0); return; }
    const k = SMOKE[look];
    s.uSmoke.value.set(k.rise, k.size, k.life, 1);
    s.uSmokeShape.value.set(k.width, k.share);
  }

  /** Each frame: how much the lights glow at the hour (`night`, the clear look's), and the pools they throw near `to`. */
  update(s: SharedUniforms, parts: Parts, night: number, to: THREE.Vector3Like) {
    const glow = glowAt(night);
    s.uNightGlow.value = glow;
    s.uWindowsLit.value = this.look.windows ? 1 : 0;
    const pu = this.post;
    pu.uPoolGlow.value = glow;
    if (!this.look.pools || glow <= 0) { pu.uPoolN.value = 0; return; }
    const lights = parts.glowing(to, MAX_POOLS, this.look.windows);
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
