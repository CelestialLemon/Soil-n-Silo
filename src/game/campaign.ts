// The campaign: six curated valleys across the four seasons and the six landforms, each with its own character, a Pantry
// Order for its season's craft and a Supplies cap tuned to it. Each cap leaves at least 6 Supplies beyond the order's
// bare minimum (procedural.ts minimumSuppliesForOrder: the Silo, the Garage and the workshops its goods need) for power,
// water and carts; the harder characters (a spate, gales, a hard winter) get a little more.
import type { Inventory } from './goods.ts';
import { err, ok, type Result } from './result.ts';
import type { GameState, Season, TerrainStyle } from './state.ts';
import { generateValley } from './valley/generate.ts';
import { type ClimateCharacter, rollWeatherSeed } from './weather.ts';

export interface CampaignValley {
  id: string;
  title: string;
  season: Season;
  climate: ClimateCharacter;
  terrain: TerrainStyle;
  /** Its terrain's seed: the same valley every play (its weather rolls fresh). */
  seed: number;
  tagline: string;
  order: Inventory;
  suppliesCap: number;
  starterSupplies: number;
}

export const CAMPAIGN_VALLEYS: readonly CampaignValley[] = [
  // The grain loop, gently: Silo, Garage, Mill, Coop, Bakery and a Beehive (11), with 9 to spare.
  {
    id: 'willow-meadow', title: 'Willowbend Meadow', season: 'spring', climate: 'mild', terrain: 'meadow', seed: 1042,
    tagline: 'Gentle brook and broad sunlit terrace — a calm place to begin.',
    order: { bread: 8, flour: 6, beans: 6, honey: 4 }, suppliesCap: 20, starterSupplies: 12,
  },
  // Bread and eggs off a steep terrace in the rain: Silo, Garage, Mill, Coop, Bakery (10).
  {
    id: 'alder-terrace', title: 'Alderbrook Terrace', season: 'spring', climate: 'wet', terrain: 'terrace', seed: 2084,
    tagline: 'Steep hillside fields and spring showers — guide water along the contours.',
    order: { bread: 8, eggs: 6, flour: 4, beans: 6 }, suppliesCap: 20, starterSupplies: 12,
  },
  // Honey cake on a floodplain in spate: Silo, Garage, Mill, Coop, Bakery and a Beehive (11), with room for swales' power.
  {
    id: 'fern-bend', title: 'Fernwater Bend', season: 'spring', climate: 'highRiver', terrain: 'floodplain', seed: 3117,
    tagline: 'Swollen spring waters across a low meadow — dig swales to keep the yard dry.',
    order: { honey_cake: 4, flour: 6, beans: 8, honey: 4 }, suppliesCap: 21, starterSupplies: 13,
  },
  // Oil and sauce on a dry slope: Silo, Garage, Oil Press, Cannery and a Beehive (9), with room for canopies and tanks.
  {
    id: 'sun-slope', title: 'Suncombe Slope', season: 'summer', climate: 'dry', terrain: 'slope', seed: 4209,
    tagline: 'Dry summer slopes and bright noon sun — shade the crops and press golden oil.',
    order: { tomato_sauce: 6, oil: 6, sunflower: 4, honey: 2 }, suppliesCap: 20, starterSupplies: 12,
  },
  // Linen in the gales: Silo, Garage, Spinner, Loom, Mill and a Beehive (11), with room for turbines and hedges.
  {
    id: 'rowan-ridge', title: 'Rowanridge Glen', season: 'autumn', climate: 'gales', terrain: 'ridge', seed: 5318,
    tagline: 'Gusty ridges and cool autumn air — shelter the hives and weave linen.',
    order: { linen: 6, yarn: 4, flour: 4, honey: 2 }, suppliesCap: 21, starterSupplies: 13,
  },
  // Bread under glass in a hard winter: Silo, Garage, Heated Greenhouse, Mill, Coop, Bakery and a Beehive (14).
  {
    id: 'frost-glen', title: 'Juniper Frost Glen', season: 'winter', climate: 'hard', terrain: 'glen', seed: 6421,
    tagline: 'Deep frost hollows and short winter light — keep the glass warm through the cold.',
    order: { bread: 6, flour: 6, beans: 4, honey: 2 }, suppliesCap: 22, starterSupplies: 13,
  },
];

/** A campaign valley by its id. */
export const campaignById = (id: string): CampaignValley | undefined => CAMPAIGN_VALLEYS.find((c) => c.id === id);

/** Grows a campaign valley, with the given weather seed or a fresh one. */
export function startCampaignValley(id: string, weatherSeed: number = rollWeatherSeed()): Result<GameState, string> {
  const c = campaignById(id);
  if (!c) return err(`There's no campaign valley called "${id}".`);
  return ok(generateValley(c.seed, c.season, {
    weatherSeed, climate: c.climate, terrain: c.terrain, order: c.order, suppliesCap: c.suppliesCap,
    starterSupplies: c.starterSupplies, campaignId: c.id, valleyTitle: c.title,
  }));
}
