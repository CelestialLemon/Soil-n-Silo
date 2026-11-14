// The renderer's own checks that need no browser (brush3d/tools: the living wind, the water map, the view the game places),
// run as part of `npm test` so they go beside the game's tests rather than after them (the wind's takes over a minute on one
// core). Each is a script of its own that prints its checks and exits with 1 if one is off; here it runs as is, its output
// shown on failure.
// The cloud recipe's check draws in a browser: `npm run render:test:clouds`, with the dev server up (CI runs it).
import { test } from 'node:test';
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const tools = join(import.meta.dirname, '../brush3d/tools');

for (const name of ['wind', 'water', 'view']) {
  test(`brush3d: the ${name} checks (brush3d/tools/${name}.ts)`, async () => {
    try {
      await run(process.execPath, [join(tools, `${name}.ts`)], { maxBuffer: 16 << 20 });
    } catch (e) {
      const { stdout = '', stderr = '' } = e as { stdout?: string; stderr?: string };
      throw new Error(`brush3d/tools/${name}.ts failed:\n${stdout}${stderr}`, { cause: e });
    }
  });
}
