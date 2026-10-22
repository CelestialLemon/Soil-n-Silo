import { CAMPAIGN, SILVER_PAR } from '../game/scenarios.ts';
import type { GameState } from '../game/state.ts';
import { h, icon } from './dom.ts';
import { num, playTime } from './format.ts';
import { letterFor } from './letters.ts';
import { gauge, goalIcon, goalOrder, medal, tagChips } from './widgets.ts';

// The briefing, when a commission starts: a letter from the settlement on the left; on the right what they ask (goals as
// gauges), the medal times and the credits to start, Begin and Read the guide. No plan and no tips on how to play.

export function briefing(s: GameState, begin: () => void, guide: () => void) {
  const sc = s.scenario, l = letterFor(sc), i = CAMPAIGN.findIndex((c) => c.id === sc.id);
  const label = sc.sandbox ? 'The sandbox' : i >= 0 ? `Commission ${i + 1} of ${CAMPAIGN.length} · a letter for the co-op` : 'A random commission · a letter for the co-op';
  return h('div', { class: 'cd-sheet briefing' },
    h('div', { class: 'letter' },
      h('div', { class: 'row-head' }, h('span', { class: 'cd-label' }, label), h('span', { class: 'cd-small cd-faint' }, `${l.place} · ${l.day}`)),
      h('h1', { class: 'cd-display' }, sc.name),
      h('div', { class: 'chips tags' }, ...tagChips(sc)),
      h('div', { class: 'words' }, h('p', null, l.greeting), ...l.body.map((p) => h('p', null, p)), ...[...l.season, ...l.events].map((p) => h('p', { class: 'season-line' }, p))),
      l.signoff ? h('div', { class: 'sign' }, h('div', { class: 'cd-small' }, l.signoff), h('div', { class: 'name' }, l.from), l.role ? h('div', { class: 'cd-small' }, l.role) : null) : null),
    h('div', { class: 'terms' },
      h('div', { class: 'cd-label' }, sc.goals.length ? l.asks : 'No goals'),
      sc.goals.length ? h('div', { class: 'asks' }, ...sc.goals.map((g) => h('div', null,
        gauge({ v: 0, d: sc.goals.length > 2 ? 118 : 160, w: 10, col: g.kind === 'soil' ? 'var(--tide)' : undefined,
          inner: [icon(goalIcon(g), 36), h('div', { class: 'cd-figure' }, g.kind === 'deliver' ? '0' : g.kind === 'rate' ? `${g.perMin}` : `${g.min}+`),
            h('div', { class: 'cd-small' }, g.kind === 'deliver' ? `of ${g.n}` : g.kind === 'rate' ? 'a minute' : 'at the end')] }),
        h('b', null, goalOrder(g))))) : h('p', { class: 'cd-small' }, 'Unlimited credits. Build whatever you like.'),
      sc.sandbox ? null : h('div', { class: 'cd-label', style: 'margin-top: 36px' }, 'Medal times'),
      sc.sandbox ? null : h('div', null,
        h('div', { class: 'mrow' }, medal('gold', 34), h('span', null, 'Gold'), h('b', null, `within ${playTime(sc.par)}`)),
        h('div', { class: 'mrow' }, medal('silver', 34), h('span', null, 'Silver'), h('b', null, `within ${playTime(sc.par * SILVER_PAR)}`)),
        h('div', { class: 'mrow' }, medal('bronze', 34), h('span', null, 'Bronze'), h('b', { class: 'cd-soft' }, 'after'))),
      sc.sandbox ? null : h('div', { class: 'cd-label', style: 'margin-top: 26px' }, 'To start'),
      sc.sandbox ? null : h('div', { class: 'mrow' }, icon('coin', 34), h('span', null, 'Credits'), h('b', null, num(sc.credits))),
      h('span', { class: 'fill' }),
      h('div', { class: 'buttons' },
        h('button', { class: 'cd-btn is-primary is-lg', onclick: begin }, 'Begin'),
        h('button', { class: 'cd-btn is-ghost is-lg', onclick: guide }, icon('book', 22), 'Read the guide'))));
}
