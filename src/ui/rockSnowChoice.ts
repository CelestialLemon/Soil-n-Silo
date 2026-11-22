// #286's comparison, for the developer to judge on the PR's preview (removed before the PR merges): how the snow lies on the
// rocks (brush3d's ROCK_SNOW_LOOKS): `patchy` (less settles on stone, so its shoulders and ridges show round a cap, and the
// drifts bank lower at its foot), `shaded` (the snow on stone a little cooler than the field's, a cool shade at its foot),
// `both`, or `off` (as before #286: as on everything else). A URL option (`?rocksnow=off|patchy|shaded|both`, default
// `both`), kept for reloads and remembered for the next visit, and a button in the HUD's row of panel buttons (top right)
// that cycles between them, the rocks repainted at once.

import { ROCK_SNOW_LOOKS, type RockSnowLook } from '../../brush3d/src/index.ts';

const STORED = 'rocksnow-choice';
const ORDER: readonly RockSnowLook[] = ['both', 'patchy', 'shaded', 'off'];
const isLook = (v: string): v is RockSnowLook => (ROCK_SNOW_LOOKS as readonly string[]).includes(v);

/** The look shown: the URL's, else the last one picked, else `both`. */
function picked(): RockSnowLook {
  let v = new URLSearchParams(location.search).get('rocksnow') ?? '';
  try {
    if (!isLook(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isLook(v) ? v : 'both';
}

let current: RockSnowLook = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (look: RockSnowLook) => void = () => {};
let made = false;

/** The look shown (the comparison's choice). */
export function rockSnowLook(): RockSnowLook { return current; }

/** The button, in the HUD's row once it's there; `changed` is called after each click, to repaint the rocks. */
export function rockSnowChoice(changed: (look: RockSnowLook) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn rocksnow-choice';
  b.title = 'Snow on rocks (#286): both, patchy (less snow on stone, its shoulders showing), shaded (cooler snow on stone, a shadow at its foot), or off (as before). Click to cycle';
  const show = () => { b.textContent = `Rock snow: ${current}`; };
  show();
  b.onclick = () => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    try { localStorage.setItem(STORED, current); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('rocksnow', current);
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
