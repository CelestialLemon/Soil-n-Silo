import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { loadFromBrowser, SAVE_KEY, savedSlotInfo, saveToBrowser } from '../src/play/storage.ts';
import { freshValley } from './helpers.ts';

/** A browser's storage, held in a map; `full` refuses every write as a full browser does. */
function fakeStorage() {
  const map = new Map<string, string>();
  const store = {
    full: false,
    writes: 0,
    getItem: (k: string) => map.get(k) ?? null,
    setItem(k: string, v: string) {
      store.writes++;
      if (store.full) throw new DOMException('full', 'QuotaExceededError');
      map.set(k, v);
    },
    removeItem: (k: string) => { map.delete(k); },
    map,
  };
  (globalThis as { localStorage?: unknown }).localStorage = store;
  return store;
}

afterEach(() => { delete (globalThis as { localStorage?: unknown }).localStorage; });

test('the browser slot is one envelope, written in one go', () => {
  const ls = fakeStorage(), s = freshValley();
  const r = saveToBrowser(s, new Date(2026, 10, 26, 10, 42));
  assert.ok(r.ok);
  assert.equal(ls.writes, 1);
  assert.deepEqual([...ls.map.keys()], [SAVE_KEY]);
  const slot = JSON.parse(ls.map.get(SAVE_KEY) ?? '') as { savedAt: number; data: string };
  assert.equal(slot.savedAt, new Date(2026, 10, 26, 10, 42).getTime());
  assert.equal(typeof slot.data, 'string');
  const back = loadFromBrowser();
  assert.ok(back.ok);
  assert.equal(back.value.seed, s.seed);
  assert.deepEqual(savedSlotInfo(new Date(2026, 10, 26, 18, 0)), { hasSavedGame: true, savedAtLabel: 'Saved 10:42' });
});

test('a write the full browser refuses leaves the last save whole', () => {
  const ls = fakeStorage(), s = freshValley();
  assert.ok(saveToBrowser(s, new Date(2026, 10, 25, 9, 5)).ok);
  const before = ls.map.get(SAVE_KEY);
  ls.full = true;
  s.sim.day = 7;
  const r = saveToBrowser(s, new Date(2026, 10, 26, 11, 0));
  assert.ok(!r.ok);
  assert.match(r.error, /no room/);
  assert.equal(ls.map.get(SAVE_KEY), before);
  const back = loadFromBrowser();
  assert.ok(back.ok);
  assert.equal(back.value.sim.day, 1);
  assert.deepEqual(savedSlotInfo(new Date(2026, 10, 26, 12, 0)), { hasSavedGame: true, savedAtLabel: 'Saved yesterday' });
});

test('a slot that is not an envelope is refused, never read as a save', () => {
  const ls = fakeStorage();
  ls.map.set(SAVE_KEY, '{"version": 11}');
  const r = loadFromBrowser();
  assert.ok(!r.ok);
  assert.match(r.error, /damaged/);
});
