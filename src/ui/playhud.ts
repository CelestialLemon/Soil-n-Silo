import { flowRate, creditsPerMin, RECENT_WINDOW } from '../game/flows.ts';
import { networks, usedBy } from '../game/power.ts';
import { CAMPAIGN, SILVER_PAR, type Goal } from '../game/scenarios.ts';
import { dayAt, hourAt, sunAt, windAt } from '../game/sim/clock.ts';
import { medalFor } from '../game/sim/stats.ts';
import { seasonName } from '../game/seasons.ts';
import { weatherNow } from '../game/sim/weather.ts';
import { warmthOf } from '../game/warmth.ts';
import type { GameState } from '../game/state.ts';
import { must } from '../game/result.ts';
import type { Overlay } from '../world/view.ts';
import { fill, h, icon, set, setVar } from './dom.ts';
import { clock, num, pct, playTime, watts } from './format.ts';
import type { ActionId } from '../keybindings.ts';
import { keyNames, tip, titledBy } from './keyhints.ts';
import type { Settings } from './settings.ts';
import { gauge, goalIcon, goalNow, goalOrder } from './widgets.ts';

// The play HUD's fixed pieces: the commission strip (top left; a pill while a side card is open), the readouts, the dial and
// the panel buttons (top right), the view bar (bottom left) and the view controls (bottom right). Keys are in tooltips only.

export type Panel = 'ledger' | 'routes' | 'power' | 'guide';

export interface PlayHost {
  state(): GameState;
  settings(): Settings;
  /** 0 when paused. */
  speed(): number;
  setSpeed(n: number): void;
  overlay(): Overlay;
  setOverlay(o: Overlay): void;
  turn(d: 1 | -1): void;
  zoom(d: 1 | -1): void;
  openPause(): void;
  panelOpen(p: Panel): boolean;
  togglePanel(p: Panel): void;
}

/** The commission's name with its number in the campaign: "Commission 2", or what kind it is. */
export function commissionLabel(s: GameState) {
  const sc = s.scenario, i = CAMPAIGN.findIndex((c) => c.id === sc.id);
  return sc.sandbox ? 'Sandbox' : i >= 0 ? `Commission ${i + 1}` : 'Random commission';
}

/** The medal a run ends with at time t, as a dot and a word: "● gold". */
function medalDot(par: number, t: number) {
  const m = medalFor(par, t);
  return [h('i', { class: 'dot', style: `background: var(--medal-${m})` }), m];
}

/**
 * Where the commission's clock stands, with the best medal still to be had: "13:00 · ● gold by 35:00", "done in 31:48 · ● gold",
 * or the time played in the sandbox.
 */
export function clockLine(s: GameState) {
  const sc = s.scenario, b = (t: number) => h('b', { class: 'cd-num' }, playTime(t));
  if (sc.sandbox) return [b(s.time), ' played'];
  if (s.completedAt !== null) return ['done in ', b(s.completedAt), ' · ', ...medalDot(sc.par, s.completedAt)];
  const m = medalFor(sc.par, s.time);
  return [b(s.time), ' · ', ...medalDot(sc.par, s.time), m === 'gold' ? ` by ${playTime(sc.par)}` : m === 'silver' ? ` by ${playTime(sc.par * SILVER_PAR)}` : ''];
}

/** What a goal asks, after its count: "/150", "/5 a min", "/40+". */
function goalOf(g: Goal) {
  return g.kind === 'deliver' ? `/${g.n}` : g.kind === 'rate' ? `/${g.perMin} a min` : `/${g.min}+`;
}

/**
 * When the commission would be done at the pace of the last five minutes (null: some goal isn't moving, is a rate or an unmet soil goal, or can't be told):
 * for "Show pace" only.
 */
export function doneBy(s: GameState): number | null {
  if (s.completedAt !== null) return s.completedAt;
  let last = s.time;
  for (const [i, g] of s.scenario.goals.entries()) {
    const now = goalNow(s, i);
    if (now.done) continue;
    if (g.kind === 'rate' || g.kind === 'soil') return null;
    const rate = flowRate(s, 'delivered', g.item, RECENT_WINDOW);
    if (rate <= 0) return null;
    last = Math.max(last, s.time + (g.n - (s.delivered[g.item] ?? 0)) / rate * 60);
  }
  return last;
}

export class CommissionCard {
  readonly el = h('div', { class: 'cd-card hud-commission' });
  readonly pill = h('div', { class: 'cd-pill hud-compact', hidden: true });
  private key = '';
  private parts: { el: HTMLElement; g: HTMLElement; ic: HTMLElement; fig: HTMLElement; of: HTMLElement }[] = [];
  private readonly clock = h('span', { class: 'clock' });
  private readonly pace = h('span', { class: 'pace' });
  private readonly pillGauge = gauge({ v: 0, inner: [] });
  private readonly pillText = h('small');
  private readonly host: PlayHost;

  constructor(host: PlayHost) {
    this.host = host;
    this.pill.append(this.pillGauge, h('span', { class: 'name' }), this.pillText);
  }

  update(compact: boolean) {
    const s = this.host.state(), sc = s.scenario, st = this.host.settings();
    this.el.hidden = compact; this.pill.hidden = !compact;
    // A strip: the name and the clock, then a small gauge and the count for each goal. The goals are made again when the
    // commission or the pace setting changes.
    const key = `${sc.id} ${st.showPace}`;
    if (key !== this.key) {
      this.key = key;
      this.parts = sc.goals.map((g) => {
        const fig = h('b', { class: 'cd-num' }), of = h('small'), ic = h('span');
        const gg = gauge({ v: 0, col: g.kind === 'soil' ? 'var(--tide)' : undefined, inner: [ic] });
        return { el: h('div', { class: 'goal', title: goalOrder(g) }, gg, h('span', { class: 'fig' }, fig, of)), g: gg, ic, fig, of };
      });
      fill(this.el,
        h('div', { class: 'who', title: commissionLabel(s) }, h('b', { class: 'name' }, sc.name), this.clock, st.showPace && !sc.sandbox ? this.pace : null),
        h('span', { class: 'sep' }),
        sc.goals.length ? h('div', { class: 'goals' }, ...this.parts.map((p) => p.el)) : h('span', { class: 'cd-small' }, 'No goals: build whatever you like.'));
      must(this.pill.querySelector('.name'), '.name').textContent = sc.name;
    }
    this.clock.replaceChildren(...clockLine(s));
    this.parts.forEach((p, i) => {
      const now = goalNow(s, i), g = sc.goals[i];
      setVar(p.g, '--v', Math.max(0, Math.min(1, now.v)));
      p.el.classList.toggle('is-done', now.done);
      p.g.classList.toggle('is-done', now.done);
      // A met goal says so in shape and word as well as colour: a tick, and "done" for a rate goal, whose rate now may have
      // dropped since it was reached. Soil is judged at the end, so it keeps its figure.
      const met = now.done && g.kind !== 'soil', ic = met ? 'check' : goalIcon(g);
      if (p.ic.dataset.icon !== ic) { p.ic.dataset.icon = ic; p.ic.replaceChildren(icon(ic, 20)); }
      set(p.fig, met && g.kind === 'rate' ? 'done' : now.figure);
      set(p.of, met && g.kind === 'rate' ? ` · ${g.perMin} a min` : goalOf(g));
      // A rate goal is judged on the rate now, not on a total, so it has no pace to keep.
      if (st.showPace && g.kind === 'deliver' && !now.done && s.completedAt === null) {
        // Gold pace: the share of the goal that, delivered at a steady rate, finishes on time; silver the same for 1.5×.
        let ticks = p.g.querySelectorAll<HTMLElement>('.cd-gauge__tick');
        if (!ticks.length) { p.g.prepend(h('span', { class: 'cd-gauge__tick' }), h('span', { class: 'cd-gauge__tick is-silver' })); ticks = p.g.querySelectorAll('.cd-gauge__tick'); }
        setVar(ticks[0], '--at', Math.min(1, s.time / sc.par));
        setVar(ticks[1], '--at', Math.min(1, s.time / (sc.par * SILVER_PAR)));
      } else p.g.querySelectorAll('.cd-gauge__tick').forEach((t) => t.remove());
    });
    if (st.showPace && !sc.sandbox) {
      const by = doneBy(s);
      this.pace.hidden = s.completedAt !== null;
      set(this.pace, by === null ? 'not done at this pace yet' : `done by ${playTime(by)} at this pace`);
      this.pace.title = `At the pace of the last ${RECENT_WINDOW / 60} minutes`;
    }
    // The pill: the first goal, the name, where it stands.
    const first = sc.goals.length ? goalNow(s, 0) : null;
    setVar(this.pillGauge, '--v', first ? Math.min(1, first.v) : 0);
    set(this.pillText, `${first ? `${first.short} · ` : ''}${sc.sandbox ? `${playTime(s.time)} played` : s.completedAt !== null ? `done in ${playTime(s.completedAt)}` : `${playTime(s.time)} of ${playTime(sc.par)}`}`);
  }
}

/** The day as a sky: night, dawn, day and dusk round a clock face (midnight at the bottom), for the commission's hours. */
function skyFor(sunrise: number, sunset: number) {
  const p = (hour: number) => `${(hour / 24 * 100).toFixed(2)}%`;
  return `conic-gradient(from 180deg, #2e3d52 0 ${p(sunrise - 0.5)}, #c4a36b ${p(sunrise - 0.5)} ${p(sunrise + 0.7)}, #eadfb8 ${p(sunrise + 2.4)} ${p(sunset - 2.4)}, #c4a36b ${p(sunset - 0.7)} ${p(sunset + 0.5)}, #2e3d52 ${p(sunset + 0.5)})`;
}

const SKY_NAMES = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow' } as const;

export class TopRight {
  readonly el = h('div', { class: 'hud-top' });
  private readonly credits = { el: h('span', { class: 'cd-pill', title: 'Credits, and what deliveries earned over the last minute' }), v: h('span'), sub: h('small') };
  private readonly power = { el: h('button', { class: 'cd-pill is-link', title: 'Power made now, and used (W)' }), v: h('span'), sub: h('small') };
  private readonly stored = { el: h('button', { class: 'cd-pill is-link', title: 'Charge stored in every battery' }), v: h('span'), sub: h('small') };
  private readonly sun = h('span'); private readonly wind = h('span');
  private readonly season = h('span'); private readonly weather = h('span'); private readonly warmth = h('span'); private readonly next = h('span', { class: 'cd-chip', style: 'padding-left: 12px' });
  private readonly speeds: HTMLButtonElement[] = [];
  private readonly dial = h('div', { class: 'cd-dial' });
  private readonly time = h('div', { class: 'cd-figure cd-num' });
  private readonly day = h('div', { class: 'cd-label' });
  private readonly panels = new Map<Panel, HTMLButtonElement>();
  private readonly host: PlayHost;

  constructor(host: PlayHost) {
    this.host = host;
    const w = host.state().scenario.climate.sun;
    this.credits.el.append(icon('coin'), this.credits.v, this.credits.sub);
    this.power.el.append(icon('bolt'), this.power.v, this.power.sub);
    this.stored.el.append(icon('battery'), this.stored.v, this.stored.sub);
    this.power.el.addEventListener('click', () => host.togglePanel('power'));
    this.stored.el.addEventListener('click', () => host.togglePanel('power'));
    const sky = h('div', { class: 'cd-dial__sky' });
    sky.style.background = skyFor(w.rise, w.set);
    this.dial.append(sky, h('div', { class: 'cd-dial__sun' }), h('div', { class: 'cd-dial__face' }, h('div', null, this.time, this.day)));
    const seg = h('div', { class: 'cd-seg' }, ...([[0, icon('pause'), 'Pause', 'pause'], [1, '1×', 'Normal speed', 'speed1'], [2, '2×', 'Double speed', 'speed2'], [4, '4×', 'Fast', 'speed3']] as const).map(([n, label, title, action]) => {
      const b = titledBy(h('button', { 'aria-label': title, onclick: () => host.setSpeed(n) }, label), () => tip(title, ...keyNames(action)));
      this.speeds.push(b);
      return b;
    }));
    const panelBtn = (p: Panel, name: string, ic: string, action: ActionId) => {
      const b = titledBy(h('button', { class: 'cd-panelbtn', onclick: () => host.togglePanel(p) }, icon(ic), name), () => tip(name, ...keyNames(action)));
      this.panels.set(p, b);
      return b;
    };
    this.el.append(
      h('div', { class: 'row' }, this.credits.el, this.power.el, this.stored.el),
      h('div', { class: 'clock' },
        h('div', null,
          h('div', { class: 'chips cd-small' },
            h('span', { class: 'cd-chip', title: 'The season, and what it is like' }, this.season),
            h('span', { class: 'cd-chip', title: 'The weather now' }, this.weather),
            h('span', { class: 'cd-chip', title: 'The warmth now, in degrees Celsius' }, this.warmth)),
          h('div', { class: 'chips cd-small' },
          h('span', { class: 'cd-chip', title: 'The sun\'s strength now' }, icon('sun'), this.sun),
          h('span', { class: 'cd-chip', title: 'The wind\'s strength now' }, icon('wind'), this.wind), this.next), seg),
        this.dial),
      h('div', { class: 'panels' }, panelBtn('ledger', 'Ledger', 'chart', 'ledger'), panelBtn('routes', 'Routes', 'route', 'routes'), panelBtn('power', 'Power', 'bolt', 'power'), panelBtn('guide', 'Guide', 'book', 'guide')));
  }

  /** The speed and panel buttons, every frame. */
  updateButtons() {
    const speed = this.host.speed();
    this.speeds.forEach((b, i) => b.classList.toggle('is-on', [0, 1, 2, 4][i] === speed));
    for (const [p, b] of this.panels) b.classList.toggle('is-on', this.host.panelOpen(p));
  }

  /** The readouts and the dial, a few times a second. */
  update() {
    const s = this.host.state(), sc = s.scenario, w = sc.climate.sun;
    set(this.credits.v, sc.sandbox ? '∞' : num(Math.floor(s.credits)));
    const cpm = creditsPerMin(s);
    set(this.credits.sub, sc.sandbox ? 'credits' : cpm > 0 ? `+${num(cpm)} / min` : 'credits');
    const nets = networks(s).list;
    const made = nets.reduce((n, x) => n + x.made, 0), used = nets.reduce((n, x) => n + usedBy(x), 0);
    const stored = nets.reduce((n, x) => n + x.stored, 0), cap = nets.reduce((n, x) => n + x.capacity, 0);
    const worst = nets.reduce((m, x) => (x.wanted > 0 ? Math.min(m, x.share) : m), 1);
    set(this.power.v, nets.length ? watts(made) : 'No pylons');
    set(this.power.sub, !nets.length ? '' : worst < 1 ? `short · ${pct(worst)}` : `${watts(used).replace(' W', '')} used`);
    this.power.sub.classList.toggle('is-bad', worst < 1);
    set(this.stored.v, cap ? pct(stored / cap) : '–');
    set(this.stored.sub, cap ? 'stored' : 'no batteries');
    set(this.sun, pct(sunAt(sc, s.time)));
    set(this.wind, pct(windAt(sc, s.time)));
    set(this.season, seasonName(sc.climate));
    set(this.weather, SKY_NAMES[weatherNow(s).sky]);
    set(this.warmth, `${Math.round(warmthOf(s))}°C`);
    const hour = hourAt(s.time), day = hour > w.rise && hour < w.set;
    set(this.next, day ? `dusk ${clock(w.set)}` : `dawn ${clock(w.rise)}`);
    setVar(this.dial, '--t', (hour / 24).toFixed(4));
    set(this.time, clock(hour));
    set(this.day, `day ${dayAt(s.time)}`);
  }
}

const VIEWS: [Overlay, string, string | null][] = [['none', 'Off', null], ['fertility', 'Soil', 'soil'], ['height', 'Height', 'earth'], ['water', 'Water', 'water'], ['power', 'Power', 'bolt'], ['roads', 'Roads', 'road'], ['bees', 'Bees', 'bee']];

export class ViewBar {
  readonly el = h('div', { class: 'cd-viewbar hud-view' });
  private readonly buttons = new Map<Overlay, HTMLButtonElement>();
  private readonly host: PlayHost;

  constructor(host: PlayHost) {
    this.host = host;
    for (const [o, name, ic] of VIEWS) {
      const b = titledBy(h('button', { class: ic ? '' : 'is-off', onclick: () => host.setOverlay(o) }, ic ? icon(ic) : null, h('span', null, name)), () => {
        const keys = keyNames('overlay');
        return `${o === 'none' ? 'No overlay' : `Show ${name.toLowerCase()}`}${keys.length ? ` (${keys.join(' or ')} cycles)` : ''}`;
      });
      this.buttons.set(o, b);
      this.el.append(b);
    }
  }

  update() { const o = this.host.overlay(); for (const [k, b] of this.buttons) b.classList.toggle('is-on', k === o); }
}

/** Turning the view, zooming and the menu: every key works too. */
export function viewControls(host: PlayHost) {
  return h('div', { class: 'cd-viewbar hud-controls' },
    titledBy(h('button', { 'aria-label': 'Turn the view left', onclick: () => host.turn(-1) }, icon('rotate', undefined, 'flip')), () => tip('Turn the view', ...keyNames('turnLeft'))),
    titledBy(h('button', { 'aria-label': 'Turn the view right', onclick: () => host.turn(1) }, icon('rotate')), () => tip('Turn the view', ...keyNames('turnRight'))),
    titledBy(h('button', { 'aria-label': 'Zoom out', onclick: () => host.zoom(-1) }, '−'), () => tip('Zoom out', 'wheel', ...keyNames('zoomOut'))),
    titledBy(h('button', { 'aria-label': 'Zoom in', onclick: () => host.zoom(1) }, '+'), () => tip('Zoom in', 'wheel', ...keyNames('zoomIn'))),
    h('button', { title: 'Menu (Esc)', 'aria-label': 'Menu', onclick: () => host.openPause() }, icon('menu')));
}

