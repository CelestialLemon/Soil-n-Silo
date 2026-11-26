// The play layer: boots a valley from the page's address and wires the game's state (src/game/), the world that draws it
// (src/world/) and the overlay (src/ui/) together through the controller (controller.ts) and the page's input (input.ts).
//
// The address opens the valley (src/world/options.ts): `?seed=`, `?season=`, `?hour=`, `?weather=` (locks the weather),
// `?climate=` (the season's character; left out, the valley's own: climateFor), `?wseed=` (the weather's seed),
// `?quality=`, and `?yaw=orbit|snap` to override the player's camera setting (a free orbit unless they chose snapped
// views). Without `?wseed=`, every run rolls fresh weather: the same map never lives through the same week twice.
import { climateFor, generateValley, rollWeatherSeed, stepWeather } from '../game/index.ts';
import { createUi, mountLoading } from '../ui/index.ts';
import { createWorld, readUrlOptions } from '../world/index.ts';
import { Play } from './controller.ts';
import { bindInput } from './input.ts';

export { Play } from './controller.ts';

/** A valley being played: the controller, and what stops it all. */
export interface PlaySession {
  play: Play;
  /** Stops the input, takes the overlay down and frees the world (its renderer, its GPU memory). */
  dispose(): void;
}

/** Builds the valley the address asks for and starts playing it. */
export async function startPlay(canvas: HTMLCanvasElement, uiRoot: HTMLElement): Promise<PlaySession> {
  const loading = mountLoading(uiRoot);
  const stops: (() => void)[] = [];
  const dispose = () => { for (const stop of stops.splice(0).reverse()) stop(); };
  try {
    const options = readUrlOptions(window.location.search);
    const weatherSeed = options.weatherSeed ?? rollWeatherSeed();
    const climate = options.climate ?? climateFor(options.seed, options.season);
    const state = generateValley(options.seed, options.season, { weatherSeed, climate });
    // The weather as it stands at the address's hour (a valley's first reading is the morning's), before the sky is drawn.
    state.sim.hour = options.hour;
    stepWeather(state, 0, state.sim.day, options.hour);
    const world = await createWorld(canvas, state, options);
    stops.push(() => world.dispose());
    const play = new Play(state, world);
    // The controller hears the keys first (Esc drops a stroke before the overlay closes a card): bound before the overlay.
    stops.push(bindInput(canvas, play));
    const ui = createUi(uiRoot, play);
    stops.push(() => ui.dispose());
    play.attach(ui);
    loading.done();
    // For the browser playtests on the dev server: the controller (its state and world) from the page's console.
    if (import.meta.env.DEV) {
      const page = window as unknown as { __play?: Play };
      page.__play = play;
      stops.push(() => { if (page.__play === play) delete page.__play; });
    }
    return { play, dispose };
  } catch (e) {
    dispose();
    loading.fail('The valley could not be painted here: this browser may lack WebGL 2.');
    throw e;
  }
}
