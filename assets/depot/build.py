"""Freight station: open timber loading platform, solar canopy and airship docking mast."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(212)
# This raised loading deck is structural, with visible supports and access stairs.
box('Depot_loading_platform',(0,0,.25),(2.67,2.34,.16),'wood')
for x in [-1.10,0,1.10]:
    for y in [-.95,.95]:
        box('Depot_platform_support',(x,y,.085),(.21,.21,.17),'darkwood')
for y,z,depth in [(-1.32,.07,.32),(-1.18,.14,.23)]:
    box('Depot_access_step',(0,y,z),(.90,depth,.14),'lightwood')
for x in [-1.10,1.10]:
    for y in [-.55,.72]:
        box('Depot_canopy_column',(x,y,1.02),(.16,.16,1.54),'wood')
    box('Depot_canopy_side_beam',(x,.08,1.77),(.18,1.70,.17),'lightwood')
    beam('Depot_canopy_brace',(x,-.55,1.35),(x,-.17,1.75),.11,'lightwood')
solar_tile('Depot_solar_canopy',(0,.08,1.87),(2.65,1.88),math.radians(8))
for x in [-1.22,1.22]:
    box('Depot_canopy_moss_edge',(x,.08,1.94),(.14,1.82,.12),'moss')
# Rear mast rises above the canopy; a brass docking fork reads as the destination.
box('Depot_airship_mast',(0,.91,1.37),(.18,.18,2.24),'wood')
for x in [-.23,.23]:
    beam('Depot_docking_fork',(0,.91,2.22),(x,.91,2.49),.10,'copper',8)
    sphere('Depot_docking_tip',(x,.91,2.49),(.09,.09,.09),'brass',8,4)
ring('Depot_mooring_ring',(0,.91,2.24),.15,.05,'brass',(math.pi/2,0,0))
for x,y,z in [(-.67,.31,.55),(.68,.34,.55),(.68,.34,.99)]:
    rounded_box('Depot_cargo_crate',(x,y,z),(.58,.60,.44),'lightwood',.025)
    for dx in [-.19,.19]:
        box('Depot_crate_binding',(x+dx,y,z),(.065,.62,.46),'copper')
    box('Depot_crate_label',(x,y-.32,z),(.22,.065,.16),'linen')
box('Depot_dispatch_counter',(-.68,-.44,.63),(.68,.38,.60),'ceramic')
box('Depot_dispatch_lamp',(-.68,-.45,.99),(.40,.24,.10),material('glow',.6))
for y in [-.91,.93]:
    box('Depot_freight_sign',(0,y,1.53),(.70,.10,.29),'ceramic')
    # Large parcel icon: broad copper outline with a linen binding stripe.
    box('Depot_parcel_symbol',(0,y*1.06,1.53),(.29,.065,.20),'copper')
    box('Depot_parcel_binding',(0,y*1.10,1.53),(.075,.065,.20),'linen')
planter(-1.08,-.87,z=.33,radius=.19)
planter(1.08,-.87,z=.33,radius=.19)
vine((-1.20,.68,.40),(-1.20,.68,1.56))
build_complete('depot',3)
