import { BrushRenderer } from '../../../brush3d/src/index.ts';
import { generateLand } from '../../game/map.ts';
import { MAX_LEVEL } from '../../game/relief.ts';
import type { GameState } from '../../game/state.ts';
import type { SettingsStore } from '../../ui/settings.ts';
import { flowerChoice, flowerMode } from '../../ui/flowerChoice.ts';
import { grassChoice, grassMode } from '../../ui/grassChoice.ts';
import { Camera } from '../camera.ts';
import { COUNTRY, Lie, LEVEL_HEIGHT, standY } from '../ground.ts';
import type { Heights, Scene } from '../scene.ts';
import { BrushCover } from './cover.ts';
import { Meadow } from './grass.ts';
import { BrushLand } from './land.ts';
import { BrushLens } from './lens.ts';
import { causeCases, gameCases, profileGame, profilePanel, type LoadTimes, type ProfileHost } from './profile.ts';
import { RISE, TILE } from './scale.ts';
import { followSettings } from './settings.ts';
import { BrushSky } from './sky.ts';
import { Goods } from './goods.ts';
import { thingHeight, Things } from './things.ts';
import { BrushTools } from './tools.ts';
import { BrushWater } from './water.ts';
import { BrushWind } from './wind.ts';
import { Wild } from './wild.ts';

// The game drawn by brush3d (epic #212; its only renderer since the swap, #211): the Scene (../scene.ts) the game's loop
// (main.ts) draws through, over brush3d's API (brush3d/src/index.ts, brush3d/docs/API.md). Everything brush3d-specific is
// in this folder, one piece a file, so work on each goes in its own:
//
//   scale.ts   4 m a tile, how high a level stands (#201), the units' conversions
//   lens.ts    the game's camera placing brush3d's view (#201)
//   land.ts    the land from the map: levels, cliffs, the water's beds, the country round it, earthworks (#202)
//   things.ts  the buildings and trucks as brush3d's solarpunk models (#203); #204 (a world that changes without a
//              stutter) and #205 (moving parts, building states, the markers) build on it
//   wild.ts    what grows, painted: the trees by species, the rocks, the open fields' crops and the saplings (#213)
//   grass.ts   the meadow across open grass: grass tufts swaying in the living wind (#256), wildflowers in drifts (#266)
//   sky.ts     the season, the hour and the sky from the game's weather (#207), the clouds where the rules have them (#208)
//   wind.ts    the living wind under the gusts the rules step, round the buildings and trees (#208)
//   cover.ts   what lies on the land from the game's: snow, frost, wet and mud (#207)
//   water.ts   the river and ponds, floods, ice and muddy water from the game's (#207; how the river sits in its bed is #202's)
//   grid.ts    the grid cover.ts and water.ts send their maps on
//   tools.ts   the game's tools on the picture: picking, the marks on things, the build preview and frames, the overlays,
//              the grid, routes and power lines, the tile cursor, and where the labels and markers go (#206)
//   settings.ts  brush3d's settings from the game's settings panel: graphics quality, rain and snow, lightning (#209)
//   profile.ts   what a frame costs on this map, pass by pass, and how long it took to load (`?profile`, #210)
//
// This file only wires the pieces into the Scene: a task adds its piece and its few lines here.

export function brushScene(state: GameState, canvas: HTMLCanvasElement, settings: SettingsStore, start: { x: number; z: number }, changed: () => void): Scene {
  const map = state.map;
  // How long each piece takes to make (the load, #210's ?profile).
  const pieces: Record<string, number> = {};
  let mark = performance.now();
  const timed = <T>(name: string, make: () => T): T => { const v = make(), now = performance.now(); pieces[name] = now - mark; mark = now; return v; };
  // The shadow follows the view over the map. The quality (the shadow's detail, the pixels drawn: on a high-DPI screen
  // at most 1080p's, scaled up, brush3d-renderer#28) is the player's setting.
  const r = timed('renderer', () => new BrushRenderer(canvas, { shadowFollow: true }));
  followSettings(r, settings);
  const land = timed('map', () => generateLand(state.scenario, COUNTRY)), lie = timed('lie', () => new Lie(state, land));
  const ground = timed('land', () => new BrushLand(r, state, land, lie)), sky = new BrushSky(r, state), cover = new BrushCover(r, land), water = timed('water', () => new BrushWater(r, land, lie));
  // The goods trucks carry and buildings hand next door (#203), drawn with the things.
  const goods = new Goods(r);
  const things = new Things(r, lie, goods), wild = timed('wild', () => new Wild(r, lie, land, state)), meadow = timed('meadow', () => new Meadow(r, lie, land, state, { grass: grassMode(), flowers: flowerMode() })), wind = timed('wind', () => new BrushWind(r, state, land));
  grassChoice((m) => meadow.setLooks({ grass: m }));
  flowerChoice((m) => meadow.setLooks({ flowers: m }));
  const lens = new BrushLens(r, canvas);
  const camera = new Camera(lens, canvas, map, start, changed);
  const tools = timed('tools', () => new BrushTools(r, state, things, lie, () => meadow.top));
  // The ground's brush baked once, here at the load, into a 4096² texture over the land (16 cm a texel, 64 MB), and read
  // from it each frame rather than worked out afresh in every pixel: a third of the GPU's frame (#210, the developer's
  // pick on #239). The light, shadows and weather stay live, as do a cliff's faces and the country past the land; an
  // earthwork bakes again only the patch it changed (brush3d's changeGround).
  timed('bake', () => { r.setFields('ground', 4096); });
  settings.listen((s) => tools.setLooks(s.highlight, s.overlayStyle));
  const began = mark - Object.values(pieces).reduce((a, b) => a + b, 0);
  /** The load's times, once the first frame is drawn; and while a profile runs, the game's loop stands still. */
  let load: LoadTimes | null = null, firstFrame = 0, models = 0, held = false;
  // From the page's start to the later of the two: the first frame, the models in.
  void things.ready.then(() => { models = performance.now() - began; if (load) { load.models = models; load.sinceStart = performance.now(); } });

  const heights: Heights = {
    at: (x, z) => lie.y(x, z) * RISE,
    top: (MAX_LEVEL + 1) * LEVEL_HEIGHT * RISE,
    level: (l) => l * LEVEL_HEIGHT * RISE,
    stand: (rel, n, x, y) => standY(lie, rel, n, x, y) * RISE,
    tile: (x, y, u, v) => lie.tileY(x, y, u, v) * RISE,
  };
  const gl = r.gl.getContext();
  const profile: ProfileHost = {
    r, state: () => current, load: () => load,
    // Held, nothing is sent; let go, everything is sent again (the case's weather and ground were the profile's).
    hold: (on) => { held = lens.held = on; if (!on) { sky.resend(); cover.resend(); } },
  };
  let current = state;
  if (new URLSearchParams(location.search).has('profile')) profilePanel(profile);
  return {
    camera, heights, picker: tools.picker, preview: tools.preview, held: () => held,
    heightOf: (type) => thingHeight(type) / TILE,
    sync(s, f) {
      current = s;
      if (held) return;
      sky.sync(s, f.hour, f.speed);
      wind.sync(s);
      ground.sync(s);
      cover.sync(s);
      water.sync(s);
      things.sync(s);
      wild.sync(s);
      meadow.sync(s);
      tools.sync(s, f);
    },
    show: (s, f) => tools.show(s, f),
    truckAt: (id) => things.truckAt(id),
    stopLabels: () => tools.stopLabels(),
    netLabels: () => tools.netLabels(),
    markerSpots: (s) => tools.markerSpots(s),
    render(time, f) {
      if (held) return;
      tools.cursor(f.marks, f.refused);
      const t0 = performance.now();
      r.render(time);
      if (!load) { firstFrame = performance.now() - t0; load = { pieces, firstFrame, models, sinceStart: performance.now() }; }
      f.lap('render');
      f.pick();
    },
    report: {
      env: () => {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          glRenderer: String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)), glVendor: String(gl.getParameter(dbg ? dbg.UNMASKED_VENDOR_WEBGL : gl.VENDOR)),
          userAgent: navigator.userAgent, viewport: [window.innerWidth, window.innerHeight], devicePixelRatio: window.devicePixelRatio,
          drawn: [r.width, r.height], shadowMapSize: r.quality.shadowMapSize,
          timerQueries: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
        };
      },
      counts: () => ({ draws: r.gl.info.render.calls, triangles: r.gl.info.render.triangles }),
      resetCounts: (on) => { r.gl.info.autoReset = !on; if (on) r.gl.info.reset(); },
    },
    // The pieces too, for tools/hitches.ts to time each one's sync.
    // The profile too (tools/framerate.ts: `game.profile(cases?)` of `game.cases()`, `game.load()`).
    debug: {
      renderer: r, lens, wind, pieces: { sky, wind, ground, cover, water, things, wild, meadow, tools },
      profile: (cases?: Parameters<typeof profileGame>[1]) => profileGame(profile, cases), load: () => load,
      cases: () => gameCases(current.scenario.climate.sun.set), causes: () => causeCases(),
    },
  };
}
