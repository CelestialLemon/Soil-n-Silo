import type { Range } from '../game/outlook.ts';
import { hasStation, stationFault, stationForecast, FAULT_WORDS } from '../game/station.ts';
import type { GameState } from '../game/state.ts';
import { DAY_SECONDS } from '../game/data.ts';
import { h, icon, rebuild } from './dom.ts';
import { forecastView, type ConditionWords, type DayView, type EventRow, type ForecastView } from './forecastWords.ts';
import { tip } from './keyhints.ts';

// The forecast panel: what the weather station tells, as a HUD sheet like the Power panel. Three days (today and the ones the forecast
// lists), each a column: the day's high and low as ranges, its sun, wind and rain as sharp as the forecast allows, and the events with their
// windows. A hard turn and a kind turn differ by a shape (a triangle, a circle) and a word as well as colour. An out-of-date forecast says so
// and from when, and drops the times already past. Facts only: what will happen, never what to build.

export interface ForecastHost {
  state(): GameState;
  /** Opens the guide on how to read the forecast. */
  openGuide: () => void;
  close: () => void;
}

/** A bar over a track that marks where a range lies between 0 and `max`. */
function bar(r: Range, max: number, label: string) {
  const lo = Math.max(0, Math.min(1, r.lo / max)), hi = Math.max(lo, Math.min(1, r.hi / max));
  return h('span', { class: 'fc-bar', role: 'img', 'aria-label': label }, h('i', { style: `left: ${(lo * 100).toFixed(1)}%; width: ${Math.max(3, (hi - lo) * 100).toFixed(1)}%` }));
}

function conditionRows(c: ConditionWords) {
  const row = (ic: string, name: string, words: string, r: Range, max: number, note?: string) =>
    h('div', { class: 'fc-cond' }, icon(ic, 22), h('div', null, h('div', { class: 'fc-cond-top' }, h('span', { class: 'cd-label' }, name), h('b', null, words)), bar(r, max, `${name}: ${words}`),
      note ? h('div', { class: 'cd-small' }, note) : null));
  return [
    row('sun', 'Sun', c.sun, c.ranges.sun, 1),
    row('wind', 'Wind', c.wind, c.ranges.wind, 1, `strongest hour: ${c.gusts}`),
    row('water', c.snow ? 'Snow' : 'Rain', c.rain, c.ranges.rain, 24),
  ];
}

function eventCard(e: EventRow) {
  // A hard turn is a triangle on a sharp-cornered card, a kind turn a circle on a rounded one: told apart without colour.
  const tag = h('span', { class: `fc-tag ${e.good ? 'is-kind' : 'is-hard'}` }, e.good ? h('i', { class: 'fc-dot', 'aria-hidden': 'true' }) : icon('warn', 16), e.tag);
  return h('div', { class: `fc-ev ${e.good ? 'is-kind' : 'is-hard'}` },
    h('div', { class: 'fc-ev-head' }, tag),
    h('div', { class: 'fc-ev-name' }, h('b', null, e.name), h('span', null, `, ${e.certainty}`)),
    h('div', { class: 'fc-ev-when' }, e.when),
    ...e.lines.map((l) => h('div', { class: 'cd-small' }, l)));
}

function dayColumn(d: DayView) {
  return h('section', { class: 'fc-day' },
    h('div', { class: 'fc-day-head' }, h('b', null, d.name), d.sub ? h('span', { class: 'cd-small' }, d.sub) : null),
    h('div', { class: 'fc-temps' },
      h('div', null, h('span', { class: 'cd-label' }, 'High'), h('b', null, d.high)),
      h('div', null, h('span', { class: 'cd-label' }, 'Low'), h('b', null, d.low))),
    d.conditions ? h('div', { class: 'fc-conds' }, ...conditionRows(d.conditions))
      : h('p', { class: 'cd-small fc-far' }, 'Sun, wind and rain are not told this far ahead.'),
    h('div', { class: 'cd-label fc-evs-label' }, 'Events'),
    ...(d.events.length ? d.events.map(eventCard) : [h('p', { class: 'cd-small' }, 'None told for this day yet.')]));
}

function body(v: ForecastView) {
  return [
    v.stale ? h('div', { class: 'fc-stale', role: 'status' }, icon('warn', 22), h('div', null, h('b', null, v.stale), h('div', { class: 'cd-small' }, 'This is what it last said. Times already past are dropped from it, and it does not narrow until the station renews it.'))) : null,
    h('div', { class: 'fc-days' }, ...v.days.map(dayColumn)),
    v.rest.length ? h('section', { class: 'fc-rest' }, h('div', { class: 'cd-label' }, 'Also in the forecast'), h('div', { class: 'fc-rest-list' }, ...v.rest.map(eventCard))) : null,
    h('p', { class: 'cd-small fc-note' }, 'What happens always falls inside these ranges; they narrow as the day comes. An event that is not listed is not told yet, not ruled out.'),
  ];
}

export function forecastSheet(host: ForecastHost) {
  const content = h('div', { class: 'fc-content' });
  const meta = h('div', { class: 'fc-meta' });
  let seen = '', shown: object | null = null;
  const el = h('div', { class: 'cd-sheet fc-sheet' },
    h('div', { class: 'cd-sheet__head' },
      h('div', null, h('div', { class: 'cd-label' }, 'Weather station'), h('h1', { class: 'cd-display' }, 'Forecast')),
      h('span', { class: 'fill' }),
      meta,
      h('button', { class: 'cd-btn', onclick: host.openGuide }, icon('book', 18), 'How to read it'),
      h('button', { class: 'cd-btn is-icon', title: tip('Close', 'Esc'), 'aria-label': 'Close', onclick: host.close }, icon('close', 16))),
    h('div', { class: 'sheet-body' }, content));

  const update = () => {
    const s = host.state();
    if (!hasStation(s)) { host.close(); return; }
    const sf = stationForecast(s);
    if (!sf) {
      const fault = stationFault(s);
      meta.replaceChildren();
      seen = ''; shown = null;
      rebuild(content, `none|${fault}`, () => [h('div', { class: 'fc-stale', role: 'status' }, icon('warn', 22),
        h('div', null, h('b', null, fault ? `No forecast yet: ${FAULT_WORDS[fault]}` : 'No forecast yet'), h('div', { class: 'cd-small' }, 'The station gives its first forecast once it has power.')))]);
      return;
    }
    // Redrawn when the forecast, its state or the ten minutes it is read in changes (the past is dropped as the time goes by).
    const key = `${sf.issued}|${sf.stale}|${sf.reason}|${Math.floor(s.time / (DAY_SECONDS / 144) + 1e-6)}`;
    if (key === seen && sf.forecast === shown) return;
    seen = key; shown = sf.forecast;
    const v = forecastView(sf, s.time);
    meta.replaceChildren(h('div', { class: 'cd-small' }, `${sf.stale ? 'From' : 'Issued'} ${v.issued}`), h('div', { class: 'cd-small' }, `looks ahead to ${v.until}`));
    delete content.dataset.key;
    content.replaceChildren(...body(v).filter((n): n is HTMLElement => n !== null));
  };
  update();
  return { el, update };
}
