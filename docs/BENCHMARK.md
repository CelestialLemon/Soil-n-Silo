# Frame-cost benchmark

`npm run bench` loads bot-built saves (`tools/bot.ts`) into the built game in headless Chromium and records what a frame
costs. It is the regression check for the performance epic (#176): a change that makes frames dearer shows here. Its code is
`tools/bench.ts` (the runner) and `tools/bench/probe.js` (what runs in the page); the probe only observes, and the game and the
renderer are not changed for it.

## What it measures

Each fixture is a save, a view and a script, run at 1920 × 1080, `pixelSize 2` (960 × 540 art), supersampling 3×3.

| Fixture | Save | Script |
|---|---|---|
| `c1-fresh` | c1, nothing built | still |
| `c1-farm` | c1, the bot's layout after 15 minutes | still |
| `c4-farm` | c4, the bot's layout after 20 minutes | still |
| `c7-river` | c7, 20 minutes, looking at the river | still |
| `c1-farm-pointer` | as `c1-farm` | a repeatable pointer path over the window |
| `c1-farm-camera` | as `c1-farm` | pan, zoom, turn, pan, zoom, turn, pan |

**Structural metrics** do not depend on the machine: per frame, the real draws (`draws`), the calls three.js makes into
`renderBufferDirect` (`visits`), `emptyVisits` (visits that drew nothing: the empty sibling meshes of #176), `triangles`,
the `passes` (three `render` calls) and the `shadowRedraws`. **Timings** depend on it: the frame interval (median, p90, p95, p99,
and `fps` from the median), the JS ms of `renderGeometry`, `renderStyle` and the rest of the frame, the time `pick` takes, and
the GPU ms of the geometry and style halves where the browser has `EXT_disjoint_timer_query_webgl2` (asynchronous queries,
discarded when the GPU reports a disjoint). They are not a split by pass: a timer query around a draw-heavy pass counts the GPU
waiting for the CPU, so named per-pass timing waits for the renderer (#176, tier 3).

## Running it

```sh
npm run bench                         # all fixtures, 5 s warm-up then 30 s, 3 repeats; ~12 minutes; the real GPU
npm run bench -- --fixture c1-farm --repeats 1 --seconds 10
npm run bench -- --structural --no-gpu    # the CI check: ~1 minute, software GL, still fixtures only
npm run bench -- --write-baseline tools/bench/baselines/<name>.json
```

Needs Chromium: `npx playwright-core install chromium` (or `--chromium <binary>`, `BENCH_CHROMIUM`). The real GPU runs through
ANGLE/Vulkan (`--use-angle=vulkan` and friends, `VK_ICD_FILENAMES` defaulting to the Mesa radeon file; override it for another
driver) and **uncapped** (`--disable-frame-rate-limit --disable-gpu-vsync`), so the fps is throughput, not what a 60 Hz display
shows (`--vsync` keeps the cap). It takes `/tmp/gpu-bench.lock` with `flock` and runs under it, so two benchmarks never share a
GPU (`--no-lock` skips that). Reports go to `out/bench/` as JSON. Run it with nothing else using the machine, the browser closed,
and write down the power mode; the timings differ between a plugged-in laptop and one on battery.

## Gates

- **Structural, in CI** (`bench` job): the still fixtures on software GL in a 640 × 360 window (the counts do not depend on it)
  against `tools/bench/baselines/structural.json`. A median that grows more than 5% fails the job: investigate. When the growth is
  intended, or a renderer release shrinks the counts, rewrite the baseline with `--structural --no-gpu --write-baseline` in the same PR.
  Once the pin has the empty-mesh fix, `emptyVisits` in the baseline is 0 and any growth fails.
- **Timings, locally**: against `tools/bench/baselines/<GL renderer>.json` for the GPU you run on, if there is one (or `--baseline`).
  A median more than 10% slower is listed, never failed. Absolute fps is not gated, and not on shared CI, where software GL cannot rank GPU or driver costs.

## Baseline for the current pin

`pixel3d-renderer` v0.5.0, game `dev` at `7b8fea7`, AMD RX 570 (RADV) on Ryzen 5 1600, headless Chromium 156, 1920 × 1080,
`pixelSize 2`, SS3, uncapped, plugged in. Median over 3 repeats of 30 s after a 5 s warm-up. The file is
`tools/bench/baselines/angle-amd-vulkan-1-4-328-amd-radeon-rx-570-series-radv-polar.json`; later PRs quote their difference from it.

| Fixture | fps | frame ms | p95 ms | JS geometry ms | GPU geometry ms | draws | visits | empty visits | triangles |
|---|---|---|---|---|---|---|---|---|---|
| c1-fresh | 63.291 | 15.8 | 32.3 | 15.1 | 12.843 | 254 | 1232 | 978 | 874048 |
| c1-farm | 66.667 | 15 | 26.7 | 14 | 12.643 | 466 | 1988 | 1527 | 879030 |
| c4-farm | 61.35 | 16.3 | 32.1 | 15.5 | 13.291 | 489 | 2198 | 1709 | 1289508 |
| c7-river | 64.516 | 15.5 | 34.4 | 14.7 | 13.443 | 632 | 2709 | 2078 | 1308724 |
| c1-farm-pointer | 34.014 | 29.4 | 47.4 | 10.4 | 12.279 | 466 | 1988 | 1527 | 879054 |
| c1-farm-camera | 90.909 | 11 | 61 | 9.1 | 12.408 | 466 | 1988 | 1527 | 879174 |

The pointer fixture runs at about half the fps of the still one: the blocking `pick` (#187). The camera fixture's median fps is higher than the still ones' and not yet explained (its p95 is the worst, 61 ms): read its tail, not its median.

The `emptyVisits` column is the empty-mesh waste: three.js resolves programs and bindings for about three
quarters of its `renderBufferDirect` calls and draws nothing.

Laptop numbers (Windows Core Ultra 7 265H, MacBook Air M4) come from the owner running this on those machines (#189).
