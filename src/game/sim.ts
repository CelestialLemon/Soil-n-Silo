import {
  bays, BUILDINGS, CROPS, DAY_SECONDS, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEM_IDS, ITEMS, OUTPUT_BATCHES, POWER, recipeById,
  recipesFor, SAPLING_SECONDS, SILO, START_HOUR, TICK, TREE_HEALTH, TRUCK, type Ingredient, type ItemId, type Recipe,
} from './data.ts';
import { TERRAIN } from './map.ts';
import { networkOf, networks } from './power.ts';
import { accessTiles, distanceTo, isOpen, legLength, nearestOpen, pathTo } from './roads.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import {
  buildingAt, buildingById, centre, countTrees, layoutOf, reachTo, removeBuilding, routeById, STAT_BUCKET, STAT_BUCKETS,
  terrainAt, tileIndex, touchLayout, type Building, type GameState, type Route, type Stop, type Truck,
} from './state.ts';

// The simulation: one fixed step of TICK seconds at a time. Each step balances power, runs every building, drives the
// trucks along their routes (docking, moving goods, charging), then updates the stats and goals.

// ---- Time, sun and wind ----

/** The hour of day, 0–24. */
export const hourAt = (time: number) => (START_HOUR + (time / DAY_SECONDS) * 24) % 24;
export const dayAt = (time: number) => 1 + Math.floor((time / DAY_SECONDS * 24 + START_HOUR) / 24);

/** Solar strength 0–1 (times the scenario's sun) at a time. */
export function sunAt(sc: Scenario, time: number) {
  const h = hourAt(time), w = sc.weather;
  if (h <= w.sunrise || h >= w.sunset) return 0;
  return w.sun * Math.sin(Math.PI * (h - w.sunrise) / (w.sunset - w.sunrise));
}

/** Wind strength 0–1 at a time: a smooth seeded curve around the scenario's mean. */
export function windAt(sc: Scenario, time: number) {
  const w = sc.weather;
  const n = noise1(time / 45, sc.seed + 77) * 0.7 + noise1(time / 11, sc.seed + 78) * 0.3;
  return Math.max(0.05, Math.min(1, w.wind + (n - 0.5) * 2 * w.gust));
}

// ---- Derived lookups, rebuilt when the layout changes ----

interface Derived {
  layout: number;
  /** Sprinklers watering each field. */
  sprinklers: Map<number, Building[]>;
  /** Fields with a hive near enough to pollinate them. */
  pollinated: Set<number>;
  /** Fields near each hive. */
  flowers: Map<number, Building[]>;
  /** Wind turbines' shelter factor. */
  exposure: Map<number, number>;
  /** Sprinklers near water. */
  nearWater: Set<number>;
  /** Tiles under a field (the rest of the ground rests). */
  fielded: Set<number>;
}
const derivedCache = new WeakMap<GameState, Derived>();

function derived(s: GameState): Derived {
  const layout = layoutOf(s);
  let d = derivedCache.get(s);
  if (d && d.layout === layout) return d;
  d = { layout, sprinklers: new Map(), pollinated: new Set(), flowers: new Map(), exposure: new Map(), nearWater: new Set(), fielded: new Set() };
  const fields = s.buildings.filter((b) => b.type === 'field');
  const hives = s.buildings.filter((b) => b.type === 'hive');
  const sprinklers = s.buildings.filter((b) => b.type === 'sprinkler');
  for (const f of fields) {
    for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) d.fielded.add(tileIndex(s, x, y));
    const c = centre(f);
    d.sprinklers.set(f.id, sprinklers.filter((sp) => Math.max(Math.abs(sp.x + 0.5 - c.x), Math.abs(sp.y + 0.5 - c.y)) <= POWER.sprinklerReach + 0.5));
    if (hives.some((h) => reachTo(f, h.x, h.y) <= HIVE.reach)) d.pollinated.add(f.id);
  }
  for (const h of hives) d.flowers.set(h.id, fields.filter((f) => reachTo(f, h.x, h.y) <= HIVE.reach));
  for (const t of s.buildings) {
    if (t.type !== 'turbine') continue;
    let n = 0;
    const tall = new Set<Building>();
    for (let y = t.y - 2; y <= t.y + 2; y++) for (let x = t.x - 2; x <= t.x + 2; x++) {
      if ((x === t.x && y === t.y) || x < 0 || y < 0 || x >= s.map.width || y >= s.map.height) continue;
      const o = buildingAt(s, x, y);
      if (terrainAt(s, x, y) === TERRAIN.tree) n++;
      else if (o && o !== t && BUILDINGS[o.type].tall) tall.add(o);
    }
    n += tall.size;
    d.exposure.set(t.id, Math.max(POWER.shelterFloor, 1 - POWER.shelter * n));
  }
  for (const sp of sprinklers) {
    const r = POWER.waterNear;
    search: for (let y = sp.y - r; y <= sp.y + r; y++) for (let x = sp.x - r; x <= sp.x + r; x++) {
      if (x < 0 || y < 0 || x >= s.map.width || y >= s.map.height || Math.hypot(x - sp.x, y - sp.y) > r) continue;
      if (terrainAt(s, x, y) === TERRAIN.water) { d.nearWater.add(sp.id); break search; }
    }
  }
  derivedCache.set(s, d);
  return d;
}

/** Whether a building trades goods with trucks: it grows, makes or uses goods. */
export const handlesGoods = (b: Building) => b.type === 'field' || b.type === 'hive' || !!b.recipe;

export const sprinklersOf = (s: GameState, b: Building) => derived(s).sprinklers.get(b.id) ?? [];
export const isPollinated = (s: GameState, b: Building) => derived(s).pollinated.has(b.id);
export const exposureOf = (s: GameState, b: Building) => derived(s).exposure.get(b.id) ?? 1;
export const nearWater = (s: GameState, b: Building) => derived(s).nearWater.has(b.id);

// ---- Soil ----

export function fieldFertility(s: GameState, f: Building) {
  let sum = 0;
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) sum += s.map.fertility[tileIndex(s, x, y)];
  return sum / 9;
}

function changeSoil(s: GameState, f: Building, by: number) {
  for (let y = f.y; y < f.y + 3; y++) for (let x = f.x; x < f.x + 3; x++) {
    const i = tileIndex(s, x, y);
    s.map.fertility[i] = Math.max(0, Math.min(100, s.map.fertility[i] + by));
  }
}

/** Soil health: the average fertility of every field tile (50 with no fields), nudged by trees planted or cleared. */
export function soilHealth(s: GameState) {
  const fields = s.buildings.filter((b) => b.type === 'field');
  const base = fields.length ? fields.reduce((n, f) => n + fieldFertility(s, f), 0) / fields.length : 50;
  const trees = Math.max(-TREE_HEALTH.cap, Math.min(TREE_HEALTH.cap, (countTrees(s) - s.initialTrees) * TREE_HEALTH.perTree));
  return Math.max(0, Math.min(100, base + trees));
}

/** Growth per second of a field as a multiple of its crop's normal pace, and the parts it's made of. */
export function fieldPace(s: GameState, f: Building) {
  const wet = sprinklersOf(s, f).reduce((m, sp) => Math.max(m, shareOf(s, sp)), 0);
  const water = FIELD.dry + (1 - FIELD.dry) * wet;
  const soil = FIELD.poorSoil + (FIELD.richSoil - FIELD.poorSoil) * fieldFertility(s, f) / 100;
  return { pace: water * soil, water: wet, soil };
}

// ---- Machines ----

const members = (ing: Ingredient): readonly ItemId[] => ('item' in ing ? [ing.item] : GROUPS[ing.group]);
const held = (b: Building, ing: Ingredient) => members(ing).reduce((n, it) => n + (b.inputs![it] ?? 0), 0);
const ingName = (ing: Ingredient) => ('item' in ing ? ITEMS[ing.item].name.toLowerCase() : GROUP_NAMES[ing.group]);

export const recipeOf = (b: Building): Recipe | null => (b.recipe ? recipeById(b.recipe) : null);

function missing(b: Building, r: Recipe) {
  return r.inputs.find((ing) => held(b, ing) < ing.n) ?? null;
}

function outputsFit(b: Building, r: Recipe) {
  return r.outputs.find((o) => (b.outputs![o.item] ?? 0) + o.n > o.n * OUTPUT_BATCHES) ?? null;
}

function consume(b: Building, r: Recipe) {
  for (const ing of r.inputs) {
    let need = ing.n;
    // Take from whichever member there's most of.
    while (need > 0) {
      const it = [...members(ing)].sort((a, c) => (b.inputs![c] ?? 0) - (b.inputs![a] ?? 0))[0];
      b.inputs![it] = (b.inputs![it] ?? 0) - 1;
      if (!b.inputs![it]) delete b.inputs![it];
      need--;
    }
  }
}

/** Whether a building takes `item` from a truck right now. Takes it if so: the depot buys it, a silo stores it. */
function accept(s: GameState, b: Building, item: ItemId): boolean {
  if (b.type === 'depot') { deliver(s, item); return true; }
  if (b.type === 'silo') {
    if ((b.store![item] ?? 0) >= SILO.perGood) return false;
    b.store![item] = (b.store![item] ?? 0) + 1; return true;
  }
  if (b.type === 'field') {
    if (item !== 'compost' || b.compost! >= FIELD.compostStore) return false;
    b.compost!++; return true;
  }
  const r = recipeOf(b);
  if (!r) return false;
  const ing = r.inputs.find((i) => members(i).includes(item));
  if (!ing || held(b, ing) >= ing.n * INPUT_BATCHES) return false;
  b.inputs![item] = (b.inputs![item] ?? 0) + 1;
  return true;
}

/** Delivers a good to the depot: it counts towards the goals and pays its price. */
export function deliver(s: GameState, item: ItemId) {
  s.delivered[item] = (s.delivered[item] ?? 0) + 1;
  s.credits += ITEMS[item].price;
  s.earned += ITEMS[item].price;
  (s.stats.delivered[item] ??= []).push(s.time);
}

function made(s: GameState, item: ItemId, n: number) {
  s.made[item] = (s.made[item] ?? 0) + n;
  const bucket = s.stats.made[0];
  bucket[item] = (bucket[item] ?? 0) + n;
}

// ---- Power ----

const shares = new WeakMap<GameState, Map<number, number>>();
/** The share of the power it wanted that a building got last step (1 for buildings that need none). */
export function shareOf(s: GameState, b: Building) {
  if (!BUILDINGS[b.type].power) return 1;
  return shares.get(s)?.get(b.id) ?? 0;
}

/** Watts a building wants this step. */
export function wants(s: GameState, b: Building): number {
  const def = BUILDINGS[b.type];
  if (!def.power) return 0;
  if (b.type === 'sprinkler') return nearWater(s, b) ? POWER.sprinklerNearWater : POWER.sprinklerFar;
  if (b.type === 'garage') return charging.get(s)?.get(b.id) ?? 0;
  const r = recipeOf(b);
  if (!r) return 0;
  if (b.progress !== null && b.progress !== undefined) return def.power;
  return !missing(b, r) && !outputsFit(b, r) ? def.power : 0;
}

/** Watts a generator makes this step. */
export function makes(s: GameState, b: Building, sun: number, wind: number): number {
  switch (b.type) {
    case 'solar': return POWER.solar * sun;
    case 'turbine': return POWER.turbine * wind * exposureOf(s, b);
    case 'digester': return b.progress !== null && b.progress !== undefined ? POWER.digester : 0;
    default: return 0;
  }
}

function balancePower(s: GameState, sun: number, wind: number, dt: number) {
  const map = new Map<number, number>();
  for (const net of networks(s).list) {
    let made = 0, wanted = 0, stored = 0, capacity = 0;
    const batteries: Building[] = [];
    for (const b of net.members) {
      made += makes(s, b, sun, wind);
      wanted += wants(s, b);
      if (b.type === 'battery') { batteries.push(b); stored += b.charge!; capacity += POWER.battery.capacity; }
    }
    let share = 1;
    if (made >= wanted) {
      let spare = (made - wanted) * dt;
      for (const bat of batteries) {
        const add = Math.min(spare, POWER.battery.rate * dt, POWER.battery.capacity - bat.charge!);
        bat.charge! += add; spare -= add;
      }
    } else {
      let short = (wanted - made) * dt, given = 0;
      for (const bat of batteries) {
        const take = Math.min(short, POWER.battery.rate * dt, bat.charge!);
        bat.charge! -= take; short -= take; given += take;
      }
      share = wanted > 0 ? Math.min(1, (made + given / dt) / wanted) : 1;
      if (share > 0.999) share = 1;
    }
    net.made = made; net.wanted = wanted; net.share = share;
    net.stored = batteries.reduce((n, b) => n + b.charge!, 0); net.capacity = capacity;
    for (const b of net.members) map.set(b.id, share);
  }
  shares.set(s, map);
}

// ---- Goods waiting in buildings ----

/** How many of `item` a building has waiting for a truck: a harvest, products, or a silo's stock. */
function waiting(b: Building, item: ItemId) {
  if (b.type === 'field') return (b.harvest ?? b.crop) === item ? b.stored! : 0;
  if (b.type === 'hive') return item === 'honey' ? b.stored! : 0;
  if (b.type === 'silo') return b.store![item] ?? 0;
  return b.outputs?.[item] ?? 0;
}
function take(b: Building, item: ItemId) {
  if (b.type === 'field' || b.type === 'hive') { b.stored!--; if (!b.stored) b.harvest = b.crop; return; }
  const from = b.type === 'silo' ? b.store! : b.outputs!;
  from[item]! -= 1;
  if (!from[item]) delete from[item];
}

/** The goods a building can take now: its recipe's inputs (any member of a group), or compost for a field. */
export function inputGoods(b: Building): ItemId[] {
  if (b.type === 'field') return ['compost'];
  const r = recipeOf(b);
  return r ? r.inputs.flatMap((i) => [...members(i)]) : [];
}

// ---- Buildings ----

function runMachine(s: GameState, b: Building, dt: number) {
  const r = recipeOf(b)!;
  const def = BUILDINGS[b.type];
  const share = shareOf(s, b);
  if (b.progress === null || b.progress === undefined) {
    const lack = missing(b, r), full = outputsFit(b, r);
    if (lack) { b.status = 'input'; b.need = ingName(lack); return; }
    if (full) { b.status = 'blocked'; b.need = ITEMS[full.item].name.toLowerCase(); return; }
    if (def.power && share <= 0) { b.status = 'power'; b.need = undefined; return; }
    consume(b, r);
    b.progress = 0;
  }
  // The digester is a generator: it burns at its own pace.
  const pace = def.power ? share : 1;
  b.progress! += dt * pace;
  b.status = pace <= 0 ? 'power' : pace < 1 ? 'lowpower' : 'ok';
  b.need = undefined;
  if (b.progress! >= r.time) {
    for (const o of r.outputs) { b.outputs![o.item] = (b.outputs![o.item] ?? 0) + o.n; made(s, o.item, o.n); }
    b.progress = null;
  }
}

function runField(s: GameState, f: Building, dt: number) {
  const crop = CROPS[f.crop!];
  if (f.compost! > 0 && fieldFertility(s, f) < FIELD.compostBelow) { f.compost!--; changeSoil(s, f, FIELD.compostGain); }
  const bonus = crop.flowers && isPollinated(s, f) ? 1 : 0;
  // A harvest of the old crop waits to go before the new one can join it.
  const old = f.stored! > 0 && (f.harvest ?? f.crop) !== f.crop;
  if (old || f.stored! + crop.yield + bonus > FIELD.store) { f.status = 'blocked'; f.need = CROPS[f.harvest ?? f.crop!].name.toLowerCase(); return; }
  const p = fieldPace(s, f);
  f.growth! += dt * p.pace / crop.grow;
  f.status = p.water < 1 ? 'dry' : 'ok';
  f.need = undefined;
  if (f.growth! >= 1) {
    f.growth = 0;
    f.stored! += crop.yield + bonus;
    f.harvest = f.crop;
    made(s, f.crop!, crop.yield + bonus);
    changeSoil(s, f, crop.soil);
  }
}

/** Flowering fields a hive gathers from (up to HIVE.maxFlowers count). */
export function flowersNear(s: GameState, h: Building) {
  return Math.min(HIVE.maxFlowers, (derived(s).flowers.get(h.id) ?? []).filter((f) => CROPS[f.crop!].flowers).length);
}

function runHive(s: GameState, h: Building, dt: number) {
  const flowers = flowersNear(s, h);
  if (!flowers) { h.status = 'flowers'; return; }
  if (h.stored! >= HIVE.store) { h.status = 'blocked'; h.need = 'honey'; return; }
  h.growth! += dt * flowers / HIVE.honeySeconds;
  h.status = 'ok';
  if (h.growth! >= 1) { h.growth = 0; h.stored!++; made(s, 'honey', 1); }
}

// ---- Trucks ----

/** Whether trucks can stop at a building: it grows, makes, uses or stores goods, or is the depot. */
export const isStop = (b: Building) => b.type === 'silo' || b.type === 'depot' || handlesGoods(b);

/** Every good a building could ever take from a truck (for a stop's defaults and choices). */
export function takesGoods(b: Building): ItemId[] {
  if (b.type === 'silo' || b.type === 'depot') return [...ITEM_IDS];
  if (b.type === 'field') return ['compost'];
  return [...new Set(recipesFor(b.type).flatMap((r) => r.inputs.flatMap((i) => [...members(i)])))];
}

/** The goods a building takes or gives with the recipe it has now (any recipe's, for one without). */
const takesNow = (b: Building) => (b.recipe ? inputGoods(b) : takesGoods(b));
const givesNow = (b: Building) => (b.recipe ? [...new Set([...recipeOf(b)!.outputs.map((o) => o.item), ...(Object.keys(b.outputs!) as ItemId[])])] : givesGoods(b));

/** Every good a building could ever give a truck: a field's crop (and a waiting harvest of another), products, stock. */
export function givesGoods(b: Building): ItemId[] {
  if (b.type === 'silo') return [...ITEM_IDS];
  if (b.type === 'field') return [...new Set([b.crop!, b.harvest ?? b.crop!])];
  if (b.type === 'hive') return ['honey'];
  return [...new Set(recipesFor(b.type).flatMap((r) => r.outputs.map((o) => o.item)))];
}

const tileOf = (s: GameState, t: Truck) => tileIndex(s, Math.floor(t.x), Math.floor(t.y));
const garageOf = (s: GameState, t: Truck) => buildingById(s, t.garage);
export const routeOf = (s: GameState, t: Truck) => routeById(s, t.route);
/** The routes that stop at a building. */
export const routesAt = (s: GameState, b: Building) => s.routes.filter((r) => r.stops.some((st) => st.building === b.id));
/** The trucks running a route. */
export const trucksOn = (s: GameState, r: Route) => s.trucks.filter((t) => t.route === r.id);

/** Sends a truck along the shortest way to a building; false if there is none. */
function driveTo(s: GameState, t: Truck, b: Building): boolean {
  const p = pathTo(s, b, tileOf(s, t));
  if (!p) return false;
  t.path = p; t.target = b.id; t.phase = 'drive'; t.idle = 0;
  return true;
}

/** Sends a truck home to its garage (to park, or to charge); if it can't get there it waits where it is. */
function goHome(s: GameState, t: Truck) {
  const g = garageOf(s, t)!;
  t.path = [];
  if (distanceTo(s, g, tileOf(s, t)) === 0) { t.phase = routeOf(s, t)?.stops.length ? 'charge' : 'parked'; t.target = g.id; t.idle = 0; return; }
  if (!driveTo(s, t, g)) { t.phase = 'stuck'; t.target = null; }
}

/**
 * Sets a truck off for stop `from` of its route, or the next one after it that it can reach. If its battery wouldn't get it
 * there and then home, it goes home to charge first (unless it has just charged, or can't get home).
 */
function setOff(s: GameState, t: Truck, from: number) {
  const r = routeOf(s, t), g = garageOf(s, t)!;
  if (!r || !r.stops.length) { goHome(s, t); return; }
  const here = tileOf(s, t), n = r.stops.length;
  let i = -1;
  for (let k = 0; k < n; k++) {
    const b = buildingById(s, r.stops[(from + k) % n].building);
    if (b && distanceTo(s, b, here) < Infinity) { i = (from + k) % n; break; }
  }
  t.stop = ((from % n) + n) % n;
  if (i < 0) { t.phase = 'stuck'; t.path = []; t.target = null; return; }
  t.stop = i;
  const b = buildingById(s, r.stops[i].building)!;
  // The way there, and home from the tile it will stop at.
  const path = pathTo(s, b, here)!, leg = distanceTo(s, b, here), back = distanceTo(s, g, path.length ? path[path.length - 1] : here);
  if (!t.charged && back < Infinity && distanceTo(s, g, here) < Infinity
    && t.energy < (leg + back) * TRUCK.joulesPerTile) { goHome(s, t); return; }
  t.charged = false;
  t.path = path; t.target = b.id; t.phase = 'drive'; t.idle = 0;
}

/** Whether a truck is done at its stop: it carries none of the stop's drop goods, and is full or picks nothing up there. */
const doneAt = (t: Truck, st: Stop) => !t.cargo.some((i) => st.drop.includes(i)) && (t.cargo.length >= TRUCK.cargo || !st.pick.length);

/** Moves one good at a stop: drops one the building takes, else picks up the next of the stop's goods there is. */
function moveOne(s: GameState, t: Truck, st: Stop, b: Building, r: Route): boolean {
  for (let k = 0; k < t.cargo.length; k++) {
    const it = t.cargo[k];
    if (st.drop.includes(it) && accept(s, b, it)) { t.cargo.splice(k, 1); r.moved.push(s.time); return true; }
  }
  if (t.cargo.length >= TRUCK.cargo) return false;
  const n = st.pick.length;
  for (let k = 0; k < n; k++) {
    const it = st.pick[(t.turn + k) % n];
    if (waiting(b, it) > 0) { take(b, it); t.cargo.push(it); t.turn = (t.turn + k + 1) % n; return true; }
  }
  return false;
}

/** A docked truck's step at its stop: moves goods, and leaves when done or when it has waited long enough. */
function atStop(s: GameState, t: Truck, dt: number, queued: boolean) {
  const r = routeOf(s, t), st = r?.stops[t.stop], b = t.target !== null ? buildingById(s, t.target) : null;
  if (!r || !st || !b || st.building !== b.id) { redirect(s, t); return; }
  t.budget += TRUCK.moveRate * dt;
  let stuck = false;
  while (t.budget >= 1) {
    if (moveOne(s, t, st, b, r)) { t.budget -= 1; t.idle = 0; } else { stuck = true; t.budget = 1; break; }
  }
  if (doneAt(t, st)) { setOff(s, t, t.stop + 1); return; }
  if (stuck) {
    t.idle += dt;
    if (t.idle >= st.wait - 1e-9 || queued) setOff(s, t, t.stop + 1);
  }
}

/** Drives a truck along its path; at the end it parks at its garage or joins the queue at its stop. */
function drive(s: GameState, t: Truck, dt: number) {
  const w = s.map.width;
  let left = (t.energy > 0 ? TRUCK.speed : TRUCK.crawl) * dt;
  while (left > 1e-9 && t.path.length) {
    const i = t.path[0], tx = i % w + 0.5, ty = Math.floor(i / w) + 0.5;
    const dx = tx - t.x, dy = ty - t.y, d = Math.hypot(dx, dy);
    if (d > 1e-6) t.heading = Math.atan2(dx, dy);
    const step = Math.min(d, left);
    if (d > 1e-9) { t.x += dx / d * step; t.y += dy / d * step; }
    left -= step;
    t.energy = Math.max(0, t.energy - step * TRUCK.joulesPerTile);
    if (step >= d - 1e-9) { t.x = tx; t.y = ty; t.path.shift(); }
  }
  if (t.path.length) return;
  const b = t.target !== null ? buildingById(s, t.target) : null;
  if (!b) { redirect(s, t); return; }
  if (b.id === t.garage) { t.phase = routeOf(s, t)?.stops.length ? 'charge' : 'parked'; t.idle = 0; return; }
  t.phase = 'queue'; t.arrived = s.time; t.idle = 0;
}

/**
 * Points a truck at what it should do now: after its route changed, its target went, or it was given another route. A
 * truck at its garage starts from there on the next step; one elsewhere heads for its current stop (or home, with no route).
 */
export function redirect(s: GameState, t: Truck) {
  const r = routeOf(s, t);
  if (t.phase === 'parked' || t.phase === 'charge') { if (!r?.stops.length) t.phase = 'parked'; return; }
  if (!r?.stops.length) { goHome(s, t); return; }
  setOff(s, t, t.stop);
}

/**
 * After a route's stops changed (`kept[i]` is where old stop i is now, or null if it went): each of its trucks keeps its
 * stop, at its new place; a truck whose stop went goes on to the one that came after it (stop 1 after the last).
 */
export function routeChanged(s: GameState, r: Route, kept: (number | null)[]) {
  const n = r.stops.length;
  for (const t of trucksOn(s, r)) {
    if (!n) { t.stop = 0; redirect(s, t); continue; }
    const now = kept[t.stop];
    if (now !== null && now !== undefined) { t.stop = now; if (t.phase === 'stuck') redirect(s, t); continue; }
    // The stops before it that are left: the next one is now at that place.
    t.stop = kept.slice(0, t.stop).filter((k) => k !== null).length % n;
    const away = t.phase === 'drive' || t.phase === 'queue' || t.phase === 'dock';
    if ((away && t.target !== t.garage) || t.phase === 'stuck') { if (t.phase !== 'drive') t.phase = 'stuck'; setOff(s, t, t.stop); }
  }
}

/** Charges a truck at its garage from the garage's network; true if it got any charge this step. */
function charge(s: GameState, t: Truck, dt: number) {
  const g = garageOf(s, t)!;
  const give = Math.min(TRUCK.chargeRate * dt, TRUCK.battery - t.energy) * (networkOf(s, g) ? shareOf(s, g) : 0);
  t.energy = Math.min(TRUCK.battery, t.energy + give);
  return give > 1e-9;
}

/** The layout each game's trucks last found their ways on. */
const truckLayout = new WeakMap<GameState, number>();

/** Drives, docks and charges every truck, then lets queued trucks dock where a building has room. */
function runTrucks(s: GameState, dt: number) {
  // The layout changed: a truck on a tile that was built on moves to the nearest open one, and driving trucks find their
  // way again (a building may stand across it, or a new way be shorter).
  const layout = layoutOf(s);
  if (truckLayout.get(s) !== layout) {
    truckLayout.set(s, layout);
    for (const t of s.trucks) {
      if (!isOpen(s, Math.floor(t.x), Math.floor(t.y))) {
        const i = nearestOpen(s, Math.floor(t.x), Math.floor(t.y));
        if (i !== null) { t.x = i % s.map.width + 0.5; t.y = Math.floor(i / s.map.width) + 0.5; }
      }
      const b = t.target !== null ? buildingById(s, t.target) : null, here = tileOf(s, t);
      // At a building or its garage, but no longer beside it (moved off a tile built on, or walled off): it drives back,
      // or on to its next stop if it can't.
      if (t.phase === 'queue' || t.phase === 'dock') { if (!b || distanceTo(s, b, here) !== 0) { t.phase = 'stuck'; redirect(s, t); } continue; }
      if (t.phase === 'parked' || t.phase === 'charge') { if (distanceTo(s, garageOf(s, t)!, here) !== 0) goHome(s, t); continue; }
      if (t.phase !== 'drive') continue;
      if (b && driveTo(s, t, b)) continue;
      if (b?.id === t.garage) { t.phase = 'stuck'; t.path = []; t.target = null; } else redirect(s, t);
    }
  }
  const queued = new Set<number>();
  for (const t of s.trucks) if (t.phase === 'queue' && t.target !== null) queued.add(t.target);
  for (const t of s.trucks) {
    switch (t.phase) {
      case 'parked': {
        charge(s, t, dt);
        if (routeOf(s, t)?.stops.length) { t.charged = true; setOff(s, t, t.stop); }
        break;
      }
      case 'charge': {
        if (charge(s, t, dt)) t.idle = 0; else t.idle += dt;
        if (!routeOf(s, t)?.stops.length) { t.phase = 'parked'; break; }
        if (t.energy >= TRUCK.battery - 1e-6 || t.idle >= TRUCK.giveUp) { t.charged = true; setOff(s, t, t.stop); }
        break;
      }
      case 'drive': drive(s, t, dt); break;
      case 'dock': atStop(s, t, dt, queued.has(t.target!)); break;
      case 'stuck': redirect(s, t); break;
      case 'queue': break;
    }
  }
  // Queued trucks dock in the order they came, while the building has a free bay.
  const docked = new Map<number, number>(), waitingAt = new Map<number, Truck[]>();
  for (const t of s.trucks) {
    if (t.target === null) continue;
    if (t.phase === 'dock') docked.set(t.target, (docked.get(t.target) ?? 0) + 1);
    if (t.phase === 'queue') { const q = waitingAt.get(t.target); if (q) q.push(t); else waitingAt.set(t.target, [t]); }
  }
  for (const [id, q] of waitingAt) {
    const b = buildingById(s, id);
    if (!b) { for (const t of q) redirect(s, t); continue; }
    q.sort((a, c) => a.arrived - c.arrived || a.id - c.id);
    for (let free = bays(b.type) - (docked.get(id) ?? 0), k = 0; free > 0 && k < q.length; free--, k++) {
      const t = q[k];
      t.phase = 'dock'; t.budget = 1; t.idle = 0; t.turn = 0;
    }
  }
}

/**
 * Watts each garage wants for the trucks charging there, worked out before power is balanced: each truck at most the charge
 * rate, and no more than it needs to fill up this step.
 */
const charging = new WeakMap<GameState, Map<number, number>>();
function countCharging(s: GameState) {
  const m = new Map<number, number>();
  for (const t of s.trucks) {
    if (t.phase !== 'parked' && t.phase !== 'charge') continue;
    const w = Math.min(TRUCK.chargeRate, Math.max(0, TRUCK.battery - t.energy) / TICK);
    if (w > 0) m.set(t.garage, (m.get(t.garage) ?? 0) + w);
  }
  charging.set(s, m);
}

/** A garage's status: charging its trucks, short of power for them, or idle. */
function runGarages(s: GameState) {
  const want = charging.get(s);
  for (const g of s.buildings) {
    if (g.type !== 'garage') continue;
    const w = want?.get(g.id) ?? 0, share = shareOf(s, g);
    g.need = undefined;
    g.status = !networkOf(s, g) ? 'power' : w > 0 && share <= 0 ? 'power' : w > 0 && share < 1 ? 'lowpower' : w > 0 ? 'ok' : 'idle';
  }
}

/** The good a building can't get rid of, if its outputs are full. */
function blockedGood(b: Building): ItemId | null {
  if (b.type === 'field') return b.stored ? b.harvest ?? b.crop! : null;
  if (b.type === 'hive') return 'honey';
  const r = recipeOf(b);
  return r ? outputsFit(b, r)?.item ?? null : null;
}

/** Whether some route with trucks picks `item` up at a building (or drops it there). */
function served(s: GameState, b: Building, item: ItemId, how: 'pick' | 'drop') {
  return s.routes.some((r) => r.stops.some((st) => st.building === b.id && st[how].includes(item)) && s.trucks.some((t) => t.route === r.id));
}

/** Goods a truck carries that none of its route's stops takes, and what it can't do, in a few words (for the inspector). */
export function truckProblems(s: GameState, t: Truck): string[] {
  const out: string[] = [], r = routeOf(s, t), g = garageOf(s, t);
  if (t.phase === 'stuck') out.push(r?.stops.length ? 'It can reach none of its stops.' : 'It can\'t reach its garage.');
  else if (g && distanceTo(s, g, tileOf(s, t)) === Infinity) out.push('It can\'t reach its garage to charge.');
  const dead = [...new Set(t.cargo)].filter((i) => !(r?.stops ?? []).some((st) => {
    const b = buildingById(s, st.building);
    return b && st.drop.includes(i) && takesNow(b).includes(i);
  }));
  if (dead.length) out.push(`It carries ${dead.map((i) => ITEMS[i].name.toLowerCase()).join(', ')}, which none of its stops takes.`);
  return out;
}

/** What's wrong with a route's stops, by stop: it can't be reached, or it has nothing to do. */
export function stopProblems(s: GameState, r: Route): (string | null)[] {
  return r.stops.map((st, i) => {
    const b = buildingById(s, st.building);
    if (!b) return 'Gone.';
    if (!accessTiles(s, b).length) return 'No open tile beside it: trucks can\'t reach it.';
    const prev = buildingById(s, r.stops[(i + r.stops.length - 1) % r.stops.length].building);
    if (prev && prev !== b && legLength(s, prev, b) === Infinity) return 'Trucks can\'t drive here from the stop before.';
    const homes = new Set(trucksOn(s, r).map((t) => buildingById(s, t.garage)));
    if ([...homes].some((g) => g && legLength(s, g, b) === Infinity)) return 'Trucks can\'t drive here from their garage.';
    const takes = takesNow(b), gives = givesNow(b);
    if (!st.drop.some((it) => takes.includes(it)) && !st.pick.some((it) => gives.includes(it))) return 'Nothing to do: it takes none of the goods dropped and gives none of those picked up.';
    return null;
  });
}

const lcItem = (i: ItemId) => ITEMS[i].name.toLowerCase();
/** A truck's cargo in a few words: "6 wheat", "3 flour and 3 bran". */
export function cargoText(cargo: ItemId[]) {
  const n = new Map<ItemId, number>();
  for (const i of cargo) n.set(i, (n.get(i) ?? 0) + 1);
  const parts = [...n].map(([i, k]) => `${k} ${lcItem(i)}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0] ?? 'nothing';
}

/** What a truck is doing, in a few words, for the inspector. */
export function describeTruck(s: GameState, t: Truck): string {
  const b = t.target !== null ? buildingById(s, t.target) : null, name = b ? BUILDINGS[b.type].name.toLowerCase() : '';
  const full = Math.round(t.energy / TRUCK.battery * 100);
  switch (t.phase) {
    case 'parked': return t.energy < TRUCK.battery - 1e-6 ? `Parked at its garage, charging (${full}%)` : 'Parked at its garage';
    case 'charge': return t.idle > 0.5 ? 'At its garage, waiting for power to charge' : `Charging at its garage (${full}%)`;
    case 'stuck': return truckProblems(s, t)[0] ?? 'Waiting';
    case 'drive':
      if (b?.id === t.garage) return routeOf(s, t)?.stops.length ? 'Driving home to charge' : 'Driving home';
      return t.cargo.length ? `Taking ${cargoText(t.cargo)} to the ${name}` : `Driving to the ${name}`;
    case 'queue': {
      const ahead = s.trucks.filter((o) => o !== t && o.target === t.target && (o.phase === 'dock' || (o.phase === 'queue' && (o.arrived < t.arrived || (o.arrived === t.arrived && o.id < t.id))))).length;
      return `Waiting for its turn at the ${name} (${ahead} ahead)`;
    }
    case 'dock': {
      const st = routeOf(s, t)?.stops[t.stop];
      if (t.idle > 0.2 && st) {
        const drop = t.cargo.filter((i) => st.drop.includes(i));
        return drop.length ? `Waiting at the ${name} for room for ${lcItem(drop[0])}` : `Waiting at the ${name} for ${st.pick.map(lcItem).join(' or ')}`;
      }
      return `Loading and unloading at the ${name}`;
    }
  }
}

// ---- The step ----

/** Advances the game by `seconds` of play, in fixed steps; at most `maxSteps` of them (the rest is dropped, so a slow frame
 * can't snowball). */
export function advance(s: GameState, seconds: number, maxSteps = Infinity) {
  s.carry += seconds;
  let n = 0;
  while (s.carry >= TICK - 1e-9 && n < maxSteps) { tick(s); s.carry -= TICK; n++; }
  if (n >= maxSteps) s.carry = 0;
}

export function tick(s: GameState) {
  const dt = TICK;
  s.time += dt;
  const sun = sunAt(s.scenario, s.time), wind = windAt(s.scenario, s.time);
  countCharging(s);
  balancePower(s, sun, wind, dt);
  const grown: Building[] = [];
  for (const b of s.buildings) {
    switch (b.type) {
      case 'depot': break;
      case 'silo': b.status = 'idle'; break;
      case 'field': runField(s, b, dt); break;
      case 'hive': runHive(s, b, dt); break;
      case 'sprinkler': case 'battery': case 'pylon': case 'solar': case 'turbine': {
        const net = b.type === 'pylon' ? null : networkOf(s, b);
        if (b.type !== 'pylon' && !net) { b.status = 'nolink'; break; }
        if (b.type === 'sprinkler') { const sh = shareOf(s, b); b.status = sh <= 0 ? 'power' : sh < 1 ? 'lowpower' : 'ok'; }
        else if (b.type === 'solar') b.status = sun > 0 ? 'ok' : 'idle';
        else b.status = 'ok';
        break;
      }
      case 'sapling':
        b.age! += dt;
        b.status = 'ok';
        if (b.age! >= SAPLING_SECONDS) grown.push(b);
        break;
      default:
        if (b.recipe) {
          runMachine(s, b, dt);
          if (b.type === 'digester' && !networkOf(s, b) && b.status === 'ok') b.status = 'nolink';
        }
    }
  }
  for (const b of grown) {
    removeBuilding(s, b);
    s.map.terrain[tileIndex(s, b.x, b.y)] = TERRAIN.tree;
  }
  if (grown.length) touchLayout(s);
  runTrucks(s, dt);
  runGarages(s);
  // A building trucks can't reach, or whose outputs are full with no route picking them up, says so (unless it lacks power
  // or water, which say more).
  for (const b of s.buildings) {
    if (!['input', 'blocked', 'ok', 'idle'].includes(b.status) || b.type === 'depot') continue;
    if ((isStop(b) || b.type === 'garage') && !accessTiles(s, b).length) { b.status = 'noroad'; continue; }
    const g = b.status === 'blocked' ? blockedGood(b) : null;
    if (g && !served(s, b, g, 'pick')) { b.status = 'noroute'; b.need = ITEMS[g].name.toLowerCase(); }
  }
  // Once a second, ground without a field recovers a little.
  if (Math.floor(s.time + 1e-6) !== Math.floor(s.time - dt + 1e-6)) rest(s);
  updateStats(s);
  updateGoals(s);
}

function rest(s: GameState) {
  const fielded = derived(s).fielded, f = s.map.fertility, base = s.soilBase;
  for (let i = 0; i < f.length; i++) if (f[i] < base[i] && !fielded.has(i)) f[i] = Math.min(base[i], f[i] + FIELD.rest);
}

function updateStats(s: GameState) {
  const st = s.stats;
  pruneDeliveries(s);
  if (s.time - st.since >= STAT_BUCKET) {
    st.since += STAT_BUCKET;
    st.made.unshift({});
    if (st.made.length > STAT_BUCKETS) st.made.length = STAT_BUCKETS;
  }
}

/** Per-minute rate of a good over the last minute, from the stat buckets. */
export function ratePerMin(s: GameState, item: ItemId, which: 'made' | 'delivered') {
  const minute = STAT_BUCKET * (STAT_BUCKETS - 1);
  if (which === 'delivered') {
    // Exact: every delivery in the last minute.
    const times = s.stats.delivered[item] ?? [], from = s.time - minute;
    let n = 0;
    for (const t of times) if (t > from) n++;
    const span = Math.min(s.time, minute);
    return span > 0 ? n / span * 60 : 0;
  }
  const buckets = s.stats.made, into = s.time - s.stats.since;
  // Goods made, for the stats: the newest buckets whole, the oldest only for the part of it still inside the last minute.
  let total = 0;
  buckets.forEach((b, i) => {
    const n = b[item] ?? 0;
    total += i === STAT_BUCKETS - 1 ? n * Math.max(0, 1 - into / STAT_BUCKET) : n;
  });
  const span = Math.min(s.time, minute);
  return span > 0 ? total / span * 60 : 0;
}

/** Forgets deliveries, and goods routes moved, older than a minute. */
function pruneDeliveries(s: GameState) {
  const from = s.time - STAT_BUCKET * (STAT_BUCKETS - 1);
  for (const times of [...Object.values(s.stats.delivered), ...s.routes.map((r) => r.moved)]) {
    let k = 0;
    while (k < times!.length && times![k] <= from) k++;
    if (k) times!.splice(0, k);
  }
}

/** Goods a route's trucks dropped over the last minute, a minute. */
export function routeRate(s: GameState, r: Route) {
  const span = Math.min(s.time, STAT_BUCKET * (STAT_BUCKETS - 1));
  return span > 0 ? r.moved.filter((t) => t > s.time - span).length / span * 60 : 0;
}

export function goalDone(s: GameState, i: number): boolean {
  const g = s.scenario.goals[i];
  if (g.kind === 'deliver') return (s.delivered[g.item] ?? 0) >= g.n;
  if (g.kind === 'rate') return s.reached[i];
  return soilHealth(s) >= g.min;
}

function updateGoals(s: GameState) {
  const goals = s.scenario.goals;
  goals.forEach((g, i) => {
    // A rate goal counts only once a full minute of deliveries has been measured.
    if (g.kind === 'rate' && !s.reached[i] && s.time >= 60 && ratePerMin(s, g.item, 'delivered') >= g.perMin) s.reached[i] = true;
  });
  if (s.completedAt === null && goals.length && goals.every((_, i) => goalDone(s, i))) s.completedAt = s.time;
}

export type Medal = 'gold' | 'silver' | 'bronze';
export function medalFor(par: number, time: number): Medal {
  return time <= par ? 'gold' : time <= par * 1.5 ? 'silver' : 'bronze';
}

/** One line on what a building is doing, for the hover and the inspector. */
export function describeStatus(s: GameState, b: Building): string {
  const def = BUILDINGS[b.type];
  switch (b.status) {
    case 'input': {
      const r = recipeOf(b), lack = r ? missing(b, r) : null;
      const brought = !lack || members(lack).some((i) => served(s, b, i, 'drop'));
      return `Waiting for ${b.need ?? 'goods'}${brought ? '' : ': no route brings it'}`;
    }
    case 'blocked': return `Output blocked: nowhere for ${b.need ?? 'its goods'} to go`;
    case 'power': return networkOf(s, b) ? `No power: the network is out of power${b.type === 'garage' ? ', so its trucks can\'t charge' : ''}` : 'No power: not in reach of a pylon';
    case 'lowpower': return `Low power: ${b.type === 'garage' ? 'trucks charging' : 'running'} at ${Math.round(shareOf(s, b) * 100)}%`;
    case 'nolink': return 'Not connected: no pylon in reach';
    case 'noroad': return 'No road: trucks can\'t reach it. Leave an open tile beside it';
    case 'noroute': return `Full of ${b.need}: no route with trucks picks it up`;
    case 'flowers': return 'No flowering fields within 4 tiles';
    case 'idle':
      if (b.type === 'solar') return 'Night: no sun';
      if (b.type === 'silo') {
        const n = Object.values(b.store!).reduce((a, k) => a + k!, 0);
        return n ? `Holds ${n} goods` : 'Empty';
      }
      if (b.type === 'garage') { const n = s.trucks.filter((t) => t.garage === b.id).length; return n ? `${n} truck${n > 1 ? 's' : ''}, none charging` : 'No trucks yet: buy one'; }
      return 'Idle';
    case 'dry': return `Growing ${CROPS[b.crop!].name.toLowerCase()} slowly: no water`;
    case 'ok':
      if (b.type === 'field') return `Growing ${CROPS[b.crop!].name.toLowerCase()}`;
      if (b.type === 'garage') {
        const mine = s.trucks.filter((t) => t.garage === b.id), k = mine.filter((t) => t.phase === 'parked' || t.phase === 'charge').length;
        return `Charging ${k} of ${mine.length} truck${mine.length > 1 ? 's' : ''}`;
      }
      if (b.type === 'pylon') {
        const net = networks(s).of.get(b.id)!, k = net.pylons.length - 1, n = net.members.length;
        return `${k ? `Linked to ${k} other pylon${k > 1 ? 's' : ''}` : 'Linked to no other pylon'} · its network powers ${n} building${n === 1 ? '' : 's'}`;
      }
      return b.recipe ? 'Working' : def.name;
  }
}
