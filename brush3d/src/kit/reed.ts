// How far a clump of reeds (kit.ts's `addReeds`) reaches, as plain numbers the game keeps its reeds off what they mustn't
// grow into by (Soil-n-Silo#267). brush3d/test/reed.test.ts holds `addReeds`'s stalks to them. Plain code with no three.js,
// so shared.ts can hand it to the game's rules and tests in Node.

/**
 * A clump's stalks reach at most `across / √2 + REED_REACH * tall + width + REED_WIDTH` metres across the ground from
 * where it stands (`across` is `ReedOptions.across`, 0.45 when left out; `tall` the most its `ReedOptions.tall` gives and
 * `width` the most its `ReedOptions.width` does, the sums of their two, 0.95 and 0.03 when left out): a stalk stands
 * anywhere in a square `across` wide round the spot, is up to 1.1 × `tall` long and leans out up to 0.125 of that one way
 * and half as much the other, and is up to `width` wide either side of its line, a seed head `REED_WIDTH` more. That's at
 * rest: as with the grass (kit/tuft.ts), the wind's sway is left out, on purpose, because
 * the grass's shader bends a stalk across the view only, never nearer or further.
 */
export const REED_REACH = 0.154;
/** How much wider (m) a seed head is than its stalk at its root, either side of its line. */
export const REED_WIDTH = 0.012;
/** And they stand at most `REED_HEIGHT * tall` metres above the ground at their root. */
export const REED_HEIGHT = 1.1;
