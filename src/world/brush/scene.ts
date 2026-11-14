import { BrushRenderer } from '../../../brush3d/src/index.ts';
import { generateLand } from '../../game/map.ts';
import { MAX_LEVEL } from '../../game/relief.ts';
import { buildingAt, type GameState } from '../../game/state.ts';
import type { SettingsStore } from '../../ui/settings.ts';
import { Camera } from '../camera.ts';
import { Lie, LEVEL_HEIGHT, standY } from '../ground.ts';
import type { Heights, Picker, Preview, Scene } from '../scene.ts';
import { COUNTRY } from '../terrain.ts';
import { TileCursor } from '../tileCursor.ts';
import { PlainLand } from './land.ts';
import { BrushLens } from './lens.ts';
import { RISE, TILE } from './scale.ts';
import { BrushSky } from './sky.ts';
import { thingHeight, Things } from './things.ts';
import { Wild } from './wild.ts';

// The game drawn by brush3d (epic #212), behind `?renderer=brush3d` until the swap (#211): the Scene (../scene.ts) the
// game's loop draws through, over brush3d's API (brush3d/src/index.ts, brush3d/docs/API.md). The loop is the same as the
// pixel world's (main.ts); everything brush3d-specific is in this folder, one piece a file, so the epic's tasks each work
// in their own:
//
//   scale.ts   4 m a tile, how high a level stands (#201), the units' conversions
//   lens.ts    the game's camera placing brush3d's view (#201)
//   land.ts    the land, plainly: #202 replaces it with the renderer's own land from the map (setLand)
//   things.ts  the buildings and trucks as brush3d's solarpunk models (#203); #204 (a world that changes without a
//              stutter) and #205 (moving parts, building states, the markers) build on it
//   wild.ts    grey stand-ins for the trees and rocks: #213 (the crops and trees in paint) replaces them
//   sky.ts     the season, the hour and the weather, plainly: #207 (the game's weather, ground and water), #208 (the wind
//              and clouds the rules share)
//   (tools)    picking, highlights, the build preview, overlays, routes and power lines are #206's: the picker, preview,
//              show() and the labels below are stubs it fills (a tools.ts here)
//   (settings) brush3d's settings and quality presets in the game's settings panel are #209's (a settings.ts here)
//
// This file only wires the pieces into the Scene: a task adds its piece and its few lines here.

export function brushScene(state: GameState, canvas: HTMLCanvasElement, _settings: SettingsStore, start: { x: number; z: number }, changed: () => void): Scene {
  const map = state.map;
  // The shadow follows the view over the map; on a high-DPI screen it draws 1080p's pixel count, scaled up (the demo's,
  // brush3d#6, brush3d#28).
  const r = new BrushRenderer(canvas, { shadowFollow: true, shadowMapSize: 4096 });
  r.maxPixels = 1920 * 1080;
  const land = generateLand(state.scenario, COUNTRY), lie = new Lie(state, land);
  const ground = new PlainLand(r, land, lie), sky = new BrushSky(r, state);
  const things = new Things(r, lie), wild = new Wild(r, lie, land, state);
  const lens = new BrushLens(r, canvas);
  const camera = new Camera(lens, canvas, map, start, changed);
  const cursor = new TileCursor(canvas, 0xfff0c0), refused = new TileCursor(canvas, 0xe8705a);

  const heights: Heights = {
    at: (x, z) => lie.y(x, z) * RISE,
    top: (MAX_LEVEL + 1) * LEVEL_HEIGHT * RISE,
    level: (l) => l * LEVEL_HEIGHT * RISE,
    stand: (rel, n, x, y) => standY(lie, rel, n, x, y) * RISE,
    tile: (x, y, u, v) => lie.tileY(x, y, u, v) * RISE,
  };
  // Until #206: what stands under the pointer is the building on the tile of ground under it (no picking of what's drawn,
  // so a truck or a tree can't be pointed at, nor a building's side that stands over another tile).
  const picker: Picker = {
    under: (s, _at, tile) => ({ tile, building: tile ? buildingAt(s, tile.x, tile.y)?.id ?? null : null }),
    now: () => {},
    request: () => true,
    forget: () => {},
    moved: () => false,
  };
  // Until #206: no build preview (the tile cursor and the placement card still show where it goes).
  const preview: Preview = { clear: () => {}, frame: () => {}, building: () => {}, crop: () => {} };

  const gl = r.gl.getContext();
  return {
    camera, heights, picker, preview,
    heightOf: (type) => thingHeight(type) / TILE,
    sync(s, f) {
      sky.sync(s, f.hour);
      ground.sync(s);
      things.sync(s);
      wild.sync(s);
    },
    // Until #206: no overlays, links, highlights, routes or power lines.
    show: () => {},
    truckAt: (id) => things.truckAt(id),
    stopLabels: () => [],
    netLabels: () => [],
    // Until #205: no markers over buildings with a problem.
    markerSpots: () => [],
    render(time, f) {
      r.render(time);
      f.lap('geometry');
      f.pick();
      // The tile cursor's marks, on its own canvas in 2 × 2 CSS pixel squares (#206 draws them on the land).
      const w = Math.ceil(innerWidth / 2), h = Math.ceil(innerHeight / 2);
      cursor.draw(f.marks, lens.cursor, w, h);
      refused.draw(f.refused, lens.cursor, w, h);
    },
    report: {
      env: () => {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          glRenderer: String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)), glVendor: String(gl.getParameter(dbg ? dbg.UNMASKED_VENDOR_WEBGL : gl.VENDOR)),
          userAgent: navigator.userAgent, viewport: [window.innerWidth, window.innerHeight], devicePixelRatio: window.devicePixelRatio,
          // The pixels drawn; brush3d draws at the screen's resolution, no art pixels.
          art: [r.width, r.height], supersample: 1, shadowMapSize: 4096, pixelSize: 1,
          timerQueries: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
        };
      },
      counts: () => ({ draws: r.gl.info.render.calls, triangles: r.gl.info.render.triangles }),
      resetCounts: (on) => { r.gl.info.autoReset = !on; if (on) r.gl.info.reset(); },
    },
    debug: { renderer: r, lens },
  };
}
