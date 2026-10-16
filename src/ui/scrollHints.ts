// Auto-hiding scrollbars with edge fades (see `.sc` in game.css). Panels come and go, so one observer attaches every matching
// container as it appears and cleans it up as it leaves; the markup needs no changes.

const SELECTORS = [
  '.side-card .side-body', '.ui-sheets .sheet-wrap', '.cd-sheet .sheet-body', '.pause', '.settings-panel .sp-body',
  '.briefing .letter', '.briefing .terms', '.menu .menu-page', '.results', '.guide-index', '.guide-page',
];
const SELECTOR = SELECTORS.join(',');
const EDGE = 2;
const HIDE_MS = 900;
const FLASH_MS = 1400;
/** A panel rebuilt in place (the power panel, every second) is the same panel, so it doesn't flash again. */
const REBUILD_MS = 1500;
const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]';

const lastGone = new Map<string, number>();
const kindOf = (el: HTMLElement) => SELECTORS.find((q) => el.matches(q)) ?? '';

function attach(el: HTMLElement): { cleanup: () => void; focused: () => boolean } {
  const kind = kindOf(el);
  const rebuilt = performance.now() - (lastGone.get(kind) ?? -Infinity) < REBUILD_MS;
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
  const addedTabindex = !el.querySelector(FOCUSABLE) && !el.hasAttribute('tabindex');
  if (addedTabindex) el.tabIndex = 0;
  // Removal may blur the element; only a blur that leaves it in the document counts as losing focus.
  let focused = false;
  const onFocus = () => { focused = true; };
  const onBlur = () => queueMicrotask(() => { if (el.isConnected) focused = false; });
  el.addEventListener('focus', onFocus);
  el.addEventListener('blur', onBlur);
  el.addEventListener('scroll', onScroll, { passive: true });
  const ro = new ResizeObserver(update);
  ro.observe(el);
  // Content can change size without the container resizing.
  const mo = new MutationObserver(update);
  mo.observe(el, { childList: true, subtree: true, characterData: true });
  // Layout isn't settled when the node is added, so judge overflow on the next frame.
  const frame = requestAnimationFrame(() => {
    update();
    if (!rebuilt && el.scrollHeight > el.clientHeight + EDGE) {
      el.classList.add('flash');
      flash = window.setTimeout(() => el.classList.remove('flash'), FLASH_MS);
    }
  });
  const cleanup = () => {
    lastGone.set(kind, performance.now());
    cancelAnimationFrame(frame);
    clearTimeout(hide);
    clearTimeout(flash);
    el.removeEventListener('scroll', onScroll);
    el.removeEventListener('focus', onFocus);
    el.removeEventListener('blur', onBlur);
    ro.disconnect();
    mo.disconnect();
    el.classList.remove('sc', 'can-up', 'can-down', 'scrolling', 'flash');
    if (addedTabindex) el.removeAttribute('tabindex');
  };
  return { cleanup, focused: () => focused };
}

/** Styles every scroll container under `root`, now and as panels are added or removed. */
export function watchScrollHints(root: HTMLElement = document.body): () => void {
  const attached = new Map<HTMLElement, ReturnType<typeof attach>>();
  const add = (n: Node, refocus: Set<string>) => {
    if (!(n instanceof HTMLElement)) return;
    const found = n.matches(SELECTOR) ? [n] : [];
    for (const el of [...found, ...n.querySelectorAll<HTMLElement>(SELECTOR)]) {
      if (attached.has(el)) continue;
      attached.set(el, attach(el));
      if (refocus.has(kindOf(el))) el.focus({ preventScroll: true });
    }
  };
  /** Cleans up removed containers; returns the kinds that held keyboard focus, so a rebuilt replacement can take it. */
  const sweep = () => {
    const focused = new Set<string>();
    for (const [el, a] of attached) {
      if (el.isConnected) continue;
      if (a.focused()) focused.add(kindOf(el));
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
