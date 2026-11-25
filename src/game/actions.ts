// Every edit the player makes, as data, through one door: `apply` checks it against the rules, changes the state if it's
// allowed, and says what changed (or, unchanged, why not).
import { runtimeOf } from './workshops.ts';
import { addGood, countOf, takeGood } from './goods.ts';
import { buyCart, retireCart } from './carts.ts';
import type { ThingKind } from './catalog.ts';
import { emptyChange, type Change } from './change.ts';
import { digChannel, fillChannel } from './channels.ts';
import { eraseField, type FieldEdit, paintField } from './fields.ts';
import type { Point2 } from './geom.ts';
import { moveThing, placeThing, removeThing, rotateThing } from './place.ts';
import { addHedge, addTrack, plantTree, removeHedge, removeTrack, removeTree } from './paths.ts';
import { err, ok, type Result } from './result.ts';
import { settle } from './settle.ts';
import type { Crop, GameState, TreeSpecies } from './state.ts';

export type Action =
  | { type: 'place'; kind: ThingKind; x: number; z: number; yaw: number }
  | { type: 'move'; id: number; x: number; z: number; yaw?: number }
  | { type: 'rotate'; id: number; yaw: number }
  | { type: 'remove'; id: number }
  | { type: 'paintField'; crop: Crop; points: Point2[]; radius: number }
  | { type: 'eraseField'; points: Point2[]; radius: number }
  | { type: 'digChannel'; points: Point2[] }
  | { type: 'fillChannel'; id: number }
  | { type: 'addTrack'; points: Point2[] }
  | { type: 'removeTrack'; id: number }
  | { type: 'addHedge'; points: Point2[] }
  | { type: 'removeHedge'; id: number }
  | { type: 'plantTree'; x: number; z: number; species?: TreeSpecies }
  | { type: 'removeTree'; id: number }
  | { type: 'setRecipe'; id: number; recipe: 'bread' | 'honey_cake' }
  | { type: 'setByproductPriority'; id: number; target: 'auto' | 'coop' | 'composter' | 'silo' }
  | { type: 'buyCart' }
  | { type: 'retireCart'; id: number };

const fieldChange = (s: GameState, r: Result<FieldEdit, string>): Result<Change, string> =>
  r.ok ? ok(settle(s, { fields: r.value })) : r;

/** Applies an action: the change it made, or why it isn't allowed (and then the state is as it was). */
export function apply(s: GameState, a: Action): Result<Change, string> {
  switch (a.type) {
    case 'place': return placeThing(s, a.kind, a.x, a.z, a.yaw);
    case 'move': return moveThing(s, a.id, a.x, a.z, a.yaw);
    case 'rotate': return rotateThing(s, a.id, a.yaw);
    case 'remove': return removeThing(s, a.id);
    case 'paintField': return fieldChange(s, paintField(s, a.crop, a.points, a.radius));
    case 'eraseField': return fieldChange(s, eraseField(s, a.points, a.radius));
    case 'digChannel': return digChannel(s, a.points);
    case 'fillChannel': return fillChannel(s, a.id);
    case 'addTrack': return addTrack(s, a.points);
    case 'removeTrack': return removeTrack(s, a.id);
    case 'addHedge': return addHedge(s, a.points);
    case 'removeHedge': return removeHedge(s, a.id);
    case 'plantTree': return plantTree(s, a.x, a.z, a.species);
    case 'removeTree': return removeTree(s, a.id);
    case 'setRecipe': {
      const r = runtimeOf(s, a.id);
      if (r?.kind !== 'bakery') return err('Choose a Bakery to change its recipe');
      r.recipe = a.recipe;
      if (a.recipe === 'bread') addGood(r.outputs, 'honey', takeGood(r.inputs, 'honey', countOf(r.inputs, 'honey')));
      return ok(emptyChange(s.revision));
    }
    case 'setByproductPriority': {
      const r = runtimeOf(s, a.id);
      if (!r || (r.kind !== 'mill' && r.kind !== 'coop')) return err('Choose a Mill or Coop');
      if ((a.target === 'silo' && r.kind !== 'coop') || (a.target === 'coop' && r.kind !== 'mill')) return err('Choose a destination for this byproduct');
      r.priority = a.target;
      return ok(emptyChange(s.revision));
    }
    case 'buyCart': return buyCart(s);
    case 'retireCart': return retireCart(s, a.id);
  }
}
