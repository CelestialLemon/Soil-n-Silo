import { ITEMS, type ItemId } from './data.ts';
import { mulberry32 } from './rng.ts';

// Commissions: the campaign's fixed ones, random ones from any seed, and the sandbox. A commission is all a level needs to
// be generated and judged: its map recipe (seed, size, terrain), its weather, its goals and its target time.

export type Goal =
  | { kind: 'deliver'; item: ItemId; n: number }
  | { kind: 'rate'; item: ItemId; perMin: number }
  | { kind: 'soil'; min: number };

export interface Terrain {
  /** Mean and spread of the soil's fertility. */
  soil: number; soilSpread: number;
  water: 'river' | 'ponds' | 'lake' | 'none';
  /** Share of the map under forest and rock, roughly. */
  forest: number; rock: number;
}

export interface Weather {
  /** Hours the sun is up, and its strength at noon (1 = normal). */
  sunrise: number; sunset: number; sun: number;
  /** Mean wind and how much it swings (both 0–1 of full strength). */
  wind: number; gust: number;
}

export interface Scenario {
  id: string;
  name: string;
  blurb: string;
  seed: number;
  width: number; height: number;
  terrain: Terrain;
  weather: Weather;
  credits: number;
  goals: Goal[];
  /** Target time in seconds of play: gold within it, silver within 1.5×. */
  par: number;
  sandbox?: boolean;
  /** Labels shown on the level card. */
  tags: string[];
}

const CALM: Weather = { sunrise: 6, sunset: 20, sun: 1, wind: 0.5, gust: 0.35 };
const LOAM: Terrain = { soil: 60, soilSpread: 25, water: 'river', forest: 0.12, rock: 0.04 };
const MIN = 60;

export const CAMPAIGN: Scenario[] = [
  {
    id: 'c1', name: 'First Light', seed: 1101, width: 44, height: 36, credits: 1200, par: 20 * MIN,
    blurb: 'Brightwater needs grain and flour to get through the season. Lay your first fields, belts and a powered mill.',
    terrain: { ...LOAM, forest: 0.08, rock: 0.02 }, weather: CALM, tags: ['Gentle'],
    goals: [{ kind: 'deliver', item: 'wheat', n: 120 }, { kind: 'deliver', item: 'flour', n: 80 }],
  },
  {
    id: 'c2', name: 'Morning Bread', seed: 2202, width: 48, height: 40, credits: 1600, par: 35 * MIN,
    blurb: 'Fresh bread for the schoolhouse. Chickens need feed, the mill makes bran: close the loop, and keep the soil alive.',
    terrain: LOAM, weather: CALM, tags: [],
    goals: [{ kind: 'deliver', item: 'bread', n: 150 }, { kind: 'soil', min: 40 }],
  },
  {
    id: 'c3', name: 'Windy Ridge', seed: 3303, width: 48, height: 40, credits: 1100, par: 40 * MIN,
    blurb: 'The ridge co-op cooks with sunflower oil, but the sun is weak up here. The wind never stops, though.',
    terrain: { ...LOAM, water: 'ponds', rock: 0.12, forest: 0.06 }, weather: { ...CALM, sun: 0.6, wind: 0.75, gust: 0.25 },
    tags: ['Weak sun', 'Strong wind', 'Rocky'],
    goals: [{ kind: 'deliver', item: 'oil', n: 90 }, { kind: 'deliver', item: 'bread', n: 80 }],
  },
  {
    id: 'c4', name: 'Linen for the Looms', seed: 4404, width: 50, height: 40, credits: 1300, par: 40 * MIN,
    blurb: 'The weavers of Hollin want linen, and a steady supply of yarn for their own looms.',
    terrain: LOAM, weather: CALM, tags: [],
    goals: [{ kind: 'deliver', item: 'linen', n: 60 }, { kind: 'rate', item: 'yarn', perMin: 6 }],
  },
  {
    id: 'c5', name: 'Long Nights', seed: 5505, width: 48, height: 40, credits: 1400, par: 45 * MIN,
    blurb: 'Late autumn: short days and long nights. The midwinter fair wants honey cake.',
    terrain: { ...LOAM, water: 'lake' }, weather: { ...CALM, sunrise: 8, sunset: 17, wind: 0.45 }, tags: ['Short days'],
    goals: [{ kind: 'deliver', item: 'honeycake', n: 60 }],
  },
  {
    id: 'c6', name: 'Tired Soil', seed: 6606, width: 48, height: 40, credits: 1400, par: 45 * MIN,
    blurb: 'Years of monoculture left this valley worn out. Make sauce for the cannery town, and leave the soil better than you found it.',
    terrain: { ...LOAM, soil: 28, soilSpread: 15, forest: 0.05 }, weather: CALM, tags: ['Poor soil'],
    goals: [{ kind: 'deliver', item: 'sauce', n: 50 }, { kind: 'soil', min: 55 }],
  },
  {
    id: 'c7', name: 'Riverlands', seed: 7707, width: 52, height: 42, credits: 1600, par: 55 * MIN,
    blurb: 'Three villages along the river put in orders at once. Space is short between the water and the woods.',
    terrain: { ...LOAM, water: 'river', forest: 0.22, rock: 0.06 }, weather: CALM, tags: ['Cramped', 'Wet'],
    goals: [{ kind: 'deliver', item: 'linen', n: 30 }, { kind: 'deliver', item: 'sauce', n: 30 }, { kind: 'deliver', item: 'bread', n: 80 }],
  },
  {
    id: 'c8', name: 'Harvest Festival', seed: 8808, width: 56, height: 44, credits: 1800, par: 60 * MIN,
    blurb: 'The whole valley comes together for the festival. Everything, at once, on healthy soil.',
    terrain: { ...LOAM, soil: 50, rock: 0.07, forest: 0.14 }, weather: { ...CALM, sunset: 19, wind: 0.55 }, tags: ['Everything'],
    goals: [{ kind: 'deliver', item: 'honeycake', n: 40 }, { kind: 'deliver', item: 'sauce', n: 30 }, { kind: 'deliver', item: 'linen', n: 30 }, { kind: 'soil', min: 60 }],
  },
];

export const SANDBOX: Scenario = {
  id: 'sandbox', name: 'Sandbox', seed: 4242, width: 64, height: 52, credits: 1_000_000, par: 0, sandbox: true,
  blurb: 'A big calm valley with unlimited credits and no goals, for trying things out.',
  terrain: { ...LOAM, forest: 0.08, rock: 0.03 }, weather: CALM, tags: ['No goals', 'Unlimited credits'], goals: [],
};

/** Products a random commission can ask for, by difficulty, with a count per difficulty step. */
const PRODUCTS: { item: ItemId; n: number; level: number }[] = [
  { item: 'flour', n: 60, level: 1 }, { item: 'oil', n: 40, level: 1 }, { item: 'yarn', n: 50, level: 1 }, { item: 'egg', n: 60, level: 1 },
  { item: 'bread', n: 60, level: 2 }, { item: 'linen', n: 25, level: 2 }, { item: 'honey', n: 40, level: 2 },
  { item: 'sauce', n: 25, level: 3 }, { item: 'honeycake', n: 25, level: 3 },
];

const NAMES_A = ['Brook', 'Fern', 'Sun', 'Willow', 'Clover', 'Amber', 'Moss', 'Hazel', 'Reed', 'Linden', 'Bramble', 'Heather'];
const NAMES_B = ['hollow', 'field', 'stead', 'mere', 'vale', 'ridge', 'ford', 'wick', 'down', 'combe'];

/** A random commission from a seed and a difficulty (1–3). The same seed and difficulty always give the same one. */
export function randomScenario(seed: number, difficulty: 1 | 2 | 3): Scenario {
  const r = mulberry32(seed ^ (difficulty * 0x9e3779b9));
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const name = `${pick(NAMES_A)}${pick(NAMES_B)}`;
  const tags: string[] = [];
  const weather: Weather = { ...CALM };
  const terrain: Terrain = { ...LOAM, water: pick(['river', 'ponds', 'lake', 'river'] as const) };
  // Up to two modifiers.
  const mods = [
    () => { weather.sun = 0.6; weather.wind = 0.75; tags.push('Weak sun', 'Strong wind'); },
    () => { weather.sunrise = 8; weather.sunset = 17; tags.push('Short days'); },
    () => { terrain.soil = 30; terrain.soilSpread = 15; tags.push('Poor soil'); },
    () => { terrain.rock = 0.12; tags.push('Rocky'); },
    () => { terrain.forest = 0.24; tags.push('Wooded'); },
    () => { weather.wind = 0.25; weather.gust = 0.2; tags.push('Still air'); },
  ];
  const nMods = Math.min(difficulty, 2) - (r() < 0.4 ? 1 : 0);
  const used = new Set<number>();
  while (used.size < nMods) used.add(Math.floor(r() * mods.length));
  for (const i of used) mods[i]();

  const pool = PRODUCTS.filter((p) => p.level <= difficulty);
  const nGoals = 1 + difficulty - (r() < 0.5 ? 1 : 0) + (difficulty === 3 ? 1 : 0);
  const goals: Goal[] = [];
  const chosen = new Set<ItemId>();
  while (goals.length < Math.max(1, nGoals) && chosen.size < pool.length) {
    const p = pick(pool);
    if (chosen.has(p.item)) continue;
    chosen.add(p.item);
    goals.push({ kind: 'deliver', item: p.item, n: Math.round(p.n * (0.8 + 0.2 * difficulty) / 5) * 5 });
  }
  if (r() < 0.4 + 0.2 * difficulty) goals.push({ kind: 'soil', min: 40 + 5 * difficulty });
  const par = (15 + 12 * difficulty + 6 * goals.length) * MIN;
  return {
    id: `r${seed}-${difficulty}`, name, seed, width: 44 + 4 * difficulty, height: 36 + 3 * difficulty,
    blurb: `A commission from ${name}: ${goals.filter((g) => g.kind === 'deliver').map((g) => ITEMS[(g as { item: ItemId }).item].name.toLowerCase()).join(', ')}.`,
    terrain, weather, credits: 1000 + 200 * difficulty, goals, par, tags: [`Difficulty ${difficulty}`, ...tags],
  };
}

export function scenarioById(id: string): Scenario | null {
  if (id === SANDBOX.id) return SANDBOX;
  const c = CAMPAIGN.find((s) => s.id === id);
  if (c) return c;
  const m = /^r(\d+)-([123])$/.exec(id);
  return m ? randomScenario(Number(m[1]), Number(m[2]) as 1 | 2 | 3) : null;
}
