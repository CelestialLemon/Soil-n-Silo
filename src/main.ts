import {
  addStop, canPlace, canReshape, type Groundwork, digArea, levelledFor, type Dig, clearPrice, earthPrice, EARTHWORK_NAMES, EARTHWORKS, messageOf, place, placePrice, priceOf, remember, remove, removeAt, reshape, settingFor, settingName, stepSetting, type Setting,
} from './game/build.ts';
import { BUILDINGS, CROPS, drawsPower, POWER, type BuildingId } from './game/data.ts';
import { holdNeed, truckHold } from './game/hold.ts';
import { frostComes, HOLLOW_FACT, inHollow, isHollow } from './game/frost.ts';
import { insideFact, insideNow, warmthFact, warmthOf } from './game/warmth.ts';
import { TERRAIN } from './game/map.ts';
import { aroundPoint, corners, sheetAt } from './game/relief.ts';
import { wheelSite } from './game/rules.ts';
import { deserialize, readProgress, recordResult, saveKey, serialize } from './game/save.ts';
import { scenarioById } from './game/scenarios.ts';
import { hourAt } from './game/sim/clock.ts';
import { fieldFertility, fieldGround } from './game/sim/soil.ts';
import { groundName, groundWords } from './game/ground.ts';
import { linksAt, linksOf } from './game/sim/goods.ts';
import { isStop, routeOf, routesAt } from './game/sim/trucks.ts';
import { medalFor } from './game/sim/stats.ts';
import { cargoText, describeStatus, describeTruck } from './game/sim/describe.ts';
import { advance } from './game/sim/step.ts';
import {
  buildingAt, buildingById, growsCrops, inMap, layoutOf, newGame, reliefOf, routeById, sizeOf, terrainAt, tileIndex, truckById, type Dir, type GameState, type Route,
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
import { CURSOR_GRID, type CursorPatch } from './world/tileCursor.ts';
import { type Overlay } from './world/view.ts';
import { pixelScene } from './world/pixelScene.ts';
import type { Scene } from './world/scene.ts';
import './ui/clearday/tokens.css';
import './ui/clearday/clearday.css';
import './ui/clearday/icons.css';
import './ui/game.css';
import { must, type Result } from './game/result.ts';

/** A spot a building in hand would go: its tile and the way it faces. */
interface Spot { x: number; y: number; rot: Dir }
/**
 * A spot as placing it would find it (`placed` in the game): its fit, price, whether it would be built, where a water wheel
 * would face, the height it stands at (m) and that of each of its tiles, row by row.
 */
interface Placed { spot: Spot; fit: Result<Groundwork>; price: number; built: boolean; site: { rot: Dir } | null; stand: number; tiles: number[] }

// The game: owns the loop, the state, input and the camera, and each frame tells the scene where everything is. It is
// build-only: the player places, configures and removes buildings and the simulation runs on its own. The camera
// is orthographic at a 30° pitch, turns between four views 90° apart, zooms towards the pointer and pans with the mouse.
//
// It draws through a Scene (world/scene.ts), never a renderer: the pixel world (world/pixelScene.ts) by default, brush3d's
// (world/brush/) with `?renderer=brush3d` until the swap (epic #212). Work on the brush3d world goes in world/brush/; this
// file only changes when the loop itself does.
const AUTOSAVE_SECONDS = 30;
const MAX_STEPS_PER_FRAME = 80;
/** How long the pointer rests before the card about what is under it shows (ms). */
const HOVER_REST = 350;
/** How far apart a drag places pylons: their reaches meet edge to edge, and each links to the next. */
const PYLON_STEP = 2 * POWER.pylon.reach + 1;
/** Whether placing a building should show the power networks: it makes, stores, carries or uses power. */
const usesPower = (t: BuildingId) => !!BUILDINGS[t].grid || drawsPower(t);

const canvas = must(document.querySelector<HTMLCanvasElement>('#view'), '#view canvas');
const loading = must(document.querySelector<HTMLElement>('#loading'), '#loading');
const SAVE_KEY = saveKey(location.pathname), PROGRESS_KEY = `${SAVE_KEY}:progress`;
const params = new URLSearchParams(location.search);
/**
 * Whether the game is drawn by brush3d (`?renderer=brush3d`) rather than the pixel renderer, until the swap (#211). Players
 * don't see it before then (epic #212): it's only reachable through the URL, and kept across the game's own reloads (`page`).
 */
const BRUSH = params.get('renderer') === 'brush3d';
/** The settings (the panel shows the pixel renderer's or brush3d's, whichever draws). */
const settings = new SettingsStore(`${SAVE_KEY}:settings`, BRUSH ? 'brush3d' : 'pixel');
followKeys(settings);

const loaded = deserialize(localStorage.getItem(SAVE_KEY));
const saved = loaded.ok ? loaded.value : null;
/**
 * The game's page again, with `query` (`?menu`). Drawn by brush3d, it keeps the page's other options too (the switch, and
 * a look PR's candidates, `?level=` and the like, which the brush3d world reads only once it loads), all but the game's
 * own `play` and `menu`.
 */
const page = (query = '') => {
  const q = new URLSearchParams(query);
  if (BRUSH) for (const [k, v] of params) if (k !== 'play' && k !== 'menu' && !q.has(k)) q.set(k, v);
  return `${location.pathname}${q.size ? `?${q}` : ''}`;
};
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
  location.href = page();
}

if (startId && startSc) startNew(startId);
else if (!saved || params.has('menu')) {
  loading.remove();
  showMenu(document.body, {
    saved, settings,
    progress: readProgress(localStorage.getItem(PROGRESS_KEY)),
    resume: () => { location.href = page(); },
    start: startNew,
  });
} else {
  await play(saved);
}

watchScrollHints();

async function play(initial: GameState) {
  let state = initial;
  const map = state.map;
  /** What is under the pointer may have changed (the pointer, the camera, the tool or the world moved): ask again. */
  let repick = true;
  const start = { x: map.depot.x + 1.5, z: map.depot.y - 4 }, changed = () => { repick = true; };
  // brush3d comes in its own chunk, so the pixel game never loads it.
  const scene: Scene = BRUSH ? (await import('./world/brush/scene.ts')).brushScene(state, canvas, settings, start, changed)
    : await pixelScene(state, canvas, settings, start, changed);
  const { camera, heights, picker, preview } = scene;
  /** The ground's height at a point of the map, for picking a tile; nothing on the map stands above heights.top. */
  const groundAt = (x: number, z: number) => heights.at(x, z), TOP = heights.top;
  /** The same for picking: no ground off the map, so a line of sight from beyond meets the map's edge, or its cliff. */
  const pickGround = (x: number, z: number) => (x >= 0 && z >= 0 && x < map.width && z < map.height ? groundAt(x, z) : -Infinity);
  /** The marks on the ground the cursor draws: the tile pointed at, the points earthworks would move; those refused in red. */
  let marks: CursorPatch[] = [], refusedMarks: CursorPatch[] = [];
  loading.remove();

  let speed = 1, paused = false, overlay: Overlay = 'none';
  // Switching the testing speeds off while at one drops to the top normal speed.
  settings.listen((s) => { if (!s.fastSpeeds && speed > 4) speed = 4; });
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
    changed: () => { repick = true; },
    turn: (d) => camera.turn(d),
    zoom: (d) => camera.zoomStep(d),
    settings,
    menu: () => { save(); location.href = page('menu'); },
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
    if (t.kind === 'build' || t.kind === 'remove' || t.kind === 'earth') selected = null;
    clearGhosts();
    repick = true;
  }

  /** Changes what the field or machine in hand is placed with, and remembers it for the level. */
  function choose(set: Setting) {
    if (tool.kind !== 'build') return;
    remember(state, tool.type, set);
    tool = { ...tool, ...settingFor(state, tool.type) };
    repick = true;
  }

  let hoverTile: { x: number; y: number } | null = null;
  /** The point of the ground (a corner of the hovered tile) nearest the pointer, for earthworks. */
  let hoverPoint: { x: number; y: number } | null = null;

  /** The tile under a page point, and the corner of it (as a grid point) nearest the point of the ground there. */
  function pointAt(x: number, y: number, tile = camera.tileAt(x, y, pickGround, TOP)) {
    const g = camera.pointOnGround(x, y, pickGround, TOP);
    return tile && g ? { x: tile.x + (g.x - tile.x >= 0.5 ? 1 : 0), y: tile.y + (g.y - tile.y >= 0.5 ? 1 : 0) } : null;
  }
  /** The building or truck under the pointer (their ids are one count). */
  let hoverBuilding: number | null = null;
  /** The tile of ground under the pointer this frame, for the next pick's answer. */
  let groundTile: { x: number; y: number } | null = null;

  /**
   * What is under the pointer now. The tile and the point of the ground come from the pointer and the camera as they are,
   * so the cursor keeps up with the pointer; what stands there (a building, a truck, a tree) comes from the last pick, which
   * can be a frame or two old.
   */
  function hoverNow() {
    const at = input.pointer;
    if (!at) { hoverTile = hoverPoint = groundTile = null; hoverBuilding = null; picker.forget(); return; }
    groundTile = camera.tileAt(at.x, at.y, pickGround, TOP);
    const under = picker.under(state, at, groundTile);
    hoverTile = under.tile;
    hoverPoint = pointAt(at.x, at.y, hoverTile);
    hoverBuilding = under.building;
  }

  /** What is under the pointer now, waiting for the GPU: for a click, which acts on what it lands on. */
  function pickNow() {
    const at = input.pointer;
    if (at) picker.now(at, camera.tileAt(at.x, at.y, pickGround, TOP));
    hoverNow();
  }

  /**
   * Asks again what is under the pointer, as of the picture just drawn, without waiting for the GPU: the answer comes a frame
   * or two later. With a pick still on its way it waits for that one; with no pointer there is nothing under it.
   */
  function repickHover() {
    if (!input.pointer) { picker.forget(); repick = false; return; }
    if (picker.request({ ...input.pointer }, groundTile, () => !!input.pointer)) repick = false;
  }

  // ---- Ghosts: what would be built ----
  function clearGhosts() {
    preview.clear();
    pylonGhosts = [];
  }

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
    marks = []; refusedMarks = [];
    ghostLinks = [];
    if (!hoverTile && !input.press) return;
    if (tool.kind === 'build') {
      const type = tool.type, n = BUILDINGS[type].size;
      const spots = input.press?.mode === 'paint' && input.press.from && input.press.to ? plan(type, input.press.from, input.press.to, tool.rot)
        : hoverTile ? [{ ...anchor(hoverTile, n), rot: tool.rot }] : [];
      // One building in hand shows who it would trade with next door.
      const one = spots.length === 1 ? canPlace(state, type, spots[0].x, spots[0].y) : null;
      if (one?.ok) {
        // On the ground as it will be once levelled.
        const { x, y } = spots[0], set = tool, l = levelledFor(state, one.value.move, () => linksAt(state, type, x, y, set));
        ghostLinks = [...new Set([...l.from, ...l.to].map((x) => x.b.id))];
      }
      for (const { spot: sp, built: okHere, site, stand: base, tiles } of placed(type, spots)) {
        if (type === 'pylon') pylonGhosts.push({ x: sp.x, y: sp.y, ok: okHere });
        // It stands where the ground would be levelled to, or on the ground as it lies.
        const cx = sp.x + n / 2, cz = sp.y + n / 2;
        preview.frame(n, okHere, cx, base, cz);
        // A water wheel turns to face the river, as it will once placed.
        preview.building(type, cx, base, cz, site ? site.rot : sp.rot, okHere);
        // A field or a greenhouse shows its crop, grown enough to tell apart.
        if (growsCrops({ type }) && tool.crop) {
          const crop = tool.crop;
          tiles.forEach((h, i) => preview.crop(crop, sp.x + (i % n) + 0.5, h, sp.y + Math.floor(i / n) + 0.5, okHere));
        }
      }
    } else if (tool.kind === 'remove' && input.press?.mode === 'paint' && input.press.from && input.press.to) {
      const x0 = Math.min(input.press.from.x, input.press.to.x), x1 = Math.max(input.press.from.x, input.press.to.x), y0 = Math.min(input.press.from.y, input.press.to.y), y1 = Math.max(input.press.from.y, input.press.to.y);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) preview.frame(1, false, x + 0.5, groundAt(x + 0.5, y + 0.5), y + 0.5);
    } else if (tool.kind === 'earth') {
      // The points the dig would move (or the tiles it would level, framed), marked in the cursor's colour if it can be
      // done, else red where it was asked.
      const d = digHere();
      if (d) {
        const fit = canReshape(state, d), area = digArea(d), into = new Map<number, CursorPatch>();
        const mark = (x: number, y: number, edges: number, dot?: number) => {
          const i = tileIndex(state, x, y), p = into.get(i) ?? patch(x, y, 0, []);
          p.edges |= edges;
          if (dot !== undefined && !p.dots.includes(dot)) p.dots.push(dot);
          into.set(i, p);
        };
        if (d.how === 'level') {
          // A frame round the area, its sides on the area's edge.
          for (let y = area.y; y < area.y + area.h; y++) for (let x = area.x; x < area.x + area.w; x++) {
            if (inMap(state, x, y)) mark(x, y, (y === area.y ? 1 : 0) | (x === area.x + area.w - 1 ? 2 : 0) | (y === area.y + area.h - 1 ? 4 : 0) | (x === area.x ? 8 : 0));
          }
        }
        if (fit.ok) {
          // The corners it sets, outside a levelled area (the ground round it following).
          const inArea = (x: number, y: number) => d.how === 'level' && x >= area.x && y >= area.y && x < area.x + area.w && y < area.y + area.h;
          for (const [c] of fit.value.move.set) {
            const i = c >> 2, x = i % state.map.width, y = Math.floor(i / state.map.width);
            if (!inArea(x, y)) mark(x, y, 0, c & 3);
          }
        } else if (d.how !== 'level') {
          // The ground at the points it was asked to move: as canReshape starts, on the tile pointed at or those inside.
          const one = d.from.x === d.to.x && d.from.y === d.to.y;
          for (let py = Math.min(d.from.y, d.to.y); py <= Math.max(d.from.y, d.to.y); py++) for (let px = Math.min(d.from.x, d.to.x); px <= Math.max(d.from.x, d.to.x); px++) {
            const starts = aroundPoint(state.map, px, py).filter((t) => (one ? t.x === d.at.x && t.y === d.at.y : t.x >= area.x && t.y >= area.y && t.x < area.x + area.w && t.y < area.y + area.h) && terrainAt(state, t.x, t.y) !== TERRAIN.water);
            for (const start of starts) for (const t of sheetAt(state.map, px, py, start)) if (terrainAt(state, t.x, t.y) !== TERRAIN.water) mark(t.x, t.y, 0, t.k);
          }
        }
        if (fit.ok) marks = [...into.values()]; else refusedMarks = [...into.values()];
      }
      overlayFor('height');
    } else if (hoverTile) {
      marks = [patch(hoverTile.x, hoverTile.y, 15, [])];
    }
  }
  /**
   * What placing `spots` would do, one after another as a drag places them (applyDrag): each one's fit and price on the
   * ground and credits the ones before it leave, whether it would be built, and where a water wheel would face. Worked out on
   * a copy of the game, as levelling for one can slope the ground under the next; remembered until the spots or the game
   * change.
   */
  function placed(type: BuildingId, spots: Spot[]): Placed[] {
    const key = `${type} ${tool.kind === 'build' ? `${tool.crop ?? ''} ${tool.recipe ?? ''}` : ''} ${JSON.stringify(spots)} ${reliefOf(state)} ${layoutOf(state)} ${state.credits}`;
    if (placedFor?.key === key) return placedFor.out;
    const read = spots.length > 1 ? deserialize(serialize(state)) : null;
    const s = read?.ok ? read.value : state, set = tool.kind === 'build' ? tool : {};
    const n = BUILDINGS[type].size;
    const out = spots.map((spot) => {
      // Judged as if credits were no object, so a spot the credits left can't pay for is still priced with its earthworks.
      const credits = s.credits;
      s.credits = Infinity;
      let fit: Result<Groundwork>;
      try { fit = canPlace(s, type, spot.x, spot.y); } finally { s.credits = credits; }
      const price = fit.ok ? placePrice(s, type, fit.value) : priceOf(s, type), level = fit.ok ? fit.value.level : null;
      const site = BUILDINGS[type].onBank && fit.ok ? levelledFor(s, fit.value.move, () => wheelSite(s, spot.x, spot.y)) : null;
      // Where it and its tiles would stand: on the level its ground is levelled to, or on the ground as the ones before leave it.
      const stand = level !== null ? heights.level(level) : heights.stand(s.map, n, spot.x, spot.y);
      const tiles = Array.from({ length: n * n }, (_, i) => (level !== null ? heights.level(level) : groundAt(spot.x + (i % n) + 0.5, spot.y + Math.floor(i / n) + 0.5)));
      const built = fit.ok && s.credits >= price && (s === state || place(s, type, spot.x, spot.y, spot.rot, set).ok);
      return { spot, fit, price, built, site, stand, tiles };
    });
    placedFor = { key, out };
    return out;
  }
  let placedFor: { key: string; out: Placed[] } | null = null;
  /** The cursor's marks on a tile: a frame along its sides `edges` (CursorPatch), and dots at its corners `dots`. */
  const patch = (x: number, y: number, edges: number, dots: number[]): CursorPatch =>
    ({ x, y, heights: Array.from({ length: (CURSOR_GRID + 1) ** 2 }, (_, i) => heights.tile(x, y, (i % (CURSOR_GRID + 1)) / CURSOR_GRID, Math.floor(i / (CURSOR_GRID + 1)) / CURSOR_GRID)), edges, dots });
  /** The dig the earthworks in hand would do: over the drag's points, or at the point pointed at. */
  function digHere(): Dig | null {
    if (tool.kind !== 'earth' || !hoverTile) return null;
    const press = input.press?.mode === 'paint' ? input.press : null;
    const from = press?.from ?? hoverPoint, to = press?.to ?? hoverPoint;
    return from && to ? { how: tool.how, from, to, at: hoverTile } : null;
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
    pickNow();
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
        const n = BUILDINGS[tool.type].size, a = anchor(t, n), before = state.credits;
        const r = place(state, tool.type, a.x, a.y, tool.rot, tool), message = messageOf(r);
        if (message) hud.toast(r.ok && before > state.credits ? `${message.replace(/\.$/, '')} · −${before - state.credits} credits` : message, r.ok, r.ok ? tool.type : undefined);
        return;
      }
      case 'earth': {
        const d = digHere();
        if (!d) return;
        const r = reshape(state, d), message = messageOf(r);
        if (message) hud.toast(message, r.ok, r.ok ? 'earth' : undefined);
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
    } else if (tool.kind === 'earth') {
      // The tile the drag ends on, from the pointer as it is now.
      pickNow();
      if (!hoverTile) return;
      const r = reshape(state, { how: tool.how, from, to, at: hoverTile });
      if (r.ok) hud.toast(`${EARTHWORK_NAMES[tool.how]}: ${r.value.steps} step${r.value.steps > 1 ? 's' : ''} · −${earthPrice(state, r.value.steps)} credits`, true, 'earth');
      else if (r.error) hud.toast(r.error, false);
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
    // Earthworks drag over the points of the ground, the rest over tiles.
    tileAt: (x, y) => (tool.kind === 'earth' ? pointAt(x, y) : camera.tileAt(x, y, pickGround, TOP)),
    paints: () => tool.kind === 'build' || tool.kind === 'remove' || tool.kind === 'earth',
    pan: (dx, dy) => camera.pan(dx, dy),
    zoom: (steps, at) => camera.zoomStep(steps, at),
    repick: () => { repick = true; },
    // What is under the pointer may change with what a click or a drag builds, removes or reshapes.
    click: (x, y) => { act(x, y); repick = true; },
    secondary: () => { if (tool.kind !== 'select') setTool({ kind: 'select' }); else selected = null; hud.refresh(); },
    drag: (from, to) => { applyDrag(from, to); repick = true; },
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
      case 'forecast': hud.toggleForecast(); break;
      case 'routes': hud.toggleRoutes(); break;
      case 'guide': hud.openGuide(); hud.refresh(); return;
      case 'overlay': { const order: Overlay[] = ['none', 'fertility', 'ground', 'height', 'water', 'power', 'roads', 'bees']; overlay = order[(order.indexOf(overlay) + 1) % order.length]; break; }
      case 'choice':
        if (tool.kind === 'build') choose(stepSetting(tool.type, tool, e.shiftKey ? -1 : 1));
        else if (tool.kind === 'earth') { tool = { ...tool, how: EARTHWORKS[(EARTHWORKS.indexOf(tool.how) + (e.shiftKey ? 2 : 1)) % 3] }; repick = true; }
        break;
      case 'earth': setTool(tool.kind === 'earth' ? { kind: 'select' } : { kind: 'earth', how: 'raise' }); break;
      case 'remove': setTool(tool.kind === 'remove' ? { kind: 'select' } : { kind: 'remove' }); break;
      case 'rotate': if (tool.kind === 'build') { tool = { ...tool, rot: ((tool.rot + (e.shiftKey ? 3 : 1)) % 4) as Dir }; repick = true; } break;
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
    if (tool.kind === 'earth') {
      const d = digHere();
      if (!d || !hoverTile || !hoverPoint) return null;
      const r = canReshape(state, d), c = corners(state.map, hoverTile.x, hoverTile.y);
      const k = [[0, 3], [1, 2]][hoverPoint.x - hoverTile.x][hoverPoint.y - hoverTile.y];
      const now = d.how === 'level' ? `This tile is at level ${c.join(', ')} at its corners.` : `The ground here is at level ${c[k]}.`;
      const then = r.ok ? ` ${d.how === 'level' ? `Levels it to ${r.value.level}` : `${EARTHWORK_NAMES[d.how]}s it to ${r.value.level}`}: ${r.value.move.steps} step${r.value.move.steps > 1 ? 's' : ''}, ${earthPrice(state, r.value.move.steps)} credits.` : r.error ? ` ${r.error}` : '';
      return { title: EARTHWORK_NAMES[tool.how], icon: 'earth', text: now + then };
    }
    if (truck) { const r = routeOf(state, truck); return { title: r ? `Truck on ${r.name}` : 'Truck', icon: 'truck', text: describeTruck(state, truck) }; }
    if (tool.kind === 'route') {
      const r = routeById(state, tool.route);
      if (b && r) return { title: BUILDINGS[b.type].name, icon: b.type, text: isStop(b) ? `Click to add it as stop ${r.stops.length + 1} of ${r.name}.` : 'Trucks don\'t stop here.' };
      return r ? { title: `Editing ${r.name}`, icon: 'route', text: 'Click buildings to add stops. Esc when done.' } : null;
    }
    if (b) {
      const removing = tool.kind === 'remove', label = statusLabel(b, b.status, b.need), line = describeStatus(state, b);
      return {
        title: BUILDINGS[b.type].name, icon: b.type, status: { status: b.status, label, need: b.need },
        text: removing ? (b.type === 'depot' ? 'The depot stays.' : `Click to remove it (refund ${priceOf(state, b.type)}).`)
          : [line === label ? '' : line, growsCrops(b) ? `ground ${groundWords(fieldGround(state, b))} · soil ${Math.round(fieldFertility(state, b))}` : '', growsCrops(b) && !removing ? (b.type === 'greenhouse' ? insideFact(insideNow(state, b), warmthOf(state)) : warmthFact(CROPS[b.crop], warmthOf(state)).text) : '', b.type === 'field' && !removing && frostComes(state) && inHollow(state, b.x, b.y) ? HOLLOW_FACT : ''].filter(Boolean).join(' · ') || undefined,
      };
    }
    if (!hoverTile) return null;
    const t = terrainAt(state, hoverTile.x, hoverTile.y), clear = (k: 'tree' | 'rock') => `${clearPrice(state, k)} credits to clear${keyNames('remove').length ? ` (${keyNames('remove').join(' or ')})` : ''}.`;
    if (t === TERRAIN.water) return { title: 'Water', icon: 'water', text: 'Pylons can stand in it; trucks drive round it.' };
    if (t === TERRAIN.tree) return { title: 'A tree', icon: 'sapling', text: `Shelters wind turbines nearby; counts towards soil health. ${clear('tree')}` };
    if (t === TERRAIN.rock) return { title: 'Rock', text: clear('rock') };
    return tool.kind === 'remove' ? null : { title: 'Grass', icon: 'soil', text: `${groundName(state.map.ground[hoverTile.y * map.width + hoverTile.x])} ground, soil fertility ${state.map.fertility[hoverTile.y * map.width + hoverTile.x]}.${frostComes(state) && isHollow(state, hoverTile.x, hoverTile.y) ? ` ${HOLLOW_FACT}.` : ''}` };
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
    const spots = input.press?.mode === 'paint' && input.press.from && input.press.to ? plan(type, input.press.from, input.press.to, tool.rot) : [{ ...a, rot: tool.rot }];
    // What they cost with the earthworks each needs, as placing them would charge.
    const price = placed(type, spots).reduce((sum, p) => sum + p.price, 0);
    return { type, x: a.x, y: a.y, count: spots.length, price, crop: tool.crop, recipe: tool.recipe, ...camera.toScreen(a.x + n / 2, heights.stand(state.map, n, a.x, a.y) + scene.heightOf(type) + 0.3, a.y + n / 2) };
  }

  hud.perf.attach(scene.report);

  // ---- Loop ----
  let last = performance.now(), time = 0, sinceSave = 0;
  let wasComplete = state.completedAt !== null;

  function frame(now: number) {
    hud.perf.frame(now);
    if (hud.perf.timing) hud.perf.begin();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now; time += dt;

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
    // The camera is placed before anything is picked or put on the page from it, so the tags and markers keep up as it moves.
    camera.update(time, dt);

    // The hour, the weather, the ground and the world, before anything is picked or the tools run.
    scene.sync(state, { dt, hour: hourAt(state.time), lines: tool.kind === 'build' || tool.kind === 'earth', speed });
    toolOverlay = 'none';
    // Something new shown or taken away, or a truck driving under the pointer, may change what is under it.
    if (picker.moved(state, input.pointer)) repick = true;
    hoverNow();
    showGhosts();
    // Editing a route shows the roads. Building shows the roads, the sprinklers' water or the bees' range; anything that
    // makes, stores or uses power shows the power networks, and anything else the height under the contour lines.
    if (toolOverlay === 'none' && tool.kind === 'route') toolOverlay = 'roads';
    if (toolOverlay === 'none' && tool.kind === 'build') {
      const type = tool.type;
      toolOverlay = type === 'silo' ? 'roads' : type === 'sprinkler' ? 'water' : type === 'hive' ? 'bees' : usesPower(type) ? 'power' : 'height';
    }
    const shownOverlay = overlay !== 'none' ? overlay : toolOverlay;
    const focus = selected ?? (tool.kind === 'select' ? hoverBuilding : null);
    const shown = shownRoutes(focus, shownOverlay === 'roads');
    // Power shows only while you work with it: its overlay, placing something that uses power, selecting a building on a
    // network, or pointing at a pylon or something that makes or stores power.
    const hovered = tool.kind === 'select' && hoverBuilding !== null ? buildingById(state, hoverBuilding) : null;
    const hi: number[] = [];
    if (selected !== null) hi.push(selected);
    if (hoverBuilding !== null && hoverBuilding !== selected && (tool.kind === 'select' || tool.kind === 'remove')) hi.push(hoverBuilding);
    scene.show(state, {
      overlay: shownOverlay,
      // The small things in the grass stand aside for the ground's lines and the overlays.
      details: shownOverlay === 'none' && tool.kind !== 'build' && tool.kind !== 'earth',
      links: linkedTo(focus), highlight: hi, routes: shown,
      power: {
        all: shownOverlay === 'power' || (tool.kind === 'build' && usesPower(tool.type)), tiles: shownOverlay === 'power',
        focus: selected ?? (hovered && BUILDINGS[hovered.type].grid ? hovered.id : null), ghosts: pylonGhosts,
      },
    });
    // Tags over the trucks of the one route being edited or pointed at.
    const tagged = shown.numbers && (tool.kind === 'route' || previewRoute !== null) ? shown.routes[0] : null;
    hud.world.setTruckTags(tagged ? state.trucks.filter((t) => t.route === tagged.id).map((t) => {
      const to = t.target !== null ? buildingById(state, t.target) : null;
      const where = t.phase === 'drive' && to ? `to the ${BUILDINGS[to.type].name.toLowerCase()}` : t.phase === 'dock' || t.phase === 'queue' ? `at the ${to ? BUILDINGS[to.type].name.toLowerCase() : 'stop'}` : t.phase === 'charge' || t.phase === 'parked' ? 'charging' : 'stuck';
      const at = scene.truckAt(t.id) ?? { x: t.x, z: t.y };
      return { id: t.id, name: truckName(state, t), what: `${where}${t.cargo.length ? ` · ${cargoText(t.cargo)}` : ''}`, ...camera.toScreen(at.x, groundAt(at.x, at.z) + 0.9, at.z) };
    }) : []);
    hud.world.setStopLabels(scene.stopLabels().map((l) => ({ ...l, ...camera.toScreen(l.x, l.y, l.z) })));
    hud.world.setNetLabels(scene.netLabels().map((l) => ({ ...l, ...camera.toScreen(l.x, l.y, l.z) })));
    // Trucks slowed by weather carry a marker too.
    const slowed = state.trucks.flatMap((t) => { const hold = truckHold(state, t), at = hold ? scene.truckAt(t.id) : null; return hold && at ? [{ id: t.id, status: 'weather' as const, need: holdNeed(hold), x: at.x, y: groundAt(at.x, at.z) + 1.3, z: at.z }] : []; });
    hud.world.setMarkers([...scene.markerSpots(state), ...slowed].map((m): MarkerSpot => ({ id: m.id, status: m.status, need: m.need, ...camera.toScreen(m.x, m.y, m.z) })));
    const resting = !!input.pointer && !input.press && (performance.now() - input.movedAt > HOVER_REST || tool.kind === 'route');
    hud.world.setHover(resting ? describeHover() : null, input.pointer);
    hud.world.setPlacement(state, placeSpot());
    hud.update();

    if (hud.perf.timing) hud.perf.mark();
    scene.render(time, {
      pick: () => { if (repick) repickHover(); },
      lap: (part) => { if (hud.perf.timing) hud.perf.lap(part); },
      marks, refused: refusedMarks,
    });
    if (hud.perf.timing) hud.perf.end();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // For checks in the browser console and scripted playtests.
  Object.assign(window, { game: {
    get state() { return state; }, set state(s: GameState) { state = s; }, ...scene.debug, scene, hud, sizeOf,
    /** Runs the simulation on by `seconds` of play at once. */
    advance: (seconds: number) => advance(state, seconds),
    /** Points the camera at a ground point, optionally at a zoom (screen pixels per metre). */
    look: (x: number, z: number, z0?: number) => camera.lookAt(x, z, z0),
  } });
}
