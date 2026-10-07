// A scripted season on the real game rules (src/game/), to check the economy against the design doc's target (open
// question "Does the 20,000g target hold up?"): a skilled player should reach 20,000g around day 24-26, a new one may
// just miss it. Run: npm run sim -- [clicks per day] [seed] [first day the mill may be bought]
//
// The player is a greedy bot with a click budget per day, since time is the only daily limit: every field click (till,
// plant, water, fertilize, harvest) and every click on a thing costs one; menus stop the clock, so what happens inside
// them is free. Machines are visited a few times a day, so they run several batches.

import { buy, buyChicken, collectEggs, collectManure, fillTrough, petChicken, ship, toggleDoor, useOnTile } from '../src/game/actions.ts';
import { CROPS, isRipe, type CropId } from '../src/game/crops.ts';
import { endDay } from '../src/game/day.ts';
import { ITEMS, type ItemId } from '../src/game/items.ts';
import { DEPTH, WIDTH } from '../src/game/layout.ts';
import { canPlace, canStart, collect, isReady, placeMachine, recipesFor, runMachines, startRecipe } from '../src/game/machines.ts';
import { countItem, MAX_CHICKENS, newGame, SEASON_DAYS, TARGET } from '../src/game/state.ts';

const CLICKS = Number(process.argv[2] ?? 300);
const SEED = Number(process.argv[3] ?? 1);
/** Times a day the player tends the machines (collect, restart). Between visits they run for the hours that pass. */
const MACHINE_VISITS = 5;
const DAY_HOURS = 16;   // 6 AM to 10 PM: when this player goes to bed
const MILL_DAY = Number(process.argv[4] ?? 7);
const MILL_PER_DAY = 10;

const s = newGame(SEED);
let clicks = 0;
const click = () => clicks++ < CLICKS;
const hold = (item: ItemId) => { const i = s.inventory.findIndex((st) => st?.item === item); if (i >= 0) s.selected = i; return i >= 0; };
const fieldTiles = () => s.tiles.map((t, i) => ({ t, col: i % WIDTH, row: Math.floor(i / WIDTH) })).filter((x) => x.t);
const keep = new Set<ItemId>(['hoe', 'can', 'hand', 'wheat_seed', 'tomato_seed', 'pumpkin_seed', 'manure', 'feed', 'scraps', 'mill', 'oven']);

function tendMachines() {
  for (const m of s.machines) {
    if (isReady(m) && click()) collect(s, m);
    if (m.batch) continue;
    // The most valuable recipe that can start.
    const r = recipesFor(m.kind).filter((r) => canStart(s, m, r)).sort((a, b) => (ITEMS[b.output].sell ?? 0) - (ITEMS[a.output].sell ?? 0))[0];
    if (r && click()) startRecipe(s, m, r);
  }
}

function placeOwnedMachines() {
  for (const kind of ['mill', 'oven'] as const) {
    const slot = s.inventory.findIndex((st) => st?.item === kind);
    if (slot < 0) continue;
    for (let row = 1; row < DEPTH; row++) for (let col = 1; col < WIDTH; col++) {
      if (s.inventory[slot]?.item === kind && canPlace(s, col, row)) { placeMachine(s, slot, col, row); return; }
    }
  }
}

function shopping(day: number) {
  const mills = s.machines.filter((m) => m.kind === 'mill').length, ovens = s.machines.filter((m) => m.kind === 'oven').length;
  // Wheat compounds fastest early, so machines wait until the field is busy.
  if (day >= MILL_DAY && mills === 0 && s.gold >= 1300) buy(s, 'mill');
  else if (mills > 0 && ovens === 0 && s.gold >= 2800) buy(s, 'oven');
  else if (ovens > 0 && s.coop.chickens.length < MAX_CHICKENS && s.gold >= 800) buyChicken(s);
  else if (ovens === 1 && s.coop.chickens.length >= MAX_CHICKENS && s.gold >= 3500) buy(s, 'oven');
  placeOwnedMachines();
  // Feed for two nights.
  const need = s.coop.chickens.length * 2 - s.coop.trough - countItem(s, 'feed');
  if (need > 0) buy(s, 'feed', need);
}

/** Which crop to plant next: pumpkins for pies once there's an oven and time for them to ripen, else wheat for flour. */
function nextCrop(daysLeft: number): CropId | null {
  const ovens = s.machines.some((m) => m.kind === 'oven');
  const pumpkins = fieldTiles().filter((x) => x.t!.crop?.id === 'pumpkin').length;
  if (ovens && daysLeft > CROPS.pumpkin.growDays && pumpkins < s.coop.chickens.length * 8) return 'pumpkin';
  if (daysLeft > CROPS.wheat.growDays) return 'wheat';
  if (daysLeft > CROPS.pumpkin.growDays) return 'pumpkin';
  return null;
}

let reached: number | undefined;
for (let day = 1; day <= SEASON_DAYS; day++) {
  clicks = 0;
  const daysLeft = SEASON_DAYS - day + 1;
  // The coop first: collect, pet, open the door, fill the trough (in its menu, free).
  if (s.coop.eggs.length && click()) collectEggs(s);
  if (s.coop.manure && click()) collectManure(s);
  if (click()) toggleDoor(s);
  for (const c of s.coop.chickens) if (click()) petChicken(s, c.id);
  fillTrough(s, 'scraps', countItem(s, 'scraps'));
  shopping(day);
  fillTrough(s, 'feed', Math.max(0, s.coop.chickens.length - s.coop.trough));

  for (let visit = 0; visit < MACHINE_VISITS; visit++) {
    tendMachines();
    if (visit === 0) {
      // Field work, once: harvest, fertilize poor soil, plant, water.
      for (const x of fieldTiles()) if (x.t!.crop && isRipe(x.t!.crop) && click()) useOnTile(s, x.col, x.row);
      tendMachines();
      if (hold('manure')) for (const x of fieldTiles()) if (x.t!.tilled && x.t!.fertility < 60 && countItem(s, 'manure') && hold('manure') && click()) useOnTile(s, x.col, x.row);
      for (const x of fieldTiles()) {
        if (x.t!.crop) continue;
        const crop = nextCrop(daysLeft);
        if (!crop) break;
        const seed = CROPS[crop].seed;
        if (!countItem(s, seed) && !buy(s, seed, 1).ok) break;
        if (!x.t!.tilled) { if (!hold('hoe') || !click()) break; useOnTile(s, x.col, x.row); }
        if (!hold(seed) || !click()) break;
        useOnTile(s, x.col, x.row);
      }
      hold('can');
      for (const x of fieldTiles()) if (x.t!.crop && !isRipe(x.t!.crop) && !x.t!.watered && click()) useOnTile(s, x.col, x.row);
    }
    // Ship everything that isn't an input still needed (the bin menu is free).
    const ovens = s.machines.some((m) => m.kind === 'oven'), mills = s.machines.some((m) => m.kind === 'mill');
    s.inventory.forEach((st, i) => {
      if (!st || keep.has(st.item)) return;
      if (ovens && (st.item === 'flour' || st.item === 'egg')) return;
      if (ovens && st.item === 'pumpkin' && countItem(s, 'pumpkin') <= countItem(s, 'egg')) return;
      // Keep only the wheat the mills can grind before tomorrow.
      if (mills && st.item === 'wheat' && countItem(s, 'wheat') <= MILL_PER_DAY * s.machines.filter((m) => m.kind === 'mill').length) return;
      ship(s, i, st.count);
    });
    runMachines(s, DAY_HOURS / MACHINE_VISITS);
  }
  s.clock.hour = 6 + DAY_HOURS;
  const sum = endDay(s);
  console.log(`day ${String(day).padStart(2)}  earned ${String(sum.earned).padStart(5)}  total ${String(s.earned).padStart(6)}  gold ${String(s.gold).padStart(5)}  ` +
    `clicks ${Math.min(clicks, CLICKS)}  planted ${fieldTiles().filter((x) => x.t!.crop).length}  hens ${s.coop.chickens.length}  machines ${s.machines.map((m) => m.kind).join(',')}`);
  if (s.earned >= TARGET && !reached) reached = day;
}
console.log(reached ? `Reached ${TARGET}g on day ${reached}.` : `Missed ${TARGET}g: ${s.earned}g.`);
