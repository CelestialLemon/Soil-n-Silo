"""Timber loom with a broad linen web, copper rollers, reed and shuttle."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(209)
for x in [-.62,.62]:
    for y in [-.53,.53]:
        box('Loom_timber_leg',(x,y,.70),(.15,.15,1.40),'wood')
    for z in [.24,1.37]:
        box('Loom_side_rail',(x,0,z),(.14,1.27,.13),'lightwood')
for y in [-.53,.53]:
    box('Loom_crossbeam',(0,y,1.41),(1.39,.17,.15),'lightwood')
for y,z,label in [(-.54,.60,'cloth'),(.53,1.20,'warp')]:
    hub = (0,y,z)
    parts = [cylinder('Loom_linen_roll',hub,.17,1.0,'linen',12,rot=(0,math.pi/2,0))]
    for x in [-.56,.56]:
        parts.append(cylinder('Loom_copper_flange',(x,y,z),.22,.08,'copper',10,rot=(0,math.pi/2,0)))
    parts.append(box('Loom_roll_seam',(0,y-.16,z),(.85,.065,.075),'sack'))
    roll = join(parts,'move_spin_'+label+'_roller',hub)
    orient_x(roll,(1,0,0))
    roll['speed'] = .8
beam('Loom_left_web_edge',(-.47,-.50,.76),(-.47,.50,1.35),.075,'sack')
beam('Loom_right_web_edge',(.47,-.50,.76),(.47,.50,1.35),.075,'sack')
box('Loom_broad_linen_web',(0,0,1.05),(.91,1.17,.075),'linen',rot=(math.radians(30),0,0))
for x in [-.34,-.17,0,.17,.34]:
    beam('Loom_warp_stripe',(x,-.50,.81),(x,.50,1.40),.065,'cream')
box('Loom_reed',(0,-.13,1.17),(1.15,.12,.14),'copper')
for x in [-.48,-.24,0,.24,.48]:
    box('Loom_reed_tooth',(x,-.13,1.05),(.065,.10,.24),'wood')
rounded_box('running_shuttle',(0,-.25,1.04),(.46,.17,.13),'brass',.04)
rounded_box('idle_shuttle',(.72,0,.80),(.16,.41,.14),'brass',.04)
box('Loom_shuttle_tray',(.67,0,.69),(.30,.56,.10),'lightwood')
beam('Loom_tray_support',(.62,-.53,.64),(.62,.53,.64),.11,'wood')
for x in [-.55,.55]:
    box('Loom_reed_hanger',(x,-.13,1.28),(.08,.11,.29),'wood')
planter(-.64,.70,radius=.15)
grass(.61,-.73)
build_complete('loom',2,states=True)
