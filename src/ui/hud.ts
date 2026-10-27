import { choicesOf, messageOf, type Action, type Earthwork, type Setting } from '../game/build.ts';
import type { BuildingId } from '../game/data.ts';
import type { Medal } from '../game/sim/stats.ts';
import { buildingById, type Dir, type GameState, type Route } from '../game/state.ts';
import type { Overlay } from '../world/view.ts';
import { h, icon, setVar } from './dom.ts';
import { Dock, dockTip } from './dock.ts';
import { briefing } from './briefing.ts';
import { guidePanel, type GuidePage } from './guide.ts';
import { Inspector } from './inspector.ts';
import { ledgerSheet } from './ledger.ts';
import { pauseScreen } from './pause.ts';
import { settingsPanel } from './settingsPanel.ts';
import { forecastSheet } from './forecastPanel.ts';
import { weatherSheet } from './weatherPanel.ts';
import { clearWeather, eventName, startEvent } from '../game/events.ts';
import { hasStation, renewNow } from '../game/station.ts';
import { CommissionCard, TopRight, ViewBar, viewControls, type Panel, type PlayHost } from './playhud.ts';
import { powerSheet } from './powerpanel.ts';
import { ProblemsStrip } from './problems.ts';
import { resultsScreen } from './results.ts';
import { PerfOverlay } from './perfOverlay.ts';
import { RoutesCard } from './routes.ts';
import { uiScale, type SettingsStore } from './settings.ts';
import { WorldLayer } from './world.ts';

// The HUD over the canvas, on the Clearday system (clearday/, game.css): the commission card, the readouts and the dial, the
// panel buttons, the view bar, the dock and its messages, the labels and markers tied to the world, a side card (the
// inspector or the routes), and the sheets over the blurred world (briefing, pause, ledger, power, guide, results). It is
// scaled as a whole by the interface size. The game state belongs to main.ts; the HUD changes it only through the rules in
// src/game/.

export type Tool =
  | { kind: 'select' }
  /** `crop` and `recipe` are what a field or machine in hand will be placed with (see `Setting`). */
  | ({ kind: 'build'; type: BuildingId; rot: Dir } & Setting)
  | { kind: 'remove' }
  /** Earthworks: raise or lower the points of the ground clicked, or level the tiles between them. */
  | { kind: 'earth'; how: Earthwork }
  /** Editing a route: clicking a building adds it as a stop. */
  | { kind: 'route'; route: number };

export interface HudHost {
  state(): GameState;
  tool(): Tool;
  setTool(t: Tool): void;
  /** Changes what the field or machine in hand is placed with, and remembers it for the level. */
  choose(set: Setting): void;
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
  /** Unpauses the game. */
  resume(): void;
  /** Starts another commission. */
  start(id: string): void;
  /** Draws a route on the map while the pointer is over it in the routes panel (null: none). */
  previewRoute(id: number | null): void;
  /** Selects a building and moves the camera to it. */
  focus(id: number): void;
}

/** A screen or panel over the world: `blocking` ones pause the game; `update` redraws a live one a few times a second. */
interface Modal { name: string; el: HTMLElement; blocking: boolean; update?: () => void; onClose?: () => void }

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
  private readonly above = h('div', { class: 'hud-above' }, this.toasts, this.tip);
  private tipFor: BuildingId | null = null;
  private zoom = 1;
  /** The side card for the selected building or truck. */
  private readonly side: Inspector;
  /** The sheets and full-screen panels, over the blurred world. */
  private readonly sheets = h('div', { class: 'ui-sheets' });
  private readonly problems: ProblemsStrip;
  /** The frame rate readout; the loop tells it of each frame. */
  readonly perf: PerfOverlay;
  private modals: Modal[] = [];
  private routesOpen = false;
  /** The routes card shows when opened with O or while a route is being edited (from an inspector). */
  private get routesShown() { return this.routesOpen || this.host.tool().kind === 'route'; }
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
      did: (r) => this.did(r), openGuide: (p) => this.openGuide(p), editRoute: (r) => this.edit(r), openForecast: () => this.openForecast(),
    });
    this.routes = new RoutesCard({
      state: () => host.state(), tool: () => host.tool(), setTool: (t) => host.setTool(t), did: (r) => this.did(r), toast: (m, ok) => this.toast(m, ok),
      openGuide: (p) => this.openGuide(p), previewRoute: (id) => host.previewRoute(id),
      selectTruck: (id) => { this.routesOpen = false; if (host.tool().kind === 'route') host.setTool({ kind: 'select' }); host.select(id); this.refresh(); },
      close: () => { this.routesOpen = false; host.previewRoute(null); if (host.tool().kind === 'route') host.setTool({ kind: 'select' }); },
    });
    this.problems = new ProblemsStrip((id) => host.focus(id));
    this.dock = new Dock({ state: () => host.state(), tool: () => host.tool(), setTool: (t) => host.setTool(t), choose: (c) => host.choose(c), tip: (id) => this.showTip(id) });
    this.perf = new PerfOverlay(host.settings);
    this.hud.append(this.perf.el, this.commission.el, this.commission.pill, this.top.el, this.view.el, this.view.legend, this.controls, this.dock.el, this.side.el, this.routes.el, this.problems.el, this.problems.popover,
      this.above);
    this.ui.append(this.world.el, this.hud, this.sheets);
    root.append(this.ui);
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
    this.dock.showCategoryOf(tool.kind === 'build' ? tool.type : null);
    this.dock.update();
    // The dock's strip of choices takes the room the card of what is pointed at would have.
    this.above.classList.toggle('has-strip', tool.kind === 'build' && choicesOf(tool.type).length > 0);
    const routes = this.routesShown;
    this.routes.update(routes);
    this.side.update(!routes);
    const side = this.side.open || routes;
    this.top.el.hidden = side; this.controls.hidden = side;
    this.problems.update(this.host.state(), this.host.settings.get().problemsStrip && !side);
    if (now - this.lastSlow < 150) return;
    this.lastSlow = now;
    this.commission.update(side);
    // The frame rate readout sits under the commission card, whichever size it is.
    if (!this.perf.el.hidden) { const c = side ? this.commission.pill : this.commission.el; setVar(this.perf.el, '--perf-top', `${c.offsetTop + c.offsetHeight + 12}px`); }
    this.top.update();
    this.modals[this.modals.length - 1]?.update?.();
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
    while (this.toasts.children.length > 4) this.toasts.firstElementChild?.remove();
    setTimeout(() => t.classList.add('is-gone'), 2200);
    setTimeout(() => t.remove(), 2800);
  }

  /** Redraw what depends on the tool and selection right away. */
  refresh() { this.lastSlow = 0; this.side.refresh(); this.routes.refresh(); }

  /** A building or truck was clicked in the world: its card takes the routes card's place. */
  picked(id: number | null) { if (id !== null && this.routesOpen && this.host.tool().kind !== 'route') { this.routesOpen = false; this.host.previewRoute(null); } this.refresh(); }

  /** Whether a panel is open. */
  panelOpen(p: Panel) {
    if (p === 'ledger' || p === 'power' || p === 'forecast') return this.modals.some((m) => m.name === p);
    if (p === 'routes') return this.routesShown;
    if (p === 'guide' || p === 'weather') return this.modals.some((m) => m.name === p);
    return false;
  }
  togglePanel(p: Panel) {
    if (p === 'ledger' || p === 'power') this.toggleSheet(p);
    else if (p === 'forecast') this.toggleForecast();
    else if (p === 'routes') this.toggleRoutes();
    else if (p === 'guide') this.openGuide();
    else if (p === 'weather') this.toggleWeather();
  }

  // ---- Side cards ----

  /** Shows a result as a message (if it has one) and redraws the side cards. */
  private did(r: Action) {
    const message = messageOf(r);
    if (message) this.toast(message, r.ok);
    this.refresh();
    this.host.changed();
  }

  /** Opens a route in the routes card. */
  private edit(r: Route) { this.host.setTool({ kind: 'route', route: r.id }); this.refresh(); }


  // ---- The ledger and the power panel ----

  /** Opens the ledger or the power panel (closing the other), or closes it. The game runs on behind them. */
  toggleSheet(p: 'ledger' | 'power') {
    if (this.modals.some((m) => m.name === p)) { this.close(p); return; }
    this.modals = this.modals.filter((m) => m.name !== 'ledger' && m.name !== 'power' && m.name !== 'forecast');
    const sheet = p === 'ledger'
      ? ledgerSheet({ state: () => this.host.state(), openPower: () => this.toggleSheet('power'), close: () => this.close('ledger') })
      : powerSheet({ state: () => this.host.state(), close: () => this.close('power') });
    this.openModal(p, sheet.el, false, sheet.update);
  }

  // ---- The forecast ----

  /** Opens the forecast panel (closing the Ledger and Power sheets), or closes it. Without a weather station there is none to open. */
  toggleForecast() {
    if (this.modals.some((m) => m.name === 'forecast')) { this.close('forecast'); return; }
    if (!hasStation(this.host.state())) { this.toast('The valley has no weather station', false, 'wind'); return; }
    this.modals = this.modals.filter((m) => m.name !== 'ledger' && m.name !== 'power');
    const sheet = forecastSheet({
      state: () => this.host.state(), openGuide: () => this.openGuide({ kind: 'topic', id: 'weather' }), close: () => this.close('forecast'),
    });
    this.openModal('forecast', sheet.el, false, sheet.update);
  }

  /** Opens the forecast panel from the station's inspector (it stays open if it already is). */
  openForecast() { if (!this.modals.some((m) => m.name === 'forecast')) this.toggleForecast(); }

  // ---- The sandbox's weather ----

  /** Opens the sandbox's weather control, or closes it. Choosing an event closes it, to show the sky. */
  toggleWeather() {
    if (this.modals.some((m) => m.name === 'weather')) { this.close('weather'); return; }
    const s = () => this.host.state(), done = () => { this.close('weather'); this.host.changed(); };
    const sheet = weatherSheet({
      state: s,
      start: (kind, strength) => { const r = startEvent(s(), kind, strength); this.toast(r.ok ? `${eventName(kind, strength)} begins` : r.error, r.ok, 'wind'); if (r.ok) { renewNow(s()); done(); } },
      clear: () => { const r = clearWeather(s()); this.toast(r.ok ? 'The weather clears' : r.error, r.ok, 'sun'); if (r.ok) { renewNow(s()); done(); } },
      close: () => this.close('weather'),
    });
    this.openModal('weather', sheet.el, false, sheet.update);
  }

  // ---- The routes card ----

  /** Opens or closes the routes card. */
  toggleRoutes() {
    this.routesOpen = !this.routesShown;
    if (!this.routesOpen) { this.host.previewRoute(null); if (this.host.tool().kind === 'route') this.host.setTool({ kind: 'select' }); }
    this.refresh();
  }

  // ---- Modal screens ----

  private openModal(name: string, el: HTMLElement, blocking: boolean, update?: () => void, onClose?: () => void) {
    this.modals = this.modals.filter((m) => m.name !== name);
    this.modals.push({ name, el, blocking, update, onClose });
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
    const top = this.modals.pop();
    if (top) { top.onClose?.(); this.drawModals(); return true; }
    if (this.routesShown) { this.toggleRoutes(); return true; }
    return false;
  }
  private close(name: string) {
    const gone = this.modals.filter((m) => m.name === name);
    this.modals = this.modals.filter((m) => m.name !== name);
    for (const m of gone) m.onClose?.();
    this.drawModals();
  }

  /** Opens the guide on `page`; by default on what's in hand, selected or pointed at in the dock. G again closes it. */
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

  private pauseEl() {
    return pauseScreen({
      state: () => this.host.state(), settings: this.host.settings, resume: () => { this.close('pause'); this.host.resume(); }, menu: () => this.host.menu(), restart: () => this.host.restart(),
      openSettings: () => this.openSettings(),
    });
  }
  openPause() { this.openModal('pause', this.pauseEl(), true); }

  /** The settings, over the pause screen (which is drawn again after, for the keys it lists). */
  private openSettings() {
    this.openModal('settings', settingsPanel(this.host.settings, () => this.close('settings')), true, undefined, () => {
      const pause = this.modals.find((m) => m.name === 'pause');
      if (pause) pause.el = this.pauseEl();
    });
  }

  /** The results, when the commission is complete. */
  showComplete(medal: Medal) {
    this.openModal('done', resultsScreen(this.host.state(), medal, { keepPlaying: () => this.close('done'), menu: () => this.host.menu(), start: (id) => this.host.start(id) }), true);
  }
}

