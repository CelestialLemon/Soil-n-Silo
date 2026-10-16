// Auto-hiding scrollbars with edge fades (see `.sc` in game.css). Panels come and go, so one observer attaches every matching
// container as it appears and cleans it up as it leaves; the markup needs no changes.

const SELECTORS = [
  '.side-card .side-body', '.ui-sheets .sheet-wrap', '.cd-sheet .sheet-body', '.pause', '.settings-panel .sp-body',
  '.briefing .letter', '.briefing .terms', '.menu .menu-page', '.results', '.guide-index', '.guide-page',
];
/** Containers that fill the screen: the pointer is always over them, so hover alone would never hide the bar. */
const WIDE = new Set(['.ui-sheets .sheet-wrap', '.pause', '.menu .menu-page', '.results']);
/** How near (px) the pointer must come to a wide container's right edge to show its bar. */
const NEAR = 48;
const SELECTOR = SELECTORS.join(',');
const EDGE = 2;
const HIDE_MS = 900;
const FLASH_MS = 1400;
/** A panel rebuilt in place (the power panel, every second) is the same panel, so it doesn't flash again. */
const REBUILD_MS = 1500;
const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]';

const lastGone = new Map<string, number>();
const kindOf = (el: HTMLElement) => SELECTORS.find((q) => el.matches(q)) ?? '';

/** The panel a container belongs to: its kind and its parent's classes, so the ledger and the power sheet differ. */
const panelOf = (el: HTMLElement) => `${kindOf(el)}|${el.parentElement?.className ?? ''}`;

function attach(el: HTMLElement): { panel: string; cleanup: () => void; focused: () => boolean } {
  const kind = kindOf(el), panel = panelOf(el);
  const rebuilt = performance.now() - (lastGone.get(panel) ?? -Infinity) < REBUILD_MS;
  let hide = 0;
  let flash = 0;
  const update = () => {
    el.classList.toggle('can-up', el.scrollTop > EDGE);
    el.classList.toggle('can-down', el.scrollTop + el.clientHeight < el.scrollHeight - EDGE);
  };
  const onScroll = () => {
    update();
    el.classList.add('scrolling');
    clearTimeout(hide);
    hide = window.setTimeout(() => el.classList.remove('scrolling'), HIDE_MS);
  };
  el.classList.add('sc');
  const wide = WIDE.has(kind);
  const onMove = (e: PointerEvent) => el.classList.toggle('near', e.clientX >= el.getBoundingClientRect().right - NEAR);
  const onLeave = () => el.classList.remove('near');
  if (wide) {
    el.classList.add('sc-wide');
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
  }
  const addedTabindex = !el.querySelector(FOCUSABLE) && !el.hasAttribute('tabindex');
  if (addedTabindex) el.tabIndex = 0;
  // Removal may blur the element; only a blur that leaves it in the document counts as losing focus.
  let focused = false;
  const onFocus = () => { focused = true; };
  const onBlur = () => queueMicrotask(() => { if (el.isConnected) focused = false; });
  el.addEventListener('focus', onFocus);
  el.addEventListener('blur', onBlur);
  el.addEventListener('scroll', onScroll, { passive: true });
  const flashIfOverflowing = () => {
    if (el.scrollHeight <= el.clientHeight + EDGE) return;
    el.classList.add('flash');
    clearTimeout(flash);
    flash = window.setTimeout(() => el.classList.remove('flash'), FLASH_MS);
  };
  // A panel kept in the page while hidden (the routes card) flashes each time it is shown again.
  let ready = false, shown = false;
  const ro = new ResizeObserver(() => {
    update();
    const now = el.clientHeight > 0;
    if (ready && now && !shown) flashIfOverflowing();
    shown = now;
  });
  ro.observe(el);
  // Content can change size without the container resizing.
  const mo = new MutationObserver(update);
  mo.observe(el, { childList: true, subtree: true, characterData: true });
  // Layout isn't settled when the node is added, so judge overflow on the next frame.
  const frame = requestAnimationFrame(() => {
    update();
    ready = true;
    shown = el.clientHeight > 0;
    if (!rebuilt) flashIfOverflowing();
  });
  const cleanup = () => {
    lastGone.set(panel, performance.now());
    cancelAnimationFrame(frame);
    clearTimeout(hide);
    clearTimeout(flash);
    el.removeEventListener('scroll', onScroll);
    el.removeEventListener('focus', onFocus);
    el.removeEventListener('blur', onBlur);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    ro.disconnect();
    mo.disconnect();
    el.classList.remove('sc', 'sc-wide', 'near', 'can-up', 'can-down', 'scrolling', 'flash');
    if (addedTabindex) el.removeAttribute('tabindex');
  };
  return { panel, cleanup, focused: () => focused };
}

/** Styles every scroll container under `root`, now and as panels are added or removed. */
export function watchScrollHints(root: HTMLElement = document.body): () => void {
  const attached = new Map<HTMLElement, ReturnType<typeof attach>>();
  const add = (n: Node, refocus: Set<string>) => {
    if (!(n instanceof HTMLElement)) return;
    const found = n.matches(SELECTOR) ? [n] : [];
    for (const el of [...found, ...n.querySelectorAll<HTMLElement>(SELECTOR)]) {
      if (attached.has(el)) continue;
      const a = attach(el);
      attached.set(el, a);
      if (refocus.has(a.panel)) el.focus({ preventScroll: true });
    }
  };
  /** Cleans up removed containers; returns the panels that held keyboard focus, so a rebuilt replacement can take it. */
  const sweep = () => {
    const focused = new Set<string>();
    for (const [el, a] of attached) {
      if (el.isConnected) continue;
      if (a.focused()) focused.add(a.panel);
      a.cleanup();
      attached.delete(el);
    }
    return focused;
  };
  const mo = new MutationObserver((records) => {
    const refocus = sweep();
    for (const r of records) r.addedNodes.forEach((n) => add(n, refocus));
  });
  mo.observe(root, { childList: true, subtree: true });
  add(root, new Set());
  return () => {
    mo.disconnect();
    for (const a of attached.values()) a.cleanup();
    attached.clear();
  };
}
