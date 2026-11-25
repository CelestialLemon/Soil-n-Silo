// What the simulation tells the player as it runs: warm, non-blocking toasts (a milestone drop, a seal filled, a
// blackout, the valley restored). `stepSim` returns the events of each step.

export type SimEventType = 'drop' | 'seal' | 'blackout' | 'steadyReset' | 'restored' | 'ripe';

export interface SimEvent {
  type: SimEventType;
  /** One plain, warm line for the toast. */
  message: string;
  /** What it's about, if one thing: a field's, network's or building's id. */
  id?: number;
}
