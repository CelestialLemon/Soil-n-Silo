// The card shown while the valley is being painted (the models load, the land is built), and what it says if it can't be.
import { el, setText } from './dom.ts';

export interface Loading {
  /** Says why the valley couldn't be drawn, and stays. */
  fail(message: string): void;
  /** Takes the card away. */
  done(): void;
}

export function mountLoading(root: HTMLElement): Loading {
  const card = el('section', 'ui-loading ui-float');
  card.setAttribute('role', 'status');
  const text = el('p', 'ui-loading-text', 'Painting the valley…');
  card.append(el('h1', 'ui-loading-title', 'Soil n Silo'), text);
  root.classList.add('ui-root');
  root.append(card);
  return {
    fail(message) { card.classList.add('is-failed'); setText(text, message); },
    done() { card.remove(); },
  };
}
