// Supplies: the one capped pool every building and piece of tech draws from (docs/DESIGN.md, "One Shared Capped Pool").
// Time never prints more: the valley gives a starter parcel and a milestone drop or two, up to a hard cap. Everything is
// 100% refundable: removing a building (or retiring a cart) gives its whole cost back at once. Land-craft is always free.
// Sandbox's pool is `unlimited`: it never runs short, and only keeps count of what's in use.
import { CATALOG, type ThingKind } from './catalog.ts';
import { err, ok, type Result } from './result.ts';

/** What an extra Electric Cart costs (the Garage comes with one). */
export const CART_COST = 1;
/** The most carts a homestead runs. */
export const MAX_CARTS = 4;

/** The Spring Valley's tuning: a starter parcel of 12, two drops of 4, a hard cap of 20. */
export const STARTER_SUPPLIES = 12;
export const SUPPLY_CAP = 20;
export const DROP_AMOUNT = 4;

export type DropId = 'firstHarvest' | 'firstCraft';

/** A gift of Supplies from the settlement when the homestead reaches a milestone. */
export interface MilestoneDrop {
  id: DropId;
  amount: number;
  /** What earns it, in plain words. */
  label: string;
  received: boolean;
}

export interface SuppliesState {
  /** What's free to spend now: `unlocked - spent`. */
  available: number;
  /** What's tied up in placed buildings and extra carts (all of it refundable). */
  spent: number;
  /** What the valley has given so far: the starter parcel and the drops received. Never above `cap`. */
  unlocked: number;
  /** The valley's hard ceiling. */
  cap: number;
  drops: MilestoneDrop[];
  /**
   * Sandbox: Supplies without limit. Every cost is affordable and `spent` still counts what's in use, while `available`,
   * `unlocked` and `cap` stay put at SANDBOX_SUPPLIES (finite, so a save holds them as plain numbers).
   */
  unlimited: boolean;
}

/** What a Sandbox pool shows as free, unlocked and its cap (it never runs out: `unlimited`). */
export const SANDBOX_SUPPLIES = 999;

/**
 * A valley's pool: the starter parcel now, and two milestone drops to come, together making the valley's hard `cap` (left
 * out, the Spring Valley's 12 now and two drops of 4 up to 20). What the parcel leaves goes to the drops: the first harvest
 * gets the larger half of an odd remainder.
 */
export function starterSupplies(cap = SUPPLY_CAP, starter = cap === SUPPLY_CAP ? STARTER_SUPPLIES : Math.round(cap * 0.6)): SuppliesState {
  const top = Math.max(0, Math.floor(cap)), now = Math.max(0, Math.min(top, Math.floor(starter))), rest = top - now;
  const harvest = Math.ceil(rest / 2), craft = rest - harvest;
  return {
    available: now, spent: 0, unlocked: now, cap: top, unlimited: false,
    drops: [
      { id: 'firstHarvest', amount: harvest, label: 'First harvest stored in the Silo or a workshop', received: false },
      { id: 'firstCraft', amount: craft, label: 'First crafted good (Flour, Bread, Oil, Sauce, Yarn or Linen) delivered to the Depot', received: false },
    ],
  };
}

/** A sandbox pool: Supplies without limit (Sandbox mode, and the rules' tests on hand-made lands). */
export function sandboxSupplies(): SuppliesState {
  return { available: SANDBOX_SUPPLIES, spent: 0, unlocked: SANDBOX_SUPPLIES, cap: SANDBOX_SUPPLIES, drops: [], unlimited: true };
}

export const costOf = (kind: ThingKind): number => CATALOG[kind].cost;

/** Whether the pool can pay `cost` now; says how short it is if not. */
export function canAfford(sup: SuppliesState, cost: number, what: string): Result<void, string> {
  if (sup.unlimited || cost <= sup.available) return ok(undefined);
  const s = (n: number) => (n === 1 ? 'Supply' : 'Supplies');
  return err(`${what} needs ${cost} ${s(cost)}; you have ${sup.available} free. Remove something to free some up (it's all refundable).`);
}

/** Pays `cost` from the pool (the caller checked `canAfford`). */
export function spend(sup: SuppliesState, cost: number): void {
  if (cost <= 0) return;
  if (sup.unlimited) { sup.spent += cost; return; }
  if (cost > sup.available) throw new Error(`Spent ${cost} Supplies with only ${sup.available} free`);
  sup.spent += cost;
  sup.available = sup.unlocked - sup.spent;
}

/** Gives `cost` back to the pool in full. */
export function refund(sup: SuppliesState, cost: number): void {
  if (cost <= 0) return;
  sup.spent = Math.max(0, sup.spent - cost);
  if (!sup.unlimited) sup.available = sup.unlocked - sup.spent;
}

/** Receives a milestone drop (once), up to the cap; returns it if it arrived now. An unlimited pool's stays as it is. */
export function receiveDrop(sup: SuppliesState, id: DropId): MilestoneDrop | undefined {
  const d = sup.drops.find((v) => v.id === id);
  if (!d || d.received) return undefined;
  d.received = true;
  if (sup.unlimited) return d;
  sup.unlocked = Math.min(sup.cap, sup.unlocked + d.amount);
  sup.available = sup.unlocked - sup.spent;
  return d;
}
