#!/bin/sh
# Rebuild source-controlled GLBs and previews, in the requested inspection order.
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"
blender_bin=${BLENDER_BIN:-/opt/homebrew/bin/blender}
for name in wheat tomato tree_oak tree_birch tree_pine tree_willow tree_poplar tree_apple bush solar_panel wind_turbine battery pylon digester mill_electric water_wheel oil_press spinner loom bakery cannery depot sprinkler weather_station beehive composter rock sapling beans sunflower flax coop_solar silo garage truck; do
    "$blender_bin" -b --python-exit-code 1 --python "assets/$name/build.py"
    test -s "public/models/$name.glb"
    test -s "assets/$name/preview.png"
done
