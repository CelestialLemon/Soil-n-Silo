"""Cream freight pavilion: orange parcel straps, enamel posts, solar canopy."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from terra_machines import *

reset(212)
soft_box('Depot_loading_platform',(0,0,.25),(2.67,2.34,.16),'slate',.055)
for x in [-1.10,0,1.10]:
    for y in [-.95,.95]:
        detail_box('Depot_platform_support',(x,y,.085),(.21,.21,.17),'slate',.025)
for y,z,depth in [(-1.32,.07,.32),(-1.18,.14,.23)]:
    soft_box('Depot_access_step',(0,y,z),(.90,depth,.14),'ivory',.035)
for x in [-1.10,1.10]:
    for y in [-.55,.72]:
        soft_box('Depot_canopy_column',(x,y,1.02),(.16,.16,1.54),'ivory',.045)
        detail_box('Depot_column_boot',(x,y,.43),(.18,.18,.20),'orange',.025)
    soft_box('Depot_canopy_side_beam',(x,.08,1.77),(.18,1.70,.17),'orange',.045)
    tube('Depot_canopy_brace',(x,-.55,1.35),(x,-.17,1.75),.11,'ivory',8)
solar_roof('Depot_solar_canopy',(0,.08,1.87),(2.65,1.88),math.radians(8))
for x in [-1.22,1.22]:
    # A rounded strip of planting retains the original living roof nodes.
    soft_box('Depot_canopy_moss_edge',(x,.08,1.94),(.14,1.82,.12),'leaf_deep',.05)
soft_box('Depot_airship_mast',(0,.91,1.37),(.18,.18,2.24),'ivory',.045)
for x in [-.23,.23]:
    tube('Depot_docking_fork',(0,.91,2.22),(x,.91,2.49),.10,'orange',10)
    blob('Depot_docking_tip',(x,.91,2.49),(.09,.09,.09),'white',segments=12,rings=6)
hoop('Depot_mooring_ring',(0,.91,2.24),.15,.035,'slate',(math.pi/2,0,0))
for x,y,z in [(-.67,.31,.55),(.68,.34,.55),(.68,.34,.99)]:
    soft_box('Depot_cargo_crate',(x,y,z),(.58,.60,.44),'ivory',.055)
    for dx in [-.19,.19]:
        detail_box('Depot_crate_binding',(x+dx,y,z),(.065,.62,.46),'orange')
    detail_box('Depot_crate_label',(x,y-.32,z),(.22,.035,.16),'slate',.015)
    detail_box('Depot_label_mark',(x-.035,y-.34,z),(.075,.012,.023),'white',.003)
soft_box('Depot_dispatch_counter',(-.68,-.44,.63),(.68,.38,.60),'ivory',.08)
soft_box('Depot_dispatch_lamp',(-.68,-.45,.99),(.40,.24,.10),'lamp',.035,emission=.6)
detail_box('Depot_counter_front',(-.68,-.638,.66),(.40,.025,.19),'slate',.022)
for x in [-.78,-.67,-.56]:
    detail_box('Depot_counter_vent',(x,-.655,.66),(.026,.015,.10),'trim',.004)
for y in [-.91,.93]:
    soft_box('Depot_freight_sign',(0,y,1.53),(.70,.10,.29),'ivory',.055)
    detail_box('Depot_parcel_symbol',(0,y*1.06,1.53),(.29,.065,.20),'orange',.02)
    detail_box('Depot_parcel_binding',(0,y*1.10,1.53),(.075,.065,.20),'white',.008)
pot(-1.08,-.87,z=.33,radius=.19)
pot(1.08,-.87,z=.33,radius=.19)
creeper((-1.20,.68,.40),(-1.20,.68,1.56))
machine_complete('depot',3,reach=.38)
