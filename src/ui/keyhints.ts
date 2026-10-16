import { actionDef, canon, defaultBindings, keyLabel, keymapOf, resolve, type ActionId, type Bindings } from '../keybindings.ts';
import type { SettingsStore } from './settings.ts';

// The keys in force, for the screens that name them (tooltips, the pause screen, the guide) and for main.ts to read key presses
// against. Follows the settings: `followKeys` is called once, before anything is drawn.

let bindings: Bindings = defaultBindings();
let keymap = keymapOf(bindings);
/** The browser's map from key codes to what the player's layout prints there (Chromium only); until it arrives, the US names show. */
let layout: { get(code: string): string | undefined } | null = null;

let version = 0;
const titled: [HTMLElement, () => string][] = [];

export function followKeys(store: SettingsStore) {
  store.listen((st) => {
    bindings = resolve(st.keys); keymap = keymapOf(bindings); version++;
    for (const [el, make] of titled) el.title = make();
  });
  const nav = navigator as unknown as { keyboard?: { getLayoutMap?: () => Promise<ReadonlyMap<string, string>> } };
  nav.keyboard?.getLayoutMap?.().then((m) => { layout = m; version++; for (const [el, make] of titled) el.title = make(); }, () => {});
}

/** Changes whenever the keys or their names do, for screens that redraw only when something changed. */
export const keysVersion = () => version;

/** The key presses and what each does. */
export const actionOf = (code: string): ActionId | undefined => keymap.get(canon(code));
/** The keys an action has now. */
export const keysOf = (id: ActionId): readonly string[] => bindings[id];
/** Whether any of an action's keys is in `held` (key codes). */
export const isHeld = (id: ActionId, held: ReadonlySet<string>) => bindings[id].some((c) => held.has(c));
/** An action's keys, named for the screen (none: it has no key). */
export const keyNames = (id: ActionId): string[] => (bindings[id] ?? []).map((c) => keyLabel(c, layout));
export const nameOf = (code: string) => keyLabel(code, layout);
export const labelOf = (id: ActionId) => actionDef(id).label;

/** A tooltip: `Ledger (Tab)`, with each key in `keys` (words and key names) after the name; no keys, no brackets. */
export function tip(name: string, ...keys: string[]) { return keys.length ? `${name} (${keys.join(' or ')})` : name; }

/** Sets an element's tooltip from `make`, and again whenever the keys change. */
export function titledBy<T extends HTMLElement>(el: T, make: () => string): T {
  el.title = make();
  titled.push([el, make]);
  return el;
}
