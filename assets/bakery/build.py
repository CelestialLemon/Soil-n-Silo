"""Rounded terracotta bread oven, tiled moss roof, warm mouth and ceramic chimney."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(210)
rounded_box('Bakery_clay_oven',(0,.10,.65),(1.39,1.32,1.30),'clay',.20)
rounded_box('Bakery_ceramic_roof',(0,.10,1.30),(1.49,1.42,.20),'ceramic',.08)
for x in [-.49,0,.49]:
    for y in [-.35,.16,.66]:
        rounded_box('Bakery_moss_roof_tile',(x,y,1.43),(.42,.43,.14),'moss',.045)
# An opaque arched mouth facade, with interchangeable inset idle/fire meshes.
arch = arch_polygon(.71,.21,.65,8)
extrude_xz('Bakery_ceramic_mouth_arch',arch,-.62,.18,'ceramic')
inner = arch_polygon(.53,.25,.64,8)
extrude_xz('idle_mouth',inner,-.735,.075,'darkwood')
extrude_xz('running_fire',inner,-.735,.075,material('fire',.8))
box('Bakery_oven_hearth',(0,-.70,.20),(.98,.44,.14),'brick')
for x in [-.17,.17]:
    cylinder('Bakery_hearth_log',(x,-.795,.31),.075,.30,'wood',6,rot=(0,math.pi/2,0))
rounded_box('Bakery_chimney',(.39,.40,1.68),(.29,.32,.69),'ceramic',.045)
rounded_box('Bakery_chimney_cap',(.39,.40,2.02),(.42,.45,.13),'copper',.035)
box('Bakery_chimney_outlet',(.39,.40,2.093),(.23,.25,.025),'darkwood')
empty('smoke_emitter',(.39,.40,2.12))
for x in [-.77,.77]:
    box('Bakery_copper_side_tile',(x,.10,.69),(.07,.53,.35),'copper')
box('Bakery_rear_tile',(0,.79,.69),(.58,.07,.35),'copper')
planter(-.66,.65,radius=.16)
vine((.68,-.38,.27),(.68,-.38,1.13))
build_complete('bakery',2,states=True)
