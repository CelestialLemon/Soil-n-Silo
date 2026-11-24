// The world bridge: turns the game's state (src/game/) into what brush3d draws, through brush3d/src/index.ts only
// (brush3d/docs/API.md). The game owns the state and the rules; the world draws the valley as it is, and after each edit
// redraws only what the edit's Change says it touched. It owns the frame loop (the clock, the wind, the weather, the
// camera's eases, the meadow's rebuilds, the moving parts) and answers the play layer's questions about the picture: what's
// under the pointer, where a point of the world is on the page.
//
// Two look choices of Milestone 1 can be flipped on the preview (docs/ROADMAP.md): the camera's turn (`?yaw=snap|orbit`,
// setYawMode) and the wiring (`?wiring=pylons|wireless`). The world draws the power as the state has it (state.power);
// setWiringMode records the choice in the URL, and the play layer applies the game's `setPowerMode` action with it.
import { type BrushRenderer as Renderer, BrushRenderer, QUALITY, type WeatherName } from '../../brush3d/src/index.ts';
import { type Change, COVER, type GameState, polylineDistance } from '../game/index.ts';
import { CameraRig, START_ZOOM } from './camera.ts';
import { Fields } from './fields.ts';
import { Meadow } from './meadow.ts';
import { type WorldOptions, type WiringMode, type YawMode, writeUrlParam } from './options.ts';
import { Bridges } from './paths.ts';
import { Sky, type Speed } from './sky.ts';
import { terrainMap, syncTerrain } from './terrain.ts';
import { loadModels, type ModelCache, Things } from './things.ts';
import { type PreviewSpec, Tools } from './tools.ts';
import { readTag } from './util.ts';
import { sendGround, sendWater } from './water.ts';
import { Wild } from './wild.ts';
import { Wind } from './wind.ts';

export { DEFAULT_OPTIONS, readUrlOptions, WIRING_MODES, writeUrlParam, YAW_MODES, type WiringMode, type WorldOptions, type YawMode } from './options.ts';
export { getModelForKind } from './things.ts';
export type { PreviewSpec } from './tools.ts';
export type { Speed } from './sky.ts';
export type { WeatherName } from '../../brush3d/src/index.ts';
export { ZOOM_MAX, ZOOM_MIN } from './camera.ts';

/** Where the world draws: the page's canvas. */
export function worldCanvas(root: Document): HTMLCanvasElement | null {
  return root.querySelector<HTMLCanvasElement>('#view');
}

/** What's under a point of the page: what the game calls it (and its id), and where the pointer meets it (m). */
export interface PickTarget {
  kind: 'thing' | 'channel' | 'track' | 'hedge' | 'tree' | 'field' | 'ground';
  id?: number;
  x: number; y: number; z: number;
}

/** The valley as drawn, for the play layer. */
export interface World {
  /** Redraws what an edit (the game's apply) touched. */
  sync(change: Change): void;
  /** Draws a different valley (a new seed, a loaded save) in place of this one. */
  resetValley(state: GameState): void;
  /** What the player is about to do (a ghost, a rill's flow, a brush), or null for nothing. */
  setPreview(spec: PreviewSpec | null): void;
  /** Highlights a placed thing (null: none). */
  setSelectedThing(id: number | null): void;
  /** The contour lines over the land (the rill tool's). */
  setContourHints(on: boolean): void;
  /** The ground's moisture as a soft glow (the field tool's). */
  setMoistureOverlay(on: boolean): void;
  /** In wireless mode, each power field's ring even when nothing's being placed. */
  setShowPowerPreview(on: boolean): void;
  setYawMode(mode: YawMode): void;
  /** Records the wiring choice (and writes it to the URL); the play layer applies the game's setPowerMode action. */
  setWiringMode(mode: WiringMode): void;
  /** Snap mode: turns to the next view (90°); orbit mode: turns 45°. */
  stepYaw(dir: -1 | 1): void;
  /** Turns by an angle (radians): smoothly in orbit mode, to the nearest view in snap mode. */
  orbitBy(deltaRad: number): void;
  /** Orbit mode: keeps turning while a key is held (-1, 1), 0 stops. */
  setOrbitHold(dir: -1 | 0 | 1): void;
  /** Pans by screen pixels (a drag). */
  panByScreen(dx: number, dy: number): void;
  /** Pans by metres along the screen's right (dx) and up (dz) over the ground (keyboard). */
  panByWorld(dx: number, dz: number): void;
  /** Zooms by a factor (over 1 in), keeping the ground under the pointer (page CSS pixels; left out, the middle) still. */
  zoomBy(factor: number, clientX?: number, clientY?: number): void;
  /** Glides the view to a place (and a zoom). */
  focusOn(x: number, z: number, zoom?: number): void;
  /** What's under a point of the page (CSS pixels, as pointer events give them), as of the frame last drawn. */
  pickAt(clientX: number, clientY: number): PickTarget | null;
  /** Where a point of the page meets the land (m), or null over the sky. */
  hitTerrainAt(clientX: number, clientY: number): { x: number; y: number; z: number } | null;
  /** Where a point of the world (m) is on the page (CSS pixels), and whether it's on the canvas. */
  toScreen(x: number, y: number, z: number): { x: number; y: number; visible: boolean };
  setHour(hour: number): void;
  getHour(): number;
  setSpeed(speed: Speed): void;
  getSpeed(): Speed;
  setWeather(weather: WeatherName): void;
  getWeather(): WeatherName;
  getZoom(): number;
  getHeading(): number;
  getYawMode(): YawMode;
  getWiringMode(): WiringMode;
  /** Calls `cb` every frame, before it's drawn, with the seconds since the last; returns what stops it. */
  onFrame(cb: (dt: number) => void): () => void;
  dispose(): void;
}

/** Makes the world: loads the models, builds the valley and starts drawing it. */
export async function createWorld(canvas: HTMLCanvasElement, state: GameState, options: WorldOptions): Promise<World> {
  const models = await loadModels();
  return new ValleyWorld(canvas, state, options, models);
}

/** The scene's parts, built for one valley. */
interface Scene { meadow: Meadow; wild: Wild; fields: Fields; bridges: Bridges; things: Things; tools: Tools; wind: Wind }

class ValleyWorld implements World {
  private readonly r: Renderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly models: ModelCache;
  private state: GameState;
  private scene: Scene;
  private readonly sky: Sky;
  private readonly rig: CameraRig;
  private wiring: WiringMode;
  private readonly frameCallbacks = new Set<(dt: number) => void>();
  private readonly resizer: ResizeObserver | null;
  private raf = 0;
  private last = -1;
  private time = 0;
  private disposed = false;
  /** The tools' switches, kept across a new valley. */
  private switches = { preview: null as PreviewSpec | null, selected: null as number | null, contours: false, moisture: false, power: false };

  constructor(canvas: HTMLCanvasElement, state: GameState, options: WorldOptions, models: ModelCache) {
    this.canvas = canvas; this.state = state; this.models = models; this.wiring = options.wiring;
    const r = new BrushRenderer(canvas, { shadowFollow: true });
    this.r = r;
    // On a high-DPI screen the frame is drawn at 1080p's pixel count and scaled up: the renderer's budget (brush3d/docs/PERFORMANCE.md).
    r.maxPixels = 1920 * 1080;
    if (options.quality) r.setQuality(QUALITY[options.quality]);
    this.resize();
    this.resizer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => this.resize());
    this.resizer?.observe(canvas);
    this.sky = new Sky(options.hour, options.weather, state.seed);
    this.rig = new CameraRig(state.valley.homestead.x, state.valley.homestead.z, options.yaw);
    this.scene = this.build(state);
    this.rig.settle(r);
    this.rig.place(r);
    this.sky.send(r, true);
    this.raf = requestAnimationFrame(this.frame);
  }

  // ---- Building ----

  /** Builds a valley: the season's light first (what grows takes it), then the land, the water, and what stands on it. */
  private build(state: GameState): Scene {
    const r = this.r;
    Sky.season(r, state.season);
    r.setTerrain(terrainMap(state));
    // The brushes' fields, baked once the ground is in: the ground's 2048², the grass's and crops' 1024² (the demo's pick).
    r.setFields('ground', 2048); r.setFields('crop', 1024); r.setFields('grass', 1024);
    sendWater(r, state, true);
    sendGround(r, state, this.sky.fall, true);
    const things = new Things(r, state, this.models);
    const wild = new Wild(r, state);
    const scene: Scene = {
      things, wild, meadow: new Meadow(r, state), fields: new Fields(r, state), bridges: new Bridges(r, state),
      tools: new Tools(r, state, things), wind: new Wind(this.sky.weather, state.seed, [...things.obstacles(), ...wild.obstacles()]),
    };
    things.windChanged = false; wild.windChanged = false;
    const sw = this.switches;
    scene.tools.setContours(sw.contours); scene.tools.setMoisture(sw.moisture); scene.tools.setShowPower(sw.power);
    scene.tools.setPreview(sw.preview);
    things.setSelected(sw.selected);
    return scene;
  }

  private teardown() {
    const s = this.scene;
    s.tools.dispose(); s.meadow.dispose(); s.wild.dispose(); s.fields.dispose(); s.bridges.dispose(); s.things.dispose(); s.wind.dispose();
  }

  private resize() {
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight;
    this.r.resize(w, h);
  }

  // ---- The frame ----

  private readonly frame = (now: number) => {
    if (this.disposed) return;
    const dt = this.last < 0 ? 1 / 60 : Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.time += dt;
    const r = this.r, s = this.scene;
    s.wind.step(r, dt);
    this.sky.step(r, dt, s.wind.goal);
    this.rig.update(r, dt);
    s.meadow.drain();
    s.things.frame(dt, this.sky.hour, (x, z, h) => s.wind.at(x, z, h));
    if (s.things.windChanged || s.wild.windChanged) {
      s.things.windChanged = false; s.wild.windChanged = false;
      s.wind.setObstacles([...s.things.obstacles(), ...s.wild.obstacles()]);
    }
    for (const cb of this.frameCallbacks) cb(dt);
    r.render(this.time);
    this.raf = requestAnimationFrame(this.frame);
  };

  // ---- Edits ----

  sync(change: Change) {
    const r = this.r, s = this.scene, state = this.state;
    const land = syncTerrain(r, state, change), landSent = land !== undefined && r.landAhead;
    if (change.water) sendWater(r, state);
    if (change.water || change.wet || change.cover) sendGround(r, state, this.sky.fall);
    s.fields.sync(change);
    s.things.sync(change, landSent);
    s.wild.sync(change);
    if (change.bridges) s.bridges.build();
    s.meadow.sync(change, land, landSent);
    s.tools.refresh();
  }

  resetValley(state: GameState) {
    this.teardown();
    this.state = state;
    this.scene = this.build(state);
    this.r.restartWind();
    this.rig.focusOn(state.valley.homestead.x, state.valley.homestead.z, START_ZOOM);
    this.rig.settle(this.r);
    this.sky.send(this.r, true);
  }

  // ---- Tools ----

  setPreview(spec: PreviewSpec | null) { this.switches.preview = spec; this.scene.tools.setPreview(spec); }
  setSelectedThing(id: number | null) { this.switches.selected = id; this.scene.things.setSelected(id); }
  setContourHints(on: boolean) { this.switches.contours = on; this.scene.tools.setContours(on); }
  setMoistureOverlay(on: boolean) { this.switches.moisture = on; this.scene.tools.setMoisture(on); }
  setShowPowerPreview(on: boolean) { this.switches.power = on; this.scene.tools.setShowPower(on); }

  // ---- The camera ----

  setYawMode(mode: YawMode) { this.rig.setMode(mode); writeUrlParam('yaw', mode); }
  setWiringMode(mode: WiringMode) { this.wiring = mode; writeUrlParam('wiring', mode); }
  stepYaw(dir: -1 | 1) { this.rig.stepYaw(dir); }
  orbitBy(deltaRad: number) { this.rig.orbitBy(deltaRad); }
  setOrbitHold(dir: -1 | 0 | 1) { this.rig.setOrbitHold(dir); }
  panByScreen(dx: number, dy: number) { this.rig.panByScreen(dx, dy); }

  panByWorld(dx: number, dz: number) {
    const { right, up } = this.rig.axes();
    this.rig.panByWorld(right.x * dx + up.x * dz, right.z * dx + up.z * dz);
  }

  zoomBy(factor: number, clientX?: number, clientY?: number) {
    if (clientX === undefined || clientY === undefined) { this.rig.zoomBy(factor); return; }
    const b = this.canvas.getBoundingClientRect();
    this.rig.zoomBy(factor, clientX - (b.left + b.width / 2), clientY - (b.top + b.height / 2));
  }

  focusOn(x: number, z: number, zoom?: number) { this.rig.focusOn(x, z, zoom); }

  // ---- Questions ----

  pickAt(clientX: number, clientY: number): PickTarget | null {
    const hit = this.r.pick(clientX, clientY);
    if (!hit) return null;
    const { x, y, z } = hit.point, at = { x, y, z }, tag = readTag(hit.tag);
    if (tag?.kind === 'thing') return { kind: 'thing', id: Number(tag.id), ...at };
    if (tag?.kind === 'track') return { kind: 'track', id: Number(tag.id), ...at };
    // A tree's or a hedge's tag is told by its meshes' box, which reaches over the ground round it: only near it is it.
    if (hit.what === 'plant' || tag?.kind === 'tree' || tag?.kind === 'hedge') {
      const near = this.scene.wild.nearest(x, z);
      if (near) return { kind: near.kind, id: near.id, ...at };
      // A reed, a tuft or the edge of a crown in front: the player means the land behind it (a rill among the reeds).
      const land = this.hitTerrainAt(clientX, clientY);
      if (land) return this.landAt(land, false);
    }
    return this.landAt(at, hit.what === 'water');
  }

  /** What the land is at a point: a field, a rill, a track, or plain ground. */
  private landAt(at: { x: number; y: number; z: number }, water: boolean): PickTarget {
    const g = this.state.grid, ix = Math.floor((at.x - g.x0) / g.cell), iz = Math.floor((at.z - g.z0) / g.cell);
    if (ix < 0 || iz < 0 || ix >= g.nx || iz >= g.nz) return { kind: 'ground', ...at };
    const k = iz * g.nx + ix, cover = g.cover[k], field = g.fieldOf[k];
    if (field !== 0) return { kind: 'field', id: field, ...at };
    const nearest = <T extends { id: number; path: { x: number; z: number }[] }>(list: readonly T[], reach: number) => {
      let best: T | null = null, d = reach;
      for (const o of list) { const e = polylineDistance(at.x, at.z, o.path).d; if (e < d) { d = e; best = o; } }
      return best;
    };
    if (cover === COVER.rill || water) {
      const c = nearest(this.state.channels, 1.6);
      if (c) return { kind: 'channel', id: c.id, ...at };
    }
    if (cover === COVER.track) {
      const t = nearest(this.state.tracks, 1.6);
      if (t) return { kind: 'track', id: t.id, ...at };
    }
    return { kind: 'ground', ...at };
  }

  hitTerrainAt(clientX: number, clientY: number) {
    const p = this.r.landHit(this.r.view.rayAt(clientX, clientY));
    return p ? { x: p.x, y: p.y, z: p.z } : null;
  }

  toScreen(x: number, y: number, z: number) {
    const p = this.r.view.toScreen(x, y, z), b = this.canvas.getBoundingClientRect();
    return { x: p.x, y: p.y, visible: p.x >= b.left && p.x <= b.right && p.y >= b.top && p.y <= b.bottom };
  }

  // ---- The clock and the weather ----

  setHour(hour: number) { this.sky.hour = ((hour % 24) + 24) % 24; this.r.setHour(this.sky.hour); }
  getHour() { return this.sky.hour; }
  setSpeed(speed: Speed) { this.sky.speed = speed; }
  getSpeed() { return this.sky.speed; }

  setWeather(weather: WeatherName) {
    this.sky.setWeather(weather);
    this.scene.wind.setWeather(weather);
    sendGround(this.r, this.state, this.sky.fall);
    writeUrlParam('weather', weather);
  }

  getWeather() { return this.sky.weather; }
  getZoom() { return this.rig.zoom; }
  getHeading() { return this.rig.heading; }
  getYawMode() { return this.rig.mode; }
  getWiringMode() { return this.wiring; }

  onFrame(cb: (dt: number) => void) {
    this.frameCallbacks.add(cb);
    return () => { this.frameCallbacks.delete(cb); };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizer?.disconnect();
    this.frameCallbacks.clear();
    this.teardown();
    this.r.gl.dispose();
  }
}
