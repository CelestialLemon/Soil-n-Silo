// Milestone 5B: the six landforms, the six curated campaign valleys, procedural valleys and Sandbox.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CAMPAIGN_VALLEYS, campaignById, canPlace, cellHeightAt, cellX, cellZ, CLEARING, COVER, DIFFICULTIES, DROP_AMOUNT, type GameState,
  generateProceduralValley, generateValley, isWet, minimumSuppliesForOrder, PANTRY_ORDERS, previewChannelFlow, SEASONS, slopeAt,
  SOIL, startCampaignValley, STARTER_SUPPLIES, starterSupplies, SUPPLY_CAP, TERRAIN_STYLES, type TerrainStyle, VALLEY_HALF,
} from '../src/game/index.ts';
import { brookSpot, same } from './helpers.ts';

/** Every valley's promises: water that never climbs, banks that hold it, a gentle clearing, the Depot, a rill that runs. */
function assertValley(s: GameState, what: string) {
  const g = s.grid, { brookLevel } = s.valley;
  for (let i = 1; i < brookLevel.length; i++) assert.ok(brookLevel[i] <= brookLevel[i - 1], `${what}: the brook rises at ${i}`);
  let water = 0;
  for (let iz = 1; iz < g.nz - 1; iz++) for (let ix = 1; ix < g.nx - 1; ix++) {
    const i = iz * g.nx + ix;
    if (!isWet(g.baseWaterLevel[i])) continue;
    water++;
    if (Math.abs(cellX(g, ix)) > VALLEY_HALF || Math.abs(cellZ(g, iz)) > VALLEY_HALF) continue;
    for (const j of [i - 1, i + 1, i - g.nx, i + g.nx]) {
      if (isWet(g.baseWaterLevel[j])) continue;
      const jx = j % g.nx, jz = (j - jx) / g.nx;
      assert.ok(cellHeightAt(g, jx, jz, g.baseHeight) >= g.baseWaterLevel[i], `${what}: the bank leaks at (${cellX(g, jx)}, ${cellZ(g, jz)})`);
    }
  }
  assert.ok(water > 500, `${what}: a brook and a pond`);
  const h = s.valley.homestead;
  let steepest = 0;
  for (let a = 0; a < 32; a++) for (const r of [0, 3, 6, 9, CLEARING - 4]) steepest = Math.max(steepest, slopeAt(g, h.x + Math.cos(a) * r, h.z + Math.sin(a) * r));
  assert.ok(steepest < 0.2, `${what}: clearing slope ${steepest.toFixed(3)}`);
  for (const yaw of [0, 0.7, 2.1]) assert.ok(canPlace(s, 'farmhouse', h.x, h.z, yaw).ok, `${what}: the farmhouse fits`);
  assert.equal(s.things.filter((t) => t.kind === 'depot').length, 1, `${what}: one Depot`);
  assert.equal(s.tracks.length, 1, `${what}: the Depot's starter track`);
  // A rill tapped off the brook runs out across the farming terrace on gravity alone.
  let best = 0;
  for (const off of [0, 8, 12, 16]) for (const deg of [60, 70, 80, 90]) best = Math.max(best, previewChannelFlow(s, brookSpot(s, off).stroke(deg, 30)).wetLength);
  assert.ok(best >= 18, `${what}: a gravity rill runs ${best.toFixed(1)} m`);
}

/** A landform's signature: how rugged it is, how much water lies in it, its sand, rock and woods. */
function signature(s: GameState) {
  const g = s.grid;
  let slope = 0, n = 0, sand = 0, lo = Infinity, hi = -Infinity, water = 0;
  for (let iz = 0; iz < g.nz; iz++) for (let ix = 0; ix < g.nx; ix++) {
    const x = cellX(g, ix), z = cellZ(g, iz), i = iz * g.nx + ix;
    if (Math.abs(x) > VALLEY_HALF || Math.abs(z) > VALLEY_HALF) continue;
    slope += slopeAt(g, x, z); n++;
    if (g.soil[i] === SOIL.sand) sand++;
    if (g.baseCover[i] === COVER.water) water++;
    const h = cellHeightAt(g, ix, iz, g.baseHeight);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
  }
  return { slope: slope / n, relief: hi - lo, sand, water, crags: s.crags.length, trees: s.wildTrees.length };
}

test('the Supplies pool splits any cap into a starter parcel and two milestone drops', () => {
  const d = starterSupplies();
  assert.deepEqual([d.available, d.unlocked, d.cap, d.drops.map((v) => v.amount)], [STARTER_SUPPLIES, STARTER_SUPPLIES, SUPPLY_CAP, [DROP_AMOUNT, DROP_AMOUNT]]);
  for (const [cap, starter, drops] of [[22, 13, [5, 4]], [21, 13, [4, 4]], [18, 11, [4, 3]], [20, 20, [0, 0]]] as const) {
    const s = starterSupplies(cap, starter);
    assert.equal(s.cap, cap);
    assert.equal(s.available, starter);
    assert.deepEqual(s.drops.map((v) => v.amount), drops);
    assert.equal(starter + s.drops.reduce((a, v) => a + v.amount, 0), cap);
  }
});

test('each landform grows its own valley and keeps every promise of the valley', () => {
  const sigs = new Map<TerrainStyle, ReturnType<typeof signature>>();
  for (const terrain of TERRAIN_STYLES) {
    for (const seed of [7, 42]) {
      const s = generateValley(seed, 'spring', { terrain });
      assert.equal(s.terrain, terrain);
      assertValley(s, `${terrain} ${seed}`);
      if (seed === 7) sigs.set(terrain, signature(s));
    }
  }
  const sig = (t: TerrainStyle) => sigs.get(t) ?? assert.fail(t);
  // The meadow is the valley as it always was.
  const plain = generateValley(7, 'spring'), meadow = generateValley(7, 'spring', { terrain: 'meadow' });
  assert.ok(same(plain.grid.baseHeight, meadow.grid.baseHeight));
  assert.deepEqual(plain.wildTrees, meadow.wildTrees);
  // No two landforms the same ground.
  for (const a of TERRAIN_STYLES) for (const b of TERRAIN_STYLES) {
    if (a >= b) continue;
    assert.ok(!same(generateValley(7, 'spring', { terrain: a }).grid.baseHeight, generateValley(7, 'spring', { terrain: b }).grid.baseHeight), `${a} and ${b} differ`);
  }
  // Each its own character.
  assert.ok(sig('terrace').slope > sig('meadow').slope + 0.015, 'the terrace is steeper');
  assert.ok(sig('floodplain').slope < sig('meadow').slope - 0.04 && sig('floodplain').relief < sig('meadow').relief - 2, 'the floodplain lies low and gentle');
  assert.ok(sig('ridge').crags >= sig('meadow').crags + 3 && sig('ridge').slope > sig('meadow').slope, 'the ridge has more knolls');
  assert.ok(sig('slope').sand > 2 * sig('meadow').sand, 'the slope runs sandy');
  assert.ok(sig('glen').trees > sig('meadow').trees + 40 && sig('glen').relief > sig('meadow').relief, 'the glen is wooded and enclosed');
});

test('the six campaign valleys span the four seasons and the six landforms, each growing cleanly with room to spare', () => {
  assert.equal(CAMPAIGN_VALLEYS.length, 6);
  assert.deepEqual(new Set(CAMPAIGN_VALLEYS.map((c) => c.season)), new Set(SEASONS));
  assert.deepEqual(new Set(CAMPAIGN_VALLEYS.map((c) => c.terrain)), new Set(TERRAIN_STYLES));
  assert.equal(new Set(CAMPAIGN_VALLEYS.map((c) => c.id)).size, 6);
  for (const c of CAMPAIGN_VALLEYS) {
    assert.equal(campaignById(c.id), c);
    const r = startCampaignValley(c.id, 99);
    assert.ok(r.ok);
    const s = r.value, sup = s.sim.supplies;
    assertValley(s, c.id);
    assert.deepEqual([s.seed, s.season, s.climate, s.terrain, s.weatherSeed, s.campaignId, s.valleyTitle, s.sandbox], [c.seed, c.season, c.climate, c.terrain, 99, c.id, c.title, false]);
    assert.deepEqual(s.sim.brief.order.targets, c.order);
    assert.ok(c.suppliesCap >= 20 && c.suppliesCap <= 22 && c.starterSupplies >= 12 && c.starterSupplies <= 13, c.id);
    assert.equal(sup.cap, c.suppliesCap);
    assert.equal(sup.available, c.starterSupplies);
    assert.equal(c.starterSupplies + sup.drops.reduce((a, d) => a + d.amount, 0), c.suppliesCap);
    const min = minimumSuppliesForOrder(c.order, c.season);
    assert.ok(c.suppliesCap >= min + 6, `${c.id}: cap ${c.suppliesCap} leaves ${c.suppliesCap - min} beyond the minimum ${min}`);
    // The starter parcel builds the Silo, the Garage and the first workshop of the chain.
    assert.ok(c.starterSupplies >= 6, c.id);
  }
  assert.ok(!startCampaignValley('no-such-valley').ok);
  // A fresh weather seed when none is given.
  const fresh = startCampaignValley('willow-meadow');
  assert.ok(fresh.ok);
});

test('the minimum Supplies for an order follow its goods down their recipes', () => {
  // Silo 2 + Garage 2, then: Bakery, Mill, Coop (Bread); a Beehive (Honey); the field's Beans are free.
  assert.equal(minimumSuppliesForOrder({ bread: 1 }, 'spring'), 4 + 6);
  assert.equal(minimumSuppliesForOrder(PANTRY_ORDERS.spring, 'spring'), 4 + 6 + 1);
  assert.equal(minimumSuppliesForOrder({ tomato_sauce: 1 }, 'summer'), 4 + 4, 'Cannery and Oil Press');
  assert.equal(minimumSuppliesForOrder({ linen: 1 }, 'autumn'), 4 + 4, 'Loom and Spinner');
  assert.equal(minimumSuppliesForOrder({ honey: 1 }, 'spring'), 4 + 1);
  assert.equal(minimumSuppliesForOrder({ honey_cake: 1 }, 'spring'), 4 + 6 + 1, 'Bakery, Mill, Coop and a Beehive');
  assert.equal(minimumSuppliesForOrder({ eggs: 1 }, 'spring'), 4 + 2, 'the Coop fed on wheat');
  assert.equal(minimumSuppliesForOrder({ beans: 1 }, 'winter'), 4 + 3, 'the Heated Greenhouse in winter');
  assert.equal(minimumSuppliesForOrder(PANTRY_ORDERS.winter, 'winter'), 4 + 6 + 1 + 3);
});

test('procedural valleys: every season and difficulty, balanced caps, and Sandbox', () => {
  for (const season of SEASONS) {
    const caps = DIFFICULTIES.map((difficulty) => {
      const s = generateProceduralValley({ seed: 314, season, difficulty, weatherSeed: 5 });
      const sup = s.sim.supplies, order = s.sim.brief.order.targets, min = minimumSuppliesForOrder(order, season);
      assert.equal(s.season, season);
      assert.equal(s.weatherSeed, 5);
      assert.ok(Object.keys(order).length >= 3, `${season}: an order of several goods`);
      assert.ok(sup.cap >= 18 && sup.cap >= min + 6, `${season} ${difficulty}: cap ${sup.cap}, minimum ${min}`);
      assert.equal(sup.available, Math.round(sup.cap * 0.6));
      assert.equal(sup.available + sup.drops.reduce((a, d) => a + d.amount, 0), sup.cap);
      assert.ok(s.valleyTitle && s.valleyTitle.length > 3);
      assert.ok(!s.sandbox && s.campaignId === undefined);
      return sup.cap;
    });
    const [relaxed, standard, tight] = caps;
    assert.ok(tight < standard && standard < relaxed, `${season}: tight ${tight} < standard ${standard} < relaxed ${relaxed}`);
  }
  // The same seed, the same valley and order; the landform can be chosen.
  const a = generateProceduralValley({ seed: 77, season: 'summer' }), b = generateProceduralValley({ seed: 77, season: 'summer' });
  assert.deepEqual(a.sim.brief.order.targets, b.sim.brief.order.targets);
  assert.equal(a.terrain, b.terrain);
  assert.ok(same(a.grid.baseHeight, b.grid.baseHeight));
  for (const terrain of TERRAIN_STYLES) {
    const s = generateProceduralValley({ seed: 900 + TERRAIN_STYLES.indexOf(terrain), season: 'autumn', terrain, climate: 'gales' });
    assert.equal(s.terrain, terrain);
    assert.equal(s.climate, 'gales');
    assertValley(s, `procedural ${terrain}`);
  }
  // Sandbox: Supplies without limit.
  const sb = generateProceduralValley({ seed: 12, season: 'winter', sandbox: true });
  assert.ok(sb.sandbox);
  assert.ok(sb.sim.supplies.available >= 999 && sb.sim.supplies.drops.length === 0);
});
