import {
  profileTable, QUALITY, runProfile, WEATHER_PRESETS, WIND_SCALE, type BrushRenderer, type ProfileCase, type ProfileRow,
} from '../../../brush3d/src/index.ts';
import type { GameState } from '../../game/state.ts';

// What a frame of the game costs on brush3d, pass by pass, on the map that's loaded (#210): `?renderer=brush3d&profile`
// on any machine (a PR's preview: the laptop and the MacBook Air), and tools/framerate.ts headless over every commission.
// The cases are brush3d's profile's (src/renderer/profile.ts: each pass's GPU and CPU ms, and the frame drawn uncapped),
// drawn where the camera is when Run is pressed: the four views, the widest and closest zooms, the hours, the heaviest
// weathers, the three graphics presets, and the widest view without each kind of mesh (what that kind costs). The game's
// own loop stands still while they run (no sync, no frame), and sends everything again after.
//
// And how long the level took to load: each piece of the brush3d world made (scene.ts times them), the first frame (its
// shaders compiled), and the models in.

/** A case on the game's map: brush3d's, and where the view is and the hour. */
export interface GameCase extends ProfileCase {
  /** Quarter turns from the view the profile starts from. */
  turn: number;
  /** Screen pixels a metre at 1080p (the game's zoom range is 4 to 24). */
  zoom: number;
  /** The clock hour; noon by default. */
  hour?: number;
}

/** The game's zoom range and start, in screen pixels a metre (camera.ts's 16, 96 and 32 a tile, at 4 m a tile). */
export const ZOOMS = { widest: 4, start: 8, closest: 24 };
const STORM = WIND_SCALE.storm, BREEZE = WIND_SCALE.breeze, W = 1920, H = 1080;

/** The cases, for a level whose sun rises and sets at those hours. */
export function gameCases(sunset: number): GameCase[] {
  const at = (label: string, c: Partial<GameCase>): GameCase => ({ label, width: W, height: H, wind: STORM, turn: 0, zoom: ZOOMS.start, weather: WEATHER_PRESETS.storm, ...c });
  const cases: GameCase[] = [];
  for (let turn = 0; turn < 4; turn++) cases.push(at(`view ${turn + 1}, storm`, { turn }));
  cases.push(at('widest, storm', { zoom: ZOOMS.widest }), at('closest, storm', { zoom: ZOOMS.closest }));
  const clear = { weather: WEATHER_PRESETS.clear, wind: BREEZE };
  cases.push(at('clear, noon', clear), at('clear, golden hour', { ...clear, hour: sunset - 0.5 }), at('clear, night', { ...clear, hour: 1 }));
  cases.push(at('widest, clear', { ...clear, zoom: ZOOMS.widest }));
  cases.push(
    at('storm, a strike at its brightest', { lightning: true }),
    at('blizzard, snow lying', { weather: WEATHER_PRESETS.blizzard, lying: 0.6 }),
    at('widest, blizzard, snow lying', { weather: WEATHER_PRESETS.blizzard, lying: 0.6, zoom: ZOOMS.widest }),
    at('fog', { weather: WEATHER_PRESETS.fog, wind: BREEZE }),
    at('dust', { weather: WEATHER_PRESETS.dust }),
    at('heat wave', { weather: WEATHER_PRESETS['heat-wave'], wind: BREEZE }),
    at('storm, wet ground', { wet: { wet: 1, mud: 1 } }),
    at('storm, frost', { frost: 0.6, hour: 9 }),
  );
  // Every preset as its own rows, whatever the player has picked (the other cases are drawn at the player's).
  for (const q of ['high', 'medium', 'low'] as const) {
    cases.push(at(`storm, ${q}`, { quality: QUALITY[q] }), at(`widest, storm, ${q}`, { zoom: ZOOMS.widest, quality: QUALITY[q] }));
  }
  for (const k of ['ground', 'paint', 'grass', 'foliage', 'crop', 'ink', 'water'] as const) cases.push(at(`widest, storm, no ${k}`, { zoom: ZOOMS.widest, hide: [k] }));
  return cases;
}

/** How long the level took to load (ms): each piece made, the first frame, and the models in; from the page's start too. */
export interface LoadTimes { pieces: Record<string, number>; firstFrame: number; models: number; sinceStart: number }

/** The game's side of a profile: its loop held while it runs, and everything sent again after (scene.ts). */
export interface ProfileHost {
  r: BrushRenderer;
  state: () => GameState;
  hold: (on: boolean) => void;
  load: () => LoadTimes | null;
}

/** Runs the cases on the map as it's drawn now, from where the camera is; `progress` hears each row as it's done. */
export async function profileGame(host: ProfileHost, cases?: GameCase[], progress?: (row: ProfileRow, i: number) => void) {
  const { r } = host, s = host.state(), view = r.view;
  const from = { x: view.target.x, y: view.target.y, z: view.target.z, heading: view.heading, zoom: view.zoom };
  let hour = 12;
  host.hold(true);
  try {
    return await runProfile<GameCase>(r, (t) => { r.setHour(hour); r.render(t); }, (c) => {
      // (The game's camera places the view again on its next frame.)
      if (!c) { view.place({ ...from, zoom: 1 }); view.zoom = from.zoom; return; }
      hour = c.hour ?? 12;
      view.place({ ...from, heading: from.heading + (c.turn * Math.PI) / 2, zoom: 1 });
      // In the pixels drawn, as tall a piece of the world at any size (the zoom scales with the height, as runProfile's).
      view.zoom = (c.zoom * c.height) / 1080;
      // Nothing lying but what the case lays.
      r.setGround(null, 0);
    }, cases ?? gameCases(s.scenario.climate.sun.set), progress);
  } finally {
    host.hold(false);
  }
}

/** What a run was of: the machine, the map, the camera, the quality, the load. Pasted results can't be mixed up. */
export function profileHead(host: ProfileHost) {
  const { r } = host, s = host.state(), gl = r.gl.getContext(), v = r.view, q = r.quality;
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = String(gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  const timers = gl.getExtension('EXT_disjoint_timer_query_webgl2') !== null;
  const load = host.load(), ms = (n: number) => `${Math.round(n)}`;
  const quality = Object.entries(QUALITY).find(([, p]) => p.samples === q.samples && p.shadowMapSize === q.shadowMapSize && p.maxPixels === q.maxPixels)?.[0] ?? JSON.stringify(q);
  return [
    `${s.scenario.id} (${s.scenario.climate.season}) · ${s.buildings.length} buildings · ${s.trucks.length} trucks · GPU ${gpu} · ${timers ? 'GPU timers' : 'no GPU timers (read the uncapped column)'}`,
    `view at x ${v.target.x.toFixed(1)} z ${v.target.z.toFixed(1)} · heading ${v.heading.toFixed(2)} · quality ${quality} (the cases' own, but for the presets' rows) · screen ${innerWidth}×${innerHeight} at ${devicePixelRatio}`,
    load ? `load ms: ${Object.entries(load.pieces).map(([k, v]) => `${k} ${ms(v)}`).join(', ')}; first frame ${ms(load.firstFrame)}; models in ${ms(load.models)}; from the page's start ${ms(load.sinceStart)}` : 'load: not yet',
    `${location.href}`, navigator.userAgent,
  ].join('\n');
}

/** The ?profile panel: the run's head, a button to run the cases, their table, and a button to copy it all. */
export function profilePanel(host: ProfileHost) {
  const panel = document.createElement('div');
  Object.assign(panel.style, { position: 'fixed', left: '12px', top: '12px', right: '12px', zIndex: '1000', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' });
  const button = (text: string) => Object.assign(document.createElement('button'), { textContent: text, style: 'background: rgba(255,252,240,0.9); border: 0; border-radius: 6px; padding: 5px 9px; cursor: pointer; color: #2a2a30' });
  const out = Object.assign(document.createElement('pre'), {
    style: 'flex-basis: 100%; margin: 0; padding: 10px; background: rgba(20,24,36,0.85); color: #fffaf0; border-radius: 6px; font: 12px/1.4 ui-monospace, monospace; white-space: pre-wrap; max-height: 80vh; overflow: auto',
  });
  const intro = () => `${profileHead(host)}\n\nMove the camera to the busiest part of the farm (it runs where the camera is), plug the laptop in, close other apps, then Run. It takes two or three minutes.`;
  out.textContent = intro();
  const run = button('Run'), copy = button('Copy'), hide = button('Hide');
  copy.disabled = true;
  run.onclick = async () => {
    run.disabled = true; copy.disabled = true;
    const head = profileHead(host), cases = gameCases(host.state().scenario.climate.sun.set), rows: ProfileRow[] = [];
    out.textContent = `${head}\n\nRunning…`;
    await profileGame(host, cases, (row, i) => { rows.push(row); out.textContent = `${head}\n\n${profileTable(rows)}\n\n${i + 1} of ${cases.length}…`; });
    out.textContent = `${head}\n\n${profileTable(rows)}\n\nms per frame at 1080p; GPU per pass, CPU for the whole frame; uncapped: frames drawn back to back. 45 fps is 22 ms.`;
    run.disabled = false; copy.disabled = false;
  };
  copy.onclick = () => void navigator.clipboard.writeText(out.textContent ?? '');
  hide.onclick = () => { const shown = out.style.display !== 'none'; out.style.display = shown ? 'none' : ''; hide.textContent = shown ? 'Show' : 'Hide'; };
  // Until the models are in, the load isn't known.
  const wait = setInterval(() => { if (host.load()?.models && run.disabled === false && copy.disabled) out.textContent = intro(); }, 1000);
  setTimeout(() => clearInterval(wait), 30_000);
  panel.append(run, copy, hide, out);
  document.body.append(panel);
}
