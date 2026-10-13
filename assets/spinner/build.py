"""Open spinning frame with a large drive wheel, rotating linen bobbins and a flax basket."""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from solarpunk import *
reset(208)
for x in [-.64,.64]:
    for y in [-.28,.28]:
        box('Spinner_timber_foot',(x,y,.075),(.25,.20,.15),'darkwood')
    box('Spinner_frame_post',(x,0,.66),(.14,.18,1.20),'wood')
for z in [.25,1.18]:
    box('Spinner_frame_rail',(0,0,z),(1.42,.18,.14),'lightwood')
wheel('move_spin_drive',(0,-.41,.61),.43,'wood',2.4)
rounded_box('Spinner_ceramic_motor',(0,.02,.61),(.38,.30,.31),'ceramic',.06)
box('Spinner_motor_mount',(0,0,.41),(.14,.18,.32),'wood')
beam('Spinner_drive_axle',(0,-.43,.61),(0,.05,.61),.10,'copper',8)
beam('Spinner_bobbin_axle',(-.64,.18,.84),(.64,.18,.84),.09,'brass',8)
for x in [-.64,.64]:
    beam('Spinner_bearing_support',(x,0,.84),(x,.18,.84),.12,'wood')
for x in [-.37,.37]:
    hub = (x,.18,.84)
    parts = [cylinder('Spinner_linen_bobbin',hub,.15,.38,'linen',10,rot=(0,math.pi/2,0))]
    for dx in [-.21,.21]:
        parts.append(cylinder('Spinner_bobbin_flange',(x+dx,.18,.84),.21,.07,'copper',10,rot=(0,math.pi/2,0)))
    parts.append(box('Spinner_yarn_marker',(x,.025,.84),(.28,.075,.09),'sack'))
    obj = join(parts,'move_spin_bobbin_'+('left' if x<0 else 'right'),hub)
    orient_x(obj,(1,0,0))
    obj['speed'] = 3.0
    beam('Spinner_thread_guide',(x,.18,.99),(x,0,1.16),.065,'linen',6)
cylinder('Spinner_flax_basket',(.58,.56,.18),.25,.36,'clay',8,top=.29)
sphere('Spinner_flax_bundle',(.58,.56,.38),(.24,.24,.20),'linen',8,3)
box('running_motor_light',(-.57,-.15,.99),(.13,.065,.14),material('charge',.6))
box('idle_motor_light',(-.57,-.15,.99),(.13,.065,.14),'glass')
planter(-.61,.57,radius=.17)
build_complete('spinner',2,states=True)
