// Soft notes at the top of the screen: why an action didn't take ("Too steep for a building") or a small milestone
// ("Farmhouse settled"). They fade on their own, never block the valley, and the same note again just stays a little longer.

export interface Toasts {
  element: HTMLElement;
  show(message: string, tone?: 'info' | 'warn'): void;
  dispose(): void;
}

const STAY_MS = 3400, FADE_MS = 420, MAX = 3;

interface Note { node: HTMLElement; message: string; timer: number }

export function createToasts(): Toasts {
  const shelf = document.createElement('div');
  shelf.className = 'ui-toasts';
  shelf.setAttribute('role', 'status');
  shelf.setAttribute('aria-live', 'polite');
  const notes: Note[] = [];

  function drop(note: Note): void {
    const i = notes.indexOf(note);
    if (i >= 0) notes.splice(i, 1);
    window.clearTimeout(note.timer);
    note.node.classList.add('is-leaving');
    window.setTimeout(() => note.node.remove(), FADE_MS);
  }

  function show(message: string, tone: 'info' | 'warn' = 'info'): void {
    const same = notes.find((n) => n.message === message);
    if (same) {
      window.clearTimeout(same.timer);
      same.timer = window.setTimeout(() => drop(same), STAY_MS);
      same.node.classList.remove('is-nudged');
      void same.node.offsetWidth;
      same.node.classList.add('is-nudged');
      return;
    }
    const node = document.createElement('div');
    node.className = `ui-toast ui-float is-${tone}`;
    node.textContent = message;
    const note: Note = { node, message, timer: 0 };
    note.timer = window.setTimeout(() => drop(note), STAY_MS);
    notes.push(note);
    shelf.append(node);
    while (notes.length > MAX) {
      const oldest = notes[0];
      if (oldest) drop(oldest);
    }
  }

  function dispose(): void {
    for (const n of notes) window.clearTimeout(n.timer);
    notes.length = 0;
    shelf.replaceChildren();
  }

  return { element: shelf, show, dispose };
}
