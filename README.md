# PR #55: in-game wind turbine screenshots

Captured from Soil n Silo commit `2986426ec3e8ad70c237c948db5f07d757fb7a9f`
using the game's pinned `pixel3d-renderer` v0.3.0 in headless Chromium.

- The current turbine plus Petal, Prairie and Zephyr, each from all four game camera directions.
- Actual sandbox game, seed 4242, with a turbine, wheat field, beehive, electric mill, solar panel, pylon and battery.
- Same map, layout, noon lighting, camera target (32.5, 26.5), zoom 96 screen pixels/metre (the game's maximum), 30° pitch, 2× pixel setting, 1600 × 1000 viewport and 1× device scale.
- Simulation paused; render animation time fixed at 1.4 seconds for matching captures. Camera turns use the game's E key, stepping its ordinary frame loop until each turn completes.
- Each candidate is supplied for the normal `wind_turbine.glb` request using browser request interception. The game sources and selected model on the PR branch are unchanged.
- All 16 PNGs are complete 1600 × 1000 game screenshots, including the HUD, without resampling or image retouching.

Files are review evidence on a separate assets branch, outside the game PR diff.
