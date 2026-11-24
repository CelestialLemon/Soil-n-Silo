// Checks that the demo uses the renderer only through its API (src/index.ts, docs/API.md): every import in src/demo is
// the index, another demo file, or three; that the game does too (its picture and its screens, the repo's src/world and
// src/ui, through src/index.ts; its rules, src/game, through src/shared.ts alone, which loads in Node); and that
// src/shared.ts loads in Node. Run by `npm run typecheck`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..'), demo = join(root, 'src/demo'), index = join(root, 'src/index');
const tsFiles = (dir: string) => readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts')).map((f) => join(dir, f));
/** What a file imports from: each import's and export's module. */
const importsOf = (file: string) => [...readFileSync(file, 'utf8').matchAll(/(?:^|\n)\s*(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const files = tsFiles(demo);
const bad: string[] = [];
for (const file of files) {
  for (const from of importsOf(file)) {
    if (from === 'three' || from.startsWith('three/')) continue;
    const to = resolve(dirname(file), from).replace(/\.ts$/, '');
    if (to === index || to.startsWith(demo + '/')) continue;
    bad.push(`${relative(root, file)}: imports '${from}'`);
  }
}
if (bad.length) {
  console.error(`The demo may use the renderer only through src/index.ts (docs/API.md):\n${bad.join('\n')}`);
  process.exit(1);
}
console.log(`ok   the demo's ${files.length} files import only the API`);

// The game (the repo round brush3d): its picture and screens reach brush3d only through src/index.ts, its rules only
// through src/shared.ts (so they load in Node). Its imports of anything else are its own business.
const game = resolve(root, '..'), sharedFile = join(root, 'src/shared');
const sides: [string, string, string][] = [['src/world', index, 'src/index.ts'], ['src/ui', index, 'src/index.ts'], ['src/game', sharedFile, 'src/shared.ts']];
let gameFiles = 0;
for (const [dir, allowed, name] of sides) {
  const at = join(game, dir);
  if (!existsSync(at)) continue;
  const wrong: string[] = [];
  for (const file of tsFiles(at)) {
    gameFiles++;
    for (const from of importsOf(file)) {
      if (!from.startsWith('.')) continue;
      const to = resolve(dirname(file), from).replace(/\.ts$/, '');
      if (to.startsWith(root + '/') && to !== allowed) wrong.push(`${relative(game, file)}: imports '${from}'`);
    }
  }
  if (wrong.length) {
    console.error(`The game's ${dir} may use brush3d only through brush3d/${name} (brush3d/docs/API.md):\n${wrong.join('\n')}`);
    process.exit(1);
  }
}
console.log(`ok   the game's ${gameFiles} files reach brush3d only through its API`);

// And the shared code loads in Node on its own, as the game's rules and tests will load it.
const shared = await import('../src/shared.ts').catch((e: Error) => {
  console.error(`src/shared.ts must load in Node with no bundler (docs/API.md):\n${e.message}`);
  process.exit(1);
});
console.log(`ok   src/shared.ts loads in Node (${Object.keys(shared).length} exports)`);
