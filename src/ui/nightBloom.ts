// #288's comparison, for the developer to pick on the PR's preview (removed before the PR merges, with the options not
// picked): how spring's pale wildflowers sit in the dark meadow at night. `off` as before #288; `settle` (brush3d's
// `r.bloomsAtNight`) the blooms dimmer and less vivid from dusk, by day as before; `pale` the white and yellow swatches
// paler day and night (grassMask.ts's PALE_SWATCHES). A URL option (`?nightbloom=off|settle|pale`), kept for the game's
// own reloads and remembered for the next visit, and a button in the HUD's row of panel buttons (top right) that says
// which is shown and switches to the next.

export const NIGHT_BLOOMS = ['off', 'settle', 'pale'] as const;
export type NightBloom = (typeof NIGHT_BLOOMS)[number];

const STORED = 'nightbloom-choice';
const isChoice = (v: string | null): v is NightBloom => (NIGHT_BLOOMS as readonly (string | null)[]).includes(v);

/** The choice: the URL's, else the last one picked, else `settle`. */
function picked(): NightBloom {
  const v = new URLSearchParams(location.search).get('nightbloom');
  try {
    if (isChoice(v)) { localStorage.setItem(STORED, v); return v; }
    const kept = localStorage.getItem(STORED);
    if (isChoice(kept)) return kept;
  } catch { /* no storage: the URL's or the default */ }
  return isChoice(v) ? v : 'settle';
}

let choice = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (c: NightBloom) => void = () => {};
let made = false;

/** How the blooms are shown at night (the comparison's choice). */
export function nightBloom() { return choice; }

/** The button, in the HUD's row once it's there; `changed` is called after each click with the choice. */
export function nightBloomChoice(changed: (c: NightBloom) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn nightbloom-choice';
  b.title = 'How spring’s pale wildflowers sit in the dark at night (#288): off as before, settle (dimmer at night), or pale swatches. Click for the next';
  const show = () => { b.textContent = `Night blooms: ${choice}`; };
  show();
  b.onclick = () => {
    choice = NIGHT_BLOOMS[(NIGHT_BLOOMS.indexOf(choice) + 1) % NIGHT_BLOOMS.length];
    try { localStorage.setItem(STORED, choice); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('nightbloom', choice);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    show();
    onChange(choice);
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
