import {
  buyTruck, copyRoute, deleteRoute, dumpCargo, moveStop, newRoute, removeStop, renameRoute, ROUTE_NAME_MAX, setStopGood, setStopWait, setTruckRoute,
  type Action,
} from '../game/build.ts';
import { err, ok } from '../game/result.ts';
import { BUILDINGS, ITEM_IDS, ITEMS, TRUCK, type ItemId } from '../game/data.ts';
import { routeTiming, truckTime, type StopTiming } from '../game/fleet.ts';
import { givesGoods, takesGoods } from '../game/sim/goods.ts';
import { runtimeOf } from '../game/runtime.ts';
import { trucksOn } from '../game/sim/trucks.ts';
import { routeRate } from '../game/sim/stats.ts';
import { cargoText, describeTruck, stopProblems, truckProblems } from '../game/sim/describe.ts';
import { buildingById, type GameState, type Route } from '../game/state.ts';
import { fill, h, icon, rebuild, set, setVar } from './dom.ts';
import { dec, itemName, pct, playTime, plural } from './format.ts';
import type { GuidePage } from './guide.ts';
import type { Tool } from './hud.ts';
import { routeCss, routeGoods, routeProblems, stopsText, trucksDoing, truckName, typingIn } from './routing.ts';

// The routes card: every route on one side card, the open one expanded. A route shows its stops in a few words, the goods it
// moves, goods a minute, its loop time and how often a truck reaches its slowest stop. Open, each stop has its drop and
// pick-up goods as toggles and a wait; clicking a building on the map adds a stop. Under the stops: each truck, what it is
// doing and the share of the last ten minutes it waited at stops. Timing is observed (fleet.ts), not worked out.

export interface RoutesHost {
  state(): GameState;
  tool(): Tool;
  setTool(t: Tool): void;
  did(r: Action): void;
  toast(msg: string, ok?: boolean): void;
  openGuide(page: GuidePage): void;
  /** Draws a route on the map while the pointer is over it (null: none). */
  previewRoute(id: number | null): void;
  /** Selects a truck, closing the card. */
  selectTruck(id: number): void;
  close(): void;
}

/** A stop's wait choices, in seconds (its own value joins them if it is another). */
const WAITS = [0, 5, 10, 30, 60];

/** How often trucks reach a stop, in a few words. */
export function gapWords(t: StopTiming) {
  return t.gap !== null ? playTime(t.gap) : t.arrivals === 1 ? 'one truck' : 'no truck';
}

export class RoutesCard {
  readonly el = h('div', { class: 'cd-card side-card routes-card', hidden: true });
  private readonly list = h('div', { class: 'side-body' });
  private readonly sub = h('div', { class: 'cd-small' });
  private readonly warn = h('p', { class: 'cd-small cd-bad' });
  private readonly filterEl = h('input', {
    class: 'cd-input', placeholder: 'Find a route, stop or good…', spellcheck: false,
    oninput: () => { this.filter = this.filterEl.value; this.key = ''; },
    onkeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') { this.filterEl.value = ''; this.filter = ''; this.key = ''; this.filterEl.blur(); e.stopPropagation(); } },
  });
  private readonly foot = h('div', { class: 'cd-small routes-foot' });
  private filter = '';
  private key = '';
  private updater: (() => void) | null = null;
  /** Silo and depot stops showing every good rather than the route's, by `route:stop`. */
  private readonly allGoods = new Set<string>();
  private readonly host: RoutesHost;

  constructor(host: RoutesHost) {
    this.host = host;
    this.el.append(
      h('div', { class: 'side-head' }, icon('route', 40), h('div', { class: 'grow' }, h('h2', { class: 'cd-title' }, 'Routes'), this.sub),
        h('button', { class: 'cd-btn is-sm', title: 'Make a route, then click buildings on the map to add its stops', onclick: () => this.edit(newRoute(this.host.state())) }, '+ New route'),
        h('button', { class: 'cd-btn is-icon is-sm', title: 'Trucks and routes in the guide (G)', 'aria-label': 'Guide', onclick: () => this.host.openGuide({ kind: 'topic', id: 'trucks' }) }, icon('book', 18)),
        h('button', { class: 'cd-btn is-icon is-sm', title: 'Close (O or Esc)', 'aria-label': 'Close', onclick: () => this.host.close() }, icon('close', 14))),
      this.warn, this.filterEl, this.list, this.foot);
  }

  get open() { return !this.el.hidden; }
  refresh() { this.key = ''; }

  private edit(r: Route) { this.host.setTool({ kind: 'route', route: r.id }); this.key = ''; }
  private done() { this.host.setTool({ kind: 'select' }); this.key = ''; }

  /** Shows the card (or hides it), redrawing when the routes change and not while you type in it. */
  update(show: boolean) {
    this.el.hidden = !show;
    if (!show) { this.key = ''; this.updater = null; return; }
    const s = this.host.state(), tool = this.host.tool(), editing = tool.kind === 'route' ? tool.route : null;
    const key = JSON.stringify([runtimeOf(s).routesVersion, s.routes.map((r) => [r.id, routeGoods(s, r), stopProblems(s, r),
      r.id === editing ? r.stops.map((st) => { const b = buildingById(s, st.building); return b?.type === 'silo' ? Object.keys(b.store) : b?.type === 'field' ? [b.crop, b.harvest] : null; }) : 0]),
    s.trucks.filter((t) => t.route === null).length, s.buildings.filter((b) => b.type === 'garage').length, this.filter, editing, [...this.allGoods]]);
    if (key !== this.key && !typingIn(this.el)) {
      this.key = key;
      this.host.previewRoute(null);
      const lines: (() => void)[] = [];
      const f = this.filter.trim().toLowerCase();
      const shown = s.routes.filter((r) => r.id === editing || !f || [r.name, stopsText(s, r), routeGoods(s, r).map(itemName).join(' ')].some((t) => t.toLowerCase().includes(f)));
      this.filterEl.hidden = s.routes.length <= 4 && !f;
      const idle = s.trucks.filter((t) => t.route === null).length;
      set(this.warn, idle ? `${plural(idle, 'truck')} ${idle > 1 ? 'have' : 'has'} no route: + on a route puts ${idle > 1 ? 'one' : 'it'} to work.` : '');
      this.warn.hidden = !idle;
      fill(this.list, ...(shown.length ? shown.map((r) => (r.id === editing ? this.openRoute(s, r, lines) : this.closedRoute(s, r, lines)))
        : [h('p', { class: 'cd-small' }, s.routes.length ? 'No route matches.'
          : s.buildings.some((b) => b.type === 'garage') ? 'No routes yet. Make one, click the buildings it stops at, and give it trucks.'
            : 'No routes yet. Build a garage (T) for trucks, then make a route. Buildings that share an edge trade goods without trucks.')]));
      this.updater = () => { for (const l of lines) l(); };
    }
    set(this.sub, `${plural(s.routes.length, 'route')} · ${plural(s.trucks.length, 'truck')}`);
    const garages = s.buildings.filter((b) => b.type === 'garage');
    set(this.foot, garages.length ? `${plural(garages.length, 'garage')} · ${s.trucks.length} of ${garages.length * TRUCK.perGarage} bays · ${TRUCK.chargeRate} W a truck charging` : 'No garage yet: trucks are bought at one.');
    this.updater?.();
  }

  /** Puts a truck on a route: one with no route, else a new one from a garage with room. */
  private addTruck(s: GameState, r: Route): Action {
    const idle = s.trucks.find((t) => t.route === null);
    if (idle) return setTruckRoute(s, idle, r);
    const garages = s.buildings.filter((b) => b.type === 'garage');
    if (!garages.length) return err('Build a garage (T) first: trucks are bought there.');
    const g = garages.find((x) => s.trucks.filter((t) => t.garage === x.id).length < TRUCK.perGarage);
    if (!g) return err(`Every garage holds ${TRUCK.perGarage} trucks. Build another garage for more.`);
    const bought = buyTruck(s, g);
    if (!bought.ok) return bought;
    setTruckRoute(s, bought.value.truck, r);
    return ok({ message: `Bought a truck for ${r.name}.` });
  }

  /** A route's head line: its colour, name, stops and trucks, and goods a minute. */
  private headLine(s: GameState, r: Route, lines: (() => void)[], name: Node) {
    const rate = h('b', { class: 'cd-num rate' }), warn = h('span', { class: 'cd-status is-blocked warn', hidden: true });
    lines.push(() => {
      rebuild(rate, dec(routeRate(s, r)), () => [dec(routeRate(s, r)), h('span', { class: 'cd-faint' }, ' /min')]);
      const ps = routeProblems(s, r);
      warn.hidden = !ps.length;
      set(warn, String(ps.length));
      warn.title = ps.join('\n');
    });
    return h('div', { class: 'route-head' }, h('span', { class: 'swatch', style: `background: ${routeCss(s, r)}` }), name,
      h('span', { class: 'cd-small' }, `${plural(r.stops.length, 'stop')} · ${plural(trucksOn(s, r).length, 'truck')}`), warn, h('span', { class: 'fill' }), rate);
  }

  /** Loop time and the gap at the slowest stop. */
  private timing(s: GameState, r: Route, lines: (() => void)[]) {
    const loop = h('div'), gap = h('div'), note = h('div', { class: 'cd-small cd-faint' });
    lines.push(() => {
      const t = routeTiming(s, r), trucks = trucksOn(s, r).length;
      rebuild(loop, `${t.loop ?? ''} ${t.driving ?? ''}`, () => [h('div', { class: 'cd-label' }, 'Loop time'), h('div', { class: 'v' },
        t.loop !== null ? [h('span', { class: 'big' }, playTime(t.loop)), h('span', { class: 'cd-small' }, ' a round')]
          : t.driving !== null ? [h('span', { class: 'big' }, playTime(t.driving)), h('span', { class: 'cd-small' }, ' driving, not seen yet')] : [h('span', { class: 'cd-small' }, '–')])]);
      rebuild(gap, `${trucks} ${t.slowest?.stop} ${t.slowest?.timing.gap} ${t.slowest?.timing.arrivals}`, () => [h('div', { class: 'cd-label' }, 'Between trucks'), h('div', { class: 'v' },
        !trucks || !t.slowest ? [h('span', { class: 'cd-small' }, 'no trucks')]
          : t.slowest.timing.gap !== null ? [h('span', { class: 'big' }, playTime(t.slowest.timing.gap)), h('span', { class: 'cd-small' }, ` at stop ${t.slowest.stop + 1}, the slowest`)]
            : [h('span', { class: 'big' }, gapWords(t.slowest.timing)), h('span', { class: 'cd-small' }, ` at stop ${t.slowest.stop + 1} in ${playTime(t.window)}`)])]);
      set(note, `Measured over the last ${playTime(t.window)} of play. Between trucks: the average gap between arrivals at the stop trucks reach least often.`);
    });
    return [h('div', { class: 'route-timing' }, loop, gap), note];
  }

  private closedRoute(s: GameState, r: Route, lines: (() => void)[]): HTMLElement {
    const goods = routeGoods(s, r);
    return h('div', {
      class: 'route-card', title: 'Click to open', role: 'button', tabindex: 0, 'aria-label': `Open ${r.name}`,
      onpointerenter: () => this.host.previewRoute(r.id), onpointerleave: () => this.host.previewRoute(null), onclick: () => this.edit(r),
      // Enter or Space opens it from the keyboard (and Space doesn't reach the game as pause).
      onkeydown: (e: KeyboardEvent) => {
        if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault(); e.stopPropagation(); this.edit(r);
      },
    },
    this.headLine(s, r, lines, h('b', { class: 'name' }, r.name)),
    h('div', { class: 'cd-small stops' }, stopsText(s, r) || 'No stops yet'),
    goods.length ? h('div', { class: 'chips' }, ...goods.flatMap((i, k) => [k ? h('span', { class: 'cd-faint' }, '·') : null, h('span', { class: 'cd-chip' }, icon(i, 18), itemName(i))])) : null,
    ...this.timing(s, r, lines).slice(0, 1));
  }

  private openRoute(s: GameState, r: Route, lines: (() => void)[]): HTMLElement {
    const trucks = trucksOn(s, r);
    const name = h('input', {
      class: 'route-name-input', value: r.name, maxLength: ROUTE_NAME_MAX, title: 'Click to rename', spellcheck: false, 'aria-label': 'Route name',
      onchange: () => { const res = renameRoute(s, r, name.value); if (!res.ok) name.value = r.name; this.host.did(res); },
      onkeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') { name.value = r.name; e.stopPropagation(); } if (e.key === 'Enter' || e.key === 'Escape') name.blur(); },
    });
    const problems = stopProblems(s, r);
    // The goods this route moves anywhere but a silo or the depot, which take and give anything: those are the choices at a
    // silo or the depot (with every good a button away).
    const moved = new Set<ItemId>();
    for (const st of r.stops) {
      const b = buildingById(s, st.building);
      if (!b || b.type === 'silo' || b.type === 'depot') continue;
      for (const i of st.pick) if (givesGoods(b).includes(i)) moved.add(i);
      for (const i of st.drop) if (takesGoods(b).includes(i)) moved.add(i);
    }
    const stops = r.stops.map((st, i) => {
      const b = buildingById(s, st.building);
      if (!b) return null;
      const open = this.allGoods.has(`${r.id}:${i}`), anything = b.type === 'silo' || b.type === 'depot';
      // Always with the goods it is set to, so any of them can be turned off (a field's old crop, say).
      const choices = (all: ItemId[], how: 'drop' | 'pick') => (anything && !open ? ITEM_IDS.filter((x) => moved.has(x) || st.pick.includes(x) || (b.type === 'silo' && b.store[x]))
        : ITEM_IDS.filter((x) => all.includes(x) || st[how].includes(x)));
      const toggle = (item: ItemId, how: 'drop' | 'pick') => h('button', {
        class: 'cd-gtoggle is-sm', 'aria-pressed': String(st[how].includes(item)), 'aria-label': `${how === 'drop' ? 'Drop' : 'Pick up'} ${itemName(item)}`,
        title: `${ITEMS[item].name}: ${st[how].includes(item) ? 'click to stop' : 'click to start'} ${how === 'drop' ? 'dropping it' : 'picking it up'} here`,
        onclick: () => this.host.did(setStopGood(s, r, i, item, st[how].includes(item) ? null : how)),
      }, icon(item, 20));
      const group = (label: string, how: 'drop' | 'pick', all: ItemId[]) => {
        const list = choices(all, how), hidden = anything && !open ? st[how].filter((x) => !list.includes(x)).length : 0;
        return [h('span', { class: 'cd-label' }, label), ...list.map((x) => toggle(x, how)), list.length ? null : h('span', { class: 'cd-small cd-faint' }, 'nothing'),
          hidden ? h('span', { class: 'cd-small' }, `+ ${hidden} more`) : null];
      };
      const waits = WAITS.includes(st.wait) ? WAITS : [...WAITS, st.wait].sort((a, c) => a - c);
      return h('div', { class: 'stop' },
        h('span', { class: 'num', style: `background: ${routeCss(s, r)}` }, String(i + 1)),
        h('div', { class: 'top' }, h('b', null, BUILDINGS[b.type].name), h('span', { class: 'fill' }),
          h('span', { class: 'tseg', title: 'How long a truck waits here for room or goods' }, ...waits.map((w) => h('button', {
            class: w === st.wait ? 'is-on' : '', onclick: () => this.host.did(setStopWait(s, r, i, w)),
          }, w === st.wait ? `${w} s` : String(w)))),
          h('span', { class: 'moves' },
            h('button', { title: 'Earlier', 'aria-label': 'Move earlier', disabled: i === 0, onclick: () => this.host.did(moveStop(s, r, i, -1)) }, '↑'),
            h('button', { title: 'Later', 'aria-label': 'Move later', disabled: i === r.stops.length - 1, onclick: () => this.host.did(moveStop(s, r, i, 1)) }, '↓'),
            h('button', { title: 'Take this stop out', 'aria-label': 'Remove stop', onclick: () => this.host.did(removeStop(s, r, i)) }, '×'))),
        problems[i] ? h('div', { class: 'cd-small cd-bad problem' }, problems[i]) : null,
        h('div', { class: 'goods' }, ...group('Drop', 'drop', takesGoods(b)), b.type === 'depot' ? null : h('span', { class: 'sep' }), ...(b.type === 'depot' ? [] : group('Pick up', 'pick', givesGoods(b))),
          anything ? h('button', { class: 'link more', onclick: () => { if (open) this.allGoods.delete(`${r.id}:${i}`); else this.allGoods.add(`${r.id}:${i}`); this.key = ''; } }, open ? 'fewer goods' : 'every good') : null));
    });
    // Each truck: its idle share, what it is doing and carrying, and what it can't do, as it changes.
    const truckRows = trucks.map((t) => {
      const bar = h('div', { class: 'cd-bar', style: '--col: var(--ink-3)' }, h('i')), idle = h('span', { class: 'cd-small' }), what = h('div', { class: 'cd-small' }), warn = h('div');
      const dump = h('button', { class: 'cd-btn is-ghost is-sm', title: 'Throw its cargo away (the goods are lost), so it has room again', onclick: () => this.host.did(dumpCargo(t)) }, 'Dump');
      lines.push(() => {
        const time = truckTime(s, t, r.id);
        setVar(bar, '--v', (time.idle ?? 0).toFixed(3));
        rebuild(idle, String(time.idle === null ? '' : Math.round(time.idle * 100)), () => (time.idle === null ? ['–'] : [h('b', null, pct(time.idle)), ' idle']));
        set(what, `${describeTruck(s, t)}${t.cargo.length && t.phase !== 'drive' ? ` · carries ${cargoText(t.cargo)}` : ''}`);
        dump.disabled = !t.cargo.length;
        const ps = truckProblems(s, t);
        rebuild(warn, ps.join('|'), () => ps.map((p) => h('div', { class: 'cd-small cd-bad' }, p)));
      });
      return h('div', { class: 'route-truck' },
        h('div', { class: 'line' }, icon('truck', 28), h('button', { class: 'link', onclick: () => this.host.selectTruck(t.id) }, truckName(s, t)), bar, idle, dump),
        what, warn);
    });
    const doing = h('div', { class: 'cd-small' });
    lines.push(() => set(doing, trucksDoing(s, r)));
    return h('div', { class: 'route-card is-open', style: `--route: ${routeCss(s, r)}` },
      this.headLine(s, r, lines, name),
      h('div', { class: 'stops-list' }, ...(stops.length ? stops : [h('p', { class: 'cd-small' }, 'No stops yet.')])),
      h('div', { class: 'cd-small add-hint' }, r.stops.length < TRUCK.maxStops ? `+ Click a building on the map to add a stop · ${r.stops.length} of ${TRUCK.maxStops}` : `${TRUCK.maxStops} stops: the most a route can have`),
      ...this.timing(s, r, lines),
      h('div', { class: 'route-trucks' },
        h('div', { class: 'line' }, h('span', { class: 'cd-label' }, 'Trucks'), h('span', { class: 'fill' }),
          h('button', { class: 'cd-btn is-sm is-icon', title: 'Send a truck home', 'aria-label': 'Send a truck home', disabled: !trucks.length, onclick: () => this.host.did(setTruckRoute(s, trucks[trucks.length - 1], null)) }, '−'),
          h('b', { class: 'cd-num' }, String(trucks.length)),
          h('button', { class: 'cd-btn is-sm is-icon', title: 'Add a truck: one with no route, else a new one', 'aria-label': 'Add a truck', onclick: () => this.host.did(this.addTruck(s, r)) }, '+')),
        doing, ...truckRows),
      h('div', { class: 'side-foot' },
        h('button', { class: 'cd-btn is-danger is-sm', onclick: () => { this.host.did(deleteRoute(s, r)); this.done(); } }, icon('trash', 16), 'Delete'),
        h('button', { class: 'cd-btn is-ghost is-sm', title: 'A copy of this route, without its trucks', onclick: () => { const c = copyRoute(s, r); this.host.toast(`Copied ${r.name} as ${c.name}. Give it trucks.`); this.edit(c); } }, 'Copy'),
        h('button', { class: 'cd-btn is-primary is-sm', onclick: () => this.done() }, 'Done')));
  }
}
