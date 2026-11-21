// The flags added to a foliage dab's aPaint.x (FOLIAGE_VERT, materials.ts), as plain numbers with no three.js, so the
// kit's pieces that load in Node (kit.ts's addFlower, for brush3d/test/) can set them.

/** Added to a foliage dab's aPaint.x (its colour drift, under 2 otherwise) to give it crisper edges: see FOLIAGE_VERT. */
export const CRISP_EDGE = 2;
/** Added to a foliage dab's aPaint.x to mark it as stiff (#13's winter twigs, and fallen leaves): it moves only with its
 * tree, if any, never fluttering or turning over on its own. Adds to CRISP_EDGE. */
export const STIFF_STROKE = 4;
/**
 * Added to a foliage dab's aPaint.x to mark it as a bloom (a wildflower, kit.ts's addFlower), which settles into the dark at
 * night as far as the renderer's `bloomsAtNight` says (Soil-n-Silo#288). Adds to the others, and comes off first.
 */
export const BLOOM = 8;
