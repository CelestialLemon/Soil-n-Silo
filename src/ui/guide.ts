import { chainOf, type Step } from '../game/chain.ts';
import {
  ANIMALS, bays, BUILDINGS, GREENHOUSE, CATEGORIES, CLEAR_COST, CROP_IDS, CROPS, EARTH, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEM_IDS, ITEMS, OUTPUT_BATCHES,
  POLLINATION_BONUS, POWER, RECIPES, recipesFor, SAPLING_SECONDS, SILO, TREE_HEALTH, TRUCK, type BuildingId, type Ingredient, type ItemId, type Recipe,
} from '../game/data.ts';
import { FROST_RADIUS, HOLLOW, HOLLOW_FACT } from '../game/frost.ts';
import { FLEET_SECONDS } from '../game/fleet.ts';
import { SOIL_AHEAD } from '../game/forecast.ts';
import { RECENT_WINDOW } from '../game/flows.ts';
import { paceOf, riverSeason, SPRINKLER_MOST, TURBINE_MOST, waterPace } from '../game/rules.ts';
import { CHARACTERS, charactersOf, climateOf, SEASON_IDS, SEASONS, seasonName, type Season, type Shift } from '../game/seasons.ts';
import { FROST, MILD_DAY, RAIN_COOLING, warmthByHour } from '../game/warmth.ts';
import { EVENTS, hoursOf, type EventKind } from '../game/events.ts';
import { FALL, SILT } from '../game/flood.ts';
import { BUILD_HOURS, PANEL_BLOCK } from '../game/snow.ts';
import { SEVERE_GALE, TURBINE_LIMIT } from '../game/wind.ts';
import { isPollinated } from '../game/sim/layout.ts';
import { fieldFertility, fieldGroundPace, harvestOf } from '../game/sim/soil.ts';
import { cropGroundWords } from '../game/ground.ts';
import { recipeOf } from '../game/sim/goods.ts';
import { TERRAIN } from '../game/map.ts';
import { historyOf, summarize } from '../game/history.ts';
import { dayAt } from '../game/sim/clock.ts';
import { growsCrops, type GameState } from '../game/state.ts';
import { fill, h, icon, svg } from './dom.ts';
import { clock, clockAt, pct, plural } from './format.ts';
import { HISTORY_WINDOWS } from './historyView.ts';
import { ACTIONS } from '../keybindings.ts';
import { keysCard, markersCard } from './pause.ts';
import { ring, statusLabel, statusPill } from './widgets.ts';
import { must } from '../game/result.ts';
import { keyNames, tip } from './keyhints.ts';

// The guide: a page for every building (what it does, how to use it, its numbers, what it takes and makes), a page of
// goods, and a few pages on the basics (trucks and routes, power, soil, the markers). The words are written here; every number comes
// from data.ts, so the guide stays right when the game is tuned.

export type GuidePage = { kind: 'building'; id: BuildingId } | { kind: 'topic'; id: TopicId } | { kind: 'season'; id: Season } | { kind: 'event'; id: EventKind } | { kind: 'goods' };

export interface GuideHost {
  /** The commission in progress, for "in your valley now". */
  state(): GameState;
  /** Picks a building to place (and closes the guide). */
  build(id: BuildingId): void;
  /** Selects a building and moves the camera to it. */
  focus(id: number): void;
}

interface Entry {
  /** What it's for, in a sentence or two. */
  what: string;
  /** How to set it up, step by step. */
  how: string[];
  tips?: string[];
}

const ENTRIES: Record<BuildingId, Entry> = {
  silo: {
    what: 'Stores goods. Trucks drop goods into it and pick them up again: a buffer between a chain\'s steps, or a place to gather many fields\' harvest.',
    how: [
      'Place it with an open tile beside it, so trucks can reach it.',
      'Make it a stop on a route. A new silo stop drops every good; choose the goods trucks pick up there, and they are no longer dropped.',
    ],
    tips: [
      'One route can bring goods in (a few fields, then the silo) and another take them out (the silo, then a mill): each runs at its own pace.',
      `It loads ${plural(bays('silo'), 'truck')} at a time. A queue of trucks beside it means it is busy: a second silo shares the work.`,
    ],
  },
  garage: {
    what: 'Home of the trucks that carry every good. Buy trucks here and give each a route; they come back to charge.',
    how: [
      'Place it with an open tile beside it, within a pylon\'s reach: trucks charge here from its network.',
      `Select it and buy trucks (up to ${TRUCK.perGarage}). Give each a route: pick one, or make a new one and click the buildings it should stop at.`,
    ],
    tips: [
      'Put it near the routes its trucks drive: a truck low on charge drives home before it goes on.',
      'A truck that gets no charge for a few seconds goes on anyway, and crawls once its battery is empty.',
    ],
  },
  field: {
    what: `Grows the chosen crop on its ${BUILDINGS.field.size} × ${BUILDINGS.field.size} tiles. Crops are the start of every chain.`,
    how: [
      `Build it on good soil: its placement card shows the soil under it now and in ${SOIL_AHEAD / 60} minutes, and the Soil overlay shows the whole map.`,
      `That soil in ${SOIL_AHEAD / 60} minutes is a projection, and the card says what it assumes. Without a weather station it is for a usual season: the usual share of rain, the usual warmth, and only the weather events already under way, which it takes to keep on. With one it is a range, worked out for every way the forecast allows: the events it names, as early or late and as long or short as it says, and the rain and warmth inside its ranges for each stretch of hours (the forecast tells the next day hour by hour, then in threes and sixes).`,
      'Select it and choose the crop. Wheat is the default.',
      'Build it beside the machine that uses its crop (a mill for wheat), and the machine takes the harvest itself. Or make it a stop on a route: trucks pick up the harvest. A full field stops growing.',
      `Put it beside water at its own level, or a sprinkler within ${POWER.sprinklerReach} tiles of its centre: dry fields grow at ×${FIELD.dry} speed (sunflower copes better: ×${waterPace(0, CROPS.sunflower.thirst)}), and in heat above ${FIELD.heat}°C nearly stop.`,
      `Rain waters every field while it falls. Clay holds that water for a day after the rain stops, and is half watered in a heat wave; sand drains, and is watered only while it rains. A field's water is the share of its nine tiles that are watered. Under glass the ground does nothing for water.`,
    ],
    tips: [
      `It can lie on a slope, but not across a cliff (placing it there levels the ground). Its sloping tiles wear faster, up to ${1 + FIELD.erosion} times on a steep bank; a tree or sapling beside it, or a bean field next door, holds the soil (up to ${1 + FIELD.erosionGuarded} times).`,
      'Every harvest wears the soil out, except beans, which restore it. Compost brings it back: a field stop drops compost by itself.',
      `A beehive within ${HIVE.reach} tiles adds 1 to every harvest of a flowering crop.`,
      `Each crop has its own view of the ground under the field (the Crops table below lists it): a liked ground grows it ×${FIELD.groundLike}, a poor one ×${FIELD.groundPoor}, averaged over the nine tiles; the placement card and the field's card say what the ground does to the crop chosen. Stony ground is thin: soil there never rises above ${FIELD.stonyCap}, and a mostly stony field yields ${FIELD.stonyLoss} less a harvest.`,
      'In spring, tomato and sunflower belong on slopes: a late frost settles in hollows and on the low ground, and takes a tender crop there (the placement card says "Frost hollow" where it would).',
      'In a dry summer a dust storm lifts the soil off a field with no tree, sapling or bean field beside it: the same neighbours that hold it against erosion guard it from the wind.',
    ],
  },
  greenhouse: {
    what: `A field under glass: grows the chosen crop on its ${BUILDINGS.greenhouse.size} × ${BUILDINGS.greenhouse.size} tiles in any season, and costs ${BUILDINGS.greenhouse.cost} credits. It is heated by power: with enough, inside it is at least as warm as its crop needs for full speed (${CROPS.wheat.comfort.low}°C for wheat, beans and flax, ${CROPS.sunflower.comfort.low}°C for sunflower, ${CROPS.tomato.comfort.low}°C for tomato), or the outside warmth when that is warmer, and it is vented down above its crop's top comfort for free. It draws ${GREENHOUSE.loss} W for each °C the outside is below that, so a winter night costs most and a summer day nothing. With less power than it needs it cools toward the outside (with none, in about ${GREENHOUSE.capacity / GREENHOUSE.loss} hours it is most of the way there), growing slower, and a tender crop stops below ${FIELD.tenderStops}°C; it never dies of the cold in there. When power returns it warms back up, slowly.`,
    how: [
      'Build it on flat ground: it cannot stand on a slope.',
      `Water it like a field: beside a river or pond, or with a sprinkler within ${POWER.sprinklerReach} tiles of its centre. The rain does not reach it, so a sprinkler near it runs in the rain too.`,
      'The ground under it counts as it does for a field: its likes and dislikes, the stony soil cap and the stony yield.',
      'Select it and choose the crop. It shares the field\'s harvests, store, compost, next-door trading and truck stops.',
    ],
    tips: [
      'Sheltered from a late frost, a cold snap, gales and storms, dust storms and heat waves: nothing in it stops, is lost or slows. A flood still reaches it: the growing crop is lost and it starts again once the water drains.',
      'Snow settles on its roof, and changes nothing. Nothing breaks it: no weather destroys it.',
      'Its soil wears with each harvest, takes compost and erodes like a field\'s.',
    ],
  },
  sprinkler: {
    what: 'Waters every field whose centre is within reach. Watered fields grow at full speed.',
    how: [
      'Place it next to or between fields. The Water overlay shows what it reaches.',
      'Put it within a pylon\'s reach: it needs a little power all the time, less near water.',
      `Lifting water costs ${POWER.sprinklerLift} W a level: above the highest water within ${POWER.waterNear} tiles, or from the valley floor when there is none.`,
    ],
    tips: ['One sprinkler between four fields waters all of them.'],
  },
  coop: {
    what: 'Four chickens turn feed (beans, bran or seed cake) into eggs, with manure on the side.',
    how: [
      'Build it beside a mill (bran) or a bean field, and it takes its feed from them; or bring feed on a route.',
      'A bakery or composter beside it takes its eggs or manure; trucks pick up the rest. Give the manure somewhere to go: a composter, a digester, or the depot.',
    ],
    tips: ['Its manure must go somewhere. A coop whose manure piles up stops laying.', `The hens lay at ${SEASON_IDS.map((x) => `${pct(SEASONS[x].levers.hens.lay)} in ${x}`).join(', ')} of their full rate, and slow above ${ANIMALS.henHeat}°C.`],
  },
  hive: {
    what: 'Bees make honey from flowering fields nearby (anything but wheat), and pollinate them for a bigger harvest.',
    how: [
      `Place it within ${HIVE.reach} tiles of flowering fields: up to ${HIVE.maxFlowers} of them count. The Bees overlay shows its range.`,
      'Build it beside a bakery making honey cake, or make it a stop on a route, so trucks pick up the honey.',
      `The bees stay in below ${ANIMALS.beesFly}°C: no honey and no pollination, so not in winter or on a cold spring morning. They stay in while a gale or a tropical storm blows too.`,
      'In the cold they still forage in a greenhouse within reach that is working (powered, at its crop\'s warmth) and grows a flowering crop (beans, tomato, sunflower or flax), however cool it is under the glass. They make honey on it and pollinate it, but leave the open fields alone until the outside warms. A greenhouse cooling without power stops counting.',
    ],
  },
  composter: {
    what: 'Turns waste (manure, bran, seed cake) into compost, which brings tired soil back.',
    how: [
      'Build it beside a coop or mill, or bring it manure, bran or seed cake on a route.',
      'A field beside it takes its compost when its soil is poor. Take the rest to fields on a route: each takes only what its soil needs, and the truck carries the rest on. End the route at the depot or a silo for compost no field needs.',
    ],
  },
  mill: {
    what: 'Grinds wheat into flour, with bran as a byproduct.',
    how: [
      'Build it beside wheat fields and it takes their wheat; a bakery, coop or digester beside it takes its flour or bran. Or make it a stop on a route: trucks bring it wheat and take its flour and bran.',
      'Give the bran somewhere to go (a coop, a composter, a digester, or the depot), or the mill stops.',
      'Put it within a pylon\'s reach.',
    ],
  },
  press: {
    what: 'Presses sunflowers into oil, with seed cake as a byproduct.',
    how: ['Make it a stop on a route: trucks bring it sunflowers and take its oil and seed cake.', 'Give the seed cake somewhere to go.', 'Put it within a pylon\'s reach.'],
  },
  spinner: {
    what: 'Spins flax into yarn.',
    how: ['Make it a stop on a route: trucks bring it flax and take its yarn.', 'Put it within a pylon\'s reach.'],
  },
  loom: {
    what: 'Weaves yarn into linen, a valuable product.',
    how: ['Make it a stop on a route: trucks bring it yarn and take its linen.', 'Put it within a pylon\'s reach.'],
  },
  bakery: {
    what: 'Bakes flour and eggs into bread, or, with honey as well, into honey cake.',
    how: [
      'Select it and choose bread or honey cake.',
      'Make it a stop on a route: trucks bring it flour and eggs (and honey for cake) and take what it bakes.',
      'Put it within a pylon\'s reach.',
    ],
  },
  cannery: {
    what: 'Cooks tomatoes and oil into tomato sauce, a valuable product.',
    how: ['Make it a stop on a route: trucks bring it tomatoes and oil and take its sauce.', 'Put it within a pylon\'s reach.'],
  },
  solar: {
    what: 'Makes power from the sun: most at midday, nothing at night. The sun chip beside the dial shows how strong the sun is now; on some commissions it is weak.',
    how: ['Place it within a pylon\'s reach. Add batteries to keep machines running through the night.'],
    tips: ['Snow a blizzard leaves on the panels cuts what they make until it melts off.'],
  },
  turbine: {
    what: 'Makes power from the wind, day and night. The wind comes and goes.',
    how: [
      `Place it in the open, within a pylon's reach. Trees, tall buildings and higher ground within ${POWER.shelterReach} tiles shelter it and cost power.`,
      `Up high the wind is stronger: ${Math.round(POWER.windPerLevel * 100)}% more for every level it stands up.`,
      'A severe gale stops a turbine in the open, and a hurricane stops every one, sheltered or not (see the gale and the tropical storm in the weather events). In a severe gale a turbine with trees, tall buildings or higher ground round it keeps turning, at reduced power and in gusts: shelter has this second use.',
    ],
  },
  wheel: {
    what: 'Turns a river\'s current into steady power, day and night, with nothing to burn.',
    how: [
      'Place it on a river bank, at the river\'s level, sharing an edge with the running water: it faces the river by itself. Still ponds and lakes don\'t turn it.',
      `It makes ${POWER.wheel} W in a current of 1 m/s, more in a faster one, and ${POWER.wheelFall} times as much beside a fall, where the river drops a level.`,
      'The season sets the river: high and fast in spring, low and slow in summer and winter, in between in autumn. The wheel states the season\'s effect.',
    ],
    tips: ['There are only a few good places for it. A wheel beside a fall can carry a small farm through the night.', 'In a winter cold snap the river freezes over at its quiet stretches and a wheel there stops; a fall never freezes, so a wheel beside one keeps turning.'],
  },
  battery: {
    what: 'Stores spare power and gives it back when the network falls short, such as at night. Its cells light up from the bottom as it fills: one ring a quarter.',
    how: ['Place it within a pylon\'s reach. It charges whenever its network makes more than it uses.'],
  },
  digester: {
    what: 'Burns waste (manure, bran or seed cake) for steady power, day and night.',
    how: ['Build it beside a coop or a mill, or bring it manure, bran or seed cake on a route.', 'Place it within a pylon\'s reach.'],
    tips: ['A good home for byproducts you have no other use for.'],
  },
  pylon: {
    what: 'Carries power. Every building that makes, stores or uses power must be in a pylon\'s reach.',
    how: [
      'Place pylons so every powered building has a tile within reach. Placing one shows its reach (the square) and how far it links (the dashed circle), with the wires it would make.',
      'Pylons close enough to each other link into one network, which shares all its power.',
      'Drag to lay a line: pylons go down spaced so their reaches meet and each links to the next.',
    ],
    tips: ['Two networks that don\'t link don\'t share power. Each network has its own colour on the Power overlay: its reach, the wires between its pylons and a line to every building it powers.', 'Select or point at a pylon, or select any powered building, to see its network.'],
  },
  station: {
    what: 'Reads the sky and gives the valley a forecast: the next three days, a day\'s highs and lows, its sun, wind and rain, and the events on their way, in ranges that always hold what really happens and narrow as the day comes.',
    how: [
      `Place it within a pylon's reach: it needs ${BUILDINGS.station.power} W all the time. Where it stands makes no difference: no shelter, height or exposure counts.`,
      'With power it renews the forecast every game hour. Without (short of power, cut off from the grid, or under flood water) it keeps the last forecast, marked out of date with the hour it is from, and stops renewing.',
      'One is enough: a second adds nothing. Bulldoze the last one and the forecast is gone.',
    ],
    tips: ['Its cups turn with the wind, powered or not.'],
  },
  sapling: {
    what: 'Grows into a tree. Trees add to soil health; some commissions ask for it.',
    how: ['Plant it on open grass.'],
    tips: ['Keep trees away from wind turbines: they shelter them.'],
  },
  depot: {
    what: 'Where goods go to count. Every good delivered here counts towards the commission and pays its price.',
    how: [
      'Make it the last stop of a route: trucks drop their goods here and the depot buys them all.',
      'Choose what a route drops here: a route can drop only the product and keep the rest aboard for its other stops.',
    ],
    tips: [`It loads ${plural(bays('depot'), 'truck')} at a time.`],
  },
};

export type TopicId = 'start' | 'trucks' | 'power' | 'soil' | 'weather' | 'land' | 'markers' | 'keys';
const TOPICS: { id: TopicId; name: string; chip: string }[] = [
  { id: 'start', name: 'First steps', chip: 'First steps' }, { id: 'trucks', name: 'Trucks and routes', chip: 'Routes' }, { id: 'power', name: 'Power', chip: 'Power' },
  { id: 'soil', name: 'Soil and water', chip: 'Soil' }, { id: 'weather', name: 'Seasons and weather', chip: 'Weather' }, { id: 'land', name: 'Height and earthworks', chip: 'Height' }, { id: 'markers', name: 'Statuses and markers', chip: 'Statuses' }, { id: 'keys', name: 'Keys', chip: 'Keys' },
];

/** The weather events that have a page, in the order of the index: their rules are in. */
const GUIDED_EVENTS: readonly EventKind[] = ['thunderstorm', 'gale', 'tropicalStorm', 'flood', 'heatWave', 'dustStorm', 'fog', 'lateFrost', 'coldSnap', 'blizzard', 'softRain', 'warmSpell', 'steadyBreeze'];

const lc = (id: ItemId) => ITEMS[id].name.toLowerCase();
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** The good a building's chain is drawn for: what it makes first. */
function chainItemOf(id: BuildingId): ItemId | null {
  if (id === 'field' || id === 'greenhouse') return 'wheat';
  if (id === 'hive') return 'honey';
  return recipesFor(id)[0]?.outputs[0]?.item ?? null;
}

/** The mean fertility of a map's grass, from the ground it lies on. */
const meanFertility = (m: GameState['map']) => { const grass = m.terrain.map((t, i) => (t === TERRAIN.grass ? m.fertility[i] : -1)).filter((f) => f >= 0); return grass.reduce((a, b) => a + b, 0) / Math.max(1, grass.length); };

/** Topics worth reading for a commission, from what it asks and its conditions. */
function worthReading(s: GameState): TopicId[] {
  const sc = s.scenario, out: TopicId[] = ['start', 'weather'];
  if (sc.goals.some((g) => g.kind === 'soil') || meanFertility(s.map) < 50) out.push('soil');
  const { sun, wind } = sc.climate;
  if (sun.strength < 1 || sun.set - sun.rise < 12 || wind.mean < 0.4) out.push('power');
  if (sc.goals.some((g) => g.kind !== 'soil' && chainOf(g.item).from?.inputs.length)) out.push('trucks');
  if (sc.terrain.relief >= 0.6) out.push('land');
  return out;
}

const NODES = (...c: (Node | string)[]) => c;
/** The words of each weather event's page (those whose rules are in); the numbers come from the catalogue and data.ts. */
type EventText = { lead: string; does: (Node | string)[][]; severe?: (Node | string)[][] };
const eventText = (linkOf: (label: string, p: GuidePage) => Node, bLinkOf: (id: BuildingId) => Node): Partial<Record<EventKind, EventText>> => {
  const push = (k: EventKind, st: 'ordinary' | 'severe' = 'ordinary') => EVENTS[k].push[st] ?? {};
  const pc = (n: number) => `${Math.round(n * 100)}%`;
  return {
    thunderstorm: {
      lead: 'Heavy rain, a dark sky and gusts of wind, for about half a day.',
      does: [
        NODES('Heavy rain waters every open field, so the sprinklers rest. Rain cools the valley by up to ', String(RAIN_COOLING), '°C.'),
        NODES(`The sky is thick with cloud and the sun gives ${pc(push('thunderstorm').sun ?? 1)} of what the cloud leaves, so solar panels make very little.`),
        NODES(`The wind gains ${pc(push('thunderstorm').wind ?? 0)} of its full strength on top of the day's wind, so turbines make more.`),
        NODES('In spring it counts as heavy rain, which is what a flood follows.')],
      severe: [NODES(`Harder: the wind gains ${pc(push('thunderstorm', 'severe').wind ?? 0)}, the sun gives ${pc(push('thunderstorm', 'severe').sun ?? 1)} of what the cloud leaves.`)],
    },
    gale: {
      lead: 'A day of strong wind in the autumn.',
      does: [
        NODES(`The wind gains ${pc(push('gale').wind ?? 0)} of its full strength, so every `, bLinkOf('turbine'), ' makes all it can.'),
        NODES('The bees stay in: no honey and no pollination until it passes.'),
        NODES('Answer: a mix of power that does not lean on the wind alone (', bLinkOf('solar'), ', ', bLinkOf('wheel'), ', a ', bLinkOf('battery'), '), and turbines with some shelter.')],
      severe: [
        NODES(`The wind blows past what a turbine can stand: ${SEVERE_GALE} times a full wind. A turbine stops when the wind that reaches it (the share its card shows) is over ${Math.round(TURBINE_LIMIT / SEVERE_GALE * 100)}% of full, so an exposed turbine stops, while one with trees, tall buildings or higher ground round it keeps turning, furled, at about half its power or less and in unsteady gusts. A turbine up a hill gets more wind, so it stops sooner.`),
        NODES('Stopped turbines are marked with the gale\'s own marker, and their rotors stand still. Nothing breaks: they turn again when it passes.')],
    },
    tropicalStorm: {
      lead: 'Days of heavy rain and wind in the autumn, rarely in late summer, and the flood the river brings after.',
      does: [
        NODES(`Heavy rain waters every open field, so the sprinklers rest. The sun gives ${pc(push('tropicalStorm').sun ?? 1)} of what the cloud leaves, so solar panels make little.`),
        NODES(`The wind gains ${pc(push('tropicalStorm').wind ?? 0)} of its full strength: turbines make all they can. The bees stay in.`),
        NODES('When it ends the river rises and a ', linkOf('flood', { kind: 'event', id: 'flood' }), ' follows, an ordinary one for an ordinary storm. Build for it as for any flood: higher ground, or a bank raised with earthworks.'),
        NODES('Answer: batteries and a power mix for the dark days, and the flood\'s answers for the river.')],
      severe: [
        NODES(`The hurricane: wind no turbine stands, however sheltered (${push('tropicalStorm', 'severe').gale} times the wind they get, over the limit of ${TURBINE_LIMIT}), so every `, bLinkOf('turbine'), ` stops; the sun gives ${pc(push('tropicalStorm', 'severe').sun ?? 1)} of what the cloud leaves, so solar panels make almost nothing; the hens stop laying and the bees stay in.`),
        NODES('The trucks stay in their garages through the storm\'s worst hours, the middle half of it: those on the road drive home, those at home charge but do not set off. They go on again when it eases.'),
        NODES(`The flood that follows is certain and a level higher: the river rises ${EVENTS.flood.flood?.severe ?? 0} levels, not ${EVENTS.flood.flood?.ordinary ?? 0}.`),
        NODES('Nothing breaks, and there is no calm eye: it only stops what runs. It comes in a stormy summer or autumn, at most once a commission, and only on the hardest difficulty.')],
    },
    flood: {
      lead: 'The river spreads over the low ground beside it for a day or two, then drains. It follows heavy rain in spring.',
      does: [
        NODES(`The river rises ${EVENTS.flood.flood?.ordinary ?? 0} level above its surface and spreads over the ground lower than the water, as far as it can get over ground at or below its own height. A hillside or a bank stops it; the water thins by ${FALL} of a level for every tile it runs, so it doesn't drown a wide plain.`),
        NODES('A ', bLinkOf('field'), ' or ', bLinkOf('greenhouse'), ' under water loses its growing crop and starts again once the water drains. What it already holds is kept.'),
        NODES('Any other building with a tile under water stops until it drains: nothing is destroyed and its goods are untouched. A flooded ', bLinkOf('pylon'), ', ', bLinkOf('solar'), ' panel or ', bLinkOf('wheel'), ' is out of the network until then.'),
        NODES('Trucks can\'t drive through water: they go round it, or wait until it drains.'),
        NODES(`Ground the water leaves gains ${SILT} fertility in silt, less than a flood costs a field: the floodplain is good land because it floods.`),
        NODES('The card over a building in hand says "Floods" on ground a flood reaches, and which. Build higher, or raise a bank with ', linkOf('earthworks', { kind: 'topic', id: 'land' }), ' that the water can\'t get over.'),
        NODES('A spring thunderstorm brings its flood the moment it ends, and a tropical storm its own.')],
      severe: [NODES(`The river rises ${EVENTS.flood.flood?.severe ?? 0} levels, so the water reaches much further across low ground.`)],
    },
    heatWave: {
      lead: 'Days of heat in the summer, hotter than the season usually gets.',
      does: [
        NODES(`The whole day's warmth is lifted by ${push('heatWave').warmth}°C, past ${FIELD.heat}°C in the afternoon.`),
        NODES(`An unwatered field grows at ${FIELD.dry} of its pace, falling to ${FIELD.heatDry} by ${FIELD.heatFull}°C. A field on the water or watered by a `, bLinkOf('sprinkler'), ' is not slowed by the lack of water.'),
        NODES(`Crops slow outside their comfortable range, watered or not (see `, linkOf('Seasons and weather', { kind: 'topic', id: 'weather' }), ').'),
        NODES(`Hens slow above ${ANIMALS.henHeat}°C. Each tree within ${ANIMALS.shadeReach} tiles of a `, bLinkOf('coop'), ` takes ${ANIMALS.shadePerTree}°C off the heat the hens feel, up to ${ANIMALS.shadeMost}°C (${ANIMALS.shadeMost / ANIMALS.shadePerTree} trees).`),
        NODES('The light turns warm and golden.')],
      severe: [NODES(`Hotter: ${push('heatWave', 'severe').warmth}°C above the season, and it lasts ${hoursOf('heatWave', 'severe')[0]}–${hoursOf('heatWave', 'severe')[1]} hours.`)],
    },
    dustStorm: {
      lead: 'Half a day to a day of blowing dust in a dry summer.',
      does: [
        NODES(`The sun gives ${pc(push('dustStorm').sun ?? 1)} of its light, so solar panels make about a third of their power. The trucks drive at ${pc(push('dustStorm').trucks ?? 1)} of their speed.`),
        NODES(`The wind lifts the soil off a `, bLinkOf('field'), ` with nothing to break it: each tile of it loses fertility, about ${Math.round((EVENTS.dustStorm.dust?.ordinary ?? 0) * (hoursOf('dustStorm')[0] + hoursOf('dustStorm')[1]) / 2 * 0.9)} points over an ordinary storm. Sand loses twice as much, stony ground a quarter more. A field with a tree or a sapling beside it, or a bean field sharing an edge, loses nothing: the same guard as against erosion. Ground with no field on it is not touched.`),
        NODES('The loss stays until compost or beans restore the soil: fields do not recover by resting. A field the wind is stripping carries the dust storm\'s marker, and its cards say whether a tree or a bean field beside it would guard it.'),
        NODES('The sky turns a warm brown, and a haze of dust lies on the ground.'),
        NODES('Answer: a tree, a sapling or a bean field beside each ', bLinkOf('field'), ', and a ', bLinkOf('battery'), ' to carry the farm through the dim hours.')],
      severe: [NODES(`Thicker and fiercer: the sun gives ${pc(push('dustStorm', 'severe').sun ?? 1)} of its light, the trucks drive at ${pc(push('dustStorm', 'severe').trucks ?? 1)} of their speed and an unguarded field loses twice the soil.`)],
    },
    fog: {
      lead: 'A grey morning in the autumn.',
      does: [
        NODES(`The sun gives ${pc(push('fog').sun ?? 1)} of its light, so solar panels make less.`),
        NODES(`The trucks drive at ${pc(push('fog').trucks ?? 1)} of their speed.`),
        NODES('A cool grey haze lies on the ground, thickest at the start and thinning as the morning lifts it. Roofs, silos and treetops rise out of it.')],
      severe: [NODES(`Thicker: the sun gives ${pc(push('fog', 'severe').sun ?? 1)} of its light and the trucks drive at ${pc(push('fog', 'severe').trucks ?? 1)} of their speed.`)],
    },
    lateFrost: {
      lead: 'One clear spring night when frost settles on the lowest ground.',
      does: [
        NODES(`Cold air runs downhill and pools: the frost lies on the hollows and the valley floor, ground that lies at least ${HOLLOW} of a level lower than the ground within ${FROST_RADIUS} tiles round it. It is judged against what is round it, not the whole map, so slopes and rises stay clear.`),
        NODES('A tender crop (tomato, sunflower) in a ', bLinkOf('field'), ' that the frost lies on (most of its nine tiles) loses its growing crop, and the field starts again when the frost has passed. Hardy crops are unharmed, and so is what a field already holds.'),
        NODES('A field in a hollow says so on its cards: "', HOLLOW_FACT, '". White rime lies on the frozen ground at dawn and melts through the morning.'),
        NODES('Answer: grow tomato and sunflower on slopes and put hardy crops in the hollows, or put them in a ', bLinkOf('greenhouse'), ', which the frost does not reach.')],
      severe: [NODES(`A windy, bitter night (the wind gains ${pc(push('lateFrost', 'severe').wind ?? 0)}): the frost reaches the slopes too, and only the crests that stand above the ground round them are spared.`)],
    },
    softRain: {
      lead: 'A day of gentle rain, in spring or autumn.',
      does: [
        NODES('The rain waters every open field and the sprinklers rest. Rain cools the valley by up to ', String(RAIN_COOLING), '°C.'),
        NODES('It is too light to flood anything.')],
    },
    warmSpell: {
      lead: 'A mild stretch in autumn or winter.',
      does: [
        NODES(`The day is lifted to a mild one, ${MILD_DAY.low} to ${MILD_DAY.high}°C, if it would have been colder. A day already warmer is left as it is.`),
        NODES(`Crops grow at the pace of a mild season, and bees fly (they need ${ANIMALS.beesFly}°C).`)],
    },
    coldSnap: {
      lead: 'A day or two of hard cold in the winter.',
      does: [
        NODES(`The whole day's warmth drops by ${-(push('coldSnap').warmth ?? 0)}°C, so crops grow slower still (see `, linkOf('Seasons and weather', { kind: 'topic', id: 'weather' }), ').'),
        NODES(`The river freezes over from its banks, at its quiet stretches. A `, bLinkOf('wheel'), ' on the ice slows as it forms and stops once it is frozen shut.'),
        NODES('A fall never freezes: a wheel beside one, and on the water just below it, keeps turning.'),
        NODES(`The hens lay at ${pc(push('coldSnap').hens ?? 1)} of their pace. Ponds and lakes are left alone.`)],
      severe: [NODES(`Colder: ${-(push('coldSnap', 'severe').warmth ?? 0)}°C below the season, and the hens lay at ${pc(push('coldSnap', 'severe').hens ?? 1)} of their pace.`)],
    },
    blizzard: {
      lead: 'A day or two of driving snow in a hard winter.',
      does: [
        NODES('There is no sun at all, so solar panels make nothing. The wind is the season\'s own.'),
        NODES(`The trucks drive at ${pc(push('blizzard').trucks ?? 1)} of their speed in the snow.`),
        NODES(`The snow it leaves on the panels builds over the first ${BUILD_HOURS} hours and melts off evenly over the ${EVENTS.blizzard.lingers} hours after it ends. Under snow a panel makes ${pc(1 - PANEL_BLOCK)} of what the sun would give, so solar stays low for a while after the sky clears.`),
        NODES('Snow lies on the ground, and white on the roofs, while it falls and for a day after.')],
      severe: [NODES(`Deeper: the trucks drive at ${pc(push('blizzard', 'severe').trucks ?? 1)} of their speed.`)],
    },
    steadyBreeze: {
      lead: 'A day of wind in the summer, when the air is usually calm.',
      does: [NODES(`The wind gains ${pc(push('steadyBreeze').wind ?? 0)} of its full strength, after the calm spells, so turbines make more.`)],
    },
  };
};

const TILE_NAMES: Partial<Record<BuildingId, string>> = { solar: 'Solar', turbine: 'Turbine', depot: 'Depot', hive: 'Beehive', press: 'Oil press' };

/**
 * The guide: an index on the left (search, topics, every building as a tile, outlined where the valley has one) and the page
 * on the right. A building's page has what it does, its recipes, its numbers, where its good comes from (the chain, with the
 * time each step takes), how to use it, and, during a commission, every building of its kind in the valley now.
 */
export function guidePanel(start: GuidePage, host: GuideHost | null, close: () => void): HTMLElement {
  const s = host?.state() ?? null;
  const index = h('div', { class: 'guide-index' });
  const body = h('div', { class: 'guide-page' });
  let page = start, query = '';
  const go = (p: GuidePage) => { page = p; query = ''; search.value = ''; draw(); body.scrollTop = 0; };
  const link = (label: string | Node, p: GuidePage) => h('button', { class: 'link', onclick: () => go(p) }, label);
  const bLink = (id: BuildingId) => link(BUILDINGS[id].name, { kind: 'building', id });
  const search = h('input', { class: 'cd-input', placeholder: 'Search buildings, goods, keys…', spellcheck: false, 'aria-label': 'Search the guide',
    oninput: () => { query = search.value.trim().toLowerCase(); drawIndex(); },
    // Esc closes the guide from the search field too (the game's keys skip text fields; G types a G here).
    onkeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } } });
  const results = h('div', { class: 'guide-results' });
  const have = new Set(s ? s.buildings.map((b) => b.type) : []);

  function drawIndex() {
    const topics = h('div', { class: 'topics' }, ...TOPICS.map((t) => h('button', { class: `topic${page.kind === 'topic' && page.id === t.id ? ' is-on' : ''}`, onclick: () => go({ kind: 'topic', id: t.id }) }, t.chip)),
      h('button', { class: `topic${page.kind === 'goods' ? ' is-on' : ''}`, onclick: () => go({ kind: 'goods' }) }, 'Goods'),
      ...SEASON_IDS.map((x) => h('button', { class: `topic${page.kind === 'season' && page.id === x ? ' is-on' : ''}`, onclick: () => go({ kind: 'season', id: x }) }, SEASONS[x].name)),
      ...GUIDED_EVENTS.map((x) => h('button', { class: `topic${page.kind === 'event' && page.id === x ? ' is-on' : ''}`, onclick: () => go({ kind: 'event', id: x }) }, EVENTS[x].name)));
    const tile = (id: BuildingId) => h('button', { class: `gtile${page.kind === 'building' && page.id === id ? ' is-on' : ''}${have.has(id) ? ' is-here' : ''}`, onclick: () => go({ kind: 'building', id }) },
      icon(id, 40), TILE_NAMES[id] ?? BUILDINGS[id].short ?? BUILDINGS[id].name);
    let list: (Node | null)[];
    if (query) {
      // Search: buildings, goods, topics and keys whose words match.
      const hits: Node[] = [];
      for (const id of Object.keys(BUILDINGS) as BuildingId[]) if (`${BUILDINGS[id].name} ${ENTRIES[id].what}`.toLowerCase().includes(query)) hits.push(h('button', { class: 'hit', onclick: () => go({ kind: 'building', id }) }, icon(id, 28), h('b', null, BUILDINGS[id].name), h('span', { class: 'cd-small' }, BUILDINGS[id].hint)));
      for (const i of ITEM_IDS) if (`${ITEMS[i].name} ${ITEMS[i].hint}`.toLowerCase().includes(query)) hits.push(h('button', { class: 'hit', onclick: () => go({ kind: 'goods' }) }, icon(i, 28), h('b', null, ITEMS[i].name), h('span', { class: 'cd-small' }, ITEMS[i].hint)));
      for (const t of TOPICS) if (t.name.toLowerCase().includes(query)) hits.push(h('button', { class: 'hit', onclick: () => go({ kind: 'topic', id: t.id }) }, icon('book', 28), h('b', null, t.name), h('span', { class: 'cd-small' }, 'Topic')));
      for (const x of SEASON_IDS) if (`${SEASONS[x].name} season weather`.toLowerCase().includes(query)) hits.push(h('button', { class: 'hit', onclick: () => go({ kind: 'season', id: x }) }, icon('sun', 28), h('b', null, SEASONS[x].name), h('span', { class: 'cd-small' }, 'Season')));
      for (const x of GUIDED_EVENTS) if (`${EVENTS[x].name} weather event`.toLowerCase().includes(query)) hits.push(h('button', { class: 'hit', onclick: () => go({ kind: 'event', id: x }) }, icon('sun', 28), h('b', null, EVENTS[x].name), h('span', { class: 'cd-small' }, 'Weather event')));
      for (const [what, keys] of keyList()) if (`${what} ${keys}`.toLowerCase().includes(query)) hits.push(h('button', { class: 'hit', onclick: () => go({ kind: 'topic', id: 'keys' }) }, h('span', { class: 'cd-key' }, keys), h('b', null, what), h('span', { class: 'cd-small' }, 'Key')));
      list = [h('div', { class: 'hits' }, ...(hits.length ? hits : [h('p', { class: 'cd-small' }, 'Nothing matches.')]))];
    } else {
      list = [
        ...CATEGORIES.map((c) => h('div', { class: 'cat' }, h('div', { class: 'cd-label' }, c.name),
          h('div', { class: 'gtiles' }, ...(Object.keys(BUILDINGS) as BuildingId[]).filter((id) => BUILDINGS[id].category === c.id || (c.id === 'logistics' && id === 'depot')).map(tile)))),
        s ? h('div', { class: 'cd-small legend' }, h('i'), 'Outlined: you have one in this valley') : null,
        s ? h('div', { class: 'cd-inset worth' }, h('div', { class: 'cd-label' }, `Worth reading for ${s.scenario.name}`),
          h('div', { class: 'chips' }, ...worthReading(s).map((t) => h('button', { class: 'cd-chip', onclick: () => go({ kind: 'topic', id: t }) }, must(TOPICS.find((x) => x.id === t), 'topic').name)))) : null,
      ];
    }
    fill(results, topics, ...list);
  }

  fill(index, h('div', { class: 'cd-label' }, 'The guide'), search, results);

  function draw() {
    drawIndex();
    fill(body, h('button', { class: 'cd-btn is-icon close', title: tip('Close', ...keyNames('guide'), 'Esc'), 'aria-label': 'Close', onclick: close }, icon('close', 16)),
      ...(page.kind === 'building' ? buildingPage(page.id) : page.kind === 'goods' ? goodsPage() : page.kind === 'season' ? seasonPage(page.id) : page.kind === 'event' ? eventPage(page.id) : topicPage(page.id)));
  }

  // ---- Buildings ----

  function buildingPage(id: BuildingId): Node[] {
    const d = BUILDINGS[id], e = ENTRIES[id], rs = recipesFor(id), item = chainItemOf(id);
    const cat = CATEGORIES.find((c) => c.id === d.category)?.name ?? 'The map';
    const nums = numbers(id);
    return [
      h('div', { class: 'cd-small cd-faint' }, `Buildings · ${cat}`),
      h('div', { class: 'spread' },
        h('div', { class: 'main' },
          h('div', { class: 'title-row' }, h('span', { class: 'big-icon' }, icon(id, 116)),
            h('div', null, h('h1', { class: 'cd-display' }, d.name), h('p', { class: 'lead' }, e.what),
              d.category && host ? h('button', { class: 'cd-btn is-primary', title: tip('Build', ...keyNames(`build:${id}`)), onclick: () => { host.build(id); close(); } }, `Build · ${d.cost} credits`) : null)),
          rs.length ? h('div', { class: 'cd-label sec' }, rs.length > 1 ? 'Recipes' : 'Recipe') : null,
          rs.length ? h('div', { class: 'recipes' }, ...rs.map(recipeRow)) : null,
          facts(id),
          item ? chainView(item) : null,
          h('div', { class: 'cd-label sec' }, 'How to use it'),
          h('ol', { class: 'how' }, ...e.how.map((t) => h('li', null, t))),
          nums.length ? h('div', { class: 'cd-label sec' }, 'Numbers') : null,
          nums.length ? h('div', { class: 'num-rows' }, ...nums) : null,
          ...extraTables(id)),
        h('div', { class: 'side' },
          s && d.category ? valleyNow(id, s) : null,
          worksWith(id),
          e.tips ? h('div', null, h('div', { class: 'cd-label' }, 'Good to know'), h('div', { class: 'tips' }, ...e.tips.map((t) => h('div', { class: 'tip' }, icon('check', 20), h('span', null, t))))) : null)),
    ];
  }

  const chip = (i: ItemId, n?: number, dark = false) => h('button', { class: `cd-chip${dark ? ' is-ink' : ''}`, onclick: () => go({ kind: 'goods' }) }, icon(i, 30), `${n !== undefined ? `${n} ` : ''}${lc(i)}`);
  const ingChip = (ing: Ingredient) => ('item' in ing ? chip(ing.item, ing.n) : h('span', { class: 'cd-chip' }, icon(GROUPS[ing.group][0], 30), `${ing.n} ${GROUP_NAMES[ing.group].split(' (')[0]}`));

  function recipeRow(r: Recipe) {
    return h('div', { class: 'rec' },
      ...r.inputs.flatMap((ing, k) => [k ? h('span', { class: 'plus' }, '+') : null, ingChip(ing)]),
      h('span', { class: 'rec-time' }, `${r.time} s`),
      ...(r.outputs.length ? r.outputs.flatMap((o, k) => [k ? h('span', { class: 'plus' }, '+') : null, chip(o.item, o.n, k === 0)]) : [h('span', { class: 'cd-chip is-ink' }, icon('bolt', 24), `${POWER.digester} W`)]),
      h('span', { class: 'cd-small' }, r.outputs.length ? `${fmt(60 / r.time * r.outputs[0].n)} a minute at most` : `burns ${fmt(60 / r.time)} a minute`));
  }

  /** Cost, power, size, holds and feeds on, as big figures. */
  function facts(id: BuildingId) {
    const d = BUILDINGS[id], r = recipesFor(id)[0];
    const f = (label: string, fig: string, sub: string) => h('div', null, h('div', { class: 'cd-label' }, label), h('div', { class: 'cd-figure' }, fig), h('div', { class: 'cd-small' }, sub));
    const watts = id === 'station' ? [`${d.power} W`, 'all the time'] : id === 'sprinkler' ? [`${POWER.sprinklerNearWater}–${SPRINKLER_MOST} W`, 'near water to far and high'] : id === 'garage' ? [`${TRUCK.chargeRate} W`, 'a truck charging']
      : d.power ? [`${d.power} W`, 'while working'] : d.heated ? [`${GREENHOUSE.loss} W`, 'for each °C the outside is below its crop\'s warmth'] : id === 'solar' ? [`${POWER.solar} W`, 'at noon, full sun'] : id === 'turbine' ? [`${POWER.turbine}–${Math.round(TURBINE_MOST)} W`, 'in full wind, low to high']
        : id === 'wheel' ? [`${POWER.wheel} W`, `at 1 m/s; ×${POWER.wheelFall} beside a fall`]
        : id === 'digester' ? [`${POWER.digester} W`, 'made while burning'] : id === 'battery' ? [`${POWER.battery.capacity} J`, 'stored'] : ['—', 'none'];
    return h('div', { class: 'nums' },
      f('Cost', d.category ? String(d.cost) : '—', d.category ? 'credits · full refund' : 'it is the map\'s'),
      f('Power', watts[0], watts[1]),
      f('Size', `${d.size} × ${d.size}`, `tiles${d.tall ? ' · tall' : ''}`),
      r ? f('Holds', String(INPUT_BATCHES), `batches in, ${OUTPUT_BATCHES} out`) : id === 'silo' ? f('Holds', String(SILO.perGood), 'of each good') : id === 'field' || id === 'greenhouse' ? f('Holds', String(FIELD.store), 'harvested goods') : f('Holds', '—', 'nothing'),
      r ? f('Feeds on', String(r.inputs.reduce((n, i) => n + i.n, 0)), r.inputs.map((i) => ('item' in i ? lc(i.item) : i.group)).join(' + ')) : f('Feeds on', id === 'field' || id === 'greenhouse' ? '1' : '—', id === 'field' || id === 'greenhouse' ? 'compost, if given' : 'nothing'));
  }

  /** Every building of this kind in the valley now, with its status and rate, and a way to go to it. */
  function valleyNow(id: BuildingId, s: GameState) {
    const mine = s.buildings.filter((b) => b.type === id);
    // Each building's own good and full-speed rate: a field's current crop, a machine's current recipe.
    const goods = mine.map((b): { item: ItemId; full: number } | null => {
      if (growsCrops(b)) { const c = CROPS[b.crop]; return { item: b.crop, full: (harvestOf(s, b) + (c.flowers && isPollinated(s, b) ? POLLINATION_BONUS : 0)) * paceOf(1, fieldFertility(s, b), undefined, undefined, fieldGroundPace(s, b)).pace * 60 / c.grow }; } // best case now: watered, pollinated if it is
      const r = recipeOf(b), o = r?.outputs[0];
      return r && o ? { item: o.item, full: o.n * 60 / r.time } : id === 'hive' ? { item: 'honey', full: 0 } : null;
    });
    const rates = mine.map((b, i) => { const hist = historyOf(s, b), g = goods[i]; return hist && g ? summarize(hist, s.time, RECENT_WINDOW).perMin[g.item] ?? 0 : 0; });
    const item = goods.some((g) => g), full = goods.reduce((n, g) => n + (g?.full ?? 0), 0), total = rates.reduce((n, x) => n + x, 0);
    const by = new Map<ItemId, number>();
    goods.forEach((g, i) => { if (g) by.set(g.item, (by.get(g.item) ?? 0) + rates[i]); });
    const together = [...by].map(([i, n]) => `${fmt(Math.round(n * 10) / 10)} ${lc(i)}`).join(', ');
    const name = (n: number) => (n === 1 ? BUILDINGS[id].name.toLowerCase() : `${BUILDINGS[id].name.toLowerCase()}${BUILDINGS[id].name.endsWith('s') ? 'es' : 's'}`);
    return h('div', { class: 'cd-card is-ink valley-now' },
      h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, 'In your valley now'), h('span', { class: 'cd-small' }, `${clockAt(s.time)} · day ${dayAt(s.time)}`)),
      mine.length ? h('div', { class: 'sum' },
        item ? ring({ v: full ? total / full : 0, d: 96, w: 8, col: 'var(--ochre)' }, h('div', null, h('div', { class: 'big' }, fmt(Math.round(total * 10) / 10)), full ? h('div', { class: 'cd-small' }, `of ${fmt(full)}`) : null)) : null,
        h('div', null, h('div', { class: 'what' }, `${mine.length} ${name(mine.length)}${item ? ` · ${together} a minute together` : ''}`),
          full ? h('div', { class: 'cd-small' }, `at full speed they would make ${fmt(full)}`) : null)) : h('p', { class: 'cd-small' }, `No ${name(2)} yet.`),
      ...mine.slice(0, 6).map((b, i) => h('div', { class: 'vrow' },
        h('div', null, h('div', { class: 'vname' }, `${BUILDINGS[id].name} ${i + 1}`), statusPill(b.status, statusLabel(b, b.status, b.need), '', b.need)),
        goods[i] ? h('span', null, h('span', { class: 'big' }, fmt(Math.round(rates[i] * 10) / 10)), h('span', { class: 'cd-small' }, ' / min')) : h('span'),
        host ? h('button', { class: 'cd-btn is-sm', onclick: () => { host.focus(b.id); close(); } }, 'Show ›') : null)),
      mine.length > 6 ? h('div', { class: 'cd-small' }, `and ${mine.length - 6} more`) : null);
  }

  /** The buildings it trades goods with: what it takes from, and gives to. */
  function worksWith(id: BuildingId) {
    const takes = new Set(takesOf(id)), gives = new Set(givesOf(id)), out = new Map<BuildingId, string[]>();
    const into = (k: BuildingId) => { let a = out.get(k); if (!a) out.set(k, a = []); return a; };
    for (const r of RECIPES) {
      if (r.building === id) continue;
      for (const o of r.outputs) if (takes.has(o.item)) into(r.building).push(lc(o.item));
      for (const ing of r.inputs) for (const i of 'item' in ing ? [ing.item] : GROUPS[ing.group]) if (gives.has(i)) into(r.building).push(lc(i));
    }
    for (const c of CROP_IDS) if (takes.has(c) && id !== 'field' && id !== 'greenhouse') { into('field').push(lc(c)); into('greenhouse').push(lc(c)); }
    if (takes.has('honey') && id !== 'hive') out.set('hive', ['honey']);
    if (gives.has('compost')) { into('field').push('compost'); into('greenhouse').push('compost'); }
    if (!out.size) return null;
    return h('div', null, h('div', { class: 'cd-label' }, 'Works with'),
      h('div', { class: 'chips' }, ...[...out].map(([b, goods]) => h('button', { class: 'cd-chip', onclick: () => go({ kind: 'building', id: b }) }, icon(b, 24), `${BUILDINGS[b].name} · ${[...new Set(goods)].join(', ')}`))));
  }

  const takesOf = (id: BuildingId): ItemId[] => (id === 'field' || id === 'greenhouse' ? ['compost'] : [...new Set(recipesFor(id).flatMap((r) => r.inputs.flatMap((i) => ('item' in i ? [i.item] : [...GROUPS[i.group]]))))]);
  const givesOf = (id: BuildingId): ItemId[] => (id === 'field' || id === 'greenhouse' ? [...CROP_IDS] : id === 'hive' ? ['honey'] : [...new Set(recipesFor(id).flatMap((r) => r.outputs.map((o) => o.item)))]);

  /** Where a good comes from: the chain back to the fields, laid out right to left, with the time each step takes. */
  function chainView(item: ItemId) {
    const c = chainOf(item);
    type Node = { kind: 'good' | 'building' | 'group'; label: string; icon: string; col: number; row: number; key?: boolean; go?: GuidePage };
    const nodes: Node[] = [], links: { a: Node; b: Node; kind: 'inside' | 'hop'; label?: string; time?: string }[] = [];
    let rows = 0, cols = 0;
    // Each good, its building to the left, that building's inputs further left; a leaf takes a row.
    function good(i: ItemId, st: Step | null, col: number, key: boolean): Node {
      const g: Node = { kind: 'good', label: ITEMS[i].name, icon: i, col, row: 0, go: { kind: 'goods' } };
      nodes.push(g); cols = Math.max(cols, col);
      if (!st) { g.row = rows++; return g; }
      const b: Node = { kind: 'building', label: BUILDINGS[st.building].name, icon: st.building, col: col + 1, row: 0, key, go: { kind: 'building', id: st.building } };
      nodes.push(b); cols = Math.max(cols, col + 1);
      links.push({ a: b, b: g, kind: 'inside', time: `${st.time} s`, label: st.verb });
      const ins = st.inputs.map((ing) => {
        if ('item' in ing) return good(ing.item, ing.from, col + 2, false);
        const n: Node = { kind: 'group', label: GROUP_NAMES[ing.group].split(' (')[0], icon: GROUPS[ing.group][0], col: col + 2, row: rows++ };
        nodes.push(n); cols = Math.max(cols, col + 2);
        return n;
      });
      // Between buildings a good goes next door or by truck: the dashed line says so (and the key under the chain).
      for (const n of ins) links.push({ a: n, b, kind: 'hop' });
      b.row = ins.length ? (ins[0].row + ins[ins.length - 1].row) / 2 : rows++;
      g.row = b.row;
      return g;
    }
    good(item, c.from, 0, true);
    const CW = 104, RH = 104, W = (cols + 1) * CW, H = Math.max(1, rows) * RH;
    const px = (n: Node) => (cols - n.col) * CW + CW / 2, py = (n: Node) => n.row * RH + 44;
    const lines = links.map((l) => svg('path', { d: `M ${px(l.a) + 30} ${py(l.a)} C ${(px(l.a) + px(l.b)) / 2} ${py(l.a)}, ${(px(l.a) + px(l.b)) / 2} ${py(l.b)}, ${px(l.b) - 30} ${py(l.b)}`, class: l.kind }));
    const labels = links.filter((l) => l.kind === 'inside').map((l) => h('span', { class: `link-label ${l.kind}`, style: `left: ${(px(l.a) + px(l.b)) / 2}px; top: ${(py(l.a) + py(l.b)) / 2 - (l.kind === 'inside' ? 40 : 30)}px` },
      l.time ? h('b', null, l.time) : null, l.label ?? ''));
    return h('div', null,
      h('div', { class: 'row-head sec' }, h('span', { class: 'cd-label' }, `Where ${lc(item)} comes from`), h('span', { class: 'cd-small cd-faint' }, 'times in general, at full speed')),
      // A long chain on a narrow page scrolls sideways rather than spilling over the side column.
      h('div', { class: 'chain-scroll' }, h('div', { class: 'chain', style: `width: ${W}px; height: ${H + 20}px` },
        svg('svg', { width: W, height: H + 20, viewBox: `0 0 ${W} ${H + 20}` }, ...lines), ...labels,
        ...nodes.map((n) => h('button', { class: `node is-${n.kind}${n.key ? ' is-key' : ''}`, style: `left: ${px(n)}px; top: ${py(n) - 26}px`, onclick: () => n.go && go(n.go) },
          h('span', { class: 'disc' }, icon(n.icon, n.key ? 46 : 36)), n.label)))),
      h('div', { class: 'cd-small chain-key' }, h('span', null, h('i', { class: 'solid' }), 'inside a building'),
        h('span', null, h('i', { class: 'dashed' }), 'next door: straight across a shared edge · or by truck: depends on your routes'), h('span', null, 'Then by truck to the depot.')));
  }

  /** The building's numbers as rows: reach, storage, speeds. */
  function numbers(id: BuildingId): HTMLElement[] {
    const rows: [string, string][] = [];
    switch (id) {
      case 'silo': rows.push(['Holds', `${SILO.perGood} of each good`], ['Loads', `${plural(bays('silo'), 'truck')} at a time`]); break;
      case 'garage':
        rows.push(['Holds', `${TRUCK.perGarage} trucks`], ['A truck costs', `${TRUCK.cost} credits`], ['A truck carries', `${TRUCK.cargo} goods, of any mix`],
          ['Speed', `${TRUCK.speed} tiles a second (${TRUCK.crawl} on an empty battery)`], ['Loading and unloading', `${TRUCK.moveRate} goods a second`],
          ['Battery', `${TRUCK.battery} J, ${TRUCK.joulesPerTile} J a tile driven`], ['Charging', `${TRUCK.chargeRate} W a truck`]);
        break;
      case 'field':
        rows.push(['Grow times are for', 'a watered field at soil 60'], ['Without water', `×${FIELD.dry} speed (sunflower ×${waterPace(0, CROPS.sunflower.thirst)})`],
          ['Soil 0 → 100', `×${FIELD.poorSoil} → ×${FIELD.richSoil} speed`], ['Holds', `${FIELD.store} harvested goods`],
          ['Compost', `taken only below soil ${FIELD.compostBelow}: +${FIELD.compostGain} on every tile at once`]);
        break;
      case 'greenhouse':
        rows.push(['Grow times are for', 'a watered greenhouse at soil 60'], ['Inside', 'the crop\'s lowest full-speed warmth, or the outside if warmer; vented above its highest'], ['Heating', `${GREENHOUSE.loss} W for each °C the outside is below it`], ['Cooling', `with less power it drifts toward the outside, ${GREENHOUSE.capacity / GREENHOUSE.loss} hours to most of the way`],
          ['Wheat, beans, flax', `${CROPS.wheat.comfort.low}°C`], ['Sunflower', `${CROPS.sunflower.comfort.low}°C`], ['Tomato', `${CROPS.tomato.comfort.low}°C`],
          ['Holds', `${FIELD.store} harvested goods`], ['Compost', `taken only below soil ${FIELD.compostBelow}: +${FIELD.compostGain} on every tile at once`]);
        break;
      case 'sprinkler': rows.push(['Reach', `fields whose centre is within ${POWER.sprinklerReach} tiles`], ['Near water', `within ${POWER.waterNear} tiles`]); break;
      case 'hive':
        rows.push(['Reach', `${HIVE.reach} tiles`], ['Honey', `one every ${HIVE.honeySeconds} s with 1 flowering field, ${HIVE.honeySeconds / HIVE.maxFlowers} s with ${HIVE.maxFlowers}`],
          ['Holds', `${HIVE.store} honey`], ['Pollinated fields', `+${POLLINATION_BONUS} good every harvest of a flowering crop`]);
        break;
      case 'solar': rows.push(['At midday, full sun', `${POWER.solar} W (times the sun's strength)`], ['At night', '0 W']); break;
      case 'turbine': rows.push(['In full wind', `${POWER.turbine} W`], ['Shelter', `−${POWER.shelter * 100}% for each tree or tall building within ${POWER.shelterReach} tiles, down to ${POWER.shelterFloor * 100}%`]); break;
      case 'battery': rows.push(['Stores', `${POWER.battery.capacity} J (${Math.round(POWER.battery.capacity / 60)} W for a minute)`], ['Charges and gives', `up to ${POWER.battery.rate} W`]); break;
      case 'station': rows.push(['Sees', 'three days ahead'], ['Renewed', 'every game hour, while it has power'], ['A second', 'adds nothing: one is enough']); break;
      case 'pylon': rows.push(['Powers', `buildings with a tile within ${POWER.pylon.reach} tiles`], ['Links to', `pylons within ${POWER.pylon.link} tiles`]); break;
      case 'sapling': rows.push(['Grows into a tree in', `${SAPLING_SECONDS} s`]); break;
      case 'depot': rows.push(['Pays', 'each good\'s price (see Goods)'], ['Loads', `${plural(bays('depot'), 'truck')} at a time`]); break;
    }
    if (recipesFor(id).length && id !== 'digester') rows.push(['Buffers', `${INPUT_BATCHES} batches of each input, ${OUTPUT_BATCHES} of each output`]);
    if (BUILDINGS[id].tall) rows.push(['Tall', `shelters wind turbines within ${POWER.shelterReach} tiles`]);
    if (BUILDINGS[id].onWater) rows.push(['Water', 'can be built on water']);
    return rows.map(([k, v]) => h('div', { class: 'cd-row' }, h('span', null, k), h('i'), h('b', null, v)));
  }

  function extraTables(id: BuildingId): Node[] {
    if (id !== 'field') return [];
    return [h('div', { class: 'cd-label sec' }, 'Crops'), h('table', { class: 'gtable' },
      h('tr', null, h('th', null, 'Crop'), h('th', null, 'Grows in'), h('th', null, 'Harvest'), h('th', null, 'Soil a harvest'), h('th', null, 'Flowers'), h('th', null, 'Comfortable'), h('th', null, 'Frost'), h('th', null, 'Ground')),
      ...CROP_IDS.map((c) => { const k = CROPS[c]; return h('tr', null, h('td', null, h('span', { class: 'gname' }, icon(c, 24), k.name)), h('td', null, `${k.grow} s`), h('td', null, String(k.yield)), h('td', null, `${k.soil > 0 ? '+' : ''}${k.soil}`), h('td', null, k.flowers ? 'yes' : '—'), h('td', null, `${k.comfort.low}–${k.comfort.high}°C`), h('td', null, k.tender ? `tender: lost in open fields, stops below ${FIELD.tenderStops}°C` : 'hardy: grows slowly in winter'), h('td', null, cropGroundWords(k))); }))];
  }

  // ---- Goods ----

  function makers(item: ItemId): BuildingId[] {
    const out = new Set<BuildingId>(RECIPES.filter((r) => r.outputs.some((o) => o.item === item)).map((r) => r.building));
    if ((CROP_IDS as readonly string[]).includes(item)) { out.add('field'); out.add('greenhouse'); }
    if (item === 'honey') out.add('hive');
    return [...out];
  }
  function users(item: ItemId): BuildingId[] {
    const inGroup = (g: keyof typeof GROUPS) => (GROUPS[g] as readonly ItemId[]).includes(item);
    const out = new Set<BuildingId>(RECIPES.filter((r) => r.inputs.some((i) => ('item' in i ? i.item === item : inGroup(i.group)))).map((r) => r.building));
    if (item === 'compost') { out.add('field'); out.add('greenhouse'); }
    return [...out];
  }
  const joined = (ids: BuildingId[]) => (ids.length ? ids.flatMap((id, i) => [i ? ', ' : '', bLink(id)]) : ['—']);

  function goodsPage(): Node[] {
    return [
      h('div', { class: 'cd-small cd-faint' }, 'Goods'), h('h1', { class: 'cd-display' }, 'Goods'),
      h('p', { class: 'lead' }, 'Every good trucks carry, where it comes from and where it goes. Any good delivered to the depot pays its price.'),
      h('table', { class: 'gtable goods' },
        h('tr', null, h('th', null, 'Good'), h('th', null, 'Made by'), h('th', null, 'Used by'), h('th', null, 'Pays')),
        ...ITEM_IDS.map((i) => h('tr', null,
          h('td', null, h('span', { class: 'gname' }, icon(i, 30), h('span', null, h('b', null, ITEMS[i].name), h('div', { class: 'cd-small' }, ITEMS[i].hint)))),
          h('td', null, ...joined(makers(i))), h('td', null, ...joined(users(i))), h('td', { class: 'n' }, String(ITEMS[i].price))))),
    ];
  }

  // ---- Seasons ----

  const SEASON_LEAD: Record<Season, string> = {
    spring: 'Showers and a full river, with the days lengthening.',
    summer: 'Long bright days and strong sun, with little rain and a low river.',
    autumn: 'The days shorten and the wind picks up.',
    winter: 'Short cold days with frost, snow instead of rain, and a slow river.',
  };

  /** What a character moves, as words: "high +3°C, rain −4 points". */
  function shiftWords(shift: Shift): string {
    const out: string[] = [];
    const add = (label: string, d: number | undefined, unit: 'points' | '°C' | 'h' | '×') => {
      if (d === undefined || d === 0) return;
      const n = unit === 'points' ? Math.round(d * 100) : d, sign = d > 0 ? '+' : '−';
      out.push(`${label} ${sign}${Math.abs(n)}${unit === 'points' ? ' points' : unit}`);
    };
    add('sun', shift.sun?.strength, 'points'); add('wind', shift.wind?.mean, 'points'); add('gusts', shift.wind?.gust, 'points');
    add('river', shift.river?.flow, '×'); add('cloud', shift.conditions?.cloud, 'points'); add('rain', shift.conditions?.rain, 'points'); add('calm', shift.conditions?.calm, 'points');
    add('low', shift.warmth?.low, '°C'); add('high', shift.warmth?.high, '°C'); add('hens', shift.hens?.lay, 'points');
    return out.join(', ');
  }

  function seasonPage(id: Season): Node[] {
    const c = climateOf(id), info = SEASONS[id];
    const STEP = 12, samples = Array.from({ length: 24 * STEP }, (_, k) => warmthByHour(c, k / STEP));
    const hoursIn = (lo: number, hi: number) => samples.filter((t) => t >= lo && t <= hi).length / STEP;
    const row = (k: string, v: string) => h('div', { class: 'cd-row' }, h('span', null, k), h('i'), h('b', null, v));
    const flying = Math.round(hoursIn(ANIMALS.beesFly, Infinity));
    return [
      h('div', { class: 'cd-small cd-faint' }, 'Seasons'), h('h1', { class: 'cd-display' }, info.name), h('p', { class: 'lead' }, SEASON_LEAD[id]),
      h('div', { class: 'cd-label sec' }, `${info.name} in an ordinary year`),
      h('div', { class: 'num-rows' },
        row('Sun', `${clock(c.sun.rise)} to ${clock(c.sun.set)}, ${pct(c.sun.strength)} at noon`),
        row('Wind', `${pct(c.wind.mean)}, swinging ${pct(c.wind.gust)} either way`),
        row('Warmth', `${Math.round(c.warmth.low)} to ${Math.round(c.warmth.high)}°C in a day, a day straying up to ${c.warmth.drift}°C either way`),
        row(id === 'winter' ? 'Snow' : 'Rain', `${pct(c.conditions.rain)} chance in each spell`),
        row('Cloud', `${pct(c.conditions.cloud)} chance in each spell`),
        row('Calm spells', `${pct(c.conditions.calm)} chance in each spell`),
        row('River', `${riverSeason(c.river.flow)}, ×${c.river.flow.toFixed(1)} the map's current`)),
      h('div', { class: 'cd-label sec' }, 'Crops'),
      h('table', { class: 'gtable' },
        h('tr', null, h('th', null, 'Crop'), h('th', null, 'Comfortable'), h('th', null, 'Hours a day in range, before drift and rain'), h('th', null, 'Frost')),
        ...CROP_IDS.map((x) => { const k = CROPS[x]; return h('tr', null, h('td', null, h('span', { class: 'gname' }, icon(x, 24), k.name)), h('td', null, `${k.comfort.low}–${k.comfort.high}°C`),
          h('td', null, (n => (n ? `about ${n} of 24` : 'none'))(Math.round(hoursIn(k.comfort.low, k.comfort.high)))), h('td', null, c.warmth.low < 0 ? (k.tender ? 'lost in open fields' : 'hardy') : '—')); })),
      h('div', { class: 'cd-label sec' }, 'Hens and bees'),
      h('div', { class: 'num-rows' },
        row('Hens', `lay at ${pct(c.hens.lay)} of their full rate${c.warmth.high + c.warmth.drift > ANIMALS.henHeat ? `, slower above ${ANIMALS.henHeat}°C` : ''}`),
        row('Bees', flying === 24 ? 'fly all day' : flying === 0 ? `stay in: below ${ANIMALS.beesFly}°C all day` : `fly about ${flying} hours of 24 (from ${ANIMALS.beesFly}°C)`)),
      h('div', { class: 'cd-label sec' }, 'Characters'),
      h('div', { class: 'num-rows' }, ...charactersOf(id).map((x) => row(seasonName({ season: id, character: x }), shiftWords(CHARACTERS[x].shift)))),
    ];
  }

  // ---- Weather events ----

  /** A weather event's page: when it comes, how long it lasts and what it does, as facts. */
  function eventPage(kind: EventKind): Node[] {
    const e = EVENTS[kind], row = (k: string, v: string) => h('div', { class: 'cd-row' }, h('span', null, k), h('i'), h('b', null, v));
    const hrs = (r: readonly [number, number]) => `${r[0]}–${r[1]} hours`;
    const seasons = SEASON_IDS.filter((x) => (e.seasons[x] ?? 0) > 0).map((x) => SEASONS[x].name.toLowerCase()).join(' and ');
    const d = must(eventText(link, bLink)[kind], `a guide page for ${kind}`);
    return [
      h('div', { class: 'cd-small cd-faint' }, `Weather events · ${e.good ? 'a good one' : 'a bad one'}`), h('h1', { class: 'cd-display' }, e.name), h('p', { class: 'lead' }, d.lead),
      h('div', { class: 'cd-label sec' }, 'When'),
      h('div', { class: 'num-rows' },
        row('Comes in', e.only ? `${seasons}, ${e.only.map((c) => CHARACTERS[c].word).join(' or ')} character only` : seasons),
        row('Lasts', e.severeHours ? `${hrs(e.hours)}; severe ${hrs(e.severeHours)}` : hrs(e.hours)),
        e.begins ? row('Begins', `between ${clock(e.begins[0])} and ${clock(e.begins[1])}`) : null,
        row('Severe form', e.severe ? 'yes' : 'none: it only helps'),
        row('Builds in', 'over the first hour and a half, and fades out over the last')),
      h('div', { class: 'cd-label sec' }, 'What it does'),
      h('ul', null, ...d.does.map((x) => h('li', null, ...x))),
      ...(d.severe ? [h('div', { class: 'cd-label sec' }, 'Severe'), h('ul', null, ...d.severe.map((x) => h('li', null, ...x)))] : []),
    ];
  }

  // ---- Topics ----

  function topicPage(id: TopicId): Node[] {
    const P = (...c: (Node | string)[]) => h('p', null, ...c);
    const B = (t: string) => h('b', null, t);
    const head = (title: string, lead: string | (Node | string)[]) => [h('div', { class: 'cd-small cd-faint' }, 'Topics'), h('h1', { class: 'cd-display' }, title), h('p', { class: 'lead' }, ...(Array.isArray(lead) ? lead : [lead]))];
    switch (id) {
      case 'start': return [
        ...head('First steps', 'Each commission asks for goods. You build a farm that makes them by itself: fields grow crops, trucks carry them to machines on the routes you set, machines make products, and trucks take those to the depot.'),
        h('ol', { class: 'how' },
          h('li', null, 'Pick a building in the dock at the bottom. Point at its tile to see what it does; its page is here in the guide.'),
          h('li', null, B('Click'), ' to place it, or ', B('drag'), ' to place a row. The card over it says what it would do there, or why it doesn\'t fit.'),
          h('li', null, 'Build a ', bLink('garage'), ', buy a truck and give it a route through your buildings (see ', link('Trucks and routes', { kind: 'topic', id: 'trucks' }), '). Power the garage and the machines with ', bLink('solar'), ' panels and ', bLink('pylon'), 's.'),
          h('li', null, 'Watch it run. A marker over a building means something is wrong: its shape and colour say what (see ', link('Statuses and markers', { kind: 'topic', id: 'markers' }), '). Click the building for the details and its history.'),
          h('li', null, 'The Ledger shows what is made, used and delivered a minute; the Power panel shows where the watts come from and go.')),
        ...(s?.scenario.tips?.length ? [h('div', { class: 'cd-label sec' }, `For ${s.scenario.name}`), h('ol', { class: 'how' }, ...s.scenario.tips.map((t) => h('li', null, t)))] : []),
      ];
      case 'trucks': return [
        ...head('Trucks and routes', ['There are no belts and no roads to build: trucks carry every good, over the open ground between buildings, along the routes you give them. ', bLink('silo'), 's store goods; trucks are bought at a ', bLink('garage'), '.']),
        h('div', { class: 'cd-label sec' }, 'Routes'),
        P(`A route is a loop of up to ${TRUCK.maxStops} stops. At each stop its trucks `, B('drop'), ' some goods (only what the building takes) and ', B('pick up'), ' others; a good is dropped or picked up, never both. They drive stop 1, 2, … the last, then stop 1 again.'),
        h('ul', null,
          h('li', null, 'Make one: open Routes, choose New route, then click buildings on the map, in order. Esc when done.'),
          h('li', null, 'A new stop picks up everything the building makes and drops everything it takes: a field, then a mill, then the ', bLink('depot'), ' is a whole route. A silo stop drops everything; choose what to take from it.'),
          h('li', null, `At a stop a truck drops first, then picks up into the room left. It leaves once it has moved what it can; give a stop a wait (up to ${TRUCK.maxWait} s) and it waits that long for room or goods.`),
          h('li', null, 'More trucks make a route faster. Two routes picking up the same good share it by how often their trucks come.'),
          h('li', null, `The routes card shows each route's loop time and how often a truck reaches its slowest stop, measured from the last ${FLEET_SECONDS / 60} minutes, and how much of the time each truck waited at stops.`),
          h('li', null, 'A truck stuck with goods no stop takes can dump its cargo: the goods are lost.')),
        h('div', { class: 'cd-label sec' }, 'Next door'),
        P('Buildings that share an edge trade without trucks: a machine takes what it uses from the buildings next door, a field takes compost. A ', bLink('mill'), ' between wheat fields grinds their wheat, a ', bLink('coop'), ' beside the mill eats its bran, a ', bLink('bakery'), ' beside both bakes their flour and eggs. Touching only at a corner doesn\'t count; ', bLink('silo'), 's and the ', bLink('depot'), ' trade only with trucks.'),
        P('A building takes from its neighbours before trucks load there, from whichever has the most. Selecting a building tints the neighbours it trades with, and placing one says who it would. Packed buildings leave trucks fewer open tiles, so keep a way in for the goods that still go by truck.'),
        h('div', { class: 'cd-label sec' }, 'Roads and charging'),
        P(`Trucks drive on any open grass, the easiest way, and pass through each other. To load, a truck parks on an open tile next to the building: a building with none can't be reached. The Roads view shows the open ground. A building loads ${plural(bays('silo'), 'truck')} at a time (the depot ${bays('depot')}); the others queue beside it.`),
        P(`A truck's battery holds ${TRUCK.battery} J, ${TRUCK.joulesPerTile} J a tile. When it would run short, it drives home to its garage and charges, from the garage's network. With no power there it goes on after ${TRUCK.giveUp} s, and crawls once empty.`),
        P('Climbing costs: every level up a slope counts as ', String(TRUCK.climb), ' more tiles, in time and in battery. Cliffs and steep banks stop trucks: they go the long way round, up a gentler slope. Goods next door don\'t pass across a cliff.'),
        P(`Mud: on `, B('clay'), ` a truck drives at ${Math.round(TRUCK.mudSpeed * 100)}% speed while it rains and for ${TRUCK.mudHours} game hours after. Frozen clay is firm (no mud below 0°C), and so is every other ground, sand most of all. Trucks do not go round mud: they still take the easiest way, and a truck slowed by it carries the "Slowed · mud" marker.`),
        h('div', { class: 'cd-label sec' }, 'Byproducts'),
        P('A machine stops when an output has nowhere to go, so every byproduct needs a home: a ', bLink('coop'), ', a ', bLink('composter'), ', a ', bLink('digester'), ' or the depot. Trucks share their room, so a truck full of something no stop takes carries nothing else.'),
      ];
      case 'land': return [
        ...head('Height and earthworks', 'The land rolls: the ground at each corner of a tile stands at a level, so it slopes gently from tile to tile. Here and there it breaks off in a cliff.'),
        h('ul', null,
          h('li', null, B('Building:'), ' machines, silos, garages, panels and batteries need flat ground at one level; a ', bLink('field'), ' can lie on a slope but not across a cliff; one-tile buildings stand anywhere. Placing on uneven ground levels it for you, at the earthworks price, and the ground round it slopes down or up to it.'),
          h('li', null, B('Trucks:'), ` they drive gentle slopes, but not steep banks (worn turf) or over a cliff. Each level climbed costs ${TRUCK.climb} more tiles, in time and in battery.`),
          h('li', null, B('Next door:'), ' buildings trade where the ground joins between them, not across a cliff.'),
          h('li', null, B('Water:'), ' a field is watered by water at its own level only. A ', bLink('sprinkler'), ` needs ${POWER.sprinklerLift} W more for every level it lifts water. The river turns a `, bLink('wheel'), ', best beside a fall.'),
          h('li', null, B('Wind:'), ' a ', bLink('turbine'), ` gets ${Math.round(POWER.windPerLevel * 100)}% more wind a level up; higher ground beside it shelters it.`),
          h('li', null, B('Soil:'), ' low ground is richer, high ground poorer. Fields on slopes wear faster, the steeper the faster, unless trees or beans hold the soil.')),
        h('div', { class: 'cd-label sec' }, 'Earthworks'),
        P(`Earthworks (in the dock) raise or lower the ground a level at the point you click, where tiles meet, and the ground that joins there moves with it; drag to raise or lower an area. Level flattens a tile, or the tiles you drag over. Each point moved a level is a step, ${EARTH.step} credits. A tile can't grow steeper than a steep bank, so a hill is built up a level at a time. Clear trees and rock first; nothing built can move, and ground can't go below the water beside it. Earthworks aren't refunded.`),
        P('The Height view tints the ground by height, with steep banks darker.'),
      ];
      case 'power': return [
        ...head('Power', 'Machines, sprinklers and garages (to charge their trucks) need power. Power travels only through pylons.'),
        h('ul', null,
          h('li', null, 'A building is powered when one of its tiles is within ', String(POWER.pylon.reach), ' tiles of a ', bLink('pylon'), '. Pylons within ', String(POWER.pylon.link), ' tiles of each other link into one network.'),
          h('li', null, 'Each network adds up what its generators make and what its machines want. Spare power charges its ', bLink('battery'), ' banks; a shortfall drains them.'),
          h('li', null, 'If that isn\'t enough, every machine on the network slows to the share it gets.'),
          h('li', null, bLink('solar'), ' panels make nothing at night, and a ', bLink('turbine'), ' only makes power when there is wind. A ', bLink('digester'), ' is steady, but needs waste to burn; a ', bLink('wheel'), ' is steady too, but only on a river.')),
        P('The readouts at the top show the power made and used across all networks, and the charge stored. The Power panel has the last day hour by hour, by source, each network, where the watts go, and how tonight\'s charge will go if use stays as it is. The Power view draws each network in its own colour.'),
        P('Tonight\'s charge says what it assumes. Without a weather station it is for a usual night of the season: the sun follows its daily curve under the usual share of cloud, the wind is the season\'s mean less the usual calm spells, sprinklers rest for the usual share of the time it rains, and no weather event that has not begun is counted (one under way is taken to keep on). The weather of this hour holds for about an hour, then eases to the usual. With a station it is a band: the same night run for every way the forecast allows, with the events it names as early or late and as long or short as it says, and the sun, wind and rain inside the ranges the forecast gives for each stretch of hours (hour by hour for the next few, then three or six at a time). The line is the hardest of those nights; the batteries run dry "between" two times when every one of them does, and "may run dry from" a time when some last the night. A station that has lost power shows its last forecast ("from the forecast of day 4, 14:00"), and the weather past that is the usual.'),
      ];
      case 'soil': return [
        ...head('Soil and water', 'Fields are where every chain starts, and how fast they grow depends on water and soil.'),
        h('ul', null,
          h('li', null, B('Water:'), ` a dry field grows at ×${FIELD.dry} speed (sunflower ×${waterPace(0, CROPS.sunflower.thirst)}; all but stopped in heat above ${FIELD.heat}°C). A `, bLink('sprinkler'), ' waters fields whose centre is within ', String(POWER.sprinklerReach), ' tiles.'),
          h('li', null, B('Soil:'), ` growth goes from ×${FIELD.poorSoil} on soil 0 to ×${FIELD.richSoil} on soil 100. The Soil view shows fertility everywhere.`),
          h('li', null, B('Ground:'), ` each tile is loam, silt, clay, sand or stony, and a crop that likes a ground grows ×${FIELD.groundLike} on it, one that is poor on it ×${FIELD.groundPoor}; a field's pace is the average of its nine tiles (the crops on the `, bLink('field'), ` page say which). Stony ground is thin: its fertility never rises above ${FIELD.stonyCap}, even with compost or silt, and a field of mostly stony tiles yields ${FIELD.stonyLoss} less each harvest. A `, bLink('greenhouse'), ' counts its ground the same way.'),
          h('li', null, B('Wearing out:'), ' every harvest takes some soil (see the crops on the ', bLink('field'), ' page). Beans give some back.'),
          h('li', null, B('Compost:'), ` a field takes compost only while its soil is under ${FIELD.compostBelow} (and has room to rise: stony ground stops at ${FIELD.stonyCap}), and spreads each one at once for +${FIELD.compostGain} on every tile; above that, trucks carry it on to the next field. Make it in a `, bLink('composter'), '.'),
          h('li', null, B('Resting:'), ` ground without a field slowly recovers (${FIELD.rest * 60} a minute), up to what it started at.`),
          h('li', null, B('Soil health'), ` is the fields' average fertility, nudged up or down (at most ${TREE_HEALTH.cap}) by trees planted or cleared. A soil goal checks it at the end.`),
          h('li', null, B('Clearing:'), ` a tree costs ${CLEAR_COST.tree} credits to remove and a rock ${CLEAR_COST.rock}. `, bLink('sapling'), 's plant new trees.')),
      ];
      case 'weather': return [
        ...head('Seasons and weather', 'A commission happens in one season, which does not change while you play. The season sets the days, the wind, the warmth, the rain and the river; a character such as wet, hot or hard shifts them.'),
        h('ul', null,
          h('li', null, B('Weather:'), ' inside a season the sky changes: clear, cloudy, rain (snow in winter). The chip beside the dial shows the weather now and the warmth in °C. Cloud dims solar panels, calm spells slow the wind, and rain or snow cools the valley by up to ', String(RAIN_COOLING), '°C.'),
          h('li', null, B('Rain'), ' waters every open field and the ', bLink('sprinkler'), 's rest. Snow does not water fields.'),
          h('li', null, B('Warmth:'), ' a crop grows at full speed inside its comfortable range and slower the further outside it, falling to half speed ', String(FIELD.warmthWidth), '°C beyond it. Tender crops are lost to frost (below ', String(FROST), '°C) in an open field and stop growing below ', String(FIELD.tenderStops), '°C. A ', bLink('greenhouse'), ' holds its crop at the warmth it needs, for power, in any season, and is why winter can be farmed at all. The crop table is on the ', bLink('field'), ' page.'),
          h('li', null, B('Animals:'), ' hens lay at the season\'s share of their full rate and slow above ', String(ANIMALS.henHeat), '°C. Bees stay in below ', String(ANIMALS.beesFly), '°C: no honey and no pollination, except at a ', bLink('greenhouse'), ' that works and grows a flowering crop.'),
          h('li', null, B('River:'), ' the season sets the current, so what a ', bLink('wheel'), ' makes.')),
        h('div', { class: 'cd-label sec' }, 'The seasons'),
        h('div', { class: 'chips' }, ...SEASON_IDS.map((x) => h('button', { class: 'cd-chip', onclick: () => go({ kind: 'season', id: x }) }, `${SEASONS[x].name} · ${Math.round(SEASONS[x].levers.warmth.low)} to ${Math.round(SEASONS[x].levers.warmth.high)}°C`))),
        h('div', { class: 'cd-label sec' }, 'Weather events'),
        P('Now and then an event passes through a valley: it lasts half a day to two days, builds in and fades out. Each has its own page. The briefing names the events the season can bring, never when; you learn of one the moment it starts, in the sky and by its name on the chip, unless you have a weather station.'),
        h('div', { class: 'chips' }, ...GUIDED_EVENTS.map((x) => h('button', { class: 'cd-chip', onclick: () => go({ kind: 'event', id: x }) }, EVENTS[x].name))),
        h('div', { class: 'cd-label sec' }, 'With and without a station'),
        h('ul', null,
          h('li', null, B('Without one'), ' you see the weather now (the chip by the dial, the sky) and an event once it has started. The screens that look ahead, the Power panel\'s "tonight" and a field\'s soil in ten minutes, are for a usual night or day of the season, with no event that has not begun.'),
          h('li', null, B('With one'), ' you also see the next three days: the forecast panel, a small mark on the chip while something is due in the next day, and a band instead of a line on those same screens, worked out for every way the forecast allows. A station is cheap (', `${BUILDINGS.station.cost} credits, ${BUILDINGS.station.power} W`, ') and can be built in any commission.')),
        h('div', { class: 'cd-label sec' }, 'Reading the forecast'),
        P('A ', bLink('station'), ` gives the forecast panel (${keyNames('forecast').join(' or ')}): the next three days, a column a day, renewed every game hour while the station has power.`),
        h('ul', null,
          h('li', null, B('Ranges:'), ' a day\'s high and low are ranges ("low −1 to 3°C, high 8 to 12°C"), and so are its sun, wind and rain, in words ("cloudy to partly cloudy"; for rain, the hours it falls). What really happens is always inside them. A range that is a single value is the whole truth.'),
          h('li', null, B('They narrow as the day comes:'), ' three days out a day\'s warmth is told to about ±4°C and its sun, wind and rain not at all; two days out the ranges are narrower and tomorrow\'s narrower still; today\'s are the sharpest. A range never grows again: each hour\'s lies inside the last one\'s.'),
          h('li', null, B('Through the day:'), ' under today\'s and tomorrow\'s conditions, the day is told in stretches of six hours ("tomorrow 06:00–12:00: sunny, light wind, dry"), each the least and most of the forecast\'s blocks of hours that fall in it. They are the weather with no event in it: an event listed beside a stretch comes on top, so a gale can arrive in an hour that is told as calm.'),
          h('li', null, B('Events:'), ' each has the window it will happen in ("a gale, likely 10:00–22:00"), then when it can begin, when it can end and how long it can last. Three days out only its family is named ("a storm, possible"), two days out its kind ("a tropical storm, likely", which may still grow to a hurricane), and from tomorrow all of it. "Possible" means only that it is vague: an event that is listed comes. One that is not listed is not told yet; it is not ruled out.'),
          h('li', null, B('Hard turns and kind turns:'), ' a triangle on a square-cornered card is a hard turn (a storm, a flood, a frost, a fog); a circle on a round card is a kind one (soft rain, a warm spell, a steady breeze). The chip by the dial carries a small triangle or circle while the forecast names one in the next day; hold the pointer on it for what.'),
          h('li', null, B('Out of date:'), ' a station without power (or short of it, cut off from a pylon, or under flood water) stops renewing the forecast. The panel says "Out of date" and why, keeps what the forecast last said, and drops the times already past; its ranges stop narrowing until the power is back.')),
      ];
      case 'markers': return [...head('Statuses and markers', 'A marker floats over any building that isn\'t working. Each has a shape as well as a colour; click the building for the details.'),
        markersCard(),
        P('A slate marker with a shape of its own means the weather is holding the building (or a truck) back, not the layout: a storm or fog dimming a panel, a heat wave slowing the hens. The inspector names the event, and the results say what each event cost.'),
        P(`A building's inspector has its history: a ribbon of what it was doing over the last ${HISTORY_WINDOWS.slice(0, -1).map((w) => w / 60).join(', ')} or ${HISTORY_WINDOWS[HISTORY_WINDOWS.length - 1] / 60} minutes, the share of time in each status, its output against full speed, and what it waited for most. Solar panels, turbines and batteries chart their power or charge instead.`)];
      case 'keys': return [...head('Keys', 'Every key, and the mouse. Change the keys in Settings, on the level select and the pause screen.'), keysCard()];
    }
  }

  draw();
  return h('div', { class: 'cd-card guide' }, index, body);
}

/** Every key and what it does, as they are set now, for the guide's search. */
const keyList = (): [string, string][] => [...ACTIONS.map((a): [string, string] => [a.label, keyNames(a.id).join(' ')]).filter(([, k]) => k), ['Close a panel, pause', 'Esc']];

/** What a building does with power, in a few words. */
function powerLine(id: BuildingId): string {
  const d = BUILDINGS[id];
  if (id === 'sprinkler') return `uses ${POWER.sprinklerNearWater} W near water, else ${POWER.sprinklerFar} W, more up high`;
  if (id === 'wheel') return `makes about ${POWER.wheel} W, ${POWER.wheelFall}× beside a fall`;
  if (id === 'garage') return `up to ${TRUCK.chargeRate} W for each truck charging`;
  if (id === 'station') return `uses ${d.power} W all the time`;
  if (d.power) return `uses ${d.power} W while working`;
  if (d.heated) return `uses ${GREENHOUSE.loss} W for each °C the outside is below its crop's warmth`;
  if (id === 'solar') return `makes up to ${POWER.solar} W in full sun`;
  if (id === 'turbine') return `makes up to ${POWER.turbine} W`;
  if (id === 'digester') return `makes ${POWER.digester} W while burning`;
  if (id === 'battery') return `stores ${POWER.battery.capacity} J`;
  if (id === 'pylon') return 'carries it';
  return 'none';
}

/** A short card about a building, for pointing at its tile in the dock. */
export function buildingCard(id: BuildingId, price: number): HTMLElement {
  const d = BUILDINGS[id], e = ENTRIES[id], rs = recipesFor(id);
  const chip = (i: ItemId, n: number) => h('span', { class: 'cd-chip' }, icon(i, 20), `${n} ${lc(i)}`);
  return h('div', null,
    h('div', { class: 'head' }, icon(id), h('div', null, h('b', { style: 'font-size: 17px' }, d.name),
      h('div', { class: 'cd-small' }, `${price ? `${price} credits` : 'free'} · ${d.size} × ${d.size} · power: ${powerLine(id)}`))),
    h('p', null, e.what),
    ...rs.map((r) => h('div', { class: 'recipe cd-small' },
      ...r.inputs.flatMap((i, k) => [k ? '+' : '', 'item' in i ? chip(i.item, i.n) : h('span', { class: 'cd-chip' }, `${i.n} ${GROUP_NAMES[i.group].split(' (')[0]}`)]),
      '→', ...(r.outputs.length ? r.outputs.flatMap((o, k) => [k ? '+' : '', chip(o.item, o.n)]) : [`${POWER.digester} W`]),
      ` ${r.time} s`)),
    h('p', { class: 'cd-small' }, e.how[0]));
}
