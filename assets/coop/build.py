"""A hollow red henhouse with a hinged front door and a short ramp.

The front wall is split around the doorway: opening the door reveals actual
interior depth. Door hinge is local vertical Z, bottom of its left edge.
"""
import sys
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from common import *
reset(105)
# Structural floor belongs to the house, not a terrain slab.
box('Coop_raised_floor',(0,0,.24),(2.60,2.40,.14),'darkwood')
for x in [-1.08,1.08]:
    for y in [-.99,.99]:
        box('Coop_short_support',(x,y,.10),(.19,.19,.20),'darkwood')
for x in [-1.24,1.24]:
    box('Coop_side_wall',(x,0,.93),(.12,2.4,1.26),'red')
box('Coop_back_wall',(0,1.14,.93),(2.36,.12,1.26),'red')
# Clear opening 0.64 wide, from .31 to 1.23.
for x in [-.81,.81]:
    box('Coop_front_wall',(x,-1.14,.93),(.98,.12,1.26),'red')
box('Coop_front_header',(0,-1.14,1.395),(.64,.12,.33),'red')
for y in [-1.14,1.14]:
    extrude_xz('Coop_red_gable',[(-1.30,1.56),(1.30,1.56),(0,2.15)],y,.12,'red_light')
# Broad paint boards also break up the rear and side silhouettes.
for x in [-1.25,-.84,-.43,.43,.84,1.25]:
    for y in [-1.215,1.215]:
        box('Coop_vertical_batten',(x,y,.93),(.07,.065,1.25),'red_light')
for x in [-1.315,1.315]:
    for y in [-.85,-.42,0,.42,.85]:
        box('Coop_side_batten',(x,y,.93),(.065,.07,1.25),'red_light')
roof('Coop_slate_roof',2.90,2.70,1.60,2.20)
box('Coop_roof_ridge',(0,0,2.20),(.12,2.76,.11),'slate_light')
for x in [-.36,.36]:
    box('Door_jamb',(x,-1.225,.77),(.09,.10,.94),'cream')
box('Door_header',(0,-1.225,1.24),(.80,.10,.10),'cream')
parts=[box('Door_red_panel',(0,-1.255,.76),(.62,.11,.90),'red_light')]
for z in [.44,1.08]:
    parts.append(box('Door_horizontal_brace',(0,-1.325,z),(.58,.065,.085),'cream'))
parts.append(beam('Door_diagonal_brace',(-.24,-1.325,.48),(.24,-1.325,1.04),.08,'cream'))
parts.append(box('Door_handle',(.20,-1.37,.76),(.08,.07,.10),'iron'))
door=join(parts,'door',(-.31,-1.255,.31))
# Ramp climbs toward the front; ribs are chunky enough to survive pixelisation.
ramp=box('Chicken_ramp',(0,-1.34,.16),(.70,.33,.08),'lightwood',rot=(math.radians(34),0,0))
for y,z in [(-1.47,.095),(-1.36,.17),(-1.25,.245)]:
    box('Ramp_tread',(0,y,z),(.69,.075,.065),'wood')
window('Coop_side_window',1.325,0,1.05,.52,.52,side=True,lit=False)
window('Coop_back_window',0,1.24,1.02,.46,.46,lit=False)
centre_xy()
export_and_preview('coop',3000)
