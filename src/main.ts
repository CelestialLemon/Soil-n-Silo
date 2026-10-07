import * as THREE from 'three';
import { lookAt, MAX_HIGHLIGHTS, PixelRenderer, quantizePalette, type PixelObject } from 'pixel3d-renderer';
import { collectEggs, collectManure, fillTrough, petChicken, toggleDoor, useOnArea, useOnTile, type Result, type TileAt } from './game/actions.ts';
import { hourOfDay } from './game/clock.ts';
import { CROPS, cropForSeed, daysToRipe, isRipe } from './game/crops.ts';
import { endDay, passTime } from './game/day.ts';
import { ITEMS, QUALITY_NAMES } from './game/items.ts';
import { at, DEPTH, FIELD_BOUNDS, isField, isOpenGrass, WIDTH } from './game/layout.ts';
import { canPlace, collect, isReady, isRunning, MACHINE_NAMES, placeMachine, recipe } from './game/machines.ts';
import { deserialize, SAVE_KEY, serialize } from './game/save.ts';
import { held, newGame, tileAt, type GameState } from './game/state.ts';
import { Ui } from './ui/ui.ts';
import { buildFarm } from './world/farm.ts';
import { allGeometries, loadModels, SOIL_TOP } from './world/models.ts';
import { FarmView, type Target } from './world/view.ts';
import './ui/style.css';

// The game: owns the loop, the state, input and the camera, and each frame tells the renderer where everything is. The
// game is point-and-click with no player character: a click on a field tile uses what is in hand there, a click on a thing
// interacts with it. The camera follows the design doc: orthographic, 45° home yaw, 30° pitch (clean 2:1 lines), four
// preset views 90° apart, integer zoom levels that scale whole art pixels, and panning with the mouse.

const ART_PX_PER_METRE = 16;        // art pixels per metre of view height: fixed, so zooming never resamples the art
const ZOOMS = [1, 2, 3];
const BASE_PIXEL = 2;               // screen pixels per art pixel at 1x
const ELEVATION = THREE.MathUtils.degToRad(30);
const HOME_YAW = THREE.MathUtils.degToRad(45);
const DRAG_THRESHOLD = 4;           // CSS pixels the pointer moves before a press becomes a pan rather than a click
const WHEEL_STEP = 100;             // wheel delta per zoom level
const WHEEL_GESTURE_GAP = 200;      // ms without wheel events that end a gesture; one gesture zooms one level at most
const REPICK_FRAMES = 8;            // things move under a still pointer, so the hover is re-picked this often too
const TURN_SECONDS = 0.3;           // how long the camera takes to turn to the next view

const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
const loading = document.querySelector<HTMLElement>('#loading')!;

const models = await loadModels();
const farm = buildFarm(models);
quantizePalette([...farm.geometries, ...allGeometries(models)], 80);
const renderer = new PixelRenderer(canvas, farm.scene, { shadowMapSize: 2048, warmHighlight: true });
const view = new FarmView(renderer, models);
const cursor = renderer.addObject(models.cursor);
const placeOk = renderer.addObject(models.place.ok), placeBad = renderer.addObject(models.place.bad);
cursor.visible = placeOk.visible = placeBad.visible = false;

let state: GameState = deserialize(localStorage.getItem(SAVE_KEY)) ?? newGame();
const save = () => localStorage.setItem(SAVE_KEY, serialize(state));

const ui = new Ui(document.body, {
  state: () => state,
  changed: () => { repick = 2; save(); },
  endDay: () => sleep(false),
  newGame: () => { state = newGame(); save(); ui.showWelcome(); },
  turn: (dir) => turn(dir),
  zoom: () => setZoom((zoom + 1) % ZOOMS.length),
});
if (!localStorage.getItem(SAVE_KEY)) ui.showWelcome();
else if (state.seasonOver && !state.resultsSeen) ui.showResults();
save();
addEventListener('pagehide', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
loading.remove();

function sleep(passedOut: boolean) {
  const summary = endDay(state, passedOut);
  save();
  ui.showSummary(summary);
}

// ---- Camera ----
const target = farm.home.clone();   // the ground point the camera looks at
let view4 = 0, zoom = 1;            // view4: quarter turns from the home yaw (any integer); zoom indexes ZOOMS
/** The camera turns smoothly to the view: from `turnFrom` (radians) at `turnAt` (the loop's `time`) to `view4`'s yaw. */
let yaw = HOME_YAW, turnFrom = HOME_YAW, turnAt = -Infinity;
/**
 * Frames left to pick on. Picking reads back from the GPU, so it runs only after the pointer, the camera or the farm
 * changed: on the next frame, and on the one after it, which reads the image drawn with the new camera.
 */
let repick = 2;

const pixelSize = () => BASE_PIXEL * ZOOMS[zoom];
const forward = new THREE.Vector3(), right = new THREE.Vector3();
function cameraAxes() {
  forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  right.set(-forward.z, 0, forward.x);
}
/** Starts turning to the next view; a turn asked for mid-turn goes on from where the camera is. */
function turn(dir: 1 | -1) { view4 += dir; turnFrom = yaw; turnAt = time; repick = 2; }
/** Moves the camera along its turn (easing out, so it answers at once and settles gently). */
function turning() {
  const k = Math.min(1, (time - turnAt) / TURN_SECONDS);
  const next = turnFrom + (HOME_YAW + view4 * Math.PI / 2 - turnFrom) * (1 - (1 - k) ** 3);
  if (next !== yaw) repick = 2;   // the farm moves under the pointer
  yaw = next;
}

/** Moves the camera over the ground by a pointer movement in CSS pixels, so the ground follows the pointer. */
function pan(dx: number, dy: number) {
  cameraAxes();
  const metres = 1 / (pixelSize() * ART_PX_PER_METRE);
  // A vertical screen step covers more ground than a horizontal one, because the ground is seen at ELEVATION.
  target.addScaledVector(right, -dx * metres).addScaledVector(forward, dy * metres / Math.sin(ELEVATION));
  target.x = THREE.MathUtils.clamp(target.x, 0, WIDTH);
  target.z = THREE.MathUtils.clamp(target.z, 0, DEPTH);
  repick = 2;
}

function setZoom(z: number) {
  zoom = z;
  fit();
}

function fit() {
  const px = pixelSize();
  const w = Math.max(1, Math.ceil(innerWidth / px)), h = Math.max(1, Math.ceil(innerHeight / px));
  if (renderer.width !== w || renderer.height !== h) renderer.resize(w, h);
  canvas.style.width = `${w * px}px`; canvas.style.height = `${h * px}px`;
  repick = 2;
}
addEventListener('resize', fit);
fit();

// ---- Input ----
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'Escape') { if (press?.mode === 'area') endArea(false); else if (ui.busy) ui.close(); else ui.openMenu(); return; }
  if (e.repeat) return;
  if (e.code === 'KeyB' || e.code === 'KeyI') { if (!ui.busy || ui.panelName === 'backpack') ui.openBackpack(); return; }
  if (ui.busy) return;
  if (e.code === 'KeyQ') turn(-1);
  if (e.code === 'KeyE') turn(1);
  if (e.code === 'KeyZ') setZoom((zoom + 1) % ZOOMS.length);
  if (e.code === 'KeyT' && passTime(state, 0, 1)) sleep(true);
  const digit = /^Digit(\d)$/.exec(e.code);
  if (digit) { state.selected = (Number(digit[1]) + 9) % 10; repick = 2; }
});

let pointer: { x: number; y: number } | null = null;
/**
 * The press in progress, of one pointer at a time (the primary one), so a second finger neither pans twice nor ends the
 * drag. It starts as a click; moved far enough it becomes a pan, or an area when it began on the field with the left button
 * (without Shift): the tiles from `from` to `to` get what is in hand on release (useOnArea). A cancelled area is `void`.
 */
let press: { id: number; x: number; y: number; mode: 'click' | 'pan' | 'area' | 'void'; from: TileAt | null; to: TileAt | null } | null = null;
canvas.addEventListener('pointerdown', (e) => {
  if (!e.isPrimary || press) return;
  press = { id: e.pointerId, x: e.clientX, y: e.clientY, mode: 'click', from: null, to: null };
  pointer = { x: e.clientX, y: e.clientY };   // a tap may come with no pointermove at all
  repick = 2;
  canvas.setPointerCapture(e.pointerId);
  if (e.button === 0 && !e.shiftKey && !ui.busy && !holdingMachine()) {
    pickHover(e.clientX, e.clientY);
    if (hover?.kind === 'tile' && isField(hover.col, hover.row)) press.from = press.to = { col: hover.col, row: hover.row };
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (press && e.pointerId === press.id) {
    if (press.mode === 'click' && Math.hypot(e.clientX - press.x, e.clientY - press.y) >= DRAG_THRESHOLD) {
      press.mode = press.from ? 'area' : 'pan';
      if (press.mode === 'pan') {
        canvas.style.cursor = 'grabbing';
        pan(e.clientX - press.x, e.clientY - press.y);   // from the press, so the ground stays under the pointer
      }
    } else if (press.mode === 'pan') pan(e.clientX - pointer!.x, e.clientY - pointer!.y);
    // The left button let go while another is held: that is the release (pointerup waits for the last button).
    if (press.mode === 'area' && !(e.buttons & 1)) { dragArea(e.clientX, e.clientY); endArea(true); }
  }
  if (e.isPrimary) { pointer = { x: e.clientX, y: e.clientY }; repick = 2; }
});
function release(e: PointerEvent) {
  if (e.pointerId !== press?.id) return;
  const click = press.mode === 'click' && e.type === 'pointerup' && e.button === 0;
  if (press.mode === 'area') {
    // The far corner where the release is, as for a click: the last pick may be a frame old.
    if (e.type === 'pointerup') dragArea(e.clientX, e.clientY);
    endArea(e.type === 'pointerup');
  }
  press = null;
  canvas.style.cursor = '';
  repick = 2;
  // Pick again where the click is: the hover may be a frame old, and the click must act on what is under it now.
  if (click && !ui.busy) { pickHover(e.clientX, e.clientY); act(); }
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('pointerleave', (e) => { if (!press && e.isPrimary) { pointer = null; repick = 2; } });
// The wheel steps whole zoom levels, one per gesture, so an inertial trackpad flick doesn't run through every level.
let wheel = 0, wheelAt = -Infinity, wheelDone = false;
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.ctrlKey || e.deltaY === 0) return;   // a pinch and sideways scrolling are not zoom
  if (e.timeStamp - wheelAt > WHEEL_GESTURE_GAP || Math.sign(e.deltaY) !== Math.sign(wheel)) { wheel = 0; wheelDone = false; }
  wheelAt = e.timeStamp;
  if (wheelDone) return;
  wheel += e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY : Math.sign(e.deltaY) * WHEEL_STEP;
  if (Math.abs(wheel) < WHEEL_STEP) return;
  setZoom(THREE.MathUtils.clamp(zoom - Math.sign(wheel), 0, ZOOMS.length - 1));
  wheelDone = true;
}, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// ---- Pointing and clicking ----

/** What the pointer is over: a thing, or a ground tile inside the fence. */
let hover: Target | null = null;
let highlighted: PixelObject[] = [];

/** The ground tile at a picked point, if it is one: the top of grass, path or soil inside the fence. */
function tileUnder(world: THREE.Vector3, normal: THREE.Vector3): Target | null {
  if (normal.y < 0.7 || Math.abs(world.y) > 0.1) return null;
  const col = Math.floor(world.x), row = Math.floor(world.z);
  return col > 0 && row > 0 && col < WIDTH - 1 && row < DEPTH - 1 && at(col, row) !== '#' && at(col, row) !== 'f' ? { kind: 'tile', col, row } : null;
}

const holdingMachine = () => { const st = held(state); return !!st && ITEMS[st.item].kind === 'machine'; };
/** A machine goes with its north-west tile under the pointer. */
const placeAt = (t: Target & { kind: 'tile' }) => ({ col: t.col, row: t.row });

function setHover(t: Target | null, picked: PixelObject | null) {
  hover = t;
  const objs = t && t.kind !== 'tile' ? view.objectsOf(t) : [];
  // The hovered object first, so it is among the ones highlighted when a thing has more than the renderer allows.
  if (picked) objs.sort((a, b) => (a === picked ? -1 : b === picked ? 1 : 0));
  const next = objs.slice(0, MAX_HIGHLIGHTS);
  for (const o of highlighted) if (!next.includes(o)) o.highlight = false;
  for (const o of next) o.highlight = true;
  highlighted = next;

  cursor.visible = placeOk.visible = placeBad.visible = false;
  if (t?.kind === 'tile') {
    if (holdingMachine()) {
      const p = placeAt(t), frame = canPlace(state, p.col, p.row) ? placeOk : placeBad;
      frame.visible = true;
      frame.setTransform(new THREE.Vector3(p.col + 1, 0.01, p.row + 1));
    } else {
      cursor.visible = true;
      cursor.setTransform(new THREE.Vector3(t.col + 0.5, (tileAt(state, t.col, t.row)?.tilled ? SOIL_TOP : 0) + 0.01, t.row + 0.5));
    }
  }
  ui.setInfo(t ? describe(t) : null);
}

/** The hover line: what the thing is and what a click does. */
function describe(t: Target): string | null {
  const s = state;
  switch (t.kind) {
    case 'tile': {
      if (holdingMachine()) return canPlace(s, t.col, t.row) ? `Click to place the ${ITEMS[held(s)!.item].name.toLowerCase()} here.` : 'A machine needs 2 x 2 tiles of open grass.';
      const tile = tileAt(s, t.col, t.row);
      if (!tile) return isOpenGrass(t.col, t.row) ? 'Grass. Machines can go here.' : null;
      if (!tile.tilled) return 'Field. Till it with the hoe.';
      const lines = [`Soil fertility ${tile.fertility}${tile.watered ? ' · watered' : ' · dry'}`];
      const c = tile.crop;
      if (c) {
        const name = ITEMS[CROPS[c.id].produce].name;
        lines.push(isRipe(c) ? `${name}: ripe! Click to harvest.` : `${name}: ${daysToRipe(c)} watered day${daysToRipe(c) > 1 ? 's' : ''} to go.`);
      } else lines.push('Empty: plant seeds, or let it rest (+5 a night).');
      return lines.join('\n');
    }
    case 'building':
      return {
        farmhouse: 'Farmhouse. Click to sleep and end the day.',
        shop: 'Shop. Seeds, feed, chickens and machines.',
        bin: `Shipping bin: ${s.bin.reduce((n, b) => n + b.count, 0)} items. Sold overnight.`,
        coop: `Coop: ${s.coop.chickens.length} chickens, trough ${s.coop.trough}.`,
      }[t.building];
    case 'door': return `Coop door (${s.coop.doorOpen ? 'open' : 'closed'}). Click to ${s.coop.doorOpen ? 'close' : 'let the chickens out'}.`;
    case 'trough': return `Trough: ${s.coop.trough} food. Click with feed or scraps in hand to fill it.`;
    case 'eggs': return `${s.coop.eggs.length} egg${s.coop.eggs.length > 1 ? 's' : ''}. Click to collect.`;
    case 'manure': return `${s.coop.manure} manure. Click to collect: fertilizer for the field.`;
    case 'chicken': {
      const c = s.coop.chickens.find((c) => c.id === t.id);
      return c ? `${c.name} · happiness ${c.happiness}${c.pettedToday ? '' : ' · click to pet'}` : null;
    }
    case 'machine': {
      const m = s.machines.find((m) => m.id === t.id);
      if (!m) return null;
      const name = MACHINE_NAMES[m.kind];
      if (isReady(m)) return `${name}: ${ITEMS[recipe(m.batch!.recipe).output].name.toLowerCase()} ready! Click to collect.`;
      if (isRunning(m)) return `${name}: making ${ITEMS[recipe(m.batch!.recipe).output].name.toLowerCase()}, ${Math.ceil(m.batch!.hoursLeft)}h left.`;
      return `${name}: idle. Click to start a recipe.`;
    }
  }
}

/** The frames marking the tiles of an area being dragged out, made as they're first needed. */
const areaMarks: PixelObject[] = [];

/** Moves the dragged area's far corner to the field tile under the pointer (the nearest one, off the field), and marks it. */
function dragArea(x: number, y: number) {
  const a = press!;
  const hit = renderer.pick(x, y), t = view.targetOf(hit?.object ?? null);
  // A crop or soil object is its tile; any other ground (the fence's too) is the tile it's in. Over a building or a tree,
  // the corner stays where it was.
  const ground = !t && hit?.world && hit.normal!.y >= 0.7 && Math.abs(hit.world.y) <= 0.1 ? hit.world : null;
  const tile = t?.kind === 'tile' ? t : ground ? { col: Math.floor(ground.x), row: Math.floor(ground.z) } : null;
  if (tile) {
    const f = FIELD_BOUNDS;
    a.to = { col: THREE.MathUtils.clamp(tile.col, f.col, f.col + f.cols - 1), row: THREE.MathUtils.clamp(tile.row, f.row, f.row + f.rows - 1) };
  }
  setHover(null, null);
  const from = a.from!, to = a.to!;
  const c0 = Math.min(from.col, to.col), c1 = Math.max(from.col, to.col), r0 = Math.min(from.row, to.row), r1 = Math.max(from.row, to.row);
  let n = 0;
  for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
    const mark = areaMarks[n++] ??= renderer.addObject(models.cursor);
    mark.visible = true;
    mark.setTransform(new THREE.Vector3(col + 0.5, (tileAt(state, col, row)?.tilled ? SOIL_TOP : 0) + 0.01, row + 0.5));
  }
  for (let i = n; i < areaMarks.length; i++) areaMarks[i].visible = false;
  const st = held(state), item = st?.item;
  const verb = item === 'hoe' ? 'till' : item === 'can' ? 'water' : item === 'manure' ? 'fertilize' : item && cropForSeed(item) ? 'plant' : 'harvest';
  ui.setInfo(`${c1 - c0 + 1} × ${r1 - r0 + 1} tiles: release to ${verb}.\nEsc cancels.`);
}

/** Ends the area drag: uses what is in hand on its tiles, or (cancelled) leaves them be. */
function endArea(apply: boolean) {
  const a = press!;
  for (const m of areaMarks) m.visible = false;
  if (apply && !ui.busy) ui.toast(useOnArea(state, a.from!, a.to!));
  a.mode = 'void';
  repick = 2;
}

/** Finds what is under a point of the page and makes it the hover. */
function pickHover(x: number, y: number) {
  const hit = renderer.pick(x, y), picked = hit?.object ?? null;
  // The cursor frames are objects too: under them is the ground.
  setHover(view.targetOf(picked) ?? (hit?.world ? tileUnder(hit.world, hit.normal!) : null), picked);
}

function act() {
  const t = hover;
  if (!t) return;
  const s = state, st = held(s);
  let r: Result | null = null;
  switch (t.kind) {
    case 'tile':
      if (holdingMachine()) {
        const p = placeAt(t), m = placeMachine(s, s.selected, p.col, p.row);
        r = m ? { ok: true, message: `Placed the ${MACHINE_NAMES[m.kind].toLowerCase()}.` } : { ok: false, message: 'A machine needs 2 x 2 tiles of open grass.' };
      } else if (isField(t.col, t.row)) r = useOnTile(s, t.col, t.row);
      break;
    case 'building':
      if (t.building === 'farmhouse') ui.confirmEndDay();
      else if (t.building === 'shop') ui.openShop();
      else if (t.building === 'bin') ui.openBin();
      else ui.openCoop();
      break;
    case 'door': r = toggleDoor(s); break;
    case 'trough':
      if (st && (st.item === 'feed' || st.item === 'scraps')) r = fillTrough(s, st.item, st.count);
      else ui.openCoop();
      break;
    case 'eggs': r = collectEggs(s); break;
    case 'manure': r = collectManure(s); break;
    case 'chicken': r = petChicken(s, t.id); break;
    case 'machine': {
      const m = s.machines.find((m) => m.id === t.id);
      if (m && isReady(m)) {
        const out = recipe(m.batch!.recipe).output, q = m.batch!.quality;
        r = collect(s, m) ? { ok: true, message: `+1 ${q ? `${QUALITY_NAMES[q].toLowerCase()} ` : ''}${ITEMS[out].name.toLowerCase()}` } : { ok: false, message: 'The backpack is full.' };
      } else if (m) ui.openMachine(m.id);
      break;
    }
  }
  if (r) ui.toast(r);
  repick = 2;
}

// ---- Loop ----
let last = performance.now(), time = 0, lookHour = Number.NaN, frameNo = 0;

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now; time += dt; frameNo++;

  state.clock.paused = ui.busy;
  if (passTime(state, dt)) sleep(true);
  const hour = hourOfDay(state.clock);
  // Every frame the clock moves, so shadows creep with the sun rather than stepping (the low morning sun moves them fast).
  if (hour !== lookHour) { renderer.setLook(lookAt(hour)); lookHour = hour; }

  view.sync(state, ui.busy ? 0 : dt);
  ui.update();

  // The hover is picked from last frame's image, which is what the player is looking at.
  if (pointer && frameNo % REPICK_FRAMES === 0) repick = Math.max(repick, 1);
  if (repick > 0) {
    repick -= 1;
    if (press?.mode === 'area' && pointer) dragArea(pointer.x, pointer.y);
    else if (pointer && (!press || press.mode === 'click') && !ui.busy) pickHover(pointer.x, pointer.y);
    else setHover(null, null);
  }

  turning();
  renderer.placeCamera(target, yaw, ELEVATION, renderer.height / ART_PX_PER_METRE);
  renderer.renderGeometry(time);
  renderer.renderStyle(time);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// For checks in the browser console and scripted playtests.
Object.assign(window, { game: { get state() { return state; }, get hover() { return hover; }, renderer, view, ui } });
