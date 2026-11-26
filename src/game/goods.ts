// Goods: what the fields grow, the workshops make and the Electric Carts carry. An inventory is a plain record of counts
// (whole units), and every count it leaves out is zero.

export const GOODS = [
  'wheat', 'beans', 'tomato', 'sunflower', 'flax', 'flour', 'bran', 'eggs', 'manure', 'seed_cake', 'compost', 'bread', 'honey',
  'honey_cake', 'oil', 'tomato_sauce', 'yarn', 'linen',
] as const;
export type Good = (typeof GOODS)[number];

/** What kind of good it is: a crop off the fields, a crafted pantry good, a byproduct that cycles back, or soil food. */
export type GoodCategory = 'harvest' | 'crafted' | 'byproduct' | 'soil';

export interface GoodInfo {
  /** Its name on a card or a toast: "Wheat", "Eggs". */
  label: string;
  /** One unit of it, for "1 sack of flour": a plain noun phrase. */
  unit: string;
  category: GoodCategory;
  /** A cozy colour hint for the cargo a cart carries (sacks, crates, baskets), as #rrggbb. */
  color: string;
}

export const GOOD_LABELS: { readonly [G in Good]: GoodInfo } = {
  wheat: { label: 'Wheat', unit: 'sheaf of wheat', category: 'harvest', color: '#d9b45a' },
  beans: { label: 'Beans', unit: 'basket of beans', category: 'harvest', color: '#6f8f3a' },
  tomato: { label: 'Tomato', unit: 'crate of tomatoes', category: 'harvest', color: '#c84232' },
  sunflower: { label: 'Sunflower', unit: 'bundle of sunflowers', category: 'harvest', color: '#e0b833' },
  flax: { label: 'Flax', unit: 'sheaf of flax', category: 'harvest', color: '#8aa8b8' },
  flour: { label: 'Flour', unit: 'sack of flour', category: 'crafted', color: '#efe6d2' },
  bran: { label: 'Bran', unit: 'sack of bran', category: 'byproduct', color: '#a8794a' },
  eggs: { label: 'Eggs', unit: 'basket of eggs', category: 'crafted', color: '#f3e3c3' },
  manure: { label: 'Manure', unit: 'barrow of manure', category: 'byproduct', color: '#5b4330' },
  seed_cake: { label: 'Seed Cake', unit: 'press of seed cake', category: 'byproduct', color: '#9a7342' },
  compost: { label: 'Compost', unit: 'sack of compost', category: 'soil', color: '#3f2f22' },
  honey: { label: 'Honey', unit: 'jar of honey', category: 'crafted', color: '#edb33d' },
  honey_cake: { label: 'Honey Cake', unit: 'honey cake', category: 'crafted', color: '#d99a48' },
  bread: { label: 'Bread', unit: 'crate of bread', category: 'crafted', color: '#c4813f' },
  oil: { label: 'Oil', unit: 'jug of oil', category: 'crafted', color: '#d9a432' },
  tomato_sauce: { label: 'Tomato Sauce', unit: 'jar of sauce', category: 'crafted', color: '#b5382a' },
  yarn: { label: 'Yarn', unit: 'skein of yarn', category: 'crafted', color: '#d9d4c7' },
  linen: { label: 'Linen', unit: 'bolt of linen', category: 'crafted', color: '#e8e2d5' },
};

export const isGood = (g: string): g is Good => (GOODS as readonly string[]).includes(g);

/** Counts of goods; a good left out is none. */
export type Inventory = Partial<Record<Good, number>>;

export const countOf = (inv: Inventory, g: Good): number => inv[g] ?? 0;

/** How many units it holds in all. */
export function totalStored(inv: Inventory): number {
  let n = 0;
  for (const g of GOODS) n += inv[g] ?? 0;
  return n;
}

/** Adds `n` units (n >= 0). */
export function addGood(inv: Inventory, g: Good, n: number): void {
  if (n <= 0) return;
  inv[g] = (inv[g] ?? 0) + n;
}

/** Takes up to `n` units; returns how many it took. A good taken to zero is dropped from the record. */
export function takeGood(inv: Inventory, g: Good, n: number): number {
  const have = inv[g] ?? 0, took = Math.max(0, Math.min(have, n));
  if (took === 0) return 0;
  if (have - took === 0) delete inv[g];
  else inv[g] = have - took;
  return took;
}

/** How much room is left in a store that holds `cap` units in all. */
export const capacity = (inv: Inventory, cap: number): number => Math.max(0, cap - totalStored(inv));

/** "2 Flour, 1 Bran": a short plain list, or "nothing". */
export function describeInventory(inv: Inventory): string {
  const parts = GOODS.filter((g) => (inv[g] ?? 0) > 0).map((g) => `${inv[g] ?? 0} ${GOOD_LABELS[g].label}`);
  return parts.length > 0 ? parts.join(', ') : 'nothing';
}
