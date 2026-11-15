import type { BrushRenderer } from '../../../brush3d/src/index.ts';

// #205's look candidates on the page, for the developer to pick (removed with the ones not picked before the PR merges):
// the farm's lights at night, and the smoke from its chimneys. A working building's lamps and fires glow from dusk in
// all three night looks; they differ in what else lights up. Each is a URL option (`?glow=lamps|windows|pools`,
// `?smoke=none|wisps|puffs`, or a, b, c in that order), kept for the game's own reloads and remembered for the next
// visit, and a button in the HUD's row of panel buttons (top right) that says which is shown and steps to the next.

const GLOW = {
  // A: its lamps and fires only.
  lamps: { windows: false, pools: false },
  // B: its windows lit too, a warm lamplight in the sea-glass panes, while it works.
  windows: { windows: true, pools: false },
  // C: and pools of that light on the ground and walls round each.
  pools: { windows: true, pools: true },
} as const;
const SMOKE = { none: 'none', wisps: 'wisps', puffs: 'puffs' } as const;

const CHOICES = { glow: GLOW, smoke: SMOKE } as const;
type Choice = keyof typeof CHOICES;
const NAMES: Record<Choice, string> = { glow: 'Night', smoke: 'Smoke' };
const DEFAULT: Record<Choice, string> = { glow: 'lamps', smoke: 'none' };
const stored = (k: Choice) => `brush3d-glow-${k}`;

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

/** The looks picked, applied now and on each click of their buttons (put in the HUD a moment later). */
export function glowChoice(r: Pick<BrushRenderer, 'setNightLights' | 'setSmoke'>) {
  const names: Record<Choice, string> = { glow: picked('glow'), smoke: picked('smoke') };
  const show = () => {
    r.setNightLights(GLOW[names.glow as keyof typeof GLOW]);
    r.setSmoke(SMOKE[names.smoke as keyof typeof SMOKE]);
  };
  show();
  const buttons = (Object.keys(CHOICES) as Choice[]).map((k) => {
    const list = Object.keys(CHOICES[k]), b = document.createElement('button');
    const label = () => { b.textContent = `${NAMES[k]}: ${'ABC'[list.indexOf(names[k])]} ${names[k]}`; };
    b.className = 'cd-panelbtn glow-choice';
    b.title = `${NAMES[k]}'s look (${list.map((v, i) => `${'ABC'[i]} ${v}`).join(' / ')}): click for the next`;
    label();
    b.onclick = () => {
      names[k] = list[(list.indexOf(names[k]) + 1) % list.length];
      try { localStorage.setItem(stored(k), names[k]); } catch { /* the URL carries it */ }
      // In the URL too, so a reload keeps it.
      const q = new URLSearchParams(location.search);
      q.set(k, names[k]);
      history.replaceState(null, '', `${location.pathname}?${q.toString()}${location.hash}`);
      label();
      show();
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
