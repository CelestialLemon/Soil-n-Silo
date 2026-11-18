// #251's comparison, for the developer to judge on the PR's preview (removed before the PR merges): the Graphics level as
// #251 makes it, the sun's shadow's detail capped at noon's (brush3d's Quality.shadowCap) and, at Medium and Low, the
// water's reflection at half size; or as it was before, the whole shadow map whatever the hour (High 4096², Medium and
// Low 2048²) and the reflection at its full size. A URL option (`?shadowcap=on|off`), kept for the game's own reloads
// and remembered for the next visit, and a button in the HUD's row of panel buttons (top right) that says which is shown
// and switches.

const STORED = 'shadowcap-choice';

/** Whether the shadow is capped: the URL's, else the last one picked, else capped. */
function picked(): boolean {
  let v = new URLSearchParams(location.search).get('shadowcap') ?? '';
  try {
    if (v !== 'on' && v !== 'off') v = localStorage.getItem(STORED) ?? '';
    else localStorage.setItem(STORED, v);
  } catch { /* no storage: the URL's or the default */ }
  return v !== 'off';
}

let capped = picked();
/** Called after each click: the latest renderer's, should the game make another. */
let onChange = () => {};
let made = false;

/** Whether the shadow's detail is capped (the comparison's choice). */
export function shadowCapped() { return capped; }

/** The button, in the HUD's row once it's there; `changed` is called after each click, to send the quality again. */
export function shadowCapChoice(changed: () => void) {
  onChange = changed;
  if (made) return;
  made = true;
  const b = document.createElement('button');
  b.className = 'cd-panelbtn shadowcap-choice';
  b.title = 'The Graphics level with #251 (the sun’s shadow capped at noon’s detail; at Medium and Low the reflection at half size), or as before. Click to switch';
  const show = () => { b.textContent = `#251: ${capped ? 'on' : 'as before'}`; };
  show();
  b.onclick = () => {
    capped = !capped;
    const v = capped ? 'on' : 'off';
    try { localStorage.setItem(STORED, v); } catch { /* the URL carries it */ }
    // In the URL too, so a reload keeps it.
    const q = new URLSearchParams(location.search);
    q.set('shadowcap', v);
    history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
    show();
    onChange();
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
