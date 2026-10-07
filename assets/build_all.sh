#!/bin/sh
# Rebuild source-controlled GLBs and previews, in the requested inspection order.
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"
blender_bin=${BLENDER_BIN:-/opt/homebrew/bin/blender}
for name in chicken wheat tomato pumpkin coop trough farmhouse shop_stall shipping_bin mill oven egg_nest manure tree_oak tree_pine bush; do
    "$blender_bin" -b --python-exit-code 1 --python "assets/$name/build.py"
    test -s "public/models/$name.glb"
    test -s "assets/$name/preview.png"
done
