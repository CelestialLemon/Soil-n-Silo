// The sky strip, top right: a small day dial (the sun's dot runs round it; drag it to set the hour), the clock, quick
// jumps to dawn, noon, golden hour and dusk (at the season's hours: a winter golden hour comes at three), the game speed,
// the weather, and the camera: its ⟲ ⟳ turns and, beside them, a quiet toggle between a free orbit (the default) and
// snapped 90° views, the player's setting (remembered by the world), and the power view's bolt (P), which shows every
// wireless power range (they're hidden otherwise, unless a power building or relay is in hand or picked). The clock reads
// the game day too ("Day 2 · 10:30").
//
// The weather: with living weather (`liveWeather`), a quiet readout of the sky now and the air's temperature ("Showers ·
// 11°C"), with the wind and any frost or flood note in its tooltip; it's a button only while `?weather=` holds the sky,
// and a click lets living weather back in. Without it, the old chip that steps through four skies. Once a Weather Station
// stands, its days ahead sit beside it as tiny sky icons, each named in its tooltip ("Day 4 · Thunderstorm (6°–13°C)"):
// no table, nothing to open (docs/DESIGN.md, "Minimal HUD and In-World Readability").
//
// Under the strip, a quiet power pill: the valley's watts made and used and the batteries' charge, shown only while the
// power view is on or the homestead is in a blackout (then in amber, pointing at the power view). Calm play never sees it.
import { type DayForecast, type ForecastIcon, isNight, type PowerSummary, type Season, seasonHours, type WeatherSpell } from '../game/index.ts';
import { button, el, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon, type IconName, setIcon } from './icons.ts';
import { SPEEDS, type Speed, type UiCallbacks, type UiSnapshot, type Weather, WEATHERS, type YawMode } from './types.ts';

export interface SkyStrip {
  element: HTMLElement;
  /** The power pill, set under the strip. */
  balance: HTMLElement;
  render(s: UiSnapshot): void;
}

const SVG = 'http://www.w3.org/2000/svg';
/** The dial's size and the sun's track radius, in its own units. */
const D = 44, R = 15;

/** The quick jumps; their hours follow the season (seasonHours). */
const MOMENTS = [
  { id: 'dawn', label: 'Dawn' },
  { id: 'noon', label: 'Noon' },
  { id: 'golden', label: 'Golden hour' },
  { id: 'dusk', label: 'Dusk' },
] as const;

const CAMERA: Record<YawMode, { label: string; icon: IconName; other: YawMode }> = {
  orbit: { label: 'Free orbit', icon: 'orbit', other: 'snap' },
  snap: { label: 'Snapped 90° views', icon: 'snap', other: 'orbit' },
};

const POWER_VIEW = 'Power view (P): show wireless power ranges';

const WEATHER: Record<Weather, { label: string; icon: IconName }> = {
  clear: { label: 'Clear', icon: 'sun' },
  breeze: { label: 'Breeze', icon: 'breeze' },
  overcast: { label: 'Overcast', icon: 'overcast' },
  rain: { label: 'Showers', icon: 'rain' },
};

/** The sky icon for each of the game's forecast icons. */
const SKY_ICONS: Record<ForecastIcon, IconName> = {
  sun: 'sun', partly: 'partly', cloud: 'overcast', fog: 'fog', rain: 'rain', storm: 'storm', heat: 'heat', gale: 'gale', frost: 'frost', snow: 'snow',
};

/** A spell's icon: its forecast icon, but a blizzard gets its own drifting snow. */
const skyIcon = (spell: WeatherSpell, f: ForecastIcon): IconName => (spell === 'blizzard' ? 'blizzard' : SKY_ICONS[f]);

/** The spells worth a gentle tint: cold ones blue, heat amber, storm and gale clay. */
type Hazard = 'cold' | 'heat' | 'wild';
const HAZARDS: Partial<Record<WeatherSpell, Hazard>> = { frost: 'cold', blizzard: 'cold', 'heat-wave': 'heat', storm: 'wild', gale: 'wild' };

const LOCKED = 'Locked weather — click to return to living weather';

const degrees = (c: number) => `${Math.round(c) === 0 ? 0 : Math.round(c)}°`;

/** A day ahead's tooltip: "Day 4 · Thunderstorm (6°–13°C)". */
const dayTitle = (f: DayForecast) => `Day ${f.day} · ${f.label} (${degrees(f.minTempC)}–${degrees(f.maxTempC)}C)`;

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

/** Tints an element for a hazardous sky (cold, heat, wild) or clears it. */
function paintHazard(node: HTMLElement, hazard: Hazard | null): void {
  for (const h of ['cold', 'heat', 'wild'] as const) setFlag(node, `is-${h}`, h === hazard);
}

const watts = (w: number) => `${w.toFixed(1)} W`;

/** The pill's line: what the valley makes and uses, and the batteries' charge if it has any. */
function balanceLine(p: PowerSummary): string {
  const batt = p.totalCapWh > 0 ? ` · Batt ${Math.round((p.totalStoredWh / p.totalCapWh) * 100)}%` : '';
  return `${watts(p.totalGenW)} gen · ${watts(p.totalDemandW)} use${batt}`;
}

export function createSkyStrip(cb: UiCallbacks): SkyStrip {
  let last: UiSnapshot | null = null;
  let shownMinute = -1;
  let shownDay = -1;
  let shownSeason: Season | null = null;

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
  const momentBtns = MOMENTS.map((m) => {
    const b = button(`ui-moment ui-moment-${m.id}`, m.label, () => { if (last) cb.onSetHour(seasonHours(last.stats.season)[m.id]); });
    b.append(el('span', 'ui-moment-dot'));
    moments.append(b);
    return b;
  });

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

  // Weather: the living sky's readout (a button only while `?weather=` locks it), or the old chip that steps to the next sky.
  const weather = button('ui-chip ui-weather', 'Weather', () => {
    if (!last) return;
    if (last.liveWeather) {
      if (last.liveWeather.locked) cb.onClearWeatherLock?.();
      return;
    }
    const i = WEATHERS.indexOf(last.weather);
    cb.onSetWeather(WEATHERS[(i + 1) % WEATHERS.length] ?? 'clear');
  });
  const weatherIcon = icon('sun');
  const weatherText = el('span', '', 'Clear');
  weather.append(weatherIcon, weatherText);

  // The Weather Station's days ahead: tiny sky icons beside the weather.
  const forecast = el('div', 'ui-forecast');
  forecast.setAttribute('role', 'list');
  forecast.setAttribute('aria-label', 'The Weather Station\'s days ahead');
  forecast.hidden = true;
  let shownForecast = '';

  // Turning the camera.
  const turns = el('div', 'ui-turns');
  const turnLeft = button('ui-icon-btn', 'Turn the view left', () => cb.onStepYaw(-1));
  turnLeft.append(icon('turnLeft'));
  const turnRight = button('ui-icon-btn', 'Turn the view right', () => cb.onStepYaw(1));
  turnRight.append(icon('turnRight'));
  // The camera's setting: one small toggle beside the turns.
  const cameraMode = button('ui-icon-btn ui-camera-mode', 'Camera', () => { if (last) cb.onSetYawMode(CAMERA[last.yawMode].other); });
  const cameraIcon = icon('orbit');
  cameraMode.append(cameraIcon);
  // The power view: as small and quiet, beside it.
  const powerView = button('ui-icon-btn ui-camera-mode ui-power-view', POWER_VIEW, () => cb.onTogglePowerView());
  powerView.append(icon('power'));
  turns.append(turnLeft, turnRight, cameraMode, powerView);

  strip.append(dial, time, moments, el('span', 'ui-rule'), speeds, weather, forecast, el('span', 'ui-rule'), turns);

  // The power pill.
  const balance = el('div', 'ui-balance ui-float');
  balance.setAttribute('role', 'status');
  balance.setAttribute('aria-live', 'polite');
  const balanceText = el('span', 'ui-balance-text');
  const balanceWhy = el('span', 'ui-balance-why');
  balance.append(el('span', 'ui-balance-dot'), balanceText, balanceWhy);
  balance.hidden = true;

  function render(s: UiSnapshot): void {
    last = s;
    const season = s.stats.season;
    if (season !== shownSeason) {
      shownSeason = season;
      shownMinute = -1;
      const hours = seasonHours(season);
      MOMENTS.forEach((m, k) => setTitle(momentBtns[k], `${m.label} (${clock(hours[m.id])})`));
    }
    const minute = Math.floor((((s.hour % 24) + 24) % 24) * 60);
    if (minute !== shownMinute || s.day !== shownDay) {
      shownMinute = minute;
      shownDay = s.day;
      const text = clock(s.hour);
      setText(clockText, `Day ${s.day} · ${text}`);
      setText(partText, partOfDay(s.hour));
      dial.setAttribute('aria-valuenow', s.hour.toFixed(2));
      dial.setAttribute('aria-valuetext', text);
      const p = sunAt(s.hour);
      sun.setAttribute('cx', p.x.toFixed(2));
      sun.setAttribute('cy', p.y.toFixed(2));
      setFlag(dial, 'is-night', isNight(s.hour, season));
    }
    for (const [sp, b] of speedBtns) setPressed(b, sp === s.speed);
    paintWeather(s);
    const cam = CAMERA[s.yawMode];
    setIcon(cameraIcon, cam.icon);
    setTitle(cameraMode, `Camera: ${cam.label} (click for ${CAMERA[cam.other].label.toLowerCase()})`);
    setPressed(powerView, s.powerView);

    const p = s.stats.powerSummary;
    const blackout = p.anyBlackout;
    setHidden(balance, !s.powerView && !blackout);
    setFlag(balance, 'is-warn', blackout);
    setText(balanceText, blackout && !s.powerView ? 'Blackout — check Power View (P)' : blackout ? `Blackout · ${balanceLine(p)}` : balanceLine(p));
    const why = blackout && s.powerView ? p.lastBlackoutReason : '';
    setText(balanceWhy, why);
    setHidden(balanceWhy, why === '');
    setTitle(balance, blackout ? p.lastBlackoutReason || 'Blackout: more load than the power can carry' : 'The valley\'s power: made, used, and stored in batteries');
  }

  function paintWeather(s: UiSnapshot): void {
    const live = s.liveWeather;
    if (!live) {
      const w = WEATHER[s.weather];
      setIcon(weatherIcon, w.icon);
      setText(weatherText, w.label);
      setTitle(weather, `Weather: ${w.label} (click for the next)`);
      setFlag(weather, 'is-live', false);
      setFlag(weather, 'is-locked', false);
      weather.removeAttribute('aria-disabled');
      paintHazard(weather, null);
    } else {
      setIcon(weatherIcon, skyIcon(live.spell, live.icon));
      setText(weatherText, `${live.label} · ${degrees(live.tempC)}C`);
      const locked = live.locked === true;
      const detail = live.detail ?? `${live.label}, ${degrees(live.tempC)}C`;
      setTitle(weather, locked ? `${LOCKED}\n${detail}` : detail);
      setFlag(weather, 'is-live', !locked);
      setFlag(weather, 'is-locked', locked);
      if (locked) weather.removeAttribute('aria-disabled');
      else weather.setAttribute('aria-disabled', 'true');
      paintHazard(weather, HAZARDS[live.spell] ?? null);
    }

    const days = s.forecast ?? [];
    const key = days.map((f) => `${f.day}|${f.spell}|${f.icon}|${Math.round(f.minTempC)}|${Math.round(f.maxTempC)}`).join(',');
    if (key === shownForecast) return;
    shownForecast = key;
    setHidden(forecast, days.length === 0);
    forecast.replaceChildren(...days.map((f) => {
      const item = el('span', 'ui-forecast-day');
      item.setAttribute('role', 'listitem');
      const title = dayTitle(f);
      item.title = title;
      item.setAttribute('aria-label', title);
      item.append(icon(skyIcon(f.spell, f.icon), 'ui-icon ui-forecast-icon'));
      paintHazard(item, HAZARDS[f.spell] ?? null);
      return item;
    }));
  }

  return { element: strip, balance, render };
}
