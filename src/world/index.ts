// The world bridge: turns the game's state (src/game/) into what brush3d draws, through brush3d/src/index.ts only
// (brush3d/docs/API.md). Empty until Milestone 1 (docs/ROADMAP.md) brings the valley in.

/** Where the world draws: the page's canvas. */
export function worldCanvas(root: Document): HTMLCanvasElement | null {
  return root.querySelector<HTMLCanvasElement>('#view');
}
