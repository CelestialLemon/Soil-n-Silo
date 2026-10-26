import { BUILDINGS, CROPS, HIVE, ITEMS, TRUCK, type ItemId } from '../data.ts';
import { networkOf, networks } from '../power.ts';
import { accessTiles, distanceTo, legLength } from '../roads.ts';
import { buildingById, growsCrops, isMachine, type Building, type GameState, type Route, type Truck } from '../state.ts';
import { members, recipeOf, missing, outputsFit, wantsCompost, takesGoods, takesNow, givesNow, passes, neighboursOf, type Link } from './goods.ts';
import { shareOf } from './energy.ts';
import { exposureOf, handsTo } from './layout.ts';
import { tileOf, garageOf, routeOf, trucksOn } from './trucks.ts';
import { must } from '../result.ts';
import { beesFact, henFact, warmthOf } from '../warmth.ts';
import { coopPace, coopShade } from '../rules.ts';
import { EVENTS, pushesAt } from '../events.ts';
import { fieldPace } from './buildings.ts';
import { panelShare } from '../snow.ts';
import { fieldFertility } from './soil.ts';
import { causeName, readHold, truckHold } from '../hold.ts';
import { floodHolds } from '../flood.ts';
import { turbineInGale } from '../wind.ts';

// Player-facing text: what a building or truck is doing, and what is wrong with it.

/** Links in a few words, one line per kind of building and goods: "Takes wheat from 2 fields", "Gives bran to the coop". */
export function describeLinks(links: { from: Link[]; to: Link[] }): string[] {
  const says = (list: Link[], verb: string, word: string) => {
    const groups = new Map<string, Link & { n: number }>();
    for (const l of list) { const k = `${l.b.type} ${l.goods.join(',')}`, g = groups.get(k); if (g) g.n++; else groups.set(k, { ...l, n: 1 }); }
    return [...groups.values()].map((g) => {
      const name = BUILDINGS[g.b.type].name.toLowerCase(), who = g.n === 1 ? `the ${name}` : `${g.n} ${name}${name.endsWith('s') ? 'es' : 's'}`;
      return `${verb} ${g.goods.map(lcItem).join(', ')} ${word} ${who}`;
    });
  };
  return [...says(links.from, 'Takes', 'from'), ...says(links.to, 'Gives', 'to')];
}

/** The good a building can't get rid of, if its outputs are full. */
export function blockedGood(b: Building): ItemId | null {
  if (growsCrops(b)) return b.stored ? b.harvest ?? b.crop : null;
  if (b.type === 'hive') return 'honey';
  return isMachine(b) ? outputsFit(b, recipeOf(b))?.item ?? null : null;
}

/** Whether a building next door takes `item` from it (or gives it), or some route with trucks picks it up there (or drops it). */
export function served(s: GameState, b: Building, item: ItemId, how: 'pick' | 'drop') {
  const trades = (from: Building, to: Building) => handsTo(s, from, to) && passes(from, to).includes(item);
  if (neighboursOf(s, b).some((n) => (how === 'pick' ? trades(b, n) : trades(n, b)))) return true;
  return s.routes.some((r) => r.stops.some((st) => st.building === b.id && st[how].includes(item)) && s.trucks.some((t) => t.route === r.id));
}

/** Whether anything would take a composter's compost now: a field wanting it (next door, or at a stop of a route that picks it up there), or a depot or silo drop. */
function compostWelcome(s: GameState, b: Building): boolean {
  if (neighboursOf(s, b).some((n) => growsCrops(n) && handsTo(s, b, n) && wantsCompost(s, n))) return true;
  return s.routes.some((r) => r.stops.some((st) => st.building === b.id && st.pick.includes('compost'))
    && r.stops.some((st) => {
      const d = buildingById(s, st.building);
      return !!d && st.drop.includes('compost') && (growsCrops(d) ? wantsCompost(s, d) : takesGoods(d).includes('compost'));
    }));
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
  // Full, with nothing a stop takes now: compost for fields whose soil is good. It can pick nothing up, so it may never empty.
  else if (r && t.cargo.length >= TRUCK.cargo && !t.cargo.some((i) => r.stops.some((st) => {
    const b = buildingById(s, st.building);
    return b && st.drop.includes(i) && takesNow(b).includes(i) && !(growsCrops(b) && !wantsCompost(s, b));
  }))) out.push('It is full of compost none of its fields takes now (their soil is good), so it can pick nothing up.');
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

/** What a truck is doing, in a few words, for the inspector; slowed by weather, it says so. */
export function describeTruck(s: GameState, t: Truck): string {
  const hold = truckHold(s, t), what = doingOf(s, t);
  if (!hold) return what;
  if (hold.kind === 'mud') return `${what}, slowed by mud: it drives at ${Math.round(TRUCK.mudSpeed * 100)}% speed on clay in the rain and ${TRUCK.mudHours} hours after it`;
  return hold.effect === 'stopped' ? `Kept in its garage by the ${causeName(hold)} until it eases (${what.charAt(0).toLowerCase()}${what.slice(1)})` : `${what}, slowed by the ${causeName(hold)}`;
}

function doingOf(s: GameState, t: Truck): string {
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

/** A building held by weather, what it does to it, and by how much. */
function describeHold(s: GameState, b: Building): string {
  const hold = readHold(b.need);
  if (!hold) return 'Held by the weather';
  const cause = `the ${causeName(hold)}`, p = pushesAt(s.scenario, s.time);
  switch (b.type) {
    case 'solar': {
      const share = Math.round(p.sun * panelShare(s.scenario, s.time) * 100);
      return p.sun < 1 ? `Making about ${share}% of its power: ${cause} dims the sun${panelShare(s.scenario, s.time) < 1 ? ' and snow lies on the panels' : ''}` : `Making about ${share}% of its power: snow from ${cause} lies on the panels until it melts`;
    }
    case 'turbine': {
      const share = turbineInGale(s, b.id, exposureOf(s, b))?.share ?? 1;
      if (share > 0) return `Turning slowly, in gusts, making about ${Math.round(share * 100)}% of its power: what stands round it shelters it from ${cause}`;
      return hold.kind === 'gale' ? `Stopped: ${cause} is stronger than a turbine this exposed can stand. Trees, tall buildings or higher ground beside it would keep it turning` : `Stopped: no turbine, sheltered or not, stands ${cause}`;
    }
    case 'wheel': return hold.effect === 'stopped' ? `Stopped: the river is frozen over here by ${cause}; a wheel at a fall keeps turning` : `Slowing: the river is freezing over in ${cause}; a wheel at a fall keeps turning`;
    case 'hive': return `The bees stay in: ${cause} is too wild to fly in`;
    case 'coop':
      if (hold.kind !== 'mud' && EVENTS[hold.kind].push[hold.strength]?.hens !== undefined) {
        if (hold.effect === 'stopped') return `The hens have stopped laying: they stay in out of ${cause}`;
        const pace = Math.round(coopPace(s, b.x, b.y) * 100);
        return p.warmth < 0 ? `Hens laying at about ${pace}% speed: ${cause} (${Math.round(warmthOf(s))}°C)` : `Laying at about ${pace}% of the pace: ${cause} unsettles the hens`;
      }
      return `${henFact(s.scenario, warmthOf(s), coopShade(s, b.x, b.y), p.hens).text} · ${cause} adds ${Math.round(p.warmth)}°C`;
    case 'field': case 'greenhouse':
      if (hold.effect === 'eroded') return `Losing soil to ${cause}: no tree, sapling or bean field beside it breaks the wind. Fertility ${Math.round(fieldFertility(s, b))}`;
      if (hold.effect === 'lost') return `The growing ${CROPS[b.crop].name.toLowerCase()} is lost to ${cause}: the ${BUILDINGS[b.type].name.toLowerCase()} starts again when it has passed`;
      return `Growing ${CROPS[b.crop].name.toLowerCase()} slowly: ${cause} adds ${Math.round(p.warmth)}°C${fieldPace(s, b).water < 1 ? ', and it has no water' : ''}`;
    default: return `${hold.effect[0].toUpperCase()}${hold.effect.slice(1)} by ${cause}`;
  }
}

/** One line on what a building is doing, for the hover and the inspector. */
export function describeStatus(s: GameState, b: Building): string {
  const def = BUILDINGS[b.type];
  // Water on its ground (said at once, though its status is the last step's: the water may have just come, or a bank gone).
  if (floodHolds(s, b)) return growsCrops(b) ? `Under water: the growing ${CROPS[b.crop].name.toLowerCase()} is lost, the ${def.name.toLowerCase()} starts again once it drains` : b.type === 'station' ? 'Under water: stopped until it drains. The forecast keeps what it last said' : 'Under water: stopped until it drains. Nothing is lost';
  switch (b.status) {
    case 'input': {
      const lack = isMachine(b) ? missing(b, recipeOf(b)) : null;
      const brought = !lack || members(lack).some((i) => served(s, b, i, 'drop'));
      return `Waiting for ${b.need ?? 'goods'}${brought ? '' : ': no route or building next door brings it'}`;
    }
    case 'blocked':
      if (b.need === 'compost' && b.type === 'composter' && !compostWelcome(s, b)) return 'Full of compost: no field needs any. Sell it at the depot or let fields draw it down';
      return `Output blocked: nowhere for ${b.need ?? 'its goods'} to go`;
    case 'power':
      if (b.type === 'greenhouse') return networkOf(s, b) ? 'Cooling: not enough power. The network has none for the heating' : 'Cooling: not enough power. No pylon in reach of it';
      return networkOf(s, b) ? `No power: the network is out of power${b.type === 'garage' ? ', so its trucks can\'t charge' : ''}` : 'No power: not in reach of a pylon';
    case 'lowpower':
      if (b.type === 'greenhouse') return `Cooling: not enough power. Only ${Math.round(shareOf(s, b) * 100)}% of the heating it needs`;
      if (b.type === 'station') return `Low power: ${Math.round(shareOf(s, b) * 100)}% of the 3 W, too little to renew the forecast`;
      return `Low power: ${b.type === 'garage' ? 'trucks charging' : 'running'} at ${Math.round(shareOf(s, b) * 100)}%`;
    case 'nolink': return 'Not connected: no pylon in reach';
    case 'noroad': return 'No road: trucks can\'t reach it. Leave an open tile beside it, and a way there from the garage';
    case 'noroute': return `Full of ${b.need}: no route with trucks or building next door takes it`;
    case 'flowers': return `No flowering fields within ${HIVE.reach} tiles`;
    case 'idle':
      if (b.type === 'solar') return 'Night: no sun';
      if (b.type === 'wheel') return 'Still: no river current beside it';
      if (b.type === 'silo') {
        const n = Object.values(b.store).reduce((a, k) => a + k, 0);
        return n ? `Holds ${n} goods` : 'Empty';
      }
      if (b.type === 'garage') { const n = s.trucks.filter((t) => t.garage === b.id).length; return n ? `${n} truck${n > 1 ? 's' : ''}, none charging` : 'No trucks yet: buy one'; }
      return 'Idle';
    case 'rain': return 'Resting in rain: the rain waters the fields, so it draws no power';
    case 'dry': return growsCrops(b) ? `Growing ${CROPS[b.crop].name.toLowerCase()} slowly: no water` : def.name;
    case 'cold':
      if (b.type === 'hive') return beesFact(warmthOf(s)).text;
      return growsCrops(b) ? `Not growing ${CROPS[b.crop].name.toLowerCase()}: too cold for it` : def.name;
    case 'frost': return growsCrops(b) ? `Frost: the growing ${CROPS[b.crop].name.toLowerCase()} is lost, the field starts again` : def.name;
    case 'weather': return describeHold(s, b);
    case 'ok':
      if (growsCrops(b)) return `Growing ${CROPS[b.crop].name.toLowerCase()}`;
      if (b.type === 'garage') {
        const mine = s.trucks.filter((t) => t.garage === b.id), k = mine.filter((t) => t.phase === 'parked' || t.phase === 'charge').length;
        return `Charging ${k} of ${mine.length} truck${mine.length > 1 ? 's' : ''}`;
      }
      if (b.type === 'station') return 'Renewing the forecast every hour';
      if (b.type === 'pylon') {
        const net = must(networks(s).of.get(b.id), 'network'), k = net.pylons.length - 1, n = net.members.length;
        return `${k ? `Linked to ${k} other pylon${k > 1 ? 's' : ''}` : 'Linked to no other pylon'} · its network powers ${n} building${n === 1 ? '' : 's'}`;
      }
      if (b.type === 'coop' && coopPace(s, b.x, b.y) < 0.97) return henFact(s.scenario, warmthOf(s), coopShade(s, b.x, b.y), pushesAt(s.scenario, s.time).hens).text;
      return isMachine(b) ? 'Working' : def.name;
  }
}
