// A scripted commission on the real game rules (src/game/): a bot builds a fixed layout as credits allow, then lets it run,
// and reports progress every in-game minute and when the commission completes, against its target time. It checks that
// commissions can be cleared and roughly how long they take (DESIGN.md, "Open questions"). The map is flattened (no
// water, rock or trees, even soil at the mean of the commission's own ground), since the layout is the bot's, not the map's. Run by
// `npm run sim` (tools/sim.ts), and by the tests for every layout (test/bots.test.ts).

import { addStop, buyTruck, newRoute, place, remove, reshape, setCrop, setTruckRoute, truckPrice } from '../src/game/build.ts';
import { LAYOUTS, RIVER_AT, type Step } from './layouts.ts';
import { BUILDINGS, ITEMS, type CropId } from '../src/game/data.ts';
import { must } from '../src/game/result.ts';
import { TERRAIN } from '../src/game/map.ts';
import { networks } from '../src/game/power.ts';
import { scenarioById, type Scenario } from '../src/game/scenarios.ts';
import { soilHealth } from '../src/game/sim/soil.ts';
import { goalDone, medalFor } from '../src/game/sim/stats.ts';
import { advance } from '../src/game/sim/step.ts';
import { newGame, type Building, type GameState, type Route } from '../src/game/state.ts';

/** How far from the depot (tiles) the bot's farm reaches: the ground its soil is taken from. */
const FARM_REACH = 18;

/** How a bot run went: when the commission completed (null if it didn't in the time given), and its target time. */
export interface BotRun { completedAt: number | null; par: number; /** The game as the run left it. */ state: GameState }

/**
 * Plays the layout `id` (a commission id, or id:variant such as c2:next) for up to `minutes` of game time, or until the
 * commission completes, passing each line of its report to `log`. `over.glass` puts up to that many fields under glass once the layout stands
 * (a winter's bot, tools/seasonfactor.ts).
 */
export function playLayout(id: string, minutes = 60, log: (line: string) => void = () => {}, over: Partial<Pick<Scenario, 'climate' | 'seed' | 'events'>> & { river?: number; glass?: number } = {}, each?: (s: GameState) => void): BotRun {
  // A layout may be one of several for a commission: `c2:next` plays c2. `over` plays it in another climate or on another
  // seed (the weather's rolls follow the seed), as tools/seasonfactor.ts does.
  const base = scenarioById(id.split(':')[0]);
  if (!base) throw new Error(`no commission ${id}`);
  const { river = RIVER_AT[id.split(':')[0]], glass = 0, ...rest } = over;
  const sc: Scenario = { ...base, ...rest };

  const layout = LAYOUTS[id];
  if (!layout) throw new Error(`no bot layout for ${id} yet (have: ${Object.keys(LAYOUTS).join(', ')})`);

  const s: GameState = newGame(sc);
  // A flat, open map: the layouts test the economy, not one map's lie of the land (test/height.test.ts covers height).
  // Its soil is the mean of the commission's own ground round the depot, where the layout stands (a player builds there, on the ground the start gives).
  const { depot, width, height } = s.map, near: number[] = [];
  for (let y = Math.max(0, depot.y - FARM_REACH); y < Math.min(height, depot.y + FARM_REACH); y++) for (let x = Math.max(0, depot.x - FARM_REACH); x <= Math.min(width - 1, depot.x + FARM_REACH); x++) {
    if (s.map.terrain[y * width + x] !== TERRAIN.water) near.push(s.map.fertility[y * width + x]);
  }
  const soil = Math.round(near.reduce((a, b) => a + b, 0) / near.length);
  s.map.terrain.fill(TERRAIN.grass);
  s.map.corner.fill(0);
  s.map.fertility.fill(soil);
  s.soilBase.fill(soil);
  s.initialTrees = 0;
  // The depot in the middle of the south edge, so every layout fits (nothing has looked up the layout yet).
  s.map.depot.x = Math.floor(s.map.width / 2);
  s.buildings[0].x = s.map.depot.x;
  // `river`: a two-tile river down the map that many tiles east of the depot (west if negative), for what floods do (tools/floodcost.ts).
  if (river !== undefined) for (let y = 0; y < s.map.height; y++) for (let x = s.map.depot.x + river; x <= s.map.depot.x + river + 1; x++) s.map.terrain[y * s.map.width + x] = TERRAIN.water;
  const steps = layout(s.map.depot.x, s.map.depot.y);
  let next = 0;
  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const named = new Map<string, Building>([['depot', s.buildings[0]]]);
  const routes = new Map<string, Route>();

  /** What a step costs; a move costs nothing, but waits for its goal. */
  const cost = (st: Step) => ('bank' in st ? (st.to - st.from + 1) * st.times * 6 : 'type' in st ? BUILDINGS[st.type].cost : 'route' in st ? st.trucks * truckPrice(s) : 'truck' in st ? truckPrice(s) : 0);
  const ready = (st: Step) => s.credits >= cost(st) && (!('move' in st) || goalDone(s, st.goal));

  /** Takes a step: places a building, makes a route and buys its trucks, or adds a truck to a route. */
  function take(st: Step) {
    if ('bank' in st) {
      const x = s.map.depot.x + st.bank;
      for (let k = 0; k < st.times; k++) {
        const y0 = s.map.depot.y + st.from, y1 = s.map.depot.y + st.to, r = reshape(s, { how: 'raise', from: { x, y: y0 }, to: { x, y: y1 }, at: { x, y: y0 } });
        if (!r.ok) { log(`  step ${next} bank at ${x}: ${r.error}`); return; }
      }
      log(`${fmt(s.time)}  bank raised at x ${x}`);
      return;
    }
    if ('move' in st) {
      const from = must(routes.get(st.move), `route ${st.move}`), to = must(routes.get(st.to), `route ${st.to}`);
      for (const tr of s.trucks) if (tr.route === from.id) setTruckRoute(s, tr, to);
      log(`${fmt(s.time)}  ${st.move}'s trucks move to ${st.to}`);
      return;
    }
    if ('type' in st) {
      const r = place(s, st.type, st.x, st.y, st.rot ?? 1, st.recipe ? { recipe: st.recipe } : {});
      if (!r.ok) { log(`  step ${next} ${st.type} at ${st.x},${st.y}: ${r.error}`); return; }
      if (st.crop) setCrop(s, r.value.building, st.crop);
      if (st.as) named.set(st.as, r.value.building);
      return;
    }
    const garage = must(named.get(st.garage), `building ${st.garage}`);
    const route = 'route' in st ? newRoute(s) : must(routes.get(st.truck), `route ${st.truck}`);
    if ('route' in st) {
      routes.set(st.route, route);
      route.name = st.route;
      for (const sp of st.stops) {
        const b = named.get(sp.at);
        if (!b) throw new Error(`route ${st.route}: no building named ${sp.at}`);
        const res = addStop(s, route, b);
        if (!res.ok) throw new Error(`route ${st.route}: ${res.error}`);
        const stop = route.stops[route.stops.length - 1];
        const { pick, drop } = sp;
        if (pick) { stop.pick = pick; stop.drop = stop.drop.filter((i) => !pick.includes(i)); }
        if (drop) { stop.drop = drop; stop.pick = stop.pick.filter((i) => !drop.includes(i)); }
        if (sp.wait !== undefined) stop.wait = sp.wait;
      }
    }
    for (let k = 0; k < ('route' in st ? st.trucks : 1); k++) {
      const r = buyTruck(s, garage);
      if (!r.ok) { log(`  step ${next}: ${r.error}`); return; }
      setTruckRoute(s, r.value.truck, route);
    }
  }

  /**
   * Winter, once the layout stands: a field becomes a greenhouse (the field is taken down and refunded, the greenhouse put in its place
   * with the same crop and stops) and a wind turbine goes up within reach of a pylon, for its heating. At most `glass` fields, as credits allow.
   */
  let glazed = 0;
  function glaze() {
    const f = s.buildings.find((b) => b.type === 'field');
    if (!f || s.credits < BUILDINGS.greenhouse.cost + BUILDINGS.turbine.cost) return;
    const { x, y, crop } = f as Building & { crop: CropId };
    // The routes keep their stops: they point at nothing while the field is down, then at the greenhouse.
    const stops = s.routes.flatMap((r) => r.stops.filter((st) => st.building === f.id));
    for (const st of stops) st.building = -1;
    must(remove(s, f), 'taking down a field');
    const g = place(s, 'greenhouse', x, y, 1, { crop });
    if (!g.ok) { log(`  greenhouse at ${x},${y}: ${g.error}`); glazed = glass; return; }
    for (const st of stops) st.building = g.value.building.id;
    glazed++;
    const pylons = s.buildings.filter((b) => b.type === 'pylon');
    for (const p of pylons) for (let r = 1; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) === r && place(s, 'turbine', p.x + dx, p.y + dy, 1, {}).ok) return;
    }
    log(`  no room for a turbine for the greenhouse at ${x},${y}`);
  }

  for (let t = 0; t < minutes * 60; t += 1) {
    if (next === steps.length && glazed < glass) glaze();
    while (next < steps.length && ready(steps[next])) {
      take(steps[next++]);
      if (next === steps.length) log(`${fmt(s.time)}  layout complete (${steps.length} steps)`);
    }
    advance(s, 1);
    if (Math.round(s.time) % 60 === 0) {
      each?.(s);
      const nets = networks(s).list, made = nets.reduce((n, x) => n + x.made, 0), wanted = nets.reduce((n, x) => n + x.wanted, 0);
      const goals = sc.goals.map((g, i) => (g.kind === 'deliver' ? `${ITEMS[g.item].name} ${s.delivered[g.item] ?? 0}/${g.n}` : g.kind === 'soil' ? `soil ${Math.round(soilHealth(s))}/${g.min}` : `${g.item}/min ${goalDone(s, i) ? 'done' : '…'}`));
      const phases = new Map<string, number>();
      for (const tr of s.trucks) phases.set(tr.phase, (phases.get(tr.phase) ?? 0) + 1);
      log(`${fmt(s.time)}  ${goals.join(' · ')} · credits ${Math.floor(s.credits)} · power ${made.toFixed(0)}/${wanted.toFixed(0)} W · stored ${nets.reduce((n, x) => n + x.stored, 0).toFixed(0)} J · trucks ${[...phases].map(([p, n]) => `${n} ${p}`).join(', ')}`);
    }
    if (s.completedAt !== null) {
      log(`\nComplete at ${fmt(s.completedAt)} (target ${fmt(sc.par)}): ${medalFor(sc.par, s.completedAt)}.`);
      break;
    }
  }
  if (s.completedAt === null) log(`\nNot complete after ${minutes} minutes.`);
  const stalled = s.buildings.filter((b) => ['blocked', 'input', 'power', 'noroad', 'noroute'].includes(b.status)).map((b) => `${b.type}@${b.x},${b.y}: ${b.status}${b.need ? ` (${b.need})` : ''}`);
  if (stalled.length) log(`Not working at the end: ${stalled.slice(0, 12).join('; ')}`);
  return { completedAt: s.completedAt, par: sc.par, state: s };
}
