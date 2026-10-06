import * as THREE from 'three';
import { hourLabel, lookAt, PixelRenderer, quantizePalette, type PixelObject } from 'pixel3d-renderer';
import { hourOfDay, newClock, nextDay, tick } from './game/clock.ts';
import { buildFarm, DEPTH, WIDTH } from './world/farm.ts';
import { tileCursor } from './world/models.ts';

// The game shell: owns the loop, the clock, input and every object's position, and each frame tells the renderer where
// things are. The game is point-and-click, with no player character. The camera follows the design doc: orthographic, 45°
// home yaw, 30° pitch (clean 2:1 lines), four preset views 90° apart, integer zoom levels that scale whole art pixels,
// and panning with the mouse. The renderer snaps the camera to the art-pixel grid, so panning doesn't shimmer.

const ART_PX_PER_METRE = 16;        // art pixels per metre of view height: fixed, so zooming never resamples the art
const ZOOMS = [1, 2, 3];
const BASE_PIXEL = 2;               // screen pixels per art pixel at 1x
const ELEVATION = THREE.MathUtils.degToRad(30);
const HOME_YAW = THREE.MathUtils.degToRad(45);
const DRAG_THRESHOLD = 4;           // CSS pixels the pointer moves before a press becomes a pan rather than a click
const WHEEL_STEP = 100;             // wheel delta per zoom level
const WHEEL_GESTURE_GAP = 200;      // ms without wheel events that end a gesture; one gesture zooms one level at most

const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
const hud = { day: document.querySelector('#day')!, clock: document.querySelector('#clock')!, zoom: document.querySelector('#zoom')! };

const farm = buildFarm();
const cursorGeometry = tileCursor();
quantizePalette([...farm.geometries, cursorGeometry], 64);
const renderer = new PixelRenderer(canvas, farm.scene, { shadowMapSize: 2048 });

const cursor = renderer.addObject(cursorGeometry);
cursor.visible = false;
const clock = newClock();
const target = farm.home.clone();   // the ground point the camera looks at
let view = 0, zoom = 1;             // view: quarter turns from the home yaw; zoom indexes ZOOMS
/**
 * Frames left to pick on. Picking reads back from the GPU, so it runs only after the pointer or the camera changed: on the
 * next frame, and on the one after it, which reads the image drawn with the new camera.
 */
let repick = 2;

const pixelSize = () => BASE_PIXEL * ZOOMS[zoom];
const yaw = () => HOME_YAW + view * Math.PI / 2;
const forward = new THREE.Vector3(), right = new THREE.Vector3();
function cameraAxes() {
  forward.set(-Math.sin(yaw()), 0, -Math.cos(yaw()));
  right.set(-forward.z, 0, forward.x);
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

// ---- Input ----
addEventListener('keydown', (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === 'KeyQ') { view = (view + 3) % 4; repick = 2; }
  if (e.code === 'KeyE') { view = (view + 1) % 4; repick = 2; }
  if (e.code === 'KeyZ') setZoom((zoom + 1) % ZOOMS.length);
  if (e.code === 'KeyT') clock.hour = Math.min(clock.hour + 1, 26);
});

let pointer: { x: number; y: number } | null = null;
// One pointer at a time (the primary one), so a second finger neither pans twice nor ends the drag.
let press: { id: number; x: number; y: number; dragging: boolean } | null = null;
canvas.addEventListener('pointerdown', (e) => {
  if (!e.isPrimary || press) return;
  press = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false };
  pointer = { x: e.clientX, y: e.clientY };   // a tap may come with no pointermove at all
  repick = 2;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (press && e.pointerId === press.id) {
    if (!press.dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) >= DRAG_THRESHOLD) {
      press.dragging = true;
      canvas.style.cursor = 'grabbing';
      pan(e.clientX - press.x, e.clientY - press.y);   // from the press, so the ground stays under the pointer
    } else if (press.dragging) pan(e.clientX - pointer!.x, e.clientY - pointer!.y);
  }
  if (e.isPrimary) { pointer = { x: e.clientX, y: e.clientY }; repick = 2; }
});
function release(e: PointerEvent) {
  if (e.pointerId !== press?.id) return;
  // A press that didn't pan is a click: acting on the hovered tile comes with the tools.
  press = null;
  canvas.style.cursor = '';
  repick = 2;
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

/** The ground tile at a picked point, if it is one: the top of grass or soil inside the fence, or the cursor lying on it. */
function tileUnder(world: THREE.Vector3, normal: THREE.Vector3, object: PixelObject | null) {
  if (object && object !== cursor) return null;
  if (normal.y < 0.7 || Math.abs(world.y) > 0.1) return null;
  const col = Math.floor(world.x), row = Math.floor(world.z);
  return col > 0 && row > 0 && col < WIDTH - 1 && row < DEPTH - 1 ? { col, row } : null;
}

// ---- Loop ----
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
  hud.zoom.textContent = `${ZOOMS[zoom]}x`;
}
addEventListener('resize', fit);
fit();

let last = performance.now(), time = 0, lookHour = Number.NaN;
const cursorAt = new THREE.Vector3();

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now; time += dt;

  // Placeholder day: at the cutoff the next day starts (bed, the overnight steps and the summary come later).
  if (tick(clock, dt)) nextDay(clock);
  const hour = hourOfDay(clock);
  if (!(Math.abs(hour - lookHour) < 0.02)) { renderer.setLook(lookAt(hour)); lookHour = hour; }
  hud.day.textContent = String(clock.day);
  hud.clock.textContent = hourLabel(hour);

  // The hovered tile is highlighted, except while panning. The pick reads last frame's image, which is what the player
  // is looking at.
  if (repick > 0) {
    repick -= 1;
    const hit = pointer && !press?.dragging ? renderer.pick(pointer.x, pointer.y) : null;
    const tile = hit?.world ? tileUnder(hit.world, hit.normal!, hit.object) : null;
    cursor.visible = !!tile;
    if (tile) cursor.setTransform(cursorAt.set(tile.col + 0.5, 0.005, tile.row + 0.5));
  }

  renderer.placeCamera(target, yaw(), ELEVATION, renderer.height / ART_PX_PER_METRE);
  renderer.renderGeometry(time);
  renderer.renderStyle(time);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
