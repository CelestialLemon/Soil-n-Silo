import { BUILDINGS, CROPS, FIELD, HIVE, ITEMS, POLLINATION_BONUS } from '../data.ts';
import { paceOf, touchesWater } from '../rules.ts';
import { type FieldBuilding, type GameState, type HiveBuilding, type MachineBuilding } from '../state.ts';
import { derived, isPollinated, sprinklersOf } from './layout.ts';
import { changeSoil, fieldFertility } from './soil.ts';
import { ingName, recipeOf, missing, outputsFit, consume, made } from './goods.ts';
import { shareOf } from './energy.ts';

// Buildings: one step of each machine, field and hive.

/** Growth per second of a field as a multiple of its crop's normal pace, and the parts it's made of. */
export function fieldPace(s: GameState, f: FieldBuilding) {
  const wet = touchesWater(s, f.x, f.y) ? 1 : sprinklersOf(s, f).reduce((m, sp) => Math.max(m, shareOf(s, sp)), 0);
  const p = paceOf(wet, fieldFertility(s, f));
  return { pace: p.pace, water: wet, soil: p.bySoil };
}

export function runMachine(s: GameState, b: MachineBuilding, dt: number) {
  const r = recipeOf(b);
  const def = BUILDINGS[b.type];
  const share = shareOf(s, b);
  if (b.progress === null) {
    const lack = missing(b, r), full = outputsFit(b, r);
    if (lack) { b.status = 'input'; b.need = ingName(lack); return; }
    if (full) { b.status = 'blocked'; b.need = ITEMS[full.item].name.toLowerCase(); return; }
    if (def.power && share <= 0) { b.status = 'power'; b.need = undefined; return; }
    consume(s, b, r);
    b.progress = 0;
  }
  // The digester is a generator: it burns at its own pace.
  const pace = def.power ? share : 1;
  b.progress += dt * pace;
  b.status = pace <= 0 ? 'power' : pace < 1 ? 'lowpower' : 'ok';
  b.need = undefined;
  if (b.progress >= r.time) {
    for (const o of r.outputs) { b.outputs[o.item] = (b.outputs[o.item] ?? 0) + o.n; made(s, b, o.item, o.n); }
    b.progress = null;
  }
}

export function runField(s: GameState, f: FieldBuilding, dt: number) {
  const crop = CROPS[f.crop];
  const bonus = crop.flowers && isPollinated(s, f) ? POLLINATION_BONUS : 0;
  // A harvest of the old crop waits to go before the new one can join it.
  const old = f.stored > 0 && (f.harvest ?? f.crop) !== f.crop;
  if (old || f.stored + crop.yield + bonus > FIELD.store) { f.status = 'blocked'; f.need = CROPS[f.harvest ?? f.crop].name.toLowerCase(); return; }
  const p = fieldPace(s, f);
  f.growth += dt * p.pace / crop.grow;
  f.status = p.water < 1 ? 'dry' : 'ok';
  f.need = undefined;
  if (f.growth >= 1) {
    f.growth = 0;
    f.stored += crop.yield + bonus;
    f.harvest = f.crop;
    made(s, f, f.crop, crop.yield + bonus);
    changeSoil(s, f, crop.soil);
  }
}

/** Flowering fields a hive gathers from (up to HIVE.maxFlowers count). */
export function flowersNear(s: GameState, h: HiveBuilding) {
  return Math.min(HIVE.maxFlowers, (derived(s).flowers.get(h.id) ?? []).filter((f) => CROPS[f.crop].flowers).length);
}

export function runHive(s: GameState, h: HiveBuilding, dt: number) {
  const flowers = flowersNear(s, h);
  if (!flowers) { h.status = 'flowers'; return; }
  if (h.stored >= HIVE.store) { h.status = 'blocked'; h.need = 'honey'; return; }
  h.growth += dt * flowers / HIVE.honeySeconds;
  h.status = 'ok';
  if (h.growth >= 1) { h.growth = 0; h.stored++; made(s, h, 'honey', 1); }
}
