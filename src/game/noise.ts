// Smooth seeded 2D noise for the valley's rolling ground: value noise on an integer lattice with quintic easing, summed in
// octaves (fBm). Deterministic and pure.
import { hash3 } from './rng.ts';

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lattice = (seed: number, x: number, z: number) => hash3(seed, x, z) / 4294967296 * 2 - 1;

/** Value noise in [-1, 1] at (x, z), one lattice cell per unit. */
export function noise2(seed: number, x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = fade(x - ix), fz = fade(z - iz);
  const a = lattice(seed, ix, iz), b = lattice(seed, ix + 1, iz);
  const c = lattice(seed, ix, iz + 1), d = lattice(seed, ix + 1, iz + 1);
  const top = a + (b - a) * fx, bottom = c + (d - c) * fx;
  return top + (bottom - top) * fz;
}

/** Fractal noise: `octaves` layers of noise2, each `lacunarity` times finer and `gain` times weaker. Roughly in [-1, 1]. */
export function fbm(seed: number, x: number, z: number, octaves = 4, lacunarity = 2, gain = 0.5): number {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise2(seed + o * 1013, x * freq, z * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}
