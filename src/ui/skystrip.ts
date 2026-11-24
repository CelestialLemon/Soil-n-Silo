// The sky strip, top right: a small day dial (the sun's dot runs round it; drag it to set the hour), the clock, quick
// jumps to dawn, noon, golden hour and dusk, the game speed, the weather, and turning the camera.
import { button, el, setFlag, setPressed, setText, setTitle } from './dom.ts';
import { icon, type IconName, setIcon } from './icons.ts';
import { SPEEDS, type Speed, type UiCallbacks, type UiSnapshot, type Weather, WEATHERS } from './types.ts';

export interface SkyStrip { element: HTMLElement; render(s: UiSnapshot): void }

const SVG = 'http://www.w3.org/2000/svg';
/** The dial's size and the sun's track radius, in its own units. */
const D = 44, R = 15;

const MOMENTS = [
  { id: 'dawn', label: 'Dawn', hour: 6 },
  { id: 'noon', label: 'Noon', hour: 12 },
  { id: 'golden', label: 'Golden hour', hour: 17.5 },
  { id: 'dusk', label: 'Dusk', hour: 19.75 },
] as const;

const WEATHER: Record<Weather, { label: string; icon: IconName }> = {
  clear: { label: 'Clear', icon: 'sun' },
  breeze: { label: 'Breeze', icon: 'breeze' },
  overcast: { label: 'Overcast', icon: 'overcast' },
  rain: { label: 'Showers', icon: 'rain' },
};

export function clock(hour: number): string {
  const mins = Math.floor((((hour % 24) + 24) % 24) * 60);
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
}

/** A plain name for the time of day. */
export function partOfDay(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h < 5) return 'Night';
  if (h < 7) return 'Dawn';
  if (h < 11) return 'Morning';
  if (h < 13.5) return 'Midday';
  if (h < 16.5) return 'Afternoon';
  if (h < 19) return 'Golden hour';
  if (h < 20.5) return 'Dusk';
  return 'Night';
}

/** Where the sun sits on the dial: midnight at the bottom, dawn on the left, noon at the top, dusk on the right. */
function sunAt(hour: number): { x: number; y: number } {
  const a = (hour / 24) * Math.PI * 2;
  return { x: D / 2 - R * Math.sin(a), y: D / 2 + R * Math.cos(a) };
}

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

export function createSkyStrip(cb: UiCallbacks): SkyStrip {
  let last: UiSnapshot | null = null;
  let shownMinute = -1;

  const strip = el('section', 'ui-sky ui-float');
  strip.setAttribute('aria-label', 'Sky and time');

  // The dial.
  const dial = svg('svg', { viewBox: `0 0 ${D} ${D}`, class: 'ui-dial', role: 'slider', tabindex: 0, 'aria-label': 'Time of day', 'aria-valuemin': 0, 'aria-valuemax': 24 });
  const c = D / 2;
  dial.append(
    svg('path', { d: `M${c - R - 4} ${c}A${R + 4} ${R + 4} 0 0 1 ${c + R + 4} ${c}Z`, class: 'ui-dial-day' }),
    svg('path', { d: `M${c - R - 4} ${c}A${R + 4} ${R + 4} 0 0 0 ${c + R + 4} ${c}Z`, class: 'ui-dial-night' }),
    svg('circle', { cx: c, cy: c, r: R, class: 'ui-dial-track' }),
    svg('line', { x1: c - R - 6, y1: c, x2: c + R + 6, y2: c, class: 'ui-dial-horizon' }),
  );
  const sun = svg('circle', { cx: c, cy: c - R, r: 4.2, class: 'ui-dial-sun' });
  dial.append(sun);

  const setFromPointer = (e: PointerEvent) => {
    const box = dial.getBoundingClientRect();
    const dx = e.clientX - (box.left + box.width / 2), dy = e.clientY - (box.top + box.height / 2);
    const a = Math.atan2(-dx, dy);
    const hour = ((((a / (Math.PI * 2)) * 24) % 24) + 24) % 24;
    cb.onSetHour(Math.round(hour * 4) / 4 % 24);
  };
  dial.addEventListener('pointerdown', (e) => { dial.setPointerCapture(e.pointerId); setFromPointer(e); e.preventDefault(); });
  dial.addEventListener('pointermove', (e) => { if (dial.hasPointerCapture(e.pointerId)) setFromPointer(e); });
  dial.addEventListener('keydown', (e) => {
    const step = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.25 : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.25 : 0;
    if (step === 0 || !last) return;
    e.preventDefault();
    e.stopPropagation();
    cb.onSetHour((last.hour + step + 24) % 24);
  });

  const time = el('div', 'ui-time');
  const clockText = el('span', 'ui-clock');
  const partText = el('span', 'ui-part');
  time.append(clockText, partText);

  // Dawn, noon, golden hour, dusk.
  const moments = el('div', 'ui-moments');
  moments.setAttribute('role', 'group');
  moments.setAttribute('aria-label', 'Jump to');
  for (const m of MOMENTS) {
    const b = button(`ui-moment ui-moment-${m.id}`, `${m.label} (${clock(m.hour)})`, () => cb.onSetHour(m.hour));
    b.append(el('span', 'ui-moment-dot'));
    moments.append(b);
  }

  // Speed.
  const speeds = el('div', 'ui-seg');
  speeds.setAttribute('role', 'group');
  speeds.setAttribute('aria-label', 'Speed');
  const speedBtns = new Map<Speed, HTMLButtonElement>();
  for (const sp of SPEEDS) {
    const b = button('ui-seg-btn', sp === 0 ? 'Pause' : `${sp}× speed`, () => cb.onSetSpeed(sp));
    if (sp === 0) b.append(icon('pause'));
    else b.textContent = `${sp}×`;
    speedBtns.set(sp, b);
    speeds.append(b);
  }

  // Weather: one chip that steps to the next sky.
  const weather = button('ui-chip ui-weather', 'Weather', () => {
    if (!last) return;
    const i = WEATHERS.indexOf(last.weather);
    cb.onSetWeather(WEATHERS[(i + 1) % WEATHERS.length] ?? 'clear');
  });
  const weatherIcon = icon('sun');
  const weatherText = el('span', '', 'Clear');
  weather.append(weatherIcon, weatherText);

  // Turning the camera.
  const turns = el('div', 'ui-turns');
  const turnLeft = button('ui-icon-btn', 'Turn the view left', () => cb.onStepYaw(-1));
  turnLeft.append(icon('turnLeft'));
  const turnRight = button('ui-icon-btn', 'Turn the view right', () => cb.onStepYaw(1));
  turnRight.append(icon('turnRight'));
  turns.append(turnLeft, turnRight);

  strip.append(dial, time, moments, el('span', 'ui-rule'), speeds, weather, el('span', 'ui-rule'), turns);

  function render(s: UiSnapshot): void {
    last = s;
    const minute = Math.floor((((s.hour % 24) + 24) % 24) * 60);
    if (minute !== shownMinute) {
      shownMinute = minute;
      const text = clock(s.hour);
      setText(clockText, text);
      setText(partText, partOfDay(s.hour));
      dial.setAttribute('aria-valuenow', s.hour.toFixed(2));
      dial.setAttribute('aria-valuetext', text);
      const p = sunAt(s.hour);
      sun.setAttribute('cx', p.x.toFixed(2));
      sun.setAttribute('cy', p.y.toFixed(2));
      setFlag(dial, 'is-night', minute < 6 * 60 || minute >= 19 * 60);
    }
    for (const [sp, b] of speedBtns) setPressed(b, sp === s.speed);
    const w = WEATHER[s.weather];
    setIcon(weatherIcon, w.icon);
    setText(weatherText, w.label);
    setTitle(weather, `Weather: ${w.label} (click for the next)`);
  }

  return { element: strip, render };
}
