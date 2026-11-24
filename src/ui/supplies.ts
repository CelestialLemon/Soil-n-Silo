// The Supplies counter, docked at the left of the tool strip: the crate and "free / unlocked" (docs/DESIGN.md, "One Shared
// Capped Pool"). Its tooltip has the valley's cap and what earns the next milestone drop; when a drop arrives it glows
// once and shows the gift ("+4") for a moment.
import type { SuppliesState } from '../game/index.ts';
import { el, setFlag, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import type { SuppliesView } from './types.ts';

/** The counter's view of the game's pool: its figures, and the next drop still to come in plain words. */
export function suppliesView(sup: SuppliesState): SuppliesView {
  const next = sup.drops.find((d) => !d.received);
  return {
    available: sup.available, spent: sup.spent, unlocked: sup.unlocked, cap: sup.cap,
    nextDropHint: next ? `+${next.amount} · ${next.label}` : null,
  };
}

export const supplyWord = (n: number): string => (n === 1 ? 'Supply' : 'Supplies');

export interface SuppliesPill {
  element: HTMLElement;
  /** `seed` tells a fresh valley (whose pool starts over) from a drop arriving. */
  render(sup: SuppliesView, seed: number): void;
}

/** How long a drop's glow and its "+N" stay, ms (matches `ui-drop` in style.css). */
const GLOW_MS = 2600;

export function createSuppliesPill(): SuppliesPill {
  let last: { unlocked: number; seed: number } | null = null;
  let glowTimer = 0;

  const pill = el('div', 'ui-supplies');
  pill.setAttribute('role', 'status');
  const figure = el('span', 'ui-supplies-figure');
  const free = el('b', 'ui-supplies-free');
  const of = el('span', 'ui-supplies-of');
  figure.append(free, of);
  const gift = el('span', 'ui-supplies-gift');
  pill.append(icon('supplies', 'ui-icon ui-supplies-icon'), figure, gift);

  function render(sup: SuppliesView, seed: number): void {
    setText(free, String(sup.available));
    setText(of, ` / ${sup.unlocked}`);
    setFlag(pill, 'is-empty', sup.available <= 0);
    const tip = [
      `Supplies: ${sup.available} free of ${sup.unlocked} (${sup.spent} in use, all refundable) · cap ${sup.cap}`,
      sup.nextDropHint ? `Next drop ${sup.nextDropHint}` : 'Every milestone drop has arrived',
    ].join('\n');
    setTitle(pill, tip);

    if (last && last.seed === seed && sup.unlocked > last.unlocked) {
      setText(gift, `+${sup.unlocked - last.unlocked}`);
      pill.classList.remove('is-dropped');
      void pill.offsetWidth;
      pill.classList.add('is-dropped');
      window.clearTimeout(glowTimer);
      glowTimer = window.setTimeout(() => pill.classList.remove('is-dropped'), GLOW_MS);
    }
    last = { unlocked: sup.unlocked, seed };
  }

  return { element: pill, render };
}
