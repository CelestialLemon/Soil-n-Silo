// The valley postcard, top left: the valley's name (from its seed) and season, a first nudge until the Farmhouse stands,
// and the Open Homestead Brief's three seals (docs/DESIGN.md, "Open Homestead Brief"), each a small ring filling as the
// homestead meets it, with one live line: the Pantry Order's goods, the Living Land's fields and soil, the Steady
// Homestead's blackout-free hours (and why it last started over). No timer. When all three fill, a warm "Valley Restored"
// note. Home and New valley sit at its foot; it folds down to just its title.
import { type BriefState, GOOD_LABELS, isGood, isWorkshop, SEAL_LABELS, type SealId, SEASONS, type Season, THING_KINDS } from '../game/index.ts';
import { button, el, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon, type IconName, setIcon } from './icons.ts';
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

/** What the Steady Homestead still waits for before its hours count. */
function needs(s: ValleyStats): string {
  const missing = [
    ...(s.hasFarmhouse ? [] : ['a Farmhouse']),
    ...(s.hasGarage ? [] : ['a Garage']),
    ...(THING_KINDS.some((k) => isWorkshop(k) && (s.thingCounts[k] ?? 0) > 0) ? [] : ['a workshop']),
  ];
  return missing.length > 0 ? `Counts once ${missing.join(', ').replace(/, ([^,]*)$/, ' and $1')} stand` : '';
}

type SealTone = 'neutral' | 'good' | 'low';

interface SealView {
  element: HTMLElement;
  /** Its fill (0..1), whether it's sealed, its live readout, a quiet whisper under it ('' for none) and its tone. */
  paint(progress: number, done: boolean, readout: string, whisper: string, tone: SealTone): void;
}

const SVG = 'http://www.w3.org/2000/svg';

/** One seal: a small ring that fills, its picture (a check once sealed), its name and a live line. */
function createSeal(id: SealId, glyph: IconName): SealView {
  const item = el('li', `ui-seal ui-seal-${id}`);
  const ring = document.createElementNS(SVG, 'svg');
  ring.setAttribute('viewBox', '0 0 24 24');
  ring.setAttribute('class', 'ui-seal-ring');
  ring.setAttribute('aria-hidden', 'true');
  const track = document.createElementNS(SVG, 'circle');
  const fill = document.createElementNS(SVG, 'circle');
  for (const c of [track, fill]) {
    c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '10');
    c.setAttribute('pathLength', '100');
  }
  track.setAttribute('class', 'ui-seal-track');
  fill.setAttribute('class', 'ui-seal-fill');
  ring.append(track, fill);
  const badge = el('span', 'ui-seal-badge');
  const pic = icon(glyph, 'ui-icon ui-seal-icon');
  badge.append(ring, pic);

  const text = el('div', 'ui-seal-text');
  const label = el('span', 'ui-seal-label', SEAL_LABELS[id].replace(/^The /, ''));
  const value = el('span', 'ui-seal-value');
  const whisperText = el('span', 'ui-seal-whisper');
  text.append(label, value, whisperText);
  item.append(badge, text);

  let shown = '';
  return {
    element: item,
    paint(progress, done, readout, whisper, tone) {
      const p = Math.max(0, Math.min(1, done ? 1 : progress));
      const key = `${p.toFixed(3)}|${done}|${readout}|${whisper}|${tone}`;
      if (key === shown) return;
      shown = key;
      fill.style.strokeDasharray = `${(p * 100).toFixed(1)} 100`;
      setFlag(item, 'is-empty', p <= 0);
      setIcon(pic, done ? 'check' : glyph);
      setFlag(item, 'is-done', done);
      setFlag(item, 'is-good', tone === 'good');
      setFlag(item, 'is-low', tone === 'low');
      setText(value, readout);
      setText(whisperText, whisper);
      setHidden(whisperText, whisper === '');
      item.title = `${SEAL_LABELS[id]}: ${done ? 'sealed' : `${Math.round(p * 100)}%`}`;
    },
  };
}

/** A fresh seed for a new valley. */
const rollSeed = () => Math.floor(Math.random() * 0x7fffffff);

export function createBrief(cb: UiCallbacks): Brief {
  let last: ValleyStats | null = null;
  let folded = false;
  /** A fresh valley waiting for a yes, when the homestead would be cleared. */
  let pending: { seed: number; season: Season } | null = null;

  const card = el('section', 'ui-brief ui-float');
  card.setAttribute('aria-label', 'Your valley');

  const head = el('header', 'ui-brief-head');
  const name = el('h1', 'ui-brief-name');
  const fold = button('ui-icon-btn ui-brief-fold', 'Fold the postcard', () => {
    folded = !folded;
    paint();
  });
  fold.append(icon('chevron'));
  // Folded, the seals still show as three small dots beside the name.
  const minis = el('span', 'ui-brief-minis');
  const miniDots = [0, 1, 2].map(() => el('span', 'ui-brief-mini'));
  minis.append(...miniDots);
  head.append(name, minis, fold);

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

  const seals = el('ol', 'ui-seals');
  seals.setAttribute('aria-label', 'The Homestead Brief');
  const order = createSeal('order', 'bakery');
  const land = createSeal('livingLand', 'land');
  const steady = createSeal('steadyHomestead', 'power');
  seals.append(order.element, land.element, steady.element);

  const restored = el('div', 'ui-restored');
  restored.setAttribute('role', 'status');
  restored.append(
    el('strong', 'ui-restored-title', 'Valley Restored'),
    el('p', 'ui-restored-text', 'Your homestead holds in balance — linger as long as you like, or start a new valley.'),
  );

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

  body.append(seasons, prompt, seals, restored, foot, confirm);
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
    setFlag(seals, 'is-quiet', !s.hasFarmhouse);
    setHidden(home, !s.hasFarmhouse);
    paintSeals(s, s.brief);
    setHidden(minis, !folded);
    const marks = [s.brief.order.done, s.brief.livingLand.done, s.brief.steadyHomestead.done];
    miniDots.forEach((d, i) => setFlag(d, 'is-done', marks[i] === true));
    setTitle(minis, `${marks.filter(Boolean).length} of 3 seals${s.brief.restored ? ' · Valley Restored' : ''}`);
    setHidden(restored, !s.brief.restored);
    setFlag(card, 'is-restored', s.brief.restored);
    setText(seedTag, `#${s.seed}`);
    setHidden(foot, pending !== null);
    setHidden(confirm, pending === null);
  }

  function paintSeals(s: ValleyStats, b: BriefState): void {
    const o = b.order;
    const goods = Object.entries(o.targets).flatMap(([g, n]) =>
      isGood(g) && n !== undefined ? [`${GOOD_LABELS[g].label} ${Math.min(n, o.delivered[g] ?? 0)}/${n}`] : []);
    order.paint(o.progress, o.done, goods.join(' · '), o.done ? 'Delivered · the settlement thanks you' : '', 'neutral');

    const l = b.livingLand;
    const soil = Math.round(l.avgFertility * 100);
    const landTone = l.plantedM2 <= 0 ? 'neutral' : l.avgFertility >= l.targetFertility ? 'good' : 'low';
    land.paint(l.progress, l.done,
      l.plantedM2 > 0 ? `${fmt(l.plantedM2)} m² · ${soil}% soil` : 'No fields yet',
      l.done ? '' : `Aim for ${fmt(l.targetM2)} m² of fields on ${Math.round(l.targetFertility * 100)}% soil`,
      landTone);

    const h = b.steadyHomestead;
    const hours = `${Math.floor(h.hours)} / ${h.targetHours} h`;
    const why = h.done ? '' : !h.running ? needs(s) : h.resetReason !== '' ? `Started over · ${h.resetReason}` : '';
    steady.paint(h.progress, h.done, h.done ? 'Holding steady' : h.running ? hours : 'Not running yet', why,
      !h.done && h.running && h.resetReason !== '' && h.hours < 1 ? 'low' : 'neutral');
  }

  function render(stats: ValleyStats): void {
    if (last && last.seed !== stats.seed) pending = null;
    last = stats;
    paint();
  }

  return { element: card, render };
}
