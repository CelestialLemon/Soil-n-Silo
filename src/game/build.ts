import { BUILDINGS, CLEAR_COST, CROPS, ITEMS, PAD, recipeById, type BuildingId, type CropId, type ItemId } from './data.ts';
import { TERRAIN } from './map.ts';
import { padDistance } from './sim.ts';
import {
  addBuilding, buildingAt, inMap, makeBuilding, removeBuilding, terrainAt, tileIndex, touchLayout, type Building, type Dir, type GameState,
} from './state.ts';

// What the player does: place, remove and configure buildings, and clear trees and rock. Every action checks its rules
// and returns a result the UI can show.

export interface Result { ok: boolean; message: string }
const ok = (message: string): Result => ({ ok: true, message });
const no = (message: string): Result => ({ ok: false, message });

export const priceOf = (s: GameState, type: BuildingId) => (s.scenario.sandbox ? 0 : BUILDINGS[type].cost);

/** Whether `type` fits with its north-west tile at (x, y). A belt may go over a belt (it turns it). */
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
    if (o && !(type === 'belt' && o.type === 'belt')) return no(`The ${BUILDINGS[o.type].name.toLowerCase()} is in the way.`);
  }
  if (s.credits < priceOf(s, type)) return no(`Not enough credits: the ${def.name.toLowerCase()} costs ${priceOf(s, type)}.`);
  return ok('');
}

export function place(s: GameState, type: BuildingId, x: number, y: number, rot: Dir): Result & { building?: Building } {
  const existing = buildingAt(s, x, y);
  if (type === 'belt' && existing?.type === 'belt') {
    if (existing.rot === rot) return no('');
    existing.rot = rot;
    // The layout changed: the belts leading out of buildings are worked out again.
    touchLayout(s);
    return { ...ok('Belt turned.'), building: existing };
  }
  const check = canPlace(s, type, x, y);
  if (!check.ok) return check;
  const b = makeBuilding(s, type, x, y, rot);
  s.credits -= priceOf(s, type);
  addBuilding(s, b);
  return { ...ok(`Built a ${BUILDINGS[type].name.toLowerCase()}.`), building: b };
}

/** A belt line from one tile to another: along x first, then y. Each belt points the way the line runs. */
export function beltPath(from: { x: number; y: number }, to: { x: number; y: number }, rot: Dir): { x: number; y: number; rot: Dir }[] {
  const out: { x: number; y: number; rot: Dir }[] = [];
  if (from.x === to.x && from.y === to.y) return [{ ...from, rot }];
  const dx = Math.sign(to.x - from.x), dy = Math.sign(to.y - from.y);
  const hx: Dir = dx > 0 ? 1 : 3, vy: Dir = dy > 0 ? 2 : 0;
  let x = from.x, y = from.y;
  while (x !== to.x) { out.push({ x, y, rot: hx }); x += dx; }
  while (y !== to.y) { out.push({ x, y, rot: dy ? vy : hx }); y += dy; }
  out.push({ x, y, rot: dy ? vy : hx });
  return out;
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

export function rotate(s: GameState, b: Building): Result {
  b.rot = ((b.rot + 1) % 4) as Dir;
  touchLayout(s);
  return ok('');
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

export function setFilter(b: Building, item: ItemId | null): Result {
  if (b.type !== 'sorter') return no('');
  b.filter = item;
  return ok(item ? `${ITEMS[item].name} goes straight on; the rest go left or right.` : 'Everything goes straight on.');
}

export function setPadMode(b: Building, mode: 'send' | 'receive'): Result {
  if (b.type !== 'pad' || b.mode === mode) return no('');
  if (b.drone && b.drone.phase !== 'home') return no('Wait for the drone to come home.');
  b.mode = mode;
  if (mode === 'receive') b.link = null;
  return ok(mode === 'send' ? 'The pad sends: link it to a receiving pad or the depot.' : 'The pad receives goods from sending pads.');
}

export function linkPad(s: GameState, pad: Building, target: Building): Result {
  if (pad.type !== 'pad' || pad.mode !== 'send') return no('Only a sending pad links.');
  if (target === pad) return no("A pad can't send to itself.");
  if (!(target.type === 'depot' || (target.type === 'pad' && target.mode === 'receive'))) return no('Link to a receiving pad or the depot.');
  const d = padDistance(pad, target);
  if (d > PAD.range) return no(`Too far: ${Math.round(d)} tiles (drones reach ${PAD.range}).`);
  pad.link = target.id;
  return ok(`Linked: ${Math.round(d)} tiles.`);
}
