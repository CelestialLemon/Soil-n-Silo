import { BUILDINGS, CLEAR_COST, CROPS, ITEMS, recipeById, type BuildingId, type CropId, type ItemId, type SellMode } from './data.ts';
import { TERRAIN } from './map.ts';
import { inputGoods } from './sim.ts';
import {
  addBuilding, buildingAt, inMap, makeBuilding, removeBuilding, terrainAt, tileIndex, touchLayout, type Building, type Dir, type GameState,
} from './state.ts';

// What the player does: place, remove and configure buildings, and clear trees and rock. Every action checks its rules
// and returns a result the UI can show.

export interface Result { ok: boolean; message: string }
const ok = (message: string): Result => ({ ok: true, message });
const no = (message: string): Result => ({ ok: false, message });

export const priceOf = (s: GameState, type: BuildingId) => (s.scenario.sandbox ? 0 : BUILDINGS[type].cost);

/** Whether `type` fits with its north-west tile at (x, y). */
export function canPlace(s: GameState, type: BuildingId, x: number, y: number): Result {
  const def = BUILDINGS[type];
  if (!def.category) return no(`The ${def.name.toLowerCase()} can't be built.`);
  for (let ty = y; ty < y + def.size; ty++) for (let tx = x; tx < x + def.size; tx++) {
    if (!inMap(s, tx, ty)) return no('Off the edge of the map.');
    const t = terrainAt(s, tx, ty);
    if (t === TERRAIN.tree) return no('A tree is in the way. Remove it first (X).');
    if (t === TERRAIN.rock) return no('Rock is in the way. Remove it first (X).');
    if (t === TERRAIN.water && !def.onWater) return no(`The ${def.name.toLowerCase()} can't stand on water.`);
    const o = buildingAt(s, tx, ty);
    if (o) return no(`The ${BUILDINGS[o.type].name.toLowerCase()} is in the way.`);
  }
  if (s.credits < priceOf(s, type)) return no(`Not enough credits: the ${def.name.toLowerCase()} costs ${priceOf(s, type)}.`);
  return ok('');
}

export function place(s: GameState, type: BuildingId, x: number, y: number, rot: Dir): Result & { building?: Building } {
  const check = canPlace(s, type, x, y);
  if (!check.ok) return check;
  const b = makeBuilding(s, type, x, y, rot);
  s.credits -= priceOf(s, type);
  addBuilding(s, b);
  return { ...ok(`Built a ${BUILDINGS[type].name.toLowerCase()}.`), building: b };
}

export function remove(s: GameState, b: Building): Result {
  if (b.type === 'depot') return no("The depot stays: it's where the commission is delivered.");
  if (!s.buildings.includes(b)) return no('');
  removeBuilding(s, b);
  s.credits += priceOf(s, b.type);
  return ok(`Removed the ${BUILDINGS[b.type].name.toLowerCase()} (refunded).`);
}

/** Removes the building on a tile, or clears a tree or rock there. */
export function removeAt(s: GameState, x: number, y: number): Result {
  if (!inMap(s, x, y)) return no('');
  const b = buildingAt(s, x, y);
  if (b) return remove(s, b);
  const t = terrainAt(s, x, y);
  if (t !== TERRAIN.tree && t !== TERRAIN.rock) return no('');
  const kind = t === TERRAIN.tree ? 'tree' : 'rock';
  const cost = s.scenario.sandbox ? 0 : CLEAR_COST[kind];
  if (s.credits < cost) return no(`Clearing a ${kind} costs ${cost} credits.`);
  s.credits -= cost;
  s.map.terrain[tileIndex(s, x, y)] = TERRAIN.grass;
  // Trees shelter turbines: their shelter is worked out again.
  touchLayout(s);
  return ok(kind === 'tree' ? `Cleared a tree (${cost} credits). Fewer trees: soil health falls a little.` : `Cleared rock (${cost} credits).`);
}

export function setCrop(b: Building, crop: CropId): Result {
  if (b.type !== 'field' || b.crop === crop) return no('');
  b.crop = crop; b.growth = 0;
  return ok(`The field now grows ${CROPS[crop].name.toLowerCase()}${b.stored ? ` (once its ${CROPS[b.harvest ?? crop].name.toLowerCase()} harvest has gone)` : ''}.`);
}

export function setRecipe(b: Building, id: string): Result {
  if (b.recipe === id) return no('');
  const r = recipeById(id);
  if (!r || r.building !== b.type) return no('');
  if (b.progress !== null && b.progress !== undefined) return no('Wait for the batch in progress to finish.');
  b.recipe = id;
  b.progress = null;
  return ok(`Now making ${ITEMS[r.outputs[0].item].name.toLowerCase()}.`);
}

/** Whether a building takes `item` from silos (every input starts taken). */
export function setAccept(b: Building, item: ItemId, on: boolean): Result {
  if (!b.refuse || !inputGoods(b).includes(item) || b.refuse.includes(item) === !on) return no('');
  b.refuse = on ? b.refuse.filter((i) => i !== item) : [...b.refuse, item];
  return ok(on ? `Takes ${ITEMS[item].name.toLowerCase()} again.` : `No longer takes ${ITEMS[item].name.toLowerCase()}.`);
}

/** Whether silos send `item` to the depot to sell, and how (null: not at all). */
export function setSell(depot: Building, item: ItemId, mode: SellMode | null): Result {
  if (depot.type !== 'depot' || (depot.sell![item] ?? null) === mode) return no('');
  if (mode) depot.sell![item] = mode; else delete depot.sell![item];
  const name = ITEMS[item].name.toLowerCase();
  return ok(mode === 'spare' ? `Silos sell the ${name} no building takes.` : mode === 'half' ? `Silos sell about half the ${name}, even when buildings want it.` : `Silos keep ${name} for your buildings.`);
}
