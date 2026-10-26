import { BUILDINGS, CROPS, FIELD, HIVE, ITEMS, POLLINATION_BONUS } from '../data.ts';
import { coopPace, erosionAt, paceOf, touchesWater } from '../rules.ts';
import { frostTakes } from '../frost.ts';
import { frostKills, heatNeed, insideAfter, insideWarmth, warmthOf } from '../warmth.ts';
import { keepingBeesIn } from '../wind.ts';
import { foragableBy, foragesOn } from '../forage.ts';
import { tileIndex, type FieldBuilding, type GameState, type HiveBuilding, type MachineBuilding } from '../state.ts';
import { derived, isGuarded, isPollinated, sprinklersOf } from './layout.ts';
import { changeSoil, fieldFertility, fieldGroundPace, harvestOf } from './soil.ts';
import { ingName, recipeOf, missing, outputsFit, consume, made } from './goods.ts';
import { shareOf } from './energy.ts';
import { waterOf } from '../wet.ts';

// Buildings: one step of each machine, field and hive.

/** Growth per second of a field as a multiple of its crop's normal pace, and the parts it's made of. */
export function fieldPace(s: GameState, f: FieldBuilding, outside = warmthOf(s)) {
  // A greenhouse grows in its own warmth (heated by power, see runGreenhouse), and the rain does not reach it.
  const warmth = f.type === 'greenhouse' ? f.inside ?? insideWarmth(CROPS[f.crop], outside) : outside;
  const wet = touchesWater(s, f.x, f.y) ? 1 : waterOf(s, f.type === 'field', f.x, f.y, sprinklersOf(s, f).reduce((m, sp) => Math.max(m, shareOf(s, sp)), 0));
  const p = paceOf(wet, fieldFertility(s, f), CROPS[f.crop], warmth, fieldGroundPace(s, f));
  // A late frost on the field takes the crop as fast as it grows: no pace at all while it bites (it does not reach a greenhouse).
  return { pace: f.type === 'field' && frostTakes(s, f) ? 0 : p.pace, water: wet, soil: p.bySoil, ground: p.byGround, warmth, byWarmth: p.byWarmth };
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
  const pace = (def.power ? share : 1) * (b.type === 'coop' ? coopPace(s, b.x, b.y) : 1);
  b.progress += dt * pace;
  b.status = def.power && share <= 0 ? 'power' : def.power && share < 1 ? 'lowpower' : 'ok';
  b.need = undefined;
  if (b.progress >= r.time) {
    for (const o of r.outputs) { b.outputs[o.item] = (b.outputs[o.item] ?? 0) + o.n; made(s, b, o.item, o.n); }
    b.progress = null;
  }
}

/**
 * A greenhouse's warmth over a step: heated by the share of the power it needs that its network gives, it holds its crop's lowest
 * comfortable warmth; with less it cools toward the outside, with none faster, and with the power back it warms again (see insideAfter).
 * It starts at what full power would hold. Says whether it is short of power while below its crop's warmth.
 */
export function runGreenhouse(s: GameState, f: FieldBuilding, dt: number, flooded = false) {
  // (A flooded one is stopped and draws nothing, so it cools.)
  const crop = CROPS[f.crop], outside = warmthOf(s), need = heatNeed(crop, outside), share = flooded ? 0 : shareOf(s, f);
  f.inside = insideAfter(crop, f.inside ?? insideWarmth(crop, outside), outside, need * share, dt);
  return { need, share, short: need > 0 && share < 1 && f.inside < crop.comfort.low - 0.05 };
}

export function runField(s: GameState, f: FieldBuilding, dt: number) {
  const crop = CROPS[f.crop];
  const heating = f.type === 'greenhouse' ? runGreenhouse(s, f, dt) : null;
  // What a harvest yields: the crop's, less on mostly stony ground, and one more where bees pollinate it.
  const yields = harvestOf(s, f) + (isPollinated(s, f) && foragesOn(s, f) ? POLLINATION_BONUS : 0);
  // Frost takes a tender crop still growing in the open; the field starts again. What it holds already is untouched.
  // A late frost does the same to the fields it lies on (the status is then set to the weather's, see hold.ts).
  if (f.type === 'field' && (frostKills(crop, warmthOf(s)) || frostTakes(s, f))) { f.growth = 0; f.status = 'frost'; f.need = undefined; return; }
  // A harvest of the old crop waits to go before the new one can join it.
  const old = f.stored > 0 && (f.harvest ?? f.crop) !== f.crop;
  if (old || f.stored + yields > FIELD.store) { f.status = 'blocked'; f.need = CROPS[f.harvest ?? f.crop].name.toLowerCase(); return; }
  const p = fieldPace(s, f);
  f.growth += dt * p.pace / crop.grow;
  // A greenhouse below its warmth for lack of power says so before the cold does.
  f.status = heating?.short ? (heating.share <= 0 ? 'power' : 'lowpower') : p.byWarmth <= 0 ? 'cold' : p.water < 1 ? 'dry' : 'ok';
  f.need = undefined;
  if (f.growth >= 1) {
    f.growth = 0;
    f.stored += yields;
    f.harvest = f.crop;
    made(s, f, f.crop, yields);
    erode(s, f, crop.soil);
  }
}

/** A harvest's change to a field's soil: a loss is heavier on its sloping tiles (erosion), less so when the field is guarded. */
function erode(s: GameState, f: FieldBuilding, by: number) {
  if (by >= 0) { changeSoil(s, f, by); return; }
  const guarded = isGuarded(s, f);
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
    const i = tileIndex(s, x, y);
    s.map.fertility[i] = Math.max(0, Math.min(100, s.map.fertility[i] + by * erosionAt(s, x, y, guarded)));
  }
}

/** Flowering fields a hive gathers from (up to HIVE.maxFlowers count). */
export function flowersNear(s: GameState, h: HiveBuilding) {
  return Math.min(HIVE.maxFlowers, (derived(s).flowers.get(h.id) ?? []).filter((f) => CROPS[f.crop].flowers).length);
}

export function runHive(s: GameState, h: HiveBuilding, dt: number) {
  if (!flowersNear(s, h)) { h.status = 'flowers'; return; }
  // Too cold outside, the bees forage only in a working greenhouse with a flowering crop; with none they stay in.
  const flowers = Math.min(HIVE.maxFlowers, foragableBy(s, h.id).length);
  if (!flowers) { h.status = 'cold'; h.need = undefined; return; }
  if (h.stored >= HIVE.store) { h.status = 'blocked'; h.need = 'honey'; return; }
  // The weather keeps them in (the weather's hold, applyHolds, says so): they gather nothing.
  if (keepingBeesIn(s.scenario, s.time)) { h.status = 'ok'; h.need = undefined; return; }
  h.growth += dt * flowers / HIVE.honeySeconds;
  h.status = 'ok';
  if (h.growth >= 1) { h.growth = 0; h.stored++; made(s, h, 'honey', 1); }
}
