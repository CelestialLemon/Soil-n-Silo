// The PR preview's look choices, under the sky strip: snapped or free camera turns, and pylons or wireless power. Each
// choice also sits in the page's address (`?yaw=snap|orbit`, `?wiring=pylons|wireless`), kept in step here so a reload or a
// shared link opens on the same pick. It folds away while painting. Remove it once the choices are settled (AGENTS.md).
import { button, el, recall, remember, setHidden, setPressed, setText, setTitle } from './dom.ts';
import { icon } from './icons.ts';
import type { UiCallbacks, UiSnapshot, WiringMode, YawMode } from './types.ts';

export interface Compare { element: HTMLElement; render(s: UiSnapshot): void }

/** Writes one choice into the address without reloading or adding a history step. */
function syncUrl(key: string, value: string): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(key) === value) return;
    url.searchParams.set(key, value);
    window.history.replaceState(window.history.state, '', url);
  } catch { /* an address we can't rewrite (a sandboxed frame): the choice still applies */ }
}

export function createCompare(cb: UiCallbacks): Compare {
  let folded = recall('compare.folded') === '1';

  const panel = el('section', 'ui-compare ui-float');
  panel.setAttribute('aria-label', 'Preview choices');

  const head = button('ui-compare-head', 'Fold the preview choices', () => {
    folded = !folded;
    remember('compare.folded', folded ? '1' : '0');
    paintFold();
  });
  head.append(el('span', 'ui-compare-title', 'Preview choices'), icon('chevron', 'ui-icon ui-compare-chevron'));

  const body = el('div', 'ui-compare-body');

  function row<T extends string>(label: string, key: string, options: readonly { value: T; label: string }[], pick: (v: T) => void) {
    const wrap = el('div', 'ui-compare-row');
    const seg = el('div', 'ui-seg');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', label);
    const btns = options.map((o) => {
      const b = button('ui-seg-btn', `${label}: ${o.label}`, () => { syncUrl(key, o.value); pick(o.value); });
      b.textContent = o.label;
      seg.append(b);
      return { value: o.value, node: b };
    });
    wrap.append(el('span', 'ui-compare-label', label), seg);
    body.append(wrap);
    return (value: T) => { for (const b of btns) setPressed(b.node, b.value === value); };
  }

  const showYaw = row<YawMode>('Camera', 'yaw', [{ value: 'snap', label: 'Snapped 90°' }, { value: 'orbit', label: 'Free orbit' }], (v) => cb.onSetYawMode(v));
  const showWiring = row<WiringMode>('Wiring', 'wiring', [{ value: 'pylons', label: 'Wooden pylons' }, { value: 'wireless', label: 'Wireless radius' }], (v) => cb.onSetWiringMode(v));
  const query = el('code', 'ui-compare-query');
  body.append(query);
  panel.append(head, body);

  function paintFold(): void {
    setHidden(body, folded);
    panel.classList.toggle('is-folded', folded);
    setTitle(head, folded ? 'Open the preview choices' : 'Fold the preview choices');
    head.setAttribute('aria-expanded', folded ? 'false' : 'true');
  }
  paintFold();

  function render(s: UiSnapshot): void {
    showYaw(s.yawMode);
    showWiring(s.wiringMode);
    setText(query, `?yaw=${s.yawMode}&wiring=${s.wiringMode}`);
  }

  return { element: panel, render };
}
