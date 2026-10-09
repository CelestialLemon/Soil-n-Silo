import {
  BELT, BUILDINGS, CATEGORIES, CLEAR_COST, CROP_IDS, CROPS, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEM_IDS, ITEMS, OUTPUT_BATCHES,
  PAD, POWER, RECIPES, recipesFor, ROUTER_SECONDS, SAPLING_SECONDS, type BuildingId, type Ingredient, type ItemId, type Recipe,
} from '../game/data.ts';
import { h } from './dom.ts';

// The guide: a page for every building (what it does, how to use it, its numbers, what it takes and makes), a page of
// goods, and a few pages on the basics (belts, power, soil, the markers). The words are written here; every number comes
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
  belt: {
    what: 'Moves goods one way, shown by the arrow on its deck. Every chain in the game is buildings joined by belts.',
    how: [
      'Pick Belt (B), then press where the line should start and drag to where it should end. Goods run the way you drag, from where you pressed to where you let go; the line turns once (an L).',
      'A single click places one belt facing the way shown in the preview; R (or Shift+R) turns it.',
      'To feed a building, make the last belt point into it. To take goods out of a building, run a belt beside it, pointing away.',
    ],
    tips: [
      'A belt takes goods from the belt behind it and from belts pointing into either side, so lines can merge.',
      'Select a building to see its belts: green belts bring it goods, blue belts carry its goods away.',
      'A belt beside a building only takes its goods if its line doesn\'t lead straight back into that building.',
      'A belt running past a field collects its harvest on the way.',
    ],
  },
  splitter: {
    what: 'Shares the goods coming into it between all its other sides, taking turns. Use it to feed two machines from one line, or to merge lines.',
    how: [
      'Put it in a belt line: the belt coming in points into it.',
      'Lay belts leading out of the sides you want goods to go to, each pointing away from the splitter.',
      'It can also hand goods straight to a building it touches. A side with nothing there to take the good, or that is full, is skipped, so a jammed machine doesn\'t stop the others.',
    ],
  },
  sorter: {
    what: 'Picks one kind of good out of a mixed line. The chosen good goes straight on; everything else goes out left or right.',
    how: [
      'Put it in a belt line with its arrow pointing the way the line runs (R turns it).',
      'Select it and choose the good to keep in "Straight on". With nothing chosen, everything goes straight on.',
      'Lay belts out of its left and right sides, pointing away, for the other goods.',
    ],
    tips: ['A mill puts flour and bran on the same belts. A sorter set to flour sends the flour on to the bakery and the bran aside to the chickens.'],
  },
  crossing: {
    what: 'Lets two belt lines cross without mixing. A good leaves on the side opposite the one it came in by.',
    how: ['Put it where two lines cross, with each line\'s belts pointing into it on one side and away from it on the other.'],
    tips: ['It also hands goods straight to a building on its far side.'],
  },
  pad: {
    what: 'Drones carry goods over anything (water, rock, other buildings) from a sending pad to a receiving pad or the depot.',
    how: [
      'Build two pads. Select one and set it to Send; set the other to Receive. To deliver, link a sending pad straight to the depot instead.',
      'With the sending pad selected, press "Link to a pad or the depot" and click the receiving pad or the depot.',
      'Point belts into the sending pad. Run a belt away from the receiving pad to take the goods on.',
    ],
    tips: ['Its drone needs power only while it flies, so put the sending pad in reach of a pylon.'],
  },
  field: {
    what: 'Grows the chosen crop on its 3 × 3 tiles. Crops are the start of every chain.',
    how: [
      'Build it on good soil: the hover line shows its average fertility, and the Soil overlay (V) shows the whole map.',
      'Select it and choose the crop. Wheat is the default.',
      'Run a belt along any side, pointing away from it, to carry the harvest off. A full field stops growing.',
      'Put a sprinkler within 3 tiles of its centre: dry fields grow at under half speed.',
    ],
    tips: [
      'Every harvest wears the soil out, except beans, which restore it. Compost brought in by a belt brings it back.',
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
      'Point a belt of feed into it: beans from a field, or the bran from a mill.',
      'Run a belt away from it for the eggs and the manure. Both come out on the same belts, so sort them, or let a composter or digester take the manure.',
    ],
    tips: ['Its manure must go somewhere. A coop whose manure piles up stops laying.'],
  },
  hive: {
    what: 'Bees make honey from flowering fields nearby (anything but wheat), and pollinate them for a bigger harvest.',
    how: [
      'Place it within 4 tiles of flowering fields: up to 3 of them count. The Bees overlay shows its range.',
      'Run a belt away from it to take the honey.',
    ],
  },
  composter: {
    what: 'Turns waste (manure, bran, seed cake) into compost, which brings tired soil back.',
    how: [
      'Point a belt of manure, bran or seed cake into it.',
      'Run a belt from it into your fields: a field takes compost and uses it when its soil drops.',
    ],
  },
  mill: {
    what: 'Grinds wheat into flour, with bran as a byproduct.',
    how: [
      'Point a belt of wheat into it.',
      'Run a belt away from it. Flour and bran come out on the same belts, taking turns.',
      'Give the bran somewhere to go (a coop, a composter, a digester, or the depot), or the mill stops.',
      'Put it within a pylon\'s reach.',
    ],
  },
  press: {
    what: 'Presses sunflowers into oil, with seed cake as a byproduct.',
    how: ['Point a belt of sunflowers into it.', 'Run a belt away from it for the oil and seed cake, and give the seed cake somewhere to go.', 'Put it within a pylon\'s reach.'],
  },
  spinner: {
    what: 'Spins flax into yarn.',
    how: ['Point a belt of flax into it.', 'Run a belt away from it to a loom.', 'Put it within a pylon\'s reach.'],
  },
  loom: {
    what: 'Weaves yarn into linen, a valuable product.',
    how: ['Point a belt of yarn into it.', 'Run a belt away from it to the depot.', 'Put it within a pylon\'s reach.'],
  },
  bakery: {
    what: 'Bakes flour and eggs into bread, or, with honey as well, into honey cake.',
    how: [
      'Select it and choose bread or honey cake.',
      'Point belts of flour and eggs (and honey for cake) into it. One mixed belt works too.',
      'Run a belt away from it to the depot.',
      'Put it within a pylon\'s reach.',
    ],
  },
  cannery: {
    what: 'Cooks tomatoes and oil into tomato sauce, a valuable product.',
    how: ['Point belts of tomatoes and oil into it.', 'Run a belt away from it to the depot.', 'Put it within a pylon\'s reach.'],
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
    what: 'Stores spare power and gives it back when the network falls short, such as at night.',
    how: ['Place it within a pylon\'s reach. It charges whenever its network makes more than it uses.'],
  },
  digester: {
    what: 'Burns waste (manure, bran or seed cake) for steady power, day and night.',
    how: ['Point a belt of manure, bran or seed cake into it.', 'Place it within a pylon\'s reach.'],
    tips: ['A good home for byproducts you have no other use for.'],
  },
  pylon: {
    what: 'Carries power. Every building that makes, stores or uses power must be in a pylon\'s reach.',
    how: [
      'Place pylons so every powered building has a tile within reach. The Power overlay shows the reach.',
      'Pylons close enough to each other link into one network, which shares all its power.',
    ],
    tips: ['Two networks that don\'t link don\'t share power. The inspector shows each building\'s network.'],
  },
  sapling: {
    what: 'Grows into a tree. Trees add to soil health; some commissions ask for it.',
    how: ['Plant it on open grass.'],
    tips: ['Keep trees away from wind turbines: they shelter them.'],
  },
  depot: {
    what: 'Where goods go to count. Every good delivered here counts towards the commission and pays its price.',
    how: ['Point belts into it, or link a sending drone pad to it.'],
  },
};

export type TopicId = 'start' | 'belts' | 'power' | 'soil' | 'markers';
const TOPICS: { id: TopicId; name: string }[] = [
  { id: 'start', name: 'How to play' }, { id: 'belts', name: 'Belts and goods' }, { id: 'power', name: 'Power' },
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
        fact('Power', powerLine(id)), d.directional ? fact('Turns', 'R (direction matters)') : null),
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
    if (id === 'depot' || id === 'pad') return [h('li', null, 'any good')];
    if (id === 'belt' || id === 'splitter' || id === 'sorter' || id === 'crossing') return [h('li', null, 'any good')];
    const ins = new Map<string, Ingredient>();
    for (const r of recipesFor(id)) for (const i of r.inputs) ins.set('item' in i ? i.item : i.group, i);
    return [...ins.values()].map((i) => h('li', null, 'item' in i ? goodLink(i.item) : `${GROUP_NAMES[i.group]}`));
  }
  function givesOf(id: BuildingId): HTMLElement[] {
    if (id === 'field') return [h('li', null, ...CROP_IDS.flatMap((c, i) => [i ? ', ' : '', goodLink(c)]), ' (the crop you choose)')];
    if (id === 'hive') return [h('li', null, goodLink('honey'))];
    if (id === 'digester') return [h('li', null, `${POWER.digester} W of power`)];
    if (id === 'depot') return [h('li', null, 'credits, and progress on the commission')];
    if (id === 'pad') return [h('li', null, 'the goods, at the receiving pad')];
    if (id === 'belt' || id === 'splitter' || id === 'sorter' || id === 'crossing') return [h('li', null, 'the same goods, moved on')];
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
      case 'belt':
        rows.push(['Speed', `${BELT.speed} tiles a second`], ['Holds', `${Math.round(1 / BELT.spacing)} goods a tile`],
          ['Carries at most', `${Math.round(BELT.speed / BELT.spacing * 60)} goods a minute`]);
        break;
      case 'splitter': case 'sorter': case 'crossing':
        rows.push(['Each good takes', `${ROUTER_SECONDS} s to pass through`]);
        break;
      case 'pad':
        rows.push(['Drone carries', `up to ${PAD.cargo} goods a trip`], ['Drone speed', `${PAD.speed} tiles a second`], ['Range', `${PAD.range} tiles`],
          ['Holds', `${PAD.store} goods to send, ${PAD.receiveStore} received`]);
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
      case 'depot': rows.push(['Pays', 'each good\'s price (see Goods)']); break;
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
      h('p', { class: 'lead' }, 'Everything a belt can carry, where it comes from and where it goes. Any good delivered to the depot pays its price.'),
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
        h('p', { class: 'lead' }, 'Each commission asks for goods. You build a farm that makes them by itself: fields grow crops, belts carry them to machines, machines make products, and belts carry those to the depot.'),
        h('ol', null,
          h('li', null, 'Pick a building in the bar at the bottom. Hover a button to see what it does; ', B('G'), ' opens its page here.'),
          h('li', null, B('Click'), ' to place it, or ', B('drag'), ' to place a row. Green means it fits, red means it doesn\'t (the line at the bottom left says why).'),
          h('li', null, 'Join buildings with ', bLink('belt'), 's, and power the machines with ', bLink('solar'), 's and ', bLink('pylon'), 's.'),
          h('li', null, 'Watch it run. A coloured diamond over a building means something is wrong; ', B('click'), ' the building to see what.'),
          h('li', null, 'Find the slowest step and add to it. ', B('Tab'), ' shows what is being made and delivered a minute.')),
        h('h3', null, 'Controls'),
        h('table', { class: 'kvt' }, ...([
          ['Click / drag', 'build, or select a building'], ['R, Shift+R', 'turn what you are placing'], ['X', 'remove (full refund)'],
          ['Esc', 'drop what is in hand, deselect, close panels'], ['Right click', 'drop what is in hand, deselect'], ['Drag, right-drag, arrows', 'pan'], ['Wheel, trackpad pinch, + −, Z', 'zoom'],
          ['Q, E', 'turn the view'], ['Space, 1, 2, 3', 'pause, speed'], ['V', 'overlays'], ['Tab', 'production stats'], ['G', 'this guide'],
        ] as const).map(([k, v]) => h('tr', null, h('td', null, k), h('td', null, v)))),
      ];
      case 'belts': return [
        h('h2', null, 'Belts and goods'),
        h('p', { class: 'lead' }, 'Buildings never pass goods to each other directly: belts carry them. Two rules cover every building:'),
        beltDiagram(),
        h('ol', null,
          h('li', null, B('Goods go in'), ' from a belt that points into the building (green). The building takes only goods it can use, and only while it has room; anything else waits on the belt.'),
          h('li', null, B('Goods come out'), ' onto any belt beside the building that doesn\'t point into it (blue), even one just running past. With several such belts, it takes turns between them. The one exception: a belt whose line leads back into the same building within a few tiles, which would only feed the building its own goods.')),
        P('Select any building (other than a belt) to see this on the map: the belts that bring it goods turn green, and the belts that take its goods away turn blue.'),
        h('h3', null, 'Laying belts'),
        h('ul', null,
          h('li', null, 'The chevrons gliding along each belt show which way it runs.'),
          h('li', null, B('Drag'), ' to lay a line: goods run the way you drag, from where you pressed to where you let go. It turns once, so a drag lays an L.'),
          h('li', null, 'A single ', B('click'), ' places one belt facing the way the preview shows; ', B('R'), ' turns it.'),
          h('li', null, 'A belt takes goods from the belt behind it and from belts pointing into either side, so lines merge by joining from the side.'),
          h('li', null, 'Belts, splitters, sorters and crossings can be built on water.')),
        h('h3', null, 'Mixed belts'),
        P('A ', bLink('splitter'), ', ', bLink('sorter'), ' or ', bLink('crossing'), ' is different: it passes each good on to whatever is on its exit, so it can feed a building it touches directly, without a belt in between. Buildings don\'t put goods into them, though: run a belt from the building into it.'),
        P('A machine with two outputs (a mill\'s flour and bran) puts both on the same belts. Use a ', bLink('sorter'), ' to send one good one way and the rest another, a ', bLink('splitter'), ' to share goods out, and a ', bLink('crossing'), ' to cross lines without mixing them.'),
        P('A machine stops when an output has nowhere to go. A mill whose bran piles up stops making flour too, so every byproduct needs a home: a ', bLink('coop'), ', a ', bLink('composter'), ', a ', bLink('digester'), ' or the ', bLink('depot'), '.'),
      ];
      case 'power': return [
        h('h2', null, 'Power'),
        h('p', { class: 'lead' }, 'Machines, sprinklers and drone pads need power. Power travels only through pylons.'),
        h('ul', null,
          h('li', null, 'A building is powered when one of its tiles is within ', String(POWER.pylon.reach), ' tiles of a ', bLink('pylon'), '. Pylons within ', String(POWER.pylon.link), ' tiles of each other link into one network.'),
          h('li', null, 'Each network adds up what its generators make and what its machines want. Spare power charges its ', bLink('battery'), 's; a shortfall drains them.'),
          h('li', null, 'If that isn\'t enough, every machine on the network slows down to the share it gets (an orange marker).'),
          h('li', null, bLink('solar'), 's make nothing at night, and a ', bLink('turbine'), ' only makes power when there is wind. A ', bLink('digester'), ' is steady, but needs waste to burn.')),
        P('The top bar shows the power made and used across all networks, and the charge stored in batteries. Select a building to see its own network.'),
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
            ['yellow', 'Waiting for input (or, for a beehive, no flowering fields)'], ['blue', 'A field without water'], ['purple', 'A drone pad that isn\'t linked']] as const)
            .map(([c, t]) => h('tr', null, h('td', null, h('span', { class: `m ${c}` }, '◆'), ` ${c}`), h('td', null, t)))),
        P('Belts, splitters, sorters and crossings never show a marker, even when they are jammed: watch for goods standing still, or select them to see their status.'),
        P('Hover any building for a one-line status at the bottom of the screen.'),
      ];
    }
  }

  draw();
  return h('div', { class: 'panel guide' },
    h('div', { class: 'guide-head' }, h('h2', null, 'Guide'), h('button', { class: 'close', title: 'Close (Esc)', onclick: close }, '✕')),
    h('div', { class: 'guide-main' }, nav, body));
}

/** Top-down picture of the two belt rules: a belt pointing into a building feeds it; belts beside it pointing away take its goods. */
function beltDiagram(): HTMLElement {
  const NS = 'http://www.w3.org/2000/svg', T = 34;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${T * 9} ${T * 4}`);
  svg.setAttribute('class', 'diagram');
  const el = (tag: string, a: Record<string, string | number>, text?: string) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
    if (text) e.textContent = text;
    svg.append(e);
  };
  // A belt tile at (x, y) running `dir` (0 north, 1 east, 2 south, 3 west), coloured.
  const belt = (x: number, y: number, dir: number, colour: string) => {
    el('rect', { x: x * T + 2, y: y * T + 2, width: T - 4, height: T - 4, rx: 3, fill: '#4a4440', stroke: '#2a2420' });
    const c = [x * T + T / 2, y * T + T / 2];
    el('path', { d: 'M -7 -2 L 0 -9 L 7 -2 M 0 -9 L 0 9', stroke: colour, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `translate(${c[0]} ${c[1]}) rotate(${dir * 90})` });
  };
  el('rect', { x: 3 * T + 2, y: 1 * T + 2, width: 2 * T - 4, height: 2 * T - 4, rx: 5, fill: '#c87a4a', stroke: '#6a4c34', 'stroke-width': 2 });
  el('text', { x: 4 * T, y: 2 * T + 5, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-family': 'monospace' }, 'Mill');
  // As in the game, only the belts touching the mill are coloured: green points into it, blue takes its goods.
  for (const x of [0, 1, 2]) belt(x, 1, 1, x === 2 ? '#7ee060' : '#f2e6c4');
  for (const x of [5, 6, 7]) belt(x, 2, 1, x === 5 ? '#50b4ff' : '#f2e6c4');
  for (const x of [2, 3, 4, 5]) belt(x, 3, 1, x === 3 || x === 4 ? '#50b4ff' : '#f2e6c4');   // running past takes goods too
  el('text', { x: 4, y: T - 8, fill: '#7ee060', 'font-size': 12, 'font-family': 'monospace' }, 'in: points into it');
  el('text', { x: 5 * T + 6, y: T + 16, fill: '#50b4ff', 'font-size': 12, 'font-family': 'monospace' }, 'out: beside it,');
  el('text', { x: 5 * T + 6, y: T + 30, fill: '#50b4ff', 'font-size': 12, 'font-family': 'monospace' }, 'pointing away');
  return h('div', { class: 'diagram-wrap' }, svg as unknown as HTMLElement, h('p', { class: 'hint' }, 'Seen from above. The green belt feeds the mill; the blue belts take its flour and bran, including the one just running past underneath.'));
}

/** What a building does with power, in a few words. */
function powerLine(id: BuildingId): string {
  const d = BUILDINGS[id];
  if (id === 'sprinkler') return `uses ${POWER.sprinklerNearWater} W near water, else ${POWER.sprinklerFar} W`;
  if (id === 'pad') return `uses ${d.power} W while its drone flies`;
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
