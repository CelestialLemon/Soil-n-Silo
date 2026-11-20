// A foliage dab's flags, added to its aPaint.x above its colour drift (under 2) and read by FOLIAGE_VERT (materials.ts). Here
// rather than in materials.ts so the parts of the kit that load in Node (farWoods.ts) reach no shader.

/** Added to a foliage dab's aPaint.x (its colour drift, under 2 otherwise) to give it crisper edges: see FOLIAGE_VERT. */
export const CRISP_EDGE = 2;
/** Added to a foliage dab's aPaint.x to mark it as stiff (#13's winter twigs, and fallen leaves): it moves only with its
 * tree, if any, never fluttering or turning over on its own. Adds to CRISP_EDGE. */
export const STIFF_STROKE = 4;
