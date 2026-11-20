// How far a wildflower (kit.ts's `addFlower`) reaches, as a plain number the game keeps its flowers off what they mustn't
// grow into by, and tells a flower from a tree in a pick by (Soil-n-Silo#266). brush3d/test/flower.test.ts holds
// `addFlower`'s blooms to it. Plain code with no three.js, so shared.ts can hand it to the game's rules and tests in Node.

/**
 * A bloom reaches at most `FLOWER_REACH * size` metres from its middle, across the ground and up (`size` the dab's, from
 * `FlowerOptions.size`): it's a square card `2 * size` across turned to face the camera, any way round, so its corner
 * is up to √2 × `size` out; and the wind's flutter moves it across the view by under 0.15 × `size` (FOLIAGE_VERT,
 * renderer/materials.ts), up to 1.3 times that in a gust and 1.23 times that again with its sideways and upward parts:
 * 1.65 × `size` in all. So it stands no higher than `lift + FLOWER_REACH * size` over the ground.
 */
export const FLOWER_REACH = 1.7;
