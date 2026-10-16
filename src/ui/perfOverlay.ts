import { fill, h, set } from './dom.ts';
import { FrameTimes, STATS_WINDOW } from './frameStats.ts';
import type { FrameStatsMode, SettingsStore } from './settings.ts';

// The frame rate readout, top left under the commission card (the frame rate setting). Minimal: the frame rate, counted once a
// second. Full: that, a graph of the last frames' times, and the average and the 1% and 0.1% lows over the last 30 seconds.

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

  constructor(settings: SettingsStore) {
    // A hidden tab draws no frames: the time away is no frame's, and the window starts again from the return.
    document.addEventListener('visibilitychange', () => { this.prev = null; this.times.clear(); });
    settings.listen((st) => { if (st.frameStats !== this.mode) this.show(st.frameStats); });
  }

  private show(mode: FrameStatsMode) {
    this.mode = mode;
    this.el.hidden = mode === 'off';
    this.el.classList.toggle('is-full', mode === 'full');
    this.times.clear();
    this.prev = null; this.counted = 0;
    set(this.rate, '–'); set(this.frameMs, ''); for (const b of [this.average, this.low1, this.low01]) set(b, '–');
    if (mode === 'full') {
      const css = getComputedStyle(document.documentElement), v = (n: string) => css.getPropertyValue(n).trim();
      this.colors = { bar: v('--pine'), over: v('--rust'), guide: v('--chalk-3') };
    }
    const fpsLine = h('div', { class: 'rate' }, this.rate, h('small', null, 'FPS'), mode === 'full' ? this.frameMs : null);
    if (mode === 'minimal') fill(this.el, h('div', { class: 'cd-pill' }, fpsLine));
    else if (mode === 'full') {
      const row = (label: string, b: HTMLElement) => h('div', { class: 'row' }, h('span', null, label), b);
      fill(this.el, h('div', { class: 'cd-card perf-card' },
        fpsLine,
        h('div', { class: 'graph' }, this.graph, h('small', { class: 'cd-small' }, 'Frame time · lines at 60 and 30 FPS')),
        h('div', { class: 'stats' }, row('Average', this.average), row('1% low', this.low1), row('0.1% low', this.low01)),
        h('small', { class: 'cd-small' }, `Over the last ${STATS_WINDOW / 1000} s`)));
    } else fill(this.el);
  }

  /** Counts a frame drawn at `now` (the animation frame's time stamp, ms). */
  frame(now: number) {
    if (this.mode === 'off') return;
    if (this.prev === null) { this.prev = now; this.counted = 0; this.countFrom = now; return; }
    const ms = now - this.prev;
    this.prev = now;
    this.counted++;
    if (this.mode === 'full') { this.times.add(ms); this.draw(); }
    if (now - this.countFrom < 1000) return;
    const span = now - this.countFrom;
    set(this.rate, fps(this.counted / (span / 1000)));
    set(this.frameMs, `${(span / this.counted).toFixed(1)} ms`);
    this.counted = 0; this.countFrom = now;
    if (this.mode !== 'full') return;
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
