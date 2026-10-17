import { BUILDINGS, CLEAR_COST, CROP_IDS, CROPS, EARTH, ITEM_IDS, ITEMS, recipeById, recipesFor, TRUCK, type BuildingId, type CropId, type ItemId } from './data.ts';
import { TERRAIN } from './map.ts';
import { centreLevel, FLAT, isFlat, isUnbroken, MAX_LEVEL } from './relief.ts';
import { groundOf, wheelSite } from './rules.ts';
import { err, ok, type Result } from './result.ts';
import { accessTiles, nearestOpen } from './roads.ts';
import { givesGoods, takesGoods } from './sim/goods.ts';
import { touchRoutes } from './runtime.ts';
import { isStop, redirect, routeChanged } from './sim/trucks.ts';
import {
  addBuilding, applySetting, buildingAt, inMap, makeBuilding, removeBuilding, terrainAt, tileIndex, touchLayout, touchRelief, type Building, type BuildingOf, type Dir, type GameState, type MachineBuilding, type Setting,
  type Route, type Stop, type Truck,
} from './state.ts';

export type { Setting };

// What the player does: place, remove and configure buildings, clear trees and rock, buy trucks and set their routes. Every
// action checks its rules and returns a result the UI can show.

/** What an action did. Done, it carries what to tell the player ('' for nothing) and anything it made; refused, why not ('' when
 * there's nothing worth saying, such as a click that changes nothing). */
export type Action<T = object> = Result<{ message: string } & T>;
const done = (message: string): Action => ok({ message });
const no = err;
/** What an action's result tells the player, done or refused ('' for nothing). */
export const messageOf = (r: Action) => (r.ok ? r.value.message : r.error);

export const priceOf = (s: GameState, type: BuildingId) => (s.scenario.sandbox ? 0 : BUILDINGS[type].cost);
/** What clearing a tree or rock costs (nothing in the sandbox). */
export const clearPrice = (s: GameState, kind: keyof typeof CLEAR_COST) => (s.scenario.sandbox ? 0 : CLEAR_COST[kind]);

/** What earthworks of `steps` steps cost (nothing in the sandbox). */
export const earthPrice = (s: GameState, steps: number) => (s.scenario.sandbox ? 0 : Math.round(EARTH.step * steps));

/**
 * The ground a building needs made under it: the level its footprint is levelled to and the steps that takes, or none
 * (`level` null) when it fits as the ground lies.
 */
export interface Groundwork { level: number | null; steps: number }

/** The steps that level a tile to `level`: a level each, and half a step more to flatten a ramp. */
const stepsTo = (s: GameState, i: number, x: number, y: number, level: number) =>
  Math.abs(centreLevel(s.map, x, y) - level) + (s.map.ramp[i] === FLAT ? 0 : 0.5);

/** Runs `f` with a square of the map levelled flat at `level`, then puts the ground back (to ask what a building would find there). */
export function levelledFor<T>(s: GameState, x: number, y: number, n: number, level: number, f: () => T): T {
  const saved: [number, number, number][] = [];
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) {
    const i = tileIndex(s, tx, ty);
    saved.push([i, s.map.level[i], s.map.ramp[i]]);
    s.map.level[i] = level; s.map.ramp[i] = FLAT;
  }
  try { return f(); } finally { for (const [i, l, r] of saved) { s.map.level[i] = l; s.map.ramp[i] = r; } }
}

/**
 * How the ground at (x, y) gets ready for `type` (its tiles are on the map): nothing where it fits as it lies (relief.ts:
 * one-tile buildings anywhere, a field without a cliff inside it, the rest flat), else levelled to the level that takes the
 * fewest steps (the lower on a tie), never below water beside it; a water wheel only to the level of the river beside it.
 */
export function groundworkFor(s: GameState, type: BuildingId, x: number, y: number): Result<Groundwork> {
  const n = BUILDINGS[type].size, ground = groundOf(type), wheel = !!BUILDINGS[type].onBank;
  const fits = ground === 'any' || (ground === 'unbroken' ? isUnbroken(s.map, x, y, n) : isFlat(s.map, x, y, n));
  if (fits && (!wheel || wheelSite(s, x, y))) return ok({ level: null, steps: 0 });
  // Water beside it sets the lowest the ground can go.
  let floor = 0;
  for (let ty = y - 1; ty <= y + n; ty++) for (let tx = x - 1; tx <= x + n; tx++) {
    if (inMap(s, tx, ty) && terrainAt(s, tx, ty) === TERRAIN.water) floor = Math.max(floor, s.map.level[tileIndex(s, tx, ty)]);
  }
  let best: Groundwork | null = null;
  for (let level = floor; level <= MAX_LEVEL; level++) {
    if (wheel && !levelledFor(s, x, y, n, level, () => wheelSite(s, x, y))) continue;
    let steps = 0;
    for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) steps += stepsTo(s, tileIndex(s, tx, ty), tx, ty, level);
    if (!best || steps < best.steps) best = { level, steps };
  }
  if (!best) return no(wheel ? `The ${BUILDINGS[type].name.toLowerCase()} stands on a river bank, beside the running water.` : 'The ground here can\'t be levelled for it.');
  return ok(best);
}

/** What placing `type` at (x, y) costs: the building and levelling the ground for it. */
export function placePrice(s: GameState, type: BuildingId, gw: Groundwork) {
  return priceOf(s, type) + earthPrice(s, gw.steps);
}

/** Whether `type` fits with its north-west tile at (x, y), and the groundwork it would need. */
export function canPlace(s: GameState, type: BuildingId, x: number, y: number): Result<Groundwork> {
  const def = BUILDINGS[type];
  if (!def.category) return no(`The ${def.name.toLowerCase()} can't be built.`);
  for (let ty = y; ty < y + def.size; ty++) for (let tx = x; tx < x + def.size; tx++) {
    if (!inMap(s, tx, ty)) return no('Off the edge of the map.');
    const t = terrainAt(s, tx, ty);
    if (t === TERRAIN.tree) return no('A tree is in the way. Remove it first.');
    if (t === TERRAIN.rock) return no('Rock is in the way. Remove it first.');
    if (t === TERRAIN.water && !def.onWater) return no(`The ${def.name.toLowerCase()} can't stand on water.`);
    const o = buildingAt(s, tx, ty);
    if (o) return no(`The ${BUILDINGS[o.type].name.toLowerCase()} is in the way.`);
  }
  const gw = groundworkFor(s, type, x, y);
  if (!gw.ok) return gw;
  const price = placePrice(s, type, gw.value);
  if (s.credits < price) return no(`Not enough credits: the ${def.name.toLowerCase()} costs ${priceOf(s, type)}${gw.value.steps ? `, and levelling the ground ${earthPrice(s, gw.value.steps)}` : ''}.`);
  return gw;
}

/** The choices a type offers while placing: a field's crops, or the recipes of a machine with more than one (the bakery). */
export function choicesOf(type: BuildingId): Setting[] {
  if (type === 'field') return CROP_IDS.map((crop) => ({ crop }));
  const rs = recipesFor(type);
  return rs.length > 1 ? rs.map((r) => ({ recipe: r.id })) : [];
}

/** What the player last chose for a type this level (its first choice before that); nothing for a type with no choice. */
export function settingFor(s: GameState, type: BuildingId): Setting {
  const all = choicesOf(type);
  if (!all.length) return {};
  if (type === 'field') return { crop: s.chosen.crop };
  const recipe = s.chosen.recipes[type];
  return all.find((c) => c.recipe === recipe) ?? all[0];
}

/** Remembers a choice for the level, for the next time the type is picked up (a setting that doesn't fit the type is left out). */
export function remember(s: GameState, type: BuildingId, set: Setting) {
  if (type === 'field' && set.crop) s.chosen.crop = set.crop;
  else if (set.recipe && choicesOf(type).some((c) => c.recipe === set.recipe)) s.chosen.recipes[type] = set.recipe;
}

/** The choice `d` steps on from `now` (round the list), for a key that cycles. */
export function stepSetting(type: BuildingId, now: Setting, d: 1 | -1): Setting {
  const all = choicesOf(type);
  if (!all.length) return {};
  const i = all.findIndex((c) => c.crop === now.crop && c.recipe === now.recipe);
  return all[(Math.max(i, 0) + d + all.length) % all.length];
}

/** A choice in words, lower case ("beans", "honey cake"; '' for none). */
export function settingName(set: Setting): string {
  if (set.crop) return CROPS[set.crop].name.toLowerCase();
  return set.recipe ? ITEMS[recipeById(set.recipe).outputs[0].item].name.toLowerCase() : '';
}

/** Places a building; `set` is what a field grows or a machine makes (without it, the type's first). */
export function place<K extends BuildingId>(s: GameState, type: K, x: number, y: number, rot: Dir, set: Setting = {}): Action<{ building: BuildingOf<K> }> {
  const check = canPlace(s, type, x, y);
  if (!check.ok) return check;
  const fits = choicesOf(type);
  if ((set.crop || set.recipe) && !fits.some((c) => c.crop === set.crop && c.recipe === set.recipe)) throw new Error(`A ${type} can't be placed with ${JSON.stringify(set)}`);
  const gw = check.value, n = BUILDINGS[type].size;
  s.credits -= placePrice(s, type, gw);
  if (gw.level !== null) {
    for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) { const i = tileIndex(s, tx, ty); s.map.level[i] = gw.level; s.map.ramp[i] = FLAT; }
    touchRelief(s);
  }
  // A water wheel faces the river.
  const site = BUILDINGS[type].onBank ? wheelSite(s, x, y) : null;
  const b = applySetting(makeBuilding(s, type, x, y, site ? site.rot : rot), set) as BuildingOf<K>;
  addBuilding(s, b);
  const what = settingName(set);
  return ok({ message: `Built a ${BUILDINGS[type].name.toLowerCase()}${what ? ` (${what})` : ''}${gw.steps ? `, levelling the ground (${earthPrice(s, gw.steps)} credits)` : ''}.`, building: b });
}

export function remove(s: GameState, b: Building): Action {
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
    touchRoutes(s);
    routeChanged(s, r, kept);
  }
  return done(`Removed the ${BUILDINGS[b.type].name.toLowerCase()}${trucks.length ? ` and its ${trucks.length} truck${trucks.length > 1 ? 's' : ''}` : ''} (refunded).`);
}

/** Removes the building on a tile, or clears a tree or rock there. */
export function removeAt(s: GameState, x: number, y: number): Action {
  if (!inMap(s, x, y)) return no('');
  const b = buildingAt(s, x, y);
  if (b) return remove(s, b);
  const t = terrainAt(s, x, y);
  if (t !== TERRAIN.tree && t !== TERRAIN.rock) return no('');
  const kind = t === TERRAIN.tree ? 'tree' : 'rock';
  const cost = clearPrice(s, kind);
  if (s.credits < cost) return no(`Clearing a ${kind} costs ${cost} credits.`);
  s.credits -= cost;
  s.map.terrain[tileIndex(s, x, y)] = TERRAIN.grass;
  // Trees shelter turbines: their shelter is worked out again.
  touchLayout(s);
  return done(kind === 'tree' ? `Cleared a tree (${cost} credits). Fewer trees: soil health falls a little.` : `Cleared rock (${cost} credits).`);
}

// ---- Earthworks ----

export type Earthwork = 'raise' | 'lower' | 'ramp';
export const EARTHWORKS: Earthwork[] = ['raise', 'lower', 'ramp'];
export const EARTHWORK_NAMES: Record<Earthwork, string> = { raise: 'Raise', lower: 'Lower', ramp: 'Ramp' };

/**
 * Whether earthwork `how` can be done on a tile: open grass on the map (trees and rock cleared first, nothing built), raised
 * to at most MAX_LEVEL, lowered no lower than water beside it, made a ramp rising towards `dir` (a ramp already there is
 * turned). Raising or lowering a ramp makes it flat at its top or its foot.
 */
export function canReshape(s: GameState, x: number, y: number, how: Earthwork, dir: Dir): Result<{ level: number; ramp: number }> {
  if (!inMap(s, x, y)) return no('Off the edge of the map.');
  const t = terrainAt(s, x, y);
  if (t === TERRAIN.water) return no('Water can\'t be moved.');
  if (t === TERRAIN.tree) return no('A tree is in the way. Remove it first.');
  if (t === TERRAIN.rock) return no('Rock is in the way. Remove it first.');
  const o = buildingAt(s, x, y);
  if (o) return no(`The ${BUILDINGS[o.type].name.toLowerCase()} is in the way.`);
  const i = tileIndex(s, x, y), l = s.map.level[i], r = s.map.ramp[i];
  // Water beside it, corners too (as when levelling under a building), sets the lowest it can go.
  let water = -1;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inMap(s, x + dx, y + dy) && terrainAt(s, x + dx, y + dy) === TERRAIN.water) water = Math.max(water, s.map.level[tileIndex(s, x + dx, y + dy)]);
  let to: { level: number; ramp: number };
  if (how === 'raise') to = { level: l + 1, ramp: FLAT };
  else if (how === 'lower') to = { level: r === FLAT ? l - 1 : l, ramp: FLAT };
  else to = { level: l, ramp: dir };
  if (how === 'ramp' && r === dir) return no('');
  if (to.level > MAX_LEVEL || (how === 'ramp' && l + 1 > MAX_LEVEL)) return no('The ground is as high as it goes.');
  if (to.level < 0) return no('The ground is as low as it goes.');
  if (to.level < water) return no('The ground can\'t go below the water beside it.');
  const cost = earthPrice(s, 1);
  if (s.credits < cost) return no(`Not enough credits: earthworks cost ${cost} a step.`);
  return ok(to);
}

/** Raises, lowers or ramps a tile, one step. */
export function reshape(s: GameState, x: number, y: number, how: Earthwork, dir: Dir): Action {
  const c = canReshape(s, x, y, how, dir);
  if (!c.ok) return c;
  const i = tileIndex(s, x, y), cost = earthPrice(s, 1);
  s.map.level[i] = c.value.level; s.map.ramp[i] = c.value.ramp;
  s.credits -= cost;
  touchRelief(s);
  return done(`${how === 'raise' ? 'Raised the ground' : how === 'lower' ? 'Lowered the ground' : 'Made a ramp'}${cost ? ` (${cost} credits)` : ''}.`);
}

export function setCrop(s: GameState, b: Building, crop: CropId): Action {
  if (b.type !== 'field' || b.crop === crop) return no('');
  // Stops that pick up the old crop here pick up the new one too (the old harvest still waiting has to go).
  for (const r of s.routes) for (const st of r.stops) {
    if (st.building === b.id && st.pick.includes(b.crop) && !st.pick.includes(crop)) { st.pick.push(crop); st.drop = st.drop.filter((i) => i !== crop); }
  }
  // A bean field guards the fields beside it against erosion: worked out again when one starts or stops growing beans.
  if (b.crop === 'beans' || crop === 'beans') touchLayout(s);
  b.crop = crop; b.growth = 0;
  return done(`The field now grows ${CROPS[crop].name.toLowerCase()}${b.stored ? ` (once its ${CROPS[b.harvest ?? crop].name.toLowerCase()} harvest has gone)` : ''}.`);
}

export function setRecipe(b: MachineBuilding, id: string): Action {
  if (b.recipe === id) return no('');
  const r = recipesFor(b.type).find((x) => x.id === id);
  if (!r) return no('');
  if (b.progress !== null) return no('Wait for the batch in progress to finish.');
  b.recipe = id;
  b.progress = null;
  return done(`Now making ${ITEMS[r.outputs[0].item].name.toLowerCase()}.`);
}

// ---- Trucks ----

export const truckPrice = (s: GameState) => (s.scenario.sandbox ? 0 : TRUCK.cost);
const lc = (b: Building) => BUILDINGS[b.type].name.toLowerCase();

/** Buys a truck at a garage: it starts parked there, fully charged, with no route. */
export function buyTruck(s: GameState, g: Building): Action<{ truck: Truck }> {
  if (g.type !== 'garage' || !s.buildings.includes(g)) return no('');
  if (s.trucks.filter((t) => t.garage === g.id).length >= TRUCK.perGarage) return no(`A garage holds ${TRUCK.perGarage} trucks. Build another garage for more.`);
  if (s.credits < truckPrice(s)) return no(`Not enough credits: a truck costs ${truckPrice(s)}.`);
  const w = s.map.width, at = accessTiles(s, g)[0] ?? nearestOpen(s, g.x, g.y);
  if (at === undefined || at === null) return no('There is no open ground for a truck.');
  s.credits -= truckPrice(s);
  const t: Truck = {
    id: s.nextId++, garage: g.id, route: null, stop: 0, phase: 'parked', x: at % w + 0.5, y: Math.floor(at / w) + 0.5, heading: 0,
    path: [], target: g.id, energy: TRUCK.battery, cargo: [], idle: 0, budget: 0, arrived: 0, charged: false,
  };
  s.trucks.push(t);
  touchRoutes(s);
  const message = accessTiles(s, g).length ? 'Bought a truck. Give it a route.' : 'Bought a truck, but trucks can\'t reach the garage: leave an open tile beside it.';
  return ok({ message, truck: t });
}

/** Sells a truck (refunded); the goods it carries are lost. */
export function sellTruck(s: GameState, t: Truck): Action {
  const i = s.trucks.indexOf(t);
  if (i < 0) return no('');
  s.trucks.splice(i, 1);
  touchRoutes(s);
  s.credits += truckPrice(s);
  return done(`Sold the truck (refunded)${t.cargo.length ? `; its ${t.cargo.length} goods are lost` : ''}.`);
}

/** Gives a truck a route, or none (it drives home). It keeps its cargo. */
export function setTruckRoute(s: GameState, t: Truck, route: Route | null): Action {
  if ((route?.id ?? null) === t.route) return no('');
  t.route = route?.id ?? null;
  t.stop = 0;
  touchRoutes(s);
  // It leaves any building or queue at once.
  if (t.phase === 'queue' || t.phase === 'dock') t.phase = 'stuck';
  // Charging at home, it sets off at once (and charges on only if its battery is short for the new route).
  if (t.phase === 'charge') t.phase = 'parked';
  redirect(s, t);
  return done(route ? `The truck now runs ${route.name}.` : 'The truck drives home and waits there.');
}

/** Throws away the goods a truck carries (they are lost), so it has room again. */
export function dumpCargo(t: Truck): Action {
  if (!t.cargo.length) return no('The truck is empty.');
  const n = t.cargo.length;
  t.cargo = [];
  return done(`Dumped ${n} good${n > 1 ? 's' : ''}.`);
}

/** The longest a route's name can be. */
export const ROUTE_NAME_MAX = 24;

/** Renames a route (trimmed, at most ROUTE_NAME_MAX characters, not empty). */
export function renameRoute(s: GameState, r: Route, name: string): Action {
  const n = name.replace(/\s+/g, ' ').trim().slice(0, ROUTE_NAME_MAX);
  if (!n) return no('A route needs a name.');
  if (n === r.name) return no('');
  r.name = n;
  touchRoutes(s);
  return done(`Renamed the route to ${n}.`);
}

/** A copy of a route's stops under a new name, with no trucks yet. */
export function copyRoute(s: GameState, r: Route): Route {
  const base = `${r.name.slice(0, ROUTE_NAME_MAX - 7)} (copy)`;
  let name = base;
  for (let k = 2; s.routes.some((x) => x.name === name); k++) name = `${r.name.slice(0, ROUTE_NAME_MAX - 9)} (copy ${k})`;
  const c: Route = { id: s.nextId++, name: name.slice(0, ROUTE_NAME_MAX), stops: r.stops.map((st) => ({ ...st, drop: [...st.drop], pick: [...st.pick], turn: 0 })), moved: [] };
  s.routes.push(c);
  touchRoutes(s);
  return c;
}

/** A new route with no stops, named after the first free number. */
export function newRoute(s: GameState): Route {
  let k = 1;
  while (s.routes.some((r) => r.name === `Route ${k}`)) k++;
  const r: Route = { id: s.nextId++, name: `Route ${k}`, stops: [], moved: [] };
  s.routes.push(r);
  touchRoutes(s);
  return r;
}

/** Deletes a route: its trucks drive home and wait there. */
export function deleteRoute(s: GameState, r: Route): Action {
  const i = s.routes.indexOf(r);
  if (i < 0) return no('');
  s.routes.splice(i, 1);
  touchRoutes(s);
  for (const t of s.trucks) if (t.route === r.id) { t.route = null; t.stop = 0; if (t.phase === 'queue' || t.phase === 'dock') t.phase = 'stuck'; redirect(s, t); }
  return done(`Deleted ${r.name}.`);
}

/** What a new stop does: picks up everything the building makes and drops everything it takes; a silo only drops. */
function defaultStop(b: Building): Stop {
  if (BUILDINGS[b.type].stores) return { building: b.id, drop: [...ITEM_IDS], pick: [], wait: TRUCK.wait, turn: 0 };
  const pick = givesGoods(b);
  return { building: b.id, drop: takesGoods(b).filter((i) => !pick.includes(i)), pick, wait: TRUCK.wait, turn: 0 };
}

/** Adds a building as the route's last stop. */
export function addStop(s: GameState, r: Route, b: Building): Action {
  if (!isStop(b)) return no(`Trucks don't stop at the ${lc(b)}: it has no goods.`);
  if (r.stops.length >= TRUCK.maxStops) return no(`A route has at most ${TRUCK.maxStops} stops.`);
  const kept = r.stops.map((_, i) => i);
  r.stops.push(defaultStop(b));
  touchRoutes(s);
  routeChanged(s, r, kept);
  return done(`Added the ${lc(b)} as stop ${r.stops.length} of ${r.name}.${accessTiles(s, b).length ? '' : ' Trucks can\'t reach it yet: leave an open tile beside it.'}`);
}

export function removeStop(s: GameState, r: Route, i: number): Action {
  if (!r.stops[i]) return no('');
  const kept = r.stops.map((_, k) => (k === i ? null : k < i ? k : k - 1));
  r.stops.splice(i, 1);
  touchRoutes(s);
  routeChanged(s, r, kept);
  return done(`Took stop ${i + 1} out of ${r.name}.`);
}

/** Moves a stop one place earlier (-1) or later (+1) in the route. */
export function moveStop(s: GameState, r: Route, i: number, by: -1 | 1): Action {
  const j = i + by;
  if (!r.stops[i] || !r.stops[j]) return no('');
  [r.stops[i], r.stops[j]] = [r.stops[j], r.stops[i]];
  touchRoutes(s);
  routeChanged(s, r, r.stops.map((_, k) => (k === i ? j : k === j ? i : k)));
  return done('');
}

/** Whether a stop drops a good, picks it up, or neither (a good is never both). */
export function setStopGood(s: GameState, r: Route, i: number, item: ItemId, how: 'drop' | 'pick' | null): Action {
  const st = r.stops[i];
  if (!st) return no('');
  const now = st.drop.includes(item) ? 'drop' : st.pick.includes(item) ? 'pick' : null;
  if (now === how) return no('');
  st.drop = st.drop.filter((x) => x !== item);
  st.pick = st.pick.filter((x) => x !== item);
  if (how) st[how].push(item);
  touchRoutes(s);
  const name = ITEMS[item].name.toLowerCase();
  return done(how === 'drop' ? `Drops ${name} there.` : how === 'pick' ? `Picks up ${name} there.` : `Leaves ${name} alone there.`);
}

/** How long trucks wait at a stop for room or goods, 0 to TRUCK.maxWait seconds. */
export function setStopWait(s: GameState, r: Route, i: number, seconds: number): Action {
  const st = r.stops[i];
  const w = Math.max(0, Math.min(TRUCK.maxWait, Math.round(seconds)));
  if (!st || st.wait === w) return no('');
  st.wait = w;
  touchRoutes(s);
  return done('');
}
