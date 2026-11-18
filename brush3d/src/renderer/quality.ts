// Graphics quality (#209): what drawing a frame asks of the GPU. A lower quality keeps the look (the same paint, light,
// weather and ink) but draws it with less detail: coarser sun shadows, a softer reflection, less smoothing on the edges,
// fewer pixels scaled up to the screen. The game picks one in its settings panel and changes it while it plays (BrushRenderer.setQuality).

/** How much detail the renderer draws with. */
export interface Quality {
  /** Multisampling of the painted frame (4, 2, or 0 for none): how smooth the edges and ink lines are. */
  samples: number;
  /** The sun's shadow map, texels across: how crisp the shadows' edges are over the view, at most (shadowCap). */
  shadowMapSize: number;
  /**
   * The most detail the sun's shadow is drawn with, as a share of noon's (#251): with the shadow following the view, a low
   * sun squeezes the map's texels into a narrow strip of ground, five times noon's to the metre before dawn, detail the
   * screen can't show that costs as much again to draw. The map is drawn into only as much of itself as this needs
   * (BrushRenderer.followView). 1 is midday's (on the game's busiest map, c8, at the game's zoom, whichever way it looks), less is coarser and
   * cheaper (at least 0.05); Infinity draws all of the map whatever the hour, as before #251.
   */
  shadowCap: number;
  /** The shelter map (shelter.ts), texels across: how closely rain and snow stop at a roof's or a crown's edge. */
  shelterSize: number;
  /** The most pixels drawn (BrushRenderer.maxPixels): a frame bigger than this is drawn at this many and scaled up. */
  maxPixels: number;
  /**
   * The water's reflection, as a share of its usual size (BrushRenderer.reflectionScale): 1 half the frame's width and
   * height, 0.5 a quarter's (a little softer in the ripples).
   */
  reflectionScale: number;
}

/**
 * The presets, for the three machines the game is played on (docs/PERFORMANCE.md, "Targets" and "Quality settings"). Each
 * caps the sun's shadow's detail (shadowCap, #251), so a low sun costs no more than noon; the costs are c8's farm at 1080p
 * on the RX 570, the whole frame's GPU at noon / golden hour / before dawn, clear and still:
 * - `high`, the full picture: the RX 570 PC and the MacBook Air (whose high-DPI screen is drawn at 1080p's count of pixels,
 *   the developer's pick in brush3d-renderer#28). The default. The shadow at noon's detail at most: noon as before,
 *   a low sun's near the same. 19.4 / 16.8 / 16.6 ms (before #251: 19.4 / 21.4 / 22.1).
 * - `medium`, for integrated graphics (the Arc 140T laptop, the floor): the shadow and shelter maps at half the texels
 *   (softer, a little stepped shadow edges), the shadow at 75% of noon's detail at most (a low sun's coarser than
 *   before), and the water's reflection at half size (a little softer in the ripples). 14.4 / 14.2 / 14.0 ms (16.1 / 16.9 / 17.1).
 * - `low`, a step under that, for when medium still misses 45 fps: the shadow at half noon's detail at most (stepped
 *   edges at a low sun), 2× multisampling for 4× (edges a touch rougher) and at most 1600 × 900's pixels, scaled up (a
 *   slightly softer frame). 11.4 / 10.8 / 10.7 ms (12.7 / 13.5 / 13.7).
 */
export const QUALITY = {
  high: { samples: 4, shadowMapSize: 4096, shadowCap: 1, shelterSize: 1024, maxPixels: 1920 * 1080, reflectionScale: 1 },
  medium: { samples: 4, shadowMapSize: 2048, shadowCap: 0.75, shelterSize: 512, maxPixels: 1920 * 1080, reflectionScale: 0.5 },
  low: { samples: 2, shadowMapSize: 2048, shadowCap: 0.5, shelterSize: 512, maxPixels: 1600 * 900, reflectionScale: 0.5 },
} as const satisfies Record<string, Quality>;

export type QualityName = keyof typeof QUALITY;
