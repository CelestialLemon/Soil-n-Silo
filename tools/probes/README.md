# Performance probes

Two probes for measuring a player's own machine (the performance epic, #176). Both read local timing only: no network calls,
nothing stored. Neither changes the game or a save.

## What to record with every run

Results depend on the machine's state, so write these down next to the JSON:

- **Power**: plugged in, on battery, or low-power mode (set by hand; nothing infers it from the frame rate).
- **Browser** and version (the JSON has the user agent too).
- **Window size** (the JSON has the CSS viewport and the device pixel ratio).
- **Pixel size** (Settings → Pixel size; the JSON has the art size).
- Keep the tab in front, close other GPU-heavy tabs, and repeat a run three times.

## `owner-probe.js`: in-game A/B test of the renderer fixes

Swaps each variant in and out in memory (empty-mesh filter, resolve rewrite, pick every frame), alternating, for about 40 s,
and prints a table and one JSON line.

1. Run the game (`npm run dev`, or a built copy) and load or start a commission.
2. Open the browser console, paste the whole file, press Enter.
3. Leave the pointer still and off the window until it prints the table. The result is also in `window.__probe176`.
4. Copy the JSON line and attach it with the notes above.

GPU times appear only where the browser has timer queries (Chrome on Windows and macOS usually; Safari never). The probe patches
renderer methods of the pinned release (v0.5.0), so a newer renderer may need it updated.

## `gpu-probe.html`: standalone GPU probe

Self-contained WebGL 2 page that does not need the game. Reports the GL renderer and vendor, the browser, timer-query support,
draw-buffer limits, bandwidth-sensitivity kernels, and the game's resolve pass against the optimised one with a bitwise diff.

1. Open the file directly in the browser (`file://` is fine).
2. Type the machine, browser and power state in the note box.
3. Press Run (about 10 s), then Copy JSON, or Download JSON if copying is blocked.

## Opt-in telemetry in the game

Settings → Frame rate → **Report** adds, under the frame graph, the JS cost of `renderGeometry`, `renderStyle`, picking and the
rest of the frame, draws and triangles, a power-state choice, and **Copy 30-second report** (JSON: GL vendor and renderer, user
agent, viewport, DPR, art/supersample/shadow-map sizes, frame interval p50/p95/p99 and the costs). Where the browser refuses to
copy (Safari and Firefox can), the JSON is shown in a box to select and copy. GPU timing waits for the renderer exposing it
(pixel3d-renderer#62). The game reads no clock for this unless Report is on.
