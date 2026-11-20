// Exact `wheelRace` geometry from brush3d/src/models/catalog.ts, for the meadow's tests (without Vite's `import.meta.glob`,
// which the catalog needs): how deep (0..1) a point (lx, lz) m in a water wheel's own frame is in its race, `margin` m round it.

export function wheelRace(lx: number, lz: number, margin = 0.5) {
  const ease = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  return (1 - ease(1, 1 + margin, Math.abs(lx))) * ease(1.7 - margin, 1.7, lz) * (1 - ease(8, 8 + margin, lz));
}
