import { place } from '../../game/build.ts';
import { BUILDINGS } from '../../game/data.ts';
import { eventOn, timeOf, type EventKind } from '../../game/events.ts';
import { must } from '../../game/result.ts';
import { SANDBOX } from '../../game/scenarios.ts';
import { newGame } from '../../game/state.ts';
import { Input } from '../../input.ts';
import { h } from '../../ui/dom.ts';
import { clock } from '../../ui/format.ts';
import type { SettingsStore } from '../../ui/settings.ts';
import { brushScene } from '../brush/scene.ts';
import './buildings.css';

const styles = [
  { id: 'current', name: 'Current', swatch: '#7c9a55', summary: 'Planted roofs, rounded white walls, and solar glass.', x: 10, z: 24 },
  { id: 'timber', name: 'Orchard Timber', swatch: '#bc4854', summary: 'Cedar boarding, steep berry-red gables, and a square grain tower.', x: 17, z: 17 },
  { id: 'adobe', name: 'Adobe Courtyard', swatch: '#e4a577', summary: 'Peach clay, shaded archways, and stepped flat roofs.', x: 24, z: 10 },
  { id: 'enamel', name: 'Enamel Works', swatch: '#4a75bd', summary: 'Cobalt sheet metal, sawtooth skylights, and paired steel silos.', x: 19, z: 33 },
  { id: 'basalt', name: 'Basalt & Copper', swatch: '#68a99d', summary: 'Dark stone courses, weathered copper, and a faceted spire.', x: 26, z: 26 },
  { id: 'canvas', name: 'Canvas & Bamboo', swatch: '#a77eaa', summary: 'Tensioned fabric, light poles, and a woven grain basket on stilts.', x: 33, z: 19 },
] as const;

const exhibits = [
  { type: 'bakery', dx: -2, dz: 2 },
  { type: 'garage', dx: 2, dz: -2 },
  { type: 'silo', dx: -2, dz: -2 },
] as const;

const urls = import.meta.glob<string>('../../../brush3d/src/models/study/*.glb', { query: '?url', import: 'default', eager: true });
const weatherChoices = [
  { name: 'Fair', event: null },
  { name: 'Soft rain', event: 'softRain' },
  { name: 'Fog', event: 'fog' },
] as const satisfies { name: string; event: EventKind | null }[];

export function openBuildingStudy(canvas: HTMLCanvasElement, loading: HTMLElement, settings: SettingsStore, startStyle: string | null) {
  const state = newGame({
    ...SANDBOX, id: 'building-study', name: 'Building Style Study', width: 54, height: 62,
    terrain: { ...SANDBOX.terrain, forest: 0, rock: 0, water: 'none', relief: 0 },
    // Keep the time control independent of the weather preset.
    climate: { ...SANDBOX.climate, conditions: { ...SANDBOX.climate.conditions, cloud: 0, rain: 0 } },
  });
  const models = new Map<number, string>();
  for (const style of styles) {
    for (const { type, dx, dz } of exhibits) {
      const placed = place(state, type, style.x + dx - 1, style.z + dz - 1, 2);
      if (!placed.ok) throw new Error(`The ${style.name} ${type} does not fit its study plot`);
      if (style.id !== 'current') {
        const file = `${style.id}_${type}.glb`;
        models.set(placed.value.building.id, must(urls[`../../../brush3d/src/models/study/${file}`], file));
      }
    }
  }

  document.title = 'Building Style Study · Soil n Silo';
  let labelsDirty = true;
  const scene = brushScene(state, canvas, settings, { x: 21.5, z: 21.5 },
    () => { labelsDirty = true; }, { modelUrls: models, minZoom: 8 });
  const { camera, heights } = scene;
  const lap = () => {};
  const draw = { pick: lap, lap, marks: [], refused: [] };
  type Style = typeof styles[number];
  type Exhibit = typeof exhibits[number];
  let style: Style | null = null;
  let exhibit: Exhibit | null = null;
  let hour = 12;
  state.time = timeOf(2, hour);

  const button = (label: string, onclick: () => void, title = label) => h('button', { type: 'button', onclick, title, 'aria-label': title }, label);
  const overview = button('Overview', () => frame(null));
  const styleButtons = styles.map((s) => {
    const b = button(s.name, () => frame(s));
    b.prepend(h('span', { class: 'study-swatch', style: `background:${s.swatch}`, 'aria-hidden': 'true' }));
    return b;
  });
  const details = h('p', { class: 'study-summary', 'aria-live': 'polite' });
  const exhibitButtons = exhibits.map((e) => button(BUILDINGS[e.type].name, () => frame(style, e)));
  const exhibitList = h('div', { class: 'study-picks', role: 'group', 'aria-label': 'Focus on a building' }, exhibitButtons);
  const timeLabel = h('output', null, clock(hour));
  const time = h('input', {
    type: 'range', min: 0, max: 23.75, step: 0.25, value: hour, 'aria-label': 'Time of day',
    oninput: () => { hour = time.valueAsNumber; state.time = timeOf(2, hour); timeLabel.value = clock(hour); },
  });
  const weather = h('select', {
    'aria-label': 'Weather',
    onchange: () => {
      const event = weatherChoices[weather.selectedIndex].event;
      state.scenario.events = event ? eventOn(1, 12, event, 'ordinary', 48) : [];
    },
  }, weatherChoices.map(({ name }) => h('option', null, name)));

  const toolbar = h('aside', { class: 'building-study', 'aria-label': 'Building style study' },
    h('header', null, h('h1', null, 'Building Style Study'), h('a', { href: '?menu' }, 'Game menu ↗')),
    h('nav', { class: 'study-picks', 'aria-label': 'Architectural styles' }, overview, styleButtons),
    h('div', { class: 'study-details' }, details, exhibitList),
    h('div', { class: 'study-tools' },
      h('div', { class: 'study-picks', role: 'group', 'aria-label': 'Camera' },
        button('↶', () => camera.turn(-1), 'Turn left (Q)'), button('↷', () => camera.turn(1), 'Turn right (E)'),
        button('−', () => camera.zoomStep(-1), 'Zoom out'), button('+', () => camera.zoomStep(1), 'Zoom in')),
      h('label', { class: 'study-clock' }, timeLabel, time),
      weather,
      h('span', { class: 'study-help' }, 'Drag to pan · Scroll to zoom'),
    ),
  );

  const labels = styles.map((s) => h('span', { class: 'study-plot' }, s.name));
  const plots = h('div', { 'aria-hidden': 'true' }, labels);
  document.body.append(plots, toolbar);

  function frame(next: Style | null, building: Exhibit | null = null) {
    style = next;
    exhibit = building;
    overview.setAttribute('aria-pressed', String(!next));
    styleButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(styles[i] === next)));
    exhibitList.hidden = !next;
    exhibitButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(exhibits[i] === building)));
    plots.hidden = !!next;
    details.textContent = next?.summary ?? 'Five designs for the bakery, garage, and silo, with the current buildings for comparison.';

    const viewHeight = toolbar.offsetTop;
    const toolbarHeight = innerHeight - viewHeight;
    const focus = (x: number, z: number, y: number, width: number, height: number) => {
      const zoom = Math.min(96, innerWidth / width, viewHeight / height);
      // The orthographic camera looks down 30°. Lower its target to centre the exhibit above the toolbar.
      camera.lookAt(x, z, zoom, heights.at(x, z) + y - toolbarHeight / (2 * zoom * Math.cos(Math.PI / 6)));
    };
    if (next && building) focus(next.x + building.dx, next.z + building.dz, building.type === 'silo' ? 1.18 : 0.63, 5.4, 5.1);
    else if (next) focus(next.x, next.z, 0.74, 10.8, 7.3);
    else focus(21.5, 21.5, 0.8, 32, 16.6);
  }
  frame(styles.find((s) => s.id === startStyle) ?? null);
  addEventListener('resize', () => frame(style, exhibit));

  new Input(canvas, {
    tileAt: () => null, paints: () => false, repick: lap, click: lap, secondary: lap, drag: lap,
    pan: (dx, dy) => camera.pan(dx, dy),
    zoom: (steps, at) => camera.zoomStep(steps, at),
    key: (e) => {
      if (e.code === 'KeyQ') camera.turn(-1);
      if (e.code === 'KeyE') camera.turn(1);
    },
  });

  loading.remove();
  let previous = performance.now();
  function render(now: number) {
    const dt = Math.min(0.1, (now - previous) / 1000);
    previous = now;
    camera.update(now / 1000, dt);
    scene.sync(state, { dt, hour, speed: 0, lines: false });
    scene.render(now / 1000, draw);
    if (!style && labelsDirty) {
      labelsDirty = false;
      for (const [i, s] of styles.entries()) {
        const points = exhibits.map(({ dx, dz }) => camera.toScreen(s.x + dx, heights.at(s.x + dx, s.z + dz), s.z + dz));
        const xs = points.map(({ sx }) => sx);
        const x = (Math.min(...xs) + Math.max(...xs)) / 2;
        const y = Math.max(...points.map(({ sy }) => sy)) + 19;
        labels[i].style.transform = `translate(${x}px,${y}px) translateX(-50%)`;
        labels[i].hidden = y > toolbar.offsetTop - 25;
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
