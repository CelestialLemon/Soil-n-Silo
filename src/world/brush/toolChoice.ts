import { HIGHLIGHT_LOOK, OVERLAY_LOOK, PREVIEW_LOOK } from '../../../brush3d/src/index.ts';
import { TOOL_LOOKS, type ToolLooks } from './tools.ts';

// #206's look candidates on the page, for the developer to pick (removed with the ones not picked before the PR merges):
// how a highlighted thing shows, how a building being placed and its frame show, and how an overlay lies on the land. Each
// is a URL option (`?highlight=outline|halo|gold`, `?preview=glass|solid|blueprint`, `?overlay=wash|bold|rims`, or a, b,
// c in that order), kept for the game's own reloads and remembered for the next visit, and a button in the HUD's row of
// panel buttons (top right) that says which is shown and steps to the next. They're the renderer's uniforms, so a pick
// shows at once, without a reload.

const HIGHLIGHT = {
  // A: a crisp light outline round what shows of the thing, the thing a little brighter (the groundwork's).
  outline: HIGHLIGHT_LOOK,
  // B: a soft warm halo fading out round it, the thing a touch brighter.
  halo: { color: 0xfff4d6, width: 9, glow: 1, fill: 0.35 },
  // C: a bold gold outline, the thing as it is.
  gold: { color: 0xffc23d, width: 3.5, glow: 0, fill: 0 },
} satisfies Record<string, ToolLooks['highlight']>;

const PREVIEW = {
  // A: see-through glass in the state's colour, a thin frame round the footprint (the groundwork's).
  glass: { look: PREVIEW_LOOK, frame: { width: 0.25, corners: 0 } },
  // B: nearly solid, the model's own colours lightly tinted, a bold frame.
  solid: { look: { ...PREVIEW_LOOK, tint: 0.22, opacity: 0.92 }, frame: { width: 0.45, corners: 0 } },
  // C: a blueprint: a faint body all in the state's colour, solid level lines across it, brackets at the footprint's corners.
  blueprint: { look: { ...PREVIEW_LOOK, fits: 0x9dffc0, blocked: 0xff6a50, tint: 1, opacity: 0.28, shade: 0.4, lines: 1 }, frame: { width: 0.35, corners: 0.3 } },
} satisfies Record<string, { look: ToolLooks['preview']; frame: ToolLooks['frame'] }>;

const OVERLAY = {
  // A: a wash in the land's own light and shade, a dark line between colours (the groundwork's).
  wash: { look: OVERLAY_LOOK, strength: 0.6 },
  // B: bold: strong flat colour, as in full sun wherever it lies (night and fog still fall on it), a firm line between colours.
  bold: { look: { lit: 0, edge: 0.5, rim: 0 }, strength: 0.85 },
  // C: a light wash, and a wide band of the colour round the inside of each region's border.
  rims: { look: { lit: 1, edge: 0.25, rim: 1.2 }, strength: 0.3 },
} satisfies Record<string, ToolLooks['overlay']>;

const CHOICES = { highlight: HIGHLIGHT, preview: PREVIEW, overlay: OVERLAY } as const;
type Choice = keyof typeof CHOICES;
const NAMES: Record<Choice, string> = { highlight: 'Highlight', preview: 'Preview', overlay: 'Overlay' };
const DEFAULT: Record<Choice, string> = { highlight: 'outline', preview: 'glass', overlay: 'wash' };
const stored = (k: Choice) => `brush3d-tools-${k}`;

/** The candidate asked for (by name or letter), else the last one picked, else the default. */
function picked(k: Choice): string {
  const list = Object.keys(CHOICES[k]), q = new URLSearchParams(location.search).get(k) ?? '';
  const letter = q.length === 1 ? 'abc'.indexOf(q) : -1;
  let v = list.includes(q) ? q : (list[letter] ?? '');
  try {
    if (!v) v = localStorage.getItem(stored(k)) ?? '';
    else localStorage.setItem(stored(k), v);
  } catch { /* no storage: the URL's or the default */ }
  return list.includes(v) ? v : DEFAULT[k];
}

function looksOf(names: Record<Choice, string>): ToolLooks {
  const p = PREVIEW[names.preview as keyof typeof PREVIEW], o = OVERLAY[names.overlay as keyof typeof OVERLAY];
  return { ...TOOL_LOOKS, highlight: HIGHLIGHT[names.highlight as keyof typeof HIGHLIGHT], preview: p.look, frame: p.frame, overlay: o };
}

/** The looks picked, applied with `apply` now and on each click of their buttons (put in the HUD a moment later). */
export function toolChoice(apply: (looks: ToolLooks) => void) {
  const names = { highlight: picked('highlight'), preview: picked('preview'), overlay: picked('overlay') };
  apply(looksOf(names));
  const buttons = (Object.keys(CHOICES) as Choice[]).map((k) => {
    const list = Object.keys(CHOICES[k]), b = document.createElement('button');
    const label = () => {
      const at = list.indexOf(names[k]);
      b.textContent = `${NAMES[k]}: ${'ABC'[at]} ${names[k]}`;
    };
    b.className = 'cd-panelbtn tool-choice';
    b.title = `${NAMES[k]}'s look (${list.map((v, i) => `${'ABC'[i]} ${v}`).join(' / ')}): click for the next`;
    label();
    b.onclick = () => {
      names[k] = list[(list.indexOf(names[k]) + 1) % list.length];
      try { localStorage.setItem(stored(k), names[k]); } catch { /* the URL carries it */ }
      // In the URL too, so a reload (and the menu's links, which keep the page's options) keeps it.
      const q = new URLSearchParams(location.search);
      q.set(k, names[k]);
      history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
      label();
      apply(looksOf(names));
    };
    return b;
  });
  setTimeout(() => {
    const row = document.querySelector('.hud-top .panels');
    if (row) { row.append(...buttons); return; }
    // No HUD row (it changed shape): along the top's middle instead.
    const bar = document.createElement('div');
    Object.assign(bar.style, { position: 'fixed', left: '50%', top: '28px', transform: 'translateX(-50%)', zIndex: '50', display: 'flex', gap: '6px' });
    bar.append(...buttons);
    document.body.append(bar);
  });
}
