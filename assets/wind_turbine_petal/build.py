"""Petal: three broad ceramic leaves on a clean ceramic mast with living cuffs."""
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from wind_turbine_options import *

reset(301)
cylinder('Ceramic_flared_foot', (0, 0, .12), .29, .24, 'ceramic', 10, top=.18)
cylinder('Copper_foot_cuff', (0, 0, .27), .18, .09, 'copper', 10, top=.16)
cylinder('Tapered_ceramic_mast', (0, 0, 1.9), .145, 3.22, 'ceramic', 10, top=.075)
cylinder('Moss_lower_cuff', (0, 0, .48), .146, .18, 'moss', 10, top=.143)
nacelle()
parts = []
for i in range(3):
    parts.append(blade('Leaf_blade', math.pi/2+i*math.tau/3,
        [(.10, 0, .055, .030), (.35, .015, .13, .043),
         (.69, .09, .17, .037), (1.02, .19, .11, .027),
         (1.22, .23, .012, .012)], tip_colour='moss'))
rotor(parts)
grass(-.28, -.17)
grass(.26, .18)
complete('wind_turbine_petal')
