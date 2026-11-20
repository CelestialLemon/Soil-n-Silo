import { LAND_BORDERS, LAND_LOOK, type LandBorder } from '../../brush3d/src/index.ts';

// #269's comparison, for the developer to pick on the PR's preview (removed before the PR merges, the land then drawn
// with brush3d's LAND_LOOK.border set to the pick): how the map's edge meets the duller country round it (brush3d's
// LandBorder): `off` as before #269, a straight cut a tile wide; `feathered` (the default) a soft fade over about two
// tiles outside the map; `organic` the same fade with a wandering, brush-like outer edge. A URL option
// (`?border=off|feathered|organic`), kept for the game's own reloads and remembered for the next visit, and a button in
// the HUD's row of panel buttons (top right) that says which is shown and switches to the next.

const STORED = 'border-choice';
const isBorder = (v: string | null): v is LandBorder => (LAND_BORDERS as readonly (string | null)[]).includes(v);

/** The border: the URL's, else the last one picked, else LAND_LOOK's. */
function picked(): LandBorder {
  const v = new URLSearchParams(location.search).get('border');
  try {
    if (isBorder(v)) { localStorage.setItem(STORED, v); return v; }
    const kept = localStorage.getItem(STORED);
    if (isBorder(kept)) return kept;
  } catch { /* no storage: the URL's or the default */ }
  return isBorder(v) ? v : LAND_LOOK.border;
}

let border = picked();
/** Called after each click: the latest land's, should the game make another. */
let onChange: (b: LandBorder) => void = () => {};
let made = false;

/** The border the land is drawn with (the comparison's choice). */
export function landBorder() { return border; }

/** The button, in the HUD's row once it's there; `changed` is called after each click with the border picked. */
export function borderChoice(changed: (b: LandBorder) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn border-choice';
  b.title = 'How the map’s edge meets the duller country (#269): off as before, feathered, or organic. Click for the next';
  const show = () => { b.textContent = `Border: ${border}`; };
  show();
  b.onclick = () => {
    border = LAND_BORDERS[(LAND_BORDERS.indexOf(border) + 1) % LAND_BORDERS.length];
    try { localStorage.setItem(STORED, border); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('border', border);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    show();
    onChange(border);
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
