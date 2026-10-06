import * as THREE from 'three';
import { hourLabel, lookAt, PixelRenderer, quantizePalette } from 'pixel3d-renderer';
import { hourOfDay, newClock, nextDay, tick } from './game/clock.ts';
import { buildFarm } from './world/farm.ts';
import { farmer } from './world/models.ts';

// The game shell: owns the loop, the clock, input and every object's position, and each frame tells the renderer where
// things are. The camera follows the design doc: orthographic, 45° home yaw, 30° pitch (clean 2:1 lines), snapped 90°
// turns, and integer zoom levels that scale whole art pixels.

const ART_PX_PER_METRE = 16;        // art pixels per metre of view height: fixed, so zooming never resamples the art
const ZOOMS = [1, 2, 3];
const BASE_PIXEL = 2;               // screen pixels per art pixel at 1x
const ELEVATION = THREE.MathUtils.degToRad(30);
const HOME_YAW = THREE.MathUtils.degToRad(45);
const SPEED = 5;                    // m/s: a 10-tile field in about 2 s
const RADIUS = 0.25;

const canvas = document.querySelector<HTMLCanvasElement>('#view')!;
const hud = { day: document.querySelector('#day')!, clock: document.querySelector('#clock')!, zoom: document.querySelector('#zoom')! };

const farm = buildFarm();
const farmerGeometry = farmer();
quantizePalette([...farm.geometries, farmerGeometry], 64);
const renderer = new PixelRenderer(canvas, farm.scene, { shadowMapSize: 2048 });

const player = { position: farm.start.clone(), facing: 0, object: renderer.addObject(farmerGeometry) };
const clock = newClock();
let yawStep = 0, zoom = 1;          // camera turns in quarter steps from the home yaw; zoom indexes ZOOMS

const blocked = (x: number, z: number) => {
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    if (farm.solid(Math.floor(x + dx * RADIUS), Math.floor(z + dz * RADIUS))) return true;
  }
  return false;
};

const keys = new Set<string>();
addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'KeyQ') yawStep -= 1;
  if (e.code === 'KeyE') yawStep += 1;
  if (e.code === 'KeyZ') { zoom = (zoom + 1) % ZOOMS.length; fit(); }
  if (e.code === 'KeyT') clock.hour = Math.min(clock.hour + 1, 26);
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

function fit() {
  const px = BASE_PIXEL * ZOOMS[zoom];
  const w = Math.max(1, Math.ceil(innerWidth / px)), h = Math.max(1, Math.ceil(innerHeight / px));
  if (renderer.width !== w || renderer.height !== h) renderer.resize(w, h);
  canvas.style.width = `${w * px}px`; canvas.style.height = `${h * px}px`;
  hud.zoom.textContent = `${ZOOMS[zoom]}x`;
}
addEventListener('resize', fit);
fit();

const forward = new THREE.Vector3(), right = new THREE.Vector3(), move = new THREE.Vector3(), euler = new THREE.Euler();
let last = performance.now(), time = 0, lookHour = Number.NaN;

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now; time += dt;

  // Walking is camera-relative: "up" is always up the screen.
  const yaw = HOME_YAW + yawStep * Math.PI / 2;
  forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  right.set(-forward.z, 0, forward.x);
  move.set(0, 0, 0);
  if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(forward);
  if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(forward);
  if (keys.has('KeyD') || keys.has('ArrowRight')) move.add(right);
  if (keys.has('KeyA') || keys.has('ArrowLeft')) move.sub(right);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(SPEED * dt);
    const p = player.position;
    if (!blocked(p.x + move.x, p.z)) p.x += move.x;
    if (!blocked(p.x, p.z + move.z)) p.z += move.z;
    // Facing snaps to the 4 grid directions, so "the tile in front" is never ambiguous.
    player.facing = Math.round(Math.atan2(move.x, move.z) / (Math.PI / 2)) * (Math.PI / 2);
  }
  player.object.setTransform(player.position, euler.set(0, player.facing, 0));

  // Placeholder day: at the cutoff the next day starts (bed, the overnight steps and the summary come later).
  if (tick(clock, dt)) nextDay(clock);
  const hour = hourOfDay(clock);
  if (!(Math.abs(hour - lookHour) < 0.02)) { renderer.setLook(lookAt(hour)); lookHour = hour; }
  hud.day.textContent = String(clock.day);
  hud.clock.textContent = hourLabel(hour);

  renderer.placeCamera(player.position.clone().setY(0.6), yaw, ELEVATION, renderer.height / ART_PX_PER_METRE);
  renderer.renderGeometry(time);
  renderer.renderStyle(time);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
