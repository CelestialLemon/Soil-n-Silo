// #266's look comparison, for the developer to judge on the PR's preview (removed before the PR merges): the meadow's
// wildflowers at three densities (`subtle`, `meadow`, `lush`), or `off` for an instant A/B and frame-rate baseline. A URL
// option (`?flowers=off|subtle|meadow|lush`), kept for reloads and remembered for the next visit, and a button in the HUD's
// row of panel buttons (top right) that says which is shown and cycles through them. Modelled on grassChoice.ts (#256).

import { FLOWER_MODES, type FlowerMode } from '../world/brush/grassMask.ts';

const STORED = 'flower-choice';
const isMode = (v: string): v is FlowerMode => (FLOWER_MODES as readonly string[]).includes(v);

/** Which flower density is picked: the URL's, else the last one picked, else `meadow`. */
function picked(): FlowerMode {
  let v = new URLSearchParams(location.search).get('flowers') ?? '';
  try {
    if (!isMode(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isMode(v) ? v : 'meadow';
}

let mode: FlowerMode = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (m: FlowerMode) => void = () => {};
let made = false;

/** The current wildflower look choice. */
export function flowerMode(): FlowerMode { return mode; }

/** The button, in the HUD's row once it's there; `changed` is called after each click to rebuild the flowers in place. */
export function flowerChoice(changed: (m: FlowerMode) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn flower-choice';
  b.title = 'Wildflowers (#266): off (baseline), subtle (few, small drifts), meadow (balanced default), or lush (more, bigger drifts). None bloom in winter. Click to cycle';
  const show = () => { b.textContent = `Flowers: ${mode}`; };
  show();
  b.onclick = () => {
    mode = FLOWER_MODES[(FLOWER_MODES.indexOf(mode) + 1) % FLOWER_MODES.length];
    try { localStorage.setItem(STORED, mode); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('flowers', mode);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    show();
    onChange(mode);
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
