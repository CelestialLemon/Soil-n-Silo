import {
  BUILDINGS, FIELD, GROUP_NAMES, GROUPS, INPUT_BATCHES, ITEM_IDS, ITEMS, OUTPUT_BATCHES, recipeById, recipesFor, SILO, TICK, type BuildingId,
  type Ingredient, type ItemId, type Recipe,
} from '../data.ts';
import { noteFlow } from '../flows.ts';
import { noteMade, noteTaken } from '../history.ts';
import { noteRunUse } from '../runlog.ts';
import { applySetting, blankBuilding, isMachine, type Building, type Setting, type GameState, type MachineBuilding } from '../state.ts';
import { derived, besides, handlesGoods } from './layout.ts';
import { fieldFertility, changeSoil } from './soil.ts';
import { runtimeOf } from '../runtime.ts';
import { must } from '../result.ts';

// Goods: recipes, what buildings take and hold, and the buildings next door trading goods without a truck.

// ---- Machines ----

export const members = (ing: Ingredient): readonly ItemId[] => ('item' in ing ? [ing.item] : GROUPS[ing.group]);
const held = (b: MachineBuilding, ing: Ingredient) => members(ing).reduce((n, it) => n + (b.inputs[it] ?? 0), 0);
export const ingName = (ing: Ingredient) => ('item' in ing ? ITEMS[ing.item].name.toLowerCase() : GROUP_NAMES[ing.group]);

/** The recipe a machine is set to (none for a building that isn't a machine). */
export function recipeOf(b: MachineBuilding): Recipe;
export function recipeOf(b: Building): Recipe | null;
export function recipeOf(b: Building) { return isMachine(b) ? recipeById(b.recipe) : null; }

export function missing(b: MachineBuilding, r: Recipe) {
  return r.inputs.find((ing) => held(b, ing) < ing.n) ?? null;
}

export function outputsFit(b: MachineBuilding, r: Recipe) {
  return r.outputs.find((o) => (b.outputs[o.item] ?? 0) + o.n > o.n * OUTPUT_BATCHES) ?? null;
}

export function consume(s: GameState, b: MachineBuilding, r: Recipe) {
  for (const ing of r.inputs) {
    let need = ing.n;
    // Take from whichever member there's most of.
    while (need > 0) {
      const it = [...members(ing)].sort((a, c) => (b.inputs[c] ?? 0) - (b.inputs[a] ?? 0))[0];
      b.inputs[it] = (b.inputs[it] ?? 0) - 1;
      if (!b.inputs[it]) delete b.inputs[it];
      used(s, it);
      need--;
    }
  }
}

/** Notes a good used up by a building (for the ledger, and the run's milestones). */
function used(s: GameState, item: ItemId) {
  noteFlow(s, 'used', item);
  noteRunUse(s, item);
}

/** Whether a field's soil is poor enough to take compost. */
export const wantsCompost = (s: GameState, f: Building) => fieldFertility(s, f) < FIELD.compostBelow;
/** How many compost a field takes now: enough to lift its soil over the line. */
export const compostWanted = (s: GameState, f: Building) => Math.max(0, Math.ceil((FIELD.compostBelow - fieldFertility(s, f)) / FIELD.compostGain));

/** Whether a building takes `item` from a truck right now. Takes it if so: the depot buys it, a silo stores it. */
export function accept(s: GameState, b: Building, item: ItemId): boolean {
  if (b.type === 'depot') { deliver(s, item); return true; }
  if (b.type === 'silo') {
    if ((b.store[item] ?? 0) >= SILO.perGood) return false;
    b.store[item] = (b.store[item] ?? 0) + 1; return true;
  }
  if (b.type === 'field') {
    // A field holds no compost: it takes one only while its soil is poor, and spreads it at once.
    if (item !== 'compost' || !wantsCompost(s, b)) return false;
    changeSoil(s, b, FIELD.compostGain); used(s, 'compost'); return true;
  }
  if (!isMachine(b)) return false;
  const r = recipeOf(b);
  const ing = r.inputs.find((i) => members(i).includes(item));
  if (!ing || held(b, ing) >= ing.n * INPUT_BATCHES) return false;
  b.inputs[item] = (b.inputs[item] ?? 0) + 1;
  return true;
}

/** Delivers a good to the depot: it counts towards the goals and pays its price. */
export function deliver(s: GameState, item: ItemId) {
  s.delivered[item] = (s.delivered[item] ?? 0) + 1;
  s.credits += ITEMS[item].price;
  s.earned += ITEMS[item].price;
  (s.stats.delivered[item] ??= []).push(s.time);
  noteFlow(s, 'delivered', item);
}

export function made(s: GameState, b: Building, item: ItemId, n: number) {
  s.made[item] = (s.made[item] ?? 0) + n;
  noteMade(s, b, item, n, TICK);
  noteFlow(s, 'made', item, n);
  const bucket = s.stats.made[0];
  bucket[item] = (bucket[item] ?? 0) + n;
}

// ---- Goods waiting in buildings ----

/** How many of `item` a building has waiting for a truck: a harvest, products, or a silo's stock. */
export function waiting(b: Building, item: ItemId) {
  if (b.type === 'field') return (b.harvest ?? b.crop) === item ? b.stored : 0;
  if (b.type === 'hive') return item === 'honey' ? b.stored : 0;
  if (b.type === 'silo') return b.store[item] ?? 0;
  return isMachine(b) ? b.outputs[item] ?? 0 : 0;
}
export function take(s: GameState, b: Building, item: ItemId) {
  noteTaken(s, b, item);
  if (b.type === 'field') { b.stored--; if (!b.stored) b.harvest = b.crop; return; }
  if (b.type === 'hive') { b.stored--; return; }
  const from = b.type === 'silo' ? b.store : isMachine(b) ? b.outputs : null;
  if (!from) return;
  const left = must(from[item], 'stock') - 1;
  if (left) from[item] = left; else delete from[item];
}

/** The goods a building can take now: its recipe's inputs (any member of a group), or compost for a field. */
export function inputGoods(b: Building): ItemId[] {
  if (b.type === 'field') return ['compost'];
  return isMachine(b) ? recipeOf(b).inputs.flatMap((i) => [...members(i)]) : [];
}

// ---- Next door: buildings sharing an edge trade goods without a truck ----

/** Whether a building hands its goods straight to buildings next door: it grows or makes them. */
const producer = handlesGoods;
/** Whether it takes goods straight from buildings next door: a machine its inputs, a field compost. */
const consumer = (b: Building) => b.type === 'field' || isMachine(b);

/** The goods `from` hands straight to `to`, a building next door, with the crop and recipe each has now. */
export function passes(from: Building, to: Building): ItemId[] {
  if (from === to || !producer(from) || !consumer(to)) return [];
  const takes = takesNow(to);
  return givesNow(from).filter((i) => takes.includes(i));
}

/** The buildings sharing an edge with a building. */
export const neighboursOf = (s: GameState, b: Building) => derived(s).neighbours.get(b.id) ?? besides(s, b);

export interface Link { b: Building; goods: ItemId[] }
/** What a building takes from each building next door, and gives to each (only those it trades with). */
export function linksOf(s: GameState, b: Building, near: Building[] = neighboursOf(s, b)): { from: Link[]; to: Link[] } {
  const from: Link[] = [], to: Link[] = [];
  for (const n of near) {
    const i = passes(n, b), o = passes(b, n);
    if (i.length) from.push({ b: n, goods: i });
    if (o.length) to.push({ b: n, goods: o });
  }
  return { from, to };
}

/** What a building about to be placed at (x, y) would trade with the buildings next door (with the setting it would be placed with: else its first recipe, a field wheat). */
export function linksAt(s: GameState, type: BuildingId, x: number, y: number, set: Setting = {}): { from: Link[]; to: Link[] } {
  const b = applySetting(blankBuilding(0, type, x, y, 0), set);
  return linksOf(s, b, besides(s, b));
}


/** Whether a building trades any good with a building next door. */
export const tradesNextDoor = (s: GameState, b: Building) => neighboursOf(s, b).some((n) => passes(n, b).length > 0 || passes(b, n).length > 0);

/** A good handed next door, for the view to show it crossing over. Kept for a moment, not saved. */
export interface Handoff { from: number; to: number; item: ItemId; time: number }
/** How long a handoff stays in the list (seconds of play). */
export const HANDOFF_SECONDS = 0.8;
export const recentHandoffs = (s: GameState): readonly Handoff[] => runtimeOf(s).handoffs ?? [];

/**
 * Each building that takes goods takes, each step, up to one of each good it takes from the buildings next door that have
 * it waiting (from whichever has the most). The one that took longest ago goes first, so two buildings sharing a slow giver
 * take turns. This runs before trucks load, so a neighbour comes first.
 */
export function feedNeighbours(s: GameState) {
  const rt = runtimeOf(s);
  const fed = rt.lastFed ??= new Map(), list = rt.handoffs ??= [];
  let old = 0;
  while (old < list.length && (list[old].time < s.time - HANDOFF_SECONDS || list[old].time > s.time)) old++;
  if (old) list.splice(0, old);
  const order = s.buildings.filter((c) => consumer(c) && neighboursOf(s, c).length > 0);
  order.sort((a, b) => (fed.get(a.id) ?? -1) - (fed.get(b.id) ?? -1) || a.id - b.id);
  for (const c of order) {
    const near = neighboursOf(s, c).filter(producer);
    if (!near.length) continue;
    for (const item of takesNow(c)) {
      let best: Building | null = null, most = 0;
      for (const p of near) { const n = waiting(p, item); if (n > most) { most = n; best = p; } }
      if (best && accept(s, c, item)) { take(s, best, item); fed.set(c.id, s.time); list.push({ from: best.id, to: c.id, item, time: s.time }); }
    }
  }
}

/** Every good a building could ever take from a truck (for a stop's defaults and choices). */
export function takesGoods(b: Building): ItemId[] {
  if (BUILDINGS[b.type].stores) return [...ITEM_IDS];
  if (b.type === 'field') return ['compost'];
  return [...new Set(recipesFor(b.type).flatMap((r) => r.inputs.flatMap((i) => [...members(i)])))];
}

/** The goods a building takes or gives with the recipe it has now (any recipe's, for one without). */
export const takesNow = (b: Building) => (isMachine(b) ? inputGoods(b) : takesGoods(b));
export const givesNow = (b: Building) => (isMachine(b) ? [...new Set([...recipeOf(b).outputs.map((o) => o.item), ...(Object.keys(b.outputs) as ItemId[])])] : givesGoods(b));

/** Every good a building could ever give a truck: a field's crop (and a waiting harvest of another), products, stock. */
export function givesGoods(b: Building): ItemId[] {
  if (b.type === 'silo') return [...ITEM_IDS];
  if (b.type === 'field') return [...new Set([b.crop, b.harvest ?? b.crop])];
  if (b.type === 'hive') return ['honey'];
  return [...new Set(recipesFor(b.type).flatMap((r) => r.outputs.map((o) => o.item)))];
}
