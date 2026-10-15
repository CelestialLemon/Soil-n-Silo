// The player's settings, kept in the browser beside the save: interface size, pixel size, reduce motion, show pace and the
// experimental problems strip. Each deployment keeps its own (the key follows the save's).

export interface Settings {
  /** The interface's size, 0.9–1.3 (it scales the HUD and menus, not the world). */
  uiSize: number;
  /** Screen pixels per art pixel. */
  pixelSize: number;
  /** Cards and gauges appear without springing. */
  reduceMotion: boolean;
  /** "Done by" on the commission card, and gold and silver pace ticks on the goals. */
  showPace: boolean;
  /** Experimental: a strip on the right edge listing problems. */
  problemsStrip: boolean;
}

/** The pixel size setting's choices: screen pixels per art pixel. */
export const PIXEL_SIZES = [1, 2, 3, 4] as const;
export const UI_SIZES = { min: 0.9, max: 1.3, step: 0.05 };

const DEFAULTS: Settings = { uiSize: 1, pixelSize: 2, reduceMotion: false, showPace: false, problemsStrip: false };

/** Settings from their saved JSON, each falling back to its default when missing or out of range. */
export function readSettings(json: string | null): Settings {
  let o: Partial<Settings>;
  try { o = JSON.parse(json ?? '{}') ?? {}; } catch { o = {}; }
  return {
    uiSize: typeof o.uiSize === 'number' && o.uiSize >= UI_SIZES.min - 1e-9 && o.uiSize <= UI_SIZES.max + 1e-9 ? o.uiSize : DEFAULTS.uiSize,
    pixelSize: (PIXEL_SIZES as readonly number[]).includes(o.pixelSize as number) ? o.pixelSize as number : DEFAULTS.pixelSize,
    reduceMotion: typeof o.reduceMotion === 'boolean' ? o.reduceMotion : DEFAULTS.reduceMotion,
    showPace: typeof o.showPace === 'boolean' ? o.showPace : DEFAULTS.showPace,
    problemsStrip: typeof o.problemsStrip === 'boolean' ? o.problemsStrip : DEFAULTS.problemsStrip,
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
