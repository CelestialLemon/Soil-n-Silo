"""Zephyr: a swept two-blade rotor on a split timber and ceramic wishbone mast."""
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from wind_turbine_options import *

reset(303)
for x in [-.28, .28]:
    cylinder('Ceramic_anchor_shoe', (x, 0, .10), .145, .20, 'ceramic', 8, top=.12)
    beam('Timber_wishbone_lower', (x, 0, .17), (x*.72, 0, 1.55), .13, 'lightwood', 6)
    beam('Ceramic_wishbone_upper', (x*.72, 0, 1.55), (x*.20, 0, 3.49), .105, 'ceramic', 8)
    cylinder('Copper_wishbone_joint', (x*.72, 0, 1.55), .095, .15, 'copper', 8)
beam('Wishbone_low_crossbrace', (-.24, 0, .55), (.24, 0, .55), .09, 'copper')
nacelle()
parts = []
for i in range(2):
    parts.append(blade('Swept_wing', math.radians(30)+i*math.pi,
        [(.08, 0, .065, .035), (.32, -.05, .15, .048),
         (.67, -.02, .135, .038), (.98, .14, .09, .028),
         (1.21, .28, .015, .014)], tip_colour='copper'))
rotor(parts)
planter(0, .18, radius=.14)
grass(-.29, -.20)
complete('wind_turbine_zephyr')
