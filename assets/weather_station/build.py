"""A weather observatory: a tilted forecast dial under a solar canopy.

The wind cups turn about their vertical local X axis, independent of power.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(231)

# A compact octagonal pedestal, with curved-looking, tapered ceramic tiers.
cylinder('Stone_foundation', (0,0,.08), .53,.16, 'stone_light', 8, top=.49)
cylinder('Copper_plinth', (0,0,.18), .43,.08, 'copper', 8, top=.40)
cylinder('Ceramic_pedestal', (0,0,.51), .33,.60, 'ceramic', 8, top=.23)
cylinder('Brass_neck', (0,0,.83), .29,.08, 'brass', 8)
# Three broad timber feet and small plants soften the machine's base.
for a in [math.pi/2, math.pi/2+math.tau/3, math.pi/2+2*math.tau/3]:
    d = Vector((math.cos(a),math.sin(a),0))
    beam('Timber_foot', d*.30+Vector((0,0,.16)), d*.68+Vector((0,0,.13)), .12, 'wood')

# An oversized, inclined dial faces the camera and catches light from above.
# The surface is a blue enamel disc with a brass rim, a sun, a cloud and an
# arrow. These are deliberately chunky enough to survive pixel-art rendering.
angle = .48
rot = Matrix.Rotation(angle, 4, 'X')
centre = Vector((0,-.12,1.04))
def dial(x,y,z):
    return centre + rot @ Vector((x,y,z))
cylinder('Dial_outer', centre, .59,.13, 'copper', 12, rot=(angle,0,0))
cylinder('Dial_face', dial(0,0,.075), .52,.045, 'solar', 12, rot=(angle,0,0))
ring('Dial_rim', dial(0,0,.105), .51,.035, 'brass', (angle,0,0))
# Gold sun at one side of the face, and a white cloud at the other.
cylinder('Dial_sun', dial(-.23,.12,.11), .105,.045, 'gold', 8, rot=(angle,0,0))
for a in [0,math.pi/2,math.pi,3*math.pi/2]:
    p = Vector((-.23+math.cos(a)*.16,.12+math.sin(a)*.16,0))
    beam('Sun_ray', dial(p.x,p.y,.12), dial(p.x+math.cos(a)*.065,p.y+math.sin(a)*.065,.12), .035, 'gold')
for x,y,r in [(.15,.15,.09),(.25,.18,.12),(.34,.13,.08)]:
    sphere('Dial_cloud', dial(x,y,.12), (r,r,.055), 'ceramic', 8, 4)
# A bold copper pointer and hub, distinct from the weather symbols.
beam('Forecast_pointer', dial(0,-.14,.14), dial(.10,-.36,.14), .07, 'copper')
cylinder('Pointer_hub', dial(0,-.14,.15), .065,.055, 'brass', 8, rot=(angle,0,0))
for a in [math.pi*1.12,math.pi*1.33,math.pi*1.55,math.pi*1.77,math.pi*1.96]:
    d = Vector((math.cos(a),math.sin(a),0))
    beam('Dial_tick', dial(d.x*.40,d.y*.40,.12), dial(d.x*.46,d.y*.46,.12), .04, 'ceramic')

# Two timber uprights support a blue solar awning behind the dial. Their
# outward taper and the shallow roof form a distinct, open silhouette.
for side in [-1,1]:
    beam('Canopy_upright', (side*.39,.34,.17), (side*.57,.39,1.66), .10, 'wood')
    sphere('Upright_cap', (side*.57,.39,1.66), (.10,.10,.10), 'brass', 6, 3)
solar_tile('Solar_canopy', (0,.39,1.67), (1.35,.49), tilt=-.16)
# A little hanging droplet marks the rain collector on the right of the arch.
beam('Collector_arm', (.52,.38,1.50), (.68,.38,1.50), .06, 'copper')
cylinder('Rain_collector', (.68,.38,1.37), .10,.22, 'ceramic', 8)
cylinder('Collector_funnel', (.68,.38,1.51), .14,.08, 'copper', 8, top=.07)

# Wind cups rise from the centre of the canopy, rotating about the mast.
cylinder('Sensor_stem', (0,.39,1.84), .045,.25, 'copper', 8)
hub = Vector((0,.39,2.00))
cups = [cylinder('Wind_hub', hub,.065,.09,'brass',8)]
for i in range(3):
    a = i*math.tau/3+.4
    d = Vector((math.cos(a),math.sin(a),0))
    cups.append(beam('Wind_arm', hub, hub+d*.24, .045, 'copper'))
    cups.append(sphere('Wind_cup', hub+d*.26, (.10,.10,.09), 'ceramic', 8, 4))
spinner = join(cups, 'move_spin_anemometer', hub)
orient_x(spinner, (0,0,1))
spinner['speed'] = 2.5

# Low living details frame the base, not the dial.
planter(-.67,.36, radius=.17)
grass(.60,-.55)
build_complete('weather_station', 2)
