import { priceOf } from '../game/build.ts';
import { BUILDINGS, CATEGORIES, type BuildingId, type Category } from '../game/data.ts';
import type { GameState } from '../game/state.ts';
import { h, icon } from './dom.ts';
import { num } from './format.ts';
import { buildingCard } from './guide.ts';
import type { Tool } from './hud.ts';

// The dock, bottom centre: the building categories over a row of building tiles (price, and watts for those that use power),
// and Remove. A tile you can't afford is greyed; the one in hand is ink. Keys are in each tile's tooltip, not printed.
// Pointing at a tile shows its card above the dock.

export interface DockHost {
  state(): GameState;
  tool(): Tool;
  setTool(t: Tool): void;
  /** The card about the building pointed at in the dock (null: none). */
  tip(id: BuildingId | null): void;
}

/** A tile's second line: its price, and the watts it uses. */
export function costLine(s: GameState, id: BuildingId) {
  const d = BUILDINGS[id], price = priceOf(s, id);
  return `${price ? num(price) : 'free'}${d.power ? ` · ${d.power} W` : ''}`;
}

export class Dock {
  readonly el = h('div', { class: 'cd-card hud-dock' });
  private category: Category = CATEGORIES[0].id;
  private key = '';
  private readonly tiles = new Map<BuildingId, HTMLButtonElement>();
  private readonly host: DockHost;

  constructor(host: DockHost) { this.host = host; }

  /** Shows the category of the building in hand. */
  showCategoryOf(id: BuildingId) { const c = BUILDINGS[id].category; if (c && c !== this.category) { this.category = c; this.key = ''; } }

  /** Redraws when the category or tool changed; otherwise only which tiles you can afford. */
  update() {
    const s = this.host.state(), tool = this.host.tool();
    const key = JSON.stringify([this.category, tool.kind === 'build' ? tool.type : tool.kind]);
    if (key === this.key) {
      for (const [id, b] of this.tiles) b.classList.toggle('is-poor', s.credits < priceOf(s, id));
      return;
    }
    this.key = key;
    this.tiles.clear();
    this.host.tip(null);
    const tabs = h('div', { class: 'cd-seg' }, ...CATEGORIES.map((c) => h('button', {
      class: c.id === this.category ? 'is-on' : '', onclick: () => { this.category = c.id; this.key = ''; },
    }, c.name)));
    const rot = tool.kind === 'build' ? tool.rot : 1;
    const ids = (Object.keys(BUILDINGS) as BuildingId[]).filter((id) => BUILDINGS[id].category === this.category);
    const tiles = ids.map((id) => {
      const d = BUILDINGS[id], on = tool.kind === 'build' && tool.type === id;
      const b = h('button', {
        class: `cd-tile${on ? ' is-on' : ''}${s.credits < priceOf(s, id) ? ' is-poor' : ''}`, title: `${d.name}${d.key ? ` (${d.key})` : ''}`,
        onclick: () => this.host.setTool(on ? { kind: 'select' } : { kind: 'build', type: id, rot }),
        onpointerenter: () => this.host.tip(id), onpointerleave: () => this.host.tip(null),
      }, icon(id), h('span', { class: 'label' }, d.name), h('span', { class: 'cd-tile__cost' }, costLine(s, id)));
      this.tiles.set(id, b);
      return b;
    });
    const removing = tool.kind === 'remove';
    const remove = h('button', {
      class: `cd-tile is-remove${removing ? ' is-on' : ''}`, title: 'Remove: buildings refund in full; trees and rock cost to clear (X)',
      onclick: () => this.host.setTool(removing ? { kind: 'select' } : { kind: 'remove' }),
    }, icon('trash'), h('span', { class: 'label' }, 'Remove'), h('span', { class: 'cd-tile__cost' }, 'full refund'));
    this.el.replaceChildren(h('div', { class: 'tabs' }, tabs), h('div', { class: 'tiles' }, ...tiles, h('span', { class: 'sep' }), remove));
  }
}

/** The card about a building pointed at in the dock. */
export function dockTip(s: GameState, id: BuildingId) {
  return h('div', { class: 'cd-card hud-tip' }, buildingCard(id, priceOf(s, id)));
}
