import assert from 'node:assert/strict';
import { test } from 'node:test';
import { playLayout } from '../tools/bot.ts';
import { LAYOUTS } from '../tools/layouts.ts';

// Every bot layout (tools/layouts.ts) plays its commission on the real rules and must clear it within the target time:
// a change to the rules that jams a chain, or makes a commission much slower, shows up here.

// Long Nights (winter, honey cake) can't be cleared now that bees stay in below 10°C and hens lay at half speed in winter:
// it waits for the greenhouse (#86), which brings bees and a warm spell indoors.
const WAITING_FOR_GREENHOUSE = new Set(['c5']);

for (const id of Object.keys(LAYOUTS)) {
  test(`the bot clears ${id} within its target time`, { skip: WAITING_FOR_GREENHOUSE.has(id) && 'needs the greenhouse (#86)' }, () => {
    const { completedAt, par } = playLayout(id, 80);
    assert.ok(completedAt !== null, `${id}: not complete after 80 minutes (npm run sim -- ${id} shows why)`);
    assert.ok(completedAt <= par, `${id}: complete at ${Math.round(completedAt)} s, after the target ${par} s`);
  });
}
