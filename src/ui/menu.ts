import { generateMap, TERRAIN } from '../game/map.ts';
import { seedOf } from '../game/rng.ts';
import type { Progress } from '../game/save.ts';
import { CAMPAIGN, randomScenario, SANDBOX, sandboxIn, SILVER_PAR, tagsOf, type Scenario } from '../game/scenarios.ts';
import { CHARACTERS, charactersOf, climateOf, climateTags, riverTag, SEASON_IDS, SEASONS, seasonName, type Character, type Season } from '../game/seasons.ts';
import type { GameState } from '../game/state.ts';
import { fill, h, icon, svg } from './dom.ts';
import { itemName, num, pct, playTime } from './format.ts';
import { guidePanel } from './guide.ts';
import { settingsPanel } from './settingsPanel.ts';
import { uiScale, type SettingsStore } from './settings.ts';
import { goalIcon, goalNow, MEDAL_NAME, medal, ring } from './widgets.ts';

// The level select, shown before any world is built: the commission in progress to continue, the eight commissions as a
// path of rings down the valley (best medal, progress, par), the chosen one's card (what they ask, the medal times, its sun,
// season, sun, wind and soil against a normal valley, a preview of its map), a random commission from a seed, and the sandbox
// in a season of your choice.

export interface MenuHost {
  saved: GameState | null;
  progress: Progress;
  settings: SettingsStore;
  resume: () => void;
  start(id: string): void;
}

/** How far a game is towards its goals, 0–1: the average of its goals. */
const progressOf = (s: GameState) => (s.scenario.goals.length ? s.scenario.goals.reduce((n, _, i) => n + Math.min(1, goalNow(s, i).v), 0) / s.scenario.goals.length : 0);

/** A normal valley's sun, wind and soil, for comparing a commission's conditions. */
const NORMAL = { daylight: 14, wind: 0.5, soil: 60 };

function conditions(sc: Scenario) {
  const { sun, wind } = sc.climate, t = sc.terrain, day = (sun.set - sun.rise) * sun.strength;
  const word = (k: number, low: string, high: string) => (k < 0.85 ? low : k > 1.15 ? high : 'Normal');
  const cond = (ic: string, label: string, k: number, col: string, value: string, sub: string) => h('div', { class: 'cond' },
    icon(ic, 26), h('span', { class: 'cd-label' }, label),
    h('span', { class: 'bar' }, h('i', { style: `width: ${Math.max(4, Math.min(100, k * 50))}%; background: ${col}` }), h('span', { class: 'norm' })),
    h('span', { class: 'val' }, value, h('small', null, sub)));
  const water = { river: 'A river crosses the valley.', ponds: 'Ponds dot the valley.', lake: 'A lake lies in the valley.', none: 'There is no water.' }[t.water];
  const woods = t.forest >= 0.2 ? 'Woods cover about a quarter.' : t.forest >= 0.1 ? 'Woods cover about an eighth.' : t.forest > 0 ? 'A few woods.' : '';
  return [
    cond('sun', 'Sun', day / NORMAL.daylight, 'var(--ochre)', sun.strength < 0.9 ? 'Weak' : word(day / NORMAL.daylight, 'Short days', 'Long days'),
      `${String(sun.rise).padStart(2, '0')}:00 to ${sun.set}:00${sun.strength !== 1 ? ` · ${pct(sun.strength)}` : ''}`),
    cond('wind', 'Wind', wind.mean / NORMAL.wind, 'var(--tide)', word(wind.mean / NORMAL.wind, 'Still', 'Strong'), `gusts ${pct(wind.gust)}`),
    cond('soil', 'Soil', t.soil / NORMAL.soil, 'var(--pine)', word(t.soil / NORMAL.soil, 'Poor', 'Rich'), `${t.soil} ± ${t.soilSpread}`),
    h('div', { class: 'cd-small cd-faint about' }, [water, woods, t.rock >= 0.1 ? 'Rocky.' : ''].filter(Boolean).join(' ')),
  ];
}

const previews = new Map<string, HTMLCanvasElement>();
/** A small picture of a commission's map: soil, water, woods, rock and the depot. */
function mapPreview(sc: Scenario) {
  let c = previews.get(sc.id);
  if (c) return c;
  const m = generateMap(sc), k = 5;
  c = h('canvas', { class: 'map-preview', width: m.width * k, height: m.height * k, 'aria-label': 'A preview of the valley' });
  const g = c.getContext('2d');
  if (g) {
    for (let i = 0; i < m.terrain.length; i++) {
      const t = m.terrain[i], f = m.fertility[i] / 100;
      g.fillStyle = t === TERRAIN.water ? '#7fa9b8' : t === TERRAIN.tree ? '#4f7c5e' : t === TERRAIN.rock ? '#a8a294'
        : `rgb(${Math.round(226 - 70 * f)}, ${Math.round(214 - 24 * f)}, ${Math.round(170 - 44 * f)})`;
      g.fillRect((i % m.width) * k, Math.floor(i / m.width) * k, k, k);
    }
    g.fillStyle = '#1c2520';
    g.fillRect(m.depot.x * k, m.depot.y * k, 3 * k, 3 * k);
  }
  previews.set(sc.id, c);
  return c;
}

function goalsOf(sc: Scenario) {
  return sc.goals.map((g) => h('div', { class: 'goal' }, h('span', { class: 'goal-disc' }, icon(goalIcon(g), 58)),
    h('div', null, h('div', { class: 'goal-num' }, g.kind === 'deliver' ? String(g.n) : g.kind === 'rate' ? String(g.perMin) : [String(g.min), h('small', null, '+')]),
      h('div', { class: 'cd-small' }, g.kind === 'deliver' ? `${itemName(g.item)} to the depot` : g.kind === 'rate' ? `${itemName(g.item)} a minute` : 'soil at the end'))));
}

export function showMenu(root: HTMLElement, host: MenuHost) {
  const ui = h('div', { class: 'ui cd-root menu' });
  const fit = () => {
    const z = uiScale(host.settings.get(), innerWidth, innerHeight);
    ui.style.zoom = String(z); ui.style.width = `${innerWidth / z}px`; ui.style.height = `${innerHeight / z}px`;
  };
  host.settings.listen((st) => { ui.classList.toggle('is-calm', st.reduceMotion); fit(); });
  addEventListener('resize', fit);
  const saved = host.saved;
  // The commission shown: the one in progress, else the first not finished.
  let chosen: Scenario = (saved && CAMPAIGN.find((c) => c.id === saved.scenario.id)) ?? CAMPAIGN.find((c) => !host.progress[c.id]) ?? CAMPAIGN[0];
  const path = h('div', { class: 'path' }), card = h('div', { class: 'cd-card chosen' }), warn = h('div', { class: 'replace' });
  const sheets = h('div', { class: 'ui-sheets' });
  const closeSheet = () => { sheets.classList.remove('is-open'); sheets.replaceChildren(); };

  function drawPath() {
    const xs = CAMPAIGN.map((_, i) => 250 + i * 207), ys = CAMPAIGN.map((_, i) => (i % 2 ? 70 : 40));
    fill(path,
      svg('svg', { class: 'trail', viewBox: '0 0 1920 340', width: 1920, height: 340, preserveAspectRatio: 'none' },
        svg('path', { d: `M 150 ${ys[0] + 30} ${xs.map((x, i) => `L ${x} ${ys[i] + 40}`).join(' ')} L 1790 ${ys[7] + 20}` })),
      ...CAMPAIGN.map((sc, i) => {
        const best = host.progress[sc.id], here = saved?.scenario.id === sc.id, on = sc.id === chosen.id;
        const v = best ? 1 : here ? progressOf(saved) : 0;
        const col = best ? `var(--medal-${best.medal})` : 'var(--pine)';
        return h('button', { class: `st${on ? ' is-on' : ''}`, style: `left: ${(xs[i] / 1920 * 100).toFixed(2)}%; top: ${ys[i] - (on ? 26 : 0)}px`, onclick: () => { chosen = sc; draw(); } },
          h('span', { class: 'disc' }, ring({ v, d: on ? 128 : 76, w: on ? 8 : 6, col }, h('div', null, h('div', { class: on ? 'n big' : 'n' }, String(i + 1)), on && here && !best ? h('div', { class: 'cd-small' }, pct(v)) : null))),
          h('span', { class: 'name' }, sc.name),
          h('span', { class: 'sub' }, best ? `${best.medal} · ${playTime(best.time)} of ${playTime(sc.par)}` : here ? `in progress · ${playTime(saved.time)}` : `par ${playTime(sc.par)}`));
      }));
  }

  function drawCard() {
    const sc = chosen, i = CAMPAIGN.indexOf(sc), here = saved?.scenario.id === sc.id, best = host.progress[sc.id];
    fill(card,
      h('div', { class: 'col name-col' },
        h('div', { class: 'cd-label' }, `Commission ${i + 1} · seed ${sc.seed} · ${sc.width} × ${sc.height}`),
        h('h1', { class: 'cd-display' }, sc.name),
        h('p', { class: 'blurb' }, sc.blurb),
        h('div', { class: 'chips tags' }, ...tagsOf(sc).map((t) => h('span', { class: 'tag cd-small' }, t))),
        h('span', { class: 'fill' }),
        h('div', { class: 'row' }, h('span', { class: 'mchip' }, icon('coin', 28), h('b', null, num(sc.credits)), h('small', null, 'credits to start')),
          h('span', { class: 'cd-small' }, 'Your best: ', h('b', null, best ? `${MEDAL_NAME[best.medal]}, ${playTime(best.time)}` : 'not finished yet')))),
      h('div', { class: 'vsep' }),
      h('div', { class: 'col' },
        h('div', { class: 'cd-label' }, 'What they ask'),
        h('div', { class: 'goals' }, ...goalsOf(sc)),
        h('span', { class: 'fill' }),
        h('div', { class: 'cd-label', style: 'margin-bottom: 12px' }, 'Medal times'),
        h('div', { class: 'row' },
          h('span', { class: 'mchip' }, medal('gold', 30), h('b', null, playTime(sc.par)), h('small', null, 'gold')),
          h('span', { class: 'mchip' }, medal('silver', 30), h('b', null, playTime(sc.par * SILVER_PAR)), h('small', null, 'silver')),
          h('span', { class: 'mchip' }, medal('bronze', 30), h('small', null, 'after')))),
      h('div', { class: 'vsep' }),
      h('div', { class: 'col' },
        h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, `Conditions · ${seasonName(sc.climate)}`), h('span', { class: 'cd-small cd-faint' }, h('i', { class: 'norm-key' }), 'a normal valley')),
        h('div', { class: 'conds' }, ...conditions(sc))),
      h('div', { class: 'col act' },
        mapPreview(sc),
        h('span', { class: 'fill' }),
        here ? h('button', { class: 'cd-btn is-primary is-lg', onclick: host.resume }, icon('play', 16, 'inv'), 'Continue')
          : h('button', { class: 'cd-btn is-primary is-lg', onclick: () => host.start(sc.id) }, icon('play', 16, 'inv'), best ? 'Play again' : 'Begin'),
        here ? h('button', { class: 'link small', onclick: () => host.start(sc.id) }, 'or start over') : null));
    const other = saved && saved.scenario.id !== sc.id && saved.completedAt === null;
    fill(warn, other ? [icon('warn', 18), `Starting any other commission replaces ${saved.scenario.name} in progress (${playTime(saved.time)} played).`] : []);
  }

  function draw() { drawPath(); drawCard(); }

  // A random commission: a seed and a difficulty, with a live preview.
  const seed = h('input', { class: 'seed cd-num', type: 'text', value: String(Math.floor(Math.random() * 100000)), size: 8, 'aria-label': 'Seed', spellcheck: false });
  let difficulty: 1 | 2 | 3 = 2;
  const diff = h('div', { class: 'cd-seg wide' });
  const preview = h('div', { class: 'preview' });
  const random = () => randomScenario(seedOf(seed.value), difficulty);
  function drawRandom() {
    fill(diff, ...([[1, 'Easy'], [2, 'Medium'], [3, 'Hard']] as const).map(([d, name]) => h('button', { class: d === difficulty ? 'is-on' : '', onclick: () => { difficulty = d; drawRandom(); } }, name)));
    const sc = random();
    fill(preview,
      h('div', { class: 'head' }, h('span', { class: 'rname' }, sc.name), h('span', { class: 'cd-small' }, `${sc.width} × ${sc.height} · par ${playTime(sc.par)} · ${num(sc.credits)} credits`)),
      h('div', { class: 'chips' }, ...sc.goals.map((g) => h('span', { class: 'cd-chip' }, icon(goalIcon(g), 22), g.kind === 'deliver' ? `${g.n} ${itemName(g.item)}` : g.kind === 'rate' ? `${g.perMin} ${itemName(g.item)} / min` : `soil ${g.min}+`))),
      h('div', { class: 'chips tags' }, ...tagsOf(sc).map((t) => h('span', { class: 'tag cd-small' }, t)), h('span', { class: 'tag cd-small' }, { river: 'River', ponds: 'Ponds', lake: 'Lake', none: 'Dry' }[sc.terrain.water])));
  }
  seed.addEventListener('input', drawRandom);
  drawRandom();

  // The sandbox's season and character.
  let season: Season = SANDBOX.climate.season, character: Character | null = SANDBOX.climate.character;
  const seasons = h('div', { class: 'cd-seg wide' }), sandboxChoice = h('div', { class: 'season-pick' });
  function drawSandbox() {
    fill(seasons, ...SEASON_IDS.map((x) => h('button', { class: x === season ? 'is-on' : '', onclick: () => { season = x; if (character && !charactersOf(x).includes(character)) character = null; drawSandbox(); } }, SEASONS[x].name)));
    const sel = h('select', { class: 'cd-select', 'aria-label': 'Character', onchange: () => { character = (sel.value || null) as Character | null; drawSandbox(); } },
      h('option', { value: '', selected: character === null }, 'Ordinary'),
      ...charactersOf(season).map((c) => h('option', { value: c, selected: c === character }, CHARACTERS[c].word[0].toUpperCase() + CHARACTERS[c].word.slice(1))));
    fill(sandboxChoice, seasons, h('div', { class: 'row' }, sel, h('span', { class: 'chips tags' }, ...((c) => [seasonName(c), ...climateTags(c), ...riverTag(c)])(climateOf(season, character)).map((t) => h('span', { class: 'tag cd-small' }, t)))));
  }
  drawSandbox();
  draw();

  ui.append(
    h('div', { class: 'menu-bg' }),
    h('div', { class: 'menu-page' },
      h('div', { class: 'brand' }, h('div', { class: 'cd-label' }, 'A farming co-op · the valley'), h('div', { class: 'title' }, 'Soil n Silo')),
      saved ? h('div', { class: 'cd-card is-ink continue' },
        ring({ v: saved.completedAt !== null ? 1 : progressOf(saved), d: 56, w: 5, col: 'var(--ochre)' }, icon(saved.scenario.goals[0] ? goalIcon(saved.scenario.goals[0]) : 'sapling', 26)),
        h('div', { class: 'fill' }, h('div', { class: 'cd-label' }, 'Continue'), h('div', { class: 'cname' }, saved.scenario.name),
          h('div', { class: 'cd-small' }, saved.completedAt !== null ? 'complete · free play' : `${playTime(saved.time)} played${saved.scenario.goals[0] ? ` · ${goalNow(saved, 0).short}` : ''}`)),
        h('button', { class: 'cd-btn is-icon', 'aria-label': 'Continue', title: 'Continue', onclick: host.resume }, icon('play', 18))) : null,
      h('div', { class: 'top-buttons' },
        h('button', { class: 'cd-btn', onclick: () => { sheets.classList.add('is-open'); fill(sheets, h('div', { class: 'scrim', onclick: closeSheet }), h('div', { class: 'sheet-wrap' }, guidePanel({ kind: 'topic', id: 'start' }, null, closeSheet))); } }, icon('book', 22), 'Guide'),
        h('button', { class: 'cd-btn', onclick: () => { sheets.classList.add('is-open'); fill(sheets, h('div', { class: 'scrim', onclick: closeSheet }), h('div', { class: 'sheet-wrap' }, settingsPanel(host.settings, closeSheet))); } }, icon('menu', 20), 'Settings')),
      h('div', { class: 'cd-label path-label' }, `${CAMPAIGN.length} commissions · down the valley`),
      path, card, warn,
      h('div', { class: 'cd-card random' },
        h('div', null, h('div', { class: 'cd-label' }, 'Random commission'),
          h('div', { class: 'seedrow' }, h('label', { class: 'cd-inset seedbox' }, h('span', { class: 'cd-small cd-faint' }, 'Seed'), seed),
            h('button', { class: 'cd-btn is-icon', title: 'A new seed', 'aria-label': 'A new seed', onclick: () => { seed.value = String(Math.floor(Math.random() * 100000)); drawRandom(); } }, icon('rotate', 20))),
          diff),
        preview,
        h('div', { class: 'act' }, h('button', { class: 'cd-btn is-ghost', onclick: () => host.start(random().id) }, icon('play', 14), 'Start'))),
      h('div', { class: 'cd-card sandbox' },
        h('div', null, h('div', { class: 'cd-label' }, 'Sandbox'), h('div', { class: 'rname' }, 'A big valley'),
          h('div', { class: 'cd-small' }, `${SANDBOX.blurb.replace(/^A big valley with u/, 'U')} ${SANDBOX.width} × ${SANDBOX.height}, in the season you choose.`)),
        sandboxChoice,
        h('div', { class: 'act' }, h('button', { class: 'cd-btn is-ghost', onclick: () => host.start(sandboxIn(season, character).id) }, 'Open')))),
    sheets);
  root.append(ui);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
}
