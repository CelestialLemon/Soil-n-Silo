// The game's entry: finds the page's canvas and overlay root and starts the valley (src/play/).
import { must } from './game/index.ts';
import { startPlay } from './play/index.ts';
import { worldCanvas } from './world/index.ts';

const canvas = must(worldCanvas(document), 'the #view canvas');
const root = must(document.querySelector<HTMLElement>('#ui'), 'the #ui root');
startPlay(canvas, root).catch((e: unknown) => console.error(e));
