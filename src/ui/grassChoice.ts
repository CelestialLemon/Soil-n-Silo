// #256's look comparison, for the developer to judge on the PR's preview (removed before the PR merges): meadow grass
// tufts across open grass at three densities (`quiet`, `meadow`, `lush`), or `off` as on `dev` for an instant A/B and
// frame-rate baseline. A URL option (`?grass=off|quiet|meadow|lush`), kept for reloads and remembered for the next
// visit, and a button in the HUD's row of panel buttons (top right) that says which is shown and cycles through them.

export const GRASS_MODES = ['off', 'quiet', 'meadow', 'lush'] as const;
export type GrassMode = (typeof GRASS_MODES)[number];

const STORED = 'grass-choice';
const isMode = (v: string): v is GrassMode => (GRASS_MODES as readonly string[]).includes(v);

/** Which grass density is picked: the URL's, else the last one picked, else `meadow`. */
function picked(): GrassMode {
  let v = new URLSearchParams(location.search).get('grass') ?? '';
  try {
    if (!isMode(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isMode(v) ? v : 'meadow';
}

let mode: GrassMode = picked();
/** Called after each click: the latest scene's, should the game make another. */
let onChange: (m: GrassMode) => void = () => {};
let made = false;

/** The current meadow grass look choice. */
export function grassMode(): GrassMode { return mode; }

/** The button, in the HUD's row once it's there; `changed` is called after each click to rebuild the grass in place. */
export function grassChoice(changed: (m: GrassMode) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn grass-choice';
  b.title = 'Meadow grass tufts (#256): off (baseline), quiet (sparser, lowest GPU cost), meadow (balanced default), or lush (denser). Click to cycle';
  const show = () => { b.textContent = `Grass: ${mode}`; };
  show();
  b.onclick = () => {
    mode = GRASS_MODES[(GRASS_MODES.indexOf(mode) + 1) % GRASS_MODES.length];
    try { localStorage.setItem(STORED, mode); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('grass', mode);
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
