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
// 4. The shores (src/land/shore.ts, Soil-n-Silo#258), on a flat land with a pond, a narrow staircase of a river, a lone
//    tile of water and a pad by the pond, in each way they're drawn: as the tiles' squares (off), the pond's corners under
//    water; curving, its corners dry, every tile of narrow water wet at its middle, the bank cut into only near the water,
//    the pad at its level; no holes and drawn where heightAt says; after an earthwork by the water (a bank raised), as
//    built afresh.
// Exits with 1 if anything is off.
import * as THREE from 'three';
import { LAND_COVER, LAND_GROUND, type LandMap } from '../src/land/map.ts';
import { LAND_LOOK, PaintedLand, type LandAdder } from '../src/land/paint.ts';
import { SHORE_MODES } from '../src/land/shore.ts';
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
/** The highest top drawn over a point of these triangles, or null where nothing is. */
function topsOf(tris: ReturnType<typeof triangles>) {
  const B = 4, buckets = new Map<string, number[]>();
  tris.forEach((t, i) => {
    const xs = [t.a.x, t.b.x, t.c.x], zs = [t.a.z, t.b.z, t.c.z];
    for (let bx = Math.floor(Math.min(...xs) / B); bx <= Math.floor(Math.max(...xs) / B); bx++) for (let bz = Math.floor(Math.min(...zs) / B); bz <= Math.floor(Math.max(...zs) / B); bz++) {
      const key = `${bx},${bz}`;
      buckets.set(key, [...(buckets.get(key) ?? []), i]);
    }
  });
  return (x: number, z: number): number | null => {
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
  };
}
const tris = triangles(adder), drawnAt = topsOf(tris);
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

// 4. The shores: a flat land 24 x 20 at level 2, a pond 5 x 4 (a pad two tiles square by its east side), a river a tile
// wide stepping down to the south-east, a lone tile of water; the water's sheet under its tiles' level as the game lays it.
console.log('The shores');
const SW = 24, SH = 20, FLAT = 2, WATER_DOWN = 0.48;
const pond = (x: number, y: number) => x >= 6 && x <= 10 && y >= 5 && y <= 8;
const stairs = (x: number, y: number) => y >= 11 && y <= 16 && (x === y + 2 || x === y + 3);
const lone = (x: number, y: number) => x === 18 && y === 4;
const pad = (x: number, y: number) => x >= 11 && x <= 12 && y >= 5 && y <= 6;
function shoreLand(raised?: { x: number; y: number }): LandMap {
  const n = SW * SH, cover = new Uint8Array(n).fill(LAND_COVER.grass), worked = new Uint8Array(n), corners = new Float32Array(n * 4).fill(FLAT * LEVEL);
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    const wet = pond(x, y) || stairs(x, y) || lone(x, y), up = raised?.x === x && raised.y === y;
    if (wet) cover[y * SW + x] = LAND_COVER.water;
    if (wet || pad(x, y) || up) worked[y * SW + x] = 1;
    if (up) corners.fill((FLAT + 1) * LEVEL, (y * SW + x) * 4, (y * SW + x) * 4 + 4);
  }
  return {
    width: SW, height: SH, tile: TILE, level: LEVEL, x0: 0, z0: 0, corners, worked, cover,
    ground: new Uint8Array(n), map: { x: 2, y: 2, width: 20, height: 16 },
    beyond: { nx: 9, nz: 9, cell: 16, x0: -32, z0: -32, height: new Float32Array(81).fill(FLAT * LEVEL) },
  };
}
const surfaceH = (px: number, py: number, l: PaintedLand) => l.heightAt(px * TILE, py * TILE);
const wetAt = (px: number, py: number, l: PaintedLand) => surfaceH(px, py, l) < FLAT * LEVEL - WATER_DOWN;
const square = new PaintedLand(new Adder(), shoreLand(), { ...LAND_LOOK, shores: 'off' });
check('off: the pond\'s corners under water, as its tiles are', wetAt(6.4, 5.4, square) && wetAt(10.6, 8.6, square));
for (const mode of SHORE_MODES.filter((m) => m !== 'off')) {
  const sAdder = new Adder(), l = new PaintedLand(sAdder, shoreLand(), { ...LAND_LOOK, shores: mode });
  check(`${mode}: the pond's corners dry, its middle deep`, !wetAt(6.4, 5.4, l) && !wetAt(10.6, 8.6, l) && !wetAt(6.4, 8.6, l)
    && surfaceH(8.5, 7, l) < FLAT * LEVEL - 1);
  let dryMiddles = 0;
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if ((stairs(x, y) || lone(x, y)) && !wetAt(x + 0.5, y + 0.5, l)) dryMiddles++;
  check(`${mode}: every tile of the narrow river and the lone tile wet at its middle`, dryMiddles === 0, `${dryMiddles} dry`);
  // The bank cut into only within half a tile of the water (clear of what stands in a tile's middle), and the pad not at all.
  let cutFar = 0, padOff = 0, cutNear = 0;
  for (let py = 0.03; py < SH; py += 0.07) for (let px = 0.03; px < SW; px += 0.07) {
    const x = Math.floor(px), y = Math.floor(py);
    if (square.heightAt(px * TILE, py * TILE) !== FLAT * LEVEL) continue; // (the water's own tiles)
    let near = Infinity;
    for (let v = y - 1; v <= y + 1; v++) for (let u = x - 1; u <= x + 1; u++) if (pond(u, v) || stairs(u, v) || lone(u, v)) near = Math.min(near, Math.hypot(Math.max(u - px, 0, px - u - 1), Math.max(v - py, 0, py - v - 1)));
    const h = surfaceH(px, py, l);
    if (pad(x, y) && h !== FLAT * LEVEL) padOff++;
    else if (near > 0.45 && h !== FLAT * LEVEL) cutFar++;
    else if (h < FLAT * LEVEL - 1e-3) cutNear++;
  }
  check(`${mode}: the bank cut into only near the water, the pad at its level`, cutFar === 0 && padOff === 0 && cutNear > 0, `${cutFar} points cut far from the water, ${padOff} on the pad, ${cutNear} near`);
  const tops = topsOf(triangles(sAdder));
  let sHoles = 0, sOff = 0;
  for (let py = 0.013; py < SH; py += 0.093) for (let px = 0.011; px < SW; px += 0.089) {
    const y = tops(px * TILE, py * TILE);
    if (y === null) sHoles++;
    else if (Math.abs(y - surfaceH(px, py, l)) > 0.25) sOff++;
  }
  check(`${mode}: no holes, drawn where heightAt says (within 25 cm)`, sHoles === 0 && sOff === 0, `${sHoles} holes, ${sOff} off`);
  // An earthwork by the water (the game's never move it): a bank tile raised a level and worked, a pad by the pond.
  const raise = { x: 7, y: 9 };
  l.update({ ...raise, width: 1, height: 1 }, { corners: new Float32Array(4).fill((FLAT + 1) * LEVEL), worked: new Uint8Array([1]) });
  while (!l.step(0));
  const fresh = new PaintedLand(new Adder(), shoreLand(raise), { ...LAND_LOOK, shores: mode }) as unknown as { shore: { field: Float32Array } } & Record<string, Float32Array>;
  const was = l as unknown as { shore: { field: Float32Array } } & Record<string, Float32Array>;
  check(`${mode}: an earthwork by the water: its shores and paint as built afresh`, same(was.shore.field, fresh.shore.field) && same(was.paint, fresh.paint) && same(was.landPaint, fresh.landPaint));
}

// 5. Refused: corners that aren't whole levels.
let threw = false;
try { new PaintedLand(new Adder(), { ...makeLand(), corners: new Float32Array(W * H * 4).fill(0.5) }); } catch { threw = true; }
check('corners that aren\'t whole levels are refused', threw);

if (failed) process.exit(1);
