// Checks the models' moving parts (Soil-n-Silo#205, src/renderer/parts.ts) with no browser:
//   node brush3d/tools/parts.ts   (part of npm test)
// 1. A part eases to the pace it's given, worked out from the clock: a frame is the same however it was reached (in
//    steps, at once, or seeking back and forth through changes of pace), and a still shows it at rest.
// 2. Slots: a part is freed with its last mesh, a slot no mesh took is freed at once, and an old handle's generation no
//    longer matches the next part in its slot. Hidden, a part is folded to its axle.
// 3. A mesh's bounds hold its parts wherever they turn, and its posed positions (for picking) are the shader's.
// 4. The night's lights and the smoke (#205's looks): a lamp glows while it shows, windows while lit, the nearest first;
//    a part shown or hidden before its first frame has always been so, later from then (its smoke starts or stops then).
// 5. A pick sees past a working chimney's smoke to the building behind it (smoke is drawn with depth, but is no thing).
// Exits with 1 if anything is off.
import * as THREE from 'three';
import { EASE, GLOW, Parts } from '../src/renderer/parts.ts';
import { GRASS_INK, Picker, SMOKE_INK } from '../src/renderer/pick.ts';

let failed = false;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
}
const angleOf = (p: Parts, slot: number) => (p.texture.image.data as Float32Array)[slot * 16 + 3];

// 1. The turn.
{
  const run = (times: number[]) => {
    const p = new Parts(), slot = p.add({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }, 2);
    // Told at 0, it starts turning from the next frame (here at 0 too).
    p.update(0); p.spin(slot, 1); p.update(0);
    for (const t of times) p.update(t);
    return angleOf(p, slot);
  };
  check('at rest when told', run([]) === 0);
  const smooth = run([0.5, 1, 1.5, 2, 2.5, 3]), once = run([3]);
  check('the same frame in steps or at once', Math.abs(smooth - once) < 1e-5, `${smooth} vs ${once}`);
  // From rest, it turns speed × (t − EASE(1 − e^(−t/EASE))) by t.
  const t = 3, want = (2 * (t - EASE * (1 - Math.exp(-t / EASE)))) % (2 * Math.PI);
  check('eased from rest', Math.abs(once - want) < 1e-5, `${once} vs ${want}`);
  // Told to turn but drawn only once (a still), it stays at rest: it starts at the first frame after it's told.
  const p = new Parts(), slot = p.add({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 2);
  p.spin(slot, 1); p.update(5);
  check('a still shows it at rest', angleOf(p, slot) === 0);
}
{
  const p = new Parts(), slot = p.add({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 1);
  const at = (t: number) => { p.update(t); return angleOf(p, slot); };
  at(0); p.spin(slot, 1); at(0);
  const half = at(0.5);
  at(1); p.spin(slot, 2);
  const late = at(3);
  check('seeking back: as it was', late !== 0 && at(0.5) === half && at(0) === 0);
  // Forward again past where the pace changed: the same frames, the change of pace kept.
  check('forward again: the change of pace kept', at(3) === late);
  at(0);
  check('back and forth again: the same', at(3) === late);
  // Told a new pace after a jump back, it takes a new course from there.
  at(0.5); p.spin(slot, 3);
  check('a new pace after a jump back: a new course', at(3) !== late);
}

// 2. Slots and handles.
{
  const p = new Parts(), a = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  p.hold([a]); p.hold([a]);
  const gen = p.generation(a);
  p.release([a]);
  const held = p.count;
  p.release([a]);
  check('held until its last mesh lets go', held === 1 && p.count === 0);
  const b = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  check('its slot taken again, a new generation', b === a && p.generation(b) !== gen);
  const c = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  p.hold([b]); p.unheld([b, c]);
  check('a slot no mesh took is freed', p.count === 1);
  p.show(b, false);
  check('hidden: its shown flag off', (p.texture.image.data as Float32Array)[b * 16 + 7] === 0);
}

// 3. Bounds and picking.
{
  const p = new Parts(), slot = p.add({ x: 0, y: 2, z: 0 }, { x: 0, y: 0, z: 1 }, 1);
  // A blade up from the axle at (0, 2, 0), and a post below it that doesn't turn.
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 2, 0, 0.1, 4, 0, -0.1, 4, 0, 0, 0, 0, 0.1, 1, 0, -0.1, 1, 0], 3));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute([slot + 1, slot + 1, slot + 1, 0, 0, 0], 1));
  p.sweep(g);
  const box = g.boundingBox!;
  check('the bounds hold the blade swept round its axle', box.min.y <= 0 && box.max.y >= 4 && box.min.x <= -2 && box.max.x >= 2);
  // Turned some way round, the blade with it (as the shader turns it: Rodrigues, right-handed), the post where it stands.
  p.update(0); p.spin(slot, 1); p.update(0); p.update(Math.PI + EASE);
  const angle = angleOf(p, slot), posed = p.posed(g)!;
  const y = 2 + 0.1 * Math.sin(angle) + 2 * Math.cos(angle);
  check('posed as drawn', Math.abs(posed.getY(1) - y) < 1e-4 && Math.abs(posed.getY(3)) < 1e-9, `${posed.getY(1)} vs ${y}`);
  const pose = p.pose().slice();
  p.update(Math.PI + EASE + 1);
  check('posed as a copy of an earlier pose has it', p.posed(g, pose)!.getY(1) === posed.getY(1));
  p.show(slot, false);
  check('hidden: folded to its axle', p.posed(g)!.getY(1) === 2);
}

// 4. Lights and smoke.
{
  const p = new Parts(), d = () => p.texture.image.data as Float32Array;
  // A lamp whose axle is its model's origin (as the garage's is), its globe 10 m off: its light is at the globe.
  const lamp = p.add({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0, GLOW.lamp, { x: 10, y: 3, z: 0 });
  const windows = p.add({ x: 2, y: 2, z: 0 }, { x: 1, y: 0, z: 0 }, 0, GLOW.window);
  const chimney = p.add({ x: 0, y: 6, z: 0 }, { x: 1, y: 0, z: 0 }, 0);
  p.hold([lamp, windows, chimney]);
  check('how each glows, in its texel', d()[lamp * 16 + 8] === GLOW.lamp && d()[windows * 16 + 8] === GLOW.window && d()[chimney * 16 + 8] === GLOW.none);
  // Hidden before its first frame (a building not working as it's built): its smoke has always been off.
  p.show(chimney, false);
  check('hidden before its first frame: always so', d()[chimney * 16 + 12] === -1e6);
  p.update(4);
  p.show(chimney, true);
  check('shown later: from then', d()[chimney * 16 + 12] === 4);
  // Stopped and started again while its puffs rise: each change kept, the latest first, so a puff knows (the shader
  // counts the changes since it left: an odd number, and the chimney was the other way then).
  p.update(4.5); p.show(chimney, false); p.update(5); p.show(chimney, true);
  const texel = () => [...d().slice(chimney * 16 + 12, chimney * 16 + 16)];
  check('its last starts and stops kept', texel().join() === '5,4.5,4,-1000000', texel().join());
  // As SMOKE_VERT draws a puff that left at `left`.
  const drawn = (left: number) => {
    const [a, b, c, lost] = texel();
    return left >= lost && (d()[chimney * 16 + 7] > 0.5) === ([a, b, c].filter((t) => t > left).length % 2 === 0);
  };
  check('a puff knows whether it was on when it left', !drawn(3) && drawn(4.2) && !drawn(4.7) && drawn(5.2));
  // Flickering faster than it rises: off at 5.5, on at 6, off at 6.5. What's before the changes kept is lost, never
  // drawn: a puff that left while it was off (3) stays unseen.
  for (const [t, on] of [[5.5, false], [6, true], [6.5, false], [7, true]] as const) { p.update(t); p.show(chimney, on); }
  check('flickering: only puffs that left while it was on', !drawn(3) && !drawn(4.2) && !drawn(5.7) && drawn(6.2) && !drawn(6.7) && drawn(7.1), texel().join());
  const near = () => p.glowing({ x: 0, y: 0, z: 0 }, 8).map((l) => l.glow);
  check('a lamp lights from where its light is', p.glowing({ x: 0, y: 0, z: 0 }, 8).find((l) => l.glow === GLOW.lamp)?.x === 10);
  check('lights: windows and lamps, the nearest first', near().join() === `${GLOW.window},${GLOW.lamp}`);
  p.light(windows, false);
  check('windows unlit: no light', near().join() === `${GLOW.lamp}`);
  p.show(lamp, false);
  check('out: windows unlit, a lamp hidden', near().length === 0);
  p.release([lamp]);
  p.show(lamp, true);
  check('a freed part throws no light', near().length === 0);
}

// 5. Picking through smoke.
{
  // A building 4 m high, its chimney on top.
  const building = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4).translate(0, 2, 0), new THREE.MeshBasicMaterial());
  building.userData = { tag: 'bakery', kind: 'ink' };
  const picker = new Picker({
    landHit: (ray) => ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3()),
    waterAt: () => null,
    tagged: () => [building],
  });
  // Looking down at 45° at the chimney, at what's drawn 1 m up and in front of it: a puff, or a tree's crown.
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.set(10, 14, 0); camera.lookAt(0, 4, 0); camera.updateMatrixWorld();
  // The 3 × 3 pixels read, all at `depth` and `ink`.
  const pixels = (depth: number, ink: number) => Float32Array.from({ length: 36 }, (_, i) => (i % 4 === 2 ? depth : i % 4 === 3 ? ink : 0));
  const pick = (ink: number, from = camera) =>
    picker.hit(pixels(Math.hypot(9, 9), ink), from, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), [{ mesh: building, matrix: building.matrixWorld, tag: 'bakery' }]);
  const through = pick(SMOKE_INK);
  check('a pick sees past smoke to the building', through?.tag === 'bakery' && Math.abs(through.point.y - 4) < 0.05, JSON.stringify(through));
  check('a smoke pixel partly something painted: still smoke', pick(SMOKE_INK * 0.75)?.tag === 'bakery');
  check('a tree in front: the tree', pick(0)?.what === 'plant');
  // A puff's edge over the building: three samples smoke, one the building's ink, averaged (ink and depth between), the
  // puff beside it. (The pixel read first is the nearest of the nine at one depth.)
  const edgeAt = (ink: number, by: number) => {
    const px = pixels(Math.hypot(9, 9), by);
    px[3] = ink;
    return picker.hit(px, camera, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), [{ mesh: building, matrix: building.matrixWorld, tag: 'bakery' }]);
  };
  const edge = edgeAt(SMOKE_INK * 0.75 + 0.25, SMOKE_INK);
  check('a puff\'s edge over the building: the building', edge?.tag === 'bakery', JSON.stringify(edge));
  // A tree's crown over the building, no smoke by it: three samples leaves, one the building's ink. The tree.
  const crown = edgeAt(0.25, 0);
  check('a crown\'s edge over the building, no smoke: the tree', crown?.what === 'plant', JSON.stringify(crown));
  // Smoke with nothing behind it (looking level, over the building): the sky.
  const level = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  level.position.set(10, 14, 0); level.lookAt(0, 14, 0); level.updateMatrixWorld();
  const sky = pick(SMOKE_INK, level);
  check('smoke against the sky: nothing', sky === null, JSON.stringify(sky));
  // Smoke over a river's bank: water at y 0 over x < -2 (its bed at y -1), and a low bank beyond (y -0.5, under the water's
  // level, but dry). Looking down at a slant, the line of sight crosses the water's height over the bank and meets the bed
  // under the water.
  const bed = (x: number) => (x < -2 ? -1 : x < -1 ? -0.5 : 0);
  const river = new Picker({
    landHit: (ray) => {
      const p = new THREE.Vector3();
      for (let t = 0; t < 200; t += 0.01) if (ray.at(t, p).y <= bed(p.x)) return p.clone();
      return null;
    },
    waterAt: (x) => (x < -2 ? 0 : null),
    tagged: () => [],
  });
  const steep = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  steep.position.set(5.5, 5, 0); steep.lookAt(-2.2, -0.5, 0); steep.updateMatrixWorld();
  const bank = river.hit(pixels(5, SMOKE_INK), steep, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), []);
  check('smoke over a bank, the water\'s surface there over dry land: not water', bank?.what === 'land', JSON.stringify(bank));
  const mid = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  mid.position.set(-5, 10, 0); mid.lookAt(-5.8, -1, 0); mid.updateMatrixWorld();
  const pond = river.hit(pixels(5, SMOKE_INK), mid, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), []);
  check('smoke over the river: its water', pond?.what === 'water' && Math.abs(pond.point.y) < 1e-6, JSON.stringify(pond));

  // Meadow grass (#256): marked with GRASS_INK, so picking sees past blades to the land or building behind them
  // from all four isometric views, never classifying open grass as 'plant'.
  const groundPicker = new Picker({
    landHit: (ray) => ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3()),
    waterAt: () => null,
    tagged: () => [building],
  });
  let allFourLand = true;
  for (let v = 0; v < 4; v++) {
    const ang = (Math.PI / 4) + (v * Math.PI) / 2;
    const cam = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 200);
    // Point at open grass at (8, 0, 0), well outside the building box, with a 0.8 m tall blade in front of the ground.
    cam.position.set(8 + Math.cos(ang) * 60, 40, Math.sin(ang) * 60);
    cam.lookAt(8, 0, 0);
    cam.updateMatrixWorld();
    const bladeDepth = cam.position.distanceTo(new THREE.Vector3(8, 0, 0)) - 2.0;
    const full = groundPicker.hit(pixels(bladeDepth, GRASS_INK), cam, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), [{ mesh: building, matrix: building.matrixWorld, tag: 'bakery' }]);
    const half = groundPicker.hit(pixels(bladeDepth, GRASS_INK * 0.5), cam, new THREE.Vector2(0, 0), new THREE.Vector2(1e-4, 1e-4), [{ mesh: building, matrix: building.matrixWorld, tag: 'bakery' }]);
    if (full?.what !== 'land' || half?.what !== 'land') allFourLand = false;
  }
  check('meadow grass picks as land (never plant) across all 4 views, full and half-covered MSAA', allFourLand);
  // Grass blade in front of a tagged building still picks the building.
  const grassFront = pick(GRASS_INK);
  check('meadow grass in front of a building still picks the building', grassFront?.tag === 'bakery', JSON.stringify(grassFront));
}

if (failed) process.exit(1);
