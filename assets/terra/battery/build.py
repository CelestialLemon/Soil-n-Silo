"""Four soft ceramic cells, quarter-charge bands, and a tidy enamel bus deck."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(203)
COLOURS['charge'] = '#b4dea0'
CELLS = [(x, y) for y in [-.4, .4] for x in [-.4, .4]]
RINGS = [.42 + i*.12 for i in range(4)]
soft_box('Battery_timber_deck', (0, 0, .06), (1.56, 1.56, .12), 'slate', .04)
for y in [-.5, 0, .5]:
    detail_box('Battery_deck_slat', (0, y, .122), (1.5, .06, .012), 'trim', .004)
lit = [[] for _ in RINGS]
for x, y in CELLS:
    round_cylinder('Battery_copper_foot', (x, y, .16), .285, .08,
                   'orange', segments=16)
    round_cylinder('Battery_ceramic_cell', (x, y, .56), .26, .72,
                   'ivory', bevel=.025, segments=20)
    smooth(sphere('Battery_ceramic_cap', (x, y, .92), (.26, .26, .09),
                  paint('white'), 12, 6))
    round_cylinder('Battery_brass_terminal', (x, y, 1.02), .07, .08,
                   'orange', segments=12, bevel=.008)
    for n, z in enumerate(RINGS):
        # Four joined bands per level: removing a level exposes the cream cell.
        ring = cylinder('Battery_charge_ring', (x, y, z), .278, .10,
                        paint('charge', .8), 16)
        lit[n].append(soften(ring, .012, 1))
for n, parts in enumerate(lit):
    join(parts, f'charge_{n}', (0, 0, RINGS[n]))
for a, b in [(CELLS[0], CELLS[1]), (CELLS[1], CELLS[3]),
             (CELLS[3], CELLS[2]), (CELLS[2], CELLS[0])]:
    tube('Battery_copper_bus', (*a, 1.04), (*b, 1.04), .05, 'orange', 6)
# A readable polarity badge and a ceramic control tab distinguish the front.
detail_box('Battery_control_frame', (0, -.707, .22), (.30, .075, .16), 'ivory', .025)
detail_box('Battery_control_face', (0, -.75, .225), (.22, .025, .095), 'recess', .009)
for x in [-.07, .07]:
    detail_box('Battery_polarity_mark', (x, -.765, .225), (.045, .009, .016), 'white', .003)
detail_box('Battery_positive_mark', (.07, -.765, .225), (.016, .009, .045), 'white', .003)
tuft(-.68, .05)
tuft(.05, -.7)
machine_complete('battery', 2, reach=.21)
