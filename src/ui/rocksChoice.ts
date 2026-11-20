// #257's comparison, for the developer to judge on the PR's preview (removed before the PR merges): clustered natural rock
// outcrops in two styles (`soft` calm mossy crags, `bold` taller faceted crags with richer talus), or `off` (as before #257:
// one or two centred round stones per rock tile). A URL option (`?rocks=off|soft|bold`, default `soft`), kept for reloads
// and remembered for the next visit, and a button in the HUD's row of panel buttons (top right) that cycles between them.

import type { RocksLook } from '../world/brush/rockPlan.ts';

const STORED = 'rocks-choice';
const ORDER: readonly RocksLook[] = ['soft', 'bold', 'off'];
const isRocksLook = (v: string): v is RocksLook => v === 'off' || v === 'soft' || v === 'bold';

/** The active rocks look: the URL's, else the last one picked, else `soft`. */
function picked(): RocksLook {
  let v = new URLSearchParams(location.search).get('rocks') ?? '';
  try {
    if (!isRocksLook(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isRocksLook(v) ? v : 'soft';
}

let current: RocksLook = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (look: RocksLook) => void = () => {};
let made = false;

/** The active rocks look (the comparison's choice). */
export function rocksLook(): RocksLook { return current; }

/** The button, in the HUD's row once it's there; `changed` is called after each click to rebuild the rocks live. */
export function rocksChoice(changed: (look: RocksLook) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn rocks-choice';
  b.title = 'Rock outcrops (#257): soft (calm clustered crags), bold (taller faceted crags & talus), or off (as before). Click to cycle';
  const show = () => { b.textContent = `Rocks: ${current}`; };
  show();
  b.onclick = () => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    try { localStorage.setItem(STORED, current); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('rocks', current);
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
