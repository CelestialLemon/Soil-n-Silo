import { ITEMS } from '../game/data.ts';
import { seedOf } from '../game/rng.ts';
import type { Progress } from '../game/save.ts';
import { CAMPAIGN, randomScenario, SANDBOX, type Scenario } from '../game/scenarios.ts';
import { h } from './dom.ts';

// The level select: continue the commission in progress, pick one of the campaign's, roll a random one from a seed, or open
// the sandbox. Shown before any world is built.

export interface MenuHost {
  saved: { name: string; time: number; done: boolean } | null;
  progress: Progress;
  resume(): void;
  start(id: string): void;
}

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

function goals(sc: Scenario) {
  return sc.goals.map((g) => (g.kind === 'deliver' ? `${g.n} ${ITEMS[g.item].name.toLowerCase()}` : g.kind === 'rate' ? `${g.perMin} ${ITEMS[g.item].name.toLowerCase()}/min` : `soil ≥ ${g.min}`)).join(' · ');
}

export function showMenu(root: HTMLElement, host: MenuHost) {
  const card = (sc: Scenario, i?: number) => {
    const best = host.progress[sc.id];
    return h('button', { class: 'level', onclick: () => host.start(sc.id) },
      h('div', { class: 'level-head' }, i !== undefined ? h('span', { class: 'num' }, String(i + 1)) : null, h('b', null, sc.name),
        best ? h('span', { class: `medal small ${best.medal}`, title: `Best: ${fmt(best.time)}` }, best.medal) : null),
      h('p', null, sc.blurb),
      sc.goals.length ? h('div', { class: 'level-goals' }, goals(sc)) : null,
      h('div', { class: 'tags' }, ...(sc.sandbox ? [] : [h('span', null, `Target ${fmt(sc.par)}`)]), ...sc.tags.map((t) => h('span', null, t))),
    );
  };

  const seed = h('input', { type: 'text', value: String(Math.floor(Math.random() * 100000)), size: 10, 'aria-label': 'Seed' }) as HTMLInputElement;
  const diff = h('select', { 'aria-label': 'Difficulty' }, h('option', { value: '1' }, 'Easy'), h('option', { value: '2', selected: true }, 'Medium'), h('option', { value: '3' }, 'Hard')) as HTMLSelectElement;
  const preview = h('p', { class: 'preview' });
  const showPreview = () => {
    const sc = randomScenario(seedOf(seed.value), Number(diff.value) as 1 | 2 | 3);
    preview.textContent = `${sc.name}: ${goals(sc)}${sc.tags.length > 1 ? ` · ${sc.tags.slice(1).join(', ')}` : ''}`;
  };
  seed.addEventListener('input', showPreview);
  diff.addEventListener('change', showPreview);
  showPreview();

  const menu = h('div', { class: 'menu' },
    h('header', null, h('h1', null, 'Soil n Silo'), h('p', null, 'A solarpunk valley, one commission at a time: lay out fields, silos and power, and let the farm run itself.')),
    host.saved ? h('section', { class: 'continue' }, h('button', { class: 'primary big', onclick: host.resume },
      `Continue: ${host.saved.name}`, h('small', null, host.saved.done ? ' (complete, free play)' : ` (${fmt(host.saved.time)} played)`))) : null,
    h('section', null, h('h2', null, 'Campaign'), h('div', { class: 'levels' }, ...CAMPAIGN.map((sc, i) => card(sc, i)))),
    h('section', { class: 'split' },
      h('div', null, h('h2', null, 'Random commission'), h('div', { class: 'random' }, h('label', null, 'Seed ', seed), h('label', null, 'Difficulty ', diff),
        h('button', { class: 'primary', onclick: () => host.start(randomScenario(seedOf(seed.value), Number(diff.value) as 1 | 2 | 3).id) }, 'Start')), preview),
      h('div', null, h('h2', null, 'Sandbox'), card(SANDBOX))),
    host.saved ? h('p', { class: 'note' }, 'Starting a commission replaces the one in progress.') : null,
  );
  root.append(menu);
}
