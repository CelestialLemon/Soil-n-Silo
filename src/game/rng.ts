// Seeded randomness: the valley comes from its seed, so the same seed always grows the same valley (the weather, which rolls
// fresh each run, keeps its own stream). Plain 32-bit integer maths, identical in every engine.

/** A small fast PRNG (mulberry32): `next()` is uniform in [0, 1). */
export interface Rng {
  next(): number;
  /** Uniform in [a, b). */
  range(a: number, b: number): number;
  /** An integer in [0, n). */
  int(n: number): number;
  /** A random element of a non-empty list. */
  pick<T>(list: readonly T[]): T;
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (a, b) => a + (b - a) * next(),
    int: (n) => Math.floor(next() * n),
    pick: <T>(list: readonly T[]): T => {
      if (list.length === 0) throw new Error('pick from an empty list');
      return list[Math.floor(next() * list.length)];
    },
  };
}

/** A well-mixed 32-bit hash of a seed and two integers, for lattice noise. */
export function hash3(seed: number, x: number, z: number): number {
  let h = (seed | 0) ^ Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(z | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Derives a sub-seed for one purpose (terrain, brook, trees...) from the valley's seed. */
export const subSeed = (seed: number, salt: number) => hash3(seed, salt, 0x5eed);
