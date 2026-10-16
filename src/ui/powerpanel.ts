import { BUILDINGS, POWER, TRUCK, type BuildingId } from '../game/data.ts';
import { gameSpan, tonight } from '../game/forecast.ts';
import { networks, usedBy } from '../game/power.ts';
import { HOUR_SECONDS, nightsOf, powerDay } from '../game/powerlog.ts';
import { dayAt, hourAt, sunAt } from '../game/sim/clock.ts';
import { exposureOf, nearWater } from '../game/sim/layout.ts';
import { shareOf, wants } from '../game/sim/energy.ts';
import type { BatteryBuilding, GameState, MachineBuilding } from '../game/state.ts';
import { netColour } from '../world/powerView.ts';
import { NET_COLOURS } from '../world/shapes.ts';
import { fill, h, icon, svg } from './dom.ts';
import { clock, clockAt, dec, hex, pct, plural, watts } from './format.ts';
import { keyNames, tip } from './keyhints.ts';

// The Power panel (W): what is made, used and stored now; power by source over the last 24 in-game hours as a radial chart
// (an hour a slice, night shaded, short hours marked); each network; tonight's charge until sunrise if use stays as it is
// now; the sources on average; where the watts go, by kind of building; and each night's battery record. Watts throughout,
// never energy: a game day is four minutes of play.

export interface PowerHost {
  state(): GameState;
  close: () => void;
}

const SRC: { key: 'solar' | 'wind' | 'digester' | 'given' | 'short'; col: string; name: string }[] = [
  { key: 'solar', col: '#c08a2e', name: 'solar' }, { key: 'wind', col: '#3d7a91', name: 'wind' }, { key: 'digester', col: '#8a6a4a', name: 'digester' },
  { key: 'given', col: '#76608f', name: 'from batteries' }, { key: 'short', col: '#b4523a', name: 'short' },
];

/** An annular wedge from angle a0 to a1 (radians, clockwise from the top) between radii r0 and r1, round (cx, cy). */
function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${(cx + r * Math.sin(a)).toFixed(1)},${(cy - r * Math.cos(a)).toFixed(1)}`;
  return `M ${p(r0, a0)} L ${p(r1, a0)} A ${r1} ${r1} 0 0 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
}

/** Power by source over the last 24 hours, an hour a slice round a clock face (midnight at the top). */
function radial(s: GameState) {
  const day = powerDay(s), C = 300, R0 = 78, R1 = 258;
  const top = Math.max(10, ...day.hours.map((x) => (x ? Math.max(x.made + x.given + x.short, x.used) : 0)));
  const r = (v: number) => R0 + (v / top) * (R1 - R0);
  const parts: SVGElement[] = [];
  const hourAngle = (hour: number) => (hour / 24) * Math.PI * 2;
  day.hours.forEach((x, i) => {
    if (!x) return;
    const hour = Math.floor(hourAt(x.from) + 1e-6), a0 = hourAngle(hour) + 0.01, a1 = hourAngle(hour + 1) - 0.01;
    if (x.night) parts.push(svg('path', { d: wedge(C, C, R0, R1, a0 - 0.01, a1 + 0.01), class: 'night' }));
    let at = 0;
    for (const src of SRC) {
      const v = x[src.key];
      if (v <= 0.01) continue;
      parts.push(svg('path', { d: wedge(C, C, r(at), r(at + v), a0, a1), fill: src.col, opacity: i === 23 ? 1 : 0.92 }));
      at += v;
    }
  });
  // What was used, as a line round the slices.
  const used: string[] = [];
  day.hours.forEach((x) => {
    if (!x) return;
    const hour = Math.floor(hourAt(x.from) + 1e-6);
    for (const a of [hourAngle(hour), hourAngle(hour + 1)]) used.push(`${(C + r(x.used) * Math.sin(a)).toFixed(1)},${(C - r(x.used) * Math.cos(a)).toFixed(1)}`);
  });
  if (used.length) parts.push(svg('polyline', { points: used.join(' '), class: 'used' }));
  // The scale, the hours, now.
  for (const f of [0.5, 1]) parts.push(svg('circle', { cx: C, cy: C, r: r(top * f), class: 'grid' }), svg('text', { x: C + 5, y: C - r(top * f) + 14, class: 'halo' }, watts(top * f)));
  for (let hr = 0; hr < 24; hr += 3) {
    const a = hourAngle(hr), rr = R1 + 26;
    parts.push(svg('text', { x: C + rr * Math.sin(a), y: C - rr * Math.cos(a) + 4, 'text-anchor': 'middle', class: hr % 6 ? '' : 'strong' }, String(hr).padStart(2, '0')));
  }
  const nowA = hourAngle(hourAt(s.time));
  parts.push(svg('line', { x1: C + R0 * Math.sin(nowA), y1: C - R0 * Math.cos(nowA), x2: C + (R1 + 10) * Math.sin(nowA), y2: C - (R1 + 10) * Math.cos(nowA), class: 'now' }));
  parts.push(svg('text', { x: C, y: C - 12, 'text-anchor': 'middle', class: 'centre' }, day.seconds ? '24 h' : '–'),
    svg('text', { x: C, y: C + 14, 'text-anchor': 'middle', class: 'strong' }, `${watts(day.avg.made)} made`),
    svg('text', { x: C, y: C + 32, 'text-anchor': 'middle' }, `${watts(day.avg.used)} used, on average`));
  return svg('svg', { class: 'cd-chart radial', viewBox: '0 0 600 600', width: 560, height: 560, 'aria-label': 'Power by source, hour by hour, over the last 24 hours' }, ...parts);
}

/** Tonight's charge until an hour after sunrise, if use stays as it is now. */
function tonightCard(s: GameState) {
  const t = tonight(s);
  if (!t) return h('div', { class: 'cd-inset tonight' }, h('div', { class: 'cd-label', style: 'color: var(--tide)' }, 'Tonight'),
    h('p', { class: 'cd-small' }, 'No batteries: at night the networks have only what the wind and the digesters make.'));
  const W = 420, H = 120, t0 = t.points[0].t, t1 = t.points[t.points.length - 1].t;
  const x = (tt: number) => ((tt - t0) / (t1 - t0)) * W, y = (k: number) => H - k * H;
  const nightA = t.sunset ?? t0;
  const ticks: number[] = [];
  for (let k = Math.ceil(hourAt(t0) / 3) * 3; ; k += 3) { const tt = t0 + ((k - hourAt(t0)) * HOUR_SECONDS); if (tt > t1) break; ticks.push(tt); }
  const peak = t.sunset !== null && t.peak.t > t0 + 1 ? `The charge tops out at ${pct(t.peak.k)} near ${clockAt(t.peak.t)}.` : '';
  return h('div', { class: 'cd-inset tonight' },
    h('div', { class: 'row-head' }, h('span', { class: 'cd-label', style: 'color: var(--tide)' }, 'Tonight'), h('span', { class: 'cd-small' }, 'charge, if use stays as it is now')),
    h('div', { class: 'fact3' },
      h('div', null, h('b', { class: t.dryAt ? 'cd-bad' : 'cd-good' }, t.dryAt ? clockAt(t.dryAt) : 'held'), h('small', null, t.dryAt ? 'batteries run dry' : `they last the night`)),
      h('div', null, h('b', null, t.dryAt ? watts(t.shortAfter) : `${pct(Math.min(...t.points.filter((p) => p.t <= t.sunrise).map((p) => p.k)))}`), h('small', null, t.dryAt ? 'short after that, on average' : 'lowest before sunrise')),
      h('div', null, h('b', null, t.dryAt ? gameSpan(t.shortFor) : clockAt(t.sunrise)), h('small', null, t.dryAt ? `short, until sunrise at ${clockAt(t.sunrise)}` : 'sunrise'))),
    svg('svg', { class: 'cd-chart', viewBox: `-36 -8 ${W + 48} ${H + 34}`, width: '100%' },
      svg('rect', { x: x(nightA), y: 0, width: Math.max(0, x(t.sunrise) - x(nightA)), height: H, class: 'night' }),
      ...[0, 0.5, 1].map((k) => svg('line', { x1: 0, x2: W, y1: y(k), y2: y(k), class: 'grid' })),
      ...[[1, '100%'], [0.5, '50'], [0, '0']].map(([k, l]) => svg('text', { x: -8, y: y(k as number) + 4, 'text-anchor': 'end' }, String(l))),
      svg('polyline', { points: t.points.map((p) => `${x(p.t).toFixed(1)},${y(p.k).toFixed(1)}`).join(' '), class: 'charge' }),
      svg('circle', { cx: 0, cy: y(t.points[0].k), r: 4, class: 'dot' }),
      t.dryAt ? svg('circle', { cx: x(t.dryAt), cy: y(0), r: 5, class: 'dry' }) : null,
      ...ticks.map((tt) => svg('text', { x: x(tt), y: H + 22, 'text-anchor': 'middle' }, clockAt(tt)))),
    h('div', { class: 'cd-small' }, `${pct(t.points[0].k)} now. ${peak}`));
}

export function powerSheet(host: PowerHost) {
  const s = host.state(), el = h('div', { class: 'cd-sheet power' });
  let last = -Infinity;
  const update = () => {
    if (performance.now() - last < 1000) return;
    last = performance.now();
    const nets = networks(s).list, made = nets.reduce((n, x) => n + x.made, 0), used = nets.reduce((n, x) => n + usedBy(x), 0);
    const bats = s.buildings.filter((b): b is BatteryBuilding => b.type === 'battery' && networks(s).of.has(b.id)), cap = bats.length * POWER.battery.capacity, stored = bats.reduce((n, b) => n + b.charge, 0);
    const day = powerDay(s), nights = nightsOf(s);
    // Where the watts go: each kind of building that draws power, over the day and now.
    const types = (Object.keys(BUILDINGS) as BuildingId[]).filter((t) => BUILDINGS[t].power && s.buildings.some((b) => b.type === t));
    const nowOf = (t: BuildingId) => s.buildings.filter((b) => b.type === t && networks(s).of.has(b.id)).reduce((n, b) => n + wants(s, b) * shareOf(s, b), 0);
    const totalUse = Math.max(1e-9, ...types.map((t) => day.use[t] ?? 0));
    const sub = (t: BuildingId) => {
      const mine = s.buildings.filter((b) => b.type === t);
      if (t === 'garage') return `${plural(s.trucks.length, 'truck')}, ${TRUCK.chargeRate} W a truck charging`;
      if (t === 'sprinkler') { const far = mine.filter((b) => !nearWater(s, b)).length; return far ? `${far} far from water, ${POWER.sprinklerFar} W each` : `near water, ${POWER.sprinklerNearWater} W each`; }
      return `${BUILDINGS[t].power} W while working`;
    };
    const lastNight = nights.length ? nights[nights.length - 1] : null;
    const solar = s.buildings.filter((b) => b.type === 'solar').length, turbines = s.buildings.filter((b) => b.type === 'turbine'), digesters = s.buildings.filter((b): b is MachineBuilding => b.type === 'digester');
    const sheltered = turbines.filter((b) => exposureOf(s, b) < 1).length;
    const peak = day.hours.reduce<{ v: number; t: number } | null>((m, x) => (x && (!m || x.solar > m.v) ? { v: x.solar, t: x.from } : m), null);
    fill(el,
      h('div', { class: 'cd-sheet__head' }, icon('bolt', 48),
        h('div', null, h('div', { class: 'cd-label' }, `${s.scenario.name} · day ${dayAt(s.time)}, ${clock(hourAt(s.time))}`), h('h1', { class: 'cd-display' }, 'Power')),
        h('span', { class: 'fill' }),
        h('div', { class: 'pw-read' }, h('b', null, watts(made)), h('small', null, 'made now')),
        h('div', { class: 'pw-read' }, h('b', null, watts(used)), h('small', null, 'used now')),
        h('div', { class: 'pw-read' }, h('b', null, cap ? pct(stored / cap) : '–'), h('small', null, `stored · ${plural(bats.length, 'battery', 'batteries')}`)),
        h('button', { class: 'cd-btn is-icon', title: tip('Close', ...keyNames('power'), 'Esc'), 'aria-label': 'Close', onclick: host.close }, icon('close', 18))),
      h('div', { class: 'sheet-body pw-body' },
        h('div', { class: 'pw-col' },
          h('div', { class: 'row-head' }, h('span', { class: 'cd-label', style: 'color: var(--ochre)' }, 'Power by source · the last 24 hours'), h('span', { class: 'cd-small' }, 'each hour a slice')),
          h('div', { class: 'pw-leg' }, ...SRC.map((x) => h('span', null, h('i', { style: `background: ${x.col}` }), x.name)),
            h('span', null, h('i', { class: 'line' }), 'used'), h('span', null, h('i', { class: 'nightkey' }), 'night')),
          radial(s),
          h('div', { class: 'cd-small' }, day.seconds < 230 ? `Recorded over the last ${gameSpan(day.seconds)} of in-game time: the chart fills as the day goes on.`
            : lastNight && lastNight.lowest !== null ? `Last night the batteries ${lastNight.dryAt ? `ran dry at ${clockAt(lastNight.dryAt)}` : 'never ran dry'}, lowest ${pct(lastNight.lowest)} at ${clockAt(lastNight.lowestAt)}. ${day.hours.filter((x) => x && x.short > 0.5).length ? `${plural(day.hours.filter((x) => x && x.short > 0.5).length, 'hour')} short in the last day.` : 'No hour was short.'}`
              : `${day.hours.filter((x) => x && x.short > 0.5).length} hours short in the last day.`)),
        h('div', { class: 'pw-col spread' },
          h('div', null,
            h('div', { class: 'row-head' }, h('span', { class: 'cd-label', style: 'color: var(--ochre)' }, 'Networks'), h('span', { class: 'cd-small' }, 'one row per network')),
            h('div', { class: 'net is-hd' }, h('span', null, 'Network'), h('span', null, 'Made'), h('span', null, 'Used'), h('span', null, 'Stored'), h('span', null, 'Short')),
            ...(nets.length ? nets.map((n, i) => h('div', { class: 'net is-row' },
              h('div', { class: 'nm' }, h('i', { class: 'sw', style: `background: ${hex(NET_COLOURS[netColour(s, n)])}` }),
                h('div', null, h('b', null, `Network ${i + 1}`), h('div', { class: 'cd-small' }, `${plural(n.pylons.length, 'pylon')} · ${plural(n.members.filter((b) => BUILDINGS[b.type].power).length, 'building')} draw${n.members.filter((b) => BUILDINGS[b.type].power).length === 1 ? 's' : ''}`))),
              h('span', { class: 'v' }, watts(n.made)), h('span', { class: 'v' }, watts(usedBy(n))), h('span', { class: 'v' }, n.capacity ? pct(n.stored / n.capacity) : '–'),
              h('span', { class: `v${n.share < 1 && n.wanted > 0 ? ' cd-bad' : ''}` }, watts(n.wanted * (1 - n.share))))) : [h('p', { class: 'cd-small' }, 'No pylons yet: a network is a set of linked pylons.')]),
            nets.length === 1 ? h('div', { class: 'cd-small note' }, 'The only network: every powered building that reaches a pylon is on it.') : null),
          tonightCard(s),
          h('div', null,
            h('div', { class: 'cd-label', style: 'color: var(--ochre)' }, `Sources · average over ${day.seconds >= 230 ? '24 h' : gameSpan(day.seconds)}`),
            h('div', { class: 'src' },
              h('div', null, icon('solar', 30), h('b', null, watts(day.avg.solar)), h('small', null, solar ? `${plural(solar, 'panel')}${peak && peak.v > 0.5 ? ` · peak ${watts(peak.v)} at ${clockAt(peak.t)}` : ''}` : 'no panels')),
              h('div', null, icon('turbine', 30), h('b', null, watts(day.avg.wind)), h('small', null, turbines.length ? `${plural(turbines.length, 'turbine')}${sheltered ? `, ${sheltered} sheltered` : ''}` : 'no turbines')),
              h('div', null, icon('digester', 30), h('b', null, watts(day.avg.digester)), h('small', null, digesters.length ? `${plural(digesters.length, 'digester')}${digesters.some((b) => b.progress !== null) ? ', burning' : ', idle'}` : 'no digester')),
              h('div', null, icon('battery', 30), h('b', null, watts(day.avg.given)), h('small', null, `given · ${watts(day.avg.taken)} taken in`))))),
        h('div', { class: 'pw-col spread' },
          h('div', null,
            h('div', { class: 'row-head' }, h('span', { class: 'cd-label', style: 'color: var(--ochre)' }, 'Where the watts go'), h('span', { class: 'cd-small' }, 'average over the day · now')),
            ...(types.length ? types.sort((a, b) => (day.use[b] ?? 0) - (day.use[a] ?? 0)).map((t) => {
              const n = s.buildings.filter((b) => b.type === t).length;
              return h('div', { class: 'wg' }, icon(t, 30), h('span', { class: 'nm' }, `${BUILDINGS[t].name}${n > 1 ? ` × ${n}` : ''}`, h('small', null, sub(t))),
                h('span', { class: 'val' }, watts(day.use[t] ?? 0), h('small', null, `${dec(nowOf(t))} now`)),
                h('div', { class: 'cd-bar', style: `--v: ${(day.use[t] ?? 0) / totalUse}; --col: var(--ink-2); height: 6px` }, h('i')));
            }) : [h('p', { class: 'cd-small' }, 'Nothing draws power yet.')]),
            types.length ? h('div', { class: 'cd-small note' }, `${watts(day.avg.used)} on average.`) : null),
          h('div', null,
            h('div', { class: 'row-head' }, h('span', { class: 'cd-label', style: 'color: var(--ochre)' }, 'Battery health'), h('span', { class: 'cd-small' }, `each night, ${clock(s.scenario.weather.sunset)} to ${clock(s.scenario.weather.sunrise)}`)),
            ...(nights.length && cap ? nights.map((n) => {
              const len = (24 - s.scenario.weather.sunset + s.scenario.weather.sunrise) * HOUR_SECONDS, k = n.dryAt === null ? Math.min(1, n.seconds / len) : (n.dryAt - n.from) / len;
              const after = n.dryAt === null ? 0 : Math.max(0, Math.min(1, n.seconds / len) - k);
              return h('div', { class: 'bh' }, h('span', { class: 'nt' }, n === nights[nights.length - 1] && sunAt(s.scenario, s.time) <= 0 ? 'Tonight' : `Day ${n.day}`),
                h('span', { class: 'tr' }, h('i', { style: `width: ${k * 100}%` }), h('u', { style: `left: ${k * 100}%; width: ${after * 100}%` })),
                h('span', { class: `end${n.dryAt ? ' cd-bad' : ' cd-good'}` }, n.dryAt ? `dry ${clockAt(n.dryAt)}` : n.lowest !== null ? `held · ${pct(n.lowest)} left` : 'held'));
            }) : [h('p', { class: 'cd-small' }, cap ? 'No night recorded yet.' : 'No batteries.')]),
            nights.some((n) => n.dryAt) ? h('div', { class: 'cd-small note' }, `Ran dry: ${nights.flatMap((n) => (n.dryAt ? [clockAt(n.dryAt)] : [])).join(', ')}.`) : null))));
  };
  update();
  return { el, update };
}
