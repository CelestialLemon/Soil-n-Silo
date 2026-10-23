import { BUILDINGS } from '../game/data.ts';
import { heldSince, historyOf } from '../game/history.ts';
import { describeStatus } from '../game/sim/describe.ts';
import type { Building, GameState } from '../game/state.ts';
import { fill, h, set } from './dom.ts';
import { playTime } from './format.ts';
import { isProblem, statusLabel, statusLook, statusPill } from './widgets.ts';

// The problems strip (experimental, off by default): a count and a shape for each building with a problem, down the right
// edge, the longest-standing first. Pointing at one says what and for how long; clicking it goes there. Facts only: problems
// are found on the map by default.

const QUIET = new Set(['depot', 'sapling']);
/** The most shapes the strip shows. */
const SHOWN = 9;

/** The buildings with a problem now, the one that has had it longest first, with since when. */
export function problemsOf(s: GameState): { b: Building; since: number }[] {
  return s.buildings.filter((b) => !QUIET.has(b.type) && isProblem(b.status)).map((b) => {
    const hist = historyOf(s, b), held = hist ? heldSince(hist) : null;
    return { b, since: held && held.status === b.status ? held.from : s.time };
  }).sort((a, c) => a.since - c.since || a.b.id - c.b.id);
}

export class ProblemsStrip {
  readonly el = h('div', { class: 'cd-pstrip', hidden: true });
  private readonly pop = h('div', { class: 'cd-pstrip__pop', hidden: true });
  private key = '';
  private hovered: number | null = null;
  private readonly focus: (id: number) => void;

  constructor(focus: (id: number) => void) {
    this.focus = focus;
    this.el.addEventListener('pointerleave', () => { this.hovered = null; this.pop.hidden = true; });
  }

  /** The popover goes beside the strip, in the same layer. */
  get popover() { return this.pop; }

  update(s: GameState, show: boolean) {
    this.el.hidden = !show;
    if (!show) { this.pop.hidden = true; this.key = ''; return; }
    const list = problemsOf(s), key = list.slice(0, SHOWN).map((p) => `${p.b.id}:${p.b.status}`).join(' ') + `|${list.length}`;
    if (key !== this.key) {
      this.key = key;
      fill(this.el, h('span', { class: 'cd-pstrip__n', title: `${list.length} building${list.length === 1 ? '' : 's'} with a problem` }, String(list.length)),
        ...list.slice(0, SHOWN).map((p) => {
          const look = statusLook(p.b.status, p.b.need);
          const it = h('button', {
            class: `cd-pstrip__it ${look.cls}`, 'aria-label': `${BUILDINGS[p.b.type].name}: ${statusLabel(p.b, p.b.status, p.b.need)}`,
            onpointerenter: () => { this.hovered = p.b.id; this.showPop(s, it); }, onclick: () => this.focus(p.b.id),
          }, h('i'));
          if (look.col) it.style.setProperty('--col', look.col);
          return it;
        }),
        list.length > SHOWN ? h('span', { class: 'cd-small more' }, `+${list.length - SHOWN}`) : null);
    }
    if (this.hovered !== null && !this.pop.hidden) {
      const p = list.find((x) => x.b.id === this.hovered);
      const since = this.pop.querySelector('.since');
      if (p && since) set(since, playTime(s.time - p.since));
    }
  }

  private showPop(s: GameState, it: HTMLElement) {
    const p = problemsOf(s).find((x) => x.b.id === this.hovered);
    if (!p) return;
    this.pop.hidden = false;
    this.pop.style.top = `${this.el.offsetTop + it.offsetTop - 8}px`;
    fill(this.pop,
      h('div', { class: 'row' }, statusPill(p.b.status, statusLabel(p.b, p.b.status, p.b.need), '', p.b.need), h('b', null, BUILDINGS[p.b.type].name), h('span', { class: 'fill' }),
        h('span', { class: 'cd-small' }, 'for ', h('span', { class: 'since' }, playTime(s.time - p.since)))),
      h('div', { class: 'cd-small' }, describeStatus(s, p.b)),
      h('div', { class: 'cd-small cd-faint' }, 'Click to go there'));
  }
}
