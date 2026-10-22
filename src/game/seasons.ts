// Seasons: a commission happens in one season (spring, summer, autumn or winter), which sets the level's normal conditions,
// and a character can twist it ("a wet spring", "a hard winter"). The season never changes during a commission.
//
// The table is one section per lever the season moves. Each section is a record of numbers, so a character shifts it by
// adding to them, and a new lever (warmth, rain, the river) is one more section in `Levers`, one more line in each season and,
// where a character moves it, one more line in that character's shift.

export const SEASON_IDS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = typeof SEASON_IDS[number];

export const CHARACTER_IDS = ['mild', 'wet', 'dry', 'hot', 'gales', 'stormy', 'hard', 'highRiver'] as const;
export type Character = typeof CHARACTER_IDS[number];

/** What a season sets, one section per lever. Every field is a number, so a character's shift can add to it. */
export interface Levers {
  /** The hours the sun is up, and its strength at noon (1 = full). */
  sun: { rise: number; set: number; strength: number };
  /** Mean wind and how far it swings either way (both 0–1 of full strength). */
  wind: { mean: number; gust: number };
  /** The river's current as a multiple of the map's own (1 = as drawn): it sets what a water wheel makes. */
  river: { flow: number };
}

/** A commission's climate: its season and character, and the levers they give. */
export interface Climate extends Levers {
  season: Season;
  /** The season's twist, or null for an ordinary season. */
  character: Character | null;
}

export interface SeasonInfo {
  name: string;
  /** The season's normal levers, before any character. */
  levers: Levers;
}

/** The seasons' normal conditions. Each favours a power source: wheels in spring, solar in summer, wind in autumn and winter. */
export const SEASONS: Record<Season, SeasonInfo> = {
  spring: {
    name: 'Spring',
    levers: {
      sun: { rise: 6, set: 19, strength: 0.9 },
      wind: { mean: 0.5, gust: 0.4 },
      river: { flow: 1.5 },
    },
  },
  summer: {
    name: 'Summer',
    levers: {
      sun: { rise: 5, set: 21, strength: 1.1 },
      wind: { mean: 0.3, gust: 0.25 },
      river: { flow: 0.6 },
    },
  },
  autumn: {
    name: 'Autumn',
    levers: {
      sun: { rise: 7, set: 18, strength: 0.75 },
      wind: { mean: 0.7, gust: 0.3 },
      river: { flow: 0.9 },
    },
  },
  winter: {
    name: 'Winter',
    levers: {
      sun: { rise: 8, set: 16, strength: 0.55 },
      wind: { mean: 0.7, gust: 0.15 },
      river: { flow: 0.5 },
    },
  },
};

/** How a character moves the levers: amounts added to a season's numbers, by section. */
export type Shift = { [K in keyof Levers]?: Partial<Levers[K]> };

export interface CharacterInfo {
  /** The word for it: an adjective ("a wet spring") or, as a noun, after the season ("autumn, gales"). */
  word: string;
  noun?: boolean;
  /** The seasons it can twist (no hard summer). */
  seasons: readonly Season[];
  /** What it moves now. Its odds of each weather event come later (phase 2). */
  shift: Shift;
}

/**
 * The characters. Wet shifts nothing yet: it gains its effect with rain.
 */
export const CHARACTERS: Record<Character, CharacterInfo> = {
  mild: {
    word: 'mild', seasons: SEASON_IDS,
    shift: {
      sun: { strength: 0.05 },
      wind: { mean: -0.05, gust: -0.1 },
    },
  },
  wet: {
    word: 'wet', seasons: ['spring', 'summer', 'autumn'],
    shift: {},
  },
  dry: {
    word: 'dry', seasons: ['spring', 'summer', 'autumn'],
    shift: {
      sun: { strength: 0.05 },
      river: { flow: -0.1 },
    },
  },
  hot: {
    word: 'hot', seasons: ['spring', 'summer'],
    shift: {
      sun: { strength: 0.1 },
      wind: { mean: -0.05 },
    },
  },
  gales: {
    word: 'gales', noun: true, seasons: ['spring', 'autumn', 'winter'],
    shift: {
      wind: { mean: 0.15, gust: 0.05 },
    },
  },
  stormy: {
    word: 'stormy', seasons: ['spring', 'summer', 'autumn'],
    shift: {
      sun: { strength: -0.1 },
      wind: { mean: 0.05, gust: 0.15 },
    },
  },
  hard: {
    word: 'hard', seasons: ['winter'],
    shift: {
      sun: { strength: -0.1 },
      wind: { mean: 0.05 },
    },
  },
  highRiver: {
    word: 'high river', noun: true, seasons: ['spring'],
    shift: {
      river: { flow: 0.3 },
    },
  },
};

/** The climate of a season with a character (or none). Throws for a character that doesn't fit the season: a bug in a table. */
export function climateOf(season: Season, character: Character | null = null): Climate {
  const levers = structuredClone(SEASONS[season].levers);
  if (character) {
    const c = CHARACTERS[character];
    if (!c.seasons.includes(season)) throw new Error(`no ${c.word} ${season}`);
    for (const k of Object.keys(c.shift) as (keyof Levers)[]) {
      const section = levers[k] as unknown as Record<string, number>;
      for (const [f, d] of Object.entries(c.shift[k] ?? {})) section[f] = Math.round((section[f] + d) * 1000) / 1000;
    }
  }
  return { season, character, ...levers };
}

/** The characters a season can have. */
export const charactersOf = (season: Season) => CHARACTER_IDS.filter((c) => CHARACTERS[c].seasons.includes(season));

/** The season and its character in words: "A wet spring", "Autumn, gales", "Winter". */
export function seasonName(c: Pick<Climate, 'season' | 'character'>): string {
  const season = SEASONS[c.season].name;
  if (!c.character) return season;
  const ch = CHARACTERS[c.character];
  return ch.noun ? `${season}, ${ch.word}` : `A ${ch.word} ${season.toLowerCase()}`;
}

/** Labels describing a climate for the level card ("Short days", "Strong wind"): they describe the season, not modify it. */
export function climateTags(c: Levers): string[] {
  const tags: string[] = [];
  const day = c.sun.set - c.sun.rise;
  if (day <= 10) tags.push('Short days');
  else if (day >= 15) tags.push('Long days');
  if (c.sun.strength < 0.8) tags.push('Weak sun');
  else if (c.sun.strength >= 1.1) tags.push('Strong sun');
  if (c.wind.mean >= 0.65) tags.push('Strong wind');
  else if (c.wind.mean <= 0.35) tags.push('Light wind');
  if (c.wind.gust >= 0.4) tags.push('Gusty');
  return tags;
}

/** A label for the river's season ("Fast river"), for a map that has a river; the other levers' tags are in `climateTags`. */
export function riverTag(c: Levers): string[] {
  return c.river.flow >= 1.5 ? ['Fast river'] : c.river.flow <= 0.6 ? ['Slow river'] : [];
}
