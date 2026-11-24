// The valley postcard, top left: the valley's name (from its seed) and season, a first nudge until the Farmhouse stands,
// then a tiny living summary (fields, flowing rills, bridges) with Home and New valley. It folds down to just its title.
import { SEASONS, type Season } from '../game/index.ts';
import { button, el, recall, remember, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import type { UiCallbacks, ValleyStats } from './types.ts';

export interface Brief { element: HTMLElement; render(stats: ValleyStats): void }

const FIRST = ['Willow', 'Alder', 'Sun', 'Bramble', 'Fern', 'Hazel', 'Linden', 'Thistle', 'Clover', 'Rowan', 'Heather', 'Larch', 'Briar', 'Juniper', 'Elder', 'Moss', 'Ash', 'Bryony'];
const LAST = ['bend Valley', 'brook Hollow', 'ridge Glen', 'combe', 'dale', 'mere Hollow', 'wick Vale', 'ford Glen', 'shaw Valley', 'holt Vale', 'leigh Hollow', 'water Dale'];

/** A cozy, stable name for a valley's seed, e.g. "Willowbend Valley" or "Alderbrook Hollow". */
export function valleyName(seed: number): string {
  let h = Math.imul((seed | 0) ^ 0x5bd1e995, 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 15), 0x297a2d39);
  h = (h ^ (h >>> 13)) >>> 0;
  return `${FIRST[h % FIRST.length] ?? 'Willow'}${LAST[(h >>> 8) % LAST.length] ?? 'bend Valley'}`;
}

const SEASON_LABEL: Record<Season, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

const fmt = (n: number) => Math.round(n).toLocaleString('en');

/** A fresh seed for a new valley. */
const rollSeed = () => Math.floor(Math.random() * 0x7fffffff);

export function createBrief(cb: UiCallbacks): Brief {
  let last: ValleyStats | null = null;
  let folded = recall('brief.folded') === '1';
  /** A fresh valley waiting for a yes, when the homestead would be cleared. */
  let pending: { seed: number; season: Season } | null = null;

  const card = el('section', 'ui-brief ui-float');
  card.setAttribute('aria-label', 'Your valley');

  const head = el('header', 'ui-brief-head');
  const name = el('h1', 'ui-brief-name');
  const fold = button('ui-icon-btn ui-brief-fold', 'Fold the postcard', () => {
    folded = !folded;
    remember('brief.folded', folded ? '1' : '0');
    paint();
  });
  fold.append(icon('chevron'));
  head.append(name, fold);

  const body = el('div', 'ui-brief-body');

  const seasons = el('div', 'ui-seasons');
  seasons.setAttribute('role', 'group');
  seasons.setAttribute('aria-label', 'Season');
  const seasonBtns = new Map<Season, HTMLButtonElement>();
  for (const s of SEASONS) {
    const b = button(`ui-season ui-season-${s}`, `A ${SEASON_LABEL[s].toLowerCase()} valley`, () => {
      if (last && s !== last.season) ask(last.seed, s);
    });
    b.textContent = SEASON_LABEL[s];
    seasonBtns.set(s, b);
    seasons.append(b);
  }

  const prompt = el('p', 'ui-brief-prompt', 'Place your Farmhouse on a sunny clearing.');

  const summary = el('dl', 'ui-brief-stats');
  const figure = (label: string) => {
    const wrap = el('div', 'ui-stat');
    const value = el('dd', 'ui-stat-value');
    wrap.append(value, el('dt', 'ui-stat-label', label));
    summary.append(wrap);
    return value;
  };
  const fields = figure('fields');
  const rills = figure('rills');
  const bridges = figure('bridges');

  const foot = el('div', 'ui-brief-foot');
  const home = button('ui-chip', 'Look at the Farmhouse', () => cb.onCenterHomestead());
  home.append(icon('home'), el('span', '', 'Home'));
  const roll = button('ui-chip', 'Roll a new valley', () => { if (last) ask(rollSeed(), last.season); });
  roll.append(icon('dice'), el('span', '', 'New valley'));
  const seedTag = el('span', 'ui-brief-seed');
  foot.append(home, roll, seedTag);

  const confirm = el('div', 'ui-brief-confirm');
  const confirmText = el('p', 'ui-brief-confirm-text');
  const yes = button('ui-chip is-strong', 'Start the new valley', () => {
    const p = pending;
    pending = null;
    paint();
    if (p) cb.onNewValley(p.seed, p.season);
  });
  yes.textContent = 'Start afresh';
  const no = button('ui-chip', 'Keep this valley', () => { pending = null; paint(); });
  no.textContent = 'Keep';
  confirm.append(confirmText, yes, no);

  body.append(seasons, prompt, summary, foot, confirm);
  card.append(head, body);

  function hasWork(s: ValleyStats): boolean {
    return s.landEditCount > 0;
  }

  /** Starts a new valley, first asking when it would clear the player's homestead. */
  function ask(seed: number, season: Season): void {
    if (!last || !hasWork(last)) { cb.onNewValley(seed, season); return; }
    pending = { seed, season };
    setText(confirmText, season === last.season
      ? 'Roll a fresh valley? This homestead will be cleared.'
      : `Start afresh in ${SEASON_LABEL[season].toLowerCase()}? This homestead will be cleared.`);
    paint();
  }

  function paint(): void {
    const s = last;
    if (!s) return;
    setText(name, valleyName(s.seed));
    setFlag(card, 'is-folded', folded);
    setHidden(body, folded);
    setTitle(fold, folded ? 'Open the postcard' : 'Fold the postcard');
    for (const [season, b] of seasonBtns) setPressed(b, season === s.season);
    setHidden(prompt, s.hasFarmhouse);
    setHidden(summary, !s.hasFarmhouse);
    setHidden(home, !s.hasFarmhouse);
    setText(fields, `${fmt(s.fieldAreaM2)} m²`);
    setText(rills, `${fmt(s.flowingRillM)} m`);
    setText(bridges, fmt(s.bridgeCount));
    setText(seedTag, `#${s.seed}`);
    setHidden(foot, pending !== null);
    setHidden(confirm, pending === null);
  }

  function render(stats: ValleyStats): void {
    if (last && last.seed !== stats.seed) pending = null;
    last = stats;
    paint();
  }

  return { element: card, render };
}
