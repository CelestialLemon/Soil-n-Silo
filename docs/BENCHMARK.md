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
| `c1-farm-rest` | as `c1-farm` | the pointer resting over the middle of the map |
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
  against `tools/bench/baselines/structural.json`. A median that grows more than 5% turns the job red: investigate. It is information only (`continue-on-error`), so it never blocks a PR. When the growth is
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
| c1-farm-camera | 80 | 12.5 | 52.1 | 9.3 | 12.393 | 466 | 1988 | 1527 | 879126 |

The pointer fixture runs at about half the fps of the still one: the blocking `pick` (#187). The camera fixture varies between repeats (61–83 fps: the keys and wheel arrive with the browser's own timing) and its p95 is the worst; read its tail, and compare it with a wider margin than the still ones.

The `emptyVisits` column is the empty-mesh waste: three.js resolves programs and bindings for about three
quarters of its `renderBufferDirect` calls and draws nothing.

## After v0.5.1 (empty-mesh filter #57, resolve rewrite #58)

Same machine and method as above (game `dev` at `7db7d01`, median of 3 repeats). The timing baseline file above is still the v0.5.0 one, so later PRs quote their difference from it. The structural baseline was rewritten: `emptyVisits` is now 0.

| Fixture | fps | frame ms | p95 ms | JS geometry ms | GPU geometry ms | visits | empty visits |
|---|---|---|---|---|---|---|---|
| c1-fresh | 99.01 | 10.1 | 19.3 | 9.2 | 7.715 | 254 | 0 |
| c1-farm | 105.263 | 9.5 | 17.1 | 7.5 | 7.514 | 466 | 0 |
| c4-farm | 92.593 | 10.8 | 16.6 | 8.4 | 8.185 | 489 | 0 |
| c7-river | 92.593 | 10.8 | 28.4 | 9.4 | 8.206 | 632 | 0 |
| c1-farm-pointer | 63.291 | 15.8 | 34.5 | 4.3 | 7.134 | 466 | 0 |
| c1-farm-camera | 135.135 | 7.4 | 38.9 | 3.0 | 7.318 | 466 | 0 |

Laptop numbers (Windows Core Ultra 7 265H, MacBook Air M4) come from the owner running this on those machines (#189).

## After v0.5.2 and re-picking only on change (#187)

The game now asks what is under the pointer only when something changed (the pointer, the camera, the tool, an object shown or
taken away, a truck driving under it), through the renderer's non-blocking `requestPick`. Same machine, game `dev` at `40e1716`
before and this change after, median of 3 repeats, **with `--vsync`** (60 Hz, as a player sees it):

| Fixture | frame p90 ms | p95 ms | p99 ms | picks per frame | pick ms per frame | JS rest ms |
|---|---|---|---|---|---|---|
| c1-farm (no pointer) | 16.7 → 16.7 | 16.7 → 16.8 | 16.8 → 16.8 | 0 → 0 | 0 → 0 | 0.5 → 0.6 |
| c1-farm-rest | 16.7 → 16.7 | 16.7 → 16.8 | 16.8 → 16.8 | 0.167 → 0.016 | 0.51 → 0.007 | 1.1 → 1.0 |
| c1-farm-pointer | 33.3 → 16.7 | 33.3 → 16.8 | 33.4 → 16.8 | 0.84 → 0.42 | 10.24 → 0.25 | 13.5 → 1.0 |
| c1-farm-camera | 16.8 → 16.7 | 33.3 → 16.7 | 33.4 → 16.8 | 0.50 → 0.22 | 4.96 → 0.08 | 2.1 → 1.3 |

With the pointer resting or moving over the map, the frame-time tail is now that of the no-pointer case. Uncapped (the
default), the frame intervals of the pointer and camera fixtures are not comparable any more: with no blocking read to hold it
back, the browser appears to queue frames far ahead of the GPU (2.9 ms intervals against 7.3 ms of GPU geometry), and a requested pick then
takes ~60 frames to come back. Compare those fixtures with `--vsync`, where a requested pick comes back in 1–2 frames.
