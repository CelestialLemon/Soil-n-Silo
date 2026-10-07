import { CROPS, cropForSeed, isRipe, qualityOdds, rollQuality } from './crops.ts';
import { CHICKEN_PRICE, ITEMS, sellPrice, type ItemId, type Quality } from './items.ts';
import { isField } from './layout.ts';
import { addChicken, addItem, canAdd, countItem, held, MAX_CHICKENS, random, takeFromSlot, tileAt, type GameState, type Stack } from './state.ts';

// What the player's clicks do (design doc, "Player controls and interaction"). On a tile, a click uses what is in hand;
// on a thing, it interacts. Each action returns a short message for the HUD, and whether it changed anything.

export interface Result { ok: boolean; message: string }
const ok = (message: string): Result => ({ ok: true, message });
const no = (message: string): Result => ({ ok: false, message });

export const FERTILIZER = 25;
export const TILLED_FERTILITY = 50;

/** Uses the item in hand on a field tile. A ripe crop is harvested whatever is in hand. */
export function useOnTile(s: GameState, col: number, row: number): Result {
  const tile = tileAt(s, col, row);
  if (!tile) return no('Only the field can be farmed.');
  if (tile.crop && isRipe(tile.crop)) return harvest(s, col, row);
  const st = held(s);
  const item = st?.item;
  if (!st || item === 'hand') {
    if (tile.crop) return no(`Not ripe yet.`);
    return no(tile.tilled ? 'Plant seeds here.' : 'Till it with the hoe first.');
  }
  if (item === 'hoe') {
    if (tile.crop) {
      const name = ITEMS[CROPS[tile.crop.id].produce].name;
      tile.crop = null;
      return ok(`Dug up the ${name.toLowerCase()}.`);
    }
    if (tile.tilled) return no('Already tilled.');
    tile.tilled = true;
    tile.fertility = TILLED_FERTILITY;
    return ok('Tilled.');
  }
  if (item === 'can') {
    if (!tile.tilled) return no('Till it before watering.');
    if (tile.watered) return no('Already watered today.');
    tile.watered = true;
    return ok('Watered.');
  }
  const crop = cropForSeed(item!);
  if (crop) {
    if (!tile.tilled) return no('Till it before planting.');
    if (tile.crop) return no('Something is already growing here.');
    tile.crop = { id: crop.id, days: 0, harvests: 0 };
    takeFromSlot(s, s.selected);
    return ok(`Planted ${ITEMS[crop.produce].name.toLowerCase()}.`);
  }
  if (item === 'manure') {
    if (!tile.tilled) return no('Till it before fertilizing.');
    if (tile.fertility >= 100) return no('The soil is as rich as it gets.');
    tile.fertility = Math.min(100, tile.fertility + FERTILIZER);
    takeFromSlot(s, s.selected);
    return ok(`Fertilized: soil ${tile.fertility}.`);
  }
  return no(`The ${ITEMS[item!].name.toLowerCase()} can't be used on soil.`);
}

export interface TileAt { col: number; row: number }

/**
 * Uses the item in hand on every field tile in the rectangle between two corners, as a click on each would, starting from
 * the corner the drag began at. Two differences, since a drag can sweep over more than was meant: the hoe leaves growing
 * crops alone, and once the item in hand runs out only ripe crops are harvested. A playtesting shortcut for now; it may
 * become a tool upgrade (design doc, "area tools").
 */
export function useOnArea(s: GameState, from: TileAt, to: TileAt): Result {
  const item = held(s)?.item ?? null;
  const produce = ['wheat', 'tomato', 'pumpkin', 'scraps'] as const;
  const before = produce.map((id) => countItem(s, id));
  let used = 0, harvested = 0, spared = 0, ranOut = false, full = false, refused: Result | null = null;
  const dc = to.col < from.col ? -1 : 1, dr = to.row < from.row ? -1 : 1;
  for (let row = from.row; row !== to.row + dr; row += dr) for (let col = from.col; col !== to.col + dc; col += dc) {
    const tile = tileAt(s, col, row);
    if (!tile || !isField(col, row)) continue;
    const ripe = !!tile.crop && isRipe(tile.crop);
    if (!ripe && item === 'hoe' && tile.crop) { spared++; continue; }
    if (!ripe && item && held(s)?.item !== item) { ranOut = true; continue; }
    const r = useOnTile(s, col, row);
    if (r.ok) { if (ripe) harvested++; else used++; }
    else { refused ??= r; full ||= ripe; }
  }
  if (!used && !harvested) {
    return refused ?? no(spared ? 'Dragging the hoe leaves growing crops alone: click one to dig it up.' : 'Only the field can be farmed.');
  }

  const parts: string[] = [];
  const tiles = (n: number) => `${n} tile${n > 1 ? 's' : ''}`;
  const crop = item && cropForSeed(item);
  if (used) {
    parts.push(item === 'hoe' ? `tilled ${tiles(used)}` : item === 'can' ? `watered ${tiles(used)}` : item === 'manure' ? `fertilized ${tiles(used)}`
      : crop ? `planted ${used} ${ITEMS[crop.produce].name.toLowerCase()}` : `used the ${ITEMS[item!].name.toLowerCase()} on ${tiles(used)}`);
  }
  if (harvested) {
    const gained = produce.map((id, i) => [id, countItem(s, id) - before[i]] as const).filter(([, n]) => n > 0);
    parts.push(`harvested ${harvested}: ${gained.map(([id, n]) => `+${n} ${ITEMS[id].name.toLowerCase()}`).join(', ')}`);
  }
  if (ranOut) parts.push(`out of ${ITEMS[item!].name.toLowerCase()}`);
  if (full) parts.push('the backpack is full');
  const text = parts.join('; ');
  return ok(`${text[0].toUpperCase()}${text.slice(1)}.`);
}

/** Harvests a ripe crop: produce of a quality rolled from the soil, maybe a scrap, and the soil drained. */
export function harvest(s: GameState, col: number, row: number): Result {
  const tile = tileAt(s, col, row);
  const crop = tile?.crop;
  if (!tile || !crop || !isRipe(crop)) return no('Nothing to harvest.');
  const d = CROPS[crop.id];
  // Room for whatever quality can come up, checked before rolling, so a full backpack can't be used to roll again.
  const possible: Quality[] = qualityOdds(tile.fertility).gold > 0 ? [0, 1, 2] : [0, 1];
  if (!possible.every((q) => canAdd(s, d.produce, q))) return no('The backpack is full.');
  const quality = rollQuality(tile.fertility, random(s));
  addItem(s, d.produce, d.yield, quality);
  const scrap = random(s) < d.scrapChance && addItem(s, 'scraps', 1);
  tile.fertility = Math.max(0, tile.fertility - d.drain);
  if (d.regrowDays) {
    crop.days = d.growDays - d.regrowDays;
    crop.harvests += 1;
  } else tile.crop = null;
  const q = quality === 2 ? 'gold ' : quality === 1 ? 'silver ' : '';
  return ok(`+${d.yield} ${q}${ITEMS[d.produce].name.toLowerCase()}${scrap ? ', +1 scraps' : ''}`);
}

// ---- The coop ----

export const PET_HAPPINESS = 5;

export function petChicken(s: GameState, id: number): Result {
  const c = s.coop.chickens.find((c) => c.id === id);
  if (!c) return no('No such chicken.');
  if (c.pettedToday) return no(`${c.name} has had a pat today.`);
  c.pettedToday = true;
  c.happiness = Math.min(100, c.happiness + PET_HAPPINESS);
  return ok(`${c.name} clucks happily.`);
}

export function toggleDoor(s: GameState): Result {
  s.coop.doorOpen = !s.coop.doorOpen;
  if (s.coop.doorOpen) s.coop.outsideToday = true;
  return ok(s.coop.doorOpen ? 'Coop door open: the chickens go out.' : 'Coop door closed.');
}

/** Collects every egg waiting in the coop. */
export function collectEggs(s: GameState): Result {
  const eggs = s.coop.eggs;
  if (!eggs.length) return no('No eggs to collect.');
  // Each egg that fits; the rest stay in the coop.
  s.coop.eggs = eggs.filter((q) => !addItem(s, 'egg', 1, q));
  const n = eggs.length - s.coop.eggs.length;
  return n ? ok(`+${n} egg${n > 1 ? 's' : ''}`) : no('The backpack is full.');
}

export function collectManure(s: GameState): Result {
  const n = s.coop.manure;
  if (!n) return no('No manure to collect.');
  if (!addItem(s, 'manure', n)) return no('The backpack is full.');
  s.coop.manure = 0;
  return ok(`+${n} manure`);
}

/** Puts `count` feed or scraps from the inventory into the trough. */
export function fillTrough(s: GameState, item: 'feed' | 'scraps', count: number): Result {
  let left = count;
  for (let i = 0; i < s.inventory.length && left > 0; i++) {
    const st = s.inventory[i];
    if (!st || st.item !== item) continue;
    const n = Math.min(st.count, left);
    takeFromSlot(s, i, n);
    left -= n;
  }
  const n = count - left;
  if (!n) return no(`No ${ITEMS[item].name.toLowerCase()} to put in.`);
  s.coop.trough += n;
  return ok(`+${n} in the trough (${s.coop.trough}).`);
}

// ---- The shop and the shipping bin ----

export function buy(s: GameState, item: ItemId, count = 1): Result {
  const price = ITEMS[item].buy;
  if (price === undefined) return no('Not for sale.');
  if (s.gold < price * count) return no('Not enough gold.');
  if (!canAdd(s, item)) return no('The backpack is full.');
  s.gold -= price * count;
  addItem(s, item, count);
  return ok(`Bought ${count} ${ITEMS[item].name.toLowerCase()}.`);
}

export function buyChicken(s: GameState): Result {
  if (s.coop.chickens.length >= MAX_CHICKENS) return no(`The coop holds ${MAX_CHICKENS} chickens.`);
  if (s.gold < CHICKEN_PRICE) return no('Not enough gold.');
  s.gold -= CHICKEN_PRICE;
  const c = addChicken(s)!;
  return ok(`${c.name} joined the coop.`);
}

export const canSell = (item: ItemId) => ITEMS[item].sell !== undefined;

/** Moves `count` from an inventory slot into the shipping bin. */
export function ship(s: GameState, slot: number, count: number): Result {
  const st = s.inventory[slot];
  if (!st || !canSell(st.item)) return no('That can\'t be sold.');
  const n = Math.min(count, st.count);
  const inBin = s.bin.find((b) => b.item === st.item && b.quality === st.quality);
  if (inBin) inBin.count += n; else s.bin.push({ item: st.item, quality: st.quality, count: n });
  takeFromSlot(s, slot, n);
  return ok(`Shipped ${n} ${ITEMS[st.item].name.toLowerCase()}.`);
}

/** Takes a stack back out of the bin. */
export function unship(s: GameState, index: number): Result {
  const b = s.bin[index];
  if (!b) return no('Nothing there.');
  if (!addItem(s, b.item, b.count, b.quality)) return no('The backpack is full.');
  s.bin.splice(index, 1);
  return ok(`Took back ${b.count} ${ITEMS[b.item].name.toLowerCase()}.`);
}

export const binValue = (bin: Stack[]) => bin.reduce((g, b) => g + sellPrice(b.item, b.quality) * b.count, 0);
