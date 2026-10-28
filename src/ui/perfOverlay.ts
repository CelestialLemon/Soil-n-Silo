import { fill, h, set } from './dom.ts';
import { FrameTimes, STATS_WINDOW } from './frameStats.ts';
import type { FrameStatsMode, SettingsStore } from './settings.ts';
import { type Environment, type FrameSample, POWER_STATES, type PowerState, Telemetry } from './telemetry.ts';

// The frame rate readout, top left under the commission card (the frame rate setting). Minimal: the frame rate, counted once a
// second. Full: that, a graph of the last frames' times, and the average and the 1% and 0.1% lows over the last 30 seconds.
// Report: full, and where a frame goes (the JS time of the renderer's calls, of picking and of the rest, the draws and the
// triangles), the power state the player says they are in, and a button to copy the last 30 seconds as a JSON report. All of it
// costs nothing while the readout is off or minimal: the game asks `timing` before it reads a clock.

/** What the game tells the report about the renderer; read when the report is copied or shown. */
export interface ReportSource {
  env(): Omit<Environment, 'power'>;
  /** Draw calls and triangles three.js has counted since the last `resetCounts`. */
  counts(): { draws: number; triangles: number };
  resetCounts(on: boolean): void;
}

/** The graph's size (CSS px; one frame a pixel) and the frame time at its top (ms): taller frames are cut off and marked. */
const GRAPH_W = 240, GRAPH_H = 64, GRAPH_TOP = 50;
/** The guide lines across the graph: the frame times of 60 and 30 frames a second. */
const GUIDES = [1000 / 60, 1000 / 30];

const fps = (n: number) => (n >= 100 ? String(Math.round(n)) : n.toFixed(1));

export class PerfOverlay {
  readonly el = h('div', { class: 'hud-perf', hidden: true, 'aria-hidden': 'true' });
  private mode: FrameStatsMode = 'off';
  private readonly rate = h('b');
  private readonly frameMs = h('span');
  private readonly average = h('b');
  private readonly low1 = h('b');
  private readonly low01 = h('b');
  private readonly graph = h('canvas', { width: GRAPH_W * 2, height: GRAPH_H * 2 });
  private readonly times = new FrameTimes();
  /** The last frame's time stamp; null when the next frame's time means nothing (the first, or after the tab was hidden). */
  private prev: number | null = null;
  /** Frames since the frame rate was last shown, and when that was. */
  private counted = 0;
  private countFrom = 0;
  private colors = { bar: '', over: '', guide: '' };
  private readonly telemetry = new Telemetry();
  private source: ReportSource | null = null;
  private power: PowerState = 'unset';
  private readonly costs = h('div', { class: 'costs' });
  private readonly status = h('small', { class: 'cd-small' });
  private readonly paste = h('textarea', { class: 'paste', readonly: true, hidden: true, rows: 6, 'aria-label': 'Report' });
  /** The game frame's clock readings (ms): when it began, the last lap, and the laps of the renderer's calls and picking. */
  private t0 = 0; private lapAt = 0;
  private geometry = 0; private style = 0; private pick = 0;
  /** The last frame's interval; NaN after a reset, until two frames have been seen. */
  private lastInterval = Number.NaN;
  /** When the costs were last shown (they are worked out off the frame, so the sums do not land in a frame's time). */
  private shownAt = 0;

  constructor(settings: SettingsStore) {
    // A hidden tab draws no frames: the time away is no frame's, and the window starts again from the return.
    document.addEventListener('visibilitychange', () => { this.prev = null; this.times.clear(); this.telemetry.clear(); });
    settings.listen((st) => { if (st.frameStats !== this.mode) this.show(st.frameStats); });
  }

  /** Hands over the renderer's side of the report (once the renderer exists). */
  attach(source: ReportSource) { this.source = source; source.resetCounts(this.timing); }

  /** True while the report mode is on: the game times its frame only then. */
  get timing() { return this.mode === 'report'; }

  /** Starts timing a game frame. */
  begin() { this.t0 = this.lapAt = performance.now(); this.geometry = this.style = this.pick = 0; this.source?.resetCounts(true); }

  /** Marks where the game's own work stops and `part`'s starts: the time since the last mark is not any part's. */
  mark() { this.lapAt = performance.now(); }

  /** Adds the time since the last mark or lap to `part`. */
  lap(part: 'geometry' | 'style' | 'pick') {
    const t = performance.now();
    this[part] += t - this.lapAt; this.lapAt = t;
  }

  /** Ends the game frame: the rest is what the laps did not take. */
  end() {
    if (!this.source || this.prev === null || Number.isNaN(this.lastInterval)) return;
    const total = performance.now() - this.t0, { draws, triangles } = this.source.counts();
    const sample: FrameSample = { interval: this.lastInterval, geometry: this.geometry, style: this.style, pick: this.pick, rest: Math.max(0, total - this.geometry - this.style - this.pick), draws, triangles };
    this.telemetry.add(this.t0, sample);
    if (this.t0 - this.shownAt >= 1000) { this.shownAt = this.t0; setTimeout(() => { if (this.timing) this.showCosts(); }, 0); }
  }

  private showCosts() {
    const s = this.telemetry.summary(performance.now()), ms = (q: { p50: number } | null) => (q ? `${q.p50.toFixed(2)} ms` : '–');
    const row = (label: string, value: string) => h('div', { class: 'row' }, h('span', null, label), h('b', null, value));
    const i = s.interval;
    fill(this.costs,
      row('Frame p50 / p95 / p99', i ? `${i.p50.toFixed(1)} / ${i.p95.toFixed(1)} / ${i.p99.toFixed(1)} ms` : '–'),
      row('renderGeometry', ms(s.geometry)), row('renderStyle', ms(s.style)), row('Picking', ms(s.pick)), row('Rest of frame', ms(s.rest)),
      row('Draws / triangles', s.draws && s.triangles ? `${Math.round(s.draws.p50)} / ${Math.round(s.triangles.p50)}` : '–'));
  }

  private report() {
    if (!this.source) throw new Error('perf report before the renderer was attached');
    return JSON.stringify(this.telemetry.report(performance.now(), { ...this.source.env(), power: this.power }), null, 2);
  }

  /** Copies the report. Where the browser will not (no clipboard, or it refuses), the report is shown to select and copy by hand. */
  private async copy() {
    const text = this.report();
    try {
      await navigator.clipboard.writeText(text);
      this.paste.hidden = true; set(this.status, 'Copied the last 30 seconds.');
    } catch {
      this.paste.hidden = false; this.paste.value = text; this.paste.select();
      set(this.status, 'Could not copy by itself: select the text and copy it.');
    }
  }

  private show(mode: FrameStatsMode) {
    const wasTiming = this.timing;
    this.mode = mode;
    this.telemetry.clear();
    if (wasTiming !== this.timing) this.source?.resetCounts(this.timing);
    this.el.hidden = mode === 'off';
    // The report's button and power choices are for the player to use; the other readouts are only to look at.
    this.el.setAttribute('aria-hidden', String(mode !== 'report'));
    this.el.classList.toggle('is-full', mode === 'full' || mode === 'report');
    this.el.classList.toggle('is-report', mode === 'report');
    this.times.clear();
    this.prev = null; this.counted = 0;
    set(this.rate, '–'); set(this.frameMs, ''); for (const b of [this.average, this.low1, this.low01]) set(b, '–');
    if (mode !== 'minimal' && mode !== 'off') {
      const css = getComputedStyle(document.documentElement), v = (n: string) => css.getPropertyValue(n).trim();
      this.colors = { bar: v('--pine'), over: v('--rust'), guide: v('--chalk-3') };
    }
    const fpsLine = h('div', { class: 'rate' }, this.rate, h('small', null, 'FPS'), mode !== 'minimal' ? this.frameMs : null);
    if (mode === 'minimal') fill(this.el, h('div', { class: 'cd-pill' }, fpsLine));
    else if (mode === 'full' || mode === 'report') {
      const row = (label: string, b: HTMLElement) => h('div', { class: 'row' }, h('span', null, label), b);
      fill(this.el, h('div', { class: 'cd-card perf-card' },
        fpsLine,
        h('div', { class: 'graph' }, this.graph, h('small', { class: 'cd-small' }, 'Frame time · lines at 60 and 30 FPS')),
        h('div', { class: 'stats' }, row('Average', this.average), row('1% low', this.low1), row('0.1% low', this.low01)),
        h('small', { class: 'cd-small' }, `Over the last ${STATS_WINDOW / 1000} s`),
        mode === 'report' ? this.reportPart() : null));
    } else fill(this.el);
  }

  /** The report mode's part of the card: the costs, the power state (said by hand), and the copy button. */
  private reportPart() {
    set(this.status, ''); this.paste.hidden = true;
    const power = h('div', { class: 'cd-seg wide' }, ...POWER_STATES.filter((p) => p !== 'unset').map((p) => {
      const b = h('button', { class: this.power === p ? 'is-on' : '', onclick: () => { this.power = this.power === p ? 'unset' : p; for (const x of power.children) x.classList.toggle('is-on', x === b && this.power === p); } }, p[0].toUpperCase() + p.slice(1));
      return b;
    }));
    return h('div', { class: 'report' },
      this.costs, h('small', { class: 'cd-small' }, 'Power: say which, it is not guessed'), power,
      h('button', { class: 'cd-btn', onclick: () => { void this.copy(); } }, 'Copy 30-second report'), this.status, this.paste);
  }

  /** Counts a frame drawn at `now` (the animation frame's time stamp, ms). */
  frame(now: number) {
    if (this.mode === 'off') return;
    if (this.prev === null) { this.lastInterval = Number.NaN; this.prev = now; this.counted = 0; this.countFrom = now; return; }
    const ms = now - this.prev;
    this.prev = now; this.lastInterval = ms;
    this.counted++;
    if (this.mode === 'full' || this.mode === 'report') { this.times.add(ms); this.draw(); }
    if (now - this.countFrom < 1000) return;
    const span = now - this.countFrom;
    set(this.rate, fps(this.counted / (span / 1000)));
    set(this.frameMs, `${(span / this.counted).toFixed(1)} ms`);
    this.counted = 0; this.countFrom = now;
    if (this.mode === 'minimal') return;
    const s = this.times.summary();
    if (s) { set(this.average, fps(s.average)); set(this.low1, fps(s.low1)); set(this.low01, fps(s.low01)); }
  }

  /** The graph: a bar for each of the last frames, newest at the right, the guide lines behind. */
  private draw() {
    const g = this.graph.getContext('2d');
    if (!g) return;
    const k = 2, y = (ms: number) => GRAPH_H * k * (1 - Math.min(ms, GRAPH_TOP) / GRAPH_TOP);
    g.clearRect(0, 0, GRAPH_W * k, GRAPH_H * k);
    g.fillStyle = this.colors.guide;
    for (const ms of GUIDES) g.fillRect(0, Math.round(y(ms)) - 1, GRAPH_W * k, 2);
    const n = Math.min(GRAPH_W, this.times.length), first = this.times.length - n;
    for (let i = 0; i < n; i++) {
      const ms = this.times.at(first + i), top = y(ms), x = (GRAPH_W - n + i) * k;
      g.fillStyle = ms > GRAPH_TOP ? this.colors.over : this.colors.bar;
      g.fillRect(x, top, k, GRAPH_H * k - top);
    }
  }
}
