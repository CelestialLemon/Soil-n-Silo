// Which tree grows where: willows by the water, pines up high, oaks, birches and poplars between, the odd apple tree on
// the valley floor. Only looks: the rules know a tree, not its kind. The brush3d world paints each species (brush/wild.ts).

/** Deterministic noise per tile, so the world looks the same every load. */
export const hash = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

export type TreeSpecies = 'oak' | 'birch' | 'pine' | 'willow' | 'poplar' | 'apple';
/** What can stand on a tree tile: a tree of a species, or a bush. */
export type TreeKind = TreeSpecies | 'bush';

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

/** The species and variant (0–2) of the tree on tile (x, y), standing at `level`, `wet` when water is within two tiles. */
export function treeAt(x: number, y: number, level: number, wet: boolean): { species: TreeKind; variant: number } {
  const mix = MIX[wet ? 'water' : level >= HIGH ? 'high' : level >= MIDDLE ? 'middle' : 'low'];
  const total = Object.values(mix).reduce((a, b) => a + b, 0);
  let pick = hash(x * 1.7, y * 2.3) * total;
  let species: TreeKind = 'oak';
  for (const [s, w] of Object.entries(mix) as [TreeKind, number][]) { species = s; pick -= w; if (pick < 0) break; }
  return { species, variant: Math.floor(hash(y * 3.1, x * 0.7) * 3) % 3 };
}
