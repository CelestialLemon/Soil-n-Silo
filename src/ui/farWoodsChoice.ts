import { FAR_WOODS_MODES, type FarWoodsMode } from '../../brush3d/src/index.ts';

// #268's comparison, for the developer to judge on the PR's preview (removed before the PR merges): how the far woods
// (the country's woods beyond the map, brush3d's addCanopy) are painted. `frosted`: in winter, bare woods as a fan of pale
// plum-grey twig strokes with the snow between them, pines as frosted spruce cones; `misty`: in winter, bare woods as soft
// pale blue-grey masses; both, in the other seasons, pines as cones, poplars as columns and the crowns' undersides lifted.
// `off`: as before #268. A URL option (`?farwoods=frosted|misty|off`), kept for the game's own reloads and remembered for
// the next visit, and a button in the HUD's row of panel buttons (top right) that says which is shown and cycles through
// them.

const STORED = 'farwoods-choice';
const ORDER: readonly FarWoodsMode[] = ['frosted', 'misty', 'off'];
const isMode = (v: string): v is FarWoodsMode => (FAR_WOODS_MODES as readonly string[]).includes(v);

/** Which far-woods look is active: the URL's, else the last one picked, else frosted. */
function picked(): FarWoodsMode {
  let v = new URLSearchParams(location.search).get('farwoods') ?? '';
  try {
    if (!isMode(v)) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return isMode(v) ? v : 'frosted';
}

let current: FarWoodsMode = picked();
/** Called after each click: the latest world's, should the game make another. */
let onChange: (mode: FarWoodsMode) => void = () => {};
let made = false;

/** Which far-woods look is currently picked (the comparison's choice). */
export function farWoodsMode(): FarWoodsMode { return current; }

/** The button, in the HUD's row once it's there; `changed` is called after each click to rebuild far-wood canopies live. */
export function farWoodsChoice(changed: (mode: FarWoodsMode) => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn farwoods-choice';
  b.title = 'How the far woods are painted (#268): frosted (twig strokes with snow between), misty (soft pale masses), or off (as before). Click to cycle';
  const show = () => { b.textContent = `Far woods: ${current}`; };
  show();
  b.onclick = () => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    try { localStorage.setItem(STORED, current); } catch { /* the URL carries it */ }
    // In the URL too, so a reload or menu navigation keeps it.
    const q = new URLSearchParams(location.search);
    q.set('farwoods', current);
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
