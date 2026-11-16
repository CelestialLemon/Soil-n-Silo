import { tryParseJson } from '../game/result.ts';
import { readOverrides, type Overrides } from '../keybindings.ts';

// The player's settings, kept in the browser beside the save: interface size, reduce motion, show pace, the experimental
// problems strip, the frame rate readout, the testing speeds, the keys, and brush3d's (graphics quality, how much rain and
// snow falls, lightning flashes, #209; how its tools mark things and colour the land, #206). Each deployment keeps its own
// (the key follows the save's).

export interface Settings {
  /** The interface's size, 0.9–1.3 (it scales the HUD and menus, not the world). */
  uiSize: number;
  /** brush3d's graphics quality (its QUALITY presets, src/world/brush/settings.ts). */
  quality: Quality;
  /** How much rain and snow brush3d draws falling: all of it, or about a third. */
  falling: Falling;
  /** brush3d's lightning flashes: full (within the flash-safety limits), gentle (one soft swell), or off (no flash). */
  flashes: Flashes;
  /** How brush3d marks what's under the pointer or selected (src/world/brush/tools.ts, HIGHLIGHT_LOOKS). */
  highlight: Highlight;
  /** How brush3d's overlays colour the land (tools.ts, OVERLAY_LOOKS). */
  overlayStyle: OverlayStyle;
  /** Cards and gauges appear without springing. */
  reduceMotion: boolean;
  /** "Done by" on the commission card, and gold and silver pace ticks on the goals. */
  showPace: boolean;
  /** Experimental: a strip on the right edge listing problems. */
  problemsStrip: boolean;
  /** The frame rate readout: none, the frame rate once a second, or that with a frame time graph and the lows. */
  frameStats: FrameStatsMode;
  /** Testing aid: 8× and 16× join the speed buttons. */
  fastSpeeds: boolean;
  /** The keys the player changed from the defaults (keybindings.ts). */
  keys: Overrides;
}

/** The frame rate setting's choices. */
export const FRAME_STATS_MODES = ['off', 'minimal', 'full', 'report'] as const;
export type FrameStatsMode = typeof FRAME_STATS_MODES[number];
export const UI_SIZES = { min: 0.9, max: 1.3, step: 0.05 };
/** The graphics quality setting's choices (brush3d's QUALITY presets), the fullest first: high the default, medium for integrated graphics (#210). */
export const QUALITIES = ['high', 'medium', 'low'] as const;
export type Quality = typeof QUALITIES[number];
/** The rain and snow setting's choices. */
export const FALLINGS = ['full', 'light'] as const;
export type Falling = typeof FALLINGS[number];
/** The lightning flashes setting's choices (brush3d's FlashSetting). */
export const FLASHES = ['full', 'gentle', 'off'] as const;
export type Flashes = typeof FLASHES[number];
/** The highlight setting's choices: a cream outline, a soft halo (the default, the developer's pick on #206), a gold line. */
export const HIGHLIGHTS = ['outline', 'halo', 'gold'] as const;
export type Highlight = typeof HIGHLIGHTS[number];
/** The overlay setting's choices: a wash in the land's light, bold flat colour (the default, #206), strong borders. */
export const OVERLAY_STYLES = ['wash', 'bold', 'borders'] as const;
export type OverlayStyle = typeof OVERLAY_STYLES[number];

const DEFAULTS: Settings = { uiSize: 1, quality: 'high', falling: 'full', flashes: 'full', highlight: 'halo', overlayStyle: 'bold', reduceMotion: false, showPace: false, problemsStrip: false, frameStats: 'off', fastSpeeds: false, keys: {} };

/** `v` if it's one of `choices`, else `d`. */
const oneOf = <T extends string>(choices: readonly T[], v: unknown, d: T): T => ((choices as readonly unknown[]).includes(v) ? v as T : d);

/** Settings from their saved JSON, each falling back to its default when missing or out of range. */
export function readSettings(json: string | null): Settings {
  const parsed = tryParseJson(json ?? '{}');
  const o = (parsed.ok ? parsed.value ?? {} : {}) as Partial<Settings>;
  return {
    uiSize: typeof o.uiSize === 'number' && o.uiSize >= UI_SIZES.min - 1e-9 && o.uiSize <= UI_SIZES.max + 1e-9 ? o.uiSize : DEFAULTS.uiSize,
    quality: oneOf(QUALITIES, o.quality, DEFAULTS.quality),
    falling: oneOf(FALLINGS, o.falling, DEFAULTS.falling),
    flashes: oneOf(FLASHES, o.flashes, DEFAULTS.flashes),
    highlight: oneOf(HIGHLIGHTS, o.highlight, DEFAULTS.highlight),
    overlayStyle: oneOf(OVERLAY_STYLES, o.overlayStyle, DEFAULTS.overlayStyle),
    reduceMotion: typeof o.reduceMotion === 'boolean' ? o.reduceMotion : DEFAULTS.reduceMotion,
    showPace: typeof o.showPace === 'boolean' ? o.showPace : DEFAULTS.showPace,
    problemsStrip: typeof o.problemsStrip === 'boolean' ? o.problemsStrip : DEFAULTS.problemsStrip,
    frameStats: oneOf(FRAME_STATS_MODES, o.frameStats, DEFAULTS.frameStats),
    fastSpeeds: typeof o.fastSpeeds === 'boolean' ? o.fastSpeeds : DEFAULTS.fastSpeeds,
    keys: readOverrides(o.keys),
  };
}

/** The settings, kept in local storage under `key`, telling listeners when one changes. */
export class SettingsStore {
  private value: Settings;
  private readonly listeners: ((s: Settings) => void)[] = [];
  private readonly key: string;
  constructor(key: string) {
    this.key = key;
    this.value = readSettings(localStorage.getItem(key));
  }

  get(): Settings { return this.value; }

  set(change: Partial<Settings>) {
    this.value = readSettings(JSON.stringify({ ...this.value, ...change }));
    localStorage.setItem(this.key, JSON.stringify(this.value));
    for (const l of this.listeners) l(this.value);
  }

  listen(l: (s: Settings) => void) { this.listeners.push(l); l(this.value); }
}

/**
 * The interface's scale: designed at 1920 × 1080, it shrinks with smaller windows (to 0.8 at about 1366 × 768, where text stays
 * readable) and grows a little on larger ones, times the interface size setting.
 */
export const uiScale = (s: Settings, w: number, h: number) => Math.max(0.8, Math.min(1.2, w / 1920, h / 1080)) * s.uiSize;
