// #210's look candidates for the interface's panels, for the developer to pick on the preview (removed with the ones not
// picked before the PR merges). The panels (cards, the HUD's pills, the view bar, the problems strip) are 94% opaque chalk
// over a blur of the map behind them, "frosted glass". On a Mac the blur makes Chrome wait for the finished picture every
// frame before it can show it (#210: c4 on the MacBook Air 33 fps with it, 43 without). The candidates:
// - A frosted: as now, the map blurred behind the 6% that shows through;
// - B clear: no blur, the 6% shows the map sharp;
// - C solid: no blur, fully opaque chalk.
// The sheets' scrim (its blur shows only while the game is stopped under a sheet) is left as it is in all three.
// A URL option (`?glass=frosted|clear|solid`, or a, b, c), kept for the game's own reloads and remembered for the next
// visit, and a button in the HUD's row of panel buttons (top right) that says which is shown and steps to the next.

const GLASS = ['frosted', 'clear', 'solid'] as const;
type Glass = typeof GLASS[number];
const STORED = 'glass-choice';
const PANELS = '.cd-card:not(.is-ink), .cd-pill, .cd-viewbar, .cd-pstrip';

const CSS = `
html.glass-clear :is(${PANELS}), html.glass-solid :is(${PANELS}) { backdrop-filter: none !important; }
html.glass-solid :is(${PANELS}) { background: var(--chalk) !important; }
`;

/** The candidate asked for (by name or letter), else the last one picked, else as now. */
function picked(): Glass {
  const q = new URLSearchParams(location.search).get('glass') ?? '';
  const letter = q.length === 1 ? 'abc'.indexOf(q) : -1;
  let v: string = (GLASS as readonly string[]).includes(q) ? q : (GLASS[letter] ?? '');
  try {
    if (!v) v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return (GLASS as readonly string[]).includes(v) ? v as Glass : 'frosted';
}

/** The look picked, applied now and on each click of its button (put in the HUD's row once it's there). */
export function glassChoice() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  let glass = picked();
  const b = document.createElement('button');
  b.className = 'cd-panelbtn glass-choice';
  b.title = `The panels' look (${GLASS.map((v, i) => `${'ABC'[i]} ${v}`).join(' / ')}): click for the next`;
  const show = () => {
    for (const v of GLASS) document.documentElement.classList.toggle(`glass-${v}`, v === glass);
    b.textContent = `Glass: ${'ABC'[GLASS.indexOf(glass)]} ${glass}`;
  };
  show();
  b.onclick = () => {
    glass = GLASS[(GLASS.indexOf(glass) + 1) % GLASS.length];
    try { localStorage.setItem(STORED, glass); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('glass', glass);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    show();
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
