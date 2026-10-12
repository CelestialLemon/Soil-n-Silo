import { BUILDINGS, CLEAR_COST, CROPS, ITEM_IDS, ITEMS, recipeById, TRUCK, type BuildingId, type CropId, type ItemId } from './data.ts';
import { TERRAIN } from './map.ts';
import { accessTiles, nearestOpen } from './roads.ts';
import { givesGoods, isStop, redirect, routeChanged, takesGoods } from './sim.ts';
import {
  addBuilding, buildingAt, inMap, makeBuilding, removeBuilding, terrainAt, tileIndex, touchLayout, type Building, type Dir, type GameState,
  type Route, type Stop, type Truck,
} from './state.ts';

// What the player does: place, remove and configure buildings, clear trees and rock, buy trucks and set their routes. Every
// action checks its rules and returns a result the UI can show.

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
  // A garage's trucks are sold with it.
  const trucks = s.trucks.filter((t) => t.garage === b.id);
  for (const t of trucks) sellTruck(s, t);
  removeBuilding(s, b);
  s.credits += priceOf(s, b.type);
  // It leaves every route that stops there.
  for (const r of s.routes) {
    if (!r.stops.some((st) => st.building === b.id)) continue;
    let k = 0;
    const kept = r.stops.map((st) => (st.building === b.id ? null : k++));
    r.stops = r.stops.filter((st) => st.building !== b.id);
    routeChanged(s, r, kept);
  }
  return ok(`Removed the ${BUILDINGS[b.type].name.toLowerCase()}${trucks.length ? ` and its ${trucks.length} truck${trucks.length > 1 ? 's' : ''}` : ''} (refunded).`);
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

export function setCrop(s: GameState, b: Building, crop: CropId): Result {
  if (b.type !== 'field' || b.crop === crop) return no('');
  // Stops that pick up the old crop here pick up the new one too (the old harvest still waiting has to go).
  for (const r of s.routes) for (const st of r.stops) {
    if (st.building === b.id && st.pick.includes(b.crop!) && !st.pick.includes(crop)) { st.pick.push(crop); st.drop = st.drop.filter((i) => i !== crop); }
  }
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

// ---- Trucks ----

export const truckPrice = (s: GameState) => (s.scenario.sandbox ? 0 : TRUCK.cost);
const lc = (b: Building) => BUILDINGS[b.type].name.toLowerCase();

/** Buys a truck at a garage: it starts parked there, fully charged, with no route. */
export function buyTruck(s: GameState, g: Building): Result & { truck?: Truck } {
  if (g.type !== 'garage' || !s.buildings.includes(g)) return no('');
  if (s.trucks.filter((t) => t.garage === g.id).length >= TRUCK.perGarage) return no(`A garage holds ${TRUCK.perGarage} trucks. Build another garage for more.`);
  if (s.credits < truckPrice(s)) return no(`Not enough credits: a truck costs ${truckPrice(s)}.`);
  const w = s.map.width, at = accessTiles(s, g)[0] ?? nearestOpen(s, g.x, g.y);
  if (at === undefined || at === null) return no('There is no open ground for a truck.');
  s.credits -= truckPrice(s);
  const t: Truck = {
    id: s.nextId++, garage: g.id, route: null, stop: 0, phase: 'parked', x: at % w + 0.5, y: Math.floor(at / w) + 0.5, heading: 0,
    path: [], target: g.id, energy: TRUCK.battery, cargo: [], idle: 0, budget: 0, turn: 0, arrived: 0, charged: false,
  };
  s.trucks.push(t);
  return { ...ok(accessTiles(s, g).length ? 'Bought a truck. Give it a route.' : 'Bought a truck, but trucks can\'t reach the garage: leave an open tile beside it.'), truck: t };
}

/** Sells a truck (refunded); the goods it carries are lost. */
export function sellTruck(s: GameState, t: Truck): Result {
  const i = s.trucks.indexOf(t);
  if (i < 0) return no('');
  s.trucks.splice(i, 1);
  s.credits += truckPrice(s);
  return ok(`Sold the truck (refunded)${t.cargo.length ? `; its ${t.cargo.length} goods are lost` : ''}.`);
}

/** Gives a truck a route, or none (it drives home). It keeps its cargo. */
export function setTruckRoute(s: GameState, t: Truck, route: Route | null): Result {
  if ((route?.id ?? null) === t.route) return no('');
  t.route = route?.id ?? null;
  t.stop = 0;
  // It leaves any building or queue at once.
  if (t.phase === 'queue' || t.phase === 'dock') t.phase = 'stuck';
  // Charging at home, it sets off at once (and charges on only if its battery is short for the new route).
  if (t.phase === 'charge') t.phase = 'parked';
  redirect(s, t);
  return ok(route ? `The truck now runs ${route.name}.` : 'The truck drives home and waits there.');
}

/** A new route with no stops, named after the first free number. */
export function newRoute(s: GameState): Route {
  let k = 1;
  while (s.routes.some((r) => r.name === `Route ${k}`)) k++;
  const r: Route = { id: s.nextId++, name: `Route ${k}`, stops: [], moved: [] };
  s.routes.push(r);
  return r;
}

/** Deletes a route: its trucks drive home and wait there. */
export function deleteRoute(s: GameState, r: Route): Result {
  const i = s.routes.indexOf(r);
  if (i < 0) return no('');
  s.routes.splice(i, 1);
  for (const t of s.trucks) if (t.route === r.id) { t.route = null; t.stop = 0; if (t.phase === 'queue' || t.phase === 'dock') t.phase = 'stuck'; redirect(s, t); }
  return ok(`Deleted ${r.name}.`);
}

/** What a new stop does: picks up everything the building makes and drops everything it takes; a silo only drops. */
function defaultStop(b: Building): Stop {
  if (b.type === 'silo' || b.type === 'depot') return { building: b.id, drop: [...ITEM_IDS], pick: [], wait: TRUCK.wait };
  const pick = givesGoods(b);
  return { building: b.id, drop: takesGoods(b).filter((i) => !pick.includes(i)), pick, wait: TRUCK.wait };
}

/** Adds a building as the route's last stop. */
export function addStop(s: GameState, r: Route, b: Building): Result {
  if (!isStop(b)) return no(`Trucks don't stop at the ${lc(b)}: it has no goods.`);
  if (r.stops.length >= TRUCK.maxStops) return no(`A route has at most ${TRUCK.maxStops} stops.`);
  const kept = r.stops.map((_, i) => i);
  r.stops.push(defaultStop(b));
  routeChanged(s, r, kept);
  return ok(`Added the ${lc(b)} as stop ${r.stops.length} of ${r.name}.${accessTiles(s, b).length ? '' : ' Trucks can\'t reach it yet: leave an open tile beside it.'}`);
}

export function removeStop(s: GameState, r: Route, i: number): Result {
  if (!r.stops[i]) return no('');
  const kept = r.stops.map((_, k) => (k === i ? null : k < i ? k : k - 1));
  r.stops.splice(i, 1);
  routeChanged(s, r, kept);
  return ok(`Took stop ${i + 1} out of ${r.name}.`);
}

/** Moves a stop one place earlier (-1) or later (+1) in the route. */
export function moveStop(s: GameState, r: Route, i: number, by: -1 | 1): Result {
  const j = i + by;
  if (!r.stops[i] || !r.stops[j]) return no('');
  [r.stops[i], r.stops[j]] = [r.stops[j], r.stops[i]];
  routeChanged(s, r, r.stops.map((_, k) => (k === i ? j : k === j ? i : k)));
  return ok('');
}

/** Whether a stop drops a good, picks it up, or neither (a good is never both). */
export function setStopGood(r: Route, i: number, item: ItemId, how: 'drop' | 'pick' | null): Result {
  const st = r.stops[i];
  if (!st) return no('');
  const now = st.drop.includes(item) ? 'drop' : st.pick.includes(item) ? 'pick' : null;
  if (now === how) return no('');
  st.drop = st.drop.filter((x) => x !== item);
  st.pick = st.pick.filter((x) => x !== item);
  if (how) st[how].push(item);
  const name = ITEMS[item].name.toLowerCase();
  return ok(how === 'drop' ? `Drops ${name} there.` : how === 'pick' ? `Picks up ${name} there.` : `Leaves ${name} alone there.`);
}

/** How long trucks wait at a stop for room or goods, 0 to TRUCK.maxWait seconds. */
export function setStopWait(r: Route, i: number, seconds: number): Result {
  const st = r.stops[i];
  const w = Math.max(0, Math.min(TRUCK.maxWait, Math.round(seconds)));
  if (!st || st.wait === w) return no('');
  st.wait = w;
  return ok('');
}
