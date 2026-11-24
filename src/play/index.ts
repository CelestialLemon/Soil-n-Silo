// The play layer: boots a valley from the page's address and wires the game's state (src/game/), the world that draws it
// (src/world/) and the overlay (src/ui/) together through the controller (controller.ts) and the page's input (input.ts).
//
// The address opens the valley (src/world/options.ts): `?seed=`, `?season=`, `?hour=`, `?weather=`, `?quality=`, and the
// Milestone 1 look choices `?yaw=snap|orbit` and `?wiring=pylons|wireless` (docs/ROADMAP.md).
import { apply, generateValley } from '../game/index.ts';
import { createUi, mountLoading } from '../ui/index.ts';
import { createWorld, readUrlOptions } from '../world/index.ts';
import { Play } from './controller.ts';
import { bindInput } from './input.ts';

export { Play } from './controller.ts';

/** Builds the valley the address asks for and starts playing it. */
export async function startPlay(canvas: HTMLCanvasElement, uiRoot: HTMLElement): Promise<Play> {
  const loading = mountLoading(uiRoot);
  try {
    const options = readUrlOptions(window.location.search);
    const state = generateValley(options.seed, options.season);
    if (state.powerMode !== options.wiring) apply(state, { type: 'setPowerMode', mode: options.wiring });
    const world = await createWorld(canvas, state, options);
    const play = new Play(state, world);
    // The controller hears the keys first (Esc drops a stroke before the overlay closes a card): bound before the overlay.
    bindInput(canvas, play);
    play.attach(createUi(uiRoot, play));
    loading.done();
    // For the browser playtests on the dev server: the controller (its state and world) from the page's console.
    if (import.meta.env.DEV) (window as unknown as { __play?: Play }).__play = play;
    return play;
  } catch (e) {
    loading.fail('The valley could not be painted here: this browser may lack WebGL 2.');
    throw e;
  }
}
