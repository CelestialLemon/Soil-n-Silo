// Saves: a rich mid-game homestead written out and read back is the same homestead, and runs on exactly as it would have;
// a save from another version, or a broken one, is refused in plain words without throwing.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, CATALOG, canPlace, compostField, COVER, deserializeSave, type GameState, generateProceduralValley, generateValley, liveEnv,
  MAX_SAVE_BYTES, must, naturalFertility, OLD_SAVE, padTarget, type Point2, previewChannelFlow, runtimeOf, serializeSave, spend,
  startCampaignValley, STATE_VERSION, stepSim, type ThingKind,
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

/** The soil's fertility, cell for cell and bit for bit. */
function assertFertility(a: GameState, b: GameState) {
  assert.ok(same(a.grid.fertility, b.grid.fertility), 'the same fertility in every cell');
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
  for (let i = 0; i < s.grid.fertility.length; i++) if (s.grid.fertility[i] !== Math.fround(naturalFertility(s.grid, i))) farmed++;
  assert.ok(farmed > 20, `farmed soil (${farmed} cells)`);

  const back = must((() => { const r = deserializeSave(text); return r.ok ? r.value : undefined; })(), 'the loaded homestead');
  assert.deepEqual(snapshot(back), snapshot(s));
  assertFertility(back, s);
  assert.ok(same(back.grid.baseHeight, s.grid.baseHeight));
  assert.deepEqual(back.bridges, s.bridges);
  assert.equal(back.sim.things.get(must(s.things.find((v) => v.kind === 'bakery'), 'bakery').id)?.recipe, 'honey_cake');
  // Written again, the same text.
  assert.equal(serializeSave(back), text);

  // And it runs on exactly as the homestead would have.
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
    assert.deepEqual([g.growth, g.fertility], [f.growth, f.fertility], `field ${f.id} grows on alike`);
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

/**
 * A small Sandbox homestead (seed 1042, spring): the Silo, the Garage and its cart, a Wind Turbine, and a wheat field with
 * a ripe harvest waiting at its edge.
 */
function cartYard() {
  const s = generateValley(1042, 'spring', { sandbox: true, weatherSeed: 55 });
  const silo = build(s, 'silo', { x: 0, z: -43 }), garage = build(s, 'garage', { x: 10, z: -43 }, Math.PI);
  build(s, 'turbine', { x: -12, z: -43 });
  let painted = false;
  for (const c of [{ x: -10, z: -30 }, { x: 0, z: -30 }, { x: 10, z: -30 }]) {
    if (!painted) painted = apply(s, { type: 'paintField', crop: 'wheat', points: [c, { x: c.x + 6, z: c.z }], radius: 2.5 }).ok;
  }
  assert.ok(painted, 'a wheat field');
  s.fields[0].harvestReady = 4;
  return { s, silo, garage };
}

const step = (s: GameState) => stepSim(s, 1, liveEnv(s));

test('a cart that has just put its wheat in the Silo saves and loads', () => {
  const { s, silo } = cartYard();
  const wheat = () => must(s.sim.things.get(silo), 'the Silo').outputs.wheat ?? 0;
  for (let k = 0; k < 30 * 24 && wheat() === 0; k++) step(s);
  assert.ok(wheat() > 0, 'the wheat is in the Silo');
  const cart = s.sim.carts[0];
  // It dropped its path when it unloaded: no waypoints, and its cursor back at the start.
  assert.deepEqual([cart.state, cart.path.length, cart.pathIdx], ['idle', 0, 0]);
  const back = reload(s);
  assert.deepEqual(snapshot(back), snapshot(s));
  for (let k = 0; k < 30 * 2; k++) { step(s); step(back); }
  assert.deepEqual(snapshot(back), snapshot(s), 'and it runs on alike');
});

test('a cart that finds no way back to the Garage saves and loads', () => {
  const { s } = cartYard();
  // Set its cart down across the brook from the Garage, heading home on a way the land no longer has.
  const P = s.valley.brook, m = P[Math.floor(P.length / 2)], n = P[Math.floor(P.length / 2) + 2], L = Math.hypot(n.x - m.x, n.z - m.z);
  const cart = s.sim.carts[0];
  let stranded = false;
  for (const side of [1, -1]) {
    if (stranded) break;
    cart.x = m.x - ((n.z - m.z) / L) * 12 * side; cart.z = m.z + ((n.x - m.x) / L) * 12 * side;
    Object.assign(cart, { state: 'returning', path: [{ x: cart.x, z: cart.z }, { x: cart.x + 1, z: cart.z }, { x: cart.x + 2, z: cart.z }], pathIdx: 2, navKey: 'stale', job: null, cargo: null, wait: 0 });
    step(s);
    stranded = cart.jobDesc === 'Waiting: no way back to the Garage';
  }
  assert.ok(stranded, 'stranded across the brook');
  assert.deepEqual([cart.state, cart.path.length, cart.pathIdx], ['idle', 0, 0]);
  assert.deepEqual(snapshot(reload(s)), snapshot(s));
});

test("a cart whose job's building came down while paused loads, and finds its feet on the next step", () => {
  const { s, silo } = cartYard();
  for (let k = 0; k < 30 * 24 && !s.sim.carts.some((c) => c.job?.to.id === silo && c.state === 'toPickup'); k++) step(s);
  const cart = must(s.sim.carts.find((c) => c.job?.to.id === silo), 'a cart bound for the Silo');
  // Taken down while paused: the cart's job and the power's last networks still name it.
  assert.ok(apply(s, { type: 'remove', id: silo }).ok);
  assert.ok(s.sim.networks.some((n) => n.loads.includes(silo)), "the power's last step still lists the Silo");
  const back = reload(s);
  assert.deepEqual(snapshot(back), snapshot(s));
  step(back);
  const again = must(back.sim.carts.find((c) => c.id === cart.id), 'the cart');
  assert.ok(again.job === null || again.job.to.id !== silo, 'it gave up the job');
  assert.ok(!back.sim.networks.some((n) => n.loads.includes(silo)), 'and the power forgot the Silo');
});

test('a Sandbox homestead of more than a thousand sprinklers is affordable, and saves and loads', () => {
  const s = generateValley(12, 'summer', { sandbox: true, terrain: 'floodplain' });
  // Laid out directly on a grid of clear spots (placing each through `apply` re-settles the land every time, which is slow).
  let placed = 0;
  for (let z = -56; z <= 56; z += 2.02) for (let x = -56; x <= 56; x += 3.62) {
    if (!canPlace(s, 'sprinkler', x, z, 0).ok) continue;
    const t = { id: s.nextId++, kind: 'sprinkler' as const, x, z, yaw: 0, padTargetY: 0 };
    t.padTargetY = padTarget(s.grid, t);
    s.things.push(t);
    runtimeOf(s, t.id);
    spend(s.sim.supplies, CATALOG.sprinkler.cost);
    placed++;
  }
  assert.ok(placed > 1000, `${placed} sprinklers`);
  assert.ok(s.sim.supplies.spent > 1000 && s.sim.supplies.unlimited);
  const back = reload(s);
  assert.equal(back.things.filter((t) => t.kind === 'sprinkler').length, placed);
  assert.deepEqual(back.sim.supplies, s.sim.supplies);
  // And taken down and put back the ordinary way, refunded and paid for again.
  const one = must(back.things.find((t) => t.kind === 'sprinkler'), 'a sprinkler');
  assert.ok(apply(back, { type: 'remove', id: one.id }).ok);
  assert.equal(back.sim.supplies.spent, s.sim.supplies.spent - CATALOG.sprinkler.cost);
  assert.ok(apply(back, { type: 'place', kind: 'sprinkler', x: one.x, z: one.z, yaw: 0 }).ok);
  assert.equal(reload(back).sim.supplies.spent, s.sim.supplies.spent);
});

test("the soil's fertility comes back bit for bit, however small the change", () => {
  const s = generateValley(7, 'summer'), g = s.grid;
  const tiny = [100 * 160 + 40, 100 * 160 + 41, 90 * 160 + 80];
  const natural = tiny.map((i) => Math.fround(naturalFertility(g, i)));
  g.fertility[tiny[0]] = natural[0] - 0.001;
  // The next Float32 up from its soil's own: the smallest change there is.
  const bits = new Float32Array([natural[1]]), word = new Uint32Array(bits.buffer);
  word[0]++;
  g.fertility[tiny[1]] = bits[0];
  assert.notEqual(g.fertility[tiny[1]], natural[1]);
  g.fertility[tiny[2]] = 0.849;
  const back = reload(s);
  assert.ok(same(back.grid.fertility, g.fertility), 'every cell bit for bit');
  assert.equal(JSON.parse(serializeSave(s)).fertility.length, 3, 'only the farmed cells are saved');
});

test("a valley keeps how it was made: Custom and its difficulty, a chosen character, or none of those", () => {
  const custom = generateProceduralValley({ seed: 77, season: 'autumn', difficulty: 'tight', climate: 'gales' });
  assert.deepEqual([custom.custom, custom.difficulty, custom.climateOverride, custom.climate], [true, 'tight', 'gales', 'gales']);
  const own = generateProceduralValley({ seed: 78, season: 'summer' });
  assert.deepEqual([own.custom, own.difficulty, own.climateOverride], [true, 'standard', undefined]);
  const campaign = must((() => { const r = startCampaignValley('sun-slope', 5, 'stormy'); return r.ok ? r.value : undefined; })(), 'Suncombe');
  assert.deepEqual([campaign.custom, campaign.campaignId, campaign.climateOverride, campaign.climate], [undefined, 'sun-slope', 'stormy', 'stormy']);
  const meadow = generateValley(1042, 'spring');
  assert.deepEqual([meadow.custom, meadow.difficulty, meadow.climateOverride], [undefined, undefined, undefined]);
  for (const v of [custom, own, campaign, meadow]) {
    const back = reload(v);
    assert.deepEqual([back.custom, back.difficulty, back.climateOverride, back.climate, back.campaignId, back.valleyTitle],
      [v.custom, v.difficulty, v.climateOverride, v.climate, v.campaignId, v.valleyTitle]);
    assert.deepEqual(snapshot(back), snapshot(v));
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

test('a tampered save is refused, never trusted: places, ids, references, the Supplies, the clock and the weather', () => {
  const { s, silo, garage } = cartYard();
  for (let k = 0; k < 30 * 2; k++) step(s);
  const good = JSON.parse(serializeSave(s)) as Record<string, unknown>;
  const valley = generateValley(7, 'summer'), plain = JSON.parse(serializeSave(valley)) as Record<string, unknown>;
  type Rec = Record<string, unknown>;
  type Doc = Rec & { things: Rec[]; channels: Rec[]; tracks: Rec[]; plantedTrees: Rec[]; fields: Rec[]; sim: Rec & { things: unknown[][]; carts: Rec[]; networks: Rec[]; supplies: Rec & { drops: Rec[] }; weather: Rec } };
  const tampered = (edit: (d: Doc) => void, from = good) => { const d = structuredClone(from) as Doc; edit(d); return JSON.stringify(d); };
  const refuse = (raw: string, why: RegExp = /damaged/) => {
    let r: ReturnType<typeof deserializeSave> | undefined;
    assert.doesNotThrow(() => { r = deserializeSave(raw); });
    assert.ok(r && !r.ok, `refused: ${raw.slice(0, 60)}`);
    if (r && !r.ok) { assert.match(r.error, why); assert.ok(r.error.length < 300, 'a short message'); }
  };
  const thing = (d: Doc, id: number) => must(d.things.find((t) => t.id === id), `thing ${id}`);
  const depotId = must(s.things.find((t) => t.kind === 'depot'), 'the Depot').id;
  const crag = must(s.crags[0], 'a crag');
  const next = (d: Doc) => { const id = d.nextId as number; d.nextId = id + 1; return id; };
  // The untouched save loads.
  assert.ok(deserializeSave(JSON.stringify(good)).ok);

  // Places: off the valley, the Depot moved, a forged pad, two buildings on one spot, a building in the brook.
  refuse(tampered((d) => { thing(d, silo).x = 1e6; }));
  refuse(tampered((d) => { thing(d, silo).z = -80; }));
  refuse(tampered((d) => { thing(d, depotId).x = (thing(d, depotId).x as number) + 1; }), /Depot/);
  refuse(tampered((d) => { thing(d, depotId).yaw = (thing(d, depotId).yaw as number) + 0.1; }), /Depot/);
  refuse(tampered((d) => { thing(d, silo).padTargetY = (thing(d, silo).padTargetY as number) + 5; }), /pad/);
  refuse(tampered((d) => { thing(d, silo).padTargetY = 1e300; }));
  // (Moved with the pad its new ground would give it, so only where it stands is wrong.)
  const moveTo = (d: Doc, id: number, x: number, z: number) => {
    const t = thing(d, id);
    Object.assign(t, { x, z, padTargetY: padTarget(s.grid, { kind: t.kind as ThingKind, x, z, yaw: t.yaw as number }) });
  };
  refuse(tampered((d) => { moveTo(d, silo, thing(d, garage).x as number, thing(d, garage).z as number); }), /overlaps/);
  const brook = s.valley.brook[Math.floor(s.valley.brook.length / 2)];
  refuse(tampered((d) => { moveTo(d, silo, brook.x, brook.z); }), /in the water/);
  // Strokes: too many points, off the map, too long; a planted tree of no size.
  refuse(tampered((d) => { d.channels.push({ id: next(d), points: Array.from({ length: 2500 }, (_, k) => ({ x: k * 0.01, z: 0 })) }); }));
  refuse(tampered((d) => { d.channels.push({ id: next(d), points: [{ x: 0, z: 0 }, { x: 1e7, z: 0 }] }); }), /off the map/);
  refuse(tampered((d) => { d.hedges = [{ id: next(d), points: Array.from({ length: 1500 }, (_, k) => ({ x: k % 2 ? 70 : -70, z: 0 })) }]; }), /too long/);
  refuse(tampered((d) => { d.plantedTrees.push({ id: next(d), x: 0, z: 0, species: 'oak', scale: 0, seed: 1, planted: true }); }));
  refuse(tampered((d) => { d.plantedTrees.push({ id: next(d), x: 0, z: 0, species: 'oak', scale: 0.6, seed: 1, planted: false }); }));
  // Ids: shared between kinds, with the valley's own rocks, or ahead of the next id.
  refuse(tampered((d) => { d.tracks[0].id = silo; }), /share id/);
  refuse(tampered((d) => { d.tracks[0].id = crag.id; }), /valley's own/);
  refuse(tampered((d) => { d.nextId = silo; }), /next id/);
  refuse(tampered((d) => { d.nextId = 1; }));
  // Runtimes: one each.
  refuse(tampered((d) => { d.sim.things.push(structuredClone(d.sim.things[0])); }), /two runtimes/);
  refuse(tampered((d) => { d.sim.things.pop(); }), /runtime/);
  // Carts: one numbering, a cursor that agrees with the path, jobs that name things.
  refuse(tampered((d) => { d.sim.carts.push(structuredClone(d.sim.carts[0])); }), /two carts/);
  refuse(tampered((d) => { d.sim.nextCartId = 1; }));
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { path: [], pathIdx: 1 }); }), /path/);
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { path: [{ x: 0, z: 0 }], pathIdx: 2 }); }), /path/);
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { x: 1e5 }); }), /off the map/);
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { battery: 3 }); }));
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { wait: -1 }); }));
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { cargo: { good: 'wheat', count: 0 } }); }));
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { job: { from: { kind: 'thing', id: 0 }, to: { kind: 'thing', id: silo }, good: 'wheat', count: 1, priority: 1 } }); }));
  refuse(tampered((d) => { Object.assign(d.sim.carts[0], { job: { from: { kind: 'field', id: 1 }, to: { kind: 'thing', id: d.tracks[0].id }, good: 'wheat', count: 1, priority: 1 } }); }));
  refuse(tampered((d) => { d.sim.carts = []; }), /Garage/);
  // The power: its networks' members are buildings, its batteries within their capacity.
  assert.ok(s.sim.networks.length > 0, 'a power network');
  refuse(tampered((d) => { (d.sim.networks[0].emitters as number[]).push(d.tracks[0].id as number); }));
  refuse(tampered((d) => { (d.sim.networks[0].emitters as number[]).push(99999); }));
  refuse(tampered((d) => { d.sim.networks.push(structuredClone(d.sim.networks[0])); }));
  refuse(tampered((d) => { Object.assign(d.sim.networks[0], { batteryWh: (d.sim.networks[0].batteryCapWh as number) + 5 }); }));
  refuse(tampered((d) => { Object.assign(d.sim.networks[0], { generationW: -1 }); }));
  // The Supplies: what's spent is what stands, what's unlocked is what the valley gave, Sandbox is Sandbox.
  refuse(tampered((d) => { (d.sim.supplies.spent as number)++; }), /supplies/i);
  refuse(tampered((d) => { d.sim.supplies.unlimited = false; }), /supplies/i);
  refuse(tampered((d) => { (d.sim.supplies.spent as number)++; (d.sim.supplies.available as number)--; }, plain), /supplies/i);
  refuse(tampered((d) => { (d.sim.supplies.unlocked as number)++; (d.sim.supplies.available as number)++; }, plain), /supplies/i);
  refuse(tampered((d) => { d.sim.supplies.drops[0].received = true; }, plain), /supplies/i);
  refuse(tampered((d) => { (d.sim.supplies.drops[0].amount as number) += 2; }, plain), /supplies/i);
  refuse(tampered((d) => { d.sim.supplies.drops.push(structuredClone(d.sim.supplies.drops[0])); }, plain), /supplies/i);
  refuse(tampered((d) => { d.sim.supplies.available = -3; }, plain), /supplies/i);
  // Fields on ground that can't be farmed, and soil past its range.
  const water = must(Array.from(s.grid.baseCover).findIndex((c) => c === COVER.water), 'a water cell');
  refuse(tampered((d) => { d.fields.push({ id: 99, crop: 'wheat', growth: 0, fertility: 0.8, harvestReady: 0, pollinated: 0, frosted: false, flooded: false, avgMoisture: 0, cells: [water, 1] }); }), /farmed/);
  refuse(tampered((d) => { d.fertility = [[0, 5]]; }));
  refuse(tampered((d) => { d.fertility = [[0, 0.5], [0, 0.6]]; }));
  // The clock and the weather, within the ranges the game keeps them in.
  refuse(tampered((d) => { d.sim.day = 1e9; }), /clock/);
  refuse(tampered((d) => { d.sim.day = 0; }), /clock/);
  refuse(tampered((d) => { d.sim.soilHours = -1; }));
  refuse(tampered((d) => { d.sim.weather.tempC = 1e6; }));
  refuse(tampered((d) => { d.sim.weather.floodSurge = 5; }));
  refuse(tampered((d) => { d.sim.weather.windSpeed = 1e9; }));
  refuse(tampered((d) => { d.sim.weather.rain = 2; }));
  // A huge or deeply nested text, or a huge unknown value: refused at once, and never echoed back.
  refuse(JSON.stringify(good) + ' '.repeat(MAX_SAVE_BYTES), /isn't a Soil/);
  refuse('['.repeat(200000) + ']'.repeat(200000), /isn't a Soil/);
  const long = 'x'.repeat(100000);
  refuse(tampered((d) => { d.sim.weatherOverride = long; }));
  refuse(tampered((d) => { (d.valley as Rec).season = { toString: long }; }));
});
