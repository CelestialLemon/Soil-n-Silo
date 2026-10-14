import { BUILDINGS, ITEMS, type ItemId } from '../game/data.ts';
import type { Goal } from '../game/scenarios.ts';
import { goalDone, ratePerMin, soilHealth, type Medal } from '../game/sim.ts';
import type { Building, GameState, Status } from '../game/state.ts';
import { h, icon } from './dom.ts';
import { dec, itemName, pct, playTime } from './format.ts';

// Small pieces of the Clearday system the screens share: gauges and rings, status pills (a shape, a word and a tint, never
// colour alone), medals, goods.

/** A goal as a 270° gauge: `v` 0–1, its size `d`, the figure inside and a word under it; pace ticks at `ticks`. */
export function gauge(o: { v: number; d?: number; w?: number; col?: string; inner: (Node | string)[]; foot?: string; ticks?: { at: number; silver?: boolean }[]; cls?: string }) {
  const g = h('span', { class: `cd-gauge${o.cls ? ` ${o.cls}` : ''}` },
    ...(o.ticks ?? []).map((t) => h('span', { class: `cd-gauge__tick${t.silver ? ' is-silver' : ''}`, style: `--at: ${Math.max(0, Math.min(1, t.at))}` })),
    h('span', { class: 'cd-gauge__in' }, ...o.inner),
    o.foot !== undefined ? h('span', { class: 'cd-gauge__foot' }, o.foot) : null);
  g.style.setProperty('--v', String(Math.max(0, Math.min(1, o.v))));
  if (o.d) g.style.setProperty('--d', `${o.d}px`);
  if (o.w) g.style.setProperty('--w', `${o.w}px`);
  if (o.col) g.style.setProperty('--col', o.col);
  return g;
}

/** A share or a total as a full ring, with what sits inside it. */
export function ring(o: { v: number; d?: number; w?: number; col?: string }, ...inner: (Node | string)[]) {
  const r = h('span', { class: 'cd-ring' });
  r.style.setProperty('--v', String(Math.max(0, Math.min(1, o.v))));
  if (o.d) r.style.setProperty('--d', `${o.d}px`);
  if (o.w) r.style.setProperty('--w', `${o.w}px`);
  if (o.col) r.style.setProperty('--col', o.col);
  return h('span', { class: 'cd-ringbox' }, r, inner.length ? h('span', { class: 'cd-ring__in' }, ...inner) : null);
}

// ---- Statuses ----

/** How a status looks: the class for its shape and tint (`cd-status` and markers), and whether it is drawn as an outline. */
export function statusLook(status: Status): { cls: string; outline?: boolean; col?: string } {
  switch (status) {
    case 'ok': return { cls: '' };
    case 'idle': return { cls: '', col: 'var(--ink-3)' };
    case 'input': case 'flowers': return { cls: 'is-wait' };
    case 'blocked': return { cls: 'is-blocked' };
    case 'lowpower': return { cls: 'is-nopower', col: 'var(--status-blocked)' };
    case 'power': return { cls: 'is-nopower' };
    case 'nolink': return { cls: 'is-nopower', outline: true };
    case 'noroute': return { cls: 'is-unreachable' };
    case 'noroad': return { cls: 'is-unreachable', outline: true };
    case 'dry': return { cls: 'is-dry' };
  }
}

/** Whether a status is a problem (it shows a marker). */
export const isProblem = (status: Status) => status !== 'ok' && status !== 'idle';

/** What a building was doing, in a few words. */
export function statusLabel(b: { type: Building['type'] }, status: Status, need?: string, share?: number): string {
  // A group's need is "feed (beans, bran or seed cake)": the pill says "feed".
  need = need?.split(' (')[0];
  switch (status) {
    case 'ok':
      return b.type === 'field' ? 'Growing' : b.type === 'hive' ? 'Making honey' : b.type === 'garage' ? 'Charging trucks' : b.type === 'sprinkler' ? 'Watering'
        : b.type === 'solar' || b.type === 'turbine' ? 'Making power' : b.type === 'battery' ? 'Connected' : b.type === 'pylon' ? 'Linked' : 'Working';
    case 'idle': return b.type === 'garage' ? 'No truck charging' : b.type === 'solar' ? 'Night' : b.type === 'silo' ? 'Storing' : 'Idle';
    case 'input': return `Waiting for ${need ?? 'goods'}`;
    case 'blocked': return `Full of ${need ?? 'goods'}`;
    case 'noroute': return `No route takes ${need ?? 'its goods'}`;
    case 'noroad': return 'No road';
    case 'power': return 'No power';
    case 'lowpower': return `Low power${share !== undefined ? ` · ${pct(share)}` : ''}`;
    case 'nolink': return 'Not connected';
    case 'flowers': return 'No flowers near';
    case 'dry': return 'Dry';
  }
}

/** A status as a pill: its shape, its word, its tint. */
export function statusPill(status: Status, label: string, cls = '') {
  const look = statusLook(status);
  const el = h('span', { class: `cd-status ${look.cls}${look.outline ? ' is-outline' : ''}${cls ? ` ${cls}` : ''}` }, label);
  if (look.col) el.style.setProperty('--col', look.col);
  return el;
}

// ---- Medals, goods, goals ----

export const MEDAL_NAME: Record<Medal, string> = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const medal = (m: Medal | null, d?: number) =>
  h('span', { class: `cd-medal${m === 'silver' ? ' is-silver' : m === 'bronze' ? ' is-bronze' : m === null ? ' is-none' : ''}`, style: d ? `--d: ${d}px; font-size: ${Math.round(d * 0.36)}px` : undefined }, m ? m[0].toUpperCase() : '–');

/** A good as a chip: its icon and some words. */
export const goodChip = (item: ItemId, text: string = itemName(item), cls = '') => h('span', { class: `cd-chip${cls ? ` ${cls}` : ''}` }, icon(item, 20), text);

/** The icon of what a goal asks for. */
export const goalIcon = (g: Goal) => (g.kind === 'soil' ? 'soil' : g.item);

/** A goal's progress now: how far along (0–1), the figure, what it is out of, and a word for it. */
export function goalNow(s: GameState, i: number) {
  const g = s.scenario.goals[i], done = goalDone(s, i);
  if (g.kind === 'deliver') {
    const n = Math.min(g.n, s.delivered[g.item] ?? 0);
    return { v: n / g.n, figure: String(n), of: `of ${g.n}`, word: itemName(g.item), done, short: `${n} / ${g.n} ${itemName(g.item)}` };
  }
  if (g.kind === 'rate') {
    const r = ratePerMin(s, g.item, 'delivered');
    return { v: done ? 1 : r / g.perMin, figure: dec(r), of: `of ${g.perMin} a min`, word: `${itemName(g.item)} / min`, done, short: `${dec(r)} / ${g.perMin} ${itemName(g.item)} a min` };
  }
  const v = soilHealth(s);
  return { v: Math.min(1, v / g.min), figure: String(Math.round(v)), of: `${g.min}+ at end`, word: 'soil', done, short: `soil ${Math.round(v)} / ${g.min}+` };
}

/** What a goal asks, in a few words: "150 bread to the depot", "5 yarn a minute", "soil 40+ at the end". */
export function goalWords(g: Goal) {
  return g.kind === 'deliver' ? `${g.n} ${itemName(g.item)} to the depot` : g.kind === 'rate' ? `${g.perMin} ${itemName(g.item)} a minute` : `soil ${g.min}+ at the end`;
}
/** A goal as an order: "Deliver 150 bread". */
export function goalOrder(g: Goal) {
  return g.kind === 'deliver' ? `Deliver ${g.n} ${itemName(g.item)}` : g.kind === 'rate' ? `Deliver ${g.perMin} ${itemName(g.item)} a minute` : `Keep the soil ${g.min}+`;
}

/** Gold and silver times, a line: "gold within 35:00 · silver 52:30". */
export const medalTimes = (par: number) => [
  h('span', null, h('i', { class: 'dot', style: 'background: var(--medal-gold)' }), `gold within ${playTime(par)}`),
  h('span', null, h('i', { class: 'dot', style: 'background: var(--medal-silver)' }), `silver ${playTime(par * 1.5)}`),
];

export const buildingIcon = (b: { type: Building['type'] }, size?: number) => icon(b.type, size);
export const itemPrice = (i: ItemId) => ITEMS[i].price;
export const isBuilding = (id: string): id is Building['type'] => id in BUILDINGS;
