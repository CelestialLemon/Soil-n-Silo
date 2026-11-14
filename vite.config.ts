import { defineConfig } from 'vite';

// The renderer's own dev servers use 5180 (demos) and 5181 (example game), so the game gets 5190.
// Two pages: the game (index.html) and brush3d's demo (brush3d/index.html, served at /brush3d/ and built into dist/brush3d/),
// the renderer's test bench and what its tools (brush3d/tools) draw with. Relative base, so both work from any folder
// (GitHub Pages serves them under /Soil-n-Silo/<branch>/ and /pr-<number>/).
export default defineConfig({
  base: './',
  // Pinned to IPv4 so the renderer's tools (which use 127.0.0.1) always reach the dev server.
  server: { host: '127.0.0.1', port: 5190, strictPort: true },
  build: { rolldownOptions: { input: { game: 'index.html', brush3d: 'brush3d/index.html' } } },
});
