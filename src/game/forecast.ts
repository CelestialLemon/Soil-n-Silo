import { BUILDINGS, CROPS, DAY_SECONDS, FIELD, GREENHOUSE, HIVE, ITEMS, POLLINATION_BONUS, POWER, recipesFor, SAPLING_SECONDS, TREE_HEALTH, type BuildingId, type CropDef } from './data.ts';
import { allowed, endOf, EVENT_KINDS, EVENTS, type EventKind } from './events.ts';
import { networks, POWERED, pylonsInLink } from './power.ts';
import { HOUR_SECONDS } from './powerlog.ts';
import { coopPace, coopTrees, erosionAt, guardedAt, hiveReaches, paceOf, pylonReaches, riverSeason, sprinklerWaters, sprinklerWatts, touchesWater, waterLevelNear, waterPace, wheelSite, windExposure } from './rules.ts';
import { earthPrice, groundworkFor, levelledFor } from './build.ts';
import { hourAt, sunAt, windAt } from './sim/clock.ts';
import { raining } from './sim/weather.ts';
import { panelShare, panelSnow } from './snow.ts';
import { linksAt } from './sim/goods.ts';
import { makes, sharesIfRunning, shareOf, wants } from './sim/energy.ts';
import { basisFor, eventsVary, notCounted, readingOf, spread, viewsOf, type Ahead, type Lenses, type Reading } from './ahead.ts';
import type { Range } from './outlook.ts';
import { rainWaters, watersGreenhouse, wattsOf } from './sim/layout.ts';
import { describeLinks } from './sim/describe.ts';
import { canFlood, floodHolds, floodsAt, isFlooded } from './flood.ts';
import { dustComes, dustFor } from './dust.ts';
import { frostComes, frostHits, inHollow } from './frost.ts';
import { centreLevel } from './relief.ts';
import { beesFly, beesNow, heatNeed, insideWarmth, shadeFact, warmthFact, warmthOf } from './warmth.ts';
import { canGale, keepingBeesIn, SEVERE_GALE, standsGale, turbineShare } from './wind.ts';
import { hasStation } from './station.ts';
import { foragesOn } from './forage.ts';
import { growsCrops, inMap, type Building, type FieldBuilding, type GameState, type Setting } from './state.ts';

// Forecasts from what the game already knows: what a building in hand would do on a tile (facts about the tile, no advice),
// and how tonight's battery charge will go if power is used as it is now (the weather is seeded, so the game knows it).

/** A fact for the placement card: a label, a value (and what it becomes), and a few words under it. */
export interface Fact { label: string; value: string; then?: string; sub: string; tone?: 'bad' | 'good' }

export interface Placement {
  facts: Fact[];
  /** What it would take from and give to the buildings next door, a line each. */
  next: string[];
}

/** What a field's soil is run over in the forecast's ranges (ahead.ts, `Lenses`): the rain's share of each hour at its lowest and highest; the warmth is taken hour by hour (below). */
export const SOIL_LENSES = { ends: ['rain'] } satisfies Lenses;

/** The events whose timing a field's soil is not monotone in: a dust storm takes soil and so can suppress a harvest, a late frost starts the crop again. */
const SOIL_EVENTS: readonly EventKind[] = ['dustStorm', 'lateFrost'];

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

/** The sprinklers that would water a field at (x, y), and the most water any gives (the share of power it gets); rain waters every field. */
function waterAt(s: GameState, type: 'field' | 'greenhouse', x: number, y: number) {
  const sp = s.buildings.filter((b) => b.type === 'sprinkler' && !isFlooded(s, b) && sprinklerWaters(b.x, b.y, { type, x, y }));
  // A greenhouse in the rain wakes the sprinklers that rest in it: they get the share they would have with all of them running.
  const resting = type === 'greenhouse' ? sp.filter((b) => rainWaters(s, b)) : [], waking = resting.length ? sharesIfRunning(s, sp, resting) : new Map<number, number>();
  const shore = touchesWater(s, x, y), share = sp.reduce((m, b) => Math.max(m, waking.get(b.id) ?? shareOf(s, b)), 0), rains = type === 'field' && raining(s.scenario, s.time);
  // Rain waters every field while it lasts; a sprinkler gives its share of power as it is now.
  return { sprinklers: sp.length, shore, rain: !shore && rains, water: shore || rains ? 1 : share, share };
}

/** Whether a pylon (one not under flood water) would reach a footprint at (x, y). */
const powered = (s: GameState, type: BuildingId, x: number, y: number) => s.buildings.some((p) => BUILDINGS[p.type].grid === 'link' && !isFlooded(s, p) && pylonReaches({ type, x, y }, p.x, p.y));

/** What a building of `type` placed with its north-west tile at (x, y) would do there. */
export function placement(s: GameState, type: BuildingId, x: number, y: number, set: Setting = {}, reading: Reading = readingOf(s)): Placement {
  const def = BUILDINGS[type], facts: Fact[] = [];
  const pylonFact = (): Fact => (powered(s, type, x, y) ? { label: 'Power', value: 'in reach', sub: 'of a pylon' } : { label: 'Power', value: 'none', sub: 'no pylon in reach', tone: 'bad' });
  const gw = groundworkFor(s, type, x, y), here = inMap(s, x, y) ? centreLevel(s.map, x, y) : 0;
  if (gw.ok && gw.value.level !== null) facts.push({ label: 'Earthworks', value: String(earthPrice(s, gw.value.move.steps)), sub: `levels the ground to level ${gw.value.level} (${gw.value.move.steps} steps)`, tone: 'bad' });
  // What it would do on the ground as it will be: levelled first, if placing it levels it.
  const there = (): Placement => {
    switch (type) {
      case 'field': case 'greenhouse': {
        // A greenhouse grows in its own warmth, and neither rain, frost nor dust reach it.
        const under = type === 'greenhouse', crop = CROPS[set.crop ?? 'wheat'], soil = soilUnder(s, x, y, 3), { sprinklers, shore, rain, water, share } = waterAt(s, type, x, y);
        const warmthIn = (w: number) => (under ? insideWarmth(crop, w) : w);
        // A hive within reach of a flowering crop adds a good to every harvest.
        // Too cold outside, the bees forage only in a greenhouse that will be working: powered, if its crop needs heat.
        const forages = !keepingBeesIn(s.scenario, s.time) && (beesFly(warmthOf(s)) || (under && (heatNeed(crop, warmthOf(s)) === 0 || powered(s, type, x, y))));
        const pollinated = crop.flowers && forages && s.buildings.some((b) => b.type === 'hive' && !isFlooded(s, b) && hiveReaches({ type, x, y }, b.x, b.y));
        // Nothing, while a late frost that lies there takes it.
        const perMin = !under && frostHits(s, set.crop ?? 'wheat', x, y) ? 0 : (crop.yield + (pollinated ? POLLINATION_BONUS : 0)) * 60 * paceOf(water, soil, crop, warmthIn(warmthOf(s))).pace / crop.grow;
        // Sloping tiles under it wear faster (erosion).
        const guarded = guardedAt(s, x, y), blown = !under && !guarded;
        let slopes = 0, wear = 0;
        for (let ty = y; ty < y + 3; ty++) for (let tx = x; tx < x + 3; tx++) {
          const k = inMap(s, tx, ty) ? erosionAt(s, tx, ty, guarded) : 1;
          wear += k / 9; if (k > 1) slopes++;
        }
        // Growth over the next SOIL_AHEAD seconds an hour of play at a time, with the warmth and rain of each hour; each harvest wears the soil and slows the next.
        // The weather ahead is read as `reading` says (ahead.ts): one run, or one for each way the forecast allows (the soil is then a range).
        const HOUR = DAY_SECONDS / 24;
        // A forecast's world is run twice, the slowest the weather allows (the least rain, the hour's slowest pace over the warmths a block allows) and the fastest
        // (the most rain, the fastest pace). The pace also rises with the soil, and a harvest wears it (or builds it), so a run that harvests sooner has a different
        // soil later: the slowest run's pace is taken at the least soil any run can have, the fastest at the most (worn only by the harvests the slow run makes,
        // built only by the fast run's), and the two are stepped together. Without a forecast the one run is the weather as it is.
        const run = (views: Ahead[]): { later: number }[] => {
          const delta = crop.soil * (crop.soil < 0 ? wear : 1), clampSoil = (v: number) => Math.max(0, Math.min(100, v)), bounded = views.length > 1;
          // `soils` are what each run ends with; `least` and `most` the soil any run can have.
          const soils = views.map(() => soil), growth = views.map(() => 0);
          let least = soil, most = soil;
          for (let t = 0; t < SOIL_AHEAD; t += HOUR) {
            // (Every run's pace is worked out from the soil at the start of the hour, before any run harvests in it.)
            const grew = views.map((view, k) => {
              // A dust storm blowing over an unguarded field takes its soil (the hour's wind, at the hour's middle).
              const dust = !blown ? 0 : (dustFor(view, s.time + t + HOUR / 2)?.rate ?? 0) * Math.min(1, (SOIL_AHEAD - t) / HOUR);
              soils[k] = Math.max(0, soils[k] - dust);
              if (k === 0) { least = Math.max(0, least - dust); most = Math.max(0, most - dust); }
              // A late frost on the field takes what has grown (the field starts again) and nothing grows while it bites.
              if (!under && frostHits(s, set.crop ?? 'wheat', x, y, s.time + t, view)) { growth[k] = 0; return 0; }
              const rain = shore ? 1 : under ? 0 : view.hourRain(s.time + t), wet = rain + (1 - rain) * share;
              const paces = view.warmths(s.time + t).map((w) => paceOf(wet, bounded ? (k ? most : least) : soils[0], crop, warmthIn(w)).pace);
              return Math.min(HOUR, SOIL_AHEAD - t) * (k ? Math.max(...paces) : Math.min(...paces)) / crop.grow;
            });
            grew.forEach((by, k) => {
              growth[k] += by;
              while (growth[k] >= 1) {
                growth[k] -= 1; soils[k] = clampSoil(soils[k] + delta);
                // The slow run's harvest wears the most soil there is (or builds the least); the fast run's, the least (or the most).
                if ((delta < 0) === (k === 0)) most = clampSoil(most + delta); else least = clampSoil(least + delta);
              }
            });
          }
          return soils.map((later) => ({ later }));
        };
        // (The views of a world come together: the least rain, then the most.)
        const views = viewsOf(s, reading, SOIL_LENSES, s.time + SOIL_AHEAD), runs = reading.kind === 'forecast' ? views.flatMap((_, n) => (n % 2 ? [] : run([views[n], views[n + 1]]))) : views.flatMap((v) => run([v]));
        // Where the runs differ (the forecast leaves room) the soil is the lowest and highest of them, rounded outward so the soil in whole numbers is inside.
        // (Each run takes the hour's slowest or fastest pace, so the runs bracket the harvests the weather allows. Where the forecast leaves room in when a
        // dust storm or a late frost begins or ends, soil is not monotone in it: a dust storm that lasts a little longer can suppress a harvest, and the worlds are only
        // sampled. A harvest more or less than the runs reach is then allowed: soil moves a step with each one.)
        const base = spread(runs.map((r) => r.later)), many = base.hi - base.lo > 1e-9, step = !under && eventsVary(s, reading, s.time + SOIL_AHEAD, SOIL_EVENTS) ? Math.abs(crop.soil * (crop.soil < 0 ? wear : 1)) : 0;
        const then = many || step > 0 ? { lo: Math.max(0, Math.floor(base.lo - step)), hi: Math.min(100, Math.ceil(base.hi + step)) } : { lo: Math.round(base.lo), hi: Math.round(base.lo) };
        facts.push({ label: crop.name, value: `+${fmt1(perMin)}`, sub: 'a minute, at this warmth' });
        const skipped = notCounted(s.scenario, reading, s.time, s.time + SOIL_AHEAD);
        facts.push({ label: 'Soil', value: String(Math.round(soil)), then: then.lo === then.hi ? String(then.lo) : `${then.lo}–${then.hi}`, sub: `in ${SOIL_AHEAD / 60} min if harvests are carried off${reading.kind === 'truth' ? '' : `, ${basisFor(reading, s.scenario.climate, s.time, s.time + SOIL_AHEAD).replace(/^for /, 'in ')}`}${skipped ? `; ${skipped}` : ''}` });
        facts.push(shore ? { label: 'Water', value: 'beside water', sub: 'grows at 100%' } : rain ? { label: 'Water', value: 'rain', sub: 'grows at 100% while it rains', tone: 'good' } : sprinklers ? { label: 'Water', value: `${sprinklers} sprinkler${sprinklers > 1 ? 's' : ''}`, sub: `grows at ${Math.round(waterPace(water, crop.thirst, warmthIn(warmthOf(s))) * 100)}%` }
          : { label: 'Water', value: 'none', sub: `grows at ${Math.round(waterPace(0, crop.thirst, warmthIn(warmthOf(s))) * 100)}%`, tone: 'bad' });
        const warm = warmthFact(crop, warmthIn(warmthOf(s)));
        facts.push(under ? { label: 'Warmth', value: `${Math.round(warmthIn(warmthOf(s)))}°C inside`, sub: `outside ${Math.round(warmthOf(s))}°C; heating ${Math.round(heatNeed(crop, warmthOf(s)))} W now, ${GREENHOUSE.loss} W for each °C the outside is below ${crop.comfort.low}°C`, tone: 'good' }
          : { label: 'Warmth', value: `${Math.round(warmthOf(s))}°C`, sub: warm.text.slice(warm.text.indexOf(': ') + 2), tone: warm.tone === 'bad' ? 'bad' : undefined });
        if (!under && frostComes(s) && inHollow(s, x, y)) facts.push({ label: 'Frost hollow', value: 'yes', sub: crop.tender ? 'late frost settles here and takes a tender crop' : 'late frost settles here; a hardy crop is unharmed', tone: crop.tender ? 'bad' : undefined });
        if (!under && dustComes(s)) facts.push({ label: 'Dust storm', value: guarded ? 'guarded' : 'exposed', sub: guarded ? 'trees or beans beside it break the wind' : 'a dust storm lifts its soil; a tree, sapling or bean field beside it would guard it', tone: guarded ? 'good' : 'bad' });
        if (under) {
          facts.push(pylonFact());
          const h = heatingAhead(s, crop, reading);
          if (h) facts.push({ label: 'Heating', value: `up to ${watts(h.tonight)} tonight`, sub: `${h.average.lo === h.average.hi ? watts(h.average.lo) : `${fmt1(h.average.lo)}–${watts(h.average.hi)}`} on average over a day, ${basisFor(reading, s.scenario.climate, s.time, s.time + DAY_SECONDS).replace(/^for /, 'in ')}; ${h.snap ? 'the cold snap it tells is counted' : canSnap(s) ? 'a cold snap told in the forecast would raise it' : 'a colder night raises it'}`, tone: h.tonight > 0 ? undefined : 'good' });
        }
        if (slopes) facts.push({ label: 'Slope', value: `${slopes} of 9 tiles`, sub: `wear up to ${fmt1(1 + (guarded ? FIELD.erosionGuarded : FIELD.erosion))}× as fast${guarded ? '; trees or beans beside it help' : ''}`, tone: guarded ? undefined : 'bad' });
        break;
      }
      case 'sprinkler': {
        const fields = s.buildings.filter((b) => growsCrops(b) && sprinklerWaters(x, y, b)), water = inMap(s, x, y) ? waterLevelNear(s, x, y) : null;
        const lift = water === null ? here : Math.max(0, here - water);
        facts.push({ label: 'Waters', value: `${fields.length} field${fields.length === 1 ? '' : 's'}`, sub: `centres within ${POWER.sprinklerReach} tiles` });
        facts.push({ label: 'Uses', value: inMap(s, x, y) ? watts(sprinklerWatts(s, x, y)) : '–', sub: `${water === null ? 'far from water' : 'near water'}${lift ? `, lifting it ${fmt1(lift)} level${lift === 1 ? '' : 's'}` : ''}` });
        facts.push(pylonFact());
        break;
      }
      case 'hive': {
        const near = s.buildings.filter((b): b is FieldBuilding => growsCrops(b) && !isFlooded(s, b) && hiveReaches(b, x, y));
        const flowering = near.filter((f) => CROPS[f.crop].flowers), forage = flowering.filter((f) => foragesOn(s, f));
        const flowers = Math.min(HIVE.maxFlowers, flowering.length), foraged = Math.min(HIVE.maxFlowers, forage.length);
        // Too cold outside, the bees forage only in a working greenhouse with a flowering crop.
        const glass = !beesFly(warmthOf(s)) && forage.length > 0;
        facts.push({ label: 'Honey', value: `+${fmt1(foraged * 60 / HIVE.honeySeconds)}`, sub: 'a minute', tone: foraged ? undefined : 'bad' });
        facts.push({ label: 'Flowers', value: `${flowers} field${flowers === 1 ? '' : 's'}`, sub: `flowering within ${HIVE.reach} tiles` });
        const bees = beesNow(s);
        facts.push(glass ? { label: 'Bees', value: 'in the greenhouse', sub: 'foraging there: too cold outside' } : { label: 'Bees', value: bees.text.includes('staying') ? 'staying in' : 'flying', sub: `${Math.round(warmthOf(s))}°C`, tone: bees.tone === 'bad' ? 'bad' : undefined });
        facts.push({ label: 'Pollinates', value: `${forage.length}`, sub: 'flowering fields' });
        break;
      }
      case 'solar': {
        const sc = s.scenario;
        facts.push({ label: 'Now', value: watts(POWER.solar * sunAt(sc, s.time) * panelShare(sc, s.time)), sub: panelSnow(sc, s.time) ? 'in this sun, snow on the panels' : 'in this sun' });
        facts.push({ label: 'Midday', value: watts(POWER.solar * sc.climate.sun.strength), sub: `sun ${String(sc.climate.sun.rise).padStart(2, '0')}:00–${sc.climate.sun.set}:00` });
        facts.push(pylonFact());
        break;
      }
      case 'turbine': {
        const w = inMap(s, x, y) ? windExposure(s, x, y) : { shelter: 1, height: 1, exposure: 1 }, exp = w.exposure;
        facts.push({ label: 'Wind', value: `${Math.round(exp * 100)}%`, sub: w.height > 1 ? `reaches it here, ${Math.round((w.height - 1) * 100)}% more up high` : 'reaches it here', tone: w.shelter < 1 ? 'bad' : w.height > 1 ? 'good' : undefined });
        facts.push({ label: 'Now', value: watts(POWER.turbine * windAt(s.scenario, s.time) * exp * turbineShare(s, 0, exp)), sub: 'in this wind' });
        if (s.scenario.sandbox || canGale(s.scenario.climate)) {
          const stands = standsGale(SEVERE_GALE, exp);
          facts.push({ label: 'Severe gale', value: stands ? 'keeps turning' : 'stops', sub: stands ? 'sheltered enough to ride it out, at reduced output' : 'too exposed: only trees, tall buildings or higher ground beside it would keep it turning', tone: stands ? 'good' : 'bad' });
        }
        facts.push(pylonFact());
        break;
      }
      case 'pylon': {
        const links = pylonsInLink(s, x, y).length;
        const reached = s.buildings.filter((b) => POWERED(b) && !isFlooded(s, b) && pylonReaches(b, x, y));
        const fresh = reached.filter((b) => !networks(s).of.get(b.id)).length;
        facts.push({ label: 'Links', value: `${links} pylon${links === 1 ? '' : 's'}`, sub: links ? `within ${POWER.pylon.link} tiles` : 'a new network' });
        facts.push({ label: 'Reaches', value: `${reached.length}`, sub: `building${reached.length === 1 ? '' : 's'}${fresh ? `, ${fresh} not yet powered` : ''}` });
        break;
      }
      case 'wheel': {
        const site = inMap(s, x, y) ? wheelSite(s, x, y) : null;
        if (site) {
          facts.push({ label: 'Makes', value: watts(site.watts), sub: 'day and night' });
          facts.push({ label: 'Current', value: `${site.current.toFixed(1)} m/s`, sub: site.fall ? 'beside a fall' : 'no fall beside it', tone: site.fall ? 'good' : undefined });
          if (s.scenario.climate.season === 'winter') facts.push({ label: 'Cold snap', value: site.runs ? 'turns on' : 'freezes', sub: site.runs ? 'a fall keeps the water running' : 'quiet water freezes over and stops it', tone: site.runs ? 'good' : 'bad' });
          facts.push({ label: 'Season', value: `×${site.flow.toFixed(1)}`, sub: riverSeason(site.flow), tone: site.flow >= 1.2 ? 'good' : site.flow <= 0.7 ? 'bad' : undefined });
        } else facts.push({ label: 'River', value: 'none', sub: 'it needs a river at its bank', tone: 'bad' });
        facts.push(pylonFact());
        break;
      }
      case 'station':
        facts.push({ label: 'Forecast', value: 'three days', sub: 'ahead, renewed every hour while it has power' });
        if (hasStation(s)) facts.push({ label: 'Station', value: 'already one', sub: 'The valley already has a station: a second adds nothing' });
        facts.push(pylonFact());
        break;
      case 'sapling':
        facts.push({ label: 'Grows', value: `${SAPLING_SECONDS} s`, sub: 'into a tree' });
        facts.push({ label: 'Soil health', value: `+${TREE_HEALTH.perTree}`, sub: `a tree, up to ${TREE_HEALTH.cap} in all` });
        break;
      default: {
        const r = recipesFor(type).find((x) => x.id === set.recipe) ?? recipesFor(type)[0];
        if (r && r.outputs.length) facts.push({ label: 'Full speed', value: fmt1(r.outputs[0].n * 60 / r.time), sub: `${ITEMS[r.outputs[0].item].name.toLowerCase()} a minute` });
        if (type === 'coop') {
          const pace = coopPace(s, x, y), trees = coopTrees(s, x, y);
          facts.push({ label: 'Hens', value: `${Math.round(pace * 100)}%`, sub: `laying speed at ${Math.round(warmthOf(s))}°C`, tone: pace < 0.6 ? 'bad' : undefined });
          facts.push({ label: 'Shade', value: `${trees} tree${trees === 1 ? '' : 's'}`, sub: shadeFact(trees), tone: trees ? 'good' : undefined });
        }
        if (type === 'digester') facts.push({ label: 'Makes', value: watts(POWER.digester), sub: 'while burning' });
        if (type === 'battery') facts.push({ label: 'Stores', value: `${POWER.battery.capacity} J`, sub: `${POWER.battery.rate} W in and out` });
        if (def.power || POWERED({ type } as Building)) facts.push(pylonFact());
      }
    }
    // Low ground beside the water floods: which flood reaches it (only where the season or the sandbox can bring one).
    const flood = (s.scenario.sandbox || canFlood(s.scenario.climate)) && inMap(s, x, y) ? floodsAt(s, { type, x, y }) : null;
    if (flood !== null) {
      const ordinary = flood <= (EVENTS.flood.flood?.ordinary ?? 0);
      facts.push({ label: 'Floods', value: `level ${flood}`, sub: ordinary ? 'an ordinary flood reaches it; a bank would keep it out' : 'only a severe flood reaches it', tone: 'bad' });
    }
    return { facts, next: describeLinks(linksAt(s, type, x, y, set)) };
  };
  return levelledFor(s, gw.ok ? gw.value.move : null, there);
}

// ---- Heating ----

/** What the heating of a greenhouse is run over in the forecast's ranges: the warmth, from its cold end (with the wettest showers) to its mild end. */
const HEAT_LENSES = { together: ['warmth'] } satisfies Lenses;

const canSnap = (s: GameState) => allowed('coldSnap', s.scenario.climate);

/**
 * What a greenhouse growing `crop` would draw, from the warmth ahead as `reading` says: the most in tonight's cold end (the night now, or the coming one) and the
 * average over the next day (a range with a forecast: from its cold end to its mild end); `snap` when a cold snap that the forecast tells is in what it counts.
 * Null where the weather doesn't make it draw.
 */
export function heatingAhead(s: GameState, crop: CropDef, reading: Reading): { tonight: number; average: Range; snap: boolean } | null {
  const w = s.scenario.climate.sun, now = s.time, h = hourAt(now), night = h < w.rise || h >= w.set;
  const from = night ? now : nextHour(now, w.set), sunrise = nextHour(from, w.rise), end = now + DAY_SECONDS, step = HOUR_SECONDS / 6;
  const views = viewsOf(s, reading, HEAT_LENSES, Math.max(sunrise + HOUR_SECONDS, end));
  let most = 0;
  const averages = views.map((v) => {
    let sum = 0;
    for (let t = now; t < end - 1e-6; t += step) sum += heatNeed(crop, v.warmth(t + Math.min(step, end - t) / 2));
    // The night's own steps, the last cut short at sunrise (a card made in the last minutes of the night still sees them).
    for (let t = from; t < sunrise - 1e-6; t += step) most = Math.max(most, heatNeed(crop, v.warmth(t + Math.min(step, sunrise - t) / 2)));
    return sum / Math.ceil((end - now) / step);
  });
  const snap = reading.kind === 'forecast' && views.some((v) => v.events.some((e) => e.kind === 'coldSnap' && e.start < end && endOf(e) > now));
  return most > 0 || Math.max(...averages) > 0 ? { tonight: most, average: spread(averages), snap } : null;
}

// ---- Tonight ----

/** The play time at which the hour of day next reaches `hour` (strictly after `time`). */
export function nextHour(time: number, hour: number) {
  const ahead = (((hour - hourAt(time)) % 24) + 24) % 24;
  return time + (ahead > 1e-9 ? ahead : 24) * HOUR_SECONDS;
}

export interface Tonight {
  /**
   * The batteries' charge, as a share of what they hold, from now to an hour after sunrise: `k` in the hardest night the weather
   * allowed (the one run that ends lowest; the only run unless the forecast leaves room), `lo` and `hi` the lowest and highest
   * over all the runs.
   */
  points: { t: number; k: number; lo: number; hi: number }[];
  /** When the coming night starts (null: it is night now) and ends. */
  sunset: number | null;
  sunrise: number;
  /** When all the batteries run dry (null: they last the night), and from then until sunrise: the average shortfall and the
   * time short. Of the hardest night. */
  dryAt: number | null;
  shortAfter: number;
  shortFor: number;
  /** The highest charge before the night, and when. */
  peak: { t: number; k: number };
  /**
   * What the greenhouses draw through the night, at the cold end of what the weather allows (null: no greenhouse on a network with batteries): the most in a step and the average,
   * and whether they are why the batteries run dry (without their heating the same night holds).
   */
  heating: { most: number; average: number; why: boolean } | null;
  /** Over all the runs: when they run dry (the earliest, and the latest: sunrise where some runs last the night; null when none does), whether every run does, the shortfall after that and the time short. */
  dry: { from: number; to: number; always: boolean; after: Range; short: Range } | null;
  /** How the weather ahead was read, in words ("for a usual winter", "from the forecast"), and how many runs the range is over (1: one value). */
  basis: string;
  /** What the range does not count (an event the forecast only calls possible), or "". */
  notCounted: string;
  reading: Reading['kind'];
  runs: number;
}

/**
 * What tonight is run over in the forecast's ranges (ahead.ts, `Lenses`): the sun, the wind and the rain that rests the sprinklers, all
 * at their lowest and all at their highest, and the warmth (the greenhouses' heating): the cold end with the wettest showers, and the mild end.
 * The charge only rises with each, so those two runs bracket every other.
 */
export const NIGHT_LENSES = { together: ['sun', 'wind', 'rain', 'warmth'], fine: true } satisfies Lenses;

/**
 * What the band is widened by, as a share of the capacity, where the forecast leaves room in when an event begins or ends: the worlds stand the event at every
 * half hour inside its windows, and the worst night can lie between two (a sweep and a review found misses of at most 0.23% with hourly points, 0.13% with half hours).
 * The allowance is there while the worlds differ and goes when they do not (the event is over), so a band still lies inside the one before.
 */
export const TIMING_SLACK = 0.005;

const lowered = (r: Range, some: boolean): Range => (some ? { lo: 0, hi: r.hi } : r);

/** One run of the night: the charge at each step, and how it went dry. */
interface Night { k: number[]; dryAt: number | null; shortSum: number; shortFor: number; shortMost: number; peak: { t: number; k: number }; heat: { most: number; sum: number } }

/**
 * How the batteries' charge will go until the morning, if every network keeps using what it uses now (and digesters burning
 * now keep burning). The weather ahead is read as `reading` says (ahead.ts) (ahead.ts): by default as the player knows it: the usual
 * weather of the season without a station, the forecast's ranges with one. Null without batteries.
 */
export function tonight(s: GameState, reading: Reading = readingOf(s)): Tonight | null {
  const w = s.scenario.climate.sun, now = s.time, h = hourAt(now);
  const night = h < w.rise || h >= w.set;
  const sunset = night ? null : nextHour(now, w.set);
  const sunrise = nextHour(sunset ?? now, w.rise), end = sunrise + HOUR_SECONDS;
  const nets = networks(s).list.map((net) => {
    const bats = net.members.filter((b) => b.type === 'battery').map((b) => b.charge);
    // What the sprinklers want when they run (they rest in rain, except those that water a greenhouse) and what everything else wants now.
    const sprinklers = net.members.filter((b) => b.type === 'sprinkler' && !watersGreenhouse(s, b)).reduce((n, b) => n + wattsOf(s, b), 0);
    const indoor = net.members.filter((b) => b.type === 'sprinkler' && watersGreenhouse(s, b)).reduce((n, b) => n + wattsOf(s, b), 0);
    // A greenhouse draws by the warmth outside, hour by hour (a flooded one is stopped: as it is now), so it is read through the view with the sun and the wind.
    const crops = net.members.filter((b) => b.type === 'greenhouse' && !floodHolds(s, b)).map((b) => CROPS[(b as FieldBuilding).crop]);
    return { bats, sprinklers, crops, other: indoor + net.members.reduce((n, b) => n + (b.type === 'sprinkler' || b.type === 'greenhouse' ? 0 : wants(s, b)), 0), solar: net.members.filter((b) => b.type === 'solar').length, turbines: net.members.filter((b) => b.type === 'turbine'),
      digesters: net.members.filter((b) => b.type === 'digester').reduce((n, b) => n + makes(s, b, 0, 0), 0), wheels: net.members.filter((b) => b.type === 'wheel') };
  });
  const capacity = nets.reduce((n, x) => n + x.bats.length, 0) * POWER.battery.capacity;
  if (!capacity) return null;
  // The steps, the same in every run.
  const step = HOUR_SECONDS / 6, nightFrom = sunset ?? now; // only the coming night counts as a failure; before it the batteries just fill or drain
  const steps: { t: number; dt: number }[] = [];
  for (let t = now, dt: number; t < end - 1e-6; t += dt) {
    // Cut a step short where it would cross sunset or sunrise, so each one is wholly in the night or wholly out.
    dt = Math.min(step, end - t, ...[nightFrom, sunrise].filter((b) => b > t + 1e-6).map((b) => b - t));
    steps.push({ t, dt });
  }
  const run = (view: Ahead, heated = true): Night => {
    const bats = nets.map((x) => [...x.bats]);
    const stored = () => bats.reduce((n, b) => n + b.reduce((a, c) => a + c, 0), 0);
    let dryAt: number | null = null, shortSum = 0, shortFor = 0, shortMost = 0, peak = { t: now, k: stored() / capacity }, heatMost = 0, heatSum = 0;
    const k = [peak.k];
    for (const { t, dt } of steps) {
      const mid = t + dt / 2, sun = view.sun(mid), wind = view.wind(mid), rain = view.rain(mid);
      let short = 0, heat = 0;
      nets.forEach((x, n) => {
        const made = POWER.solar * sun * panelShare(view, mid) * x.solar + x.turbines.reduce((a, b) => a + makes(s, b, 0, wind, mid, view), 0) + x.digesters
          + x.wheels.reduce((a, b) => a + makes(s, b, 0, 0, mid, view), 0); // the river may freeze or thaw before morning
        const warming = heated ? x.crops.reduce((a, c) => a + heatNeed(c, view.warmth(mid)), 0) : 0;
        heat += warming;
        let spare = (made - x.other - warming - (1 - rain) * x.sprinklers) * dt;
        for (let i = 0; i < bats[n].length; i++) {
          const move = spare > 0 ? Math.min(spare, POWER.battery.rate * dt, POWER.battery.capacity - bats[n][i]) : Math.max(spare, -POWER.battery.rate * dt, -bats[n][i]);
          bats[n][i] += move; spare -= move;
        }
        if (spare < -1e-6) short += -spare / dt;
      });
      // Dry once every battery is spent (one network's going first still leaves the rest holding) and something goes short.
      const level = stored() / capacity;
      const inNight = t >= nightFrom - 1e-6 && t + dt <= sunrise + 1e-6;
      if (inNight && dryAt === null && level < 1e-6 && short > 1e-6) dryAt = t + dt;
      k.push(level);
      if (t >= nightFrom - 1e-6 && t + dt <= sunrise + 1e-6) { heatMost = Math.max(heatMost, heat); heatSum += heat * dt; }
      if ((sunset === null || t + dt <= sunset) && level > peak.k) peak = { t: t + dt, k: level };
      if (inNight && dryAt !== null && short > 1e-6) { shortSum += short * dt; shortFor += dt; shortMost = Math.max(shortMost, short); }
    }
    return { k, dryAt, shortSum, shortFor, shortMost, peak, heat: { most: heatMost, sum: heatSum } };
  };
  const views = viewsOf(s, reading, NIGHT_LENSES, end), runs = views.map((v) => run(v));
  // The hardest night: the run that ends lowest, going dry the earliest.
  const hard = runs.reduce((a, b) => (b.k[b.k.length - 1] < a.k[a.k.length - 1] - 1e-9 || (Math.abs(b.k[b.k.length - 1] - a.k[a.k.length - 1]) <= 1e-9 && (b.dryAt ?? Infinity) < (a.dryAt ?? Infinity)) ? b : a));
  // Heating: the draw of the hardest night, and whether the greenhouses are why it runs short (the same night without them is no worse than
  // short for the lack of the rest: it holds, or is dry later and for less).
  const heating = nets.some((x) => x.crops.length) ? (() => {
    const bare = run(views[runs.indexOf(hard)], false), nightLength = sunrise - nightFrom;
    return { most: Math.max(...runs.map((r) => r.heat.most)), average: nightLength > 0 ? Math.max(...runs.map((r) => r.heat.sum)) / nightLength : 0, why: hard.dryAt !== null && bare.dryAt === null };
  })() : null;
  const slack = eventsVary(s, reading, end, EVENT_KINDS) ? TIMING_SLACK : 0;
  const points = [now, ...steps.map((x) => x.t + x.dt)].map((t, i) => ({ t, k: hard.k[i], lo: Math.max(0, Math.min(...runs.map((r) => r.k[i])) - (i ? slack : 0)), hi: Math.min(1, Math.max(...runs.map((r) => r.k[i])) + (i ? slack : 0)) }));
  const dry = runs.filter((r) => r.dryAt !== null);
  return {
    points, sunset, sunrise, dryAt: hard.dryAt, shortAfter: hard.shortFor ? hard.shortSum / hard.shortFor : 0, shortFor: hard.shortFor, peak: hard.peak, heating,
    dry: dry.length ? {
      // When some runs last the night it may be as late as sunrise (or never): the runs in between are only the levels that were tried.
      from: Math.min(...dry.map((r) => r.dryAt as number)), to: dry.length === runs.length ? Math.max(...dry.map((r) => r.dryAt as number)) : sunrise, always: dry.length === runs.length,
      // (Where some runs last the night, a night between may be short a little, or for a little while.)
      // (The average of a night's shortfall is not monotone in the weather: it counts a partly spent first step, so it is only said to be up to the most: the greatest step's in the run that is short most.)
      after: lowered(spread(dry.map((r) => r.shortMost)), true), short: lowered(spread(dry.map((r) => r.shortFor)), dry.length < runs.length),
    } : null,
    basis: basisFor(reading, s.scenario.climate, now, end), notCounted: notCounted(s.scenario, reading, now, end), reading: reading.kind, runs: runs.length,
  };
}

/** Seconds of play to in-game hours and minutes, for a span ("3 h 20"). */
export const gameSpan = (seconds: number) => {
  const m = Math.round(seconds / DAY_SECONDS * 24 * 60);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
};
