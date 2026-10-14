"""An old orchard oak with a layered, asymmetrical crown of faceted foliage."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import *

reset(114)

# Keep the trunk and a few branching limbs visible through the canopy. The crown
# is built from overlapping, differently tinted clumps so its outline stays
# irregular when the game repeats and quarter-turns the tree.
cylinder('Oak_trunk', (0, 0, .91), .17, 1.82, 'bark', 7, top=.12)
for i in range(5):
    a = i * math.tau / 5 + .21
    beam('Oak_root', (0, 0, .15), (.30 * math.cos(a), .30 * math.sin(a), .065), .12, 'bark', 5)

branches = [
    ((0, 0, 1.14), (-.63, -.28, 1.95), .13),
    ((0, 0, 1.28), (.61, -.40, 2.02), .14),
    ((0, 0, 1.23), (-.22, .66, 2.04), .14),
    ((0, 0, 1.32), (.55, .38, 2.20), .13),
    ((0, 0, 1.42), (-.37, -.22, 2.32), .12),
]
for a, b, width in branches:
    beam('Oak_bough', a, b, width, 'wood', 6)

crown = [
    # Broad lower lobes make a broken, spreading silhouette rather than a ball.
    ((-.49, -.16, 1.98), (.59, .53, .47), 'green'),
    ((.35, -.32, 2.03), (.64, .49, .48), 'leaf'),
    ((-.13, .49, 2.04), (.51, .58, .47), 'darkleaf'),
    ((.49, .39, 2.17), (.53, .49, .48), 'green'),
    ((-.82, -.25, 2.16), (.40, .43, .42), 'leaf'),
    ((.82, -.02, 2.25), (.39, .42, .44), 'darkleaf'),
    ((-.28, -.54, 2.20), (.49, .43, .44), 'darkleaf'),
    # A second layer fills the crown while leaving a few glimpses of branches.
    ((-.34, -.16, 2.39), (.52, .51, .48), 'leaf'),
    ((.37, -.20, 2.43), (.50, .47, .50), 'green'),
    ((-.59, .25, 2.40), (.46, .47, .47), 'green'),
    ((.30, .36, 2.50), (.48, .47, .44), 'leaf'),
    ((-.02, .05, 2.57), (.54, .50, .43), 'darkleaf'),
    ((-.48, -.39, 2.54), (.42, .39, .40), 'sprout'),
    ((.66, -.27, 2.55), (.37, .40, .41), 'leaf'),
    # Uneven upper tufts break the canopy line and catch lighter greens.
    ((-.34, .12, 2.77), (.42, .40, .29), 'leaf'),
    ((.31, -.12, 2.78), (.46, .40, .30), 'sprout'),
    ((.08, .38, 2.69), (.39, .40, .31), 'green'),
]
for i, (location, scale, colour) in enumerate(crown):
    clump = sphere(f'decor_oak_crown_{i:02d}', location, scale, colour, 10, 5)
    clump.rotation_euler[2] = (i * 1.73) % math.tau

centre_xy()
export_and_preview('tree_oak', 3000)
