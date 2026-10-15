import {
  addStop, buyTruck, dumpCargo, newRoute, priceOf, remove, sellTruck, setCrop, setRecipe, setTruckRoute, truckPrice, type Action,
} from '../game/build.ts';
import {
  BUILDINGS, CATEGORIES, CROP_IDS, CROPS, FIELD, GROUP_NAMES, GROUPS, HIVE, INPUT_BATCHES, ITEM_IDS, OUTPUT_BATCHES, POWER, recipesFor, SILO, TRUCK,
  type Ingredient, type ItemId,
} from '../game/data.ts';
import { FLEET_SECONDS, truckTime } from '../game/fleet.ts';
import { hasHistory, heldSince, historyOf, summarize } from '../game/history.ts';
import { networkOf, networks, usedBy } from '../game/power.ts';
import {
  describeLinks, describeStatus, describeTruck, exposureOf, fieldFertility, fieldPace, flowersNear, givesGoods, isPollinated, isStop, linksOf,
  makes, recipeOf, routeOf, routesAt, shareOf, sunAt, takesGoods, truckProblems, wants, wantsCompost, windAt,
} from '../game/sim.ts';
import { buildingById, routeById, truckById, type Building, type GameState, type Route, type Truck } from '../game/state.ts';
import { netColour } from '../world/powerView.ts';
import { NET_COLOURS } from '../world/shapes.ts';
import { h, icon, rebuild, set, setVar } from './dom.ts';
import { dec, hex, itemName, num, pct, playTime, watts } from './format.ts';
import type { GuidePage } from './guide.ts';
import { historyView, makesOf, type HistoryWindow } from './historyView.ts';
import type { Tool } from './hud.ts';
import { routeCss, truckName } from './routing.ts';
import { ring, statusLabel, statusPill } from './widgets.ts';

// The inspector: a side card on the right for the selected building or truck. A building's header (name, kind, size, power),
// its recipe as a line of stores with the batch timer, its status with since when, and what it makes a minute; then three
// tabs: Workings (its settings and numbers, its power, the routes that stop here), History (history.ts) and Next door (what it
// trades with the buildings sharing an edge). Remove refunds in full. A truck's card has its route, cargo and battery.

export type InspectTab = 'workings' | 'history' | 'next';

export interface InspectorHost {
  state(): GameState;
  tool(): Tool;
  selected(): number | null;
  select(id: number | null): void;
  /** Shows a result as a message and redraws. */
  did(r: Action): void;
  openGuide(page: GuidePage): void;
  /** Opens a route in the routes card. */
  editRoute(r: Route): void;
}

/** What a building does with power, in a few words, for its header. */
export function powerWords(type: Building['type']) {
  const d = BUILDINGS[type];
  if (type === 'sprinkler') return `${POWER.sprinklerNearWater}–${POWER.sprinklerFar} W`;
  if (type === 'garage') return `${TRUCK.chargeRate} W a truck charging`;
  if (d.power) return `${d.power} W while working`;
  if (type === 'solar') return `up to ${POWER.solar} W`;
  if (type === 'turbine') return `up to ${POWER.turbine} W`;
  if (type === 'digester') return `${POWER.digester} W while burning`;
  if (type === 'battery') return `holds ${POWER.battery.capacity} J`;
  return '';
}

const row = (label: string, value: Node | string) => h('div', { class: 'cd-row' }, h('span', null, label), h('i'), typeof value === 'string' ? h('b', null, value) : value);

export class Inspector {
  readonly el = h('div', { class: 'cd-card side-card', hidden: true });
  private key = '';
  private updater: (() => void) | null = null;
  private tab: InspectTab = 'workings';
  /** The history's window, kept from building to building. */
  private historyWindow: HistoryWindow = 300;
  private readonly host: InspectorHost;

  constructor(host: InspectorHost) { this.host = host; }

  /** Whether it shows a building or truck now. */
  get open() { return !this.el.hidden; }

  /** Redraws now (the selection or a setting changed). */
  refresh() { this.key = ''; }

  /** Shows the selected building or truck, unless `allowed` is false (the routes card has the side). */
  update(allowed = true) {
    const s = this.host.state(), id = allowed ? this.host.selected() : null;
    const b = id !== null ? buildingById(s, id) : null, t = id !== null ? truckById(s, id) : null;
    if (!b && !t) {
      if (!this.el.hidden) { this.el.hidden = true; this.el.replaceChildren(); }
      this.key = ''; this.updater = null;
      return;
    }
    // Made again when what it shows changes: the building's settings, the trucks and routes it lists.
    const routes = s.routes.map((r) => [r.id, r.name, r.stops.length]);
    const key = JSON.stringify(t ? ['truck', t.id, t.route, routes, this.tab]
      : [b!.id, b!.type, b!.crop, b!.recipe, routes, this.tab, s.trucks.filter((x) => x.garage === b!.id).map((x) => [x.id, x.route]),
        routesAt(s, b!).map((r) => r.stops.filter((st) => st.building === b!.id))]);
    if (key !== this.key) {
      this.key = key;
      this.el.hidden = false;
      const { el, update } = t ? this.truckCard(s, t) : this.buildingCard(s, b!);
      this.el.replaceChildren(...el);
      this.updater = update;
    }
    this.updater?.();
  }

  private close() { this.host.select(null); this.refresh(); }

  private header(ic: string, title: string, sub: string, guide: GuidePage) {
    return h('div', { class: 'side-head' },
      h('span', { class: 'disc' }, icon(ic, 48)),
      h('div', { class: 'grow' }, h('h2', { class: 'cd-title' }, title), h('div', { class: 'cd-small' }, sub)),
      h('button', { class: 'cd-btn is-icon is-sm', title: 'Its page in the guide (G)', 'aria-label': 'Guide', onclick: () => this.host.openGuide(guide) }, icon('book', 18)),
      h('button', { class: 'cd-btn is-icon is-sm', title: 'Close (Esc)', 'aria-label': 'Close', onclick: () => this.close() }, icon('close', 14)));
  }

  // ---- A building ----

  private buildingCard(s: GameState, b: Building): { el: Node[]; update: () => void } {
    const def = BUILDINGS[b.type], lines: (() => void)[] = [];
    const cat = CATEGORIES.find((c) => c.id === def.category)?.name ?? 'The depot';
    const head = this.header(b.type, def.name, [cat, `${def.size} × ${def.size}`, powerWords(b.type)].filter(Boolean).join(' · '), { kind: 'building', id: b.type });

    // The status, since when it has held, and what it makes a minute.
    const status = h('span'), since = h('span', { class: 'cd-small' }), rate = h('span', { class: 'rate' });
    lines.push(() => {
      const label = statusLabel(b, b.status, b.need, shareOf(s, b));
      rebuild(status, `${b.status}|${label}`, () => [statusPill(b.status, label)]);
      const hist = historyOf(s, b), held = hist ? heldSince(hist) : null;
      set(since, held && held.from > (hist?.since ?? 0) + 1e-6 ? `for ${playTime(s.time - held.from)}` : '');
      const main = makesOf(b).items[0];
      if (main && hist) {
        const sum = summarize(hist, s.time, 300);
        rebuild(rate, `${dec(sum.perMin[main] ?? 0)} ${main}`, () => [h('span', { class: 'big cd-num' }, dec(sum.perMin[main] ?? 0)), h('span', { class: 'cd-small' }, ` ${itemName(main)} / min`)]);
      }
    });
    const statusRow = h('div', { class: 'side-status' }, status, since, h('span', { class: 'fill' }), rate);
    const status2 = h('p', { class: 'cd-small side-line' });
    lines.push(() => {
      const line = describeStatus(s, b), same = line.toLowerCase() === statusLabel(b, b.status, b.need, shareOf(s, b)).toLowerCase();
      set(status2, same ? '' : line); status2.hidden = same;
    });

    const tabs: [InspectTab, string][] = [['workings', 'Workings']];
    if (hasHistory(b)) tabs.push(['history', 'History']);
    if (isStop(b) && b.type !== 'silo' && b.type !== 'depot') tabs.push(['next', 'Next door']);
    if (!tabs.some(([k]) => k === this.tab)) this.tab = 'workings';
    const seg = tabs.length > 1 ? h('div', { class: 'cd-seg side-tabs' }, ...tabs.map(([k, name]) => h('button', { class: k === this.tab ? 'is-on' : '', onclick: () => { this.tab = k; this.refresh(); } }, name))) : null;

    let body: Node[];
    if (this.tab === 'history') {
      const hist = historyView(s, b, () => this.historyWindow, (w) => { this.historyWindow = w; });
      body = [hist.el]; lines.push(hist.update);
    } else if (this.tab === 'next') body = [this.nextDoor(s, b, lines)];
    else body = this.workings(s, b, lines);

    const foot = b.type === 'depot' ? null : h('div', { class: 'side-foot' },
      h('button', { class: 'cd-btn is-danger is-sm', onclick: () => { this.host.did(remove(s, b)); this.host.select(null); } }, icon('trash', 16), `Remove${priceOf(s, b.type) ? ` · refund ${num(priceOf(s, b.type))}` : ''}`));
    return {
      el: [head, recipeStores(b, lines), statusRow, status2, seg, h('div', { class: 'side-body' }, ...body), foot].filter((x): x is HTMLElement => !!x),
      update: () => { for (const l of lines) l(); },
    };
  }

  /** A building's settings and numbers. */
  private workings(s: GameState, b: Building, lines: (() => void)[]): Node[] {
    const out: Node[] = [h('p', { class: 'cd-small' }, BUILDINGS[b.type].hint)];
    const stat = (label: string, get: () => string) => { const v = h('b'); lines.push(() => set(v, get())); out.push(row(label, v)); };
    const bar = (get: () => number) => { const el = h('div', { class: 'cd-bar' }, h('i')); lines.push(() => setVar(el, '--v', Math.max(0, Math.min(1, get())).toFixed(3))); out.push(el); };
    switch (b.type) {
      case 'field': {
        out.push(h('div', { class: 'cd-seg wide' }, ...CROP_IDS.map((c) => h('button', {
          class: b.crop === c ? 'is-on' : '', title: `${CROPS[c].grow} s · ${CROPS[c].yield} a harvest · soil ${CROPS[c].soil > 0 ? '+' : ''}${CROPS[c].soil}${CROPS[c].flowers ? ' · flowers' : ''}`,
          onclick: () => this.host.did(setCrop(s, b, c)),
        }, icon(c, 18), CROPS[c].name))));
        stat('Growth', () => pct(b.growth!)); bar(() => b.growth!);
        stat('Soil fertility', () => `${Math.round(fieldFertility(s, b))}`);
        stat('Growth pace', () => { const p = fieldPace(s, b); return `${pct(p.pace)} · water ${pct(p.water)}, soil ×${p.soil.toFixed(2)}`; });
        stat('Harvest', () => `${CROPS[b.crop!].yield}${CROPS[b.crop!].flowers && isPollinated(s, b) ? ' + 1 (bees)' : ''} every ${Math.round(CROPS[b.crop!].grow / Math.max(0.01, fieldPace(s, b).pace))} s`);
        stat('Waiting to go', () => `${b.stored} of ${FIELD.store}`);
        stat('Compost', () => `${wantsCompost(s, b) ? 'takes it now' : 'none needed'} · below soil ${FIELD.compostBelow}`);
        break;
      }
      case 'hive':
        stat('Flowering fields', () => `${flowersNear(s, b)} (up to ${HIVE.maxFlowers})`);
        stat('Next honey', () => pct(b.growth!)); bar(() => b.growth!);
        stat('Honey waiting', () => `${b.stored} of ${HIVE.store}`);
        break;
      case 'silo': {
        const held = h('div', { class: 'chips' });
        lines.push(() => rebuild(held, JSON.stringify(b.store), () => {
          const got = (Object.keys(b.store!) as ItemId[]).filter((i) => b.store![i]);
          return got.length ? got.map((i) => h('span', { class: 'cd-chip' }, icon(i, 20), `${b.store![i]} / ${SILO.perGood} ${itemName(i)}`)) : [h('span', { class: 'cd-small' }, 'Empty.')];
        }));
        out.push(h('div', { class: 'cd-label sub' }, 'Holds'), held);
        break;
      }
      case 'garage': out.push(...this.garageTrucks(s, b, lines)); break;
      case 'battery': stat('Charge', () => `${pct(b.charge! / POWER.battery.capacity)} · ${Math.round(b.charge!)} of ${POWER.battery.capacity} J`); bar(() => b.charge! / POWER.battery.capacity); break;
      case 'solar': case 'turbine':
        stat('Making', () => watts(networkOf(s, b) ? makes(s, b, sunAt(s.scenario, s.time), windAt(s.scenario, s.time)) : 0));
        if (b.type === 'turbine') stat('Shelter', () => `${pct(exposureOf(s, b))} of the wind reaches it`);
        break;
      case 'depot': {
        const list = h('div', { class: 'chips' });
        lines.push(() => rebuild(list, JSON.stringify(s.delivered), () => {
          const got = (Object.keys(s.delivered) as ItemId[]).filter((i) => s.delivered[i]);
          return got.length ? got.map((i) => h('span', { class: 'cd-chip' }, icon(i, 20), `${num(s.delivered[i]!)} ${itemName(i)}`)) : [h('span', { class: 'cd-small' }, 'Nothing delivered yet. Trucks drop goods here on a route that stops here.')];
        }));
        stat('Earned', () => `${num(s.earned)} credits`);
        out.push(h('div', { class: 'cd-label sub' }, 'Delivered'), list);
        break;
      }
    }
    const r = recipeOf(b);
    if (r) {
      const rs = recipesFor(b.type);
      if (rs.length > 1) out.push(h('div', { class: 'cd-seg wide' }, ...rs.map((x) => h('button', { class: b.recipe === x.id ? 'is-on' : '', onclick: () => this.host.did(setRecipe(b, x.id)) }, icon(x.outputs[0].item, 18), itemNameCap(x.outputs[0].item)))));
      out.push(row('Recipe', `${r.inputs.map(ingWords).join(' + ')} → ${r.outputs.length ? r.outputs.map((o) => `${o.n} ${itemName(o.item)}`).join(' + ') : `${POWER.digester} W`} · ${r.time} s`));
    }
    if (BUILDINGS[b.type].power) stat('Power', () => { const net = networkOf(s, b), w = wants(s, b); return !net ? 'not connected' : w ? `using ${watts(w)} · getting ${pct(shareOf(s, b))}` : 'none right now'; });
    if (BUILDINGS[b.type].power || ['battery', 'solar', 'turbine', 'digester', 'pylon'].includes(b.type)) {
      const dot = h('i', { class: 'dot' }), v = h('span');
      lines.push(() => {
        const net = b.type === 'pylon' ? networks(s).of.get(b.id) ?? null : networkOf(s, b);
        dot.hidden = !net;
        if (net) dot.style.background = hex(NET_COLOURS[netColour(s, net)]);
        set(v, net ? `${watts(net.made)} made · ${watts(usedBy(net))} used · ${net.capacity ? pct(net.stored / net.capacity) : 'no batteries'}` : 'none: no pylon in reach');
      });
      out.push(row('Network', h('b', null, dot, v)));
    }
    if (isStop(b)) out.push(this.stopsHere(s, b));
    return out;
  }

  /** What a building trades with the buildings next door (sharing an edge with it). */
  private nextDoor(s: GameState, b: Building, lines: (() => void)[]): HTMLElement {
    const list = h('div');
    lines.push(() => {
      const text = describeLinks(linksOf(s, b));
      rebuild(list, text.join('|'), () => (text.length ? text.map((t) => h('div', { class: 'cd-row' }, h('span', null, t)))
        : [h('p', { class: 'cd-small' }, 'It trades with no building next door. Buildings sharing an edge trade goods without trucks: a field beside a mill gives it wheat, a mill beside a coop its bran.')]));
    });
    return list;
  }

  /** The routes stopping at a building, what each does there, and adding it to a route. */
  private stopsHere(s: GameState, b: Building): HTMLElement {
    const goodsList = (items: ItemId[]) => items.map(itemName).join(', ');
    const rows = routesAt(s, b).map((r) => {
      const sts = r.stops.filter((st) => st.building === b.id);
      const what = sts.map((st) => {
        const drop = st.drop.filter((i) => takesGoods(b).includes(i)), pick = st.pick.filter((i) => givesGoods(b).includes(i));
        const parts = [drop.length >= ITEM_IDS.length - pick.length && drop.length > 6 ? 'drops everything else' : drop.length ? `drops ${goodsList(drop)}` : '', pick.length ? `picks up ${goodsList(pick)}` : ''];
        return parts.filter(Boolean).join(' · ') || 'nothing to do';
      });
      return h('div', { class: 'cd-row' }, h('span', { class: 'route-name' }, h('i', { class: 'dot', style: `background: ${routeCss(s, r)}` }), h('b', null, r.name), ` ${what.join('; ')}`), h('i'),
        h('button', { class: 'cd-btn is-sm', onclick: () => this.host.editRoute(r) }, 'Edit'));
    });
    const add = h('select', {
      class: 'cd-select',
      onchange: () => {
        const r = add.value === 'new' ? newRoute(s) : routeById(s, Number(add.value));
        if (!r) return;
        this.host.did(addStop(s, r, b));
        this.host.editRoute(r);
      },
    }, h('option', { value: '' }, 'Add to a route…'), ...s.routes.map((r) => h('option', { value: String(r.id) }, r.name)), h('option', { value: 'new' }, '+ New route'));
    return h('div', null, h('div', { class: 'cd-label sub' }, 'Routes'),
      ...(rows.length ? rows : [h('p', { class: 'cd-small' }, 'No route stops here: trucks won\'t bring or take its goods.')]), h('div', { class: 'side-add' }, add));
  }

  /** A choice of route for a truck: none, one of the routes, or a new one (which opens in the routes card). */
  private routeSelect(s: GameState, t: Truck) {
    const sel = h('select', {
      class: 'cd-select',
      onchange: () => {
        const v = sel.value;
        if (v === 'new') { const r = newRoute(s); this.host.did(setTruckRoute(s, t, r)); this.host.editRoute(r); return; }
        this.host.did(setTruckRoute(s, t, v === '' ? null : routeById(s, Number(v))));
      },
    }, h('option', { value: '' }, 'No route (parked)'), ...s.routes.map((r) => h('option', { value: String(r.id), selected: r.id === t.route }, r.name)), h('option', { value: 'new' }, '+ New route…'));
    return sel;
  }

  /** A garage's trucks: what each is doing and its route; buying another. */
  private garageTrucks(s: GameState, g: Building, lines: (() => void)[]): Node[] {
    const mine = s.trucks.filter((t) => t.garage === g.id);
    const rows = mine.map((t, i) => {
      const what = h('div', { class: 'cd-small' });
      lines.push(() => set(what, describeTruck(s, t)));
      return h('div', { class: 'side-truck' },
        h('div', { class: 'line' }, icon('truck', 26), h('button', { class: 'link', onclick: () => { this.host.select(t.id); this.refresh(); } }, `Truck ${i + 1}`), h('span', { class: 'fill' }), this.routeSelect(s, t)),
        what);
    });
    return [h('div', { class: 'cd-label sub' }, `Trucks · ${mine.length} of ${TRUCK.perGarage}`),
      ...(rows.length ? rows : [h('p', { class: 'cd-small' }, 'No trucks yet. Buy one, then give it a route: a loop of stops where it drops and picks up goods.')]),
      h('div', { class: 'side-add' }, h('button', { class: 'cd-btn is-primary is-sm', disabled: mine.length >= TRUCK.perGarage, onclick: () => this.host.did(buyTruck(s, g)) }, `Buy a truck · ${truckPrice(s) || 'free'}`))];
  }

  // ---- A truck ----

  private truckCard(s: GameState, t: Truck): { el: Node[]; update: () => void } {
    const r = routeOf(s, t), g = buildingById(s, t.garage);
    const what = h('p', { class: 'side-line' }), problems = h('div'), cargo = h('div', { class: 'chips' }), charge = h('div', { class: 'cd-bar' }, h('i')), pctEl = h('b'), idle = h('b');
    const dump = h('button', { class: 'cd-btn is-ghost is-sm', title: 'Throw its cargo away (the goods are lost), so it has room again', onclick: () => this.host.did(dumpCargo(t)) }, 'Dump cargo');
    const update = () => {
      dump.disabled = !t.cargo.length;
      set(what, describeTruck(s, t));
      const ps = truckProblems(s, t);
      rebuild(problems, ps.join('|'), () => ps.map((p) => h('p', { class: 'cd-small cd-bad' }, p)));
      rebuild(cargo, t.cargo.join(','), () => {
        if (!t.cargo.length) return [h('span', { class: 'cd-small' }, 'Empty.')];
        const n = new Map<ItemId, number>();
        for (const i of t.cargo) n.set(i, (n.get(i) ?? 0) + 1);
        return [...n].map(([i, k]) => h('span', { class: 'cd-chip' }, icon(i, 20), `${k} ${itemName(i)}`));
      });
      setVar(charge, '--v', (t.energy / TRUCK.battery).toFixed(3));
      set(pctEl, `${pct(t.energy / TRUCK.battery)}${t.energy <= 0 ? ' · crawling' : ''}`);
      const time = truckTime(s, t);
      set(idle, time.idle === null ? '–' : `${pct(time.idle)} waiting at stops`);
    };
    const el = [
      this.header('truck', truckName(s, t), r ? `on ${r.name}` : 'no route', { kind: 'topic', id: 'trucks' }),
      what, problems,
      h('div', { class: 'side-body' },
        h('p', { class: 'cd-small' }, `Carries ${TRUCK.cargo} goods at ${TRUCK.speed} tiles a second. Charges at its garage.`),
        row('Route', this.routeSelect(s, t)),
        h('div', { class: 'cd-label sub' }, 'Cargo'), cargo,
        row('Battery', pctEl), charge,
        row(`Last ${FLEET_SECONDS / 60} min`, idle)),
      h('div', { class: 'side-foot' },
        g ? h('button', { class: 'cd-btn is-ghost is-sm', onclick: () => { this.host.select(g.id); this.refresh(); } }, icon('garage', 18), 'Garage') : null,
        r ? h('button', { class: 'cd-btn is-primary is-sm', onclick: () => this.host.editRoute(r) }, 'Edit route') : null,
        dump,
        h('button', { class: 'cd-btn is-danger is-sm', onclick: () => { this.host.did(sellTruck(s, t)); this.host.select(g?.id ?? null); } }, `Sell${truckPrice(s) ? ` · +${truckPrice(s)}` : ''}`)),
    ];
    return { el, update };
  }
}

const itemNameCap = (i: ItemId) => itemName(i).replace(/^./, (c) => c.toUpperCase());
const ingWords = (ing: Ingredient) => ('item' in ing ? `${ing.n} ${itemName(ing.item)}` : `${ing.n} ${GROUP_NAMES[ing.group].split(' (')[0]}`);

/** A machine's recipe as a line of stores (pips for each batch), with the batch timer between; a field's crop and growth. */
function recipeStores(b: Building, lines: (() => void)[]): HTMLElement | null {
  const r = recipeOf(b);
  if (!r) return null;
  const store = (ic: string, label: string, held: () => number, n: number, batches: number, input: boolean) => {
    const pips = h('span', { class: 'pips' }, ...Array.from({ length: batches }, () => h('i'))), num_ = h('span', { class: 'n' }), el = h('div', { class: 'store' }, h('span', { class: 'store-disc' }, icon(ic, 36)), pips, num_);
    lines.push(() => {
      const k = held();
      [...pips.children].forEach((p, i) => p.classList.toggle('on', k >= (i + 1) * n));
      set(num_, `${label} ${k}/${n * batches}`);
      el.classList.toggle('is-empty', input && k < n);
    });
    return el;
  };
  const held = (ing: Ingredient) => () => ('item' in ing ? b.inputs![ing.item] ?? 0 : GROUPS[ing.group].reduce((n, i) => n + (b.inputs![i] ?? 0), 0));
  const timer = h('span', { class: 'timer' }), left = h('div', { class: 'big cd-num' }), word = h('div', { class: 'cd-small' });
  timer.append(ring({ v: 0, d: 84, w: 7, col: 'var(--ochre)' }, h('div', null, left, word)));
  lines.push(() => {
    const p = b.progress;
    setVar(timer.querySelector('.cd-ring') as HTMLElement, '--v', p === null || p === undefined ? '0' : (p / r.time).toFixed(3));
    set(left, p === null || p === undefined ? '–' : `${dec(Math.max(0, r.time - p))} s`);
    set(word, p === null || p === undefined ? 'idle' : 'left');
  });
  const ins = r.inputs.map((ing) => store('item' in ing ? ing.item : GROUPS[ing.group][0], 'item' in ing ? itemName(ing.item) : ing.group, held(ing), ing.n, INPUT_BATCHES, true));
  const outs = r.outputs.length ? r.outputs.map((o) => store(o.item, itemName(o.item), () => b.outputs![o.item] ?? 0, o.n, OUTPUT_BATCHES, false))
    : [h('div', { class: 'store' }, h('span', { class: 'store-disc' }, icon('bolt', 36)), h('span', { class: 'n' }, `${POWER.digester} W`))];
  const between = (op: string) => h('span', { class: 'op' }, op);
  return h('div', { class: 'cd-inset recipe-line' },
    ...ins.flatMap((x, i) => (i ? [between('+'), x] : [x])), between('→'),
    h('div', { class: 'store' }, timer, h('span', { class: 'n' }, `${r.time} s a batch`)), between('→'),
    ...outs.flatMap((x, i) => (i ? [between('+'), x] : [x])));
}

