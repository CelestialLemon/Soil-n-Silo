import assert from 'node:assert/strict';
import { test } from 'node:test';
import { place, setCrop } from '../src/game/build.ts';
import { CROP_IDS, CROPS, FIELD, type CropId } from '../src/game/data.ts';
import { placement } from '../src/game/forecast.ts';
import { fertilityCap, GROUND, GROUND_IDS, groundFact, groundPace, PLAIN, type GroundId } from '../src/game/ground.ts';
import { SANDBOX, type Scenario } from '../src/game/scenarios.ts';
import { fieldPace } from '../src/game/sim/buildings.ts';
import { accept, wantsCompost } from '../src/game/sim/goods.ts';
import { fieldFertility, harvestOf } from '../src/game/sim/soil.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type FieldBuilding, type GameState } from '../src/game/state.ts';

// Ground in the crop rules (5.2): a crop's likes and dislikes, stony ground being thin, and the cards saying so.

function flat(): GameState {
  const sc: Scenario = {
    ...SANDBOX, climate: { ...SANDBOX.climate, warmth: { low: 15, high: 15, drift: 0 } }, id: 'test', sandbox: false, credits: 100_000, width: 30, height: 30, goals: [], par: 600,
    terrain: { ground: PLAIN, water: 'none', forest: 0, rock: 0, relief: 0 },
  };
  const s = newGame(sc);
  s.map.ground.fill(GROUND.loam); s.map.fertility.fill(40); s.soilBase.fill(40);
  return s;
}

/** Lays `kind` over the first `n` tiles (row by row) of the 3 × 3 at (10, 10). */
function lay(s: GameState, kind: GroundId, n = 9) {
  for (let i = 0; i < n; i++) s.map.ground[(10 + Math.floor(i / 3)) * s.map.width + 10 + (i % 3)] = GROUND[kind];
}

function fieldOf(s: GameState, type: 'field' | 'greenhouse', crop: CropId): FieldBuilding {
  const r = place(s, type, 10, 10, 0);
  if (!r.ok) assert.fail(r.error);
  const f = r.value.building;
  if (f.crop !== crop) assert.ok(setCrop(s, f, crop).ok);
  return f;
}

const card = (s: GameState, type: 'field' | 'greenhouse', crop: CropId, label: string) => placement(s, type, 10, 10, { crop }).facts.find((f) => f.label === label)!;
const kindsOf = (kind: GroundId, n = 9) => { const c = GROUND_IDS.map(() => 0); c[GROUND.loam] += 9 - n; c[GROUND[kind]] += n; return c; };
const multiplier = (crop: CropId, kind: GroundId) => CROPS[crop].ground.likes?.includes(kind) ? FIELD.groundLike : CROPS[crop].ground.poor?.includes(kind) ? FIELD.groundPoor : 1;

test('the crop profiles: wheat and beans like clay, tomato is poor on it, beans and flax are poor on sand and stony, sunflower copes there', () => {
  const g = (c: CropId) => CROPS[c].ground;
  assert.deepEqual(g('wheat'), { likes: ['clay'] });
  assert.deepEqual(g('beans'), { likes: ['clay'], poor: ['sand', 'stony'] });
  assert.deepEqual(g('tomato'), { poor: ['clay'] });
  assert.deepEqual(g('sunflower'), { copes: ['sand', 'stony'] });
  assert.deepEqual(g('flax'), { poor: ['sand', 'stony'] });
  assert.ok(FIELD.groundLike >= 1.2 && FIELD.groundLike <= 1.3 && FIELD.groundPoor >= 0.7 && FIELD.groundPoor <= 0.8, 'about a quarter either way');
});

test('a field\'s ground pace is the average of its nine tiles', () => {
  for (const crop of CROP_IDS) for (const kind of GROUND_IDS) {
    assert.equal(groundPace(CROPS[crop], kindsOf(kind)), multiplier(crop, kind), `${crop} on ${kind}`);
    assert.ok(Math.abs(groundPace(CROPS[crop], kindsOf(kind, 3)) - (6 + 3 * multiplier(crop, kind)) / 9) < 1e-12, `${crop} on 3 tiles of ${kind}`);
  }
});

test('fields and greenhouses grow at the pace their ground gives, and the placement card says what the ground does', () => {
  const cases: [CropId, GroundId, string][] = [['wheat', 'clay', 'faster'], ['beans', 'clay', 'faster'], ['tomato', 'clay', 'slowly'], ['flax', 'sand', 'slowly'], ['beans', 'stony', 'slowly'], ['sunflower', 'stony', 'copes'], ['sunflower', 'sand', 'copes']];
  for (const type of ['field', 'greenhouse'] as const) for (const [crop, kind, said] of cases) {
    const base = fieldPace(flat(), fieldOf(flat(), type, crop)).pace;
    const s = flat();
    lay(s, kind);
    const f = fieldOf(s, type, crop), p = fieldPace(s, f);
    assert.ok(Math.abs(p.pace / base - multiplier(crop, kind)) < 1e-9, `${type} ${crop} on ${kind}`);
    assert.equal(p.ground, multiplier(crop, kind));
    const ground = card(s, type, crop, 'Ground');
    assert.ok(ground.sub.includes(said), `${crop} on ${kind}: ${ground.sub}`);
    assert.equal(ground.sub, groundFact(CROPS[crop], kindsOf(kind)).sub);
    // The card's harvest rate counts it (the field has no stony yield loss on these kinds but stony, see below).
    if (kind !== 'stony') assert.equal(Number(card(s, type, crop, CROPS[crop].name).value), Number((CROPS[crop].yield * 60 * p.pace / CROPS[crop].grow).toFixed(1)));
  }
  const s = flat();
  assert.equal(card(s, 'field', 'wheat', 'Ground').sub, 'no effect on growth');
});

test('stony ground is thin: compost, beans and silt cannot lift a tile past the cap, and a stony field wants no compost it cannot use', () => {
  const s = flat();
  lay(s, 'stony');
  s.map.fertility.fill(40); s.soilBase.fill(40);
  const f = fieldOf(s, 'field', 'beans');
  assert.equal(fertilityCap(GROUND.stony), FIELD.stonyCap);
  assert.equal(fertilityCap(GROUND.clay), 100);
  assert.ok(wantsCompost(s, f));
  assert.ok(accept(s, f, 'compost'));
  for (let i = 0; i < 9; i++) assert.equal(s.map.fertility[(10 + Math.floor(i / 3)) * 30 + 10 + (i % 3)], FIELD.stonyCap, 'compost fills it to the cap, no further');
  assert.ok(!wantsCompost(s, f), 'a stony field at its cap takes no more');
  assert.ok(!accept(s, f, 'compost'));
  // A field on loam still takes it at the same fertility.
  const l = flat();
  l.map.fertility.fill(FIELD.stonyCap);
  assert.ok(wantsCompost(l, fieldOf(l, 'field', 'beans')));
  // A bean harvest builds soil but not past the cap.
  s.map.fertility.fill(49); f.growth = 1;
  advance(s, 0.2);
  assert.ok(f.stored > 0);
  assert.equal(fieldFertility(s, f), FIELD.stonyCap);
});

test('a field of mostly stony tiles yields less each harvest (never below one); a greenhouse too', () => {
  for (const type of ['field', 'greenhouse'] as const) for (const [n, loss] of [[0, 0], [4, 0], [5, FIELD.stonyLoss], [9, FIELD.stonyLoss]] as const) for (const crop of ['wheat', 'beans'] as const) {
    const s = flat();
    lay(s, 'stony', n);
    const f = fieldOf(s, type, crop);
    assert.equal(harvestOf(s, f), Math.max(1, CROPS[crop].yield - loss), `${type} ${crop}, ${n} stony`);
    f.growth = 1;
    advance(s, 0.2);
    assert.equal(f.stored, Math.max(1, CROPS[crop].yield - loss), `${type} ${crop}, ${n} stony: the harvest`);
    if (n >= FIELD.stonyMost) assert.ok(card(s, type, crop, 'Ground').sub.includes('yields 1 less'));
  }
});

test('the soil projection counts the stony cap', () => {
  const s = flat();
  lay(s, 'stony');
  s.map.fertility.fill(44); s.soilBase.fill(44);
  const soil = card(s, 'field', 'beans', 'Soil');
  assert.equal(soil.value, '44');
  assert.ok(Number(soil.then) <= FIELD.stonyCap, `beans on stony reach ${soil.then}`);
  const l = flat();
  l.map.fertility.fill(44); l.soilBase.fill(44);
  assert.ok(Number(card(l, 'field', 'beans', 'Soil').then) > 50, 'on loam the same beans rise past it');
});
