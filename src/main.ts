import * as THREE from 'three';
import { lookAt, MAX_HIGHLIGHTS, PixelRenderer, quantizePalette, type PixelObject } from 'pixel3d-renderer';
import { beltPath, canPlace, linkPad, place, remove, removeAt, rotate } from './game/build.ts';
import { BUILDINGS, type BuildingId } from './game/data.ts';
import { TERRAIN } from './game/map.ts';
import { deserialize, readProgress, recordResult, saveKey, serialize } from './game/save.ts';
import { scenarioById } from './game/scenarios.ts';
import { advance, describeStatus, fieldFertility, hourAt, medalFor } from './game/sim.ts';
import { buildingAt, buildingById, inMap, newGame, sizeOf, terrainAt, type Dir, type GameState } from './game/state.ts';
import { Hud, type Tool } from './ui/hud.ts';
import { showMenu } from './ui/menu.ts';
import { allGeometries, loadModels } from './world/models.ts';
import { buildWorld } from './world/terrain.ts';
import { WorldView, type Overlay } from './world/view.ts';
import './ui/style.css';

// The game: owns the loop, the state, input and the camera, and each frame tells the renderer where everything is. It is
// build-only: the player places, turns, configures and removes buildings and the simulation runs on its own. The camera
// is orthographic at a 30° pitch, turns between four views 90° apart, zooms in whole art-pixel steps and pans with the mouse.

const ART_PX_PER_METRE = 16;
const PIXEL_SIZES = [1, 2, 3, 4, 6];  // screen pixels per art pixel, by zoom level
const ELEVATION = THREE.MathUtils.degToRad(30);
const HOME_YAW = THREE.MathUtils.degToRad(45);
const DRAG_THRESHOLD = 4;
const WHEEL_STEP = 100, WHEEL_GESTURE_GAP = 200;
const TURN_SECONDS = 0.3;
const REPICK_FRAMES = 6;
const AUTOSAVE_SECONDS = 30;
const MAX_STEPS_PER_FRAME = 80;

const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
const loading = document.querySelector<HTMLElement>('#loading')!;
const SAVE_KEY = saveKey(location.pathname), PROGRESS_KEY = `${SAVE_KEY}:progress`;

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
    zoom: () => setZoom((zoom + 1) % PIXEL_SIZES.length),
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
  let view4 = 0, zoom = 1;
  let yaw = HOME_YAW, turnFrom = HOME_YAW, turnAt = -Infinity;
  let repick = 2;
  const pixelSize = () => PIXEL_SIZES[zoom];
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
    const metres = 1 / (pixelSize() * ART_PX_PER_METRE);
    target.addScaledVector(right, -dx * metres).addScaledVector(forward, dy * metres / Math.sin(ELEVATION));
    target.x = THREE.MathUtils.clamp(target.x, 0, map.width);
    target.z = THREE.MathUtils.clamp(target.z, 0, map.height);
    repick = 2;
  }
  function setZoom(z: number) { zoom = z; fit(); }
  function fit() {
    const px = pixelSize();
    const w = Math.max(1, Math.ceil(innerWidth / px)), h = Math.max(1, Math.ceil(innerHeight / px));
    if (renderer.width !== w || renderer.height !== h) renderer.resize(w, h);
    canvas.style.width = `${w * px}px`; canvas.style.height = `${h * px}px`;
    repick = 2;
  }
  addEventListener('resize', fit);
  fit();

  // ---- Pointing ----
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  /** The map tile under a point of the page, on the ground plane (whatever stands there). */
  function tileAt(x: number, y: number): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect();
    ndc.set((x - rect.left) / rect.width * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    renderer.camera.updateMatrixWorld();
    raycaster.setFromCamera(ndc, renderer.camera);
    if (!raycaster.ray.intersectPlane(ground, hit)) return null;
    const t = { x: Math.floor(hit.x), y: Math.floor(hit.z) };
    return inMap(state, t.x, t.y) ? t : null;
  }

  let pointer: { x: number; y: number } | null = null;
  let hoverTile: { x: number; y: number } | null = null;
  let hoverBuilding: number | null = null;
  let highlighted: PixelObject[] = [];

  function pickHover() {
    if (!pointer) { hoverTile = null; hoverBuilding = null; return; }
    hoverTile = tileAt(pointer.x, pointer.y);
    const p = renderer.pick(pointer.x, pointer.y);
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
  }
  const YAW = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];

  /** The north-west tile for a building of size n centred under the pointer's tile. */
  const anchor = (t: { x: number; y: number }, n: number) => ({ x: t.x - Math.floor((n - 1) / 2), y: t.y - Math.floor((n - 1) / 2) });

  /** Where a drag in build mode places things: a belt line, or a row of buildings along the drag's longer axis. */
  function plan(type: BuildingId, from: { x: number; y: number }, to: { x: number; y: number }, rot: Dir) {
    if (type === 'belt') return beltPath(from, to, rot);
    const n = BUILDINGS[type].size, a = anchor(from, n), b = anchor(to, n);
    const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
    const steps = Math.floor((horizontal ? Math.abs(b.x - a.x) : Math.abs(b.y - a.y)) / n);
    const sx = horizontal ? Math.sign(b.x - a.x) * n : 0, sy = horizontal ? 0 : Math.sign(b.y - a.y) * n;
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
        const cx = sp.x + n / 2, cz = sp.y + n / 2;
        ghost(`frame ${okHere} ${n}`, (okHere ? models.frames.ok : models.frames.bad)[n - 1], cx, 0.03, cz);
        ghost(`b ${type}`, models.buildings[type].idle, cx, 0.04, cz, YAW[sp.rot], okHere);
      }
      // A pylon's reach, and the pylons it would link to.
      if (type === 'pylon' && spots.length === 1) overlayFor('power');
      if (type === 'sprinkler') overlayFor('water');
      if (type === 'hive') overlayFor('bees');
    } else if (tool.kind === 'remove' && press?.mode === 'paint' && press.from && press.to) {
      const x0 = Math.min(press.from.x, press.to.x), x1 = Math.max(press.from.x, press.to.x), y0 = Math.min(press.from.y, press.to.y), y1 = Math.max(press.from.y, press.to.y);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ghost('frame false 1', models.frames.bad[0], x + 0.5, 0.03, y + 0.5);
    } else if (hoverTile && tool.kind !== 'link') {
      cursor.visible = true;
      cursor.setTransform(new THREE.Vector3(hoverTile.x + 0.5, 0.03, hoverTile.y + 0.5));
    }
  }
  let toolOverlay: Overlay = 'none';
  const overlayFor = (o: Overlay) => { toolOverlay = o; };

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
      case 'link': {
        const pad = buildingById(state, tool.pad), dest = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
        if (pad && dest) { const r = linkPad(state, pad, dest); hud.toast(r.message, r.ok); if (r.ok) { setTool({ kind: 'select' }); selected = pad.id; } }
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
  let wheel = 0, wheelAt = -Infinity, wheelDone = false;
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.deltaY === 0) return;
    if (e.timeStamp - wheelAt > WHEEL_GESTURE_GAP || Math.sign(e.deltaY) !== Math.sign(wheel)) { wheel = 0; wheelDone = false; }
    wheelAt = e.timeStamp;
    if (wheelDone) return;
    wheel += e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY : Math.sign(e.deltaY) * WHEEL_STEP;
    if (Math.abs(wheel) < WHEEL_STEP) return;
    setZoom(THREE.MathUtils.clamp(zoom - Math.sign(wheel), 0, PIXEL_SIZES.length - 1));
    wheelDone = true;
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
    if (e.code === 'KeyZ') setZoom((zoom + 1) % PIXEL_SIZES.length);
    if (e.code === 'Tab') { e.preventDefault(); hud.toggleStats(); }
    if (e.code === 'KeyV') { const order: Overlay[] = ['none', 'fertility', 'power', 'water', 'bees']; overlay = order[(order.indexOf(overlay) + 1) % order.length]; }
    if (e.code === 'KeyX') setTool(tool.kind === 'remove' ? { kind: 'select' } : { kind: 'remove' });
    if (e.code === 'KeyR') {
      if (tool.kind === 'build') { tool = { ...tool, rot: ((tool.rot + (e.shiftKey ? 3 : 1)) % 4) as Dir }; repick = 2; }
      else if (selected !== null) { const b = buildingById(state, selected); if (b && BUILDINGS[b.type].directional) rotate(state, b); }
    }
    const k = e.code.startsWith('Key') ? e.code.slice(3) : '';
    const hot = (Object.keys(BUILDINGS) as BuildingId[]).find((id) => BUILDINGS[id].key === k);
    if (hot) setTool(tool.kind === 'build' && tool.type === hot ? { kind: 'select' } : { kind: 'build', type: hot, rot: tool.kind === 'build' ? tool.rot : 1 });
    hud.refresh();
  });
  addEventListener('keyup', (e) => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  /** One line about what's under the pointer. */
  function describeHover(): string | null {
    if (tool.kind === 'link') return 'Click a receiving pad or the depot to link. Esc cancels.';
    const b = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
    if (tool.kind === 'build' && hoverTile) {
      const n = BUILDINGS[tool.type].size, a = anchor(hoverTile, n), c = canPlace(state, tool.type, a.x, a.y);
      const head = `${BUILDINGS[tool.type].name} · ${state.scenario.sandbox ? 'free' : `${BUILDINGS[tool.type].cost} credits`}`;
      const soil = tool.type === 'field' ? ` · soil ${Math.round(avgSoil(a.x, a.y))}` : '';
      return `${head}${soil}\n${c.ok ? (BUILDINGS[tool.type].directional ? 'Click or drag to build · R turns' : 'Click or drag to build') : c.message}`;
    }
    if (b) return `${BUILDINGS[b.type].name}: ${describeStatus(state, b)}${b.type === 'field' ? ` · soil ${Math.round(fieldFertility(state, b))}` : ''}`;
    if (!hoverTile) return null;
    const t = terrainAt(state, hoverTile.x, hoverTile.y);
    if (t === TERRAIN.water) return 'Water. Belts, crossings and pylons can bridge it.';
    if (t === TERRAIN.tree) return 'A tree: shelters wind turbines nearby. Remove (X) for 5 credits.';
    if (t === TERRAIN.rock) return 'Rock. Remove (X) for 15 credits.';
    return `Grass · soil fertility ${state.map.fertility[hoverTile.y * map.width + hoverTile.x]}`;
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
    view.overlay(state, overlay !== 'none' ? overlay : toolOverlay);
    const hi: number[] = [];
    if (selected !== null) hi.push(selected);
    if (hoverBuilding !== null && hoverBuilding !== selected && (tool.kind === 'select' || tool.kind === 'link' || tool.kind === 'remove')) hi.push(hoverBuilding);
    if (tool.kind === 'link') hi.unshift(tool.pad);
    highlight(hi);
    hud.setHover(describeHover());
    hud.update();

    turning();
    renderer.placeCamera(target, yaw, ELEVATION, renderer.height / ART_PX_PER_METRE);
    renderer.renderGeometry(time);
    renderer.renderStyle(time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // For checks in the browser console and scripted playtests.
  Object.assign(window, { game: { get state() { return state; }, set state(s: GameState) { state = s; }, renderer, view, hud, sizeOf } });
}
