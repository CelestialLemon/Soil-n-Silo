"""A low berry shrub with dense, layered clumps and an irregular outline."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import *

reset(116)

# Short woody stems peek through the foliage and spread the shrub across its
# tile. The low, overlapping crown stays distinct from the taller oak and pine.
cylinder('Bush_main_stem', (0, 0, .25), .075, .50, 'bark', 6, top=.045)
branches = [
    ((0, 0, .24), (-.38, -.27, .48)),
    ((0, 0, .27), (.39, -.25, .50)),
    ((0, 0, .25), (-.18, .40, .54)),
    ((0, 0, .29), (.32, .27, .57)),
    ((0, 0, .31), (-.08, -.12, .69)),
]
for a, b in branches:
    beam('Bush_branch', a, b, .065, 'wood', 5)

foliage = [
    ((-.27, -.17, .40), (.32, .28, .27), 'green'),
    ((.22, -.27, .43), (.34, .25, .29), 'darkleaf'),
    ((-.32, .18, .45), (.30, .31, .29), 'leaf'),
    ((.28, .19, .48), (.33, .28, .30), 'green'),
    ((-.04, -.12, .58), (.33, .31, .30), 'darkleaf'),
    ((.02, .23, .60), (.34, .30, .29), 'leaf'),
    ((-.20, -.25, .69), (.24, .23, .23), 'sprout'),
]
for i, (location, scale, colour) in enumerate(foliage):
    clump = sphere(f'decor_bush_foliage_{i:02d}', location, scale, colour, 8, 4)
    clump.rotation_euler[2] = (i * 1.91) % math.tau

# Berries are a small, readable accent distributed around all four sides.
berries = [
    ((-.29, -.53, .51), .078, 'tomato'),
    ((.26, -.53, .64), .078, 'red'),
    ((-.27, .52, .59), .078, 'red_light'),
    ((.62, .03, .62), .078, 'tomato'),
    ((-.62, -.08, .69), .078, 'red'),
]
for i, (location, radius, colour) in enumerate(berries):
    sphere(f'decor_bush_berry_{i}', location, (radius, radius, radius), colour, 8, 4)

centre_xy()
export_and_preview('bush', 800)
