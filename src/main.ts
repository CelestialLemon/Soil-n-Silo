import * as THREE from 'three';
import { lookAt, MAX_HIGHLIGHTS, PixelRenderer, quantizePalette, type PixelObject } from 'pixel3d-renderer';
import { addStop, canPlace, clearPrice, messageOf, place, priceOf, remember, remove, removeAt, settingFor, settingName, stepSetting, type Setting } from './game/build.ts';
import { BUILDINGS, POWER, type BuildingId } from './game/data.ts';
import { generateLand, TERRAIN } from './game/map.ts';
import { deserialize, readProgress, recordResult, saveKey, serialize } from './game/save.ts';
import { scenarioById } from './game/scenarios.ts';
import { hourAt } from './game/sim/clock.ts';
import { fieldFertility } from './game/sim/soil.ts';
import { linksAt, linksOf } from './game/sim/goods.ts';
import { isStop, routeOf, routesAt } from './game/sim/trucks.ts';
import { medalFor } from './game/sim/stats.ts';
import { cargoText, describeStatus, describeTruck } from './game/sim/describe.ts';
import { advance } from './game/sim/step.ts';
import {
  buildingAt, buildingById, newGame, routeById, sizeOf, terrainAt, truckById, type Dir, type GameState, type Route,
} from './game/state.ts';
import { Input } from './input.ts';
import { Hud, type Tool } from './ui/hud.ts';
import { showMenu } from './ui/menu.ts';
import { watchScrollHints } from './ui/scrollHints.ts';
import { followKeys, actionOf, isHeld, keyNames } from './ui/keyhints.ts';
import { SettingsStore } from './ui/settings.ts';
import { truckName } from './ui/routing.ts';
import { statusLabel } from './ui/widgets.ts';
import type { Hover, MarkerSpot } from './ui/world.ts';
import { allGeometries, loadModels } from './world/models.ts';
import { PowerView } from './world/powerView.ts';
import { RouteView } from './world/routeView.ts';
import { Camera } from './world/camera.ts';
import { TileCursor } from './world/tileCursor.ts';
import { buildWorld, COUNTRY } from './world/terrain.ts';
import { WorldView, type Overlay } from './world/view.ts';
import './ui/clearday/tokens.css';
import './ui/clearday/clearday.css';
import './ui/clearday/icons.css';
import './ui/game.css';
import { must } from './game/result.ts';

// The game: owns the loop, the state, input and the camera, and each frame tells the renderer where everything is. It is
// build-only: the player places, configures and removes buildings and the simulation runs on its own. The camera
// is orthographic at a 30° pitch, turns between four views 90° apart, zooms towards the pointer and pans with the mouse.
//
// Each art pixel is drawn as a square of `pixelSize` screen pixels (a setting, 2 by default), whatever the zoom; zooming
// changes how many metres of ground fit on the screen, so models are drawn with more art pixels close up and fewer far out.

const REPICK_FRAMES = 6;
const AUTOSAVE_SECONDS = 30;
const MAX_STEPS_PER_FRAME = 80;
/** How long the pointer rests before the card about what is under it shows (ms). */
const HOVER_REST = 350;
/** How far apart a drag places pylons: their reaches meet edge to edge, and each links to the next. */
const PYLON_STEP = 2 * POWER.pylon.reach + 1;
/** Whether placing a building should show the power networks: it makes, stores, carries or uses power. */
const usesPower = (t: BuildingId) => !!BUILDINGS[t].grid || !!BUILDINGS[t].power;

const canvas = must(document.querySelector<HTMLCanvasElement>('#view'), '#view canvas');
const loading = must(document.querySelector<HTMLElement>('#loading'), '#loading');
const SAVE_KEY = saveKey(location.pathname), PROGRESS_KEY = `${SAVE_KEY}:progress`;
/** The settings. */
const settings = new SettingsStore(`${SAVE_KEY}:settings`);
followKeys(settings);

const loaded = deserialize(localStorage.getItem(SAVE_KEY));
const saved = loaded.ok ? loaded.value : null;
const params = new URLSearchParams(location.search);
/** A commission to start straight away (`?play=<id>`); an unknown id falls through to the menu or the saved game. */
const startId = params.get('play');
const startSc = startId ? scenarioById(startId) : null;

/** Set while the page leaves for a new commission, so the game being left doesn't save over the new one. */
let leaving = false;

/** Starts a new commission: saves it, then reloads into it (each map builds its own static world). */
function startNew(id: string) {
  const sc = scenarioById(id);
  if (!sc) return;
  leaving = true;
  localStorage.setItem(SAVE_KEY, serialize(newGame(sc)));
  location.href = location.pathname;
}

if (startId && startSc) startNew(startId);
else if (!saved || params.has('menu')) {
  loading.remove();
  showMenu(document.body, {
    saved, settings,
    progress: readProgress(localStorage.getItem(PROGRESS_KEY)),
    resume: () => { location.href = location.pathname; },
    start: startNew,
  });
} else {
  await play(saved);
}

watchScrollHints();

async function play(initial: GameState) {
  let state = initial;
  const map = state.map;
  const models = await loadModels();
  const world = buildWorld(map, generateLand(state.scenario, COUNTRY), models);
  quantizePalette([...world.geometries, ...allGeometries(models)], 96);
  const renderer = new PixelRenderer(canvas, world.scene, { shadowMapSize: 2048, warmHighlight: true });
  const view = new WorldView(renderer, models);
  const power = new PowerView(renderer, models);
  const routeView = new RouteView(renderer, models);
  const cursor = new TileCursor(canvas, 0xfff0c0);
  /** The tile the cursor frames, if any. */
  let cursorTile: { x: number; y: number } | null = null;
  loading.remove();

  let repick = 2;
  const camera = new Camera(renderer, canvas, settings, map, { x: map.depot.x + 1.5, z: map.depot.y - 4 }, () => { repick = 2; });

  let speed = 1, paused = false, overlay: Overlay = 'none';
  let tool: Tool = { kind: 'select' };
  let selected: number | null = null;
  /** The route under the pointer in the routes panel, drawn on the map. */
  let previewRoute: number | null = null;
  const save = () => { if (!leaving) localStorage.setItem(SAVE_KEY, serialize(state)); };
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  const hud = new Hud(document.body, {
    state: () => state,
    tool: () => tool,
    setTool: (t) => setTool(t),
    choose: (set) => choose(set),
    speed: () => (paused ? 0 : speed),
    setSpeed: (n) => { if (n === 0) paused = !paused; else { speed = n; paused = false; } },
    resume: () => { paused = false; },
    overlay: () => overlay,
    setOverlay: (o) => { overlay = overlay === o ? 'none' : o; },
    selected: () => selected,
    select: (id) => { selected = id; },
    changed: () => { repick = 2; },
    turn: (d) => camera.turn(d),
    zoom: (d) => camera.zoomStep(d),
    settings,
    menu: () => { save(); location.href = `${location.pathname}?menu`; },
    restart: () => startNew(state.scenario.id),
    start: (id) => { save(); startNew(id); },
    previewRoute: (id) => { previewRoute = id; },
    focus: (id) => {
      const b = buildingById(state, id);
      if (!b) return;
      if (tool.kind !== 'select') setTool({ kind: 'select' });
      selected = id;
      const n = sizeOf(b);
      camera.lookAt(b.x + n / 2, b.y + n / 2);
      hud.picked(id);
    },
  });
  if (state.time === 0) hud.showIntro();

  function setTool(t: Tool) {
    // A field or bakery comes up with the choice last made for it this level.
    if (t.kind === 'build') { const last = settingFor(state, t.type); t = { ...t, crop: t.crop ?? last.crop, recipe: t.recipe ?? last.recipe }; }
    tool = t;
    // Editing a route keeps what is selected (the truck or garage it was opened from).
    if (t.kind === 'build' || t.kind === 'remove') selected = null;
    clearGhosts();
    repick = 2;
  }

  /** Changes what the field or machine in hand is placed with, and remembers it for the level. */
  function choose(set: Setting) {
    if (tool.kind !== 'build') return;
    remember(state, tool.type, set);
    tool = { ...tool, ...settingFor(state, tool.type) };
    repick = 2;
  }

  let hoverTile: { x: number; y: number } | null = null;
  /** The building or truck under the pointer (their ids are one count). */
  let hoverBuilding: number | null = null;
  let highlighted: PixelObject[] = [];

  function pickHover() {
    if (!input.pointer) { hoverTile = null; hoverBuilding = null; return; }
    const p = renderer.pick(input.pointer.x, input.pointer.y);
    // A tree or rock under the input.pointer is its own tile (the ground point behind it is another tile).
    hoverTile = view.terrainOf(p?.object ?? null) ?? camera.tileAt(input.pointer.x, input.pointer.y);
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
    cursorTile = null;
    ghostLinks = [];
    if (!hoverTile && !input.press) return;
    if (tool.kind === 'build') {
      const type = tool.type, n = BUILDINGS[type].size;
      const spots = input.press?.mode === 'paint' && input.press.from && input.press.to ? plan(type, input.press.from, input.press.to, tool.rot)
        : hoverTile ? [{ ...anchor(hoverTile, n), rot: tool.rot }] : [];
      let credits = state.credits;
      // One building in hand shows who it would trade with next door.
      if (spots.length === 1 && canPlace(state, type, spots[0].x, spots[0].y).ok) {
        const l = linksAt(state, type, spots[0].x, spots[0].y, tool);
        ghostLinks = [...new Set([...l.from, ...l.to].map((x) => x.b.id))];
      }
      for (const sp of spots) {
        const okHere = canPlace(state, type, sp.x, sp.y).ok && credits >= priceOf(state, type);
        if (okHere) credits -= priceOf(state, type);
        if (type === 'pylon') pylonGhosts.push({ x: sp.x, y: sp.y, ok: okHere });
        const cx = sp.x + n / 2, cz = sp.y + n / 2;
        ghost(`frame ${okHere} ${n}`, (okHere ? models.frames.ok : models.frames.bad)[n - 1], cx, 0.03, cz);
        ghost(`b ${type}`, models.buildings[type].idle, cx, 0.04, cz, YAW[sp.rot], okHere);
        // A field shows its crop, grown enough to tell apart.
        if (type === 'field' && tool.crop) {
          const stages = models.crops[tool.crop], g = stages[Math.min(2, stages.length - 1)];
          for (let ty = sp.y; ty < sp.y + n; ty++) for (let tx = sp.x; tx < sp.x + n; tx++) ghost(`crop ${tool.crop}`, g, tx + 0.5, 0.06, ty + 0.5, 0, okHere);
        }
      }
      // The roads, the sprinklers' water and the bees' range; anything that makes, stores or uses power shows the power
      // networks.
      if (type === 'silo') overlayFor('roads');
      else if (type === 'sprinkler') overlayFor('water');
      else if (type === 'hive') overlayFor('bees');
      else if (usesPower(type)) overlayFor('power');
    } else if (tool.kind === 'remove' && input.press?.mode === 'paint' && input.press.from && input.press.to) {
      const x0 = Math.min(input.press.from.x, input.press.to.x), x1 = Math.max(input.press.from.x, input.press.to.x), y0 = Math.min(input.press.from.y, input.press.to.y), y1 = Math.max(input.press.from.y, input.press.to.y);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ghost('frame false 1', models.frames.bad[0], x + 0.5, 0.03, y + 0.5);
    } else if (hoverTile) {
      cursorTile = hoverTile;
    }
  }
  let toolOverlay: Overlay = 'none';
  const overlayFor = (o: Overlay) => { toolOverlay = o; };
  /** The buildings next door that the building in hand would trade with, tinted. */
  let ghostLinks: number[] = [];
  /** Pylons being placed, for the power view. */
  let pylonGhosts: { x: number; y: number; ok: boolean }[] = [];

  // ---- Acting ----
  function act(x: number, y: number) {
    input.pointer = { x, y };
    pickHover();
    const t = hoverTile;
    switch (tool.kind) {
      case 'select': {
        selected = hoverBuilding;
        hud.picked(selected);
        return;
      }
      case 'route': {
        // Clicking a building adds it as the route's next stop.
        const r = routeById(state, tool.route), b = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
        if (!r) { setTool({ kind: 'select' }); return; }
        if (!b) return;
        const res = addStop(state, r, b), message = messageOf(res);
        if (message) hud.toast(message, res.ok);
        hud.refresh();
        return;
      }
      case 'build': {
        if (!t) return;
        const n = BUILDINGS[tool.type].size, a = anchor(t, n);
        const r = place(state, tool.type, a.x, a.y, tool.rot, tool), message = messageOf(r);
        if (message) hud.toast(r.ok && priceOf(state, tool.type) ? `${message.replace(/\.$/, '')} · −${priceOf(state, tool.type)} credits` : message, r.ok, r.ok ? tool.type : undefined);
        return;
      }
      case 'remove': {
        // The building under the pointer (it may stand in front of another's ground tile), else the tile's tree or rock.
        const hb = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
        const r = hb ? remove(state, hb) : t ? removeAt(state, t.x, t.y) : null;
        if (!r) return;
        const message = messageOf(r);
        if (message) hud.toast(message, r.ok);
        if (selected !== null && !buildingById(state, selected) && !truckById(state, selected)) selected = null;
        return;
      }
    }
  }

  function applyDrag(from: { x: number; y: number }, to: { x: number; y: number }) {
    if (tool.kind === 'build') {
      let built = 0, last = '';
      for (const sp of plan(tool.type, from, to, tool.rot)) {
        const r = place(state, tool.type, sp.x, sp.y, sp.rot, tool);
        if (r.ok) built++; else if (r.error) last = r.error;
      }
      const what = settingName(tool);
      if (built) hud.toast(`Built ${built} × ${BUILDINGS[tool.type].name.toLowerCase()}${what ? ` (${what})` : ''}`, true, tool.type);
      else if (last) hud.toast(last, false);
    } else if (tool.kind === 'remove') {
      const x0 = Math.min(from.x, to.x), x1 = Math.max(from.x, to.x), y0 = Math.min(from.y, to.y), y1 = Math.max(from.y, to.y);
      let n = 0;
      const seen = new Set<number>();
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const b = buildingAt(state, x, y);
        if (b) { if (seen.has(b.id) || b.type === 'depot') continue; seen.add(b.id); }
        if (removeAt(state, x, y).ok) n++;
      }
      if (n) hud.toast(`Removed ${n} thing${n > 1 ? 's' : ''}`, true, 'trash');
      if (selected !== null && !buildingById(state, selected) && !truckById(state, selected)) selected = null;
    }
  }

  // ---- Input ----
  const input = new Input(canvas, {
    tileAt: (x, y) => camera.tileAt(x, y),
    paints: () => tool.kind === 'build' || tool.kind === 'remove',
    pan: (dx, dy) => camera.pan(dx, dy),
    zoom: (steps, at) => camera.zoomStep(steps, at),
    repick: () => { repick = 2; },
    click: act,
    secondary: () => { if (tool.kind !== 'select') setTool({ kind: 'select' }); else selected = null; hud.refresh(); },
    drag: applyDrag,
    key: onKey,
  });

  /** A key press: what each key does in the game. */
  function onKey(e: KeyboardEvent) {
    const { pointer } = input;
    if (e.code === 'Escape') {
      // Closing the pause screen resumes, as its Esc hint says.
      if (hud.closeIf('pause')) { paused = false; return; }
      if (hud.closeTop()) return;
      if (tool.kind !== 'select') { setTool({ kind: 'select' }); hud.refresh(); return; }
      if (selected !== null) { selected = null; hud.refresh(); return; }
      hud.openPause();
      return;
    }
    if (e.repeat) return;
    // A control reached with the keyboard takes Space as a press; after a click, Space still does its game action.
    if (e.code === 'Space' && e.target instanceof HTMLElement && e.target !== document.body && e.target.matches(':focus-visible')) return;
    const action = actionOf(e.code);
    if (action === 'pause') {
      e.preventDefault();
      // On the pause screen the key resumes; another screen that stops the game (the briefing, the guide) ignores it, so closing
      // it can't leave the game paused unseen.
      if (hud.closeIf('pause')) paused = false; else if (!hud.modal) paused = !paused;
      return;
    }
    // The guide's key closes the guide it opened (the other keys stay blocked); typing in its search box never reaches here (input.ts).
    if (action === 'guide' && hud.closeIf('guide')) { hud.refresh(); return; }
    // A screen that stops the game (pause, briefing, guide, results) takes no game keys; they would act unseen behind it.
    if (hud.modal) return;
    // Tab would also move the focus, and Space press a focused button.
    if (action && (e.code === 'Tab' || e.code === 'Space')) e.preventDefault();
    switch (action) {
      case 'speed1': speed = 1; paused = false; break;
      case 'speed2': speed = 2; paused = false; break;
      case 'speed3': speed = 4; paused = false; break;
      case 'turnLeft': camera.turn(-1); break;
      case 'turnRight': camera.turn(1); break;
      // Shift with a letter key reverses it, as it does turning the building.
      case 'zoomIn': camera.zoomStep(e.shiftKey && e.code.startsWith('Key') ? -1 : 1, pointer ?? undefined); break;
      case 'zoomOut': camera.zoomStep(-1, pointer ?? undefined); break;
      case 'ledger': hud.toggleSheet('ledger'); break;
      case 'power': hud.toggleSheet('power'); break;
      case 'routes': hud.toggleRoutes(); break;
      case 'guide': hud.openGuide(); hud.refresh(); return;
      case 'overlay': { const order: Overlay[] = ['none', 'fertility', 'water', 'power', 'roads', 'bees']; overlay = order[(order.indexOf(overlay) + 1) % order.length]; break; }
      case 'choice': if (tool.kind === 'build') choose(stepSetting(tool.type, tool, e.shiftKey ? -1 : 1)); break;
      case 'remove': setTool(tool.kind === 'remove' ? { kind: 'select' } : { kind: 'remove' }); break;
      case 'rotate': if (tool.kind === 'build') { tool = { ...tool, rot: ((tool.rot + (e.shiftKey ? 3 : 1)) % 4) as Dir }; repick = 2; } break;
      default:
        if (action?.startsWith('build:')) {
          const hot = action.slice('build:'.length) as BuildingId;
          setTool(tool.kind === 'build' && tool.type === hot ? { kind: 'select' } : { kind: 'build', type: hot, rot: tool.kind === 'build' ? tool.rot : 1 });
        }
    }
    hud.refresh();
  }

  /** What is under the pointer, for the hover card (the building in hand has its placement card instead). */
  function describeHover(): Hover | null {
    const b = hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
    const truck = hoverBuilding !== null ? truckById(state, hoverBuilding) : null;
    if (tool.kind === 'build') return null;
    if (truck) { const r = routeOf(state, truck); return { title: r ? `Truck on ${r.name}` : 'Truck', icon: 'truck', text: describeTruck(state, truck) }; }
    if (tool.kind === 'route') {
      const r = routeById(state, tool.route);
      if (b && r) return { title: BUILDINGS[b.type].name, icon: b.type, text: isStop(b) ? `Click to add it as stop ${r.stops.length + 1} of ${r.name}.` : 'Trucks don\'t stop here.' };
      return r ? { title: `Editing ${r.name}`, icon: 'route', text: 'Click buildings to add stops. Esc when done.' } : null;
    }
    if (b) {
      const removing = tool.kind === 'remove', label = statusLabel(b, b.status, b.need), line = describeStatus(state, b);
      return {
        title: BUILDINGS[b.type].name, icon: b.type, status: { status: b.status, label },
        text: removing ? (b.type === 'depot' ? 'The depot stays.' : `Click to remove it (refund ${priceOf(state, b.type)}).`)
          : [line === label ? '' : line, b.type === 'field' ? `soil ${Math.round(fieldFertility(state, b))}` : ''].filter(Boolean).join(' · ') || undefined,
      };
    }
    if (!hoverTile) return null;
    const t = terrainAt(state, hoverTile.x, hoverTile.y), clear = (k: 'tree' | 'rock') => `${clearPrice(state, k)} credits to clear${keyNames('remove').length ? ` (${keyNames('remove').join(' or ')})` : ''}.`;
    if (t === TERRAIN.water) return { title: 'Water', icon: 'water', text: 'Pylons can stand in it; trucks drive round it.' };
    if (t === TERRAIN.tree) return { title: 'A tree', icon: 'sapling', text: `Shelters wind turbines nearby; counts towards soil health. ${clear('tree')}` };
    if (t === TERRAIN.rock) return { title: 'Rock', text: clear('rock') };
    return tool.kind === 'remove' ? null : { title: 'Grass', icon: 'soil', text: `Soil fertility ${state.map.fertility[hoverTile.y * map.width + hoverTile.x]}.` };
  }
  /**
   * The routes to draw: the one being edited, a focused truck's, those of a focused garage's trucks or stopping at a focused
   * building, or (with the roads overlay) all of them. Stop numbers show when there is one route.
   */
  function shownRoutes(focus: number | null, all: boolean): { routes: Route[]; numbers: boolean } {
    const one = (r: Route | null) => ({ routes: r ? [r] : [], numbers: true });
    const preview = routeById(state, previewRoute);
    if (preview) return one(preview);
    if (tool.kind === 'route') return one(routeById(state, tool.route));
    const t = focus !== null ? truckById(state, focus) : null, b = focus !== null ? buildingById(state, focus) : null;
    if (t) return one(routeOf(state, t));
    let routes: Route[] = [];
    if (b?.type === 'garage') routes = state.routes.filter((r) => state.trucks.some((x) => x.garage === b.id && x.route === r.id));
    else if (b) routes = routesAt(state, b);
    if (all && !routes.length) routes = state.routes;
    return { routes, numbers: routes.length === 1 };
  }
  /**
   * The buildings and trucks to tint for what is focused: a truck's stops, a garage's trucks, the buildings next door a
   * building trades with (or would, while placing it).
   */
  function linkedTo(focus: number | null): number[] {
    if (tool.kind === 'build') return ghostLinks;
    const t = focus !== null ? truckById(state, focus) : null, b = focus !== null ? buildingById(state, focus) : null;
    if (t) return [...new Set(routeOf(state, t)?.stops.map((st) => st.building) ?? [])];
    if (b?.type === 'garage') return state.trucks.filter((x) => x.garage === b.id).map((x) => x.id);
    if (b) { const l = linksOf(state, b); return [...new Set([...l.from, ...l.to].map((x) => x.b.id))]; }
    return [];
  }

  /** The building in hand at the pointer, for its placement card: one building, or the row a drag would place. */
  function placeSpot() {
    if (tool.kind !== 'build' || !hoverTile || hud.modal) return null;
    const type = tool.type, n = BUILDINGS[type].size, a = anchor(hoverTile, n);
    const count = input.press?.mode === 'paint' && input.press.from && input.press.to ? plan(type, input.press.from, input.press.to, tool.rot).length : 1;
    return { type, x: a.x, y: a.y, count, crop: tool.crop, recipe: tool.recipe, ...camera.toScreen(a.x + n / 2, models.buildings[type].height + 0.3, a.y + n / 2) };
  }

  // ---- Loop ----
  let last = performance.now(), time = 0, frameNo = 0, lookHour = Number.NaN, sinceSave = 0;
  let wasComplete = state.completedAt !== null;

  function frame(now: number) {
    hud.perf.frame(now);
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

    // The pan keys (the arrows) pan, but not behind a screen that stops the game.
    if (hud.modal) input.keys.clear();
    const kx = (isHeld('panRight', input.keys) ? 1 : 0) - (isHeld('panLeft', input.keys) ? 1 : 0), ky = (isHeld('panDown', input.keys) ? 1 : 0) - (isHeld('panUp', input.keys) ? 1 : 0);
    if (kx || ky) camera.pan(-kx * dt * 600, -ky * dt * 600);

    const hour = hourAt(state.time);
    if (!(Math.abs(hour - lookHour) <= 0.02)) { renderer.setLook(lookAt(hour)); lookHour = hour; }

    view.sync(state);
    toolOverlay = 'none';
    if (input.pointer && frameNo % REPICK_FRAMES === 0) repick = Math.max(repick, 1);
    if (repick > 0) { repick--; pickHover(); }
    showGhosts();
    // Editing a route shows the roads.
    if (toolOverlay === 'none' && tool.kind === 'route') toolOverlay = 'roads';
    const shownOverlay = overlay !== 'none' ? overlay : toolOverlay;
    view.overlay(state, shownOverlay);
    const focus = selected ?? (tool.kind === 'select' ? hoverBuilding : null);
    const shown = shownRoutes(focus, shownOverlay === 'roads');
    view.links(linkedTo(focus));
    routeView.sync(state, shown.routes, shown.numbers);
    // Tags over the trucks of the one route being edited or pointed at.
    const tagged = shown.numbers && (tool.kind === 'route' || previewRoute !== null) ? shown.routes[0] : null;
    hud.world.setTruckTags(tagged ? state.trucks.filter((t) => t.route === tagged.id).map((t) => {
      const to = t.target !== null ? buildingById(state, t.target) : null;
      const where = t.phase === 'drive' && to ? `to the ${BUILDINGS[to.type].name.toLowerCase()}` : t.phase === 'dock' || t.phase === 'queue' ? `at the ${to ? BUILDINGS[to.type].name.toLowerCase() : 'stop'}` : t.phase === 'charge' || t.phase === 'parked' ? 'charging' : 'stuck';
      return { id: t.id, name: truckName(state, t), what: `${where}${t.cargo.length ? ` · ${cargoText(t.cargo)}` : ''}`, ...camera.toScreen(t.x, 0.9, t.y) };
    }) : []);
    hud.world.setStopLabels(routeView.labels().map((l) => ({ ...l, ...camera.toScreen(l.x, l.y, l.z) })));
    // Power shows only while you work with it: its overlay, placing something that uses power, selecting a building on a
    // network, or pointing at a pylon or something that makes or stores power.
    const hovered = tool.kind === 'select' && hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
    power.sync(state, {
      all: shownOverlay === 'power' || (tool.kind === 'build' && usesPower(tool.type)), tiles: shownOverlay === 'power',
      focus: selected ?? (hovered && BUILDINGS[hovered.type].grid ? hovered.id : null), ghosts: pylonGhosts,
    });
    hud.world.setNetLabels(power.labels().map((l) => ({ ...l, ...camera.toScreen(l.x, l.y, l.z) })));
    hud.world.setMarkers(view.markerSpots(state).map((m): MarkerSpot => ({ id: m.id, status: m.status, ...camera.toScreen(m.x, m.y, m.z) })));
    const hi: number[] = [];
    if (selected !== null) hi.push(selected);
    if (hoverBuilding !== null && hoverBuilding !== selected && (tool.kind === 'select' || tool.kind === 'remove')) hi.push(hoverBuilding);
    highlight(hi);
    const resting = !!input.pointer && !input.press && (performance.now() - input.movedAt > HOVER_REST || tool.kind === 'route');
    hud.world.setHover(resting ? describeHover() : null, input.pointer);
    hud.world.setPlacement(state, placeSpot());
    hud.update();

    camera.update(time, dt);
    renderer.renderGeometry(time);
    renderer.renderStyle(time);
    cursor.draw(cursorTile, renderer.camera, renderer.width, renderer.height);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // For checks in the browser console and scripted playtests.
  Object.assign(window, { game: {
    get state() { return state; }, set state(s: GameState) { state = s; }, renderer, view, hud, sizeOf,
    /** Runs the simulation on by `seconds` of play at once. */
    advance: (seconds: number) => advance(state, seconds),
    /** Points the camera at a ground point, optionally at a zoom (screen pixels per metre). */
    look: (x: number, z: number, z0?: number) => camera.lookAt(x, z, z0),
  } });
}
