import { BUILDINGS, type BuildingId } from './game/data.ts';

// The game's keys as data: every action a key can do, its default keys, and the player's changes to them. Pure (no DOM), so
// `npm test` covers it. Keys are physical key codes (`KeyboardEvent.code`), so a binding follows the key's place on the
// keyboard; `keyLabel` shows the letter the player's layout prints there. Escape is not an action here: it always closes a
// panel, backs out and pauses.

export type ActionId =
  | `build:${BuildingId}` | 'remove' | 'rotate'
  | 'turnLeft' | 'turnRight' | 'zoomIn' | 'zoomOut' | 'overlay' | 'panLeft' | 'panRight' | 'panUp' | 'panDown'
  | 'pause' | 'speed1' | 'speed2' | 'speed3'
  | 'ledger' | 'routes' | 'power' | 'guide';

export type GroupId = 'build' | 'view' | 'time' | 'panels';
export const GROUPS: { id: GroupId; name: string; col: string }[] = [
  { id: 'build', name: 'Build', col: 'var(--pine)' }, { id: 'view', name: 'View', col: 'var(--tide)' },
  { id: 'time', name: 'Time', col: 'var(--ochre)' }, { id: 'panels', name: 'Panels', col: 'var(--plum)' },
];

export interface ActionDef { id: ActionId; label: string; group: GroupId; keys: readonly string[]; note?: string }

/** The most keys one action can have. */
export const SLOTS = 2;

/** The buildings with a key, in the order the keys have always been listed. */
const KEYED: BuildingId[] = ['field', 'silo', 'garage', 'pylon', 'solar'];

const buildActions = (): ActionDef[] => KEYED.flatMap((id) => {
  const d = BUILDINGS[id];
  return d.key ? [{ id: `build:${id}` as const, label: d.name, group: 'build' as const, keys: [`Key${d.key}`] }] : [];
});

/** Every action, in the order they are listed. */
export const ACTIONS: readonly ActionDef[] = [
  ...buildActions(),
  { id: 'remove', label: 'Remove', group: 'build', keys: ['KeyX'] },
  { id: 'rotate', label: 'Turn the building', group: 'build', keys: ['KeyR'], note: 'With Shift it turns back.' },
  { id: 'turnLeft', label: 'Turn the view left', group: 'view', keys: ['KeyQ'] },
  { id: 'turnRight', label: 'Turn the view right', group: 'view', keys: ['KeyE'] },
  { id: 'zoomIn', label: 'Zoom in', group: 'view', keys: ['KeyZ', 'Equal'], note: 'With Shift, a letter key zooms out.' },
  { id: 'zoomOut', label: 'Zoom out', group: 'view', keys: ['Minus'] },
  { id: 'overlay', label: 'Next overlay', group: 'view', keys: ['KeyV'], note: 'Soil, water, power, roads, bees.' },
  { id: 'panLeft', label: 'Pan left', group: 'view', keys: ['ArrowLeft'] },
  { id: 'panRight', label: 'Pan right', group: 'view', keys: ['ArrowRight'] },
  { id: 'panUp', label: 'Pan up', group: 'view', keys: ['ArrowUp'] },
  { id: 'panDown', label: 'Pan down', group: 'view', keys: ['ArrowDown'] },
  { id: 'pause', label: 'Pause and play', group: 'time', keys: ['Space'] },
  { id: 'speed1', label: 'Normal speed, 1×', group: 'time', keys: ['Digit1'] },
  { id: 'speed2', label: 'Fast, 2×', group: 'time', keys: ['Digit2'] },
  { id: 'speed3', label: 'Fastest, 4×', group: 'time', keys: ['Digit3'] },
  { id: 'ledger', label: 'Ledger', group: 'panels', keys: ['Tab'] },
  { id: 'routes', label: 'Routes', group: 'panels', keys: ['KeyO'] },
  { id: 'power', label: 'Power', group: 'panels', keys: ['KeyW'] },
  { id: 'guide', label: 'Guide', group: 'panels', keys: ['KeyG'] },
];

const BY_ID = new Map<string, ActionDef>(ACTIONS.map((a) => [a.id, a]));
export const actionDef = (id: ActionId): ActionDef => {
  const a = BY_ID.get(id);
  if (!a) throw new Error(`No action ${id}`);
  return a;
};

/** The keys each action has now. */
export type Bindings = Record<ActionId, string[]>;
/** What the player changed: only the actions whose keys differ from the defaults (an empty list: no key). */
export type Overrides = Partial<Record<ActionId, string[]>>;

/** A key code the same whichever copy of the key is pressed: the numpad's digits, + and − count as the main keyboard's. */
export function canon(code: string): string {
  if (code === 'NumpadAdd') return 'Equal';
  if (code === 'NumpadSubtract') return 'Minus';
  const n = /^Numpad(\d)$/.exec(code);
  return n ? `Digit${n[1]}` : code;
}

/** Whether a key can be given to an action: not Escape (always the way out), a modifier, Enter or a function key (the browser's). */
export function bindable(code: string): boolean {
  return code !== '' && !/^(Escape|Enter|NumpadEnter|CapsLock|ContextMenu|Unidentified|(Shift|Control|Alt|Meta|OS)(Left|Right)|F\d+)$/.test(code);
}

/** The defaults. */
export function defaultBindings(): Bindings {
  return Object.fromEntries(ACTIONS.map((a) => [a.id, [...a.keys]])) as Bindings;
}

/**
 * The keys in force: the defaults with the overrides laid over. A key is never on two actions: if the overrides (edited by hand)
 * give one key to two actions, the first in the list keeps it, and a default yields to an override.
 */
export function resolve(overrides: Overrides): Bindings {
  const out = defaultBindings();
  const taken = new Set<string>();
  for (const a of ACTIONS) {
    const o = overrides[a.id];
    if (!o) continue;
    out[a.id] = o.filter((c) => !taken.has(c));
    for (const c of out[a.id]) taken.add(c);
  }
  for (const a of ACTIONS) if (!overrides[a.id]) { out[a.id] = out[a.id].filter((c) => !taken.has(c)); for (const c of out[a.id]) taken.add(c); }
  return out;
}

/** The overrides that make `b` from the defaults. */
export function overridesOf(b: Bindings): Overrides {
  const out: Overrides = {};
  for (const a of ACTIONS) if (b[a.id].length !== a.keys.length || b[a.id].some((c, i) => c !== a.keys[i])) out[a.id] = [...b[a.id]];
  return out;
}

/** Saved overrides, read back: unknown actions, unusable keys and a key given twice are left out. */
export function readOverrides(raw: unknown): Overrides {
  const out: Overrides = {};
  if (typeof raw !== 'object' || raw === null) return out;
  const o = raw as Record<string, unknown>;
  for (const a of ACTIONS) {
    const v = o[a.id];
    if (!Array.isArray(v)) continue;
    const codes = v.filter((c): c is string => typeof c === 'string').map(canon).filter(bindable);
    out[a.id] = codes.filter((c, i) => codes.indexOf(c) === i).slice(0, SLOTS);
  }
  return out;
}

/** The action each key does. */
export function keymapOf(b: Bindings): Map<string, ActionId> {
  const m = new Map<string, ActionId>();
  for (const a of ACTIONS) for (const c of b[a.id]) m.set(c, a.id);
  return m;
}

/** Gives `code` to an action's `slot` (the second slot of an action with one key adds a key). The key leaves whichever action had it: they are named in `took`. */
export function assign(b: Bindings, id: ActionId, slot: number, code: string): { bindings: Bindings; took: ActionId[] } {
  const next = Object.fromEntries(ACTIONS.map((a) => [a.id, [...b[a.id]]])) as Bindings;
  const took: ActionId[] = [];
  for (const a of ACTIONS) if (a.id !== id && next[a.id].includes(code)) { next[a.id] = next[a.id].filter((c) => c !== code); took.push(a.id); }
  const mine = next[id];
  mine[Math.min(slot, mine.length)] = code;
  next[id] = mine.filter((c, i) => mine.indexOf(c) === i);
  return { bindings: next, took };
}

/** Takes the key out of an action's `slot`. */
export function unassign(b: Bindings, id: ActionId, slot: number): Bindings {
  return { ...b, [id]: b[id].filter((_, i) => i !== slot) };
}

const NAMED: Record<string, string> = {
  Space: 'Space', Tab: 'Tab', Backspace: 'Backspace', Delete: 'Del', Insert: 'Ins', Home: 'Home', End: 'End', PageUp: 'PgUp', PageDown: 'PgDn',
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
  Equal: '=', Minus: '−', Comma: ',', Period: '.', Slash: '/', Semicolon: ';', Quote: '\'', Backslash: '\\', BracketLeft: '[', BracketRight: ']',
  Backquote: '`', IntlBackslash: '\\',
};

/** What a key is called on screen. `layout` (the browser's map from key codes to what the layout prints there) names letters and marks as the player sees them. */
export function keyLabel(code: string, layout?: { get(code: string): string | undefined } | null): string {
  if (code.startsWith('Arrow') || code === 'Space' || code === 'Tab') return NAMED[code] ?? code;
  const printed = layout?.get(code);
  if (printed && printed.length === 1) return printed === '-' ? '−' : printed.toUpperCase();
  if (code in NAMED) return NAMED[code];
  const k = /^Key([A-Z])$/.exec(code) ?? /^Digit(\d)$/.exec(code);
  if (k) return k[1];
  return code.startsWith('Numpad') ? `Num ${code.slice(6)}` : code;
}
