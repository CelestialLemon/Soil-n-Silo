"""Copper preserving kettle alongside an open timber rack of red jars."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(211)
cylinder('Cannery_ceramic_stove',(-.37,0,.20),.42,.40,'ceramic',12)
sphere('Cannery_copper_kettle',(-.37,0,.79),(.48,.48,.56),'copper',12,6)
cylinder('Cannery_kettle_neck',(-.37,0,1.23),.30,.16,'copper',12)
cylinder('Cannery_ceramic_lid',(-.37,0,1.33),.38,.14,'ceramic',12,top=.18)
ring('Cannery_lid_handle',(-.37,0,1.43),.09,.035,'brass',(math.pi/2,0,0))
beam('Cannery_steam_vent',(-.10,.10,1.32),(-.10,.10,1.59),.10,'copper',8)
empty('smoke_emitter',(-.10,.10,1.66))
for y in [-.49,.49]:
    ring('Cannery_kettle_handle',(-.37,y,.94),.12,.045,'brass',(math.pi/2,0,0))
rounded_box('idle_stove_mouth',(-.37,-.43,.23),(.30,.075,.17),'darkwood',.035)
rounded_box('running_stove_glow',(-.37,-.43,.23),(.30,.075,.17),material('fire',.7),.035)
for x in [.26,.76]:
    for y in [-.46,.46]:
        box('Cannery_rack_post',(x,y,.66),(.10,.10,1.32),'wood')
for z in [.26,.72,1.18]:
    box('Cannery_rack_shelf',(.51,0,z),(.68,1.14,.11),'lightwood')
    for y in [-.34,0,.34]:
        cylinder('Cannery_red_preserves',(.51,y,z+.19),.14,.27,'tomato',8)
        cylinder('Cannery_jar_lid',(.51,y,z+.35),.155,.07,'brass',8)
        box('Cannery_jar_label',(.51,y-.14,z+.20),(.17,.065,.10),'linen')
planter(.55,.76,radius=.15)
grass(-.55,-.72)
build_complete('cannery',2,states=True)
