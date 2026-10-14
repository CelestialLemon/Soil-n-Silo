"""A layered, wind-shaped pine with irregular skirts of faceted foliage."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import *

reset(115)

cylinder('Pine_trunk', (0, 0, .97), .13, 1.94, 'bark', 7, top=.09)
for i in range(4):
    a = i * math.tau / 4 + .28
    beam('Pine_root', (0, 0, .14), (.26 * math.cos(a), .26 * math.sin(a), .065), .10, 'bark', 5)

# A narrow leader remains visible above the upper branches. The three foliage
# tiers keep the conifer read, but are assembled from offset boughs instead of
# geometric cone skirts.
cylinder('Pine_leader', (0, 0, 2.78), .15, .86, 'darkleaf', 7, top=0)

tiers = [
    # (height, branch radius, radial foliage length, tangential width, depth,
    #  branch width, palette)
    (1.39, .45, .47, .30, .39, .095, ('darkleaf', 'green', 'darkleaf', 'leaf', 'green', 'darkleaf', 'leaf')),
    (2.07, .34, .39, .25, .36, .082, ('green', 'leaf', 'darkleaf', 'green', 'leaf', 'darkleaf')),
    (2.64, .22, .31, .21, .31, .070, ('leaf', 'green', 'sprout', 'darkleaf', 'leaf')),
]
for tier_index, (z, radius, length, width, depth, branch_width, colours) in enumerate(tiers):
    count = len(colours)
    offset = (0.31 + tier_index * .57)
    for i, colour in enumerate(colours):
        angle = offset + i * math.tau / count
        # Small deterministic irregularities stop each branch tier reading as
        # a regular star while keeping enough radial overlap for a dense crown.
        radial = radius * (1 + .10 * math.sin(i * 2.31 + tier_index))
        branch_end = (radial + length * .58) * math.cos(angle), (radial + length * .58) * math.sin(angle), z - .12
        beam('Pine_bough', (radial * .18 * math.cos(angle), radial * .18 * math.sin(angle), z - .26), branch_end, branch_width, 'wood', 5)

        loc = (radial * math.cos(angle), radial * math.sin(angle), z + .01 * math.sin(i * 1.9))
        foliage = sphere(f'decor_pine_tier_{tier_index}_{i}', loc, (length, width, depth), colour, 10, 5)
        foliage.rotation_euler[2] = angle + .12 * math.sin(i * 3.1 + tier_index)

# A few low, uneven tips keep the outline full without widening the trunk base.
for i, (loc, scale, colour) in enumerate([
    ((-.47, -.18, .97), (.31, .24, .29), 'darkleaf'),
    ((.39, -.35, 1.00), (.33, .25, .30), 'green'),
    ((-.12, .48, 1.04), (.29, .26, .31), 'leaf'),
    ((.34, .35, 1.10), (.30, .25, .31), 'darkleaf'),
]):
    sphere(f'decor_pine_low_tip_{i}', loc, scale, colour, 10, 5)

centre_xy()
export_and_preview('tree_pine', 3000)
