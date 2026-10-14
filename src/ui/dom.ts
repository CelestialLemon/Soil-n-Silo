// A tiny element builder for the HUD and menus: h('div', { class: 'x', onclick }, child, 'text', ...), and the same for SVG.

type Child = Node | string | number | null | undefined | false;
type Props = Record<string, unknown>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'style') el.setAttribute('style', String(v));
    else if (k === 'class') el.className = String(v);
    else if (k in el) (el as unknown as Record<string, unknown>)[k] = v;
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

const SVG = 'http://www.w3.org/2000/svg';

/** An SVG element: every prop is an attribute (`class` included), except `on…` listeners. */
export function svg<K extends keyof SVGElementTagNameMap>(tag: K, props: Props | null = null, ...children: (Child | Child[])[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v as EventListener);
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

/** Replaces an element's children; like h(), null and false children are left out. */
export function fill(el: Element, ...children: (Child | Child[])[]) {
  el.replaceChildren(...children.flat().filter((c): c is Node | string | number => c !== null && c !== undefined && c !== false).map((c) => (c instanceof Node ? c : String(c))));
  return el;
}

/** A Clearday icon from the sprite (`size` in px, 32 by default). */
export const icon = (name: string, size?: number, cls = '') =>
  h('span', { class: `cd-i cd-i--${name}${cls ? ` ${cls}` : ''}`, style: size ? `--s: ${size}px` : undefined, 'aria-hidden': 'true' });

/** Sets an element's text if it changed (so a redraw every frame costs nothing when nothing moved). */
export function set(el: Element, text: string) { if (el.textContent !== text) el.textContent = text; }

/** Sets a CSS custom property if it changed. */
export function setVar(el: HTMLElement, name: string, value: string | number) {
  const v = String(value);
  if (el.style.getPropertyValue(name) !== v) el.style.setProperty(name, v);
}

/** Replaces an element's children only when `key` changed since last time (kept on the element). */
export function rebuild(el: HTMLElement, key: string, make: () => (Child | Child[])[]) {
  if (el.dataset.key === key) return false;
  el.dataset.key = key;
  fill(el, ...make());
  return true;
}
