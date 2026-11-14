// Checks the view as the game places it (Soil-n-Silo#201): `view.place` from the game's own camera controller, and the
// page's points and the lines of sight under the pointer that `toScreen` and `rayAt` give back, in CSS pixels. No browser.
//   npm run render:test:view   (and in `npm test`)
// 1. place: the target in the middle of the page, the view nearest the heading; the zoom CSS pixels a metre at any pixel
//    ratio.
// 2. rayAt: the line of sight through the middle passes through the target, pitched 30° down; through a drawn point, that
//    point.
// 3. Reach: the widest game view (4 px a metre on a big screen) keeps all its land between the near and far planes, and
//    the demo's views sit where they always did (their frames unchanged).
// Exits with 1 if anything is off.
import * as THREE from 'three';
import { CAMERA_DISTANCE, PITCH, ViewCamera } from '../src/renderer/camera.ts';

let failed = false;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
}
const near = (a: number, b: number, e = 1e-6) => Math.abs(a - b) < e;

/** A view on a screen of `width` × `height` CSS pixels at `ratio` device pixels each (no canvas: the page's corner at 0, 0). */
function viewOn(width: number, height: number, ratio = 1) {
  const v = new ViewCamera();
  v.screen = { ratio, width, height, canvas: null };
  return v;
}

// 1. Placing the view.
console.log('Placing the view');
{
  const v = viewOn(1280, 720);
  for (const k of [0, 1, 2, 3]) {
    v.place({ x: 40, y: 3, z: -12, heading: Math.PI / 4 + (k * Math.PI) / 2, zoom: 8 });
    const p = v.toScreen(40, 3, -12);
    check(`heading ${k}: view ${k}, the target in the middle`, v.view === k && near(p.x, 640, 1e-4) && near(p.y, 360, 1e-4), `view ${v.view}, ${p.x}, ${p.y}`);
  }
}
for (const ratio of [1, 2]) {
  const v = viewOn(1280, 720, ratio), heading = Math.PI / 4;
  v.place({ x: 0, z: 0, heading, zoom: 6 });
  // Screen right is (cos, 0, -sin) of the heading: 10 m that way is 60 CSS pixels right of the middle.
  const p = v.toScreen(10 * Math.cos(heading), 0, -10 * Math.sin(heading));
  check(`the zoom is CSS pixels a metre at pixel ratio ${ratio}`, near(p.x, 700, 1e-4) && near(p.y, 360, 1e-4), `${p.x}, ${p.y}`);
}

// 2. Lines of sight.
console.log('Lines of sight');
{
  const v = viewOn(1280, 720, 2);
  v.place({ x: 12, y: 2, z: 30, heading: 1.1, zoom: 10 });
  const ray = v.rayAt(640, 360);
  check('through the middle: through the target', near(ray.distanceToPoint(new THREE.Vector3(12, 2, 30)), 0, 1e-4));
  check('pitched 30° down', near(Math.asin(-ray.direction.y), PITCH, 1e-9));
  const p = v.toScreen(20, 5, 22), off = v.rayAt(p.x, p.y);
  check('through where a point is drawn: through that point', near(off.distanceToPoint(new THREE.Vector3(20, 5, 22)), 0, 1e-3));
}

// 3. The camera's reach.
console.log('The camera\'s reach');
{
  // The country round a map at 2 m a level: hills up to 58 m.
  const v = viewOn(2560, 1440);
  v.landTop = 58;
  v.place({ x: 0, z: 0, heading: Math.PI / 4, zoom: 4 });
  const c = v.camera;
  c.updateMatrixWorld();
  // The land at the page's corners, from a valley 30 m below the middle's ground to the highest hill and a windmill on it:
  // in front of the camera and within its reach. The ray starts on the near plane, so how far along it the land lies is
  // how far past the near plane.
  const out: string[] = [];
  for (const [sx, sy] of [[0, 0], [2560, 0], [0, 1440], [2560, 1440]]) for (const ground of [-30, 0, 58 + 18]) {
    const ray = v.rayAt(sx, sy), t = (ground - ray.origin.y) / ray.direction.y;
    if (!(t > 0 && t < c.far - c.near)) out.push(`(${sx}, ${sy}) ${ground} m up at ${t.toFixed(1)}`);
  }
  check('the widest game view keeps all its land between the near and far planes', out.length === 0, out.join('; '));
}
{
  // The demo's widest view, 16 device px a metre, at the tools' frame size (render:shot) over the demo's farm. (On a bigger
  // screen its widest view now sits back a little further, to see 40 m above its target at the bottom.)
  const v = new ViewCamera(0, 16);
  v.landTop = 12;
  v.apply(1280, 720);
  check('the demo\'s views sit where they always did', v.distance === CAMERA_DISTANCE && v.camera.far === CAMERA_DISTANCE * 2.5, `${v.distance}, ${v.camera.far}`);
}

if (failed) process.exit(1);
