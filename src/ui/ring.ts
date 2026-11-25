// The building card: a small card beside the thing the player clicked, with its name, one plain line on how it's doing
// (and, for some, a second: its stock, its charge, the order's progress) and Move / Turn / Remove, Remove saying the
// Supplies it gives back. The Depot, fixed at the valley's edge, gets a read-only card. The Garage's card carries its cart
// row: how many carts run, "+ Cart" and "Retire", so carts never need a menu of their own. The card follows the thing on
// screen as the camera moves (`updatePosition`, which only sets a transform), stays inside the window and keeps clear of the
// tool strip.
import { CART_COST, CATALOG } from '../game/index.ts';
import { button, el, setFlag, setHidden, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import { supplyWord } from './supplies.ts';
import type { SelectedThingView, UiCallbacks } from './types.ts';

export interface Ring {
  element: HTMLElement;
  render(selected: SelectedThingView | null): void;
  updatePosition(x: number, y: number, visible: boolean): void;
}

/** A turn of the ring's buttons: 15°. The game's yaw turns anticlockwise seen from above, so ↺ adds it and ↻ takes it away. */
const TURN = Math.PI / 12;
/** How far the card sits from the thing's point, and from the window's edges, px. */
const GAP = 30, EDGE = 12;
/** The room kept free at the bottom for the tool strip, and at the top for the postcard and sky strip, px. */
const BOTTOM = 112, TOP = 12;

/** What changes the card's size: when it does, the card is measured again. */
const shapeOf = (v: SelectedThingView): string => [
  v.preference, v.label, v.statusLine, v.detailLine ?? '', v.connected ?? '', v.immovable ?? false, v.refund ?? 0,
  v.cartControls ? `${v.cartControls.canRetire}` : '',
].join('|');

export function createRing(root: HTMLElement, cb: UiCallbacks, toast: (message: string) => void): Ring {
  let current: SelectedThingView | null = null;
  let size = { w: 0, h: 0 };
  let shown = false;
  let shape = '';

  const layer = el('div', 'ui-ring-layer');
  const anchor = el('div', 'ui-ring-anchor');
  const card = el('section', 'ui-ring');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Selected building');
  const inner = el('div', 'ui-ring-inner ui-float');

  const head = el('header', 'ui-ring-head');
  const title = el('h2', 'ui-ring-title');
  const close = button('ui-icon-btn ui-ring-close', 'Close (Esc)', () => cb.onDeselect());
  close.append(icon('close'));
  head.append(title, close);

  const status = el('p', 'ui-ring-status');
  const detail = el('p', 'ui-ring-detail');
  const meta = el('p', 'ui-ring-meta');
  const power = el('span', 'ui-ring-power');
  const facing = el('span', 'ui-ring-facing');
  meta.append(power, facing);

  // The Garage's carts.
  const carts = el('div', 'ui-ring-carts');
  const cartCount = el('span', 'ui-ring-carts-count');
  const buy = button('ui-cart-btn', 'Buy an Electric Cart', () => {
    const c = current?.cartControls;
    if (!c) return;
    if (c.count >= c.max) toast(`The Garage runs at most ${c.max} carts`);
    else if (!c.canAfford) toast(`An Electric Cart needs ${CART_COST} ${supplyWord(CART_COST)} · remove something for a full refund`);
    else cb.onBuyCart();
  });
  buy.append(icon('plus'), el('span', '', `Cart (${CART_COST})`));
  const retire = button('ui-cart-btn', `Retire a cart (+${CART_COST} back)`, () => {
    const c = current?.cartControls;
    if (c?.canRetire && c.retireId !== undefined) cb.onRetireCart(c.retireId);
  });
  retire.append(icon('minus'), el('span', '', `Retire (+${CART_COST})`));
  carts.append(cartCount, buy, retire);

  const actions = el('div', 'ui-ring-actions');
  const withId = (f: (id: number) => void) => () => { if (current) f(current.id); };
  const move = button('ui-act', 'Move', withId((id) => cb.onMoveSelected(id)));
  move.append(icon('move'), el('span', '', 'Move'));
  const left = button('ui-act ui-act-icon', 'Turn left 15°', withId((id) => cb.onRotateSelected(id, TURN)));
  left.append(icon('rotateLeft'), el('span', '', '15°'));
  const right = button('ui-act ui-act-icon', 'Turn right 15°', withId((id) => cb.onRotateSelected(id, -TURN)));
  right.append(icon('rotateRight'), el('span', '', '15°'));
  const remove = button('ui-act ui-act-remove', 'Remove (Delete)', withId((id) => cb.onRemoveSelected(id)));
  const removeText = el('span', '', 'Remove');
  remove.append(icon('remove'), removeText);
  actions.append(move, left, right, remove);

  const preference = button('ui-cart-btn', 'Cycle production preference', withId(id => cb.onCyclePreference(id)));
  inner.append(head, status, detail, meta, preference, carts, actions);
  card.append(inner);
  layer.append(anchor, card);
  layer.hidden = true;

  function updatePosition(x: number, y: number, visible: boolean): void {
    const on = visible && current !== null;
    setFlag(layer, 'is-offscreen', !on);
    if (!on) return;
    const W = root.clientWidth, H = root.clientHeight;
    const { w, h } = size;
    // To the right of the thing, or to its left when there's no room; level with it, inside the free band.
    let cx = x + GAP;
    if (cx + w > W - EDGE) cx = x - GAP - w;
    cx = Math.max(EDGE, Math.min(W - EDGE - w, cx));
    const maxY = Math.max(TOP, H - BOTTOM - h);
    const cy = Math.max(TOP, Math.min(maxY, y - h / 2));
    card.style.transform = `translate3d(${Math.round(cx)}px, ${Math.round(cy)}px, 0)`;
    anchor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }

  function render(selected: SelectedThingView | null): void {
    const was = current;
    current = selected;
    setHidden(layer, selected === null);
    if (!selected) { shown = false; return; }

    setHidden(preference, !selected.preference);
    setText(preference, selected.preference ?? '');
    setText(title, selected.label);
    setText(status, selected.statusLine);
    setText(detail, selected.detailLine ?? '');
    setHidden(detail, !selected.detailLine);
    const powered = selected.connected;
    setHidden(power, powered === undefined);
    setText(power, powered ? 'Power connected' : 'Unconnected');
    setFlag(power, 'is-on', powered === true);
    const fixed = selected.immovable === true;
    setHidden(facing, fixed);
    setText(facing, `Facing ${Math.round(((selected.yawDeg % 360) + 360) % 360)}°`);
    setHidden(meta, fixed && powered === undefined);
    const category = CATALOG[selected.kind].category;
    if (card.dataset.category !== category) card.dataset.category = category;
    setFlag(card, 'is-fixed', fixed);

    // Move, turns and Remove: none for the Depot.
    setHidden(actions, fixed);
    const refund = selected.refund ?? 0;
    setText(removeText, refund > 0 ? `Remove (+${refund})` : 'Remove');
    setTitle(remove, refund > 0 ? `Remove (Delete) · gives back ${refund} ${supplyWord(refund)}` : 'Remove (Delete)');

    const c = selected.cartControls;
    setHidden(carts, c === undefined);
    if (c) {
      setText(cartCount, `Carts ${c.count}/${c.max}`);
      setFlag(buy, 'is-short', !c.canAfford || c.count >= c.max);
      setHidden(retire, !c.canRetire || c.retireId === undefined);
    }

    const nextShape = shapeOf(selected);
    if (!shown || was?.id !== selected.id) {
      // A new card: measure it once, then let it bloom in.
      size = { w: card.offsetWidth, h: card.offsetHeight };
      shape = nextShape;
      shown = true;
      inner.classList.remove('is-blooming');
      void inner.offsetWidth;
      inner.classList.add('is-blooming');
    } else if (nextShape !== shape) {
      shape = nextShape;
      size = { w: card.offsetWidth, h: card.offsetHeight };
    }
    updatePosition(selected.screenX, selected.screenY, selected.visible);
  }

  return { element: layer, render, updatePosition };
}
