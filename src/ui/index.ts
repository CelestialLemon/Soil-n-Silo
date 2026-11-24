// The HTML over the canvas: the tool strip, the valley brief, the sky strip and the building ring (docs/DESIGN.md). For now,
// a quiet card saying what this build is.

/** Shows the app shell's card in `root`. */
export function mountShell(root: HTMLElement): void {
  const card = document.createElement('section');
  card.className = 'shell-card';
  const title = document.createElement('h1');
  title.textContent = 'Soil n Silo';
  const line = document.createElement('p');
  line.textContent = 'A cozy solarpunk homestead, being rebuilt. The valley arrives in Milestone 1.';
  const demo = document.createElement('a');
  demo.href = './brush3d/';
  demo.textContent = 'See the renderer’s demo';
  card.append(title, line, demo);
  root.replaceChildren(card);
}
