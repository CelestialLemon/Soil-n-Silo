// The player's settings, remembered in this browser: sound on or off, its volume, the graphics quality and the storm's
// flashes. One version only (SETTINGS_VERSION): anything else under the key (an older shape, a hand edit, a broken write)
// is set aside for the defaults, never migrated. Where storage is blocked (a private window), the defaults stand and
// changes simply aren't remembered: nothing here throws.
import { DEFAULT_VOLUME } from '../audio/index.ts';
import { err, ok, type Result } from '../game/index.ts';
import type { UiQuality, UiSettings } from '../ui/index.ts';
import { QUALITY_NAMES } from '../world/index.ts';

/** Where the browser keeps the settings. */
export const SETTINGS_KEY = 'soil-n-silo:settings:v1';
export const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: Readonly<UiSettings> = { sound: true, volume: DEFAULT_VOLUME, quality: 'high', flashes: true };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isQuality = (v: unknown): v is UiQuality => typeof v === 'string' && (QUALITY_NAMES as readonly string[]).includes(v);

/** Reads settings from their stored text, or says why they can't be used. */
export function parseSettings(raw: string): Result<UiSettings, string> {
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return err('The settings are not JSON.'); }
  if (!isRecord(data)) return err('The settings are not an object.');
  if (data.version !== SETTINGS_VERSION) return err('The settings are from another version.');
  const { sound, volume, quality, flashes } = data;
  if (typeof sound !== 'boolean' || typeof flashes !== 'boolean') return err('The settings are damaged.');
  if (typeof volume !== 'number' || !Number.isFinite(volume) || volume < 0 || volume > 1) return err('The settings are damaged.');
  if (!isQuality(quality)) return err('The settings are damaged.');
  return ok({ sound, volume, quality, flashes });
}

/** The stored settings, or the defaults where there are none, they're broken, or storage is blocked. */
export function loadSettings(): UiSettings {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(SETTINGS_KEY);
    if (raw === null) return { ...DEFAULT_SETTINGS };
    const r = parseSettings(raw);
    return r.ok ? r.value : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

/** Remembers the settings; says why when the browser won't keep them. */
export function storeSettings(s: UiSettings): Result<void, string> {
  try {
    if (typeof localStorage === 'undefined') return err('This browser has no storage for settings.');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: SETTINGS_VERSION, ...s }));
    return ok(undefined);
  } catch { return err('This browser would not keep the settings.'); }
}

/** A patch from the overlay merged onto the settings, each value checked (a bad one keeps what was there). */
export function mergeSettings(s: UiSettings, patch: Partial<UiSettings>): UiSettings {
  const out = { ...s };
  if (typeof patch.sound === 'boolean') out.sound = patch.sound;
  if (typeof patch.flashes === 'boolean') out.flashes = patch.flashes;
  if (typeof patch.volume === 'number' && Number.isFinite(patch.volume)) out.volume = Math.min(1, Math.max(0, patch.volume));
  if (isQuality(patch.quality)) out.quality = patch.quality;
  return out;
}
