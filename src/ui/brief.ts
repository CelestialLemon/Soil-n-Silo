// The valley postcard, top left: the valley's name (a campaign valley's title, else one from its seed) and season, its
// climate character this season and its landform in one quiet line ("A wet spring · Terrace", "· Sandbox" in a Sandbox
// valley), a first nudge until the Farmhouse stands,
// and the Open Homestead Brief's three seals (docs/DESIGN.md, "Open Homestead Brief"), each a small ring filling as the
// homestead meets it, with one live line: the Pantry Order's goods, the Living Land's fields and soil, the Steady
// Homestead's blackout-free hours (and why it last started over, or why it's paused). No timer. When all three fill, a warm "Valley Restored"
// note. Home, Valleys (the Valleys panel: the campaign, a custom valley or a Sandbox, and the saves) and a quick Save and
// Load sit at its foot; it folds down to just its title.
import { type BriefState, GOOD_LABELS, isGood, isWorkshop, SEAL_LABELS, type SealId, SEASONS, type Season, THING_KINDS } from '../game/index.ts';
import { button, el, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon, type IconName, setIcon } from './icons.ts';
import { SEASON_LABEL, TERRAIN_LABEL } from './panels.ts';
import type { UiCallbacks, UiSnapshot, ValleyStats } from './types.ts';

export interface Brief {
  element: HTMLElement;
  /** The Valleys button, so the panel it opens doesn't count a press on it as one outside. */
  valleysButton: HTMLElement;
  render(s: UiSnapshot): void;
}

const FIRST = ['Willow', 'Alder', 'Sun', 'Bramble', 'Fern', 'Hazel', 'Linden', 'Thistle', 'Clover', 'Rowan', 'Heather', 'Larch', 'Briar', 'Juniper', 'Elder', 'Moss', 'Ash', 'Bryony'];
const LAST = ['bend Valley', 'brook Hollow', 'ridge Glen', 'combe', 'dale', 'mere Hollow', 'wick Vale', 'ford Glen', 'shaw Valley', 'holt Vale', 'leigh Hollow', 'water Dale'];

/** A cozy, stable name for a valley's seed, e.g. "Willowbend Valley" or "Alderbrook Hollow". */
export function valleyName(seed: number): string {
  let h = Math.imul((seed | 0) ^ 0x5bd1e995, 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 15), 0x297a2d39);
  h = (h ^ (h >>> 13)) >>> 0;
  return `${FIRST[h % FIRST.length] ?? 'Willow'}${LAST[(h >>> 8) % LAST.length] ?? 'bend Valley'}`;
}

/** Whether the valley has the player's work in it, so clearing it should ask first. */
const hasWork = (s: ValleyStats): boolean => s.hasProgress;

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

/** The postcard; `onValleys` opens or closes the Valleys panel. */
export function createBrief(cb: UiCallbacks, onValleys: () => void): Brief {
  let last: ValleyStats | null = null;
  let snap: UiSnapshot | null = null;
  let folded = false;
  /** A choice waiting for a yes, when it would clear the homestead: a fresh season, or loading the saved game. */
  let pending: { text: string; yes: string; run: () => void } | null = null;

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

  const climate = el('p', 'ui-brief-climate');

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
  const valleys = button('ui-chip', 'Valleys: the campaign, a custom valley or a Sandbox, and your saves', () => onValleys());
  valleys.append(icon('map'), el('span', '', 'Valleys'));
  const save = button('ui-icon-btn ui-brief-save', 'Save the game', () => cb.onSaveGame?.());
  save.append(icon('save'));
  const load = button('ui-icon-btn ui-brief-load', 'Load the saved game', () => {
    if (snap?.hasSavedGame !== true || !last) return;
    if (!hasWork(last)) { cb.onLoadGame?.(); return; }
    pending = { text: 'Load the saved game? This homestead will be replaced.', yes: 'Load', run: () => cb.onLoadGame?.() };
    paint();
  });
  load.append(icon('load'));
  const seedTag = el('span', 'ui-brief-seed');
  foot.append(home, valleys, save, load, seedTag);

  const confirm = el('div', 'ui-brief-confirm');
  const confirmText = el('p', 'ui-brief-confirm-text');
  const yes = button('ui-chip is-strong', 'Yes', () => {
    const p = pending;
    pending = null;
    paint();
    p?.run();
  });
  const no = button('ui-chip', 'Keep this valley', () => { pending = null; paint(); });
  no.textContent = 'Keep';
  confirm.append(confirmText, yes, no);

  body.append(seasons, climate, prompt, seals, restored, foot, confirm);
  card.append(head, body);

  /** Starts a new valley, first asking when it would clear the player's homestead. */
  function ask(seed: number, season: Season): void {
    if (!last || !hasWork(last)) { cb.onNewValley(seed, season); return; }
    pending = {
      text: season === last.season
        ? 'Roll a fresh valley? This homestead will be cleared.'
        : `Start afresh in ${SEASON_LABEL[season].toLowerCase()}? This homestead will be cleared.`,
      yes: 'Start afresh',
      run: () => cb.onNewValley(seed, season),
    };
    paint();
  }

  function paint(): void {
    const s = last;
    if (!s) return;
    setText(name, s.valleyTitle || valleyName(s.seed));
    setFlag(card, 'is-folded', folded);
    setHidden(body, folded);
    setTitle(fold, folded ? 'Open the postcard' : 'Fold the postcard');
    for (const [season, b] of seasonBtns) setPressed(b, season === s.season);
    const climateLabel = [s.climateLabel, s.terrain ? TERRAIN_LABEL[s.terrain] : undefined, s.sandbox === true ? 'Sandbox' : undefined]
      .filter((t) => t !== undefined && t !== '').join(' · ');
    setText(climate, climateLabel);
    setHidden(climate, climateLabel === '');
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
    setHidden(save, cb.onSaveGame === undefined);
    setHidden(load, cb.onLoadGame === undefined);
    const saved = snap?.hasSavedGame === true;
    load.disabled = !saved;
    setFlag(load, 'is-quiet', !saved);
    setTitle(load, saved ? `Load the saved game${snap?.savedAtLabel ? ` (${snap.savedAtLabel})` : ''}` : 'No saved game yet');
    setHidden(foot, pending !== null);
    setHidden(confirm, pending === null);
    if (pending) {
      setText(confirmText, pending.text);
      setText(yes, pending.yes);
      setTitle(yes, pending.yes);
    }
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
    const paused = !h.done && h.running && h.paused && h.pauseReason !== '';
    const why = h.done ? '' : !h.running ? needs(s) : paused ? `Paused · ${h.pauseReason}`
      : h.resetReason !== '' ? `Started over · ${h.resetReason}` : '';
    steady.paint(h.progress, h.done, h.done ? 'Holding steady' : h.running ? hours : 'Not running yet', why,
      paused || (!h.done && h.running && h.resetReason !== '' && h.hours < 1) ? 'low' : 'neutral');
  }

  function render(s: UiSnapshot): void {
    const stats = s.stats;
    if (last && (last.seed !== stats.seed || last.campaignId !== stats.campaignId)) pending = null;
    last = stats;
    snap = s;
    paint();
  }

  return { element: card, valleysButton: valleys, render };
}
