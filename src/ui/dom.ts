// Small DOM helpers the UI's pieces share. Every piece builds its elements once and then only touches what changed, so
// `render` can run every frame.

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** A plain button; `title` is its tooltip and its name for screen readers. */
export function button(cls: string, title: string, onClick: (e: MouseEvent) => void): HTMLButtonElement {
  const b = el('button', cls);
  b.type = 'button';
  b.title = title;
  b.setAttribute('aria-label', title);
  b.addEventListener('click', onClick);
  return b;
}

/** Sets a button's tooltip and its name for screen readers. */
export function setTitle(node: HTMLElement, title: string): void {
  if (node.title === title) return;
  node.title = title;
  node.setAttribute('aria-label', title);
}

export function setText(node: Node, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}

export function setFlag(node: Element, cls: string, on: boolean): void {
  if (node.classList.contains(cls) !== on) node.classList.toggle(cls, on);
}

export function setHidden(node: HTMLElement, hidden: boolean): void {
  if (node.hidden !== hidden) node.hidden = hidden;
}

/** Sets `aria-pressed` for a toggle button and its `is-on` look. */
export function setPressed(node: HTMLElement, on: boolean): void {
  const v = on ? 'true' : 'false';
  if (node.getAttribute('aria-pressed') !== v) node.setAttribute('aria-pressed', v);
  setFlag(node, 'is-on', on);
}
