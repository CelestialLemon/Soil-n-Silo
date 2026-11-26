// The bottom tool strip: the Supplies counter, Select and four groups (Homestead, Power, Land, Yard) whose tools open in a
// small tray above it, and above that the readout pill saying what the tool in hand does, or what the drag under way is
// doing. A building's tool wears its Supplies cost; it dims while the pool can't pay for it (a click says why) and wears a
// check once a one-of-each building stands.
import { CATALOG } from '../game/index.ts';
import { button, el, setFlag, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import { createSuppliesPill, isShort, supplyWord } from './supplies.ts';
import { GROUPS, type GroupId, keyLabel, placedKind, SELECT_TOOL, type ToolDef, toolDef, groupOf } from './tools.ts';
import type { ToolId, UiCallbacks, UiSnapshot } from './types.ts';

export interface ToolStrip {
  element: HTMLElement;
  render(s: UiSnapshot): void;
  /** Picks a tool as a click on it would (a key press goes through here too). */
  choose(tool: ToolId): void;
}

interface ToolButton { def: ToolDef; node: HTMLButtonElement; title: string }

/** What a tool's thing costs from the pool (0 for the free ones and every land-craft brush). */
const costOfTool = (tool: ToolId): number => {
  const kind = placedKind(tool);
  return kind ? CATALOG[kind].cost : 0;
};

export function createToolStrip(cb: UiCallbacks, toast: (message: string) => void): ToolStrip {
  let last: UiSnapshot | null = null;
  let open: GroupId | null = null;
  let lastTool: ToolId | null = null;

  const dock = el('div', 'ui-dock');

  // The readout pill.
  const readout = el('div', 'ui-readout ui-float');
  readout.setAttribute('role', 'status');
  readout.setAttribute('aria-live', 'polite');
  const readoutDot = el('span', 'ui-readout-dot');
  const readoutText = el('span', 'ui-readout-text');
  const readoutTurn = el('span', 'ui-readout-turn');
  readout.append(readoutDot, readoutText, readoutTurn);
  readout.hidden = true;

  // The tray of the open group's tools.
  const tray = el('div', 'ui-tray ui-float');
  tray.hidden = true;
  const buttons: ToolButton[] = [];
  const groupRows = new Map<GroupId, HTMLElement>();

  function toolButton(def: ToolDef): HTMLButtonElement {
    const cost = costOfTool(def.id);
    const title = `${def.label}${cost > 0 ? ` · ${cost} ${supplyWord(cost)}` : placedKind(def.id) ? ' · free' : ''}${def.key ? ` (${keyLabel(def)})` : ''}`;
    const node = button('ui-tool', title, () => choose(def.id));
    node.append(icon(def.icon, 'ui-icon ui-tool-icon'), el('span', 'ui-tool-label', def.label));
    if (def.key) node.append(el('kbd', 'ui-kbd', keyLabel(def)));
    if (cost > 0) node.append(el('span', 'ui-tool-cost', String(cost)));
    const kind = placedKind(def.id);
    if (kind && CATALOG[kind].oneOfEach) node.append(icon('check', 'ui-icon ui-tool-check'));
    buttons.push({ def, node, title });
    return node;
  }

  for (const g of GROUPS) {
    const row = el('div', 'ui-tray-row');
    row.setAttribute('role', 'toolbar');
    row.setAttribute('aria-label', g.label);
    row.append(el('span', 'ui-tray-title', g.label));
    for (const t of g.tools) row.append(toolButton(t));
    row.hidden = true;
    groupRows.set(g.id, row);
    tray.append(row);
  }

  // The strip: the Supplies counter, Select, then the groups.
  const strip = el('nav', 'ui-strip ui-float');
  strip.setAttribute('aria-label', 'Tools');
  const supplies = createSuppliesPill();
  const selectBtn = toolButton(SELECT_TOOL);
  selectBtn.classList.add('ui-tool-select');
  strip.append(supplies.element, el('span', 'ui-rule'), selectBtn, el('span', 'ui-rule'));
  const tabs = new Map<GroupId, HTMLButtonElement>();
  for (const g of GROUPS) {
    const tab = button('ui-tab', g.label, () => { open = open === g.id ? null : g.id; paint(); });
    tab.append(icon(g.icon, 'ui-icon'), el('span', 'ui-tab-label', g.label), el('span', 'ui-tab-pip'));
    tab.setAttribute('aria-expanded', 'false');
    tabs.set(g.id, tab);
    strip.append(tab);
  }

  dock.append(readout, tray, strip);

  function choose(tool: ToolId): void {
    const s = last;
    if (!s) return;
    const kind = placedKind(tool);
    if (kind && CATALOG[kind].oneOfEach && (s.stats.thingCounts[kind] ?? 0) > 0) {
      if (kind === 'farmhouse') cb.onCenterHomestead();
      toast(`${CATALOG[kind].label} already stands · click it to move or turn it`);
      return;
    }
    const cost = costOfTool(tool);
    if (kind && tool !== s.activeTool && isShort(s.stats.supplies, cost)) {
      const free = s.stats.supplies.available;
      toast(`${CATALOG[kind].label} needs ${cost} ${supplyWord(cost)} · ${free} free · remove something for a full refund`);
      return;
    }
    cb.onSelectTool(tool !== 'select' && tool === s.activeTool ? 'select' : tool);
  }

  function paint(): void {
    const s = last;
    if (!s) return;
    for (const [id, row] of groupRows) setHidden(row, id !== open);
    setHidden(tray, open === null);
    const activeGroup = groupOf(s.activeTool);
    for (const [id, tab] of tabs) {
      setPressed(tab, id === open);
      const expanded = id === open ? 'true' : 'false';
      if (tab.getAttribute('aria-expanded') !== expanded) tab.setAttribute('aria-expanded', expanded);
      setFlag(tab, 'has-active', id === activeGroup);
    }
    for (const { def, node, title } of buttons) {
      setPressed(node, def.id === s.activeTool);
      const kind = placedKind(def.id);
      const placed = kind !== null && CATALOG[kind].oneOfEach && (s.stats.thingCounts[kind] ?? 0) > 0;
      const short = !placed && isShort(s.stats.supplies, costOfTool(def.id));
      setFlag(node, 'is-placed', placed);
      setFlag(node, 'is-short', short);
      setFlag(node, 'is-beckoning', kind === 'farmhouse' && !s.stats.hasFarmhouse);
      const garage = kind === 'garage' && s.stats.hasGarage ? ` · ${s.stats.cartCount}/${s.stats.maxCarts} carts` : '';
      setTitle(node, `${title}${garage}${placed ? ' · placed' : short ? ` · ${s.stats.supplies.available} free` : ''}`);
    }
    supplies.render(s.stats.supplies, s.stats.seed);
    setFlag(tabs.get('homestead') ?? strip, 'is-beckoning', !s.stats.hasFarmhouse && open !== 'homestead');

    // The readout: the live one if there is one, else the tool's own hint.
    const text = s.readout?.text ?? (s.activeTool === 'select' ? '' : toolDef(s.activeTool)?.hint ?? '');
    setHidden(readout, text === '');
    setText(readoutText, text);
    const tone = s.readout?.tone ?? 'neutral';
    for (const t of ['neutral', 'wet', 'warn'] as const) setFlag(readout, `is-${t}`, t === tone);
    const turn = placedKind(s.activeTool) !== null && s.placingRotationDeg !== undefined
      ? `${Math.round(((s.placingRotationDeg % 360) + 360) % 360)}°` : '';
    setText(readoutTurn, turn);
    setHidden(readoutTurn, turn === '');
  }

  function render(s: UiSnapshot): void {
    // A first look, or a fresh valley, opens on the Farmhouse waiting to be placed.
    const fresh = last === null || last.stats.seed !== s.stats.seed || last.stats.season !== s.stats.season;
    if (fresh && !s.stats.hasFarmhouse) open = 'homestead';
    if (s.activeTool !== lastTool) {
      lastTool = s.activeTool;
      const g = groupOf(s.activeTool);
      if (g) open = g;
    }
    last = s;
    paint();
  }

  return { element: dock, render, choose };
}
