// #258's comparison, for the developer to judge on the PR's preview (removed before the PR merges): the river's and the
// ponds' shores drawn as curves over the tile rules, `organic` (rounded, smoothed along their run and wandering a little)
// or `gentle` (rounded and smoothed, no wander), or `off` (as before #258: the beds cut to each tile's square). A URL
// option (`?shores=off|gentle|organic`, default `organic`), kept for reloads and remembered for the next visit, and a
// button in the HUD's row of panel buttons (top right) that cycles between them, the land painted again at once.

import { LAND_LOOK, SHORE_MODES, type ShoreMode } from '../../brush3d/src/index.ts';

const STORED = 'shores-choice';
const ORDER: readonly ShoreMode[] = ['organic', 'gentle', 'off'];
const isShoreMode = (v: string): v is ShoreMode => (SHORE_MODES as readonly string[]).includes(v);

/** The shores shown: the URL's, else the last one picked, else brush3d's own (LAND_LOOK). */
function picked(): ShoreMode {
  let v = new URLSearchParams(location.search).get('shores') ?? '';
  try {
    if (!isShoreMode(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isShoreMode(v) ? v : LAND_LOOK.shores;
}

let current: ShoreMode = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (mode: ShoreMode) => void = () => {};
let made = false;

/** The shores shown (the comparison's choice). */
export function shoresLook(): ShoreMode { return current; }

/** The button, in the HUD's row once it's there; `changed` is called after each click, to paint the land again. */
export function shoresChoice(changed: (mode: ShoreMode) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn shores-choice';
  b.title = 'Shores (#258): organic (curving, wandering a little), gentle (curving, smooth), or off (as before: the tiles’ squares). Click to cycle';
  const show = () => { b.textContent = `Shores: ${current}`; };
  show();
  b.onclick = () => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    try { localStorage.setItem(STORED, current); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('shores', current);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    show();
    onChange(current);
  };
  // The HUD is built when a commission starts (and again for the next): keep the button in its row while there is one.
  const place = () => {
    const row = document.querySelector('.hud-top .panels');
    if (row && b.parentElement !== row) row.append(b);
  };
  // (The HUD's root is added to the body whole, its row already in it, so the body's own children are enough to watch.)
  new MutationObserver(place).observe(document.body, { childList: true });
  place();
}
