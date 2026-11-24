// The game's rules and state, as pure TypeScript: no DOM, no three.js, no renderer, so `npm test` runs them in Node.
// Everything outside src/game/ (the world bridge, the UI, the loop) reaches the rules through this file.
export { err, must, ok, type Result } from './result.ts';
