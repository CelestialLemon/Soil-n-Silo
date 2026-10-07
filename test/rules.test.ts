import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buy, buyChicken, collectEggs, collectManure, fillTrough, harvest, petChicken, ship, toggleDoor, unship, useOnTile } from '../src/game/actions.ts';
import { DAY_CUTOFF, DAY_SECONDS } from '../src/game/clock.ts';
import { cropStage, qualityOdds, rollQuality, type Crop } from '../src/game/crops.ts';
import { endDay, HAPPINESS, LATE_START, passTime, REST_RECOVERY, seasonResults } from '../src/game/day.ts';
import { sellPrice } from '../src/game/items.ts';
import { BUILDINGS, FIELD_TILES, isField, MAP, WIDTH } from '../src/game/layout.ts';
import { canPlace, canStart, collect, isReady, placeMachine, recipe, startRecipe } from '../src/game/machines.ts';
import { deserialize, serialize } from '../src/game/save.ts';
import { addItem, countItem, moveSlot, newGame, tileAt, type GameState, type Machine } from '../src/game/state.ts';

/** A field tile, the first one in the map. */
const FIELD = (() => { for (let row = 0; ; row++) for (let col = 0; col < WIDTH; col++) if (isField(col, row)) return { col, row }; })();

/** Holds `item` in the first hotbar slot that has it (adding it to slot 9 if needed). */
function hold(s: GameState, item: Parameters<typeof addItem>[1], count = 1) {
  let i = s.inventory.findIndex((st) => st?.item === item);
  if (i < 0) { s.inventory[9] = { item, quality: 0, count }; i = 9; }
  s.selected = i;
}

test('the layout: a rectangular map with about 300 field tiles and every building', () => {
  for (const line of MAP) assert.equal(line.length, WIDTH);
  assert.equal(FIELD_TILES, 300);
  assert.deepEqual(BUILDINGS.coop, { col: 2, row: 8, cols: 3, rows: 3 });
  assert.equal(BUILDINGS.farmhouse.cols, 4);
});

test('the starting state', () => {
  const s = newGame(1);
  assert.equal(s.gold, 500);
  assert.equal(s.coop.chickens.length, 2);
  assert.equal(countItem(s, 'wheat_seed'), 15);
  assert.ok(countItem(s, 'hoe') && countItem(s, 'can'));
  assert.equal(s.tiles.filter(Boolean).length, 300);
});

test('till, plant, water: a crop grows only on watered days, then is harvested', () => {
  const s = newGame(1), { col, row } = FIELD, t = tileAt(s, col, row)!;
  hold(s, 'wheat_seed');
  assert.equal(useOnTile(s, col, row).ok, false, 'untilled ground takes no seed');
  hold(s, 'hoe');
  assert.equal(useOnTile(s, col, row).ok, true);
  assert.equal(t.fertility, 50);
  hold(s, 'wheat_seed');
  assert.equal(useOnTile(s, col, row).ok, true);
  assert.equal(countItem(s, 'wheat_seed'), 14);
  endDay(s);
  assert.equal(t.crop!.days, 0, 'unwatered: paused');
  for (let d = 0; d < 4; d++) {
    hold(s, 'can');
    assert.equal(useOnTile(s, col, row).ok, true);
    assert.equal(useOnTile(s, col, row).ok, false, 'once a day');
    endDay(s);
  }
  assert.equal(t.crop!.days, 4);
  hold(s, 'hand');
  assert.equal(useOnTile(s, col, row).ok, true);
  assert.equal(t.crop, null);
  assert.equal(countItem(s, 'wheat'), 1);
  assert.equal(t.fertility, 45, 'wheat drains 5');
});

test('tomatoes regrow every 3 watered days and yield 2', () => {
  const s = newGame(1), { col, row } = FIELD, t = tileAt(s, col, row)!;
  Object.assign(t, { tilled: true, crop: { id: 'tomato', days: 8, harvests: 0 } });
  assert.equal(harvest(s, col, row).ok, true);
  assert.equal(countItem(s, 'tomato'), 2);
  assert.deepEqual(t.crop, { id: 'tomato', days: 5, harvests: 1 });
  assert.equal(cropStage(t.crop!), 2);
  for (let d = 0; d < 3; d++) { t.watered = true; endDay(s); }
  assert.equal(harvest(s, col, row).ok, true);
  assert.equal(countItem(s, 'tomato'), 4);
});

test('a full backpack refuses a harvest before rolling its quality', () => {
  const s = newGame(1), { col, row } = FIELD, t = tileAt(s, col, row)!;
  Object.assign(t, { tilled: true, fertility: 100, crop: { id: 'wheat', days: 4, harvests: 0 } });
  s.inventory = s.inventory.map(() => ({ item: 'wheat', quality: 2, count: 1 }));
  const rng = s.rng;
  assert.equal(harvest(s, col, row).ok, false);
  assert.equal(s.rng, rng, 'nothing rolled');
  assert.ok(t.crop);
  t.fertility = 50;   // gold can't come up: room for normal and silver is enough
  s.inventory[0] = { item: 'wheat', quality: 0, count: 1 };
  s.inventory[1] = { item: 'wheat', quality: 1, count: 1 };
  assert.equal(harvest(s, col, row).ok, true);
});

test('growth stages run from 0 to ripe', () => {
  const stages = (id: Crop['id'], days: number[]) => days.map((d) => cropStage({ id, days: d, harvests: 0 }));
  assert.deepEqual(stages('wheat', [0, 1, 2, 3, 4]), [0, 0, 1, 2, 3]);
  assert.deepEqual(stages('pumpkin', [0, 3, 6, 9, 11, 12]), [0, 1, 2, 3, 3, 4]);
});

test('fertility: manure +25 capped at 100, resting land +5, the hoe digs a crop up', () => {
  const s = newGame(1), { col, row } = FIELD, t = tileAt(s, col, row)!;
  hold(s, 'hoe'); useOnTile(s, col, row);
  hold(s, 'manure', 5);
  useOnTile(s, col, row); assert.equal(t.fertility, 75);
  useOnTile(s, col, row); assert.equal(t.fertility, 100);
  assert.equal(useOnTile(s, col, row).ok, false);
  assert.equal(countItem(s, 'manure'), 3);
  t.fertility = 40;
  endDay(s);
  assert.equal(t.fertility, 40 + REST_RECOVERY);
  t.crop = { id: 'pumpkin', days: 3, harvests: 0 };
  endDay(s);
  assert.equal(t.fertility, 45, 'a planted tile does not rest');
  hold(s, 'hoe'); useOnTile(s, col, row);
  assert.equal(t.crop, null);
});

test('quality odds rise with the score', () => {
  assert.deepEqual(qualityOdds(10), { silver: 0.1, gold: 0 });
  assert.equal(qualityOdds(70).gold, 0);
  assert.ok(qualityOdds(100).gold > qualityOdds(80).gold);
  assert.equal(rollQuality(100, 0), 2);
  assert.equal(rollQuality(10, 0.05), 1);
  assert.equal(rollQuality(10, 0.5), 0);
});

test('chickens: fed ones lay and leave manure, hungry ones lose happiness', () => {
  const s = newGame(1), [a, b] = s.coop.chickens;
  s.coop.trough = 1; s.coop.manure = 0; s.coop.eggs = [];
  const h0 = a.happiness;
  const sum = endDay(s);
  assert.equal(sum.eggsLaid, 1);
  assert.deepEqual(sum.hungry, [b.name]);
  assert.equal(s.coop.eggs.length, 1);
  assert.equal(s.coop.manure, 1);
  assert.equal(a.happiness, h0 + HAPPINESS.fed + HAPPINESS.cleanCoop);
  assert.equal(b.happiness, h0 + HAPPINESS.unfed + HAPPINESS.cleanCoop);
  assert.equal(collectEggs(s).ok, true);
  assert.equal(countItem(s, 'egg'), 1);
  assert.equal(collectManure(s).ok, true);
  assert.equal(petChicken(s, a.id).ok, true);
  assert.equal(petChicken(s, a.id).ok, false, 'once a day');
  toggleDoor(s);
  assert.equal(s.coop.outsideToday, true);
  addItem(s, 'feed', 3);
  assert.equal(fillTrough(s, 'feed', 10).message, '+3 in the trough (3).');
  endDay(s);
  assert.equal(s.coop.doorOpen, false, 'closed for the night');
  assert.equal(a.pettedToday, false);
});

test('the shop, the bin and the overnight payout', () => {
  const s = newGame(1);
  assert.equal(buy(s, 'feed', 10).ok, true);
  assert.equal(s.gold, 450);
  assert.equal(buy(s, 'oven').ok, false, 'not enough gold');
  s.gold = 600;
  assert.equal(buyChicken(s).ok, true);
  assert.equal(s.coop.chickens.length, 3);
  addItem(s, 'pumpkin', 2, 2);
  const slot = s.inventory.findIndex((st) => st?.item === 'pumpkin');
  ship(s, slot, 1);
  assert.equal(countItem(s, 'pumpkin'), 1);
  assert.equal(s.bin.length, 1);
  assert.equal(ship(s, 0, 1).ok, false, 'tools can\'t be sold');
  unship(s, 0);
  ship(s, s.inventory.findIndex((st) => st?.item === 'pumpkin'), 2);
  const sum = endDay(s);
  assert.equal(sum.earned, 2 * sellPrice('pumpkin', 2));
  assert.equal(sum.earned, 750);
  assert.equal(s.earned, 750);
  assert.equal(s.gold, 100 + 750);
  assert.deepEqual(s.bin, []);
});

test('machines: placed on open grass, run on in-game hours, average the input quality', () => {
  const s = newGame(1);
  addItem(s, 'mill', 1);
  const slot = s.inventory.findIndex((st) => st?.item === 'mill');
  assert.equal(canPlace(s, FIELD.col, FIELD.row), false, 'not on the field');
  assert.equal(canPlace(s, 1, 17), true);
  const m = placeMachine(s, slot, 1, 17)!;
  assert.ok(m);
  assert.equal(canPlace(s, 2, 18), false, 'not on another machine');
  addItem(s, 'wheat', 1, 2);
  assert.equal(startRecipe(s, m, recipe('flour')), true);
  assert.equal(canStart(s, m, recipe('flour')), false, 'one batch at a time');
  s.clock.hour = 22;
  endDay(s);   // 8 hours of night
  assert.equal(isReady(m), true);
  assert.equal(collect(s, m), true);
  assert.equal(countItem(s, 'flour', 2), 1);

  const oven: Machine = { id: 99, kind: 'oven', col: 5, row: 17, batch: null };
  s.machines.push(oven);
  addItem(s, 'egg', 1, 0); addItem(s, 'pumpkin', 1, 1);
  assert.equal(startRecipe(s, oven, recipe('pie')), true);
  assert.equal(oven.batch!.quality, 1, '(2 + 0 + 1) / 3 rounds to silver');
});

test('machines run with the daytime clock, and stop while it is paused', () => {
  const s = newGame(1);
  const m: Machine = { id: 1, kind: 'mill', col: 1, row: 17, batch: { recipe: 'flour', quality: 0, hoursLeft: 2 } };
  s.machines.push(m);
  s.clock.paused = true;
  assert.equal(passTime(s, 60), false);
  assert.equal(m.batch!.hoursLeft, 2);
  s.clock.paused = false;
  passTime(s, 0, 1);
  assert.equal(m.batch!.hoursLeft, 1);
  assert.equal(passTime(s, DAY_SECONDS), true, 'reaches the cutoff');
  assert.equal(isReady(m), true);
});

test('the cutoff: passing out starts the next day late; machines ran until then', () => {
  const s = newGame(1);
  s.clock.hour = DAY_CUTOFF;
  endDay(s, true);
  assert.deepEqual(s.clock, { day: 2, hour: LATE_START, paused: false });
});

test('the season: results after day 28, by tier, best day and item', () => {
  const s = newGame(1);
  for (let d = 1; d <= 28; d++) {
    if (d === 3) s.bin.push({ item: 'pie', quality: 0, count: 30 });
    if (d === 5) s.bin.push({ item: 'bread', quality: 0, count: 10 });
    const sum = endDay(s);
    assert.equal(sum.seasonEnded, d === 28);
  }
  const r = seasonResults(s);
  assert.equal(r.earned, 16_200);
  assert.equal(r.tier, 'Bronze');
  assert.deepEqual(r.bestDay, { day: 3, earned: 15_000 });
  assert.deepEqual(r.sold.map((x) => x.item), ['pie', 'bread']);
  assert.equal(endDay(s).seasonEnded, false, 'free mode goes on');
});

test('inventory: stacks by item and quality, moves and merges slots', () => {
  const s = newGame(1);
  addItem(s, 'egg', 2, 1); addItem(s, 'egg', 1, 1); addItem(s, 'egg', 1, 0);
  const silver = s.inventory.findIndex((st) => st?.item === 'egg' && st.quality === 1);
  assert.equal(s.inventory[silver]!.count, 3);
  moveSlot(s, silver, 20);
  assert.equal(s.inventory[20]!.count, 3);
  addItem(s, 'egg', 1, 1);
  assert.equal(s.inventory[20]!.count, 4, 'stacks onto the moved stack');
  s.inventory[25] = { item: 'egg', quality: 1, count: 2 };
  moveSlot(s, 25, 20);
  assert.equal(s.inventory[20]!.count, 6);
  assert.equal(s.inventory[25], null);
  addItem(s, 'hoe', 1);
  assert.equal(countItem(s, 'hoe'), 2, 'tools never stack');
});

test('save and load round-trip; broken saves are refused', () => {
  const s = newGame(7);
  hold(s, 'hoe'); useOnTile(s, FIELD.col, FIELD.row);
  const back = deserialize(serialize(s))!;
  assert.deepEqual(back, s);
  assert.equal(deserialize('{"version":0}'), null);
  const { machines: _, ...cut } = s;
  assert.equal(deserialize(JSON.stringify(cut)), null, 'a missing field');
  assert.equal(deserialize('not json'), null);
  assert.equal(deserialize(null), null);
});
