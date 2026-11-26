// Saves: a rich mid-game homestead written out and read back is the same homestead, and runs on exactly as it would have;
// a save from another version, or a broken one, is refused in plain words without throwing.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, canPlace, compostField, deserializeSave, FERTILITY_SAVE_EPS, type GameState, generateValley, liveEnv, must, naturalFertility, OLD_SAVE,
  type Point2, previewChannelFlow, serializeSave, STATE_VERSION, stepSim, type ThingKind,
} from '../src/game/index.ts';
import { brookSpot, build, done, joinMain, same } from './helpers.ts';

/** Places a thing near the first of `anchors` with room for it. */
function buildNear(s: GameState, kind: ThingKind, anchors: readonly Point2[], yaw = 0): number {
  for (const a of anchors) {
    for (let r = 0; r <= 14; r++) for (let k = 0; k < 16; k++) {
      const x = a.x + r * Math.cos((k * Math.PI) / 8), z = a.z + r * Math.sin((k * Math.PI) / 8);
      if (canPlace(s, kind, x, z, yaw).ok) return must(done(apply(s, { type: 'place', kind, x, z, yaw }), kind).created, kind);
      if (r === 0) break;
    }
  }
  return assert.fail(`no room for a ${kind}`);
}

/** Runs `hours` game hours in the valley's living weather. */
function run(s: GameState, hours: number) {
  for (let k = 0; k < hours * 30; k++) stepSim(s, 1, liveEnv(s));
}

/**
 * A homestead well under way (seed 1042, spring, in Sandbox so the test needn't count Supplies): the Farmhouse, the Silo, the
 * Garage and two carts, the Mill, Coop and a Bakery baking Honey Cake, a Beehive, a Rain Tank, a Heated Greenhouse growing
 * tomatoes, a fuelled Biogas Digester and a water wheel, wheat and bean fields along a dug rill, a curving track over it
 * on a plank bridge, a hedgerow, a planted tree, and a day of living weather behind it.
 */
function homestead(): GameState {
  const s = generateValley(1042, 'spring', { sandbox: true, weatherSeed: 55, climate: 'wet' }), h = s.valley.homestead;
  done(apply(s, { type: 'place', kind: 'farmhouse', x: h.x, z: h.z, yaw: 0 }), 'the farmhouse');
  let dug = false;
  for (const off of [12, 16, 8, 20]) for (const deg of [70, 60, 80, 90]) {
    if (dug) break;
    const pts = brookSpot(s, off).stroke(deg, 30);
    if (previewChannelFlow(s, pts).wetLength < 18) continue;
    dug = apply(s, { type: 'digChannel', points: pts }).ok;
  }
  assert.ok(dug, 'a rill that runs');
  const P = s.channels[0].path, n = P.length;
  const beside = (k: number, d: number): Point2 => {
    const a = P[Math.max(0, k - 2)], b = P[Math.min(n - 1, k + 2)], L = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: P[k].x - ((b.z - a.z) / L) * d, z: P[k].z + ((b.x - a.x) / L) * d };
  };
  const wheatPts = [0.25, 0.45, 0.65, 0.8].map((f) => beside(Math.floor(n * f), 2.6));
  done(apply(s, { type: 'paintField', crop: 'wheat', points: wheatPts, radius: 2.3 }), 'the wheat');
  done(apply(s, { type: 'paintField', crop: 'beans', points: [0.25, 0.45, 0.65].map((f) => beside(Math.floor(n * f), -2.6)), radius: 2.3 }), 'the beans');
  const k = Math.floor(n * 0.92), a0 = P[k - 2], a1 = P[k + 2], L = Math.hypot(a1.x - a0.x, a1.z - a0.z);
  const perp = { x: -(a1.z - a0.z) / L, z: (a1.x - a0.x) / L }, C = P[k];
  const D = s.tracks[0].points[s.tracks[0].points.length - 1];
  const c1 = { x: C.x + perp.x * 7, z: C.z + perp.z * 7 }, c2 = { x: C.x - perp.x * 7, z: C.z - perp.z * 7 };
  const [near, far] = Math.hypot(c1.x - D.x, c1.z - D.z) < Math.hypot(c2.x - D.x, c2.z - D.z) ? [c1, c2] : [c2, c1];
  done(apply(s, { type: 'addTrack', points: [D, near, far, { x: 5, z: -36 }, { x: 22, z: -36 }] }), 'the track');
  assert.ok(s.bridges.length >= 1, 'a plank bridge over the rill');

  build(s, 'silo', { x: 0, z: -43 });
  build(s, 'garage', { x: 10, z: -43 }, Math.PI);
  build(s, 'mill', { x: -10, z: -42 });
  build(s, 'coop', { x: 22, z: -44 });
  const bakery = build(s, 'bakery', { x: -20, z: -40 });
  done(apply(s, { type: 'setRecipe', id: bakery, recipe: 'honey_cake' }), 'honey cake');
  const spots = [{ x: 0, z: -28 }, { x: -22, z: -28 }, { x: 30, z: -20 }, { x: -32, z: -44 }, { x: h.x + 22, z: h.z }, { x: h.x - 22, z: h.z }, { x: h.x, z: h.z + 22 }];
  const glass = buildNear(s, 'greenhouse', spots);
  done(apply(s, { type: 'setGreenhouseCrop', id: glass, crop: 'tomato' }), 'tomatoes under glass');
  const digester = buildNear(s, 'digester', [{ x: 22, z: -28 }, ...spots]);
  must(s.sim.things.get(digester), 'the digester').inputs.manure = 3;
  let wheel = -1;
  for (let along = -14; along <= 14 && wheel < 0; along += 2) {
    const p = brookSpot(s, 0).at(along, 5.5);
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      if (wheel >= 0) break;
      const r = apply(s, { type: 'place', kind: 'waterwheel', x: p.x, z: p.z, yaw });
      if (r.ok) wheel = must(r.value.created, 'the wheel');
    }
  }
  assert.ok(wheel >= 0, 'a water wheel');
  buildNear(s, 'battery', [{ x: 20, z: -34 }, ...spots]);
  buildNear(s, 'beehive', [{ x: 2, z: -36 }, ...spots]);
  build(s, 'rain_tank', wheatPts[0]);
  for (const v of [...s.things]) if (v.kind !== 'depot' && v.kind !== 'relay' && v.kind !== 'beehive' && v.kind !== 'rain_tank') joinMain(s, wheel, v.id);
  done(apply(s, { type: 'buyCart' }), 'a second cart');
  let hedged = false;
  for (let a = 0; a < 16 && !hedged; a++) {
    const c = Math.cos((a * Math.PI) / 8), sn = Math.sin((a * Math.PI) / 8), at = (r: number, side: number) => ({ x: h.x + c * r - sn * side, z: h.z + sn * r + c * side });
    hedged = apply(s, { type: 'addHedge', points: [at(11, -3), at(12, 0), at(11, 3)] }).ok;
  }
  assert.ok(hedged, 'a curving hedgerow');
  let planted = false;
  for (let r = 6; r < 20 && !planted; r++) for (let a = 0; a < 12 && !planted; a++) planted = apply(s, { type: 'plantTree', x: h.x + r * Math.cos(a), z: h.z + r * Math.sin(a), species: 'apple' }).ok;
  assert.ok(planted, 'a planted tree');
  // Compost on the beans, so their soil lies off its own.
  compostField(s, must(s.fields.find((f) => f.crop === 'beans'), 'the beans'));
  run(s, 26);
  return s;
}

/** Everything a homestead is, as plain data (the grid's live layers too), to compare two of them. */
function snapshot(s: GameState) {
  const g = s.grid, sim = s.sim, rest: Partial<GameState> = { ...s };
  delete rest.grid;
  delete rest.sim;
  const layers = ['height', 'landHeight', 'cover', 'worked', 'waterLevel', 'flowX', 'flowZ', 'moisture', 'flood', 'fieldOf'] as const;
  return {
    ...JSON.parse(JSON.stringify(rest)),
    sim: JSON.parse(JSON.stringify({ ...sim, things: [...sim.things.entries()] })),
    layers: Object.fromEntries(layers.map((k) => [k, Array.from(g[k]).map((v) => (Number.isFinite(v) ? v : String(v)))])),
  };
}

function assertFertility(a: GameState, b: GameState) {
  let worst = 0;
  for (let i = 0; i < a.grid.fertility.length; i++) worst = Math.max(worst, Math.abs(a.grid.fertility[i] - b.grid.fertility[i]));
  assert.ok(worst <= FERTILITY_SAVE_EPS + 1e-6, `fertility within ${FERTILITY_SAVE_EPS} (${worst.toFixed(5)})`);
}

const reload = (s: GameState): GameState => {
  const r = deserializeSave(serializeSave(s));
  assert.ok(r.ok, r.ok ? '' : r.error);
  return r.value;
};

test('a homestead well under way is saved small and loads back the same', (t) => {
  const s = homestead(), text = serializeSave(s);
  t.diagnostic(`save: ${(text.length / 1024).toFixed(1)} KB; ${s.things.length} things, ${s.fields.length} fields, ${s.sim.carts.length} carts`);
  assert.ok(text.length < 60 * 1024, `a small save (${text.length} bytes)`);
  const kinds = new Set(s.things.map((v) => v.kind));
  for (const k of ['farmhouse', 'silo', 'garage', 'mill', 'bakery', 'beehive', 'rain_tank', 'greenhouse', 'digester'] as const) assert.ok(kinds.has(k), k);
  assert.equal(s.sim.carts.length, 2);
  assert.ok(s.sim.carts.some((c) => c.cargo !== null || c.job !== null), 'a cart under way');
  assert.ok(s.sim.brief.steadyHomestead.hours > 0 && !s.sim.brief.steadyHomestead.done, 'Steady Homestead part-way');
  assert.ok([...s.sim.things.values()].some((r) => r.kind === 'digester' && Object.keys(r.inputs).length > 0), 'a fuelled Digester');
  assert.ok(s.fields.some((f) => f.pollinated > 0) || s.fields.some((f) => f.growth > 0.3), 'crops under way');
  let farmed = 0;
  for (let i = 0; i < s.grid.fertility.length; i++) if (Math.abs(s.grid.fertility[i] - naturalFertility(s.grid, i)) > FERTILITY_SAVE_EPS) farmed++;
  assert.ok(farmed > 20, `farmed soil (${farmed} cells)`);

  const back = must((() => { const r = deserializeSave(text); return r.ok ? r.value : undefined; })(), 'the loaded homestead');
  assert.deepEqual(snapshot(back), snapshot(s));
  assertFertility(back, s);
  assert.ok(same(back.grid.baseHeight, s.grid.baseHeight));
  assert.deepEqual(back.bridges, s.bridges);
  assert.equal(back.sim.things.get(must(s.things.find((v) => v.kind === 'bakery'), 'bakery').id)?.recipe, 'honey_cake');
  // Written again, the same text.
  assert.equal(serializeSave(back), text);

  // And it runs on as the homestead would have (the soil within the save's thousandths).
  run(s, 6);
  run(back, 6);
  const a = snapshot(s), b = snapshot(back);
  assert.deepEqual([b.sim.day, b.sim.hour, b.sim.supplies, b.sim.delivered, b.sim.weather, b.sim.carts.map((c: { state: string }) => c.state)],
    [a.sim.day, a.sim.hour, a.sim.supplies, a.sim.delivered, a.sim.weather, a.sim.carts.map((c: { state: string }) => c.state)]);
  assert.deepEqual(b.sim.brief.steadyHomestead, a.sim.brief.steadyHomestead);
  assert.deepEqual(b.sim.brief.order, a.sim.brief.order);
  assert.deepEqual(b.sim.things, a.sim.things);
  for (const [i, f] of s.fields.entries()) {
    const g = back.fields[i];
    assert.deepEqual([g.id, g.crop, g.harvestReady, g.frosted, g.flooded], [f.id, f.crop, f.harvestReady, f.frosted, f.flooded]);
    // A harvest takes the field's fertility from its cells, which the save keeps to the thousandth.
    assert.ok(Math.abs(g.growth - f.growth) < 1e-4 && Math.abs(g.fertility - f.fertility) <= FERTILITY_SAVE_EPS, `field ${f.id} grows on alike`);
  }
  assertFertility(back, s);
});

test('a fresh campaign or Sandbox valley round-trips too', () => {
  for (const s of [generateValley(3117, 'spring', { terrain: 'floodplain', climate: 'highRiver', campaignId: 'fern-bend', valleyTitle: 'Fernwater Bend', order: { honey_cake: 4 }, suppliesCap: 21, starterSupplies: 13 }),
    generateValley(12, 'winter', { terrain: 'glen', sandbox: true })]) {
    const back = reload(s);
    assert.deepEqual(snapshot(back), snapshot(s));
    assert.deepEqual([back.terrain, back.sandbox, back.campaignId, back.valleyTitle], [s.terrain, s.sandbox, s.campaignId, s.valleyTitle]);
  }
});

test('a save from another version, or a broken one, is refused in plain words without throwing', () => {
  const s = generateValley(7, 'summer'), good = JSON.parse(serializeSave(s)) as Record<string, unknown>;
  const tampered = (edit: (d: Record<string, unknown>) => void) => {
    const d = structuredClone(good);
    edit(d);
    return JSON.stringify(d);
  };
  const sim = (d: Record<string, unknown>) => d.sim as Record<string, unknown>;
  const refuse = (raw: string, why?: RegExp | string) => {
    let r: ReturnType<typeof deserializeSave> | undefined;
    assert.doesNotThrow(() => { r = deserializeSave(raw); });
    assert.ok(r && !r.ok, `refused: ${raw.slice(0, 60)}`);
    if (r && !r.ok && why !== undefined) {
      if (typeof why === 'string') assert.equal(r.error, why);
      else assert.match(r.error, why);
    }
  };
  refuse(tampered((d) => { d.version = 9; }), OLD_SAVE);
  refuse(tampered((d) => { d.version = 99; }), OLD_SAVE);
  refuse(tampered((d) => { d.version = String(STATE_VERSION); }), OLD_SAVE);
  refuse(tampered((d) => { delete d.version; }));
  refuse('{ not json');
  refuse('');
  refuse('null');
  refuse('[1, 2]');
  refuse(tampered((d) => { delete d.sim; }), /damaged/);
  refuse(tampered((d) => { delete d.things; }), /damaged/);
  refuse(tampered((d) => { delete (d.valley as Record<string, unknown>).seed; }), /damaged/);
  refuse(tampered((d) => { (d.valley as Record<string, unknown>).season = 'monsoon'; }), /damaged/);
  refuse(tampered((d) => { (d.valley as Record<string, unknown>).terrain = 'volcano'; }), /damaged/);
  refuse(tampered((d) => { (d.valley as Record<string, unknown>).climate = 'tropical'; }), /damaged/);
  refuse(tampered((d) => { (d.things as Record<string, unknown>[])[0].kind = 'castle'; }), /damaged/);
  refuse(tampered((d) => { (d.things as Record<string, unknown>[])[0].x = 'east'; }), /damaged/);
  refuse(tampered((d) => { d.things = []; }), /Depot/);
  refuse(tampered((d) => { d.fields = [{ id: 1, crop: 'rice', growth: 0, fertility: 0.8, harvestReady: 0, pollinated: 0, frosted: false, flooded: false, avgMoisture: 0, cells: [100, 2] }]; }), /damaged/);
  refuse(tampered((d) => { d.fields = [{ id: 1, crop: 'wheat', growth: 0, fertility: 0.8, harvestReady: 0, pollinated: 0, frosted: false, flooded: false, avgMoisture: 0, cells: [25590, 99] }]; }), /damaged/);
  refuse(tampered((d) => { d.fertility = [[-4, 800]]; }), /damaged/);
  refuse(tampered((d) => { sim(d).hour = 'noon'; }), /damaged/);
  refuse(tampered((d) => { sim(d).hour = 31; }), /damaged/);
  refuse(tampered((d) => { sim(d).delivered = { gold: 3 }; }), /damaged/);
  refuse(tampered((d) => { (sim(d).weather as Record<string, unknown>).spell = 'hail'; }), /damaged/);
  refuse(tampered((d) => { sim(d).weatherOverride = 'hail'; }), /damaged/);
  refuse(tampered((d) => { (sim(d).supplies as Record<string, unknown>).available = 500; }), /damaged/);
  refuse(tampered((d) => { (sim(d).brief as Record<string, unknown>).order = null; }), /damaged/);
  refuse(tampered((d) => { (sim(d).things as unknown[]).push([4242, { kind: 'mill' }]); }), /damaged/);
  refuse(tampered((d) => { (d.channels as unknown[]).push({ id: 5, points: [{ x: 'a', z: 0 }] }); }), /damaged/);
  // Untouched, it loads.
  assert.ok(deserializeSave(JSON.stringify(good)).ok);
});
