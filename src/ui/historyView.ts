import { ITEMS, POWER, type ItemId } from '../game/data.ts';
import { historyOf, summarize, type Span, type Summary } from '../game/history.ts';
import { recipeOf } from '../game/sim.ts';
import type { Building, GameState, Status } from '../game/state.ts';
import { h } from './dom.ts';

// The inspector's history of a building over the last 1, 5 or 10 minutes: a strip of what it was doing (its statuses, in
// the order they came), how much of the time it spent on each, and the goods it made a minute. Generators and batteries
// show their watts or charge over time instead: their status says little that the numbers don't.

export const HISTORY_WINDOWS = [60, 300, 600] as const;
export type HistoryWindow = (typeof HISTORY_WINDOWS)[number];

const fmtAgo = (t: number) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
const pct = (k: number) => `${Math.round(k * 100)}%`;
const perMin = (n: number) => `${n >= 10 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, '')}/min`;

/** What the building was doing, in a few words, for the breakdown and the pointer readout. */
export function statusLabel(b: Building, status: Status, need?: string, share?: number): string {
  switch (status) {
    case 'ok':
      return b.type === 'field' ? 'Growing' : b.type === 'hive' ? 'Making honey' : b.type === 'garage' ? 'Charging trucks' : b.type === 'sprinkler' ? 'Watering' : 'Working';
    case 'idle': return b.type === 'garage' ? 'No truck charging' : 'Idle';
    case 'input': return `Waiting for ${need ?? 'goods'}`;
    case 'blocked': return `Full of ${need ?? 'goods'}: nowhere to go`;
    case 'noroute': return `Full of ${need ?? 'goods'}: no route takes it`;
    case 'noroad': return 'No road: trucks can\'t reach it';
    case 'power': return 'No power';
    case 'lowpower': return `Low power${share !== undefined ? ` (got ${pct(share)})` : ''}`;
    case 'nolink': return 'Not connected to a pylon';
    case 'flowers': return 'No flowering fields near';
    case 'dry': return 'Dry: growing slowly';
  }
}

/** Generators and batteries chart a reading; everything else with a history shows its statuses. */
type Reading = { max: number; fmt: (v: number) => string; what: string };
function readingOf(b: Building): Reading | null {
  const w = (v: number) => `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')} W`;
  if (b.type === 'solar') return { max: POWER.solar, fmt: w, what: 'Power made' };
  if (b.type === 'turbine') return { max: POWER.turbine, fmt: w, what: 'Power made' };
  if (b.type === 'battery') return { max: POWER.battery.capacity, fmt: (v) => `${Math.round(v)} J`, what: 'Charge' };
  return null;
}

/** The goods a building makes, main one first, and what it makes a minute at full speed (null: no fixed pace). */
function makesOf(b: Building): { items: ItemId[]; full: Partial<Record<ItemId, number>> | null } {
  const r = recipeOf(b);
  if (r) return { items: r.outputs.map((o) => o.item), full: Object.fromEntries(r.outputs.map((o) => [o.item, (o.n / r.time) * 60])) };
  if (b.type === 'field') return { items: [b.crop!], full: null };
  if (b.type === 'hive') return { items: ['honey'], full: null };
  return { items: [], full: null };
}

/**
 * The history section of a building's inspector. `win` and `setWin` keep the chosen window across buildings. `update` is
 * cheap to call every frame: it redraws only when the time shown or the pointer moved.
 */
export function historyView(s: GameState, b: Building, win: () => HistoryWindow, setWin: (w: HistoryWindow) => void): { el: HTMLElement; update: () => void } {
  const reading = readingOf(b);
  const buttons = HISTORY_WINDOWS.map((w) => h('button', {
    class: 'small', title: `The last ${w / 60} minute${w > 60 ? 's' : ''} of play`,
    onclick: (e: Event) => { e.stopPropagation(); setWin(w); key = ''; },
  }, `${w / 60}m`));
  const plot = h('div', { class: reading ? 'hist-bars' : 'hist-strip' });
  const cursor = h('div', { class: 'hist-cursor' });
  let hover: number | null = null;
  const area = h('div', {
    class: 'hist-plot',
    onmousemove: (e: MouseEvent) => { const r = area.getBoundingClientRect(); hover = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); },
    onmouseleave: () => { hover = null; },
  }, plot, cursor);
  const left = h('span'), readout = h('div', { class: 'hist-readout' });
  const rates = h('div'), breakdown = h('div', { class: 'hist-breakdown' });
  const el = h('div', { class: 'history' },
    h('div', { class: 'hist-head' }, h('h4', null, 'History'), h('span', { class: 'hist-windows' }, ...buttons)),
    area, h('div', { class: 'hist-axis' }, left, h('span', null, 'now')), readout, rates, breakdown);

  let key = '';
  const update = () => {
    const w = win(), hist = historyOf(s, b);
    // Twice a game second is smooth enough, and costs little at 4×.
    const k = `${w}|${Math.floor(s.time * 2)}|${hover === null ? '' : Math.round(hover * 200)}|${!!hist}`;
    if (k === key) return;
    key = k;
    buttons.forEach((x, i) => x.classList.toggle('active', HISTORY_WINDOWS[i] === w));
    set(left, `−${fmtAgo(w)}`);
    if (!hist) {
      plot.replaceChildren(); cursor.style.display = 'none';
      set(readout, 'Nothing recorded yet: let the game run.'); rates.replaceChildren(); breakdown.replaceChildren();
      return;
    }
    const sum = summarize(hist, s.time, w);
    if (reading) drawReading(sum, reading); else drawStrip(sum);
    cursor.style.display = hover === null ? 'none' : '';
    if (hover !== null) cursor.style.left = `${hover * 100}%`;
    set(readout, hover === null ? 'Point at the chart for details.' : describeAt(sum, sum.start + hover * w));
  };

  const xOf = (sum: Summary, t: number) => ((t - sum.start) / (sum.now - sum.start)) * 100;

  function drawStrip(sum: Summary) {
    // The strip: one segment for each status held, from when it began to when it ended.
    const segs = sum.spans.map((sp) => {
      const seg = h('div', { class: `seg ${sp.status}` });
      seg.style.left = `${xOf(sum, sp.from)}%`; seg.style.width = `${xOf(sum, sp.to) - xOf(sum, sp.from)}%`;
      return seg;
    });
    plot.replaceChildren(...segs);
    const total = sum.shares.reduce((n, x) => n + x.seconds, 0);
    breakdown.replaceChildren(...sum.shares.map((x) => h('div', { class: 'kv' },
      h('span', null, h('i', { class: `swatch ${x.status}` }), statusLabel(b, x.status, x.need, x.share)), h('b', null, total ? pct(x.seconds / total) : '–'))));
    const m = makesOf(b);
    // Also goods it made before its recipe or crop changed, if still in the window.
    const items = [...m.items, ...(Object.keys(sum.perMin) as ItemId[]).filter((i) => !m.items.includes(i))];
    if (!items.length) { rates.replaceChildren(); return; }
    // Goods a minute over the window, and at full speed for machines (the share of it they reached).
    rates.replaceChildren(...items.map((i) => {
      const got = sum.perMin[i] ?? 0, full = m.full?.[i];
      return h('div', { class: 'kv' }, h('span', null, `${ITEMS[i].name} ${b.type === 'field' ? 'harvested' : 'made'}`),
        h('b', { title: full ? `${perMin(full)} at full speed` : undefined }, full ? `${perMin(got)} · ${pct(got / full)} of full speed` : perMin(got)));
    }));
  }

  function drawReading(sum: Summary, r: Reading) {
    const top = Math.max(r.max, sum.reading?.max ?? 0);
    plot.replaceChildren(...sum.bars.map((x) => {
      const bar = h('div', { class: 'bar-col' });
      bar.style.left = `${xOf(sum, x.from)}%`; bar.style.width = `${xOf(sum, x.to) - xOf(sum, x.from)}%`;
      if (x.value === null) bar.classList.add('none'); else bar.style.height = `${Math.max(2, (x.value / top) * 100)}%`;
      return bar;
    }));
    breakdown.replaceChildren();
    const v = sum.reading;
    rates.replaceChildren(...(v ? [h('div', { class: 'kv' }, h('span', null, r.what), h('b', null, `average ${r.fmt(v.avg)} · from ${r.fmt(v.min)} to ${r.fmt(v.max)}`))] : []));
  }

  /** What was going on at time `t`, for the pointer. */
  function describeAt(sum: Summary, t: number): string {
    const ago = `${fmtAgo(Math.max(0, sum.now - t))} ago`;
    if (t < sum.since) return `${ago}: not built yet (or before recording began)`;
    if (reading) {
      const bar = sum.bars.find((x) => t >= x.from && t < x.to);
      return bar?.value != null ? `${ago}: ${reading.fmt(bar.value)}` : `${ago}: no reading`;
    }
    const sp: Span | undefined = sum.spans.find((x) => t >= x.from && t < x.to) ?? sum.spans[sum.spans.length - 1];
    return sp ? `${ago}: ${statusLabel(b, sp.status, sp.need, sp.share)}, for ${fmtAgo(sp.to - sp.began)}${sp.to >= sum.now - 1e-6 ? ' so far' : ''}` : ago;
  }

  return { el, update };
}

function set(el: HTMLElement, text: string) { if (el.textContent !== text) el.textContent = text; }
