// How far a grass tuft (kit.ts's `addTuft`) reaches, as plain numbers the game keeps its grass off what it mustn't grow
// into by (Soil-n-Silo#256). brush3d/test/tuft.test.ts holds `addTuft`'s blades to them. Plain code with no three.js,
// so shared.ts can hand it to the game's rules and tests in Node.

/**
 * A tuft's blades reach at most `spread + TUFT_REACH * tall` metres across the ground from where it stands (`spread`
 * is `TuftOptions.spread`, 0.04 when left out): a blade is up to 1.2 × `tall` long and leans out up to 0.7 of that, and
 * its tip is its furthest point (for any tuft taller than 0.1 m). That's at rest: the wind's sway is left out, on
 * purpose, because the grass's shader bends a blade across the view only (`acrossView`, renderer/materials.ts), never
 * nearer or further, so a blade in a gust can lean over a field's edge but never into a wall it stands in front of.
 */
export const TUFT_REACH = 0.84;
/** And they stand at most `TUFT_HEIGHT * tall` metres above the ground. */
export const TUFT_HEIGHT = 1.2;
