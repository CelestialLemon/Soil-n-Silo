import { defineConfig } from 'vite';

// The renderer's own dev servers use 5180 (demos) and 5181 (example game), so the game gets 5190.
export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 5190, strictPort: true },
});
