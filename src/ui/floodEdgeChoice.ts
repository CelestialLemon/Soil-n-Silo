// #287's comparison, for the developer to judge on the PR's preview (removed before the PR merges): how the water's edge is
// drawn where a flood creeps over flat ground (brush3d's FLOOD_EDGE_LOOKS): `soft` (rounded and wavering, thinning out
// into the grass, the grass past it wet, no pale foam line under muddy water), `ragged` (rounded and wavering further, but
// crisp), or `off` (as before #287: straight runs and corners along the water's triangles, a pale rim). A URL option
// (`?floodedge=off|soft|ragged`, default `soft`), kept for reloads and remembered for the next visit, and a button in the
// HUD's row of panel buttons (top right) that cycles between them, the water redrawn at once.

import { FLOOD_EDGE_LOOKS, type FloodEdgeLook } from '../../brush3d/src/index.ts';

const STORED = 'floodedge-choice';
const ORDER: readonly FloodEdgeLook[] = ['soft', 'ragged', 'off'];
const isLook = (v: string): v is FloodEdgeLook => (FLOOD_EDGE_LOOKS as readonly string[]).includes(v);

/** The look shown: the URL's, else the last one picked, else `soft`. */
function picked(): FloodEdgeLook {
  let v = new URLSearchParams(location.search).get('floodedge') ?? '';
  try {
    if (!isLook(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isLook(v) ? v : 'soft';
}

let current: FloodEdgeLook = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (look: FloodEdgeLook) => void = () => {};
let made = false;

/** The look shown (the comparison's choice). */
export function floodEdgeLook(): FloodEdgeLook { return current; }

/** The button, in the HUD's row once it's there; `changed` is called after each click, to redraw the water. */
export function floodEdgeChoice(changed: (look: FloodEdgeLook) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn floodedge-choice';
  b.title = 'Flood edge (#287): soft (rounded, thinning into the grass), ragged (rounded and crisp), or off (as before). Click to cycle';
  const show = () => { b.textContent = `Flood edge: ${current}`; };
  show();
  b.onclick = () => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    try { localStorage.setItem(STORED, current); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('floodedge', current);
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
