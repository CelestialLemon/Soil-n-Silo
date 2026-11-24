// The game's entry: finds the page's canvas and UI root and mounts the app shell. The loop, the world and the input join it
// in Milestone 1 (docs/ROADMAP.md).
import { must } from './game/index.ts';
import { mountShell } from './ui/index.ts';
import { worldCanvas } from './world/index.ts';

must(worldCanvas(document), 'the #view canvas');
mountShell(must(document.querySelector<HTMLElement>('#ui'), 'the #ui root'));
