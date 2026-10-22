import type { Season } from '../game/seasons.ts';
import { hash } from './kit.ts';

// Which tree grows where: willows by the water, pines up high, oaks, birches and poplars between, the odd apple tree on
// the valley floor. Only looks: the rules know a tree, not its kind. Each species has three models (`variant_<n>`), and
// a set of them per season where its look changes (docs/ASSET_BRIEF.md): the season is fixed per level, so the set is chosen
// at load.

export const TREE_SPECIES = ['oak', 'birch', 'pine', 'willow', 'poplar', 'apple'] as const;
export type TreeSpecies = typeof TREE_SPECIES[number];
/** What can stand on a tree tile: a tree of a species, or a bush (one model). */
export type TreeKind = TreeSpecies | 'bush';

/** The kinds whose look doesn't change with the season (pines stay green): they keep their summer model all year. */
const EVERGREEN: ReadonlySet<TreeKind> = new Set(['pine']);

/** The model file (public/models/<name>.glb) drawing `kind` in `season`: `tree_oak_autumn`, `bush_winter`, `tree_pine`. */
export function treeModel(kind: TreeKind, season: Season): string {
  const base = kind === 'bush' ? 'bush' : `tree_${kind}`;
  return season === 'summer' || EVERGREEN.has(kind) ? base : `${base}_${season}`;
}

/** Each species' colour from afar in each season, for the crowns of the distant woods (from docs/ASSET_BRIEF.md). */
const CANOPY: Record<Season, Record<TreeKind, number>> = {
  spring: { oak: 0x76a84e, birch: 0x91bc61, pine: 0x28564f, willow: 0x91bc61, poplar: 0x588650, apple: 0xe9c3c0, bush: 0x76a84e },
  summer: { oak: 0x467348, birch: 0xb5ce76, pine: 0x28564f, willow: 0x83b390, poplar: 0x2e633d, apple: 0x567843, bush: 0x52823c },
  autumn: { oak: 0xd98a32, birch: 0xe3b43c, pine: 0x28564f, willow: 0xcdb04a, poplar: 0xe3b43c, apple: 0xc0782e, bush: 0xa8502f },
  winter: { oak: 0x7a6758, birch: 0x8c6c66, pine: 0x28564f, willow: 0xb48d42, poplar: 0x7a6758, apple: 0x7a6758, bush: 0x6d5644 },
};
export const canopyColour = (kind: TreeKind, season: Season) => CANOPY[season][kind];

/** The far apron's woods, a few colours of a mixed wood in each season (pines in it stay green). */
const WOODS: Record<Season, number[]> = {
  spring: [0x5a8c3c, 0x6a9a44, 0x76a84e, 0x447034],
  summer: [0x4a7a38, 0x52823c, 0x5a8a40, 0x447034],
  autumn: [0xb87a34, 0xa8602f, 0xc89a3c, 0x3e6438],
  winter: [0x6e6052, 0x766656, 0x5e5a4c, 0x34564a],
};
export const woodsColours = (season: Season) => WOODS[season];

/** The mix of species by where a tree stands, as weights. */
const MIX: Record<'water' | 'high' | 'middle' | 'low', Partial<Record<TreeKind, number>>> = {
  water: { willow: 50, birch: 18, poplar: 14, oak: 8, bush: 10 },
  high: { pine: 60, birch: 22, oak: 8, bush: 10 },
  middle: { pine: 28, oak: 27, birch: 22, poplar: 13, bush: 10 },
  low: { oak: 36, birch: 18, poplar: 18, apple: 9, pine: 9, bush: 10 },
};

/** Whether water (`isWater`) is within two tiles of (x, y): where willows grow. */
export function wetAt(isWater: (x: number, y: number) => boolean, x: number, y: number) {
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (isWater(x + dx, y + dy)) return true;
  return false;
}

/** The levels from which trees grow as on middle and on high ground. */
const MIDDLE = 5, HIGH = 9;

/** The species and model variant of the tree on tile (x, y), standing at `level`, `wet` when water is within two tiles. */
export function treeAt(x: number, y: number, level: number, wet: boolean): { species: TreeKind; variant: number } {
  const mix = MIX[wet ? 'water' : level >= HIGH ? 'high' : level >= MIDDLE ? 'middle' : 'low'];
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  let pick = hash(x * 1.7, y * 2.3) * total;
  let species: TreeKind = 'oak';
  for (const [s, w] of Object.entries(mix) as [TreeKind, number][]) { species = s; pick -= w; if (pick < 0) break; }
  return { species, variant: Math.floor(hash(y * 3.1, x * 0.7) * 3) % 3 };
}
