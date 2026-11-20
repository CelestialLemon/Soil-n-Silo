// How far a crag (kit.ts's `addCrag`) reaches past the size it's given, and what it costs, as plain numbers the game plans
// its outcrops by (Soil-n-Silo#257): it keeps each crag on its rock tiles by them. brush3d/test/crag.test.ts holds
// `addCrag` to them. Plain code with no three.js, so shared.ts can hand it to the game's rules and tests in Node.

/**
 * How far `addCrag`'s stone swells past its half-extents `rx`, `ry`, `rz`: its noise by at most
 * `k = CRAG_BOUND.swell + CRAG_BOUND.perCrag * crag`, and its skirt flares out across the ground by at most
 * `CRAG_BOUND.skirt` more. So, seen from above, a crag lies inside the shadow of the ellipsoid with half-extents
 * `rx·k·skirt`, `ry·k`, `rz·k·skirt` centred over `(x, z)` and turned by its `yaw`, `pitch` and `roll` (Three.js's YXZ
 * order), on any ground; nor does it stand higher than that ellipsoid's top, centred `ry·(1 − 2·sink)` over the ground
 * under `(x, z)`. (On a slope only its buried skirt changes, sunk below the ground.)
 */
export const CRAG_BOUND = { swell: 1.16, perCrag: 0.14, skirt: 1.1 } as const;

/** The triangles one crag is made of, at each `detail`. */
export const CRAG_TRIANGLES = { 1: 80, 2: 180 } as const;
