// The play layer: boots a valley from the page's address and wires the game's state (src/game/), the world that draws it
// (src/world/) and the overlay (src/ui/) together through the controller (controller.ts) and the page's input (input.ts).
//
// The address opens the valley (src/world/options.ts): `?seed=`, `?season=`, `?hour=`, `?weather=` (locks the weather),
// `?climate=` (the season's character; left out, the valley's own: climateFor), `?wseed=` (the weather's seed),
// `?quality=`, and `?yaw=orbit|snap` to override the player's camera setting (a free orbit unless they chose snapped
// views). Without `?wseed=`, every run rolls fresh weather: the same map never lives through the same week twice.
// `?campaign=<id>` opens a campaign valley; `?terrain=`, `?difficulty=` and `?sandbox=1` a procedural (or Sandbox) one.
//
// The player's settings (settings.ts: sound, volume, quality, storm flashes) come from the browser; a `?quality=` in the
// address wins over the stored quality for that visit, and is never stored as the player's own (picking a quality in
// Settings is). A `?climate=` is the valley's chosen character (GameState.climateOverride), kept in its save and its
// address. The soundscape (src/audio/) wakes on the first press, touch, pen or key.
import {
  climateFor, type GameState, generateProceduralValley, generateValley, rollWeatherSeed, startCampaignValley, stepWeather,
} from '../game/index.ts';
import { Soundscape } from '../audio/index.ts';
import { createUi, mountLoading } from '../ui/index.ts';
import { createWorld, readUrlOptions, type WorldOptions } from '../world/index.ts';
import { Play } from './controller.ts';
import { bindInput } from './input.ts';
import { loadSettings } from './settings.ts';

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
    const stored = loadSettings();
    const settings = { ...stored, quality: options.quality ?? stored.quality };
    const weatherSeed = options.weatherSeed ?? rollWeatherSeed();
    const state = startingValley(options, weatherSeed);
    // The weather as it stands at the address's hour (a valley's first reading is the morning's), before the sky is drawn.
    state.sim.hour = options.hour;
    stepWeather(state, 0, state.sim.day, options.hour);
    const world = await createWorld(canvas, state, { ...options, quality: settings.quality });
    stops.push(() => world.dispose());
    world.setFlashes(settings.flashes);
    const sound = new Soundscape();
    stops.push(() => sound.dispose());
    sound.setEnabled(settings.sound);
    sound.setVolume(settings.volume);
    // A browser plays nothing before the player touches the page: the first press, touch, pen or key wakes the sound (a
    // touch or a pen only counts as a gesture once lifted, on some browsers: pointerup too).
    const unlock = () => sound.unlock();
    const gestures = ['pointerdown', 'pointerup', 'keydown'] as const;
    for (const type of gestures) window.addEventListener(type, unlock, true);
    stops.push(() => { for (const type of gestures) window.removeEventListener(type, unlock, true); });
    const play = new Play(state, world, sound, stored, options.quality);
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

/**
 * The valley the address asks for: a campaign valley, a custom (procedural) or Sandbox one (any of `?terrain=`,
 * `?difficulty=` or `?sandbox=`, even a custom meadow), or the seed's own meadow; a `?climate=` is its chosen character.
 */
function startingValley(options: WorldOptions, weatherSeed: number): GameState {
  if (options.campaign) {
    const r = startCampaignValley(options.campaign, weatherSeed, options.climate);
    if (r.ok) return r.value;
  }
  if (options.terrain || options.difficulty || options.sandbox) {
    return generateProceduralValley({
      seed: options.seed, season: options.season, weatherSeed,
      ...(options.terrain ? { terrain: options.terrain } : {}), ...(options.difficulty ? { difficulty: options.difficulty } : {}),
      ...(options.climate ? { climate: options.climate } : {}), ...(options.sandbox ? { sandbox: true } : {}),
    });
  }
  return generateValley(options.seed, options.season, {
    weatherSeed, climate: climateFor(options.seed, options.season), ...(options.climate ? { climateOverride: options.climate } : {}),
  });
}
