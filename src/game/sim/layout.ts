import { BUILDINGS, type BuildingId } from '../data.ts';
import { exposureAt, guardedAt, hiveReaches, meets, sprinklerWaters, sprinklerWatts, wheelSite } from '../rules.ts';
import { buildingAt, isMachine, layoutOf, tileIndex, type Building, type FieldBuilding, type GameState } from '../state.ts';
import { isFlooded } from '../flood.ts';
import { runtimeOf } from '../runtime.ts';

// Derived lookups, rebuilt when the layout changes: what stands beside, waters or shades each building.

export interface Derived {
  layout: number;
  /** Sprinklers watering each field. */
  sprinklers: Map<number, Building[]>;
  /** Fields with a hive near enough to pollinate them. */
  pollinated: Set<number>;
  /** Fields near each hive. */
  flowers: Map<number, FieldBuilding[]>;
  /** Wind turbines' shelter factor. */
  exposure: Map<number, number>;
  /** The watts each sprinkler needs (by the water near it and how high it lifts it), and each water wheel makes. */
  watts: Map<number, number>;
  /** The water wheels whose water keeps running in a cold snap: beside a fall, or just below one (ice.ts). */
  runs: Set<number>;
  /** Fields guarded against erosion (rules.ts, `guardedAt`). */
  guarded: Set<number>;
  /** Tiles under a field (the rest of the ground rests). */
  fielded: Set<number>;
  /** The buildings sharing an edge with each building. */
  neighbours: Map<number, Building[]>;
  /** The neighbours each building can hand goods to (the ground joined between them, not a cliff). */
  joined: Map<number, Set<number>>;
}

export function derived(s: GameState): Derived {
  const layout = layoutOf(s);
  const rt = runtimeOf(s);
  let d = rt.derived;
  if (d && d.layout === layout) return d;
  d = { layout, sprinklers: new Map(), pollinated: new Set(), flowers: new Map(), exposure: new Map(), watts: new Map(), runs: new Set(), guarded: new Set(), fielded: new Set(), neighbours: new Map(), joined: new Map() };
  const fields = s.buildings.filter((b): b is FieldBuilding => b.type === 'field');
  // Under flood water a hive pollinates nothing, a sprinkler waters nothing, and a field's flowers feed no hive.
  const hives = s.buildings.filter((b) => b.type === 'hive');
  const sprinklers = s.buildings.filter((b) => b.type === 'sprinkler' && !isFlooded(s, b));
  const dryHives = hives.filter((h) => !isFlooded(s, h));
  for (const f of fields) {
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) d.fielded.add(tileIndex(s, x, y));
    const wet = isFlooded(s, f);
    d.sprinklers.set(f.id, wet ? [] : sprinklers.filter((sp) => sprinklerWaters(sp.x, sp.y, f)));
    if (!wet && dryHives.some((h) => hiveReaches(f, h.x, h.y))) d.pollinated.add(f.id);
    if (guardedAt(s, f.x, f.y)) d.guarded.add(f.id);
  }
  for (const h of hives) d.flowers.set(h.id, dryHives.includes(h) ? fields.filter((f) => !isFlooded(s, f) && hiveReaches(f, h.x, h.y)) : []);
  for (const t of s.buildings) if (t.type === 'turbine') d.exposure.set(t.id, exposureAt(s, t.x, t.y));
  for (const sp of sprinklers) d.watts.set(sp.id, sprinklerWatts(s, sp.x, sp.y));
  for (const b of s.buildings) {
    if (b.type !== 'wheel') continue;
    const site = wheelSite(s, b.x, b.y);
    d.watts.set(b.id, site?.watts ?? 0);
    if (site?.runs) d.runs.add(b.id);
  }
  for (const b of s.buildings) {
    const near = besides(s, b);
    d.neighbours.set(b.id, near);
    // Goods pass only between buildings the water leaves alone.
    const dry = !isFlooded(s, b);
    d.joined.set(b.id, new Set(near.filter((n) => dry && !isFlooded(s, n) && meets(s, b, n)).map((n) => n.id)));
  }
  rt.derived = d;
  return d;
}

/** The buildings sharing an edge with a footprint (a building, or one about to be placed). */
export function besides(s: GameState, b: { type: BuildingId; x: number; y: number }): Building[] {
  const n = BUILDINGS[b.type].size, out = new Set<Building>();
  for (let k = 0; k < n; k++) {
    for (const [x, y] of [[b.x + k, b.y - 1], [b.x + k, b.y + n], [b.x - 1, b.y + k], [b.x + n, b.y + k]]) {
      const o = buildingAt(s, x, y);
      if (o) out.add(o);
    }
  }
  return [...out];
}

/** Whether a building trades goods with trucks: it grows, makes or uses goods. */
export const handlesGoods = (b: Building) => !!BUILDINGS[b.type].harvests || isMachine(b);

export const sprinklersOf = (s: GameState, b: Building) => derived(s).sprinklers.get(b.id) ?? [];
export const isPollinated = (s: GameState, b: Building) => derived(s).pollinated.has(b.id);
export const exposureOf = (s: GameState, b: Building) => derived(s).exposure.get(b.id) ?? 1;
/** The watts a sprinkler needs or a water wheel makes (worked out from where it stands). */
export const wattsOf = (s: GameState, b: Building) => derived(s).watts.get(b.id) ?? 0;
/** Whether a water wheel stands where the river keeps running in a cold snap (a fall), rather than freezing over. */
export const runsInFrost = (s: GameState, b: Building) => derived(s).runs.has(b.id);
export const isGuarded = (s: GameState, b: Building) => derived(s).guarded.has(b.id);
/** Whether building `a` can hand goods to `b` next door (not across a cliff). */
export function handsTo(s: GameState, a: Building, b: Building) {
  const d = derived(s);
  // Only placed buildings are worked out ahead; one in hand is checked as it is.
  return d.neighbours.get(a.id)?.includes(b) ? d.joined.get(a.id)?.has(b.id) ?? false : meets(s, a, b) && !isFlooded(s, a) && !isFlooded(s, b);
}
