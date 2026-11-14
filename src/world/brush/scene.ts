import { BrushRenderer } from '../../../brush3d/src/index.ts';
import { generateLand } from '../../game/map.ts';
import { MAX_LEVEL } from '../../game/relief.ts';
import type { GameState } from '../../game/state.ts';
import type { SettingsStore } from '../../ui/settings.ts';
import { Camera } from '../camera.ts';
import { Lie, LEVEL_HEIGHT, standY } from '../ground.ts';
import type { Heights, Scene } from '../scene.ts';
import { COUNTRY } from '../terrain.ts';
import { BrushCover } from './cover.ts';
import { BrushLand } from './land.ts';
import { BrushLens } from './lens.ts';
import { RISE, TILE } from './scale.ts';
import { followSettings } from './settings.ts';
import { BrushSky } from './sky.ts';
import { thingHeight, Things } from './things.ts';
import { BrushTools } from './tools.ts';
import { BrushWater } from './water.ts';
import { BrushWind } from './wind.ts';
import { Wild } from './wild.ts';

// The game drawn by brush3d (epic #212), behind `?renderer=brush3d` until the swap (#211): the Scene (../scene.ts) the
// game's loop draws through, over brush3d's API (brush3d/src/index.ts, brush3d/docs/API.md). The loop is the same as the
// pixel world's (main.ts); everything brush3d-specific is in this folder, one piece a file, so the epic's tasks each work
// in their own:
//
//   scale.ts   4 m a tile, how high a level stands (#201), the units' conversions
//   lens.ts    the game's camera placing brush3d's view (#201)
//   land.ts    the land from the map: levels, cliffs, the water's beds, the country round it, earthworks (#202)
//   things.ts  the buildings and trucks as brush3d's solarpunk models (#203); #204 (a world that changes without a
//              stutter) and #205 (moving parts, building states, the markers) build on it
//   wild.ts    what grows, painted: the trees by species, the rocks, the open fields' crops and the saplings (#213)
//   sky.ts     the season, the hour and the sky from the game's weather (#207), the clouds where the rules have them (#208)
//   wind.ts    the living wind under the gusts the rules step, round the buildings and trees (#208)
//   cover.ts   what lies on the land from the game's: snow, frost, wet and mud (#207)
//   water.ts   the river and ponds, floods, ice and muddy water from the game's (#207; how the river sits in its bed is #202's)
//   grid.ts    the grid cover.ts and water.ts send their maps on
//   tools.ts   the game's tools on the picture: picking, the marks on things, the build preview and frames, the overlays,
//              the grid, routes and power lines, the tile cursor, and where the labels and markers go (#206)
//   settings.ts  brush3d's settings from the game's settings panel: graphics quality, rain and snow, lightning (#209)
//
// This file only wires the pieces into the Scene: a task adds its piece and its few lines here.

export function brushScene(state: GameState, canvas: HTMLCanvasElement, settings: SettingsStore, start: { x: number; z: number }, changed: () => void): Scene {
  const map = state.map;
  // The shadow follows the view over the map. The quality (the shadow's detail, the pixels drawn: on a high-DPI screen
  // at most 1080p's, scaled up, brush3d-renderer#28) is the player's setting.
  const r = new BrushRenderer(canvas, { shadowFollow: true });
  followSettings(r, settings);
  const land = generateLand(state.scenario, COUNTRY), lie = new Lie(state, land);
  const ground = new BrushLand(r, state, land, lie), sky = new BrushSky(r, state), cover = new BrushCover(r, land), water = new BrushWater(r, land, lie);
  const things = new Things(r, lie), wild = new Wild(r, lie, land, state), wind = new BrushWind(r, state, land);
  const lens = new BrushLens(r, canvas);
  const camera = new Camera(lens, canvas, map, start, changed);
  const tools = new BrushTools(r, state, things, lie);

  const heights: Heights = {
    at: (x, z) => lie.y(x, z) * RISE,
    top: (MAX_LEVEL + 1) * LEVEL_HEIGHT * RISE,
    level: (l) => l * LEVEL_HEIGHT * RISE,
    stand: (rel, n, x, y) => standY(lie, rel, n, x, y) * RISE,
    tile: (x, y, u, v) => lie.tileY(x, y, u, v) * RISE,
  };
  const gl = r.gl.getContext();
  return {
    camera, heights, picker: tools.picker, preview: tools.preview,
    heightOf: (type) => thingHeight(type) / TILE,
    sync(s, f) {
      sky.sync(s, f.hour, f.speed);
      wind.sync(s);
      ground.sync(s);
      cover.sync(s);
      water.sync(s);
      things.sync(s);
      wild.sync(s);
      tools.sync(s, f);
    },
    show: (s, f) => tools.show(s, f),
    truckAt: (id) => things.truckAt(id),
    stopLabels: () => tools.stopLabels(),
    netLabels: () => tools.netLabels(),
    markerSpots: (s) => tools.markerSpots(s),
    render(time, f) {
      tools.cursor(f.marks, f.refused);
      r.render(time);
      f.lap('geometry');
      f.pick();
    },
    report: {
      env: () => {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          glRenderer: String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)), glVendor: String(gl.getParameter(dbg ? dbg.UNMASKED_VENDOR_WEBGL : gl.VENDOR)),
          userAgent: navigator.userAgent, viewport: [window.innerWidth, window.innerHeight], devicePixelRatio: window.devicePixelRatio,
          // The pixels drawn; brush3d draws at the screen's resolution, no art pixels.
          art: [r.width, r.height], supersample: 1, shadowMapSize: r.quality.shadowMapSize, pixelSize: 1,
          timerQueries: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
        };
      },
      counts: () => ({ draws: r.gl.info.render.calls, triangles: r.gl.info.render.triangles }),
      resetCounts: (on) => { r.gl.info.autoReset = !on; if (on) r.gl.info.reset(); },
    },
    debug: { renderer: r, lens, wind },
  };
}
