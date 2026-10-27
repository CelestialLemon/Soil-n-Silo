"""A small weather observatory: a louvred shelter, wind mast and rain gauge.

The anemometer spins around its vertical local X axis independently of power.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(231)

# A raised, white instrument shelter, framed in warm timber. Broad slats read
# at the game's distant zooms; the open legs keep the silhouette light.
sx, sy = -.30, .05
for dx in [-.40, .40]:
    for dy in [-.29, .29]:
        cylinder('Stone_foot', (sx+dx, sy+dy, .05), .09, .10, 'stone', 8)
        rounded_box('Timber_leg', (sx+dx, sy+dy, .28), (.09,.09,.46), 'wood', .015)
box('Shelter_floor', (sx,sy,.52), (.96,.74,.10), 'lightwood')
box('Shelter_core', (sx,sy,.86), (.77,.55,.60), 'linen')
for z in [.62,.76,.90,1.04]:
    for side in [-1,1]:
        box('Ceramic_louvre', (sx,sy+side*.30,z), (.84,.10,.085), 'ceramic', rot=(side*.35,0,0))
        box('Ceramic_louvre', (sx+side*.40,sy,z), (.10,.62,.085), 'ceramic', rot=(0,-side*.35,0))
for dx in [-.42,.42]:
    for dy in [-.31,.31]:
        box('Timber_corner', (sx+dx,sy+dy,.84), (.08,.08,.68), 'wood')
# The deep roof and green cap give the station a distinctive, friendly profile.
rounded_box('Roof_eave', (sx,sy,1.21), (1.08,.84,.12), 'ceramic', .025)
rounded_box('Moss_roof', (sx,sy,1.30), (.99,.75,.10), 'moss', .035)
sphere('decor_Roof_plant', (sx-.20,sy+.06,1.37), (.20,.16,.09), 'leaf', 6, 3)
box('Door_frame', (sx,sy-.365,.85), (.09,.04,.59), 'wood')
sphere('Door_catch', (sx+.14,sy-.38,.86), (.06,.04,.06), 'brass', 6, 3)

# A tall copper mast and a bold vane make its purpose visible above the roof.
mx,my = .59,.34
cylinder('Mast_foot', (mx,my,.07), .14,.14, 'stone', 8, top=.11)
cylinder('Copper_mast', (mx,my,.86), .045,1.58, 'copper', 8)
for z in [.25,1.35]:
    cylinder('Mast_collar', (mx,my,z), .075,.07, 'brass', 8)
vz = 1.48
cylinder('Vane_hub', (mx,my,vz), .07,.08, 'brass', 8)
beam('Vane_boom', (mx-.23,my,vz), (mx+.23,my,vz), .06, 'copper')
extrude_xz('Vane_arrow', [(mx-.32,vz),(mx-.18,vz-.09),(mx-.18,vz+.09)], my, .055, 'copper')
extrude_xz('Vane_tail', [(mx+.14,vz-.04),(mx+.30,vz-.14),(mx+.27,vz),(mx+.30,vz+.14),(mx+.14,vz+.04)], my, .05, 'brass')

hub = Vector((mx,my,1.72))
cups = [cylinder('Anemometer_hub',hub,.065,.10,'brass',8)]
for i in range(3):
    a = i*math.tau/3+.4
    d = Vector((math.cos(a),math.sin(a),0))
    cups.append(beam('Anemometer_arm',hub,hub+d*.23,.045,'copper'))
    cups.append(sphere('Anemometer_cup',hub+d*.25,(.105,.105,.09),'ceramic',8,4))
spinner = join(cups,'move_spin_anemometer',hub)
orient_x(spinner,(0,0,1))
spinner['speed'] = 2.5

# A separate funnel and graduated vessel signal rainfall measurements.
gx,gy = .48,-.55
cylinder('Gauge_foot',(gx,gy,.05),.13,.10,'stone',8)
cylinder('Gauge_body',(gx,gy,.30),.105,.42,'ceramic',8)
cylinder('Gauge_band',(gx,gy,.38),.12,.06,'brass',8)
cylinder('Gauge_funnel',(gx,gy,.56),.17,.14,'copper',8,top=.08)
for z in [.18,.25,.32]:
    box('Gauge_mark',(gx,gy-.106,z),(.10,.025,.025),'copper')
grass(-.78,-.55)
grass(-.75,.58)
build_complete('weather_station',2)
