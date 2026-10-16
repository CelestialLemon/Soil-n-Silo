import { POWER } from '../game/data.ts';
import { networks, usedBy } from '../game/power.ts';
import { dayAt, hourAt } from '../game/sim/clock.ts';
import type { BatteryBuilding, GameState, Status } from '../game/state.ts';
import { must } from '../game/result.ts';
import { ACTIONS, GROUPS, type GroupId } from '../keybindings.ts';
import { h, icon } from './dom.ts';
import { clock, itemName, num, pct, playTime, watts } from './format.ts';
import { commissionLabel } from './playhud.ts';
import { keyNames } from './keyhints.ts';
import type { SettingsStore } from './settings.ts';
import { goalIcon, goalNow, goalWords, medalTimes, statusPill } from './widgets.ts';

// The pause screen: resume, where the commission stands, the level select and restart (restart asks twice and says what it
// loses); the way to the settings; what the markers mean (a shape and a word); and the keys, the one place they are printed.

export interface PauseHost {
  state(): GameState;
  settings: SettingsStore;
  resume(): void;
  menu(): void;
  restart(): void;
  openSettings(): void;
}

const MARKERS: [Status, string, string][] = [
  ['ok', 'Working', 'making goods'], ['idle', 'Idle', 'nothing to do'], ['input', 'Waiting for input', 'a good is short'],
  ['flowers', 'No flowers near', 'hive, no flowering field in reach'], ['blocked', 'Blocked', 'output store full'],
  ['lowpower', 'Low power', 'gets a share of what it needs'], ['power', 'No power', 'its network has none'],
  ['nolink', 'Not connected', 'no pylon reaches it'], ['noroute', 'No route takes its goods', 'full, and no truck picks it up'],
  ['noroad', 'No road', 'trucks can\'t reach it'], ['dry', 'Dry', 'a field no sprinkler waters'],
];

/** What the markers mean: each status as its shape, word and tint. */
export function markersCard() {
  return h('div', { class: 'cd-card markers' },
    h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, 'What the markers mean'), h('span', { class: 'cd-small' }, 'a shape and a word, never colour alone')),
    h('div', { class: 'list' }, ...MARKERS.map(([st, word, what]) => h('div', null, statusPill(st, word), h('span', { class: 'cd-small' }, what)))));
}

const key = (k: string) => h('span', { class: 'cd-key' }, k);
/** Controls that are not keys, and the one that cannot be changed, by group. */
const FIXED: Record<GroupId, [string, ...string[]][]> = {
  build: [['Place · a row', 'Click', 'or', 'Drag'], ['Drop what is in hand', 'Right click']],
  view: [['Pan', 'Drag']],
  time: [],
  panels: [['Close a panel · pause', 'Esc']],
};

/** The keys, as rows, as they are now set. */
export function keysCard() {
  return h('div', { class: 'cd-card keys' },
    h('div', { class: 'cd-label' }, 'Keys'),
    h('div', { class: 'cols' }, ...GROUPS.map((g) => h('div', null,
      h('div', { class: 'cd-label group', style: `--col: ${g.col}` }, h('i'), g.name),
      h('div', { class: 'cd-keyrows' },
        ...ACTIONS.filter((a) => a.group === g.id).map((a) => {
          const names = keyNames(a.id);
          return h('div', { class: 'cd-keyrow', title: a.note }, h('span', null, a.label), ...(names.length ? names.map(key) : [h('small', null, 'no key')]));
        }),
        ...FIXED[g.id].map(([what, ...keys]) => h('div', { class: 'cd-keyrow' }, h('span', null, what), ...keys.map((k) => (k === 'or' ? h('small', null, k) : key(k))))))))));
}

/** Where the commission stands, for the pause screen: one row per goal (so any number of goals fits), then credits and power. */
function standing(s: GameState) {
  const sc = s.scenario, nets = networks(s).list;
  const made = nets.reduce((n, x) => n + x.made, 0), used = nets.reduce((n, x) => n + usedBy(x), 0);
  const bats = s.buildings.filter((b): b is BatteryBuilding => b.type === 'battery' && networks(s).of.has(b.id));
  const stored = bats.reduce((n, b) => n + b.charge, 0), cap = bats.length * POWER.battery.capacity;
  const fact = (label: string, value: string) => h('div', null, h('span', { class: 'cd-small' }, label), h('b', { class: 'cd-num' }, value));
  return h('div', { class: 'cd-card standing' },
    h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, commissionLabel(s)),
      h('span', { class: 'cd-small' }, sc.sandbox ? `${playTime(s.time)} played` : s.completedAt !== null ? `done in ${playTime(s.completedAt)}` : [h('b', { class: 'cd-num' }, playTime(s.time)), ` of ${playTime(sc.par)}`])),
    sc.goals.length ? h('div', { class: 'goals' }, ...sc.goals.map((g, i) => {
      const now = goalNow(s, i), done = now.done && g.kind !== 'soil';
      const bar = h('span', { class: 'cd-bar' }, h('i'));
      bar.style.setProperty('--v', String(Math.max(0, Math.min(1, now.v))));
      if (g.kind === 'soil') bar.style.setProperty('--col', 'var(--tide)');
      return h('div', { class: `goal${done ? ' is-done' : ''}` },
        icon(goalIcon(g), 28),
        h('div', { class: 'what' }, h('div', { class: 'name' }, goalWords(g)), bar),
        h('div', { class: 'now' }, h('b', { class: 'cd-num' }, now.figure), h('span', { class: 'cd-small' }, done ? ' done' : ` ${now.of}`)));
    })) : null,
    h('div', { class: 'facts' },
      fact('Credits', sc.sandbox ? '∞' : num(Math.floor(s.credits))),
      fact('Power', nets.length ? `${watts(made)} / ${watts(used)}` : 'none'),
      fact('Stored', cap ? pct(stored / cap) : '–')),
    sc.sandbox ? null : h('div', { class: 'cd-small times' }, ...medalTimes(sc.par)));
}

/** The pause screen. */
export function pauseScreen(host: PauseHost) {
  const s = host.state(), sc = s.scenario;
  const lost = sc.goals.find((g) => g.kind === 'deliver');
  const loses = `Restart loses ${playTime(s.time)} of play${lost && lost.kind === 'deliver' && s.delivered[lost.item] ? ` and ${num(s.delivered[lost.item] ?? 0)} ${itemName(lost.item)}` : ''}. Press again to confirm.`;
  const note = h('div', { class: 'restart-note', hidden: true }, loses);
  let armed = false;
  const restart = h('button', {
    class: 'cd-btn is-danger is-lg', onclick: () => { if (armed) { host.restart(); return; } armed = true; note.hidden = false; must(restart.lastChild, 'button label').textContent = 'Restart: sure?'; },
  }, icon('rotate', 18), 'Restart');
  return h('div', { class: 'pause' },
    h('div', { class: 'title' }, h('div', { class: 'big-title' }, 'Paused'),
      h('div', { class: 'sub' }, `${sc.name} · day ${dayAt(s.time)}, ${clock(hourAt(s.time))}${sc.sandbox ? '' : ` · ${playTime(s.time)} of ${playTime(sc.par)}`}`)),
    h('div', { class: 'grid' },
      standing(s),
      h('div', { class: 'centre' },
        h('button', { class: 'cd-btn is-primary is-lg resume', onclick: () => host.resume() }, icon('play', 18, 'inv'), 'Resume', h('span', { class: 'keys' }, h('span', { class: 'cd-key' }, 'Esc'), ...keyNames('pause').map((k) => h('span', { class: 'cd-key' }, k)))),
        h('div', { class: 'two' }, h('button', { class: 'cd-btn is-lg', onclick: () => host.menu() }, 'Level select'), restart),
        h('button', { class: 'cd-btn is-lg settings-btn', onclick: () => host.openSettings() }, icon('menu', 18), 'Settings'),
        note),
      markersCard()),
    keysCard());
}
