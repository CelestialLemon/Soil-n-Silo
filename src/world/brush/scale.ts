import { TILE } from '../../../brush3d/src/index.ts';
import { LEVEL_HEIGHT } from '../ground.ts';

// The brush3d world's scale (epic #212): one tile is 4 m (brush3d's TILE: its models, brushes and speed budget were all made
// at that size). The rules keep counting in tiles and the loop in the game's world units (camera.ts: a tile is 1, heights
// as the pixel world draws them, LEVEL_HEIGHT a level); only this world layer converts to metres.

export { TILE };

/**
 * How high one of the rules' terrain levels stands, in metres: 1 m, as the pixel world's 0.25 m a level at 1 m a tile
 * scaled up, so the land keeps its shape (a level is a quarter of a tile either way). How high it should stand at 4 m is
 * the developer's look choice (#201); this is the working default until then.
 */
export const LEVEL = 1;

/** World units (camera.ts) to metres, along the ground and up a thing: a tile is TILE metres. */
export const metres = (v: number) => v * TILE;

/**
 * What the ground's heights as the pixel world fits them (ground.ts's Lie, LEVEL_HEIGHT a level) are multiplied by, in world
 * units, for a level to stand LEVEL metres high: 1 at 1 m a level. Things standing on the ground keep their own heights.
 */
export const RISE = LEVEL / TILE / LEVEL_HEIGHT;
