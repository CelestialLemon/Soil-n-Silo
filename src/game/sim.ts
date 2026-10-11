import {
  BUILDINGS, CROPS, DAY_SECONDS, DRONE, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEMS, OUTPUT_BATCHES, POWER, recipeById,
  SAPLING_SECONDS, SILO, START_HOUR, TICK, TREE_HEALTH, type Ingredient, type ItemId, type Recipe,
} from './data.ts';
import { TERRAIN } from './map.ts';
import { networkOf, networks } from './power.ts';
import { noise1 } from './rng.ts';
import type { Scenario } from './scenarios.ts';
import {
  buildingAt, buildingById, centre, countTrees, gapBetween, layoutOf, reachTo, removeBuilding, STAT_BUCKET, STAT_BUCKETS,
  terrainAt, tileIndex, touchLayout, type Building, type Drone, type GameState, type Task,
} from './state.ts';

// The simulation: one fixed step of TICK seconds at a time. Each step balances power, runs every building, flies the silos'
// drones and gives idle ones new jobs, then updates the stats and goals.

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
  /** The buildings each silo serves, nearest first. */
  serves: Map<number, Building[]>;
  /** The silos serving each building. */
  servedBy: Map<number, Building[]>;
}
const derivedCache = new WeakMap<GameState, Derived>();

function derived(s: GameState): Derived {
  const layout = layoutOf(s);
  let d = derivedCache.get(s);
  if (d && d.layout === layout) return d;
  d = { layout, sprinklers: new Map(), pollinated: new Set(), flowers: new Map(), exposure: new Map(), nearWater: new Set(), fielded: new Set(), serves: new Map(), servedBy: new Map() };
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
  for (const si of s.buildings) {
    if (si.type !== 'silo') continue;
    const list = s.buildings.filter((b) => handlesGoods(b) && gapBetween(si, b) <= SILO.reach)
      .sort((a, c) => distance(si, a) - distance(si, c) || a.id - c.id);
    d.serves.set(si.id, list);
    for (const b of list) {
      const by = d.servedBy.get(b.id);
      if (by) by.push(si); else d.servedBy.set(b.id, [si]);
    }
  }
  derivedCache.set(s, d);
  return d;
}

/** Whether a building trades goods with silos: it grows, makes or uses goods. */
export const handlesGoods = (b: Building) => b.type === 'field' || b.type === 'hive' || !!b.recipe;
/** The buildings a silo serves, nearest first. */
export const servedBySilo = (s: GameState, silo: Building) => derived(s).serves.get(silo.id) ?? [];
/** The silos serving a building. */
export const silosServing = (s: GameState, b: Building) => derived(s).servedBy.get(b.id) ?? [];
/** Distance between two buildings' centres, in tiles. */
export function distance(a: Building, b: Building) {
  const ca = centre(a), cb = centre(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

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

/** Whether a building takes `item` from a drone right now. Takes it if so. */
function accept(b: Building, item: ItemId): boolean {
  if (b.refuse?.includes(item)) return false;
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
  if (b.type === 'silo') return charging.get(s)?.get(b.id) ?? 0;
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

/** The goods a building has waiting for a drone. */
export function outputGoods(b: Building): ItemId[] {
  if (b.type === 'field') return b.stored! > 0 ? [b.harvest ?? b.crop!] : [];
  if (b.type === 'hive') return b.stored! > 0 ? ['honey'] : [];
  if (b.outputs) return Object.keys(b.outputs).filter((k) => b.outputs![k as ItemId]! > 0) as ItemId[];
  return [];
}
/** How many of `item` a building has waiting for a drone. */
function waiting(b: Building, item: ItemId) {
  if (b.type === 'field') return (b.harvest ?? b.crop) === item ? b.stored! : 0;
  if (b.type === 'hive') return item === 'honey' ? b.stored! : 0;
  return b.outputs?.[item] ?? 0;
}
function take(b: Building, item: ItemId) {
  if (b.type === 'field' || b.type === 'hive') { b.stored!--; if (!b.stored) b.harvest = b.crop; return; }
  b.outputs![item]! -= 1;
  if (!b.outputs![item]) delete b.outputs![item];
}

/** The goods that fill the same input of a building as `item` (its group's members, or just itself). */
function sameInput(b: Building, item: ItemId): readonly ItemId[] {
  const ing = recipeOf(b)?.inputs.find((i) => members(i).includes(item));
  return ing ? members(ing) : [item];
}

/** The goods a building can take: its recipe's inputs (any member of a group), or compost for a field; less what it refuses. */
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

// ---- Silos and drones ----

/** Goods on their way, by building and good: into buildings (feed), out of buildings (collect, fetch) and into silos. */
interface Plans { into: Map<string, number>; out: Map<string, number>; home: Map<string, number> }
const key = (id: number, item: ItemId | '*') => `${id} ${item}`;
const get = (m: Map<string, number>, id: number, item: ItemId | '*') => m.get(key(id, item)) ?? 0;
const add = (m: Map<string, number>, id: number, item: ItemId, n: number) => {
  m.set(key(id, item), get(m, id, item) + n);
  m.set(key(id, '*'), get(m, id, '*') + n);
};

/** What every drone has set out to move and not yet moved. */
function plans(s: GameState): Plans {
  const p: Plans = { into: new Map(), out: new Map(), home: new Map() };
  for (const si of s.buildings) {
    if (si.type !== 'silo') continue;
    for (const d of si.drones!) {
      const t = d.task;
      if (!t) continue;
      const before = d.phase === 'charge' || d.phase === 'out' || d.phase === 'work';
      if (t.kind === 'feed' && before) for (const it of d.cargo) add(p.into, t.target, it, 1);
      if (t.kind === 'collect' || t.kind === 'fetch') {
        if (before) add(p.out, t.target, t.item, t.n);
        // On its way home with cargo, or about to fetch it: the silo keeps room for it.
        add(p.home, si.id, t.item, before ? t.n : d.cargo.length);
      }
    }
  }
  return p;
}

/** How many more of `item` a building can take, counting goods already on their way to it. */
function room(b: Building, item: ItemId, p: Plans): number {
  if (b.refuse?.includes(item)) return 0;
  if (b.type === 'field') return item === 'compost' ? FIELD.compostStore - b.compost! - get(p.into, b.id, 'compost') : 0;
  const ing = recipeOf(b)?.inputs.find((i) => members(i).includes(item));
  if (!ing) return 0;
  return ing.n * INPUT_BATCHES - held(b, ing) - members(ing).reduce((n, it) => n + get(p.into, b.id, it), 0);
}

/** Room in a silo for more of `item`, counting goods on their way to it. */
const siloRoom = (si: Building, item: ItemId, p: Plans) => SILO.perGood - (si.store![item] ?? 0) - get(p.home, si.id, item);

/** What a silo can spare of `item` for another silo: what it holds, less what its own buildings can take and drones will fetch. */
function spare(s: GameState, si: Building, item: ItemId, p: Plans) {
  let n = (si.store![item] ?? 0) - get(p.out, si.id, item);
  for (const b of servedBySilo(s, si)) n -= Math.max(0, room(b, item, p));
  return n;
}

const depotOf = (s: GameState) => s.buildings.find((b) => b.type === 'depot') ?? null;
const isStation = (b: Building | null) => !!b && (b.type === 'silo' || b.type === 'depot');
const legOf = (si: Building, t: Task) => { const c = centre(si); return Math.max(1, Math.hypot(t.tx - c.x, t.ty - c.y)); };
const taskTo = (kind: Task['kind'], b: Building, item: ItemId, n: number): Task => { const c = centre(b); return { kind, target: b.id, tx: c.x, ty: c.y, item, n }; };

/**
 * The next job for an idle drone of silo `si`, or null; loads the goods it takes from the silo. A good sold by half that a
 * building here can use too is shared: feeding and selling take turns (`shared` counts goods fed less goods sold). A good
 * sold when spare goes to the depot only while no building here can take it.
 */
function nextTask(s: GameState, si: Building, d: Drone, p: Plans): Task | null {
  const store = si.store!, shared = si.shared!;
  // What the silo holds less what other silos' drones are on their way to fetch.
  const free = (item: ItemId) => (store[item] ?? 0) - get(p.out, si.id, item);
  const held = (Object.keys(store) as ItemId[]).filter((i) => free(i) > 0);
  const served = servedBySilo(s, si);
  const depot = depotOf(s);
  const reach = !!depot && distance(si, depot) <= SILO.range;
  const mode = (item: ItemId) => (reach ? depot!.sell![item] ?? null : null);
  const tally = (item: ItemId, n: number) => {
    if (mode(item) === 'half') shared[item] = Math.max(-DRONE.shareSlack, Math.min(DRONE.shareSlack, (shared[item] ?? 0) + n));
  };
  const load = (item: ItemId, n: number) => {
    for (let i = 0; i < n; i++) d.cargo.push(item);
    store[item]! -= n;
    if (!store[item]) delete store[item];
  };
  // Feed: the nearest building that can use something the silo holds (a shared good only on its turn).
  for (const b of served) for (const item of held) {
    if (mode(item) === 'half' && (shared[item] ?? 0) > 0) continue;
    const n = Math.min(room(b, item, p), free(item), DRONE.cargo);
    if (n > 0) { load(item, n); add(p.into, b.id, item, n); tally(item, n); return taskTo('feed', b, item, n); }
  }
  // Collect: from the building with the most waiting (the nearest of equals), while the silo has room.
  let best: { b: Building; item: ItemId; n: number; waiting: number } | null = null;
  for (const b of served) for (const item of outputGoods(b)) {
    const w = waiting(b, item) - get(p.out, b.id, item), n = Math.min(w, siloRoom(si, item, p), DRONE.cargo);
    if (n > 0 && (!best || w > best.waiting)) best = { b, item, n, waiting: w };
  }
  if (best) { add(p.out, best.b.id, best.item, best.n); add(p.home, si.id, best.item, best.n); return taskTo('collect', best.b, best.item, best.n); }
  // Fetch: a good a building here needs and this silo doesn't hold (or have coming), from the nearest other silo in range
  // that can spare it.
  for (const b of served) for (const item of inputGoods(b)) {
    // Goods of the same input it takes (a coop's beans, bran or seed cake) here or on their way count against the need.
    const same = sameInput(b, item).filter((i) => !b.refuse?.includes(i));
    const want = Math.min(room(b, item, p) - same.reduce((n, i) => n + get(p.home, si.id, i) + Math.max(0, free(i)), 0), siloRoom(si, item, p));
    if (want <= 0) continue;
    let from: Building | null = null, fromN = 0;
    for (const o of s.buildings) {
      if (o.type !== 'silo' || o === si || !networkOf(s, o) || distance(si, o) > SILO.range) continue;
      const n = spare(s, o, item, p);
      if (n > 0 && (!from || distance(si, o) < distance(si, from))) { from = o; fromN = n; }
    }
    if (from) {
      const n = Math.min(want, fromN, DRONE.cargo);
      add(p.out, from.id, item, n); add(p.home, si.id, item, n);
      return taskTo('fetch', from, item, n);
    }
  }
  // Sell: goods on the depot's sell list (a shared good on its turn, a spare one when nothing here takes it), a full load or
  // after a short wait.
  const wanted = (i: ItemId) => served.some((b) => room(b, i, p) > 0);
  const sell = held.filter((i) => (mode(i) === 'half' ? (shared[i] ?? 0) >= 0 || !wanted(i) : mode(i) === 'spare' && !wanted(i)));
  const n = sell.reduce((k, i) => k + free(i), 0);
  if (depot && (n >= DRONE.cargo || (n > 0 && si.waited! >= DRONE.sellWait))) {
    // The goods there are most of first; after the wait, the fewest first, so a straggler isn't passed over by full loads.
    const late = si.waited! >= DRONE.sellWait;
    sell.sort((a, c) => (late ? free(a) - free(c) : free(c) - free(a)));
    for (const i of sell) { const k = Math.min(free(i), DRONE.cargo - d.cargo.length); load(i, k); tally(i, -k); }
    // The wait starts again once nothing to sell is left behind.
    if (!sell.some((i) => free(i) > 0)) si.waited = 0;
    return taskTo('sell', depot, d.cargo[0], 0);
  }
  return null;
}

/** Joules a drone charges at home for its task: the way out, and the way back too unless another station charges it. */
function homeCost(s: GameState, si: Building, t: Task) {
  const leg = legOf(si, t) * DRONE.joulesPerTile;
  return isStation(buildingById(s, t.target)) ? leg : leg * 2;
}

/** Charges a drone at a silo towards `need` joules; true once it has them. */
function chargeAt(s: GameState, at: Building, d: Drone, need: number, dt: number) {
  // What it asked the network for this step (countCharging), times the share of it the network gave.
  if (d.energy < need) d.energy = Math.min(need, d.energy + Math.min(DRONE.chargeRate * dt, need - d.energy) * shareOf(s, at));
  return d.energy >= need - 1e-9;
}

/** Moves a drone of silo `si` on by one step. */
function flyDrone(s: GameState, si: Building, d: Drone, dt: number) {
  const t = d.task;
  if (!t) return;
  const target = buildingById(s, t.target), leg = legOf(si, t);
  // The target has gone: fly home from wherever it is, without charging again.
  if (!target && (d.phase === 'out' || d.phase === 'work' || d.phase === 'recharge')) { d.t = d.phase === 'out' ? 1 - d.t : 0; d.phase = 'back'; }
  switch (d.phase) {
    case 'charge': {
      if (!target) { home(si, d); return; }
      const need = homeCost(s, si, t);
      if (chargeAt(s, si, d, need, dt)) { d.energy = Math.max(0, d.energy - need); d.phase = 'out'; d.t = 0; }
      return;
    }
    case 'out':
      d.t += dt * DRONE.speed / leg;
      if (d.t >= 1) { d.phase = 'work'; d.t = 0; }
      return;
    case 'work':
      d.t += dt;
      if (d.t < DRONE.loadSeconds) return;
      work(s, target!, d, t);
      if (target!.type === 'silo') { d.phase = 'recharge'; return; }
      d.phase = 'back'; d.t = 0;
      return;
    case 'recharge': {
      const need = leg * DRONE.joulesPerTile;
      if (chargeAt(s, target!, d, need, dt)) { d.energy = Math.max(0, d.energy - need); d.phase = 'back'; d.t = 0; }
      return;
    }
    case 'back':
      d.t += dt * DRONE.speed / leg;
      if (d.t >= 1) home(si, d);
      return;
  }
}

/** A drone's work at its target: unload, load, or sell. */
function work(s: GameState, b: Building, d: Drone, t: Task) {
  switch (t.kind) {
    case 'feed': d.cargo = d.cargo.filter((it) => !accept(b, it)); break;
    case 'collect': while (d.cargo.length < t.n && waiting(b, t.item) > 0) { take(b, t.item); d.cargo.push(t.item); } break;
    case 'fetch': {
      const n = Math.min(t.n, b.store![t.item] ?? 0);
      for (let i = 0; i < n; i++) d.cargo.push(t.item);
      b.store![t.item] = (b.store![t.item] ?? 0) - n;
      if (!b.store![t.item]) delete b.store![t.item];
      break;
    }
    case 'sell': for (const it of d.cargo) deliver(s, it); d.cargo = []; break;
  }
}

/**
 * A drone lands at its silo: its cargo goes into the store, and it is free for the next job. Goods it couldn't deliver (the
 * target went, or stopped taking them) go back in even past the silo's limit: they had room when they left, and the silo
 * collects nothing more of that good until it is back under.
 */
function home(si: Building, d: Drone) {
  for (const it of d.cargo) {
    si.store![it] = (si.store![it] ?? 0) + 1;
    // Undelivered feed doesn't count as fed.
    if (d.task?.kind === 'feed' && si.shared![it] !== undefined) si.shared![it] = Math.max(-DRONE.shareSlack, si.shared![it]! - 1);
  }
  d.cargo = []; d.task = null; d.phase = 'idle'; d.t = 0;
}

/** Flies every silo's drones, then gives the idle ones new jobs. */
function runSilos(s: GameState, dt: number) {
  const silos = s.buildings.filter((b) => b.type === 'silo');
  for (const si of silos) for (const d of si.drones!) flyDrone(s, si, d, dt);
  const p = plans(s);
  const depot = depotOf(s);
  for (const si of silos) {
    const net = networkOf(s, si);
    const sellable = depot ? (Object.keys(depot.sell!) as ItemId[]).some((i) => (si.store![i] ?? 0) > 0) : false;
    si.waited = sellable ? si.waited! + dt : 0;
    if (net) for (const d of si.drones!) {
      if (d.phase !== 'idle') continue;
      const t = nextTask(s, si, d, p);
      if (!t) break;
      d.task = t; d.phase = 'charge'; d.t = 0;
    }
    const busy = si.drones!.filter((d) => d.phase !== 'idle').length, share = shareOf(s, si);
    // Drones charging here: its own, or other silos' charging for the way home.
    const waitingPower = (charging.get(s)?.get(si.id) ?? 0) > 0;
    si.need = undefined;
    if (!net) si.status = 'power';
    else if (waitingPower && share <= 0) si.status = 'power';
    else if (waitingPower && share < 1) si.status = 'lowpower';
    else if (busy) si.status = 'ok';
    else {
      const full = (Object.keys(si.store!) as ItemId[]).find((i) => si.store![i]! >= SILO.perGood);
      si.status = full ? 'blocked' : 'idle';
      si.need = full ? ITEMS[full].name.toLowerCase() : undefined;
    }
  }
}

/**
 * Watts each silo wants for the drones charging there (its own, and others' charging for the way home), worked out before
 * power is balanced: each drone at most the charge rate, and no more than it needs to finish this step.
 */
const charging = new WeakMap<GameState, Map<number, number>>();
function countCharging(s: GameState) {
  const m = new Map<number, number>();
  for (const si of s.buildings) {
    if (si.type !== 'silo') continue;
    for (const d of si.drones!) {
      const t = d.task;
      if (!t || (d.phase !== 'charge' && d.phase !== 'recharge')) continue;
      const at = d.phase === 'charge' ? si.id : t.target;
      const need = d.phase === 'charge' ? homeCost(s, si, t) : legOf(si, t) * DRONE.joulesPerTile;
      const w = Math.min(DRONE.chargeRate, Math.max(0, need - d.energy) / TICK);
      if (w > 0) m.set(at, (m.get(at) ?? 0) + w);
    }
  }
  charging.set(s, m);
}

/** What a drone is doing, in a few words, for the inspector. */
export function describeDrone(s: GameState, d: Drone): string {
  const t = d.task;
  if (!t) return 'waiting for a job';
  const where = buildingById(s, t.target);
  const name = where ? BUILDINGS[where.type].name.toLowerCase() : 'its target';
  const what = ITEMS[t.item]?.name.toLowerCase() ?? 'goods';
  const job = t.kind === 'feed' ? `taking ${what} to the ${name}` : t.kind === 'collect' ? `collecting ${what} from the ${name}`
    : t.kind === 'fetch' ? `fetching ${what} from another silo` : 'selling at the depot';
  if (d.phase === 'charge' || d.phase === 'recharge') return `charging, then ${job}`;
  if (d.phase === 'back') return d.cargo.length ? `bringing ${d.cargo.length} ${ITEMS[d.cargo[0]].name.toLowerCase()} home` : 'flying home';
  return job;
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
      case 'depot': case 'silo': break;
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
  runSilos(s, dt);
  // A building that trades goods with no silo in reach says so (unless it lacks power or water, which say more).
  for (const b of s.buildings) {
    if (['input', 'blocked', 'ok', 'idle'].includes(b.status) && handlesGoods(b) && !silosServing(s, b).length) b.status = 'nosilo';
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

/** Forgets deliveries older than a minute. */
function pruneDeliveries(s: GameState) {
  const from = s.time - STAT_BUCKET * (STAT_BUCKETS - 1);
  for (const times of Object.values(s.stats.delivered)) {
    let k = 0;
    while (k < times!.length && times![k] <= from) k++;
    if (k) times!.splice(0, k);
  }
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
    case 'input': return `Waiting for ${b.need ?? 'goods'}`;
    case 'blocked':
      if (b.type === 'silo') return `Full of ${b.need}: nothing it serves takes it, and the depot doesn't buy it`;
      return `Output blocked: nowhere for ${b.need ?? 'its goods'} to go`;
    case 'power': return networkOf(s, b) ? `No power: the network is out of power${b.type === 'silo' ? ', so its drones can\'t charge' : ''}` : 'No power: not in reach of a pylon';
    case 'lowpower': return `Low power: ${b.type === 'silo' ? 'drones charging' : 'running'} at ${Math.round(shareOf(s, b) * 100)}%`;
    case 'nolink': return 'Not connected: no pylon in reach';
    case 'nosilo': return `No silo in reach: build one within ${SILO.reach} tiles so its drones bring and take its goods`;
    case 'flowers': return 'No flowering fields within 4 tiles';
    case 'idle':
      if (b.type === 'solar') return 'Night: no sun';
      if (b.type === 'silo') return 'Idle: nothing to carry';
      return 'Idle';
    case 'dry': return `Growing ${CROPS[b.crop!].name.toLowerCase()} slowly: no water`;
    case 'ok':
      if (b.type === 'field') return `Growing ${CROPS[b.crop!].name.toLowerCase()}`;
      if (b.type === 'silo') return `${b.drones!.filter((d) => d.phase !== 'idle').length} of ${b.drones!.length} drones busy`;
      if (b.type === 'pylon') {
        const net = networks(s).of.get(b.id)!, k = net.pylons.length - 1, n = net.members.length;
        return `${k ? `Linked to ${k} other pylon${k > 1 ? 's' : ''}` : 'Linked to no other pylon'} · its network powers ${n} building${n === 1 ? '' : 's'}`;
      }
      return b.recipe ? 'Working' : def.name;
  }
}
