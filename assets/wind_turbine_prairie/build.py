"""Prairie: six linen sails, an open timber trestle and a terracotta tail fin."""
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from wind_turbine_options import *

reset(302)
for x in [-.27, .27]:
    for y in [-.22, .22]:
        cylinder('Ceramic_trestle_shoe', (x, y, .08), .105, .16, 'ceramic', 8)
        beam('Splayed_timber_leg', (x, y, .13), (x*.18, y*.18, 3.48), .095, 'lightwood')
for z, half in [(.52, .245), (1.48, .17), (2.46, .10)]:
    for y in [-1, 1]:
        beam('Trestle_crossrail', (-half, y*half*.8, z), (half, y*half*.8, z), .075, 'wood')
for y in [-1, 1]:
    beam('Trestle_diagonal', (-.245, y*.19, .52), (.17, y*.135, 1.48), .07, 'wood')
    beam('Trestle_diagonal', (.17, y*.135, 1.48), (-.10, y*.08, 2.46), .07, 'wood')
nacelle('lightwood')
beam('Tail_boom', (0, .19, HUB_Z), (0, .41, HUB_Z+.015), .08, 'copper', 8)
# A thick, closed fin reads edge-on from the front and broadside from the sides.
fin = extrude_xz('Terracotta_tail_fin', [(.28, 3.53), (.49, 3.48), (.49, 3.92), (.28, 3.78)], 0, .075, 'clay')
fin.rotation_euler.z = math.pi/2
parts = []
for i in range(6):
    angle = math.pi/2+i*math.tau/6
    radial = Vector((math.cos(angle), 0, math.sin(angle)))
    parts.append(beam('Copper_sail_spoke', HUB+radial*.08, HUB+radial*1.16, .075, 'copper', 6))
    parts.append(blade('Linen_sail', angle,
        [(.36, -.015, .05, .025), (.60, -.05, .13, .032),
         (1.12, -.10, .20, .030), (1.20, -.10, .19, .025)],
        colour='linen', tip_colour='clay'))
rotor(parts)
vine((-.28, -.23, .18), (-.18, -.14, 1.17))
grass(.26, .23)
complete('wind_turbine_prairie')
