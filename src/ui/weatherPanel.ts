import { EVENT_KINDS, EVENTS, eventName, eventNow, type EventKind, type Strength } from '../game/events.ts';
import { SEASON_IDS, SEASONS } from '../game/seasons.ts';
import type { GameState } from '../game/state.ts';
import { h, icon } from './dom.ts';
import { tip } from './keyhints.ts';

// The sandbox's weather control: a sheet listing every weather event with a button for each strength, to try a layout against
// a storm. Starting one ends what is under way and drops what was ahead; the sky clears from there.

export interface WeatherHost {
  state(): GameState;
  /** Starts an event now. */
  start(kind: EventKind, strength: Strength): void;
  clear(): void;
  close: () => void;
}

/** The seasons an event comes in, in words ("spring, summer"). */
const seasonsOf = (kind: EventKind) => SEASON_IDS.filter((x) => (EVENTS[kind].seasons[x] ?? 0) > 0).map((x) => SEASONS[x].name.toLowerCase()).join(', ');

/** What gates an event on its character, if anything ("hard winters only"). */
const onlyIn = (kind: EventKind) => (EVENTS[kind].only ? ` · ${EVENTS[kind].only.join(', ')} only` : '');

export function weatherSheet(host: WeatherHost) {
  const row = (kind: EventKind) => {
    const e = EVENTS[kind], hours = e.hours[0] === e.hours[1] ? `${e.hours[0]}` : `${e.hours[0]}–${e.hours[1]}`;
    const btn = (strength: Strength) => h('button', { class: `cd-btn${strength === 'severe' ? ' is-danger' : ''}`, onclick: () => host.start(kind, strength) },
      strength === 'severe' ? eventName(kind, 'severe') : 'Start');
    return h('div', { class: 'wx-row' },
      h('div', { class: 'wx-name' }, h('b', null, e.name), h('span', { class: 'cd-small' }, `${seasonsOf(kind)}${onlyIn(kind)} · ${hours} hours`)),
      h('div', { class: 'wx-go' }, btn('ordinary'), e.severe ? btn('severe') : null));
  };
  const now = h('span', { class: 'cd-small' });
  const update = () => { const ev = eventNow(host.state().scenario, host.state().time); now.textContent = ev ? `Under way: ${eventName(ev.kind, ev.strength)}` : 'The sky has no event under way.'; };
  const el = h('div', { class: 'cd-sheet weather' },
    h('div', { class: 'cd-sheet__head' },
      h('div', null, h('div', { class: 'cd-label' }, 'Sandbox'), h('h1', { class: 'cd-display' }, 'Weather')),
      h('span', { class: 'fill' }),
      h('button', { class: 'cd-btn', onclick: () => host.clear() }, 'Clear the weather'),
      h('button', { class: 'cd-btn is-icon', title: tip('Close', 'Esc'), 'aria-label': 'Close', onclick: host.close }, icon('close', 16))),
    h('div', { class: 'sheet-body' },
      h('div', { class: 'cd-small wx-now' }, now, ' Starting one ends the one under way.'),
      h('div', { class: 'cd-label wx-group' }, 'Hard turns'),
      ...EVENT_KINDS.filter((k) => !EVENTS[k].good).map(row),
      h('div', { class: 'cd-label wx-group' }, 'Kind turns'),
      ...EVENT_KINDS.filter((k) => EVENTS[k].good).map(row)));
  update();
  return { el, update };
}

