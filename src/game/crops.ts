import type { ItemId, Quality } from './items.ts';

// Crops as data (design doc, "Crops and soil fertility"). A crop advances one day for each day it was watered; it shows
// `stages` looks (the last one ripe) and is harvestable once it has grown `growDays` days. A regrowing crop goes back
// `regrowDays` days after each harvest.

export type CropId = 'wheat' | 'tomato' | 'pumpkin';

export interface CropDef {
  id: CropId;
  seed: ItemId;
  produce: ItemId;
  growDays: number;
  /** Days from one harvest to the next for a crop that regrows. */
  regrowDays?: number;
  yield: number;
  /** Fertility lost per harvest. */
  drain: number;
  /** Visible growth stages, the last one ripe (one model per stage). */
  stages: number;
  /** After a harvest, the stage a regrowing crop shows again. */
  regrowStage?: number;
  /** Chance that a harvest also drops one crop scrap (open question, decided here). */
  scrapChance: number;
}

export const CROPS: Record<CropId, CropDef> = {
  wheat: { id: 'wheat', seed: 'wheat_seed', produce: 'wheat', growDays: 4, yield: 1, drain: 5, stages: 4, scrapChance: 0.35 },
  tomato: { id: 'tomato', seed: 'tomato_seed', produce: 'tomato', growDays: 8, regrowDays: 3, yield: 2, drain: 5, stages: 5, regrowStage: 2, scrapChance: 0.25 },
  pumpkin: { id: 'pumpkin', seed: 'pumpkin_seed', produce: 'pumpkin', growDays: 12, yield: 1, drain: 15, stages: 5, scrapChance: 0.6 },
};

export const cropForSeed = (seed: ItemId): CropDef | undefined => Object.values(CROPS).find((c) => c.seed === seed);

export interface Crop {
  id: CropId;
  /** Watered days grown, counted from planting (a regrowing crop is set back after each harvest). */
  days: number;
  /** Harvests so far (a regrowing crop is harvested more than once). */
  harvests: number;
}

export const isRipe = (c: Crop) => c.days >= CROPS[c.id].growDays;

/** Which of the crop's looks to show: 0 just planted, `stages - 1` ripe. */
export function cropStage(c: Crop): number {
  const d = CROPS[c.id];
  if (isRipe(c)) return d.stages - 1;
  if (c.harvests > 0 && d.regrowStage !== undefined) {
    // Regrowing: from the leafy look back towards ripe.
    const from = d.growDays - d.regrowDays!, span = d.stages - 1 - d.regrowStage;
    return d.regrowStage + Math.floor((c.days - from) / d.regrowDays! * span);
  }
  return Math.floor(c.days / d.growDays * (d.stages - 1));
}

/** Watered days left until the crop is ripe. */
export const daysToRipe = (c: Crop) => Math.max(0, CROPS[c.id].growDays - c.days);

/**
 * Quality rolled from a 0-100 score: the tile's fertility for crops, the chicken's happiness for eggs (open question
 * "Exact quality odds", decided here). Below 30 mostly normal; 30-70 a good chance of silver; above 70 gold becomes possible.
 */
export function qualityOdds(score: number): { silver: number; gold: number } {
  if (score < 30) return { silver: 0.1, gold: 0 };
  if (score <= 70) return { silver: 0.25 + (score - 30) / 40 * 0.3, gold: 0 };
  return { silver: 0.5, gold: 0.1 + (score - 70) / 30 * 0.35 };
}

export function rollQuality(score: number, r: number): Quality {
  const { silver, gold } = qualityOdds(score);
  if (r < gold) return 2;
  if (r < gold + silver) return 1;
  return 0;
}
