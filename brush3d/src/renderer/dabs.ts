// The flags added to a foliage dab's aPaint.x and its turn (aPaint.z) (FOLIAGE_VERT, materials.ts), as plain numbers with no
// three.js, so the kit's pieces that load in Node (kit.ts's addFlower, farWoods.ts, for brush3d/test/) can set them.

/** Added to a foliage dab's aPaint.x (its colour drift, under 2 otherwise) to give it crisper edges: see FOLIAGE_VERT. */
export const CRISP_EDGE = 2;
/** Added to a foliage dab's aPaint.x to mark it as stiff (#13's winter twigs, and fallen leaves): it moves only with its
 * tree, if any, never fluttering or turning over on its own. Adds to CRISP_EDGE. */
export const STIFF_STROKE = 4;
/** Added to a foliage stroke's turn (aPaint.z, from 0) to root it (Soil-n-Silo#268's far limbs): the stroke grows out from
 * its point along its turn, rather than being centred on it, so from any side two strokes from one point fork apart (a Y)
 * where centred ones would cross (an X). A whole number of turns, so the stroke turns the same; the shader takes it off.
 * Added k times, the stroke is the k-th of a line of strokes of its size from that point (a limb thinner than one stroke
 * its length would be: a stroke is a fifth as wide as it's long). */
export const ROOTED_TURN = 8 * Math.PI;
/** How far a rooted stroke's card moves along its length, against its size. Its mark (dabShape, materials.ts) reaches about
 * 0.8 of its card either side, give or take its broken edge's 0.12, so its foot then lies a little below its point. */
export const ROOTED_SHIFT = 0.6;
/** How much further each stroke after the first in a rooted line moves, against its size: its marks overlap by about 0.4 of
 * a card, more than their broken edges take, so the line never parts. */
export const ROOTED_STEP = 1.2;
