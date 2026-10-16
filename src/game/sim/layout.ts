import { BUILDINGS, type BuildingId } from '../data.ts';
import { exposureAt, hiveReaches, nearWaterAt, sprinklerWaters } from '../rules.ts';
import { buildingAt, isMachine, layoutOf, tileIndex, type Building, type FieldBuilding, type GameState } from '../state.ts';
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
  /** Sprinklers near water. */
  nearWater: Set<number>;
  /** Tiles under a field (the rest of the ground rests). */
  fielded: Set<number>;
  /** The buildings sharing an edge with each building. */
  neighbours: Map<number, Building[]>;
}

export function derived(s: GameState): Derived {
  const layout = layoutOf(s);
  const rt = runtimeOf(s);
  let d = rt.derived;
  if (d && d.layout === layout) return d;
  d = { layout, sprinklers: new Map(), pollinated: new Set(), flowers: new Map(), exposure: new Map(), nearWater: new Set(), fielded: new Set(), neighbours: new Map() };
  const fields = s.buildings.filter((b): b is FieldBuilding => b.type === 'field');
  const hives = s.buildings.filter((b) => b.type === 'hive');
  const sprinklers = s.buildings.filter((b) => b.type === 'sprinkler');
  for (const f of fields) {
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) d.fielded.add(tileIndex(s, x, y));
    d.sprinklers.set(f.id, sprinklers.filter((sp) => sprinklerWaters(sp.x, sp.y, f)));
    if (hives.some((h) => hiveReaches(f, h.x, h.y))) d.pollinated.add(f.id);
  }
  for (const h of hives) d.flowers.set(h.id, fields.filter((f) => hiveReaches(f, h.x, h.y)));
  for (const t of s.buildings) if (t.type === 'turbine') d.exposure.set(t.id, exposureAt(s, t.x, t.y));
  for (const sp of sprinklers) if (nearWaterAt(s, sp.x, sp.y)) d.nearWater.add(sp.id);
  for (const b of s.buildings) d.neighbours.set(b.id, besides(s, b));
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
export const nearWater = (s: GameState, b: Building) => derived(s).nearWater.has(b.id);
