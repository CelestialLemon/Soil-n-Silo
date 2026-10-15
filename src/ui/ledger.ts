import { CROPS, ITEM_IDS, ITEMS, TREE_HEALTH } from '../game/data.ts';
import { RECENT_WINDOW, flowRate, flowSeries, goodsHeld, soilTrend } from '../game/flows.ts';
import { networks, usedBy } from '../game/power.ts';
import { dayAt, hourAt } from '../game/sim/clock.ts';
import { isPollinated } from '../game/sim/layout.ts';
import { fieldFertility, soilHealth } from '../game/sim/soil.ts';
import { countTrees, type GameState } from '../game/state.ts';
import { fill, h, icon, svg } from './dom.ts';
import { clock, dec, num, pct, plural, watts } from './format.ts';
import { ring } from './widgets.ts';

// The ledger (Tab): the valley's health (soil health with its parts and trend, trees, pollination) and a calm table of goods:
// made, used by your buildings and sent to the depot, a minute (the last five minutes) and in all, with what sits in stores
// and trucks now; then credits earned, spent and now. A button opens the Power panel.

export interface LedgerHost {
  state(): GameState;
  openPower(): void;
  close(): void;
}

/** A small line of the last ten minutes, a minute at a time. */
function spark(values: (number | null)[], gold: boolean) {
  const known = values.map((v) => v ?? 0), top = Math.max(1e-9, ...known), W = 110, H = 26;
  const pts = values.map((v, i) => (v === null ? null : `${(i / (values.length - 1)) * W},${H - 2 - (v / top) * (H - 6)}`)).filter(Boolean).join(' ');
  return svg('svg', { class: 'spark', width: W, height: H, viewBox: `0 0 ${W} ${H}` },
    pts ? svg('polyline', { points: pts, class: gold ? 'gold' : '' }) : null);
}

/** The valley's health: soil, trees, pollination. */
function health(s: GameState) {
  const fields = s.buildings.filter((b) => b.type === 'field'), soil = soilHealth(s), trend = soilTrend(s);
  const base = fields.length ? fields.reduce((n, f) => n + fieldFertility(s, f), 0) / fields.length : 50;
  const trees = countTrees(s), change = trees - s.initialTrees, nudge = Math.max(-TREE_HEALTH.cap, Math.min(TREE_HEALTH.cap, change * TREE_HEALTH.perTree));
  const goal = s.scenario.goals.find((g) => g.kind === 'soil');
  const saplings = s.buildings.filter((b) => b.type === 'sapling').length;
  const flowering = fields.filter((f) => CROPS[f.crop].flowers), reached = flowering.filter((f) => isPollinated(s, f)).length, hives = s.buildings.filter((b) => b.type === 'hive').length;
  const block = (r: Node, label: string, big: (Node | string)[], lines: (Node | string)[], foot: Node | null) => h('div', { class: 'vr' }, r,
    h('div', { class: 'vr-txt' }, h('div', { class: 'cd-label' }, label), h('div', { class: 'vr-big' }, ...big), h('div', { class: 'cd-small' }, ...lines), foot));
  return h('div', { class: 'health' },
    block(ring({ v: soil / 100, d: 132, w: 10, col: 'var(--tide)' }, icon('soil', 48)), 'Soil health', [String(Math.round(soil))],
      [fields.length ? `fields average ${Math.round(base)} over ${fields.length * 9} tiles` : 'no fields: 50 until there are', `, trees ${nudge >= 0 ? '+' : ''}${dec(nudge)}`, h('br'),
        goal && goal.kind === 'soil' ? h('span', null, 'goal ', h('b', null, `${goal.min}+`), ' at the end') : 'the soil goal checks this number'],
      trend === null ? h('div', { class: 'cd-small trend' }, 'trend: a minute more to tell') : h('div', { class: `cd-small trend ${trend < -0.05 ? 'cd-bad' : trend > 0.05 ? 'cd-good' : ''}` },
        Math.abs(trend) <= 0.05 ? 'steady over the last minute' : `${trend < 0 ? '↓' : '↑'} ${dec(Math.abs(trend))} a minute now`)),
    block(ring({ v: s.initialTrees ? Math.min(1, trees / s.initialTrees) : 1, d: 132, w: 10, col: 'var(--pine)' }, icon('sapling', 48)), 'Trees', [num(trees)],
      [saplings ? `${plural(saplings, 'sapling')} growing` : 'no saplings growing', h('br'), `${num(s.initialTrees)} when the commission began`],
      h('div', { class: `cd-small trend ${change > 0 ? 'cd-good' : change < 0 ? 'cd-bad' : ''}` }, change ? `${change > 0 ? '↑' : '↓'} ${Math.abs(change)} since the start` : 'as many as at the start')),
    block(ring({ v: flowering.length ? reached / flowering.length : 0, d: 132, w: 10, col: 'var(--ochre)' }, icon('bee', 48)), 'Pollination',
      [String(reached), h('small', null, ` of ${flowering.length}`)],
      [`flowering fields reached by ${plural(hives, 'hive')}`, h('br'), 'flowering crops there give one more a harvest'], null));
}

export function ledgerSheet(host: LedgerHost) {
  const s = host.state(), head = h('div', { class: 'cd-sheet__head' }), body = h('div', { class: 'sheet-body' });
  const el = h('div', { class: 'cd-sheet ledger' }, head, body);
  let last = -Infinity;
  const update = () => {
    if (performance.now() - last < 1000) return;
    last = performance.now();
    const nets = networks(s).list, made = nets.reduce((n, x) => n + x.made, 0), used = nets.reduce((n, x) => n + usedBy(x), 0);
    const cap = nets.reduce((n, x) => n + x.capacity, 0), stored = nets.reduce((n, x) => n + x.stored, 0);
    fill(head,
      h('div', null, h('div', { class: 'cd-label' }, `${s.scenario.name} · day ${dayAt(s.time)}, ${clock(hourAt(s.time))}`), h('h1', { class: 'cd-display' }, 'Ledger')),
      h('span', { class: 'fill' }),
      h('button', { class: 'cd-btn power-link', title: 'The Power panel (W)', onclick: host.openPower }, icon('bolt', 20), 'Power',
        h('span', { class: 'cd-small' }, nets.length ? `${watts(made)} made · ${watts(used)} used${cap ? ` · ${pct(stored / cap)} stored` : ''}` : 'no network yet'), '›'),
      h('button', { class: 'cd-btn is-icon', title: 'Close (Esc or Tab)', 'aria-label': 'Close', onclick: host.close }, icon('close', 16)));
    const goals = new Set(s.scenario.goals.flatMap((g) => (g.kind === 'soil' ? [] : [g.item])));
    const heldNow = goodsHeld(s);
    const goods = ITEM_IDS.filter((i) => s.made[i] || s.delivered[i] || heldNow[i] || goals.has(i));
    const cell = (v: number) => (v > 0.005 ? dec(v) : '–');
    const spent = s.scenario.credits + s.earned - s.credits;
    fill(body,
      health(s),
      h('div', { class: 'row-head goods-head' }, h('span', { class: 'cd-label' }, 'Goods · made and delivered'), h('span', { class: 'cd-small cd-faint' }, `a minute: average of the last ${RECENT_WINDOW / 60} minutes · lines: the last 10 minutes`)),
      goods.length ? h('table', { class: 'gt' },
        h('thead', null, h('tr', null, h('th', null, 'Good'), h('th', null, 'Made', h('br'), 'a minute'), h('th', { class: 'l' }), h('th', null, 'Used by your', h('br'), 'buildings a minute'),
          h('th', null, 'To the depot', h('br'), 'a minute'), h('th', { class: 'sepl' }, 'Made', h('br'), 'in all'), h('th', null, 'To the depot', h('br'), 'in all'), h('th', null, 'In stores', h('br'), 'and trucks now'))),
        h('tbody', null, ...goods.map((i) => h('tr', { class: goals.has(i) ? 'is-goal' : '' },
          h('td', null, h('span', { class: 'gname' }, icon(i, 30), ITEMS[i].name, goals.has(i) ? h('span', { class: 'cd-chip goal-tag' }, 'goal') : null)),
          h('td', { class: 'n' }, h('b', null, cell(flowRate(s, 'made', i)))), h('td', { class: 'l' }, spark(flowSeries(s, 'made', i), goals.has(i))),
          h('td', { class: 'n' }, cell(flowRate(s, 'used', i))), h('td', { class: 'n' }, cell(flowRate(s, 'delivered', i))),
          h('td', { class: 'n sepl' }, s.made[i] ? num(s.made[i]!) : '–'), h('td', { class: 'n' }, s.delivered[i] ? num(s.delivered[i]!) : '–'), h('td', { class: 'n' }, String(heldNow[i] ?? 0)))))) :
        h('p', { class: 'cd-small' }, 'Nothing made yet.'),
      h('div', { class: 'money cd-small' }, icon('depot', 26), h('span', null, 'Earned at the depot ', h('b', null, num(s.earned)), ' credits'), h('span', { class: 'fill' }),
        s.scenario.sandbox ? null : h('span', null, 'Spent on buildings and trucks ', h('b', null, num(Math.max(0, spent)))),
        h('span', null, 'Credits now ', h('b', null, s.scenario.sandbox ? '∞' : num(Math.floor(s.credits))))));
  };
  update();
  return { el, update };
}
