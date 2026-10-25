import { ACTIONS, GROUPS, SLOTS, assign, bindable, canon, overridesOf, resolve, unassign, type ActionDef, type ActionId, type Bindings } from '../keybindings.ts';
import { fill, h, icon } from './dom.ts';
import { pct } from './format.ts';
import { labelOf, nameOf } from './keyhints.ts';
import { FRAME_STATS_MODES, PIXEL_SIZES, UI_SIZES, type Settings, type SettingsStore } from './settings.ts';

// The settings panel, opened from the level select and the pause screen: a Game tab (interface size, pixel size, the switches,
// the frame rate readout) and a Keys tab, where each action's keys are changed (click a key, press the new one).

/** A switch for a yes/no setting. */
function toggle(on: boolean, label: string, change: (v: boolean) => void) {
  const b = h('button', { class: `switch${on ? ' is-on' : ''}`, role: 'switch', 'aria-checked': String(on), 'aria-label': label });
  b.addEventListener('click', () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); b.classList.toggle('is-on', v); change(v); });
  return b;
}

/** The Game tab: the settings, as rows. */
function gameRows(store: SettingsStore) {
  const st = store.get();
  const size = h('b', { class: 'cd-num' }, pct(st.uiSize));
  const slider = h('input', {
    type: 'range', class: 'cd-range', min: UI_SIZES.min, max: UI_SIZES.max, step: UI_SIZES.step, value: st.uiSize, 'aria-label': 'Interface size',
    oninput: () => { size.textContent = pct(Number(slider.value)); },
    onchange: () => store.set({ uiSize: Number(slider.value) }),
  });
  const pixels = h('div', { class: 'cd-seg wide' }, ...PIXEL_SIZES.map((n) => {
    const b = h('button', { class: st.pixelSize === n ? 'is-on' : '', onclick: () => { store.set({ pixelSize: n }); for (const x of pixels.children) x.classList.toggle('is-on', x === b); } }, `${n} × ${n}`);
    return b;
  }));
  const frames = h('div', { class: 'cd-seg wide' }, ...FRAME_STATS_MODES.map((m) => {
    const b = h('button', { class: st.frameStats === m ? 'is-on' : '', onclick: () => { store.set({ frameStats: m }); for (const x of frames.children) x.classList.toggle('is-on', x === b); } }, m[0].toUpperCase() + m.slice(1));
    return b;
  }));
  const yes = (k: 'reduceMotion' | 'showPace' | 'problemsStrip' | 'fastSpeeds', label: string, words: string) => h('div', { class: 'set' },
    h('b', null, label), toggle(st[k], label, (v) => store.set({ [k]: v } satisfies Partial<Settings>)), h('span', { class: 'cd-small' }, words));
  return [
    h('div', { class: 'set is-slider' }, h('b', null, 'Interface size'), slider, size),
    h('div', { class: 'set is-seg' }, h('b', null, 'Pixel size'), pixels,
      h('span', { class: 'cd-small' }, 'Screen pixels for each pixel of the art. Smaller pixels show finer detail and cost more to draw.')),
    yes('reduceMotion', 'Reduce motion', 'Cards and gauges appear without springing.'),
    yes('showPace', 'Show pace', '“Done by” on the commission card and gold and silver ticks on the goals. Off: you see only where you are.'),
    yes('problemsStrip', 'Problems strip', 'Experimental. A strip on the right edge listing problems. Off: find them on the map.'),
    yes('fastSpeeds', 'Fast speeds', 'For testing. Adds 8× and 16× to the speed buttons.'),
    h('div', { class: 'set is-seg' }, h('b', null, 'Frame rate'), frames,
      h('span', { class: 'cd-small' }, 'Top left while you play. Minimal: the frame rate, once a second. Full: a frame time graph, the average and the 1% and 0.1% lows.')),
  ];
}

const sameKeys = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((c, i) => c === b[i]);

/** The Keys tab: every action with its keys. */
function keyRows(store: SettingsStore) {
  const current = (): Bindings => resolve(store.get().keys);
  const note = h('div', { class: 'cd-small kb-note', role: 'status' });
  const list = h('div', { class: 'kb-list' });
  const reset = h('button', { class: 'cd-btn is-ghost is-sm', onclick: () => { stopListening(); note.textContent = ''; store.set({ keys: {} }); draw(); } }, icon('rotate', 14), 'Reset all');
  let stopListening = () => {};

  const apply = (change: Bindings, message: string) => { store.set({ keys: overridesOf(change) }); note.textContent = message; draw(); };

  /** Waits for the next key press (Esc: never mind; a click elsewhere: the same) and gives it to the action's `slot`. */
  function listen(a: ActionDef, slot: number, btn: HTMLButtonElement) {
    stopListening();
    const before = btn.textContent;
    btn.textContent = 'Press a key'; btn.classList.add('is-listening');
    note.textContent = 'Press the new key. Esc keeps the old one.';
    const end = () => { removeEventListener('keydown', onKey, true); removeEventListener('pointerdown', onAway, true); stopListening = () => {}; };
    const onKey = (e: KeyboardEvent) => {
      // Nothing else sees the key (the game's own keys, Esc closing the panel, a button taking Space).
      e.preventDefault(); e.stopPropagation();
      if (e.repeat || /^(Shift|Control|Alt|Meta|OS)(Left|Right)$/.test(e.code)) return;
      end();
      const quiet = (ev: KeyboardEvent) => { if (ev.code === e.code) { ev.preventDefault(); ev.stopPropagation(); removeEventListener('keyup', quiet, true); } };
      addEventListener('keyup', quiet, true);
      if (e.code === 'Escape') { note.textContent = ''; draw(); return; }
      const code = canon(e.code);
      if (!bindable(code)) { note.textContent = `${nameOf(code)} can't be used for a key.`; draw(); return; }
      const { bindings, took } = assign(current(), a.id, slot, code);
      apply(bindings, took.length ? `${nameOf(code)} moved here from ${took.map(labelOf).join(' and ')}, which now has no key${took.length > 1 ? 's' : ''}.` : '');
    };
    // Put the key back without redrawing, so the click that cancelled this still reaches what it was aimed at.
    const onAway = (e: PointerEvent) => { if (e.target !== btn) { end(); note.textContent = ''; btn.textContent = before; btn.classList.remove('is-listening'); } };
    addEventListener('keydown', onKey, true);
    addEventListener('pointerdown', onAway, true);
    stopListening = end;
  }

  function row(a: ActionDef, b: Bindings) {
    const keys = b[a.id];
    const slots = Array.from({ length: SLOTS }, (_, i) => {
      const code = keys[i];
      const btn = h('button', {
        class: `cd-key kb-key${code ? '' : ' is-empty'}`, 'aria-label': `${a.label}: ${code ? nameOf(code) : 'no key'}${i === 0 || code ? '' : ' (add another key)'}`,
        onclick: () => listen(a, i, btn),
      }, code ? nameOf(code) : '+');
      return h('span', { class: 'kb-slot' }, btn,
        code ? h('button', { class: 'kb-clear', title: 'Take this key off', 'aria-label': `Take ${nameOf(code)} off ${a.label}`, onclick: () => apply(unassign(current(), a.id, i), '') }, '×') : null);
    });
    const changed = !sameKeys(keys, a.keys);
    return h('div', { class: 'kb-row' },
      h('span', { class: 'kb-what' }, a.label, a.note ? h('small', null, a.note) : null),
      ...slots,
      h('button', { class: `kb-reset${changed ? '' : ' is-hidden'}`, title: 'Back to the default', 'aria-label': `Reset ${a.label}`, tabIndex: changed ? 0 : -1, onclick: () => resetOne(a) }, icon('rotate', 14)));
  }

  /** An action back to its default keys, which leave whichever action took them since. */
  function resetOne(a: ActionDef) {
    let b: Bindings = { ...current(), [a.id]: [] };
    const took: ActionId[] = [];
    a.keys.forEach((c, i) => { const r = assign(b, a.id, i, c); b = r.bindings; took.push(...r.took); });
    apply(b, took.length ? `${took.map(labelOf).join(' and ')} lost a key to ${a.label}.` : '');
  }

  function draw() {
    const b = current();
    reset.disabled = Object.keys(store.get().keys).length === 0;
    fill(list, ...GROUPS.map((g) => h('div', { class: 'kb-group' },
      h('div', { class: 'cd-label group', style: `--col: ${g.col}` }, h('i'), g.name),
      ...ACTIONS.filter((a) => a.group === g.id).map((a) => row(a, b)))));
  }
  draw();
  return [
    h('div', { class: 'kb-bar' }, h('div', { class: 'cd-small' }, 'Click a key, then press the one you want. Each action can have two. Esc always closes and pauses.'), reset),
    note, list,
  ];
}

/** The settings panel, to put on a sheet: `close` is what Done does. */
export function settingsPanel(store: SettingsStore, close: () => void) {
  const body = h('div', { class: 'sp-body' });
  const tabs = h('div', { class: 'cd-seg' });
  const show = (tab: 'game' | 'keys') => {
    fill(tabs, ...([['game', 'Game'], ['keys', 'Keys']] as const).map(([id, name]) => h('button', { class: id === tab ? 'is-on' : '', onclick: () => { if (id !== tab) show(id); } }, name)));
    fill(body, ...(tab === 'game' ? gameRows(store) : keyRows(store)));
    body.scrollTop = 0;
  };
  show('game');
  return h('div', { class: 'cd-card settings settings-panel' },
    h('div', { class: 'sp-head' }, h('div', { class: 'cd-label' }, 'Settings'), tabs, h('button', { class: 'cd-btn is-primary is-sm', onclick: close }, 'Done')),
    body);
}
