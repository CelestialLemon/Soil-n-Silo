import assert from 'node:assert/strict';
import { test } from 'node:test';
import { playLayout } from '../tools/bot.ts';
import { LAYOUTS } from '../tools/layouts.ts';
import { DAY_SECONDS } from '../src/game/data.ts';
import { endOf, RAMP_HOURS } from '../src/game/events.ts';
import { flooded } from '../src/game/flood.ts';
import { windExposure } from '../src/game/rules.ts';
import { isGuarded } from '../src/game/sim/layout.ts';
import { turbineShare } from '../src/game/wind.ts';

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

/** The ramp of an event in seconds of play: the gale is at full strength outside twice this. */
const RAMP = RAMP_HOURS * DAY_SECONDS / 24;

// The campaign's weather is placed by hand (2.10), and the bot's layouts answer what is cheap and obvious: a bank in Riverlands, turbines
// sheltered by each other in Windy Ridge, a sapling beside every field in Tired Soil.

test('Riverlands: the flood reaches the bot\'s river, and its bank keeps the water off the farm', () => {
  let wet = 0, held = 0;
  const { completedAt, par } = playLayout('c7', 80, undefined, {}, (s) => {
    if (flooded(s).count > 0) wet++;
    held += s.buildings.filter((b) => b.status === 'weather').length;
  });
  assert.ok(wet >= 4, `the flood covered ground for only ${wet} minutes`);
  assert.equal(held, 0, 'a building was held by the water');
  assert.ok(completedAt !== null && completedAt <= par);
});

test('Windy Ridge: the severe gale furls the bot\'s sheltered turbines but stops none', () => {
  const stopped: string[] = [];
  let turning = 0;
  playLayout('c3', 80, undefined, {}, (s) => {
    const gale = s.scenario.events[0];
    if (s.time < gale.start + RAMP * 2 || s.time > endOf(gale) - RAMP * 2) return;
    for (const b of s.buildings) if (b.type === 'turbine') {
      const exposure = windExposure(s, b.x, b.y).exposure;
      if (turbineShare(s, b.id, exposure) === 0) stopped.push(`${b.x},${b.y} at ${Math.round(s.time)}`); else turning++;
    }
  });
  assert.deepEqual(stopped, []);
  assert.ok(turning >= 8, 'turbines stood in the gale');
});

test('Tired Soil: every field of the bot\'s farm is guarded from the dust storm', () => {
  const unguarded: string[] = [];
  let fields = 0;
  playLayout('c6', 80, undefined, {}, (s) => {
    const storm = s.scenario.events[0];
    if (s.time < storm.start || s.time > endOf(storm)) return;
    for (const b of s.buildings) if (b.type === 'field') { fields++; if (!isGuarded(s, b)) unguarded.push(`${b.x},${b.y}`); }
  });
  assert.deepEqual(unguarded, []);
  assert.ok(fields >= 8, 'fields stood in the storm');
});
