import type { BrushRenderer } from '../../../brush3d/src/index.ts';

// The ground's brush, live or baked: the look candidates for #210 (removed with the one not picked, once the developer
// picks). Baked, the ground's brush marks are worked out once at load into a 4096² texture over the land (64 MB) and read
// from it, rather than worked out afresh in every pixel every frame: about 6 ms a frame less on the RX 570 (a third of
// it), and more on the laptop, where the ground's paint costs the most. The light, the shadows and the weather stay live,
// as do a cliff's faces and the country past the land. It differs from live a little: the dabs' and strokes' fine detail
// (each texel 16 cm), the soft edges of long evening shadows, and the pale line where the land meets the water, which is
// fainter on baked ground (the demo's look). A button in the HUD's row of panel buttons flips between them (at once, no
// reload), as `?fields=live|baked` does; the pick is remembered.

const CHOICES = ['live', 'baked'] as const;
type Fields = (typeof CHOICES)[number];
const PICKED = 'brush3d.fields';
/** The texture's side when baked: 16 cm a texel over the game's land (about 640 m). */
const SIZE = 4096;

function picked(): Fields {
  const asked = new URLSearchParams(location.search).get('fields');
  let pick: string | null = (CHOICES as readonly string[]).includes(asked ?? '') ? asked : null;
  try {
    if (pick) localStorage.setItem(PICKED, pick);
    else pick = localStorage.getItem(PICKED);
  } catch { /* the URL carries it */ }
  return (CHOICES as readonly string[]).includes(pick ?? '') ? (pick as Fields) : 'live';
}

/** The pick applied to the renderer (after the land is built), and its button. */
export function fieldsChoice(r: BrushRenderer) {
  let now = picked();
  const apply = () => { r.setFields('ground', now === 'baked' ? SIZE : 0); };
  apply();
  const b = document.createElement('button');
  b.className = 'cd-panelbtn fields-choice';
  const label = () => { b.textContent = `Ground: ${now}`; };
  label();
  b.title = 'The ground\'s brush worked out live in every pixel, or baked once at load (cheaper): click for the other';
  b.onclick = () => {
    now = now === 'live' ? 'baked' : 'live';
    try { localStorage.setItem(PICKED, now); } catch { /* not kept */ }
    const url = new URL(location.href);
    url.searchParams.set('fields', now);
    history.replaceState(history.state, '', url);
    apply(); label();
  };
  setTimeout(() => {
    const row = document.querySelector('.hud-top .panels');
    if (row) { row.append(b); return; }
    // No HUD row (it changed shape): in the top's middle instead.
    Object.assign(b.style, { position: 'fixed', left: '50%', top: '28px', transform: 'translateX(-50%)', zIndex: '50' });
    document.body.append(b);
  });
}
