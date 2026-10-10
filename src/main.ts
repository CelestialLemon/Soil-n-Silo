import * as THREE from 'three';
import { lookAt, MAX_HIGHLIGHTS, PixelRenderer, quantizePalette, type PixelObject } from 'pixel3d-renderer';
import { canPlace, place, remove, removeAt } from './game/build.ts';
import { BUILDINGS, POWER, type BuildingId } from './game/data.ts';
import { TERRAIN } from './game/map.ts';
import { POWERED, pylonsInLink } from './game/power.ts';
import { deserialize, readProgress, recordResult, saveKey, serialize } from './game/save.ts';
import { scenarioById } from './game/scenarios.ts';
import { advance, describeStatus, fieldFertility, hourAt, medalFor } from './game/sim.ts';
import { buildingAt, buildingById, inMap, newGame, reachTo, sizeOf, terrainAt, type Dir, type GameState } from './game/state.ts';
import { Hud, PIXEL_SIZES, type Tool } from './ui/hud.ts';
import { showMenu } from './ui/menu.ts';
import { allGeometries, loadModels } from './world/models.ts';
import { PowerView } from './world/powerView.ts';
import { buildWorld } from './world/terrain.ts';
import { WorldView, type Overlay } from './world/view.ts';
import './ui/style.css';

// The game: owns the loop, the state, input and the camera, and each frame tells the renderer where everything is. It is
// build-only: the player places, configures and removes buildings and the simulation runs on its own. The camera
// is orthographic at a 30° pitch, turns between four views 90° apart, zooms towards the pointer and pans with the mouse.
//
// Each art pixel is drawn as a square of `pixelSize` screen pixels (a setting, 2 by default), whatever the zoom; zooming
// changes how many metres of ground fit on the screen, so models are drawn with more art pixels close up and fewer far out.

/** The zoom range, as screen pixels per metre of ground, and where a commission starts. */
const MIN_ZOOM = 16, MAX_ZOOM = 96, START_ZOOM = 32;
/** How much one wheel notch or key press zooms. */
const ZOOM_STEP = 1.25;
const DEFAULT_PIXEL_SIZE = 2;
const ELEVATION = THREE.MathUtils.degToRad(30);
const HOME_YAW = THREE.MathUtils.degToRad(45);
const DRAG_THRESHOLD = 4;
const WHEEL_STEP = 100, PINCH_GAIN = 4;
const ZOOM_RATE = 14;               // how fast the zoom eases towards its level (per second, in log space)
const TURN_SECONDS = 0.3;
const REPICK_FRAMES = 6;
const AUTOSAVE_SECONDS = 30;
const MAX_STEPS_PER_FRAME = 80;
/** How far apart a drag places pylons: their reaches meet edge to edge, and each links to the next. */
const PYLON_STEP = 2 * POWER.pylon.reach + 1;
/** Whether placing a building should show the power networks: it makes, stores, carries or uses power. */
const POWER_BUILDINGS = new Set<BuildingId>(['pylon', 'solar', 'turbine', 'battery', 'digester']);
const usesPower = (t: BuildingId) => POWER_BUILDINGS.has(t) || !!BUILDINGS[t].power;

const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
const loading = document.querySelector<HTMLElement>('#loading')!;
const SAVE_KEY = saveKey(location.pathname), PROGRESS_KEY = `${SAVE_KEY}:progress`, PIXEL_KEY = `${SAVE_KEY}:pixel`;
/** A saved pixel size, if it is one of the choices; else the default. */
const readPixelSize = (v: string | null) => (PIXEL_SIZES as readonly number[]).find((n) => String(n) === v) ?? DEFAULT_PIXEL_SIZE;

const saved = deserialize(localStorage.getItem(SAVE_KEY));
const params = new URLSearchParams(location.search);
const startId = params.get('play');

/** Starts a new commission: saves it, then reloads into it (each map builds its own static world). */
/** Set while the page leaves for a new commission, so the game being left doesn't save over the new one. */
let leaving = false;

function startNew(id: string) {
  const sc = scenarioById(id);
  if (!sc) return;
  leaving = true;
  localStorage.setItem(SAVE_KEY, serialize(newGame(sc)));
  location.href = location.pathname;
}

if (startId) startNew(startId);
else if (!saved || params.has('menu')) {
  loading.remove();
  showMenu(document.body, {
    saved: saved ? { name: saved.scenario.name, time: saved.time, done: saved.completedAt !== null } : null,
    progress: readProgress(localStorage.getItem(PROGRESS_KEY)),
    resume: () => { location.href = location.pathname; },
    start: startNew,
  });
} else {
  await play(saved);
}

async function play(initial: GameState) {
  let state = initial;
  const map = state.map;
  const models = await loadModels();
  const world = buildWorld(map, models.trees);
  quantizePalette([...world.geometries, ...allGeometries(models)], 96);
  const renderer = new PixelRenderer(canvas, world.scene, { shadowMapSize: 2048, warmHighlight: true });
  const view = new WorldView(renderer, models);
  const power = new PowerView(renderer, models);
  const cursor = renderer.addObject(models.cursor);
  cursor.visible = false;
  loading.remove();

  let speed = 1, paused = false, overlay: Overlay = 'none';
  let tool: Tool = { kind: 'select' };
  let selected: number | null = null;
  const save = () => { if (!leaving) localStorage.setItem(SAVE_KEY, serialize(state)); };
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  const hud = new Hud(document.body, {
    state: () => state,
    tool: () => tool,
    setTool: (t) => setTool(t),
    speed: () => (paused ? 0 : speed),
    setSpeed: (n) => { if (n === 0) paused = !paused; else { speed = n; paused = false; } },
    overlay: () => overlay,
    setOverlay: (o) => { overlay = overlay === o ? 'none' : o; },
    selected: () => selected,
    select: (id) => { selected = id; },
    changed: () => { repick = 2; },
    turn: (d) => turn(d),
    zoom: (d) => zoomStep(d),
    pixelSize: () => pixelSize,
    setPixelSize: (n) => setPixelSize(n),
    menu: () => { save(); location.href = `${location.pathname}?menu`; },
    restart: () => startNew(state.scenario.id),
  });
  if (state.time === 0) hud.showIntro();

  function setTool(t: Tool) {
    tool = t;
    if (t.kind !== 'select') selected = null;
    clearGhosts();
    repick = 2;
  }

  // ---- Camera ----
  const target = new THREE.Vector3(map.depot.x + 1.5, 0, map.depot.y - 4);
  let view4 = 0;
  /** Screen pixels per art pixel: the pixel size setting. */
  let pixelSize = readPixelSize(localStorage.getItem(PIXEL_KEY));
  /** The zoom, as screen pixels per metre of ground: `zoom` eases towards `zoomGoal`. */
  let zoom = START_ZOOM, zoomGoal = START_ZOOM;
  /** While zooming towards the pointer: the ground point that stays under it, and where the pointer is from the centre. */
  let zoomAnchor: { ground: THREE.Vector3; dx: number; dy: number } | null = null;
  let yaw = HOME_YAW, turnFrom = HOME_YAW, turnAt = -Infinity;
  let repick = 2;
  const forward = new THREE.Vector3(), right = new THREE.Vector3();
  function cameraAxes() { forward.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(-forward.z, 0, forward.x); }
  function turn(dir: 1 | -1) { view4 += dir; turnFrom = yaw; turnAt = time; repick = 2; }
  function turning() {
    const k = Math.min(1, (time - turnAt) / TURN_SECONDS);
    const next = turnFrom + (HOME_YAW + view4 * Math.PI / 2 - turnFrom) * (1 - (1 - k) ** 3);
    if (next !== yaw) repick = 2;
    yaw = next;
  }
  function pan(dx: number, dy: number) {
    cameraAxes();
    const metres = 1 / zoom;
    const before = target.clone();
    target.addScaledVector(right, -dx * metres).addScaledVector(forward, dy * metres / Math.sin(ELEVATION));
    clampTarget();
    // A pan during a zoom carries the zoom's anchor along, so the two don't fight.
    if (zoomAnchor) zoomAnchor.ground.add(target.clone().sub(before));
    repick = 2;
  }
  function clampTarget() {
    target.x = THREE.MathUtils.clamp(target.x, 0, map.width);
    target.z = THREE.MathUtils.clamp(target.z, 0, map.height);
  }
  /** Zooms in (+1) or out (−1) by one step. */
  function zoomStep(dir: number, at?: { x: number; y: number }) { setZoom(zoomGoal * ZOOM_STEP ** dir, at); }
  /** Zooms to `goal` screen pixels per metre, keeping the ground under the page point `at` (the pointer) where it is; the centre without one. */
  function setZoom(goal: number, at?: { x: number; y: number }) {
    goal = THREE.MathUtils.clamp(goal, MIN_ZOOM, MAX_ZOOM);
    if (goal === zoomGoal) return;
    zoomGoal = goal;
    // The ground under the point, from where the camera is now (target, turn and zoom), not from the last picture drawn:
    // several wheel events can arrive before the next frame.
    if (at) {
      const dx = at.x - innerWidth / 2, dy = at.y - innerHeight / 2, metres = 1 / zoom;
      cameraAxes();
      const ground = target.clone().addScaledVector(right, dx * metres).addScaledVector(forward, -dy * metres / Math.sin(ELEVATION));
      zoomAnchor = { ground, dx, dy };
    } else zoomAnchor = null;
  }
  function setPixelSize(n: number) {
    pixelSize = readPixelSize(String(n));
    localStorage.setItem(PIXEL_KEY, String(pixelSize));
    fit();
  }
  addEventListener('resize', () => fit());
  /** One frame of the zoom easing towards its goal. */
  function zooming(dt: number) {
    if (zoom === zoomGoal) return;
    const k = 1 - Math.exp(-dt * ZOOM_RATE);
    zoom = Math.exp(Math.log(zoom) + Math.log(zoomGoal / zoom) * k);
    if (Math.abs(Math.log(zoomGoal / zoom)) < 0.004) zoom = zoomGoal;
    if (zoomAnchor) {
      cameraAxes();
      const metres = 1 / zoom;
      target.copy(zoomAnchor.ground).addScaledVector(right, -zoomAnchor.dx * metres).addScaledVector(forward, zoomAnchor.dy * metres / Math.sin(ELEVATION));
      clampTarget();
    }
    if (zoom === zoomGoal) zoomAnchor = null;
    repick = 2;
  }
  /** Sizes the art (render target) for the window at the pixel size, and lays the canvas out centred on the window. */
  function fit() {
    const w = Math.max(1, Math.ceil(innerWidth / pixelSize)), h = Math.max(1, Math.ceil(innerHeight / pixelSize));
    if (renderer.width !== w || renderer.height !== h) renderer.resize(w, h);
    const cw = w * pixelSize, ch = h * pixelSize;
    canvas.style.width = `${cw}px`; canvas.style.height = `${ch}px`;
    canvas.style.left = `${Math.floor((innerWidth - cw) / 2)}px`; canvas.style.top = `${Math.floor((innerHeight - ch) / 2)}px`;
    repick = 2;
  }
  fit();

  /** A world point's place on the page. */
  const projected = new THREE.Vector3();
  function toScreen(x: number, y: number, z: number) {
    const rect = canvas.getBoundingClientRect();
    projected.set(x, y, z).project(renderer.camera);
    return { sx: rect.left + (projected.x + 1) / 2 * rect.width, sy: rect.top + (1 - projected.y) / 2 * rect.height };
  }

  // ---- Pointing ----
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  /** The point on the ground plane under a point of the page. */
  function groundAt(x: number, y: number): THREE.Vector3 | null {
    const rect = canvas.getBoundingClientRect();
    ndc.set((x - rect.left) / rect.width * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    renderer.camera.updateMatrixWorld();
    raycaster.setFromCamera(ndc, renderer.camera);
    return raycaster.ray.intersectPlane(ground, hit) ? hit.clone() : null;
  }
  /** The map tile under a point of the page, on the ground plane (whatever stands there). */
  function tileAt(x: number, y: number): { x: number; y: number } | null {
    const g = groundAt(x, y);
    if (!g) return null;
    const t = { x: Math.floor(g.x), y: Math.floor(g.z) };
    return inMap(state, t.x, t.y) ? t : null;
  }

  let pointer: { x: number; y: number } | null = null;
  let hoverTile: { x: number; y: number } | null = null;
  let hoverBuilding: number | null = null;
  let highlighted: PixelObject[] = [];

  function pickHover() {
    if (!pointer) { hoverTile = null; hoverBuilding = null; return; }
    const p = renderer.pick(pointer.x, pointer.y);
    // A tree or rock under the pointer is its own tile (the ground point behind it is another tile).
    hoverTile = view.terrainOf(p?.object ?? null) ?? tileAt(pointer.x, pointer.y);
    hoverBuilding = view.buildingOf(p?.object ?? null);
    if (hoverBuilding === null && hoverTile) hoverBuilding = buildingAt(state, hoverTile.x, hoverTile.y)?.id ?? null;
  }

  function highlight(ids: number[]) {
    const next = ids.flatMap((id) => view.objectsOf(id)).slice(0, MAX_HIGHLIGHTS);
    for (const o of highlighted) if (!next.includes(o)) o.highlight = false;
    for (const o of next) o.highlight = true;
    highlighted = next;
  }

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
  function clearGhosts() {
    for (const list of ghostPool.values()) for (const o of list) o.visible = false;
    ghostUsed = new Map();
    pylonGhosts = [];
  }
  const YAW = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];

  /** The north-west tile for a building of size n centred under the pointer's tile. */
  const anchor = (t: { x: number; y: number }, n: number) => ({ x: t.x - Math.floor((n - 1) / 2), y: t.y - Math.floor((n - 1) / 2) });

  /**
   * Where a drag in build mode places things: a row of buildings along the drag's longer axis. Pylons are spaced so their
   * reaches meet edge to edge and each links to the next: a drag lays a power line.
   */
  function plan(type: BuildingId, from: { x: number; y: number }, to: { x: number; y: number }, rot: Dir) {
    const n = BUILDINGS[type].size, a = anchor(from, n), b = anchor(to, n);
    const step = type === 'pylon' ? PYLON_STEP : n;
    const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
    const steps = Math.floor((horizontal ? Math.abs(b.x - a.x) : Math.abs(b.y - a.y)) / step);
    const sx = horizontal ? Math.sign(b.x - a.x) * step : 0, sy = horizontal ? 0 : Math.sign(b.y - a.y) * step;
    return Array.from({ length: steps + 1 }, (_, i) => ({ x: a.x + sx * i, y: a.y + sy * i, rot }));
  }

  function showGhosts() {
    clearGhosts();
    cursor.visible = false;
    if (!hoverTile && !press) return;
    if (tool.kind === 'build') {
      const type = tool.type, n = BUILDINGS[type].size;
      const spots = press?.mode === 'paint' && press.from && press.to ? plan(type, press.from, press.to, tool.rot)
        : hoverTile ? [{ ...anchor(hoverTile, n), rot: tool.rot }] : [];
      let credits = state.credits;
      for (const sp of spots) {
        const okHere = canPlace(state, type, sp.x, sp.y).ok && credits >= BUILDINGS[type].cost;
        if (okHere && !state.scenario.sandbox) credits -= BUILDINGS[type].cost;
        if (type === 'pylon') pylonGhosts.push({ x: sp.x, y: sp.y, ok: okHere });
        const cx = sp.x + n / 2, cz = sp.y + n / 2;
        ghost(`frame ${okHere} ${n}`, (okHere ? models.frames.ok : models.frames.bad)[n - 1], cx, 0.03, cz);
        ghost(`b ${type}`, models.buildings[type].idle, cx, 0.04, cz, YAW[sp.rot], okHere);
      }
      // The silos' reach, the sprinklers' water and the bees' range; anything that makes, stores or uses power shows the
      // power networks.
      if (type === 'silo') overlayFor('silos');
      else if (type === 'sprinkler') overlayFor('water');
      else if (type === 'hive') overlayFor('bees');
      else if (usesPower(type)) overlayFor('power');
    } else if (tool.kind === 'remove' && press?.mode === 'paint' && press.from && press.to) {
      const x0 = Math.min(press.from.x, press.to.x), x1 = Math.max(press.from.x, press.to.x), y0 = Math.min(press.from.y, press.to.y), y1 = Math.max(press.from.y, press.to.y);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ghost('frame false 1', models.frames.bad[0], x + 0.5, 0.03, y + 0.5);
    } else if (hoverTile) {
      cursor.visible = true;
      cursor.setTransform(new THREE.Vector3(hoverTile.x + 0.5, 0.03, hoverTile.y + 0.5));
    }
  }
  let toolOverlay: Overlay = 'none';
  const overlayFor = (o: Overlay) => { toolOverlay = o; };
  /** Pylons being placed, for the power view. */
  let pylonGhosts: { x: number; y: number; ok: boolean }[] = [];

  // ---- Acting ----
  function act(x: number, y: number) {
    pointer = { x, y };
    pickHover();
    const t = hoverTile;
    switch (tool.kind) {
      case 'select': {
        selected = hoverBuilding;
        hud.refresh();
        return;
      }
      case 'build': {
        if (!t) return;
        const n = BUILDINGS[tool.type].size, a = anchor(t, n);
        const r = place(state, tool.type, a.x, a.y, tool.rot);
        if (r.message) hud.toast(r.message, r.ok);
        return;
      }
      case 'remove': {
        // The building under the pointer (it may stand in front of another's ground tile), else the tile's tree or rock.
        const hb = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
        if (!hb && !t) return;
        const r = hb ? remove(state, hb) : removeAt(state, t!.x, t!.y);
        if (r.message) hud.toast(r.message, r.ok);
        if (selected !== null && !buildingById(state, selected)) selected = null;
        return;
      }
    }
  }

  function applyDrag() {
    if (!press?.from || !press.to) return;
    if (tool.kind === 'build') {
      let built = 0, last = '';
      for (const sp of plan(tool.type, press.from, press.to, tool.rot)) {
        const r = place(state, tool.type, sp.x, sp.y, sp.rot);
        if (r.ok) built++; else if (r.message) last = r.message;
      }
      if (built) hud.toast(`Built ${built} × ${BUILDINGS[tool.type].name.toLowerCase()}.`, true);
      else if (last) hud.toast(last, false);
    } else if (tool.kind === 'remove') {
      const x0 = Math.min(press.from.x, press.to.x), x1 = Math.max(press.from.x, press.to.x), y0 = Math.min(press.from.y, press.to.y), y1 = Math.max(press.from.y, press.to.y);
      let n = 0;
      const seen = new Set<number>();
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const b = buildingAt(state, x, y);
        if (b) { if (seen.has(b.id) || b.type === 'depot') continue; seen.add(b.id); }
        if (removeAt(state, x, y).ok) n++;
      }
      if (n) hud.toast(`Removed ${n} thing${n > 1 ? 's' : ''}.`, true);
      if (selected !== null && !buildingById(state, selected)) selected = null;
    }
  }

  // ---- Input ----
  let press: { id: number; x: number; y: number; button: number; mode: 'click' | 'pan' | 'paint' | 'void'; from: { x: number; y: number } | null; to: { x: number; y: number } | null } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || press) return;
    pointer = { x: e.clientX, y: e.clientY };
    const t = tileAt(e.clientX, e.clientY);
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, button: e.button, mode: 'click', from: t, to: t };
    canvas.setPointerCapture(e.pointerId);
    repick = 2;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (press && e.pointerId === press.id) {
      const moved = Math.hypot(e.clientX - press.x, e.clientY - press.y) >= DRAG_THRESHOLD;
      if (press.mode === 'click' && moved) {
        const paints = press.button === 0 && !e.shiftKey && (tool.kind === 'build' || tool.kind === 'remove') && press.from;
        press.mode = paints ? 'paint' : 'pan';
        if (press.mode === 'pan') { canvas.style.cursor = 'grabbing'; pan(e.clientX - press.x, e.clientY - press.y); }
      } else if (press.mode === 'pan') pan(e.clientX - pointer!.x, e.clientY - pointer!.y);
      if (press.mode === 'paint') press.to = tileAt(e.clientX, e.clientY) ?? press.to;
    }
    if (e.isPrimary) { pointer = { x: e.clientX, y: e.clientY }; repick = 2; }
  });
  function release(e: PointerEvent) {
    if (!press || e.pointerId !== press.id) return;
    const p = press;
    press = null;
    canvas.style.cursor = '';
    if (e.type !== 'pointerup') return;
    if (p.mode === 'paint') { press = p; applyDrag(); press = null; }
    else if (p.mode === 'click') {
      if (p.button === 0) act(e.clientX, e.clientY);
      else if (p.button === 2) { if (tool.kind !== 'select') setTool({ kind: 'select' }); else selected = null; hud.refresh(); }
    }
    repick = 2;
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', (e) => { if (!press && e.isPrimary) { pointer = null; repick = 2; } });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  // Every WHEEL_STEP of wheel is one ZOOM_STEP (in proportion), towards the pointer. A trackpad pinch arrives as a wheel
  // with ctrlKey and small deltas, so it counts for more.
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY === 0) return;
    const delta = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY * (e.ctrlKey ? PINCH_GAIN : 1) : Math.sign(e.deltaY) * WHEEL_STEP;
    setZoom(zoomGoal * ZOOM_STEP ** (-delta / WHEEL_STEP), { x: e.clientX, y: e.clientY });
  }, { passive: false });

  const keys = new Set<string>();
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
    keys.add(e.code);
    if (e.code === 'Escape') {
      if (press?.mode === 'paint') { press.mode = 'void'; return; }
      if (hud.closeTop()) return;
      if (tool.kind !== 'select') { setTool({ kind: 'select' }); hud.refresh(); return; }
      if (selected !== null) { selected = null; hud.refresh(); return; }
      hud.openPause();
      return;
    }
    if (e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); paused = !paused; return; }
    if (e.code === 'Digit1') { speed = 1; paused = false; }
    if (e.code === 'Digit2') { speed = 2; paused = false; }
    if (e.code === 'Digit3') { speed = 4; paused = false; }
    if (e.code === 'KeyQ') turn(-1);
    if (e.code === 'KeyE') turn(1);
    if (e.code === 'KeyZ') zoomStep(e.shiftKey ? -1 : 1, pointer ?? undefined);
    if (e.code === 'Equal' || e.code === 'NumpadAdd') zoomStep(1, pointer ?? undefined);
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoomStep(-1, pointer ?? undefined);
    if (e.code === 'Tab') { e.preventDefault(); hud.toggleStats(); }
    if (e.code === 'KeyG') { hud.openGuide(); hud.refresh(); return; }
    if (e.code === 'KeyV') { const order: Overlay[] = ['none', 'fertility', 'power', 'silos', 'water', 'bees']; overlay = order[(order.indexOf(overlay) + 1) % order.length]; }
    if (e.code === 'KeyX') setTool(tool.kind === 'remove' ? { kind: 'select' } : { kind: 'remove' });
    if (e.code === 'KeyR' && tool.kind === 'build') { tool = { ...tool, rot: ((tool.rot + (e.shiftKey ? 3 : 1)) % 4) as Dir }; repick = 2; }
    const k = e.code.startsWith('Key') ? e.code.slice(3) : '';
    const hot = (Object.keys(BUILDINGS) as BuildingId[]).find((id) => BUILDINGS[id].key === k);
    if (hot) setTool(tool.kind === 'build' && tool.type === hot ? { kind: 'select' } : { kind: 'build', type: hot, rot: tool.kind === 'build' ? tool.rot : 1 });
    hud.refresh();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  /** One line about what's under the pointer. */
  function describeHover(): string | null {
    const b = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
    if (tool.kind === 'build' && hoverTile) {
      const n = BUILDINGS[tool.type].size, a = anchor(hoverTile, n), c = canPlace(state, tool.type, a.x, a.y);
      const head = `${BUILDINGS[tool.type].name} · ${state.scenario.sandbox ? 'free' : `${BUILDINGS[tool.type].cost} credits`}`;
      const soil = tool.type === 'field' ? ` · soil ${Math.round(avgSoil(a.x, a.y))}` : '';
      return `${head}${soil}${tool.type === 'pylon' && c.ok ? pylonNote(a.x, a.y) : ''}\n${c.ok ? `Click or drag to build${tool.type === 'pylon' ? ' (a drag lays a line)' : ''} · R turns` : c.message}`;
    }
    if (b) return `${BUILDINGS[b.type].name}: ${describeStatus(state, b)}${b.type === 'field' ? ` · soil ${Math.round(fieldFertility(state, b))}` : ''}`;
    if (!hoverTile) return null;
    const t = terrainAt(state, hoverTile.x, hoverTile.y);
    if (t === TERRAIN.water) return 'Water. Pylons can stand in it; drones fly over it.';
    if (t === TERRAIN.tree) return 'A tree: shelters wind turbines nearby. Remove (X) for 5 credits.';
    if (t === TERRAIN.rock) return 'Rock. Remove (X) for 15 credits.';
    return `Grass · soil fertility ${state.map.fertility[hoverTile.y * map.width + hoverTile.x]}`;
  }
  /** What a pylon placed at (x, y) would do: link to pylons, start a network, power buildings. */
  function pylonNote(x: number, y: number) {
    const links = pylonsInLink(state, x, y).length;
    const reaches = state.buildings.filter((b) => POWERED(b) && reachTo(b, x, y) <= POWER.pylon.reach).length;
    const link = links ? ` · links to ${links} pylon${links > 1 ? 's' : ''}` : state.buildings.some((b) => b.type === 'pylon') ? ` · no pylon within ${POWER.pylon.link}: a new network` : '';
    return `${link} · reaches ${reaches} building${reaches === 1 ? '' : 's'}`;
  }
  function avgSoil(x: number, y: number) {
    let sum = 0, n = 0;
    for (let ty = y; ty < y + 3; ty++) for (let tx = x; tx < x + 3; tx++) if (inMap(state, tx, ty)) { sum += state.map.fertility[ty * map.width + tx]; n++; }
    return n ? sum / n : 0;
  }

  // ---- Loop ----
  let last = performance.now(), time = 0, frameNo = 0, lookHour = Number.NaN, sinceSave = 0;
  let wasComplete = state.completedAt !== null;

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now; time += dt; frameNo++;

    if (!paused && !hud.modal) advance(state, dt * speed, MAX_STEPS_PER_FRAME);
    if (!wasComplete && state.completedAt !== null) {
      wasComplete = true;
      const medal = medalFor(state.scenario.par, state.completedAt);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(recordResult(readProgress(localStorage.getItem(PROGRESS_KEY)), state.scenario.id, medal, state.completedAt)));
      save();
      hud.showComplete(medal);
    }
    sinceSave += dt;
    if (sinceSave > AUTOSAVE_SECONDS) { sinceSave = 0; save(); }

    // Arrow keys pan.
    const kx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0), ky = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
    if (kx || ky) pan(-kx * dt * 600, -ky * dt * 600);

    const hour = hourAt(state.time);
    if (!(Math.abs(hour - lookHour) <= 0.02)) { renderer.setLook(lookAt(hour)); lookHour = hour; }

    view.sync(state);
    toolOverlay = 'none';
    if (pointer && frameNo % REPICK_FRAMES === 0) repick = Math.max(repick, 1);
    if (repick > 0) { repick--; pickHover(); }
    showGhosts();
    // A selected silo shows the silos' reach.
    if (toolOverlay === 'none' && selected !== null && buildingById(state, selected)?.type === 'silo') toolOverlay = 'silos';
    const shownOverlay = overlay !== 'none' ? overlay : toolOverlay;
    view.overlay(state, shownOverlay);
    const focus = selected ?? (tool.kind === 'select' ? hoverBuilding : null);
    view.links(state, focus);
    // Power shows only while you work with it: its overlay, placing something that uses power, selecting a building on a
    // network, or pointing at a pylon or something that makes or stores power.
    const hovered = tool.kind === 'select' && hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
    power.sync(state, {
      all: shownOverlay === 'power', tiles: shownOverlay === 'power',
      focus: selected ?? (hovered && POWER_BUILDINGS.has(hovered.type) ? hovered.id : null), ghosts: pylonGhosts,
    });
    hud.setNetLabels(power.labels().map((l) => ({ ...l, ...toScreen(l.x, l.y, l.z) })));
    const hi: number[] = [];
    if (selected !== null) hi.push(selected);
    if (hoverBuilding !== null && hoverBuilding !== selected && (tool.kind === 'select' || tool.kind === 'remove')) hi.push(hoverBuilding);
    highlight(hi);
    hud.setHover(describeHover());
    hud.update();

    turning();
    zooming(dt);
    // The view is as tall as the art at the zoom's screen pixels per metre.
    renderer.placeCamera(target, yaw, ELEVATION, renderer.height * pixelSize / zoom);
    renderer.renderGeometry(time);
    renderer.renderStyle(time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // For checks in the browser console and scripted playtests.
  Object.assign(window, { game: {
    get state() { return state; }, set state(s: GameState) { state = s; }, renderer, view, hud, sizeOf,
    /** Points the camera at a ground point, optionally at a zoom (screen pixels per metre). */
    look: (x: number, z: number, z0?: number) => { target.set(x, 0, z); clampTarget(); if (z0) { setZoom(z0); zoom = zoomGoal; } repick = 2; },
  } });
}
