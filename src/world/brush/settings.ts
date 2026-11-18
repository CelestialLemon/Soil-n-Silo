import { QUALITY, type BrushRenderer } from '../../../brush3d/src/index.ts';
import type { Falling, PixelRatio, SettingsStore } from '../../ui/settings.ts';

// The player's settings that are brush3d's (#209), from the game's settings panel to the renderer, each taking effect from
// the next frame and saved with the game's other settings (ui/settings.ts):
//   quality   QUALITY's presets for the three machines (brush3d/src/renderer/quality.ts): high the default, the full picture
//   falling   how many raindrops and snowflakes are drawn (fallingShare): all, or about a third (the quality knob
//             brush3d's weather was built with, docs/PERFORMANCE.md); the weather reads the same, with less in the air
//   pixelRatio  on a high-DPI screen, the most pixels drawn a point (maxRatio): the screen's own, or 1.25 or 1, softer and
//             faster (#210: the MacBook Air draws ~1.37 a point at High, within 1080p's pixels). `?pixelratio=1` (any
//             number) overrides it, for comparing on a PR's preview. 1.25 is the default (the developer's pick on #210,
//             2026-11-18).
//   flashes   lightning (lightning.setting): full is safe by default, within the flash-safety limits (`npm run render:flash`);
//             gentle softens it to one slow swell, and off lights nothing up but the bolt and a dim glow (the developer's
//             decision on #209, 2026-11-14)

/** The share of the falling strokes drawn, by the rain and snow setting. */
export const FALLING_SHARE: Record<Falling, number> = { full: 1, light: 0.33 };

/** The most device pixels a CSS pixel, by the pixel ratio setting (Infinity: the screen's own). */
export const MAX_RATIO: Record<PixelRatio, number> = { full: Infinity, '1.25': 1.25, 1: 1 };

/** `?pixelratio=` as a cap, if it's a number above zero. */
function ratioFromUrl() {
  const v = Number(new URLSearchParams(location.search).get('pixelratio') ?? NaN);
  return v > 0 ? v : null;
}

/** Sends the settings to `r` now and whenever they change. */
export function followSettings(r: BrushRenderer, store: SettingsStore) {
  const url = ratioFromUrl();
  store.listen((s) => {
    r.setQuality(QUALITY[s.quality]);
    r.setMaxRatio(url ?? MAX_RATIO[s.pixelRatio]);
    r.settings.fallingShare = FALLING_SHARE[s.falling];
    r.lightning.setting = s.flashes;
  });
}
