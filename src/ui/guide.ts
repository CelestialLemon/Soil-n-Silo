import {
  BUILDINGS, CATEGORIES, CLEAR_COST, CROP_IDS, CROPS, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEM_IDS, ITEMS, OUTPUT_BATCHES,
  POWER, RECIPES, recipesFor, SAPLING_SECONDS, SILO, TRUCK, type BuildingId, type Ingredient, type ItemId, type Recipe,
} from '../game/data.ts';
import { h } from './dom.ts';

// The guide: a page for every building (what it does, how to use it, its numbers, what it takes and makes), a page of
// goods, and a few pages on the basics (trucks and routes, power, soil, the markers). The words are written here; every number comes
// from data.ts, so the guide stays right when the game is tuned.

export type GuidePage = { kind: 'building'; id: BuildingId } | { kind: 'topic'; id: TopicId } | { kind: 'goods' };

export interface GuideHost {
  /** Picks a building to place (and closes the guide). */
  build(id: BuildingId): void;
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
      'It loads one truck at a time. A queue of trucks beside it means it is busy: a second silo shares the work.',
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
    what: 'Grows the chosen crop on its 3 × 3 tiles. Crops are the start of every chain.',
    how: [
      'Build it on good soil: the hover line shows its average fertility, and the Soil overlay (V) shows the whole map.',
      'Select it and choose the crop. Wheat is the default.',
      'Build it beside the machine that uses its crop (a mill for wheat), and the machine takes the harvest itself. Or make it a stop on a route: trucks pick up the harvest. A full field stops growing.',
      'Put a sprinkler within 3 tiles of its centre: dry fields grow at under half speed.',
    ],
    tips: [
      'Every harvest wears the soil out, except beans, which restore it. Compost brings it back: a field stop drops compost by itself.',
      'A beehive within 4 tiles adds 1 to every harvest of a flowering crop.',
    ],
  },
  sprinkler: {
    what: 'Waters every field whose centre is within reach. Watered fields grow at full speed.',
    how: [
      'Place it next to or between fields. The Water overlay shows what it reaches.',
      'Put it within a pylon\'s reach: it needs a little power all the time, less near water.',
    ],
    tips: ['One sprinkler between four fields waters all of them.'],
  },
  coop: {
    what: 'Four chickens turn feed (beans, bran or seed cake) into eggs, with manure on the side.',
    how: [
      'Build it beside a mill (bran) or a bean field, and it takes its feed from them; or bring feed on a route.',
      'A bakery or composter beside it takes its eggs or manure; trucks pick up the rest. Give the manure somewhere to go: a composter, a digester, or the depot.',
    ],
    tips: ['Its manure must go somewhere. A coop whose manure piles up stops laying.'],
  },
  hive: {
    what: 'Bees make honey from flowering fields nearby (anything but wheat), and pollinate them for a bigger harvest.',
    how: [
      'Place it within 4 tiles of flowering fields: up to 3 of them count. The Bees overlay shows its range.',
      'Build it beside a bakery making honey cake, or make it a stop on a route, so trucks pick up the honey.',
    ],
  },
  composter: {
    what: 'Turns waste (manure, bran, seed cake) into compost, which brings tired soil back.',
    how: [
      'Build it beside a coop or mill, or bring it manure, bran or seed cake on a route.',
      'A field beside it takes its compost. Take the rest to fields on a route: they keep it and use it when their soil drops.',
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
    what: 'Makes power from the sun: most at midday, nothing at night. The top bar shows how strong the sun is now; on some commissions it is weak.',
    how: ['Place it within a pylon\'s reach. Add batteries to keep machines running through the night.'],
  },
  turbine: {
    what: 'Makes power from the wind, day and night. The wind comes and goes.',
    how: ['Place it in the open, within a pylon\'s reach. Trees and tall buildings within 2 tiles shelter it and cost power.'],
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
    tips: ['Two networks that don\'t link don\'t share power. Each network has its own colour on the Power overlay (V): its reach, the wires between its pylons and a line to every building it powers.', 'Select or point at a pylon, or select any powered building, to see its network.'],
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
    tips: ['It loads two trucks at a time.'],
  },
};

export type TopicId = 'start' | 'trucks' | 'power' | 'soil' | 'markers';
const TOPICS: { id: TopicId; name: string }[] = [
  { id: 'start', name: 'How to play' }, { id: 'trucks', name: 'Trucks and routes' }, { id: 'power', name: 'Power' },
  { id: 'soil', name: 'Soil and water' }, { id: 'markers', name: 'Markers' },
];

const lc = (id: ItemId) => ITEMS[id].name.toLowerCase();
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const swatch = (id: ItemId) => h('i', { style: `background:#${ITEMS[id].colour.toString(16).padStart(6, '0')}` });

/** The guide's panel: a list of pages on the left and the open page on the right. */
export function guidePanel(start: GuidePage, host: GuideHost, close: () => void): HTMLElement {
  const nav = h('nav', { class: 'guide-nav' });
  const body = h('article', { class: 'guide-body' });
  let page = start;
  const same = (a: GuidePage, b: GuidePage) => a.kind === b.kind && ('id' in a ? a.id : '') === ('id' in b ? b.id : '');
  const go = (p: GuidePage) => { page = p; draw(); body.scrollTop = 0; };
  const link = (label: string | Node, p: GuidePage) => h('a', { href: '#', class: 'glink', onclick: (e: Event) => { e.preventDefault(); go(p); } }, label);
  const bLink = (id: BuildingId) => link(BUILDINGS[id].name, { kind: 'building', id });

  function draw() {
    const entry = (label: string, p: GuidePage) => h('button', { class: same(p, page) ? 'active' : '', onclick: () => go(p) }, label);
    nav.replaceChildren(
      h('h4', null, 'Basics'), ...TOPICS.map((t) => entry(t.name, { kind: 'topic', id: t.id })), entry('Goods', { kind: 'goods' }),
      ...CATEGORIES.flatMap((c) => [h('h4', null, c.name),
        ...(Object.keys(BUILDINGS) as BuildingId[]).filter((id) => BUILDINGS[id].category === c.id).map((id) => entry(BUILDINGS[id].name, { kind: 'building', id }))]),
      h('h4', null, 'Map'), entry(BUILDINGS.depot.name, { kind: 'building', id: 'depot' }));
    body.replaceChildren(...(page.kind === 'building' ? buildingPage(page.id) : page.kind === 'goods' ? goodsPage() : topicPage(page.id)));
  }

  // ---- Buildings ----

  function buildingPage(id: BuildingId): Node[] {
    const d = BUILDINGS[id], e = ENTRIES[id];
    const cat = CATEGORIES.find((c) => c.id === d.category)?.name ?? 'Map';
    const takes = takesOf(id), gives = givesOf(id);
    return [
      h('div', { class: 'gtitle' }, h('h2', null, d.name), h('span', { class: 'chip' }, cat),
        d.category ? h('button', { class: 'primary', onclick: () => { host.build(id); close(); } }, `Build${d.key ? ` (${d.key})` : ''}`) : null),
      h('div', { class: 'gfacts' },
        fact('Cost', d.category ? `${d.cost} credits` : '—'), fact('Size', `${d.size} × ${d.size}`),
        fact('Power', powerLine(id))),
      h('p', { class: 'lead' }, e.what),
      takes.length || gives.length ? h('div', { class: 'flow' },
        h('div', null, h('h4', null, 'Takes'), takes.length ? h('ul', null, ...takes) : h('p', { class: 'hint' }, 'Nothing.')),
        h('div', { class: 'arrow' }, '→'),
        h('div', null, h('h4', null, 'Gives'), gives.length ? h('ul', null, ...gives) : h('p', { class: 'hint' }, 'Nothing.'))) : null,
      h('h3', null, 'How to use it'), h('ol', null, ...e.how.map((t) => h('li', null, t))),
      ...numbers(id),
      e.tips ? h('h3', null, 'Tips') : null, e.tips ? h('ul', { class: 'tips' }, ...e.tips.map((t) => h('li', null, t))) : null,
    ].filter((x): x is HTMLElement => !!x);
  }

  const fact = (k: string, v: string) => h('div', null, h('span', null, k), h('b', null, v));

  /** A good, linked to the goods page. */
  const goodLink = (id: ItemId, n?: number) => h('span', { class: 'good' }, swatch(id), link(`${n !== undefined ? `${n} ` : ''}${lc(id)}`, { kind: 'goods' }));
  const ingredient = (ing: Ingredient) => ('item' in ing ? goodLink(ing.item, ing.n) : h('span', { class: 'good' }, `${ing.n} ${GROUP_NAMES[ing.group]}`));

  function takesOf(id: BuildingId): HTMLElement[] {
    if (id === 'field') return [h('li', null, goodLink('compost'), ' (optional, to restore the soil)')];
    if (id === 'depot' || id === 'silo') return [h('li', null, 'any good')];
    const ins = new Map<string, Ingredient>();
    for (const r of recipesFor(id)) for (const i of r.inputs) ins.set('item' in i ? i.item : i.group, i);
    return [...ins.values()].map((i) => h('li', null, 'item' in i ? goodLink(i.item) : `${GROUP_NAMES[i.group]}`));
  }
  function givesOf(id: BuildingId): HTMLElement[] {
    if (id === 'field') return [h('li', null, ...CROP_IDS.flatMap((c, i) => [i ? ', ' : '', goodLink(c)]), ' (the crop you choose)')];
    if (id === 'hive') return [h('li', null, goodLink('honey'))];
    if (id === 'digester') return [h('li', null, `${POWER.digester} W of power`)];
    if (id === 'depot') return [h('li', null, 'credits, and progress on the commission')];
    if (id === 'silo') return [h('li', null, 'the goods it holds, to trucks that pick them up')];
    const outs = new Set<ItemId>();
    for (const r of recipesFor(id)) for (const o of r.outputs) outs.add(o.item);
    return [...outs].map((o) => h('li', null, goodLink(o)));
  }

  /** The building's numbers: recipes with their pace, crops, reach, storage. */
  function numbers(id: BuildingId): HTMLElement[] {
    const rows: [string, string][] = [];
    const out: HTMLElement[] = [];
    const rs = recipesFor(id);
    if (rs.length) out.push(h('h3', null, rs.length > 1 ? 'Recipes' : 'Recipe'), recipeTable(rs));
    switch (id) {
      case 'silo': rows.push(['Holds', `${SILO.perGood} of each good`], ['Loads', 'one truck at a time']); break;
      case 'garage':
        rows.push(['Holds', `${TRUCK.perGarage} trucks`], ['A truck costs', `${TRUCK.cost} credits`], ['A truck carries', `${TRUCK.cargo} goods, of any mix`],
          ['Speed', `${TRUCK.speed} tiles a second (${TRUCK.crawl} on an empty battery)`], ['Loading and unloading', `${TRUCK.moveRate} goods a second`],
          ['Battery', `${TRUCK.battery} J, ${TRUCK.joulesPerTile} J a tile driven`], ['Charging', `${TRUCK.chargeRate} W a truck`]);
        break;
      case 'field':
        out.push(h('h3', null, 'Crops'), h('table', null,
          h('tr', null, h('th', null, 'Crop'), h('th', null, 'Grows in'), h('th', null, 'Harvest'), h('th', null, 'Soil per harvest'), h('th', null, 'Flowers')),
          ...CROP_IDS.map((c) => { const k = CROPS[c]; return h('tr', null, h('td', null, goodLink(c)), h('td', null, `${k.grow} s`), h('td', null, String(k.yield)), h('td', null, `${k.soil > 0 ? '+' : ''}${k.soil}`), h('td', null, k.flowers ? 'yes' : '—')); })));
        rows.push(['Grow times are for', 'a watered field at soil 60'], ['Without water', `×${FIELD.dry} speed`],
          ['Soil 0 → 100', `×${FIELD.poorSoil} → ×${FIELD.richSoil} speed`], ['Holds', `${FIELD.store} harvested goods, ${FIELD.compostStore} compost`],
          ['Compost', `used below soil ${FIELD.compostBelow}: +${FIELD.compostGain} on every tile`]);
        break;
      case 'sprinkler':
        rows.push(['Reach', `fields whose centre is within ${POWER.sprinklerReach} tiles`], ['Near water', `within ${POWER.waterNear} tiles`]);
        break;
      case 'hive':
        rows.push(['Reach', `${HIVE.reach} tiles`], ['Honey', `one every ${HIVE.honeySeconds} s with 1 flowering field, ${HIVE.honeySeconds / HIVE.maxFlowers} s with ${HIVE.maxFlowers}`],
          ['Holds', `${HIVE.store} honey`], ['Pollinated fields', '+1 to every harvest']);
        break;
      case 'solar': rows.push(['At midday, full sun', `${POWER.solar} W (scaled by the sun's strength, shown in the top bar)`], ['At night', '0 W']); break;
      case 'turbine':
        rows.push(['In full wind', `${POWER.turbine} W`], ['Shelter', `−${POWER.shelter * 100}% for each tree or tall building within 2 tiles, down to ${POWER.shelterFloor * 100}%`]);
        break;
      case 'battery': rows.push(['Stores', `${POWER.battery.capacity} J (${Math.round(POWER.battery.capacity / 60)} W for a minute)`], ['Charges and gives', `up to ${POWER.battery.rate} W`]); break;
      case 'pylon': rows.push(['Powers', `buildings with a tile within ${POWER.pylon.reach} tiles`], ['Links to', `pylons within ${POWER.pylon.link} tiles`]); break;
      case 'sapling': rows.push(['Grows into a tree in', `${SAPLING_SECONDS} s`]); break;
      case 'depot': rows.push(['Pays', 'each good\'s price (see Goods)'], ['Loads', 'two trucks at a time']); break;
    }
    if (rs.length && id !== 'digester') rows.push(['Buffers', `${INPUT_BATCHES} batches of each input, ${OUTPUT_BATCHES} of each output`]);
    if (BUILDINGS[id].tall) rows.push(['Tall', 'shelters wind turbines within 2 tiles']);
    if (BUILDINGS[id].onWater) rows.push(['Water', 'can be built on water']);
    if (rows.length) out.push(h('h3', null, 'Numbers'), h('table', { class: 'kvt' }, ...rows.map(([k, v]) => h('tr', null, h('td', null, k), h('td', null, v)))));
    return out;
  }

  function recipeTable(rs: Recipe[]) {
    return h('table', null,
      h('tr', null, h('th', null, 'In'), h('th', null, 'Out'), h('th', null, 'Time'), h('th', null, 'A minute, at full power')),
      ...rs.map((r) => h('tr', null,
        h('td', null, ...r.inputs.flatMap((i, k) => [k ? ' + ' : '', ingredient(i)])),
        h('td', null, ...(r.outputs.length ? r.outputs.flatMap((o, k) => [k ? ' + ' : '', goodLink(o.item, o.n)]) : [`${POWER.digester} W`])),
        h('td', null, `${r.time} s`),
        h('td', null, r.outputs.length ? r.outputs.map((o) => `${fmt(60 / r.time * o.n)} ${lc(o.item)}`).join(', ') : `burns ${fmt(60 / r.time)}`))));
  }

  // ---- Goods ----

  function makers(item: ItemId): BuildingId[] {
    const out = new Set<BuildingId>(RECIPES.filter((r) => r.outputs.some((o) => o.item === item)).map((r) => r.building));
    if ((CROP_IDS as readonly string[]).includes(item)) out.add('field');
    if (item === 'honey') out.add('hive');
    return [...out];
  }
  function users(item: ItemId): BuildingId[] {
    const inGroup = (g: keyof typeof GROUPS) => (GROUPS[g] as readonly ItemId[]).includes(item);
    const out = new Set<BuildingId>(RECIPES.filter((r) => r.inputs.some((i) => ('item' in i ? i.item === item : inGroup(i.group)))).map((r) => r.building));
    if (item === 'compost') out.add('field');
    return [...out];
  }
  const joined = (ids: BuildingId[]) => (ids.length ? ids.flatMap((id, i) => [i ? ', ' : '', bLink(id)]) : ['—']);

  function goodsPage(): Node[] {
    return [
      h('h2', null, 'Goods'),
      h('p', { class: 'lead' }, 'Every good trucks carry, where it comes from and where it goes. Any good delivered to the depot pays its price.'),
      h('table', { class: 'goods-table' },
        h('tr', null, h('th', null, 'Good'), h('th', null, 'Made by'), h('th', null, 'Used by'), h('th', null, 'Pays')),
        ...ITEM_IDS.map((i) => h('tr', null,
          h('td', null, h('span', { class: 'good' }, swatch(i), ITEMS[i].name), h('div', { class: 'hint' }, ITEMS[i].hint)),
          h('td', null, ...joined(makers(i))), h('td', null, ...joined(users(i))), h('td', null, String(ITEMS[i].price))))),
    ];
  }

  // ---- Topics ----

  function topicPage(id: TopicId): Node[] {
    const P = (...c: (Node | string)[]) => h('p', null, ...c);
    const B = (t: string) => h('b', null, t);
    switch (id) {
      case 'start': return [
        h('h2', null, 'How to play'),
        h('p', { class: 'lead' }, 'Each commission asks for goods. You build a farm that makes them by itself: fields grow crops, trucks carry them to machines on the routes you set, machines make products, and trucks take those to the depot.'),
        h('ol', null,
          h('li', null, 'Pick a building in the bar at the bottom. Hover a button to see what it does; ', B('G'), ' opens its page here.'),
          h('li', null, B('Click'), ' to place it, or ', B('drag'), ' to place a row. Green means it fits, red means it doesn\'t (the line at the bottom left says why).'),
          h('li', null, 'Build a ', bLink('garage'), ', buy a truck and give it a route through them (see ', link('Trucks and routes', { kind: 'topic', id: 'trucks' }), '). Power the garage and the machines with ', bLink('solar'), 's and ', bLink('pylon'), 's.'),
          h('li', null, 'Watch it run. A coloured diamond over a building means something is wrong; ', B('click'), ' the building to see what.'),
          h('li', null, 'Find the slowest step and add to it. ', B('Tab'), ' shows what is being made and delivered a minute.')),
        h('h3', null, 'Controls'),
        h('table', { class: 'kvt' }, ...([
          ['Click / drag', 'build (a drag places a row), or select a building'], ['R, Shift+R', 'turn what you are placing'], ['X', 'remove (full refund)'],
          ['Esc', 'drop what is in hand, deselect, close panels'], ['Right click', 'drop what is in hand, deselect'], ['Drag, right-drag, arrows', 'pan'], ['Wheel, trackpad pinch, + −, Z', 'zoom'],
          ['Q, E', 'turn the view'], ['Space, 1, 2, 3', 'pause, speed'], ['V', 'overlays'], ['O', 'every route, to rename and edit'], ['Tab', 'production stats'], ['G', 'this guide'],
        ] as const).map(([k, v]) => h('tr', null, h('td', null, k), h('td', null, v)))),
      ];
      case 'trucks': return [
        h('h2', null, 'Trucks and routes'),
        h('p', { class: 'lead' }, 'There are no belts and no roads to build: trucks carry every good, over the open ground between buildings, along the routes you give them. ', bLink('silo'), 's store goods; trucks are bought at a ', bLink('garage'), '.'),
        h('h3', null, 'Routes'),
        P(`A route is a loop of up to ${TRUCK.maxStops} stops. At each stop its trucks `, B('drop'), ' some goods (only what the building takes) and ', B('pick up'), ' others; a good is dropped or picked up, never both. They drive stop 1, 2, … the last, then stop 1 again.'),
        h('ul', null,
          h('li', null, 'Make one: select a garage or a truck, choose "New route", then click buildings on the map, in order. Esc when done.'),
          h('li', null, 'A new stop picks up everything the building makes and drops everything it takes: a field, then a mill, then the ', bLink('depot'), ' is a whole route. A silo stop drops everything; choose what to take from it.'),
          h('li', null, `At a stop a truck drops first, then picks up into the room left. It leaves when it has nothing more to do, or after waiting ${TRUCK.wait} s (you can change it) for room or goods.`),
          h('li', null, 'More trucks make a route faster. Two routes picking up the same good share it by how often their trucks come.'),
          h('li', null, B('O'), ' opens every route in a list: click a name to rename it, + and − to add or send home trucks, ⧉ to copy a route, and point at one to see it on the map.'),
          h('li', null, 'A truck stuck with goods no stop takes can dump its cargo (in its inspector, or the route\'s): the goods are lost.')),
        h('h3', null, 'Next door'),
        P('Buildings that share an edge trade without trucks: a machine takes what it uses from the buildings next door, a field takes compost. A ', bLink('mill'), ' between wheat fields grinds their wheat, a ', bLink('coop'), ' beside the mill eats its bran, a ', bLink('bakery'), ' beside both bakes their flour and eggs. Touching only at a corner doesn\'t count; ', bLink('silo'), 's and the ', bLink('depot'), ' trade only with trucks.'),
        P('A building takes from its neighbours before trucks load there, from whichever has the most. Selecting a building tints the neighbours it trades with, and placing one says who it would. Packed buildings leave trucks fewer open tiles, so keep a way in for the goods that still go by truck.'),
        h('h3', null, 'Roads'),
        P('Trucks drive on any open grass, the shortest way, and pass through each other. To load, a truck parks on an open tile next to the building: a building with none can\'t be reached (a purple marker). The Roads overlay (V) shows the open ground.'),
        P('A building loads one truck at a time (the depot two); the others queue beside it. A queue is a bottleneck: split the route, or put a silo between.'),
        h('h3', null, 'Charging'),
        P(`A truck's battery holds ${TRUCK.battery} J, ${TRUCK.joulesPerTile} J a tile. When it would run short, it drives home to its garage and charges, from the garage's pylon network. With no power there it goes on after ${TRUCK.giveUp} s, and crawls once empty.`),
        h('h3', null, 'Byproducts'),
        P('A machine stops when an output has nowhere to go, so give every byproduct a home: a ', bLink('coop'), ', a ', bLink('composter'), ', a ', bLink('digester'), ' or the depot. Trucks share their room, so a truck full of something no stop takes carries nothing else: give it a stop that takes it, or its own route.'),
      ];
      case 'power': return [
        h('h2', null, 'Power'),
        h('p', { class: 'lead' }, 'Machines, sprinklers and garages (to charge their trucks) need power. Power travels only through pylons.'),
        h('ul', null,
          h('li', null, 'A building is powered when one of its tiles is within ', String(POWER.pylon.reach), ' tiles of a ', bLink('pylon'), '. Pylons within ', String(POWER.pylon.link), ' tiles of each other link into one network.'),
          h('li', null, 'Each network adds up what its generators make and what its machines want. Spare power charges its ', bLink('battery'), 's; a shortfall drains them.'),
          h('li', null, 'If that isn\'t enough, every machine on the network slows down to the share it gets (an orange marker).'),
          h('li', null, bLink('solar'), 's make nothing at night, and a ', bLink('turbine'), ' only makes power when there is wind. A ', bLink('digester'), ' is steady, but needs waste to burn.')),
        P('The top bar shows the power made and used across all networks, and the charge stored in batteries. The Power overlay (V) draws each network in its own colour: the ground its pylons reach, the wires between them, a line from a pylon to each building it powers, and a label with what the network makes and uses. Select a building to see its own network.'),
      ];
      case 'soil': return [
        h('h2', null, 'Soil and water'),
        h('p', { class: 'lead' }, 'Fields are where every chain starts, and how fast they grow depends on water and soil.'),
        h('ul', null,
          h('li', null, B('Water:'), ` a dry field grows at ×${FIELD.dry} speed. A `, bLink('sprinkler'), ' waters fields whose centre is within ', String(POWER.sprinklerReach), ' tiles.'),
          h('li', null, B('Soil:'), ` growth goes from ×${FIELD.poorSoil} on soil 0 to ×${FIELD.richSoil} on soil 100. The Soil overlay (V) shows fertility everywhere; darker soil under a field is richer.`),
          h('li', null, B('Wearing out:'), ' every harvest takes some soil (see the crops on the ', bLink('field'), ' page). Beans give some back.'),
          h('li', null, B('Compost:'), ` a field with compost uses one whenever its soil is under ${FIELD.compostBelow}, for +${FIELD.compostGain} on every tile. Make it in a `, bLink('composter'), '.'),
          h('li', null, B('Resting:'), ` ground without a field slowly recovers (${FIELD.rest * 60} a minute), up to what it started at.`),
          h('li', null, B('Clearing:'), ` a tree costs ${CLEAR_COST.tree} credits to remove and a rock ${CLEAR_COST.rock}. Trees count towards soil health; `, bLink('sapling'), 's plant new ones.')),
      ];
      case 'markers': return [
        h('h2', null, 'Markers'),
        h('p', { class: 'lead' }, 'A diamond floats over any building that isn\'t working. Its colour says why; click the building for the details.'),
        h('table', { class: 'kvt' },
          ...([['red', 'No power: out of a pylon\'s reach, or its network has none'], ['orange', 'Output blocked (nowhere for its goods to go), or low power'],
            ['yellow', 'Waiting for input (or, for a beehive, no flowering fields)'], ['blue', 'A field without water'], ['purple', 'Trucks can\'t reach it (no open tile beside it), or its outputs are full and no route picks them up']] as const)
            .map(([c, t]) => h('tr', null, h('td', null, h('span', { class: `m ${c}` }, '◆'), ` ${c}`), h('td', null, t)))),
        P('Hover any building for a one-line status at the bottom of the screen.'),
        P('Missed what went wrong? A building\'s inspector has its history: a strip of what it was doing over the last 1, 5 or 10 minutes (problems are hatched), the share of the time it spent on each, and the goods it made a minute (for machines, against their full speed). Point at the strip to see what happened when. Solar panels, turbines and batteries chart their power or charge instead.'),
      ];
    }
  }

  draw();
  return h('div', { class: 'panel guide' },
    h('div', { class: 'guide-head' }, h('h2', null, 'Guide'), h('button', { class: 'close', title: 'Close (Esc)', onclick: close }, '✕')),
    h('div', { class: 'guide-main' }, nav, body));
}

/** What a building does with power, in a few words. */
function powerLine(id: BuildingId): string {
  const d = BUILDINGS[id];
  if (id === 'sprinkler') return `uses ${POWER.sprinklerNearWater} W near water, else ${POWER.sprinklerFar} W`;
  if (id === 'garage') return `up to ${TRUCK.chargeRate} W for each truck charging`;
  if (d.power) return `uses ${d.power} W while working`;
  if (id === 'solar') return `makes up to ${POWER.solar} W in full sun`;
  if (id === 'turbine') return `makes up to ${POWER.turbine} W`;
  if (id === 'digester') return `makes ${POWER.digester} W while burning`;
  if (id === 'battery') return `stores ${POWER.battery.capacity} J`;
  if (id === 'pylon') return 'carries it';
  return 'none';
}

/** A short card about a building, for hovering its button in the build bar. */
export function buildingCard(id: BuildingId, price: number): HTMLElement {
  const d = BUILDINGS[id], e = ENTRIES[id], rs = recipesFor(id);
  return h('div', null,
    h('div', { class: 'head' }, h('b', null, d.name), h('span', null, `${price ? `${price} credits` : 'free'} · ${d.size}×${d.size}`)),
    h('p', { class: 'hint' }, `Power: ${powerLine(id)}`),
    h('p', null, e.what),
    ...rs.map((r) => h('div', { class: 'recipe' },
      ...r.inputs.flatMap((i, k) => [k ? ' + ' : '', 'item' in i ? h('span', { class: 'good' }, swatch(i.item), `${i.n} ${lc(i.item)}`) : `${i.n} ${GROUP_NAMES[i.group].split(' (')[0]}`]),
      ' → ', ...(r.outputs.length ? r.outputs.flatMap((o, k) => [k ? ' + ' : '', h('span', { class: 'good' }, swatch(o.item), `${o.n} ${lc(o.item)}`)]) : [`${POWER.digester} W`]),
      h('small', null, ` · ${r.time} s`))),
    h('p', { class: 'hint' }, e.how[0]),
    h('p', { class: 'hint more' }, 'G: full page in the guide'));
}
