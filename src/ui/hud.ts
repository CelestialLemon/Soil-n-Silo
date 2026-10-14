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
import { briefing } from './briefing.ts';
import { pauseScreen } from './pause.ts';
import { resultsScreen } from './results.ts';
import { ProblemsStrip } from './problems.ts';
import { RoutesCard } from './routes.ts';
import { CommissionCard, TopRight, ViewBar, viewControls, type Panel, type PlayHost } from './playhud.ts';
import { routeCss, routeGoods, routeProblems, stopsText, stopsKey, trucksDoing, truckName, typingIn } from './routing.ts';
import { uiScale, type SettingsStore } from './settings.ts';
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
  /** Starts another commission. */
  start(id: string): void;
  /** Draws a route on the map while the pointer is over it in the routes panel (null: none). */
  previewRoute(id: number | null): void;
  /** Selects a building and moves the camera to it. */
  focus(id: number): void;
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
  /** The side card for the selected building or truck. */
  private readonly side: Inspector;
  /** Silo and depot stops showing every good rather than the route's, by `route:stop`. */
  private readonly allGoods = new Set<string>();
  /** The sheets and full-screen panels, over the blurred world. */
  private readonly sheets = h('div', { class: 'ui-sheets' });
  private readonly problems: ProblemsStrip;
  private modals: Modal[] = [];
  private statsOpen = false;
  private readonly statsBody = h('div');
  private readonly stats = h('div', { class: 'card stats-panel' }, h('div', { class: 'head' }, h('b', null, 'Production (last minute)'), button('✕', () => this.toggleStats(), { cls: 'close' })), this.statsBody);
  private routesOpen = false;
  private readonly routes: RoutesCard;
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
    this.routes = new RoutesCard({
      state: () => host.state(), tool: () => host.tool(), setTool: (t) => host.setTool(t), did: (r) => this.did(r), toast: (m, ok) => this.toast(m, ok),
      openGuide: (p) => this.openGuide(p), previewRoute: (id) => host.previewRoute(id),
      selectTruck: (id) => { this.routesOpen = false; if (host.tool().kind === 'route') host.setTool({ kind: 'select' }); host.select(id); this.refresh(); },
      close: () => { this.routesOpen = false; host.previewRoute(null); if (host.tool().kind === 'route') host.setTool({ kind: 'select' }); },
    });
    this.problems = new ProblemsStrip((id) => host.focus(id));
    this.dock = new Dock({ state: () => host.state(), tool: () => host.tool(), setTool: (t) => host.setTool(t), tip: (id) => this.showTip(id) });
    this.hud.append(this.commission.el, this.commission.pill, this.top.el, this.view.el, this.controls, this.dock.el, this.side.el, this.routes.el, this.problems.el, this.problems.popover,
      h('div', { class: 'hud-above' }, this.toasts, this.tip));
    this.ui.append(this.world.el, this.hud, this.sheets);
    root.append(h('div', { class: 'hud' }, this.stats), this.ui);
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
    const routes = this.routesOpen || tool.kind === 'route';
    this.routes.update(routes);
    this.side.update(!routes);
    const side = this.side.open || routes;
    this.top.el.hidden = side; this.controls.hidden = side;
    this.problems.update(this.host.state(), this.host.settings.get().problemsStrip && !side);
    if (now - this.lastSlow < 150) return;
    this.lastSlow = now;
    this.commission.update(side);
    this.top.update();
    if (this.statsOpen) this.renderStats();
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
  refresh() { this.lastSlow = 0; this.side.refresh(); this.routes.refresh(); }

  /** A building or truck was clicked in the world: its card takes the routes card's place. */
  picked(id: number | null) { if (id !== null && this.routesOpen && this.host.tool().kind !== 'route') { this.routesOpen = false; this.host.previewRoute(null); } this.refresh(); }

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

  // ---- Side cards ----

  /** Shows a result as a message (if it has one) and redraws the side cards. */
  private did(r: Result) {
    if (r.message) this.toast(r.message, r.ok);
    this.refresh();
    this.host.changed();
  }

  /** Opens a route in the routes card. */
  private edit(r: Route) { this.host.setTool({ kind: 'route', route: r.id }); this.refresh(); }


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

  // ---- The routes card ----

  /** Opens or closes the routes card. */
  toggleRoutes() {
    this.routesOpen = !this.routesOpen;
    if (!this.routesOpen) { this.host.previewRoute(null); if (this.host.tool().kind === 'route') this.host.setTool({ kind: 'select' }); }
    this.refresh();
  }

  // ---- Modal screens ----

  private openModal(name: string, el: HTMLElement, blocking: boolean) {
    this.modals = this.modals.filter((m) => m.name !== name);
    this.modals.push({ name, el, blocking });
    this.drawModals();
  }
  private drawModals() {
    const top = this.modals[this.modals.length - 1];
    this.sheets.classList.toggle('is-open', !!top);
    this.sheets.classList.toggle('is-live', !!top && !top.blocking);
    this.sheets.replaceChildren(...(top ? [h('div', { class: 'scrim' }), h('div', { class: 'sheet-wrap' }, top.el)] : []));
  }
  /** Closes the panel or screen called `name` if it is the one on top; false if it isn't. */
  closeIf(name: string): boolean {
    if (this.modals[this.modals.length - 1]?.name !== name) return false;
    this.close(name);
    return true;
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
    this.openModal('guide', guidePanel(start, {
      state: () => this.host.state(), focus: (id) => this.host.focus(id),
      build: (t) => this.host.setTool({ kind: 'build', type: t, rot: tool.kind === 'build' ? tool.rot : 1 }),
    }, () => this.close('guide')), true);
  }

  /** The briefing, when a commission starts. */
  showIntro() {
    this.openModal('intro', briefing(this.host.state(), () => this.close('intro'), () => { this.close('intro'); this.openGuide({ kind: 'topic', id: 'start' }); }), true);
  }

  openPause() {
    this.openModal('pause', pauseScreen({
      state: () => this.host.state(), settings: this.host.settings, resume: () => this.close('pause'), menu: () => this.host.menu(), restart: () => this.host.restart(),
    }), true);
  }

  /** The results, when the commission is complete. */
  showComplete(medal: Medal) {
    this.openModal('done', resultsScreen(this.host.state(), medal, { keepPlaying: () => this.close('done'), menu: () => this.host.menu(), start: (id) => this.host.start(id) }), true);
  }
}

