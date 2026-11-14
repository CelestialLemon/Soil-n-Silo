// Graphics quality (#209): what drawing a frame asks of the GPU. A lower quality keeps the look (the same paint, light,
// weather and ink) but draws it with less detail: coarser sun shadows, less smoothing on the edges, fewer pixels scaled up
// to the screen. The game picks one in its settings panel and changes it while it plays (BrushRenderer.setQuality).

/** How much detail the renderer draws with. */
export interface Quality {
  /** Multisampling of the painted frame (4, 2, or 0 for none): how smooth the edges and ink lines are. */
  samples: number;
  /** The sun's shadow map, texels across: how crisp the shadows' edges are over the view. */
  shadowMapSize: number;
  /** The shelter map (shelter.ts), texels across: how closely rain and snow stop at a roof's or a crown's edge. */
  shelterSize: number;
  /** The most pixels drawn (BrushRenderer.maxPixels): a frame bigger than this is drawn at this many and scaled up. */
  maxPixels: number;
}

/**
 * The presets, for the three machines the game is played on (docs/PERFORMANCE.md, "Targets" and "Quality settings"):
 * - `high`, the full picture: the RX 570 PC and the MacBook Air (whose high-DPI screen is drawn at 1080p's count of pixels,
 *   the developer's pick in brush3d-renderer#28). The default.
 * - `medium`, for integrated graphics (the Arc 140T laptop, the floor): the shadow and shelter maps at half the texels.
 *   The shadows' edges are softer and a little stepped; nothing else changes. About 3.3 ms less on the RX 570's farm at
 *   1080p, so about 6 on the laptop.
 * - `low`, a step under that, for when medium still misses 45 fps: also 2× multisampling for 4× (edges a touch rougher)
 *   and at most 1600 × 900's pixels, scaled up (a slightly softer frame). About 1.6 ms less again.
 */
export const QUALITY = {
  high: { samples: 4, shadowMapSize: 4096, shelterSize: 1024, maxPixels: 1920 * 1080 },
  medium: { samples: 4, shadowMapSize: 2048, shelterSize: 512, maxPixels: 1920 * 1080 },
  low: { samples: 2, shadowMapSize: 2048, shelterSize: 512, maxPixels: 1600 * 900 },
} as const satisfies Record<string, Quality>;

export type QualityName = keyof typeof QUALITY;
