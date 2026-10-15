import { chainOf, type Step } from '../game/chain.ts';
import { BUILDINGS, ITEMS, START_HOUR, type ItemId } from '../game/data.ts';
import { must } from '../game/result.ts';
import { HOUR_SECONDS } from '../game/powerlog.ts';
import { goalGood, runWaits, type Mark } from '../game/runlog.ts';
import { CAMPAIGN, SILVER_PAR } from '../game/scenarios.ts';
import { soilHealth } from '../game/sim/soil.ts';
import { type Medal } from '../game/sim/stats.ts';
import { countTrees, type GameState } from '../game/state.ts';
import { h, icon, svg } from './dom.ts';
import { dec, itemName, lcBuilding, num, pct, playTime } from './format.ts';
import { gauge, MEDAL_NAME } from './widgets.ts';

// The results, when the commission is complete: the medal and time against the medal lines; the depot's receipt; the run as
// a curve of the goal good with its milestones and the nights short of power; what made the difference (the analysis play
// leaves out, and the one place a "next time" line is allowed); the valley left behind; keep playing, the next commission or
// the level select.

export interface ResultsHost {
  keepPlaying: () => void;
  menu: () => void;
  start(id: string): void;
}

const cap = (t: string) => t.replace(/^./, (c) => c.toUpperCase());

/** The goods in a good's chain, for picking which "first" milestones belong on its curve. */
function chainItems(item: ItemId): Set<ItemId> {
  const out = new Set<ItemId>([item]);
  const walk = (st: Step | null) => { if (!st) return; for (const i of st.inputs) if ('item' in i) { out.add(i.item); walk(i.from); } };
  walk(chainOf(item).from);
  return out;
}

/** A milestone's words and icon. */
function markLabel(s: GameState, m: Mark): { text: string; icon: string; bad?: boolean; gold?: boolean } {
  switch (m.kind) {
    case 'first': { const item = must(m.item, 'mark item'); return { text: `First ${itemName(item)}`, icon: item }; };
    case 'night': return { text: 'First night short', icon: 'moon', bad: true };
    case 'truck': return { text: m.n === 2 ? 'Second truck' : 'First truck', icon: 'truck' };
    case 'second': { const type = must(m.type, 'mark building'); return { text: `Second ${lcBuilding(type)}`, icon: type }; };
    case 'loop': { const item = must(m.item, 'mark item'); return { text: `${cap(itemName(item))} loop closed`, icon: item }; };
    case 'goal': {
      const g = s.scenario.goals[must(m.goal, 'mark goal')];
      return g.kind === 'deliver' ? { text: `${g.n} ${itemName(g.item)}`, icon: g.item, gold: true }
        : g.kind === 'rate' ? { text: `${g.perMin} ${itemName(g.item)} a minute`, icon: g.item, gold: true } : { text: `Soil ${g.min}+`, icon: 'soil', gold: true };
    }
  }
}

/** The play time an in-game hour of a day falls at. */
const timeOf = (day: number, hour: number) => ((day - 1) * 24 + hour - START_HOUR) * HOUR_SECONDS;

function runChart(s: GameState, end: number) {
  const run = s.run, item = goalGood(s.scenario), W = 1000, H = 240, left = 50, top = 74;
  const g = s.scenario.goals.find((x) => x.kind === 'deliver');
  const most = Math.max(1, g && g.kind === 'deliver' ? g.n : 0, ...run.curve);
  const xMax = Math.max(end, Math.min(s.scenario.par, end * 1.15)) * 1.04;
  const x = (t: number) => left + (t / xMax) * W, y = (v: number) => top + H - (v / most) * H;
  const parts: SVGElement[] = [];
  // Nights shaded.
  const w = s.scenario.weather;
  for (let d = 0; timeOf(d, w.sunset) < xMax; d++) {
    const a = Math.max(0, timeOf(d, w.sunset)), b = Math.min(xMax, timeOf(d + 1, w.sunrise));
    if (b > a) parts.push(svg('rect', { x: x(a), y: top, width: x(b) - x(a), height: H, class: 'night' }));
  }
  // Nights short of power, as bars under the axis.
  for (const n of run.nights) {
    if (n.short <= 0) continue;
    const a = Math.max(0, timeOf(n.day, w.sunset)), b = Math.min(end, timeOf(n.day + 1, w.sunrise));
    if (b > a) parts.push(svg('rect', { x: x(a), y: top + H + 6, width: Math.max(4, x(b) - x(a)), height: 6, rx: 3, class: 'short' }));
  }
  // The curve.
  const pts = run.curve.map((v, i) => [x(Math.min(end, i * run.curveStep)), y(v)] as const);
  if (pts.length) {
    const line = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
    parts.push(svg('polygon', { points: `${pts[0][0]},${top + H} ${line} ${pts[pts.length - 1][0]},${top + H}`, class: 'area' }));
    parts.push(svg('polyline', { points: line, class: 'curve' }));
  }
  // Axes and the gold line.
  for (const f of [0.5, 1]) parts.push(svg('text', { x: left - 12, y: y(most * f) + 4, 'text-anchor': 'end' }, String(Math.round(most * f))));
  const step = xMax > 3000 ? 1200 : 600;
  for (let t = 0; t <= xMax; t += step) parts.push(svg('text', { x: x(t), y: top + H + 34, 'text-anchor': t ? 'middle' : 'start' }, playTime(t)));
  if (!s.scenario.sandbox && s.scenario.par <= xMax) {
    parts.push(svg('line', { x1: x(s.scenario.par), x2: x(s.scenario.par), y1: top - 20, y2: top + H, class: 'gold' }));
    parts.push(svg('text', { x: x(s.scenario.par), y: top - 26, 'text-anchor': 'middle', class: 'gold-t' }, `gold ${playTime(s.scenario.par)}`));
  }
  // Milestones: the goal good's chain, nights, trucks, second buildings, loops and goals; at most eight, the most telling.
  const chain = item ? chainItems(item) : new Set<ItemId>();
  const rank = (m: Mark) => ({ goal: 0, night: 1, loop: 2, second: 3, truck: 4, first: 5 })[m.kind];
  // Taken in order of how telling they are, each kept only where it has room beside those kept already.
  const kept: Mark[] = [];
  for (const m of run.marks.filter((m) => m.t <= end + 1 && (m.kind !== 'first' || (m.item !== undefined && chain.has(m.item))) && (m.kind !== 'truck' || m.n === 2)
    // A soil goal is judged at the end: being met early is no milestone.
    && (m.kind !== 'goal' || m.goal === undefined || s.scenario.goals[m.goal]?.kind !== 'soil'))
    .sort((a, b) => rank(a) - rank(b) || a.t - b.t)) {
    if (kept.length < 8 && kept.every((k) => Math.abs(x(k.t) - x(m.t)) >= 70)) kept.push(m);
  }
  const marks = kept.sort((a, b) => a.t - b.t);
  const valueAt = (t: number) => run.curve[Math.max(0, Math.min(run.curve.length - 1, Math.round(t / run.curveStep)))] ?? 0;
  const discs = marks.map((m, i) => {
    const l = markLabel(s, m), px = x(m.t), py = y(valueAt(m.t)), up = i % 2 === 0 ? -1 : 1;
    const ly = Math.max(14, Math.min(top + H + 30, py + up * 46));
    parts.push(svg('line', { x1: px, x2: px, y1: py, y2: ly - up * 4, class: 'leader' }));
    parts.push(svg('text', { x: px + 8, y: ly + (up < 0 ? -2 : 12), class: 'ms' }, l.text, svg('tspan', { class: 't', dx: 6 }, m.kind === 'night' ? `day ${m.n} · ${playTime(m.t)}` : playTime(m.t))));
    return h('span', { class: `mi${l.bad ? ' is-bad' : ''}${l.gold ? ' is-gold' : ''}`, style: `left: ${px / (left + W + 60) * 100}%; top: ${py / (top + H + 44) * 100}%`, title: l.text }, icon(l.icon, l.gold ? 30 : 24));
  });
  return h('div', { class: 'run-chart' },
    svg('svg', { class: 'cd-chart', viewBox: `0 0 ${left + W + 60} ${top + H + 44}`, width: '100%', 'aria-label': 'The goal good delivered over the run, with milestones' }, ...parts),
    ...discs);
}

/** What held the run back, from its log, with a fact each; and one "next time" line. */
function differences(s: GameState, end: number) {
  const run = s.run, out: HTMLElement[] = [];
  const waits = runWaits(run).filter((w) => ['input', 'power', 'lowpower', 'blocked', 'noroute'].includes(w.status) && w.share >= 0.05 && BUILDINGS[w.type].category === 'processing');
  const top = waits[0] ?? runWaits(run).find((w) => ['input', 'power', 'lowpower'].includes(w.status) && w.share >= 0.05) ?? null;
  let next = '';
  if (top) {
    const name = BUILDINGS[top.type].name, item = (Object.keys(ITEMS) as ItemId[]).find((i) => ITEMS[i].name.toLowerCase() === top.need) ?? null;
    const what = top.status === 'input' ? `${name} waiting on ${top.need.split(' (')[0]}` : top.status === 'blocked' || top.status === 'noroute' ? `${name} full of ${top.need}` : `${name} short of power`;
    const fact = item && top.status === 'input' ? `The valley made ${dec((s.made[item] ?? 0) / Math.max(1, end / 60))} ${itemName(item)} a minute over the run.`
      : top.status === 'input' ? 'It waited most for this.' : top.status === 'blocked' || top.status === 'noroute' ? 'Nothing took its goods away fast enough.' : 'Its network gave it less than it needed.';
    out.push(h('div', { class: 'fac' }, h('b', null, icon(item ?? (top.status === 'input' ? top.type : 'bolt'), 24), what), h('span', { class: 'big cd-bad' }, pct(top.share)),
      h('div', { class: 'full' }, h('div', { class: 'cd-bar', style: `--v: ${top.share}; --col: var(--rust)` }, h('i')), h('div', { class: 'cd-small' }, fact))));
    next = top.status === 'input' ? `more ${top.need.split(' (')[0]} reaching the ${lcBuilding(top.type)} would have shortened the run most.`
      : top.status === 'blocked' || top.status === 'noroute' ? `taking ${top.need} away from the ${lcBuilding(top.type)} sooner would have kept it working.`
        : `more power for the ${lcBuilding(top.type)} would have kept it working.`;
  }
  const nights = run.nights.filter((n) => timeOf(n.day, s.scenario.weather.sunset) < end), short = nights.filter((n) => n.short > 0);
  if (nights.length) {
    const types = [...new Set(short.flatMap((n) => n.types))].map((t, k) => (k ? lcBuilding(t) : BUILDINGS[t].name));
    out.push(h('div', { class: 'fac' }, h('b', null, icon('moon', 24), 'Nights short of power'), h('span', { class: 'big' }, String(short.length), h('small', null, ` of ${nights.length}`)),
      h('div', { class: 'full' }, h('div', { class: 'nights' }, ...nights.map((n) => h('i', { class: n.short > 0 ? 'is-short' : '' }))),
        h('div', { class: 'cd-small' }, short.length ? `${types.length ? `${types.length > 1 ? `${types.slice(0, -1).join(', ')} and ${types[types.length - 1]}` : types[0]} went short` : 'Networks went short'} for ${playTime(short.reduce((a, n) => a + n.short, 0))} of play in all, at night.` : 'No night was short of power.'))));
    if (!next && short.length > nights.length / 2) next = 'more power stored for the night would have kept the machines running.';
  }
  if (run.trucks.total > 0) {
    const idle = run.trucks.wait / run.trucks.total, at = Object.entries(run.trucks.at).sort((a, b) => b[1] - a[1])[0];
    out.push(h('div', { class: 'fac' }, h('b', null, icon('truck', 24), 'Trucks idle'), h('span', { class: 'big' }, pct(idle)),
      h('div', { class: 'full' }, h('div', { class: 'cd-bar', style: `--v: ${idle}; --col: var(--ink-3)` }, h('i')),
        h('div', { class: 'cd-small' }, at ? `Waiting at stops, most at the ${lcBuilding(at[0] as keyof typeof BUILDINGS)}.` : 'They rarely waited at a stop.'))));
  }
  if (next) out.push(h('div', { class: 'cd-small next' }, h('b', null, 'Next time'), ` · ${next}`));
  return out;
}

export function resultsScreen(s: GameState, medalWon: Medal, host: ResultsHost) {
  const sc = s.scenario, end = s.completedAt ?? s.time, par = sc.par, i = CAMPAIGN.findIndex((c) => c.id === sc.id);
  const next = i >= 0 ? CAMPAIGN[i + 1] ?? null : null;
  const lead = medalWon === 'gold' ? `${playTime(par - end)} inside gold` : medalWon === 'silver' ? `gold needs ${playTime(par)}: ${playTime(end - par)} faster` : `silver needs ${playTime(par * SILVER_PAR)}: ${playTime(end - par * SILVER_PAR)} faster`;
  const delivered = (Object.keys(s.delivered) as ItemId[]).filter((k) => s.delivered[k]).sort((a, b) => (s.delivered[b] ?? 0) * ITEMS[b].price - (s.delivered[a] ?? 0) * ITEMS[a].price);
  const item = goalGood(sc), goal = sc.goals.find((g) => g.kind === 'deliver');
  const trees = countTrees(s) - s.initialTrees, saplings = s.buildings.filter((b) => b.type === 'sapling').length, soil = soilHealth(s), soilGoal = sc.goals.find((g) => g.kind === 'soil');
  // Left better: no fewer trees, the valley's soil in all at least what it started at (wherever fields stood, now or before),
  // and the soil goal (if any) met.
  const soilKept = s.map.fertility.reduce((n, f, i) => n + f - s.soilBase[i], 0) >= 0;
  const better = trees >= 0 && soilKept && (!soilGoal || soilGoal.kind !== 'soil' || soil >= soilGoal.min);
  return h('div', { class: 'results' },
    h('div', { class: 'glow' }),
    h('div', { class: 'hero' },
      h('span', { class: `cd-medal big${medalWon === 'silver' ? ' is-silver' : medalWon === 'bronze' ? ' is-bronze' : ''}` }, icon('medal', 76, 'white')),
      h('div', { class: 'cd-label' }, `${MEDAL_NAME[medalWon]} · ${i >= 0 ? `commission ${i + 1}` : 'commission'} complete`),
      h('h1', { class: 'cd-display' }, sc.name),
      h('div', { class: 'time' },
        h('div', { class: 'num' }, h('div', { class: 'v' }, playTime(end)), h('div', { class: 'sub' }, lead)),
        h('div', { class: 'line' },
          h('div', { class: 'cd-bar', style: `--v: ${Math.min(1, end / (par * SILVER_PAR))}; --col: var(--medal-${medalWon === 'gold' ? 'gold' : medalWon === 'silver' ? 'silver' : 'bronze'})` }, h('i'),
            h('span', { class: 'cd-bar__mark', style: `left: ${(100 / SILVER_PAR).toFixed(2)}%` }), h('span', { class: 'cd-bar__mark is-silver', style: 'left: calc(100% - 3px)' })),
          h('div', { class: 'ticks' }, h('span', null, '0:00'), h('span', { class: 'gold' }, `gold ${playTime(par)}`), h('span', null, `silver ${playTime(par * SILVER_PAR)}`))))),
    h('div', { class: 'cd-receipt' },
      h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, 'Freight depot · receipt'), icon('depot', 30)),
      h('div', { class: 'cd-small' }, `${sc.name} · 0:00 to ${playTime(end)}`),
      h('div', { class: 'rows' }, ...delivered.slice(0, 8).map((k) => h('div', { class: 'cd-receipt__row' }, icon(k), h('span', null, ITEMS[k].name),
        h('span', { class: 'cd-small' }, `${num(s.delivered[k] ?? 0)} × ${ITEMS[k].price}`), h('b', null, num((s.delivered[k] ?? 0) * ITEMS[k].price))))),
      delivered.length > 8 ? h('div', { class: 'cd-small' }, `and ${delivered.length - 8} more goods`) : null,
      h('div', { class: 'cd-receipt__total' }, h('span', null, 'Earned'), h('span', null, `${num(s.earned)} credits`))),
    h('div', { class: 'cd-card run' },
      h('div', null,
        h('div', { class: 'row-head' }, h('div', null, h('div', { class: 'cd-label', style: 'color: var(--ochre)' }, 'The run'),
          h('h2', { class: 'cd-title', style: 'margin-top: 8px' }, item && goal && goal.kind === 'deliver' ? `${goal.n} ${itemName(item)} over ${Math.round(end / 60)} minutes` : `${Math.round(end / 60)} minutes`)),
        h('span', { class: 'cd-small legend' }, item ? `${itemName(item)} delivered · nights shaded` : 'nights shaded', h('i', { class: 'short' }), 'night short of power')),
        item ? runChart(s, end) : h('p', { class: 'cd-small' }, 'No good to chart.')),
      h('div', { class: 'sep' }),
      h('div', { class: 'diff' },
        h('div', { class: 'cd-label', style: 'color: var(--ochre)' }, 'What made the difference'),
        ...differences(s, end),
        h('span', { class: 'fill' }),
        h('div', { class: 'cd-inset valley' },
          gauge({ v: soil / 100, d: 64, w: 6, col: 'var(--tide)', inner: [h('b', null, String(Math.round(soil)))] }),
          h('div', { class: 'fill' }, h('div', { class: 'cd-label', style: 'color: var(--pine)' }, better ? 'The valley, left better' : 'The valley, after the run'),
            h('div', { class: 'what' }, `Soil ${Math.round(soil)} at the end · trees ${trees >= 0 ? '+' : ''}${trees}`),
            h('div', { class: 'cd-small' }, [soilGoal && soilGoal.kind === 'soil' ? `Goal was ${soilGoal.min}+.` : '', saplings ? `${saplings} sapling${saplings > 1 ? 's' : ''} still growing.` : ''].filter(Boolean).join(' '))),
          icon('sapling', 40)))),
    h('div', { class: 'buttons' },
      h('button', { class: 'cd-btn is-lg', onclick: host.keepPlaying }, 'Keep playing'),
      next ? h('button', { class: 'cd-btn is-primary is-lg', onclick: () => host.start(next.id) }, `Next commission · ${next.name}`, icon('play', 14, 'inv')) : null,
      h('button', { class: 'cd-btn is-lg', onclick: host.menu }, 'Level select')));
}

