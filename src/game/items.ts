// Every item the player can hold, buy or sell (design doc, "Economy"). Prices are starting values to tune in playtests.

export type ItemId =
  | 'hoe' | 'can' | 'hand'
  | 'wheat_seed' | 'tomato_seed' | 'pumpkin_seed'
  | 'wheat' | 'tomato' | 'pumpkin' | 'scraps'
  | 'feed' | 'egg' | 'manure'
  | 'flour' | 'bread' | 'pie'
  | 'mill' | 'oven';

export type ItemKind = 'tool' | 'seed' | 'crop' | 'animal' | 'goods' | 'machine';

/** Normal, silver, gold. */
export type Quality = 0 | 1 | 2;
export const QUALITY_NAMES = ['Normal', 'Silver', 'Gold'] as const;
export const QUALITY_MULTIPLIER = [1, 1.25, 1.5] as const;

export interface ItemDef {
  id: ItemId;
  name: string;
  kind: ItemKind;
  /** Sell price at normal quality; absent for things that can't be sold. */
  sell?: number;
  /** Shop price; absent for things the shop doesn't sell. */
  buy?: number;
  /** Whether stacks of it carry a quality (crops, eggs and what is made from them). */
  quality: boolean;
  /** One line for the tooltip. */
  hint: string;
}

const def = (id: ItemId, name: string, kind: ItemKind, hint: string, o: { sell?: number; buy?: number; quality?: boolean } = {}): ItemDef =>
  ({ id, name, kind, hint, sell: o.sell, buy: o.buy, quality: o.quality ?? false });

export const ITEMS: Record<ItemId, ItemDef> = {
  hoe: def('hoe', 'Hoe', 'tool', 'Tills grass in the field. On a growing crop, digs it up.'),
  can: def('can', 'Watering can', 'tool', 'Waters a tilled tile. Crops grow only on watered days.'),
  hand: def('hand', 'Hand', 'tool', 'Harvests, collects and pets, without changing anything else.'),
  wheat_seed: def('wheat_seed', 'Wheat seeds', 'seed', 'Ready in 4 watered days. Feeds the mill.', { buy: 10 }),
  tomato_seed: def('tomato_seed', 'Tomato seeds', 'seed', 'Ready in 8 watered days, then every 3. Yields 2.', { buy: 40 }),
  pumpkin_seed: def('pumpkin_seed', 'Pumpkin seeds', 'seed', 'Ready in 12 watered days. Strips the soil.', { buy: 80 }),
  wheat: def('wheat', 'Wheat', 'crop', 'Mill it into flour.', { sell: 25, quality: true }),
  tomato: def('tomato', 'Tomato', 'crop', 'A cash crop.', { sell: 20, quality: true }),
  pumpkin: def('pumpkin', 'Pumpkin', 'crop', 'Sells well, or bake it into pie.', { sell: 250, quality: true }),
  scraps: def('scraps', 'Crop scraps', 'crop', 'Chicken food: put it in the trough.'),
  feed: def('feed', 'Chicken feed', 'animal', 'One chicken eats one a day, from the trough.', { buy: 5 }),
  egg: def('egg', 'Egg', 'animal', 'For the oven, or to sell.', { sell: 30, quality: true }),
  manure: def('manure', 'Manure', 'animal', 'Fertilizer: +25 fertility on a tilled tile.'),
  flour: def('flour', 'Flour', 'goods', 'For the oven.', { sell: 40, quality: true }),
  bread: def('bread', 'Bread', 'goods', 'Sells well.', { sell: 120, quality: true }),
  pie: def('pie', 'Pumpkin pie', 'goods', 'The best thing on the farm.', { sell: 500, quality: true }),
  mill: def('mill', 'Mill', 'machine', 'Place it on open grass (2x2). Wheat into flour.', { buy: 1000 }),
  oven: def('oven', 'Oven', 'machine', 'Place it on open grass (2x2). Bread and pumpkin pie.', { buy: 2500 }),
};

/** What the shop sells, in display order (chickens are sold too, but go to the coop, not the backpack). */
export const SHOP_ITEMS: ItemId[] = ['wheat_seed', 'tomato_seed', 'pumpkin_seed', 'feed', 'mill', 'oven'];
export const CHICKEN_PRICE = 500;

/** Sell price of one item at a quality, in whole gold. */
export function sellPrice(id: ItemId, quality: Quality): number {
  const base = ITEMS[id].sell;
  if (base === undefined) return 0;
  return Math.round(base * QUALITY_MULTIPLIER[ITEMS[id].quality ? quality : 0]);
}

/** Game-wide number formatting: 20,000g. */
export const gold = (n: number) => `${Math.round(n).toLocaleString('en-US')}g`;
