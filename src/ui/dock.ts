import { choicesOf, priceOf, type Setting } from '../game/build.ts';
import { BUILDINGS, CATEGORIES, CROPS, recipeById, type BuildingId, type Category } from '../game/data.ts';
import type { GameState } from '../game/state.ts';
import { h, icon } from './dom.ts';
import { itemName, num } from './format.ts';
import { buildingCard } from './guide.ts';
import type { Tool } from './hud.ts';
import { keyNames, keysVersion, tip } from './keyhints.ts';

// The dock, bottom centre: a row of building tiles over the building categories (price, and watts for those that use power),
// and Remove. A tile you can't afford is greyed; the one in hand is ink. Keys are in each tile's tooltip, not printed.
// Pointing at a tile shows its card above the dock. A field or bakery in hand has a strip of choices (its crops, its recipes)
// over its own tile, pointing at it.

export interface DockHost {
  state(): GameState;
  tool(): Tool;
  setTool(t: Tool): void;
  /** Changes what the field or machine in hand is placed with. */
  choose(set: Setting): void;
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

  private synced: BuildingId | null = null;

  /** Shows the category of the building in hand, once per pick (null: none in hand), so a tab click sticks until another is picked. */
  showCategoryOf(id: BuildingId | null) {
    if (id === this.synced) return;
    this.synced = id;
    const c = id && BUILDINGS[id].category;
    if (c && c !== this.category) { this.category = c; this.key = ''; }
  }

  /** Redraws when the category or tool changed; otherwise only which tiles you can afford. */
  update() {
    const s = this.host.state(), tool = this.host.tool();
    const key = JSON.stringify([this.category, tool.kind === 'build' ? [tool.type, tool.crop, tool.recipe] : tool.kind, keysVersion()]);
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
    const ids = (Object.keys(BUILDINGS) as BuildingId[]).filter((id) => BUILDINGS[id].category === this.category);
    let held: HTMLButtonElement | null = null;
    const tiles = ids.map((id) => {
      const d = BUILDINGS[id], on = tool.kind === 'build' && tool.type === id;
      const b = h('button', {
        class: `cd-tile${on ? ' is-on' : ''}${s.credits < priceOf(s, id) ? ' is-poor' : ''}`, title: tip(d.name, ...(d.key ? keyNames(`build:${id}`) : [])),
        onclick: () => { const t = this.host.tool(); this.host.setTool(on ? { kind: 'select' } : { kind: 'build', type: id, rot: t.kind === 'build' ? t.rot : 1 }); },
        onpointerenter: () => this.host.tip(id), onpointerleave: () => this.host.tip(null),
      }, icon(id), h('span', { class: 'label' }, d.name), h('span', { class: 'cd-tile__cost' }, costLine(s, id)));
      this.tiles.set(id, b);
      if (on) held = b;
      return b;
    });
    const removing = tool.kind === 'remove';
    const remove = h('button', {
      class: `cd-tile is-remove${removing ? ' is-on' : ''}`, title: tip('Remove: buildings refund in full; trees and rock cost to clear', ...keyNames('remove')),
      onclick: () => this.host.setTool(removing ? { kind: 'select' } : { kind: 'remove' }),
    }, icon('trash'), h('span', { class: 'label' }, 'Remove'), h('span', { class: 'cd-tile__cost' }, 'full refund'));
    this.el.replaceChildren(h('div', { class: 'tiles' }, ...tiles, h('span', { class: 'sep' }), remove), h('div', { class: 'tabs' }, tabs));
    if (tool.kind === 'build' && held) this.strip(tool, held);
  }

  /** The choices of the field or bakery in hand, over its tile; the strip's pointer is on the tile's middle. */
  private strip(tool: Extract<Tool, { kind: 'build' }>, tile: HTMLButtonElement) {
    const all = choicesOf(tool.type);
    if (!all.length) return;
    const keys = keyNames('choice');
    const chips = all.map((c) => {
      const recipe = c.recipe ? recipeById(c.recipe) : null;
      const out = recipe?.outputs[0].item;
      const name = c.crop ? CROPS[c.crop].name : out ? itemName(out).replace(/^./, (x) => x.toUpperCase()) : '';
      const on = c.crop ? tool.crop === c.crop : tool.recipe === c.recipe;
      const info = c.crop ? `${CROPS[c.crop].grow} s · ${CROPS[c.crop].yield} a harvest` : (recipe?.inputs ?? []).map((i) => ('item' in i ? itemName(i.item) : '')).join(' + ');
      return h('button', { class: on ? 'is-on' : '', title: tip(`${name}: ${info}`, ...keys.map((k) => `${k}, Shift+${k} to change`)), onclick: () => this.host.choose(c) },
        icon(c.crop ?? out ?? 'check', 18), h('span', null, name));
    });
    const pointer = h('i', { class: 'pointer' });
    const el = h('div', { class: 'cd-card hud-strip' }, h('div', { class: 'cd-seg' }, ...chips), pointer);
    this.el.append(el);
    // Over the tile, centred on it where it fits, else kept inside the dock; the pointer stays on the tile either way.
    el.style.top = `${tile.offsetTop - el.offsetHeight - 22}px`;
    const mid = tile.offsetLeft + tile.offsetWidth / 2, w = el.offsetWidth;
    const left = Math.max(0, Math.min(mid - w / 2, this.el.offsetWidth - w));
    el.style.left = `${left}px`;
    pointer.style.left = `${mid - left}px`;
  }
}

/** The card about a building pointed at in the dock. */
export function dockTip(s: GameState, id: BuildingId) {
  return h('div', { class: 'cd-card hud-tip' }, buildingCard(id, priceOf(s, id)));
}
