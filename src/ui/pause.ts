import { POWER } from '../game/data.ts';
import { networks, usedBy } from '../game/power.ts';
import { dayAt, hourAt } from '../game/sim.ts';
import type { GameState, Status } from '../game/state.ts';
import { h, icon } from './dom.ts';
import { clock, itemName, num, pct, playTime, watts } from './format.ts';
import { commissionLabel } from './playhud.ts';
import { PIXEL_SIZES, UI_SIZES, type Settings, type SettingsStore } from './settings.ts';
import { gauge, goalIcon, goalNow, medalTimes, statusPill } from './widgets.ts';

// The pause screen: resume, where the commission stands, the level select and restart (restart asks twice and says what it
// loses); the settings; what the markers mean (a shape and a word); and the keys, the one place they are printed.

export interface PauseHost {
  state(): GameState;
  settings: SettingsStore;
  resume(): void;
  menu(): void;
  restart(): void;
}

/** A switch for a yes/no setting. */
function toggle(on: boolean, label: string, change: (v: boolean) => void) {
  const b = h('button', { class: `switch${on ? ' is-on' : ''}`, role: 'switch', 'aria-checked': String(on), 'aria-label': label });
  b.addEventListener('click', () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); b.classList.toggle('is-on', v); change(v); });
  return b;
}

/** The settings, as rows (also on the level select). */
export function settingsCard(store: SettingsStore) {
  const st = store.get();
  const size = h('b', { class: 'cd-num' }, pct(st.uiSize));
  const slider = h('input', {
    type: 'range', class: 'cd-range', min: UI_SIZES.min, max: UI_SIZES.max, step: UI_SIZES.step, value: st.uiSize, 'aria-label': 'Interface size',
    oninput: () => { size.textContent = pct(Number(slider.value)); },
    onchange: () => store.set({ uiSize: Number(slider.value) }),
  }) as HTMLInputElement;
  const pixels = h('div', { class: 'cd-seg wide' }, ...PIXEL_SIZES.map((n) => {
    const b = h('button', { class: st.pixelSize === n ? 'is-on' : '', onclick: () => { store.set({ pixelSize: n }); for (const x of pixels.children) x.classList.toggle('is-on', x === b); } }, `${n} × ${n}`);
    return b;
  }));
  const yes = (k: keyof Settings, label: string, words: string) => h('div', { class: 'set' },
    h('b', null, label), toggle(st[k] as boolean, label, (v) => store.set({ [k]: v })), h('span', { class: 'cd-small' }, words));
  return h('div', { class: 'cd-card settings' },
    h('div', { class: 'cd-label' }, 'Settings'),
    h('div', { class: 'set is-slider' }, h('b', null, 'Interface size'), slider, size),
    h('div', { class: 'set is-seg' }, h('b', null, 'Pixel size'), pixels,
      h('span', { class: 'cd-small' }, 'Screen pixels for each pixel of the art. Smaller pixels show finer detail and cost more to draw.')),
    yes('reduceMotion', 'Reduce motion', 'Cards and gauges appear without springing.'),
    yes('showPace', 'Show pace', '“Done by” on the commission card and gold and silver ticks on the goals. Off: you see only where you are.'),
    yes('problemsStrip', 'Problems strip', 'Experimental. A strip on the right edge listing problems. Off: find them on the map.'));
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
type KeyRow = [string, ...(string | [string])[]];
/** Every control, grouped: a key in brackets is a word between keys ("back", "out"). */
const KEYS: [string, string, KeyRow[]][] = [
  ['Build', 'var(--pine)', [['Field · silo · garage', 'F', 'L', 'T'], ['Pylon · solar panel', 'P', 'S'], ['Turn the building', 'R', ['back'], 'Shift', 'R'],
    ['Remove (full refund)', 'X'], ['Place · a row', 'Click', ['or'], 'Drag'], ['Drop what is in hand', 'Right click']]],
  ['View', 'var(--tide)', [['Turn the view', 'Q', 'E'], ['Zoom', 'Z', ['out'], 'Shift', 'Z'], ['Zoom a step', '+', '−'], ['Overlay: soil, water, power, roads, bees', 'V'],
    ['Pan', 'Drag', ['or'], 'Arrows']]],
  ['Time', 'var(--ochre)', [['Pause and play', 'Space'], ['Normal speed, 1×', '1'], ['Fast, 2×', '2'], ['Fastest, 4×', '3']]],
  ['Panels', 'var(--plum)', [['Ledger · routes', 'Tab', 'O'], ['Power', 'W'], ['Guide', 'G'], ['Close a panel · pause', 'Esc']]],
];

/** The keys, as rows: the one place keys are printed. */
export function keysCard() {
  return h('div', { class: 'cd-card keys' },
    h('div', { class: 'cd-label' }, 'Keys'),
    h('div', { class: 'cols' }, ...KEYS.map(([group, col, rows]) => h('div', null,
      h('div', { class: 'cd-label group', style: `--col: ${col}` }, h('i'), group),
      h('div', { class: 'cd-keyrows' }, ...rows.map(([what, ...keys]) => h('div', { class: 'cd-keyrow' }, h('span', null, what),
        ...keys.map((k) => (Array.isArray(k) ? h('small', null, k[0]) : key(k))))))))));
}

/** Where the commission stands, for the pause screen: its goals as gauges, credits and power. */
function standing(s: GameState) {
  const sc = s.scenario, nets = networks(s).list;
  const made = nets.reduce((n, x) => n + x.made, 0), used = nets.reduce((n, x) => n + usedBy(x), 0);
  const bats = s.buildings.filter((b) => b.type === 'battery' && networks(s).of.has(b.id));
  const stored = bats.reduce((n, b) => n + b.charge!, 0), cap = bats.length * POWER.battery.capacity;
  return h('div', { class: 'cd-card standing' },
    h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, commissionLabel(s)),
      h('span', { class: 'cd-small' }, sc.sandbox ? `${playTime(s.time)} played` : s.completedAt !== null ? `done in ${playTime(s.completedAt)}` : [h('b', { class: 'cd-num' }, playTime(s.time)), ` of ${playTime(sc.par)}`])),
    h('div', { class: 'body' },
      ...sc.goals.map((g, i) => {
        const now = goalNow(s, i);
        return gauge({ v: now.v, d: sc.goals.length > 2 ? 84 : 108, col: g.kind === 'soil' ? 'var(--tide)' : undefined, cls: now.done && g.kind !== 'soil' ? 'is-done' : '',
          inner: [h('div', { class: 'cd-figure' }, now.figure), h('div', { class: 'cd-small' }, now.done && g.kind !== 'soil' ? 'done' : now.of)], foot: '' });
      }).map((el, i) => { el.querySelector('.cd-gauge__foot')!.append(icon(goalIcon(sc.goals[i]), 14), ` ${goalNow(s, i).word}`); return el; }),
      h('div', { class: 'facts' },
        h('div', null, h('span', null, 'Credits'), h('b', { class: 'cd-num' }, sc.sandbox ? '∞' : num(Math.floor(s.credits)))),
        h('div', null, h('span', null, 'Power'), h('b', { class: 'cd-num' }, nets.length ? `${watts(made)} / ${watts(used)}` : 'none')),
        h('div', null, h('span', null, 'Stored'), h('b', { class: 'cd-num' }, cap ? pct(stored / cap) : '–')))),
    sc.sandbox ? null : h('div', { class: 'cd-small times' }, ...medalTimes(sc.par)));
}

/** The pause screen. */
export function pauseScreen(host: PauseHost) {
  const s = host.state(), sc = s.scenario;
  const lost = sc.goals.find((g) => g.kind === 'deliver');
  const loses = `Restart loses ${playTime(s.time)} of play${lost && lost.kind === 'deliver' && s.delivered[lost.item] ? ` and ${num(s.delivered[lost.item]!)} ${itemName(lost.item)}` : ''}. Press again to confirm.`;
  const note = h('div', { class: 'restart-note', hidden: true }, loses);
  let armed = false;
  const restart = h('button', {
    class: 'cd-btn is-danger is-lg', onclick: () => { if (armed) { host.restart(); return; } armed = true; note.hidden = false; restart.lastChild!.textContent = 'Restart: sure?'; },
  }, icon('rotate', 18), 'Restart');
  return h('div', { class: 'pause' },
    h('div', { class: 'title' }, h('div', { class: 'big-title' }, 'Paused'),
      h('div', { class: 'sub' }, `${sc.name} · day ${dayAt(s.time)}, ${clock(hourAt(s.time))}${sc.sandbox ? '' : ` · ${playTime(s.time)} of ${playTime(sc.par)}`}`)),
    h('div', { class: 'grid' },
      settingsCard(host.settings),
      h('div', { class: 'centre' },
        h('button', { class: 'cd-btn is-primary is-lg resume', onclick: () => host.resume() }, icon('play', 18, 'inv'), 'Resume', h('span', { class: 'keys' }, h('span', { class: 'cd-key' }, 'Esc'), h('span', { class: 'cd-key' }, 'Space'))),
        standing(s),
        h('div', { class: 'two' }, h('button', { class: 'cd-btn is-lg', onclick: () => host.menu() }, 'Level select'), restart),
        note),
      markersCard()),
    keysCard());
}
