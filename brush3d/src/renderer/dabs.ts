// The flags added to a foliage dab's aPaint.x (FOLIAGE_VERT, materials.ts), and to a stone's (PAINT_FRAG), as plain numbers
// with no three.js, so the kit's pieces that load in Node (kit.ts's addFlower, for brush3d/test/) can set them.

/** A painted stone's aPaint.x (how much brushwork shows, above 0: addStone, addCrag) is negated, to mark it as stone, so the
 * snow can lie on it its own way (RockSnowLook, snow.ts; Soil-n-Silo#286). Negated, not raised by a flag: a flag taken off
 * again would round the brushwork a hair off, and change the frame. */
export const stonePaint = (detail: number) => -detail;

/** Added to a foliage dab's aPaint.x (its colour drift, under 2 otherwise) to give it crisper edges: see FOLIAGE_VERT. */
export const CRISP_EDGE = 2;
/** Added to a foliage dab's aPaint.x to mark it as stiff (#13's winter twigs, and fallen leaves): it moves only with its
 * tree, if any, never fluttering or turning over on its own. Adds to CRISP_EDGE. */
export const STIFF_STROKE = 4;
