import { BUILDINGS, CROPS, DAY_SECONDS, HIVE, ITEMS, POWER, recipesFor, SAPLING_SECONDS, TREE_HEALTH, type BuildingId } from './data.ts';
import { networks, POWERED, pylonsInLink } from './power.ts';
import { HOUR_SECONDS } from './powerlog.ts';
import { exposureAt, hiveReaches, nearWaterAt, paceOf, pylonReaches, sprinklerWaters, waterPace } from './rules.ts';
import { hourAt, sunAt, windAt } from './sim/clock.ts';
import { linksAt } from './sim/goods.ts';
import { makes, shareOf } from './sim/energy.ts';
import { describeLinks } from './sim/describe.ts';
import { inMap, type Building, type FieldBuilding, type GameState } from './state.ts';

// Forecasts from what the game already knows: what a building in hand would do on a tile (facts about the tile, no advice),
// and how tonight's battery charge will go if power is used as it is now (the weather is seeded, so the game knows it).

/** A fact for the placement card: a label, a value (and what it becomes), and a few words under it. */
export interface Fact { label: string; value: string; then?: string; sub: string; tone?: 'bad' | 'good' }

export interface Placement {
  facts: Fact[];
  /** What it would take from and give to the buildings next door, a line each. */
  next: string[];
}

/** How far ahead, in seconds of play, the placement card shows a field's soil. */
export const SOIL_AHEAD = 600;

const fmt1 = (n: number) => (Math.abs(n) >= 10 ? String(Math.round(n)) : n.toFixed(1).replace(/\.0$/, ''));
const watts = (w: number) => `${fmt1(w)} W`;

/** The average fertility of an n × n footprint. */
function soilUnder(s: GameState, x: number, y: number, n: number) {
  let sum = 0, k = 0;
  for (let ty = y; ty < y + n; ty++) for (let tx = x; tx < x + n; tx++) if (inMap(s, tx, ty)) { sum += s.map.fertility[ty * s.map.width + tx]; k++; }
  return k ? sum / k : 0;
}

/** The sprinklers that would water a field at (x, y), and the most water any gives (the share of power it gets). */
function waterAt(s: GameState, x: number, y: number) {
  const sp = s.buildings.filter((b) => b.type === 'sprinkler' && sprinklerWaters(b.x, b.y, { type: 'field', x, y }));
  return { sprinklers: sp.length, water: sp.reduce((m, b) => Math.max(m, shareOf(s, b)), 0) };
}

/** Whether a pylon would reach a footprint at (x, y). */
const powered = (s: GameState, type: BuildingId, x: number, y: number) => s.buildings.some((p) => BUILDINGS[p.type].grid === 'link' && pylonReaches({ type, x, y }, p.x, p.y));

/** What a building of `type` placed with its north-west tile at (x, y) would do there. */
export function placement(s: GameState, type: BuildingId, x: number, y: number): Placement {
  const def = BUILDINGS[type], facts: Fact[] = [];
  const pylonFact = (): Fact => (powered(s, type, x, y) ? { label: 'Power', value: 'in reach', sub: 'of a pylon' } : { label: 'Power', value: 'none', sub: 'no pylon in reach', tone: 'bad' });
  switch (type) {
    case 'field': {
      const crop = CROPS.wheat, soil = soilUnder(s, x, y, 3), { sprinklers, water } = waterAt(s, x, y);
      const perMin = crop.yield * 60 * paceOf(water, soil).pace / crop.grow;
      // The harvests over the next SOIL_AHEAD seconds, each wearing the soil and slowing the next.
      let t = 0, later = soil;
      for (;;) { t += crop.grow / paceOf(water, later).pace; if (t > SOIL_AHEAD) break; later = Math.max(0, Math.min(100, later + crop.soil)); }
      facts.push({ label: crop.name, value: `+${fmt1(perMin)}`, sub: 'a minute' });
      facts.push({ label: 'Soil', value: String(Math.round(soil)), then: String(Math.round(later)), sub: `in ${SOIL_AHEAD / 60} min if harvests are carried off` });
      facts.push(sprinklers ? { label: 'Water', value: `${sprinklers} sprinkler${sprinklers > 1 ? 's' : ''}`, sub: `grows at ${Math.round(waterPace(water) * 100)}%` }
        : { label: 'Water', value: 'none', sub: `grows at ${Math.round(waterPace(0) * 100)}%`, tone: 'bad' });
      break;
    }
    case 'sprinkler': {
      const fields = s.buildings.filter((b) => b.type === 'field' && sprinklerWaters(x, y, b)), near = nearWaterAt(s, x, y);
      facts.push({ label: 'Waters', value: `${fields.length} field${fields.length === 1 ? '' : 's'}`, sub: `centres within ${POWER.sprinklerReach} tiles` });
      facts.push({ label: 'Uses', value: watts(near ? POWER.sprinklerNearWater : POWER.sprinklerFar), sub: near ? 'near water' : 'far from water' });
      facts.push(pylonFact());
      break;
    }
    case 'hive': {
      const near = s.buildings.filter((b): b is FieldBuilding => b.type === 'field' && hiveReaches(b, x, y));
      const flowers = Math.min(HIVE.maxFlowers, near.filter((f) => CROPS[f.crop].flowers).length);
      facts.push({ label: 'Honey', value: `+${fmt1(flowers * 60 / HIVE.honeySeconds)}`, sub: 'a minute', tone: flowers ? undefined : 'bad' });
      facts.push({ label: 'Flowers', value: `${flowers} field${flowers === 1 ? '' : 's'}`, sub: `flowering within ${HIVE.reach} tiles` });
      facts.push({ label: 'Pollinates', value: `${near.filter((f) => CROPS[f.crop].flowers).length}`, sub: 'flowering fields' });
      break;
    }
    case 'solar': {
      const sc = s.scenario;
      facts.push({ label: 'Now', value: watts(POWER.solar * sunAt(sc, s.time)), sub: 'in this sun' });
      facts.push({ label: 'Midday', value: watts(POWER.solar * sc.weather.sun), sub: `sun ${String(sc.weather.sunrise).padStart(2, '0')}:00–${sc.weather.sunset}:00` });
      facts.push(pylonFact());
      break;
    }
    case 'turbine': {
      const exp = exposureAt(s, x, y);
      facts.push({ label: 'Wind', value: `${Math.round(exp * 100)}%`, sub: 'reaches it here', tone: exp < 1 ? 'bad' : undefined });
      facts.push({ label: 'Now', value: watts(POWER.turbine * windAt(s.scenario, s.time) * exp), sub: 'in this wind' });
      facts.push(pylonFact());
      break;
    }
    case 'pylon': {
      const links = pylonsInLink(s, x, y).length;
      const reached = s.buildings.filter((b) => POWERED(b) && pylonReaches(b, x, y));
      const fresh = reached.filter((b) => !networks(s).of.get(b.id)).length;
      facts.push({ label: 'Links', value: `${links} pylon${links === 1 ? '' : 's'}`, sub: links ? `within ${POWER.pylon.link} tiles` : 'a new network' });
      facts.push({ label: 'Reaches', value: `${reached.length}`, sub: `building${reached.length === 1 ? '' : 's'}${fresh ? `, ${fresh} not yet powered` : ''}` });
      break;
    }
    case 'sapling':
      facts.push({ label: 'Grows', value: `${SAPLING_SECONDS} s`, sub: 'into a tree' });
      facts.push({ label: 'Soil health', value: `+${TREE_HEALTH.perTree}`, sub: `a tree, up to ${TREE_HEALTH.cap} in all` });
      break;
    default: {
      const r = recipesFor(type)[0];
      if (r && r.outputs.length) facts.push({ label: 'Full speed', value: fmt1(r.outputs[0].n * 60 / r.time), sub: `${ITEMS[r.outputs[0].item].name.toLowerCase()} a minute` });
      if (type === 'digester') facts.push({ label: 'Makes', value: watts(POWER.digester), sub: 'while burning' });
      if (type === 'battery') facts.push({ label: 'Stores', value: `${POWER.battery.capacity} J`, sub: `${POWER.battery.rate} W in and out` });
      if (def.power || POWERED({ type } as Building)) facts.push(pylonFact());
    }
  }
  return { facts, next: describeLinks(linksAt(s, type, x, y)) };
}

// ---- Tonight ----

/** The play time at which the hour of day next reaches `hour` (strictly after `time`). */
export function nextHour(time: number, hour: number) {
  const ahead = (((hour - hourAt(time)) % 24) + 24) % 24;
  return time + (ahead > 1e-9 ? ahead : 24) * HOUR_SECONDS;
}

export interface Tonight {
  /** The batteries' charge, as a share of what they hold, from now to an hour after sunrise. */
  points: { t: number; k: number }[];
  /** When the coming night starts (null: it is night now) and ends. */
  sunset: number | null;
  sunrise: number;
  /** When all the batteries run dry (null: they last the night), and from then until sunrise: the average shortfall and the
   * time short. */
  dryAt: number | null;
  shortAfter: number;
  shortFor: number;
  /** The highest charge before the night, and when. */
  peak: { t: number; k: number };
}

/**
 * How the batteries' charge will go until the morning, if every network keeps using what it uses now (and digesters burning
 * now keep burning): the sun and wind follow the commission's seeded weather. Null without batteries.
 */
export function tonight(s: GameState): Tonight | null {
  const sc = s.scenario, w = sc.weather, now = s.time, h = hourAt(now);
  const night = h <= w.sunrise || h >= w.sunset;
  const sunset = night ? null : nextHour(now, w.sunset);
  const sunrise = nextHour(sunset ?? now, w.sunrise), end = sunrise + HOUR_SECONDS;
  const nets = networks(s).list.map((net) => {
    const bats = net.members.filter((b) => b.type === 'battery').map((b) => b.charge);
    return { net, bats, solar: net.members.filter((b) => b.type === 'solar').length, turbines: net.members.filter((b) => b.type === 'turbine'),
      digesters: net.members.filter((b) => b.type === 'digester').reduce((n, b) => n + makes(s, b, 0, 0), 0) };
  });
  const capacity = nets.reduce((n, x) => n + x.bats.length, 0) * POWER.battery.capacity;
  if (!capacity) return null;
  const step = HOUR_SECONDS / 6, points: { t: number; k: number }[] = [];
  let dryAt: number | null = null, shortSum = 0, shortFor = 0;
  const stored = () => nets.reduce((n, x) => n + x.bats.reduce((a, b) => a + b, 0), 0);
  let peak = { t: now, k: stored() / capacity };
  points.push({ t: now, k: peak.k });
  for (let t = now; t < end - 1e-6; t += step) {
    const sun = sunAt(sc, t + step / 2), wind = windAt(sc, t + step / 2);
    let short = 0;
    for (const x of nets) {
      const made = POWER.solar * sun * x.solar + x.turbines.reduce((n, b) => n + makes(s, b, 0, wind), 0) + x.digesters;
      let spare = (made - x.net.wanted) * step;
      for (let i = 0; i < x.bats.length; i++) {
        const move = spare > 0 ? Math.min(spare, POWER.battery.rate * step, POWER.battery.capacity - x.bats[i]) : Math.max(spare, -POWER.battery.rate * step, -x.bats[i]);
        x.bats[i] += move; spare -= move;
      }
      if (spare < -1e-6) short += -spare / step;
    }
    // Dry once every battery is spent (one network's going first still leaves the rest holding) and something goes short.
    const k = stored() / capacity;
    if (dryAt === null && k < 1e-6 && short > 1e-6) dryAt = t + step;
    points.push({ t: t + step, k });
    if ((sunset === null || t + step <= sunset) && k > peak.k) peak = { t: t + step, k };
    if (dryAt !== null && t + step <= sunrise && short > 1e-6) { shortSum += short * step; shortFor += step; }
  }
  return { points, sunset, sunrise, dryAt, shortAfter: shortFor ? shortSum / shortFor : 0, shortFor, peak };
}

/** Seconds of play to in-game hours and minutes, for a span ("3 h 20"). */
export const gameSpan = (seconds: number) => {
  const m = Math.round(seconds / DAY_SECONDS * 24 * 60);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
};
