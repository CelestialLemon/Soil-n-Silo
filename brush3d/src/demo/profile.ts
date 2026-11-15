// The demo's profile cases (tools/profile.ts headless, and the demo's ?profile on any machine): the harness that runs them
// is the renderer's (src/renderer/profile.ts, shared with the game's ?profile).
import { PROFILE_KINDS, type ProfileCase, WEATHER_PRESETS, WIND_SCALE } from '../index';

const STORM = WIND_SCALE.storm;

/** The usual set: a calm and a stormy frame at 720p, 1080p, 1440p and 4K, then the stormy 1080p frame without each kind. */
export function defaultCases(): ProfileCase[] {
  const sizes: [string, number, number][] = [['720p', 1280, 720], ['1080p', 1920, 1080], ['1440p', 2560, 1440], ['4K', 3840, 2160]];
  const cases: ProfileCase[] = [];
  for (const [name, width, height] of sizes) {
    cases.push({ label: `${name} calm`, width, height, wind: 0 });
    cases.push({ label: `${name} storm`, width, height, wind: STORM });
  }
  for (const k of PROFILE_KINDS) cases.push({ label: `1080p storm, no ${k}`, width: 1920, height: 1080, wind: STORM, hide: [k] });
  cases.push({ label: '1080p storm, shelter every frame', width: 1920, height: 1080, wind: STORM, shelter: true });
  cases.push({ label: '1080p storm, a strike at its brightest', width: 1920, height: 1080, wind: STORM, lightning: true });
  cases.push({ label: '1080p storm, fog', width: 1920, height: 1080, wind: STORM, weather: WEATHER_PRESETS.fog });
  cases.push({ label: '1080p storm, dust', width: 1920, height: 1080, wind: STORM, weather: WEATHER_PRESETS.dust });
  cases.push({ label: '1080p storm, heat wave', width: 1920, height: 1080, wind: STORM, weather: WEATHER_PRESETS['heat-wave'] });
  cases.push({ label: '1080p storm, snow lying', width: 1920, height: 1080, wind: STORM, lying: 0.6 });
  cases.push({ label: '1080p storm, wet ground', width: 1920, height: 1080, wind: STORM, wet: { wet: 1, mud: 1 } });
  // The falling snow at its dearest (#14): a blizzard (heavy snow in a storm wind: its flakes, streaks and whiteout) over
  // lying snow, and a heavy snowfall in still air (the most flakes that fall straight, without the whiteout's sheets).
  cases.push({ label: '1080p blizzard', width: 1920, height: 1080, wind: STORM, weather: WEATHER_PRESETS.blizzard, lying: 0.6 });
  // Frost (#14) over all the land, part melted (so each spot weighs the sun it's had), at the demo's hour.
  cases.push({ label: '1080p storm, frost', width: 1920, height: 1080, wind: STORM, frost: 0.6 });
  // The stream frozen (#14), its banks white and its middle dark (the dearest look), the ice thawing (its leads and floes).
  cases.push({ label: '1080p storm, stream thawing', width: 1920, height: 1080, wind: STORM, ice: 0.5 });
  cases.push({ label: '1080p heavy snow, calm', width: 1920, height: 1080, wind: 0, weather: { cloud: 1, snow: 1 }, lying: 0.6 });
  return cases;
}
