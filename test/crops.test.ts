import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  apply, COMPOST_BOOST, compostField, cropStage, type Field, fieldYield, type GameState, growCrops, growthRate, HARVEST_FERTILITY,
  harvestField, must, REPLANT_GROWTH, REST_PER_DAY, restSoil, SOIL_FERTILITY, SOWN_GROWTH, stepSim, sunFactor,
} from '../src/game/index.ts';
import { flatLand } from './helpers.ts';

/** A field painted along a straight stroke. */
function field(s: GameState, crop: 'wheat' | 'beans', x0: number, z: number, x1: number, radius = 2.3): Field {
  const r = apply(s, { type: 'paintField', crop, points: [{ x: x0, z }, { x: (x0 + x1) / 2, z }, { x: x1, z }], radius });
  assert.ok(r.ok, r.ok ? '' : r.error);
  return must(s.fields.find((f) => f.crop === crop && Math.abs((f.bounds.z0 + f.bounds.z1) / 2 + s.grid.z0 - z) < 4), 'the field');
}

/** The grid cells a field covers. */
const fieldCells = (s: GameState, id: number) => [...s.grid.fieldOf.keys()].filter((i) => s.grid.fieldOf[i] === id);

/** A field's current record (painting rebuilds the records). */
const now = (s: GameState, f: Field) => must(s.fields.find((v) => v.id === f.id), 'the field');

/** Game hours until a field ripens in steady light. */
function hoursToRipen(s: GameState, f: Field, sun: number): number {
  let h = 0;
  while (f.harvestReady === 0 && h < 200) { growCrops(s, 0.05, sun); h += 0.05; }
  return h;
}

test('a field is sown at a seedling, on its soil\'s fertility, with nothing ripe yet', () => {
  const s = flatLand(), f = field(s, 'wheat', -20, -30, 0);
  assert.equal(f.growth, SOWN_GROWTH);
  assert.equal(f.harvestReady, 0);
  assert.ok(Object.values(SOIL_FERTILITY).some((v) => Math.abs(v - f.fertility) < 0.2), `fertility ${f.fertility}`);
  assert.ok(f.fertility > 0.5 && f.fertility <= 1);
  assert.equal(cropStage(f), Math.floor(SOWN_GROWTH * 20));
});

test('water speeds a crop: a field on the brook\'s bank ripens in about half a day, a dry one far slower', () => {
  const s = flatLand();
  field(s, 'wheat', -30, 3.2, -10, 2);
  const dry = field(s, 'beans', -30, -40, -10, 2), wet = now(s, s.fields[0]);
  assert.ok(wet.avgMoisture > dry.avgMoisture + 0.2, `${wet.avgMoisture} vs ${dry.avgMoisture}`);
  dry.fertility = wet.fertility;
  assert.ok(growthRate(wet, 1) > 2 * growthRate(dry, 1));
  // Ripening through a day's light.
  let h = 0, hour = 8;
  while (wet.harvestReady === 0 && h < 48) { growCrops(s, 0.05, sunFactor(hour, s.season)); h += 0.05; hour = (hour + 0.05) % 24; }
  assert.ok(h >= 9 && h <= 16, `the watered field ripened in ${h.toFixed(1)} h`);
  assert.equal(wet.harvestReady, fieldYield(wet));
  assert.ok(dry.harvestReady === 0 && dry.growth < 0.7, `the dry field is at ${dry.growth.toFixed(2)}`);
});

test('crops grow by day and barely at night; richer soil grows faster', () => {
  const s = flatLand(), f = field(s, 'wheat', -20, 3.2, 0, 2);
  assert.ok(growthRate(f, 1) > 4 * growthRate(f, 0));
  const poor = { ...f, fertility: 0.3 }, rich = { ...f, fertility: 0.95 };
  assert.ok(growthRate(rich, 1) > 1.4 * growthRate(poor, 1));
  // An agrivoltaic canopy over it costs a little light and saves a little water: about even.
  const under = growthRate(f, 1, 1), open = growthRate(f, 1, 0);
  assert.ok(Math.abs(under - open) / open < 0.2);
});

test('harvesting takes the ripe units; the last one replants it, wheat tiring the soil and beans feeding it', () => {
  const s = flatLand();
  const first = field(s, 'beans', 10, 3.2, 30, 2);
  const wheat = field(s, 'wheat', -30, 3.2, -10, 2), beans = now(s, first);
  for (const f of [wheat, beans]) hoursToRipen(s, f, 1);
  const wf = wheat.fertility, bf = beans.fertility;
  const n = wheat.harvestReady;
  assert.ok(n >= 2 && n <= 8);
  assert.equal(harvestField(s, wheat, 2), 2);
  if (n > 2) {
    assert.equal(wheat.fertility, wf, 'not until the last unit');
    harvestField(s, wheat, n);
  }
  assert.equal(wheat.harvestReady, 0);
  assert.equal(wheat.growth, REPLANT_GROWTH);
  assert.ok(Math.abs(wheat.fertility - (wf + HARVEST_FERTILITY.wheat)) < 1e-6, 'wheat drains the soil');
  harvestField(s, beans, 99);
  assert.ok(Math.abs(beans.fertility - Math.min(1, bf + HARVEST_FERTILITY.beans)) < 1e-6, 'beans restore it');
  assert.equal(harvestField(s, beans, 2), 0, 'nothing ripe to take');
  // Compost lifts tired soil back.
  const tired = wheat.fertility;
  compostField(s, wheat);
  assert.ok(Math.abs(wheat.fertility - Math.min(1, tired + COMPOST_BOOST)) < 1e-6);
});

test('a bigger field on richer soil yields more, within 2 to 8', () => {
  assert.equal(fieldYield({ areaM2: 10, fertility: 0.5 }), 2);
  assert.ok(fieldYield({ areaM2: 90, fertility: 0.9 }) > fieldYield({ areaM2: 90, fertility: 0.4 }));
  assert.equal(fieldYield({ areaM2: 1000, fertility: 1 }), 8);
});

test('stepSim grows the crops and says when a field ripens', () => {
  const s = flatLand(), f = field(s, 'wheat', -20, 3.2, 0, 2);
  const env = { windSpeed: 3, cloudCover: 0 };
  let ripe = false, changed = false;
  for (let k = 0; k < 30 * 24 && !ripe; k++) {
    const r = stepSim(s, 30, env);
    if (r.fieldStagesChanged) changed = true;
    if (r.events.some((e) => e.type === 'ripe' && e.id === f.id)) ripe = true;
  }
  assert.ok(changed && ripe);
  assert.ok(f.harvestReady > 0);
});

test('repainting a field keeps its crop\'s growth and soil; a new crop starts over', () => {
  const s = flatLand(), f = field(s, 'wheat', -20, -30, 0), g = s.grid;
  f.growth = 0.6;
  const cells = fieldCells(s, f.id);
  for (const i of cells) g.fertility[i] = 0.5;
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: [{ x: 0, z: -30 }, { x: 6, z: -30 }], radius: 2.3 }).ok);
  const same = must(s.fields.find((v) => v.id === f.id), 'the same field');
  assert.equal(same.growth, 0.6);
  for (const i of cells) assert.ok(Math.abs(g.fertility[i] - 0.5) < 1e-6, 'its tired soil stays tired');
  const mean = fieldCells(s, f.id).reduce((v, i) => v + g.fertility[i], 0) / same.cellCount;
  assert.ok(Math.abs(same.fertility - mean) < 1e-6 && same.fertility < SOIL_FERTILITY.loam, `its fertility is its cells' mean (${same.fertility})`);
  const other = field(s, 'beans', -20, -45, 0);
  assert.equal(other.growth, SOWN_GROWTH);
});

test('erasing tired wheat and painting it again finds the same tired soil; resting ground slowly recovers', () => {
  const s = flatLand(), g = s.grid;
  const stroke = [{ x: -20, z: -30 }, { x: -10, z: -30 }, { x: 0, z: -30 }];
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: stroke, radius: 2.3 }).ok);
  let f = s.fields[0];
  const fresh = f.fertility;
  assert.ok(Math.abs(fresh - SOIL_FERTILITY.loam) < 1e-6, `sown on the loam's own ${fresh}`);
  for (let k = 0; k < 3; k++) { f.harvestReady = 4; harvestField(s, f, 4); }
  const tired = f.fertility;
  assert.ok(Math.abs(tired - (fresh + 3 * HARVEST_FERTILITY.wheat)) < 1e-5, `three harvests drew it down to ${tired}`);
  // Clear it, and paint wheat on the same cells again at once.
  assert.ok(apply(s, { type: 'eraseField', points: stroke, radius: 4 }).ok);
  assert.equal(s.fields.length, 0);
  assert.ok(apply(s, { type: 'paintField', crop: 'wheat', points: stroke, radius: 2.3 }).ok);
  f = s.fields[0];
  assert.ok(Math.abs(f.fertility - tired) < 1e-6, `still tired (${f.fertility.toFixed(2)}), not back to ${fresh}`);
  // Left resting a whole game day, the bare ground creeps back toward its soil's own.
  assert.ok(apply(s, { type: 'eraseField', points: stroke, radius: 4 }).ok);
  const cell = s.grid.nx * Math.floor((-30 - g.z0) / g.cell) + Math.floor((-10 - g.x0) / g.cell);
  const before = g.fertility[cell];
  restSoil(s, 24);
  assert.ok(Math.abs(g.fertility[cell] - (before + REST_PER_DAY)) < 1e-5, `${before} → ${g.fertility[cell]}`);
  restSoil(s, 24 * 100);
  assert.ok(Math.abs(g.fertility[cell] - SOIL_FERTILITY.loam) < 1e-6, 'and never past it');
});

test('compost delivered lifts every cell of the field', () => {
  const s = flatLand(), f = field(s, 'wheat', -20, -30, 0), g = s.grid;
  for (const i of fieldCells(s, f.id)) g.fertility[i] = 0.3;
  f.harvestReady = 2; harvestField(s, f, 2);
  compostField(s, f);
  for (const i of fieldCells(s, f.id)) assert.ok(Math.abs(g.fertility[i] - (0.3 + HARVEST_FERTILITY.wheat + COMPOST_BOOST)) < 1e-6);
  assert.ok(Math.abs(f.fertility - (0.3 + HARVEST_FERTILITY.wheat + COMPOST_BOOST)) < 1e-6);
});
