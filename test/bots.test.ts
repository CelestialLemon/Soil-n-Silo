import assert from 'node:assert/strict';
import { test } from 'node:test';
import { playLayout } from '../tools/bot.ts';
import { LAYOUTS } from '../tools/layouts.ts';

// Every bot layout (tools/layouts.ts) plays its commission on the real rules and must clear it within the target time:
// a change to the rules that jams a chain, or makes a commission much slower, shows up here.

for (const id of Object.keys(LAYOUTS)) {
  test(`the bot clears ${id} within its target time`, () => {
    const { completedAt, par } = playLayout(id, 60);
    assert.ok(completedAt !== null, `${id}: not complete after 60 minutes (npm run sim -- ${id} shows why)`);
    assert.ok(completedAt <= par, `${id}: complete at ${Math.round(completedAt)} s, after the target ${par} s`);
  });
}
