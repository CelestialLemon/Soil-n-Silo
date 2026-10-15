import { GROUP_NAMES, GROUPS, ITEMS, POWER, type GroupId, type ItemId } from '../game/data.ts';
import { flowRate, RECENT_WINDOW } from '../game/flows.ts';
import { tonight } from '../game/forecast.ts';
import { historyOf, summarize, waitsOf, type Summary, type Wait } from '../game/history.ts';
import { networkOf, usedBy } from '../game/power.ts';
import { sprinklersOf } from '../game/sim/layout.ts';
import { recipeOf } from '../game/sim/goods.ts';
import { routesAt, trucksOn } from '../game/sim/trucks.ts';
import { isMachine, type Building, type GameState, type Status } from '../game/state.ts';
import { must } from '../game/result.ts';
import { fill, h, icon, set, svg } from './dom.ts';
import { clockAt, dec, itemByName, itemName, lcBuilding, num, pct, playTime, plural, watts } from './format.ts';
import { statusLabel, statusPill } from './widgets.ts';

// The inspector's History tab: what a building did over the last 1, 5 or 10 minutes of play. A ribbon of its statuses in
// the order they came (problems hatched, so they stand apart without colour), the share of time in each as a ring, its
// output against full speed with what it made and what was taken from it, and *what it waits for*: each input it lacked,
// power, room for its output, ranked by the share of the window, with a fact for each. Generators and batteries chart their
// watts or charge instead.

export const HISTORY_WINDOWS = [60, 300, 600] as const;
export type HistoryWindow = (typeof HISTORY_WINDOWS)[number];

/** The colour of a status in the ribbon and the ring. */
const STATUS_COL: Record<Status, string> = {
  ok: 'var(--pine)', idle: 'var(--chalk-3)', input: 'var(--status-wait)', flowers: 'var(--status-wait)', blocked: 'var(--status-blocked)',
  lowpower: 'var(--status-blocked)', power: 'var(--status-nopower)', nolink: 'var(--status-nopower)', noroute: 'var(--status-unreachable)',
  noroad: 'var(--status-unreachable)', dry: 'var(--status-dry)',
};
const RAW_COL: Record<Status, string> = {
  ok: '#2f6b55', idle: '#d8d4c7', input: '#b8961f', flowers: '#b8961f', blocked: '#c4702f', lowpower: '#c4702f', power: '#b4523a',
  nolink: '#b4523a', noroute: '#76608f', noroad: '#76608f', dry: '#3d7a91',
};

/** Generators and batteries chart a reading; everything else with a history shows its statuses. */
type Reading = { max: number; fmt: (v: number) => string; what: string };
function readingOf(b: Building): Reading | null {
  if (b.type === 'solar') return { max: POWER.solar, fmt: watts, what: 'Power made' };
  if (b.type === 'turbine') return { max: POWER.turbine, fmt: watts, what: 'Power made' };
  if (b.type === 'battery') return { max: POWER.battery.capacity, fmt: (v) => pct(v / POWER.battery.capacity), what: 'Charge' };
  return null;
}

/** The goods a building makes, main one first, and what it makes a minute at full speed (null: no fixed pace). */
export function makesOf(b: Building): { items: ItemId[]; full: Partial<Record<ItemId, number>> | null } {
  const r = recipeOf(b);
  if (r) return { items: r.outputs.map((o) => o.item), full: Object.fromEntries(r.outputs.map((o) => [o.item, (o.n / r.time) * 60])) };
  if (b.type === 'field') return { items: [b.crop], full: null };
  if (b.type === 'hive') return { items: ['honey'], full: null };
  return { items: [], full: null };
}

/** Goods of `item` (or any of a group) waiting in a building's stores now. */
function inStore(b: Building, item: ItemId) {
  if (b.type === 'field') return (b.harvest ?? b.crop) === item ? b.stored ?? 0 : 0;
  if (b.type === 'hive') return item === 'honey' ? b.stored ?? 0 : 0;
  return isMachine(b) ? b.outputs[item] ?? 0 : 0;
}

/** A group named by a status's need ("feed (beans, bran or seed cake)"), if it is one. */
const groupByName = (need: string | undefined) => (Object.keys(GROUP_NAMES) as GroupId[]).find((g) => GROUP_NAMES[g] === need) ?? null;

/** A fact about what a building waited for, in a line: no advice, just what the valley does. */
export function waitFact(s: GameState, b: Building, w: Wait): string {
  switch (w.kind) {
    case 'input': {
      const item = itemByName(w.need), group = groupByName(w.need), goods: ItemId[] = item ? [item] : group ? [...GROUPS[group]] : [];
      if (!goods.length) return '';
      const made = goods.reduce((n, i) => n + flowRate(s, 'made', i), 0);
      const r = recipeOf(b), ing = r?.inputs.find((x) => ('item' in x ? goods.includes(x.item) : x.group === group));
      const use = r && ing ? ing.n * 60 / r.time : null;
      const what = item ? itemName(item) : (w.need ?? '').split(' (')[0];
      return `The valley made ${dec(made)} ${what} a minute over the last ${RECENT_WINDOW / 60} min${use ? `; this ${lcBuilding(b.type)} uses up to ${dec(use)} at full speed` : ''}.`;
    }
    case 'power': {
      const net = networkOf(s, b);
      if (!net) return 'No pylon reaches it.';
      const t = tonight(s);
      return `Its network: ${watts(net.made)} made, ${watts(usedBy(net))} used now.${t?.dryAt ? ` Batteries run dry at ${clockAt(t.dryAt)} tonight.` : ''}`;
    }
    case 'output': {
      const item = itemByName(w.need);
      const routes = item ? routesAt(s, b).filter((r) => r.stops.some((st) => st.building === b.id && st.pick.includes(item)) && trucksOn(s, r).length) : [];
      return routes.length ? `${plural(routes.length, 'route')} with trucks pick${routes.length === 1 ? 's' : ''} up ${w.need} here.` : `No route with trucks picks up ${w.need ?? 'its goods'} here.`;
    }
    case 'water': { const n = sprinklersOf(s, b).length; return n ? `${plural(n, 'sprinkler')} reach${n === 1 ? 'es' : ''} it, short of power.` : 'No sprinkler reaches it.'; }
    case 'flowers': return 'No flowering field within reach.';
    case 'road': return 'Trucks can\'t reach it from their garage.';
  }
}

const WAIT_ICON: Record<Wait['kind'], string> = { input: 'clock', power: 'bolt', output: 'truck', water: 'water', flowers: 'bee', road: 'road' };

/**
 * The history tab of a building's inspector. `win` and `setWin` keep the chosen window across buildings. `update` is cheap
 * to call every frame: it redraws only when the time shown or the pointer moved.
 */
export function historyView(s: GameState, b: Building, win: () => HistoryWindow, setWin: (w: HistoryWindow) => void): { el: HTMLElement; update: () => void } {
  const reading = readingOf(b);
  const buttons = HISTORY_WINDOWS.map((w) => h('button', { title: `The last ${w / 60} minute${w > 60 ? 's' : ''} of play`, onclick: () => { setWin(w); key = ''; } }, `${w / 60} min`));
  const plot = h('div', { class: reading ? 'hist-bars' : 'ribbon' });
  const cursor = h('div', { class: 'hist-cursor', hidden: true });
  let hover: number | null = null;
  const area = h('div', {
    class: 'hist-plot',
    onmousemove: (e: MouseEvent) => { const r = area.getBoundingClientRect(); hover = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); },
    onmouseleave: () => { hover = null; },
  }, plot, cursor);
  const head = h('span', { class: 'cd-small cd-faint' }), axis = h('div', { class: 'hist-axis' }), readout = h('div', { class: 'cd-small hist-readout' });
  const shares = h('div', { class: 'hist-shares' }), output = h('div'), waits = h('div');
  const el = h('div', { class: 'history' },
    h('div', { class: 'cd-seg hist-windows' }, ...buttons),
    h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }), head),
    area, axis, readout, shares, output, waits);
  const label = must(el.querySelector('.row-head .cd-label'), '.cd-label');

  let key = '';
  const update = () => {
    const w = win(), hist = historyOf(s, b);
    // Twice a second of play is smooth enough, and costs little at 4×.
    const k = `${w}|${Math.floor(s.time * 2)}|${hover === null ? '' : Math.round(hover * 200)}|${!!hist}`;
    if (k === key) return;
    key = k;
    buttons.forEach((x, i) => x.classList.toggle('is-on', HISTORY_WINDOWS[i] === w));
    set(label, `The last ${w / 60 === 1 ? 'minute' : `${w / 60} minutes`}`);
    set(head, `of play, ${playTime(Math.max(0, s.time - w))} → ${playTime(s.time)}`);
    const ticks = w / 60;
    fill(axis, h('span', null, `${ticks} min ago`), ...Array.from({ length: ticks - 1 }, (_, i) => (ticks <= 5 ? h('span', null, String(ticks - 1 - i)) : (ticks - 1 - i) % 2 ? null : h('span', null, String(ticks - 1 - i)))), h('span', null, 'now'));
    if (!hist) {
      plot.replaceChildren(); cursor.hidden = true;
      set(readout, 'Nothing recorded yet: let the game run.');
      shares.replaceChildren(); output.replaceChildren(); waits.replaceChildren();
      return;
    }
    const sum = summarize(hist, s.time, w);
    if (reading) drawReading(sum, reading); else drawStatuses(sum);
    cursor.hidden = hover === null;
    if (hover !== null) cursor.style.left = `${hover * 100}%`;
    set(readout, hover === null ? 'Point at the ribbon for what happened when.' : describeAt(sum, sum.start + hover * w));
  };

  const xOf = (sum: Summary, t: number) => ((t - sum.start) / (sum.now - sum.start)) * 100;

  function drawStatuses(sum: Summary) {
    // The ribbon: a piece for each status held, from when it began to when it ended.
    plot.replaceChildren(...sum.spans.map((sp) => {
      const seg = h('i', { class: sp.status === 'ok' || sp.status === 'idle' ? '' : 'is-problem' });
      seg.style.left = `${xOf(sum, sp.from)}%`; seg.style.width = `${xOf(sum, sp.to) - xOf(sum, sp.from)}%`;
      seg.style.setProperty('--c', STATUS_COL[sp.status]);
      return seg;
    }));
    const total = sum.shares.reduce((n, x) => n + x.seconds, 0);
    // The ring: each status's share, in the ribbon's colours.
    const c = 2 * Math.PI * 48;
    let at = 0;
    const arcs = sum.shares.map((x) => {
      const len = total ? (x.seconds / total) * c : 0;
      const a = svg('circle', { cx: 56, cy: 56, r: 48, stroke: RAW_COL[x.status], 'stroke-dasharray': `${Math.max(0, len - 3)} ${c}`, 'stroke-dashoffset': -at });
      at += len;
      return a;
    });
    const working = sum.shares.filter((x) => x.status === 'ok').reduce((n, x) => n + x.seconds, 0);
    fill(shares,
      svg('svg', { width: 112, height: 112, viewBox: '0 0 112 112', 'aria-label': 'Share of time' },
        svg('g', { transform: 'rotate(-90 56 56)', fill: 'none', 'stroke-width': 12 }, svg('circle', { cx: 56, cy: 56, r: 48, stroke: '#e7e4da' }), ...arcs),
        svg('text', { x: 56, y: 58, 'text-anchor': 'middle', class: 'ring-figure' }, total ? pct(working / total) : '–'),
        svg('text', { x: 56, y: 76, 'text-anchor': 'middle', class: 'ring-word' }, statusLabel(b, 'ok').toLowerCase())),
      h('div', { class: 'share-rows' }, ...sum.shares.slice(0, 5).map((x) => h('div', null,
        statusPill(x.status, statusLabel(b, x.status, x.need, x.share)), h('span', { class: 'fill' }), h('b', { class: 'cd-num' }, total ? pct(x.seconds / total) : '–')))));
    // Output against full speed, and what was made and taken.
    const m = makesOf(b), items = [...m.items, ...(Object.keys(sum.perMin) as ItemId[]).filter((i) => !m.items.includes(i))];
    if (items.length) {
      const main = items[0], got = sum.perMin[main] ?? 0, full = m.full?.[main];
      const made = sum.made[main] ?? 0, taken = sum.taken[main] ?? 0;
      fill(output, h('div', { class: 'cd-inset hist-output' },
        h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, 'Output'),
          h('span', null, h('span', { class: 'big' }, dec(got)), h('span', { class: 'cd-small' }, full ? ` of ${dec(full)} ${itemName(main)} / min at full speed` : ` ${itemName(main)} / min`))),
        full ? h('div', { class: 'cd-bar', style: `--v: ${Math.min(1, got / full)}; margin-top: 12px` }, h('i')) : null,
        h('div', { class: 'cd-small', style: 'margin-top: 8px' }, `${num(made)} ${itemName(main)} made · ${num(taken)} taken away · ${inStore(b, main)} in its store`),
        ...items.slice(1).map((i) => h('div', { class: 'cd-small' }, `${ITEMS[i].name}: ${dec(sum.perMin[i] ?? 0)} / min · ${num(sum.made[i] ?? 0)} made · ${num(sum.taken[i] ?? 0)} taken away`))));
    } else output.replaceChildren();
    // What it waits for, ranked.
    const list = waitsOf(sum).filter((x) => x.share > 0);
    fill(waits, list.length ? [
      h('div', { class: 'row-head', style: 'margin-top: 22px' }, h('span', { class: 'cd-label', style: 'color: var(--ochre)' }, 'What it waits for'), h('span', { class: 'cd-small cd-faint' }, `share of the last ${win() / 60} min`)),
      ...list.slice(0, 4).map((x, i) => {
        const item = x.kind === 'input' || x.kind === 'output' ? itemByName(x.need) : null, itemGroup = groupByName(x.need);
        const name = x.kind === 'input' ? (item ? ITEMS[item].name : (x.need ?? 'Goods').split(' (')[0].replace(/^./, (c) => c.toUpperCase()))
          : x.kind === 'output' ? `Room for ${x.need ?? 'its goods'}` : x.kind === 'power' ? 'Power' : x.kind === 'water' ? 'Water' : x.kind === 'flowers' ? 'Flowers' : 'A road';
        return h('div', { class: 'wait' }, h('span', { class: 'rank' }, String(i + 1)),
          h('div', null, h('b', null, h('span', { class: 'disc' }, icon(item ?? (x.kind === 'input' && itemGroup ? GROUPS[itemGroup][0] : WAIT_ICON[x.kind]), 22)), name), h('div', { class: 'cd-small' }, waitFact(s, b, x))),
          h('span', { class: `pc${i === 0 && x.share >= 0.2 ? ' cd-bad' : ''}` }, pct(x.share)));
      })] : []);
  }

  function drawReading(sum: Summary, r: Reading) {
    const top = Math.max(r.max, sum.reading?.max ?? 0);
    plot.replaceChildren(...sum.bars.map((x) => {
      const bar = h('i');
      bar.style.left = `${xOf(sum, x.from)}%`; bar.style.width = `${xOf(sum, x.to) - xOf(sum, x.from)}%`;
      bar.style.height = x.value === null ? '0' : `${Math.max(2, (x.value / top) * 100)}%`;
      return bar;
    }));
    shares.replaceChildren(); waits.replaceChildren();
    const v = sum.reading;
    fill(output, v ? h('div', { class: 'cd-inset hist-output' }, h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, r.what),
      h('span', null, h('span', { class: 'big' }, r.fmt(v.avg)), h('span', { class: 'cd-small' }, ' on average'))),
    h('div', { class: 'cd-small', style: 'margin-top: 8px' }, `From ${r.fmt(v.min)} to ${r.fmt(v.max)} over the window.`)) : null);
  }

  /** What was going on at time `t`, for the pointer. */
  function describeAt(sum: Summary, t: number): string {
    const ago = `${playTime(Math.max(0, sum.now - t))} ago`;
    if (t < sum.since) return `${ago}: not built yet (or before recording began)`;
    if (reading) {
      const bar = sum.bars.find((x) => t >= x.from && t < x.to);
      return bar?.value != null ? `${ago}: ${reading.fmt(bar.value)}` : `${ago}: no reading`;
    }
    const sp = sum.spans.find((x) => t >= x.from && t < x.to) ?? sum.spans[sum.spans.length - 1];
    return sp ? `${ago}: ${statusLabel(b, sp.status, sp.need, sp.share)}, for ${playTime(sp.to - sp.began)}${sp.to >= sum.now - 1e-6 ? ' so far' : ''}` : ago;
  }

  return { el, update };
}

