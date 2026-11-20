// Checks the land painted from the game's map (Soil-n-Silo#202, src/land/paint.ts, docs/LAND.md) on a small made-up
// land, with no browser:
//   node brush3d/tools/land.ts   (part of npm test)
// 1. What's drawn: the heights the land answers (heightAt) are the smooth fit's (surface.ts) on dry ground and under the
//    water's level in its beds; seen from above the mesh has no holes and lies where heightAt says; every triangle faces
//    the way its normal does (tops up, cliff faces out); a line of sight meets the land where heightAt has it.
// 2. An earthwork (update, step): nothing changes until it's stepped; then the ground is fitted again, a few chunks
//    painted a step, all swapped in together at the last; only chunks near it are painted again; afterwards its dryness
//    and paint are what a land built afresh has, its heights within a few centimetres (the fit again is local).
// 3. The country beyond: it meets the land's edge, and is the grid's further out.
// 4. The map's border (Soil-n-Silo#269): the map's tiles keep their colour to their very edge, the country further out is
//    fully dull, the fade between wanders along the edge, and the country beyond takes the land's colour all along where
//    it meets it.
// Exits with 1 if anything is off.
import * as THREE from 'three';
import { LAND_COVER, LAND_GROUND, type LandMap } from '../src/land/map.ts';
import { LAND_LOOK, PaintedLand, type LandAdder, type LandLook } from '../src/land/paint.ts';
import { Surface } from '../src/land/surface.ts';

let failed = false;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`);
}

// A land 40 x 32 tiles at 4 m a tile and 1 m a level: rolling ground, a cliff two levels high along x = 24, a river
// along y = 14 and 15 (two levels under the ground round it, level), a worked pad, the map the middle 24 x 20.
const W = 40, H = 32, TILE = 4, LEVEL = 1, X0 = -40, Z0 = -24;
const rolling = (px: number, py: number) => Math.round(4 + 1.5 * Math.sin(px * 0.3) + Math.cos(py * 0.25 + px * 0.1));
function makeLand(): LandMap {
  const n = W * H, corners = new Float32Array(n * 4), worked = new Uint8Array(n), cover = new Uint8Array(n), ground = new Uint8Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, river = (y === 14 || y === 15) && x < 24;
    // East of the cliff, all its corners two levels up.
    const at = (px: number, py: number) => rolling(px, py) + (x >= 24 ? 2 : 0);
    const c = river ? [1, 1, 1, 1] : [at(x, y), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1)];
    for (let k = 0; k < 4; k++) corners[i * 4 + k] = c[k] * LEVEL;
    cover[i] = river ? LAND_COVER.water : x < 4 ? LAND_COVER.woods : (x + y) % 11 === 0 ? LAND_COVER.rock : LAND_COVER.grass;
    worked[i] = river ? 1 : 0;
    ground[i] = x > 30 ? LAND_GROUND.sand : y > 24 ? LAND_GROUND.clay : LAND_GROUND.loam;
  }
  // A worked pad, level.
  for (let y = 6; y < 9; y++) for (let x = 10; x < 13; x++) { const i = y * W + x; worked[i] = 1; corners.fill(rolling(10, 6) * LEVEL, i * 4, i * 4 + 4); }
  const bnx = 20, bnz = 18, height = new Float32Array(bnx * bnz);
  for (let j = 0; j < bnz; j++) for (let i = 0; i < bnx; i++) height[j * bnx + i] = 3 + Math.sin(i * 1.3 + j * 0.7);
  return {
    width: W, height: H, tile: TILE, level: LEVEL, x0: X0, z0: Z0, corners, worked, cover, ground,
    map: { x: 8, y: 6, width: 24, height: 20 },
    beyond: { nx: bnx, nz: bnz, cell: 16, x0: X0 - 64, z0: Z0 - 64, height },
  };
}

/** An adder standing for the renderer: keeps the meshes in, counts what's added and taken out, and when, and the meshes'
 * geometries freed (the land's to free: the renderer frees only those it cut). */
class Adder implements LandAdder {
  readonly live = new Set<THREE.Mesh>();
  added = 0; removed = 0; changes = 0; freed = 0;
  add(geometry: THREE.BufferGeometry) {
    const m = new THREE.Mesh(geometry); this.live.add(m); this.added++;
    geometry.addEventListener('dispose', () => this.freed++);
    return m;
  }
  remove(mesh: THREE.Mesh) { this.live.delete(mesh); this.removed++; }
  changeGround(_area: THREE.Box3 | null, change: () => void) { this.changes++; change(); }
  prepare() {}
  reset() { this.added = 0; this.removed = 0; this.changes = 0; this.freed = 0; }
}

/** Every triangle drawn: its corners, and its vertices' normal (the first's). */
function triangles(adder: Adder) {
  const out: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; n: THREE.Vector3 }[] = [];
  for (const m of adder.live) {
    const g = m.geometry, pos = g.getAttribute('position'), nrm = g.getAttribute('normal'), idx = g.getIndex()!;
    const v = (k: number) => new THREE.Vector3().fromBufferAttribute(pos, idx.getX(k));
    for (let k = 0; k < idx.count; k += 3) out.push({ a: v(k), b: v(k + 1), c: v(k + 2), n: new THREE.Vector3().fromBufferAttribute(nrm, idx.getX(k)) });
  }
  return out;
}

const map = makeLand(), adder = new Adder(), land = new PaintedLand(adder, map);
const surface = new Surface({ width: W, height: H, corner: Array.from(map.corners, (c) => c / LEVEL) },
  { water: (x, y) => map.cover[y * W + x] === LAND_COVER.water, worked: (x, y) => map.worked[y * W + x] === 1 });
const world = (px: number, py: number) => [X0 + px * TILE, Z0 + py * TILE] as const;

// 1. What's drawn.
console.log('What\'s drawn');
let worst = 0, wetOver = 0, deepest = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [u, v] of [[0.5, 0.5], [0.2, 0.7], [0.9, 0.1]]) {
  const h = land.heightAt(...world(x + u, y + v)), fit = surface.on(x, y, u, v) * LEVEL;
  if (map.cover[y * W + x] === LAND_COVER.water) { wetOver = Math.max(wetOver, h - fit); deepest = Math.max(deepest, fit - h); }
  else worst = Math.max(worst, Math.abs(h - fit));
}
check('on dry ground, the smooth fit\'s heights', worst < 1e-9, `${worst} m off`);
check('in the river, its bed under its level', wetOver <= 1e-9 && deepest > 0.5, `${wetOver.toFixed(3)} m over at most, ${deepest.toFixed(2)} m under at most`);

// Seen from above: a grid of points over the land, each under a top triangle at heightAt's height (to 8 cm, a little more
// than the paint's own 4 cm, for the flat triangles' chords; 25 cm in the beds).
const tris = triangles(adder), B = 4, buckets = new Map<string, number[]>();
tris.forEach((t, i) => {
  const xs = [t.a.x, t.b.x, t.c.x], zs = [t.a.z, t.b.z, t.c.z];
  for (let bx = Math.floor(Math.min(...xs) / B); bx <= Math.floor(Math.max(...xs) / B); bx++) for (let bz = Math.floor(Math.min(...zs) / B); bz <= Math.floor(Math.max(...zs) / B); bz++) {
    const key = `${bx},${bz}`;
    buckets.set(key, [...(buckets.get(key) ?? []), i]);
  }
});
/** The highest top drawn over a point, or null where nothing is. */
function drawnAt(x: number, z: number): number | null {
  let best: number | null = null;
  for (const i of buckets.get(`${Math.floor(x / B)},${Math.floor(z / B)}`) ?? []) {
    const { a, b, c } = tris[i], d = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
    if (Math.abs(d) < 1e-9) continue;
    const l1 = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / d, l2 = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / d, l3 = 1 - l1 - l2;
    if (l1 < -1e-7 || l2 < -1e-7 || l3 < -1e-7) continue;
    const y = l1 * a.y + l2 * b.y + l3 * c.y;
    best = best === null ? y : Math.max(best, y);
  }
  return best;
}
let holes = 0, off = 0, offWorst = 0;
for (let py = 0.013; py < H; py += 0.137) for (let px = 0.011; px < W; px += 0.131) {
  const [x, z] = world(px, py), y = drawnAt(x, z);
  if (y === null) { holes++; continue; }
  const e = Math.abs(y - land.heightAt(x, z));
  offWorst = Math.max(offWorst, e);
  // (The beds, seen through the water, by more: where two banks meet the bed's slope bends sharply.)
  if (e > (map.cover[Math.floor(py) * W + Math.floor(px)] === LAND_COVER.water ? 0.25 : 0.08)) off++;
}
check('no holes, seen from above', holes === 0, `${holes} points with nothing over them`);
check('drawn where heightAt says (within 8 cm, 25 cm in the beds)', off === 0, `${off} points off, the worst ${offWorst.toFixed(3)} m`);
let backwards = 0, faces = 0;
for (const t of tris) {
  const n = new THREE.Vector3().crossVectors(t.b.clone().sub(t.a), t.c.clone().sub(t.a));
  if (n.length() < 1e-9) continue;
  if (Math.abs(n.normalize().y) < 0.05) faces++;
  if (n.dot(t.n) <= 0) backwards++;
}
check('every triangle faces the way its normal does', backwards === 0, `${backwards} of ${tris.length} the wrong way round`);
check('the cliff and the land\'s edge have faces', faces > 100, `${faces} upright triangles`);
// Lines of sight: straight down, and slanting across the cliff, meet the land where heightAt has it.
const [dx, dz] = world(18.3, 9.6), down = land.hit({ origin: new THREE.Vector3(dx, 100, dz), direction: new THREE.Vector3(0, -1, 0) });
check('straight down, at heightAt', !!down && Math.abs(down.y - land.heightAt(dx, dz)) < 1e-3, `${down?.y} for ${land.heightAt(dx, dz)}`);
const [sx, sz] = world(20, 10), slant = land.hit({ origin: new THREE.Vector3(sx, 30, sz), direction: new THREE.Vector3(1, -0.6, 0.2) });
check('slanting, on the land', !!slant && Math.abs(slant.y - land.heightAt(slant.x, slant.z)) < 0.02, `${slant?.y} for ${slant && land.heightAt(slant.x, slant.z)}`);
check('a line of sight up and away misses', land.hit({ origin: new THREE.Vector3(0, 50, 0), direction: new THREE.Vector3(0.3, 1, 0) }) === null);
check('one straight down far past everything drawn misses', land.hit({ origin: new THREE.Vector3(10000, 100, 10000), direction: new THREE.Vector3(0, -1, 0) }) === null);
{
  // A small flat land 4 m up, its corner at the origin, and flat country 4 m up round it from -32 m.
  const flat = new PaintedLand(new Adder(), {
    width: 8, height: 8, tile: 4, level: 1, x0: 0, z0: 0, corners: new Float32Array(256).fill(4), worked: new Uint8Array(64).fill(1),
    cover: new Uint8Array(64), ground: new Uint8Array(64), map: { x: 0, y: 0, width: 8, height: 8 },
    beyond: { nx: 7, nz: 7, cell: 16, x0: -32, z0: -32, height: new Float32Array(49).fill(4) },
  });
  const graze = flat.hit({ origin: new THREE.Vector3(-33, 4, -31.9 + 1), direction: new THREE.Vector3(1, 0, -1) });
  check('one grazing a corner of what\'s drawn meets it inside it, or not at all', !graze || (graze.x >= -32 && graze.z >= -32), `${graze?.x}, ${graze?.z}`);
  check('one coming in under the country through the world\'s side misses (it has no wall)', flat.hit({ origin: new THREE.Vector3(-33, 3, 10), direction: new THREE.Vector3(1, -0.1, 0) }) === null);
  // Country falling from 16 m at its outer edge to the land, 0 m: a line of sight coming in under the high edge, out over
  // the slope, then down onto the land.
  const fall = new Float32Array(49);
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) fall[j * 7 + i] = i === 0 ? 16 : 0;
  const low = new PaintedLand(new Adder(), {
    width: 8, height: 8, tile: 4, level: 1, x0: 0, z0: 0, corners: new Float32Array(256), worked: new Uint8Array(64).fill(1),
    cover: new Uint8Array(64), ground: new Uint8Array(64), map: { x: 0, y: 0, width: 8, height: 8 },
    beyond: { nx: 7, nz: 7, cell: 16, x0: -32, z0: -32, height: fall },
  });
  const far = low.hit({ origin: new THREE.Vector3(-40, 14, 8), direction: new THREE.Vector3(1, -0.3, 0) });
  check('one coming in under a high edge, then down onto the land beyond it, meets the land', !!far && Math.abs(far.y - low.heightAt(far.x, far.z)) < 1e-3 && far.x > -16, `${far?.x}, ${far?.y}`);
}
const overCountry = land.hit({ origin: new THREE.Vector3(X0 - 40, 100, Z0 + 20), direction: new THREE.Vector3(0, -1, 0) });
check('one straight down on the country beyond meets it', !!overCountry && Math.abs(overCountry.y - land.heightAt(X0 - 40, Z0 + 20)) < 1e-3);

// 2. An earthwork: a 3 x 3 raised two levels and worked, a tile of the river filled in, sand turned to clay.
console.log('An earthwork');
const before = new Set(adder.live), meshes = adder.live.size;
adder.reset();
const rect = { x: 16, y: 13, width: 3, height: 3 }, n = 9, patch = { corners: new Float32Array(n * 4), worked: new Uint8Array(n).fill(1), cover: new Uint8Array(n), ground: new Uint8Array(n) };
for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
  const t = (rect.y + j) * W + rect.x + i, k = j * 3 + i;
  patch.corners.fill(6 * LEVEL, k * 4, k * 4 + 4);
  patch.cover[k] = LAND_COVER.bare; patch.ground[k] = map.ground[t] === LAND_GROUND.loam ? LAND_GROUND.clay : map.ground[t];
}
const hBefore = land.heightAt(...world(17.5, 14.5)), changed = land.update(rect, patch);
check('the tiles that changed', changed === 9, `${changed}`);
check('nothing changes until it\'s stepped, drawn or answered', adder.added === 0 && adder.removed === 0 && land.heightAt(...world(17.5, 14.5)) === hBefore);
let steps = 0, fitSteps = 0, swappedEarly = false;
while (!land.step(0)) { steps++; if ((land as unknown as { fitting: unknown }).fitting) fitSteps++; if (adder.added > 0) swappedEarly = true; }
check('fitted over several steps', fitSteps > 4, `${fitSteps} steps`);
check('painted over several steps, swapped in together at the last', steps > 2 && !swappedEarly && adder.changes === 1, `${steps} steps, ${adder.changes} swaps`);
check('the chunks swapped out freed', adder.freed === adder.removed, `${adder.freed} freed of ${adder.removed}`);
check('only chunks near it painted again', adder.removed > 0 && adder.removed <= 16 && adder.live.size === meshes, `${adder.removed} of ${meshes} chunks`);
const C = 8 * TILE, [cx, cz] = world(17.5, 14.5);
const far = [...before].filter((m) => !adder.live.has(m)).filter((m) => { m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox!; return b.min.x > cx + 2 * C || b.max.x < cx - 2 * C || b.min.z > cz + 2 * C || b.max.z < cz - 2 * C; });
check('none far from it', far.length === 0, `${far.length} far chunks painted again`);
check('the raised ground drawn at its new level', Math.abs(land.heightAt(...world(17.5, 14.5)) - 6) < 1e-9, `${land.heightAt(...world(17.5, 14.5))}`);
check('nothing more to do: an earthwork that changes nothing', land.update(rect, patch) === 0 && land.step(0));

// The same land built afresh, from the map as it is now.
const now = makeLand();
for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
  const t = (rect.y + j) * W + rect.x + i, k = j * 3 + i;
  now.corners.set(patch.corners.subarray(k * 4, k * 4 + 4), t * 4);
  now.worked[t] = 1; now.cover[t] = patch.cover[k]; now.ground[t] = patch.ground[k];
}
const fresh = new PaintedLand(new Adder(), now) as unknown as Record<string, Float32Array>, after = land as unknown as Record<string, Float32Array>;
const same = (a: Float32Array, b: Float32Array) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
check('its dryness as built afresh', same(after.dry, fresh.dry));
check('its paint as built afresh', same(after.paint, fresh.paint));
let drift = 0;
for (let py = 0.5; py < H; py += 1) for (let px = 0.5; px < W; px += 1) {
  const [x, z] = world(px, py);
  drift = Math.max(drift, Math.abs(land.heightAt(x, z) - (fresh as unknown as PaintedLand).heightAt(x, z)));
}
check('its heights within a few centimetres of built afresh', drift < 0.05, `${drift.toFixed(4)} m apart at most`);

// Another earthwork given while one is being fitted and painted: it waits its turn, and what's drawn is both.
const second = { x: 30, y: 20, width: 2, height: 2 }, raised = new Float32Array(16).fill(9 * LEVEL);
land.update({ x: 4, y: 4, width: 2, height: 2 }, { corners: new Float32Array(16).fill(2 * LEVEL), worked: new Uint8Array(4).fill(1) });
land.step(0); land.step(0);
adder.reset();
land.update(second, { corners: raised, worked: new Uint8Array(4).fill(1) });
while (!land.step(0));
check('each swapped in on its own', adder.changes === 2, `${adder.changes} swaps`);
for (const [r, h] of [[{ x: 4, y: 4 }, 2], [second, 9]] as const) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const t = (r.y + j) * W + r.x + i; now.corners.fill(h * LEVEL, t * 4, t * 4 + 4); now.worked[t] = 1; }
const fresh2 = new PaintedLand(new Adder(), now) as unknown as Record<string, Float32Array>;
check('two earthworks, the second given while the first is painted: both drawn', Math.abs(land.heightAt(...world(5, 5)) - 2) < 1e-9 && Math.abs(land.heightAt(...world(31, 21)) - 9) < 1e-9);
check('and its paint as built afresh', same(after.paint, fresh2.paint) && same(after.dry, fresh2.dry));
const drawnNow = triangles(adder);
check('and drawn: the raised tiles\' tops at their level', drawnNow.some((t) => Math.abs(t.a.x - world(31, 21)[0]) < 2 && Math.abs(t.a.z - world(31, 21)[1]) < 2 && Math.abs(t.a.y - 9) < 1e-6));

// 3. The country beyond.
console.log('The country beyond');
const edgeX = X0 + W * TILE, mid = Z0 + 10 * TILE;
check('it meets the land\'s edge', Math.abs(land.heightAt(edgeX + 1e-6, mid) - land.heightAt(edgeX - 1e-6, mid)) < 1e-3);
const b = map.beyond!, gx = b.x0 + 18 * b.cell, gz = b.z0 + 2 * b.cell;
check('further out, the grid\'s heights', Math.abs(land.heightAt(gx, gz) - b.height[2 * b.nx + 18]) < 1e-5, `${land.heightAt(gx, gz)} for ${b.height[2 * b.nx + 18]}`);

// A tile turned to water: until it's fitted, the land answers as it was (not the new bed on the old ground).
const pondAt = world(26.5, 4.5), pondBefore = land.heightAt(...pondAt), pondTile = 4 * W + 26;
land.update({ x: 26, y: 4, width: 1, height: 1 }, { corners: map.corners.slice(pondTile * 4, pondTile * 4 + 4).map((c) => Math.round(c / LEVEL) * LEVEL), worked: new Uint8Array([1]), cover: new Uint8Array([LAND_COVER.water]) });
let midFit = true;
for (let k = 0; k < 40 && !land.step(0); k++) if ((land as unknown as { fitting: unknown }).fitting && land.heightAt(...pondAt) !== pondBefore) midFit = false;
while (!land.step(0));
check('a tile turned to water: as it was until fitted, then its bed', midFit && land.heightAt(...pondAt) < pondBefore - 0.3, `${pondBefore} then ${land.heightAt(...pondAt)}`);

// The land's edge raised: the country beyond made again to meet it.
const apronAt = () => {
  const g = (land as unknown as { apronGeometry: THREE.BufferGeometry }).apronGeometry, pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) if (Math.abs(pos.getX(i) - X0) < 1e-6 && Math.abs(pos.getZ(i) - (Z0 + 48)) < 1e-6) return pos.getY(i);
  return NaN;
};
const edgeRect = { x: 0, y: 8, width: 2, height: 6 }, edgeLevel = Math.round(land.heightAt(X0, Z0 + 48) / LEVEL) + 4;
land.update(edgeRect, { corners: new Float32Array(48).fill(edgeLevel * LEVEL), worked: new Uint8Array(12).fill(1) });
while (!land.step(0));
check('an earthwork at the land\'s edge: the country beyond meets it still', Math.abs(apronAt() - land.heightAt(X0, Z0 + 48)) < 1e-6 && Math.abs(apronAt() - edgeLevel * LEVEL) < 1e-6, `${apronAt()} for ${land.heightAt(X0, Z0 + 48)}`);

// The land taken away: everything it made freed.
adder.reset();
const live = adder.live.size;
land.dispose();
check('taken away, every mesh out and freed', adder.live.size === 0 && adder.removed === live && adder.freed === live, `${adder.live.size} left, ${adder.freed} of ${live} freed`);

// 4. The map's border (#269).
console.log('The map\'s border');
/** Each top vertex's colour drawn by a land in a look, by its place (the country beyond's apart). */
function topColours(look: LandLook, Land: typeof PaintedLand = PaintedLand) {
  const a = new Adder(), l = new Land(a, makeLand(), look), apron = (l as unknown as { apron: THREE.Mesh }).apron;
  const land = new Map<string, number[]>(), beyond = new Map<string, number[]>();
  for (const m of a.live) {
    const g = m.geometry, pos = g.getAttribute('position'), nrm = g.getAttribute('normal'), col = g.getAttribute('color');
    for (let i = 0; i < pos.count; i++) {
      if (nrm.getY(i) < 0.5) continue;
      (m === apron ? beyond : land).set(`${pos.getX(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`, [col.getX(i), col.getY(i), col.getZ(i)]);
    }
  }
  return { land, beyond };
}
const drawn = topColours(LAND_LOOK);
/** How far (tiles) a place is out of the map (less than 0: in it), as its key has it. */
const outOfMap = (key: string) => {
  const [x, z] = key.split(',').map(Number), px = (x - X0) / TILE, py = (z - Z0) / TILE, m = map.map;
  const ox = Math.max(m.x - px, px - (m.x + m.width)), oy = Math.max(m.y - py, py - (m.y + m.height));
  return ox > 0 || oy > 0 ? Math.hypot(Math.max(0, ox), Math.max(0, oy)) : Math.max(ox, oy);
};
const diff = (p: number[], q: number[]) => Math.max(...p.map((v, k) => Math.abs(v - q[k])));
// The map's tiles not dulled, to their very edge: as a land whose country isn't dull has them.
const bright = topColours({ ...LAND_LOOK, beyond: { light: 1, chroma: 1 } });
{
  let worst = 0, n = 0;
  for (const [key, c] of drawn.land) if (outOfMap(key) <= 1e-9) { worst = Math.max(worst, diff(c, bright.land.get(key)!)); n++; }
  check('the map\'s tiles not dulled, to their very edge', n > 100 && worst < 1e-6, `${worst} off, over ${n}`);
}
/**
 * The land drawn as dull as the country everywhere, map and all: each point's paint fully dulled as it's read, and no fade
 * on top (apart from the land's own dulling, so a fade drawn weaker or stronger than it means shows).
 */
type Painter = { colourAt(px: number, py: number, c: THREE.Color): number; dull(c: THREE.Color): void };
const allDull = topColours(LAND_LOOK, class extends (PaintedLand as unknown as new (...a: unknown[]) => Painter) {
  colourAt(px: number, py: number, c: THREE.Color) { const meadow = super.colourAt(px, py, c); this.dull(c); return meadow; }
  dullness() { return 0; }
} as unknown as typeof PaintedLand);
const land0 = new PaintedLand(new Adder(), makeLand());
const meant = (px: number, py: number) => (land0 as unknown as { dullness(px: number, py: number): number }).dullness(px, py);
/**
 * How much of the country's dullness a top took, read off the colour drawn: where it sits between how it's drawn not
 * dulled (`bright`) and fully dulled (`allDull`), 0 to 1; NaN where the two are too alike to tell.
 */
const tookDull = (key: string, c: number[]) => {
  const b = bright.land.get(key)!, f = allDull.land.get(key)!;
  const span = f.map((v, k) => v - b[k]), len = span.reduce((s, v) => s + v * v, 0);
  return len < 1e-8 ? NaN : span.reduce((s, v, k) => s + v * (c[k] - b[k]), 0) / len;
};
/**
 * The tops a band (tiles out of the map) holds: how dull each was drawn, and how dull the land means it. Not those within
 * a cell of the country beyond's grid of the land's outer edge, whose colour runs to the country beyond's there.
 */
const band = (from: number, to: number) => {
  const out: { took: number; meant: number }[] = [], reach = map.beyond!.cell / TILE;
  for (const [key, c] of drawn.land) {
    const d = outOfMap(key), [x, z] = key.split(',').map(Number), px = (x - X0) / TILE, py = (z - Z0) / TILE;
    if (d < from || d >= to || Math.min(px, W - px, py, H - py) < reach) continue;
    const took = tookDull(key, c);
    if (!Number.isNaN(took)) out.push({ took, meant: meant(px, py) });
  }
  return out;
};
{
  // Past the fade (it ends at most 3.35 tiles out), every top drawn fully dull.
  const past = band(3.5, Infinity), worst = Math.max(...past.map((t) => Math.abs(1 - t.took)));
  check('the country past the fade drawn fully dull', past.length > 100 && worst < 1e-4, `${worst} short, over ${past.length}`);
}
{
  // In the fade, each top drawn as dull as the land means it: the fade is what's painted, not only worked out.
  const fade = band(0, 3.5), worst = Math.max(...fade.map((t) => Math.abs(t.took - t.meant)));
  check('the fade\'s tops drawn as dull as it means', fade.length > 100 && worst < 1e-4, `${worst} off, over ${fade.length}`);
}
/** How bright the tops are, on average, at d (tiles) out of the map. */
const brightness = (from: number, to: number) => {
  let s = 0, n = 0;
  for (const [key, c] of drawn.land) { const d = outOfMap(key); if (d >= from && d < to) { s += c[0] + c[1] + c[2]; n++; } }
  return s / n;
};
const [inMap, firstTile, pastFade] = [brightness(-3, -1.5), brightness(0.75, 1.25), brightness(3.5, 5)];
check('a tile out, between the map\'s brightness and the country\'s', firstTile < inMap && firstTile > pastFade, `${inMap.toFixed(3)}, ${firstTile.toFixed(3)}, ${pastFade.toFixed(3)}`);
{
  // The fade's outer edge wanders: the tops a tile and a half out, round the map, drawn some fully dull and some barely.
  const at = band(1.25, 1.75).map((t) => t.took), lo = Math.min(...at), hi = Math.max(...at);
  check('the fade\'s outer edge wanders along the map\'s sides', at.length > 20 && hi - lo > 0.3, `${lo.toFixed(2)} to ${hi.toFixed(2)} over ${at.length} tops a tile and a half out`);
}
{
  // Every point of the land's outer edge as the country beyond draws it there: straight between its vertices on the edge.
  // Each side: where a point on it is across (x, or z) and along it.
  const sides = [[0, X0], [0, X0 + W * TILE], [1, Z0], [1, Z0 + H * TILE]].map(([k, at]) => ({
    on: (x: number, z: number) => Math.abs([x, z][k] - at) < 1e-6, along: (x: number, z: number) => [z, x][k],
  }));
  let worstEdge = 0, n = 0;
  for (const { on, along } of sides) {
    const grid = [...drawn.beyond].map(([key, c]) => [key.split(',').map(Number), c] as const)
      .filter(([[x, z]]) => on(x, z)).map(([[x, z], c]) => [along(x, z), c] as const).sort((p, q) => p[0] - q[0]);
    for (const [key, c] of drawn.land) {
      const [x, z] = key.split(',').map(Number);
      if (!on(x, z)) continue;
      const s = along(x, z), i = grid.findIndex(([g], k) => k + 1 < grid.length && g <= s + 1e-6 && grid[k + 1][0] >= s - 1e-6);
      if (i < 0) { worstEdge = Infinity; continue; }
      const [s0, c0] = grid[i], [s1, c1] = grid[i + 1], t = (s - s0) / (s1 - s0);
      worstEdge = Math.max(worstEdge, diff(c, c0.map((v, k) => v + (c1[k] - v) * t)));
      n++;
    }
  }
  check('the country beyond and the land one colour all along where they meet', n > 100 && worstEdge < 1e-5, `${worstEdge} off, over ${n} points`);
}
land0.dispose();

// 5. Refused: corners that aren't whole levels.
let threw = false;
try { new PaintedLand(new Adder(), { ...makeLand(), corners: new Float32Array(W * H * 4).fill(0.5) }); } catch { threw = true; }
check('corners that aren\'t whole levels are refused', threw);

if (failed) process.exit(1);
