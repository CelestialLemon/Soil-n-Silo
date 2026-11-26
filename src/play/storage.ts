// The saved game: one slot in this browser (SAVE_KEY) and a `.json` file to download. Both hold the game's own save text
// (src/game/save.ts serializeSave), read back only through deserializeSave, which refuses any other version: an old save
// is refused, never migrated. The slot is one envelope, `{ savedAt, data }`, written in one go, so a write the browser
// refuses (its storage full) leaves the last save whole. Storage that's blocked or full is said in a Result, never thrown.
import { deserializeSave, err, type GameState, ok, type Result, serializeSave } from '../game/index.ts';

export const SAVE_KEY = 'soil-n-silo:save:v2';

/** What the slot holds: when it was saved (ms since 1970) and the game's save text. */
interface SlotEnvelope { savedAt: number; data: string }

const NO_STORAGE = 'This browser has no storage to save in.';

function storage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}

/** Saves the game in this browser, over the last save. */
export function saveToBrowser(state: GameState, now: Date = new Date()): Result<void, string> {
  const ls = storage();
  if (!ls) return err(NO_STORAGE);
  const envelope: SlotEnvelope = { savedAt: now.getTime(), data: serializeSave(state) };
  try {
    ls.setItem(SAVE_KEY, JSON.stringify(envelope));
    return ok(undefined);
  } catch (e) {
    const full = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return err(full ? 'There is no room left in this browser to save.' : 'This browser would not keep the save.');
  }
}

/** The slot's envelope from its stored text, or null when it isn't one. */
function parseSlot(text: string): SlotEnvelope | null {
  let v: unknown;
  try { v = JSON.parse(text); } catch { return null; }
  if (typeof v !== 'object' || v === null) return null;
  const { savedAt, data } = v as Record<string, unknown>;
  return typeof savedAt === 'number' && Number.isFinite(savedAt) && typeof data === 'string' ? { savedAt, data } : null;
}

/** The game saved in this browser, or why it can't be loaded. */
export function loadFromBrowser(): Result<GameState, string> {
  const ls = storage();
  if (!ls) return err(NO_STORAGE);
  let text: string | null;
  try { text = ls.getItem(SAVE_KEY); } catch { return err('This browser would not read the save.'); }
  if (text === null) return err('There is no saved game yet.');
  const slot = parseSlot(text);
  if (!slot) return err('The saved game is damaged.');
  return deserializeSave(slot.data);
}

/** When a save was made, in plain words: "Saved 10:42", "Saved yesterday", "Saved 24 Nov". */
export function savedAtLabel(at: Date, now: Date = new Date()): string {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(now) - day(at)) / 86_400_000);
  if (days === 0) return `Saved ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
  if (days === 1) return 'Saved yesterday';
  return `Saved ${at.getDate()} ${at.toLocaleString('en', { month: 'short' })}`;
}

/** Whether a saved game is there to load, and when it was saved. */
export function savedSlotInfo(now: Date = new Date()): { hasSavedGame: boolean; savedAtLabel?: string } {
  const ls = storage();
  if (!ls) return { hasSavedGame: false };
  try {
    const text = ls.getItem(SAVE_KEY);
    if (text === null) return { hasSavedGame: false };
    const slot = parseSlot(text);
    return slot && slot.savedAt > 0 ? { hasSavedGame: true, savedAtLabel: savedAtLabel(new Date(slot.savedAt), now) } : { hasSavedGame: true };
  } catch { return { hasSavedGame: false }; }
}

/** A save file's name: "soil-n-silo-juniper-frost-glen-day3.json". */
export function saveFileName(state: GameState): string {
  const name = state.valleyTitle ?? `valley-${state.seed}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `valley-${state.seed}`;
  return `soil-n-silo-${slug}-day${state.sim.day}.json`;
}

/** Downloads the game as a `.json` file. */
export function downloadSaveFile(state: GameState): Result<void, string> {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return err('This browser cannot download files.');
  try {
    const url = URL.createObjectURL(new Blob([serializeSave(state)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = saveFileName(state);
    a.style.display = 'none';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return ok(undefined);
  } catch { return err('The save file could not be made.'); }
}
