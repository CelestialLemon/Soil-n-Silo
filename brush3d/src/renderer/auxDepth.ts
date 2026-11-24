// The G-buffer's depth (its aux target's z: how far along the view each pixel's surface is), as it's stored and read back.
//
// The G-buffer is half floats, which keep only about three significant digits: a number is rounded to 1/1024 of its power
// of two, so a depth of 128 m or more counts in 12.5 cm steps. The ink lines (post.ts) draw a silhouette wherever a
// neighbour is more than about 6 cm farther, so a gentle slope that far from the camera read as a staircase and every stair
// got inked: stripes across walls, roofs and decks (#252, carried in #303). The camera sits at least 120 m back, so the
// whole view was that far away. A ruler is finest at its zero, so the zero is moved to where the view looks: the depth is
// stored less the depth of the camera's target (DEPTH_ORIGIN_GLSL's uDepthOrigin), which keeps everything within 64 m of it
// in 6 cm steps or finer (sub-centimetre within 8 m), and the land in view at any zoom within 128 m of it. Readers add it
// back (auxDepth), so what they see is the depth as before, just rounded far less.
//
// Nothing drawn reads as 0, as it always has: the G-buffer's aux is cleared to -uDepthOrigin (clearAux), so a pixel of
// sky, and a pixel's samples averaged at an edge against it, read back exactly as they did when it was cleared to 0. That's
// why the origin is a whole number of metres: exact in a half float, so the sky reads back as exactly 0.
//
// It only shifts the numbers (no new target, read or pass): the cost is a subtraction where the depth is written and an
// addition where it's read. Passes other than the main view's (the water's bed and reflection) keep the origin at 0.
import type * as THREE from 'three';

/** Declares the origin and reads a G-buffer depth back: in metres along the view, 0 where nothing was drawn. */
export const DEPTH_ORIGIN_GLSL = /* glsl */ `
uniform float uDepthOrigin;
float auxDepth(float stored) { return stored + uDepthOrigin; }
`;

/** The largest whole number a half float holds exactly (past it, they step by 2). */
const HALF_EXACT = 2048;

/** The origin for a view whose target lies `targetDepth` along it (m): that, to a whole metre a half float holds exactly. */
export function depthOrigin(targetDepth: number): number {
  return Math.min(Math.max(Math.round(targetDepth), 0), HALF_EXACT);
}

/**
 * Clears the aux target (colour attachment 1) of the G-buffer bound in `gl` to read back as nothing drawn at `origin`.
 * The rest of the target is left as it is (clear it first).
 */
export function clearAux(gl: THREE.WebGLRenderer, origin: number) {
  gl.state.buffers.color.setMask(true);
  const c = gl.getContext() as WebGL2RenderingContext;
  c.clearBufferfv(c.COLOR, 1, [0, 0, -origin, 0]);
}
