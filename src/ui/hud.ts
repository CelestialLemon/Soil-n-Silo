import { hourLabel } from 'pixel3d-renderer';
import {
  addStop, buyTruck, copyRoute, deleteRoute, dumpCargo, moveStop, newRoute, priceOf, remove, removeStop, renameRoute, ROUTE_NAME_MAX, sellTruck,
  setCrop, setRecipe, setStopGood, setStopWait, setTruckRoute, truckPrice, type Result,
} from '../game/build.ts';
import {
  BUILDINGS, CATEGORIES, CROP_IDS, CROPS, FIELD, GROUP_NAMES, GROUPS, HIVE, ITEM_IDS, ITEMS, POWER, recipesFor, SILO, TRUCK,
  type BuildingId, type Ingredient, type ItemId,
} from '../game/data.ts';
import { hasHistory } from '../game/history.ts';
import { networkOf, networks, type Network } from '../game/power.ts';
import {
  cargoText, dayAt, describeLinks, describeStatus, describeTruck, exposureOf, fieldFertility, fieldPace, flowersNear, givesGoods, goalDone, hourAt, isPollinated,
  isStop, linksOf, makes, medalFor, ratePerMin, recipeOf, routeOf, routeRate, routesAt, shareOf, soilHealth, stopProblems, sunAt, takesGoods,
  truckProblems, trucksOn, wants, windAt, type Medal,
} from '../game/sim.ts';
import { buildingById, routeById, truckById, type Building, type Dir, type GameState, type Route, type Truck } from '../game/state.ts';
import { netColour } from '../world/powerView.ts';
import { routeColour } from '../world/routeView.ts';
import { NET_COLOURS, ROUTE_COLOURS } from '../world/shapes.ts';
import type { Overlay } from '../world/view.ts';
import { h, icon } from './dom.ts';
import { Dock, dockTip } from './dock.ts';
import { guidePanel, type GuidePage } from './guide.ts';
import { Inspector } from './inspector.ts';
import { CommissionCard, TopRight, ViewBar, viewControls, type Panel, type PlayHost } from './playhud.ts';
import { routeCss, routeGoods, routeProblems, stopsText, stopsKey, trucksDoing, truckName, typingIn } from './routing.ts';
import { PIXEL_SIZES, uiScale, type SettingsStore } from './settings.ts';
import { WorldLayer } from './world.ts';

// The HUD over the canvas: the commission and its clock, power and weather, the goals, the build bar, what's under the
// pointer, the inspector for the selected building or truck (or the route being edited), messages, and the modal screens
// (intro, pause, stats, results, guide). The game state belongs to main.ts; the HUD changes it only through the rules in
// src/game/.

export type Tool =
  | { kind: 'select' }
  | { kind: 'build'; type: BuildingId; rot: Dir }
  | { kind: 'remove' }
  /** Editing a route: clicking a building adds it as a stop. */
  | { kind: 'route'; route: number };

export interface HudHost {
  state(): GameState;
  tool(): Tool;
  setTool(t: Tool): void;
  /** 0 when paused. */
  speed(): number;
  setSpeed(n: number): void;
  overlay(): Overlay;
  setOverlay(o: Overlay): void;
  selected(): number | null;
  select(id: number | null): void;
  changed(): void;
  turn(d: 1 | -1): void;
  /** +1 zooms in, -1 out. */
  zoom(d: 1 | -1): void;
  settings: SettingsStore;
  menu(): void;
  restart(): void;
  /** Draws a route on the map while the pointer is over it in the routes panel (null: none). */
  previewRoute(id: number | null): void;
}

const fmtTime = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
const watts = (w: number) => `${w >= 100 ? Math.round(w) : w.toFixed(1).replace(/\.0$/, '')} W`;
const MEDAL_NAME: Record<Medal, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/** A good's swatch and name. */
const good = (id: ItemId, n?: number | string) => h('span', { class: 'good' }, h('i', { style: `background:#${ITEMS[id].colour.toString(16).padStart(6, '0')}` }), n !== undefined ? `${n} ` : '', ITEMS[id].name.toLowerCase());
const ingredient = (ing: Ingredient) => ('item' in ing ? good(ing.item, ing.n) : h('span', { class: 'good' }, `${ing.n} `, GROUP_NAMES[ing.group].split(' (')[0]));
const button = (label: string | Node, onclick: () => void, o: { disabled?: boolean; primary?: boolean; title?: string; active?: boolean; cls?: string } = {}) =>
  h('button', { class: [o.primary ? 'primary' : '', o.active ? 'active' : '', o.cls ?? ''].join(' ').trim(), disabled: !!o.disabled, title: o.title, onclick: (e: Event) => { e.stopPropagation(); onclick(); } }, label);
function set(el: HTMLElement, text: string) { if (el.textContent !== text) el.textContent = text; }
const bar = () => { const fill = h('div', { class: 'fill' }); return { el: h('div', { class: 'bar' }, fill), set: (k: number) => { fill.style.width = `${Math.max(0, Math.min(1, k)) * 100}%`; } }; };
const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
interface Modal { name: string; el: HTMLElement; blocking: boolean }

export class Hud {
  private readonly host: HudHost;
  /** The new interface (Clearday), scaled by the interface size: the world's labels, then the HUD. */
  private readonly ui = h('div', { class: 'ui cd-root' });
  readonly world = new WorldLayer();
  private readonly hud = h('div', { class: 'ui-hud' });
  private readonly commission: CommissionCard;
  private readonly top: TopRight;
  private readonly view: ViewBar;
  private readonly controls: HTMLElement;
  private readonly dock: Dock;
  private readonly toasts = h('div', { class: 'toasts' });
  /** The card of the building pointed at in the dock, above it. */
  private readonly tip = h('div');
  private tipFor: BuildingId | null = null;
  private zoom = 1;
  private readonly inspector = h('div', { class: 'card inspector' });
  private inspectKey = '';
  private inspectUpdate: (() => void) | null = null;
  /** The side card for the selected building or truck. */
  private readonly side: Inspector;
  /** Silo and depot stops showing every good rather than the route's, by `route:stop`. */
  private readonly allGoods = new Set<string>();
  private readonly layer = h('div', { class: 'layer' });
  private modals: Modal[] = [];
  private statsOpen = false;
  private readonly statsBody = h('div');
  private readonly stats = h('div', { class: 'card stats-panel' }, h('div', { class: 'head' }, h('b', null, 'Production (last minute)'), button('✕', () => this.toggleStats(), { cls: 'close' })), this.statsBody);
  private routesOpen = false;
  private readonly routesHead = h('div', { class: 'head' });
  private readonly routesFilterEl = h('input', {
    class: 'route-filter', placeholder: 'Find a route, stop or good…', spellcheck: false,
    oninput: () => { this.routesFilter = this.routesFilterEl.value; this.routesKey = ''; },
    onkeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') { this.routesFilterEl.value = ''; this.routesFilter = ''; this.routesKey = ''; this.routesFilterEl.blur(); } },
  });
  private readonly routesList = h('div', { class: 'routes-list' });
  private readonly routesPanel = h('div', { class: 'card routes-panel' }, this.routesHead, this.routesFilterEl, this.routesList);
  private routesKey = '';
  private routesUpdate: (() => void) | null = null;
  /** The routes panel's filter, kept while it is closed. */
  private routesFilter = '';
  private lastSlow = 0;

  constructor(root: HTMLElement, host: HudHost) {
    this.host = host;
    const play: PlayHost = {
      state: () => host.state(), settings: () => host.settings.get(), speed: () => host.speed(), setSpeed: (n) => host.setSpeed(n),
      overlay: () => host.overlay(), setOverlay: (o) => host.setOverlay(o), turn: (d) => host.turn(d), zoom: (d) => host.zoom(d),
      openPause: () => this.openPause(), panelOpen: (p) => this.panelOpen(p), togglePanel: (p) => this.togglePanel(p),
    };
    this.commission = new CommissionCard(play);
    this.top = new TopRight(play);
    this.view = new ViewBar(play);
    this.controls = viewControls(play);
    this.side = new Inspector({
      state: () => host.state(), tool: () => host.tool(), selected: () => host.selected(), select: (id) => { host.select(id); this.refresh(); },
      did: (r) => this.did(r), openGuide: (p) => this.openGuide(p), editRoute: (r) => this.edit(r),
    });
    this.dock = new Dock({ state: () => host.state(), tool: () => host.tool(), setTool: (t) => host.setTool(t), tip: (id) => this.showTip(id) });
    this.hud.append(this.commission.el, this.commission.pill, this.top.el, this.view.el, this.controls, this.dock.el, this.side.el,
      h('div', { class: 'hud-above' }, this.toasts, this.tip));
    this.ui.append(this.world.el, this.hud);
    root.append(h('div', { class: 'hud' }, h('div', { class: 'left-col' }, this.routesPanel), this.inspector, this.stats), this.layer, this.ui);
    host.settings.listen((st) => { this.ui.classList.toggle('is-calm', st.reduceMotion); this.fit(); this.lastSlow = 0; });
    addEventListener('resize', () => this.fit());
    this.refresh();
  }

  get modal() { return this.modals.some((m) => m.blocking); }

  /** Scales the interface for the window and the interface size setting. */
  private fit() {
    this.zoom = uiScale(this.host.settings.get(), innerWidth, innerHeight);
    this.ui.style.zoom = String(this.zoom);
    this.ui.style.width = `${innerWidth / this.zoom}px`; this.ui.style.height = `${innerHeight / this.zoom}px`;
    this.world.setZoom(this.zoom);
    // The view bar gives up its words when it would meet the dock.
    this.view.el.classList.remove('is-compact');
    requestAnimationFrame(() => {
      const v = this.view.el.getBoundingClientRect(), d = this.dock.el.getBoundingClientRect();
      this.view.el.classList.toggle('is-compact', v.right + 12 > d.left);
    });
  }

  // ---- Every frame ----

  update() {
    const now = performance.now();
    this.top.updateButtons();
    this.view.update();
    const tool = this.host.tool();
    if (tool.kind === 'build') this.dock.showCategoryOf(tool.type);
    this.dock.update();
    this.side.update();
    const side = this.side.open || this.inspector.style.display === 'block';
    this.top.el.hidden = side; this.controls.hidden = side;
    if (now - this.lastSlow < 150) return;
    this.lastSlow = now;
    this.commission.update(side);
    this.top.update();
    this.inspect();
    if (this.statsOpen) this.renderStats();
    if (this.routesOpen) this.renderRoutes();
  }

  private showTip(id: BuildingId | null) {
    this.tipFor = id;
    this.tip.replaceChildren(...(id ? [dockTip(this.host.state(), id)] : []));
  }

  /** A message for the result of an action (a building's icon beside it, if given). */
  toast(msg: string, ok = true, ic?: string) {
    if (!msg) return;
    const t = h('span', { class: `cd-toast${ok ? '' : ' is-bad'}` }, ic ? icon(ic) : icon(ok ? 'check' : 'warn'), msg);
    this.toasts.append(t);
    while (this.toasts.children.length > 4) this.toasts.firstChild!.remove();
    setTimeout(() => t.classList.add('is-gone'), 2200);
    setTimeout(() => t.remove(), 2800);
  }

  /** Redraw what depends on the tool and selection right away. */
  refresh() { this.inspectKey = ''; this.lastSlow = 0; this.side.refresh(); }

  /** Whether a panel is open. */
  panelOpen(p: Panel) {
    if (p === 'ledger') return this.statsOpen;
    if (p === 'routes') return this.routesOpen;
    if (p === 'guide') return this.modals.some((m) => m.name === 'guide');
    return false;
  }
  togglePanel(p: Panel) {
    if (p === 'ledger') this.toggleStats();
    else if (p === 'routes') this.toggleRoutes();
    else if (p === 'guide') this.openGuide();
  }

  // ---- Inspector ----

  /** Shows a result as a message (if it has one) and redraws the inspector. */
  private did(r: Result) {
    if (r.message) this.toast(r.message, r.ok);
    this.inspectKey = '';
    this.host.changed();
  }

  /** Opens the route editor (the inspector shows it until you are done). */
  private edit(r: Route) { this.host.setTool({ kind: 'route', route: r.id }); this.refresh(); }

  /** The route being edited, in the old card (until the routes card replaces it). */
  private inspect() {
    const s = this.host.state(), tool = this.host.tool();
    const editing = tool.kind === 'route' ? routeById(s, tool.route) : null;
    if (!editing) {
      if (this.inspector.style.display !== 'none') { this.inspector.style.display = 'none'; this.inspector.replaceChildren(); }
      this.inspectKey = ''; this.inspectUpdate = null;
      return;
    }
    // The route editor also follows what its warnings and goods choices depend on: the stops' problems, the silos' stock.
    const key = JSON.stringify(['route', editing.id, editing.name, stopsKey(editing), trucksOn(s, editing).map((x) => x.id), [...this.allGoods], stopProblems(s, editing),
      editing.stops.map((st) => { const b = buildingById(s, st.building); return b?.type === 'silo' ? Object.keys(b.store!) : b?.type === 'field' ? [b.crop, b.harvest] : null; })]);
    if (key !== this.inspectKey && !typingIn(this.inspector)) {
      this.inspectKey = key;
      this.inspector.style.display = 'block';
      const { el, update } = this.renderRoute(s, editing);
      this.inspector.replaceChildren(el);
      this.inspectUpdate = update;
    }
    this.inspectUpdate?.();
  }

  // ---- The route editor ----

  /** Puts a truck on a route: one with no route, else a new one from a garage with room. */
  private addTruck(s: GameState, r: Route): Result {
    const idle = s.trucks.find((t) => t.route === null);
    if (idle) return setTruckRoute(s, idle, r);
    const garages = s.buildings.filter((b) => b.type === 'garage');
    if (!garages.length) return { ok: false, message: 'Build a garage (T) first: trucks are bought there.' };
    const g = garages.find((x) => s.trucks.filter((t) => t.garage === x.id).length < TRUCK.perGarage);
    if (!g) return { ok: false, message: `Every garage holds ${TRUCK.perGarage} trucks. Build another garage for more.` };
    const bought = buyTruck(s, g);
    if (!bought.ok) return bought;
    setTruckRoute(s, bought.truck!, r);
    return { ok: true, message: `Bought a truck for ${r.name}.` };
  }

  private renderRoute(s: GameState, r: Route): { el: HTMLElement; update: () => void } {
    const lines: (() => void)[] = [];
    const done = () => { this.host.setTool({ kind: 'select' }); this.refresh(); };
    const trucks = trucksOn(s, r), rate = h('b');
    lines.push(() => set(rate, `${routeRate(s, r).toFixed(1)} goods a minute`));
    // Each truck: what it is doing and carrying, and what it can't do (cargo no stop takes, no way home), as it changes.
    const truckRows = trucks.map((t) => {
      const what = h('div', { class: 'hint' }), warn = h('div');
      const dump = button('Dump', () => this.did(dumpCargo(t)), { cls: 'small', title: 'Throw its cargo away (the goods are lost), so it has room again' });
      lines.push(() => {
        set(what, `${describeTruck(s, t)}${t.cargo.length && t.phase !== 'drive' ? ` · carries ${cargoText(t.cargo)}` : ''}`);
        dump.disabled = !t.cargo.length;
        const ps = truckProblems(s, t);
        if (warn.dataset.key === ps.join('|')) return;
        warn.dataset.key = ps.join('|');
        warn.replaceChildren(...ps.map((p) => h('p', { class: 'hint warn-hint' }, p)));
      });
      return h('div', { class: 'truck-row' },
        h('div', { class: 'kv' }, h('a', { href: '#', class: 'glink', onclick: (e: Event) => { e.preventDefault(); this.host.setTool({ kind: 'select' }); this.host.select(t.id); this.refresh(); } }, truckName(s, t)), dump),
        what, warn);
    });
    const name = h('input', {
      class: 'route-title', value: r.name, maxLength: ROUTE_NAME_MAX, title: 'Click to rename', spellcheck: false,
      onchange: () => { const res = renameRoute(r, name.value); if (!res.ok) name.value = r.name; this.did(res); },
      onkeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') name.value = r.name; if (e.key === 'Enter' || e.key === 'Escape') name.blur(); },
    });
    const problems = stopProblems(s, r);
    // The goods this route moves anywhere but a silo or the depot, which take and give anything: those are the choices
    // at a silo or the depot (with every good a button away).
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
      const choices = (all: ItemId[], how: 'drop' | 'pick') => (anything && !open ? ITEM_IDS.filter((x) => moved.has(x) || st.pick.includes(x) || (b.type === 'silo' && b.store![x]))
        : ITEM_IDS.filter((x) => all.includes(x) || st[how].includes(x)));
      const chip = (item: ItemId, how: 'drop' | 'pick') => button(good(item), () => this.did(setStopGood(r, i, item, st[how].includes(item) ? null : how)),
        { active: st[how].includes(item), title: `${st[how].includes(item) ? 'Click to stop' : 'Click to start'} ${how === 'drop' ? 'dropping' : 'picking up'} ${ITEMS[item].name.toLowerCase()} here` });
      const row = (label: string, how: 'drop' | 'pick', all: ItemId[]) => {
        const list = choices(all, how), hidden = anything && !open ? st[how].filter((x) => !list.includes(x)).length : 0;
        return h('div', { class: 'choices stop-goods' }, h('span', { class: 'lbl' }, label), ...list.map((x) => chip(x, how)),
          list.length ? null : h('small', { class: 'hint' }, 'none yet'),
          hidden ? h('small', { class: 'hint' }, `+ ${hidden} more`) : null);
      };
      const wait = h('div', { class: 'kv' }, h('span', null, 'Waits for room or goods'), h('span', null,
        button('−', () => this.did(setStopWait(r, i, st.wait - (st.wait > 10 ? 5 : 1))), { cls: 'small', disabled: st.wait <= 0 }),
        h('b', null, ` ${st.wait} s `),
        button('+', () => this.did(setStopWait(r, i, st.wait + (st.wait >= 10 ? 5 : 1))), { cls: 'small', disabled: st.wait >= TRUCK.maxWait })));
      return h('div', { class: 'stop' },
        h('div', { class: 'head' }, h('b', null, `${i + 1}. ${BUILDINGS[b.type].name}`), h('span', { class: 'head-buttons' },
          button('↑', () => this.did(moveStop(s, r, i, -1)), { cls: 'small', disabled: i === 0, title: 'Earlier' }),
          button('↓', () => this.did(moveStop(s, r, i, 1)), { cls: 'small', disabled: i === r.stops.length - 1, title: 'Later' }),
          button('✕', () => this.did(removeStop(s, r, i)), { cls: 'small', title: 'Take this stop out' }))),
        problems[i] ? h('p', { class: 'hint warn-hint' }, problems[i]) : null,
        row('Drop', 'drop', takesGoods(b)),
        b.type === 'depot' ? null : row('Pick up', 'pick', givesGoods(b)),
        anything ? button(open ? 'Fewer goods' : 'Every good', () => { if (open) this.allGoods.delete(`${r.id}:${i}`); else this.allGoods.add(`${r.id}:${i}`); this.inspectKey = ''; }, { cls: 'small' }) : null,
        wait);
    });
    const el = h('div', null,
      h('div', { class: 'head' }, h('span', { class: 'route-line' }, h('i', { class: 'dot', style: `background:${hex(ROUTE_COLOURS[routeColour(s, r)])}` }), name), h('span', { class: 'head-buttons' },
        button('?', () => this.openGuide({ kind: 'topic', id: 'trucks' }), { cls: 'close', title: 'Trucks and routes in the guide (G)' }),
        button('✕', done, { cls: 'close', title: 'Done (Esc)' }))),
      h('p', { class: 'hint' }, `Click buildings on the map to add stops (up to ${TRUCK.maxStops}). Trucks drive them in order, then start again.`),
      h('div', { class: 'kv' }, h('span', null, 'Trucks'), h('span', null,
        button('−', () => this.did(setTruckRoute(s, trucks[trucks.length - 1], null)), { cls: 'small', disabled: !trucks.length, title: 'Send a truck home' }),
        h('b', null, ` ${trucks.length} `),
        button('+', () => this.did(this.addTruck(s, r)), { cls: 'small', title: 'Add a truck: one with no route, else a new one' }))),
      h('div', { class: 'kv' }, h('span', null, 'Moved'), rate),
      ...truckRows,
      ...(stops.length ? stops : [h('p', { class: 'hint' }, 'No stops yet.')]),
      h('div', { class: 'actions' },
        button('Delete route', () => { this.did(deleteRoute(s, r)); done(); }, { cls: 'danger' }),
        button('Copy', () => { const c = copyRoute(s, r); this.toast(`Copied ${r.name} as ${c.name}. Give it trucks.`); this.edit(c); }, { title: 'A copy of this route, without its trucks' }),
        button('Done', done, { primary: true })));
    return { el, update: () => { for (const l of lines) l(); } };
  }

  // ---- Stats ----

  toggleStats() { this.statsOpen = !this.statsOpen; this.stats.style.display = this.statsOpen ? 'block' : 'none'; if (this.statsOpen) this.renderStats(); }

  private renderStats() {
    const s = this.host.state();
    const rows = ITEM_IDS.filter((i) => s.made[i] || s.delivered[i]).map((i) => h('tr', null,
      h('td', null, good(i)), h('td', null, ratePerMin(s, i, 'made').toFixed(1)), h('td', null, ratePerMin(s, i, 'delivered').toFixed(1)),
      h('td', null, String(s.made[i] ?? 0)), h('td', null, String(s.delivered[i] ?? 0))));
    this.statsBody.replaceChildren(
      rows.length ? h('table', null, h('tr', null, h('th', null, 'Good'), h('th', null, 'Made/min'), h('th', null, 'Delivered/min'), h('th', null, 'Made'), h('th', null, 'Delivered')), ...rows)
        : h('p', { class: 'hint' }, 'Nothing made yet.'),
      h('div', { class: 'kv' }, h('span', null, 'Soil health'), h('b', null, String(Math.round(soilHealth(s))))));
  }

  // ---- The routes panel ----

  /** Opens or closes the routes panel. */
  toggleRoutes() {
    this.routesOpen = !this.routesOpen;
    this.routesPanel.style.display = this.routesOpen ? 'block' : 'none';
    this.routesKey = '';
    if (this.routesOpen) this.renderRoutes(); else this.host.previewRoute(null);
  }

  /**
   * Every route at a glance: its name (click it to rename), its stops and the goods it moves, its trucks (add or send home),
   * goods a minute, what its trucks are doing and its problems. Pointing at a route draws it on the map; clicking opens it
   * in the editor. Made again only when the routes change, and not while you type in it.
   */
  private renderRoutes() {
    const s = this.host.state(), tool = this.host.tool();
    const editing = tool.kind === 'route' ? tool.route : null;
    const key = JSON.stringify([s.routes.map((r) => [r.id, r.name, stopsKey(r), routeGoods(s, r), trucksOn(s, r).length, stopProblems(s, r)]),
      s.trucks.filter((t) => t.route === null).length, s.buildings.some((b) => b.type === 'garage'), this.routesFilter, editing]);
    if (key !== this.routesKey && !typingIn(this.routesList)) {
      this.routesKey = key;
      // The rows are made again: the one pointed at gets its pointerenter on the next move.
      this.host.previewRoute(null);
      const lines: (() => void)[] = [];
      const f = this.routesFilter.trim().toLowerCase();
      const shown = s.routes.filter((r) => !f || [r.name, stopsText(s, r), routeGoods(s, r).map((i) => ITEMS[i].name.toLowerCase()).join(', ')].some((t) => t.toLowerCase().includes(f)));
      const rows = shown.map((r) => {
        const trucks = trucksOn(s, r);
        const name = h('input', {
          class: 'route-title', value: r.name, maxLength: ROUTE_NAME_MAX, title: 'Click to rename', spellcheck: false,
          onclick: (e: Event) => e.stopPropagation(),
          onchange: () => { const res = renameRoute(r, name.value); if (!res.ok) name.value = r.name; this.did(res); },
          onkeydown: (e: KeyboardEvent) => { if (e.key === 'Escape') name.value = r.name; if (e.key === 'Enter' || e.key === 'Escape') name.blur(); },
        });
        const warn = h('span', { class: 'route-warn' }), rate = h('span', { class: 'route-rate' }), doing = h('div', { class: 'hint route-doing' });
        lines.push(() => {
          const ps = routeProblems(s, r);
          warn.style.display = ps.length ? '' : 'none';
          set(warn, `⚠ ${ps.length}`);
          if (warn.title !== ps.join('\n')) warn.title = ps.join('\n');
          set(rate, `${routeRate(s, r).toFixed(1)}/min`);
          set(doing, trucksDoing(s, r));
        });
        const goods = routeGoods(s, r);
        return h('div', {
          class: `route-row${r.id === editing ? ' editing' : ''}`, title: 'Click to edit',
          onpointerenter: () => this.host.previewRoute(r.id), onpointerleave: () => this.host.previewRoute(null),
          onclick: () => this.edit(r),
        },
        h('div', { class: 'route-line' }, h('i', { class: 'dot', style: `background:${hex(ROUTE_COLOURS[routeColour(s, r)])}` }), name, warn,
          h('span', { class: 'head-buttons' },
            button('⧉', () => { const c = copyRoute(s, r); this.toast(`Copied ${r.name} as ${c.name}. Give it trucks.`); this.edit(c); }, { cls: 'small', title: 'Copy this route (without its trucks)' }),
            button('Edit', () => this.edit(r), { cls: 'small' }))),
        h('div', { class: 'hint route-stops' }, stopsText(s, r) || 'No stops yet'),
        h('div', { class: 'route-line' },
          h('span', { class: 'route-goods' }, ...(goods.length ? goods.map((i) => good(i)) : [h('small', { class: 'hint' }, 'moves nothing yet')])),
          h('span', { class: 'route-trucks', onclick: (e: Event) => e.stopPropagation() },
            button('−', () => this.did(setTruckRoute(s, trucks[trucks.length - 1], null)), { cls: 'small', disabled: !trucks.length, title: 'Send a truck home' }),
            h('b', { title: 'Trucks on this route' }, ` ${trucks.length} 🚚 `),
            button('+', () => this.did(this.addTruck(s, r)), { cls: 'small', title: 'Add a truck: one with no route, else a new one' })),
          rate),
        doing);
      });
      const idle = s.trucks.filter((t) => t.route === null).length;
      this.routesFilterEl.style.display = s.routes.length > 4 || f ? '' : 'none';
      this.routesHead.replaceChildren(h('b', null, `Routes (${s.routes.length})`), h('span', { class: 'head-buttons' },
        button('+ New route', () => this.edit(newRoute(s)), { cls: 'small', primary: true, title: 'Make a route, then click buildings on the map to add its stops' }),
        button('?', () => this.openGuide({ kind: 'topic', id: 'trucks' }), { cls: 'close', title: 'Trucks and routes in the guide (G)' }),
        button('✕', () => this.toggleRoutes(), { cls: 'close', title: 'Close (O or Esc)' })));
      this.routesList.replaceChildren(
        ...(idle ? [h('p', { class: 'hint warn-hint' }, `${idle} truck${idle > 1 ? 's have' : ' has'} no route: + on a route puts ${idle > 1 ? 'one' : 'it'} to work.`)] : []),
        ...(rows.length ? rows : [h('p', { class: 'hint' }, s.routes.length ? 'No route matches.'
          : s.buildings.some((b) => b.type === 'garage') ? 'No routes yet. Make one, click the buildings it stops at, and give it trucks.'
            : 'No routes yet. Build a garage (T) for trucks, then make a route. Buildings that share an edge trade goods without trucks.')]));
      this.routesUpdate = () => { for (const l of lines) l(); };
    }
    this.routesUpdate?.();
  }

  // ---- Modal screens ----

  private openModal(name: string, el: HTMLElement, blocking: boolean) {
    this.modals = this.modals.filter((m) => m.name !== name);
    this.modals.push({ name, el, blocking });
    this.drawModals();
  }
  private drawModals() {
    const top = this.modals[this.modals.length - 1];
    this.layer.replaceChildren(...(top ? [top.el] : []));
    this.layer.classList.toggle('open', !!top);
  }
  /** Closes the topmost modal or panel; false if none was open. */
  closeTop(): boolean {
    if (this.modals.length) { this.modals.pop(); this.drawModals(); return true; }
    if (this.statsOpen) { this.toggleStats(); return true; }
    if (this.routesOpen) { this.toggleRoutes(); return true; }
    return false;
  }
  private close(name: string) { this.modals = this.modals.filter((m) => m.name !== name); this.drawModals(); }

  /** Opens the guide on `page`; by default on what's in hand, selected or hovered in the build bar. G again closes it. */
  openGuide(page?: GuidePage) {
    if (!page && this.modals.some((m) => m.name === 'guide')) { this.close('guide'); return; }
    const tool = this.host.tool(), sel = this.host.selected(), b = sel !== null ? buildingById(this.host.state(), sel) : null;
    const id = this.tipFor ?? (tool.kind === 'build' ? tool.type : b?.type ?? null);
    const start: GuidePage = page ?? (id ? { kind: 'building', id } : { kind: 'topic', id: 'start' });
    this.showTip(null);
    this.openModal('guide', guidePanel(start, { build: (t) => this.host.setTool({ kind: 'build', type: t, rot: tool.kind === 'build' ? tool.rot : 1 }) }, () => this.close('guide')), true);
  }

  showIntro() {
    const s = this.host.state(), sc = s.scenario;
    this.openModal('intro', h('div', { class: 'panel' },
      h('h2', null, sc.name), h('p', null, sc.blurb),
      sc.goals.length ? h('ul', null, ...sc.goals.map((g) => h('li', null, g.kind === 'deliver' ? `Deliver ${g.n} ${ITEMS[g.item].name.toLowerCase()} to the depot` : g.kind === 'rate' ? `Reach ${g.perMin} ${ITEMS[g.item].name.toLowerCase()} per minute delivered` : `Keep soil health at ${g.min} or more`))) : null,
      sc.sandbox ? null : h('p', { class: 'sub' }, `Target time ${fmtTime(sc.par)} for gold, ${fmtTime(sc.par * 1.5)} for silver. You can pause (Space) and build while paused.`),
      sc.tags.length ? h('p', { class: 'tags' }, ...sc.tags.map((t) => h('span', null, t))) : null,
      sc.tips ? h('div', { class: 'tips' }, h('h3', null, 'First steps'), h('ol', null, ...sc.tips.map((t) => h('li', null, t)))) : null,
      sc.tips ? null : help(),
      h('div', { class: 'actions' }, button('Start', () => this.close('intro'), { primary: true }))), true);
  }

  openPause() {
    const s = this.host.state();
    this.openModal('pause', h('div', { class: 'panel' },
      h('h2', null, s.scenario.name), help(),
      h('h3', null, 'Settings'),
      h('div', { class: 'setting' }, h('span', null, 'Pixel size'),
        h('span', { class: 'choices' }, ...PIXEL_SIZES.map((n) => button(`${n}×${n}`, () => { this.host.settings.set({ pixelSize: n }); this.openPause(); }, { active: this.host.settings.get().pixelSize === n })))),
      h('p', { class: 'sub hint-line' }, 'Screen pixels for each pixel of the art. Smaller pixels show finer detail and cost more to draw.'),
      h('div', { class: 'actions' },
        button('Restart commission', () => this.confirm('Restart this commission?', 'Everything built so far is lost.', () => this.host.restart())),
        button('Level select', () => this.host.menu()),
        button('Resume', () => this.close('pause'), { primary: true }))), true);
  }

  private confirm(title: string, text: string, yes: () => void) {
    this.openModal('confirm', h('div', { class: 'panel' }, h('h2', null, title), h('p', null, text),
      h('div', { class: 'actions' }, button('Cancel', () => this.close('confirm')), button('Yes', yes, { primary: true }))), true);
  }

  showComplete(medal: Medal) {
    const s = this.host.state(), sc = s.scenario, t = s.completedAt ?? s.time;
    this.openModal('done', h('div', { class: 'panel done' },
      h('h2', null, 'Commission complete!'),
      h('div', { class: `medal ${medal}` }, MEDAL_NAME[medal]),
      h('p', null, `${sc.name}, delivered in ${fmtTime(t)} (target ${fmtTime(sc.par)}).`),
      h('p', { class: 'sub' }, medal === 'gold' ? 'Within the target time.' : medal === 'silver' ? `Gold needs ${fmtTime(sc.par)} or less.` : `Silver needs ${fmtTime(sc.par * 1.5)} or less.`),
      h('p', null, `Earned ${Math.floor(s.earned).toLocaleString()} credits · soil health ${Math.round(soilHealth(s))}.`),
      h('div', { class: 'actions' }, button('Keep playing', () => this.close('done')), button('Level select', () => this.host.menu(), { primary: true }))), true);
  }
}

function help() {
  return h('ul', { class: 'help' },
    h('li', null, 'Pick a building in the bar at the bottom, then ', h('b', null, 'click or drag'), ' to place it (a drag places a row).'),
    h('li', null, 'Trucks carry goods. Build a garage (T), buy a truck and give it a route: a loop of stops where it drops and picks up goods. Trucks drive on the open ground between buildings, so leave room. Silos (L) store goods; the depot buys whatever trucks drop there. ', h('b', null, 'O'), ' lists every route.'),
    h('li', null, 'Buildings that share an edge trade without trucks: a mill beside wheat fields takes their wheat, a coop beside the mill its bran.'),
    h('li', null, 'Machines need power, and trucks charge at their garage: build solar panels, turbines or a digester, and pylons within 3 tiles of everything. Batteries keep the night going.'),
    h('li', null, 'Fields grow faster with water (sprinklers) and rich soil; harvests drain the soil. Compost, beans and resting fix it.'),
    h('li', null, 'Markers: ', h('span', { class: 'm red' }, '◆'), ' no power ', h('span', { class: 'm orange' }, '◆'), ' blocked/low power ', h('span', { class: 'm yellow' }, '◆'), ' waiting for input ', h('span', { class: 'm blue' }, '◆'), ' dry ', h('span', { class: 'm purple' }, '◆'), ' trucks can\'t reach it, or no route takes its goods'),
    h('li', null, h('b', null, 'Click'), ' a building to inspect it · ', h('b', null, 'X'), ' remove (refunds) · ', h('b', null, 'right click / Esc'), ' cancel'),
    h('li', null, h('b', null, 'Drag'), ' (or right-drag, arrows) to pan · ', h('b', null, 'Q E'), ' turn · ', h('b', null, 'wheel / trackpad pinch / + −'), ' zoom · ', h('b', null, 'Space 1 2 3'), ' pause and speed · ', h('b', null, 'V'), ' overlays · ', h('b', null, 'O'), ' routes · ', h('b', null, 'Tab'), ' stats'),
    h('li', null, 'Not sure what something does? ', h('b', null, 'G'), ' opens the guide: every building, how to use it and its numbers.'),
  );
}
