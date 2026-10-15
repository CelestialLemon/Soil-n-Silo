import { CROP_IDS, CROPS, HIVE, RECIPES, type BuildingId, type GroupId, type ItemId, type Recipe } from './data.ts';
import { must } from './result.ts';

// Where a good comes from, for the guide: the building that makes it, how long that takes at full speed, and where each of
// its inputs comes from in turn, back to the fields and hives. Static, from data.ts. Between buildings a good goes next door
// (straight across a shared edge) or by truck; to the depot it always goes by truck.

export interface Step {
  building: BuildingId;
  /** Seconds a batch (or a harvest, or a honey) takes at full speed. */
  time: number;
  /** What the building does, in a word: grow, mill, bake… */
  verb: string;
  /** How many of the good a batch gives. */
  n: number;
  recipe: Recipe | null;
  inputs: Input[];
}

/** An input: a good (with where it comes from; null: a cycle, shown elsewhere in the chain) or a group of goods. */
export type Input = { item: ItemId; n: number; from: Step | null } | { group: GroupId; n: number };

export interface Chain { item: ItemId; from: Step | null }

const VERBS: Partial<Record<BuildingId, string>> = {
  field: 'grow', hive: 'gather', mill: 'mill', press: 'press', spinner: 'spin', loom: 'weave', bakery: 'bake', cannery: 'cook',
  composter: 'compost', coop: 'lay', digester: 'burn',
};

/** The recipe that makes a good: one where it is the main output, else one where it is a byproduct. */
export function recipeMaking(item: ItemId): Recipe | null {
  return RECIPES.find((r) => r.outputs[0]?.item === item) ?? RECIPES.find((r) => r.outputs.some((o) => o.item === item)) ?? null;
}

/** Where a good comes from, all the way back. */
export function chainOf(item: ItemId): Chain {
  return { item, from: stepFor(item, new Set()) };
}

function stepFor(item: ItemId, seen: Set<BuildingId>): Step | null {
  if ((CROP_IDS as readonly string[]).includes(item)) {
    const c = CROPS[item as (typeof CROP_IDS)[number]];
    return { building: 'field', time: c.grow, verb: 'grow', n: c.yield, recipe: null, inputs: [] };
  }
  if (item === 'honey') return { building: 'hive', time: HIVE.honeySeconds, verb: 'gather', n: 1, recipe: null, inputs: [] };
  const r = recipeMaking(item);
  if (!r || seen.has(r.building)) return null;
  const next = new Set(seen).add(r.building);
  return {
    building: r.building, time: r.time, verb: VERBS[r.building] ?? 'make', n: must(r.outputs.find((o) => o.item === item), 'recipe output').n, recipe: r,
    inputs: r.inputs.map((ing) => ('item' in ing ? { item: ing.item, n: ing.n, from: stepFor(ing.item, next) } : { group: ing.group, n: ing.n })),
  };
}

/** The buildings a chain passes through, the last step first. */
export function chainBuildings(c: Chain): BuildingId[] {
  const out: BuildingId[] = [];
  const walk = (st: Step | null) => {
    if (!st) return;
    if (!out.includes(st.building)) out.push(st.building);
    for (const i of st.inputs) if ('item' in i) walk(i.from);
  };
  walk(c.from);
  return out;
}
