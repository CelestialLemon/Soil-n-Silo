import { ITEMS, type ItemId, type Quality } from './items.ts';
import { DEPTH, isOpenGrass, WIDTH } from './layout.ts';
import { addItem, canAdd, countItem, takeBest, type GameState, type Machine, type MachineKind } from './state.ts';

// Processing machines and recipes (design doc, "Processing machines and recipes"). Recipes are data: a new one is a new
// entry here. A machine runs one batch at a time on the in-game clock, and the player collects the result. Output quality
// is the average of the inputs' quality, rounded down.

export interface Recipe {
  id: string;
  machine: MachineKind;
  inputs: ItemId[];
  output: ItemId;
  hours: number;
}

export const RECIPES: Recipe[] = [
  { id: 'flour', machine: 'mill', inputs: ['wheat'], output: 'flour', hours: 2 },
  { id: 'bread', machine: 'oven', inputs: ['flour', 'egg'], output: 'bread', hours: 3 },
  { id: 'pie', machine: 'oven', inputs: ['flour', 'egg', 'pumpkin'], output: 'pie', hours: 5 },
];

export const MACHINE_SIZE = { cols: 2, rows: 2 };
export const MACHINE_NAMES: Record<MachineKind, string> = { mill: 'Mill', oven: 'Oven' };

export const recipe = (id: string) => RECIPES.find((r) => r.id === id)!;
export const recipesFor = (kind: MachineKind) => RECIPES.filter((r) => r.machine === kind);

/** How many of each input a recipe needs (a recipe may list an input twice). */
function needs(r: Recipe): Map<ItemId, number> {
  const m = new Map<ItemId, number>();
  for (const i of r.inputs) m.set(i, (m.get(i) ?? 0) + 1);
  return m;
}

export const canStart = (s: GameState, m: Machine, r: Recipe) =>
  !m.batch && r.machine === m.kind && [...needs(r)].every(([item, n]) => countItem(s, item) >= n);

export const isRunning = (m: Machine) => !!m.batch && m.batch.hoursLeft > 0;
export const isReady = (m: Machine) => !!m.batch && m.batch.hoursLeft <= 0;

/** Loads a recipe's inputs (the best quality carried of each) and starts it. False if it can't start. */
export function startRecipe(s: GameState, m: Machine, r: Recipe): boolean {
  if (!canStart(s, m, r)) return false;
  const qualities = r.inputs.map((item) => takeBest(s, item)!);
  const quality = Math.floor(qualities.reduce((a: number, q) => a + q, 0) / qualities.length) as Quality;
  m.batch = { recipe: r.id, quality, hoursLeft: r.hours };
  return true;
}

/** Collects a finished batch into the inventory. False if nothing is ready or there's no room. */
export function collect(s: GameState, m: Machine): boolean {
  if (!m.batch || !isReady(m)) return false;
  const r = recipe(m.batch.recipe);
  if (!canAdd(s, r.output, m.batch.quality)) return false;
  addItem(s, r.output, 1, m.batch.quality);
  m.batch = null;
  return true;
}

/** Runs every machine for `hours` of in-game time. */
export function runMachines(s: GameState, hours: number) {
  for (const m of s.machines) if (m.batch && m.batch.hoursLeft > 0) m.batch.hoursLeft = Math.max(0, m.batch.hoursLeft - hours);
}

export const machineAt = (s: GameState, col: number, row: number) =>
  s.machines.find((m) => col >= m.col && col < m.col + MACHINE_SIZE.cols && row >= m.row && row < m.row + MACHINE_SIZE.rows) ?? null;

/** Whether a machine's 2 x 2 footprint, north-west tile at (col, row), fits on free open grass. */
export function canPlace(s: GameState, col: number, row: number): boolean {
  for (let r = row; r < row + MACHINE_SIZE.rows; r++) for (let c = col; c < col + MACHINE_SIZE.cols; c++) {
    if (c < 0 || r < 0 || c >= WIDTH || r >= DEPTH || !isOpenGrass(c, r) || machineAt(s, c, r)) return false;
  }
  return true;
}

/** Places a machine carried in `slot` with its north-west tile at (col, row). */
export function placeMachine(s: GameState, slot: number, col: number, row: number): Machine | null {
  const st = s.inventory[slot];
  if (!st || ITEMS[st.item].kind !== 'machine' || !canPlace(s, col, row)) return null;
  const m: Machine = { id: s.nextId++, kind: st.item as MachineKind, col, row, batch: null };
  s.machines.push(m);
  st.count -= 1;
  if (st.count === 0) s.inventory[slot] = null;
  return m;
}
