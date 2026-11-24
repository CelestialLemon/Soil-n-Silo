// The game's entry: finds the page's canvas and overlay root and starts the valley (src/play/).
import { must } from './game/index.ts';
import { startPlay } from './play/index.ts';
import { worldCanvas } from './world/index.ts';

const canvas = must(worldCanvas(document), 'the #view canvas');
const root = must(document.querySelector<HTMLElement>('#ui'), 'the #ui root');
const session = startPlay(canvas, root);
session.catch((e: unknown) => console.error(e));

/**
 * Takes the valley down: its input, overlay and world (and the GPU memory it holds), and stops listening for the page
 * going, so an old module swapped out by Vite keeps no hold on its session.
 */
const teardown = () => {
  window.removeEventListener('pagehide', onPageHide);
  session.then((s) => s.dispose(), () => undefined).catch((e: unknown) => console.error(e));
};
// Leaving for good (not into the back/forward cache, which keeps the page to show again), or Vite swapping this module.
const onPageHide = (e: PageTransitionEvent) => { if (!e.persisted) teardown(); };
window.addEventListener('pagehide', onPageHide);
import.meta.hot?.dispose(teardown);
