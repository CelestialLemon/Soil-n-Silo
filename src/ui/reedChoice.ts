// #267's look comparison, for the developer to judge on the PR's preview (removed before the PR merges): the reeds along
// the water's edge at two densities (`sparse`, `lush`), or `off` for an instant A/B and frame-rate baseline. A URL option
// (`?reeds=off|sparse|lush`), kept for reloads and remembered for the next visit, and a button in the HUD's row of panel
// buttons (top right) that says which is shown and cycles through them. Modelled on flowerChoice.ts (#266).

import { REED_MODES, type ReedMode } from '../world/brush/grassMask.ts';

const STORED = 'reed-choice';
const isMode = (v: string): v is ReedMode => (REED_MODES as readonly string[]).includes(v);

/** Which reed density is picked: the URL's, else the last one picked, else `lush`. */
function picked(): ReedMode {
  let v = new URLSearchParams(location.search).get('reeds') ?? '';
  try {
    if (!isMode(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isMode(v) ? v : 'lush';
}

let mode: ReedMode = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (m: ReedMode) => void = () => {};
let made = false;

/** The current reed look choice. */
export function reedMode(): ReedMode { return mode; }

/** The button, in the HUD's row once it's there; `changed` is called after each click to rebuild the reeds in place. */
export function reedChoice(changed: (m: ReedMode) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn reed-choice';
  b.title = 'Reeds along the water (#267): off (baseline), sparse (beds here and there), or lush (longer, thicker beds, the default). Click to cycle';
  const show = () => { b.textContent = `Reeds: ${mode}`; };
  show();
  b.onclick = () => {
    mode = REED_MODES[(REED_MODES.indexOf(mode) + 1) % REED_MODES.length];
    try { localStorage.setItem(STORED, mode); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('reeds', mode);
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
