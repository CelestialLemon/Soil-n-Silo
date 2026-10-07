import { DAY_CUTOFF, DAY_START, nextDay, tick } from './clock.ts';
import { isRipe, rollQuality } from './crops.ts';
import { ITEMS, sellPrice, type ItemId, type Quality } from './items.ts';
import { runMachines } from './machines.ts';
import { random, SEASON_DAYS, TIERS, type GameState, type Sale } from './state.ts';

// The end of a day and the night after it (design doc, "Time and day structure"). The overnight steps run in the design
// doc's order: crops grow, resting soil recovers, chickens eat and lay, the bin pays out, and the water dries.

/** Fertility an empty tilled tile recovers overnight. */
export const REST_RECOVERY = 5;
/** Happiness changes overnight (open question "Happiness values per action", decided here; petting is in actions.ts). */
export const HAPPINESS = { fed: 4, unfed: -15, outside: 4, cleanCoop: 3 } as const;
/** Passing out at the 2 AM cutoff starts the next day late (open question "Penalty for the cutoff", decided here). */
export const LATE_START = 9;

export interface Summary {
  /** The day that ended. */
  day: number;
  sales: Sale[];
  earned: number;
  totalEarned: number;
  cropsGrown: number;
  cropsRipe: number;
  eggsLaid: number;
  manureLeft: number;
  /** Chickens that went hungry. */
  hungry: string[];
  passedOut: boolean;
  /** Day 28 just ended: show the season's results. */
  seasonEnded: boolean;
}

/**
 * Runs the day for `seconds` of real time: the clock (unless paused) and the machines with it. Returns true when the clock
 * reached the 2 AM cutoff. `skipHours` moves the clock on by whole hours instead (the skip key).
 */
export function passTime(s: GameState, seconds: number, skipHours = 0): boolean {
  const from = s.clock.hour;
  const cutoff = skipHours ? (s.clock.hour = Math.min(DAY_CUTOFF, from + skipHours)) >= DAY_CUTOFF : tick(s.clock, seconds);
  runMachines(s, s.clock.hour - from);
  return cutoff;
}

/** Ends the day: the night's steps in order, then the next morning. `passedOut`: the 2 AM cutoff ended it. */
export function endDay(s: GameState, passedOut = false): Summary {
  const day = s.clock.day;
  const sum: Summary = {
    day, sales: [], earned: 0, totalEarned: 0, cropsGrown: 0, cropsRipe: 0, eggsLaid: 0, manureLeft: 0, hungry: [], passedOut, seasonEnded: false,
  };

  // 1. Watered crops advance one stage (a ripe crop waits to be harvested).
  for (const t of s.tiles) {
    if (!t?.crop || !t.watered || isRipe(t.crop)) continue;
    t.crop.days += 1;
    sum.cropsGrown++;
    if (isRipe(t.crop)) sum.cropsRipe++;
  }
  // 2. Empty tilled tiles recover fertility.
  for (const t of s.tiles) if (t?.tilled && !t.crop) t.fertility = Math.min(100, t.fertility + REST_RECOVERY);

  // 3. Fed chickens lay eggs and leave manure. Each eats one unit from the trough; egg quality comes from happiness.
  const coop = s.coop, clean = coop.manure === 0;
  for (const c of coop.chickens) {
    if (coop.trough > 0) {
      coop.trough -= 1;
      coop.eggs.push(rollQuality(c.happiness, random(s)));
      coop.manure += 1;
      sum.eggsLaid++;
      c.happiness += HAPPINESS.fed;
    } else {
      c.happiness += HAPPINESS.unfed;
      sum.hungry.push(c.name);
    }
    if (coop.outsideToday) c.happiness += HAPPINESS.outside;
    if (clean) c.happiness += HAPPINESS.cleanCoop;
    c.happiness = Math.max(0, Math.min(100, c.happiness));
    c.pettedToday = false;
  }
  coop.outsideToday = false;
  coop.doorOpen = false;   // the chickens go in for the night
  sum.manureLeft = coop.manure;

  // 4. The shipping bin is sold and paid out.
  for (const b of s.bin) {
    const g = sellPrice(b.item, b.quality) * b.count;
    sum.sales.push({ item: b.item, quality: b.quality, count: b.count, gold: g });
    sum.earned += g;
  }
  s.bin = [];
  s.gold += sum.earned;
  s.earned += sum.earned;
  sum.totalEarned = s.earned;
  s.history.push({ day, earned: sum.earned, sales: sum.sales });

  // 5. Watered status resets on all tiles.
  for (const t of s.tiles) if (t) t.watered = false;

  // Machines run on in-game hours, through the night too.
  const start = passedOut ? LATE_START : DAY_START;
  runMachines(s, 24 + start - s.clock.hour);
  nextDay(s.clock);
  s.clock.hour = start;

  if (day >= SEASON_DAYS && !s.seasonOver) {
    s.seasonOver = true;
    sum.seasonEnded = true;
  }
  return sum;
}

export interface Results {
  earned: number;
  /** The best tier reached, or null below bronze. */
  tier: string | null;
  bestDay: { day: number; earned: number } | null;
  /** Everything sold over the season, by item, most gold first. */
  sold: { item: ItemId; count: number; gold: number }[];
}

/** The season's results (design doc, "End of day 28"), counted over the first SEASON_DAYS days. */
export function seasonResults(s: GameState): Results {
  const days = s.history.filter((d) => d.day <= SEASON_DAYS);
  const earned = days.reduce((g, d) => g + d.earned, 0);
  const tier = [...TIERS].reverse().find((t) => earned >= t.earned)?.name ?? null;
  const best = days.reduce<Results['bestDay']>((b, d) => (d.earned > 0 && (!b || d.earned > b.earned) ? { day: d.day, earned: d.earned } : b), null);
  const byItem = new Map<ItemId, { item: ItemId; count: number; gold: number }>();
  for (const d of days) for (const sale of d.sales) {
    const e = byItem.get(sale.item) ?? { item: sale.item, count: 0, gold: 0 };
    e.count += sale.count; e.gold += sale.gold;
    byItem.set(sale.item, e);
  }
  return { earned, tier, bestDay: best, sold: [...byItem.values()].sort((a, b) => b.gold - a.gold) };
}

export const describeSale = (sale: { item: ItemId; quality: Quality; count: number }) =>
  `${sale.count} ${sale.quality === 2 ? 'gold ' : sale.quality === 1 ? 'silver ' : ''}${ITEMS[sale.item].name.toLowerCase()}`;

