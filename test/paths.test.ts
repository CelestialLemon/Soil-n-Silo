import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, COVER, type GameState, heightAt, MAX_SPAN, must, SAPLING_SCALE } from '../src/game/index.ts';
import { flatLand, land, same, valley } from './helpers.ts';

const at = (s: GameState, x: number, z: number) => Math.floor(z - s.grid.z0) * s.grid.nx + Math.floor(x - s.grid.x0);
const no = (r: { ok: boolean; error?: string }, re: RegExp) => { assert.ok(!r.ok); assert.match(r.error ?? '', re); };

test('a track across the brook gets a plank bridge, above the water, bank to bank', () => {
  const s = flatLand(), cover = Uint8Array.from(s.grid.cover);
  const r = apply(s, { type: 'addTrack', points: [{ x: -20, z: -15 }, { x: -20, z: 0 }, { x: -20, z: 15 }] });
  assert.ok(r.ok, r.ok ? '' : r.error);
  assert.ok(r.value.bridges && r.value.cover && r.value.tracks.length === 1);
  assert.equal(s.bridges.length, 1);
  const b = s.bridges[0];
  assert.equal(b.trackId, s.tracks[0].id);
  assert.ok(Math.abs(b.x + 20) < 0.1 && Math.abs(b.z) < 0.5, 'centred on the brook');
  assert.ok(Math.abs(b.yaw) < 0.05, 'along the track (north–south)');
  assert.ok(b.length >= 4 && b.length <= MAX_SPAN, `${b.length} m`);
  assert.ok(b.deckY >= -0.2 + 0.25, 'the deck clears the water');
  // The track's cells are track; the water stays water.
  assert.equal(s.grid.cover[at(s, -20, -10)], COVER.track);
  assert.equal(s.grid.cover[at(s, -20, 10)], COVER.track);
  assert.equal(s.grid.cover[at(s, -20, 0)], COVER.water);
  const gone = apply(s, { type: 'removeTrack', id: s.tracks[0].id });
  assert.ok(gone.ok && gone.value.bridges);
  assert.equal(s.bridges.length, 0);
  assert.ok(same(s.grid.cover, cover), 'the grass comes back');
});

test('a dry rill is still a ditch: a track bridges it, and a rill dug under a track gets one too', () => {
  const s = flatLand();
  // On flat ground far from the brook the rill stays dry.
  assert.ok(apply(s, { type: 'digChannel', points: [{ x: -40, z: -30 }, { x: -40, z: -10 }] }).ok);
  assert.ok(s.channels[0].flow.every((p) => !p.wet));
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -50, z: -20 }, { x: -30, z: -20 }] }).ok);
  assert.equal(s.bridges.length, 1);
  const b = s.bridges[0];
  assert.ok(Math.abs(b.x + 40) < 0.3 && b.length <= MAX_SPAN && Math.abs(Math.abs(b.yaw) - Math.PI / 2) < 0.05);
  for (let k = -b.length / 2; k <= b.length / 2; k += 0.25) {
    assert.ok(b.deckY >= heightAt(s.grid, b.x + k * Math.sin(b.yaw), b.z + k * Math.cos(b.yaw)) + 0.1 - 1e-6, 'clear of the ground its whole length');
  }
  // A rill dug across a track that's already there.
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: 10, z: -40 }, { x: 30, z: -40 }] }).ok);
  const dug = apply(s, { type: 'digChannel', points: [{ x: 20, z: -50 }, { x: 20, z: -30 }] });
  assert.ok(dug.ok && dug.value.bridges);
  assert.equal(s.bridges.length, 2);
  assert.ok(apply(s, { type: 'fillChannel', id: must(dug.value.created, 'the rill') }).ok);
  assert.equal(s.bridges.length, 1, 'filling the rill takes its bridge');
});

test('tracks refuse what no plank bridge can cross, and slopes too steep to climb', () => {
  const s = flatLand();
  no(apply(s, { type: 'addTrack', points: [{ x: 30, z: 15 }, { x: 30, z: 45 }] }), /too wide/);
  no(apply(s, { type: 'addTrack', points: [{ x: -10, z: -10 }, { x: -10, z: 0 }] }), /dry ground on both sides/);
  no(apply(s, { type: 'addTrack', points: [{ x: 0, z: -20 }, { x: 0.5, z: -20 }] }), /further/);
  no(apply(s, { type: 'addTrack', points: [{ x: 50, z: -20 }, { x: 70, z: -20 }] }), /valley/);
  assert.ok(apply(s, { type: 'place', kind: 'mill', x: 0, z: -30, yaw: 0 }).ok);
  no(apply(s, { type: 'addTrack', points: [{ x: -10, z: -30 }, { x: 10, z: -30 }] }), /Mill/);
  const steep = land({ height: (x) => 0.5 * x });
  no(apply(steep, { type: 'addTrack', points: [{ x: -10, z: 0 }, { x: 10, z: 0 }] }), /steep/);
  assert.ok(apply(steep, { type: 'addTrack', points: [{ x: 0, z: -10 }, { x: 0, z: 10 }] }).ok, 'along the contour it goes');
  assert.equal(s.tracks.length, 0);
});

test('hedgerows grow along a stroke on dry ground', () => {
  const s = flatLand();
  const r = apply(s, { type: 'addHedge', points: [{ x: -30, z: 20 }, { x: -20, z: 25 }, { x: -10, z: 20 }] });
  assert.ok(r.ok);
  assert.equal(s.hedges.length, 1);
  assert.ok(s.hedges[0].path.length > 20);
  assert.deepEqual(r.value.hedges, [s.hedges[0].id]);
  no(apply(s, { type: 'addHedge', points: [{ x: 10, z: -5 }, { x: 10, z: 5 }] }), /water/);
  assert.ok(apply(s, { type: 'addTrack', points: [{ x: -40, z: 30 }, { x: -40, z: 40 }] }).ok);
  no(apply(s, { type: 'addHedge', points: [{ x: -45, z: 35 }, { x: -35, z: 35 }] }), /track/);
  assert.ok(apply(s, { type: 'removeHedge', id: s.hedges[0].id }).ok);
  assert.equal(s.hedges.length, 0);
  assert.ok(!apply(s, { type: 'removeHedge', id: 999 }).ok);
});

test('trees are planted as saplings where there is room; wild trees stay', () => {
  const s = flatLand();
  const r = apply(s, { type: 'plantTree', x: -20, z: 20, species: 'apple' });
  assert.ok(r.ok);
  const t = s.plantedTrees[0];
  assert.equal(t.species, 'apple');
  assert.equal(t.scale, SAPLING_SCALE);
  assert.ok(t.planted);
  assert.equal(r.value.created, t.id);
  assert.ok(apply(s, { type: 'plantTree', x: -10, z: 20 }).ok);
  assert.equal(s.plantedTrees[1].species, 'oak', 'an oak unless chosen');
  no(apply(s, { type: 'plantTree', x: -19.5, z: 20 }), /close/);
  no(apply(s, { type: 'plantTree', x: 0, z: 0 }), /water/);
  no(apply(s, { type: 'plantTree', x: 70, z: 0 }), /outside/);
  assert.ok(apply(s, { type: 'removeTree', id: t.id }).ok);
  assert.equal(s.plantedTrees.length, 1);
  const v = valley(), wild = v.wildTrees[0];
  no(apply(v, { type: 'removeTree', id: wild.id }), /Wild/);
  assert.equal(v.wildTrees[0], wild);
});
