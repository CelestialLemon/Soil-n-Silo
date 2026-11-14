import * as THREE from 'three';
import { DEFAULT_WEATHER, lookAt, MAX_HIGHLIGHTS, PixelRenderer, quantizePalette, type PickResult, type PixelObject } from 'pixel3d-renderer';
import { generateLand } from '../game/map.ts';
import { MAX_LEVEL } from '../game/relief.ts';
import { muddyAt } from '../game/mud.ts';
import { windAt } from '../game/sim/clock.ts';
import { weatherNow } from '../game/sim/weather.ts';
import { buildingAt, type Dir, type GameState } from '../game/state.ts';
import type { SettingsStore } from '../ui/settings.ts';
import { Camera, PixelLens } from './camera.ts';
import { detailColours, GroundDetail } from './detail.ts';
import { FloodView } from './floodView.ts';
import { fallIntensity, greyLook } from './greyLook.ts';
import { Lie, LEVEL_HEIGHT, MapGround, standY } from './ground.ts';
import { IceView } from './iceView.ts';
import { allGeometries, loadModels } from './models.ts';
import { PowerView } from './powerView.ts';
import { Rime } from './rime.ts';
import { RouteView } from './routeView.ts';
import type { Heights, PagePoint, Picker, Preview, Scene, Tile } from './scene.ts';
import { SOILS } from './shapes.ts';
import { SnowView } from './snowView.ts';
import { buildWorld, COUNTRY } from './terrain.ts';
import { TileCursor } from './tileCursor.ts';
import { WorldView } from './view.ts';

// The pixel world (pixel3d-renderer) behind the game's Scene (scene.ts): what the game drew with before brush3d, and
// draws with by default until the swap (#211), when this file goes. Moved here from main.ts unchanged (#201).
//
// Each art pixel is drawn as a square of `pixelSize` screen pixels (a setting, 2 by default), whatever the zoom; zooming
// changes how many metres of ground fit on the screen, so models are drawn with more art pixels close up and fewer far out.

/** How near the line of sight through the pointer a truck must drive (m) to change what is under the pointer. */
const TRUCK_REACH = 0.8;
const YAW: Record<Dir, number> = { 0: Math.PI, 1: Math.PI / 2, 2: 0, 3: -Math.PI / 2 };
/** Seconds the drawn cloud and wind take to follow the game's; the lean the game's full wind gives the trees (renderer 0 to 3); the gusts in still air and what the wind adds. */
const EASE_SECONDS = 3, WIND_LEAN = 2, GUSTS_CALM = 0.5, GUSTS_PER_WIND = 1;

/** Builds the pixel world for a game: `start` is the ground point first looked at; `changed` that what is under the pointer may have. */
export async function pixelScene(state: GameState, canvas: HTMLCanvasElement, settings: SettingsStore, start: { x: number; z: number }, changed: () => void): Promise<Scene> {
  const map = state.map;
  const { season } = state.scenario.climate;
  const models = await loadModels(season);
  const land = generateLand(state.scenario, COUNTRY);
  const lie = new Lie(state, land), world = buildWorld(map, land, lie, models, season), ground = new MapGround(state, land, lie, world.halo, [...SOILS, ...detailColours(season), ...detailColours(season).map(world.halo.tone)]);
  // 240 colours: the five grounds' turf, each with its dryness and hillshade steps, is about 500 distinct colours before the merge.
  quantizePalette([...world.geometries, ...ground.geometries, ...allGeometries(models)], 240);
  const renderer = new PixelRenderer(canvas, world.scene, { shadowMapSize: 2048, warmHighlight: true });
  ground.show(renderer);
  const detail = new GroundDetail(renderer, state, land, lie, ground, world.halo.tone);
  const view = new WorldView(renderer, models, lie, ground.paint, world.halo.things);
  const floodView = new FloodView(renderer, lie);
  const power = new PowerView(renderer, models, lie);
  const rime = new Rime(renderer, lie);
  const ice = new IceView(renderer, land), snow = new SnowView(renderer, lie, land);
  const routeView = new RouteView(renderer, models, lie);
  const cursor = new TileCursor(canvas, 0xfff0c0), refused = new TileCursor(canvas, 0xe8705a);
  const camera = new Camera(new PixelLens(renderer, canvas, settings), canvas, map, start, changed);

  const heights: Heights = {
    at: (x, z) => lie.y(x, z),
    top: (MAX_LEVEL + 1) * LEVEL_HEIGHT,
    level: (l) => l * LEVEL_HEIGHT,
    stand: (r, n, x, y) => standY(lie, r, n, x, y),
    tile: (x, y, u, v) => lie.tileY(x, y, u, v),
  };

  // ---- Picking ----
  /** The art pixel under page point `at`, counted as the renderer's pick counts it, and the picture's size. */
  function artPixel(at: PagePoint) {
    const rect = canvas.getBoundingClientRect();
    return { x: Math.floor((at.x - rect.left) / rect.width * renderer.width), y: Math.floor((at.y - rect.top) / rect.height * renderer.height), w: renderer.width, h: renderer.height };
  }
  /** The camera as drawn (placed and snapped to the pixel grid), to tell whether the picture under a still pointer moved. */
  const cameraNow = (into = new THREE.Matrix4()) => into.multiplyMatrices(renderer.camera.projectionMatrix, renderer.camera.matrixWorldInverse);
  const cameraScratch = new THREE.Matrix4();
  /**
   * What a pick found under the pointer, and where the pointer (`px`, an art pixel) and the camera were when it was asked.
   * `ground` is the tile the ground showed there then, `terrain` a tree's or rock's tile, `building` a building or truck.
   */
  interface Seen {
    object: PixelObject | null; terrain: Tile | null; building: number | null;
    ground: Tile | null; px: ReturnType<typeof artPixel>; camera: THREE.Matrix4;
  }
  /** The last pick's answer, kept while the pointer is on the canvas. */
  let seen: Seen | null = null;
  /** Keeps a pick's answer `p`, asked at art pixel `px` with `camera` and `ground` the tile under the pointer then. */
  function keep(p: PickResult | null, px: ReturnType<typeof artPixel>, ground: Tile | null, camera: THREE.Matrix4) {
    const object = p?.object ?? null;
    seen = { object, terrain: view.terrainOf(object), building: view.buildingOf(object), ground, px, camera };
  }
  /** The number of the last pick asked for: an answer that comes after a newer pick is dropped. */
  let pickNo = 0;
  /** A hover pick is on its way: the next waits for it, so there is at most one. */
  let picking = false;
  /** Where each truck was drawn when the pointer last looked, to tell when one moves under it. */
  const trucksSeen = new Map<number, { x: number; z: number }>();
  const near = new THREE.Vector3();
  /** Whether a truck has driven under the pointer, or out from under it, since the last frame. */
  function truckMovedUnder(s: GameState, p: PagePoint) {
    let under = false, sight: THREE.Ray | null = null;
    for (const t of s.trucks) {
      const at = view.truckAt(t.id), was = trucksSeen.get(t.id);
      if (!at || (was && was.x === at.x && was.z === at.z)) continue;
      trucksSeen.set(t.id, at);
      if (under) continue;
      sight ??= camera.sightAt(p.x, p.y);
      // Measured from the middle of the truck, where it is now and where it was.
      for (const q of was ? [at, was] : [at]) if (sight.distanceToPoint(near.set(q.x, lie.y(q.x, q.z) + 0.25, q.z)) < TRUCK_REACH) under = true;
    }
    return under;
  }
  /** The world view's count of changes when the pointer last looked. */
  let viewSeen = view.changes;

  const picker: Picker = {
    under(s, at, ground) {
      let tile = ground, building: number | null;
      // A tree or rock is its own tile (the ground behind it is another), while the pick still shows what is under the pointer:
      // the same art pixel, the camera not moved, and the tree still there.
      if (seen?.terrain) {
        const px = artPixel(at), was = seen.px, now = view.terrainOf(seen.object);
        if (px.x === was.x && px.y === was.y && px.w === was.w && px.h === was.h && now && now.x === seen.terrain.x && now.y === seen.terrain.y
          && cameraNow(cameraScratch).equals(seen.camera)) tile = now;
      }
      // A building's or truck's own object, if it still stands for it; else the building on the tile the pick looked at.
      if (!seen) building = null;
      else if (seen.building !== null) building = view.buildingOf(seen.object) === seen.building ? seen.building : null;
      else {
        const t = seen.terrain ?? seen.ground;
        building = t ? buildingAt(s, t.x, t.y)?.id ?? null : null;
      }
      return { tile, building };
    },
    now(at, ground) {
      pickNo++;
      keep(renderer.pick(at.x, at.y), artPixel(at), ground, cameraNow());
    },
    request(at, ground, still) {
      if (picking) return false;
      picking = true;
      const no = ++pickNo, px = artPixel(at), drawn = cameraNow();
      void renderer.requestPick(at.x, at.y).then((p) => {
        picking = false;
        if (no === pickNo && still()) keep(p, px, ground, drawn);
      });
      return true;
    },
    forget() { pickNo++; seen = null; },
    moved(s, at) {
      let moved = false;
      // Something new shown or taken away, or a truck driving under the pointer, may change what is under it.
      if (view.changes !== viewSeen) { viewSeen = view.changes; moved = true; }
      if (at && truckMovedUnder(s, at)) moved = true;
      return moved;
    },
  };

  // ---- Ghosts: what would be built ----
  const ghostPool = new Map<string, PixelObject[]>();
  let ghostUsed = new Map<string, number>();
  const GOOD = new THREE.Color(0x90ff90), BAD = new THREE.Color(0xff5040);
  /** Shows a preview object; `fits` draws it see-through and tinted green (fits) or red (doesn't). */
  function ghost(key: string, g: THREE.BufferGeometry, x: number, y: number, z: number, yaw = 0, fits?: boolean) {
    const list = ghostPool.get(key) ?? [];
    ghostPool.set(key, list);
    const i = ghostUsed.get(key) ?? 0;
    ghostUsed.set(key, i + 1);
    let o = list[i];
    if (!o) { o = renderer.addObject(g); o.castShadow = false; list.push(o); }
    o.visible = true;
    if (fits !== undefined) { o.opacity = 0.6; o.tint = fits ? GOOD : BAD; o.tintStrength = 0.45; }
    o.setTransform(new THREE.Vector3(x, y, z), new THREE.Euler(0, yaw, 0));
  }
  const preview: Preview = {
    clear() {
      for (const list of ghostPool.values()) for (const o of list) o.visible = false;
      ghostUsed = new Map();
    },
    frame: (n, ok, x, y, z) => ghost(`frame ${ok} ${n}`, (ok ? models.frames.ok : models.frames.bad)[n - 1], x, y + 0.03, z),
    building: (type, x, y, z, rot, ok) => ghost(`b ${type}`, models.buildings[type].idle, x, y + 0.04, z, YAW[rot], ok),
    crop(crop, x, y, z, ok) {
      const stages = models.crops[crop];
      ghost(`crop ${crop}`, stages[Math.min(2, stages.length - 1)], x, y + 0.06, z, 0, ok);
    },
  };

  let highlighted: PixelObject[] = [];
  function highlight(ids: number[]) {
    const next = ids.flatMap((id) => view.objectsOf(id)).slice(0, MAX_HIGHLIGHTS);
    for (const o of highlighted) if (!next.includes(o)) o.highlight = false;
    for (const o of next) o.highlight = true;
    highlighted = next;
  }

  // ---- The sky ----
  let lookHour = Number.NaN, lookCloud = 0, lookPrecip = 0, lookHeat = 0;
  let skyEased: { cloud: number; wind: number; precip: number; haze: number; hazeTop: number } | null = null;
  /** The colour of the haze last drawn, kept while it thins out. */
  let hazeColor = DEFAULT_WEATHER.hazeColor;
  /** What fell last, so a fading shower keeps its kind while it thins out. */
  let fallKind: 'rain' | 'snow' = 'rain';
  function sky(s: GameState, dt: number, hour: number) {
    // The sky's cloud cover and the wind in the trees follow the weather now, eased over a few seconds (a wind change applies
    // at once in the renderer). Rain and snow fall on the same easing, thickening and thinning with the spell.
    const w = weatherNow(s), windNow = windAt(s.scenario, s.time), ease = 1 - Math.exp(-dt / EASE_SECONDS);
    const hazeNow = w.haze, hazeAmount = hazeNow?.amount ?? 0, hazeTopNow = hazeNow?.top ?? skyEased?.hazeTop ?? DEFAULT_WEATHER.hazeTop;
    if (!skyEased) { skyEased = { cloud: w.cloud, wind: windNow, precip: w.precip, haze: hazeAmount, hazeTop: hazeTopNow }; } else {
      skyEased.precip += (w.precip - skyEased.precip) * ease; skyEased.cloud += (w.cloud - skyEased.cloud) * ease; skyEased.wind += (windNow - skyEased.wind) * ease;
      skyEased.haze += (hazeAmount - skyEased.haze) * ease; skyEased.hazeTop += (hazeTopNow - skyEased.hazeTop) * ease;
    }
    if (hazeNow) hazeColor = hazeNow.color;
    if (w.sky === 'rain' || w.sky === 'snow') fallKind = w.sky;
    const fall = fallIntensity(skyEased.precip);
    renderer.setWeather({
      precipitation: fall > 0 ? fallKind : 'none',
      intensity: fall,
      cloudCover: Math.min(1, Math.max(0, skyEased.cloud)),
      wind: Math.min(3, Math.max(0, skyEased.wind * WIND_LEAN)),
      gusts: Math.min(3, Math.max(0, GUSTS_CALM + skyEased.wind * GUSTS_PER_WIND)),
      // A fog or a dust storm lies on the ground (the thickness eases with the event's ramp; a fog thins as the morning lifts it, events.ts).
      haze: Math.min(1, Math.max(0, skyEased.haze)), hazeColor, hazeTop: skyEased.hazeTop,
    });
    // The hour's look, greyed by the weather now; set again when the hour or the weather has moved enough to show.
    if (!(Math.abs(hour - lookHour) <= 0.02) || Math.abs(w.cloud - lookCloud) > 0.01 || Math.abs(w.precip - lookPrecip) > 0.01 || Math.abs(w.heat - lookHeat) > 0.01) {
      renderer.setLook(greyLook(lookAt(hour), w)); lookHour = hour; lookCloud = w.cloud; lookPrecip = w.precip; lookHeat = w.heat;
    }
  }

  const three = renderer.renderer, gl = three.getContext();
  return {
    camera, heights, picker, preview,
    heightOf: (type) => models.buildings[type].height,
    sync(s, f) {
      sky(s, f.dt, f.hour);
      ground.mud(muddyAt(s.scenario, s.time));
      ground.sync();
      ground.showLines(f.lines);
      detail.sync();
      view.sync(s);
      floodView.sync(s);
    },
    show(s, f) {
      view.overlay(s, f.overlay);
      rime.sync(s, f.overlay !== 'none');
      ice.sync(s);
      snow.sync(s, f.overlay !== 'none');
      detail.show(f.details);
      view.links(f.links);
      view.snow(s, snow.cover(s));
      routeView.sync(s, f.routes.routes, f.routes.numbers);
      power.sync(s, f.power);
      highlight(f.highlight);
    },
    truckAt: (id) => view.truckAt(id),
    stopLabels: () => routeView.labels(),
    netLabels: () => power.labels(),
    markerSpots: (s) => view.markerSpots(s),
    render(time, f) {
      renderer.renderGeometry(time);
      f.lap('geometry');
      // Picked from the picture just drawn, so it shows this frame's camera, pointer and world.
      f.pick();
      f.lap('pick');
      renderer.renderStyle(time);
      f.lap('style');
      cursor.draw(f.marks, renderer.camera, renderer.width, renderer.height);
      refused.draw(f.refused, renderer.camera, renderer.width, renderer.height);
    },
    // The frame rate readout's report mode: where the machine and the renderer's setup are read from, only when a report is made.
    report: {
      env: () => {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        return {
          glRenderer: String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)), glVendor: String(gl.getParameter(dbg ? dbg.UNMASKED_VENDOR_WEBGL : gl.VENDOR)),
          userAgent: navigator.userAgent, viewport: [window.innerWidth, window.innerHeight], devicePixelRatio: window.devicePixelRatio,
          art: [renderer.width, renderer.height], supersample: renderer.supersample, shadowMapSize: renderer.shadowMapSize, pixelSize: settings.get().pixelSize,
          timerQueries: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'),
        };
      },
      counts: () => ({ draws: three.info.render.calls, triangles: three.info.render.triangles }),
      // three.js counts a draw call per render() and resets at each one; held across the frame's passes while the report is on.
      resetCounts: (on) => { three.info.autoReset = !on; if (on) three.info.reset(); },
    },
    debug: { renderer, view },
  };
}
