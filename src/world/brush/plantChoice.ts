import { CROP_LOOKS, PINE_LOOKS, PLANT_LOOKS, WILLOW_LOOKS, type PlantLooks } from '../../../brush3d/src/index.ts';

// #213's look candidates on the page, for the developer to pick (removed with the ones not picked before the PR merges):
// how a field's crop is laid, and the pine's and the willow's shapes. Each is a URL option (`?crops=rows|blanket`,
// `?pine=spire|cone|scots`, `?willow=weeping|pollard`, or a, b, c in that order), kept for the game's own reloads and
// remembered for the next visit, and a button in the HUD's row of panel buttons (top right) that says which is shown and
// steps to the next. The world is painted once, at the start, so a pick reloads the page.

const CHOICES = { crops: CROP_LOOKS, pine: PINE_LOOKS, willow: WILLOW_LOOKS } as const;
type Choice = keyof typeof CHOICES;
const NAMES: Record<Choice, string> = { crops: 'Crops', pine: 'Pine', willow: 'Willow' };
const stored = (k: Choice) => `brush3d-${k}`;

/** The candidate asked for (by name or letter), else the last one picked, else the default. */
function picked<K extends Choice>(k: K): PlantLooks[K] {
  const list = CHOICES[k] as readonly string[], q = new URLSearchParams(location.search).get(k) ?? '';
  let v = list.includes(q) ? q : list['abc'.indexOf(q)] ?? '';
  try {
    if (!v) v = localStorage.getItem(stored(k)) ?? '';
    else localStorage.setItem(stored(k), v);
  } catch { /* no storage: the URL's or the default */ }
  return (list.includes(v) ? v : PLANT_LOOKS[k]) as PlantLooks[K];
}

function pick(k: Choice, v: string) {
  try { localStorage.setItem(stored(k), v); } catch { /* the URL carries it */ }
  const q = new URLSearchParams(location.search);
  q.set(k, v);
  location.search = q.toString();
}

/** The looks picked, and their buttons put in the HUD (built just after the scene, so a moment later). */
export function plantChoice(): PlantLooks {
  const looks: PlantLooks = { crops: picked('crops'), pine: picked('pine'), willow: picked('willow') };
  const buttons = (Object.keys(CHOICES) as Choice[]).map((k) => {
    const list = CHOICES[k] as readonly string[], at = list.indexOf(looks[k]), b = document.createElement('button');
    b.className = 'cd-panelbtn plant-choice';
    b.textContent = `${NAMES[k]}: ${'ABC'[at]} ${looks[k]}`;
    b.title = `${NAMES[k]}'s look (${list.map((v, i) => `${'ABC'[i]} ${v}`).join(' / ')}): click for the next`;
    b.onclick = () => pick(k, list[(at + 1) % list.length]);
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
  return looks;
}
