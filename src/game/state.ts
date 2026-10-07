import { newClock, type Clock } from './clock.ts';
import type { Crop } from './crops.ts';
import { ITEMS, type ItemId, type Quality } from './items.ts';
import { DEPTH, isField, WIDTH } from './layout.ts';

// The whole game as plain data, so it saves as JSON and the rules can be tested in Node. The rules that change it live in
// actions.ts (the player's clicks) and day.ts (the overnight steps); this file holds the shapes, the starting state
// (design doc, "Starting state") and the inventory.

export interface Stack { item: ItemId; quality: Quality; count: number }

export interface Tile {
  tilled: boolean;
  /** 0-100. Freshly tilled ground starts at 50. */
  fertility: number;
  watered: boolean;
  crop: Crop | null;
}

export interface Chicken {
  id: number;
  name: string;
  /** 0-100. */
  happiness: number;
  pettedToday: boolean;
}

export interface Coop {
  chickens: Chicken[];
  /** Food units in the trough: feed and scraps both count one. */
  trough: number;
  /** Eggs waiting to be collected, by quality. */
  eggs: Quality[];
  /** Manure waiting to be collected. */
  manure: number;
  doorOpen: boolean;
  /** The door was opened today, so the chickens got outside. */
  outsideToday: boolean;
}

export type MachineKind = 'mill' | 'oven';
export interface Machine {
  id: number;
  kind: MachineKind;
  /** The footprint's north-west tile. */
  col: number;
  row: number;
  /** The batch in it: running while `hoursLeft` > 0, ready to collect after. */
  batch: { recipe: string; quality: Quality; hoursLeft: number } | null;
}

export interface Sale { item: ItemId; quality: Quality; count: number; gold: number }
export interface DayRecord { day: number; earned: number; sales: Sale[] }

export interface GameState {
  version: typeof SAVE_VERSION;
  /** The random generator's state (mulberry32), so a saved game rolls the same. */
  rng: number;
  clock: Clock;
  gold: number;
  /** Total sales over the season: the score (design doc, "Win condition"). */
  earned: number;
  /** HOTBAR slots, then the backpack. */
  inventory: (Stack | null)[];
  /** The hotbar slot in hand. */
  selected: number;
  /** One per map tile (row-major); null where the hoe can't till. */
  tiles: (Tile | null)[];
  coop: Coop;
  machines: Machine[];
  nextId: number;
  /** In the shipping bin, paid out overnight. */
  bin: Stack[];
  history: DayRecord[];
  /** The season's results have been shown (after day 28); play goes on in free mode. */
  seasonOver: boolean;
}

export const SAVE_VERSION = 1;
export const HOTBAR = 10;
export const BACKPACK = 20;
export const MAX_CHICKENS = 6;
export const SEASON_DAYS = 28;
export const TARGET = 20_000;
export const TIERS = [
  { name: 'Bronze', earned: 10_000 },
  { name: 'Silver', earned: 20_000 },
  { name: 'Gold', earned: 35_000 },
] as const;

const CHICKEN_NAMES = ['Henrietta', 'Clucky', 'Pepper', 'Marigold', 'Nugget', 'Biscuit', 'Dot', 'Penny', 'Hazel', 'Ginger', 'Olive', 'Mabel'];

export function newGame(seed = Date.now() >>> 0): GameState {
  const tiles: (Tile | null)[] = [];
  for (let row = 0; row < DEPTH; row++) for (let col = 0; col < WIDTH; col++) {
    tiles.push(isField(col, row) ? { tilled: false, fertility: 50, watered: false, crop: null } : null);
  }
  const s: GameState = {
    version: SAVE_VERSION, rng: seed, clock: newClock(), gold: 500, earned: 0,
    inventory: Array(HOTBAR + BACKPACK).fill(null), selected: 0, tiles,
    coop: { chickens: [], trough: 4, eggs: [], manure: 2, doorOpen: false, outsideToday: false },
    machines: [], nextId: 1, bin: [], history: [], seasonOver: false,
  };
  // The starting chickens come with two days of feed and some manure in the coop, so fertilizer is found on day 1.
  addChicken(s); addChicken(s);
  s.inventory[0] = { item: 'hoe', quality: 0, count: 1 };
  s.inventory[1] = { item: 'can', quality: 0, count: 1 };
  s.inventory[2] = { item: 'hand', quality: 0, count: 1 };
  s.inventory[3] = { item: 'wheat_seed', quality: 0, count: 15 };
  return s;
}

export function addChicken(s: GameState): Chicken | null {
  if (s.coop.chickens.length >= MAX_CHICKENS) return null;
  const used = new Set(s.coop.chickens.map((c) => c.name));
  const name = CHICKEN_NAMES.find((n) => !used.has(n)) ?? `Hen ${s.nextId}`;
  const c: Chicken = { id: s.nextId++, name, happiness: 60, pettedToday: false };
  s.coop.chickens.push(c);
  return c;
}

/** A float in [0, 1) from the game's generator (mulberry32), advancing it. */
export function random(s: GameState): number {
  let t = (s.rng = (s.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const tileAt = (s: GameState, col: number, row: number): Tile | null =>
  col >= 0 && row >= 0 && col < WIDTH && row < DEPTH ? s.tiles[row * WIDTH + col] : null;

// ---- Inventory ----

const stacks = (id: ItemId) => ITEMS[id].kind !== 'tool';

/** How many of an item (of any quality, or one quality) the player carries. */
export function countItem(s: GameState, item: ItemId, quality?: Quality): number {
  let n = 0;
  for (const st of s.inventory) if (st && st.item === item && (quality === undefined || st.quality === quality)) n += st.count;
  return n;
}

/** Whether an item would fit: onto a stack of the same item and quality, or into a free slot. */
export function canAdd(s: GameState, item: ItemId, quality: Quality = 0): boolean {
  return s.inventory.some((st) => st === null || (stacks(item) && st.item === item && st.quality === quality));
}

/** Adds items, stacking with the same item and quality, else into the first free slot (hotbar first). False if no room. */
export function addItem(s: GameState, item: ItemId, count: number, quality: Quality = 0): boolean {
  if (count <= 0) return true;
  const q: Quality = ITEMS[item].quality ? quality : 0;
  const same = stacks(item) ? s.inventory.find((st) => st && st.item === item && st.quality === q) : undefined;
  if (same) { same.count += count; return true; }
  const free = s.inventory.indexOf(null);
  if (free < 0) return false;
  s.inventory[free] = { item, quality: q, count };
  return true;
}

/** Takes `count` from one slot, emptying it when it runs out. */
export function takeFromSlot(s: GameState, slot: number, count = 1) {
  const st = s.inventory[slot];
  if (!st || st.count < count) throw new Error(`takeFromSlot: slot ${slot} has fewer than ${count}`);
  st.count -= count;
  if (st.count === 0) s.inventory[slot] = null;
}

/**
 * Takes one of an item, the best quality first (a recipe uses the best it can, see machines.ts). Returns its quality, or
 * null if none is carried.
 */
export function takeBest(s: GameState, item: ItemId): Quality | null {
  let best = -1;
  s.inventory.forEach((st, i) => { if (st && st.item === item && (best < 0 || st.quality > s.inventory[best]!.quality)) best = i; });
  if (best < 0) return null;
  const q = s.inventory[best]!.quality;
  takeFromSlot(s, best);
  return q;
}

/** Swaps two slots, or merges them when they hold the same item and quality. */
export function moveSlot(s: GameState, from: number, to: number) {
  if (from === to) return;
  const a = s.inventory[from], b = s.inventory[to];
  if (a && b && a.item === b.item && a.quality === b.quality && stacks(a.item)) {
    b.count += a.count;
    s.inventory[from] = null;
  } else {
    s.inventory[from] = b; s.inventory[to] = a;
  }
}

export const held = (s: GameState): Stack | null => s.inventory[s.selected] ?? null;
